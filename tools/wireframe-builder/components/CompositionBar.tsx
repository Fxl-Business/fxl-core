type Segment = {
  label: string
  value: number
  color?: string // defaults to var(--wf-chart-N) by index
}

type Props = {
  title: string
  segments: Segment[]
  height?: number // bar height in px, default 32
  showLegend?: boolean // default true
  formatValue?: (v: number) => string
}

const palette = [
  'var(--wf-chart-1)',
  'var(--wf-chart-2)',
  'var(--wf-chart-3)',
  'var(--wf-chart-4)',
  'var(--wf-chart-5)',
]

export default function CompositionBar({
  title,
  segments,
  height = 32,
  showLegend = true,
  formatValue,
}: Props) {
  const total = Math.max(1, segments.reduce((sum, s) => sum + s.value, 0))

  const defaultFormat = (v: number) => `${((v / total) * 100).toFixed(0)}%`
  const fmt = formatValue ?? defaultFormat

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>

      {/* Stacked bar */}
      <div
        className="flex w-full overflow-hidden rounded-md"
        style={{ height }}
      >
        {segments.map((seg, i) => {
          const width = (seg.value / total) * 100
          const color = seg.color ?? palette[i % palette.length]
          return (
            <div
              key={seg.label}
              title={`${seg.label}: ${fmt(seg.value)}`}
              className="transition-[filter] duration-150 hover:brightness-90"
              style={{
                width: `${width}%`,
                backgroundColor: color,
              }}
            />
          )
        })}
      </div>

      {/* Legend grid */}
      {showLegend && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {segments.map((seg, i) => {
            const color = seg.color ?? palette[i % palette.length]
            return (
              <div key={seg.label} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate text-xs text-wf-muted">{seg.label}</span>
                <span className="ml-auto text-xs font-medium tabular-nums text-wf-heading">
                  {fmt(seg.value)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
