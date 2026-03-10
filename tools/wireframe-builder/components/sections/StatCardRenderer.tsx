import { TrendingUp, TrendingDown } from 'lucide-react'
import type { StatCardSection } from '../../types/blueprint'

type Props = {
  section: StatCardSection
}

export default function StatCardRenderer({ section }: Props) {
  return (
    <div
      className="rounded-lg p-5 space-y-1"
      style={{
        backgroundColor: 'var(--wf-card)',
        border: '1px solid var(--wf-border)',
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'var(--wf-muted)' }}
      >
        {section.title}
      </p>

      <div className="flex items-baseline gap-3">
        <span
          className="text-2xl font-bold"
          style={{ color: 'var(--wf-body)' }}
        >
          {section.value}
        </span>

        {section.trend && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              color: section.trend.positive
                ? 'var(--wf-positive, #16a34a)'
                : 'var(--wf-negative, #ef4444)',
              backgroundColor: section.trend.positive
                ? 'color-mix(in srgb, var(--wf-positive, #16a34a) 12%, transparent)'
                : 'color-mix(in srgb, var(--wf-negative, #ef4444) 12%, transparent)',
            }}
          >
            {section.trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {section.trend.value}
          </span>
        )}
      </div>

      {section.subtitle && (
        <p
          className="text-xs"
          style={{ color: 'var(--wf-muted)' }}
        >
          {section.subtitle}
        </p>
      )}
    </div>
  )
}
