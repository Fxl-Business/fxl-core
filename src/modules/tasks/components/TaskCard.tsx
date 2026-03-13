import { Link } from 'react-router-dom'
import { Pencil, CalendarDays, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '../types'
import { TaskStatusBadge } from './TaskStatusBadge'
import type { Task, TaskStatus } from '../types'

// ---------------------------------------------------------------------------
// TaskCard — shared task card used in list and kanban
// ---------------------------------------------------------------------------

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <Card className="group relative flex flex-col gap-3 p-4 hover:shadow-md transition-shadow">
      {/* Edit button — top right */}
      <Link
        to={`/tarefas/${task.id}/edit`}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
        title="Editar tarefa"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>

      {/* Title */}
      <h3 className="text-sm font-medium text-slate-900 dark:text-foreground pr-6 leading-snug">
        {task.title}
      </h3>

      {/* Description preview — 2 line clamp */}
      {task.description && (
        <p className={cn(
          'text-xs text-slate-500 dark:text-slate-400 leading-relaxed',
          'overflow-hidden',
          '[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]',
        )}>
          {task.description}
        </p>
      )}

      {/* Footer: status + priority + client + due date */}
      <CardContent className="p-0 mt-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status badge — clickable */}
          <TaskStatusBadge task={task} onStatusChange={onStatusChange} />

          {/* Priority badge */}
          <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            PRIORITY_COLORS[task.priority],
          )}>
            {PRIORITY_LABELS[task.priority]}
          </span>

          {/* Client slug */}
          {task.client_slug && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Tag className="h-2.5 w-2.5" />
              {task.client_slug}
            </span>
          )}

          {/* Due date */}
          {task.due_date && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
              <CalendarDays className="h-2.5 w-2.5" />
              {new Date(task.due_date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
