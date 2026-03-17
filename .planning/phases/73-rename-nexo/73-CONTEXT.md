# Phase 73: Rename Nexo - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Rename all user-visible occurrences of "FXL Core" and "Nucleo FXL" to "Nexo" across UI components, meta files, and documentation. Pure string replacement — zero functional changes.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase.
Replace strings methodically: grep for occurrences, replace, verify no broken imports or references.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None needed — string replacement only

### Established Patterns
- UI titles are in component JSX (Layout, Login, Signup, Home)
- Meta tags in index.html
- Package name in package.json
- Product name referenced in CLAUDE.md and .planning/PROJECT.md

### Integration Points
- Clerk auth pages reference product name in headings
- Sidebar brand area
- Home page identity card

</code_context>

<specifics>
## Specific Ideas

- "FXL SDK" keeps "FXL" name (company name, not product name)
- GitHub repo name stays fxl-core
- MODULE_IDS and internal registry names stay unchanged
- Filesystem folder names stay unchanged

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>
