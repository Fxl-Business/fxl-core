---
phase: 07-blueprint-infrastructure
plan: 01
subsystem: database, infra
tags: [zod, sonner, supabase, jsonb, schema-validation, migration, tdd]

# Dependency graph
requires: []
provides:
  - "Zod schemas for all 15 BlueprintSection types + BlueprintConfig + BlueprintScreen"
  - "Version-keyed migration framework (migrateBlueprint, CURRENT_SCHEMA_VERSION)"
  - "Refactored blueprint-store with Zod safeParse and updated_at return"
  - "ValidatedBlueprintConfig inferred type from Zod schema"
affects: [07-02-PLAN, 07-03-PLAN, wireframe-builder, blueprint-editor]

# Tech tracking
tech-stack:
  added: [zod@4.3.6, sonner@2.0.7]
  patterns: [zod-discriminated-union, lazy-schema-migration, zod-safeParse-on-load, zod-parse-on-save]

key-files:
  created:
    - tools/wireframe-builder/lib/blueprint-schema.ts
    - tools/wireframe-builder/lib/blueprint-schema.test.ts
    - tools/wireframe-builder/lib/blueprint-migrations.ts
    - tools/wireframe-builder/lib/blueprint-migrations.test.ts
    - tools/wireframe-builder/lib/blueprint-store.test.ts
  modified:
    - tools/wireframe-builder/lib/blueprint-store.ts
    - tools/wireframe-builder/types/blueprint.ts
    - src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx
    - src/pages/SharedWireframeView.tsx
    - package.json

key-decisions:
  - "Used z.ZodType annotation to break recursive ChartGridSection type inference cycle"
  - "Kept manual TS types in blueprint.ts alongside Zod schemas for component-level type safety"
  - "loadBlueprint returns null on Zod validation failure instead of throwing"
  - "Migration save-back uses 'system:migration' as updated_by identifier"

patterns-established:
  - "Zod discriminatedUnion for section type validation: z.discriminatedUnion('type', [...])"
  - "Lazy migration on read: check schemaVersion, run migrator chain, save back"
  - "Bidirectional validation: safeParse on load, parse (throwing) on save"
  - "TDD cycle: RED (failing tests) -> GREEN (implementation) -> verify"

requirements-completed: [INFRA-02, INFRA-03]

# Metrics
duration: 7min
completed: 2026-03-09
---

# Phase 7 Plan 01: Blueprint Schema & Validation Summary

**Zod validation schema for all 15 section types with discriminatedUnion, schema migration framework, and blueprint-store refactored to replace unsafe `as` cast with safeParse**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-09T19:34:08Z
- **Completed:** 2026-03-09T19:42:07Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Zod schema validates all 15 blueprint section types including recursive ChartGridSection via z.lazy()
- Schema migration framework with version-keyed migrator registry ready for future version bumps
- blueprint-store.ts no longer uses `as BlueprintConfig` unsafe cast -- all data paths go through Zod
- loadBlueprint returns `{ config, updatedAt }` tuple needed for optimistic locking in Plan 03
- 26 new tests (12 schema, 6 migration, 8 store) all passing, 77 total suite green

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create Zod schema with tests** - `414a9c7` (feat)
2. **Task 2: Create migration framework and refactor store with tests** - `c3a9ac2` (feat)

## Files Created/Modified

- `tools/wireframe-builder/lib/blueprint-schema.ts` - Zod schemas for all 15 section types, BlueprintConfig, BlueprintScreen, ScreenRow
- `tools/wireframe-builder/lib/blueprint-schema.test.ts` - 12 tests: valid/invalid configs, recursion, defaults, enum rejection
- `tools/wireframe-builder/lib/blueprint-migrations.ts` - CURRENT_SCHEMA_VERSION export, migrateBlueprint with version-keyed registry
- `tools/wireframe-builder/lib/blueprint-migrations.test.ts` - 6 tests: version detection, migration chain, Zod validation of output
- `tools/wireframe-builder/lib/blueprint-store.ts` - Refactored: Zod safeParse on load, parse on save, lazy migration, updated_at return
- `tools/wireframe-builder/lib/blueprint-store.test.ts` - 8 tests: load/save/seed with mocked Supabase, validation, migration trigger
- `tools/wireframe-builder/types/blueprint.ts` - Added schemaVersion field to BlueprintConfig type
- `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` - Updated for new loadBlueprint return shape
- `src/pages/SharedWireframeView.tsx` - Updated for new loadBlueprint return shape
- `package.json` - Added zod@4.3.6 and sonner@2.0.7 dependencies

## Decisions Made

- **Zod v4 (4.3.6):** New project with no existing Zod dependency, used latest stable version with composable discriminatedUnions
- **z.ZodType annotation for recursion:** Used explicit type annotation on BlueprintSectionSchema to break circular inference between ChartGridSection and the union
- **z.record(z.string(), z.unknown()) for DrilRow/ClickRow data:** TS types use Record<string, React.ReactNode> but JSON storage cannot serialize ReactNode, so Zod uses unknown
- **z.unknown().optional() for ClickableTable modalFooter:** React.ReactNode field that won't exist in DB JSON
- **loadBlueprint returns null on validation failure:** Non-throwing approach lets callers handle gracefully rather than crashing
- **Kept seedFromFile as dev utility:** Marked with @internal comment, retained for testing/reset use cases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed consumers of loadBlueprint for new return type**
- **Found during:** Task 2 (TypeScript check after store refactor)
- **Issue:** WireframeViewer.tsx and SharedWireframeView.tsx called loadBlueprint expecting BlueprintConfig|null, but new signature returns { config, updatedAt }|null
- **Fix:** Updated both files to destructure result.config from the tuple
- **Files modified:** src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx, src/pages/SharedWireframeView.tsx
- **Verification:** npx tsc --noEmit passes with zero errors
- **Committed in:** c3a9ac2 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed recursive type inference for ChartGridSectionSchema**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** Circular const reference between ChartGridSectionSchema and BlueprintSectionSchema caused TS7022 implicit any error
- **Fix:** Inlined ChartGrid definition into the discriminatedUnion array, used explicit z.ZodType annotation on the exported schema
- **Files modified:** tools/wireframe-builder/lib/blueprint-schema.ts
- **Verification:** npx tsc --noEmit passes, all 12 schema tests still green
- **Committed in:** c3a9ac2 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes were necessary for TypeScript correctness. No scope creep.

## Issues Encountered

- Zod v4 discriminatedUnion API confirmed to use same `('type', [...])` syntax as v3 (verified experimentally)
- Vitest v4 uses `--bail N` instead of `-x` flag (plan referenced `-x`)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Blueprint schema, migration framework, and validated store are ready for Plan 02 (DB-only storage cutover)
- loadBlueprint returns updatedAt alongside config, enabling optimistic locking in Plan 03
- sonner is installed but Toaster component not yet mounted in App.tsx (planned for Plan 02 or 03)

## Self-Check: PASSED

- All 6 created files verified on disk
- Commit 414a9c7 (Task 1) verified in git log
- Commit c3a9ac2 (Task 2) verified in git log
- 77/77 tests passing
- 0 TypeScript errors

---
*Phase: 07-blueprint-infrastructure*
*Completed: 2026-03-09*
