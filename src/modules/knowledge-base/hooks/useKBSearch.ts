import { useEffect, useState } from 'react'
import { searchKnowledgeEntries } from '@/lib/kb-service'
import type { KnowledgeEntry } from '@/lib/kb-service'

// ---------------------------------------------------------------------------
// useKBSearch — full-text search hook for knowledge entries
// ---------------------------------------------------------------------------

export interface UseKBSearchReturn {
  results: KnowledgeEntry[]
  loading: boolean
  error: string | null
}

export function useKBSearch(query: string): UseKBSearchReturn {
  // ALL hooks declared before any conditional returns (project memory rule)
  const [results, setResults] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch when query is at least 2 characters
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    searchKnowledgeEntries(query)
      .then((data) => {
        if (!cancelled) {
          setResults(data)
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
  }, [query])

  return { results, loading, error }
}
