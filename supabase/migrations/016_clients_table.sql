-- Migration 016: Create clients table
-- Stores org-scoped client records as the source of truth for the Clients module UI.
-- Replaces the hardcoded CLIENTS array in ClientsIndex.tsx.
--
-- RLS pattern: strict org_id match from JWT (same as migration 013).
-- No anon fallback — JWT must carry org_id claim.

-- ============================================================================
-- 1. Create clients table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text        NOT NULL,
  name        text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  org_id      text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, org_id)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_org_id ON public.clients (org_id);

-- ============================================================================
-- 3. RLS policies — strict org_id match + super_admin bypass (pattern from 013)
-- ============================================================================

CREATE POLICY "clients_select" ON public.clients
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

CREATE POLICY "clients_update" ON public.clients
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

CREATE POLICY "clients_delete" ON public.clients
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- ============================================================================
-- 4. Seed existing client (FXL org — org_fxl_default as placeholder)
-- This seed is intentionally idempotent: ON CONFLICT DO NOTHING.
-- Phase 106 will re-associate these rows to the correct real org_id.
-- ============================================================================

INSERT INTO public.clients (slug, name, description, org_id)
VALUES (
  'financeiro-conta-azul',
  'Financeiro Conta Azul',
  'Dashboard financeiro — Conta Azul',
  'org_fxl_default'
)
ON CONFLICT (slug, org_id) DO NOTHING;
