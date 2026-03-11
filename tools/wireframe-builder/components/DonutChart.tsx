import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type Slice = { label: string; value: number; pct?: string; color?: string }

type Props = {
  title: string
  data: Slice[]
  centerValue?: string
  centerLabel?: string
  height?: number
  /** Brand color palette (resolved hex strings). Replaces default COLORS array. Falls back to grayscale. */
  chartColors?: string[]
}

const COLORS = [
  'var(--wf-chart-1)',
  'var(--wf-chart-2)',
  'var(--wf-chart-3)',
  'var(--wf-chart-4)',
  'var(--wf-chart-5)',
]

export default function DonutChart({ title, data, centerValue, centerLabel, height = 200, chartColors }: Props) {
  const palette = chartColors ?? COLORS
  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: height, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.28}
                outerRadius={height * 0.42}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={data[i].color ?? palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
            </PieChart>
          </ResponsiveContainer>
          {(centerValue || centerLabel) && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              {centerValue && <span className="text-base font-bold text-wf-heading leading-none">{centerValue}</span>}
              {centerLabel && <span className="mt-0.5 text-[10px] text-wf-muted">{centerLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ background: d.color ?? palette[i % palette.length] }}
              />
              <span className="flex-1 truncate text-xs text-wf-body">{d.label}</span>
              <span className="text-xs font-medium text-wf-heading tabular-nums">
                {d.pct ?? `${d.value.toLocaleString('pt-BR')}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
