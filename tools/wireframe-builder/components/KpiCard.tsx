type Props = {
  label: string
  value: string
  variation?: string
  description?: string
  variationPositive?: boolean
}

export default function KpiCard({ label, value, variation, description, variationPositive = true }: Props) {
  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="text-sm font-medium text-wf-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-wf-heading">{value}</p>
      {variation && (
        <span
          className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
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
        <p className="mt-1.5 text-[10px] text-wf-muted">{description}</p>
      )}
    </div>
  )
}
