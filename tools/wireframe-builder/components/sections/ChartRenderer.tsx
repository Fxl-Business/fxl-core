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
  /** Brand chart palette (resolved hex strings). Passed through to chart components. */
  chartColors?: string[]
}

export default function ChartRenderer({ section, compareMode, comparePeriod, chartColors }: Props) {
  // For waterfall/pareto: derive { primary, accent } from palette array
  const paletteObj = chartColors
    ? { primary: chartColors[0], accent: chartColors[2] ?? chartColors[0] }
    : undefined

  switch (section.type) {
    case 'bar-line-chart':
      return (
        <BarLineChart
          title={section.title}
          type={section.chartType}
          height={section.height}
          categories={section.categories}
          xLabel={section.xLabel}
          yLabel={section.yLabel}
          chartColors={chartColors}
        />
      )
    case 'donut-chart':
      return (
        <DonutChart
          title={section.title}
          data={section.slices ?? []}
          height={section.height}
          chartColors={chartColors}
        />
      )
    case 'waterfall-chart':
      return (
        <WaterfallChart
          title={section.title}
          bars={section.bars}
          compareBars={section.compareBars}
          compareMode={compareMode}
          comparePeriodLabel={comparePeriod}
          height={section.height}
          chartColors={paletteObj}
        />
      )
    case 'pareto-chart':
      return (
        <ParetoChart
          title={section.title}
          data={section.data ?? []}
          height={section.height}
          chartColors={paletteObj}
        />
      )
  }
}
