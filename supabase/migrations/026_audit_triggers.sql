-- Migration 026: Add SECURITY DEFINER trigger functions and triggers for audit logging.
-- Captures INSERT and UPDATE on tasks and tenant_modules into audit_logs automatically.
-- SECURITY DEFINER bypasses RLS so triggers can write to the append-only audit_logs table.

-- ============================================================================
-- 1. Trigger function for tasks
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (org_id, actor_id, actor_type, action, resource_type, resource_id, resource_label, metadata)
    VALUES (
      NEW.org_id,
      COALESCE(NEW.created_by, 'system'),
      'trigger',
      'create',
      'task',
      NEW.id::text,
      NEW.title,
      jsonb_build_object('after', row_to_json(NEW)::jsonb)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (org_id, actor_id, actor_type, action, resource_type, resource_id, resource_label, metadata)
    VALUES (
      NEW.org_id,
      COALESCE(NEW.created_by, OLD.created_by, 'system'),
      'trigger',
      'update',
      'task',
      NEW.id::text,
      NEW.title,
      jsonb_build_object('before', row_to_json(OLD)::jsonb, 'after', row_to_json(NEW)::jsonb)
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. Trigger function for tenant_modules
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_tenant_modules()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (org_id, actor_id, actor_type, action, resource_type, resource_id, resource_label, metadata)
    VALUES (
      NEW.org_id,
      'system',
      'trigger',
      'create',
      'tenant_module',
      NEW.module_id,
      NEW.module_id,
      jsonb_build_object('after', row_to_json(NEW)::jsonb)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (org_id, actor_id, actor_type, action, resource_type, resource_id, resource_label, metadata)
    VALUES (
      NEW.org_id,
      'system',
      'trigger',
      'update',
      'tenant_module',
      NEW.module_id,
      NEW.module_id,
      jsonb_build_object('before', row_to_json(OLD)::jsonb, 'after', row_to_json(NEW)::jsonb)
    );
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. Triggers on monitored tables
-- ============================================================================

CREATE TRIGGER trg_audit_tasks
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION fn_audit_tasks();

CREATE TRIGGER trg_audit_tenant_modules
  AFTER INSERT OR UPDATE ON public.tenant_modules
  FOR EACH ROW EXECUTE FUNCTION fn_audit_tenant_modules();
