---
phase: quick-7
plan: "01"
subsystem: sidebar-navigation
tags: [sidebar, nav, ux, client-workspace]
dependency_graph:
  requires: []
  provides: [corrected-client-nav-order, external-link-support]
  affects: [src/components/layout/Sidebar.tsx]
tech_stack:
  added: []
  patterns: [external-boolean-flag-on-NavItem, anchor-vs-NavLink-routing]
key_files:
  modified:
    - src/components/layout/Sidebar.tsx
decisions:
  - "Use external?: boolean on NavItem to keep the pattern extensible for future external links in any section"
  - "Render external leaf nodes as <a target='_blank'> without active-state styling, consistent with how external links have no router concept"
metrics:
  duration: "~5 min"
  completed_date: "2026-03-10"
  tasks_completed: 1
  files_modified: 1
---

# Quick Task 7: Fix Client Sidebar Order and Open Wireframe in New Tab

**One-liner:** Corrected Financeiro Conta Azul sidebar order to Briefing > Blueprint > Wireframe > Branding > Changelog and made Wireframe open in a new browser tab via `<a target="_blank">`.

---

## What Was Done

### Task 1: Fix sidebar order and add external link support for Wireframe

**File:** `src/components/layout/Sidebar.tsx`

Three targeted changes:

1. **Added `external?: boolean` to `NavItem` type** — allows any nav item to be flagged for new-tab navigation without changing the renderer contract for all other items.

2. **Reordered the Financeiro Conta Azul children array** from:
   ```
   Briefing > Blueprint > Branding > Changelog > Wireframe
   ```
   to:
   ```
   Briefing > Blueprint > Wireframe > Branding > Changelog
   ```
   Also added `external: true` to the Wireframe item.

3. **Updated `NavSection` leaf node renderer** — when `item.external` is true, renders as `<a href target="_blank" rel="noopener noreferrer">` instead of `<NavLink>`. The anchor uses the same Tailwind classes as the standard inactive NavLink state (no active-state styling, which is correct since external links have no router concept).

**Verification:** `npx tsc --noEmit` — zero errors.

**Commit:** `454dad7`

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Self-Check

- [x] `src/components/layout/Sidebar.tsx` exists and contains all three changes
- [x] Commit `454dad7` exists
- [x] `npx tsc --noEmit` passed with zero errors

## Self-Check: PASSED
