import type { GaugeChartSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import GaugeChartComponent from '../GaugeChartComponent'

export default function GaugeChartRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as GaugeChartSection
  return (
    <GaugeChartComponent
      title={s.title}
      value={s.value}
      min={s.min}
      max={s.max}
      zones={s.zones}
      height={s.height}
      chartColors={chartColors}
    />
  )
}
