---
phase: 08-wireframe-design-system
plan: 01
subsystem: ui
tags: [css-custom-properties, react-context, tailwind, theming, branding, dark-mode]

# Dependency graph
requires:
  - phase: 07-blueprint-infrastructure
    provides: Blueprint DB store and Zod schemas that wireframe viewers consume
provides:
  - "--wf-* CSS custom properties layer for light/dark wireframe themes"
  - "WireframeThemeProvider React context with localStorage persistence"
  - "Tailwind wf-* color utilities (bg-wf-card, text-wf-heading, etc.)"
  - "brandingToWfOverrides() function for branding-to-token override computation"
  - "Exported hexToHsl() and darken() color math helpers"
affects: [08-02 component migration, 08-03 viewer wiring, 09-component-library]

# Tech tracking
tech-stack:
  added: ["@testing-library/react (dev)", "@testing-library/jest-dom (dev)", "jsdom@25 (dev)"]
  patterns: ["[data-wf-theme] CSS scoping for wireframe isolation", "React context + localStorage for theme persistence", "CSS custom properties with Tailwind var() mapping"]

key-files:
  created:
    - "tools/wireframe-builder/styles/wireframe-tokens.css"
    - "tools/wireframe-builder/lib/wireframe-theme.tsx"
    - "tools/wireframe-builder/lib/wireframe-theme.test.ts"
    - "tools/wireframe-builder/lib/branding.test.ts"
  modified:
    - "tailwind.config.ts"
    - "src/styles/globals.css"
    - "tools/wireframe-builder/lib/branding.ts"
    - "package.json"

key-decisions:
  - "Wireframe tokens use hex/rgba values (not HSL) since charts need hex for SVG fill/stroke"
  - "Tailwind wf-* utilities use plain var(--wf-*) without hsl() wrapper"
  - "Sidebar fg contrast threshold at L > 50 (dark text) vs L <= 50 (light text)"
  - "jsdom pinned to v25 for vitest compatibility (v27 has ESM issues)"
  - "Corrected getChartPalette() JSDoc: Recharts SVG fill/stroke DO support CSS var()"

patterns-established:
  - "data-wf-theme attribute scoping: wireframe tokens only apply within [data-wf-theme] containers"
  - "WireframeThemeProvider wraps wireframe content, sets data-wf-theme on container div"
  - "brandingToWfOverrides() returns CSSProperties with --wf-* overrides for inline style injection"
  - "Per-file vitest environment override via // @vitest-environment jsdom comment"

requirements-completed: [DSGN-01, DSGN-02, DSGN-04]

# Metrics
duration: 6min
completed: 2026-03-09
---

# Phase 8 Plan 1: Token CSS Layer, Theme Provider, and Branding Override Summary

**Complete --wf-* CSS token system (warm stone grays + gold accent) with WireframeThemeProvider context, Tailwind wf-* utilities, and brandingToWfOverrides() for client branding override injection**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-09T23:12:51Z
- **Completed:** 2026-03-09T23:19:16Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Complete wireframe token CSS defining 30+ CSS custom properties for light and dark themes under [data-wf-theme] selectors
- WireframeThemeProvider React context with localStorage persistence, toggle, and setTheme API
- Tailwind config extended with wf-* color utilities for seamless class-based styling (bg-wf-card, text-wf-heading, border-wf-card-border, etc.)
- brandingToWfOverrides() computes accent and sidebar overrides from BrandingConfig with contrast-aware fg color
- 11 new tests (6 theme + 5 branding) all passing, 93 total tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Create wireframe token CSS, theme provider, and Tailwind extension** - `6788bcf` (feat)
2. **Task 2: Add brandingToWfOverrides to branding.ts** - `30beff0` (feat)

_Both tasks followed TDD (RED -> GREEN): tests written first, then implementation._

## Files Created/Modified
- `tools/wireframe-builder/styles/wireframe-tokens.css` - Complete --wf-* token definitions for light and dark themes (neutral scale, semantic mappings, accent, sidebar, header, table, chart palette)
- `tools/wireframe-builder/lib/wireframe-theme.tsx` - WireframeThemeProvider context + useWireframeTheme hook with localStorage persistence
- `tools/wireframe-builder/lib/wireframe-theme.test.ts` - 6 tests covering default theme, localStorage read, toggle, setTheme, persistence, error on missing provider
- `tools/wireframe-builder/lib/branding.test.ts` - 5 tests covering accent override, sidebar darkening, contrast computation for light/dark primaries
- `tailwind.config.ts` - Extended with wf.* color namespace (canvas, card, heading, body, muted, accent, sidebar, table)
- `src/styles/globals.css` - Added wireframe-tokens.css import for global availability
- `tools/wireframe-builder/lib/branding.ts` - Added brandingToWfOverrides(), exported hexToHsl/darken, corrected getChartPalette JSDoc
- `package.json` - Added @testing-library/react, @testing-library/jest-dom, jsdom as dev dependencies

## Decisions Made
- **Hex values over HSL for wireframe tokens:** Wireframe tokens use raw hex/rgba values (not HSL like the app theme) because charts need hex strings for SVG fill/stroke and the wireframe palette is defined as explicit hex values in CONTEXT.md
- **Tailwind var() without hsl() wrapper:** Since wireframe tokens store hex values, the Tailwind wf-* utilities reference plain var(--wf-*) without the hsl() wrapper used by shadcn app tokens
- **Contrast threshold L > 50:** Sidebar fg color computed for contrast using HSL lightness threshold at 50 -- below 50 gets light text (#fafaf9), above 50 gets dark text (#1c1917)
- **jsdom@25 for test compatibility:** jsdom 27 has ESM compatibility issues with the current vitest setup; pinned to v25 which works correctly
- **Corrected Recharts JSDoc:** The existing claim that "Recharts SVG fill/stroke attributes do NOT support CSS var()" was factually incorrect per MDN and Reshaped docs; corrected to reflect that var() IS supported

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed test dependencies and fixed jsdom version**
- **Found during:** Task 1 (test infrastructure setup)
- **Issue:** @testing-library/react and jsdom not installed; jsdom@27 had ESM compatibility error with vitest
- **Fix:** Installed @testing-library/react, @testing-library/jest-dom, jsdom@25 as dev dependencies
- **Files modified:** package.json
- **Verification:** All 6 theme tests pass with jsdom@25 environment
- **Committed in:** 6788bcf (Task 1 commit)

**2. [Rule 1 - Bug] Added cleanup to test suite to prevent DOM leakage**
- **Found during:** Task 1 (theme test execution)
- **Issue:** Second render test failed because previous test's DOM was not cleaned up, causing duplicate testid elements
- **Fix:** Added afterEach(cleanup) to the test describe block
- **Files modified:** tools/wireframe-builder/lib/wireframe-theme.test.ts
- **Verification:** All 6 tests pass consistently
- **Committed in:** 6788bcf (Task 1 commit)

**3. [Rule 3 - Blocking] CSS import path adjustment for globals.css**
- **Found during:** Task 1 (globals.css modification)
- **Issue:** Plan referenced src/index.css which does not exist; actual CSS entry point is src/styles/globals.css
- **Fix:** Added wireframe tokens import to correct file (src/styles/globals.css) with relative path ../../tools/wireframe-builder/styles/wireframe-tokens.css
- **Files modified:** src/styles/globals.css
- **Verification:** Import resolves correctly in build path
- **Committed in:** 6788bcf (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All auto-fixes necessary for correct test execution and build integration. No scope creep.

## Issues Encountered
- npm cache had root-owned files preventing installation; worked around by using --cache /tmp/npm-cache-gsd flag

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Token system and theme provider ready for Plan 02 (component migration from hardcoded colors to --wf-* tokens)
- Tailwind wf-* utilities available for Plan 02 to use bg-wf-card, text-wf-heading, etc. in components
- brandingToWfOverrides() ready for Plan 03 to inject branding overrides into wireframe container
- WireframeThemeProvider ready for Plan 03 to wire into WireframeViewer and SharedWireframeView

## Self-Check: PASSED

- All 5 created files verified on disk
- Both task commits (6788bcf, 30beff0) verified in git log
- 93 tests passing, TypeScript compiles clean

---
*Phase: 08-wireframe-design-system*
*Completed: 2026-03-09*
