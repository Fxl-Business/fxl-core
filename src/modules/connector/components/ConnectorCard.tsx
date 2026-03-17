import { Link } from 'react-router-dom'
import { ArrowRight, Plug } from 'lucide-react'
import type { SlotComponentProps } from '@platform/module-loader/registry'
import { useConnectorList } from '../hooks/useConnectorList'
import { useConnector } from '../hooks/useConnector'
import ConnectorBadge from './ConnectorBadge'

/**
 * Card for Home page showing connector status.
 * Injected into HOME_DASHBOARD via extension slot.
 * Self-contained — no cross-module imports (follows tasks widget pattern).
 */
export function ConnectorHomeWidget({ className }: SlotComponentProps) {
  const { connectors, loading: listLoading } = useConnectorList()

  if (listLoading) return null
  if (connectors.length === 0) return null

  return (
    <div className={`rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card${className ? ` ${className}` : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <Plug className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Apps Conectados
        </span>
      </div>

      {/* Connector list */}
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {connectors.map(config => (
          <ConnectorCardItem key={config.appId} config={config} />
        ))}
      </ul>
    </div>
  )
}

function ConnectorCardItem({ config }: { config: { appId: string; appName: string; baseUrl: string; apiKey: string } }) {
  const { manifest, status } = useConnector(config.baseUrl, config.apiKey)

  return (
    <li>
      <Link
        to={`/apps/${config.appId}`}
        className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
              {manifest?.appName ?? config.appId}
            </p>
            <ConnectorBadge status={status} />
          </div>
          {manifest && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {manifest.entities.length} entidade{manifest.entities.length !== 1 ? 's' : ''} — v{manifest.version}
            </p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
      </Link>
    </li>
  )
}
