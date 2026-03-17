import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import type { FxlWidgetDefinition, FxlKpiData } from '../../types'
import { fetchWidgetData, type ConnectorError } from '../../services/connector-service'

interface KpiWidgetProps {
  widget: FxlWidgetDefinition
  baseUrl: string
}

/**
 * Renders a KPI widget — single metric with optional trend indicator.
 */
export default function KpiWidget({ widget, baseUrl }: KpiWidgetProps) {
  const [data, setData] = useState<FxlKpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result = await fetchWidgetData<FxlKpiData>(baseUrl, widget.endpoint)
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-card">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {widget.label}
      </p>

      {loading ? (
        <div className="mt-3 flex items-center justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <p className="mt-2 text-sm text-rose-500">Erro ao carregar</p>
      ) : data ? (
        <div className="mt-2">
          <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
            {data.prefix ?? ''}{typeof data.value === 'number' ? data.value.toLocaleString('pt-BR') : data.value}{data.suffix ?? ''}
          </p>
          {data.trend !== undefined && (
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${data.trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {data.trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {data.trend >= 0 ? '+' : ''}{data.trend.toFixed(1)}%
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
