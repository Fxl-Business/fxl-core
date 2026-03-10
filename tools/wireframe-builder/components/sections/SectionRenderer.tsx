import type { BlueprintSection } from '../../types/blueprint'
import { SECTION_REGISTRY } from '../../lib/section-registry'

type Props = {
  section: BlueprintSection
  compareMode: boolean
  comparePeriod: string
  /** Brand chart palette (resolved hex strings). Routed to chart and chart-grid renderers. */
  chartColors?: string[]
}

function hasCompareOnly(section: BlueprintSection): boolean {
  return 'compareOnly' in section && section.compareOnly === true
}

export default function SectionRenderer({ section, compareMode, comparePeriod, chartColors }: Props) {
  if (hasCompareOnly(section) && !compareMode) return null

  const entry = SECTION_REGISTRY[section.type]
  if (!entry) return null

  const Renderer = entry.renderer
  return <Renderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} chartColors={chartColors} />
}
