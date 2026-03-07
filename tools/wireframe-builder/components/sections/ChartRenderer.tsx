import type {
  BarLineChartSection,
  DonutChartSection,
  WaterfallChartSection,
  ParetoChartSection,
} from '../../types/blueprint'
import BarLineChart from '../BarLineChart'
import DonutChart from '../DonutChart'
import WaterfallChart from '../WaterfallChart'
import ParetoChart from '../ParetoChart'

type ChartSection =
  | BarLineChartSection
  | DonutChartSection
  | WaterfallChartSection
  | ParetoChartSection

type Props = {
  section: ChartSection
  compareMode: boolean
  comparePeriod: string
}

export default function ChartRenderer({ section, compareMode, comparePeriod }: Props) {
  switch (section.type) {
    case 'bar-line-chart':
      return (
        <BarLineChart
          title={section.title}
          type={section.chartType}
          height={section.height}
        />
      )
    case 'donut-chart':
      return <DonutChart title={section.title} data={[]} />
    case 'waterfall-chart':
      return (
        <WaterfallChart
          title={section.title}
          bars={section.bars}
          compareBars={section.compareBars}
          compareMode={compareMode}
          comparePeriodLabel={comparePeriod}
          height={section.height}
        />
      )
    case 'pareto-chart':
      return <ParetoChart title={section.title} data={[]} />
  }
}
