-- Migration 009: Add super_admin RLS bypass.
-- When JWT contains super_admin = 'true', user can access all rows across all orgs.
-- Drops all 8 org_access policies from migration 008 and replaces them with policies
-- that include the super_admin JWT claim bypass before the org_id check.

-- ============================================================================
-- 1. Drop existing org_access policies from migration 008
-- ============================================================================

DROP POLICY IF EXISTS "tenant_modules_org_access"  ON public.tenant_modules;
DROP POLICY IF EXISTS "comments_org_access"         ON public.comments;
DROP POLICY IF EXISTS "share_tokens_org_access"     ON public.share_tokens;
DROP POLICY IF EXISTS "blueprint_configs_org_access" ON public.blueprint_configs;
DROP POLICY IF EXISTS "briefing_configs_org_access" ON public.briefing_configs;
DROP POLICY IF EXISTS "knowledge_entries_org_access" ON public.knowledge_entries;
DROP POLICY IF EXISTS "tasks_org_access"            ON public.tasks;
DROP POLICY IF EXISTS "documents_org_access"        ON public.documents;

-- ============================================================================
-- 2. Create new RLS policies with super_admin bypass + org_id filtering
-- ============================================================================

-- Strategy:
--   If JWT contains super_admin = 'true' -> allow access to ALL rows (super admin bypass)
--   Otherwise -> filter by org_id claim (same as migration 008)
--
-- The super_admin check:
--   COALESCE(
--     nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
--     'false'
--   ) = 'true'
--
--   - When JWT has super_admin = 'true': returns 'true' -> condition is true -> bypass
--   - When no JWT or no super_admin claim: COALESCE returns 'false' -> falls through to org check

-- tenant_modules
CREATE POLICY "tenant_modules_org_access" ON public.tenant_modules
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- comments
CREATE POLICY "comments_org_access" ON public.comments
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- share_tokens
CREATE POLICY "share_tokens_org_access" ON public.share_tokens
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- blueprint_configs
CREATE POLICY "blueprint_configs_org_access" ON public.blueprint_configs
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- briefing_configs
CREATE POLICY "briefing_configs_org_access" ON public.briefing_configs
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- knowledge_entries
CREATE POLICY "knowledge_entries_org_access" ON public.knowledge_entries
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- tasks
CREATE POLICY "tasks_org_access" ON public.tasks
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- documents
CREATE POLICY "documents_org_access" ON public.documents
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );
