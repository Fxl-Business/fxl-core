import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { name: 'Norte', value: 85 },
  { name: 'Nordeste', value: 72 },
  { name: 'Sudeste', value: 95 },
  { name: 'Sul', value: 68 },
  { name: 'Centro-Oeste', value: 54 },
  { name: 'Internacional', value: 40 },
]

export default function PolarAreaChartComponent({ title, height = 300, categories, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
    'var(--wf-chart-3)',
    'var(--wf-chart-4)',
    'var(--wf-chart-5)',
  ]

  const data = categories
    ? categories.map((cat, i) => ({
        name: cat,
        value: DEFAULT_DATA[i % DEFAULT_DATA.length].value,
      }))
    : DEFAULT_DATA

  const legendItems = data.map((d, i) => ({
    label: d.name,
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
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={data}
        >
          <RadialBar dataKey="value" isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </RadialBar>
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}
