# Module: tasks

## Purpose
Task management with list view, kanban board, CRUD forms, and home dashboard widget, backed by Supabase.

## Ownership
- src/modules/tasks/**

## Public API

### Types
- Task: Full task row from Supabase (id, title, description, status, priority, client_slug, due_date, created_by, timestamps) (types/index.ts re-exports from services/tasks-service.ts)
- TaskStatus: 'todo' | 'in_progress' | 'done' | 'blocked' (types/index.ts)
- TaskPriority: 'low' | 'medium' | 'high' (types/index.ts)
- CreateTaskParams: Input shape for task creation (services/tasks-service.ts)
- UpdateTaskParams: Input shape for task updates (services/tasks-service.ts)
- STATUS_ORDER: Ordered array of TaskStatus values (types/index.ts)
- STATUS_LABELS: Portuguese labels for each status (types/index.ts)
- STATUS_COLORS: Tailwind class strings for each status (types/index.ts)
- PRIORITY_LABELS: Portuguese labels for each priority (types/index.ts)
- PRIORITY_COLORS: Tailwind class strings for each priority (types/index.ts)
- nextStatus(current): Returns the next status in cycle (types/index.ts)

### Hooks
- useTasks(filters?): Fetches tasks from Supabase with optional status/priority/client_slug filters, returns { tasks, loading, error, refetch } (hooks/useTasks.ts)

### Components
- TaskCard: Shared card used in list and kanban — shows title, description preview, status badge, priority, client tag, due date, edit link (components/TaskCard.tsx)
- TaskFilters: Horizontal filter bar with status/priority selects and client slug input (components/TaskFilters.tsx)
- TaskStatusBadge: Clickable pill that advances task status on click (components/TaskStatusBadge.tsx)

### Services
- tasks-service: Full Supabase CRUD — createTask, listTasks, getTask, updateTask, updateTaskStatus, deleteTask (services/tasks-service.ts)
- tasks-service.test: Vitest unit tests with mocked Supabase client (services/tasks-service.test.ts)

### Pages
- TaskList: Grid view of tasks with filters and status toggle (/tarefas) (pages/TaskList.tsx)
- KanbanBoard: Four-column kanban board grouped by status with optimistic updates (/tarefas/kanban) (pages/KanbanBoard.tsx)
- TaskForm: Create and edit form with title, description, status, priority, due date, client slug (/tarefas/new, /tarefas/:id/edit) (pages/TaskForm.tsx)

### Extensions
- RecentTasksWidget: Self-contained widget injected into HOME_DASHBOARD slot showing up to 5 pending tasks with relative dates (extensions/RecentTasksWidget.tsx)

## Dependencies

### From shared/
- @shared/ui/button — Button
- @shared/ui/input — Input
- @shared/ui/textarea — Textarea
- @shared/ui/select — Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- @shared/ui/card — Card, CardContent
- @shared/utils — cn (class merging)

### From platform/
- @platform/supabase — supabase client (used in tasks-service and RecentTasksWidget)
- @platform/module-loader/registry — ModuleDefinition, SlotComponentProps types (used in manifest, RecentTasksWidget)
- @platform/module-loader/module-ids — MODULE_IDS.TASKS, SLOT_IDS.HOME_DASHBOARD (used in manifest)

### From other modules
- None — no direct cross-module imports (RecentTasksWidget is self-contained with inline constants)

## Validation
- Task CRUD operations must handle Supabase errors gracefully with toast notifications
- KanbanBoard uses optimistic updates — must refetch on error to restore server state
- TaskForm handles both create (no id param) and edit (id param) modes
- RecentTasksWidget must NOT import from parent module — keeps inline copies of status constants for isolation

## Agent Rules
- **Write:** Only files under `src/modules/tasks/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead -> platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
