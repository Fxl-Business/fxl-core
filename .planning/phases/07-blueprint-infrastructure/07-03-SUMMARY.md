---
phase: 07-blueprint-infrastructure
plan: 03
subsystem: database, ui
tags: [optimistic-locking, conflict-resolution, polling, supabase, concurrent-editing, tdd]

# Dependency graph
requires:
  - phase: 07-blueprint-infrastructure (Plan 01)
    provides: "Zod schemas, validated blueprint-store with updated_at return"
  - phase: 07-blueprint-infrastructure (Plan 02)
    provides: "DB-only loading, sonner toast, WireframeViewer with lastUpdatedAt state"
provides:
  - "saveBlueprint with optimistic locking via updated_at conditional update"
  - "checkForUpdates polling utility for stale data detection"
  - "Conflict resolution modal (Recarregar / Sobrescrever) in WireframeViewer"
  - "Stale data banner with 30s polling interval in edit mode"
affects: [wireframe-builder, blueprint-editor, future-clients]

# Tech tracking
tech-stack:
  added: []
  patterns: [optimistic-locking-via-updated_at, conditional-update-eq, stale-polling-interval, conflict-modal-pattern]

key-files:
  created: []
  modified:
    - tools/wireframe-builder/lib/blueprint-store.ts
    - tools/wireframe-builder/lib/blueprint-store.test.ts
    - src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx

key-decisions:
  - "Optimistic locking uses .eq('updated_at', lastKnownUpdatedAt) conditional update pattern"
  - "Conflict resolution offers two options: Recarregar (reload DB) and Sobrescrever (force upsert)"
  - "Stale data polling runs every 30s only while edit mode is active"
  - "Force overwrite uses null lastKnownUpdatedAt to bypass locking via upsert path"

patterns-established:
  - "Conditional update pattern: .update().eq('updated_at', last).select().maybeSingle() returns null on conflict"
  - "Conflict modal pattern: detect conflict on save, show modal, offer reload or overwrite"
  - "Stale polling pattern: setInterval in useEffect gated by edit mode, compare remote vs local updated_at"

requirements-completed: [INFRA-04]

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 7 Plan 03: Optimistic Locking & Conflict Resolution Summary

**Optimistic locking on blueprint saves with updated_at conditional updates, conflict modal (Recarregar/Sobrescrever), and 30s stale data polling in edit mode**

## Performance

- **Duration:** 5 min (code tasks) + checkpoint verification
- **Started:** 2026-03-09T19:57:46Z
- **Completed:** 2026-03-09T20:15:44Z
- **Tasks:** 3 (2 code + 1 human-verify checkpoint)
- **Files modified:** 3

## Accomplishments

- saveBlueprint accepts lastKnownUpdatedAt parameter and returns `{ success, conflict, updatedAt }` for conflict detection
- checkForUpdates utility exported for polling remote updated_at without full config load
- Conflict modal appears when concurrent edit detected -- operator chooses Recarregar (reload DB version) or Sobrescrever (force overwrite)
- Stale data yellow banner appears within 30s when blueprint is modified externally while in edit mode
- TDD cycle completed: failing tests first, then implementation, all passing
- Operator verified end-to-end flow and approved at checkpoint

## Task Commits

Each task was committed atomically:

1. **Task 1: Add optimistic locking to saveBlueprint (TDD RED)** - `005d5a2` (test)
   **Task 1: Add optimistic locking to saveBlueprint (TDD GREEN)** - `f9bfd36` (feat)
2. **Task 2: Wire conflict modal and stale polling into WireframeViewer** - `69937e6` (feat)
3. **Task 3: Verify complete blueprint infrastructure end-to-end** - No commit (human-verify checkpoint, approved)

## Files Created/Modified

- `tools/wireframe-builder/lib/blueprint-store.ts` - saveBlueprint with optimistic locking, checkForUpdates export, SaveResult type
- `tools/wireframe-builder/lib/blueprint-store.test.ts` - Tests for conflict detection, matching/mismatched updated_at, null path, checkForUpdates
- `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` - Conflict modal, stale polling useEffect, handleConflictReload/Overwrite handlers, stale banner

## Decisions Made

- **Conditional update pattern:** Uses `.eq('updated_at', lastKnownUpdatedAt)` on the update query so Supabase returns empty result when timestamp has changed, signaling conflict
- **Force overwrite path:** Passing null as lastKnownUpdatedAt triggers the upsert path (same as new record), intentionally bypassing locking for the "Sobrescrever" action
- **30s polling interval:** User-decided polling frequency balances freshness vs. unnecessary DB queries for single-operator use case
- **Polling only in edit mode:** No wasted queries when just viewing the wireframe

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 7 (Blueprint Infrastructure) is fully complete: DB-only loading, Zod validation, schema versioning, optimistic locking, conflict resolution
- All 4 INFRA requirements satisfied (INFRA-01 through INFRA-04)
- Ready for Phase 8 (Wireframe Design System) which depends on Phase 7
- Phase 10 (Briefing & Blueprint Views) can also proceed in parallel since it depends on Phase 7

---
*Phase: 07-blueprint-infrastructure*
*Completed: 2026-03-09*
