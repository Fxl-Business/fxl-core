-- Migration 008: Multi-tenant schema for v3.1
-- Adds org_id to all existing tables, creates tenant_modules, replaces RLS policies.
-- Backward-compatible: anon key (no JWT claims) still works via COALESCE fallback.

-- ============================================================================
-- 1. Create tenant_modules table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_modules (
  org_id     text        NOT NULL,           -- Clerk organization ID
  module_id  text        NOT NULL,           -- MODULE_IDS value
  enabled    boolean     NOT NULL DEFAULT true,
  config     jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, module_id)
);

ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Add org_id column to all existing tables
-- ============================================================================

-- Helper: For each table, add org_id with a default, then backfill existing rows.
-- Using ADD COLUMN IF NOT EXISTS for idempotency.

ALTER TABLE public.comments          ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.share_tokens      ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.blueprint_configs ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.briefing_configs  ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.knowledge_entries ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.tasks             ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';
ALTER TABLE public.documents         ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';

-- ============================================================================
-- 3. Backfill existing data (safety net if rows somehow have NULL)
-- ============================================================================

UPDATE public.comments          SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.share_tokens      SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.blueprint_configs SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.briefing_configs  SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.knowledge_entries SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.tasks             SET org_id = 'org_fxl_default' WHERE org_id IS NULL;
UPDATE public.documents         SET org_id = 'org_fxl_default' WHERE org_id IS NULL;

-- ============================================================================
-- 4. Drop existing RLS policies (anon-permissive from migrations 002-007)
-- ============================================================================

-- comments (from 002_clerk_migration.sql)
DROP POLICY IF EXISTS "anon_read_comments"    ON public.comments;
DROP POLICY IF EXISTS "anon_insert_comments"  ON public.comments;
DROP POLICY IF EXISTS "anon_resolve_comments" ON public.comments;

-- share_tokens (from 002_clerk_migration.sql)
DROP POLICY IF EXISTS "anon_read_tokens"   ON public.share_tokens;
DROP POLICY IF EXISTS "anon_insert_tokens" ON public.share_tokens;
DROP POLICY IF EXISTS "anon_update_tokens" ON public.share_tokens;

-- blueprint_configs (from 003)
DROP POLICY IF EXISTS "anon_read_blueprint_configs"   ON public.blueprint_configs;
DROP POLICY IF EXISTS "anon_insert_blueprint_configs" ON public.blueprint_configs;
DROP POLICY IF EXISTS "anon_update_blueprint_configs" ON public.blueprint_configs;

-- briefing_configs (from 004)
DROP POLICY IF EXISTS "anon_read_briefing_configs"   ON public.briefing_configs;
DROP POLICY IF EXISTS "anon_insert_briefing_configs" ON public.briefing_configs;
DROP POLICY IF EXISTS "anon_update_briefing_configs" ON public.briefing_configs;

-- knowledge_entries (from 005)
DROP POLICY IF EXISTS "anon_read_knowledge_entries"   ON public.knowledge_entries;
DROP POLICY IF EXISTS "anon_insert_knowledge_entries" ON public.knowledge_entries;
DROP POLICY IF EXISTS "anon_update_knowledge_entries" ON public.knowledge_entries;
DROP POLICY IF EXISTS "anon_delete_knowledge_entries" ON public.knowledge_entries;

-- tasks (from 006)
DROP POLICY IF EXISTS "anon_read_tasks"   ON public.tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON public.tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON public.tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON public.tasks;

-- documents (from 007)
DROP POLICY IF EXISTS "anon_read_documents"   ON public.documents;
DROP POLICY IF EXISTS "anon_insert_documents" ON public.documents;
DROP POLICY IF EXISTS "anon_update_documents" ON public.documents;
DROP POLICY IF EXISTS "anon_delete_documents" ON public.documents;

-- ============================================================================
-- 5. Create new RLS policies with org_id filtering + anon fallback
-- ============================================================================

-- Strategy:
--   In "org" mode: JWT contains org_id claim -> filter by org_id
--   In "anon" mode: No JWT claims (anon key) -> allow all (backward compat)
--
-- The check: if current_setting returns empty/null (anon key), allow access.
-- If it returns a valid JSON with org_id, filter by org_id.
--
-- We use a helper expression:
--   COALESCE(
--     nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
--     org_id  -- fallback: match any row (self-reference = always true)
--   ) = org_id
--
-- This means:
--   - When JWT has org_id claim: org_id must match the claim
--   - When no JWT (anon key): current_setting returns '' -> COALESCE returns org_id -> org_id = org_id -> true

-- tenant_modules
CREATE POLICY "tenant_modules_org_access" ON public.tenant_modules
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- comments
CREATE POLICY "comments_org_access" ON public.comments
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- share_tokens
CREATE POLICY "share_tokens_org_access" ON public.share_tokens
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- blueprint_configs
CREATE POLICY "blueprint_configs_org_access" ON public.blueprint_configs
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- briefing_configs
CREATE POLICY "briefing_configs_org_access" ON public.briefing_configs
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- knowledge_entries
CREATE POLICY "knowledge_entries_org_access" ON public.knowledge_entries
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- tasks
CREATE POLICY "tasks_org_access" ON public.tasks
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- documents
CREATE POLICY "documents_org_access" ON public.documents
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- ============================================================================
-- 6. Create indexes on org_id for all tables
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tenant_modules_org_id      ON public.tenant_modules (org_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id            ON public.comments (org_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_org_id        ON public.share_tokens (org_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_configs_org_id   ON public.blueprint_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_briefing_configs_org_id    ON public.briefing_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_org_id   ON public.knowledge_entries (org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id               ON public.tasks (org_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id           ON public.documents (org_id);
