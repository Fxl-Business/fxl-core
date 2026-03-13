import { useEffect, useState, useCallback } from 'react'
import { listKnowledgeEntries } from '@/lib/kb-service'
import type { KnowledgeEntry, KnowledgeEntryType } from '@/lib/kb-service'

// ---------------------------------------------------------------------------
// useKBEntries — fetches knowledge entries with composed filters
// ---------------------------------------------------------------------------

export interface KBEntriesFilters {
  entry_type?: KnowledgeEntryType
  client_slug?: string
  tags?: string[]
}

export interface UseKBEntriesReturn {
  entries: KnowledgeEntry[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useKBEntries(filters: KBEntriesFilters): UseKBEntriesReturn {
  // ALL hooks declared before any conditional returns (project memory rule)
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
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

    listKnowledgeEntries({
      entry_type: filters.entry_type,
      client_slug: filters.client_slug,
      // Pass tag as the first element of the tags array (kb-service accepts single tag filter)
      ...(filters.tags && filters.tags.length > 0 ? { tag: filters.tags[0] } : {}),
    })
      .then((data) => {
        if (!cancelled) {
          setEntries(data)
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
  // Serialize tags array to prevent infinite re-renders (RESEARCH pitfall 2)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.entry_type, filters.client_slug, JSON.stringify(filters.tags), fetchTick])

  return { entries, loading, error, refetch }
}
