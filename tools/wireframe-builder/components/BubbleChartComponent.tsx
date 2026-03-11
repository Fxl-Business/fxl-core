import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  height?: number
  xLabel?: string
  yLabel?: string
  /** Brand color palette (resolved hex strings). [0]=bubble fill. Falls back to wireframe token. */
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { x: 10, y: 30, z: 200 },
  { x: 25, y: 55, z: 350 },
  { x: 38, y: 42, z: 80 },
  { x: 45, y: 78, z: 500 },
  { x: 52, y: 25, z: 150 },
  { x: 60, y: 65, z: 280 },
  { x: 70, y: 90, z: 420 },
  { x: 78, y: 48, z: 120 },
  { x: 85, y: 72, z: 380 },
  { x: 92, y: 38, z: 220 },
]

export default function BubbleChartComponent({ title, height = 300, xLabel, yLabel, chartColors }: Props) {
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
          <ZAxis type="number" dataKey="z" range={[20, 400]} />
          <Tooltip />
          <Scatter data={DEFAULT_DATA} fill={fillColor} fillOpacity={0.7} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
