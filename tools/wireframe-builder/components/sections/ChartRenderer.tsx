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
import RadarChartComponent from '../RadarChartComponent'
import TreemapComponent from '../TreemapComponent'
import FunnelChartComponent from '../FunnelChartComponent'
import ScatterChartComponent from '../ScatterChartComponent'
import AreaChartComponent from '../AreaChartComponent'

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
    case 'bar-line-chart': {
      // Dispatch new chart sub-variants to dedicated components
      switch (section.chartType) {
        case 'radar':
          return (
            <RadarChartComponent
              title={section.title}
              height={section.height}
              categories={section.categories}
              chartColors={chartColors}
            />
          )
        case 'treemap':
          return (
            <TreemapComponent
              title={section.title}
              height={section.height}
              chartColors={chartColors}
            />
          )
        case 'funnel':
          return (
            <FunnelChartComponent
              title={section.title}
              height={section.height}
              chartColors={chartColors}
            />
          )
        case 'scatter':
          return (
            <ScatterChartComponent
              title={section.title}
              height={section.height}
              xLabel={section.xLabel}
              yLabel={section.yLabel}
              chartColors={chartColors}
            />
          )
        case 'area':
          return (
            <AreaChartComponent
              title={section.title}
              height={section.height}
              categories={section.categories}
              chartColors={chartColors}
            />
          )
        default: {
          // Legacy bar/line/bar-line types
          const legacyType = section.chartType as 'bar' | 'line' | 'bar-line'
          return (
            <BarLineChart
              title={section.title}
              type={legacyType}
              height={section.height}
              categories={section.categories}
              xLabel={section.xLabel}
              yLabel={section.yLabel}
              chartColors={chartColors}
            />
          )
        }
      }
    }
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
