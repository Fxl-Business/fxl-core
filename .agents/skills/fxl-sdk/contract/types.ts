/**
 * FXL Contract Types — Hub <-> Spoke API
 *
 * These types define the standard API contract between the FXL Core Hub
 * and spoke applications. Copy this file to your spoke project at
 * `src/types/fxl-contract.ts`.
 *
 * Contract version: 1.0 (read-only)
 * Field types v1: string, number, date, boolean
 */

// =============================================================================
// App Manifest
// =============================================================================

/** Metadata that every spoke exposes via GET /api/fxl/manifest */
export interface FxlAppManifest {
  /** Unique app identifier, matches package.json fxlAppId (e.g., "beach-houses") */
  appId: string
  /** Human-readable app name (e.g., "Gestao Casas de Praia") */
  appName: string
  /** Semantic version of the spoke app */
  version: string
  /** Entity definitions — what data the spoke exposes */
  entities: FxlEntityDefinition[]
  /** Dashboard widgets — summary views for the Hub home */
  dashboardWidgets: FxlWidgetDefinition[]
}

// =============================================================================
// Entity Definitions
// =============================================================================

/** Definition of an entity type (e.g., reservation, property) */
export interface FxlEntityDefinition {
  /** Entity type identifier, used in API paths (e.g., "reservation") */
  type: string
  /** Singular label for UI (e.g., "Reserva") */
  label: string
  /** Plural label for UI (e.g., "Reservas") */
  labelPlural: string
  /** Lucide icon name for UI (e.g., "calendar", "home") */
  icon: string
  /** Field definitions for this entity */
  fields: FxlFieldDefinition[]
  /** Default sort configuration */
  defaultSort: FxlSortConfig
}

/** Definition of a field within an entity */
export interface FxlFieldDefinition {
  /** Field key, matches database column (e.g., "checkIn") */
  key: string
  /** Human-readable label (e.g., "Check-in") */
  label: string
  /**
   * Field type for v1 contract.
   * - string: text, names, descriptions
   * - number: integers, decimals, currency
   * - date: ISO 8601 date/datetime strings
   * - boolean: true/false flags
   *
   * Note: enum and relation types are deferred to v2.
   */
  type: 'string' | 'number' | 'date' | 'boolean'
  /** Whether the field is required (default: false) */
  required?: boolean
}

/** Sort configuration for entity lists */
export interface FxlSortConfig {
  /** Field key to sort by */
  field: string
  /** Sort direction */
  order: 'asc' | 'desc'
}

// =============================================================================
// Widget Definitions
// =============================================================================

/** Widget definition for Hub dashboard integration */
export interface FxlWidgetDefinition {
  /** Unique widget identifier (e.g., "total-reservations") */
  id: string
  /** Human-readable label (e.g., "Total Reservas") */
  label: string
  /** Widget type determines rendering and expected data format */
  type: 'kpi' | 'chart' | 'table' | 'list'
  /** Relative endpoint path for widget data (e.g., "/api/fxl/widgets/total-reservations/data") */
  endpoint: string
}

// =============================================================================
// Widget Data Formats
// =============================================================================

/** KPI widget data — single metric display */
export interface FxlKpiData {
  /** Primary value (e.g., 42 or "R$ 15.000") */
  value: number | string
  /** Label for the metric (e.g., "Total Reservas") */
  label: string
  /** Percentage trend vs previous period (e.g., 12.5 means +12.5%) */
  trend?: number
  /** Prefix for display (e.g., "R$") */
  prefix?: string
  /** Suffix for display (e.g., "%") */
  suffix?: string
}

/** Chart widget data — labels + datasets for chart rendering */
export interface FxlChartData {
  /** X-axis labels (e.g., ["Jan", "Fev", "Mar"]) */
  labels: string[]
  /** One or more data series */
  datasets: FxlChartDataset[]
}

/** Single dataset in a chart */
export interface FxlChartDataset {
  /** Dataset label (e.g., "Receita 2024") */
  label: string
  /** Numeric values corresponding to labels */
  data: number[]
}

/** Table widget data — columns + rows */
export interface FxlTableData {
  /** Column definitions */
  columns: FxlTableColumn[]
  /** Row data (each row is a key-value record) */
  rows: Record<string, unknown>[]
}

/** Table column definition */
export interface FxlTableColumn {
  /** Column key matching row data keys */
  key: string
  /** Human-readable column header */
  label: string
}

/** List widget data — simple item list */
export interface FxlListData {
  /** List items */
  items: FxlListItem[]
}

/** Single item in a list widget */
export interface FxlListItem {
  /** Unique identifier */
  id: string
  /** Primary text */
  title: string
  /** Secondary text */
  subtitle?: string
  /** Badge/tag text */
  badge?: string
}

// =============================================================================
// API Response Types
// =============================================================================

/** Paginated response for entity list endpoints */
export interface FxlPaginatedResponse<T> {
  /** Array of entities */
  data: T[]
  /** Total count (for pagination) */
  total: number
  /** Current page (1-based) */
  page: number
  /** Items per page */
  pageSize: number
}

/** Search result from cross-entity search */
export interface FxlSearchResult {
  /** Entity type (e.g., "reservation") */
  entityType: string
  /** Entity ID */
  entityId: string
  /** Display title (matched field value) */
  title: string
  /** Which field matched the search query */
  matchField: string
}

/** Search response */
export interface FxlSearchResponse {
  /** Search results across all entity types */
  results: FxlSearchResult[]
}

/** Health check response */
export interface FxlHealthResponse {
  /** Always "ok" if healthy */
  status: 'ok'
  /** App version from package.json */
  version: string
  /** FXL contract version (e.g., "1.0") */
  contractVersion: string
  /** ISO 8601 timestamp */
  timestamp: string
}

// =============================================================================
// API Error Response
// =============================================================================

/** Standard error response format */
export interface FxlErrorResponse {
  /** Error message */
  error: string
  /** HTTP status code */
  statusCode: number
  /** Optional details for debugging (NOT exposed in production) */
  details?: string
}

// =============================================================================
// Constants
// =============================================================================

/** Current contract version */
export const FXL_CONTRACT_VERSION = '1.0' as const

/** Maximum items per page for paginated endpoints */
export const FXL_MAX_PAGE_SIZE = 100

/** Default items per page */
export const FXL_DEFAULT_PAGE_SIZE = 20

/** Maximum search results */
export const FXL_MAX_SEARCH_RESULTS = 20

/** Required endpoints that every spoke must implement */
export const FXL_REQUIRED_ENDPOINTS = [
  'GET /api/fxl/manifest',
  'GET /api/fxl/entities/:type',
  'GET /api/fxl/entities/:type/:id',
  'GET /api/fxl/widgets/:id/data',
  'GET /api/fxl/search',
  'GET /api/fxl/health',
] as const
