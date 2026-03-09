import type { ScreenRow } from './editor'
import type { CalculoRow } from '../components/CalculoCard'
import type { DrilRow, DrilColumn } from '../components/DrillDownTable'
import type { WaterfallBar } from '../components/WaterfallChart'
import type { ClickRow, ClickColumn } from '../components/ClickableTable'
import type { ConfigColumn, ConfigRow } from '../components/ConfigTable'
import type { FilterOption } from '../components/WireframeFilterBar'

// Re-export component types for convenience
export type {
  CalculoRow,
  DrilRow,
  DrilColumn,
  WaterfallBar,
  ClickRow,
  ClickColumn,
  ConfigColumn,
  ConfigRow,
  FilterOption,
}

export type PeriodType = 'mensal' | 'anual' | 'none'

export type KpiConfig = {
  label: string
  value: string
  sub?: string
  variation?: string
  variationPositive?: boolean
  sparkline?: number[]
  semaforo?: 'verde' | 'amarelo' | 'vermelho'
  semaforoLabel?: string
  wide?: boolean
}

export type ColumnConfig = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  compareOnly?: boolean
}

export type AdjustEntry = {
  id: string
  type: 'receita' | 'despesa'
  month: string
  value: string
  description: string
}

export type HistoryEntry = {
  id: string
  date: string
  type: string
  period: string
  records: number
  status: 'success' | 'warning' | 'error'
}

export type BankEntry = {
  label: string
  value: string
}

// --- Section types (discriminated union) ---

export type KpiGridSection = {
  type: 'kpi-grid'
  columns?: number
  groupLabel?: string
  items: KpiConfig[]
}

export type BarLineChartSection = {
  type: 'bar-line-chart'
  title: string
  chartType: 'bar' | 'line' | 'bar-line'
  height?: number
  compareOnly?: boolean
  categories?: string[] // Custom X axis labels (default: Jan-Dez)
  xLabel?: string
  yLabel?: string
}

export type DonutChartSection = {
  type: 'donut-chart'
  title: string
  height?: number
  slices?: { label: string; value: number }[]
}

export type WaterfallChartSection = {
  type: 'waterfall-chart'
  title: string
  bars: WaterfallBar[]
  compareBars?: WaterfallBar[]
  height?: number
}

export type ParetoChartSection = {
  type: 'pareto-chart'
  title: string
  height?: number
  data?: { label: string; value: number }[]
}

export type CalculoCardSection = {
  type: 'calculo-card'
  title: string
  rows: CalculoRow[]
}

export type DataTableSection = {
  type: 'data-table'
  title: string
  columns: ColumnConfig[]
  rowCount?: number
}

export type DrillDownTableSection = {
  type: 'drill-down-table'
  title: string
  subtitle?: string
  columns: ColumnConfig[]
  rows: DrilRow[]
  viewSwitcher?: {
    options: string[]
    default: string
    rowsByView: Record<string, DrilRow[]>
  }
}

export type ClickableTableSection = {
  type: 'clickable-table'
  title: string
  subtitle?: string
  columns: ColumnConfig[]
  rows: ClickRow[]
  modalTitleKey?: string
  modalFooter?: React.ReactNode
}

export type SaldoBancoSection = {
  type: 'saldo-banco'
  title?: string
  note?: string
  banks: BankEntry[]
  total: string
}

export type ManualInputSectionConfig = {
  type: 'manual-input'
  title?: string
  initialBalance?: string
  entries?: AdjustEntry[]
}

export type UploadSectionConfig = {
  type: 'upload-section'
  label: string
  acceptedFormats?: string[]
  successMessage?: string
  errorMessages?: string[]
  history?: HistoryEntry[]
}

export type ConfigTableSection = {
  type: 'config-table'
  title: string
  addLabel?: string
  columns: ConfigColumn[]
  rows: ConfigRow[]
}

export type InfoBlockSection = {
  type: 'info-block'
  content: string
  variant?: 'info' | 'warning'
}

export type ChartGridSection = {
  type: 'chart-grid'
  columns?: number
  items: BlueprintSection[]
}

export type BlueprintSection =
  | KpiGridSection
  | BarLineChartSection
  | DonutChartSection
  | WaterfallChartSection
  | ParetoChartSection
  | CalculoCardSection
  | DataTableSection
  | DrillDownTableSection
  | ClickableTableSection
  | SaldoBancoSection
  | ManualInputSectionConfig
  | UploadSectionConfig
  | ConfigTableSection
  | InfoBlockSection
  | ChartGridSection

export type BlueprintScreen = {
  id: string
  title: string
  icon?: string
  periodType: PeriodType
  filters: FilterOption[]
  hasCompareSwitch: boolean
  sections: BlueprintSection[]
  rows?: ScreenRow[] // source of truth when present; sections kept for backward compat
}

export type BlueprintConfig = {
  slug: string
  label: string
  screens: BlueprintScreen[]
}
