---
phase: 39-slot-architecture-contract-types
plan: 01
subsystem: ui
tags: [typescript, eslint, module-registry, slot-architecture, extension-registry]

# Dependency graph
requires:
  - phase: 38-module-registry-foundation
    provides: ModuleDefinition, ModuleExtension (partial — no injects), MODULE_REGISTRY, ModuleEnabledProvider
provides:
  - SlotComponentProps interface (context?, className?) — contract for all slot-registered components
  - ModuleExtension.injects field (Record<string, React.ComponentType<SlotComponentProps>>)
  - SLOT_IDS const and SlotId type (home.dashboard, home.quick-actions)
  - extension-registry.ts with resolveExtensions() pure function and ExtensionMap type
  - ESLint boundary exclusion pattern expanded for registry-layer files
affects:
  - 39-02 (slots.tsx React context — consumes ExtensionMap and SlotComponentProps)
  - 39-03 (slot rendering — uses SlotComponentProps as component prop contract)
  - 40 (module admin panel — uses SlotId for slot enumeration)
  - 41 (Home 2.0 — uses SLOT_IDS.HOME_DASHBOARD and HOME_QUICK_ACTIONS)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SlotComponentProps as universal prop contract — all slot-registered components must satisfy this interface"
    - "React.ComponentType<SlotComponentProps> instead of ComponentType<any> — type safety at declaration site"
    - "Pure function extension resolver — resolveExtensions() with zero React runtime dependency"
    - "Registry-layer exclusion in ESLint boundaries — registry, module-ids, extension-registry, slots, hooks"

key-files:
  created:
    - src/modules/extension-registry.ts
  modified:
    - src/modules/registry.ts
    - eslint.config.js

key-decisions:
  - "SLOT_IDS created in registry.ts (not a separate file) — co-located with type definitions they anchor"
  - "requires field kept as string[] (not ModuleId[]) per plan spec — flexibility for future module IDs"
  - "import React from 'react' in registry.ts for React.ComponentType<SlotComponentProps> — type safety visible at declaration site"

patterns-established:
  - "SlotComponentProps first pattern: interface defined before ModuleExtension so injects cannot use ComponentType<any>"
  - "Pure resolver pattern: resolveExtensions() has zero React imports — fully unit-testable without jsdom"
  - "Extension-registry as registry-layer: excluded from ESLint module boundary rules alongside registry.ts"

requirements-completed: [CONT-01, CONT-02, ROUT-06]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 39 Plan 01: Slot Architecture Contract Types Summary

**Type-safe slot extension contract (ModuleExtension.injects, SlotComponentProps) and pure resolveExtensions() resolver with ESLint boundary update**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-13T05:00:00Z
- **Completed:** 2026-03-13T05:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Completed `ModuleExtension` interface by adding the `injects` field (`Record<string, React.ComponentType<SlotComponentProps>>`) that was deferred from Phase 38
- Established `SlotComponentProps` as the universal prop contract for all slot-registered components, preventing `ComponentType<any>` anywhere in the chain
- Added `SLOT_IDS` const and `SlotId` type to registry.ts for compile-time safe slot references
- Created `extension-registry.ts` with pure `resolveExtensions()` function that has zero React runtime dependencies — identical to plan spec
- Updated ESLint boundary exclusion to cover all current and upcoming registry-layer files (module-ids, extension-registry, slots, hooks)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add ModuleExtension type and SlotComponentProps interface to registry.ts** - `03e92ca` (feat)
2. **Task 2: Create extension-registry.ts with resolveExtensions() and update ESLint boundaries** - `8179546` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/modules/registry.ts` - Added SlotComponentProps interface, SLOT_IDS const, SlotId type, and completed ModuleExtension with injects field; added `import React`
- `src/modules/extension-registry.ts` - New file: ExtensionMap type and resolveExtensions() pure function
- `eslint.config.js` - Expanded boundary exclusion pattern from `!(registry)*` to `!(registry|module-ids|extension-registry|slots|hooks)*`

## Decisions Made
- SLOT_IDS co-located in registry.ts (not a separate file) — they anchor the ModuleExtension and SlotComponentProps types
- `requires` field kept as `string[]` rather than `ModuleId[]` per plan spec — provides flexibility for future module IDs not yet in MODULE_IDS constants
- `import React from 'react'` in registry.ts makes type safety visible at declaration site (`React.ComponentType<SlotComponentProps>`)

## Deviations from Plan

None — plan executed exactly as written.

The existing `ModuleExtension` in registry.ts (from Phase 38) was a partial definition missing the `injects` field. The plan accounted for this: "If it used a placeholder like `extensions?: unknown[]`, update it to `extensions?: ModuleExtension[]`." The update was applied as planned.

## Issues Encountered

Pre-existing ESLint warnings in unrelated files (SearchCommand.tsx, useTasks.ts, SharedWireframeView.tsx, WireframeViewer.tsx) are out of scope — none introduced by this plan. Both new/modified module files pass with zero warnings.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 (slots.tsx React context) is unblocked: `ExtensionMap`, `SlotComponentProps`, and `resolveExtensions()` are all ready to consume
- `SLOT_IDS.HOME_DASHBOARD` and `SLOT_IDS.HOME_QUICK_ACTIONS` are available for slot placement in Plans 03 and 04
- ESLint boundaries pre-emptively updated for `slots.tsx` and `hooks/` that Plan 02 will create

---
*Phase: 39-slot-architecture-contract-types*
*Completed: 2026-03-13*
