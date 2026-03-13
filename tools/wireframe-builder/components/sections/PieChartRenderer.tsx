import type { PieChartSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import PieChartComponent from '../PieChartComponent'

export default function PieChartRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as PieChartSection
  return (
    <PieChartComponent
      title={s.title}
      height={s.height}
      slices={s.slices}
      chartColors={chartColors}
    />
  )
}
