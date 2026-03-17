import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FxlEntityDefinition } from '../types'
import { fetchEntities, type ConnectorError } from '../services/connector-service'
import { resolveIcon } from '../services/icon-map'
import EntityTable from '../components/EntityTable'
import { FXL_DEFAULT_PAGE_SIZE } from '../types'

interface EntityListProps {
  entity: FxlEntityDefinition
  baseUrl: string
  apiKey?: string
}

/**
 * Generic table view for any entity type.
 * Fetches paginated data from the spoke and renders using EntityTable.
 */
export default function EntityList({ entity, baseUrl, apiKey }: EntityListProps) {
  const { appId } = useParams<{ appId: string }>()
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  const pageSize = FXL_DEFAULT_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const result = await fetchEntities(baseUrl, entity.type, page, pageSize, apiKey)

      if (cancelled) return

      if (result.ok) {
        setData(result.data.data)
        setTotal(result.data.total)
      } else {
        setError(result.error)
        setData([])
      }

      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [baseUrl, entity.type, page, pageSize])

  const Icon = resolveIcon(entity.icon)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/apps/${appId}`}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Icon className="h-5 w-5 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
            {entity.labelPlural}
          </h2>
          {!loading && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              ({total} {total === 1 ? 'item' : 'itens'})
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-800 dark:bg-rose-950/30">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
            Erro ao carregar {entity.labelPlural.toLowerCase()}
          </p>
          <p className="mt-1 text-xs text-rose-500 dark:text-rose-400/70">
            {error.message}
          </p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <Icon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Nenhum(a) {entity.label.toLowerCase()} encontrado(a).
          </p>
        </div>
      ) : (
        <>
          <EntityTable
            fields={entity.fields}
            rows={data}
            entityType={entity.type}
            appId={appId ?? ''}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pagina {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
