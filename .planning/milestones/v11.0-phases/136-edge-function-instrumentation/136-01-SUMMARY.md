---
phase: 136-edge-function-instrumentation
plan: "01"
subsystem: audit-logging
tags: [edge-functions, audit, supabase, deno]
dependency_graph:
  requires: [134-01, 135-A]
  provides: [audit-edge-instrumentation]
  affects: [admin-tenants, admin-users, audit_logs]
tech_stack:
  added: []
  patterns: [never-throw audit helper, shared _shared/ Deno module, extract-audit-context pattern]
key_files:
  created:
    - supabase/migrations/027_audit_action_expand.sql
    - supabase/functions/_shared/audit.ts
  modified:
    - src/platform/types/audit.ts
    - supabase/functions/admin-tenants/index.ts
    - supabase/functions/admin-users/index.ts
decisions:
  - "actor_type uses 'user' (not 'super_admin') because DB CHECK on actor_type only allows user|system|trigger"
  - "action for impersonation is 'impersonate' (not 'impersonate_start') to match DB CHECK constraint"
  - "AuditActorType 'admin' dropped — was never in DB CHECK, now matches constraint exactly"
  - "admin-users is read-only so only imports audit helper; no instrumentation applied per spec"
  - "metadata: null passed explicitly for remove_member since there is no role data to record"
metrics:
  duration_seconds: 385
  completed_date: "2026-03-20"
  tasks_completed: 3
  files_modified: 5
---

# Phase 136 Plan 01: Edge Function Instrumentation Summary

**One-liner:** Instrumented admin-tenants with 6 audit event calls using shared Deno helper after expanding DB CHECK constraint for add_member and remove_member actions.

## What Was Built

Migration 027 expanded the `audit_logs.action` CHECK constraint to include `add_member` and `remove_member`. A shared Deno module `supabase/functions/_shared/audit.ts` was created with `logAuditEvent` (never-throw) and `extractAuditContext` helpers. All 6 mutation handlers in `admin-tenants` were instrumented. `admin-users` received the helper import and `getSupabaseAdmin` infrastructure ready for future mutations.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Expand DB CHECK constraint and sync TypeScript types | ee4819e | supabase/migrations/027_audit_action_expand.sql, src/platform/types/audit.ts |
| 2 | Create shared audit helper and instrument admin-tenants | a577d1f | supabase/functions/_shared/audit.ts, supabase/functions/admin-tenants/index.ts |
| 3 | Add audit helper import to admin-users | 8e3fe57 | supabase/functions/admin-users/index.ts |

## Decisions Made

1. `actor_type` uses `'user'` (not `'super_admin'`) — DB CHECK on `actor_type` only allows `user|system|trigger`, super_admin is not a valid value.
2. Impersonation action is `'impersonate'` — the prior plan mentioned `'impersonate_start'` but that is not in the DB CHECK constraint; `'impersonate'` is the correct value.
3. `AuditActorType` `'admin'` dropped from TypeScript type — was never in the DB CHECK, was an orphan value.
4. `admin-users` is currently read-only (GET only) — only imports the helper infrastructure; no read handlers are instrumented (by design per REQUIREMENTS).
5. Empty metadata stored as `null` — consistent with Phase 135-A decision to avoid noisy empty JSONB.

## Verification Results

- Migration 027 applied to remote DB via `supabase db push`
- `AuditAction` and `AuditActorType` types exactly match DB CHECK constraints
- `supabase/functions/_shared/audit.ts` has `logAuditEvent` and `extractAuditContext` exports
- `admin-tenants` has exactly 6 `await logAuditEvent` calls (create, archive, restore, add_member, remove_member, impersonate)
- `admin-users` has import and `getSupabaseAdmin` but zero `logAuditEvent` calls
- No `throw` in `logAuditEvent` body (only `console.error`)
- `npx tsc --noEmit` passes with zero errors
- Both functions deployed to Supabase via `supabase functions deploy`

## Deviations from Plan

None — plan executed exactly as written. The `actor_type` and `action` value choices were already clarified in the plan's "IMPORTANT CHANGES FROM ORIGINAL PLAN" section.

## Self-Check: PASSED
