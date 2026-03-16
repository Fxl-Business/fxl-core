# Phase 60: Platform Scaffold + Shared Layer - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the directory skeleton for the new modular monolith structure: src/platform/, src/shared/, and autocontido module directories under src/modules/. No file moves — only empty directories and barrel index files where needed. The design spec Section 4.2 defines the exact target structure.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow the design spec Section 4.2 structure exactly.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/modules/ already exists with manifests for docs, ferramentas, clients, knowledge-base, tasks
- src/components/ui/ already has shadcn components (will become shared/ui/)
- Path aliases configured in tsconfig.json and vite.config.ts: @/ -> src/, @tools/ -> tools/, @clients/ -> clients/

### Established Patterns
- MODULE_REGISTRY in src/modules/registry.ts drives routing and sidebar
- Each existing module (tasks, knowledge-base) has components/, pages/, hooks/, types/, extensions/
- Path alias pattern: @/components, @/lib, @/pages

### Integration Points
- tsconfig.json paths need updating for new @/platform/, @/shared/ aliases
- vite.config.ts resolve.alias needs matching updates
- No import changes needed yet (Phase 61 handles that)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase. Follow design spec Section 4.2 exactly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
