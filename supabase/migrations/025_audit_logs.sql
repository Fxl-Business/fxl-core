-- Migration 025: Create audit_logs table with immutable RLS and composite indexes.
-- Append-only: INSERT and SELECT allowed, UPDATE and DELETE denied by RLS.
-- SELECT uses super_admin bypass pattern from migration 009.
-- Note: Trigger functions and triggers are in migration 026_audit_triggers.sql.

-- ============================================================================
-- 1. Create table
-- ============================================================================

CREATE TABLE public.audit_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          text        NOT NULL,
  actor_id        text        NOT NULL,
  actor_email     text,
  actor_type      text        NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'system', 'trigger')),
  action          text        NOT NULL CHECK (action IN ('create', 'update', 'delete', 'archive', 'restore', 'sign_in', 'sign_out', 'impersonate')),
  resource_type   text        NOT NULL,
  resource_id     text,
  resource_label  text,
  ip_address      text,
  user_agent      text,
  metadata        jsonb       NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. Enable RLS
-- ============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS policies (append-only: INSERT + SELECT only, NO UPDATE, NO DELETE)
-- ============================================================================

-- INSERT policy: allows triggers and app layer to insert
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- SELECT policy: super_admin bypass OR org_id match (same pattern as migration 009)
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- NOTE: No UPDATE policy and no DELETE policy — RLS denies both by default when enabled.
-- This enforces append-only immutability on audit_logs.

-- ============================================================================
-- 4. Composite indexes
-- ============================================================================

CREATE INDEX idx_audit_logs_org_created    ON public.audit_logs (org_id, created_at DESC);
CREATE INDEX idx_audit_logs_actor          ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_action         ON public.audit_logs (action);
CREATE INDEX idx_audit_logs_resource_type  ON public.audit_logs (resource_type);
CREATE INDEX idx_audit_logs_metadata       ON public.audit_logs USING GIN (metadata);
