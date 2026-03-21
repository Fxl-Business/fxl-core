---
phase: 136-edge-function-instrumentation
verified: 2026-03-20T00:00:00Z
status: passed
score: 11/11 must-haves verified
re_verification: false
---

# Phase 136: Edge Function Instrumentation Verification Report

**Phase Goal:** Todas as acoes administrativas criticas e eventos de auth sao capturados automaticamente no audit log sem intervencao manual do operador
**Verified:** 2026-03-20
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Creating a tenant via admin-tenants generates an audit_logs row with action 'create' and resource_type 'tenant' | VERIFIED | `handleCreateOrg` calls `logAuditEvent` with `action: 'create'`, `resource_type: 'tenant'` at line 272 of admin-tenants/index.ts |
| 2 | Archiving a tenant generates an audit_logs row with action 'archive' | VERIFIED | `handleArchiveTenant` calls `logAuditEvent` with `action: 'archive'` at line 513 |
| 3 | Restoring a tenant generates an audit_logs row with action 'restore' | VERIFIED | `handleRestoreTenant` calls `logAuditEvent` with `action: 'restore'` at line 580 |
| 4 | Adding a member generates an audit_logs row with action 'add_member' | VERIFIED | `handleAddMember` calls `logAuditEvent` with `action: 'add_member'` at line 374 |
| 5 | Removing a member generates an audit_logs row with action 'remove_member' | VERIFIED | `handleRemoveMember` calls `logAuditEvent` with `action: 'remove_member'` at line 420 |
| 6 | Generating an impersonation token generates an audit_logs row with action 'impersonate' | VERIFIED | `handleImpersonateToken` calls `logAuditEvent` with `action: 'impersonate'` at line 629 |
| 7 | admin-users has the logAuditEvent helper available for future mutation handlers | VERIFIED | Import at line 12, `getSupabaseAdmin` defined, TODO(CAPT-02) comment at line 72 |
| 8 | A successful email/password sign-in generates an audit_logs row with action 'sign_in' and IP/user-agent | VERIFIED | Login.tsx calls `logAuthEvent('sign_in', token)` after `setActive()`; audit-auth edge function captures IP from `x-forwarded-for` and user-agent |
| 9 | A sign-out generates an audit_logs row with action 'sign_out' | VERIFIED | UserMenu.tsx `handleSignOut` calls `logAuthEvent('sign_out', token)` before `signOut()` |
| 10 | The audit-auth edge function never blocks the auth flow even on failure | VERIFIED | All code paths in audit-auth/index.ts return `jsonOk()` (HTTP 200); outer catch at line 106 swallows all errors and still calls `jsonOk()` |
| 11 | Google OAuth sign-in is explicitly deferred (documented with TODO comment) | VERIFIED | AppRouter.tsx lines 111-114 contain `TODO(CAPT-03)` comment explaining OAuth deferral |

**Score:** 11/11 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/027_audit_action_expand.sql` | Migration expanding CHECK constraint for add_member, remove_member | VERIFIED | EXISTS, 15 lines, ALTER TABLE with all 10 action values, correct syntax |
| `supabase/functions/_shared/audit.ts` | Shared logAuditEvent helper for Deno edge functions | VERIFIED | EXISTS, 72 lines, exports `logAuditEvent` and `extractAuditContext`, never-throw contract confirmed |
| `supabase/functions/admin-tenants/index.ts` | Admin tenants edge function with audit logging on all 6 mutation handlers | VERIFIED | EXISTS, 664 lines, exactly 6 `await logAuditEvent` calls (import counts as 7th occurrence of the string) |
| `supabase/functions/admin-users/index.ts` | Admin users edge function with audit helper imported | VERIFIED | EXISTS, 167 lines, import present, `getSupabaseAdmin` defined, zero mutation instrumentation (by design — read-only) |
| `supabase/functions/audit-auth/index.ts` | Edge function logging sign_in/sign_out to audit_logs | VERIFIED | EXISTS, 120 lines, always returns 200, bare action values matching DB CHECK, x-forwarded-for captured |
| `src/platform/services/audit-auth-service.ts` | Frontend fire-and-forget service for auth event logging | VERIFIED | EXISTS, 31 lines, exports `logAuthEvent` as `void`, uses `VITE_SUPABASE_FUNCTIONS_URL`, errors silently caught |
| `src/platform/auth/Login.tsx` | Login page with sign-in audit logging after successful auth | VERIFIED | Contains `logAuthEvent('sign_in', token)` in `.then()` pattern after `setActive()` |
| `src/platform/layout/UserMenu.tsx` | User menu with sign-out audit logging before signOut() | VERIFIED | `handleSignOut` awaits `getToken()` then calls `logAuthEvent('sign_out', token)` before `signOut()` |
| `src/platform/types/audit.ts` | AuditAction type synced with expanded DB CHECK constraint | VERIFIED | Contains all 10 action values matching migration 027; `AuditActorType` is `'user' \| 'system' \| 'trigger'` matching DB |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `admin-tenants/index.ts` | `_shared/audit.ts` | import | WIRED | Line 14: `import { logAuditEvent, extractAuditContext } from '../_shared/audit.ts'` |
| `admin-users/index.ts` | `_shared/audit.ts` | import | WIRED | Line 12: `import { logAuditEvent, extractAuditContext } from '../_shared/audit.ts'` |
| `_shared/audit.ts` | audit_logs table | supabase.from('audit_logs').insert | WIRED | Line 33: `await supabase.from('audit_logs').insert({...})` with error handling |
| `Login.tsx` | `audit-auth-service.ts` | import logAuthEvent | WIRED | Line 6: `import { logAuthEvent } from '@platform/services/audit-auth-service'` |
| `UserMenu.tsx` | `audit-auth-service.ts` | import logAuthEvent | WIRED | Line 4: `import { logAuthEvent } from '@platform/services/audit-auth-service'` |
| `audit-auth-service.ts` | `audit-auth` edge function | fetch POST | WIRED | Line 20: `fetch(\`${FUNCTIONS_URL}/audit-auth\`, { method: 'POST', ... })` |
| `audit-auth/index.ts` | audit_logs table | supabase.from('audit_logs').insert | WIRED | Line 93: `await supabase.from('audit_logs').insert({...})` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| CAPT-02 | 136-01 | Instrumentacao dos Edge Functions admin-tenants e admin-users com logAuditEvent() para todas as acoes admin | SATISFIED | 6 instrumented mutation handlers in admin-tenants; admin-users has helper imported and ready; confirmed in REQUIREMENTS.md as complete |
| CAPT-03 | 136-02 | Captura de auth events (sign-in/sign-out) com IP e user-agent | SATISFIED | audit-auth edge function captures IP from x-forwarded-for and user-agent; Login.tsx and UserMenu.tsx integrated; confirmed in REQUIREMENTS.md as complete |

No orphaned requirements found — both phase-136 requirement IDs (CAPT-02, CAPT-03) are claimed in plan frontmatter and verified in REQUIREMENTS.md.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `admin-users/index.ts` | 72-74 | TODO(CAPT-02) comment for future mutations | Info | Expected — admin-users is read-only by design; comment is intentional infrastructure marker |

No blocker or warning anti-patterns found. The TODO comment in admin-users is intentional and documented in plan 136-01.

---

### Human Verification Required

#### 1. Sign-in audit log reaches Supabase in production

**Test:** Sign in with a valid email/password account, then query `select * from audit_logs where action = 'sign_in' order by created_at desc limit 1`.
**Expected:** Row appears with correct `actor_id`, `actor_email`, non-empty `ip_address` and `user_agent`.
**Why human:** Requires a live Supabase environment, a valid Clerk account, and the `VITE_SUPABASE_FUNCTIONS_URL` env var configured correctly. Cannot be verified statically.

#### 2. Sign-out audit log is not lost on session destruction

**Test:** Sign out from the app, then query `audit_logs` for `action = 'sign_out'`.
**Expected:** Row appears with a valid `actor_id`. The token was valid at the moment `getToken()` was called (before `signOut()`).
**Why human:** The timing of `getToken()` vs. session teardown can only be confirmed in a running browser session.

#### 3. audit-auth edge function returns 200 on all error paths

**Test:** Send a POST to the audit-auth function with a malformed body, or without an Authorization header.
**Expected:** HTTP 200 `{ ok: true }` in both cases — no 4xx/5xx.
**Why human:** Requires calling the deployed edge function endpoint directly, which requires network access to the Supabase project.

---

### Gaps Summary

No gaps. All 11 observable truths are verified, all 8 artifacts pass all three levels (exists, substantive, wired), all 7 key links are confirmed wired, and both requirement IDs (CAPT-02, CAPT-03) are satisfied with evidence in the codebase.

The only items flagged for human verification are runtime behaviors (DB row insertion, token timing, edge function HTTP responses) that cannot be asserted statically.

---

_Verified: 2026-03-20_
_Verifier: Claude (gsd-verifier)_
