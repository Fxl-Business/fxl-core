-- Migration 010: Platform settings (key/value store for feature flags and config)
-- Super admin can read/write; all authenticated users can read (feature flags).

-- ============================================================================
-- 1. Create platform_settings table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key         text        PRIMARY KEY,
  value       text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. RLS policies
-- ============================================================================

-- Read: any authenticated or anon user can read (feature flags need to be readable)
CREATE POLICY "platform_settings_read" ON public.platform_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- Write (insert/update/delete): only super_admin
CREATE POLICY "platform_settings_write" ON public.platform_settings
  FOR ALL TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
  );

-- ============================================================================
-- 3. Seed initial settings
-- ============================================================================

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('feature.tenant_self_service', 'false', 'Allow tenants to self-register'),
  ('feature.module_marketplace', 'false', 'Enable module marketplace for tenants'),
  ('platform.maintenance_mode', 'false', 'Put platform in maintenance mode'),
  ('platform.max_tenants', '100', 'Maximum number of tenants allowed')
ON CONFLICT (key) DO NOTHING;
