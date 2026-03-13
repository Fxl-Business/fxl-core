import type { ProgressGridItem } from '../types/blueprint'

type Props = {
  title: string
  items: ProgressGridItem[]
  chartColors?: string[]
}

export default function ProgressGridComponent({ title, items }: Props) {
  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <div className="space-y-4">
        {items.map((item) => {
          const pct = item.max > 0 ? Math.min(Math.max((item.current / item.max) * 100, 0), 100) : 0
          const targetPct = item.max > 0 ? Math.min(Math.max((item.target / item.max) * 100, 0), 100) : 0

          let fillColor = 'var(--wf-negative)'
          if (item.current >= item.target) {
            fillColor = 'var(--wf-positive)'
          } else if (item.current >= item.target * 0.8) {
            fillColor = 'var(--wf-chart-warn)'
          }

          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--wf-body)' }}>
                  {item.label}
                </span>
                <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--wf-heading)' }}>
                  {item.current.toLocaleString('pt-BR')} / {item.target.toLocaleString('pt-BR')}
                </span>
              </div>
              <div
                className="relative h-2 rounded-full"
                style={{ background: 'color-mix(in srgb, var(--wf-border) 50%, transparent)' }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: fillColor }}
                />
                <div
                  className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2"
                  style={{
                    left: `${targetPct}%`,
                    backgroundColor: 'var(--wf-heading)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
