import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateTaskStatus } from '@/lib/tasks-service'
import { useTasks } from '../hooks/useTasks'
import { TaskCard } from '../components/TaskCard'
import { TaskFilters } from '../components/TaskFilters'
import type { TaskStatus, TaskPriority, Task } from '../types'

// ---------------------------------------------------------------------------
// TaskList — /tarefas
// ---------------------------------------------------------------------------

export default function TaskList() {
  // ALL hooks before conditional returns (project memory rule)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined)
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>(undefined)
  const [clientFilter, setClientFilter] = useState('')

  const { tasks, loading, error, refetch } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
    client_slug: clientFilter.trim() || undefined,
  })

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    // Optimistic update: update local UI immediately via refetch after service call
    // On error, refetch to restore server state
    try {
      await updateTaskStatus(taskId, newStatus)
      refetch()
    } catch {
      refetch()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
          Tarefas
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/tarefas/kanban">
              <LayoutDashboard className="h-4 w-4 mr-1.5" />
              Kanban
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

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          clientFilter={clientFilter}
          onClientChange={setClientFilter}
        />
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

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-slate-500">Nenhuma tarefa encontrada.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link to="/tarefas/new">Criar primeira tarefa</Link>
          </Button>
        </div>
      )}

      {/* Task grid */}
      {!loading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
