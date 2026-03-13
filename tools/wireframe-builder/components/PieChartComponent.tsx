import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

type Props = {
  title: string
  height?: number
  slices?: { label: string; value: number }[]
  chartColors?: string[]
}

const DEFAULT_SLICES = [
  { label: 'Produto A', value: 400 },
  { label: 'Produto B', value: 300 },
  { label: 'Produto C', value: 200 },
  { label: 'Outros', value: 100 },
]

export default function PieChartComponent({ title, height = 280, slices, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
    'var(--wf-chart-3)',
    'var(--wf-chart-4)',
    'var(--wf-chart-5)',
  ]

  const data = slices ?? DEFAULT_SLICES

  const legendItems = data.map((d, i) => ({
    label: d.label,
    color: palette[i % palette.length],
  }))

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
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius="70%"
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--wf-card)',
              border: '1px solid var(--wf-card-border)',
              color: 'var(--wf-heading)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
