---
phase: 18-configurable-sidebar-header
plan: 01
subsystem: ui
tags: [zod, typescript, wireframe-builder, blueprint-schema, sidebar, header, tdd]

# Dependency graph
requires:
  - phase: 17-schema-foundation-layout-restructure
    provides: SidebarConfig and HeaderConfig base types plus Zod schemas with passthrough() for forward-compat

provides:
  - SidebarGroup TypeScript type (label + screenIds[])
  - Extended SidebarConfig with optional groups field
  - Optional badge field (number | string) on BlueprintScreen
  - Typed HeaderConfig with showLogo, showPeriodSelector, showUserIndicator, actions fields
  - SidebarGroupSchema Zod schema
  - Extended SidebarConfigSchema (exported for direct testing)
  - badge on BlueprintScreenSchema
  - Typed HeaderConfigSchema with .passthrough() for forward-compat
  - 7 new test cases covering SIDE-03, SIDE-05, HEAD-02/03/04/05

affects:
  - 18-02 (sidebar rendering — consumes SidebarGroup, SidebarConfig.groups, BlueprintScreen.badge)
  - 18-03 (header rendering — consumes HeaderConfig typed fields)
  - Any phase that extends BlueprintConfig sidebar/header fields

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SidebarGroup type enables labeled grouping of screen IDs — rendering matches by BlueprintScreen.id"
    - "HeaderConfig replaces Record<string, unknown> with explicit optional fields while keeping Zod .passthrough() for forward-compat"
    - "SidebarConfigSchema exported (not just used internally) to enable direct unit testing"

key-files:
  created: []
  modified:
    - tools/wireframe-builder/types/blueprint.ts
    - tools/wireframe-builder/lib/blueprint-schema.ts
    - tools/wireframe-builder/lib/blueprint-schema.test.ts

key-decisions:
  - "SidebarConfigSchema exported from blueprint-schema.ts so test file can import and test it directly"
  - "HeaderConfigSchema keeps .passthrough() even after gaining explicit typed fields — Phase 19/20 may add more fields without breaking this schema boundary"
  - "badge added after icon field in BlueprintScreen (both are optional display hints for sidebar nav items)"

patterns-established:
  - "Schema export pattern: export named schemas that downstream test files need to test directly"
  - "Forward-compat pattern: typed Zod object + .passthrough() — allows future fields without rejection"

requirements-completed:
  - SIDE-03
  - SIDE-05
  - HEAD-02
  - HEAD-03
  - HEAD-04
  - HEAD-05

# Metrics
duration: 5min
completed: 2026-03-11
---

# Phase 18 Plan 01: Extend TypeScript Types & Zod Schemas for Sidebar Groups, Header Config, Screen Badge

**SidebarGroup type + Zod schema, typed HeaderConfig replacing Record<string, unknown>, optional badge on BlueprintScreen, and 7 new TDD test cases covering SIDE-03, SIDE-05, HEAD-02/03/04/05**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-11T03:35:01Z
- **Completed:** 2026-03-11T03:40:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `SidebarGroup` type and schema enabling labeled grouping of screens in sidebar navigation
- Extended `SidebarConfig` with optional `groups?: SidebarGroup[]` field (backward-compatible)
- Added optional `badge?: number | string` to `BlueprintScreen` for sidebar nav item indicators
- Replaced `HeaderConfig = Record<string, unknown>` with typed optional fields `showLogo`, `showPeriodSelector`, `showUserIndicator`, `actions` while keeping Zod `.passthrough()` for forward-compat
- 7 new tests added covering all new schema features; all 27 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TypeScript types** - `d2a5030` (feat)
2. **Task 1 TDD RED: Failing tests** - `83ee6dd` (test)
3. **Task 2 TDD GREEN: Extend Zod schemas** - `4f234c5` (feat)

_Note: TDD tasks have multiple commits (test RED → feat GREEN)_

## Files Created/Modified

- `tools/wireframe-builder/types/blueprint.ts` - Added SidebarGroup type, extended SidebarConfig with groups, added badge to BlueprintScreen, replaced HeaderConfig with typed optional fields
- `tools/wireframe-builder/lib/blueprint-schema.ts` - Added SidebarGroupSchema, extended SidebarConfigSchema (now exported), added badge to BlueprintScreenSchema, replaced HeaderConfigSchema empty passthrough with typed fields + .passthrough()
- `tools/wireframe-builder/lib/blueprint-schema.test.ts` - Added Phase 18 describe block with 7 test cases covering SIDE-03, SIDE-05, HEAD-02/05, forward-compat guard

## Decisions Made

- Exported `SidebarConfigSchema` from `blueprint-schema.ts` so test file can import and test it directly (previously only used internally)
- `HeaderConfigSchema` keeps `.passthrough()` even after gaining explicit typed fields — Phase 19/20 may add more fields without this schema becoming a breaking-change boundary
- `badge` field added after `icon` in `BlueprintScreen` since both are optional display hints for sidebar nav items

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Types and schemas are the contracts for 18-02 (sidebar rendering) and 18-03 (header rendering)
- 18-02 can now consume `SidebarGroup`, `SidebarConfig.groups`, and `BlueprintScreen.badge`
- 18-03 can now consume `HeaderConfig.showLogo`, `showPeriodSelector`, `showUserIndicator`, `actions`
- All backward-compatible — existing blueprints without these fields continue to parse correctly

---
*Phase: 18-configurable-sidebar-header*
*Completed: 2026-03-11*

## Self-Check: PASSED

- FOUND: tools/wireframe-builder/types/blueprint.ts
- FOUND: tools/wireframe-builder/lib/blueprint-schema.ts
- FOUND: tools/wireframe-builder/lib/blueprint-schema.test.ts
- FOUND: .planning/phases/18-configurable-sidebar-header/18-01-SUMMARY.md
- FOUND commit d2a5030 (feat: extend TypeScript types)
- FOUND commit 83ee6dd (test: failing tests RED)
- FOUND commit 4f234c5 (feat: extend Zod schemas GREEN)
