/**
 * TechnicalConfig -- data semantics schema that bridges visual wireframes
 * to functional systems. Defines data sources, column mappings, KPI formulas,
 * manual input definitions, classification rules, thresholds, and section
 * bindings per blueprint section.
 *
 * This is a design-time artifact: formulas are string literals (specifications
 * for the generated system), not evaluated at FXL Core level.
 */

// ─── Primitive types ──────────────────────────────────────────────────────

export type ColumnDataType = 'text' | 'number' | 'date' | 'currency'

export type ColumnFormat =
  | 'dd/mm/yyyy'
  | 'mm/dd/yyyy'
  | '1.234,56'
  | '1,234.56'
  | 'text'

export type AggregationFunction = 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'

// ─── Data layer types ─────────────────────────────────────────────────────

export type ColumnMapping = {
  sourceColumn: string
  targetField: string
  dataType: ColumnDataType
  format?: ColumnFormat
}

export type ReportType = {
  id: string
  label: string
  columns: ColumnMapping[]
  periodModel: 'monthly'
  filesPerPeriod: number
}

export type FieldDefinition = {
  id: string
  label: string
  source: string
  column: string
  aggregation: AggregationFunction
  filter?: string
}

export type FormulaDefinition = {
  id: string
  label: string
  expression: string
  format: 'currency' | 'percentage' | 'number'
  references: string[]
}

// ─── Input layer types ────────────────────────────────────────────────────

export type ManualInputDefinition = {
  id: string
  label: string
  dataType: 'currency' | 'number' | 'text'
  frequency: 'per-month' | 'one-time'
  targetScreen: string
  targetSection?: string
}

export type SettingsTable = {
  id: string
  label: string
  columns: { key: string; label: string; type: 'text' | 'badge' | 'status' | 'actions' }[]
  defaultRows?: Record<string, string>[]
}

// ─── Business rules types ─────────────────────────────────────────────────

export type ClassificationRule = {
  id: string
  label: string
  categories: { value: string; label: string }[]
  defaultMappings: Record<string, string>
}

export type ThresholdDefinition = {
  id: string
  label: string
  metric: string
  levels: {
    verde: { operator: '>=' | '>' | '<=' | '<'; value: number }
    amarelo: {
      operator: '>=' | '>' | '<=' | '<'
      value: number
      upperOperator?: '>=' | '>' | '<=' | '<'
      upperValue?: number
    }
    vermelho: { operator: '>=' | '>' | '<=' | '<'; value: number }
  }
}

// ─── Section binding types ────────────────────────────────────────────────

export type KpiGridBinding = {
  sectionType: 'kpi-grid'
  screenId: string
  sectionIndex: number
  items: {
    fieldOrFormula: string
    subExpression?: string
    threshold?: string
    comparisonTypes?: ('mes-anterior' | 'mesmo-mes-ano-anterior' | 'media-anual')[]
  }[]
}

export type CalculoCardBinding = {
  sectionType: 'calculo-card'
  screenId: string
  sectionIndex: number
  rows: {
    fieldOrFormula: string
    operator?: string
    highlight?: boolean
  }[]
}

export type ChartBinding = {
  sectionType: 'bar-line-chart' | 'donut-chart' | 'waterfall-chart' | 'pareto-chart'
  screenId: string
  sectionIndex: number
  dataSource: string
  groupBy?: string
}

export type TableBinding = {
  sectionType: 'data-table' | 'drill-down-table' | 'clickable-table'
  screenId: string
  sectionIndex: number
  dataSource: string
  columns: {
    key: string
    fieldOrFormula: string
    format?: 'currency' | 'percentage' | 'number' | 'text' | 'date'
  }[]
  drillDownBy?: string
}

export type UploadBinding = {
  sectionType: 'upload-section'
  screenId: string
  sectionIndex: number
  reportType: string
  acceptedFormats: string[]
}

export type ManualInputBinding = {
  sectionType: 'manual-input'
  screenId: string
  sectionIndex: number
  inputs: string[]
}

export type SaldoBancoBinding = {
  sectionType: 'saldo-banco'
  screenId: string
  sectionIndex: number
  settingsTable: string
}

export type ConfigTableBinding = {
  sectionType: 'config-table'
  screenId: string
  sectionIndex: number
  settingsTable: string
}

export type InfoBlockBinding = {
  sectionType: 'info-block'
  screenId: string
  sectionIndex: number
}

export type ChartGridBinding = {
  sectionType: 'chart-grid'
  screenId: string
  sectionIndex: number
  items: ChartBinding[]
}

export type SectionBinding =
  | KpiGridBinding
  | CalculoCardBinding
  | ChartBinding
  | TableBinding
  | UploadBinding
  | ManualInputBinding
  | SaldoBancoBinding
  | ConfigTableBinding
  | InfoBlockBinding
  | ChartGridBinding

// ─── Top-level TechnicalConfig ────────────────────────────────────────────

export type TechnicalConfig = {
  slug: string
  version: '1.0'

  // Data layer
  reportTypes: ReportType[]
  fields: FieldDefinition[]
  formulas: FormulaDefinition[]

  // Input layer
  manualInputs: ManualInputDefinition[]
  settings: SettingsTable[]

  // Business rules
  classifications: ClassificationRule[]
  thresholds: ThresholdDefinition[]

  // Section bindings (maps blueprint sections to data)
  bindings: SectionBinding[]
}
