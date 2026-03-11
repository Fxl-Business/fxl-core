---
phase: 17-schema-foundation-layout-restructure
plan: "02"
subsystem: ui
tags: [react, wireframe-builder, layout, flex, sidebar, header]

# Dependency graph
requires:
  - phase: 17-schema-foundation-layout-restructure
    provides: WireframeHeader component and WireframeViewer page

provides:
  - WireframeHeader with optional onGerenciar prop (Gerenciar button in header right)
  - WireframeViewer with flex-col outer container, header spanning full viewport width
  - Sidebar repositioned below header (top: 56px, height: calc(100vh - 56px))
  - Gerenciar action moved from sidebar footer to header right side

affects:
  - wireframe-builder
  - WireframeViewer layout structure
  - any future phase touching WireframeHeader or WireframeViewer layout

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Full-width header above sidebar: outer flex-col container, WireframeHeader as first child, body row (flex: 1) below"
    - "Sidebar top offset: position fixed, top: 56 (matches WireframeHeader height constant)"
    - "Optional action prop pattern: onGerenciar?: () => void renders button only when provided (backward compatible)"

key-files:
  created: []
  modified:
    - tools/wireframe-builder/components/WireframeHeader.tsx
    - src/pages/clients/WireframeViewer.tsx

key-decisions:
  - "WireframeHeader height constant 56px used as the sidebar top offset — keeps both in sync via shared mental model (no CSS variable needed at this stage)"
  - "Gerenciar button moved to WireframeHeader via optional onGerenciar prop — cleaner separation of concerns vs sidebar footer action"

patterns-established:
  - "Header-above-sidebar SaaS dashboard chrome: outer flex-col, header first, body row second with flex: 1 and overflow: hidden"

requirements-completed:
  - LAYOUT-01
  - LAYOUT-02

# Metrics
duration: 2min
completed: "2026-03-11"
---

# Phase 17 Plan 02: Layout Restructure Summary

**WireframeHeader now spans full viewport width above sidebar via flex-col outer container, with Gerenciar button moved from sidebar footer to header right via optional prop**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T03:11:58Z
- **Completed:** 2026-03-11T03:14:05Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 2

## Accomplishments

- WireframeHeader accepts optional `onGerenciar?: () => void` prop — renders Gerenciar button conditionally (backward compatible, no breaking change)
- WireframeViewer outer container changed from `flex-row` to `flex-col`, with `WireframeHeader` lifted above the sidebar+content body row
- Sidebar repositioned to `top: 56, height: calc(100vh - 56px)` — starts immediately below header, no overlap
- Gerenciar button removed from sidebar footer, promoted to header right side via `onGerenciar={handleOpenManager}` prop
- AdminToolbar, stale warning banner, and BlueprintRenderer remain untouched in `<main>`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add onGerenciar prop to WireframeHeader** - `f10ca1c` (tool)
2. **Task 2: Restructure WireframeViewer layout and wire onGerenciar** - `f8a8f59` (app)
3. **Task 3: Verify layout restructure in browser** - auto-approved (checkpoint:human-verify, --auto mode)

**Plan metadata:** _(final commit — see below)_

## Files Created/Modified

- `tools/wireframe-builder/components/WireframeHeader.tsx` - Added `onGerenciar?: () => void` to Props type, destructured in component signature, replaced right spacer `<div>` with conditional Gerenciar button
- `src/pages/clients/WireframeViewer.tsx` - Changed outer container to `flexDirection: 'column'`, moved WireframeHeader above body row with `onGerenciar={handleOpenManager}`, added body row wrapper `div`, fixed sidebar `top: 56` and `height: calc(100vh - 56px)`, removed Gerenciar button from sidebar footer, removed `height: '100vh'` from `<main>`

## Decisions Made

- WireframeHeader height constant 56px is used directly as the sidebar top offset — keeps both in sync via shared mental model (no CSS variable needed at this stage)
- Gerenciar button moved to WireframeHeader via optional `onGerenciar` prop — cleaner separation of concerns, sidebar footer now only shows "Desenvolvido por FXL"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Layout restructure complete — WireframeHeader is full-width, sidebar positioned correctly below it
- WireframeHeader's `onGerenciar` prop is backward compatible — all existing usages without the prop continue to work
- Ready for Phase 17 remaining plans (schema foundation work, component additions)

## Self-Check: PASSED

- FOUND: tools/wireframe-builder/components/WireframeHeader.tsx
- FOUND: src/pages/clients/WireframeViewer.tsx
- FOUND: .planning/phases/17-schema-foundation-layout-restructure/17-02-SUMMARY.md
- FOUND: commit f10ca1c (Task 1)
- FOUND: commit f8a8f59 (Task 2)

---
*Phase: 17-schema-foundation-layout-restructure*
*Completed: 2026-03-11*
