import { useState, useEffect } from 'react'
import { getDocBySlug, type DocumentRow } from '../services/docs-service'
import { parseDoc, type ParsedDoc } from '../services/docs-parser'

type UseDocResult = {
  doc: ParsedDoc | null
  rawDoc: DocumentRow | null
  loading: boolean
  error: string | null
}

export function useDoc(slug: string): UseDocResult {
  const [doc, setDoc] = useState<ParsedDoc | null>(null)
  const [rawDoc, setRawDoc] = useState<DocumentRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getDocBySlug(slug)
      .then((row) => {
        if (cancelled) return
        if (!row) {
          setDoc(null)
          setRawDoc(null)
          setLoading(false)
          return
        }
        const parsed = parseDoc(row)
        setDoc(parsed)
        setRawDoc(row)
        setLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return { doc, rawDoc, loading, error }
}
