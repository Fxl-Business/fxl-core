-- Allow anonymous users (shared wireframe guests) to insert comments.
-- Restricted to author_role = 'cliente' to prevent impersonation of operators.
CREATE POLICY "comments_anon_insert" ON public.comments
  FOR INSERT
  TO anon
  WITH CHECK (author_role = 'cliente');

-- Also allow anon to read comments (for shared wireframe view)
CREATE POLICY "comments_anon_select" ON public.comments
  FOR SELECT
  TO anon
  USING (archived_at IS NULL);
