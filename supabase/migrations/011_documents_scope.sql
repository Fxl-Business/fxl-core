-- Migration 011: Add scope column to documents table
--
-- Scope semantics:
--   scope = 'tenant' (default): document is isolated per org_id.
--     Only users whose JWT org_id claim matches the document's org_id can read/write it.
--     This is the same behavior as all other multi-tenant tables.
--
--   scope = 'product': document is globally readable by all authenticated users,
--     regardless of org_id. Only super_admin users may create or modify product docs.
--     This enables FXL to publish product-level documentation visible to all tenants.

-- Step 1: Add scope column with NOT NULL default and CHECK constraint
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'tenant'
  CONSTRAINT documents_scope_check CHECK (scope IN ('tenant', 'product'));

-- Step 2: Backfill existing rows (safety net for any NULL values)
UPDATE public.documents SET scope = 'tenant' WHERE scope IS NULL;

-- Step 3: Drop existing combined RLS policy (from migration 009_super_admin_rls.sql)
DROP POLICY IF EXISTS "documents_org_access" ON public.documents;

-- Step 4: Create new scope-aware RLS policies (split by operation)

-- SELECT: super_admin bypass OR product docs (globally visible) OR matching org_id
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR scope = 'product'
    OR org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- INSERT: super_admin bypass OR own org_id (product docs not insertable by tenants)
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- UPDATE: super_admin bypass OR own org_id
CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- DELETE: super_admin bypass OR own org_id
CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- Step 5: Add index on scope for query performance
CREATE INDEX IF NOT EXISTS idx_documents_scope ON public.documents (scope);
