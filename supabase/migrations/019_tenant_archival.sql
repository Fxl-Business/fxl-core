-- Migration 019: Tenant Archival
-- Adds archived_at column to all org-scoped tables and updates RLS policies
-- to hide archived data from non-super-admin queries.

-- ============================================================================
-- 1. Add archived_at column to all org-scoped tables
-- ============================================================================

ALTER TABLE public.tenant_modules ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.share_tokens ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.blueprint_configs ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.briefing_configs ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.knowledge_entries ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================================================
-- 2. Drop existing RLS policies
-- ============================================================================

-- From migration 013 (7 tables — FOR ALL)
DROP POLICY IF EXISTS "tenant_modules_org_access"  ON public.tenant_modules;
DROP POLICY IF EXISTS "comments_org_access"         ON public.comments;
DROP POLICY IF EXISTS "share_tokens_org_access"     ON public.share_tokens;
DROP POLICY IF EXISTS "blueprint_configs_org_access" ON public.blueprint_configs;
DROP POLICY IF EXISTS "briefing_configs_org_access" ON public.briefing_configs;
DROP POLICY IF EXISTS "knowledge_entries_org_access" ON public.knowledge_entries;
DROP POLICY IF EXISTS "tasks_org_access"            ON public.tasks;

-- From migration 013 (documents — 4 operation-specific policies)
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- From migration 016 (clients — 4 operation-specific policies)
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;

-- From migration 018 (projects — 4 operation-specific policies)
DROP POLICY IF EXISTS "projects_select" ON public.projects;
DROP POLICY IF EXISTS "projects_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_update" ON public.projects;
DROP POLICY IF EXISTS "projects_delete" ON public.projects;

-- ============================================================================
-- 3. Recreate RLS policies with archived_at IS NULL on non-super-admin branch
-- ============================================================================

-- Pattern: super_admin bypass OR (org_id match AND archived_at IS NULL)
-- Super admins can still see archived rows (no archived_at filter on their branch).

-- tenant_modules
CREATE POLICY "tenant_modules_org_access" ON public.tenant_modules
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
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
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- documents — SELECT (keeps scope='product' global read rule)
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR scope = 'product'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- documents — INSERT
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- documents — UPDATE
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- documents — DELETE
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- clients — SELECT
CREATE POLICY "clients_select" ON public.clients
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- clients — INSERT
CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- clients — UPDATE
CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- clients — DELETE
CREATE POLICY "clients_delete" ON public.clients
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- projects — SELECT
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- projects — INSERT
CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- projects — UPDATE
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- projects — DELETE
CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- ============================================================================
-- 4. Indexes for archived_at filtering
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_archived ON public.clients (org_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_archived ON public.projects (org_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks (org_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_archived ON public.documents (org_id) WHERE archived_at IS NULL;
