---
phase: 32-task-management-module
plan: 01
subsystem: ui
tags: [react, typescript, supabase, tasks, module-registry]

# Dependency graph
requires:
  - phase: 30-supabase-migrations-data-layer
    provides: tasks-service.ts with listTasks, updateTaskStatus, Task/TaskStatus/TaskPriority types
  - phase: 29-module-foundation-registry
    provides: MODULE_REGISTRY pattern, NavItem type, moduleRoutes derived from manifest

provides:
  - Task module scaffold under src/modules/tasks/ (types, hooks, components, pages)
  - useTasks hook with filter state, loading, error, refetch
  - TaskCard, TaskStatusBadge, TaskFilters shared components reusable by Plans 02/03
  - TaskList page at /tarefas with status/priority/client filter controls
  - Routes registered: /tarefas, /tarefas/kanban, /tarefas/new, /tarefas/:id/edit
  - Tarefas sidebar section via tasksManifest navChildren
  - Placeholder KanbanBoard and TaskForm pages for Plans 02/03

affects:
  - 32-02 (TaskForm — imports TaskCard, TaskFilters, useTasks)
  - 32-03 (KanbanBoard — imports TaskCard, useTasks, TaskStatusBadge)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Module scaffold pattern: types/index.ts re-exports service types + constants + helpers
    - useTasks hook: cancellable useEffect with fetchTick for refetch, filter deps as primitives
    - Optimistic status update: updateTaskStatus then refetch, rollback on error via refetch
    - Placeholder pages: minimal div components for lazy-loaded routes not yet implemented
    - Module activation: status 'coming-soon' -> 'active' + navChildren added to manifest

key-files:
  created:
    - src/modules/tasks/types/index.ts
    - src/modules/tasks/hooks/useTasks.ts
    - src/modules/tasks/components/TaskStatusBadge.tsx
    - src/modules/tasks/components/TaskCard.tsx
    - src/modules/tasks/components/TaskFilters.tsx
    - src/modules/tasks/pages/TaskList.tsx
    - src/modules/tasks/pages/KanbanBoard.tsx
    - src/modules/tasks/pages/TaskForm.tsx
  modified:
    - src/modules/tasks/manifest.ts
    - src/App.tsx

key-decisions:
  - "Sidebar Tarefas section driven by tasksManifest.navChildren — follows MODULE_REGISTRY pattern from Phase 29, not a static array"
  - "KanbanBoard and TaskForm are lazy-imported placeholders — routes registered now, implementations deferred to Plans 02/03"
  - "useTasks filter deps are primitive values (status, priority, client_slug strings) — avoids object reference infinite re-render pitfall from Phase 31 research"
  - "PRIORITY_COLORS added to types/index.ts even though not in plan spec — required for TaskCard priority badge rendering"

patterns-established:
  - "Task module types/index.ts: re-exports + STATUS_ORDER/LABELS/COLORS + PRIORITY_LABELS/COLORS + nextStatus helper"
  - "useTasks: cancellable useEffect, fetchTick trigger for refetch, primitive filter deps"
  - "TaskCard: compound card with status badge, priority badge, client tag, due date, edit hover button"

requirements-completed:
  - TASK-02

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 32 Plan 01: Task Module Scaffold Summary

**Task module scaffold with useTasks hook, TaskCard/TaskStatusBadge/TaskFilters shared components, and TaskList page at /tarefas with status/priority/client filter controls wired to Supabase via tasks-service**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-13T01:00:00Z
- **Completed:** 2026-03-13T01:08:47Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Built complete task module scaffold under src/modules/tasks/ (types, hooks, components, pages)
- TaskList page at /tarefas renders task grid with working status/priority/client filter controls
- Shared components TaskCard, TaskStatusBadge, and TaskFilters ready for Plans 02/03 consumption
- All 4 task routes registered (/tarefas, /tarefas/kanban, /tarefas/new, /tarefas/:id/edit)
- Sidebar Tarefas section with Lista/Kanban/Nova Tarefa children links via manifest activation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create module scaffold — types, shared components, useTasks hook** - `20ec6de` (feat)
2. **Task 2: TaskList page + routes + sidebar wiring** - `e2a00b9` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/modules/tasks/types/index.ts` - Re-exports Task/TaskStatus/TaskPriority + STATUS_ORDER/LABELS/COLORS, PRIORITY_LABELS/COLORS, nextStatus helper
- `src/modules/tasks/hooks/useTasks.ts` - useTasks hook with filter state, loading, error, cancellable refetch
- `src/modules/tasks/components/TaskStatusBadge.tsx` - Clickable colored pill advancing task status on click
- `src/modules/tasks/components/TaskCard.tsx` - Task card with all metadata fields, edit hover button
- `src/modules/tasks/components/TaskFilters.tsx` - Filter bar with status/priority selects and client Input
- `src/modules/tasks/pages/TaskList.tsx` - Task list page with filters, loading/error/empty states, task grid
- `src/modules/tasks/pages/KanbanBoard.tsx` - Placeholder for Plan 03
- `src/modules/tasks/pages/TaskForm.tsx` - Placeholder for Plan 02
- `src/modules/tasks/manifest.ts` - Activated module (status: active) + navChildren for sidebar
- `src/App.tsx` - Added 4 task routes (TaskList direct import, KanbanBoard/TaskForm lazy)

## Decisions Made

- Sidebar Tarefas section is driven by `tasksManifest.navChildren` — follows the MODULE_REGISTRY pattern established in Phase 29. No static navigation array exists in Sidebar.tsx.
- KanbanBoard and TaskForm are lazy-imported placeholder components — route definitions exist now so App.tsx is complete; actual implementations are deferred to Plans 02/03.
- `useTasks` filter deps are primitive string values — avoids the object reference re-render infinite loop pitfall documented in Phase 31 research.
- Added `PRIORITY_COLORS` to types/index.ts (not in plan spec) — required for TaskCard priority badge rendering. This is a necessary constant for correctness, not scope creep.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added PRIORITY_COLORS constant to types/index.ts**
- **Found during:** Task 1 (TaskCard implementation)
- **Issue:** Plan spec only defined PRIORITY_LABELS but TaskCard needed colored priority badges — without PRIORITY_COLORS the badge would have no visual differentiation
- **Fix:** Added PRIORITY_COLORS: Record<TaskPriority, string> with appropriate Tailwind classes alongside PRIORITY_LABELS
- **Files modified:** src/modules/tasks/types/index.ts
- **Verification:** TypeScript compiles, TaskCard imports and uses both constants correctly
- **Committed in:** 20ec6de (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical constant)
**Impact on plan:** Required for correct visual rendering. No scope creep.

## Issues Encountered

None - TypeScript compiled clean on first attempt for both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All shared components (TaskCard, TaskStatusBadge, TaskFilters, useTasks) ready for Plan 02 (TaskForm) and Plan 03 (KanbanBoard)
- Placeholder pages in place — Plans 02/03 simply replace the placeholder content
- No blockers

---
*Phase: 32-task-management-module*
*Completed: 2026-03-13*
