import { useEffect, useState } from 'react'
import { getKnowledgeEntry } from '@/lib/kb-service'
import type { KnowledgeEntry } from '@/lib/kb-service'

// ---------------------------------------------------------------------------
// useKBEntry — fetches a single knowledge entry by id
// ---------------------------------------------------------------------------

export interface UseKBEntryReturn {
  entry: KnowledgeEntry | null
  loading: boolean
  error: string | null
}

export function useKBEntry(id: string | undefined): UseKBEntryReturn {
  // ALL hooks declared before any conditional returns (project memory rule)
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip fetch if id is undefined (create mode in form page)
    if (!id) {
      setEntry(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getKnowledgeEntry(id)
      .then((data) => {
        if (!cancelled) {
          setEntry(data)
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
  }, [id])

  return { entry, loading, error }
}
