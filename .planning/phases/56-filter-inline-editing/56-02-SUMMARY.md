---
phase: 56-filter-inline-editing
plan: 02
subsystem: wireframe-builder
tags: [inline-editing, filters, presets, add-filter]
dependency_graph:
  requires: [56-01-filter-click-to-edit]
  provides: [filter-add-button, filter-presets, custom-filter]
  affects: [WireframeFilterBar, WireframeViewer]
tech_stack:
  added: []
  patterns: [preset popover, click-outside dismiss, auto-select on add]
key_files:
  created: []
  modified:
    - tools/wireframe-builder/components/WireframeFilterBar.tsx
decisions:
  - FILTER_PRESETS defined in WireframeFilterBar (5 BI presets)
  - Preset popover uses click-outside pattern with useRef
  - Already-added presets disabled (grayed out, cursor not-allowed)
  - Custom filter generates key as filtro-N
  - Newly added filter auto-selected for immediate editing
metrics:
  duration: 2min
  completed: "2026-03-13"
---

# Phase 56 Plan 02: Add-Filter "+" Button with Preset Picker Summary

A "+" button now appears in the filter bar during edit mode, offering 5 BI presets and a custom filter option. Adding a filter auto-opens its PropertyPanel for immediate editing.

## What Was Built

### "+" Button with Preset Popover
- Pill-shaped button with dashed border after filter chips
- Hover state: border and icon turn accent color
- Click toggles preset popover dropdown

### Preset Picker Popover
- 5 BI presets: Periodo, Empresa, Produto, Status, Responsavel
- Already-existing presets shown as disabled (50% opacity, not-allowed cursor)
- Separator line + "Filtro Personalizado" option for custom filters
- Click-outside dismisses popover
- Card background, border, border-radius 8, shadow, z-index 20

### Auto-Select on Add
- handleAddFilter in WireframeViewer auto-selects newly added filter
- FilterPropertyPanel opens immediately for customization

## Commits

- a5b98c0: app: add-filter "+" button with 5 BI preset picker in filter bar

## Deviations from Plan

None -- plan executed exactly as written.
