import { cn } from '@/lib/utils'

type SemaforoStatus = 'verde' | 'amarelo' | 'vermelho'

type Props = {
  label: string
  value: string
  sub?: string
  variation?: string
  variationPositive?: boolean
  semaforo?: SemaforoStatus
  semaforoLabel?: string
  sparkline?: number[]
  wide?: boolean
  compareMode?: boolean
  /** Brand primary color (resolved hex). Used for value text emphasis and sparkline stroke. */
  brandPrimary?: string
}

function Sparkline({ points, strokeColor }: { points: number[]; strokeColor?: string }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 200
  const h = 40
  const coords = points
    .map((v, i) => {
      const x = 4 + (i / (points.length - 1)) * (w - 8)
      const y = h - 4 - ((v - min) / range) * (h - 8)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-2 h-8 w-full"
    >
      <polyline points={coords} fill="none" stroke={strokeColor ?? 'var(--wf-muted)'} strokeWidth="1.5" />
    </svg>
  )
}

const SEMAFORO: Record<SemaforoStatus, { dot: string; text: string }> = {
  verde:    { dot: 'bg-green-500',  text: 'text-green-700'  },
  amarelo:  { dot: 'bg-yellow-400', text: 'text-yellow-700' },
  vermelho: { dot: 'bg-red-500',    text: 'text-red-700'    },
}

export default function KpiCardFull({
  label, value, sub, variation, variationPositive = true,
  semaforo, semaforoLabel, sparkline, wide = false, compareMode = false,
  brandPrimary,
}: Props) {
  return (
    <div className={cn('rounded-lg border border-wf-card-border bg-wf-card p-4', wide && 'col-span-2')}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-wf-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-wf-heading" style={brandPrimary ? { color: brandPrimary } : undefined}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-wf-muted">{sub}</p>}
      {compareMode && semaforo && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full flex-shrink-0', SEMAFORO[semaforo].dot)} />
          <span className={cn('text-xs font-medium', SEMAFORO[semaforo].text)}>
            {semaforoLabel ?? { verde: 'Verde', amarelo: 'Amarelo', vermelho: 'Vermelho' }[semaforo]}
          </span>
        </div>
      )}
      {compareMode && variation && (
        <span
          className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium"
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
      {sparkline && <Sparkline points={sparkline} strokeColor={brandPrimary} />}
    </div>
  )
}
