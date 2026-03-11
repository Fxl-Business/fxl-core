import {
  BarChart,
  Bar,
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

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
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
          <Legend />
          <Bar dataKey="serieA" name="Serie A" stackId="stack" fill={palette[0]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="serieB" name="Serie B" stackId="stack" fill={palette[1]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="serieC" name="Serie C" stackId="stack" fill={palette[2]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
