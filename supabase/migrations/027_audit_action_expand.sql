-- Migration 027: Expand audit_logs.action CHECK constraint for member management actions.
-- Adds 'add_member' and 'remove_member' to the allowed action values.
-- These are required for admin-tenants edge function instrumentation (Phase 136).

ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_action_check;

ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN (
    'create', 'update', 'delete', 'archive', 'restore',
    'sign_in', 'sign_out', 'impersonate',
    'add_member', 'remove_member'
  ));
