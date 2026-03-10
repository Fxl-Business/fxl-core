import {
  FunnelChart,
  Funnel,
  Cell,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  height?: number
  /** Brand color palette (resolved hex strings). Cycles through for each stage. */
  chartColors?: string[]
}

const DEFAULT_COLORS = [
  'var(--wf-chart-1)',
  'var(--wf-chart-2)',
  'var(--wf-chart-3)',
  'var(--wf-chart-4)',
  'var(--wf-chart-5)',
]

const DEFAULT_DATA = [
  { name: 'Visitantes', value: 5000 },
  { name: 'Leads', value: 3200 },
  { name: 'Qualificados', value: 1800 },
  { name: 'Propostas', value: 900 },
  { name: 'Fechados', value: 400 },
]

export default function FunnelChartComponent({ title, height = 300, chartColors }: Props) {
  const palette = chartColors ?? DEFAULT_COLORS

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <FunnelChart>
          <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
          <Funnel dataKey="value" data={DEFAULT_DATA} isAnimationActive>
            <LabelList
              dataKey="name"
              position="right"
              fill="var(--wf-body)"
              fontSize={11}
            />
            {DEFAULT_DATA.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}
