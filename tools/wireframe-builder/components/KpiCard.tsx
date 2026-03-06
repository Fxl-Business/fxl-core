import { cn } from '@/lib/utils'

type Props = {
  label: string
  value: string
  variation?: string
  description?: string
  variationPositive?: boolean
}

export default function KpiCard({ label, value, variation, description, variationPositive = true }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
      {variation && (
        <span
          className={cn(
            'mt-1.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium',
            variationPositive
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700',
          )}
        >
          {variation}
        </span>
      )}
      {description && (
        <p className="mt-1.5 text-xs text-gray-400">{description}</p>
      )}
    </div>
  )
}
