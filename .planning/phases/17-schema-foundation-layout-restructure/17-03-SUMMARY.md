---
phase: 17-schema-foundation-layout-restructure
plan: 03
subsystem: ui
tags: [zod, typescript, blueprint, wireframe-builder, schema, types]

# Dependency graph
requires:
  - phase: 17-01
    provides: CSS token foundation (--wf-border alias) used by layout components
provides:
  - FilterOption type extended with optional filterType discriminator ('select' | 'date-range' | 'multi-select' | 'search' | 'toggle')
  - SidebarConfig and HeaderConfig types on BlueprintConfig (dashboard-level, optional)
  - SidebarConfigSchema (Zod) and HeaderConfigSchema (Zod, passthrough for forward compat)
  - Extended BlueprintConfigSchema and FilterOptionSchema (Zod) with backward/forward compat
  - 7 new Phase 17 test cases covering backward and forward compatibility
affects:
  - phase-18 (HeaderConfig extended with logo/period fields)
  - phase-19 (filterType discriminator used by filter rendering logic)
  - phase-20 (SidebarConfig extended)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "passthrough() on z.object({}) enables forward-compatible Zod schemas — Phase 18 fields pass without changes to this schema"
    - "FilterOption type defined in component file (WireframeFilterBar.tsx) and re-exported from types/blueprint.ts — single source of truth"
    - "HeaderConfig as Record<string, unknown> (not Record<string, never>) allows downstream phases to add fields without breaking changes"

key-files:
  created: []
  modified:
    - tools/wireframe-builder/components/WireframeFilterBar.tsx
    - tools/wireframe-builder/types/blueprint.ts
    - tools/wireframe-builder/lib/blueprint-schema.ts
    - tools/wireframe-builder/lib/blueprint-schema.test.ts

key-decisions:
  - "FilterOptionSchema exported (was previously unexported const) to enable direct unit testing"
  - "HeaderConfigSchema uses z.object({}).passthrough() not z.record(z.string(), z.unknown()) to explicitly signal forward-compat intent"
  - "SidebarConfig and HeaderConfig are dashboard-level fields on BlueprintConfig (not per-screen) as established in v1.3 research"

patterns-established:
  - "passthrough() pattern: use z.object({}).passthrough() for schemas designed to accept unknown future fields"
  - "TDD RED->GREEN: write 7 failing tests first, then implement minimal schema changes to make them pass"

requirements-completed: [SIDE-01, HEAD-01, FILT-01]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 17 Plan 03: Schema Foundation Summary

**Additive Zod schema extensions adding SidebarConfig/HeaderConfig slots on BlueprintConfig and filterType discriminator on FilterOption, with passthrough() forward-compat guard for Phase 18**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-11T03:07:54Z
- **Completed:** 2026-03-11T03:09:50Z
- **Tasks:** 2 (Task 1: TDD implementation, Task 2: Full suite verification)
- **Files modified:** 4

## Accomplishments
- Extended `FilterOption` type and `FilterOptionSchema` with optional `filterType` discriminator ('select' | 'date-range' | 'multi-select' | 'search' | 'toggle')
- Added `SidebarConfig` and `HeaderConfig` TypeScript types to `blueprint.ts`
- Added `SidebarConfigSchema` and `HeaderConfigSchema` (with `passthrough()` for forward compat) to `blueprint-schema.ts`
- Extended `BlueprintConfigSchema` with optional `sidebar` and `header` fields
- Exported `FilterOptionSchema` to enable direct unit testing
- 244 total tests pass (237 pre-existing + 7 new Phase 17 test cases) with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend FilterOption, add SidebarConfig/HeaderConfig types, extend Zod schemas, write tests** - `eaadf76` (feat)
2. **Task 2: Full test suite + TypeScript gate** - No code changes; verification only (all 244 tests pass, tsc exits 0)

## Files Created/Modified
- `tools/wireframe-builder/components/WireframeFilterBar.tsx` - Added `filterType?` optional field to `FilterOption` type
- `tools/wireframe-builder/types/blueprint.ts` - Added `SidebarConfig`, `HeaderConfig` types; extended `BlueprintConfig` with optional `sidebar` and `header` fields
- `tools/wireframe-builder/lib/blueprint-schema.ts` - Exported `FilterOptionSchema` with `filterType` enum; added `SidebarConfigSchema`, `HeaderConfigSchema` (passthrough); extended `BlueprintConfigSchema`
- `tools/wireframe-builder/lib/blueprint-schema.test.ts` - Added `FilterOptionSchema` import and 7 new Phase 17 test cases

## Decisions Made
- `FilterOptionSchema` exported (was unexported `const`) to allow direct unit testing — cleaner than indirect testing via `BlueprintConfigSchema`
- `HeaderConfigSchema` uses `z.object({}).passthrough()` specifically to signal forward-compat intent; this ensures Phase 18 can add `logo`, `period`, etc. without this schema becoming a breaking-change boundary
- `HeaderConfig` TS type is `Record<string, unknown>` (not `Record<string, never>`) for the same forward-compat reason

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 18 can now add `header.logo`, `header.period`, etc. to `HeaderConfigSchema` by extending it, without changes to this plan's files
- Phase 19 can use `filterType` in filter rendering logic — the discriminator field is fully typed and schema-validated
- Phase 20 can extend `SidebarConfig` with additional fields
- All new fields are optional — zero migration needed for existing blueprints in Supabase

---
*Phase: 17-schema-foundation-layout-restructure*
*Completed: 2026-03-11*
