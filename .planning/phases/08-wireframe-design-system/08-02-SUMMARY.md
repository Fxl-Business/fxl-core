---
phase: 08-wireframe-design-system
plan: 02
subsystem: ui
tags: [css-custom-properties, tailwind, theming, wireframe-components, design-tokens, color-migration]

# Dependency graph
requires:
  - phase: 08-wireframe-design-system
    plan: 01
    provides: "--wf-* CSS custom properties, Tailwind wf-* utilities, wireframe-tokens.css"
provides:
  - "All 26 wireframe component files migrated from hardcoded colors to --wf-* token references"
  - "Chart components using var(--wf-chart-N) for fill/stroke defaults"
  - "WireframeHeader/FilterBar using inline var(--wf-*) for all hex values"
  - "WireframeSidebar using wf-sidebar-* tokens for all states"
  - "ScreenManager editor sidebar using wf-sidebar-* tokens"
  - "Zero hardcoded bg-white, bg-gray-*, text-gray-*, border-gray-*, shadow-sm, hex values in wireframe components"
affects: [08-03 viewer wiring, 09-component-library]

# Tech tracking
tech-stack:
  added: []
  patterns: ["color-mix(in srgb, var(--wf-*) N%, transparent) for semi-transparent token backgrounds", "inline style with var(--wf-*) for components that need CSS variable references in JSX style props"]

key-files:
  created: []
  modified:
    - "tools/wireframe-builder/components/KpiCard.tsx"
    - "tools/wireframe-builder/components/KpiCardFull.tsx"
    - "tools/wireframe-builder/components/DataTable.tsx"
    - "tools/wireframe-builder/components/ConfigTable.tsx"
    - "tools/wireframe-builder/components/ClickableTable.tsx"
    - "tools/wireframe-builder/components/DrillDownTable.tsx"
    - "tools/wireframe-builder/components/CalculoCard.tsx"
    - "tools/wireframe-builder/components/InputsScreen.tsx"
    - "tools/wireframe-builder/components/ManualInputSection.tsx"
    - "tools/wireframe-builder/components/SaldoBancoInput.tsx"
    - "tools/wireframe-builder/components/UploadSection.tsx"
    - "tools/wireframe-builder/components/GlobalFilters.tsx"
    - "tools/wireframe-builder/components/DetailViewSwitcher.tsx"
    - "tools/wireframe-builder/components/WireframeModal.tsx"
    - "tools/wireframe-builder/components/BarLineChart.tsx"
    - "tools/wireframe-builder/components/DonutChart.tsx"
    - "tools/wireframe-builder/components/ParetoChart.tsx"
    - "tools/wireframe-builder/components/WaterfallChart.tsx"
    - "tools/wireframe-builder/components/WireframeHeader.tsx"
    - "tools/wireframe-builder/components/WireframeFilterBar.tsx"
    - "tools/wireframe-builder/components/WireframeSidebar.tsx"
    - "tools/wireframe-builder/components/sections/KpiGridRenderer.tsx"
    - "tools/wireframe-builder/components/sections/TableRenderer.tsx"
    - "tools/wireframe-builder/components/editor/ScreenManager.tsx"

key-decisions:
  - "color-mix(in srgb) for semi-transparent positive/negative badge backgrounds instead of Tailwind opacity modifiers (which don't work with CSS var() references)"
  - "CalculoCard values use var(--wf-accent) for positive and var(--wf-negative) for negative instead of blue/red"
  - "WaterfallChart DEFAULT_FILL uses var(--wf-positive/negative/chart-1) with color-mix for compare fills"
  - "EditableSectionWrapper keeps app tokens (bg-background, shadow-sm) since it is editor chrome, not wireframe content"
  - "DetailViewSwitcher active state uses var(--wf-accent) with var(--wf-accent-fg) via inline style"
  - "WireframeFilterBar boxShadow removed per user decision (no shadows on wireframe components)"

patterns-established:
  - "Variation badges: inline style with color-mix(in srgb, var(--wf-positive/negative) 10%, transparent) for bg, var(--wf-positive/negative) for text"
  - "Table headers without brandPrimary: bg-wf-table-header text-wf-table-header-fg"
  - "Table headers with brandPrimary: style={{ backgroundColor: brandPrimary }} text-wf-table-header-fg"
  - "Chart default fills: var(--wf-chart-N) instead of hardcoded hex, chartColors prop overrides when present"
  - "Inline style hex -> var(--wf-*): for components using style={{}} (WireframeHeader, WireframeFilterBar)"

requirements-completed: [DSGN-01]

# Metrics
duration: 9min
completed: 2026-03-09
---

# Phase 8 Plan 2: Component Token Migration Summary

**Migrated all 26 wireframe component files from hardcoded Tailwind gray classes and inline hex values to --wf-* design token references, enabling theme-aware rendering for dark mode and client branding**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-09T23:22:44Z
- **Completed:** 2026-03-09T23:32:36Z
- **Tasks:** 2
- **Files modified:** 24

## Accomplishments
- Complete migration of 14 card/KPI/table/form components (Task 1) and 12 chart/chrome/sidebar/editor components (Task 2) to --wf-* token system
- Zero hardcoded bg-white, bg-gray-*, text-gray-*, border-gray-*, hex values (#FFFFFF, #212121, #E0E0E0, #424242), or shadow-sm remaining in wireframe component files
- Charts (BarLineChart, DonutChart, ParetoChart, WaterfallChart) use var(--wf-chart-N) for fill/stroke defaults
- WireframeHeader and WireframeFilterBar use inline var(--wf-*) for all previously hardcoded hex values
- WireframeSidebar and ScreenManager use wf-sidebar-* tokens for all visual states
- All shadow-sm removed from wireframe cards (per user decision: borders only)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate card/KPI components and tables (14 files)** - `78c6846` (feat)
2. **Task 2: Migrate charts, chrome, sidebar, editor components (12 files)** - `eab6440` (feat)

## Files Created/Modified
- `tools/wireframe-builder/components/KpiCard.tsx` - bg-wf-card, text-wf-heading, variation badges via inline var(--wf-positive/negative), removed cn import
- `tools/wireframe-builder/components/KpiCardFull.tsx` - Same KPI pattern, sparkline stroke var(--wf-muted) fallback
- `tools/wireframe-builder/components/DataTable.tsx` - bg-wf-table-header, text-wf-table-header-fg, border-wf-card-border
- `tools/wireframe-builder/components/ConfigTable.tsx` - bg-wf-canvas headers, wf-muted badge fallback, wf-card selects
- `tools/wireframe-builder/components/ClickableTable.tsx` - Same table pattern, hover:bg-wf-accent-muted for row click
- `tools/wireframe-builder/components/DrillDownTable.tsx` - Same table pattern, wf-muted drill arrows
- `tools/wireframe-builder/components/CalculoCard.tsx` - bg-wf-table-header header, wf-accent values, color-mix variation badges
- `tools/wireframe-builder/components/InputsScreen.tsx` - bg-wf-card container, bg-wf-canvas drop zone, text-wf-muted
- `tools/wireframe-builder/components/ManualInputSection.tsx` - bg-wf-canvas container, wf-card inputs, wf-table-header entries table
- `tools/wireframe-builder/components/SaldoBancoInput.tsx` - bg-wf-canvas, wf-card inputs, wf-heading totals
- `tools/wireframe-builder/components/UploadSection.tsx` - bg-wf-card, wf-canvas drop zone, wf-muted history table
- `tools/wireframe-builder/components/GlobalFilters.tsx` - bg-wf-canvas, wf-card selects, removed shadow-sm
- `tools/wireframe-builder/components/DetailViewSwitcher.tsx` - wf-accent active, wf-canvas inactive via inline style
- `tools/wireframe-builder/components/WireframeModal.tsx` - bg-wf-card, wf-heading title, wf-canvas footer
- `tools/wireframe-builder/components/BarLineChart.tsx` - var(--wf-chart-1/2) fill/stroke, var(--wf-card-border) grid
- `tools/wireframe-builder/components/DonutChart.tsx` - var(--wf-chart-N) palette array, wf-heading/body/muted text
- `tools/wireframe-builder/components/ParetoChart.tsx` - var(--wf-chart-1/2) bar/line, var(--wf-card-border) grid
- `tools/wireframe-builder/components/WaterfallChart.tsx` - var(--wf-positive/negative/chart-1) fills, color-mix compare, wf tooltips
- `tools/wireframe-builder/components/WireframeHeader.tsx` - var(--wf-header-bg/border), var(--wf-heading) title, var(--wf-body/card-border) arrows
- `tools/wireframe-builder/components/WireframeFilterBar.tsx` - var(--wf-card/card-border), var(--wf-accent/accent-muted) toggle, removed boxShadow
- `tools/wireframe-builder/components/WireframeSidebar.tsx` - wf-sidebar-*/active/muted/fg tokens
- `tools/wireframe-builder/components/sections/KpiGridRenderer.tsx` - text-wf-muted group label
- `tools/wireframe-builder/components/sections/TableRenderer.tsx` - text-wf-muted placeholder text
- `tools/wireframe-builder/components/editor/ScreenManager.tsx` - wf-sidebar-* tokens for screen items, menus, buttons

## Decisions Made
- **color-mix() for semi-transparent backgrounds:** Used `color-mix(in srgb, var(--wf-positive) 10%, transparent)` for variation badge backgrounds because Tailwind opacity modifiers (like `bg-wf-positive/10`) do not work with CSS variable references that resolve to hex values
- **CalculoCard accent values:** Changed value column from blue-700/red-600 to var(--wf-accent)/var(--wf-negative) to align with the design system's semantic color scheme
- **WaterfallChart semantic fills:** Migrated DEFAULT_FILL to use var(--wf-positive/negative/chart-1) with color-mix for compare fills, keeping the chartColors prop override path for branding
- **EditableSectionWrapper stays app-scoped:** Editor chrome (drag handles, delete buttons) correctly uses app tokens (bg-background, text-muted-foreground, shadow-sm) since it is operator UI, not wireframe content
- **WireframeFilterBar shadow removal:** Removed boxShadow from filter bar container per user decision (no box-shadows on wireframe components)
- **DetailViewSwitcher inline style:** Used inline style for active/inactive states since the wf-accent/accent-fg tokens are CSS variables that work better as style props than as Tailwind class targets

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused cn import from KpiCard.tsx**
- **Found during:** Task 1
- **Issue:** After migrating variation badges from conditional className to inline style, the `cn` utility import was no longer used, causing TS6133 error
- **Fix:** Removed the unused import
- **Files modified:** tools/wireframe-builder/components/KpiCard.tsx
- **Verification:** TypeScript compiles clean
- **Committed in:** 78c6846 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Migrated WaterfallChart DEFAULT_FILL to token references**
- **Found during:** Task 2
- **Issue:** DEFAULT_FILL and DEFAULT_FILL_COMPARE had hardcoded hex values (#22c55e, #ef4444, #3b82f6, etc.) that would not respond to theme changes
- **Fix:** Replaced with var(--wf-positive), var(--wf-negative), var(--wf-chart-1) and color-mix variants for compare fills
- **Files modified:** tools/wireframe-builder/components/WaterfallChart.tsx
- **Verification:** Zero hex values remain in file, TypeScript compiles clean
- **Committed in:** eab6440 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All wireframe components now consume --wf-* tokens, ready for Plan 03 to wire WireframeThemeProvider into WireframeViewer and SharedWireframeView
- brandPrimary prop still accepted by table/chart components for backward compatibility; Plan 03 will replace this with brandingToWfOverrides() injection
- Comment components (CommentOverlay, CommentManager, CommentBadge, CommentIcon) intentionally left on app tokens per RESEARCH.md decision
- EditableSectionWrapper editor chrome left on app tokens (correct: operator UI, not wireframe content)

## Self-Check: PASSED

- All 24 modified files verified on disk
- Both task commits (78c6846, eab6440) verified in git log
- TypeScript compiles clean, zero hardcoded wireframe colors remain

---
*Phase: 08-wireframe-design-system*
*Completed: 2026-03-09*
