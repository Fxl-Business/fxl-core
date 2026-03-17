import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, ChevronLeft } from 'lucide-react'
import type { FxlEntityDefinition } from '../types'
import { fetchEntity, type ConnectorError } from '../services/connector-service'
import { resolveIcon } from '../services/icon-map'
import EntityFields from '../components/EntityFields'

interface EntityDetailProps {
  entity: FxlEntityDefinition
  baseUrl: string
  apiKey?: string
}

/**
 * Generic detail view for a single entity.
 * Fetches entity by ID from the spoke and renders all fields.
 */
export default function EntityDetail({ entity, baseUrl, apiKey }: EntityDetailProps) {
  const { appId, entityId } = useParams<{ appId: string; entityId: string }>()
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!entityId) return

      setLoading(true)
      setError(null)

      const result = await fetchEntity(baseUrl, entity.type, entityId, apiKey)

      if (cancelled) return

      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
        setData(null)
      }

      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [baseUrl, entity.type, entityId])

  const Icon = resolveIcon(entity.icon)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/apps/${appId}/${entity.type}`}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Icon className="h-5 w-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
          {entity.label}
        </h2>
        {entityId && (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            #{entityId}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950/30">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
            Erro ao carregar {entity.label.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400/70">
            {error.message}
          </p>
        </div>
      ) : !data ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {entity.label} nao encontrado(a).
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-card">
          <EntityFields fields={entity.fields} data={data} />
        </div>
      )}
    </div>
  )
}
