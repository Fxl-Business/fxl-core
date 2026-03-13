---
phase: 29-module-foundation-registry
plan: 01
subsystem: ui
tags: [module-registry, eslint, boundaries, react-router, lucide-react]

requires: []
provides:
  - "ModuleManifest, NavItem, ModuleStatus types in src/modules/registry.ts"
  - "MODULE_REGISTRY constant with 5 module entries"
  - "Wrapper manifests for docs, wireframe-builder, clients (no files moved)"
  - "Scaffold manifests for knowledge-base and tasks (status: coming-soon)"
  - "Standard folder structure for 5 modules (pages/, components/, hooks/, types/)"
  - "ESLint v9 flat config with eslint-plugin-boundaries cross-module import enforcement"
  - "npm run lint runs ESLint boundaries + tsc --noEmit"
affects: [29-02, 30, 31, 32, 33, sidebar-navigation, route-composition]

tech-stack:
  added:
    - eslint@^9.39.4
    - eslint-plugin-boundaries@^5.4.0
    - "@typescript-eslint/parser@^8.57.0"
    - eslint-plugin-react-hooks@^7.0.1
  patterns:
    - "Module manifest pattern: static typed constant per module, aggregated in MODULE_REGISTRY"
    - "ESLint v9 flat config (eslint.config.js) — no .eslintrc"
    - "Boundary enforcement: modules cannot import sibling module internals"

key-files:
  created:
    - src/modules/registry.ts
    - src/modules/docs/manifest.tsx
    - src/modules/wireframe-builder/manifest.tsx
    - src/modules/clients/manifest.tsx
    - src/modules/knowledge-base/manifest.ts
    - src/modules/tasks/manifest.ts
    - eslint.config.js
  modified:
    - package.json

key-decisions:
  - "NavItem type exported from registry.ts (ready for Sidebar.tsx import in Plan 02)"
  - "Ferramentas nav entry kept as leaf (no WF Builder children) in docsManifest — WF Builder subtree moved to wireframeBuilderManifest"
  - "eslint-plugin-react-hooks added to config to resolve pre-existing exhaustive-deps disable comments in existing files"
  - "boundaries/element-types default: allow — safe for existing codebase, only restricts module-to-module cross-imports"

patterns-established:
  - "Module manifest: each module owns its manifest file at src/modules/[name]/manifest.{ts,tsx}"
  - "Registry aggregation: src/modules/registry.ts is single source of truth for MODULE_REGISTRY"
  - "Wrapper manifests import existing pages without moving files — routes registered declaratively"

requirements-completed: [MOD-01, MOD-02, MOD-04]

duration: 5min
completed: 2026-03-13
---

# Phase 29 Plan 01: Module Foundation Registry Summary

**Typed MODULE_REGISTRY with 5 manifests (docs, wireframe-builder, clients, knowledge-base, tasks) and ESLint v9 boundary enforcement preventing cross-module imports**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T00:26:28Z
- **Completed:** 2026-03-13T00:31:00Z
- **Tasks:** 3
- **Files modified:** 8 (6 created in src/modules, eslint.config.js, package.json)

## Accomplishments
- MODULE_REGISTRY constant with 5 typed manifests — docs, wireframe-builder, clients, knowledge-base, tasks
- Wrapper manifests import existing page components without moving any code
- NavItem tree migrated exactly from Sidebar.tsx, with Wireframe Builder subtree split to its own manifest
- Per-module folder scaffolds: 20 directories (pages/, components/, hooks/, types/ per module)
- ESLint v9 flat config with boundaries plugin — cross-module imports flagged as errors

## Task Commits

1. **Task 1: Create ModuleManifest types, MODULE_REGISTRY, and 5 manifest files** - `294d3a7` (feat)
2. **Task 2: Create per-module folder scaffolds** - `eaa7fdb` (chore)
3. **Task 3: Install ESLint with boundaries plugin, create eslint.config.js, update lint script** - `207577e` (chore)

## Files Created/Modified
- `src/modules/registry.ts` - ModuleStatus, NavItem, ModuleManifest types + MODULE_REGISTRY constant
- `src/modules/docs/manifest.tsx` - Wrapper manifest for docs (processo, padroes, ferramentas doc routes)
- `src/modules/wireframe-builder/manifest.tsx` - Wrapper manifest for WF builder (gallery route + nav subtree)
- `src/modules/clients/manifest.tsx` - Wrapper manifest for clients area
- `src/modules/knowledge-base/manifest.ts` - Scaffold manifest, status: coming-soon
- `src/modules/tasks/manifest.ts` - Scaffold manifest, status: coming-soon
- `eslint.config.js` - ESLint v9 flat config with boundaries/element-types rule
- `package.json` - lint script updated to `eslint src/ && tsc --noEmit`; 4 devDeps added

## Decisions Made
- NavItem type lives in registry.ts (will be imported by Sidebar.tsx in Plan 02 to eliminate duplication)
- Ferramentas nav entry kept as leaf node in docsManifest — the WF Builder children were fully extracted to wireframeBuilderManifest
- `eslint-plugin-react-hooks` added as part of ESLint setup to properly resolve pre-existing `// eslint-disable-next-line react-hooks/exhaustive-deps` comments in existing files
- ESLint boundaries `default: 'allow'` to avoid breaking existing cross-layer imports; only module-to-module is restricted

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added eslint-plugin-react-hooks to ESLint config**
- **Found during:** Task 3 (ESLint setup)
- **Issue:** Two existing files (SharedWireframeView.tsx, WireframeViewer.tsx) have `// eslint-disable-next-line react-hooks/exhaustive-deps` comments. ESLint 9 treats disable directives referencing unknown rules as errors. Without the react-hooks plugin, npm run lint failed with 2 errors.
- **Fix:** Installed `eslint-plugin-react-hooks@^7.0.1` and added it to eslint.config.js with `react-hooks/exhaustive-deps: warn`
- **Files modified:** eslint.config.js, package.json
- **Verification:** npm run lint exits 0 (0 errors, 3 pre-existing warnings)
- **Committed in:** `207577e` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in ESLint config surfacing pre-existing code issue)
**Impact on plan:** Auto-fix necessary for lint script to exit 0. No scope creep — react-hooks is a standard companion plugin that should accompany any ESLint setup for a React project.

## Issues Encountered
- npm cache had root-owned files (EACCES). Worked around by passing `--cache /tmp/npm-cache` to npm install.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- MODULE_REGISTRY is ready for Plan 02 to consume for sidebar navigation and route composition
- NavItem type exported from registry.ts — Sidebar.tsx can import it in Plan 02 to eliminate duplication
- ESLint boundaries active from day one — any cross-module import in Plan 02+ will be caught immediately
- 3 pre-existing warnings (react-hooks/exhaustive-deps in SharedWireframeView.tsx and WireframeViewer.tsx) are deferred — out of scope for this plan

## Self-Check: PASSED

All created files exist on disk. All commits (294d3a7, eaa7fdb, 207577e) verified in git log.

---
*Phase: 29-module-foundation-registry*
*Completed: 2026-03-13*
