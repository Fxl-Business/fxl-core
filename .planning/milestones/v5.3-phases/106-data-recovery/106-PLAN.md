---
phase: 106
name: Data Recovery
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/017_data_recovery.sql
autonomous: true
requirements:
  - DATA-05
---

# Phase 106: Data Recovery

**Goal:** Dados existentes que sumiram ou perderam associacao apos mudancas de org sao recuperados e vinculados a org correta, sem perda de conteudo

**Requirements:** DATA-05

## must_haves

- [ ] Rows with `org_id = 'org_fxl_default'` in all 8 tables are updated to `org_3B54c87bkZ6CWydmkuu7I7oGY5w`
- [ ] Migration `017_data_recovery.sql` is created, applied via `mcp__supabase__apply_migration`, and idempotent (running twice produces no error and no data change)
- [ ] The `clients` table row for `financeiro-conta-azul` is visible to FXL org operators after recovery (RLS passes with correct org_id)
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)

## Wave 1 — Data Re-Association Migration

### Task 1: Write and apply `017_data_recovery.sql`

<read_first>
- `supabase/migrations/008_multi_tenant_schema.sql` — lists all 8 tables that received `org_fxl_default` default; use same section format
- `supabase/migrations/016_clients_table.sql` — the seeded `clients` row with `org_fxl_default` is the primary target
- `supabase/migrations/013_remove_anon_fallback.sql` — confirms strict RLS is active; recovered rows must have correct org_id to be queryable
</read_first>

<action>
Create `supabase/migrations/017_data_recovery.sql` with the following exact content:

```sql
-- Migration 017: Data Recovery — re-associate placeholder org rows
--
-- Background: Migration 008 added org_id to all tables with DEFAULT 'org_fxl_default'
-- as a backward-compatible placeholder. Migration 016 seeded the clients table using
-- the same placeholder. Now that the real FXL Clerk org ID is known, this migration
-- updates all placeholder rows to the correct org_id so they become visible to FXL
-- operators under the strict RLS introduced in migration 013.
--
-- Real FXL org ID: org_3B54c87bkZ6CWydmkuu7I7oGY5w (confirmed from live DB 2026-03-18)
-- Placeholder:     org_fxl_default
--
-- Idempotency: UPDATE ... WHERE org_id = 'org_fxl_default' is a no-op if no rows
-- match. Safe to run multiple times.

-- ============================================================================
-- 1. Re-associate all placeholder rows across all affected tables
-- ============================================================================

UPDATE public.clients
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.tasks
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.blueprint_configs
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.briefing_configs
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.documents
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.knowledge_entries
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.comments
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

UPDATE public.share_tokens
  SET org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'
  WHERE org_id = 'org_fxl_default';

-- ============================================================================
-- 2. Verification (run manually to confirm — expected: 0 rows for each)
-- ============================================================================
-- SELECT table_name, COUNT(*) FROM (
--   SELECT 'clients'          AS table_name, org_id FROM public.clients          WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'tasks',                          org_id FROM public.tasks             WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'blueprint_configs',              org_id FROM public.blueprint_configs WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'briefing_configs',               org_id FROM public.briefing_configs  WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'documents',                      org_id FROM public.documents          WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'knowledge_entries',              org_id FROM public.knowledge_entries  WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'comments',                       org_id FROM public.comments           WHERE org_id = 'org_fxl_default'
--   UNION ALL
--   SELECT 'share_tokens',                   org_id FROM public.share_tokens       WHERE org_id = 'org_fxl_default'
-- ) t GROUP BY table_name;
```

Then apply via `mcp__supabase__apply_migration` with:
- name: `017_data_recovery`
- sql: (exact content above)
</action>

<acceptance_criteria>
- `supabase/migrations/017_data_recovery.sql` file exists at that path
- File contains `UPDATE public.clients` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.tasks` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.blueprint_configs` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.briefing_configs` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.documents` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.knowledge_entries` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.comments` with `WHERE org_id = 'org_fxl_default'`
- File contains `UPDATE public.share_tokens` with `WHERE org_id = 'org_fxl_default'`
- Migration applied via `mcp__supabase__apply_migration` returns success
- After migration: `SELECT COUNT(*) FROM public.clients WHERE org_id = 'org_fxl_default'` returns 0
- After migration: `SELECT COUNT(*) FROM public.clients WHERE org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'` returns >= 1
- `npx tsc --noEmit` exits with 0 errors (no TypeScript changes, but confirm no regressions)
</acceptance_criteria>

## Verification Criteria

1. **Success criterion 1** (tasks visible): `SELECT COUNT(*) FROM public.tasks WHERE org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'` returns 6 (all existing tasks)
2. **Success criterion 2** (wireframes/blueprints visible): `SELECT COUNT(*) FROM public.blueprint_configs WHERE org_id = 'org_3B54c87bkZ6CWydmkuu7I7oGY5w'` returns 1; zero rows with `org_fxl_default`
3. **Success criterion 3** (idempotent): Running `017_data_recovery.sql` a second time produces no errors and no row count changes
4. **Zero placeholder rows**: `SELECT COUNT(*) FROM public.clients WHERE org_id = 'org_fxl_default'` returns 0
5. **TypeScript clean**: `npx tsc --noEmit` → 0 errors
