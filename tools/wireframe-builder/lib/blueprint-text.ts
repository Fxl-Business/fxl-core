import type {
  BlueprintConfig,
  BlueprintSection,
  BlueprintScreen,
} from '../types/blueprint'
import { getSectionLabel } from './section-registry'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SectionSummary = {
  type: BlueprintSection['type']
  label: string
  title?: string
  keyFields: string[]
}

export type ScreenSummary = {
  id: string
  title: string
  filters?: string[]
  periodType?: string
  sections: SectionSummary[]
}

export type BlueprintSummary = {
  clientName: string
  description?: string
  screens: ScreenSummary[]
}

// ---------------------------------------------------------------------------
// Key field extraction per section type
// ---------------------------------------------------------------------------

function extractKeyFields(section: BlueprintSection): string[] {
  switch (section.type) {
    case 'kpi-grid':
      return section.items.map((i) => i.label)

    case 'bar-line-chart':
      return [`Tipo: ${section.chartType}`, section.title].filter(Boolean) as string[]

    case 'donut-chart':
      return [section.title].filter(Boolean) as string[]

    case 'waterfall-chart':
      return [section.title].filter(Boolean) as string[]

    case 'pareto-chart':
      return [section.title].filter(Boolean) as string[]

    case 'calculo-card':
      return [section.title].filter(Boolean) as string[]

    case 'data-table':
      return section.columns.map((c) => c.label)

    case 'drill-down-table':
      return [section.title, ...section.columns.map((c) => c.label)].filter(Boolean) as string[]

    case 'clickable-table':
      return [section.title, ...section.columns.map((c) => c.label)].filter(Boolean) as string[]

    case 'saldo-banco':
      return [section.title].filter(Boolean) as string[]

    case 'manual-input':
      return [section.title].filter(Boolean) as string[]

    case 'upload-section':
      return [section.label].filter(Boolean) as string[]

    case 'config-table':
      return [section.title, ...section.columns.map((c) => c.label)].filter(Boolean) as string[]

    case 'info-block':
      return []

    case 'chart-grid':
      return []

    case 'settings-page':
      return [section.title, ...section.groups.map((g) => g.label)].filter(Boolean) as string[]

    case 'form-section':
      return [section.title, ...section.fields.map((f) => f.label)].filter(Boolean) as string[]

    case 'filter-config':
      return section.filters.map((f) => f.label)

    case 'stat-card':
      return [section.title, section.value].filter(Boolean) as string[]

    case 'progress-bar':
      return [section.title].filter(Boolean) as string[]

    case 'divider':
      return []

    default:
      return []
  }
}

// ---------------------------------------------------------------------------
// Section summary extraction
// ---------------------------------------------------------------------------

function extractSectionSummary(section: BlueprintSection): SectionSummary {
  // Get human-readable label from registry
  const label = getSectionLabel(section.type)

  // Extract title if present on the section
  const title = 'title' in section && typeof section.title === 'string'
    ? section.title
    : undefined

  return {
    type: section.type,
    label,
    title,
    keyFields: extractKeyFields(section),
  }
}

// ---------------------------------------------------------------------------
// Screen summary extraction
// ---------------------------------------------------------------------------

function extractScreenSummary(screen: BlueprintScreen): ScreenSummary {
  const filters = screen.filters.length > 0
    ? screen.filters.map((f) => f.label)
    : undefined

  const periodType = screen.periodType !== 'none'
    ? screen.periodType
    : undefined

  return {
    id: screen.id,
    title: screen.title,
    filters,
    periodType,
    sections: screen.sections.map(extractSectionSummary),
  }
}

// ---------------------------------------------------------------------------
// Main extraction function
// ---------------------------------------------------------------------------

export function extractBlueprintSummary(config: BlueprintConfig): BlueprintSummary {
  return {
    clientName: config.label,
    screens: config.screens.map(extractScreenSummary),
  }
}
