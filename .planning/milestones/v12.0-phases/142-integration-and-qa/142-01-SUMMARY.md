---
phase: 142
plan: 1
subsystem: admin/modules
tags: [integration, click-to-scroll, diagram, cards]
dependency_graph:
  requires: [ModuleDiagram, ModuleOverviewCard, ModulesPanel]
  provides: [diagram-to-card-navigation, highlight-state]
  affects: [ModulesPanel, ModuleDiagram, ModuleOverviewCard]
tech_stack:
  added: []
  patterns: [scrollIntoView, useCallback, useState-highlight, auto-clear-timeout]
key_files:
  created: []
  modified:
    - src/platform/pages/admin/components/ModuleDiagram.tsx
    - src/platform/pages/admin/ModuleOverviewCard.tsx
    - src/platform/pages/admin/ModulesPanel.tsx
decisions:
  - "Use scrollIntoView with behavior smooth and block center for best UX"
  - "2-second auto-clear timeout for highlight ring via setTimeout"
  - "Ring highlight uses ring-2 ring-indigo-500 with dark mode variant ring-indigo-400"
metrics:
  duration: "~2 min"
  completed: "2026-03-21"
---

# Phase 142 Plan 1: Click-to-Scroll Integration Summary

Wire click-to-scroll from SVG diagram nodes to ModuleOverviewCard grid with 2s ring highlight auto-clear.

## What Was Done

### Task 1: Read current component state
- Read ModulesPanel.tsx, ModuleDiagram.tsx, ModuleOverviewCard.tsx
- Identified ModuleDiagram had no onNodeClick prop, ModuleOverviewCard had no highlighted prop
- ModulesPanel did not render ModuleDiagram at all

### Task 2: Add onNodeClick prop to ModuleDiagram
- Added `ModuleDiagramProps` interface with optional `onNodeClick`
- Added `onClick` prop to `DiagramNodeProps` interface
- Wired onClick handler on each `<g>` node element
- Cursor pointer was already present from Phase 140

### Task 3: Add highlighted prop to ModuleOverviewCard
- Added `highlighted?: boolean` to `ModuleOverviewCardProps`
- Added conditional `ring-2 ring-indigo-500 dark:ring-indigo-400` classes
- Added `duration-300` to existing `transition-shadow` for smooth ring fade
- Card already had `id={module-card-${mod.id}}` from Phase 141

### Task 4: Wire state in ModulesPanel
- Added `useState<string | null>` for `highlightedModuleId`
- Created `handleNodeClick` with `useCallback`: scrollIntoView + 2s auto-clear
- Rendered `<ModuleDiagram onNodeClick={handleNodeClick} />` between header and card grid
- Passed `highlighted` and `id` props to each ModuleOverviewCard

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1-4  | 516c68e | app: wire click-to-scroll from diagram nodes to module cards |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` passes with zero errors
- Diagram nodes have cursor-pointer and onClick handlers
- Cards receive highlighted prop with ring classes and transition
