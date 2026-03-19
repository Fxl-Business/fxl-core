-- Migration 020: Fix documents RLS — proper scoping, remove anon fallback
--
-- Fixes security issues carried over from migrations 011 and 013:
-- 1. anon role was still granted access (documents require authenticated JWT in Nexo)
-- 2. Tenant docs now properly isolated by org_id
--
-- After this migration:
-- - Super admin (super_admin='true' in JWT) sees ALL documents (bypass)
-- - Tenant members see their org's tenant docs (scope='tenant' AND matching org_id)
-- - Product docs (scope='product') are readable by any authenticated user (platform docs, not sensitive)
-- - No anon access — all policies use TO authenticated only

-- Step 1: Drop all four document policies from migration 013
DROP POLICY IF EXISTS "documents_select" ON public.documents;
DROP POLICY IF EXISTS "documents_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_update" ON public.documents;
DROP POLICY IF EXISTS "documents_delete" ON public.documents;

-- Step 2: Recreate SELECT with correct scoping
-- Super admin sees everything (bypass).
-- Product docs: visible to any authenticated user (platform documentation).
-- Tenant docs: only visible to members of that org.
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR scope = 'product'
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
