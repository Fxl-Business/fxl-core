import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { label: 'Vendas', actual: 78000, target: 90000 },
  { label: 'Margem', actual: 32, target: 40 },
  { label: 'NPS', actual: 72, target: 80 },
  { label: 'Clientes', actual: 145, target: 120 },
  { label: 'Receita', actual: 520000, target: 600000 },
]

export default function BulletChartComponent({ title, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
  ]

  const legendItems = [
    { label: 'Realizado', color: palette[0] },
    { label: 'Meta', color: palette[1] ?? palette[0] },
  ]

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
      <div className="space-y-4">
        {DEFAULT_DATA.map((item) => (
          <div key={item.label}>
            <p className="mb-1 text-xs font-medium" style={{ color: 'var(--wf-body)' }}>
              {item.label}
            </p>
            <ResponsiveContainer width="100%" height={32}>
              <BarChart data={[item]} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                <XAxis type="number" domain={[0, Math.max(item.actual, item.target) * 1.2]} hide />
                <YAxis type="category" dataKey="label" hide />
                <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="var(--wf-card-border)" />
                <Bar
                  dataKey="actual"
                  fill={palette[0]}
                  barSize={16}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  opacity={0.85}
                />
                <ReferenceLine
                  x={item.target}
                  stroke={palette[1] ?? palette[0]}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
