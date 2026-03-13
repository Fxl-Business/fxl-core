import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DotProps } from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  chartColors?: string[]
}

const ENTITIES = ['Produto A', 'Produto B', 'Produto C', 'Produto D']

const DEFAULT_DATA = [
  { period: 'T1', 'Produto A': 1, 'Produto B': 3, 'Produto C': 2, 'Produto D': 4 },
  { period: 'T2', 'Produto A': 2, 'Produto B': 1, 'Produto C': 3, 'Produto D': 4 },
  { period: 'T3', 'Produto A': 1, 'Produto B': 2, 'Produto C': 4, 'Produto D': 3 },
  { period: 'T4', 'Produto A': 3, 'Produto B': 1, 'Produto C': 2, 'Produto D': 4 },
  { period: 'T5', 'Produto A': 2, 'Produto B': 3, 'Produto C': 1, 'Produto D': 4 },
  { period: 'T6', 'Produto A': 1, 'Produto B': 2, 'Produto C': 3, 'Produto D': 4 },
]

export default function BumpChartComponent({ title, height = 300, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
    'var(--wf-chart-3)',
    'var(--wf-chart-4)',
    'var(--wf-chart-5)',
  ]

  const legendItems = ENTITIES.map((name, i) => ({
    label: name,
    color: palette[i % palette.length],
  }))

  const lastIndex = DEFAULT_DATA.length - 1

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
        <LineChart data={DEFAULT_DATA} margin={{ top: 10, right: 80, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
          <XAxis
            dataKey="period"
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            reversed
            domain={[1, ENTITIES.length]}
            tickCount={ENTITIES.length}
            tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip />
          {ENTITIES.map((entity, i) => (
            <Line
              key={entity}
              dataKey={entity}
              stroke={palette[i % palette.length]}
              strokeWidth={2.5}
              type="monotone"
              isAnimationActive={false}
              dot={(props: DotProps & { index?: number }) => {
                const { cx, cy, index } = props
                if (index === lastIndex && typeof cx === 'number' && typeof cy === 'number') {
                  return (
                    <g key={`label-${entity}`}>
                      <circle cx={cx} cy={cy} r={4} fill={palette[i % palette.length]} />
                      <text
                        x={cx + 10}
                        y={cy + 4}
                        fill="var(--wf-muted)"
                        fontSize={10}
                        fontWeight={500}
                      >
                        {entity}
                      </text>
                    </g>
                  )
                }
                if (typeof cx === 'number' && typeof cy === 'number') {
                  return <circle key={`dot-${entity}-${index}`} cx={cx} cy={cy} r={3} fill={palette[i % palette.length]} />
                }
                return <g key={`empty-${entity}-${index}`} />
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
