import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, List, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@shared/ui/button'
import { updateTaskStatus } from '../services/tasks-service'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { DocumentarButton } from '../components/DocumentarButton'
import { STATUS_ORDER, STATUS_LABELS } from '../types'
import type { Task, TaskStatus } from '../types'

// ---------------------------------------------------------------------------
// KanbanBoard — /tarefas/kanban
// ---------------------------------------------------------------------------

const COLUMN_WIDTHS: Record<TaskStatus, string> = {
  todo: 'border-slate-200 dark:border-slate-700',
  in_progress: 'border-indigo-200 dark:border-indigo-800',
  done: 'border-emerald-200 dark:border-emerald-800',
  blocked: 'border-rose-200 dark:border-rose-800',
}

export default function KanbanBoard() {
  // ALL hooks before conditional returns (project memory rule)
  const { tasks: fetchedTasks, loading, error, refetch } = useTasks()

  // Local tasks state for optimistic updates
  const [tasks, setTasks] = useState<Task[]>([])

  // Sync local state when fetched tasks change
  useEffect(() => {
    setTasks(fetchedTasks)
  }, [fetchedTasks])

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    // Optimistic update: move task immediately in local state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      await updateTaskStatus(taskId, newStatus)
    } catch {
      toast.error('Erro ao atualizar status')
      refetch()
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
          Kanban
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/tarefas">
              <List className="h-4 w-4 mr-1.5" />
              Lista
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/tarefas/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Tarefa
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">
          Erro ao carregar tarefas: {error}
        </div>
      )}

      {/* Kanban columns */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_ORDER.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status)
            return (
              <div key={status} className="flex flex-col gap-3 min-w-0">
                {/* Column header */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {STATUS_LABELS[status]}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  className={`flex flex-col gap-3 rounded-xl border bg-slate-50 dark:bg-slate-900 p-3 min-h-[200px] ${COLUMN_WIDTHS[status]}`}
                >
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center py-8">
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Vazio
                      </span>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div key={task.id} className="flex flex-col gap-1.5">
                        <TaskCard
                          task={task}
                          onStatusChange={handleStatusChange}
                        />
                        <DocumentarButton task={task} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
