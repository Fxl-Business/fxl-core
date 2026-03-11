---
phase: quick-9
plan: 01
subsystem: wireframe-builder/editor
tags: [branding, color-picker, toolbar, popover, wireframe]
dependency_graph:
  requires: [BrandingContext, BrandingProvider, useWireframeBranding]
  provides: [BrandingPopover, AdminToolbar branding button]
  affects: [AdminToolbar, WireframeViewer, FinanceiroContaAzulViewer]
tech_stack:
  added: []
  patterns: [absolutely-positioned popover, click-outside listener, useState before early return]
key_files:
  created:
    - tools/wireframe-builder/components/editor/BrandingPopover.tsx
  modified:
    - tools/wireframe-builder/components/editor/AdminToolbar.tsx
decisions:
  - "Inlined ColorField in BrandingPopover rather than importing BrandingEditorRenderer to avoid Props coupling (section type requirement)"
  - "useState(brandingOpen) placed before if(collapsed) early return to respect React hooks rules"
  - "Button stays highlighted (active state) while popover is open using inline style check on brandingOpen"
metrics:
  duration: ~10min
  completed: 2026-03-11
---

# Quick Task 9: Branding Editor UI — Color Picker Access via Toolbar

**One-liner:** Palette button in AdminToolbar (edit mode only) toggling an absolutely-positioned BrandingPopover with 3 live color pickers wired to BrandingContext.

## What Was Built

### BrandingPopover.tsx (new)

A self-contained dropdown panel component that:
- Renders only when `open={true}`, returns null otherwise
- Positions absolutely at `top: 100%, right: 0` relative to its parent (the toolbar button wrapper)
- Contains an inlined `ColorField` helper (color input + label + hex preview swatch)
- Exposes primary, secondary, and accent color pickers via `useWireframeBranding()`
- Updates wireframe in real-time through `updateBranding()` on every color input change
- Closes on outside click via `useEffect` + `document.addEventListener('mousedown')`
- Styled entirely with `--wf-*` CSS tokens; no shadcn portal components
- Handles the `ctx === null` edge case gracefully (BrandingContext not in scope)

### AdminToolbar.tsx (modified)

- Added `Palette` import from lucide-react and `BrandingPopover` import
- Added `const [brandingOpen, setBrandingOpen] = useState(false)` — placed before the `if (collapsed)` early return to comply with React hooks rules
- Added Palette/"Cores" button in the right-side button group, before Share, only when `editMode === true`
- Button wrapper has `position: relative` so BrandingPopover positions relative to it
- Button shows active/highlighted state while popover is open

## Verification

- `npx tsc --noEmit` — zero errors (verified twice, after each task)
- All hooks placed before early returns (no crash risk)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files exist:
- tools/wireframe-builder/components/editor/BrandingPopover.tsx — FOUND
- tools/wireframe-builder/components/editor/AdminToolbar.tsx — FOUND (modified)

Commits:
- 3d07ee5 — feat(quick-9): create BrandingPopover component
- 3daaf39 — feat(quick-9): add Palette/Cores button to AdminToolbar
