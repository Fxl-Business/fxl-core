import { useCallback, useEffect, useState } from 'react'
import { listClients, getClientBySlug } from '../services/clients-service'
import type { Client } from '../types'

// ---------------------------------------------------------------------------
// useClients — fetches list of clients with refetch support
// ---------------------------------------------------------------------------

export interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
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

    listClients()
      .then((data) => {
        if (!cancelled) {
          setClients(data)
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
  }, [fetchTick])

  return { clients, loading, error, refetch }
}

// ---------------------------------------------------------------------------
// useClient — fetches a single client by slug
// ---------------------------------------------------------------------------

export interface UseClientReturn {
  client: Client | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useClient(slug: string | undefined): UseClientReturn {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchTick, setFetchTick] = useState(0)

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1)
  }, [])

  useEffect(() => {
    if (!slug) {
      setClient(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getClientBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setClient(data)
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
  }, [slug, fetchTick])

  return { client, loading, error, refetch }
}
