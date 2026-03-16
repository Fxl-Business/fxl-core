import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import type { SlotComponentProps } from '@platform/module-loader/registry'
import { supabase } from '@platform/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

interface TaskRow {
  id: string
  title: string
  status: TaskStatus
  updated_at: string
}

// ---------------------------------------------------------------------------
// Constants — inline to keep extension self-contained (no cross-module import)
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  in_progress: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
  blocked: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'A fazer',
  in_progress: 'Em andamento',
  blocked: 'Bloqueada',
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function relativeDate(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays}d atras`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecentTasksWidget({ className }: SlotComponentProps) {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchTasks() {
      setLoading(true)
      const { data } = await supabase
        .from('tasks')
        .select('id, title, status, updated_at')
        .neq('status', 'done')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (!cancelled && data) {
        setTasks(
          data.map((row) => ({
            id: row.id as string,
            title: row.title as string,
            status: row.status as TaskStatus,
            updated_at: row.updated_at as string,
          })),
        )
      }
      if (!cancelled) setLoading(false)
    }

    void fetchTasks()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card${className ? ` ${className}` : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
            Tarefas Pendentes
          </span>
        </div>
        <Link
          to="/tarefas"
          className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Ver todas
        </Link>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="p-4 text-sm text-slate-400 dark:text-slate-500">Nenhuma tarefa pendente.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_COLORS[task.status] ?? STATUS_COLORS.todo}`}
                  >
                    {STATUS_LABELS[task.status] ?? task.status}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {relativeDate(task.updated_at)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
