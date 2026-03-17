---
phase: 076-admin-shell-dashboard
plan: 02
subsystem: ui
tags: [react, clerk, admin, dashboard, metrics, useOrganizationList]

# Dependency graph
requires:
  - phase: 076-01
    provides: AdminLayout shell, AdminSidebar, useAdminMode hook, AppRouter /admin/* route group
  - phase: 075-auth-rls-foundation
    provides: SuperAdminRoute guard
provides:
  - AdminDashboard page at /admin with three metric cards (Tenants, Usuarios, Media modulos/tenant)
  - MetricCard internal component with loading skeleton and optional href link
  - Quick links section with navigation to /admin/tenants and /admin/modules
affects:
  - 077, 078, 079 (admin area now has a real landing page; downstream admin pages follow same visual pattern)
  - 080 (verification phase will test /admin dashboard metrics)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useOrganizationList with infinite:true used as approximation for total tenant count (super admin is member of all orgs)
    - membersCount accessed via Clerk Organization type cast for user count aggregation
    - MetricCard internal (non-exported) component with animate-pulse skeleton for async data

key-files:
  created:
    - src/platform/pages/admin/AdminDashboard.tsx
  modified: []

key-decisions:
  - "useOrganizationList as tenant count proxy: returns orgs the current user belongs to — for super admin this approximates total tenants; accurate count via Clerk Backend API deferred to Phase 79 (MCP)"
  - "membersCount cast: Clerk Organization type may not expose membersCount directly; cast to { membersCount?: number } for safe access with 0 fallback"

patterns-established:
  - "Admin dashboard pages use max-w-5xl container with space-y-8 vertical rhythm"
  - "Metric cards link directly to their management section (/admin/tenants, /admin/modules) via href prop"

requirements-completed: [ADMIN-01]

# Metrics
duration: 10min
completed: 2026-03-17
---

# Phase 76 Plan 02: Admin Shell Dashboard Summary

**AdminDashboard page at /admin displaying live platform metrics — tenant count via useOrganizationList, user count aggregated from membersCount, per-tenant module average from Supabase tenant_modules**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-17T18:30:00Z
- **Completed:** 2026-03-17T18:40:00Z
- **Tasks:** 2 (1 auto + 1 checkpoint)
- **Files modified:** 1 (created)

## Accomplishments
- AdminDashboard replaces Plan 01 placeholder with full implementation
- Three metric cards render real data: Tenants (Clerk orgs), Usuarios (membersCount sum), Media modulos/tenant (per-tenant average from Supabase)
- Loading skeleton (animate-pulse) shown while Clerk organizations and module data load
- Quick links section provides direct navigation to Tenants and Modules management panels
- Human verification checkpoint confirmed visual correctness and toggle behavior
- Post-review fix: replaced global MODULE_REGISTRY count with per-tenant average queried from tenant_modules table (opt-out model respected)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AdminDashboard page with platform metrics** - `9f132fd` (feat)
2. **Task 2: Verify admin shell and dashboard** - N/A (checkpoint, approved by user)

**Plan metadata:** (docs commit after summary)

## Files Created/Modified
- `src/platform/pages/admin/AdminDashboard.tsx` — Dashboard with MetricCard grid, Clerk org metrics, MODULE_REGISTRY count, quick links

## Decisions Made
- Clerk's `useOrganizationList` used as tenant count proxy: since super admin belongs to all orgs, count approximates total tenants. Accurate platform-wide count requires Clerk Backend API (Phase 79/MCP).
- `membersCount` accessed via type cast `(m.organization as { membersCount?: number }).membersCount` with 0 fallback to handle Clerk type constraints cleanly without using `any`.
- Module metric changed from global MODULE_REGISTRY count to per-tenant average from Supabase tenant_modules table, respecting opt-out model (modules not in DB = enabled by default).

## Deviations from Plan

### Post-Review Fix
**Module metric changed from global count to per-tenant average**
- **Found during:** Visual verification by user
- **Issue:** Module metric used `MODULE_REGISTRY.filter(isEnabled)` which showed global count from current user context, not per-tenant data. Modules are managed per-tenant via `tenant_modules` table.
- **Fix:** Query `tenant_modules` from Supabase (super admin has RLS bypass), group by org_id, compute average active modules per tenant respecting opt-out model
- **Files modified:** src/platform/pages/admin/AdminDashboard.tsx
- **Verification:** npx tsc --noEmit exits 0

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 76 (Admin Shell & Dashboard) is fully complete: shell (Plan 01) + dashboard metrics (Plan 02)
- Phases 77, 78, 79 are independent and can now run in parallel
- AdminDashboard metric cards link to /admin/tenants and /admin/modules — those routes show placeholders until Phase 77/78

## Self-Check: PASSED

- src/platform/pages/admin/AdminDashboard.tsx — FOUND
- Commit 9f132fd — FOUND

---
*Phase: 076-admin-shell-dashboard*
*Completed: 2026-03-17*
