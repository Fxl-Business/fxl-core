import type { SparklineGridSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import SparklineGridComponent from '../SparklineGridComponent'

export default function SparklineGridRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as SparklineGridSection
  return (
    <SparklineGridComponent
      title={s.title}
      columns={s.columns}
      items={s.items}
      chartColors={chartColors}
    />
  )
}
