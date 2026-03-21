# Phase 136: Edge Function Instrumentation

## Goal

Todas as acoes administrativas criticas e eventos de auth sao capturados automaticamente no audit log sem intervencao manual do operador.

## Requirements

- CAPT-02: Instrumentacao dos Edge Functions admin-tenants e admin-users com logAuditEvent()
- CAPT-03: Captura de auth events (sign-in/sign-out) com IP e user-agent

## Decision: Auth Event Capture Approach

**Chosen: Frontend hook after successful sign-in** (not Clerk webhooks).

Rationale:
- Clerk webhooks require a publicly reachable endpoint, SVIX signature verification, and webhook secret management — heavy infra for a single event type
- No existing webhook infrastructure in the project
- The Login.tsx already has the exact success point (`result.status === 'complete'`) where we can fire-and-forget an audit log
- IP and user-agent are available from the edge function request headers (the frontend calls an edge function to log the event)
- Sign-out is a client-side action via Clerk SDK — capture at the same level
- OAuth (Google) sign-in completes via SSO callback — capture there too

**Trade-off:** Frontend-initiated logging misses sign-ins from other clients (e.g., mobile), but Nexo is web-only and this approach is dramatically simpler.

## Plans

### Plan 136.1: Instrument admin-tenants Edge Function

**What:** Add `logAuditEvent()` calls to all mutation handlers in admin-tenants after successful Clerk API calls.

**Files:**
- `supabase/functions/admin-tenants/index.ts` — add audit logging to 6 mutation handlers

**Actions mapped to audit events:**

| Handler | action | resource_type | resource_id | resource_label |
|---------|--------|---------------|-------------|----------------|
| handleCreateOrg | `tenant.create` | `tenant` | org.id | org.name |
| handleArchiveTenant | `tenant.archive` | `tenant` | orgId | (from Clerk response) |
| handleRestoreTenant | `tenant.restore` | `tenant` | orgId | (from Clerk response) |
| handleAddMember | `member.add` | `org_membership` | orgId | `${userId} -> ${orgId}` |
| handleRemoveMember | `member.remove` | `org_membership` | orgId | `${userId} -> ${orgId}` |
| handleImpersonateToken | `tenant.impersonate` | `tenant` | orgId | orgId |

**Implementation pattern:**
```
// After successful Clerk API call, before returning response:
await logAuditEvent(supabase, {
  org_id: orgId,
  actor_id: payload.sub,
  actor_email: payload.email ?? '',
  actor_type: 'super_admin',
  action: 'tenant.create',
  resource_type: 'tenant',
  resource_id: org.id,
  resource_label: org.name,
  ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '',
  user_agent: req.headers.get('user-agent') ?? '',
  metadata: { slug: org.slug },
})
```

**Key details:**
- logAuditEvent is a helper function defined in the edge function itself (not imported from src/) — edge functions run in Deno, not in the React app
- The helper inserts directly into audit_logs table via Supabase service role client (already available as `getSupabaseAdmin()`)
- The helper wraps in try/catch and never throws — mirrors Phase 135 contract (fire-and-forget)
- actor_id comes from `payload.sub` (already decoded JWT)
- actor_email comes from `payload.email` or `payload.unsafe_metadata?.email` (Clerk JWT claim)
- IP comes from `x-forwarded-for` header (Supabase gateway forwards client IP)
- user-agent comes from `user-agent` header

**Verification:**
- Create a tenant via admin panel → check audit_logs table for `tenant.create` row
- Archive a tenant → check for `tenant.archive` row
- Add a member → check for `member.add` row

### Plan 136.2: Instrument admin-users Edge Function

**What:** Add `logAuditEvent()` calls to admin-users. Currently admin-users only has a GET (list) handler — reads are out of scope. If user CRUD mutations exist or are added, they get instrumented.

**Files:**
- `supabase/functions/admin-users/index.ts` — add audit helper + instrument any mutation handlers

**Current state:** admin-users only has `handleListUsers()` (GET). Per REQUIREMENTS.md out-of-scope: "SELECT-level logging — Volume explosion". So no instrumentation needed for the current read-only endpoint.

**Action:** Add the `logAuditEvent` helper function to admin-users for future use. If user create/update mutations are added later (not in v11.0 scope), they will already have the helper available.

**However**, success criteria 3 says "Criar ou atualizar um usuario via admin-users gera um registro em audit_logs". This implies user create/update mutations should exist. Checking: there is no user create/update in admin-users today. This success criterion refers to *when* those mutations exist — the instrumentation pattern must be ready. We will add the helper and a comment marking where to instrument.

**Verification:**
- The logAuditEvent helper exists and compiles in admin-users
- If user mutations are added, they follow the same pattern as admin-tenants

### Plan 136.3: Auth Event Logging (Sign-In)

**What:** Create a new edge function `audit-auth` that receives sign-in/sign-out events from the frontend and logs them to audit_logs.

**Files:**
- `supabase/functions/audit-auth/index.ts` — new edge function (POST only)
- `src/platform/services/audit-auth-service.ts` — frontend service (fire-and-forget fetch)
- `src/platform/auth/Login.tsx` — call logSignIn after successful email/password sign-in
- `src/platform/router/AppRouter.tsx` — check for SSO callback success and log sign-in
- `src/platform/layout/UserMenu.tsx` (or wherever sign-out lives) — call logSignOut before signOut()

**Edge function contract:**
```
POST /audit-auth
Authorization: Bearer <clerk-token>
Body: { event: 'sign_in' | 'sign_out' }
```

The edge function:
1. Decodes the Clerk JWT to get actor_id (sub) and actor_email
2. Extracts IP from `x-forwarded-for` and user-agent from request headers
3. Inserts into audit_logs with action `auth.sign_in` or `auth.sign_out`
4. resource_type: `session`, resource_id: session ID from JWT (jti or sid claim)
5. org_id: null (sign-in is pre-org-selection)
6. Returns 200 always (fire-and-forget, never blocks auth flow)

**Frontend service:**
```ts
export function logAuthEvent(event: 'sign_in' | 'sign_out', token: string): void {
  // Fire-and-forget — no await, no error handling
  fetch(`${FUNCTIONS_URL}/audit-auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
  }).catch(() => {}) // silently swallow errors
}
```

**Integration points:**
- Login.tsx: after `setActive({ session: result.createdSessionId })` succeeds, call `logAuthEvent('sign_in', token)`
- SSO callback: after Google OAuth completes, call `logAuthEvent('sign_in', token)`
- Sign-out: before `signOut()`, call `logAuthEvent('sign_out', token)`

**Verification:**
- Sign in via email/password → check audit_logs for `auth.sign_in` with IP and user-agent
- Sign in via Google OAuth → check audit_logs for `auth.sign_in`
- Sign out → check audit_logs for `auth.sign_out`

**Deploy checklist (PITFALLS #2, #9):**
- Deploy with `verify_jwt: false` (edge function validates JWT internally)
- Verify via `mcp__supabase__list_edge_functions`
- Test end-to-end

## Shared Helper: logAuditEvent for Edge Functions

Since edge functions run in Deno (not the React app), they cannot import from `src/modules/admin/services/audit-service.ts`. Each edge function that needs audit logging will have a local `logAuditEvent()` helper that inserts directly into `audit_logs` via the service role Supabase client.

```ts
interface AuditEventInput {
  org_id: string | null
  actor_id: string
  actor_email: string
  actor_type: 'super_admin' | 'user' | 'system'
  action: string
  resource_type: string
  resource_id: string
  resource_label: string
  ip_address: string
  user_agent: string
  metadata?: Record<string, unknown>
}

async function logAuditEvent(
  supabase: SupabaseClient,
  event: AuditEventInput,
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      org_id: event.org_id,
      actor_id: event.actor_id,
      actor_email: event.actor_email,
      actor_type: event.actor_type,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      resource_label: event.resource_label,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata: event.metadata ?? {},
    })
  } catch (err) {
    console.error('[audit] Failed to log event:', err)
    // Never throw — audit logging must not break the main operation
  }
}
```

To avoid code duplication across 3 edge functions, consider a shared file `supabase/functions/_shared/audit.ts` that all functions import. Supabase supports shared modules via the `_shared/` convention.

## Execution Order

1. **136.1** first — largest surface area (6 handlers), validates the pattern
2. **136.2** second — minimal work (add helper, no current mutations to instrument)
3. **136.3** last — new edge function + frontend changes, highest risk

## Dependencies

- Phase 134 must be complete (audit_logs table must exist)
- Phase 135 must be complete (logAuditEvent pattern defined for src/ — but edge functions use their own Deno-compatible helper)

## Success Criteria Mapping

| Criterion | Plan |
|-----------|------|
| 1. Criar, atualizar ou arquivar tenant via admin-tenants gera registro | 136.1 |
| 2. Adicionar ou remover membro de org via admin-tenants gera registro | 136.1 |
| 3. Criar ou atualizar usuario via admin-users gera registro | 136.2 (helper ready, mutations pending) |
| 4. Sign-in bem-sucedido gera registro com IP e user-agent | 136.3 |

## Risks

- **IP address accuracy**: `x-forwarded-for` may contain multiple IPs (proxy chain). Take the first one.
- **OAuth sign-in timing**: Google OAuth redirects through `/sso-callback` — need to find the right hook point after Clerk completes the flow.
- **Edge function size**: admin-tenants is already 553 lines. Adding audit calls to 6 handlers adds ~60 lines. Consider extracting shared helper to `_shared/audit.ts`.
- **actor_email in JWT**: Clerk JWTs may not include email as a top-level claim. May need to extract from `unsafe_metadata` or fetch from Clerk API. Verify the actual JWT shape.
