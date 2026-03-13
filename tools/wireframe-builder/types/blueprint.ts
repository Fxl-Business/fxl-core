import type { ScreenRow } from './editor'
import type { CalculoRow } from '../components/CalculoCard'
import type { DrilRow, DrilColumn } from '../components/DrillDownTable'
import type { WaterfallBar } from '../components/WaterfallChart'
import type { ClickRow, ClickColumn } from '../components/ClickableTable'
import type { ConfigColumn, ConfigRow } from '../components/ConfigTable'
import type { FilterOption } from '../components/WireframeFilterBar'
import type { LucideIcon } from 'lucide-react'

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
  icon?: LucideIcon
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

// --- Chart type union ---

export type ChartType =
  | 'bar'
  | 'line'
  | 'bar-line'
  | 'radar'
  | 'treemap'
  | 'funnel'
  | 'scatter'
  | 'area'
  | 'stacked-bar'
  | 'stacked-area'
  | 'horizontal-bar'
  | 'bubble'
  | 'composed'
  | 'grouped-bar'
  | 'bullet'
  | 'step-line'
  | 'lollipop'
  | 'range-bar'
  | 'bump'
  | 'polar'

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
  chartType: ChartType
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
  footer?: Record<string, string>
}

export type DrillDownTableSection = {
  type: 'drill-down-table'
  title: string
  subtitle?: string
  columns: ColumnConfig[]
  rows: DrilRow[]
  footer?: Record<string, string>
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

export type SettingsPageSection = {
  type: 'settings-page'
  title: string
  groups: {
    label: string
    settings: {
      label: string
      description?: string
      inputType: 'toggle' | 'select' | 'text'
      options?: string[]
      value?: string
    }[]
  }[]
}

export type FormSectionSection = {
  type: 'form-section'
  title: string
  fields: {
    label: string
    inputType: 'text' | 'number' | 'date' | 'select'
    placeholder?: string
    options?: string[]
    required?: boolean
  }[]
  columns?: number
}

export type FilterConfigSection = {
  type: 'filter-config'
  filters: {
    label: string
    filterType: 'period' | 'select' | 'date-range'
    options?: string[]
    defaultValue?: string
  }[]
}

export type StatCardSection = {
  type: 'stat-card'
  title: string
  value: string
  subtitle?: string
  icon?: string
  trend?: {
    value: string
    positive: boolean
  }
}

export type ProgressBarSection = {
  type: 'progress-bar'
  title: string
  items: {
    label: string
    value: number
    max?: number
    color?: string
  }[]
}

export type DividerSection = {
  type: 'divider'
  label?: string
  variant?: 'solid' | 'dashed' | 'labeled'
}

export type GaugeChartSection = {
  type: 'gauge-chart'
  title: string
  value: number
  min?: number
  max?: number
  zones?: {
    label?: string
    value: number
    color?: string
  }[]
  height?: number
}

export type BrandingEditorSection = {
  type: 'branding-editor'
  title?: string
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
  | SettingsPageSection
  | FormSectionSection
  | FilterConfigSection
  | StatCardSection
  | ProgressBarSection
  | DividerSection
  | GaugeChartSection
  | BrandingEditorSection

export type BlueprintScreen = {
  id: string
  title: string
  icon?: string
  badge?: number | string // optional badge count or label shown on sidebar nav item
  periodType: PeriodType
  filters: FilterOption[]
  hasCompareSwitch: boolean
  sections: BlueprintSection[]
  rows?: ScreenRow[] // source of truth when present; sections kept for backward compat
}

export type SidebarGroup = {
  label: string       // heading text ("Financeiro", "Operacional", etc.)
  screenIds: string[] // screen IDs belonging to this group (matched by BlueprintScreen.id)
}

export type SidebarConfig = {
  footer?: string          // version/environment text
  groups?: SidebarGroup[]  // optional grouping of screens with labeled headings
}

export type HeaderConfig = {
  showLogo?: boolean              // defaults true — shows branding.logoUrl in header left
  showPeriodSelector?: boolean    // defaults true — shows period navigation in center
  showUserIndicator?: boolean     // defaults true — shows user name/role chip on right
  actions?: {
    manage?: boolean   // defaults true — shows Gerenciar button
    share?: boolean    // defaults true — shows Share button
    export?: boolean   // defaults false — shows Export button
  }
}

export type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number
  sidebar?: SidebarConfig    // NEW — optional, dashboard-level
  header?: HeaderConfig      // NEW — optional, dashboard-level
  screens: BlueprintScreen[]
}
