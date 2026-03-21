# Stack Research — v11.0 Audit Logging

**Domain:** Audit Logging System — Multi-tenant React + Supabase SaaS platform
**Researched:** 2026-03-19
**Confidence:** HIGH (PostgreSQL patterns), MEDIUM (pg_partman managed availability)

> This is an additive research document for v11.0. The base stack (React 18, TypeScript strict,
> Tailwind CSS 3, Vite 5, Supabase, Clerk, shadcn/ui, Sentry, Zod 4.x) is validated and
> unchanged. This document covers ONLY what is new or changed for v11.0.

---

## Executive Decision: Zero New npm Dependencies

All audit logging features are implementable with:
1. A new Supabase migration (SQL schema + indexes + triggers)
2. An `audit-service.ts` service layer (app-layer logging)
3. A new admin page using existing shadcn/ui primitives
4. A pg_cron retention job (Supabase-native, no npm package)

The existing stack covers every requirement.

---

## Already-Present Stack (Do Not Re-research)

| Package | Version | Role in Audit Logging |
|---------|---------|----------------------|
| `@supabase/supabase-js` | ^2.98.0 | Insert/query audit_logs, RLS enforcement |
| `@clerk/react` | ^6.0.1 | Actor context (user_id, email, org_id) for every log entry |
| `zod` | ^4.3.6 | Validate AuditLog type at service boundaries |
| `sonner` | ^2.0.7 | Toast feedback after export action |
| `lucide-react` | ^0.460.0 | Icons in audit log timeline UI |
| `@sentry/react` | ^10.45.0 | Already capturing errors; audit log write failures go here |
| shadcn/ui via `@radix-ui/*` | various | Select, Input, Popover for filter UI — all installed |
| `react-router-dom` | ^6.27.0 | URL search params for shareable filter state |

---

## PostgreSQL Features to Use (Supabase-native, No Extensions Except pg_cron)

### Core Table Design

```sql
CREATE TABLE audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       text NOT NULL,          -- tenant scope, matches RLS on all 10+ tables
  actor_id     text NOT NULL,          -- Clerk user_id
  actor_email  text,                   -- denormalized: readable after user deletion
  action       text NOT NULL,          -- e.g. 'tenant.archived', 'module.disabled'
  resource     text NOT NULL,          -- e.g. 'tenant', 'task', 'blueprint'
  resource_id  text,                   -- affected record ID (nullable for global actions)
  metadata     jsonb DEFAULT '{}',     -- flexible: IP, UA, diff, extra context
  old_values   jsonb,                  -- before snapshot (trigger-captured only)
  new_values   jsonb,                  -- after snapshot (trigger-captured only)
  severity     text DEFAULT 'info',    -- 'info' | 'warning' | 'critical'
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

**Why this schema:**
- `org_id` first in composite indexes follows the existing RLS pattern across the entire codebase
- `actor_email` denormalized — audit logs must remain readable after users are suspended/deleted (Clerk users can be removed)
- JSONB for `metadata` avoids schema changes when new event types need extra fields
- `old_values`/`new_values` nullable — only populated by DB triggers; app-layer events set them to NULL
- `severity` enables filtering by urgency without full-text search

### Required Indexes

```sql
-- Primary access pattern: per-tenant timeline (most common admin query)
CREATE INDEX audit_logs_org_time_idx
  ON audit_logs (org_id, created_at DESC);

-- Actor lookup: "what did this user do?"
CREATE INDEX audit_logs_actor_idx
  ON audit_logs (actor_id, created_at DESC);

-- Resource lookup: "what happened to this tenant/task/blueprint?"
CREATE INDEX audit_logs_resource_idx
  ON audit_logs (resource, resource_id);

-- JSONB metadata containment search
CREATE INDEX audit_logs_metadata_gin
  ON audit_logs USING GIN (metadata);
```

**Confidence: HIGH** — index strategy mirrors the existing `tasks` and `knowledge_entries` tables in the codebase, which follow the same `(org_id, ...)` composite pattern.

### RLS Policy

```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Operators can read their own org's logs
CREATE POLICY "audit_logs_select_org" ON audit_logs
  FOR SELECT USING (org_id = (auth.jwt() ->> 'org_id'));

-- Inserts come from SECURITY DEFINER functions and triggers only (no direct client insert)
-- Super admin bypass handled via existing RLS bypass migration pattern (migration 009)
```

**Why no direct INSERT policy from client:** App-layer inserts go through an Edge Function that validates the Clerk JWT and sets actor context server-side. This prevents a rogue client from spoofing `actor_id` or `org_id`.

---

## Capture Strategy: Hybrid (App Layer Primary, DB Triggers Secondary)

### Application Layer — Primary (90% of events)

Direct inserts into `audit_logs` from Edge Functions and the service layer. This is the right approach because:
- Only option for SELECT events (viewing sensitive records, exports)
- Captures semantic intent (`"admin.impersonation.started"`) vs raw table mutation
- Clerk actor context (user_id, email, org_id) is already available in Edge Function request context
- Follows the established `tenant-service.ts` / `admin-service.ts` pattern

**New service:** `src/modules/admin/services/audit-service.ts`

```typescript
interface AuditLogEntry {
  action: string;     // 'tenant.created' | 'tenant.archived' | 'module.toggled' | ...
  resource: string;   // 'tenant' | 'task' | 'blueprint' | ...
  resource_id?: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'critical';
}
```

**Confidence: HIGH** — mirrors existing service layer patterns in codebase.

### Database Triggers — Secondary (critical tables only)

`AFTER INSERT/UPDATE/DELETE` triggers for tables where bypass-proof capture is required even if the Edge Function fails after the DB write:

| Table | Why Trigger |
|-------|-------------|
| `tenants` | Tenant creation/archival is a compliance event; must be captured even on partial Edge Function failure |
| `tenant_modules` | Module enable/disable affects feature access platform-wide; silent loss unacceptable |

Do NOT add triggers to high-write tables (`tasks`, `wireframe_comments`, `blueprint_configs`). Triggers add overhead to every write operation and the write amplification is not justified. App-layer logging is sufficient.

**Key implementation detail:** Triggers run as the table owner and can write to `audit_logs` by using a `SECURITY DEFINER` wrapper function. This is necessary because `audit_logs` has RLS enabled and the trigger context does not carry a Clerk JWT.

**Confidence: HIGH** — SECURITY DEFINER pattern for audit triggers is well-documented in PostgreSQL wiki and confirmed by multiple sources.

---

## Retention Policy via pg_cron (Supabase-native)

**pg_cron** is available on Supabase managed platform (version 1.6.4, documented officially).

```sql
-- Enable once per project (already enabled if used elsewhere; safe to re-run)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Delete logs older than configured retention window, runs daily at 3am UTC
SELECT cron.schedule(
  'audit-log-retention',
  '0 3 * * *',
  $$DELETE FROM audit_logs WHERE created_at < now() - interval '90 days'$$
);
```

**Make it configurable:** Store `audit_retention_days` as a `platform_settings` key (table already exists from v4.1). The cron job reads this setting, so super admin can change retention without a migration.

**Why not pg_partman:** Monthly range partitioning with pg_partman would allow instant partition drops rather than row-level DELETEs. However:
- pg_partman has intermittent availability reports on Supabase managed (MEDIUM confidence on availability)
- Partitioned tables have different behavior for FK constraints, and some RLS policies need adjustment
- A `pg_cron` DELETE with proper indexes handles retention cleanly for the expected scale (< 1M rows/year for an SMB platform)
- pg_partman can be added later if audit_logs grows past 5M rows

**Confidence: HIGH for pg_cron** (officially documented, version confirmed), **MEDIUM for pg_partman skip** (availability risk is based on community reports, not official documentation).

---

## Export (No New Library — Native Browser APIs)

```typescript
// CSV export — zero dependencies, ~15 lines
function exportToCSV(rows: AuditLog[], filename: string) {
  const headers = ['Date', 'Actor', 'Action', 'Resource', 'Severity'];
  const lines = rows.map(r => [
    r.created_at, r.actor_email ?? r.actor_id, r.action, r.resource, r.severity
  ].join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// JSON export — trivially JSON.stringify(rows, null, 2)
```

**Why no library (`react-csv`, `papaparse`):** The feature is covered in under 20 lines. `papaparse` is 40KB minified, `react-csv` adds 30KB. The project constraint is explicit: "never add dependencies without documenting here." This is not a case that justifies a dependency.

**Confidence: HIGH** — native `Blob` + `URL.createObjectURL` works in all modern browsers; confirmed by MDN.

---

## Frontend Filtering (No New Library)

The audit log admin page needs: date range, action type, actor, severity, and resource filters. All implementable with installed packages:

| Filter Type | Component | Already Installed |
|-------------|-----------|-------------------|
| Action type dropdown | shadcn `Select` | Yes (`@radix-ui/react-select` ^2.2.6) |
| Severity filter | shadcn `Select` or button group | Yes |
| Date range | Two `<input type="date">` native inputs | Yes (HTML native) |
| Actor search | shadcn `Input` + Supabase `ilike` query | Yes |
| Shareable filter URL | `react-router-dom` URLSearchParams | Yes |

**Do NOT add TanStack Table:** The admin panel uses standard HTML table patterns throughout. TanStack Table is a headless utility designed for complex interactive grids (sorting, grouping, column reorder). The audit log view is a read-only timeline with server-side filtering — a `<table>` with Tailwind is the right tool.

**Confidence: HIGH** — existing admin pages (`/admin/users`, `/admin/tenants`) use the same pattern successfully.

---

## No New npm Packages

```bash
# Zero new packages for v11.0
# All capabilities present in:
# - PostgreSQL (Supabase-native): triggers, SECURITY DEFINER, GIN indexes, pg_cron
# - Existing installed packages: @supabase/supabase-js, @clerk/react, shadcn/ui, zod
# - Browser native APIs: Blob, URL.createObjectURL for export
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Log retention | `pg_cron` DELETE job | `pg_partman` monthly partitions | Managed availability uncertain (MEDIUM confidence); FK + RLS complexity; overkill at < 1M rows/year |
| Export | Native Blob API | `react-csv` / `papaparse` | 30-80KB for 15 lines of native code; project constraint against unjustified dependencies |
| Filter/table UI | shadcn `<table>` + Tailwind | `@tanstack/react-table` | No prior usage; overkill for read-only timeline; adds dependency for zero benefit at this scale |
| Log transport | Direct Supabase insert via Edge Function | External service (Datadog, LogTail, Axiom) | Extra cost and dependency; PostgreSQL queryable logs sufficient for SMB compliance; Sentry already handles runtime errors |
| Capture strategy | App layer primary + selective triggers | All-trigger approach | Triggers cannot capture SELECT events, semantic intent, or partial failures after DB write |
| Auth for log writes | Edge Function with Clerk JWT validation | Direct client insert | Direct client insert allows actor_id spoofing; Edge Function maintains audit integrity |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-csv` / `papaparse` | 30-80KB for functionality covered by 15 lines of native code | Browser `Blob` + `URL.createObjectURL` |
| `@tanstack/react-table` | No prior usage; overkill for read-only admin list | shadcn `<table>` + Tailwind (matches existing admin pages) |
| `pg_partman` | Managed availability risk; complexity not justified at current scale | `pg_cron` DELETE job with proper indexing |
| External log services (Datadog, Axiom, LogTail) | Extra cost; PostgreSQL is queryable; Sentry already captures runtime errors | `audit_logs` table in Supabase |
| `pgaudit` extension | Statement-level DBA logging, not semantic application audit trails | App-layer semantic logging with typed action strings |
| Direct client-side `audit_logs` INSERT | Actor context can be spoofed by a rogue client | Edge Function with Clerk JWT validation |

---

## Version Compatibility

| Package | Current Version | Audit Logging Usage | Notes |
|---------|----------------|---------------------|-------|
| `@supabase/supabase-js` | ^2.98.0 | All reads/writes | No changes needed |
| `@clerk/react` | ^6.0.1 | `useUser()` for actor_id + email | Already used in admin module |
| `zod` | ^4.3.6 | AuditLog schema validation | No upgrade needed |
| `react-router-dom` | ^6.27.0 | URLSearchParams for filter state | No changes needed |
| pg_cron (Supabase extension) | 1.6.4 | Retention cron job | Enable via SQL, no npm package |

---

## Sources

- [Supabase Auth Audit Logs (official docs)](https://supabase.com/docs/guides/auth/audit-logs) — Confirmed native Supabase audit is auth-only; application events require a custom table. HIGH confidence.
- [Supabase pg_cron extension (official docs)](https://supabase.com/docs/guides/database/extensions/pg_cron) — pg_cron v1.6.4 available and documented on Supabase managed. HIGH confidence.
- [Supabase pg_partman migration guide (official docs)](https://supabase.com/docs/guides/database/migrating-to-pg-partman) — pg_partman is documented but community reports of availability issues on managed platform. MEDIUM confidence on managed availability.
- [PostgreSQL Audit Logging Guide — Bytebase](https://www.bytebase.com/blog/postgres-audit-logging/) — Comparative analysis of trigger vs app-layer vs pgaudit approaches; JSONB schema recommendations. MEDIUM confidence.
- [Performance differences: normal vs generic audit triggers — CYBERTEC](https://www.cybertec-postgresql.com/en/performance-differences-between-normal-and-generic-audit-triggers/) — Triggers add meaningful overhead on write-heavy tables; selective auditing is the recommended approach. MEDIUM confidence.
- [Auto-archiving and Data Retention with pg_partman — Crunchy Data](https://www.crunchydata.com/blog/auto-archiving-and-data-retention-management-in-postgres-with-pg_partman) — pg_cron DELETE vs partition drop tradeoffs at scale. MEDIUM confidence.
- [TanStack Table pagination guide (official docs)](https://tanstack.com/table/latest/docs/guide/pagination) — Confirmed server-side pagination capability; overkill for read-only admin list. HIGH confidence.
- Project `package.json` — all installed packages confirmed (HIGH — direct read).

---

*Stack research for: v11.0 Audit Logging — Nexo multi-tenant platform*
*Researched: 2026-03-19*
