import { useEffect, useState } from 'react'
import { supabase } from '@platform/supabase'

export interface ModuleStats {
  /** Map of module ID to badge count */
  counts: Record<string, number>
  loading: boolean
}

export function useModuleStats(): ModuleStats {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const taskResult = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'done')

        if (cancelled) return

        const newCounts: Record<string, number> = {}

        if (taskResult.count !== null) {
          newCounts['tasks'] = taskResult.count
        }

        setCounts(newCounts)
      } catch {
        // Silently handle — tables may not exist in dev environments
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { counts, loading }
}
