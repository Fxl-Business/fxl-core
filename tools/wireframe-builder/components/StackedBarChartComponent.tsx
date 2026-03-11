import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  /** Brand color palette (resolved hex strings). Falls back to wireframe tokens. */
  chartColors?: string[]
}

const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function StackedBarChartComponent({ title, height = 300, categories, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
    'var(--wf-chart-3)',
    'var(--wf-chart-4)',
    'var(--wf-chart-5)',
  ]

  const cats = categories ?? DEFAULT_CATEGORIES
  const data = cats.map((cat, i) => ({
    category: cat,
    serieA: Math.round(3000 + Math.abs(Math.sin(i * 0.8)) * 2000),
    serieB: Math.round(2000 + Math.abs(Math.sin(i * 1.2 + 1)) * 1500),
    serieC: Math.round(1000 + Math.abs(Math.sin(i * 1.6 + 2)) * 1000),
  }))

  const legendItems = [
    { label: 'Serie A', color: palette[0] },
    { label: 'Serie B', color: palette[1] },
    { label: 'Serie C', color: palette[2] },
  ]

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <div className="mb-3 flex flex-wrap gap-3">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-wf-muted">{item.label}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
          <XAxis
            dataKey="category"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
          <Bar dataKey="serieA" name="Serie A" stackId="stack" fill={palette[0]} radius={[0, 0, 0, 0]} opacity={0.7} activeBar={{ opacity: 1 }} />
          <Bar dataKey="serieB" name="Serie B" stackId="stack" fill={palette[1]} radius={[0, 0, 0, 0]} opacity={0.7} activeBar={{ opacity: 1 }} />
          <Bar dataKey="serieC" name="Serie C" stackId="stack" fill={palette[2]} radius={[3, 3, 0, 0]} opacity={0.7} activeBar={{ opacity: 1 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
