---
phase: 15-doc-rendering-and-toc
plan: 01
subsystem: ui
tags: [react, rehype-highlight, syntax-highlighting, typography, tailwindcss]

requires:
  - phase: 14-sidebar-navigation-redesign
    provides: border-l rail pattern, indigo active states, sticky positioning
provides:
  - rehype-highlight syntax highlighting integration
  - Terminal dots code block wrapper pattern
  - Indigo badge pill component pattern
  - Upgraded prose typography hierarchy (h2 2xl, h3 xl, p base)
affects: [15-02-toc-redesign]

tech-stack:
  added: [rehype-highlight, highlight.js/github-dark-dimmed]
  patterns: [terminal-dots-pre-wrapper, indigo-badge-pill, prose-typography-scale]

key-files:
  created: []
  modified:
    - src/main.tsx
    - src/components/docs/DocBreadcrumb.tsx
    - src/components/docs/DocPageHeader.tsx
    - src/components/docs/MarkdownRenderer.tsx
    - src/pages/DocRenderer.tsx
    - src/styles/globals.css

key-decisions:
  - "Used github-dark-dimmed theme for syntax highlighting — dark but not too contrasty"
  - "Terminal dots wrapper owns background, .hljs background set to transparent"
  - "Removed raw markdown button and Separator from DocPageHeader — cleaner visual flow"

patterns-established:
  - "Terminal dots wrapper: outer div with rounded-xl overflow-hidden owns bg, inner pre scrolls"
  - "Inline code scoped via :not(pre) > code to avoid conflicts with syntax-highlighted blocks"
  - "Badge pill pattern: rounded-full bg-indigo-50 with ring-1 ring-inset"

requirements-completed: [DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07]

duration: 8min
completed: 2026-03-10
---

# Plan 15-01: Doc Page Visual Polish Summary

**rehype-highlight syntax highlighting with terminal dots, indigo badge pills, ChevronRight breadcrumbs, and upgraded prose typography**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Installed rehype-highlight with github-dark-dimmed theme for syntax-highlighted code blocks
- Added terminal dots (red/yellow/green) wrapper around code blocks with dark slate-900 background
- Restyled DocBreadcrumb with ChevronRight separator and slate-500 text
- Restyled DocPageHeader with indigo badge pill, 4xl/5xl title, text-lg description
- Removed raw markdown button and double Separator from doc pages
- Upgraded prose typography: h2 2xl bold, h3 xl semibold, p base with relaxed leading
- Scoped inline code to :not(pre) > code with indigo-600 styling

## Task Commits

1. **Task 1: Install rehype-highlight, restyle breadcrumb and page header** - `3070490` (feat)
2. **Task 2: Add syntax highlighting, terminal dots, prose typography** - `51cd482` (feat)

## Files Created/Modified
- `src/main.tsx` - Added highlight.js theme import between fonts and globals.css
- `src/components/docs/DocBreadcrumb.tsx` - ChevronRight separator, text-sm slate-500
- `src/components/docs/DocPageHeader.tsx` - Indigo badge pill, 4xl title, removed Separator/raw button
- `src/components/docs/MarkdownRenderer.tsx` - rehype-highlight integration, terminal dots pre wrapper
- `src/pages/DocRenderer.tsx` - Removed Separator import/usage, removed rawContent prop
- `src/styles/globals.css` - .hljs transparent override, upgraded prose sizes, scoped inline code

## Decisions Made
- Used github-dark-dimmed over github-dark — softer contrast fits the slate palette better
- Set .hljs background to transparent so the wrapper div controls code block background color
- Removed "Exibir Markdown" button entirely — not needed for production docs

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## Next Phase Readiness
- Code blocks now have proper syntax highlighting and terminal dots
- Typography hierarchy is production quality
- Ready for plan 15-02 (TOC redesign) which depends on heading IDs remaining intact

---
*Phase: 15-doc-rendering-and-toc*
*Completed: 2026-03-10*
