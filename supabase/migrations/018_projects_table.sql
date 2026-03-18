-- Migration 018: Projects as separate entity from Clients
--
-- Part of v6.0 Reestruturacao de Modulos (Phase 112: DB Migration)
--
-- Changes:
--   1. Create `projects` table (id, slug, name, client_id nullable FK, org_id, created_at)
--   2. Extend `clients` with logo_url and status columns
--   3. Add project_id FK column to briefing_configs, blueprint_configs, comments, share_tokens
--   4. Seed "Financeiro Conta Azul" project and backfill project_id in dependent tables
--
-- Idempotent: uses IF NOT EXISTS / IF NOT EXISTS + ON CONFLICT where possible.

-- ============================================================================
-- 1. Create projects table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug       text        NOT NULL,
  name       text        NOT NULL,
  client_id  uuid        REFERENCES public.clients(id) ON DELETE SET NULL,
  org_id     text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, org_id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Indexes for projects
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_org_id     ON public.projects (org_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id  ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug       ON public.projects (slug);

-- ============================================================================
-- 3. RLS policies for projects — org_id match + super_admin bypass (pattern from 016)
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_select') THEN
    CREATE POLICY "projects_select" ON public.projects
      FOR SELECT TO anon, authenticated
      USING (
        COALESCE(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
          'false'
        ) = 'true'
        OR
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_insert') THEN
    CREATE POLICY "projects_insert" ON public.projects
      FOR INSERT TO anon, authenticated
      WITH CHECK (
        COALESCE(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
          'false'
        ) = 'true'
        OR
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_update') THEN
    CREATE POLICY "projects_update" ON public.projects
      FOR UPDATE TO anon, authenticated
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_delete') THEN
    CREATE POLICY "projects_delete" ON public.projects
      FOR DELETE TO anon, authenticated
      USING (
        COALESCE(
          nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
          'false'
        ) = 'true'
        OR
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      );
  END IF;
END $$;

-- ============================================================================
-- 4. Extend clients table with logo_url and status
-- ============================================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- ============================================================================
-- 5. Add project_id column to dependent tables
-- ============================================================================

ALTER TABLE public.briefing_configs  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.blueprint_configs ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.comments          ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.share_tokens      ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Indexes for project_id lookups
CREATE INDEX IF NOT EXISTS idx_briefing_configs_project_id  ON public.briefing_configs (project_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_configs_project_id ON public.blueprint_configs (project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id          ON public.comments (project_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_project_id      ON public.share_tokens (project_id);

-- ============================================================================
-- 6. Seed "Financeiro Conta Azul" project and backfill project_id
-- ============================================================================

-- Insert the project linked to the existing client
-- Uses a CTE to look up the client_id dynamically (never hardcode generated IDs)
WITH client_row AS (
  SELECT id, org_id
  FROM public.clients
  WHERE slug = 'financeiro-conta-azul'
  LIMIT 1
)
INSERT INTO public.projects (slug, name, client_id, org_id)
SELECT
  'financeiro-conta-azul',
  'Financeiro Conta Azul',
  client_row.id,
  client_row.org_id
FROM client_row
ON CONFLICT (slug, org_id) DO NOTHING;

-- Backfill project_id in dependent tables where client_slug matches
-- Again, look up project_id dynamically
UPDATE public.briefing_configs
SET project_id = p.id
FROM public.projects p
WHERE briefing_configs.client_slug = 'financeiro-conta-azul'
  AND p.slug = 'financeiro-conta-azul'
  AND briefing_configs.org_id = p.org_id
  AND briefing_configs.project_id IS NULL;

UPDATE public.blueprint_configs
SET project_id = p.id
FROM public.projects p
WHERE blueprint_configs.client_slug = 'financeiro-conta-azul'
  AND p.slug = 'financeiro-conta-azul'
  AND blueprint_configs.org_id = p.org_id
  AND blueprint_configs.project_id IS NULL;

UPDATE public.comments
SET project_id = p.id
FROM public.projects p
WHERE comments.client_slug = 'financeiro-conta-azul'
  AND p.slug = 'financeiro-conta-azul'
  AND comments.org_id = p.org_id
  AND comments.project_id IS NULL;

UPDATE public.share_tokens
SET project_id = p.id
FROM public.projects p
WHERE share_tokens.client_slug = 'financeiro-conta-azul'
  AND p.slug = 'financeiro-conta-azul'
  AND share_tokens.org_id = p.org_id
  AND share_tokens.project_id IS NULL;
