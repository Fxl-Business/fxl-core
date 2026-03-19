-- Fix: split the catch-all RLS policy on share_tokens into separate policies
-- so that anonymous users can validate tokens via SELECT while org-scoped
-- access is enforced for INSERT/UPDATE/DELETE.

-- Drop the existing catch-all policy
DROP POLICY IF EXISTS "share_tokens_org_access" ON public.share_tokens;

-- 1. Authenticated org-scoped access (all operations)
CREATE POLICY "share_tokens_org_access" ON public.share_tokens
  FOR ALL
  TO authenticated
  USING (
    (COALESCE(((NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'super_admin'), 'false') = 'true')
    OR (
      ((NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'org_id') = org_id
      AND archived_at IS NULL
    )
  )
  WITH CHECK (
    (COALESCE(((NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'super_admin'), 'false') = 'true')
    OR (
      ((NULLIF(current_setting('request.jwt.claims', true), ''))::jsonb ->> 'org_id') = org_id
      AND archived_at IS NULL
    )
  );

-- 2. Anon can SELECT tokens for validation (only non-revoked, non-expired)
CREATE POLICY "share_tokens_anon_validate" ON public.share_tokens
  FOR SELECT
  TO anon
  USING (
    revoked = false
    AND expires_at > now()
    AND archived_at IS NULL
  );
