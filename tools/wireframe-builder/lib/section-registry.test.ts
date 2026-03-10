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

// All 21 section types expected in the registry
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
]

describe('SECTION_REGISTRY', () => {
  it('has an entry for every section type in BlueprintSection union', () => {
    const registryKeys = Object.keys(SECTION_REGISTRY).sort()
    expect(registryKeys).toEqual([...ALL_SECTION_TYPES].sort())
  })

  it('has exactly 21 entries', () => {
    expect(Object.keys(SECTION_REGISTRY)).toHaveLength(21)
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
