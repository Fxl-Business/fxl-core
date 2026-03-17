---
phase: 64-supabase-schema-migrations
plan: "01"
subsystem: database
tags: [postgres, rls, multi-tenant, supabase, org_id]

requires:
  - phase: none
    provides: first phase of v3.1

provides:
  - tenant_modules table with (org_id, module_id) PK
  - org_id column on all 7 existing tables
  - RLS policies filtering by org_id from JWT claims
  - Anon fallback for backward-compatible dev/staging access
  - org_id indexes on all 8 tables

affects: [phase-65-clerk-orgs, phase-66-module-system, phase-67-integration]

tech-stack:
  added: []
  patterns: [COALESCE-based RLS for anon fallback, org_id tenant isolation]

key-files:
  created:
    - supabase/migrations/008_multi_tenant_schema.sql
  modified: []

key-decisions:
  - "Used COALESCE(nullif(current_setting, '')::jsonb->>'org_id', org_id) pattern for anon fallback instead of separate anon/authenticated policies"
  - "Single FOR ALL policy per table instead of per-operation policies (simpler, same effect)"
  - "Migration numbered 008 (not 005 as originally suggested) to follow existing sequence 001-007"
  - "knowledge_entries table included despite KB removal in v3.0 — table still exists in DB from migration 005"

patterns-established:
  - "RLS anon fallback: COALESCE pattern allows anon key access while enforcing org isolation when JWT present"
  - "org_id default: all new rows get 'org_fxl_default' unless explicitly set"

requirements-completed: [SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04]

duration: 3min
completed: 2026-03-17
---

# Phase 64: Supabase Schema & Migrations Summary

**Multi-tenant schema migration with tenant_modules table, org_id on all 7 existing tables, COALESCE-based RLS policies for org isolation with anon fallback, and org_id indexes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T01:00:22Z
- **Completed:** 2026-03-17T01:03:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created `tenant_modules` table with (org_id, module_id) composite PK, enabled boolean, config jsonb
- Added `org_id text NOT NULL DEFAULT 'org_fxl_default'` to all 7 existing tables
- Backfill migration ensures no NULL org_id values
- Replaced all anon-permissive RLS policies with org_id-aware policies using COALESCE pattern
- Anon fallback: when no JWT claims present (anon key), all rows are accessible (backward compat)
- Created org_id indexes on all 8 tables

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration file** - `2259567` (infra)

## Files Created/Modified
- `supabase/migrations/008_multi_tenant_schema.sql` - Complete multi-tenant schema migration (249 lines)

## Decisions Made
- **COALESCE pattern for anon fallback:** Instead of maintaining separate anon and authenticated policies, used a single `FOR ALL` policy per table with `COALESCE(nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id', org_id) = org_id`. When JWT has org_id, it filters. When anon (empty claims), self-reference evaluates to true.
- **Single policy per table:** Replaced multiple per-operation policies (SELECT, INSERT, UPDATE, DELETE) with a single `FOR ALL` policy. Simpler to maintain and same security effect.
- **Migration number 008:** The prompt suggested 005, but existing migrations go up to 007. Used 008 to maintain proper sequence.
- **Included knowledge_entries:** Despite KB being removed in v3.0, the table still exists from migration 005. Added org_id for completeness.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected migration file number from 005 to 008**
- **Found during:** Task 1
- **Issue:** Prompt specified `005_multi_tenant_schema.sql` but migrations 005-007 already exist
- **Fix:** Used `008_multi_tenant_schema.sql` to follow existing sequence
- **Files modified:** supabase/migrations/008_multi_tenant_schema.sql
- **Verification:** File sits after 007 in lexicographic order
- **Committed in:** 2259567

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary correction to avoid migration ordering conflict. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Migration applies via `make migrate`.

## Next Phase Readiness
- All tables have org_id columns and RLS policies ready for org-scoped JWT access
- Phase 65 (Clerk Organizations + Token Exchange) can proceed to create the Edge Function that mints JWTs with org_id claims
- Phase 66 (Module System) can use tenant_modules table once Phase 65 provides the org-scoped Supabase client

---
*Phase: 64-supabase-schema-migrations*
*Completed: 2026-03-17*

## Self-Check: PASSED

- FOUND: supabase/migrations/008_multi_tenant_schema.sql
- FOUND: commit 2259567
- FOUND: .planning/phases/64-supabase-schema-migrations/64-01-SUMMARY.md
