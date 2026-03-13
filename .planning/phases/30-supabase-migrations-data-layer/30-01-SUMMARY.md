---
phase: 30-supabase-migrations-data-layer
plan: 01
subsystem: database
tags: [supabase, postgresql, migrations, tsvector, fts, rls, knowledge-base, tasks]

# Dependency graph
requires:
  - phase: 29-module-foundation-registry
    provides: module structure context — service files planned for src/modules/ in future phases
provides:
  - knowledge_entries table in Supabase (tsvector FTS, GIN index, 4 entry types, anon RLS)
  - tasks table in Supabase (status/priority CHECK constraints, anon RLS)
affects:
  - 30-02 (kb-service.ts will query knowledge_entries)
  - 30-03 (tasks-service.ts will query tasks)
  - 31-knowledge-base-ui
  - 32-tasks-ui

# Tech tracking
tech-stack:
  added: []
  patterns:
    - tsvector GENERATED ALWAYS AS STORED with to_tsvector('portuguese', ...) for FTS — first FTS in project
    - DELETE policy added to anon RLS (migration 004 omitted it; 005+ include all 4 CRUD policies)
    - CHECK constraint for enum-like status/priority columns (no application-level enum validation needed)

key-files:
  created:
    - supabase/migrations/005_knowledge_entries.sql
    - supabase/migrations/006_tasks.sql
  modified: []

key-decisions:
  - "Table named knowledge_entries (not kb_entries) — matches ROADMAP.md success criteria over REQUIREMENTS.md wording"
  - "tsvector language is 'portuguese' — KB content is in Portuguese, locked in STATE.md"
  - "Column named entry_type (not kind or category) — locked decision in STATE.md"
  - "DELETE policy included in all new migrations — 004 omitted DELETE, 005+ include all 4 CRUD policies as intended pattern"

patterns-established:
  - "Pattern: Full-text search via GENERATED ALWAYS tsvector column — never write search_vec in INSERT/UPDATE"
  - "Pattern: 4 anon-permissive RLS policies (SELECT/INSERT/UPDATE/DELETE) — all new tables follow this"

requirements-completed: [KB-01, TASK-01]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 30 Plan 01: Supabase Migrations Data Layer Summary

**knowledge_entries table (tsvector FTS, GIN index, Portuguese stemming) and tasks table (Kanban status CHECK constraint) applied to live Supabase via make migrate**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T00:41:19Z
- **Completed:** 2026-03-13T00:43:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created and applied `005_knowledge_entries.sql` — knowledge_entries table with tsvector GENERATED ALWAYS column (Portuguese stemming), GIN index on search_vec, CHECK constraint on entry_type, 3 B-tree/GIN indexes, 4 anon RLS policies
- Created and applied `006_tasks.sql` — tasks table with status CHECK constraint (todo/in_progress/done/blocked), priority CHECK (low/medium/high), due_date date column, 2 B-tree indexes, 4 anon RLS policies
- Both migrations applied cleanly to remote Supabase via `make migrate` with zero errors
- `npx tsc --noEmit` passes with zero errors (SQL migrations have no TS impact)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration 005 — knowledge_entries table** - `1539c7d` (feat)
2. **Task 2: Create migration 006 — tasks table; apply both migrations** - `7322df4` (feat)

**Plan metadata:** _(final docs commit follows)_

## Files Created/Modified

- `supabase/migrations/005_knowledge_entries.sql` — knowledge_entries table with tsvector FTS, GIN index, 4 anon RLS policies, 3 indexes
- `supabase/migrations/006_tasks.sql` — tasks table with status/priority CHECK constraints, 4 anon RLS policies, 2 indexes

## Decisions Made

- **Table name `knowledge_entries` vs `kb_entries`**: Used `knowledge_entries` — ROADMAP.md success criteria are more specific and authoritative over REQUIREMENTS.md which used `kb_entries`
- **tsvector language `'portuguese'`**: Locked decision from STATE.md — KB content is in Portuguese, Portuguese stemmer handles word forms correctly
- **Column `entry_type`**: Locked decision from STATE.md — not `kind` or `category`
- **DELETE policy included**: Migration 004 omitted DELETE; all new tables (005+) include all 4 CRUD anon policies as the intended complete pattern

## Deviations from Plan

None - plan executed exactly as written. Both SQL files created and migrations applied without issue.

## Issues Encountered

None. `make migrate` prompted for confirmation (`[Y/n]`) and applied both migrations in sequence cleanly.

## User Setup Required

None - no external service configuration required. Both migrations were applied to the live Supabase instance during task execution.

## Next Phase Readiness

- `knowledge_entries` and `tasks` tables exist in Supabase — ready for service layer (Plan 30-02)
- Service files (`kb-service.ts`, `tasks-service.ts`) to be created in Plan 30-02
- No blockers for Phase 31 (knowledge base UI) or Phase 32 (tasks UI) at the DB level
- Note: Service files will go in `src/lib/` for now; they can move to `src/modules/[name]/lib/` once Phase 31/32 module folders exist

---
*Phase: 30-supabase-migrations-data-layer*
*Completed: 2026-03-13*

## Self-Check: PASSED

- FOUND: supabase/migrations/005_knowledge_entries.sql
- FOUND: supabase/migrations/006_tasks.sql
- FOUND: .planning/phases/30-supabase-migrations-data-layer/30-01-SUMMARY.md
- FOUND commit: 1539c7d (feat: migration 005)
- FOUND commit: 7322df4 (feat: migration 006 + apply)
