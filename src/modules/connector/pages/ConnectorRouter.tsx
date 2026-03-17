import { useParams, Routes, Route, Navigate } from 'react-router-dom'
import { useConnector } from '../hooks/useConnector'
import { useConnectorList } from '../hooks/useConnectorList'
import type { ConnectorConfig } from '../types'
import { resolveIcon } from '../services/icon-map'
import { Loader2, WifiOff, AlertCircle } from 'lucide-react'

// Lazy imports for sub-pages (will be created in Phase 71)
import EntityList from './EntityList'
import EntityDetail from './EntityDetail'
import ConnectorDashboard from './ConnectorDashboard'

/**
 * Catch-all router for /apps/:appId/*
 * Resolves sub-routes dynamically from the spoke's manifest entities.
 */
export default function ConnectorRouter() {
  const { appId } = useParams<{ appId: string }>()
  const { connectors } = useConnectorList()

  // Find the connector config for this appId
  const config = connectors.find((c: ConnectorConfig) => c.appId === appId)

  if (!config) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-foreground">
          Conector nao encontrado
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Nenhum conector configurado para &quot;{appId}&quot;.
        </p>
      </div>
    )
  }

  return <ConnectorRoutes config={config} />
}

function ConnectorRoutes({ config }: { config: ConnectorConfig }) {
  const { manifest, loading, error, status } = useConnector(config.baseUrl, config.apiKey)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if (status === 'offline') {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <WifiOff className="mx-auto h-12 w-12 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-foreground">
          Spoke Offline
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          O sistema &quot;{config.appId}&quot; esta indisponivel no momento.
        </p>
        {error && (
          <p className="mt-1 text-xs text-slate-400">{error.message}</p>
        )}
      </div>
    )
  }

  if (!manifest) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-foreground">
          Erro ao carregar conector
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {error?.message ?? 'Erro desconhecido'}
        </p>
      </div>
    )
  }

  // Default entity for redirect (first entity in manifest)
  const defaultEntity = manifest.entities[0]?.type

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {(() => {
            const Icon = resolveIcon(manifest.entities[0]?.icon ?? 'box')
            return <Icon className="h-6 w-6 text-indigo-500" />
          })()}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
              {manifest.appName}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              v{manifest.version} — {manifest.entities.length} entidade{manifest.entities.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <Routes>
        {/* Dashboard — root of the connector */}
        <Route
          index
          element={<ConnectorDashboard manifest={manifest} baseUrl={config.baseUrl} apiKey={config.apiKey} />}
        />

        {/* Entity list — /apps/:appId/:entityType */}
        {manifest.entities.map(entity => (
          <Route
            key={entity.type}
            path={entity.type}
            element={
              <EntityList
                entity={entity}
                baseUrl={config.baseUrl}
                apiKey={config.apiKey}
              />
            }
          />
        ))}

        {/* Entity detail — /apps/:appId/:entityType/:id */}
        {manifest.entities.map(entity => (
          <Route
            key={`${entity.type}-detail`}
            path={`${entity.type}/:entityId`}
            element={
              <EntityDetail
                entity={entity}
                baseUrl={config.baseUrl}
                apiKey={config.apiKey}
              />
            }
          />
        ))}

        {/* Fallback — redirect to dashboard or first entity */}
        <Route
          path="*"
          element={<Navigate to={defaultEntity ?? '.'} replace />}
        />
      </Routes>
    </div>
  )
}
