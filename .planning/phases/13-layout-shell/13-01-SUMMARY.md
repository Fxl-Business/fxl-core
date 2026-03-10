---
phase: 13-layout-shell
plan: 01
subsystem: ui
tags: [layout, header, frosted-glass, scroll, search, tailwind, react-router]

# Dependency graph
requires:
  - phase: 12-design-foundation
    provides: Slate + indigo palette, Inter/JetBrains Mono fonts, scrollbar styling
provides:
  - Frosted glass sticky header (h-16, z-50, backdrop-blur-md, bg-white/80)
  - Three-column flex layout without nested scroll containers
  - ScrollToTop component for navigation-aware scroll reset
  - Input-styled search trigger with Cmd+K badge
  - scrollbar-gutter stable on html preventing layout shift
  - scroll-margin-top on headings for future TOC anchor offset
  - Page-level width constraints (max-w-4xl/5xl) on all content pages
affects: [14-sidebar-navigation, 15-doc-rendering-toc, 16-consistency-pass]

# Tech tracking
tech-stack:
  added: []
  patterns: [viewport-level-scrolling, page-owns-width-constraint, frosted-glass-header]

key-files:
  created:
    - src/components/layout/ScrollToTop.tsx
  modified:
    - src/components/layout/Layout.tsx
    - src/components/layout/TopNav.tsx
    - src/components/layout/SearchCommand.tsx
    - src/styles/globals.css
    - src/pages/Home.tsx
    - src/pages/DocRenderer.tsx
    - src/pages/docs/ProcessDocsViewer.tsx
    - src/pages/clients/FinanceiroContaAzul/Index.tsx
    - src/pages/clients/FinanceiroContaAzul/DocViewer.tsx

key-decisions:
  - "Page-owns-width pattern: Layout.tsx no longer wraps content in max-w -- each page sets its own max-w"
  - "max-w-5xl for Home and DocRenderer (wider content), max-w-4xl for standard doc pages"
  - "ScrollToTop as sibling component in Layout (not inside main) to avoid re-render coupling"

patterns-established:
  - "Page-owns-width: Every page component manages its own mx-auto max-w-* constraint"
  - "Viewport scrolling: No overflow-hidden or overflow-y-auto on Layout containers"
  - "Frosted glass header: sticky top-0 z-50 bg-white/80 backdrop-blur-md with dark mode variant"

requirements-completed: [LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05]

# Metrics
duration: 12min
completed: 2026-03-10
---

# Phase 13 Plan 01: Layout Shell Summary

**Frosted glass sticky header with viewport-level scrolling, input-styled search trigger, and page-delegated width constraints**

## Performance

- **Duration:** ~12 min (across two execution sessions with checkpoint)
- **Started:** 2026-03-10T17:10:00Z
- **Completed:** 2026-03-10T17:23:50Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 10

## Accomplishments
- Frosted glass header (h-16, backdrop-blur-md, bg-white/80) with "Nucleo FXL" brand and "FXL-CORE" subtitle
- Input-styled search trigger with Search icon, placeholder text, and Cmd+K keyboard badge
- Viewport-level scrolling by removing overflow-hidden/overflow-y-auto from Layout containers
- ScrollToTop component resets scroll position on route navigation
- scrollbar-gutter: stable prevents layout shift when Cmd+K dialog opens
- 5 pages wrapped with their own max-w constraints after Layout delegated width responsibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure layout shell, header, search trigger, and scroll context** - `e2af039` (feat)
2. **Task 2: Add width constraints to pages that lost Layout max-w wrapper** - `0c6e04d` (feat)
3. **Task 3: Visual verification of layout shell** - checkpoint approved (no commit)

## Files Created/Modified
- `src/components/layout/Layout.tsx` - Removed nested scroll containers, three-column flex, renders ScrollToTop
- `src/components/layout/TopNav.tsx` - Frosted glass h-16 header with brand text and dark mode support
- `src/components/layout/SearchCommand.tsx` - Input-styled trigger with Search icon and Cmd+K badge
- `src/components/layout/ScrollToTop.tsx` - NEW: Resets window.scrollTo(0,0) on pathname change
- `src/styles/globals.css` - Added scrollbar-gutter: stable and scroll-margin-top on headings
- `src/pages/Home.tsx` - Wrapped in mx-auto max-w-5xl
- `src/pages/DocRenderer.tsx` - Wrapped in mx-auto max-w-5xl
- `src/pages/docs/ProcessDocsViewer.tsx` - Wrapped in mx-auto max-w-4xl
- `src/pages/clients/FinanceiroContaAzul/Index.tsx` - Wrapped in mx-auto max-w-4xl
- `src/pages/clients/FinanceiroContaAzul/DocViewer.tsx` - Wrapped in mx-auto max-w-4xl (both return paths)

## Decisions Made
- **Page-owns-width pattern:** Layout.tsx no longer wraps Outlet in max-w-4xl. Each page sets its own width constraint. This enables DocRenderer and Home to use max-w-5xl while doc pages use max-w-4xl.
- **max-w-5xl for wider pages:** Home (3-column card grid) and DocRenderer (content + TOC side-by-side) benefit from 1024px width; standard doc pages use 896px.
- **ScrollToTop placement:** Rendered as last child of outer Layout div (sibling to TopNav and flex container), not inside main, to avoid unnecessary re-renders of content.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Layout shell complete with viewport-level scrolling -- sidebar sticky positioning (Phase 14) can now use position: sticky without fighting nested overflow containers
- scroll-margin-top on headings already set for Phase 15 TOC scroll-to-heading
- Three-column layout ready: sidebar (left), content (center), TOC area (right) -- Phase 15 will add the right TOC column

## Self-Check: PASSED

All 10 files verified present. Both task commits (e2af039, 0c6e04d) verified in git log.

---
*Phase: 13-layout-shell*
*Completed: 2026-03-10*
