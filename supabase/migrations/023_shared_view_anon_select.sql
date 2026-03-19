-- Allow anon SELECT on projects and blueprint_configs for shared wireframe view.
-- Token validation is app-level (validateToken checks share_tokens).
-- These policies only allow reading non-archived rows.

-- projects: anon can read project id/slug for resolution
CREATE POLICY "projects_anon_select" ON public.projects
  FOR SELECT
  TO anon
  USING (archived_at IS NULL);

-- blueprint_configs: anon can read wireframe configs
CREATE POLICY "blueprint_configs_anon_select" ON public.blueprint_configs
  FOR SELECT
  TO anon
  USING (archived_at IS NULL);
