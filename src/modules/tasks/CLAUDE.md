# Module: Tasks (Tarefas)

## Scope

Task management with list view, kanban board, and CRUD forms.
Integrated with Supabase for persistence.

## Structure

- `manifest.ts` — Module registration (routes, nav, extensions)
- `components/` — TaskCard, TaskFilters, TaskStatusBadge, DocumentarButton
- `pages/` — TaskList, KanbanBoard, TaskForm
- `services/tasks-service.ts` — Supabase CRUD for tasks
- `extensions/RecentTasksWidget.tsx` — Home dashboard widget (slot: HOME_DASHBOARD)
- `hooks/useTasks.ts` — Task list loader hook
- `types/index.ts` — Re-exports Task, TaskStatus, TaskPriority from service

## Rules

- Never import from other modules directly
- Cross-module communication only via extensions (HOME_DASHBOARD slot)
- UI components from @shared/ui/, utilities from @shared/utils/
- Platform imports from @platform/ (supabase, module-loader)
- Task routes: /tarefas, /tarefas/kanban, /tarefas/new, /tarefas/:id/edit

## Key Patterns

- Extensions inject RecentTasksWidget into Home dashboard
- KanbanBoard uses drag columns (CSS-based, not DnD library)
- TaskForm handles both create (path: /tarefas/new) and edit (path: /tarefas/:id/edit)
