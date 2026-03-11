import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  title: string
  height?: number
  /** Brand color palette (resolved hex strings). Cycles through for each cell. */
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
  { name: 'Vendas', size: 4500 },
  { name: 'Marketing', size: 2300 },
  { name: 'Operacoes', size: 1800 },
  { name: 'Financeiro', size: 1200 },
  { name: 'Suporte', size: 900 },
  { name: 'RH', size: 600 },
]

type ContentProps = {
  x: number
  y: number
  width: number
  height: number
  name: string
  index: number
  palette: string[]
}

function CustomContent({ x, y, width, height, name, index, palette }: ContentProps) {
  if (width < 30 || height < 20) return null
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={palette[index % palette.length]}
        stroke="var(--wf-card)"
        strokeWidth={2}
        rx={4}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={11}
          fontWeight={600}
        >
          {name}
        </text>
      )}
    </g>
  )
}

export default function TreemapComponent({ title, height = 300, chartColors }: Props) {
  const palette = chartColors ?? DEFAULT_COLORS

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={DEFAULT_DATA}
          dataKey="size"
          nameKey="name"
          content={<CustomContent x={0} y={0} width={0} height={0} name="" index={0} palette={palette} />}
        >
          <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
