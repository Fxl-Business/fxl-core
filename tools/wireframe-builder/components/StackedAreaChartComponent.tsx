import {
  AreaChart,
  Area,
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

export default function StackedAreaChartComponent({ title, height = 300, categories, chartColors }: Props) {
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
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaFill0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[0]} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="areaFill1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[1]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[1]} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="areaFill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={palette[2]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={palette[2]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="serieA"
            name="Serie A"
            stackId="area"
            stroke={palette[0]}
            fill="url(#areaFill0)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="serieB"
            name="Serie B"
            stackId="area"
            stroke={palette[1]}
            fill="url(#areaFill1)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="serieC"
            name="Serie C"
            stackId="area"
            stroke={palette[2]}
            fill="url(#areaFill2)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
