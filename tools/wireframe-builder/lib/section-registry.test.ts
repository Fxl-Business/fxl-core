// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import {
  SECTION_REGISTRY,
  getRenderer,
  getPropertyForm,
  getDefaultSection,
  getSectionLabel,
  getCatalog,
} from './section-registry'
import { BlueprintSectionSchema } from './blueprint-schema'
import type { BlueprintSection } from '../types/blueprint'

// All 28 section types expected in the registry
const ALL_SECTION_TYPES: BlueprintSection['type'][] = [
  'kpi-grid',
  'bar-line-chart',
  'donut-chart',
  'waterfall-chart',
  'pareto-chart',
  'calculo-card',
  'data-table',
  'drill-down-table',
  'clickable-table',
  'saldo-banco',
  'manual-input',
  'upload-section',
  'config-table',
  'info-block',
  'chart-grid',
  'settings-page',
  'form-section',
  'filter-config',
  'stat-card',
  'progress-bar',
  'divider',
  'gauge-chart',
  'branding-editor',
  'pie-chart',
  'progress-grid',
  'heatmap',
  'sparkline-grid',
  'sankey',
]

describe('SECTION_REGISTRY', () => {
  it('has an entry for every section type in BlueprintSection union', () => {
    const registryKeys = Object.keys(SECTION_REGISTRY).sort()
    expect(registryKeys).toEqual([...ALL_SECTION_TYPES].sort())
  })

  it('has exactly 28 entries', () => {
    expect(Object.keys(SECTION_REGISTRY)).toHaveLength(28)
  })
})

describe('defaultProps <-> Zod round-trip', () => {
  for (const type of ALL_SECTION_TYPES) {
    it(`${type}: defaultProps() produces a valid object that Zod parses`, () => {
      const defaults = SECTION_REGISTRY[type].defaultProps()
      expect(defaults).toBeDefined()
      expect(defaults.type).toBe(type)

      const result = BlueprintSectionSchema.safeParse(defaults)
      expect(
        result.success,
        `defaultProps for "${type}" failed Zod validation: ${
          !result.success ? JSON.stringify(result.error.issues) : ''
        }`
      ).toBe(true)
    })
  }
})

describe('getDefaultSection', () => {
  for (const type of ALL_SECTION_TYPES) {
    it(`returns correct type for "${type}"`, () => {
      const section = getDefaultSection(type)
      expect(section.type).toBe(type)
    })
  }
})

describe('getSectionLabel', () => {
  for (const type of ALL_SECTION_TYPES) {
    it(`returns non-empty string for "${type}"`, () => {
      const label = getSectionLabel(type)
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    })
  }
})

describe('getRenderer', () => {
  for (const type of ALL_SECTION_TYPES) {
    it(`returns a component for "${type}"`, () => {
      const renderer = getRenderer(type)
      expect(renderer).toBeDefined()
      expect(typeof renderer).toBe('function')
    })
  }
})

describe('getPropertyForm', () => {
  for (const type of ALL_SECTION_TYPES) {
    it(`returns a component for "${type}"`, () => {
      const form = getPropertyForm(type)
      expect(form).toBeDefined()
      expect(typeof form).toBe('function')
    })
  }
})

describe('getCatalog', () => {
  it('returns categories with items covering all registered types', () => {
    const catalog = getCatalog()
    expect(catalog.length).toBeGreaterThan(0)

    const allCatalogTypes = catalog.flatMap((cat) =>
      cat.items.map((item) => item.type)
    )

    for (const type of ALL_SECTION_TYPES) {
      expect(
        allCatalogTypes,
        `Section type "${type}" is missing from catalog`
      ).toContain(type)
    }
  })

  it('each category has a name and non-empty items', () => {
    const catalog = getCatalog()
    for (const category of catalog) {
      expect(category.name).toBeTruthy()
      expect(category.items.length).toBeGreaterThan(0)
    }
  })

  it('each catalog entry has required fields', () => {
    const catalog = getCatalog()
    for (const category of catalog) {
      for (const item of category.items) {
        expect(item.type).toBeTruthy()
        expect(item.label).toBeTruthy()
        expect(item.description).toBeTruthy()
        expect(item.icon).toBeDefined()
      }
    }
  })
})

describe('defaultProps renderability', () => {
  const typesWithItems = [
    'kpi-grid', 'progress-bar', 'sparkline-grid', 'progress-grid',
  ] as const

  const typesWithRows = [
    'drill-down-table', 'clickable-table',
    'config-table', 'calculo-card', 'heatmap',
  ] as const

  const typesWithChartData = [
    'chart-grid',
  ] as const

  for (const type of typesWithItems) {
    it(`${type}: defaultProps has non-empty items array`, () => {
      const defaults = getDefaultSection(type) as Record<string, unknown>
      expect(Array.isArray(defaults.items)).toBe(true)
      expect((defaults.items as unknown[]).length).toBeGreaterThan(0)
    })
  }

  for (const type of typesWithRows) {
    it(`${type}: defaultProps has non-empty rows array`, () => {
      const defaults = getDefaultSection(type) as Record<string, unknown>
      expect(Array.isArray(defaults.rows)).toBe(true)
      expect((defaults.rows as unknown[]).length).toBeGreaterThan(0)
    })
  }

  for (const type of typesWithChartData) {
    it(`${type}: defaultProps has non-empty items array`, () => {
      const defaults = getDefaultSection(type) as Record<string, unknown>
      expect(Array.isArray(defaults.items)).toBe(true)
      expect((defaults.items as unknown[]).length).toBeGreaterThan(0)
    })
  }

  it('saldo-banco: defaultProps has non-empty banks array', () => {
    const defaults = getDefaultSection('saldo-banco') as Record<string, unknown>
    expect(Array.isArray(defaults.banks)).toBe(true)
    expect((defaults.banks as unknown[]).length).toBeGreaterThan(0)
  })

  it('pie-chart: defaultProps has non-empty slices array', () => {
    const defaults = getDefaultSection('pie-chart') as Record<string, unknown>
    expect(Array.isArray(defaults.slices)).toBe(true)
    expect((defaults.slices as unknown[]).length).toBeGreaterThan(0)
  })

  it('sankey: defaultProps has non-empty nodes and links arrays', () => {
    const defaults = getDefaultSection('sankey') as Record<string, unknown>
    expect(Array.isArray(defaults.nodes)).toBe(true)
    expect((defaults.nodes as unknown[]).length).toBeGreaterThan(0)
    expect(Array.isArray(defaults.links)).toBe(true)
    expect((defaults.links as unknown[]).length).toBeGreaterThan(0)
  })

  it('waterfall-chart: defaultProps has non-empty bars array', () => {
    const defaults = getDefaultSection('waterfall-chart') as Record<string, unknown>
    expect(Array.isArray(defaults.bars)).toBe(true)
    expect((defaults.bars as unknown[]).length).toBeGreaterThan(0)
  })

  it('settings-page: defaultProps has non-empty groups array', () => {
    const defaults = getDefaultSection('settings-page') as Record<string, unknown>
    expect(Array.isArray(defaults.groups)).toBe(true)
    expect((defaults.groups as unknown[]).length).toBeGreaterThan(0)
  })

  it('form-section: defaultProps has non-empty fields array', () => {
    const defaults = getDefaultSection('form-section') as Record<string, unknown>
    expect(Array.isArray(defaults.fields)).toBe(true)
    expect((defaults.fields as unknown[]).length).toBeGreaterThan(0)
  })

  it('filter-config: defaultProps has non-empty filters array', () => {
    const defaults = getDefaultSection('filter-config') as Record<string, unknown>
    expect(Array.isArray(defaults.filters)).toBe(true)
    expect((defaults.filters as unknown[]).length).toBeGreaterThan(0)
  })
})
