import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { FxlWidgetDefinition, FxlListData } from '../../types'
import { fetchWidgetData, type ConnectorError } from '../../services/connector-service'

interface ListWidgetProps {
  widget: FxlWidgetDefinition
  baseUrl: string
}

/**
 * Renders a list widget — simple item list with title, subtitle, badge.
 */
export default function ListWidget({ widget, baseUrl }: ListWidgetProps) {
  const [data, setData] = useState<FxlListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result = await fetchWidgetData<FxlListData>(baseUrl, widget.endpoint)
      if (cancelled) return

      if (result.ok) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
      setLoading(false)
    }

    void load()
    return () => { cancelled = true }
  }, [baseUrl, widget.endpoint])

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
      <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {widget.label}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <p className="p-4 text-sm text-rose-500">Erro ao carregar lista</p>
      ) : data && data.items.length > 0 ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.items.slice(0, 10).map(item => (
            <li key={item.id} className="flex items-start justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-foreground">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.badge && (
                <span className="ml-2 shrink-0 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                  {item.badge}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4 text-sm text-slate-400">Nenhum item</p>
      )}
    </div>
  )
}
