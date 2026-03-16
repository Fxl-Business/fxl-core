# Phase 61: Module Migration - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Move every file to its correct location per the design spec Section 4.4 migration manifest. Platform shell files go to src/platform/, module-specific code goes to src/modules/ (each autocontido), and cross-cutting utilities go to src/shared/. Update all import paths accordingly. This is the largest phase of v3.0 — it touches the most files but makes zero functional changes.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — pure infrastructure phase. Follow the design spec Section 4.4 file migration manifest exactly.

Key rules:
- Move files, update imports, verify tsc passes after each batch
- The wireframe module is a hybrid exception: manifest and pages in src/modules/wireframe/, components stay in tools/wireframe-builder/ via @tools/ alias
- Each module gets a CLAUDE.md with scoped instructions for agent development
- App.tsx delegates routing to platform/router/AppRouter.tsx
- shadcn components move to shared/ui/
- Cross-module imports only via registry + extensions (existing pattern)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Spec
- `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` — Section 4.4 has the complete file-by-file migration manifest

### Current Module System
- `src/modules/registry.ts` — ModuleDefinition interface + MODULE_REGISTRY
- `src/modules/module-ids.ts` — Constants (zero imports)
- `src/modules/extension-registry.ts` — Pure extension resolution
- `src/modules/slots.tsx` — ExtensionProvider + ExtensionSlot

### Current App Shell
- `src/App.tsx` — Central router + provider stack
- `src/components/layout/Layout.tsx` — Main shell
- `src/components/layout/Sidebar.tsx` — Module-driven menu

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 60 created directory skeleton: src/platform/, src/shared/, module subdirs
- Path aliases already configured: @platform/*, @shared/*, @modules/*
- Existing module manifests in src/modules/ (docs, ferramentas, clients, tasks, knowledge-base)

### Established Patterns
- Import alias pattern: @/ -> src/, @tools/ -> tools/, @clients/ -> clients/
- New aliases from Phase 60: @platform/ -> src/platform/, @shared/ -> src/shared/, @modules/ -> src/modules/
- MODULE_REGISTRY drives sidebar, routing, and home page

### Integration Points
- App.tsx routing logic → extract to platform/router/AppRouter.tsx
- src/lib/ services → distribute to module services/ and platform/services/
- src/components/docs/ → move to modules/docs/components/
- src/components/layout/ → move to platform/layout/
- src/components/ui/ → move to shared/ui/
- src/pages/ → distribute to module pages/ and platform/pages/

</code_context>

<specifics>
## Specific Ideas

Plans should be split by module/layer to enable parallel agent execution:
- Plan 1: Platform layer (layout, auth, router, services)
- Plan 2: Shared layer (ui, utils)
- Plan 3: Docs module
- Plan 4: Tasks module
- Plan 5: Clients module
- Plan 6: Wireframe module
- Plan 7: App.tsx simplification + final import cleanup

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
