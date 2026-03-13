type Props = {
  title: string
  height?: number
  categories?: string[]
  chartColors?: string[]
}

type RangeItem = {
  label: string
  start: number
  end: number
}

const DEFAULT_DATA: RangeItem[] = [
  { label: 'Projeto Alpha', start: 1, end: 5 },
  { label: 'Projeto Beta', start: 3, end: 8 },
  { label: 'Projeto Gamma', start: 0, end: 4 },
  { label: 'Projeto Delta', start: 5, end: 10 },
  { label: 'Projeto Epsilon', start: 7, end: 12 },
]

export default function RangeBarChartComponent({ title, chartColors }: Props) {
  const palette = chartColors ?? [
    'var(--wf-chart-1)',
    'var(--wf-chart-2)',
    'var(--wf-chart-3)',
    'var(--wf-chart-4)',
    'var(--wf-chart-5)',
  ]

  const max = Math.max(...DEFAULT_DATA.map((d) => d.end))

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <div className="space-y-3">
        {DEFAULT_DATA.map((item, i) => {
          const startPct = max > 0 ? (item.start / max) * 100 : 0
          const widthPct = max > 0 ? ((item.end - item.start) / max) * 100 : 0
          const color = palette[i % palette.length]

          return (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className="w-28 flex-shrink-0 text-right text-xs"
                style={{ color: 'var(--wf-muted)' }}
              >
                {item.label}
              </span>
              <div
                className="relative h-6 flex-1 rounded"
                style={{ backgroundColor: 'color-mix(in srgb, var(--wf-border) 30%, transparent)' }}
              >
                <div
                  className="absolute top-0 h-6 rounded"
                  style={{
                    marginLeft: `${startPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                />
                <span
                  className="absolute top-0.5 text-[10px] font-medium"
                  style={{
                    left: `${startPct}%`,
                    paddingLeft: 4,
                    color: 'var(--wf-heading)',
                  }}
                >
                  {item.start}
                </span>
                <span
                  className="absolute top-0.5 text-[10px] font-medium"
                  style={{
                    left: `${startPct + widthPct}%`,
                    paddingLeft: 4,
                    color: 'var(--wf-heading)',
                  }}
                >
                  {item.end}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
