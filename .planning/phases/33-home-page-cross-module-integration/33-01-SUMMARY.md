---
phase: 33-home-page-cross-module-integration
plan: 01
subsystem: ui
tags: [react, supabase, module-registry, activity-feed]

# Dependency graph
requires:
  - phase: 29-module-foundation-registry
    provides: MODULE_REGISTRY with ModuleManifest type (id, label, route, icon, status)
  - phase: 30-supabase-migrations-data-layer
    provides: knowledge_entries and tasks tables in Supabase
  - phase: 33-00
    provides: Home.test.tsx with mergeAndSortActivityItems stub and passing merge/sort test
provides:
  - Home.tsx data-driven module hub grid from MODULE_REGISTRY
  - useActivityFeed hook merging knowledge_entries + tasks from Supabase
  - Exported mergeAndSortActivityItems pure function
  - Exported ActivityItem type
affects:
  - 33-02 (SearchCommand KB integration will coexist with updated Home.tsx)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useActivityFeed hook with Promise.all and cancelled-flag cleanup pattern
    - MODULE_DESCRIPTIONS Record<string, string> for module descriptions not in manifest
    - mergeAndSortActivityItems as exported pure function enabling isolated unit testing

key-files:
  created: []
  modified:
    - src/pages/Home.tsx
    - src/pages/Home.test.tsx

key-decisions:
  - "MODULE_DESCRIPTIONS defined locally in Home.tsx — ModuleManifest has no description field, local record keeps manifest focused on routing"
  - "mergeAndSortActivityItems exported from Home.tsx so Home.test.tsx can import and test it in isolation"
  - "useActivityFeed catches all Promise.all errors silently — activity feed is non-critical; tables may not exist in dev"
  - "ActivityItem type exported from Home.tsx for test file consumption"

patterns-established:
  - "Pattern: useActivityFeed hook with cancelled flag avoids state updates on unmounted component"
  - "Pattern: Pure merge/sort function exported alongside hook enables unit testing without React environment"

requirements-completed: [HOME-01, HOME-02]

# Metrics
duration: 12min
completed: 2026-03-12
---

# Phase 33 Plan 01: Home Page Module Hub & Activity Feed Summary

**Home.tsx rewritten with data-driven MODULE_REGISTRY grid and live Supabase activity feed merging knowledge_entries and tasks by recency**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-12T22:15:00Z
- **Completed:** 2026-03-12T22:27:00Z
- **Tasks:** 2 (1 auto + 1 checkpoint pre-approved)
- **Files modified:** 2

## Accomplishments
- Replaced static `quickActions` and `sections` arrays with `MODULE_REGISTRY.map()` grid (5 module cards)
- Added `useActivityFeed` hook with parallel Supabase queries using `Promise.all`, sorted and sliced to 10 items
- Exported `mergeAndSortActivityItems` pure function — test imports from `@/pages/Home` and passes
- Retained existing Clientes section (Financeiro Conta Azul)
- All hooks called unconditionally at component top (hooks-before-returns rule respected)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite Home.tsx with MODULE_REGISTRY grid and activity feed** - `7c5250f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/pages/Home.tsx` - Rewritten: MODULE_REGISTRY grid, useActivityFeed hook, ActivityItem type, mergeAndSortActivityItems export, Clientes section retained
- `src/pages/Home.test.tsx` - Updated: imports mergeAndSortActivityItems and ActivityItem from `./Home` (moved from local definition)

## Decisions Made
- `MODULE_DESCRIPTIONS` defined as a local `Record<string, string>` keyed by module id — `ModuleManifest` from Phase 29 has no description field. Local record keeps the manifest focused on routing/nav concerns.
- `mergeAndSortActivityItems` exported from `Home.tsx` so `Home.test.tsx` can import and test the pure function without a React environment or Supabase mock.
- `useActivityFeed` silently swallows all Promise.all errors — both `knowledge_entries` and `tasks` tables may not exist in dev environments; activity feed is non-critical display.
- `ActivityItem` type exported for test file consumption.

## Deviations from Plan

None — plan executed exactly as written. Wave 0 test stubs were already in place (33-00 had been executed previously based on file existence).

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Phase 33-02 can proceed: SearchCommand KB integration
- Home.tsx is stable; no conflicts expected with SearchCommand changes
- Activity feed will show live data once Supabase migrations are applied

---
*Phase: 33-home-page-cross-module-integration*
*Completed: 2026-03-12*
