-- MANUAL MIGRATION: requires SET app.new_org_id first.
--
-- Migration 014: Migrate FXL data from org_fxl_default to real Clerk org.
--
-- Usage:
--   psql "$DATABASE_URL" -c "SET app.new_org_id = 'org_YOUR_REAL_ID';" -f 014_fxl_data_migration.sql
--
-- Or via Supabase SQL editor:
--   SET app.new_org_id = 'org_YOUR_REAL_ID';
--   [paste the DO $$ block below]
--
-- Tables migrated: comments, share_tokens, blueprint_configs, briefing_configs,
--                  knowledge_entries, tasks, documents, tenant_modules

DO $$
DECLARE
  new_org_id text := current_setting('app.new_org_id', true);
BEGIN
  IF new_org_id IS NULL OR new_org_id = '' THEN
    RAISE EXCEPTION 'app.new_org_id must be set before running this migration. '
      'Run: SET app.new_org_id = ''org_your_real_id_here''; before this script.';
  END IF;

  UPDATE public.comments           SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.share_tokens       SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.blueprint_configs  SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.briefing_configs   SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.knowledge_entries  SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.tasks              SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.documents          SET org_id = new_org_id WHERE org_id = 'org_fxl_default';
  UPDATE public.tenant_modules     SET org_id = new_org_id WHERE org_id = 'org_fxl_default';

  RAISE NOTICE 'Migration complete. All org_fxl_default rows updated to %', new_org_id;
END $$;
