import type { HeatmapSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import HeatmapComponent from '../HeatmapComponent'

export default function HeatmapRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as HeatmapSection
  return (
    <HeatmapComponent
      title={s.title}
      rows={s.rows}
      colLabels={s.colLabels}
      height={s.height}
      chartColors={chartColors}
    />
  )
}
