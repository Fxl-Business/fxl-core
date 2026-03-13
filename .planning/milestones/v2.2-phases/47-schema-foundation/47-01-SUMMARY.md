---
phase: 47-schema-foundation
plan: 01
subsystem: ui
tags: [typescript, zod, blueprint, wireframe-builder, sidebar, schema]

# Dependency graph
requires: []
provides:
  - SidebarWidgetType string literal union ('workspace-switcher' | 'user-menu')
  - WorkspaceSwitcherWidget and UserMenuWidget discriminated union variants in types/blueprint.ts
  - SidebarWidget discriminated union type (TypeScript)
  - SidebarConfig extended with optional widgets?: SidebarWidget[]
  - SidebarWidgetSchema Zod discriminated union with passthrough() on each variant
  - SidebarConfigSchema updated with widgets field and .passthrough() for forward-compat
  - 13 new tests covering widget schema validation and backward compatibility
affects: [48-header-render-wiring, 49-dashboard-mutation-infrastructure, 50-header-config-panel, 51-sidebar-widget-renderers, 52-sidebar-config-panel, 53-filter-bar-editor]

# Tech tracking
tech-stack:
  added: []
  patterns: [z.discriminatedUnion for widget types, .passthrough() on Zod schemas for forward-compat, optional fields for backward compatibility]

key-files:
  created: []
  modified:
    - tools/wireframe-builder/types/blueprint.ts
    - tools/wireframe-builder/lib/blueprint-schema.ts
    - tools/wireframe-builder/lib/blueprint-schema.test.ts

key-decisions:
  - "SidebarWidget is a discriminated union on 'type' field — widget position (header vs footer zone) determined by widget type in Phase 51's SIDEBAR_WIDGET_REGISTRY"
  - "Both SidebarConfigSchema and individual widget variant schemas use .passthrough() for forward-compat, matching existing HeaderConfigSchema pattern"
  - "widgets field is optional on SidebarConfig — existing blueprints without widgets parse without errors (backward compat)"

patterns-established:
  - "Discriminated union pattern: TypeScript union + z.discriminatedUnion('type', [...]) Zod mirror"
  - ".passthrough() on Zod schemas for all blueprint config sub-objects to survive future field additions"
  - "Optional fields for additive schema extensions — never break existing data"

requirements-completed: [INFRA-03]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 47 Plan 01: Schema Foundation Summary

**SidebarWidget discriminated union (TypeScript + Zod) extending SidebarConfig with backward-compatible optional widgets field and 13 new tests confirming round-trip safety**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-13T18:13:06Z
- **Completed:** 2026-03-13T18:15:09Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added `SidebarWidgetType`, `WorkspaceSwitcherWidget`, `UserMenuWidget`, and `SidebarWidget` discriminated union to `types/blueprint.ts`
- Extended `SidebarConfig` with optional `widgets?: SidebarWidget[]` field — existing blueprints without widgets continue to parse without errors
- Added `SidebarWidgetSchema` Zod discriminated union with `.passthrough()` on each variant and updated `SidebarConfigSchema` with `.passthrough()` for forward-compat
- Added 13 new test cases covering widget schema validation, passthrough behavior, and backward compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Add SidebarWidget types to blueprint.ts** - `dd235b3` (feat)
2. **Task 2: Add SidebarWidgetSchema and update SidebarConfigSchema** - `ea0c590` (feat)
3. **Task 3: Add Phase 47 tests to blueprint-schema.test.ts** - `797c418` (test)

## Files Created/Modified
- `tools/wireframe-builder/types/blueprint.ts` - Added SidebarWidgetType union, WorkspaceSwitcherWidget, UserMenuWidget, SidebarWidget discriminated union; extended SidebarConfig with optional widgets field
- `tools/wireframe-builder/lib/blueprint-schema.ts` - Added WorkspaceSwitcherWidgetSchema, UserMenuWidgetSchema, SidebarWidgetSchema (z.discriminatedUnion); updated SidebarConfigSchema with widgets field and .passthrough()
- `tools/wireframe-builder/lib/blueprint-schema.test.ts` - Added SidebarWidgetSchema import and 13 new Phase 47 test cases

## Decisions Made
- Widget position (header zone vs footer zone) is NOT stored as a position field in the schema — it is determined by widget type at render time via Phase 51's SIDEBAR_WIDGET_REGISTRY. This keeps the schema clean and the config portable.
- Used `.passthrough()` on both individual widget variant schemas and `SidebarConfigSchema`, matching the existing `HeaderConfigSchema` pattern established in earlier phases.
- `widgets` field is optional to maintain backward compatibility — any existing blueprint JSON without a `widgets` key will continue to parse correctly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- INFRA-03 hard dependency satisfied — all subsequent v2.2 phases can now import `SidebarWidget` and `SidebarWidgetType` from `types/blueprint.ts`
- Phase 48 (header render wiring) and Phase 51 (sidebar widget renderers) can proceed
- Any `SidebarConfig` with a `widgets` array will survive `BlueprintConfigSchema.parse()` round-trips and DB storage

## Self-Check: PASSED

All files found and all commits verified.

---
*Phase: 47-schema-foundation*
*Completed: 2026-03-13*
