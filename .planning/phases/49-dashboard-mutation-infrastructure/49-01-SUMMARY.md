---
phase: 49-dashboard-mutation-infrastructure
plan: 01
subsystem: ui
tags: [react, typescript, wireframe-builder, dashboard, mutation, sheet, admin-toolbar]

requires:
  - phase: 47-schema-foundation
    provides: SidebarConfig, HeaderConfig, SidebarWidget types in blueprint.ts

provides:
  - updateWorkingConfig() dashboard-level mutation helper in WireframeViewer
  - updateWorkingSidebar() convenience helper for sidebar patches
  - updateWorkingHeader() convenience helper for header patches
  - layoutPanel state ('sidebar' | 'header' | 'filters' | null) for panel open/close
  - SidebarConfigPanel stub Sheet component
  - HeaderConfigPanel stub Sheet component
  - FilterBarPanel stub Sheet component
  - Layout button group (Sidebar/Header/Filtros) in AdminToolbar (edit-mode only)

affects:
  - 50-header-config-panel
  - 52-sidebar-config-panel
  - 53-filter-bar-editor

tech-stack:
  added: []
  patterns:
    - "Dashboard-level config mutations use updateWorkingConfig(updater) — never handlePropertyChange"
    - "Layout panels rendered as app-level overlays outside WireframeThemeProvider, same as PropertyPanel"
    - "Panel open state: simple union type 'sidebar' | 'header' | 'filters' | null — no context provider needed"
    - "onUpdate prop on stub panels pre-wired to mutation helpers for future phases to use"

key-files:
  created:
    - tools/wireframe-builder/components/editor/SidebarConfigPanel.tsx
    - tools/wireframe-builder/components/editor/HeaderConfigPanel.tsx
    - tools/wireframe-builder/components/editor/FilterBarPanel.tsx
  modified:
    - src/pages/clients/WireframeViewer.tsx
    - tools/wireframe-builder/components/editor/AdminToolbar.tsx
    - src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx

key-decisions:
  - "updateWorkingSidebar and updateWorkingHeader pre-wired as onUpdate props to stub panels to satisfy noUnusedLocals strict TypeScript"
  - "FinanceiroContaAzul/WireframeViewer uses no-op onOpenLayoutPanel since it has no layoutPanel state — will be updated when that viewer is modernized"
  - "Layout buttons placed after Cores button with left-border separator, consistent with existing AdminToolbar button patterns"

patterns-established:
  - "Dashboard mutation pattern: updateWorkingConfig(cfg => ({...cfg, [key]: {...cfg[key], ...patch}})) — functional-update + dirty-flag"
  - "Stub panels accept onUpdate prop typed to future mutation signature for forward-compatibility"

requirements-completed: [INFRA-01, INFRA-02]

duration: 3min
completed: 2026-03-13
---

# Phase 49 Plan 01: Dashboard Mutation Infrastructure Summary

**updateWorkingConfig() mutation helpers, layoutPanel state, Layout button group in AdminToolbar, and 3 stub Sheet panels wired as app-level overlays**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T18:25:32Z
- **Completed:** 2026-03-13T18:29:19Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Dashboard-level mutation infrastructure: `updateWorkingConfig()`, `updateWorkingSidebar()`, `updateWorkingHeader()` with functional-update + dirty-flag pattern matching `updateWorkingScreen()`
- 3 stub Sheet panels created: SidebarConfigPanel, HeaderConfigPanel, FilterBarPanel — each accepts `onUpdate` prop for future phase wiring
- AdminToolbar now shows a Layout button group (Sidebar/Header/Filtros icons + labels) when `editMode` is true; layout panels open/close via `layoutPanel` state; `exitEditMode()` resets panel state to null

## Task Commits

1. **Task 1: Add updateWorkingConfig helpers and layoutPanel state** - `c91bdf1` (feat)
2. **Task 2: Create 3 stub Sheet panel components** - `6561f1d` (feat)
3. **Task 3: Add Layout button group to AdminToolbar and wire panels** - `535c01e` (feat)

## Files Created/Modified

- `src/pages/clients/WireframeViewer.tsx` - Added 3 mutation helpers, layoutPanel state, panel imports, onOpenLayoutPanel prop, panel renders, exitEditMode cleanup
- `tools/wireframe-builder/components/editor/AdminToolbar.tsx` - Added onOpenLayoutPanel prop, PanelLeft/LayoutTemplate/Filter icons, Layout button group (edit-mode only)
- `tools/wireframe-builder/components/editor/SidebarConfigPanel.tsx` - New stub Sheet panel for sidebar config with onUpdate prop
- `tools/wireframe-builder/components/editor/HeaderConfigPanel.tsx` - New stub Sheet panel for header config with onUpdate prop
- `tools/wireframe-builder/components/editor/FilterBarPanel.tsx` - New stub Sheet panel for filter bar editor
- `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` - Added no-op onOpenLayoutPanel to satisfy updated AdminToolbar Props type

## Decisions Made

- Pre-wired `updateWorkingSidebar` and `updateWorkingHeader` as `onUpdate` props on stub panels to satisfy TypeScript `noUnusedLocals` — this also serves as forward-compatibility for Phases 50 and 52
- FinanceiroContaAzul legacy viewer receives no-op `onOpenLayoutPanel` rather than full layoutPanel wiring, since that file will be superseded by the generic WireframeViewer

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added onOpenLayoutPanel to FinanceiroContaAzul/WireframeViewer**
- **Found during:** Task 3 (wiring AdminToolbar)
- **Issue:** FinanceiroContaAzul has its own WireframeViewer.tsx that uses AdminToolbar — adding required prop broke tsc
- **Fix:** Added `onOpenLayoutPanel={() => undefined}` no-op to satisfy the updated Props type
- **Files modified:** src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx
- **Verification:** tsc --noEmit passes with zero errors
- **Committed in:** 535c01e (Task 3 commit)

**2. [Rule 1 - Bug] Pre-wired onUpdate props on stub panels to satisfy noUnusedLocals**
- **Found during:** Task 3 (tsc verification)
- **Issue:** updateWorkingSidebar and updateWorkingHeader declared but not read → TS6133 errors with noUnusedLocals:true
- **Fix:** Added optional onUpdate prop to SidebarConfigPanel and HeaderConfigPanel, pass helpers as onUpdate props in WireframeViewer renders
- **Files modified:** SidebarConfigPanel.tsx, HeaderConfigPanel.tsx, WireframeViewer.tsx
- **Verification:** tsc --noEmit passes with zero errors
- **Committed in:** 535c01e (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug/strict-mode compliance)
**Impact on plan:** Both fixes necessary for correctness and TypeScript strict compliance. The onUpdate pre-wiring is actually advantageous — it gives future phases a cleaner API surface.

## Issues Encountered

None beyond the two auto-fixed deviations documented above.

## Next Phase Readiness

- Phase 50 (Header Config Panel): `HeaderConfigPanel` stub exists, `updateWorkingHeader()` is pre-wired as `onUpdate` prop — ready to add form controls
- Phase 52 (Sidebar Config Panel): `SidebarConfigPanel` stub exists, `updateWorkingSidebar()` is pre-wired as `onUpdate` prop — ready to add form controls
- Phase 53 (Filter Bar Editor): `FilterBarPanel` stub exists — ready to implement filter editor
- All 3 Layout buttons in AdminToolbar are functional entry points

---
*Phase: 49-dashboard-mutation-infrastructure*
*Completed: 2026-03-13*
