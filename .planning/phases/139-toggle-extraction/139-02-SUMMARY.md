---
phase: 139-toggle-extraction
plan: 02
subsystem: admin
tags: [module-panel, scaffold, cleanup, admin]
dependency_graph:
  requires: []
  provides: [modules-panel-scaffold, exported-status-constants]
  affects: [ModulesPanel]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - src/platform/pages/admin/ModulesPanel.tsx
decisions:
  - "Exported STATUS_LABELS and STATUS_CLASSES for Phase 141 ModuleOverviewCard reuse"
  - "Removed ModuleDiagram import along with all other toggle UI — diagram will be re-added in Phase 140"
metrics:
  duration: 234s
  completed: 2026-03-21
---

# Phase 139 Plan 02: Strip ModulesPanel to Scaffold Summary

Stripped ModulesPanel from 320-line tenant-selector + toggle page down to 50-line scaffold with page header and placeholder content.

## What Was Done

### Task 1: Strip ModulesPanel to scaffold (9837000)

Complete rewrite of `src/platform/pages/admin/ModulesPanel.tsx`:

**Removed:**
- All React hooks (useCallback, useEffect, useState)
- useSearchParams, toast, MODULE_REGISTRY, ModuleDefinition, ModuleId, MODULE_IDS imports
- supabase client import
- useActiveOrg hook import
- Switch, Select/SelectContent/SelectItem/SelectTrigger/SelectValue imports
- Loader2 and ModuleDiagram imports
- ALL_MODULE_IDS constant
- ModuleCard component (87 lines)
- All state management, effects, handlers (tenant selector, module toggle)
- Tenant selector dropdown
- Module card grid

**Kept/Added:**
- STATUS_LABELS and STATUS_CLASSES (now `export const` for Phase 141 reuse)
- Blocks icon import for placeholder
- Page header with "Visao geral dos modulos da plataforma"
- Dashed-border placeholder box with "Visao geral dos modulos sera adicionada em breve"

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `npx tsc --noEmit` exits 0
- `grep -c "Switch" ModulesPanel.tsx` returns 0
- `grep -c "useActiveOrg" ModulesPanel.tsx` returns 0
- `grep -c "SelectTrigger" ModulesPanel.tsx` returns 0
- `grep -c "onToggle" ModulesPanel.tsx` returns 0
- File is 50 lines (within 40-60 target)

## Self-Check: PASSED
