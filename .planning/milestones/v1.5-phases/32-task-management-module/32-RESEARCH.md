# Phase 32: Task Management Module - Research

**Researched:** 2026-03-12
**Domain:** React UI module (list, kanban, form, cross-module link), built on top of Phase 30 data layer
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TASK-02 | Pagina de listagem /tarefas com filtro por status, cliente, prioridade | TaskList page with controlled filter state, Supabase filtered queries via tasks-service |
| TASK-03 | Formulario de criacao/edicao com titulo, descricao, status, priority, due_date, client_slug | TaskForm component with shadcn/ui Select + Input + Textarea; .upsert() pattern from briefing-store |
| TASK-04 | Kanban view /tarefas/kanban com 4 colunas (todo, in_progress, done, blocked), mudanca via click | KanbanBoard page grouping tasks by status; inline status mutation via tasks-service updateTaskStatus |
| TASK-05 | Botao "Documentar" em tarefas done que pre-preenche KB entry form com titulo e seletor de tipo | Navigate to /knowledge-base/new with URL search params pre-populating title and entry_type |

</phase_requirements>

---

## Summary

Phase 32 is a pure UI phase. The database and service layer (tasks table, `tasks-service.ts`) are built in Phase 30. Phase 32 consumes those typed service functions to build four things: a task list page with filter controls, a create/edit form, a kanban board, and a "Documentar" button linking completed tasks to the KB entry form.

No new npm packages are needed. The kanban is a CSS grid/flexbox layout with click-to-advance status — drag-and-drop is explicitly deferred to v2 (TASK-06). The cross-module "Documentar" link uses `useNavigate` with `URLSearchParams` to pre-fill the KB form, which is built in Phase 31 (it must be complete or the link route must exist before Phase 32 goes live).

The module structure follows the pattern being established in Phase 29: pages, components, hooks, and types live under `src/modules/tasks/`. If Phase 29 completes before Phase 32, use module folders; if not, put pages under `src/pages/` and service under `src/lib/` as a fallback (match how Phase 31 actually lands).

**Primary recommendation:** Build in three waves — (1) TaskList + route, (2) TaskForm + create/edit flow, (3) KanbanBoard + Documentar button. Each wave is independently deployable.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 | Tasks CRUD via tasks-service | Already in project, service layer from Phase 30 |
| react-router-dom | ^6.27.0 | Route definitions, useNavigate, useSearchParams | App routing standard |
| shadcn/ui components | installed | Button, Input, Textarea, Select, Card, Badge | Full set already in src/components/ui/ |
| lucide-react | ^0.460.0 | Icons (CheckCircle2, Circle, Clock, AlertCircle, BookOpen) | Project icon standard |
| sonner | ^2.0.7 | Toast notifications on save/error | Already used in BriefingForm |

### No New Dependencies

Phase 32 requires zero new npm packages. All UI primitives, routing, and data access are already installed.

---

## Architecture Patterns

### Module Folder Structure

Following the Phase 29 module pattern:

```
src/modules/tasks/
├── pages/
│   ├── TaskList.tsx          # /tarefas — TASK-02
│   ├── TaskForm.tsx          # /tarefas/new, /tarefas/:id/edit — TASK-03
│   └── KanbanBoard.tsx       # /tarefas/kanban — TASK-04
├── components/
│   ├── TaskCard.tsx          # Shared card used in list and kanban
│   ├── TaskFilters.tsx       # Filter bar for TaskList
│   └── TaskStatusBadge.tsx   # Colored badge + click handler
├── hooks/
│   └── useTasks.ts           # Fetches tasks with filter params, loading/error state
└── types/
    └── index.ts              # Re-exports TaskStatus, TaskPriority, Task from tasks-service
```

**Fallback location (if Phase 29 module structure is not ready):**
```
src/pages/
├── tasks/
│   ├── TaskList.tsx
│   ├── TaskForm.tsx
│   └── KanbanBoard.tsx
```

Service files live in `src/lib/tasks-service.ts` (Phase 30 places them there as fallback).

### Routes to add in App.tsx

```typescript
// Add inside the ProtectedRoute/Layout block
<Route path="/tarefas" element={<TaskList />} />
<Route path="/tarefas/kanban" element={<KanbanBoard />} />
<Route path="/tarefas/new" element={<TaskForm />} />
<Route path="/tarefas/:id/edit" element={<TaskForm />} />
```

**Order matters:** `/tarefas/kanban` must come before `/tarefas/:id` if you ever add a detail route; static routes win over dynamic ones in react-router-dom v6.

### Sidebar entry to add in Sidebar.tsx

Add a new top-level section entry (or sub-item under a future "Operacional" group):

```typescript
{
  label: 'Tarefas',
  href: '/tarefas',
  children: [
    { label: 'Lista', href: '/tarefas' },
    { label: 'Kanban', href: '/tarefas/kanban' },
    { label: 'Nova Tarefa', href: '/tarefas/new' },
  ],
}
```

### Pattern 1: TaskList with Controlled Filters (TASK-02)

**What:** Client-side filter state drives the Supabase query. Filters: status, client_slug, priority.
**When to use:** Any listing page with multiple orthogonal filters.

```typescript
// Source: established pattern in src/pages/clients/BriefingForm.tsx + src/pages/tools/ComponentGallery.tsx
import { useEffect, useState } from 'react'
import { listTasks } from '@/lib/tasks-service'
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks-service'

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [clientFilter, setClientFilter] = useState<string>('')

  useEffect(() => {
    setLoading(true)
    listTasks({
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      client_slug: clientFilter || undefined,
    })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter, priorityFilter, clientFilter])

  // render filter bar + task cards
}
```

**Key decisions:**
- Re-fetch from Supabase when filters change (not client-side filtering of a full dataset). This is the existing project pattern and the table is small (internal tool, < 500 tasks).
- `'all'` sentinel value for filter selects — avoids `undefined` in controlled inputs.

### Pattern 2: TaskForm Create/Edit (TASK-03)

**What:** Single form component handles both create (`/tarefas/new`) and edit (`/tarefas/:id/edit`). Checks URL params to decide mode.
**When to use:** Any CRUD form that can create or update the same entity type.

```typescript
// Source: BriefingForm.tsx pattern — useParams for edit mode, useState for form state
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createTask, updateTask, getTask } from '@/lib/tasks-service'
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks-service'

export default function TaskForm() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [clientSlug, setClientSlug] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      getTask(id).then((task) => {
        setTitle(task.title)
        setDescription(task.description)
        setStatus(task.status)
        setPriority(task.priority)
        setDueDate(task.due_date ?? '')
        setClientSlug(task.client_slug ?? '')
      })
    }
  }, [id, isEdit])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateTask(id, { title, description, status, priority, due_date: dueDate || null, client_slug: clientSlug || null })
      } else {
        await createTask({ title, description, status, priority, due_date: dueDate || null, client_slug: clientSlug || null })
      }
      toast.success(isEdit ? 'Tarefa atualizada' : 'Tarefa criada')
      navigate('/tarefas')
    } catch (err) {
      toast.error('Erro ao salvar tarefa')
    } finally {
      setSaving(false)
    }
  }
}
```

**Due date input:** Use a plain `<input type="date" />` with shadcn Input styling. No date-picker library needed. The value is a string `"YYYY-MM-DD"` which maps directly to the PostgreSQL `date` column.

**Status and priority selects:** Use shadcn `Select` component (already installed: `src/components/ui/select.tsx`).

### Pattern 3: KanbanBoard with Click-to-Advance (TASK-04)

**What:** Group tasks into 4 columns by status. Clicking a task's status badge cycles it to the next state.
**When to use:** Lightweight task tracking without drag-and-drop (v2 deferred).

```typescript
// Source: Established project pattern — no third-party library needed
const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked']

function nextStatus(current: TaskStatus): TaskStatus {
  const idx = STATUS_ORDER.indexOf(current)
  // Cycle: todo → in_progress → done → blocked → todo
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
}

// Column layout: CSS grid with 4 equal columns
<div className="grid grid-cols-4 gap-4">
  {STATUS_ORDER.map((status) => (
    <KanbanColumn
      key={status}
      status={status}
      tasks={tasks.filter((t) => t.status === status)}
      onStatusChange={handleStatusChange}
    />
  ))}
</div>
```

Status transition on click:

```typescript
async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
  // Optimistic update: update local state immediately
  setTasks((prev) =>
    prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
  )
  try {
    await updateTaskStatus(taskId, newStatus)
  } catch {
    toast.error('Erro ao atualizar status')
    // Rollback: refetch
    listTasks().then(setTasks)
  }
}
```

**Optimistic update pattern:** Match the approach used in `blueprint-store.ts` (optimistic locking with rollback). For task status change, rollback is a full refetch (simpler than reverting a field).

### Pattern 4: "Documentar" Button — Cross-Module Navigation (TASK-05)

**What:** A button that appears on tasks with `status === 'done'` and navigates to the KB form pre-filled with the task's title.
**When to use:** Any cross-module pre-fill pattern.

```typescript
// Source: react-router-dom useNavigate + URLSearchParams
import { useNavigate } from 'react-router-dom'

function DocumentarButton({ task }: { task: Task }) {
  const navigate = useNavigate()

  function handleDocumentar() {
    const params = new URLSearchParams({
      title: task.title,
      // Bug or decision: show type selector — don't pre-select one
      prefill: 'true',
    })
    navigate(`/knowledge-base/new?${params.toString()}`)
  }

  if (task.status !== 'done') return null

  return (
    <Button variant="outline" size="sm" onClick={handleDocumentar}>
      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
      Documentar
    </Button>
  )
}
```

**Dependency on Phase 31:** The `/knowledge-base/new` route and `useSearchParams` reading in the KB form must exist. Phase 32 should be planned assuming Phase 31 is complete. If Phase 31 is not yet done, the button can navigate to the route anyway — React Router will show a "not found" state until Phase 31 ships. This is acceptable for a sequential milestone.

**URL params to send:**
- `title` — pre-fills the title input
- `prefill=true` — signals to the KB form that it should read from params (avoids ambiguity if params are absent)

The KB form in Phase 31 should use `useSearchParams` to read these. Phase 31's planner should be aware of this contract if Phase 32 research is read first.

### Anti-Patterns to Avoid

- **Client-side filtering of a full dataset:** Always re-query Supabase with filter params. For a small internal tool this adds clarity and avoids stale data.
- **Inline Supabase calls in page components:** Service functions from `tasks-service.ts` are the only Supabase consumer. Components call service functions.
- **Using `any` for form state:** Each form field has an explicit TypeScript type (`TaskStatus`, `TaskPriority`, `string`, `string | null`).
- **Hooks after conditional returns:** The project memory has a critical rule — never place hooks (useEffect, useState, etc.) after conditional returns. All hooks at the top of the component.
- **Hard-coding status values as strings:** Import `TaskStatus` union from the service and use the typed array `STATUS_ORDER` for status cycling logic.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picker | Custom calendar component | `<input type="date" />` with shadcn Input | Native date input is sufficient for internal tool; no third-party needed |
| Kanban drag-and-drop | Custom drag implementation | Not needed (click-to-advance) | Explicitly deferred to v2 (TASK-06, @dnd-kit already installed) |
| Form validation | Custom validator | TypeScript type guards + required HTML attributes | Form is simple; Zod is overkill for 6 fields |
| Select dropdowns | Custom dropdown | shadcn/ui `Select` component | Already installed, matches project visual language |
| Loading skeleton | Custom shimmer | `<Loader2 className="animate-spin" />` from lucide-react | Matches existing loading pattern in BriefingForm.tsx |
| Toast notifications | Custom toast | `toast()` from sonner | Already used throughout the project |

**Key insight:** Phase 32 has zero novel technical problems. Every UI primitive and interaction pattern already exists in the codebase. The work is composition, not invention.

---

## Common Pitfalls

### Pitfall 1: tasks-service.ts Not Yet Created
**What goes wrong:** Phase 32 imports `tasks-service.ts` which is created in Phase 30. If Phase 30 is not complete, TypeScript will fail.
**Why it happens:** Phase 32 depends on Phase 30 in the roadmap but could be researched/planned before Phase 30 executes.
**How to avoid:** Verify `src/lib/tasks-service.ts` (or `src/modules/tasks/lib/tasks-service.ts`) exists before executing Phase 32. The planner should note this as a prerequisite check.
**Warning signs:** `Cannot find module '@/lib/tasks-service'` TypeScript error.

### Pitfall 2: Kanban Column Overflow on Small Screens
**What goes wrong:** 4-column grid breaks on narrow viewports (< 1280px). Since this is an internal operator tool, desktop is the primary target but narrow layouts cause visual breakage.
**Why it happens:** `grid-cols-4` is fixed — no responsive breakpoints.
**How to avoid:** Use `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` or add horizontal scroll on the kanban container. The project visual language does not require full mobile responsiveness (deferred per PROJECT.md).
**Warning signs:** Columns overflowing the layout container.

### Pitfall 3: Hooks After Conditional Returns (Critical Rule)
**What goes wrong:** Placing `useEffect` or `useState` after an early return (e.g., `if (!id) return null`) crashes React with "rendered more hooks than previous render" error.
**Why it happens:** React requires hooks to be called in the same order every render.
**How to avoid:** ALL hooks must be at the top of the component before any conditional returns. This is documented in project MEMORY.md as a critical rule that caused 2 crashes in WireframeViewerInner.
**Warning signs:** React error "rendered more hooks than during previous render."

### Pitfall 4: due_date Type Mismatch
**What goes wrong:** PostgreSQL `date` column returns string (e.g., `"2026-03-15"`) not a JavaScript `Date` object. Passing a `Date` object to Supabase insert will fail with a type error.
**Why it happens:** Supabase JS serializes and deserializes date columns as ISO strings.
**How to avoid:** Keep `due_date` as `string | null` in TypeScript. For the form input, `<input type="date" />` returns a string in `"YYYY-MM-DD"` format — pass it directly to the service.
**Warning signs:** TypeScript error on `task.due_date` expecting `Date`, or Supabase insert error.

### Pitfall 5: /tarefas/kanban Route Ordering
**What goes wrong:** If `/tarefas/:id` is registered before `/tarefas/kanban` in App.tsx, visiting `/tarefas/kanban` tries to load a task with `id = "kanban"` instead of the kanban page.
**Why it happens:** react-router-dom v6 matches routes in order for overlapping patterns.
**How to avoid:** Always register static segments before dynamic segments: put `/tarefas/kanban` before `/tarefas/:id/edit`.
**Warning signs:** KanbanBoard not rendering; TaskForm trying to fetch a task with id `"kanban"`.

### Pitfall 6: Phase 31 KB Form Contract for "Documentar"
**What goes wrong:** The "Documentar" button navigates to `/knowledge-base/new?title=...`. If Phase 31 did not implement `useSearchParams` reading in the KB form, the pre-fill silently does nothing.
**Why it happens:** Cross-module contract not explicitly documented between phases.
**How to avoid:** Document the URL params contract here. The Phase 31 KB form MUST read `title` and `prefill` from `useSearchParams` on mount. If Phase 31 is already executed, verify this before shipping Phase 32.
**Warning signs:** Navigating to KB form from "Documentar" button shows an empty title field.

---

## Code Examples

Verified patterns from the existing codebase:

### Filter state pattern (from BriefingForm + ComponentGallery)

```typescript
// Source: src/pages/clients/BriefingForm.tsx pattern — loading + async fetch in useEffect
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  setLoading(true)
  setError(null)
  fetchData()
    .then(setData)
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false))
}, [dependencies])
```

### Supabase service function pattern (from Phase 30 tasks-service.ts)

```typescript
// Source: tools/wireframe-builder/lib/comments.ts — throw on error, explicit cast
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}
```

### Kanban column with task cards

```typescript
// Pattern: controlled list, no DnD library
function KanbanColumn({
  status,
  tasks,
  onStatusChange,
}: {
  status: TaskStatus
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const labels: Record<TaskStatus, string> = {
    todo: 'A fazer',
    in_progress: 'Em andamento',
    done: 'Concluido',
    blocked: 'Bloqueado',
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {labels[status]} <span className="ml-1 text-slate-400">({tasks.length})</span>
      </h3>
      <div className="flex flex-col gap-2 min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center mt-4">Vazio</p>
        )}
      </div>
    </div>
  )
}
```

### Status badge click cycling

```typescript
// Click-to-advance: badge is a button, calls parent handler
const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  in_progress: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  done: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  blocked: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  done: 'Concluido',
  blocked: 'Bloqueado',
}

function TaskStatusBadge({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: TaskStatus) => void }) {
  function handleClick() {
    const next = nextStatus(task.status)
    onStatusChange(task.id, next)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide cursor-pointer transition-opacity hover:opacity-80',
        STATUS_COLORS[task.status],
      )}
      title="Clique para avancar status"
    >
      {STATUS_LABELS[task.status]}
    </button>
  )
}
```

### "Documentar" button with cross-module navigation

```typescript
// Source: react-router-dom v6 docs — useNavigate + URLSearchParams
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

function DocumentarButton({ task }: { task: Task }) {
  const navigate = useNavigate()

  if (task.status !== 'done') return null

  function handleDocumentar() {
    const params = new URLSearchParams({ title: task.title, prefill: 'true' })
    navigate(`/knowledge-base/new?${params.toString()}`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDocumentar}>
      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
      Documentar
    </Button>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-client hardcoded pages | Parametric pages with useParams | v1.1 | Use same pattern: tasks routes are generic, not per-client |
| Supabase Auth uuid author_id | Clerk text author_id | Migration 002 | `created_by` in tasks is `text` (Clerk user ID), not `uuid` |
| Any role in RLS | anon role in RLS | Migration 002 | All Supabase policies target `anon` role |

---

## Open Questions

1. **Module folder location: src/modules/tasks/ vs src/pages/**
   - What we know: Phase 29 creates `src/modules/[name]/` structure. Phase 32 depends on Phase 30, which depends on Phase 29.
   - What's unclear: Whether Phase 29 will define the exact module folder contract before Phase 32 plans are written.
   - Recommendation: Plan for `src/modules/tasks/` as the target. If Phase 29 is not yet done, put pages in `src/pages/tasks/` as fallback and note the expected move.

2. **KB form useSearchParams contract (TASK-05 dependency)**
   - What we know: Phase 31 builds the KB form at `/knowledge-base/new`. Phase 32 "Documentar" button pre-fills it via URL params.
   - What's unclear: Whether Phase 31's research/plan explicitly documents `useSearchParams` reading.
   - Recommendation: The Phase 32 planner must include a verification task: "Confirm Phase 31 KB form reads `title` and `prefill` from URLSearchParams". If not, add a patch task to Phase 31 or include the `useSearchParams` hook in Phase 32 as a post-link verification.

3. **tasks-service.ts function set needed from Phase 30**
   - What we know: Phase 30 creates service stubs. The exact function signatures depend on Phase 30's plan execution.
   - What's unclear: Whether Phase 30 implements `getTask(id)` (single task fetch for edit mode) or only list/create/updateStatus.
   - Recommendation: The tasks-service must expose at minimum: `listTasks(filters?)`, `createTask(params)`, `updateTask(id, params)`, `updateTaskStatus(id, status)`, `getTask(id)`. Verify this when Phase 30 completes; if `getTask` or `updateTask` are missing, add them in Phase 32 Wave 0.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (root) — includes `src/**/*.test.ts` |
| Quick run command | `npx vitest run src/modules/tasks` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TASK-02 | `listTasks` with status filter returns only matching tasks | unit (service mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 (created in Phase 30) |
| TASK-03 | `createTask` inserts all required fields | unit (service mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 (Phase 30) |
| TASK-03 | `updateTask` updates only provided fields | unit (service mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 (Phase 30) |
| TASK-04 | `nextStatus` cycles correctly through all 4 states | unit (pure function) | `npx vitest run src/modules/tasks` | Wave 0 |
| TASK-04 | `updateTaskStatus` calls Supabase update with new status | unit (service mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 (Phase 30) |
| TASK-02–05 | `npx tsc --noEmit` compiles all task module files | type check | `npx tsc --noEmit` | Existing |
| TASK-02–05 | Visual: /tarefas renders task list | manual browser | `make dev` → localhost/tarefas | N/A |
| TASK-04 | Visual: /tarefas/kanban shows 4 columns | manual browser | `make dev` → localhost/tarefas/kanban | N/A |
| TASK-05 | Visual: "Documentar" button visible on done tasks only | manual browser | `make dev` → task with status done | N/A |

**Note:** UI components (pages, cards, filter bars) are not unit-tested in this project — only pure functions and service modules. Visual verification is the acceptance criterion for UI.

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/tasks-service.test.ts && npx tsc --noEmit`
- **Per wave merge:** `npx vitest run && npx tsc --noEmit`
- **Phase gate:** Full suite green + `npx tsc --noEmit` zero errors + visual browser check on `/tarefas`, `/tarefas/kanban`, and task form

### Wave 0 Gaps

- [ ] `src/lib/tasks-service.test.ts` — should be created in Phase 30; verify it exists with `listTasks`, `createTask`, `updateTask`, `updateTaskStatus` covered
- [ ] `src/modules/tasks/lib/nextStatus.test.ts` (or inline in tasks-service.test.ts) — pure function test for status cycling logic

*(If Phase 30 created tasks-service.test.ts with full coverage: "None — existing test infrastructure covers Phase 32 data layer")*

---

## Sources

### Primary (HIGH confidence)

- `src/App.tsx` — route registration pattern, Layout wrapper, ProtectedRoute
- `src/components/layout/Sidebar.tsx` — NavItem type, navigation array structure, border-l rail active state
- `src/pages/clients/BriefingForm.tsx` — form pattern with useParams edit mode, useEffect data loading, sonner toast, shadcn components
- `src/components/ui/` inventory — confirms Button, Input, Textarea, Select, Card, Badge, Separator all installed
- `.planning/phases/30-supabase-migrations-data-layer/30-RESEARCH.md` — tasks table schema, service type definitions (Task, TaskStatus, TaskPriority), confirmed function signatures
- `.planning/REQUIREMENTS.md` — TASK-02 through TASK-05 definitions, success criteria
- `.planning/ROADMAP.md` — Phase 32 success criteria, Phase 31 dependency
- `package.json` — confirms no new packages needed (react-router-dom v6, sonner, lucide-react all installed)
- `vitest.config.ts` — test include pattern (`src/**/*.test.ts`), alias config
- `CLAUDE.md` / MEMORY.md — hooks-before-early-returns critical rule, TypeScript zero-any gate

### Secondary (MEDIUM confidence)

- react-router-dom v6 docs — `useNavigate` + `URLSearchParams` for cross-module navigation pre-fill (standard API, verified by existing usage in project)
- `tools/wireframe-builder/lib/blueprint-store.test.ts` — Supabase mock pattern with vi.mock + fluent chain (verified pattern reusable for tasks-service tests)

### Tertiary (LOW confidence)

- None — all critical claims verified from project codebase or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new packages, all verified in package.json
- Architecture patterns: HIGH — derived directly from existing pages (BriefingForm, ComponentGallery, App.tsx)
- Kanban implementation: HIGH — click-to-advance is trivial composition, no library risk
- Cross-module navigation: HIGH — react-router-dom v6 useNavigate + URLSearchParams is standard and used in project
- Pitfalls: HIGH — most documented from existing MEMORY.md and Phase 30 research

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable React/Supabase/shadcn stack)
