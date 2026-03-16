import { Input } from '@shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { STATUS_LABELS, PRIORITY_LABELS } from '../types'
import type { TaskStatus, TaskPriority } from '../types'

// ---------------------------------------------------------------------------
// TaskFilters — horizontal filter bar for status, priority, and client
// ---------------------------------------------------------------------------

interface TaskFiltersProps {
  statusFilter: TaskStatus | undefined
  onStatusChange: (value: TaskStatus | undefined) => void
  priorityFilter: TaskPriority | undefined
  onPriorityChange: (value: TaskPriority | undefined) => void
  clientFilter: string
  onClientChange: (value: string) => void
}

export function TaskFilters({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  clientFilter,
  onClientChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Status filter */}
      <Select
        value={statusFilter ?? '__all__'}
        onValueChange={(val) =>
          onStatusChange(val === '__all__' ? undefined : (val as TaskStatus))
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos os status</SelectItem>
          {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select
        value={priorityFilter ?? '__all__'}
        onValueChange={(val) =>
          onPriorityChange(val === '__all__' ? undefined : (val as TaskPriority))
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Todas as prioridades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas as prioridades</SelectItem>
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Client slug filter */}
      <Input
        placeholder="Filtrar por cliente"
        value={clientFilter}
        onChange={(e) => onClientChange(e.target.value)}
        className="w-[200px]"
      />
    </div>
  )
}
