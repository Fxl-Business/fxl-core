-- Migration 029: Audit log retention policy
-- Seeds platform_settings with audit_retention_days,
-- creates SECURITY DEFINER cleanup function,
-- schedules daily pg_cron job.

-- ============================================================================
-- 1. Seed the retention setting (idempotent — skip if exists)
-- ============================================================================

INSERT INTO platform_settings (key, value, description, updated_at)
VALUES (
  'audit_retention_days',
  '90',
  'Number of days to retain audit logs before automatic cleanup (min 30, max 365)',
  NOW()
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. Create SECURITY DEFINER function to clean up old audit logs
-- ============================================================================
-- SECURITY DEFINER is required because RLS on audit_logs denies DELETE for all roles.
-- We validate at application layer since platform_settings.value is text and holds
-- many different settings. Server-side validation happens inside the cleanup function.

CREATE OR REPLACE FUNCTION fn_cleanup_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  retention_days integer;
  raw_value text;
BEGIN
  -- Read retention period from platform_settings
  SELECT value INTO raw_value
  FROM platform_settings
  WHERE key = 'audit_retention_days';

  -- Default to 90 if not found or invalid
  retention_days := COALESCE(NULLIF(raw_value, '')::integer, 90);

  -- Clamp to valid range: 30-365
  IF retention_days < 30 THEN
    retention_days := 30;
  ELSIF retention_days > 365 THEN
    retention_days := 365;
  END IF;

  -- Delete audit logs older than retention period
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (retention_days || ' days')::interval;
END;
$$;

-- ============================================================================
-- 3. Enable pg_cron extension (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- 4. Schedule daily cleanup at 03:00 UTC
-- ============================================================================
-- cron.schedule is idempotent when called with same job name

SELECT cron.schedule(
  'audit-logs-cleanup',           -- job name (unique identifier)
  '0 3 * * *',                     -- daily at 03:00 UTC
  'SELECT fn_cleanup_audit_logs()'  -- function call
);
