import { cn } from '@shared/utils'
import { STATUS_COLORS, STATUS_LABELS, nextStatus } from '../types'
import type { Task, TaskStatus } from '../types'

// ---------------------------------------------------------------------------
// TaskStatusBadge — clickable pill that advances task status on click
// ---------------------------------------------------------------------------

interface TaskStatusBadgeProps {
  task: Pick<Task, 'id' | 'status'>
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

export function TaskStatusBadge({ task, onStatusChange }: TaskStatusBadgeProps) {
  function handleClick() {
    if (onStatusChange) {
      onStatusChange(task.id, nextStatus(task.status))
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-opacity',
        onStatusChange ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
        STATUS_COLORS[task.status],
      )}
      title={`Status: ${STATUS_LABELS[task.status]}. ${onStatusChange ? 'Clique para avançar.' : ''}`}
    >
      {STATUS_LABELS[task.status]}
    </button>
  )
}
