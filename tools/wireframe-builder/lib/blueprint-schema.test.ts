import { describe, it, expect } from 'vitest'
import {
  BlueprintConfigSchema,
  BlueprintScreenSchema,
  BlueprintSectionSchema,
  FilterOptionSchema,
  SidebarConfigSchema,
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
            { type: 'bar-line-chart', title: 'Bad Chart', chartType: 'unknown-type' },
          ],
        },
      ],
    }
    const result = BlueprintConfigSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('accepts BarLineChartSection with extended chartType values', () => {
    const extendedTypes = ['radar', 'treemap', 'funnel', 'scatter', 'area'] as const
    for (const chartType of extendedTypes) {
      const config = {
        ...validConfig,
        screens: [
          {
            ...validScreen,
            sections: [
              { type: 'bar-line-chart', title: 'Extended Chart', chartType },
            ],
          },
        ],
      }
      const result = BlueprintConfigSchema.safeParse(config)
      expect(result.success, `chartType "${chartType}" should be valid`).toBe(true)
    }
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

describe('Phase 17 schema extensions', () => {
  // --- BlueprintConfigSchema new optional fields ---

  it('accepts config with sidebar: {} and header: {} (new optional fields)', () => {
    const config = { ...validConfig, sidebar: {}, header: {} }
    const result = BlueprintConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('accepts config WITHOUT sidebar and header (backward compat)', () => {
    // validConfig has no sidebar/header — must still parse successfully
    const result = BlueprintConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('accepts header: { anyFutureField: "x" } (forward-compat guard — Phase 18 fields must not be rejected)', () => {
    const config = { ...validConfig, header: { anyFutureField: 'x' } }
    const result = BlueprintConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  // --- FilterOptionSchema new filterType discriminator ---

  it('accepts FilterOption with filterType: "select"', () => {
    const option = { key: 'period', label: 'Period', filterType: 'select' }
    const result = FilterOptionSchema.safeParse(option)
    expect(result.success).toBe(true)
  })

  it('accepts FilterOption with filterType: "date-range"', () => {
    const option = { key: 'date', label: 'Date', filterType: 'date-range' }
    const result = FilterOptionSchema.safeParse(option)
    expect(result.success).toBe(true)
  })

  it('accepts FilterOption without filterType (backward compat — undefined should work)', () => {
    const option = { key: 'month', label: 'Month' }
    const result = FilterOptionSchema.safeParse(option)
    expect(result.success).toBe(true)
  })

  it('existing validConfig fixture still passes parse without modification (regression guard)', () => {
    const result = BlueprintConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.slug).toBe('test-client')
    }
  })
})

describe('Phase 18 schema extensions', () => {
  // --- SIDE-03: SidebarConfig accepts groups array ---

  it('SidebarConfigSchema accepts { footer: "v1.0", groups: [{ label: "Financeiro", screenIds: ["screen-1"] }] }', () => {
    const sidebar = {
      footer: 'v1.0',
      groups: [{ label: 'Financeiro', screenIds: ['screen-1'] }],
    }
    const result = SidebarConfigSchema.safeParse(sidebar)
    expect(result.success).toBe(true)
  })

  it('SidebarConfigSchema accepts { groups: [] } (backward compat — empty groups array)', () => {
    const result = SidebarConfigSchema.safeParse({ groups: [] })
    expect(result.success).toBe(true)
  })

  // --- SIDE-05: BlueprintScreen accepts optional badge field ---

  it('BlueprintScreenSchema accepts validScreen with badge: 3 (number badge)', () => {
    const screenWithBadge = { ...validScreen, badge: 3 }
    const result = BlueprintScreenSchema.safeParse(screenWithBadge)
    expect(result.success).toBe(true)
  })

  it('BlueprintScreenSchema accepts validScreen with badge: "NEW" (string badge)', () => {
    const screenWithBadge = { ...validScreen, badge: 'NEW' }
    const result = BlueprintScreenSchema.safeParse(screenWithBadge)
    expect(result.success).toBe(true)
  })

  it('BlueprintScreenSchema accepts validScreen without badge (regression guard — badge is optional)', () => {
    // validScreen has no badge field — must still parse successfully
    const result = BlueprintScreenSchema.safeParse(validScreen)
    expect(result.success).toBe(true)
  })

  // --- HEAD-02/05: HeaderConfigSchema accepts typed optional fields ---

  it('accepts header: { showLogo: true, actions: { manage: true, share: false } } (HEAD-02/05)', () => {
    const config = {
      ...validConfig,
      header: { showLogo: true, actions: { manage: true, share: false } },
    }
    const result = BlueprintConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('accepts header: { anyFutureField: "x" } still passes (forward-compat passthrough guard)', () => {
    // HeaderConfigSchema must keep .passthrough() — Phase 19/20 may add fields
    const config = { ...validConfig, header: { anyFutureField: 'x' } }
    const result = BlueprintConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })
})

describe('Phase 19 — FilterOption all filterType values covered', () => {
  const allTypes = ['select', 'date-range', 'multi-select', 'search', 'toggle'] as const
  for (const filterType of allTypes) {
    it(`accepts filterType: "${filterType}"`, () => {
      const result = FilterOptionSchema.safeParse({ key: 'f', label: 'F', filterType })
      expect(result.success).toBe(true)
    })
  }

  it('backward compat: accepts FilterOption with no filterType (undefined)', () => {
    const result = FilterOptionSchema.safeParse({ key: 'f', label: 'F' })
    expect(result.success).toBe(true)
  })
})
