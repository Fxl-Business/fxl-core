# Architecture Research

**Domain:** Audit Logging — integration into existing multi-tenant platform (Nexo v11.0)
**Researched:** 2026-03-19
**Confidence:** HIGH (all findings derived from direct codebase analysis)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  React 18 SPA (Vercel)                                               │
│  ┌─────────────────────┐  ┌───────────────────────────────────────┐  │
│  │  Operator Modules    │  │  Admin Panel (/admin/*)               │  │
│  │  src/modules/*       │  │  src/platform/pages/admin/*           │  │
│  │  (tasks, docs, etc.) │  │  + /admin/audit-logs  [NEW]           │  │
│  └──────────┬──────────┘  └───────────────────────┬───────────────┘  │
│             │                                      │                  │
│  ┌──────────┴──────────────────────────────────────┴───────────────┐  │
│  │  Service Layer  src/platform/services/                           │  │
│  │  audit-service.ts [NEW]  admin-service.ts  tenant-service.ts    │  │
│  └──────────────────────────────────┬────────────────────────────── ┘  │
└─────────────────────────────────────┼────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────┐
│  Supabase Edge Functions            │                                 │
│  ┌────────────────────┐  ┌──────────┴──────────┐                     │
│  │  auth-token-exchange│  │  audit-logs [NEW]   │                     │
│  │  admin-tenants      │  │  (query + export)   │                     │
│  │  admin-users        │  └─────────────────────┘                     │
│  └────────────────────┘                                               │
└──────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────┐
│  Supabase PostgreSQL                                                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  audit_logs table  [NEW — migration 025]                      │    │
│  │  id, occurred_at, org_id, actor_id, actor_email, action,      │    │
│  │  resource_type, resource_id, metadata JSONB, ip_address,      │    │
│  │  user_agent, severity, outcome                                │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  DB Triggers [NEW]           Existing Tables                          │
│  ┌──────────────────────┐    ┌───────────┐  ┌───────────────────┐    │
│  │  AFTER INSERT/UPDATE/│    │  tasks    │  │ blueprint_configs  │    │
│  │  DELETE on critical  │    │  clients  │  │ tenant_modules     │    │
│  │  tables → INSERT into│    │  projects │  │ documents          │    │
│  │  audit_logs          │    └───────────┘  └───────────────────┘    │
│  └──────────────────────┘                                             │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Location | Status |
|-----------|----------------|----------|--------|
| `audit_logs` table | Immutable append-only event store | Supabase migration 025 | NEW |
| DB triggers | Capture row-level mutations without app-layer trust | Migration 025 | NEW |
| `audit-service.ts` (write path) | `logAuditEvent()` — application-layer event capture | `src/platform/services/audit-service.ts` | NEW |
| `audit-service.ts` (read path) | `queryAuditLogs()` — fetches from edge function | Same file | NEW |
| `audit-logs` edge function | Secure query endpoint — service role reads with super_admin JWT gate | `supabase/functions/audit-logs/` | NEW |
| `AuditLogsPage.tsx` | Admin panel page at `/admin/audit-logs` — timeline, filters, export | `src/platform/pages/admin/AuditLogsPage.tsx` | NEW |
| `AdminSidebar.tsx` | Add "Audit Logs" nav item | `src/platform/layout/AdminSidebar.tsx` | MODIFY |
| `AppRouter.tsx` | Add `/admin/audit-logs` route | `src/platform/router/AppRouter.tsx` | MODIFY |
| `admin-tenants` edge function | Add `logAuditEvent` calls for archive/restore/impersonate | `supabase/functions/admin-tenants/` | MODIFY |
| `admin-users` edge function | Add `logAuditEvent` calls for user invite/remove | `supabase/functions/admin-users/` | MODIFY |

## Recommended Project Structure

```
src/platform/
├── services/
│   └── audit-service.ts           # NEW — logAuditEvent() + queryAuditLogs()
├── types/
│   └── audit.ts                   # NEW — AuditLogEntry, AuditEventInput, AuditMetadata
├── pages/admin/
│   ├── AuditLogsPage.tsx           # NEW — timeline, filters, search, export
│   └── [existing pages unchanged]
├── layout/
│   └── AdminSidebar.tsx            # MODIFY — add ShieldCheck + "Audit Logs" nav item
└── router/
    └── AppRouter.tsx               # MODIFY — add /admin/audit-logs lazy route

supabase/
├── migrations/
│   └── 025_audit_logs.sql          # NEW — table + triggers + RLS + indexes
└── functions/
    └── audit-logs/
        └── index.ts                # NEW — paginated query with filters
```

### Structure Rationale

- **`audit-service.ts` in platform/services/:** Matches the established service layer pattern. Both `tenant-service.ts` and `admin-service.ts` follow the same structure: module-level token getter, `getAuthHeaders()`, named async functions. All data access is a named TypeScript function — no raw Supabase client calls in components.
- **Separate `src/platform/types/audit.ts`:** Keeps audit types isolated from the growing `admin.ts` types file. The edge function and the service share the same TypeScript types via this file.
- **`AuditLogsPage.tsx` in platform/pages/admin/:** Consistent with `TenantsPage.tsx`, `UsersPage.tsx`. Same `AdminLayout`, same `SuperAdminRoute` guard, same lazy import in `AppRouter.tsx`.
- **Edge function for queries:** Direct client reads of `audit_logs` risk cross-org exposure if RLS has any misconfiguration. The edge function pattern is the established secure approach — all admin data goes through edge functions (confirmed by `admin-service.ts` and `tenant-service.ts`).

## Architectural Patterns

### Pattern 1: Hybrid DB Trigger + Application Layer

**What:** DB triggers capture row-level mutations (INSERT/UPDATE/DELETE) with access to `OLD`/`NEW` row data. The application layer explicitly logs high-level business events that have no DB footprint — admin operations on Clerk (archive tenant, invite user, impersonate).

**When to use:** Always for audit systems in this architecture. Pure trigger-only coverage misses all Clerk-side admin actions. Pure application-layer coverage has no guarantee — a future code path could bypass the logging call.

**Trade-offs:**
- Triggers guarantee capture of all data mutations even if application code changes
- Triggers add < 1ms per write on the instrumented tables — acceptable at current scale
- Triggers cannot see Clerk actor identity; only the JWT `org_id` and `actor_id` set via `SET LOCAL` by the application
- Two capture paths require discipline: avoid double-logging the same event

**Example — trigger function:**
```sql
CREATE OR REPLACE FUNCTION public.audit_log_mutation()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id TEXT;
  v_org_id   TEXT;
BEGIN
  v_actor_id := COALESCE(current_setting('app.actor_id', true), 'system');
  v_org_id   := COALESCE(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
    'system'
  );

  INSERT INTO public.audit_logs (
    org_id, actor_id, action, resource_type, resource_id, metadata, outcome
  ) VALUES (
    v_org_id,
    v_actor_id,
    TG_OP,                          -- 'INSERT' | 'UPDATE' | 'DELETE'
    TG_TABLE_NAME,                  -- e.g., 'tasks', 'clients'
    COALESCE(NEW.id::text, OLD.id::text),
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)),
    'success'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Example — application layer write (service function):**
```typescript
// src/platform/services/audit-service.ts
// Never throws — audit failure must not break the main operation
export async function logAuditEvent(event: AuditEventInput): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    org_id: event.orgId,
    actor_id: event.actorId,
    actor_email: event.actorEmail ?? null,
    action: event.action,           // semantic name: 'tenant.archived', 'user.invited'
    resource_type: event.resourceType,
    resource_id: event.resourceId ?? null,
    metadata: event.metadata ?? {},
    ip_address: event.ipAddress ?? null,
    user_agent: event.userAgent ?? null,
    severity: event.severity ?? 'info',
    outcome: event.outcome ?? 'success',
  })
  if (error) {
    console.error('[audit] Failed to log event:', error.message)
    // Intentionally not throwing — audit failure is non-blocking
  }
}
```

### Pattern 2: Append-Only Table with SECURITY DEFINER Write Path

**What:** `audit_logs` has RLS enabled. No INSERT policy exists for the `authenticated` or `anon` roles — only the `SECURITY DEFINER` trigger function can write rows directly. Application-layer writes from Edge Functions use the Supabase service role key (which bypasses RLS).

**When to use:** Always for audit tables. Preventing direct client inserts closes the risk of fabricated audit events.

**Trade-offs:**
- Trigger writes go through `SECURITY DEFINER` — standard PostgreSQL pattern for audit tables
- Edge Function writes use the service role key (already the pattern for all admin Edge Functions)
- The React SPA cannot write to `audit_logs` at all — by design

**Example RLS:**
```sql
-- Read: super_admin sees all rows
CREATE POLICY "audit_logs_super_admin_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
  );

-- No INSERT/UPDATE/DELETE policies — only SECURITY DEFINER functions and service role can write
```

### Pattern 3: JSONB Metadata Envelope

**What:** The `metadata` column is `JSONB NOT NULL DEFAULT '{}'`. All event-specific contextual data (changed fields, before/after snapshot, error messages) goes into `metadata`. The outer row schema remains stable across all event types.

**When to use:** Always for audit log tables — every event type carries different context.

**Trade-offs:**
- A GIN index on `metadata` enables key-level queries but is less efficient than B-tree
- Schema validation is the application's responsibility (TypeScript discriminated union, Zod on read)
- Avoids ALTER TABLE migrations every time a new event type needs additional context fields

**Example typed metadata:**
```typescript
// src/platform/types/audit.ts
export type AuditMetadata =
  | { changed_fields: string[]; before: Record<string, unknown>; after: Record<string, unknown> }  // trigger
  | { reason?: string; archived_by: string }            // tenant.archived
  | { method: 'google' | 'email' }                      // user.login
  | { role: string }                                     // user.invited
  | Record<string, unknown>                              // fallback for unknown events
```

## Data Flow

### Event Capture — DB Trigger Path

```
Module service function (e.g., tasks update)
    ↓
supabase.from('tasks').update(...)
    ↓
PostgreSQL executes UPDATE on tasks table
    ↓
AFTER UPDATE trigger fires → audit_log_mutation()
    ↓  (SECURITY DEFINER — bypasses RLS)
INSERT into audit_logs committed in same transaction
```

### Event Capture — Application Layer Path (Edge Functions)

```
Admin action in Edge Function (e.g., archive tenant)
    ↓
Clerk API call + Supabase update
    ↓
logAuditEvent({ action: 'tenant.archived', actorId, orgId, ... })
    ↓  (supabase admin client — service role, bypasses RLS)
INSERT into audit_logs
```

### Audit Log Query Flow

```
AuditLogsPage component (filter state: org, action, date range, search)
    ↓
queryAuditLogs(filters) in audit-service.ts
    ↓  (fetch with Authorization: Bearer <Clerk super_admin JWT>)
audit-logs edge function validates super_admin claim
    ↓
Supabase admin client (service role) → SELECT with WHERE clauses
    ↓  (pagination: limit/offset, ORDER BY occurred_at DESC)
Returns { logs: AuditLogEntry[], totalCount: number }
    ↓
AuditLogsPage renders timeline + pagination
```

### Key Data Flows

1. **Trigger capture:** Mutations on `tasks`, `clients`, `projects`, `blueprint_configs`, `documents`, `tenant_modules` automatically produce audit rows — no per-table application code after initial trigger setup.
2. **High-level event capture:** Admin actions in `admin-tenants` and `admin-users` Edge Functions call `logAuditEvent()` explicitly. These capture events that have no corresponding Supabase row change (Clerk-only operations).
3. **Audit page reads:** Always proxied through the `audit-logs` Edge Function — consistent with the established pattern for all admin data. The React SPA never reads `audit_logs` directly.

## Audit Log Table Schema

```sql
-- Migration 025
CREATE TABLE public.audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Multi-tenant isolation
  org_id         TEXT NOT NULL,           -- Clerk org_id or 'system' for super_admin actions

  -- Actor (who did it)
  actor_id       TEXT NOT NULL,           -- Clerk user_id or 'system' for automated operations
  actor_email    TEXT,                    -- Denormalized: avoids Clerk API lookup on log render

  -- Event semantics
  action         TEXT NOT NULL,           -- e.g., 'INSERT', 'tasks.created', 'tenant.archived'
  resource_type  TEXT NOT NULL,           -- e.g., 'tasks', 'tenants', 'blueprint_configs'
  resource_id    TEXT,                    -- UUID or slug of the affected resource

  -- Enriched context
  metadata       JSONB NOT NULL DEFAULT '{}',
  ip_address     INET,
  user_agent     TEXT,
  severity       TEXT NOT NULL DEFAULT 'info'
                   CHECK (severity IN ('info', 'warning', 'critical')),
  outcome        TEXT NOT NULL DEFAULT 'success'
                   CHECK (outcome IN ('success', 'failure'))
);

-- Indexes
CREATE INDEX idx_audit_occurred_at    ON public.audit_logs (occurred_at DESC);
CREATE INDEX idx_audit_org_time       ON public.audit_logs (org_id, occurred_at DESC);
CREATE INDEX idx_audit_actor_time     ON public.audit_logs (actor_id, occurred_at DESC);
CREATE INDEX idx_audit_action         ON public.audit_logs (action, occurred_at DESC);
CREATE INDEX idx_audit_resource       ON public.audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_metadata_gin   ON public.audit_logs USING GIN (metadata);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

**Schema decisions:**
- No `archived_at` column — audit logs are append-only by definition. Retention is handled by scheduled DELETE or partition drop, not soft-delete.
- `actor_email` is denormalized intentionally to avoid Clerk API calls when rendering hundreds of log rows.
- `occurred_at DESC` is the primary query pattern. The composite `(org_id, occurred_at DESC)` covers the most common admin filter: "all events for this tenant."
- No table partitioning for v11.0 — at current scale (< 100K rows/month) a single table with these indexes is sufficient. Revisit at 10M+ rows.

## RLS Policy Decision: Super Admin Only (v11.0)

The `audit_logs` table is **super_admin-only read** for v11.0. Org-scoped operators do not have a read policy.

**Rationale:** The audit page lives in `/admin/*` which is already gated by `SuperAdminRoute`. There is no use case in v11.0 for org operators to see their own audit trail — that is a future compliance feature. Starting with super_admin-only keeps the RLS policy simple and avoids accidentally exposing cross-org metadata.

**Future extension:** Add a second RLS branch for org-scoped read when a "My Organization Activity" feature is needed:
```sql
-- Future: org-scoped read policy (add this later, do not build now)
CREATE POLICY "audit_logs_org_read" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| < 1M rows | Single table, current indexes sufficient. No action needed. |
| 1M–50M rows | Add range partitioning by `occurred_at` (monthly). Drop old partitions for retention. Supabase supports `PARTITION BY RANGE`. |
| 50M+ rows | Separate read replica for audit queries. Consider Timescale or ClickHouse for analytics. Export cold logs to object storage. |

### Scaling Priorities

1. **First bottleneck:** Trigger overhead on high-write tables. At current FXL scale (< 50 tenants, < 1000 writes/day) this is not measurable. Monitor `pg_stat_user_tables` if needed.
2. **Second bottleneck:** Audit page query time as rows accumulate. The composite index `(org_id, occurred_at DESC)` handles this up to ~5M rows efficiently.

## Anti-Patterns

### Anti-Pattern 1: Logging From React Components or Hooks

**What people do:** Call `supabase.from('audit_logs').insert(...)` from `useEffect`, event handlers, or custom React hooks.

**Why it's wrong:** React components re-render unpredictably. Effects fire twice in StrictMode. Actor context (IP address, user_agent, actor_email) is not available in the browser. The anon Supabase key should not have INSERT permissions on `audit_logs`. Result: duplicate entries and missing context.

**Do this instead:** All application-layer audit writes go through `logAuditEvent()` in service layer functions or Edge Functions where execution is deterministic and actor context is fully available.

### Anti-Pattern 2: Trigger-Only Coverage

**What people do:** Set up triggers on all tables and assume all security-relevant events are captured.

**Why it's wrong:** The most sensitive admin operations (archive tenant, invite user, impersonate, remove member) go through Clerk API via Edge Functions — they have no Supabase row mutation to trigger on. These are exactly the events a security audit needs.

**Do this instead:** DB triggers for data mutations + explicit `logAuditEvent()` calls in every Edge Function that performs a Clerk API operation.

### Anti-Pattern 3: Direct Client Read of audit_logs

**What people do:** `supabase.from('audit_logs').select('*')` in `AuditLogsPage.tsx` directly.

**Why it's wrong:** Inconsistent with the established pattern for admin data. If RLS has a bug, it exposes cross-org logs. The React client uses the anon key which is published in the JavaScript bundle. All admin data reads in this codebase go through Edge Functions with the Clerk JWT.

**Do this instead:** Route all reads through the `audit-logs` Edge Function using the Clerk super_admin JWT — the same pattern as `admin-service.ts` and `tenant-service.ts`.

### Anti-Pattern 4: Fat JSONB Without a Typed Envelope

**What people do:** Serialize entire Supabase response objects into `metadata`, including internal fields, nulls, pagination state, and Supabase error objects.

**Why it's wrong:** Logs become unreadable. Storage grows unnecessarily. Future automation (alerting, anomaly detection) has no stable field contract to rely on.

**Do this instead:** Define a typed `AuditMetadata` discriminated union per action category. Capture only the minimum relevant context: changed fields list, not full row snapshots.

### Anti-Pattern 5: Throwing From logAuditEvent

**What people do:** `throw new Error(...)` inside `logAuditEvent()` when the Supabase INSERT fails.

**Why it's wrong:** An audit failure should never block the main operation. If `archiveTenant()` successfully archives the tenant but then `logAuditEvent()` throws, the tenant archival gets rolled back or left in an inconsistent state from the caller's perspective.

**Do this instead:** `logAuditEvent()` logs the error to `console.error` and returns silently. The main operation continues regardless.

## Integration Points

### New Components

| Component | Type | Integrates With |
|-----------|------|-----------------|
| `audit_logs` table | Supabase migration 025 | All instrumented tables via triggers |
| `logAuditEvent()` | Service function (write path) | Edge Functions that perform admin operations |
| `queryAuditLogs()` | Service function (read path) | `audit-logs` Edge Function |
| `audit-logs` edge function | Supabase Edge Function | Supabase service role client |
| `AuditLogsPage.tsx` | React page component | AdminLayout, SuperAdminRoute |

### Modified Components

| Component | What Changes | Why |
|-----------|-------------|-----|
| `AdminSidebar.tsx` | Add `{ label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldCheck }` to `adminNavItems` | Expose new page in navigation |
| `AppRouter.tsx` | Add `<Route path="/admin/audit-logs">` with lazy `AuditLogsPage` import | Wire page into protected admin routes |
| `admin-tenants` edge function | Call `logAuditEvent` for archive, restore, impersonate, add-member, remove-member actions | These are Clerk-only operations with no DB trigger coverage |
| `admin-users` edge function | Call `logAuditEvent` for user-related admin actions | Same — Clerk-only |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `AuditLogsPage` → `audit-service.ts` | Direct function import (`queryAuditLogs`) | Follows existing service layer pattern |
| `audit-service.ts` → `audit-logs` edge function | `fetch()` with `Authorization: Bearer <Clerk JWT>` | Same pattern as `tenant-service.ts` and `admin-service.ts` |
| `audit-logs` edge function → `audit_logs` table | Supabase service role client (bypasses RLS) | Required — established pattern for all admin edge functions |
| DB triggers → `audit_logs` | `SECURITY DEFINER` INSERT | Bypasses RLS; actor context injected via `SET LOCAL` where possible |
| `logAuditEvent()` → `audit_logs` | Supabase service role client (in edge function context) | Application-layer writes always from edge functions, never from SPA |

## Suggested Build Order

Phase ordering is driven by three dependency constraints:
1. The `audit_logs` table must exist before triggers, edge function, service layer, or UI can be built.
2. The `audit-logs` edge function (read path) must exist before `queryAuditLogs()` in the service layer.
3. Application-layer capture (instrumenting existing edge functions) requires the table and `logAuditEvent()` but does not block the UI.

**Recommended phase sequence:**

| Phase | What to Build | Depends On | Can Parallelize With |
|-------|--------------|------------|----------------------|
| 1 | Migration 025: `audit_logs` table + RLS + indexes | Nothing | — |
| 2 | DB triggers on critical tables (tasks, clients, projects, blueprint_configs) | Phase 1 | Phase 3 |
| 3 | `logAuditEvent()` write function + TypeScript types (`src/platform/types/audit.ts`) | Phase 1 | Phase 2 |
| 4 | Instrument existing edge functions (admin-tenants, admin-users) | Phase 3 | Phase 5 |
| 5 | `audit-logs` edge function (paginated query with filters) | Phase 1 | Phase 4 |
| 6 | `queryAuditLogs()` read function in `audit-service.ts` | Phase 5 | — |
| 7 | `AuditLogsPage.tsx` (timeline, filters, pagination) | Phase 6 | — |
| 8 | Wire into `AdminSidebar.tsx` + `AppRouter.tsx` + lazy import | Phase 7 | — |

**Rationale:**
- Phases 1-4 (DB + capture layer) can be shipped and accumulating real log data before the UI exists. This maximizes the historical data available when the page goes live.
- Phases 2 and 3 are independent after Phase 1 completes — they can be built in the same phase or parallel agents.
- Phases 4 and 5 are independent after their respective dependencies — can also run in parallel.
- The UI (Phases 7-8) is the visible deliverable but has no blocking dependency on any production data.

## Sources

- Direct codebase analysis: `src/platform/services/admin-service.ts` — service layer pattern with token getter, `getAuthHeaders()`, `withRetry` wrapper
- Direct codebase analysis: `src/platform/services/tenant-service.ts` — confirms pattern consistency
- Direct codebase analysis: `supabase/migrations/019_tenant_archival.sql` — RLS policy pattern: `super_admin bypass OR (org_id match AND condition)`
- Direct codebase analysis: `src/platform/router/AppRouter.tsx` — lazy admin route registration pattern
- Direct codebase analysis: `src/platform/layout/AdminSidebar.tsx` — hardcoded `adminNavItems` array, `NavLink` pattern
- Direct codebase analysis: `src/platform/lib/retry.ts` — `withRetry` pattern used in all service functions
- Direct codebase analysis: `.planning/PROJECT.md` — Key Decisions table: "Super admin via JWT claim", "Supabase Edge Function as Clerk API proxy"

---
*Architecture research for: Audit Logging integration into Nexo multi-tenant platform (v11.0)*
*Researched: 2026-03-19*
