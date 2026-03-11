import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

type Props = {
  title: string
  height?: number
  categories?: string[]
  /** Brand color palette (resolved hex strings). [0]=fill. Falls back to wireframe token. */
  chartColors?: string[]
}

const DEFAULT_DATA = [
  { subject: 'Vendas', value: 85 },
  { subject: 'Marketing', value: 72 },
  { subject: 'Suporte', value: 90 },
  { subject: 'Financeiro', value: 68 },
  { subject: 'RH', value: 55 },
  { subject: 'Operacoes', value: 78 },
]

export default function RadarChartComponent({ title, height = 300, categories, chartColors }: Props) {
  const data = categories
    ? categories.map((cat, i) => ({ subject: cat, value: DEFAULT_DATA[i % DEFAULT_DATA.length].value }))
    : DEFAULT_DATA

  const fillColor = chartColors?.[0] ?? 'var(--wf-chart-1)'

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--wf-card-border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--wf-muted)', fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: 'var(--wf-muted)', fontSize: 10 }} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={fillColor}
            fill={fillColor}
            fillOpacity={0.3}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
