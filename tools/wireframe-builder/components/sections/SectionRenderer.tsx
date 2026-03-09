import type { BlueprintSection } from '../../types/blueprint'
import KpiGridRenderer from './KpiGridRenderer'
import ChartRenderer from './ChartRenderer'
import CalculoCardRenderer from './CalculoCardRenderer'
import TableRenderer from './TableRenderer'
import InputRenderer from './InputRenderer'
import ConfigTableRenderer from './ConfigTableRenderer'
import ChartGridRenderer from './ChartGridRenderer'
import InfoBlockRenderer from './InfoBlockRenderer'

type Props = {
  section: BlueprintSection
  compareMode: boolean
  comparePeriod: string
  /** Brand chart palette (resolved hex strings). Routed to chart and chart-grid renderers. */
  chartColors?: string[]
  /** Brand primary color (resolved hex). Routed to KPI grid, table, and chart-grid renderers. */
  brandPrimary?: string
}

function hasCompareOnly(section: BlueprintSection): boolean {
  return 'compareOnly' in section && section.compareOnly === true
}

export default function SectionRenderer({ section, compareMode, comparePeriod, chartColors, brandPrimary }: Props) {
  if (hasCompareOnly(section) && !compareMode) return null

  switch (section.type) {
    case 'kpi-grid':
      return <KpiGridRenderer section={section} compareMode={compareMode} brandPrimary={brandPrimary} />
    case 'bar-line-chart':
    case 'donut-chart':
    case 'waterfall-chart':
    case 'pareto-chart':
      return <ChartRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} chartColors={chartColors} />
    case 'calculo-card':
      return <CalculoCardRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} />
    case 'data-table':
    case 'drill-down-table':
    case 'clickable-table':
      return <TableRenderer section={section} compareMode={compareMode} brandPrimary={brandPrimary} />
    case 'saldo-banco':
    case 'manual-input':
    case 'upload-section':
      return <InputRenderer section={section} />
    case 'config-table':
      return <ConfigTableRenderer section={section} />
    case 'chart-grid':
      return <ChartGridRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} chartColors={chartColors} brandPrimary={brandPrimary} />
    case 'info-block':
      return <InfoBlockRenderer section={section} />
  }
}
