---
phase: quick-11
plan: 01
subsystem: ui
tags: [react, sidebar, modules, manifest, navigation]

# Dependency graph
requires:
  - phase: 29-module-foundation-registry
    provides: MODULE_REGISTRY pattern and NavItem/ModuleManifest types
provides:
  - ferramentasManifest as top-level parent module for all tools
  - Wireframe Builder nested under Ferramentas in sidebar
affects: [sidebar navigation, ferramentas module, wireframe-builder module]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Parent module manifest absorbs navChildren from child tool manifests
    - Child manifests kept for identity (id, icon, status) without nav responsibility

key-files:
  created:
    - src/modules/ferramentas/manifest.tsx
  modified:
    - src/modules/wireframe-builder/manifest.tsx
    - src/modules/docs/manifest.tsx
    - src/modules/registry.ts

key-decisions:
  - "ferramentasManifest replaces wireframeBuilderManifest in MODULE_REGISTRY — Ferramentas is the nav parent, not wireframe-builder"
  - "wireframeBuilderManifest kept (without navChildren) for module identity — not removed in case other code needs its id/icon"
  - "Ferramentas leaf removed from docs manifest navChildren — now provided exclusively by ferramentasManifest to avoid duplication"

patterns-established:
  - "Tool modules export manifest for identity only; parent module manifest owns the nav tree"

requirements-completed: []

# Metrics
duration: 5min
completed: 2026-03-13
---

# Quick 11: Reestruturar Sidebar Ferramentas como Nivel Superior

**ferramentasManifest created as depth-0 sidebar parent containing Wireframe Builder and all its sub-pages nested under a clickable Ferramentas section header**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-03-13
- **Tasks:** 1 (+ 1 visual checkpoint, pre-approved)
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- Created `src/modules/ferramentas/manifest.tsx` wrapping wireframe-builder's full nav tree under a clickable "Ferramentas" top-level header
- Stripped navChildren and routeConfig from wireframe-builder manifest (now identity-only)
- Removed duplicate "Ferramentas" leaf item from docs manifest's navChildren
- Replaced wireframeBuilderManifest with ferramentasManifest in MODULE_REGISTRY

## Task Commits

1. **Task 1: Create ferramentas manifest and restructure registry** - `d2b4475` (feat)

## Files Created/Modified
- `src/modules/ferramentas/manifest.tsx` - New parent module manifest for all Ferramentas tools
- `src/modules/wireframe-builder/manifest.tsx` - Stripped to identity-only (no navChildren/routeConfig)
- `src/modules/docs/manifest.tsx` - Removed Ferramentas leaf item from navChildren
- `src/modules/registry.ts` - Imports ferramentasManifest; MODULE_REGISTRY uses it instead of wireframeBuilderManifest

## Decisions Made
- `wireframeBuilderManifest` kept as an exported constant (identity only) rather than deleted — low risk, preserves module identity in case anything in the future references `wireframe-builder` by id
- `ComponentGallery` import moved from wireframe-builder manifest to ferramentas manifest, where the routeConfig now lives

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ferramentas section established as the canonical parent for tools
- Future tools (e.g., a new generator, analyzer) can be added as children under ferramentasManifest.navChildren[0].children
- No blockers

---
*Phase: quick-11*
*Completed: 2026-03-13*
