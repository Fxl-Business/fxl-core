import { useState, useEffect } from 'react'
import type { ConnectorConfig } from '../types'

/**
 * Hardcoded connector configs for v3.3.
 * In v3.5, this will read from tenant_modules table via Supabase.
 *
 * For now, returns an empty array (no spokes connected yet).
 * To test during development, add entries here:
 *
 * const DEV_CONNECTORS: ConnectorConfig[] = [
 *   { appId: 'beach-houses', baseUrl: 'http://localhost:3001' },
 * ]
 */
const DEV_CONNECTORS: ConnectorConfig[] = []

/**
 * Hook to get all enabled connectors for the current tenant.
 * Currently returns hardcoded list. Will be replaced with
 * Supabase fetch in v3.5 multi-tenancy integration.
 */
export function useConnectorList(): {
  connectors: ConnectorConfig[]
  loading: boolean
} {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate async loading (future: fetch from tenant_modules)
    setConnectors(DEV_CONNECTORS)
    setLoading(false)
  }, [])

  return { connectors, loading }
}
