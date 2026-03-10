# Plan 08-03 Summary — Wire Theme Provider, Dark/Light Toggle, Branding Overrides

**Status:** Complete
**Duration:** ~12min (including human-verify and visual fix iteration)
**Commits:**
- `7856ca0` — feat(08-03): add dark/light toggle to AdminToolbar
- `16ae61b` — feat(08-03): wire WireframeThemeProvider into viewer pages with branding overrides
- `de516c7` — fix(08-03): preserve gold wireframe identity, remove brandPrimary cascade

## What was done

### Task 1: Dark/light toggle in AdminToolbar
- Added Moon/Sun icon toggle button between Comments and Edit buttons
- Uses `useWireframeTheme` hook for toggle/theme state

### Task 2: Wire WireframeThemeProvider into viewers
- `WireframeViewer.tsx`: Wrapped content in `WireframeThemeProvider`, applied `brandingToWfOverrides`
- `SharedWireframeView.tsx`: Wrapped in `WireframeThemeProvider`, added `SharedThemeToggle` floating button
- Comment overlays/modals render outside `[data-wf-theme]` container

### Task 3: Human-verify checkpoint + Visual fix iteration
Operator identified issues during visual verification:
1. **Blue instead of gold** — `brandingToWfOverrides` was replacing `--wf-accent` (gold #d4a017) with client `primaryColor` (#1B6B93 teal/blue)
2. **AdminToolbar used app tokens** (`bg-background`, `text-foreground`) — didn't respond to dark/light toggle
3. **Table headers too heavy** — dark bg (neutral-800) with white text, not matching modern SaaS reference
4. **brandPrimary prop cascade** — propagated blue through 12+ component files

**Fix applied (15 files, commit de516c7):**
- `brandingToWfOverrides` now returns `{}` — wireframe keeps gold identity, branding via fonts/logo/chart palette only
- AdminToolbar rewritten with `--wf-*` inline styles (responds to theme toggle)
- Table headers lightened: `neutral-100` bg, `neutral-500` text, uppercase tracking
- `brandPrimary` prop removed from entire renderer chain (BlueprintRenderer → SectionRenderer → TableRenderer/KpiGridRenderer/ChartGridRenderer → DataTable/ClickableTable/DrillDownTable/KpiCardFull)
- Floating comment buttons use `--wf-accent` instead of app `--primary`
- Updated branding tests for new behavior

## Decisions
- Wireframe design system keeps its gold accent identity regardless of client branding
- Client branding is expressed via logo, fonts, and chart palette only (not accent/sidebar color overrides)
- AdminToolbar is wireframe chrome — uses `--wf-*` tokens, not app tokens

## Requirements covered
- DSGN-02: Dark/light toggle in AdminToolbar + SharedWireframeView
- DSGN-03: All wireframe components respond to theme change (verified by operator)
- DSGN-04: Branding via fonts/logo/charts without affecting wireframe chrome identity
