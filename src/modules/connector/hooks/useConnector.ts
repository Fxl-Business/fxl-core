import { useState, useEffect, useCallback } from 'react'
import type { FxlAppManifest, ConnectorStatus } from '../types'
import { fetchManifest, type ConnectorError } from '../services/connector-service'

interface UseConnectorResult {
  manifest: FxlAppManifest | null
  loading: boolean
  error: ConnectorError | null
  status: ConnectorStatus
  refetch: () => void
}

// Simple in-memory cache to avoid re-fetching manifests on every render
const manifestCache = new Map<string, { manifest: FxlAppManifest; timestamp: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute

/**
 * Hook to fetch and manage the manifest for a specific connector.
 * Caches manifests in memory for 1 minute.
 */
export function useConnector(baseUrl: string, apiKey?: string): UseConnectorResult {
  const [manifest, setManifest] = useState<FxlAppManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)
  const [status, setStatus] = useState<ConnectorStatus>('loading')

  const doFetch = useCallback(async () => {
    // Check cache first
    const cached = manifestCache.get(baseUrl)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setManifest(cached.manifest)
      setStatus('online')
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setStatus('loading')

    const result = await fetchManifest(baseUrl, apiKey)

    if (result.ok) {
      setManifest(result.data)
      setStatus('online')
      setError(null)
      manifestCache.set(baseUrl, { manifest: result.data, timestamp: Date.now() })
    } else {
      setError(result.error)
      setManifest(null)
      if (result.error.type === 'offline') {
        setStatus('offline')
        // Use cached data if available (even if stale)
        const stale = manifestCache.get(baseUrl)
        if (stale) {
          setManifest(stale.manifest)
        }
      } else {
        setStatus('error')
      }
    }

    setLoading(false)
  }, [baseUrl, apiKey])

  useEffect(() => {
    void doFetch()
  }, [doFetch])

  return { manifest, loading, error, status, refetch: doFetch }
}
