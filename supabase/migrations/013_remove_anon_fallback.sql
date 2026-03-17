-- Migration 013: Remove COALESCE anon fallback from all RLS policies.
--
-- Replaces the org_id = COALESCE(..., org_id) pattern (which lets any anon request
-- bypass org filtering) with a strict pattern requiring a real org_id JWT claim.
--
-- Affects 7 tables from migration 009 + 4 document policies from migration 011.

-- ============================================================================
-- 1. Drop existing policies
-- ============================================================================

-- From migration 009 (7 tables)
DROP POLICY IF EXISTS "tenant_modules_org_access"  ON public.tenant_modules;
DROP POLICY IF EXISTS "comments_org_access"         ON public.comments;
DROP POLICY IF EXISTS "share_tokens_org_access"     ON public.share_tokens;
DROP POLICY IF EXISTS "blueprint_configs_org_access" ON public.blueprint_configs;
DROP POLICY IF EXISTS "briefing_configs_org_access" ON public.briefing_configs;
DROP POLICY IF EXISTS "knowledge_entries_org_access" ON public.knowledge_entries;
DROP POLICY IF EXISTS "tasks_org_access"            ON public.tasks;

-- From migration 011 (documents — 4 operation-specific policies)
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- ============================================================================
-- 2. Create strict RLS policies (no COALESCE fallback)
-- ============================================================================

-- Pattern for USING/WITH CHECK:
--   super_admin bypass OR strict org_id match from JWT
--
-- Old:  org_id = COALESCE(jwt_org_id, org_id)   -- self-reference = always true for anon
-- New:  (jwt_org_id) = org_id                    -- NULL jwt_org_id = no match = denied

-- tenant_modules
CREATE POLICY "tenant_modules_org_access" ON public.tenant_modules
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
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
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- documents — SELECT keeps scope='product' global read rule
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR scope = 'product'
    OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- documents — INSERT
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- documents — UPDATE
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- documents — DELETE
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );
