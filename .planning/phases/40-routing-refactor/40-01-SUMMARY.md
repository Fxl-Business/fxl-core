---
phase: 40-routing-refactor
plan: 01
subsystem: ui
tags: [react, react-router, sidebar, modules, enabled, navlink]

# Dependency graph
requires:
  - phase: 38-module-registry-foundation
    provides: ModuleEnabledProvider, useModuleEnabled() hook, ModuleDefinition with id: ModuleId
  - phase: 39-slot-architecture-contract-types
    provides: ModuleEnabledProvider wired into App.tsx above Routes

provides:
  - Sidebar.tsx filters MODULE_REGISTRY by isEnabled(m.id) via useModuleEnabled hook
  - Home NavLink with end prop — only highlighted at exact / path
  - Route audit confirmation: / -> Home, doc routes via moduleRoutes, vercel.json SPA rewrite present

affects: [phase-41-home-control-center, phase-42-contract-population]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sidebar-enabled-filtering: useMemo inside Sidebar component filters MODULE_REGISTRY by isEnabled(m.id) from useModuleEnabled context — reactive to runtime toggles"
    - "navlink-end-prop: NavLink to='/' must have end prop in React Router v6 to avoid matching all routes as prefix"

key-files:
  created: []
  modified:
    - src/components/layout/Sidebar.tsx

key-decisions:
  - "useModuleEnabled hook used for sidebar filtering (not static enabled field on manifest) — sidebar reacts to runtime module toggles from localStorage"
  - "navigationFromRegistry moved inside Sidebar component body wrapped in useMemo([isEnabled]) — required to consume hook inside component"
  - "Route audit confirms all existing routes work without modification — only Sidebar.tsx changed"

patterns-established:
  - "sidebar-hook-filter: Dynamic sidebar items computed inside component via useMemo + useModuleEnabled, never at module scope"

requirements-completed: [ROUT-01, ROUT-02, ROUT-03]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 40 Plan 01: Routing Refactor Summary

**Sidebar nav filtered by runtime module enabled state via useModuleEnabled hook, and Home NavLink fixed with end prop to prevent false active state on all routes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T04:47:56Z
- **Completed:** 2026-03-13T04:49:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Home NavLink in Sidebar now uses `end` prop — only highlighted at exact `/` path, not on every sub-route (React Router v6 prefix matching bug fixed)
- Sidebar navigation derived from `useModuleEnabled()` hook via `useMemo` — disabled modules disappear from sidebar reactively when toggled at runtime
- Route audit confirmed: `App.tsx` path `/` renders `<Home />`, doc routes registered via `moduleRoutes.map()`, `vercel.json` has SPA rewrite `/(.*) -> /index.html`, no `<Navigate>` intercepting `/`
- Build succeeds, zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify routes and fix Home NavLink active state** - `6cbf436` (app)
2. **Task 2: Filter sidebar navigation by module enabled state** - `51ac1c8` (app)

## Files Created/Modified

- `src/components/layout/Sidebar.tsx` — Added `end` prop to Home NavLink; imported `useModuleEnabled` + `useMemo`; moved `navigationFromRegistry` computation inside `Sidebar` component with `useMemo([isEnabled])`

## Decisions Made

- Used `useModuleEnabled()` hook (Phase 38 mechanism) for sidebar filtering instead of reading static `enabled` field from manifest — this makes the sidebar reactive to runtime toggles stored in localStorage
- `navigationFromRegistry` moved inside the component body (required to use a hook) and wrapped in `useMemo([isEnabled])` to avoid unnecessary recomputation per render
- No new routes or route renames — plan explicitly required no structural route changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ROUT-01, ROUT-02, ROUT-03 all satisfied — routing hygiene baseline established
- Phase 41 (Home 2.0 Control Center) can build on clean route foundation with Home at `/`
- Phase 42 (Admin Panel) can use `toggleModule` from `useModuleEnabled` to control which modules appear in sidebar

---
*Phase: 40-routing-refactor*
*Completed: 2026-03-13*

## Self-Check: PASSED

- FOUND: src/components/layout/Sidebar.tsx
- FOUND: .planning/phases/40-routing-refactor/40-01-SUMMARY.md
- FOUND commit: 6cbf436 (Task 1)
- FOUND commit: 51ac1c8 (Task 2)
