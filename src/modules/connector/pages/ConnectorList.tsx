import { Link } from 'react-router-dom'
import { Plug, ArrowRight, Settings, Loader2 } from 'lucide-react'
import { useConnectorList } from '../hooks/useConnectorList'
import { useConnector } from '../hooks/useConnector'
import ConnectorBadge from '../components/ConnectorBadge'
import type { ConnectorConfig } from '../types'

function ConnectorItem({ config }: { config: ConnectorConfig }) {
  const { manifest, status } = useConnector(config.baseUrl, config.apiKey)

  return (
    <Link
      to={`/apps/${config.appId}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Plug className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-foreground">
              {manifest?.appName ?? config.appName ?? config.appId}
            </span>
            <ConnectorBadge status={status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {manifest
              ? `${manifest.entities.length} entidade${manifest.entities.length !== 1 ? 's' : ''} — v${manifest.version}`
              : config.baseUrl}
          </p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
    </Link>
  )
}

export default function ConnectorList() {
  const { connectors, loading } = useConnectorList()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">
            Conectores
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Apps externos conectados ao hub via contrato FXL.
          </p>
        </div>
        <Link
          to="/admin/connectors"
          className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Settings className="h-3.5 w-3.5" />
          Gerenciar
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : connectors.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-slate-50 p-12 text-center dark:bg-slate-900/50 dark:border-slate-700">
          <Plug className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Nenhum connector ativo.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Acesse{' '}
            <Link to="/admin/connectors" className="text-indigo-500 hover:underline">
              /admin/connectors
            </Link>{' '}
            para cadastrar uma spoke.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {connectors.map(c => (
            <ConnectorItem key={c.appId} config={c} />
          ))}
        </div>
      )}
    </div>
  )
}
