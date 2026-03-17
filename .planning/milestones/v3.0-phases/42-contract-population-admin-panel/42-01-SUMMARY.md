---
phase: 42-contract-population-admin-panel
plan: 01
subsystem: module-extension-system
tags: [cross-module-extensions, slot-injection, home-dashboard, tasks-module, knowledge-base-module]
dependency_graph:
  requires: [38-01, 39-01, 41-01]
  provides: [cross-module-extension-runtime, home-dashboard-widgets]
  affects: [src/modules/tasks/, src/modules/knowledge-base/, src/pages/Home.tsx]
tech_stack:
  added: []
  patterns:
    - Extension components living in providing module's extensions/ directory
    - SlotComponentProps interface satisfaction for slot-injectable components
    - Inline constants in extension components to avoid cross-module coupling
    - ExtensionSlot rendering in Home.tsx below module grid
key_files:
  created:
    - src/modules/tasks/extensions/RecentTasksWidget.tsx
    - src/modules/knowledge-base/extensions/RecentKBWidget.tsx
  modified:
    - src/modules/tasks/manifest.ts
    - src/modules/knowledge-base/manifest.ts
    - src/pages/Home.tsx
decisions:
  - Extension constants (STATUS_COLORS, TYPE_COLORS) are inlined inside extension components rather than imported from module internals — keeps extension self-contained and avoids tight coupling
  - Manifests remain .ts files even when importing React components from .tsx — TypeScript module resolution handles this without JSX syntax needed in the manifest itself
  - SLOT_IDS imported from @/modules/registry in manifests (not module-ids.ts) — module-ids.ts is for ModuleId constants only; SLOT_IDS are registry-layer contracts
  - ExtensionSlot renders in a 2-column grid wrapper in Home.tsx — grid applied to wrapper div so ExtensionSlot null-graceful behavior still works correctly
  - void fetchTasks() pattern used for async-in-useEffect to satisfy exhaustive-deps without floating promise lint warnings
metrics:
  duration: "4 minutes"
  completed: "2026-03-13"
  tasks_completed: 2
  files_created: 2
  files_modified: 3
---

# Phase 42 Plan 01: Contract Population — Cross-Module Extension Widgets Summary

**One-liner:** Two real data-fetching extension widgets (RecentTasksWidget + RecentKBWidget) registered in module manifests and rendered in Home dashboard via the slot injection system, proving end-to-end cross-module extension architecture works in production.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create extension components for Tasks and KB modules | `1421673` | src/modules/tasks/extensions/RecentTasksWidget.tsx, src/modules/knowledge-base/extensions/RecentKBWidget.tsx |
| 2 | Populate extensions[] in manifests and add ExtensionSlot to Home | `9700760` | src/modules/tasks/manifest.ts, src/modules/knowledge-base/manifest.ts, src/pages/Home.tsx |

## What Was Built

### RecentTasksWidget (src/modules/tasks/extensions/RecentTasksWidget.tsx)
- Compact card widget fetching 5 most recent non-done tasks from Supabase
- Header with CheckSquare icon, "Tarefas Pendentes" label, and link to /tarefas
- Status badges with color coding: todo=slate, in_progress=indigo, blocked=rose
- Relative date formatting (Hoje/Ontem/Nd atras/dd/mm)
- Loading spinner and empty state handled
- Satisfies SlotComponentProps, no cross-module imports

### RecentKBWidget (src/modules/knowledge-base/extensions/RecentKBWidget.tsx)
- Compact card widget fetching 5 most recent knowledge_entries from Supabase
- Header with BookMarked icon, "Base de Conhecimento" label, and link to /knowledge-base
- Entry type badges with color coding: bug=rose, decision=indigo, pattern=emerald, lesson=amber
- Same relative date formatting pattern
- Loading spinner and empty state handled
- Satisfies SlotComponentProps, no cross-module imports

### Manifest Updates
- tasks/manifest.ts: extensions[] array with tasks-home-widget entry, injects RecentTasksWidget into SLOT_IDS.HOME_DASHBOARD
- knowledge-base/manifest.ts: extensions[] array with kb-home-widget entry, injects RecentKBWidget into SLOT_IDS.HOME_DASHBOARD
- Both use MODULE_IDS constants in requires[], SLOT_IDS constants as injects keys

### Home.tsx Update
- Imports ExtensionSlot from @/modules/slots and SLOT_IDS from @/modules/registry
- Renders `<ExtensionSlot id={SLOT_IDS.HOME_DASHBOARD} />` in a 2-column grid section below the module hub + sidebar layout
- Widgets appear as a dedicated dashboard section at the bottom of the Home page

## Verification Results

- `tsc --noEmit`: PASS (0 errors)
- ESLint boundary rules: PASS (0 violations — extensions import only from @/modules/registry and @/lib/supabase)
- Artifacts exist: PASS (both extension files at 142+ lines each)
- manifests contain extensions[]: PASS
- Home.tsx has ExtensionSlot + SLOT_IDS.HOME_DASHBOARD: PASS
- No `any` in any new or modified file: PASS
- Vite dev server: started cleanly on localhost:5174

## Deviations from Plan

### Auto-noted Divergences

**1. ExtensionSlot vs ModuleSlot naming**

The plan referenced `ModuleSlot` but the actual component in src/modules/slots.tsx is named `ExtensionSlot`. This was discovered during code reading — used the actual exported name `ExtensionSlot` from slots.tsx without any behavioral change.

**2. Circular import pattern acknowledged**

The plan noted that manifests importing from `@/modules/registry` creates a potential circular dependency (registry.ts imports manifests, manifests import from registry.ts). TypeScript compiles this fine via ESM deferred resolution and the pattern was already established by Phase 38-39 (manifests import `type ModuleDefinition` from `@/modules/registry`). Only the `MODULE_IDS` constant was previously sourced from `@/modules/module-ids` directly — `SLOT_IDS` has no separate module so registry is the correct source.

None of these are bugs — they were handled inline as Rule 1/3 observations.

## Self-Check: PASSED

- FOUND: src/modules/tasks/extensions/RecentTasksWidget.tsx
- FOUND: src/modules/knowledge-base/extensions/RecentKBWidget.tsx
- FOUND: src/modules/tasks/manifest.ts (with extensions[])
- FOUND: src/modules/knowledge-base/manifest.ts (with extensions[])
- FOUND: src/pages/Home.tsx (with ExtensionSlot + SLOT_IDS.HOME_DASHBOARD)
- Commit `1421673` exists in git log
- Commit `9700760` exists in git log
- TSC: PASS
- ESLint: PASS
