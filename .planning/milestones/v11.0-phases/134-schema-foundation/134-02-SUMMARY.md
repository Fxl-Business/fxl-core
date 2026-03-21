---
phase: 134-schema-foundation
plan: 02
subsystem: database
tags: [postgres, triggers, audit, rls, security-definer, jsonb]

# Dependency graph
requires:
  - phase: 134-01
    provides: audit_logs table with append-only RLS and composite indexes
provides:
  - fn_audit_tasks SECURITY DEFINER trigger function (INSERT/UPDATE on tasks -> audit_logs)
  - fn_audit_tenant_modules SECURITY DEFINER trigger function (INSERT/UPDATE on tenant_modules -> audit_logs)
  - trg_audit_tasks trigger on public.tasks
  - trg_audit_tenant_modules trigger on public.tenant_modules
  - migration 026_audit_triggers.sql deployed to Supabase
affects: [135-capture-layer, 136-edge-function-instrumentation, 137-query-api]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SECURITY DEFINER trigger functions bypass RLS to write to append-only tables"
    - "row_to_json(NEW/OLD)::jsonb captures full row snapshots before and after mutations"
    - "jsonb_build_object('before', ..., 'after', ...) for UPDATE diffs, 'after'-only for INSERT"
    - "COALESCE(NEW.created_by, OLD.created_by, 'system') resolves actor_id from row data"
    - "Separate migration (026) for triggers when base table migration (025) already applied"

key-files:
  created:
    - supabase/migrations/026_audit_triggers.sql
  modified:
    - supabase/migrations/025_audit_logs.sql (added note referencing 026)

key-decisions:
  - "Trigger SQL placed in migration 026 (separate from 025) because 025 was already applied to remote DB — cannot re-run idempotent table DDL"
  - "fn_audit_tenant_modules uses 'system' as actor_id (no user context available in DB-level triggers for that table)"
  - "fn_audit_tasks uses COALESCE(NEW.created_by, OLD.created_by, 'system') to handle UPDATE where created_by could be NULL"

patterns-established:
  - "Pattern: SECURITY DEFINER + SET search_path = public for all audit trigger functions"
  - "Pattern: row_to_json(ROW)::jsonb for full JSONB snapshots in metadata field"

requirements-completed:
  - AUDIT-03

# Metrics
duration: 15min
completed: 2026-03-20
---

# Phase 134 Plan 02: Audit Triggers Summary

**PostgreSQL SECURITY DEFINER triggers on tasks and tenant_modules capturing INSERT/UPDATE snapshots into audit_logs via migration 026**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-20T03:16:00Z
- **Completed:** 2026-03-20T03:31:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Created `fn_audit_tasks()` SECURITY DEFINER trigger function with INSERT (create + after snapshot) and UPDATE (update + before/after snapshots) paths
- Created `fn_audit_tenant_modules()` SECURITY DEFINER trigger function with same INSERT/UPDATE pattern, using 'system' as actor_id
- Created `trg_audit_tasks` and `trg_audit_tenant_modules` triggers on AFTER INSERT OR UPDATE
- Deployed as migration 026_audit_triggers.sql (separate from 025 since 025 was already applied remotely)
- Verified all 4 test scenarios via live Supabase REST API calls

## Task Commits

Each task was committed atomically:

1. **Task 1: Create audit trigger functions and triggers** - `6ef9201` (feat)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified

- `supabase/migrations/026_audit_triggers.sql` - SECURITY DEFINER trigger functions fn_audit_tasks + fn_audit_tenant_modules and their triggers
- `supabase/migrations/025_audit_logs.sql` - Added reference note to 026

## Decisions Made

- Trigger SQL moved to migration 026 rather than appended to 025: migration 025 was already applied to the remote DB (`db push` reported "Remote database is up to date"), so re-running 025 was not possible. Creating 026 is the standard Supabase pattern for adding DDL after a migration is applied.
- `fn_audit_tenant_modules` uses literal `'system'` as actor_id: there is no user context in DB-level triggers for `tenant_modules` (no `created_by` column). This is consistent with the plan specification.
- Both functions use `SET search_path = public` as a security hardening measure alongside `SECURITY DEFINER`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created separate migration 026 instead of appending to already-applied 025**
- **Found during:** Task 1 (Deploy step)
- **Issue:** `supabase db push --dry-run` reported "Remote database is up to date" — migration 025 was already applied and cannot be re-run
- **Fix:** Created `supabase/migrations/026_audit_triggers.sql` with all trigger SQL; pushed with `--include-all` flag
- **Files modified:** supabase/migrations/026_audit_triggers.sql (created), supabase/migrations/025_audit_logs.sql (cleaned up appended sections, added reference note)
- **Verification:** `supabase db push --dry-run` returns "Remote database is up to date" after 026 applied; REST API test confirms triggers fire correctly
- **Committed in:** 6ef9201 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Functionally identical to plan intent. All acceptance criteria met. Migration 026 is the correct Supabase pattern for this scenario.

## Issues Encountered

- `psql` not available locally; `supabase db query` targets local Docker (not running). Verification done via Supabase REST API with service role key — all 4 test scenarios confirmed working.

## User Setup Required

None - no external service configuration required. Triggers are live in Supabase.

## Next Phase Readiness

- Phase 135 (Capture Layer): `audit_logs` table + triggers are fully operational. `logAuditEvent()` service in `src/modules/admin/services/audit-service.ts` can now INSERT to audit_logs for application-level events (auth, admin actions, impersonation). Database-level events (tasks, tenant_modules mutations) are already captured automatically.
- No blockers.

---
*Phase: 134-schema-foundation*
*Completed: 2026-03-20*
