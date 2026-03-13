import type { SankeySection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import SankeyComponent from '../SankeyComponent'

export default function SankeyRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as SankeySection
  return (
    <SankeyComponent
      title={s.title}
      height={s.height}
      nodes={s.nodes}
      links={s.links}
      chartColors={chartColors}
    />
  )
}
