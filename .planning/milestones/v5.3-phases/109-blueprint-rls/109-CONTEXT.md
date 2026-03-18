# Phase 109: Blueprint RLS - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Ensure `blueprint_configs` (and `blueprints` if it exists) are isolated by `org_id` via RLS — no org can read wireframe data belonging to another org. Close gap DATA-03.

</domain>

<decisions>
## Implementation Decisions

### RLS Status — Already Implemented
- `blueprint_configs` has RLS enabled (`relrowsecurity = true`) with policy `blueprint_configs_org_access`
- Policy uses the same strict pattern as migration 013: super_admin bypass OR `(jwt.claims->>'org_id') = org_id`
- `briefing_configs` also has the correct policy in place
- No separate `blueprints` table exists in the DB — only `blueprint_configs`
- **No new migration is needed** — the RLS gap (DATA-03) is already closed at the DB level

### What Phase 109 Delivers
- Audit confirmation: verify the DB policies are correct and active
- VERIFICATION.md documenting the gap closure for DATA-03
- `npx tsc --noEmit` clean pass (no code changes expected)

### Claude's Discretion
- Format of VERIFICATION.md (follow prior phase VERIFICATION.md patterns)
- Whether to add an index on `blueprint_configs(org_id)` for query performance (nice-to-have, not blocking)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### RLS Policies (active)
- `supabase/migrations/013_remove_anon_fallback.sql` — Defines the strict RLS pattern for all 7 tables including `blueprint_configs` and `briefing_configs`
- `supabase/migrations/008_multi_tenant_schema.sql` — Original org_id column additions
- `supabase/migrations/009_super_admin_rls.sql` — super_admin bypass added to all 8 tables

### Data Recovery
- `supabase/migrations/017_data_recovery.sql` — Updated `blueprint_configs.org_id` from placeholder to real FXL org_id

### Requirements
- `.planning/REQUIREMENTS.md` §DATA-03 — The gap this phase closes

### Prior Phase Context
- `.planning/phases/105-data-isolation/105-CONTEXT.md` — Established RLS pattern and confirmed blueprint_configs was in scope

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Migration 013 RLS pattern: the exact SQL for super_admin bypass + strict org_id match is already implemented and can be referenced for VERIFICATION.md

### Established Patterns
- All 7 core tables use identical RLS pattern: `COALESCE(jwt->>'super_admin', 'false') = 'true' OR (jwt->>'org_id') = org_id`
- `blueprint_configs` is already part of that group

### Integration Points
- No code changes needed — RLS is at the DB layer
- The token exchange flow (useOrgTokenExchange) from Phase 105 ensures the JWT with org_id is sent to Supabase on every request

</code_context>

<specifics>
## Specific Ideas

- Run `SELECT` on `pg_policies` to confirm `blueprint_configs_org_access` policy exists and has correct QUAL expression
- Run `SELECT relrowsecurity FROM pg_class WHERE relname = 'blueprint_configs'` to confirm RLS is enabled (not just the policy existing)

</specifics>

<deferred>
## Deferred Ideas

- Performance index on `blueprint_configs(org_id)` — small table (1 row), not needed now but worth adding in a future optimization pass
- `blueprints` table: if a separate `blueprints` table is ever created, it will need the same RLS pattern

</deferred>

---

*Phase: 109-blueprint-rls*
*Context gathered: 2026-03-18*
