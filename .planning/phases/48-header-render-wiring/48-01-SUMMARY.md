---
phase: 48-header-render-wiring
plan: 01
subsystem: wireframe-builder
tags: [header, conditional-rendering, blueprint-config, call-sites]
dependency_graph:
  requires: [47-01]
  provides: [HDR-01, HDR-02, HDR-03]
  affects: [50-header-config-panel]
tech_stack:
  added: []
  patterns: [conditional-rendering-with-default-true, optional-chaining-for-config-props]
key_files:
  created: []
  modified:
    - tools/wireframe-builder/components/WireframeHeader.tsx
    - src/pages/clients/WireframeViewer.tsx
    - src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx
    - src/pages/SharedWireframeView.tsx
    - src/pages/tools/ComponentGallery.tsx
    - src/pages/tools/galleryMockData.ts
decisions:
  - "Period selector pill uses !== false guard (default true) matching manage and share; export uses === true guard (default false)"
  - "Period selector placed in right column before action buttons, not in center (center search input unchanged)"
  - "SharedWireframeView uses bp variable (BlueprintConfig) for header config, not a config alias"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-13"
  tasks_completed: 2
  files_modified: 6
---

# Phase 48 Plan 01: Header Render Wiring Summary

**One-liner:** WireframeHeader wired to render period selector pill, Gerenciar/Compartilhar/Exportar action buttons, and user chip conditionally from HeaderConfig fields across all 4 call sites.

## What Was Built

Closed the gap between the `HeaderConfig` schema (which already defined `showPeriodSelector`, `showUserIndicator`, and `actions.*`) and the `WireframeHeader` renderer (which previously only consumed `showLogo`). After this phase, any operator setting in the blueprint JSON header config produces an immediate visible change.

### WireframeHeader.tsx — 5 new conditional renders

- `showPeriodSelector !== false` — decorative period navigation pill (ChevronLeft / Calendar "Jan / 26" / ChevronRight) in right column before action buttons (HDR-01)
- `actions?.manage !== false` — Gerenciar button with Settings icon (HDR-03, defaults true)
- `actions?.share !== false` — Compartilhar button with Share2 icon (HDR-03, defaults true)
- `actions?.export === true` — Exportar button with Download icon (HDR-03, defaults false)
- `showUserIndicator !== false` — divider + user chip wrapped in fragment (HDR-02)

### Call site updates

All 4 call sites now pass header config props via optional chaining:

| Call site | Props passed |
|-----------|-------------|
| `src/pages/clients/WireframeViewer.tsx` | showLogo, showPeriodSelector, showUserIndicator, actions from `activeConfig?.header` |
| `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` | showLogo, showPeriodSelector, showUserIndicator, actions from `activeConfig?.header` |
| `src/pages/SharedWireframeView.tsx` | showPeriodSelector, showUserIndicator, actions from `bp?.header` |
| `src/pages/tools/ComponentGallery.tsx` | showPeriodSelector, showUserIndicator, actions from `wireframeHeaderMock` |

Gallery mock data updated with `showPeriodSelector: true`, `showUserIndicator: true`, `actions: { manage: true, share: true, export: false }`.

## Verification

- `npx tsc --noEmit` — zero errors, zero `any`
- All elements render when HeaderConfig fields are undefined (backward compatibility verified by default guard logic)
- Exportar button is hidden by default (`actions?.export === true` guard)
- Gerenciar and Compartilhar are shown by default (`!== false` guard)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files exist:
- tools/wireframe-builder/components/WireframeHeader.tsx — FOUND
- src/pages/clients/WireframeViewer.tsx — FOUND
- src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx — FOUND
- src/pages/SharedWireframeView.tsx — FOUND
- src/pages/tools/ComponentGallery.tsx — FOUND
- src/pages/tools/galleryMockData.ts — FOUND

Commits:
- 030a6e1 feat(48-01): add conditional rendering for all HeaderConfig fields in WireframeHeader
- 90d1778 feat(48-01): wire header config props through all WireframeHeader call sites
