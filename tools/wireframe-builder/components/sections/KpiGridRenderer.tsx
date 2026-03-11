import type { KpiGridSection } from '../../types/blueprint'
import KpiCardFull from '../KpiCardFull'

type Props = {
  section: KpiGridSection
  compareMode: boolean
}

export default function KpiGridRenderer({ section, compareMode }: Props) {
  return (
    <div>
      {section.groupLabel && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-wf-muted">
          {section.groupLabel}
        </p>
      )}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${section.columns ?? 4}, minmax(0, 1fr))` }}
      >
        {section.items.map((item, i) => (
          <KpiCardFull
            key={i}
            label={item.label}
            value={item.value}
            sub={item.sub}
            variation={item.variation}
            variationPositive={item.variationPositive}
            sparkline={item.sparkline}
            semaforo={item.semaforo}
            semaforoLabel={item.semaforoLabel}
            wide={item.wide}
            compareMode={compareMode}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  )
}
