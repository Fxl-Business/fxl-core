import type { ProgressGridSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import ProgressGridComponent from '../ProgressGridComponent'

export default function ProgressGridRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as ProgressGridSection
  return (
    <ProgressGridComponent
      title={s.title}
      items={s.items}
      chartColors={chartColors}
    />
  )
}
