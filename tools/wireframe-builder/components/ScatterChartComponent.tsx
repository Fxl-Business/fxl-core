import {
  ScatterChart,
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
  xLabel?: string
  yLabel?: string
  /** Brand color palette (resolved hex strings). [0]=dot fill. Falls back to wireframe token. */
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { x: 12, y: 45 },
  { x: 28, y: 72 },
  { x: 35, y: 58 },
  { x: 42, y: 89 },
  { x: 55, y: 63 },
  { x: 68, y: 95 },
  { x: 75, y: 42 },
  { x: 82, y: 78 },
  { x: 90, y: 55 },
  { x: 95, y: 88 },
]

export default function ScatterChartComponent({ title, height = 300, xLabel, yLabel, chartColors }: Props) {
  const fillColor = chartColors?.[0] ?? 'var(--wf-chart-1)'

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
          <XAxis
            type="number"
            dataKey="x"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined}
          />
          <YAxis
            type="number"
            dataKey="y"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined}
          />
          <Tooltip />
          <Scatter data={DEFAULT_DATA} fill={fillColor} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
