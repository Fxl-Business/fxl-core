---
phase: 33-home-page-cross-module-integration
plan: "00"
subsystem: testing
tags: [vitest, test-stubs, activity-feed, home-page, search-command, kb-integration]

requires:
  - phase: 32-task-management-module
    provides: tasks module and service layer that HOME-02 feed references

provides:
  - Test scaffold for HOME-01 (MODULE_REGISTRY grid rendering)
  - Test scaffold for HOME-02 (activity feed merge/sort logic) with passing pure function test
  - Test scaffold for KB-07 (SearchCommand empty-query guard)
  - mergeAndSortActivityItems pure function (temporary export, moved to Home.tsx in Plan 33-01)
  - vitest.config.ts extended to include *.test.tsx files

affects:
  - 33-01 (uses Home.test.tsx for verification of merge/sort)
  - 33-02 (uses SearchCommand.test.tsx for KB-07 guard verification)

tech-stack:
  added: []
  patterns:
    - "Wave 0 test stubs: create it.todo() placeholders + any non-trivial passing tests before implementation begins"
    - "Pure function export from test file: temporary pattern for Wave 0; import updated in Wave 2 to reference implementation file"

key-files:
  created:
    - src/pages/Home.test.tsx
    - src/components/layout/SearchCommand.test.tsx
  modified:
    - vitest.config.ts

key-decisions:
  - "vitest.config.ts include pattern extended to *.test.tsx — previous pattern only covered *.test.ts, blocking tsx test discovery"
  - "mergeAndSortActivityItems exported from test file temporarily — Plan 33-01 will move to Home.tsx and update import"

patterns-established:
  - "Wave 0 pattern: non-trivial logic tests are GREEN before implementation starts, not stubs"

requirements-completed:
  - HOME-01
  - HOME-02
  - KB-07

duration: 2min
completed: 2026-03-13
---

# Phase 33 Plan 00: Home Page Cross-Module Integration — Test Stubs Summary

**vitest .tsx test discovery fix + passing mergeAndSortActivityItems unit test (pure merge/sort for activity feed)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-13T01:19:17Z
- **Completed:** 2026-03-13T01:20:37Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Created `src/pages/Home.test.tsx` with HOME-01 todo stub and two passing HOME-02 merge/sort tests
- Created `src/components/layout/SearchCommand.test.tsx` with KB-07 empty-query guard todo stub
- Extended `vitest.config.ts` include pattern to cover `*.test.tsx` files (was only `*.test.ts`)

## Task Commits

1. **Task 1: Create test stubs for Home.tsx and SearchCommand.tsx** - `99c5a0f` (test)

## Files Created/Modified

- `src/pages/Home.test.tsx` - ActivityItem type, mergeAndSortActivityItems function, HOME-01 todo stub, HOME-02 passing tests
- `src/components/layout/SearchCommand.test.tsx` - KB-07 empty-query guard todo stub
- `vitest.config.ts` - Added `*.test.tsx` glob patterns to include array

## Decisions Made

- Extended vitest.config.ts to include `*.test.tsx` — the previous `*.test.ts` pattern silently excluded all tsx test files, making `npx vitest run` exit with "No test files found" (Rule 3 deviation auto-fixed)
- Exported `mergeAndSortActivityItems` from test file temporarily — Plan 33-01 will co-locate it with Home.tsx and update the import path

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended vitest.config.ts to include *.test.tsx files**
- **Found during:** Task 1 (Create test stubs)
- **Issue:** vitest.config.ts `include` pattern only matched `*.test.ts` — running `npx vitest run src/pages/Home.test.tsx` exited with "No test files found, exiting with code 1"
- **Fix:** Added `'tools/**/*.test.tsx'` and `'src/**/*.test.tsx'` patterns to the `include` array
- **Files modified:** vitest.config.ts
- **Verification:** `npx vitest run src/pages/Home.test.tsx src/components/layout/SearchCommand.test.tsx` passes — 2 tests pass, 2 todos skipped
- **Committed in:** 99c5a0f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for all future vitest verification commands that reference `.test.tsx` files. No scope creep.

## Issues Encountered

None beyond the vitest config gap noted above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both test files exist and vitest discovers them correctly
- HOME-02 merge/sort logic is validated as a pure function (passing test)
- Plan 33-01 can reference `src/pages/Home.test.tsx` in its verify command
- Plan 33-02 can reference `src/components/layout/SearchCommand.test.tsx` in its verify command

## Self-Check: PASSED

- FOUND: src/pages/Home.test.tsx
- FOUND: src/components/layout/SearchCommand.test.tsx
- FOUND: .planning/phases/33-home-page-cross-module-integration/33-00-SUMMARY.md
- FOUND: commit 99c5a0f

---
*Phase: 33-home-page-cross-module-integration*
*Completed: 2026-03-13*
