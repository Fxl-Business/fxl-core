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
