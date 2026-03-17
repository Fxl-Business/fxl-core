---
phase: 076-admin-shell-dashboard
plan: 01
subsystem: ui
tags: [react, react-router, clerk, admin, layout, navigation]

# Dependency graph
requires:
  - phase: 075-auth-rls-foundation
    provides: SuperAdminRoute guard + super_admin publicMetadata check
provides:
  - AdminLayout shell with AdminSidebar + TopNav + Outlet
  - AdminSidebar with 6 nav links (Dashboard, Tenants, Modules, Connectors, Product Docs, Settings)
  - useAdminMode hook for super_admin detection and mode toggle
  - AppRouter /admin/* route group wrapped in SuperAdminRoute + AdminLayout
  - TopNav admin/operator toggle button visible only to super_admin users
affects:
  - 076-02 (AdminDashboard will flesh out the placeholder created here)
  - 077, 078, 079 (admin navigation shell context for all downstream phases)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useAdminMode hook centralizes super_admin check + route detection + toggle logic
    - Admin routes use SuperAdminRoute directly (no ProtectedRoute wrapper) since SuperAdminRoute already checks isSignedIn
    - AdminLayout mirrors Layout.tsx structure — same component hierarchy, different sidebar

key-files:
  created:
    - src/platform/hooks/useAdminMode.ts
    - src/platform/layout/AdminSidebar.tsx
    - src/platform/layout/AdminLayout.tsx
    - src/platform/pages/admin/AdminDashboard.tsx
  modified:
    - src/platform/router/AppRouter.tsx
    - src/platform/layout/TopNav.tsx

key-decisions:
  - "useAdminMode uses useUser() + publicMetadata.super_admin (not sessionClaims) — consistent with Phase 75 SuperAdminRoute decision"
  - "Admin routes: SuperAdminRoute wraps AdminLayout directly (removed redundant ProtectedRoute wrapper since SuperAdminRoute already checks auth)"
  - "AdminDashboard created as placeholder in Plan 01 so AppRouter lazy import compiles; Plan 02 will flesh it out"

patterns-established:
  - "Admin area has its own layout (AdminLayout) separate from operator Layout — same shell structure, different sidebar"
  - "useAdminMode hook is the single source of truth for isSuperAdmin, isAdminRoute, toggleMode across the app"

requirements-completed: [ADMIN-02, UX-01, UX-02]

# Metrics
duration: 15min
completed: 2026-03-17
---

# Phase 76 Plan 01: Admin Shell Dashboard Summary

**Admin navigation shell with dedicated AdminSidebar (6 links), AdminLayout, useAdminMode hook, updated AppRouter /admin/* group, and TopNav toggle visible only to super_admin users**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-17T18:10:00Z
- **Completed:** 2026-03-17T18:25:00Z
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments
- useAdminMode hook centralizes super_admin detection + mode toggle logic
- AdminSidebar with 6 nav links renders dedicated admin navigation context
- AdminLayout mirrors Layout.tsx but uses AdminSidebar instead of Sidebar
- AppRouter /admin/* routes wrapped in SuperAdminRoute + lazy AdminLayout (removed old ProtectedRoute>SuperAdminRoute>Layout composition)
- TopNav toggle button shows only for super_admin, switches between /admin and / via client-side navigation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useAdminMode hook, AdminSidebar, AdminLayout, AdminDashboard placeholder** - `86a361f` (feat)
2. **Task 2: Wire admin routes in AppRouter and add toggle to TopNav** - `d112bb4` (feat)

**Plan metadata:** (docs commit after summary)

## Files Created/Modified
- `src/platform/hooks/useAdminMode.ts` — Hook: isSuperAdmin, isAdminRoute, toggleMode
- `src/platform/layout/AdminSidebar.tsx` — Sidebar with 6 admin nav links
- `src/platform/layout/AdminLayout.tsx` — TopNav + AdminSidebar + Outlet shell
- `src/platform/pages/admin/AdminDashboard.tsx` — Placeholder for Plan 02
- `src/platform/router/AppRouter.tsx` — /admin/* route group with SuperAdminRoute + AdminLayout
- `src/platform/layout/TopNav.tsx` — Admin/operator toggle button for super_admin users

## Decisions Made
- useAdminMode uses `useUser() + publicMetadata.super_admin` (not sessionClaims) to be consistent with Phase 75's SuperAdminRoute decision
- Removed the old `ProtectedRoute > SuperAdminRoute > Layout` composition for admin routes — SuperAdminRoute already checks `isSignedIn` so ProtectedRoute was redundant
- AdminDashboard placeholder created in this plan (not Plan 02) so the lazy import in AppRouter compiles without error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Created AdminDashboard placeholder**
- **Found during:** Task 2 (AppRouter wiring)
- **Issue:** AppRouter lazy-imports `AdminDashboard` from `@platform/pages/admin/AdminDashboard` but the file didn't exist — build would fail at runtime and TypeScript would resolve the import
- **Fix:** Created minimal AdminDashboard.tsx placeholder; Plan 02 will replace it with full implementation
- **Files modified:** src/platform/pages/admin/AdminDashboard.tsx
- **Verification:** npx tsc --noEmit exits 0
- **Committed in:** 86a361f (Task 1 commit)

**2. [Rule 1 - Bug] Removed redundant ProtectedRoute wrapper from admin routes**
- **Found during:** Task 2 (AppRouter wiring)
- **Issue:** Plan specified `SuperAdminRoute wraps AdminLayout directly` but existing code used `ProtectedRoute > SuperAdminRoute > Layout`. SuperAdminRoute already checks `isSignedIn`, so ProtectedRoute was a redundant double-auth check
- **Fix:** Admin route group uses `<SuperAdminRoute><AdminLayout /></SuperAdminRoute>` directly, matching plan spec
- **Files modified:** src/platform/router/AppRouter.tsx
- **Verification:** Routing logic correct, npx tsc --noEmit exits 0
- **Committed in:** d112bb4 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both essential for correctness. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin shell complete; Plan 02 (AdminDashboard content) can proceed
- AdminLayout + AdminSidebar + useAdminMode ready for all downstream admin pages
- Placeholder routes for /admin/tenants, /admin/product-docs, /admin/settings ready for wiring in later plans

## Self-Check: PASSED

- src/platform/hooks/useAdminMode.ts — FOUND
- src/platform/layout/AdminSidebar.tsx — FOUND
- src/platform/layout/AdminLayout.tsx — FOUND
- src/platform/pages/admin/AdminDashboard.tsx — FOUND
- Commit 86a361f — FOUND
- Commit d112bb4 — FOUND

---
*Phase: 076-admin-shell-dashboard*
*Completed: 2026-03-17*
