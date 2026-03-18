/**
 * Connector module types — re-exports contract types + connector-specific types.
 *
 * Contract types are defined inline (copied from SDK skill contract/types.ts)
 * because the SDK skill lives outside the TypeScript compilation scope.
 */

// ---- Connector-specific types ----
export { type ConnectorConfig, type ConnectorStatus } from './connector-config'

// ---- Contract types (copied from .agents/skills/nexo/contract/types.ts) ----

/** Metadata that every spoke exposes via GET /api/fxl/manifest */
export interface FxlAppManifest {
  appId: string
  appName: string
  version: string
  entities: FxlEntityDefinition[]
  dashboardWidgets: FxlWidgetDefinition[]
}

/** Definition of an entity type */
export interface FxlEntityDefinition {
  type: string
  label: string
  labelPlural: string
  icon: string
  fields: FxlFieldDefinition[]
  defaultSort: FxlSortConfig
}

/** Definition of a field within an entity */
export interface FxlFieldDefinition {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  required?: boolean
}

/** Sort configuration for entity lists */
export interface FxlSortConfig {
  field: string
  order: 'asc' | 'desc'
}

/** Widget definition for Hub dashboard integration */
export interface FxlWidgetDefinition {
  id: string
  label: string
  type: 'kpi' | 'chart' | 'table' | 'list'
  endpoint: string
}

// ---- Widget data formats ----

export interface FxlKpiData {
  value: number | string
  label: string
  trend?: number
  prefix?: string
  suffix?: string
}

export interface FxlChartData {
  labels: string[]
  datasets: FxlChartDataset[]
}

export interface FxlChartDataset {
  label: string
  data: number[]
}

export interface FxlTableData {
  columns: FxlTableColumn[]
  rows: Record<string, unknown>[]
}

export interface FxlTableColumn {
  key: string
  label: string
}

export interface FxlListData {
  items: FxlListItem[]
}

export interface FxlListItem {
  id: string
  title: string
  subtitle?: string
  badge?: string
}

// ---- API Response types ----

export interface FxlPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface FxlHealthResponse {
  status: 'ok'
  version: string
  contractVersion: string
  timestamp: string
}

export interface FxlErrorResponse {
  error: string
  statusCode: number
  details?: string
}

// ---- Constants ----

export const FXL_CONTRACT_VERSION = '1.0' as const
export const FXL_DEFAULT_PAGE_SIZE = 20
