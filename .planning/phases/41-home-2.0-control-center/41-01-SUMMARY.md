---
phase: 41-home-2.0-control-center
plan: 01
subsystem: ui
tags: [react, supabase, tailwind, shadcn, home, modules, activity-feed]

# Dependency graph
requires:
  - phase: 38-module-registry-foundation
    provides: MODULE_REGISTRY, ModuleDefinition type with description field
  - phase: 40-routing-refactor
    provides: Module routes and sidebar architecture

provides:
  - src/lib/activity-feed.ts (useActivityFeed, ActivityItem, mergeAndSortActivityItems, formatDate)
  - src/lib/module-stats.ts (useModuleStats, ModuleStats — badge counts per module from Supabase)
  - Rebuilt src/pages/Home.tsx as asymmetric 2/3+1/3 control center layout

affects: [home, dashboard, module-hub, activity-feed, knowledge-base, tasks]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Shared lib hooks pattern: useActivityFeed and useModuleStats in src/lib/ (not co-located with pages)
    - Asymmetric 3-col grid: primary area lg:col-span-2 + secondary area lg:col-span-1
    - Featured module as first active module from MODULE_REGISTRY — no hardcoding

key-files:
  created:
    - src/lib/activity-feed.ts
    - src/lib/module-stats.ts
  modified:
    - src/pages/Home.tsx
    - src/pages/Home.test.tsx

key-decisions:
  - "activity-feed hooks extracted to src/lib/ so they can be imported by other pages in future"
  - "useModuleStats uses Supabase head:true count pattern for efficiency (no rows fetched)"
  - "featuredModule is first module with status:active in MODULE_REGISTRY — no hardcoded ID"
  - "Home.test.tsx updated to import ActivityItem and mergeAndSortActivityItems from @/lib/activity-feed instead of ./Home"

patterns-established:
  - "Shared React hooks live in src/lib/ when consumed by multiple pages or candidates for multi-page use"
  - "Supabase badge counts: .select('*', { count: 'exact', head: true }) pattern for aggregate queries"
  - "Internal component functions (FeaturedModuleCard, ModuleCard, IdentityCard, ActivityFeed) in Home.tsx — not exported"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Phase 41 Plan 01: Home 2.0 Control Center Summary

**Asymmetric control center Home.tsx with shared lib hooks for activity feed and per-module badge counts from Supabase, reading all module data exclusively from MODULE_REGISTRY**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-13T04:54:48Z
- **Completed:** 2026-03-13T05:00:00Z
- **Tasks:** 3 of 3 (Task 3 — visual verification approved by user)
- **Files modified:** 4

## Accomplishments

- Created `src/lib/activity-feed.ts` — extracted useActivityFeed hook, ActivityItem type, mergeAndSortActivityItems, formatDate from Home.tsx to shared lib
- Created `src/lib/module-stats.ts` — useModuleStats hook fetching pending tasks count and total KB entries count from Supabase using efficient head:true pattern
- Completely rewrote `src/pages/Home.tsx` as asymmetric 2/3+1/3 control center with FeaturedModuleCard, module sub-grid, FXL identity card, and recent activity feed
- Updated `src/pages/Home.test.tsx` to import moved functions from new @/lib/activity-feed location

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract activity feed hook and create module stats hook** - `67d649d` (feat)
2. **Task 2: Rebuild Home.tsx as asymmetric control center** - `9f43a4d` (feat)
3. **Task 3: Visual verification** — approved by user (checkpoint:human-verify)

## Files Created/Modified

- `src/lib/activity-feed.ts` — Shared hook: useActivityFeed, ActivityItem type, mergeAndSortActivityItems, formatDate
- `src/lib/module-stats.ts` — Shared hook: useModuleStats returning `{ counts, loading }` with per-module badge counts from Supabase
- `src/pages/Home.tsx` — Fully rewritten as asymmetric control center: 2/3 primary (FeaturedModuleCard + 2-col ModuleCard grid) + 1/3 secondary (FXL identity + ActivityFeed)
- `src/pages/Home.test.tsx` — Updated import path for ActivityItem and mergeAndSortActivityItems

## Decisions Made

- `activity-feed.ts` hooks extracted to `src/lib/` (not left as page-local) so they can be reused across future pages without coupling
- `useModuleStats` uses `.select('*', { count: 'exact', head: true })` for efficient aggregate counts — no rows fetched from DB
- Featured module selection is dynamic: first `status: 'active'` module in MODULE_REGISTRY, not a hardcoded ID
- Internal component functions in Home.tsx are NOT exported — they are page-private building blocks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated Home.test.tsx import after extracting ActivityItem/mergeAndSortActivityItems to shared lib**
- **Found during:** Task 2 (Rebuild Home.tsx) — after extraction, tsc reported error in test file
- **Issue:** `Home.test.tsx` imported `mergeAndSortActivityItems` and `ActivityItem` from `./Home`. After Task 1 moved these exports to `@/lib/activity-feed`, the test file broke with TS2614 errors.
- **Fix:** Updated import path in `Home.test.tsx` to `@/lib/activity-feed`
- **Files modified:** `src/pages/Home.test.tsx`
- **Verification:** `npx tsc --noEmit` passes with zero errors after fix
- **Committed in:** `9f43a4d` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary fix — test file used old import path after planned extraction. No scope creep.

## Issues Encountered

None — TypeScript caught the broken test import immediately, auto-fixed as Rule 1.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Home 2.0 implementation complete and visually verified by operator
- All 3 tasks done: hooks extracted, Home.tsx rebuilt, visual verification approved
- Phase 42 (Contract Population & Admin Panel) can begin immediately

## Self-Check: PASSED

- [x] `src/lib/activity-feed.ts` exists (commit 67d649d)
- [x] `src/lib/module-stats.ts` exists (commit 67d649d)
- [x] `src/pages/Home.tsx` rebuilt (commit 9f43a4d)
- [x] Task 3 visual verification approved by user
- [x] All commits verified in git log

---
*Phase: 41-home-2.0-control-center*
*Completed: 2026-03-13*
