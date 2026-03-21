# Pitfalls Research

**Domain:** Audit Logging — Adding to Existing Multi-Tenant Supabase System
**Researched:** 2026-03-19
**Confidence:** HIGH (system-specific pitfalls cross-referenced with Nexo migration history, Supabase official docs, and current community patterns)

---

## Critical Pitfalls

### Pitfall 1: Applying the Existing Anon-Permissive RLS Pattern to audit_logs

**What goes wrong:**
Nexo uses `FOR ALL TO anon, authenticated USING (org_id = ...)` on tenant-scoped tables (see migrations 008, 013). If audit_logs inherits this pattern, every tenant can read every other tenant's audit trail. The `anon` role means anyone with the public Supabase URL and anon key can query raw audit logs — no authentication required.

**Why it happens:**
Developers copy the RLS block from an existing table (tasks, comments) as a starting point. The existing pattern was an acceptable tradeoff for operational tables where anon access was deliberate. Audit data was never part of that tradeoff.

**How to avoid:**
- audit_logs must NOT grant SELECT to the `anon` role under any condition.
- SELECT policy: `USING (org_id = (auth.jwt() -> 'org_id')::text)` granted to `authenticated` only.
- Super admin bypass (existing JWT super_admin claim mechanism) is acceptable but must be explicit.
- INSERT should come exclusively from service-role context (triggers or edge functions) — never from anon or authenticated client roles directly.
- Add an explicit REVOKE statement in the migration: `REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon`.
- Add a migration comment: `-- audit_logs intentionally more restrictive than standard Nexo tables`.

**Warning signs:**
- Migration draft that copies a policy block from tasks or comments without removing `TO anon`.
- Any USING clause on SELECT that is `(true)` or does not reference org_id.
- Frontend service calling Supabase directly with the anon key to INSERT audit logs (instead of trigger or edge function).

**Phase to address:** Schema/Migration phase — catch at migration review before deploy.

---

### Pitfall 2: Logging PII in the metadata JSONB Column

**What goes wrong:**
The `metadata` JSONB field captures context about the operation. If it naively serializes the full before/after state of a record, it captures emails, names, phone numbers, and other LGPD-regulated personal data. Under LGPD, audit logs containing PII fall under the same data subject rights as the data itself: right to deletion, right to access, right to correction. A user exercising their deletion right requires purging or sanitizing audit rows — which directly conflicts with the immutability guarantee that makes audit logs trustworthy.

**Why it happens:**
The `metadata` field is convenient — pass the whole object and let Postgres store it. The PII problem is invisible until a LGPD request arrives months later.

**How to avoid:**
- Define an explicit allowlist of fields permitted in `metadata` for each action type. Example: for `TASK_UPDATED`, log `{ task_id, changed_fields: ['status'] }` — not `{ before: {...}, after: {...} }`.
- Never log user-supplied free-text fields (names, descriptions, notes, email addresses) in metadata.
- Store `actor_id` (opaque UUID) as the actor identifier. Never store `actor_email` in the audit row — resolve it at display time from Clerk.
- Log IP addresses only if required for compliance, with an explicit 90-day retention window and a documented LGPD legal basis (`art. 7°, IX` — legitimate interest for security).
- Write the metadata allowlist spec per action type before any capture code.

**Warning signs:**
- An audit INSERT that spreads a full Supabase row: `metadata: { ...taskRow }`.
- `actor_email` stored as a column or inside metadata.
- IP address in metadata without a documented retention period.

**Phase to address:** Schema design phase + capture design phase. The metadata allowlist must be written and reviewed before any capture implementation.

---

### Pitfall 3: Circular Logging — Logging the Act of Reading Logs

**What goes wrong:**
If the audit capture layer fires on ALL database operations (via an overly broad trigger, or an application-layer service wrapper that logs every Supabase call), querying the audit log itself generates new audit rows. Viewing 100 rows creates 100 new rows. The admin panel page load doubles the table size on every visit.

**Why it happens:**
A trigger defined too broadly (`FOR EACH STATEMENT` on all operations including SELECT, or on all tables), or an application-level `auditService` wrapper that intercepts every service call including reads from the audit table itself.

**How to avoid:**
- Triggers must fire only on `INSERT`, `UPDATE`, `DELETE` — PostgreSQL does not support AFTER SELECT triggers natively; any workaround using a wrapper function must explicitly exclude the `audit_logs` table.
- In the application layer: `auditService.log(...)` must be a leaf node — it only writes, never reads in a way that triggers further writes.
- The admin panel log viewer reads directly from Supabase with no audit side effect.
- If "admin viewed audit log" is ever desired as a meta-audit event, write it as an explicit deliberate call — not as a side effect of the read.
- Add the audit_logs table to an explicit exclusion list in any catch-all trigger or service wrapper.

**Warning signs:**
- Audit log row count doubling after admin panel page load.
- An `auditService` wrapper that intercepts all Supabase client calls (including `from('audit_logs').select(...)`).
- A trigger defined as `FOR EACH ROW ON audit_logs AFTER INSERT` that calls back into audit_logs.

**Phase to address:** Trigger definition phase and service layer design — exclude audit_logs from any catch-all wrapper before writing a single capture line.

---

### Pitfall 4: Missing Events on Error Paths

**What goes wrong:**
An operation fails mid-way (e.g., task update saves to Supabase but the audit insert fails with a network error), or the audit log call is placed only on the success path. The operation happened but leaves no audit trail. Conversely, if the audit INSERT is inside the same Supabase transaction as the operation, and the operation is rolled back, the audit row rolls back too — the attempted-but-failed operation vanishes from the record entirely.

**Why it happens:**
- Audit call placed only in the success branch: `if (!error) await auditLog(...)`.
- Exception in audit insert silently swallowed: `try { await audit() } catch { /* ignore */ }`.
- Trigger-based logging is semantically correct for "what committed" but records nothing about "what was attempted."

**How to avoid:**
- Decide the audit model upfront — "what committed" (triggers, simpler) vs. "what was attempted" (application layer with separate transaction). For v11.0, "what committed" via triggers is sufficient and correct.
- Application-layer audit calls must use `try/catch` that reports to Sentry on failure but does NOT re-throw — a failed audit insert must never block the user-facing operation.
- Place audit calls in a `finally` block pattern or after-settlement, not only in the success branch.
- If trigger-based, document explicitly: "audit trail covers committed operations only; failed/rolled-back attempts are not captured."

**Warning signs:**
- Audit call inside an `if (!error)` block with no corresponding call in the error branch.
- No audit row exists for a known-failed operation when testing error scenarios.
- `try/catch` around audit call that swallows errors with an empty catch block.

**Phase to address:** Capture strategy phase — the trigger-vs-application-layer decision must be made before writing any capture code.

---

### Pitfall 5: Missing Indexes Causing Admin Panel Query Timeouts

**What goes wrong:**
The audit_logs table has no indexes at creation. Early on, with < 1k rows, all queries are fast. After 3 months of moderate usage, the admin panel log page (which queries by org_id ordered by created_at DESC) does a full table scan. At 100k rows, the query takes 2-3 seconds. At 1M rows, it times out.

**Why it happens:**
"We'll add indexes later" — the table starts small and the problem is invisible until it isn't. Adding indexes to a large live table requires `CREATE INDEX CONCURRENTLY` and careful planning to avoid locking.

**How to avoid:**
- Add all required indexes in the same migration that creates the table:
  - `CREATE INDEX ON audit_logs (org_id, created_at DESC)` — primary admin panel query pattern
  - `CREATE INDEX ON audit_logs (actor_id, created_at DESC)` — "who did what" queries
  - `CREATE INDEX ON audit_logs (resource_type, resource_id)` — "history of this record" queries
- Use `BRIN` index on `created_at` as a secondary option for very large time-range scans.
- Run `EXPLAIN ANALYZE` on the admin panel query before shipping the UI phase.
- Add `LIMIT` enforcement on all queries from the admin panel — never unbounded SELECT on audit_logs.

**Warning signs:**
- audit_logs migration creates the table but no `CREATE INDEX` statements follow.
- Admin panel query running `Seq Scan` on audit_logs (visible in Supabase query analyzer).
- Page load > 500ms on a table with < 10k rows.

**Phase to address:** Migration phase — indexes must be in the initial migration, not added later.

---

### Pitfall 6: Migration Risk — Adding Triggers to Live Production Tables

**What goes wrong:**
Adding an `AFTER INSERT OR UPDATE OR DELETE` trigger to existing production tables (tasks, blueprint_configs, comments) via migration 025+ works correctly in isolation. The risk is: if the migration also includes a DDL change to those tables (e.g., adding a `NOT NULL` column without `DEFAULT`), it locks the table during migration and blocks all writes. On Supabase free/pro tiers, this can cause a timeout that leaves the migration partially applied and the table in a broken state.

**Why it happens:**
Combining trigger creation with table alteration in a single migration. Postgres table rewrites happen synchronously and hold an `ACCESS EXCLUSIVE` lock for the duration.

**How to avoid:**
- Keep the audit_logs migration purely additive: CREATE TABLE + CREATE TRIGGER. Do not ALTER existing tables in the same migration.
- Triggers added to existing tables are additive (no table rewrite, no lock) — safe.
- If a column must be added to existing tables: use `DEFAULT` value or nullable column, separate migration, off-peak deploy.
- Use `CREATE OR REPLACE TRIGGER` (idempotent) and `CREATE INDEX CONCURRENTLY IF NOT EXISTS`.
- Test the migration against a local Supabase instance with the full 24-migration chain before deploying to production.
- Document in the migration comment: `-- covers committed operations from: [deploy date]`. This is the known audit coverage gap.

**Warning signs:**
- Migration that ALTERs existing tables (tasks, comments, documents) in the same statement block as trigger creation.
- `NOT NULL` column added without `DEFAULT` on a table with existing rows.
- No test of the migration against local Supabase before production deploy.

**Phase to address:** Migration review — the migration author must explicitly inspect all DDL for table locks before the final SQL is written.

---

### Pitfall 7: Authenticated Users Can Delete Their Own Audit Rows

**What goes wrong:**
If the RLS DELETE policy on audit_logs follows the standard Nexo pattern (`FOR ALL TO anon, authenticated USING (org_id = ...)`), any operator in a tenant can delete their own trace from the audit log. The audit trail becomes untrustworthy.

**Why it happens:**
Standard Nexo tables grant authenticated users full CRUD via RLS. Copying this pattern to audit_logs is a logic error — audit data is append-only by design.

**How to avoid:**
- No DELETE policy on audit_logs for any non-super_admin role.
- No UPDATE policy on audit_logs for any role.
- Super admin can trigger deletion only via a dedicated edge function with its own audit trail (log the deletion of logs).
- Enforce at Postgres level: `REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon`.
- If LGPD data subject deletion requires removing audit rows, it must go through a controlled edge function with explicit justification, not a direct SQL call.

**Warning signs:**
- Migration that creates an UPDATE or DELETE policy on audit_logs for the authenticated role.
- Service layer that calls `.delete()` directly on the Supabase client against audit_logs.
- No explicit REVOKE statement in the migration.

**Phase to address:** Migration phase — include REVOKE explicitly and document the intent inline.

---

### Pitfall 8: Client-Supplied or Ambiguous Timestamps

**What goes wrong:**
If the audit INSERT accepts a `timestamp` or `occurred_at` field from the client request payload, an actor can manipulate when an event appears to have occurred. More commonly: the React SPA generates a timestamp using `new Date()` (browser clock), which may be skewed by minutes on some devices. In the admin panel UI, displaying timestamps with `toLocaleString()` without a timezone parameter shows times 3 hours ahead of local time for operators in Brazil (UTC-3), causing confusion about "when did this happen."

**Why it happens:**
- Client-side timestamp generation is easier than relying on server DEFAULT.
- `toLocaleString()` without timezone uses the browser's local timezone, which varies.

**How to avoid:**
- Always store timestamps as `TIMESTAMPTZ DEFAULT now()` — server clock, never client-provided.
- Never accept a `timestamp` field from the client payload for audit_logs inserts (trigger-based logging inherits server clock automatically; edge function logging must explicitly exclude client-supplied timestamps).
- In the React UI: use `Intl.DateTimeFormat` with `timeZone: 'America/Sao_Paulo'` — Nexo's operator base is in Brazil.
- For correlating with Clerk JWT `iat` claims: normalize to milliseconds since epoch for comparison, not string comparison.

**Warning signs:**
- Any audit INSERT from a client React service that includes `timestamp` or `created_at` in the payload.
- UI rendering timestamps with `.toLocaleString()` without a timezone parameter.
- Admin panel showing audit events consistently 3 hours off from expected local time.

**Phase to address:** Migration phase (TIMESTAMPTZ DEFAULT now()) + UI rendering phase (explicit timezone via Intl.DateTimeFormat).

---

### Pitfall 9: Edge Function Using Wrong Supabase Client Key

**What goes wrong:**
Edge functions that write to audit_logs need the service-role key to bypass RLS. If the edge function is initialized with `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend env var, unavailable in Deno) or with the anon key, audit inserts either fail with 403 (if RLS is strict) or succeed with incorrect org_id context (if RLS is permissive). This is a variant of Nexo PITFALLS.md rule #2.

**Why it happens:**
Copy-paste from frontend service initialization code into edge function code. In the frontend, the anon key is correct. In a Deno edge function, `VITE_*` env vars do not exist — Deno reads from `Deno.env.get()` with Supabase-injected secrets.

**How to avoid:**
- Edge functions writing to audit_logs must use `SUPABASE_SERVICE_ROLE_KEY` (auto-injected by Supabase Edge Functions runtime, no manual secret needed).
- Add an assertion at function startup: `if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) throw new Error('Missing service role key')`.
- The `org_id` written to audit_logs must come from the server-verified JWT claim — never from `req.body.org_id` (tenant spoofing prevention).
- All new audit edge functions follow the same deploy pattern as existing admin edge functions: `verify_jwt: false`, deploy immediately, verify via `mcp__supabase__list_edge_functions`.

**Warning signs:**
- Edge function audit insert returning 403.
- Edge function source containing `VITE_SUPABASE_*` env var references.
- `org_id` in audit INSERT derived from request body rather than decoded JWT.

**Phase to address:** Edge function implementation phase — mandatory code review check before deploy.

---

### Pitfall 10: Storage Growth Without a Retention Plan

**What goes wrong:**
Audit logs are write-only and never expire by default. After 6 months of moderate usage the table can hold millions of rows. Supabase free/pro tiers have database size limits. Full table scans (even with indexes, if the org has a large log volume) slow admin queries. There is no built-in Supabase mechanism to auto-purge rows.

**Why it happens:**
"We'll deal with it later" is the default. Retention is deferred until the table is already large and pruning becomes a production risk — bulk DELETE on a large live table holds locks and can cause query timeouts.

**How to avoid:**
- Design the schema with retention in mind from the start: include a `retained_until TIMESTAMPTZ` column or equivalent, even if the pruning job isn't built in phase 1. This avoids a schema migration later.
- Plan a `pg_cron` job (available in Supabase) or a scheduled edge function to delete rows older than 365 days. Document this as a required infra task even if deferred to v12.
- For LGPD compliance: shorter retention may be required for certain action types (e.g., auth events: 90 days). Design for per-action-type retention from the start.
- Monitor table size via Supabase dashboard after deploy.

**Warning signs:**
- Schema has no `retained_until` or equivalent column.
- No pg_cron job or scheduled function planned.
- Supabase database size growing > 10% per week after audit deploy.

**Phase to address:** Migration phase (schema includes retention metadata) + post-launch infra phase (pg_cron job or scheduled function).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `metadata: { ...fullRow }` — serialize the whole record | Zero metadata design effort | PII exposure; LGPD deletion requests break immutability; storage bloat | Never |
| Copy anon-permissive RLS from tasks to audit_logs | Faster migration | Cross-tenant data leak; no compliance basis | Never |
| Skip indexes at table creation, add later | Faster initial migration | Adding index to large live table requires CONCURRENTLY and careful timing; admin queries time out in the interim | Never — add indexes in the creation migration |
| Client-generated timestamps in audit payload | No edge function needed | Clock skew, tamper risk, browser time manipulation | Never |
| No retention policy | Zero upfront effort | Table bloat, DB size limits hit, bulk DELETE on large live table causes lock escalation | Only if table provably stays < 50k rows forever |
| `FOR EACH STATEMENT` trigger on all operations | Simpler trigger definition | Circular logging, write amplification, SELECT triggers | Never — use `FOR EACH ROW` on INSERT/UPDATE/DELETE only |
| Store `actor_email` instead of `actor_id` | Human-readable logs without a join | PII in audit table; email changes invalidate historical attribution; LGPD deletion required | Never — store UUID, resolve display name at render time |

---

## Integration Gotchas

Common mistakes when connecting to external services in the Nexo context.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase client in Deno edge function | Using `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend var, unavailable in Deno) | Use `SUPABASE_SERVICE_ROLE_KEY` auto-injected by Supabase Edge Functions runtime |
| Clerk JWT in audit context | Reading org_id from client request body | Decode the Authorization header JWT in the edge function and read `org_id` from the verified payload |
| Supabase triggers | `FOR EACH STATEMENT` produces one row per SQL statement, not per affected row | Use `FOR EACH ROW` to capture individual row data via `NEW` and `OLD` records |
| Edge function redeploy | Redeploying an audit function without `verify_jwt: false` causes Clerk token rejection (see PITFALLS.md rule #9) | All Nexo edge functions that accept Clerk tokens must use `verify_jwt: false`; verify after every redeploy |
| pg_cron for retention | Creating a cron job in migration without verifying pg_cron is enabled in the Supabase project | Check `SELECT * FROM pg_extension WHERE extname = 'pg_cron'` before migration; use scheduled edge function as fallback |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| No index on `(org_id, created_at DESC)` | Admin panel log page slow; Supabase reports Seq Scan | Add composite index in the same migration that creates the table | > 50k rows |
| Querying audit_logs without `org_id` filter | Full table scan across all tenants' data | RLS forces org_id filter; also add it explicitly in the service layer query | > 10k rows |
| Unbounded SELECT — no LIMIT on log viewer queries | Large payload on each page load, potential timeout | Enforce pagination with LIMIT/OFFSET or cursor; max 100 rows per request | > 1k rows returned |
| Fetching all columns including metadata JSONB for list view | Large payload for each page of results | SELECT only display columns (actor_id, action, resource_type, created_at); fetch metadata only on row expand | > 5k rows |
| Synchronous trigger audit in high-frequency write path | Perceived latency on every write operation | Acceptable for v11 scale; for high-frequency future ops, consider async queue pattern | > 100 writes/second |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Grant DELETE to authenticated role on audit_logs | Operator erases their own trail; audit becomes untrustworthy | `REVOKE DELETE ON audit_logs FROM authenticated, anon` explicitly in migration |
| `org_id` taken from client request body | Tenant spoofing: actor logs an event under a different org | Always derive org_id from server-verified JWT claim, never from client payload |
| Metadata includes full record before/after | PII exposure in audit storage; LGPD deletion conflicts with immutability | Define and enforce metadata allowlist per action type |
| No rate limit on audit log export | Exfiltration of entire tenant audit history | Pagination limit (max 1000 rows per request); require explicit date range on export calls |
| Super admin reads all tenants' raw audit data via direct Supabase query with no context | No legitimate cross-tenant read except via admin impersonation flow | Admin panel must use existing ImpersonationContext to scope queries; super admin RLS bypass is for the admin panel UI only, not arbitrary queries |

---

## UX Pitfalls

Common user experience mistakes in audit log admin interfaces.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Displaying raw action codes (`TASK_STATUS_CHANGED`) | Non-technical operators cannot parse the log | Display human-readable descriptions: "Status changed from In Progress to Done" |
| Timestamps displayed in UTC without conversion | Operators see times 3 hours off from local time (Brazil UTC-3) | Display in `America/Sao_Paulo` with UTC offset indicator |
| No filter controls — only full chronological list | Useless for compliance queries ("all logins for user X last month") | Minimum: filter by actor, action type, resource type, and date range |
| Metadata collapsed with no expand | Inspector cannot see what changed without querying DB directly | Expandable row with formatted metadata diff view |
| Log viewer itself generates audit events on load | Circular logging (see Pitfall 3); table grows on every admin visit | Read path must never trigger writes to audit_logs |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **RLS policy audit:** Run `SELECT * FROM pg_policies WHERE tablename = 'audit_logs'` — confirm no policy exists with `TO anon` or `USING (true)` for SELECT.
- [ ] **Tamper protection verified:** Run `SELECT has_table_privilege('authenticated', 'audit_logs', 'DELETE')` — must return `false`.
- [ ] **Trigger scope confirmed:** Trigger fires on DELETE as well as INSERT/UPDATE — verify with `SELECT * FROM pg_triggers WHERE tgrelid = 'tasks'::regclass`.
- [ ] **Metadata PII review:** Metadata spec written and reviewed — verify no action type logs a full record object or email address.
- [ ] **Retention field exists:** `retained_until` or equivalent column present in schema even if pruning job is deferred.
- [ ] **Timezone handling correct:** Admin panel displays timestamps in `America/Sao_Paulo` — manual test with a known UTC timestamp.
- [ ] **Edge function key verified:** Audit edge function uses `SUPABASE_SERVICE_ROLE_KEY` — grep for `VITE_SUPABASE` in function source (must return zero matches).
- [ ] **Circular logging excluded:** audit_logs table is explicitly excluded from any catch-all trigger or service wrapper — manual test: load admin log page, verify row count does not increase.
- [ ] **Indexes created:** Run `\d audit_logs` — confirm `(org_id, created_at DESC)` composite index exists.
- [ ] **Error path coverage:** Audit call present in failure branches — grep for `auditLog(` next to early returns and catch blocks.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Cross-tenant leak via anon RLS | HIGH | Drop permissive policy immediately; add org-scoped policy; audit what was exposed; notify affected tenants per LGPD breach notification rules (72h window) |
| PII in metadata discovered post-deploy | MEDIUM | Migration to NULLIFY or truncate metadata JSONB fields matching PII patterns; update allowlist; document in security log |
| Circular logging detected (table growing exponentially) | MEDIUM | Drop the offending trigger or wrapper immediately; bulk-delete circular rows (identify by action matching internal audit actions); redeploy with corrected scope |
| Missing events on error paths | LOW-MEDIUM | Add application-layer catch-all for failed operations; accept the historical gap; document audit coverage start date in STATE.md |
| No retention policy and table approaching size limit | HIGH | Add `pg_cron` job with aggressive initial cleanup (delete rows > 180 days); use batch deletion (1000 rows at a time) to avoid lock escalation on large table |
| Actor email stored as PII in actor column | MEDIUM | Migration to nullify or hash email column; add actor_id UUID reference; update display layer to resolve name from Clerk at render time |
| Trigger added without testing against migration chain | MEDIUM | Drop trigger, fix migration, re-run full migration chain on local Supabase, verify before re-deploying to production |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Anon-permissive RLS on audit_logs | Schema/Migration phase | `SELECT * FROM pg_policies WHERE tablename = 'audit_logs'` — no anon SELECT |
| PII in metadata JSONB | Design phase (metadata spec before code) | Metadata allowlist document reviewed; no action type logs full record |
| Circular logging | Capture layer design phase | Manual test: admin log page load does not increase row count |
| Missing events on error paths | Capture strategy phase | Forced Supabase error test — verify audit row still created |
| Missing indexes | Migration phase | `EXPLAIN ANALYZE SELECT ... FROM audit_logs WHERE org_id = '...' ORDER BY created_at DESC LIMIT 50` — index scan confirmed |
| Migration risk on production tables | Migration review phase | Dry-run on local Supabase with full 24-migration chain; no DDL table locks |
| Tamper protection | Migration phase | `SELECT has_table_privilege('authenticated', 'audit_logs', 'DELETE')` returns false |
| Timezone ambiguity | UI rendering phase | Manual test comparing display to known UTC timestamp with -3h offset |
| Edge function using wrong key | Edge function implementation phase | grep for `VITE_SUPABASE` in edge function source — zero matches |
| Storage growth / retention | Schema design phase | `retained_until` or equivalent column exists; pg_cron job or scheduled function documented in STATE.md |

---

## Sources

- [Supabase Auth Audit Logs](https://supabase.com/docs/guides/auth/audit-logs) — official Supabase docs
- [Supabase Platform Audit Logs](https://supabase.com/docs/guides/security/platform-audit-logs) — official Supabase docs
- [pganalyze: Postgres Auditing — Triggers vs pgAudit](https://pganalyze.com/blog/5mins-postgres-auditing-pgaudit-supabase-supa-audit) — trigger vs pgAudit tradeoffs, Supabase-specific
- [Production-Ready Audit Logs in PostgreSQL](https://medium.com/@sehban.alam/lets-build-production-ready-audit-logs-in-postgresql-7125481713d8) — index strategy, patterns
- [Tamper-Evident Audit Trails with Hash Chaining](https://appmaster.io/blog/tamper-evident-audit-trails-postgresql) — immutability patterns
- [GDPR Log Management for Engineers](https://last9.io/blog/gdpr-log-management/) — PII in logs, retention obligations, LGPD alignment
- [Supabase RLS Best Practices (MakerKit)](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — multi-tenant RLS patterns
- [How to Implement Audit Logs in Supabase](https://bootstrapped.app/guide/how-to-implement-audit-logs-in-supabase) — Supabase-specific implementation guide
- [Postgres Audit Logging Guide (Bytebase)](https://www.bytebase.com/blog/postgres-audit-logging/) — PostgreSQL audit patterns and index strategies
- Nexo `.planning/PITFALLS.md` rules #2, #5, #9, #11 — existing Supabase/edge function integration pitfalls specific to this codebase
- Nexo supabase/migrations/ — direct analysis of anon-permissive RLS patterns across migrations 001-024

---
*Pitfalls research for: v11.0 — Audit Logging added to existing multi-tenant Supabase system*
*Researched: 2026-03-19*
