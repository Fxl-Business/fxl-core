---
phase: "quick"
plan: 15
subsystem: wireframe-editor
tags: [sidebar, edit-mode, ux, groups, widgets]
dependency_graph:
  requires: []
  provides: [unified-edit-mode-sidebar]
  affects: [WireframeViewer]
tech_stack:
  added: []
  patterns: [Popover-picker, partitionScreensByGroups-edit-mode, per-group-ScreenManager]
key_files:
  created: []
  modified:
    - src/pages/clients/WireframeViewer.tsx
decisions:
  - Popover picker for widget type selection instead of auto-selecting first available
  - Inline ghost buttons at nav bottom instead of a separate ADICIONAR header section
  - Per-group onReorderScreens updates sidebar.groups[i].screenIds for grouped screens
  - Ungrouped screens continue to use global handleReorderScreens
  - View mode group rendering simplified (no editMode checks needed anymore)
metrics:
  duration: "3min"
  completed_date: "2026-03-13"
  tasks_completed: 1
  tasks_total: 2
  files_changed: 1
---

# Quick Task 15: Fix Sidebar Editor — Groups Alongside Screens

**One-liner:** Unified grouped edit-mode sidebar with inline add-group button and widget type picker popover replacing separate ADICIONAR section.

## What Was Built

The sidebar edit mode in WireframeViewer was refactored to:

1. **Remove the ADICIONAR section** — the separate header block with "Grupo" and "Widget" buttons at the top of the nav is gone.

2. **Unified grouped rendering in edit mode** — edit mode now uses `partitionScreensByGroups` just like view mode, showing group headings interspersed with their screens. Each group's `ScreenManager` passes `editMode={true}`, enabling drag-and-drop reordering, rename, and delete within each group.

3. **Group headings are interactive in edit mode** — clicking a group heading selects it (selection border + SidebarPropertyPanel opens); a trash icon deletes the group.

4. **Inline add buttons at nav bottom** — "+ Grupo" and "+ Widget" are subtle ghost buttons at the bottom of the nav area, consistent with the dark sidebar theme.

5. **Widget type picker Popover** — clicking "+ Widget" opens a Popover listing available widget types from `SIDEBAR_WIDGET_REGISTRY` with icon + label. Selecting a type adds the widget and selects it for editing. Popover closes after selection. Disabled when all widget types are already added.

6. **Per-group reorder** — reordering screens within a named group updates `sidebar.groups[i].screenIds`. Ungrouped screens use the global `handleReorderScreens`.

## Deviations from Plan

None — plan executed exactly as written.

## Tasks

| Task | Description | Status | Commit |
|------|-------------|--------|--------|
| 1 | Unify edit-mode sidebar nav to grouped rendering with inline controls | Complete | 20aa2f9 |
| 2 | Verify sidebar edit mode UX (human checkpoint) | Awaiting verification | — |

## Self-Check

- [x] `src/pages/clients/WireframeViewer.tsx` modified (291 insertions, 206 deletions)
- [x] Commit 20aa2f9 exists
- [x] `npx tsc --noEmit` passes with zero errors
