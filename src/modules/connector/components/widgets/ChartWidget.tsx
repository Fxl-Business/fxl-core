import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { FxlWidgetDefinition, FxlChartData } from '../../types'
import { fetchWidgetData, type ConnectorError } from '../../services/connector-service'

interface ChartWidgetProps {
  widget: FxlWidgetDefinition
  baseUrl: string
}

// Colors for chart datasets
const CHART_COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
]

/**
 * Renders a chart widget using recharts.
 * Transforms FxlChartData (labels + datasets) into recharts format.
 */
export default function ChartWidget({ widget, baseUrl }: ChartWidgetProps) {
  const [data, setData] = useState<FxlChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ConnectorError | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const result = await fetchWidgetData<FxlChartData>(baseUrl, widget.endpoint)
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

  // Transform FxlChartData into recharts data format
  const chartData = data?.labels.map((label, idx) => {
    const point: Record<string, string | number> = { name: label }
    for (const ds of data.datasets) {
      point[ds.label] = ds.data[idx] ?? 0
    }
    return point
  }) ?? []

  return (
    <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-card">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {widget.label}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-rose-500">Erro ao carregar grafico</p>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-slate-500 dark:text-slate-400"
            />
            <Tooltip />
            <Legend />
            {data?.datasets.map((ds, i) => (
              <Bar
                key={ds.label}
                dataKey={ds.label}
                fill={CHART_COLORS[i % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-sm text-slate-400">Sem dados</p>
      )}
    </div>
  )
}
