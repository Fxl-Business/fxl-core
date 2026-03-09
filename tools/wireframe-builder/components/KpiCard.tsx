type Props = {
  label: string
  value: string
  variation?: string
  description?: string
  variationPositive?: boolean
}

export default function KpiCard({ label, value, variation, description, variationPositive = true }: Props) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-wf-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-wf-heading">{value}</p>
      {variation && (
        <span
          className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: variationPositive
              ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
              : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
            color: variationPositive ? 'var(--wf-positive)' : 'var(--wf-negative)',
          }}
        >
          {variation}
        </span>
      )}
      {description && (
        <p className="mt-1.5 text-xs text-wf-muted">{description}</p>
      )}
    </div>
  )
}
