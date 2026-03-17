import { useState, useEffect, useCallback } from 'react'
import type { ConnectorConfig } from '../types'
import { listConnectorConfigs } from '../services/connector-config-service'

/**
 * Hook to get all enabled connectors for the current tenant.
 * Reads from Supabase tenant_modules table (rows with module_id like 'connector:*').
 */
export function useConnectorList(): {
  connectors: ConnectorConfig[]
  loading: boolean
  refetch: () => void
} {
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([])
  const [loading, setLoading] = useState(true)

  const doFetch = useCallback(async () => {
    setLoading(true)
    const configs = await listConnectorConfigs()
    setConnectors(configs)
    setLoading(false)
  }, [])

  useEffect(() => {
    void doFetch()
  }, [doFetch])

  return { connectors, loading, refetch: doFetch }
}
