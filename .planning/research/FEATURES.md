# Feature Research

**Domain:** Enterprise audit logging for multi-tenant SaaS admin panel
**Researched:** 2026-03-19
**Confidence:** HIGH (schema design, event taxonomy, UI patterns verified across multiple sources) / MEDIUM (compliance specifics for LGPD)

---

## Context: What Already Exists vs What Is New

This research is scoped to v11.0 additions. The platform already has:

### Already built (not in scope)
- `created_at` / `updated_at` timestamps on all tables
- `created_by` / `updated_by` on tasks, briefing_configs, blueprint_configs
- `archived_at` soft-delete on 10 tables with RLS exclusion
- Activity feed showing recent task updates (cross-module, home page)
- Tenant archive/restore with Clerk metadata sync
- Super admin panel: dashboard, tenant management, user management
- ImpersonationContext tracking who is impersonating which org
- JWT `super_admin` claim driving access control

### What v11.0 adds
- Dedicated `audit_logs` table with enterprise-grade schema
- Automatic capture of critical operations (triggers and application layer)
- Admin panel page with filters, search, timeline view, and export
- Per-tenant scoped logs + super admin global view
- Retention policy enforcement and export (CSV/JSON)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any admin reviewing audit logs expects. Missing these makes the audit system feel incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Dedicated `audit_logs` table with standard schema | Foundation for everything else; without a dedicated table, logs are derived from `updated_at` diffs which are insufficient | MEDIUM | Schema: `id`, `org_id`, `actor_id`, `actor_email`, `actor_type` (human/system), `action`, `resource_type`, `resource_id`, `resource_label`, `ip_address`, `user_agent`, `metadata` (JSONB), `created_at`. See Architecture section. |
| Capture CRUD operations on critical tables | Super admins need to know what changed, when, and by whom across tenants, tasks, users, modules | MEDIUM | Application layer (service functions) logs on: tenant create/update/archive/restore, user add/remove/role-change, module enable/disable, platform settings change. Supabase triggers for task/briefing/blueprint mutations. |
| Capture auth events | Login/logout events are mandatory for any SOC2-adjacent compliance claim and for security investigation | LOW | Clerk webhook or frontend capture on sign-in/sign-out. Fields: actor_id, ip_address, user_agent, action (`auth.sign_in` / `auth.sign_out`). |
| Capture admin actions | Super admin operations (impersonation start/stop, org archival, member management) are the highest-risk actions and must be logged | LOW-MEDIUM | Captured at application layer in admin-service.ts and admin edge functions. Impersonation events must tag `impersonator_id` separately. |
| Paginated log table in admin panel | Audit logs can be thousands of rows; infinite scroll or paginated table with server-side filtering is non-negotiable | MEDIUM | Table columns: timestamp, actor, action, resource, org, IP. Click row to open detail drawer. |
| Filter by date range | Every audit system in production provides date range filtering; without it, logs are unsearchable | LOW | Standard shadcn DateRangePicker component. Server-side filter on `created_at`. |
| Filter by action type | "Show me all DELETE operations" is the most common audit investigation query | LOW | Multi-select filter: CREATE, UPDATE, DELETE, ARCHIVE, RESTORE, AUTH, ADMIN. Drives `action` column filter. |
| Filter by actor (user) | "What did user X do?" is the second most common query | LOW | Searchable actor dropdown filtered by actor_email. |
| Filter by resource type | "Show me all tenant-related events" narrows investigation scope | LOW | Multi-select: tenant, user, task, blueprint, document, module, platform_settings. |
| Log detail drawer with full metadata | Clicking a row must show the full event payload: before/after diff, IP, user-agent, request context | MEDIUM | Right-side Sheet (shadcn) showing all fields. Before/after diff from `metadata.before` and `metadata.after` JSONB. Formatted diff view, not raw JSON. |
| Immutability: no UPDATE or DELETE on audit_logs | Audit logs lose all compliance value if they can be modified; this is a hard requirement | LOW | RLS policy: DENY UPDATE and DELETE on `audit_logs` for all roles. Only INSERT allowed via service role. Application role never has UPDATE/DELETE on this table. |
| Export to CSV | Every compliance review requires exporting a date range of logs; CSV is the universal format | MEDIUM | Export applies current filters. For large ranges (>5000 rows), background job with download link. For small ranges, immediate download. |

### Differentiators (Competitive Advantage)

Features that elevate the audit system from "checkbox" to genuinely useful for the Nexo operator team.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Before/after value diff for UPDATE operations | Shows exactly what field changed from what to what — turns "something was updated" into actionable investigation evidence | HIGH | Requires capturing `metadata.before` and `metadata.after` as JSONB snapshots for UPDATE events. Postgres trigger captures `OLD` and `NEW` row. Application layer captures only relevant fields (not entire row dump). Detail drawer renders side-by-side diff with field names and values. |
| Impersonation context tagging | When a super admin impersonates a tenant and performs actions, both the original actor and impersonated org must be logged — critical for accountability in multi-tenant platforms | MEDIUM | `metadata.impersonator_id` and `metadata.impersonated_org_id` fields. All logs emitted during an active impersonation session carry this context. ImpersonationContext already exists in React — service calls must thread this through. |
| Per-tenant filtered view | Tenant admins (not just super admins) need to see logs scoped to their org — enterprise customers require this for their own compliance documentation | MEDIUM | Two views: `/admin/audit-logs` (global, super admin only, all orgs) and `/audit-logs` (per-tenant, future — show org_id = current org only). For v11.0, focus on super admin global view with org filter. |
| Org filter on global view | Super admin investigation often starts with "show me everything that happened to Tenant X" | LOW | Tenant combobox filter on `/admin/audit-logs`. Drives `org_id` server filter. Reuses existing tenant list from admin-tenants edge function. |
| Configurable retention policy | Platform settings allow super admin to set log retention (e.g., 90 days, 1 year). Older logs auto-archived or purged by a scheduled job. | MEDIUM | `platform_settings` table already exists. Add `audit_log_retention_days` setting. Supabase pg_cron job to delete/archive rows older than retention period. UI: retention selector in Platform Settings page. |
| Resource quick-link | In the detail drawer, resource_id links directly to the affected entity (e.g., clicking a task ID opens that task) | LOW | Requires a route map from `resource_type` to URL pattern. Simple lookup: `task → /tarefas/:id`, `tenant → /admin/tenants/:id`. |
| Actor quick-link | In the detail drawer, actor_id links to the user's profile in the admin user management page | LOW | Link to `/admin/users?user=actor_id`. |
| JSON export for programmatic analysis | Alongside CSV, JSON export allows the operator team to process logs programmatically or ingest into external tools (Sentry, Datadog) | LOW | Same export mechanism as CSV, different serialization. Toggle in export dialog. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Capturing ALL database reads (SELECT logging) | "Full audit trail, nothing escapes" | Volume explosion — read events on a busy platform can be 100x write events, making logs unsearchable and storage costs prohibitive. Audit logs lose signal:noise ratio. | Capture reads only for sensitive operations: data export downloads, impersonation initiation, and admin-level LIST queries (e.g., super admin listing all tenants). |
| Real-time streaming log view (live tail) | "See events as they happen" in an auto-scrolling terminal | Adds WebSocket complexity, has no compliance value (logs are reviewed after the fact), and creates visual noise. No enterprise audit tool does live tailing for compliance logs. | Refresh button + auto-refresh toggle (every 30s). Covers investigation use case without infra complexity. |
| Per-field row-level diff for all tables | "Show me every single field change" | Storing full row snapshots for all tables doubles database write load and creates JSONB blobs that are unwieldy to display and query. For most tables, the change metadata is sufficient context. | Selective diff: only capture before/after on high-value entities (tenant config, platform settings, blueprint). For lower-value entities (tasks), capture only the changed fields by name, not full row snapshots. |
| Storing raw HTTP request bodies in audit logs | "Full forensic trace" | Contains PII, secrets, and potentially large payloads. Violates data minimization principles under LGPD/GDPR. Creates compliance liability rather than reducing it. | Store sanitized summaries: action type, resource ID, key changed fields. Never log passwords, tokens, or API keys — always redact before storing. |
| Blocking application operations to wait for audit log write | "Guaranteed synchronous audit trail" | Makes every DB operation slower and can cause cascading failures if the audit table is temporarily unavailable. | Audit log writes are best-effort in the same transaction for critical operations. For high-throughput operations, use an async queue (Supabase `pg_net` or background job). The audit system should never take down the core platform. |
| Mutable audit logs (allowing corrections) | "We need to fix a wrong entry" | Destroys the integrity guarantee that makes audit logs valuable. SOC2 reviewers specifically check for tamper protection. | Append-only correction: write a new event of type `audit.correction` that references the original event ID and describes what was wrong. The original entry is preserved. |
| User-facing audit log in every module page | "Transparency for end users" | Premature. Multi-audience audit logs (admin + user) require different filtering, scoping, and UI surfaces. Building it everywhere at once creates scope explosion. | Phase 1: super admin global audit page. Phase 2: tenant admin scoped audit page. Phase 3: per-resource audit history inline. Ship these as sequential milestones. |

---

## Feature Dependencies

```
[audit_logs table + schema]
    └──required by──> ALL other features
                         (nothing works without the table)

[Application-layer logging in service functions]
    └──required for──> [Admin action events]
    └──required for──> [Auth events]
    └──required for──> [Impersonation context tagging]
    └──requires──> [audit_logs table]

[Postgres trigger-based logging]
    └──required for──> [Before/after diff on task/blueprint mutations]
    └──requires──> [audit_logs table]
    └──enhances──> [Application-layer logging]
                       (triggers catch mutations that bypass service layer)

[Admin panel audit log page]
    └──requires──> [audit_logs table with data]
    └──requires──> [Super admin RLS policy on audit_logs (read own org)]

[Filter by date range / actor / action / resource]
    └──requires──> [Admin panel audit log page]
    └──requires──> [Index on audit_logs(created_at, org_id, actor_id, action)]

[Log detail drawer with before/after diff]
    └──requires──> [Admin panel audit log page]
    └──requires──> [metadata.before + metadata.after populated by triggers/services]

[Export to CSV/JSON]
    └──requires──> [Admin panel audit log page (filtered state)]
    └──enhances──> [Filter by date range / actor / action] (filters apply to export)

[Retention policy enforcement]
    └──requires──> [audit_logs table]
    └──requires──> [platform_settings audit_log_retention_days setting]
    └──requires──> [Supabase pg_cron or scheduled Postgres function]

[Impersonation context tagging]
    └──requires──> [Application-layer logging]
    └──enhances──> [ImpersonationContext] (already exists in platform/)
                       (threads impersonator_id through to all log writes during session)

[Per-tenant view]
    └──requires──> [admin panel audit log page working]
    └──requires──> [org_id column on audit_logs with RLS]
    └──enhances──> [Org filter on global view]
```

### Dependency Notes

- **The table schema is the critical foundation:** Every other feature depends on the `audit_logs` schema being correct from day 1. Changing the schema after data exists requires migrations. Design it enterprise-grade upfront.
- **Application-layer logging before trigger-based logging:** Triggers catch all mutations but produce lower-quality metadata (no IP, no user agent, no impersonation context). Start with application-layer for admin actions (richer context), then add triggers for completeness on high-value tables.
- **Indexes must be created with the table:** `CREATE INDEX CONCURRENTLY` after the fact on a large audit table is expensive. Create indexes for `created_at`, `org_id`, `actor_id`, `action`, and `resource_type` in the same migration as the table.
- **Immutability via RLS must be set before any data exists:** Once you have logs, you cannot retroactively claim they were immutable. The DENY UPDATE/DELETE policies must be in the initial migration.
- **Before/after diff requires trigger capture, not application-layer:** Application code does not always have access to the "before" state without an extra SELECT. Postgres triggers get `OLD` and `NEW` automatically with zero extra queries.

---

## MVP Definition

### Launch With (v11.0 core)

Minimum viable audit system — sufficient for operational investigation and SOC2 readiness.

- [ ] `audit_logs` table with enterprise-grade schema (id, org_id, actor_id, actor_email, actor_type, action, resource_type, resource_id, resource_label, ip_address, user_agent, metadata JSONB, created_at) — immutable via RLS
- [ ] Indexes: created_at (BRIN), org_id (BTREE), actor_id (BTREE), action (BTREE), resource_type (BTREE)
- [ ] Application-layer logging for: tenant create/update/archive/restore, user add/remove/role-change, module enable/disable, platform settings change, impersonation start/stop, auth sign-in/sign-out
- [ ] Postgres trigger on `tasks` table: capture INSERT/UPDATE/DELETE with before/after JSONB
- [ ] Admin panel `/admin/audit-logs` page: paginated table (timestamp, actor, action, resource, org, IP)
- [ ] Filters: date range, action type (multi-select), actor (searchable dropdown), resource type
- [ ] Log detail right-side Sheet: all fields displayed, before/after diff for UPDATE events
- [ ] Export to CSV (current filters applied, immediate download for <1000 rows)

### Add After Core Is Working (v11.x)

- [ ] Org filter on global admin view (tenant combobox)
- [ ] JSON export format option alongside CSV
- [ ] Retention policy setting in Platform Settings page + pg_cron enforcement job
- [ ] Postgres triggers on `blueprint_configs`, `briefing_configs` for before/after diff
- [ ] Resource quick-link from detail drawer to affected entity
- [ ] Background export job for large date ranges (>5000 rows) with download link

### Future Consideration (v12+)

- [ ] Per-tenant audit log view scoped to org (for tenant admins, not just super admin)
- [ ] Anomaly detection alerts (actor performing unusual volume of DELETEs)
- [ ] Inline audit history within entity pages (e.g., show last 5 changes to a task in the task detail)
- [ ] External log shipping to Sentry / Datadog / Papertrail
- [ ] Hash chaining for tamper-evident log chain (SOX-grade integrity proof)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| audit_logs table + schema + immutability RLS | HIGH — foundation of everything | LOW (single migration) | P1 |
| Indexes on audit_logs | HIGH — without indexes, queries on 100k+ rows take seconds | LOW (same migration as table) | P1 |
| Application-layer logging for admin actions | HIGH — admin operations are highest-risk events | MEDIUM (thread through 6-8 service functions + edge functions) | P1 |
| Admin panel audit log page (paginated table) | HIGH — no value without a UI to view logs | MEDIUM (new page, server-side query, pagination) | P1 |
| Date range + action type filters | HIGH — logs are unusable without filtering | LOW (UI components + query params) | P1 |
| Log detail drawer | HIGH — row in table is not enough context | MEDIUM (Sheet with metadata rendering + diff view) | P1 |
| Export to CSV | MEDIUM — needed for compliance reviews | MEDIUM (filtered query → CSV serialization) | P1 |
| Auth event capture | MEDIUM — sign-in/sign-out events complete the picture | LOW (Clerk webhook or frontend capture) | P2 |
| Impersonation context tagging | MEDIUM — critical for accountability, ImpersonationContext already exists | LOW (thread impersonator_id through existing context) | P2 |
| Actor + resource type filters | MEDIUM — second-tier investigation queries | LOW (additional filter UI components) | P2 |
| Postgres triggers for task mutations | MEDIUM — catches mutations that bypass service layer | MEDIUM (trigger function + connection to audit_logs) | P2 |
| Org filter on global admin view | LOW (v11 only has one real tenant) — HIGH (as platform grows) | LOW (combobox + query param) | P2 |
| Retention policy + pg_cron job | MEDIUM — needed before log table grows large | MEDIUM (platform_settings key + scheduled function) | P3 |
| JSON export | LOW — CSV sufficient for most cases | LOW (serialize differently) | P3 |
| Resource quick-link | LOW — nice UX touch | LOW (route map lookup) | P3 |

**Priority key:**
- P1: Must have for v11.0 — milestone is incomplete without these
- P2: Should have — adds meaningful audit coverage
- P3: Nice to have — defer to v11.x if time-constrained

---

## Real-World Reference Patterns

### What enterprise platforms capture

**Stripe** — Logs sensitive account actions (login from unknown IP, bank account changes, API key creation/deletion). Provides request log retention. Dashboard UI: table with timestamp, event type, IP, and status. No before/after diff shown — focus on event-level actions.

**Adobe Experience Platform** — Full filter set: category, action, user, status, date (90-day lookback). Export: CSV or JSON, max 10,000 records per export. 365-day retention. Read-only UI — no mutation allowed.

**Clerk (auth platform)** — Audit logs are planned (not yet shipped as of 2026). Current: organization activity report per org. WorkOS (competitor) ships full audit log API as a product feature for B2B SaaS.

**ABP Framework** — Most complete open-source reference: three-tab detail view (Overall → Actions → Changes), property-level change tracking with old/new values, HTTP method + status code + execution time per request, advanced filtering by user/date/URL/status/HTTP method.

**Microsoft 365 Audit** — 90-day standard, 1-year premium retention. Up to 50,000–100,000 records per CSV export. Column customization. Five filter controls. Separate `core events` and `enhanced events` (success/failure outcomes).

**HighLevel** — Recent UI redesign (2024): right-side drawer replacing full-page detail view. Keyboard navigation between log entries with drawer open (←/→ arrows). Prioritizes keeping table context visible while reading details.

### UI pattern consensus

1. **Table as primary surface** — timestamp, actor, action, resource, status. Sortable by timestamp desc by default.
2. **Filter bar above table** — date range (always), action type (multi-select), actor (searchable), resource type (multi-select). Filters compose (AND logic).
3. **Right-side detail drawer** — opens on row click. Shows full metadata, before/after diff for updates, IP, user agent, impersonation context if applicable. Drawer keeps table visible (overlay pattern, not inline).
4. **Export applies current filters** — "Export what I'm looking at" is the mental model. Not "export all logs."
5. **Immutable display** — no edit buttons anywhere on audit log UI. Read-only is a visible guarantee.

---

## Compliance Considerations

### SOC2 Type II (relevant for enterprise customer requirements)

- Requires evidence of access control monitoring (who accessed what, when)
- Requires log integrity (tamper-proof — immutability via RLS satisfies this)
- Requires defined retention policy (12 months minimum recommended)
- Requires logs cover authentication events, data modifications, and admin actions
- Does not specify exact schema — the structure designed for v11.0 satisfies all criteria

### LGPD (Brazil — Lei Geral de Proteção de Dados)

- Article 6, X requires organizations to demonstrate effective data protection measures
- Requires records of data processing activities (who processed what personal data, when, under which legal basis)
- Data subject requests must be fulfilled within 15 days — audit logs help trace what data was accessed/modified
- Breach notification within 72 hours — audit logs are the evidence trail for ANPD reporting
- Data minimization principle: do NOT store raw request bodies or PII beyond what audit requires
- The `actor_email` field in audit_logs is itself personal data under LGPD — include it in the org's data retention policy

### Practical for v11.0

- Immutability (RLS DENY UPDATE/DELETE) — satisfies tamper-proof requirement
- 90-day hot retention as default, configurable up to 1 year — covers SOC2 and LGPD adequately
- Never log passwords, tokens, API keys — redact before storing metadata
- `actor_email` stored but covered by the same data retention policy as user accounts

---

## Schema Design Reference

The canonical schema for `audit_logs`, validated against Supabase/Postgres best practices:

```sql
CREATE TABLE audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid REFERENCES organizations(id) ON DELETE SET NULL,
  actor_id     text NOT NULL,         -- Clerk user ID or 'system'
  actor_email  text,                  -- denormalized for query convenience
  actor_type   text NOT NULL,         -- 'user' | 'system' | 'super_admin'
  action       text NOT NULL,         -- 'tenant.create' | 'task.delete' | 'auth.sign_in' etc.
  resource_type text,                 -- 'tenant' | 'task' | 'user' | 'blueprint' etc.
  resource_id  text,                  -- UUID or slug of affected resource
  resource_label text,               -- human-readable name of affected resource
  ip_address   inet,
  user_agent   text,
  metadata     jsonb DEFAULT '{}',   -- before, after, impersonator_id, etc.
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Immutability enforcement
CREATE POLICY "audit_logs: no updates"  ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs: no deletes"  ON audit_logs FOR DELETE USING (false);
CREATE POLICY "audit_logs: super admin read all" ON audit_logs FOR SELECT USING (is_super_admin());
CREATE POLICY "audit_logs: tenant read own" ON audit_logs FOR SELECT USING (org_id = current_org_id());

-- Performance indexes
CREATE INDEX audit_logs_created_at_idx ON audit_logs USING BRIN (created_at);
CREATE INDEX audit_logs_org_id_idx     ON audit_logs (org_id);
CREATE INDEX audit_logs_actor_id_idx   ON audit_logs (actor_id);
CREATE INDEX audit_logs_action_idx     ON audit_logs (action);
CREATE INDEX audit_logs_resource_type_idx ON audit_logs (resource_type);
```

`metadata` JSONB structure for UPDATE events:
```json
{
  "before": { "status": "active", "name": "Acme Corp" },
  "after":  { "status": "archived", "name": "Acme Corp" },
  "changed_fields": ["status"],
  "impersonator_id": "user_2abc...",
  "impersonated_org_id": "org_xyz..."
}
```

---

## Sources

- [Guide to Building Audit Logs for Application Software — Infisical / Medium](https://medium.com/@tony.infisical/guide-to-building-audit-logs-for-application-software-b0083bb58604)
- [Comprehensive Research: Audit Log Paradigms & Go/PostgreSQL/GORM Design Patterns — DEV](https://dev.to/akkaraponph/comprehensive-research-audit-log-paradigms-gopostgresqlgorm-design-patterns-1jmm)
- [Postgres Auditing in 150 lines of SQL — Supabase Blog](https://supabase.com/blog/postgres-audit)
- [PGAudit: Postgres Auditing — Supabase Docs](https://supabase.com/docs/guides/database/extensions/pgaudit)
- [Audit Logs Overview — Adobe Experience Platform](https://experienceleague.adobe.com/en/docs/experience-platform/landing/governance-privacy-security/audit-logs/overview)
- [Audit Logging UI — ABP.IO](https://abp.io/modules/Volo.AuditLogging.Ui)
- [Audit Logs for SaaS Enterprise Customers — Frontegg](https://frontegg.com/blog/audit-logs-for-saas-enterprise-customers)
- [Best practices for audit logging in a SaaS business — Chris Dermody](https://chrisdermody.com/best-practices-for-audit-logging-in-a-saas-business-app/)
- [SOC 2 Data Security and Retention Requirements — Bytebase](https://www.bytebase.com/blog/soc2-data-security-and-retention-requirements/)
- [LGPD Compliance: Practical Guide — SecurePrivacy](https://secureprivacy.ai/blog/lgpd-compliance-requirements)
- [Audit Logs: Introducing the New Design Experience — HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000006667-audit-logs-introducing-the-new-design-experience)
- [Exporting Events — Audit Logs — WorkOS Docs](https://workos.com/docs/audit-logs/exporting-events)
- [Security log retention: Best practices — Optro AI](https://optro.ai/blog/security-log-retention-best-practices-guide)
- [Immutable Audit Trails: A Complete Guide — HubiFi](https://www.hubifi.com/blog/immutable-audit-log-basics)
- .planning/PROJECT.md — existing platform capabilities, v11.0 milestone scope

---

*Feature research for: v11.0 Enterprise Audit Logging — Nexo multi-tenant platform*
*Researched: 2026-03-19*
