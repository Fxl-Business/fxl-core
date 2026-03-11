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
  xLabel?: string
  yLabel?: string
  /** Brand color palette (resolved hex strings). [0]=bar fill. Falls back to wireframe token. */
  chartColors?: string[]
}

const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const DEFAULT_VALUES = [4200, 5100, 4800, 6200, 5800, 7100, 6900, 7500, 8200, 7800, 8500, 9100]

export default function HorizontalBarChartComponent({
  title,
  height = 300,
  categories,
  xLabel,
  yLabel,
  chartColors,
}: Props) {
  const fillColor = chartColors?.[0] ?? 'var(--wf-chart-1)'

  const cats = categories ?? DEFAULT_CATEGORIES
  const data = cats.map((cat, i) => ({
    category: cat,
    value: DEFAULT_VALUES[i % DEFAULT_VALUES.length],
  }))

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
          <XAxis
            type="number"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={70}
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined}
          />
          <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
          <Bar dataKey="value" name="Valor" fill={fillColor} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
