---
phase: 83-onboarding-flow
plan: 01
subsystem: auth
tags: [clerk, react, onboarding, org-mode, routing, react-router]

# Dependency graph
requires:
  - phase: 81-docs-data-model
    provides: isOrgMode() auth config and org-scoped architecture
provides:
  - CriarEmpresa page: full-screen onboarding form that creates a Clerk org and redirects to /
  - SemModulos page: empty state when tenant has zero enabled modules
  - ProtectedRoute org gate: redirects signed-in no-org users to /criar-empresa in org mode
  - AuthOnlyRoute component: thin auth guard without org check (prevents redirect loop)
  - Home.tsx no-modules gate: renders SemModulos when enabledModules.size === 0 in org mode
affects: [84-tenant-data-migration, any phase that touches ProtectedRoute or AppRouter routing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AuthOnlyRoute: thin guard checking isSignedIn only, used for routes accessible before org creation"
    - "isOrgMode() guard wraps any org-specific behavior to preserve anon mode compatibility"

key-files:
  created:
    - src/platform/pages/CriarEmpresa.tsx
    - src/platform/pages/SemModulos.tsx
  modified:
    - src/platform/auth/ProtectedRoute.tsx
    - src/platform/router/AppRouter.tsx
    - src/platform/pages/Home.tsx

key-decisions:
  - "AuthOnlyRoute instead of Clerk SignedIn component — SignedIn is not exported by @clerk/react in this version"
  - "CriarEmpresa uses useOrganizationList().createOrganization + setActive then navigate('/') for immediate org activation"
  - "isOrgMode() guard on SemModulos check prevents empty state in anon mode where all modules are considered enabled"

patterns-established:
  - "No-org gate lives in ProtectedRoute, not in individual pages — central enforcement point"
  - "Onboarding routes (pre-org) use AuthOnlyRoute, not ProtectedRoute, to avoid redirect loops"

requirements-completed: [ONB-01, ONB-02, ONB-03]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 83 Plan 01: Onboarding Flow Summary

**Clerk org creation form at /criar-empresa + SemModulos empty state + ProtectedRoute org gate preventing blank UI for new users**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-17T21:00:30Z
- **Completed:** 2026-03-17T21:03:00Z
- **Tasks:** 2 (checkpoint skipped per user instruction)
- **Files modified:** 5

## Accomplishments

- CriarEmpresa.tsx: full-screen centered page matching Login.tsx visual style, with company name + optional slug form using `useOrganizationList().createOrganization` + `setActive` + `navigate('/')`
- SemModulos.tsx: static empty state with Layers icon rendered inside the Layout shell when tenant has zero enabled modules
- ProtectedRoute extended with `useOrganizationList` to detect no-org state and redirect to `/criar-empresa` in org mode
- AppRouter: `/criar-empresa` route wired outside ProtectedRoute using `AuthOnlyRoute` (avoids redirect loop)
- Home.tsx: `SemModulos` rendered when `enabledModuleSet.size === 0` after loading, org mode only

## Task Commits

1. **Task 1: Create CriarEmpresa and SemModulos pages** - `6c43241` (feat)
2. **Task 2: Wire routing** - `ff273ea` (app)

**Plan metadata:** (created next)

## Files Created/Modified

- `src/platform/pages/CriarEmpresa.tsx` - Full-screen onboarding form using Clerk createOrganization + setActive
- `src/platform/pages/SemModulos.tsx` - Static empty state with Layers icon for tenants with no enabled modules
- `src/platform/auth/ProtectedRoute.tsx` - Extended to redirect no-org users to /criar-empresa in org mode
- `src/platform/router/AppRouter.tsx` - Added AuthOnlyRoute component + /criar-empresa route outside ProtectedRoute
- `src/platform/pages/Home.tsx` - Added no-modules gate: renders SemModulos when enabledModules.size === 0

## Decisions Made

- **AuthOnlyRoute over Clerk SignedIn**: `SignedIn` is not exported by `@clerk/react` in this project version. Built a minimal `AuthOnlyRoute` inline in AppRouter.tsx that checks only `isSignedIn` (no org check).
- **isOrgMode() guard on SemModulos**: prevents the empty state from showing in anon mode where all modules are enabled by default via `AnonModuleEnabledProvider`.
- **useActiveOrg() for already-has-org redirect**: CriarEmpresa checks `orgs.length > 0` from `useActiveOrg()` and redirects to `/` immediately to prevent users who already have an org from seeing the creation form.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] SignedIn not exported from @clerk/react**
- **Found during:** Task 2 (AppRouter wiring)
- **Issue:** Plan specified `<SignedIn>` from `@clerk/react` but the package does not export that component in this version
- **Fix:** Implemented inline `AuthOnlyRoute` component in AppRouter.tsx using `useAuth()` — same behavior, no new file needed
- **Files modified:** src/platform/router/AppRouter.tsx
- **Verification:** `npx tsc --noEmit` passes zero errors
- **Committed in:** ff273ea (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Equivalent implementation, no scope change. AuthOnlyRoute is more explicit and type-safe than the Clerk component would have been.

## Issues Encountered

None beyond the SignedIn export issue above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 83-01 complete: onboarding flow for new users (no org) and empty-module tenants
- Phase 84 (Tenant Data Migration) depends on Phase 83 — real org must exist before data migration. This plan satisfies that prerequisite.
- User verification pending (skipped checkpoint per instruction — user will verify 83-01 and 83-02 together)

---
*Phase: 83-onboarding-flow*
*Completed: 2026-03-17*
