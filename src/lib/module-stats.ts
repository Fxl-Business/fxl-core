import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
        const [taskResult, kbResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'done'),
          supabase
            .from('knowledge_entries')
            .select('*', { count: 'exact', head: true }),
        ])

        if (cancelled) return

        const newCounts: Record<string, number> = {}

        if (taskResult.count !== null) {
          newCounts['tasks'] = taskResult.count
        }

        if (kbResult.count !== null) {
          newCounts['knowledge-base'] = kbResult.count
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
