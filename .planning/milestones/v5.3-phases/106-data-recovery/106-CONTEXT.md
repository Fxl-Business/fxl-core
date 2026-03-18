# Phase 106: Data Recovery - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Re-associate rows that were seeded with the placeholder org_id `org_fxl_default` to the real Clerk org ID (`org_3B54c87bkZ6CWydmkuu7I7oGY5w`). The re-association must be delivered as an idempotent SQL migration (safe to run multiple times). No new tables, no new service code — this phase is purely a data fix.

Tables in scope: `clients`, `blueprint_configs`, `briefing_configs`, `tasks`, `comments`, `documents` (any row with `org_id = 'org_fxl_default'` that belongs to the FXL org).

Out of scope: schema changes (Phase 105), admin org management (Phase 108), UI changes.

</domain>

<decisions>
## Implementation Decisions

### Re-association Strategy
- [auto] Deliver fix as a numbered SQL migration (`017_data_recovery.sql`) using the `apply_migration` MCP tool — same pattern as every prior migration
- UPDATE statements target rows WHERE `org_id = 'org_fxl_default'` and set to real org ID `org_3B54c87bkZ6CWydmkuu7I7oGY5w`
- Migration must be idempotent: running it twice must not corrupt data (UPDATE is inherently idempotent when WHERE clause is exact)
- Cover all tables that received the placeholder default in migration 008: `tasks`, `blueprint_configs`, `briefing_configs`, `comments`, `documents`, `knowledge_entries`, `share_tokens`, `clients`

### Real Org ID
- [auto] The real FXL org ID confirmed by querying live DB: `org_3B54c87bkZ6CWydmkuu7I7oGY5w`
- All existing non-placeholder rows (tasks: 6, blueprint_configs: 1, briefing_configs: 1) already use this org ID — they do NOT need updating
- Only rows with `org_id = 'org_fxl_default'` need re-association (currently: 1 client row seeded in migration 016)

### Idempotency Pattern
- [auto] Use `UPDATE ... WHERE org_id = 'org_fxl_default'` — if no rows match, no-op; safe to re-run
- No transaction wrapper needed beyond what Supabase applies per migration
- Add a comment block at the top of the migration explaining the purpose and the mapping used

### Scope of Tables
- [auto] Cover all 8 tables from migration 008 that received `org_fxl_default` default: comments, share_tokens, blueprint_configs, briefing_configs, knowledge_entries, tasks, documents, clients
- Current state (confirmed by live DB query): only `clients` has a `org_fxl_default` row; all other tables already use the real org ID — but the migration should cover all tables for completeness and idempotency

### Claude's Discretion
- Exact comment wording in the migration file
- Whether to add a verification SELECT at the end (as a comment) for manual confirmation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema and RLS
- `supabase/migrations/008_multi_tenant_schema.sql` — where `org_fxl_default` was set as the DEFAULT for all tables; all 8 affected tables listed here
- `supabase/migrations/016_clients_table.sql` — where the seeded client with `org_fxl_default` was inserted (the primary row to recover)
- `supabase/migrations/013_remove_anon_fallback.sql` — current strict RLS (no anon fallback); recovered rows must match real org_id to be visible

### Requirements
- `.planning/REQUIREMENTS.md` §DATA-05 — "Dados existentes (tarefas, wireframes) recuperados ou re-associados a org correta"
- `.planning/ROADMAP.md` §Phase 106 — success criteria (3 criteria: tasks visible, wireframes visible, idempotent migration)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Migration pattern: all prior migrations in `supabase/migrations/` follow the same header comment + numbered section format — follow the same convention
- `mcp__supabase__apply_migration` MCP tool: the standard way to apply a new migration in this project (never run SQL directly to alter schema)

### Established Patterns
- Migration file naming: `NNN_description.sql` — next is `017_data_recovery.sql`
- All UPDATE re-association statements target `WHERE org_id = 'org_fxl_default'`
- Real FXL org ID: `org_3B54c87bkZ6CWydmkuu7I7oGY5w` (confirmed from live DB)

### Integration Points
- After migration runs: the `clients` table row with `org_fxl_default` will become visible to operators of the FXL org (RLS will pass because `org_id` now matches the JWT claim)
- No service code changes needed — RLS handles visibility automatically once org_id is correct
- No frontend changes needed — once data is correctly org-scoped, the clients service (added in Phase 105) will return the row as expected

### What Already Works (no changes needed)
- tasks (6 rows): already on `org_3B54c87bkZ6CWydmkuu7I7oGY5w` — no recovery needed
- blueprint_configs (1 row): already on real org — no recovery needed
- briefing_configs (1 row): already on real org — no recovery needed
- Only `clients` (1 row with `org_fxl_default`) needs re-association

</code_context>

<specifics>
## Specific Ideas

- The migration should use a descriptive comment explaining WHY the placeholder exists (seeded in 016 before the real org ID was known) so future readers understand the intent
- Covering all 8 tables in the UPDATE (even those with 0 matching rows) makes the migration self-documenting and safe for future re-runs if more placeholder rows appear

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 106-data-recovery*
*Context gathered: 2026-03-18*
