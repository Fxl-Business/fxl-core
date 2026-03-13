---
phase: 28-editor-sync-gallery-validation
plan: "01"
subsystem: wireframe-builder
tags: [editor, gallery, typography, dark-mode, branding]
dependency_graph:
  requires: []
  provides: [EDIT-01, GAL-01]
  affects: [ComponentGallery, ScreenManager]
tech_stack:
  added: []
  patterns:
    - Single WireframeThemeProvider at gallery root (replaces per-card providers)
    - GalleryThemeToggle as inner component consuming useWireframeTheme context
    - brandingToWfOverrides + wfOverrides prop for gallery-level brand color override
key_files:
  modified:
    - tools/wireframe-builder/components/editor/ScreenManager.tsx
    - src/pages/tools/ComponentGallery.tsx
decisions:
  - "[Phase 28-01]: GalleryContent split into separate component to allow GalleryThemeToggle to use useWireframeTheme() inside the single provider scope"
  - "[Phase 28-01]: Branding toggle shares localStorage key fxl_wf_theme with wireframe viewer — acceptable for dev/validation tool"
  - "[Phase 28-01]: Branding pill shows Branding: OFF / Branding: ON with bg-primary active state consistent with category filter pills"
metrics:
  duration: "~10 min"
  completed: "2026-03-11"
  tasks_completed: 2
  files_modified: 2
---

# Phase 28 Plan 01: Editor Sync & Gallery Validation Summary

**One-liner:** ScreenManager nav items synced to text-xs/px-2/py-1.5 matching WireframeSidebar; gallery gained single-provider dark mode toggle and financeiro-conta-azul branding toggle.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sync ScreenManager typography with WireframeSidebar | b8e53a3 | tools/wireframe-builder/components/editor/ScreenManager.tsx |
| 2 | Add dark mode toggle and branding toggle to ComponentGallery | 805214e | src/pages/tools/ComponentGallery.tsx |

## What Was Built

### Task 1: ScreenManager Typography Sync (EDIT-01)

Updated both rendering paths in `ScreenManager.tsx`:

- **SortableScreenItem** (drag-enabled, editMode): `px-3 py-2 text-sm` → `px-2 py-1.5 text-xs`
- **Read-only button** (non-edit mode): `px-3 py-2 text-sm` → `px-2 py-1.5 text-xs`

All token-based color classes (`bg-wf-accent-muted`, `text-wf-accent`, `text-wf-sidebar-muted`, hover states) were preserved unchanged. Editor-specific features (grip handle, menu dropdown, rename input, delete confirmation) were not touched.

### Task 2: Gallery Theme and Branding Toggles (GAL-01)

Restructured `ComponentGallery.tsx`:

1. **Single WireframeThemeProvider** now wraps the entire gallery (toolbar + all sections), replacing the per-card provider wrappers that prevented gallery-wide theme changes.

2. **GalleryContent** split into a separate component so `GalleryThemeToggle` can call `useWireframeTheme()` inside the provider scope.

3. **GalleryThemeToggle** — pill button in toolbar, shows "Dark Mode" when in light mode and "Light Mode" when in dark mode. Calls `toggle()` from context.

4. **Branding toggle** — pill button with active state (`bg-primary text-primary-foreground`). When ON, passes `brandingToWfOverrides({ ...DEFAULT_BRANDING, primaryColor: '#1B6B93' })` as `wfOverrides` to `WireframeThemeProvider`.

5. **ComponentCard** no longer wraps each entry in `WireframeThemeProvider` — renders entries directly, inheriting the gallery-level context.

## Verification

- `npx tsc --noEmit` — zero errors on both tasks
- ScreenManager: both nav item paths use `text-xs px-2 py-1.5`
- Gallery: theme toggle and branding toggle pills appear in toolbar
- Gallery: all 27 component previews inherit theme from single provider
- Branding toggle applies `--wf-primary: #1B6B93` to all previews via `wfOverrides`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `tools/wireframe-builder/components/editor/ScreenManager.tsx` — modified
- [x] `src/pages/tools/ComponentGallery.tsx` — modified
- [x] Commit b8e53a3 exists (Task 1)
- [x] Commit 805214e exists (Task 2)
- [x] `npx tsc --noEmit` — zero errors
