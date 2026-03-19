-- Migration 020: Fix documents RLS — product docs super_admin only, remove anon fallback
--
-- Fixes two security issues carried over from migrations 011 and 013:
-- 1. scope='product' was readable by any authenticated user (should be super_admin only)
-- 2. anon role was still granted access (documents require authenticated JWT in Nexo)
--
-- After this migration:
-- - Super admin (super_admin='true' in JWT) sees ALL documents (bypass)
-- - Tenant members see only their org's tenant docs (scope='tenant' AND matching org_id)
-- - Product docs (scope='product') are visible ONLY to super_admin (covered by bypass)
-- - No anon access — all policies use TO authenticated only

-- Step 1: Drop all four document policies from migration 013
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- Step 2: Recreate SELECT with correct scoping
-- Super admin sees everything (bypass).
-- Tenant members see their org's tenant docs only.
-- Product docs: only super_admin (covered by the first clause).
-- No anon fallback — documents require an authenticated JWT with org_id.
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );

-- Step 3: Recreate INSERT (super_admin or own org tenant docs, authenticated only)
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );

-- Step 4: Recreate UPDATE (super_admin or own org tenant docs, authenticated only)
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );

-- Step 5: Recreate DELETE (super_admin or own org tenant docs, authenticated only)
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );
