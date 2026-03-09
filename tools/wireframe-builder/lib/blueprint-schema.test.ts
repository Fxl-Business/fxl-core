import { describe, it, expect } from 'vitest'
import {
  BlueprintConfigSchema,
  BlueprintScreenSchema,
  BlueprintSectionSchema,
} from './blueprint-schema'

// ---------------------------------------------------------------------------
// Helpers -- minimal valid fixtures for each of the 15 section types
// ---------------------------------------------------------------------------

const kpiGrid = {
  type: 'kpi-grid' as const,
  items: [{ label: 'Revenue', value: 'R$ 100k' }],
}

const barLineChart = {
  type: 'bar-line-chart' as const,
  title: 'Monthly Sales',
  chartType: 'bar' as const,
}

const donutChart = {
  type: 'donut-chart' as const,
  title: 'Distribution',
}

const waterfallChart = {
  type: 'waterfall-chart' as const,
  title: 'Cash Flow',
  bars: [{ label: 'Jan', value: 100, type: 'positive' as const }],
}

const paretoChart = {
  type: 'pareto-chart' as const,
  title: 'Top Categories',
}

const calculoCard = {
  type: 'calculo-card' as const,
  title: 'DRE',
  rows: [{ label: 'Revenue', value: 'R$ 500k' }],
}

const dataTable = {
  type: 'data-table' as const,
  title: 'Details',
  columns: [{ key: 'name', label: 'Name' }],
}

const drillDownTable = {
  type: 'drill-down-table' as const,
  title: 'Breakdown',
  columns: [{ key: 'category', label: 'Category' }],
  rows: [{ id: '1', data: { category: 'A' } }],
}

const clickableTable = {
  type: 'clickable-table' as const,
  title: 'Accounts',
  columns: [{ key: 'name', label: 'Name' }],
  rows: [{ id: '1', data: { name: 'Acme' } }],
}

const saldoBanco = {
  type: 'saldo-banco' as const,
  banks: [{ label: 'Itau', value: 'R$ 50k' }],
  total: 'R$ 50k',
}

const manualInput = {
  type: 'manual-input' as const,
}

const uploadSection = {
  type: 'upload-section' as const,
  label: 'Upload CSV',
}

const configTable = {
  type: 'config-table' as const,
  title: 'Settings',
  columns: [{ key: 'name', label: 'Name' }],
  rows: [{ name: 'Item 1' }],
}

const infoBlock = {
  type: 'info-block' as const,
  content: 'Some info text',
}

const chartGrid = {
  type: 'chart-grid' as const,
  items: [barLineChart, donutChart],
}

const allSections = [
  kpiGrid,
  barLineChart,
  donutChart,
  waterfallChart,
  paretoChart,
  calculoCard,
  dataTable,
  drillDownTable,
  clickableTable,
  saldoBanco,
  manualInput,
  uploadSection,
  configTable,
  infoBlock,
  chartGrid,
]

const validScreen = {
  id: 'screen-1',
  title: 'Dashboard',
  periodType: 'mensal' as const,
  filters: [{ key: 'month', label: 'Month' }],
  hasCompareSwitch: false,
  sections: allSections,
}

const validConfig = {
  slug: 'test-client',
  label: 'Test Client',
  screens: [validScreen],
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BlueprintConfigSchema', () => {
  it('accepts a valid BlueprintConfig with all 15 section types', () => {
    const result = BlueprintConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.screens[0].sections).toHaveLength(15)
    }
  })

  it('rejects config missing required slug field', () => {
    const invalid = { label: 'No Slug', screens: [] }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects section with invalid type discriminant', () => {
    const invalid = {
      ...validConfig,
      screens: [
        {
          ...validScreen,
          sections: [{ type: 'nonexistent-section', title: 'Bad' }],
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects KpiGridSection with missing items array', () => {
    const invalid = {
      ...validConfig,
      screens: [
        {
          ...validScreen,
          sections: [{ type: 'kpi-grid' }], // missing items
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('validates ChartGridSection with nested sections recursively (z.lazy)', () => {
    const nested = {
      ...validConfig,
      screens: [
        {
          ...validScreen,
          sections: [
            {
              type: 'chart-grid',
              items: [
                {
                  type: 'chart-grid',
                  items: [{ type: 'donut-chart', title: 'Deep Nested' }],
                },
              ],
            },
          ],
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(nested)
    expect(result.success).toBe(true)
  })

  it('preserves schemaVersion when provided', () => {
    const withVersion = { ...validConfig, schemaVersion: 2 }
    const result = BlueprintConfigSchema.safeParse(withVersion)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.schemaVersion).toBe(2)
    }
  })

  it('defaults schemaVersion to 1 when not provided', () => {
    const result = BlueprintConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.schemaVersion).toBe(1)
    }
  })

  it('rejects BarLineChartSection with invalid chartType enum value', () => {
    const invalid = {
      ...validConfig,
      screens: [
        {
          ...validScreen,
          sections: [
            { type: 'bar-line-chart', title: 'Bad Chart', chartType: 'scatter' },
          ],
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejects BlueprintScreen with missing periodType', () => {
    const invalid = {
      ...validConfig,
      screens: [
        {
          id: 'screen-1',
          title: 'Dashboard',
          filters: [],
          hasCompareSwitch: false,
          sections: [],
          // missing periodType
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('BlueprintSectionSchema', () => {
  it('validates each section type individually', () => {
    for (const section of allSections) {
      const result = BlueprintSectionSchema.safeParse(section)
      expect(result.success, `Section type "${section.type}" should be valid`).toBe(
        true
      )
    }
  })
})

describe('BlueprintScreenSchema', () => {
  it('validates a complete screen', () => {
    const result = BlueprintScreenSchema.safeParse(validScreen)
    expect(result.success).toBe(true)
  })

  it('accepts screen with optional rows field', () => {
    const withRows = {
      ...validScreen,
      rows: [
        {
          id: 'row-1',
          layout: '2',
          sections: [barLineChart, donutChart],
        },
      ],
    }
    const result = BlueprintScreenSchema.safeParse(withRows)
    expect(result.success).toBe(true)
  })
})
