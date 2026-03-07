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
}

function hasCompareOnly(section: BlueprintSection): boolean {
  return 'compareOnly' in section && section.compareOnly === true
}

export default function SectionRenderer({ section, compareMode, comparePeriod }: Props) {
  if (hasCompareOnly(section) && !compareMode) return null

  switch (section.type) {
    case 'kpi-grid':
      return <KpiGridRenderer section={section} compareMode={compareMode} />
    case 'bar-line-chart':
    case 'donut-chart':
    case 'waterfall-chart':
    case 'pareto-chart':
      return <ChartRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} />
    case 'calculo-card':
      return <CalculoCardRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} />
    case 'data-table':
    case 'drill-down-table':
    case 'clickable-table':
      return <TableRenderer section={section} compareMode={compareMode} />
    case 'saldo-banco':
    case 'manual-input':
    case 'upload-section':
      return <InputRenderer section={section} />
    case 'config-table':
      return <ConfigTableRenderer section={section} />
    case 'chart-grid':
      return <ChartGridRenderer section={section} compareMode={compareMode} comparePeriod={comparePeriod} />
    case 'info-block':
      return <InfoBlockRenderer section={section} />
  }
}
