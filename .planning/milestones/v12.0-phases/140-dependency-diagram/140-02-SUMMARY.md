---
phase: 140
plan: 2
subsystem: admin/diagram
tags: [svg, react, hover, dark-mode, interaction]
dependency_graph:
  requires: [GraphNode, GraphEdge, buildGraph]
  provides: [ModuleDiagram]
  affects: [ModulesPanel]
tech_stack:
  added: []
  patterns: [mutation-observer-dark-mode, inline-svg-colors, useMemo-static-registry]
key_files:
  created:
    - src/platform/pages/admin/components/ModuleDiagram.tsx
  modified:
    - src/platform/pages/admin/ModulesPanel.tsx
decisions:
  - "Used MutationObserver on html.classList for dark mode detection since SVG elements cannot use Tailwind dark: variants"
  - "Widened viewBox to 700x300 for better spacing of 6 nodes in 2x3 grid"
  - "Separate arrowhead markers for light/dark/highlighted states"
metrics:
  duration: "~2 min"
  completed: "2026-03-21"
---

# Phase 140 Plan 2: ModuleDiagram SVG component with hover interaction Summary

Interactive SVG module diagram with hover edge highlighting, dark/light mode support, and integration into ModulesPanel at /admin/modules.

## What Was Done

### Task 1: ModuleDiagram SVG component
Created `ModuleDiagram.tsx` with:
- `useDarkMode()` hook using MutationObserver on `<html>` class attribute
- `DiagramNode` sub-component: 160x56 rounded rect with label and status badge
- `DiagramEdge` sub-component: line with arrowhead marker
- `ModuleDiagram` default export: derives graph via `useMemo`, manages `hoveredNodeId` state
- Hover logic: connected edges highlight (indigo-500), unrelated edges dim (opacity 0.15), unrelated nodes dim (opacity 0.35)
- `data-module-id` attribute on node groups for Phase 142 click-to-scroll
- Status badges with mode-aware inline SVG colors (not Tailwind)

### Task 2: Integration into ModulesPanel
Added `<ModuleDiagram />` inside a card with "Arquitetura de Modulos" heading, positioned between page header and tenant selector.

### Task 3: Dark mode verification
Dark mode support built into component via `useDarkMode()` hook. All SVG fills/strokes switch between light and dark hex values. Container div uses Tailwind `dark:` classes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed SVG textTransform attribute**
- **Found during:** Task 1 (tsc check)
- **Issue:** `textTransform` is not a valid SVG attribute in React types
- **Fix:** Moved to `style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}`
- **Files modified:** ModuleDiagram.tsx
- **Commit:** f09cf3c

## Decisions Made

- MutationObserver for dark mode detection (SVG elements cannot use Tailwind dark: variants)
- viewBox widened to 700x300 for better horizontal spacing
- Three arrowhead markers (light, dark, highlighted) in SVG defs

## Commits

| Commit | Description |
|--------|-------------|
| f09cf3c | app: add ModuleDiagram SVG component with hover interaction and dark mode |

## Self-Check: PASSED
