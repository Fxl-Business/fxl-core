---
phase: 138-admin-ui-retention
plan: 03
subsystem: audit-retention
tags: [retention, pg_cron, platform_settings, validation]
dependency_graph:
  requires: [platform_settings, audit_logs]
  provides: [audit_retention_days setting, fn_cleanup_audit_logs, pg_cron job]
  affects: [SettingsPanel]
tech_stack:
  added: [pg_cron]
  patterns: [SECURITY DEFINER cleanup, client-side validation]
key_files:
  created:
    - supabase/migrations/029_audit_retention.sql
  modified:
    - src/platform/pages/admin/SettingsPanel.tsx
decisions:
  - "SECURITY DEFINER required for cleanup function — RLS denies DELETE on audit_logs"
  - "Retention clamped 30-365 both server-side (SQL function) and client-side (SettingsPanel validation)"
  - "pg_cron job runs daily at 03:00 UTC — off-peak for cleanup"
  - "ON CONFLICT DO NOTHING for idempotent seed — safe to re-run migration"
metrics:
  duration_seconds: 92
  completed: "2026-03-20T12:42:46Z"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 138 Plan 03: Audit Retention Policy Summary

SECURITY DEFINER cleanup function with pg_cron daily schedule and client-side 30-365 day validation in SettingsPanel.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Retention migration with seed, cleanup function, and pg_cron | 81a7fbe | supabase/migrations/029_audit_retention.sql |
| 2 | Client-side validation for audit_retention_days | c7c161a | src/platform/pages/admin/SettingsPanel.tsx |

## What Was Built

### Migration 029: Audit Retention Infrastructure
- Seeds `platform_settings` with `audit_retention_days = 90` (default)
- `fn_cleanup_audit_logs()` as SECURITY DEFINER (bypasses RLS DELETE denial)
- Function reads retention from platform_settings, clamps to 30-365, deletes old rows
- `pg_cron` extension enabled, daily job at 03:00 UTC

### SettingsPanel Validation
- `validateSettingValue()` helper validates audit_retention_days: must be number, min 30, max 365
- Validation errors shown inline in red text below input
- Save button disabled when validation fails
- "dias" label shown next to retention input

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- [x] Migration file exists with all required SQL components
- [x] SettingsPanel has no TypeScript errors (pre-existing AuditLogsPage import error is from sibling plan, not this plan)
- [x] Validation covers min 30 / max 365 with error messages
- [x] "dias" label present next to retention input
