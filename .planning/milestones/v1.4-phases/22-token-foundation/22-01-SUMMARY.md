---
phase: 22-token-foundation
plan: 01
subsystem: ui
tags: [css-tokens, tailwind, wireframe-builder, design-system, color-palette]

# Dependency graph
requires: []
provides:
  - Complete slate + blue CSS token system for wireframe components (light and dark themes)
  - --wf-primary token (#1152d4 light, #4d7ce8 dark) as canonical primary color
  - Three new tokens: --wf-header-search-bg, --wf-table-footer-bg, --wf-table-footer-fg
  - --wf-chart-warn semantic token for gauge amber zone
  - Tailwind wf-primary, wf-header-search-bg, wf-table-footer registrations
  - GaugeChartComponent with no hardcoded hex colors
affects:
  - 23-header-chrome
  - 24-table-component
  - 25-kpi-cards
  - 26-chart-palette
  - 27-composition-bar
  - 28-brand-override

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "color-mix() for accent-muted opacity (no hardcoded rgba)"
    - "--wf-accent as alias to var(--wf-primary) for backward compat (240+ usages preserved)"
    - "--wf-primary as semantic canonical primary, --wf-accent as alias"

key-files:
  created: []
  modified:
    - tools/wireframe-builder/styles/wireframe-tokens.css
    - tools/wireframe-builder/components/GaugeChartComponent.tsx
    - tailwind.config.ts

key-decisions:
  - "Kept --wf-accent as alias to var(--wf-primary) rather than renaming (240 usages across 31 files, no TS enforcement)"
  - "Used color-mix() for --wf-accent-muted in both themes (12% light, 15% dark) to avoid hardcoded rgba values"
  - "--wf-canvas hardcoded (#f6f6f8 light, #101622 dark) not aliased to neutral token for exact visual control"

patterns-established:
  - "Token-first: all component color values flow from CSS tokens, no hardcoded hex in component files"
  - "Both [data-wf-theme=light] and [data-wf-theme=dark] always updated in the same edit"

requirements-completed: [TOK-01, TOK-02, TOK-03, TOK-04, TOK-05, TOK-06]

# Metrics
duration: 8min
completed: 2026-03-11
---

# Phase 22 Plan 01: Token Foundation Summary

**Wireframe token system migrated from warm stone/gold palette to slate grays + primary blue (#1152d4), with three new tokens, color-mix() accent-muted, and GaugeChart fully token-driven**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-11T12:00:00Z
- **Completed:** 2026-03-11T12:08:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced all warm stone gray values with Tailwind slate scale in both light and dark theme blocks
- Added --wf-primary as canonical primary color token (#1152d4 light, #4d7ce8 dark)
- Changed --wf-accent to alias var(--wf-primary) preserving all 240+ existing usages
- Added --wf-chart-warn, --wf-header-search-bg, --wf-table-footer-bg, --wf-table-footer-fg tokens
- Replaced color-mix() for --wf-accent-muted eliminating hardcoded rgba values
- Removed last hardcoded hex from GaugeChartComponent.tsx (both zone color references)
- Registered new Tailwind wf-primary, wf-header-search-bg, wf-table-footer classes

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace wireframe token values in both theme blocks** - `2b3ed25` (feat)
2. **Task 2: Replace GaugeChart hardcoded color with token reference** - `842c5a3` (feat)

**Plan metadata:** *(pending docs commit)*

## Files Created/Modified
- `tools/wireframe-builder/styles/wireframe-tokens.css` - Full palette replacement, stone→slate, gold→blue, new tokens added
- `tailwind.config.ts` - New wf-primary, wf-header-search-bg, wf-table-footer token registrations
- `tools/wireframe-builder/components/GaugeChartComponent.tsx` - Both #f59e0b replaced with var(--wf-chart-warn)

## Decisions Made
- Kept --wf-accent as alias to var(--wf-primary) rather than renaming 240+ usages across 31 files
- Used color-mix() for --wf-accent-muted in both themes (12% light, 15% dark) to avoid hardcoded rgba
- --wf-canvas hardcoded to exact values (#f6f6f8 / #101622) for precise visual control, not aliased to neutral

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Token foundation is complete. All ~55 wireframe components auto-update via CSS cascade with the new slate+blue values.
- Phase 23 (header chrome) can now use --wf-header-search-bg for the search input background.
- Phase 24 (table component) can use --wf-table-footer-bg and --wf-table-footer-fg.
- GaugeChart is fully token-driven — no hardcoded colors remain.

---
*Phase: 22-token-foundation*
*Completed: 2026-03-11*
