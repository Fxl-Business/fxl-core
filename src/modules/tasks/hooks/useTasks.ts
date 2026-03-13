import { useCallback, useEffect, useState } from 'react'
import { listTasks } from '@/lib/tasks-service'
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks-service'

// ---------------------------------------------------------------------------
// useTasks — fetches tasks with composed filters
// ---------------------------------------------------------------------------

export interface TasksFilters {
  status?: TaskStatus
  priority?: TaskPriority
  client_slug?: string
}

export interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTasks(filters: TasksFilters = {}): UseTasksReturn {
  // ALL hooks declared before any conditional returns (project memory rule)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchTick, setFetchTick] = useState(0)

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    listTasks({
      status: filters.status,
      priority: filters.priority,
      client_slug: filters.client_slug,
    })
      .then((data) => {
        if (!cancelled) {
          setTasks(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.client_slug, fetchTick])

  return { tasks, loading, error, refetch }
}
