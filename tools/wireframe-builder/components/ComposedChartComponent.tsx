import {
  ComposedChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  /** Brand color palette (resolved hex strings). [0]=bar, [1]=line, [2]=area. Falls back to wireframe tokens. */
  chartColors?: string[]
}

const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function ComposedChartComponent({ title, height = 300, categories, chartColors }: Props) {
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
    bar: Math.round(3000 + Math.abs(Math.sin(i * 0.8)) * 2000),
    line: Math.round(4000 + Math.abs(Math.sin(i * 1.1 + 0.5)) * 2500),
    area: Math.round(2000 + Math.abs(Math.sin(i * 1.4 + 1)) * 1500),
  }))

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data}>
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
          <Legend />
          {/* Render order: Bar first, Area second, Line on top */}
          <Bar dataKey="bar" name="Barra" fill={palette[0]} radius={[3, 3, 0, 0]} />
          <Area
            type="monotone"
            dataKey="area"
            name="Area"
            fill={palette[2]}
            stroke={palette[2]}
            fillOpacity={0.15}
          />
          <Line
            type="monotone"
            dataKey="line"
            name="Linha"
            stroke={palette[1]}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
