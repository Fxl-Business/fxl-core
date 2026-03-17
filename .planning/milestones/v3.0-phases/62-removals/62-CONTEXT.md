# Phase 62: Removals - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove dead and redundant code: Knowledge Base module (entire directory, service files, IDs, routes), ProcessDocsViewer.tsx (unused), duplicate components (PageHeader.tsx copy, PromptBlock.tsx copy). Reduces codebase size without any functional change.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure removal phase.

Key items to remove per design spec Section 4.5:
- `src/modules/knowledge-base/` entire directory
- `src/lib/kb-service.ts` and `src/lib/kb-service.test.ts` (if still exist at old path)
- `MODULE_IDS.KNOWLEDGE_BASE` from module-ids.ts
- Knowledge Base entry from MODULE_REGISTRY in registry.ts
- Knowledge Base routes from AppRouter.tsx
- `src/pages/docs/ProcessDocsViewer.tsx` (if still at old path, or wherever it was moved)
- Duplicate PageHeader.tsx (keep canonical version in modules/docs/components/)
- Duplicate PromptBlock.tsx (keep canonical version, remove copy)
- Any remaining .gitkeep files in directories that now have real content
- `src/modules/ferramentas/` directory (replaced by wireframe module)
- Empty old directories: `src/components/docs/`, `src/components/layout/`, `src/pages/clients/`, `src/pages/docs/`, `src/pages/tools/`, `src/lib/` (if empty)

</decisions>

<code_context>
## Existing Code Insights

### Current State After Phase 61
- Knowledge Base module still exists at `src/modules/knowledge-base/`
- KB references may exist in SearchCommand, Home, registry
- Old directories may be empty after Phase 61 file moves
- `src/modules/ferramentas/` replaced by `src/modules/wireframe/`

### Integration Points
- MODULE_REGISTRY in `src/platform/module-loader/registry.ts`
- MODULE_IDS in `src/platform/module-loader/module-ids.ts`
- Routes in `src/platform/router/AppRouter.tsx`
- SearchCommand.tsx may import from KB service

</code_context>

<specifics>
## Specific Ideas

No specific requirements — straightforward removal phase.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
