import type { ChartGridSection } from '../../types/blueprint'
import SectionRenderer from './SectionRenderer'

type Props = {
  section: ChartGridSection
  compareMode: boolean
  comparePeriod: string
}

export default function ChartGridRenderer({ section, compareMode, comparePeriod }: Props) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${section.columns ?? 2}, minmax(0, 1fr))` }}
    >
      {section.items.map((item, i) => (
        <SectionRenderer
          key={i}
          section={item}
          compareMode={compareMode}
          comparePeriod={comparePeriod}
        />
      ))}
    </div>
  )
}
