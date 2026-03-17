import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { FxlWidgetDefinition, FxlTableData } from '../../types'
import { fetchWidgetData, type ConnectorError } from '../../services/connector-service'

interface TableWidgetProps {
  widget: FxlWidgetDefinition
  baseUrl: string
  apiKey?: string
}

/**
 * Renders a table widget — columns + rows of summary data.
 */
export default function TableWidget({ widget, baseUrl, apiKey }: TableWidgetProps) {
  const [data, setData] = useState<FxlTableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result = await fetchWidgetData<FxlTableData>(baseUrl, widget.endpoint, apiKey)
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
    <div className="col-span-2 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-card">
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
        <p className="p-4 text-sm text-rose-500">Erro ao carregar tabela</p>
      ) : data && data.rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {data.columns.map(col => (
                  <th
                    key={col.key}
                    className="whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {data.rows.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {data.columns.map(col => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-2 text-slate-700 dark:text-slate-300">
                      {String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-4 text-sm text-slate-400">Sem dados</p>
      )}
    </div>
  )
}
