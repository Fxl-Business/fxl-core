---
phase: 18-configurable-sidebar-header
plan: 02
subsystem: ui
tags: [react, typescript, wireframe-builder, sidebar, collapse, groups, badge, footer]

# Dependency graph
requires:
  - phase: 18-01
    provides: SidebarGroup type, extended SidebarConfig with groups field, optional badge on BlueprintScreen, typed HeaderConfig

provides:
  - Sidebar collapse rail (56px icon-only state toggled by ChevronLeft/ChevronRight button)
  - effectiveSidebarCollapsed: edit mode forces sidebar expanded (DnD handles require visible items)
  - partitionScreensByGroups module-level helper that maps screens to labeled groups or flat fallback
  - Groups rendering with labeled headings in view mode (hidden in collapsed state)
  - Flat ScreenManager preserved in edit mode for full DnD support
  - originalIndex mapping for correct screen navigation across groups
  - Badge pill on non-edit screen items using wf-accent/wf-accent-fg tokens
  - Sidebar footer from activeConfig.sidebar.footer with 'Desenvolvido por FXL' fallback
  - 150ms CSS transition on sidebar width

affects:
  - 18-03 (header rendering - sidebar/header layout fully set)
  - Any future phase extending SidebarConfig or BlueprintScreen visual display

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "partitionScreensByGroups: module-level pure function mapping screens+groups config to labeled ScreenGroup[] with originalIndex for navigation mapping"
    - "effectiveSidebarCollapsed pattern: derived bool from sidebarCollapsed && !editMode.active — ensures edit mode forces expansion without storing extra state"
    - "originalIndex mapping: group-local ScreenManager receives localIdx, maps back to global screens array via group.screens[localIdx].originalIndex"

key-files:
  created: []
  modified:
    - src/pages/clients/WireframeViewer.tsx
    - tools/wireframe-builder/components/editor/ScreenManager.tsx

key-decisions:
  - "effectiveSidebarCollapsed derived from sidebarCollapsed && !editMode.active — single state, no separate forceExpanded flag"
  - "partitionScreensByGroups returns ungrouped screens at end if any screens not in any group (backward-compatible append)"
  - "Badge pill in collapsed rail is clipped by overflow:hidden on aside — intentional, collapsed rail is for navigation not notifications"

patterns-established:
  - "Group-to-flat mapping: ScreenManager always receives a contiguous local array; parent maps localIdx -> originalIndex for global operations"

requirements-completed:
  - SIDE-02
  - SIDE-03
  - SIDE-04
  - SIDE-05
  - SIDE-06
  - SIDE-07

# Metrics
duration: 8min
completed: 2026-03-11
---

# Phase 18 Plan 02: Sidebar Collapse Rail, Groups, Badge Pill, and Footer from Config Summary

**Collapsible 56px icon-only sidebar rail with labeled group sections, badge pill on screen items, and configurable footer text — all driven by SidebarConfig from blueprint**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-11T03:40:03Z
- **Completed:** 2026-03-11T03:48:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 2

## Accomplishments

- Sidebar collapses to 56px icon-only rail with 150ms CSS transition on toggle button click
- Edit mode forces sidebar expansion (effectiveSidebarCollapsed = sidebarCollapsed && !editMode.active)
- partitionScreensByGroups helper partitions screens into labeled groups when config.sidebar.groups is set, with flat fallback for no groups (backward-compatible)
- Group headings hidden in collapsed state, visible in expanded state
- Edit mode uses flat ScreenManager with full DnD; view mode uses grouped rendering
- Badge pill rendered in non-edit screen items via screen.badge (number | string | undefined check)
- Sidebar footer from activeConfig?.sidebar?.footer with 'Desenvolvido por FXL' fallback
- All 251 tests pass, TypeScript compiles clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Sidebar collapse rail + groups rendering + footer from config** - `2dec7f6` (feat)
2. **Task 2: Badge pill in ScreenManager non-edit items** - `f92fccf` (feat)
3. **Task 3: Checkpoint** - auto-approved (no commit)

## Files Created/Modified

- `src/pages/clients/WireframeViewer.tsx` - Added sidebarCollapsed state, effectiveSidebarCollapsed, SIDEBAR_EXPANDED/COLLAPSED constants, partitionScreensByGroups helper, ChevronLeft/ChevronRight toggle button, grouped nav rendering in view mode, flat ScreenManager in edit mode, sidebarWidth on aside and main, footer from config
- `tools/wireframe-builder/components/editor/ScreenManager.tsx` - Added badge pill after screen title in non-edit branch, using wf-accent/wf-accent-fg CSS tokens

## Decisions Made

- effectiveSidebarCollapsed derived as `sidebarCollapsed && !editMode.active` — single boolean state, no separate forceExpanded flag, cleaner derived state pattern
- partitionScreensByGroups appends ungrouped screens at end if any screens not in any group — ensures backward compatibility when blueprint has partial groups config
- Badge pill clipped in collapsed rail by overflow:hidden on aside — intentional design choice (collapsed rail is for navigation, not notification counts)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Sidebar visual features complete: collapse, groups, badges, footer
- 18-03 (header rendering) can now proceed — layout is stable (header at 56px top, sidebar fixed left with variable width)
- All backward-compatible — existing blueprints without sidebar config render identically to before

---
*Phase: 18-configurable-sidebar-header*
*Completed: 2026-03-11*

## Self-Check: PASSED

- FOUND: src/pages/clients/WireframeViewer.tsx
- FOUND: tools/wireframe-builder/components/editor/ScreenManager.tsx
- FOUND: .planning/phases/18-configurable-sidebar-header/18-02-SUMMARY.md
- FOUND commit 2dec7f6 (feat: sidebar collapse rail, groups rendering, footer from config)
- FOUND commit f92fccf (feat: add badge pill to ScreenManager non-edit screen items)
