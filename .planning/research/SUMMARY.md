# Project Research Summary

**Project:** Nexo v11.0 — Enterprise Audit Logging
**Domain:** Append-only audit trail system for multi-tenant React + Supabase SaaS platform
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

v11.0 adds an enterprise-grade audit logging system to the Nexo platform. The research is unusually high confidence because the entire implementation stays within the existing stack — zero new npm dependencies — and the architecture is derived directly from the codebase's established service layer patterns. The recommended approach is a hybrid capture strategy: PostgreSQL triggers on critical tables (`tenants`, `tenant_modules`) for bypass-proof data mutation capture, plus explicit `logAuditEvent()` calls in existing Edge Functions for Clerk-only admin operations (archive tenant, impersonate, invite user) that leave no database footprint. Both paths write to a new append-only `audit_logs` table in migration 025.

The primary risk is not technical complexity — it is copying the wrong RLS pattern. Nexo's existing tables use an anon-permissive RLS pattern acceptable for operational data. Audit logs require the opposite: no INSERT or DELETE for any client role, SELECT only for super admin (authenticated, super_admin JWT claim), and writes exclusively through SECURITY DEFINER triggers and service-role Edge Functions. A secondary risk is PII in the `metadata` JSONB column — storing full row before/after snapshots would capture emails and personal data regulated under LGPD, conflicting with audit immutability. The mitigation is an explicit metadata allowlist per action type, defined before any capture code is written.

The feature scope is clearly bounded: the v11.0 core delivers the schema, capture layer, and admin panel UI (`/admin/audit-logs`). Per-tenant views, anomaly detection, and external log shipping are explicitly deferred to v12+. The build order is fixed by a single critical dependency chain: the `audit_logs` table must exist before everything else; then the capture layer (triggers and `logAuditEvent()`); then the Edge Function read path; then the admin UI. Phases 2 and 3 in the capture layer are independent after Phase 1 and can be parallelized.

---

## Key Findings

### Recommended Stack

All v11.0 requirements are met by the existing stack. The decision to add zero new npm packages is firm and backed by specific analysis: CSV export is 15 lines of native `Blob` API; filter UI reuses installed shadcn/ui `Select` and `Input` components; table rendering follows the existing admin page pattern (`/admin/tenants`, `/admin/users`) without TanStack Table; retention uses `pg_cron` (Supabase-native, version 1.6.4, officially documented). The only new moving part is enabling `pg_cron` via a SQL `CREATE EXTENSION IF NOT EXISTS pg_cron` statement.

**Core technologies:**
- `@supabase/supabase-js` ^2.98.0: audit_logs insert/query, RLS enforcement — already installed
- `@clerk/react` ^6.0.1: actor context (user_id, email, org_id) for every log entry — already installed
- `zod` ^4.3.6: AuditLog schema validation at service boundaries — already installed
- PostgreSQL triggers (SECURITY DEFINER): bypass-proof row-level mutation capture — Supabase-native, no npm install
- `pg_cron` 1.6.4: daily retention deletion job — Supabase-native, enable via SQL only
- `react-router-dom` ^6.27.0: URLSearchParams for shareable filter state — already installed
- shadcn/ui (`Select`, `Input`, `Popover`, `Sheet`): filter UI and detail drawer — all installed

**Critical version constraint:** pg_partman (alternative to pg_cron for retention) has MEDIUM confidence on managed Supabase availability — do not use. Use pg_cron DELETE with proper indexes at current scale (< 1M rows/year).

### Expected Features

**Must have (table stakes — P1, v11.0 core):**
- `audit_logs` table with enterprise schema: `id`, `occurred_at`, `org_id`, `actor_id`, `actor_email`, `action`, `resource_type`, `resource_id`, `metadata JSONB`, `ip_address`, `user_agent`, `severity`, `outcome` — immutable via RLS (DENY UPDATE/DELETE for all client roles)
- Composite indexes in same migration: `(org_id, occurred_at DESC)`, `(actor_id, occurred_at DESC)`, `(resource_type, resource_id)`, GIN on `metadata`
- Application-layer logging for: tenant create/update/archive/restore, user add/remove/role-change, module enable/disable, platform settings change, impersonation start/stop, auth sign-in/sign-out
- DB triggers on `tasks` and `tenant_modules` for INSERT/UPDATE/DELETE with before/after JSONB via `OLD`/`NEW`
- Admin panel `/admin/audit-logs`: paginated timeline (timestamp, actor, action, resource, org, IP)
- Filters: date range, action type (multi-select), actor (searchable), resource type
- Log detail right-side Sheet (shadcn): all fields, before/after diff for UPDATE events
- Export to CSV with current filters applied (immediate for <1000 rows)

**Should have (P2, v11.x):**
- Org filter combobox on global admin view
- JSON export alongside CSV
- Retention policy setting in Platform Settings + pg_cron enforcement job
- DB triggers on `blueprint_configs` and `briefing_configs`
- Resource and actor quick-links from detail drawer

**Defer (v12+):**
- Per-tenant audit log view for org operators (not just super admin)
- Anomaly detection / alert rules
- Inline audit history per entity page
- External log shipping (Sentry/Datadog/Papertrail)
- Hash chaining for tamper-evident chain (SOX-grade)

**Anti-features — explicitly do not build:**
- SELECT-level logging (volume explosion, signal:noise collapse)
- Real-time live-tail view (no compliance value, adds WebSocket complexity)
- Full row snapshots for all table mutations (PII risk, storage bloat)
- Mutable audit logs with correction mechanism (destroys integrity guarantee)
- Audit writes from React components or hooks (re-render side effects, actor context unavailable in browser)

### Architecture Approach

The architecture adds three new modules to the existing platform, all following established codebase patterns. A new `audit-service.ts` in `src/platform/services/` provides the write path (`logAuditEvent()`) and read path (`queryAuditLogs()`), matching the structure of `tenant-service.ts` and `admin-service.ts`. A new `audit-logs` Edge Function handles paginated queries with the service-role client — consistent with the principle that all admin data reads go through Edge Functions. A new migration (025) creates the `audit_logs` table, DB triggers, RLS policies, and indexes in one atomic deploy. The React SPA cannot write to or read `audit_logs` directly — by design.

**Major components:**
1. `supabase/migrations/025_audit_logs.sql` — table + triggers + RLS + indexes; the non-negotiable foundation; everything else depends on this
2. `src/platform/services/audit-service.ts` — `logAuditEvent()` (write, never throws) + `queryAuditLogs()` (read, proxied through Edge Function)
3. `src/platform/types/audit.ts` — `AuditLogEntry`, `AuditEventInput`, `AuditMetadata` discriminated union; shared by service and edge function
4. `supabase/functions/audit-logs/index.ts` — paginated query endpoint; validates super_admin JWT; uses service-role client
5. `src/platform/pages/admin/AuditLogsPage.tsx` — timeline, filter bar, detail Sheet, CSV export; reads via `queryAuditLogs()`
6. Modified: `admin-tenants` and `admin-users` edge functions — add `logAuditEvent()` calls for Clerk-only admin operations
7. Modified: `AdminSidebar.tsx` + `AppRouter.tsx` — add nav item (ShieldCheck icon) and lazy route for `/admin/audit-logs`

### Critical Pitfalls

1. **Anon-permissive RLS copied from existing tables** — audit_logs must explicitly `REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon` and grant SELECT only to authenticated with super_admin JWT claim. Add a migration comment marking the intentional deviation from the standard Nexo RLS pattern.

2. **PII in metadata JSONB** — define a metadata allowlist per action type before writing any capture code. Never store full row objects, `actor_email`, or user-supplied free-text. Store `actor_id` (opaque UUID); resolve display name from Clerk at render time. LGPD deletion requests against immutable audit logs are a structural conflict if PII was stored in metadata.

3. **Missing indexes at table creation** — all composite indexes must be in migration 025 alongside the `CREATE TABLE`. Adding indexes to a large live table later requires `CREATE INDEX CONCURRENTLY` with window risk. The `(org_id, occurred_at DESC)` index is the primary query pattern and is non-negotiable.

4. **Edge function using wrong Supabase client key** — Edge Functions must use `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase runtime), not `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend env var, unavailable in Deno). The `org_id` in audit inserts must come from the server-verified JWT claim, never from the client request body.

5. **Circular logging** — the `audit_logs` table must be explicitly excluded from any catch-all trigger or service wrapper. `logAuditEvent()` must be a leaf node (writes only, never triggers further writes). The admin log page read path must have zero audit side effects. Test: load admin log page, verify row count does not increase.

---

## Implications for Roadmap

The build order is strictly constrained by a single dependency chain. The architecture research provides an explicit 8-step sequence that consolidates into 5 execution-ready phases below.

### Phase 1: Schema Foundation
**Rationale:** Everything depends on the `audit_logs` table. No capture, query, or UI can be built without it. This phase is the unblock for all subsequent work and must ship first.
**Delivers:** Migration 025 — `audit_logs` table, all composite indexes (in the same migration, not deferred), RLS policies (SELECT super_admin only, no INSERT/UPDATE/DELETE for client roles), explicit REVOKE statements, `retained_until` column for future retention enforcement.
**Addresses:** Table stakes feature (schema with immutability), P1 index requirement.
**Avoids:** Anon-permissive RLS pitfall, missing indexes pitfall, tamper protection gap, storage growth risk.

### Phase 2: Capture Layer (parallel tracks after Phase 1)
**Rationale:** Phases 2a and 2b are independent after Phase 1 and can be built in parallel by separate agents. Both write to the audit_logs table. Getting data flowing before the UI is built maximizes historical data available at UI launch.
**Delivers (2a — DB Triggers):** `audit_log_mutation()` SECURITY DEFINER trigger function on `tasks` and `tenant_modules` — bypass-proof mutation capture with before/after JSONB from `OLD`/`NEW`.
**Delivers (2b — Write Service):** `src/platform/types/audit.ts` (TypeScript types with `AuditMetadata` discriminated union) + `logAuditEvent()` write function in `audit-service.ts` — application-layer capture that never throws, reports audit failures to Sentry without blocking the main operation.
**Addresses:** DB trigger coverage, application-layer foundation, impersonation context tagging support.
**Avoids:** Trigger-only gap (misses Clerk-only admin operations), PII in metadata (define allowlist before code), error path gap (audit call never blocks main operation), circular logging (exclude audit_logs from any wrapper).

### Phase 3: Instrument Existing Edge Functions
**Rationale:** With `logAuditEvent()` available from Phase 2b, existing Edge Functions are instrumented. This captures Clerk-only admin operations that have no DB trigger coverage — archive, restore, impersonate, user invite/remove. These are the highest-risk events the audit system must record.
**Delivers:** `logAuditEvent()` calls in `admin-tenants` and `admin-users` edge functions for all admin actions. Auth event capture (sign-in/sign-out). Impersonation context threading (`impersonator_id` in metadata for all log writes during an active session).
**Addresses:** P1 feature — admin action capture, impersonation context tagging.
**Avoids:** Edge function wrong key pitfall — enforce checklist: grep for `VITE_SUPABASE` in function source must return zero matches; `org_id` sourced from verified JWT only.

### Phase 4: Query Edge Function and Service Read Path
**Rationale:** The UI requires a read endpoint. This phase depends only on Phase 1 (table must exist) and can overlap with Phase 3. The `audit-logs` Edge Function provides paginated, filtered query capability. `queryAuditLogs()` wraps it with TypeScript types.
**Delivers:** `supabase/functions/audit-logs/index.ts` — paginated query (LIMIT/OFFSET, max 100 rows per request), filters (org_id, actor_id, action, date range, resource_type), returns `{ logs: AuditLogEntry[], totalCount: number }`. `queryAuditLogs()` in `audit-service.ts`.
**Uses:** Supabase service-role client (pattern from existing admin edge functions), URLSearchParams for shareable filter state.
**Avoids:** Direct client read of audit_logs anti-pattern, unbounded SELECT performance trap (enforce LIMIT), fat JSONB in list view (SELECT display columns only; fetch full metadata only on row expand).

### Phase 5: Admin UI
**Rationale:** The visible deliverable. All data dependencies are satisfied by Phases 1-4. The UI follows the established admin page pattern exactly — same `AdminLayout`, same `SuperAdminRoute` guard, same lazy import pattern as `TenantsPage.tsx` and `UsersPage.tsx`.
**Delivers:** `AuditLogsPage.tsx` — paginated timeline table, filter bar (date range + action type + actor + resource type), log detail right-side Sheet with before/after diff view, CSV export (native Blob API, filtered results). Wire into `AdminSidebar.tsx` (ShieldCheck icon) and `AppRouter.tsx` (lazy route `/admin/audit-logs`).
**Addresses:** All P1 features complete. Core v11.0 milestone achieved.
**Avoids:** UTC timestamp display pitfall — use `Intl.DateTimeFormat` with `America/Sao_Paulo`; raw action codes in UI — display human-readable descriptions; metadata collapsed with no expand — detail Sheet shows formatted diff.

### Phase Ordering Rationale

- Phase 1 is strictly first — all other phases depend on the table existing.
- Phases 2a (DB triggers) and 2b (write service) are independent after Phase 1 and should be assigned to parallel agents.
- Phase 3 (instrument edge functions) depends on Phase 2b — `logAuditEvent()` must exist before it can be called.
- Phase 4 (query edge function) depends only on Phase 1 and can overlap with Phases 2-3.
- Phase 5 (UI) depends on Phase 4 (`queryAuditLogs()` must be available).

This ordering maximizes historical data accumulation: data is flowing from Phase 2 onward, before the UI exists. The admin page in Phase 5 has real data to display from day one.

### Research Flags

**Phases with standard patterns — skip research-phase:**
- **Phase 1 (Schema):** Exact SQL is specified in STACK.md and ARCHITECTURE.md; HIGH confidence; no research needed.
- **Phase 2 (Capture Layer):** SECURITY DEFINER trigger pattern and service layer pattern are directly from codebase analysis; HIGH confidence.
- **Phase 3 (Instrument Edge Functions):** Follows established `admin-service.ts` and `admin-tenants` pattern exactly; no unknowns.
- **Phase 4 (Query Edge Function):** Same pattern as existing admin edge functions; no research needed.
- **Phase 5 (Admin UI):** Follows `TenantsPage.tsx`/`UsersPage.tsx` pattern; all shadcn components installed; no research needed.

**Phases that may need research-phase:**
- **Phase 6 / v11.x (Retention + pg_cron):** pg_cron basic usage is HIGH confidence, but configurable per-action-type retention (different windows for auth events vs. admin events) adds complexity not fully specified in research. If per-action-type retention is pursued, a targeted research-phase is warranted before implementation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies; all packages confirmed via direct `package.json` read; pg_cron v1.6.4 confirmed in official Supabase docs. Only caveat: pg_partman skip is MEDIUM confidence (community reports, not official) — irrelevant since pg_cron is the firm recommendation. |
| Features | HIGH | Schema design, event taxonomy, and UI patterns verified across 15+ sources including Adobe Experience Platform, ABP Framework, Stripe, Microsoft 365, HighLevel, WorkOS. SOC2 and LGPD compliance requirements cross-referenced with official frameworks. |
| Architecture | HIGH | Derived entirely from direct codebase analysis: `admin-service.ts`, `tenant-service.ts`, `admin-tenants` edge function, RLS migration patterns (migrations 001-024), `AppRouter.tsx` lazy route pattern. No inference — all findings from actual source files. |
| Pitfalls | HIGH | 10 concrete pitfalls with specific file-level detection checklists, warning signs, and recovery strategies. Cross-referenced with Nexo `PITFALLS.md` rules #2, #5, #9, #11 and direct migration analysis. |

**Overall confidence:** HIGH

### Gaps to Address

- **Metadata allowlist per action type:** Research identified the principle (no PII in metadata) and the risk (LGPD deletion vs. immutability), but the specific allowlist for each of the ~15 action types is not defined. This must be written as a design artifact before Phase 2 capture code is written. It is a design decision, not a research gap.

- **DB trigger metadata filtering per table:** DB triggers capture full `to_jsonb(OLD)` and `to_jsonb(NEW)` rows, which may include PII fields. The trigger implementation must filter or truncate the JSONB before inserting into `metadata`. The exact field inclusion list per instrumented table is not specified in research — it is a per-table design decision for the migration phase.

- **pg_cron per-action-type retention:** The 90-day default is validated. Whether to implement different retention windows per action type (e.g., auth events shorter, admin events longer) is an unresolved product decision. Default to a single configurable retention value for v11.0 and revisit in v11.x.

---

## Sources

### Primary (HIGH confidence)
- Project `package.json` — all installed packages confirmed via direct read
- `src/platform/services/admin-service.ts` — service layer pattern (direct codebase analysis)
- `src/platform/services/tenant-service.ts` — confirms pattern consistency (direct codebase analysis)
- `supabase/migrations/019_tenant_archival.sql` — RLS policy pattern (direct codebase analysis)
- `src/platform/router/AppRouter.tsx` — lazy admin route registration (direct codebase analysis)
- `src/platform/layout/AdminSidebar.tsx` — adminNavItems pattern (direct codebase analysis)
- `.planning/PROJECT.md` — existing platform capabilities, v11.0 milestone scope
- [Supabase pg_cron extension (official docs)](https://supabase.com/docs/guides/database/extensions/pg_cron) — v1.6.4 confirmed on managed
- [Supabase Auth Audit Logs (official docs)](https://supabase.com/docs/guides/auth/audit-logs) — native audit is auth-only; custom table required
- [Audit Logs Overview — Adobe Experience Platform](https://experienceleague.adobe.com/en/docs/experience-platform/landing/governance-privacy-security/audit-logs/overview) — filter and export pattern reference
- [Audit Logging UI — ABP.IO](https://abp.io/modules/Volo.AuditLogging.Ui) — most complete open-source reference for before/after diff UI

### Secondary (MEDIUM confidence)
- [PostgreSQL Audit Logging Guide — Bytebase](https://www.bytebase.com/blog/postgres-audit-logging/) — trigger vs. app-layer vs. pgaudit tradeoffs; JSONB schema recommendations
- [CYBERTEC: Performance of audit triggers](https://www.cybertec-postgresql.com/en/performance-differences-between-normal-and-generic-audit-triggers/) — trigger overhead on write-heavy tables
- [LGPD Compliance Guide — SecurePrivacy](https://secureprivacy.ai/blog/lgpd-compliance-requirements) — LGPD Art. 6/7 requirements for audit trails
- [SOC2 Data Security — Bytebase](https://www.bytebase.com/blog/soc2-data-security-and-retention-requirements/) — retention and tamper-proof requirements
- [Supabase RLS Best Practices — MakerKit](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — multi-tenant RLS patterns
- [Supabase pg_partman migration guide](https://supabase.com/docs/guides/database/migrating-to-pg-partman) — availability uncertainty on managed; confirms pg_cron choice
- Nexo `.planning/PITFALLS.md` rules #2, #5, #9, #11 — existing Supabase/edge function pitfalls specific to this codebase
- [Audit Logs: New Design Experience — HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000006667-audit-logs-introducing-the-new-design-experience) — right-side drawer UX pattern
- [Exporting Events — WorkOS Docs](https://workos.com/docs/audit-logs/exporting-events) — B2B SaaS export pattern reference

### Tertiary (LOW confidence — not used for decisions)
- Community reports of pg_partman availability issues on Supabase managed — confirms pg_cron choice; no action required beyond the recommendation already made

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
