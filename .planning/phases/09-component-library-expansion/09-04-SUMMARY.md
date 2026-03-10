---
phase: 09-component-library-expansion
plan: 04
subsystem: ui
tags: [react-router, useParams, dynamic-import, branding, wireframe-viewer]

# Dependency graph
requires:
  - phase: 09-component-library-expansion
    provides: section registry, new section types, chart variants
provides:
  - Generic parametric WireframeViewer resolving blueprint + branding by client slug
  - Parametric /clients/:clientSlug/wireframe route in App.tsx
  - Redirect from old /clients/financeiro-conta-azul/wireframe-view route
affects: [10-briefing-blueprint-views, clients]

# Tech tracking
tech-stack:
  added: []
  patterns: [wrapper-inner component for hook-safe early returns, dynamic branding import map]

key-files:
  created:
    - src/pages/clients/WireframeViewer.tsx
  modified:
    - src/App.tsx
    - src/pages/clients/FinanceiroContaAzul/Wireframe.tsx

key-decisions:
  - "Wrapper/inner component pattern to avoid hooks-before-return issue with Navigate redirect"
  - "Route path /clients/:clientSlug/wireframe (not wireframe-view) per CONTEXT.md decision"
  - "brandingMap import map pattern matches SharedWireframeView for consistency"
  - "DEFAULT_BRANDING fallback for clients without custom branding config"

patterns-established:
  - "Wrapper/inner: outer component does useParams + guard, inner receives guaranteed string prop"
  - "brandingMap: extend Record<string, () => Promise<{ default: BrandingConfig }>> as clients added"

requirements-completed: [COMP-09]

# Metrics
duration: 6min
completed: 2026-03-10
---

# Phase 9 Plan 4: Parametric Wireframe Viewer Summary

**Generic WireframeViewer using useParams + dynamic branding import map, replacing hardcoded FinanceiroContaAzul viewer**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T00:59:35Z
- **Completed:** 2026-03-10T01:06:07Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Generic parametric WireframeViewer that resolves blueprint and branding by client slug from route params
- Dynamic branding resolution via import map with graceful fallback to DEFAULT_BRANDING
- All 872 lines of edit/comment/save/conflict/theme logic preserved exactly from original
- Old route /clients/financeiro-conta-azul/wireframe-view redirects to new /clients/financeiro-conta-azul/wireframe

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generic WireframeViewer with dynamic branding resolution** - `edd9a0e` (feat)
2. **Task 2: Update App.tsx routes and add redirect from old route** - `375d116` (feat)

## Files Created/Modified
- `src/pages/clients/WireframeViewer.tsx` - Generic parametric viewer using useParams, dynamic branding, all edit/comment/save logic
- `src/App.tsx` - Parametric :clientSlug route, Navigate redirect from old route, removed FinanceiroWireframeViewer import
- `src/pages/clients/FinanceiroContaAzul/Wireframe.tsx` - Updated link from wireframe-view to wireframe

## Decisions Made
- Used wrapper/inner component pattern (WireframeViewer -> WireframeViewerInner) to cleanly handle the Navigate redirect without violating React hooks rules. The outer component does useParams + early return, the inner component receives a guaranteed string clientSlug prop.
- Route path is /clients/:clientSlug/wireframe (not wireframe-view), matching the CONTEXT.md decision to use shorter paths.
- Reused the same brandingMap import pattern from SharedWireframeView for consistency across the codebase.
- DEFAULT_BRANDING provides neutral gray/blue fallback for any client without a custom branding.config.ts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hooks-before-return with wrapper/inner component pattern**
- **Found during:** Task 1
- **Issue:** Early return with `<Navigate>` before hooks caused TypeScript narrowing issues and React hooks-rules violations
- **Fix:** Split into thin wrapper (useParams + guard) and inner component (all hooks, guaranteed string clientSlug)
- **Files modified:** src/pages/clients/WireframeViewer.tsx
- **Verification:** npx tsc --noEmit passes with zero errors
- **Committed in:** edd9a0e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Structural improvement. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Any client with blueprint data in Supabase can now be viewed at /clients/:clientSlug/wireframe without code changes
- To add branding for a new client, add an entry to the brandingMap in WireframeViewer.tsx
- SharedWireframeView remains separate and untouched (token-gated external view)
- Old FinanceiroContaAzul/WireframeViewer.tsx left as dead file for cleanup later

## Self-Check: PASSED

- FOUND: src/pages/clients/WireframeViewer.tsx
- FOUND: edd9a0e (Task 1 commit)
- FOUND: 375d116 (Task 2 commit)

---
*Phase: 09-component-library-expansion*
*Completed: 2026-03-10*
