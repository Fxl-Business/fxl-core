import type { ChartGridSection } from '../../types/blueprint'
import SectionRenderer from './SectionRenderer'

type Props = {
  section: ChartGridSection
  compareMode: boolean
  comparePeriod: string
  /** Brand chart palette (resolved hex strings). Passed to nested SectionRenderer instances. */
  chartColors?: string[]
  /** Brand primary color (resolved hex). Passed to nested SectionRenderer instances. */
  brandPrimary?: string
}

export default function ChartGridRenderer({ section, compareMode, comparePeriod, chartColors, brandPrimary }: Props) {
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
          chartColors={chartColors}
          brandPrimary={brandPrimary}
        />
      ))}
    </div>
  )
}
