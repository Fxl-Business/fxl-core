import type { ProgressBarSection } from '../../types/blueprint'

type Props = {
  section: ProgressBarSection
}

export default function ProgressBarRenderer({ section }: Props) {
  return (
    <div
      className="rounded-lg p-5 space-y-4"
      style={{
        backgroundColor: 'var(--wf-card)',
        border: '1px solid var(--wf-border)',
      }}
    >
      {section.title && (
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--wf-body)' }}
        >
          {section.title}
        </h3>
      )}

      <div className="space-y-3">
        {section.items.map((item, i) => {
          const max = item.max ?? 100
          const pct = max > 0 ? Math.min(100, (item.value / max) * 100) : 0

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: 'var(--wf-body)' }}
                >
                  {item.label}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--wf-muted)' }}
                >
                  {Math.round(pct)}%
                </span>
              </div>

              <div
                className="relative h-2 w-full overflow-hidden rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--wf-border) 50%, transparent)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color ?? 'var(--wf-accent)',
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
