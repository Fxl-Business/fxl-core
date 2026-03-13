import {
  ComposedChart,
  Bar,
  Scatter,
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
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { name: 'Produto A', value: 8500 },
  { name: 'Produto B', value: 7200 },
  { name: 'Produto C', value: 6100 },
  { name: 'Produto D', value: 5400 },
  { name: 'Produto E', value: 4300 },
  { name: 'Produto F', value: 3800 },
  { name: 'Produto G', value: 2900 },
  { name: 'Produto H', value: 1500 },
]

export default function LollipopChartComponent({ title, height = 300, categories, chartColors }: Props) {
  const color = chartColors?.[0] ?? 'var(--wf-chart-1)'

  const data = categories
    ? categories.map((cat, i) => ({
        name: cat,
        value: DEFAULT_DATA[i % DEFAULT_DATA.length].value,
      }))
    : DEFAULT_DATA

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
          <Bar
            dataKey="value"
            barSize={2}
            fill={color}
            isAnimationActive={false}
          />
          <Scatter
            dataKey="value"
            fill={color}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
