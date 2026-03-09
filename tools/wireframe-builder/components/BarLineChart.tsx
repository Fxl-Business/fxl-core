import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  type: 'bar' | 'line' | 'bar-line'
  xLabel?: string
  yLabel?: string
  height?: number
  categories?: string[]
  /** Brand color palette (resolved hex strings). [0]=bar fill, [1]=line stroke. Falls back to hardcoded grays. */
  chartColors?: string[]
}

const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function buildMockData(categories: string[]) {
  return categories.map((cat, i) => ({
    category: cat,
    bar: 40 + Math.round(Math.sin(i * 0.8) * 20 + i * 4),
    line: 35 + Math.round(Math.sin(i * 0.6) * 18 + i * 3.5),
  }))
}

export default function BarLineChart({ title, type, height = 250, categories, xLabel, yLabel, chartColors }: Props) {
  const data = buildMockData(categories ?? DEFAULT_CATEGORIES)

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <Tooltip />
            <Bar dataKey="bar" fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <Tooltip />
            <Line type="monotone" dataKey="line" stroke={chartColors?.[1] ?? 'var(--wf-chart-2)'} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="bar" fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="line" stroke={chartColors?.[1] ?? 'var(--wf-chart-2)'} strokeWidth={2} dot={false} />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
