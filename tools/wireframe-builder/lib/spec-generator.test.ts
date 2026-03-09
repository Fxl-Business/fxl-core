import { describe, it, expect } from 'vitest'
import { generateProductSpec } from './spec-generator'
import type { GenerationManifest } from '../types/generation'
import type { SpecFile } from './spec-generator'

// ─── Minimal manifest fixture ────────────────────────────────────────────

const minimalManifest: GenerationManifest = {
  meta: {
    clientSlug: 'test-client',
    clientLabel: 'Test Client',
    generatedAt: '2026-01-01',
    schemaVersion: '1.0',
  },
  branding: {
    primaryColor: '#333333',
    secondaryColor: '#666666',
    accentColor: '#0099FF',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    logoUrl: '',
  },
  supabaseSchema: {
    tables: [
      {
        name: 'contas_a_receber',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
          { name: 'data_vencimento', type: 'date', nullable: false },
          { name: 'valor_original', type: 'numeric(14,2)', nullable: false },
          { name: 'descricao', type: 'text', nullable: true },
          { name: 'period_month', type: 'integer', nullable: false },
          { name: 'period_year', type: 'integer', nullable: false },
        ],
        primaryKey: 'id',
      },
    ],
    indexes: [
      { table: 'contas_a_receber', columns: ['period_month', 'period_year'] },
    ],
    rlsPolicies: [
      {
        table: 'contas_a_receber',
        name: 'allow_authenticated_select',
        operation: 'SELECT',
        using: 'auth.role() = \'authenticated\'',
      },
    ],
  },
  screens: [
    {
      id: 'screen1',
      title: 'Dashboard',
      icon: 'bar-chart',
      periodType: 'mensal',
      hasCompareSwitch: false,
      sections: [
        {
          blueprint: {
            type: 'kpi-grid',
            columns: 4,
            items: [
              { label: 'Receita Total', value: 'R$ 45.000,00' },
            ],
          },
          binding: {
            sectionType: 'kpi-grid',
            screenId: 'screen1',
            sectionIndex: 0,
            items: [
              { fieldOrFormula: 'receita_total', threshold: 'th_receita' },
            ],
          },
        },
      ],
    },
  ],
  dataLayer: {
    reportTypes: [
      {
        id: 'contas_a_receber',
        label: 'Contas a Receber',
        periodModel: 'monthly',
        filesPerPeriod: 1,
        columns: [
          { sourceColumn: 'Data Vencimento', targetField: 'data_vencimento', dataType: 'date', format: 'dd/mm/yyyy' },
          { sourceColumn: 'Valor Original', targetField: 'valor_original', dataType: 'currency', format: '1.234,56' },
          { sourceColumn: 'Descricao', targetField: 'descricao', dataType: 'text' },
        ],
      },
    ],
    fields: [
      {
        id: 'receita_total',
        label: 'Receita Total',
        source: 'contas_a_receber',
        column: 'valor_original',
        aggregation: 'SUM',
        filter: 'status = \'pago\'',
      },
    ],
    formulas: [
      {
        id: 'margem_bruta',
        label: 'Margem Bruta',
        expression: 'receita_total - custos_variaveis',
        format: 'currency',
        references: ['receita_total', 'custos_variaveis'],
      },
    ],
    manualInputs: [],
    settings: [],
    classifications: [],
    thresholds: [],
  },
}

// ─── Rich manifest fixture (for content-depth tests) ─────────────────────

const richManifest: GenerationManifest = {
  meta: {
    clientSlug: 'financeiro-test',
    clientLabel: 'Financeiro Test',
    generatedAt: '2026-03-09',
    schemaVersion: '1.0',
  },
  branding: {
    primaryColor: '#1B3A5C',
    secondaryColor: '#4A90D9',
    accentColor: '#F5A623',
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    logoUrl: 'https://example.com/logo.png',
  },
  supabaseSchema: {
    tables: [
      {
        name: 'contas_a_receber',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
          { name: 'data_vencimento', type: 'date', nullable: false },
          { name: 'valor_original', type: 'numeric(14,2)', nullable: false },
          { name: 'period_month', type: 'integer', nullable: false },
          { name: 'period_year', type: 'integer', nullable: false },
        ],
        primaryKey: 'id',
      },
      {
        name: 'contas_a_pagar',
        columns: [
          { name: 'id', type: 'uuid', nullable: false, default: 'gen_random_uuid()' },
          { name: 'fornecedor', type: 'text', nullable: false },
          { name: 'valor', type: 'numeric(14,2)', nullable: false },
          { name: 'period_month', type: 'integer', nullable: false },
          { name: 'period_year', type: 'integer', nullable: false },
        ],
        primaryKey: 'id',
        foreignKeys: [
          { column: 'fornecedor', references: 'fornecedores(id)' },
        ],
      },
    ],
    indexes: [
      { table: 'contas_a_receber', columns: ['period_month', 'period_year'] },
      { table: 'contas_a_pagar', columns: ['period_month', 'period_year'] },
      { table: 'contas_a_pagar', columns: ['fornecedor'], unique: true },
    ],
    rlsPolicies: [
      {
        table: 'contas_a_receber',
        name: 'allow_authenticated_select',
        operation: 'SELECT',
        using: 'auth.role() = \'authenticated\'',
      },
      {
        table: 'contas_a_pagar',
        name: 'allow_authenticated_select',
        operation: 'SELECT',
        using: 'auth.role() = \'authenticated\'',
      },
      {
        table: 'contas_a_pagar',
        name: 'allow_admin_insert',
        operation: 'INSERT',
        withCheck: 'auth.role() = \'admin\'',
      },
    ],
  },
  screens: [
    {
      id: 'visao-geral',
      title: 'Visao Geral',
      icon: 'layout-dashboard',
      periodType: 'mensal',
      hasCompareSwitch: true,
      sections: [
        {
          blueprint: {
            type: 'kpi-grid',
            columns: 4,
            items: [
              { label: 'Receita Total', value: 'R$ 45.000,00' },
              { label: 'Despesas', value: 'R$ 30.000,00' },
            ],
          },
          binding: {
            sectionType: 'kpi-grid',
            screenId: 'visao-geral',
            sectionIndex: 0,
            items: [
              { fieldOrFormula: 'receita_total', threshold: 'th_receita', comparisonTypes: ['mes-anterior'] },
              { fieldOrFormula: 'despesas_total', subExpression: 'SUM(valor)' },
            ],
          },
        },
        {
          blueprint: {
            type: 'bar-line-chart',
            title: 'Receita vs Despesa',
            chartType: 'bar-line',
            height: 300,
            xLabel: 'Mes',
            yLabel: 'R$',
          },
          binding: {
            sectionType: 'bar-line-chart',
            screenId: 'visao-geral',
            sectionIndex: 1,
            dataSource: 'receita_mensal',
            groupBy: 'month',
          },
        },
        {
          blueprint: {
            type: 'data-table',
            title: 'Detalhamento',
            columns: [
              { key: 'desc', label: 'Descricao' },
              { key: 'val', label: 'Valor', align: 'right' },
            ],
            rowCount: 10,
          },
          binding: {
            sectionType: 'data-table',
            screenId: 'visao-geral',
            sectionIndex: 2,
            dataSource: 'contas_a_receber',
            columns: [
              { key: 'desc', fieldOrFormula: 'descricao', format: 'text' },
              { key: 'val', fieldOrFormula: 'valor_original', format: 'currency' },
            ],
          },
        },
      ],
    },
    {
      id: 'upload',
      title: 'Upload',
      icon: 'upload',
      periodType: 'none',
      hasCompareSwitch: false,
      sections: [],
    },
  ],
  dataLayer: {
    reportTypes: [
      {
        id: 'contas_a_receber',
        label: 'Contas a Receber',
        periodModel: 'monthly',
        filesPerPeriod: 1,
        columns: [
          { sourceColumn: 'Data Vencimento', targetField: 'data_vencimento', dataType: 'date', format: 'dd/mm/yyyy' },
          { sourceColumn: 'Valor Original', targetField: 'valor_original', dataType: 'currency', format: '1.234,56' },
          { sourceColumn: 'Descricao', targetField: 'descricao', dataType: 'text' },
        ],
      },
      {
        id: 'contas_a_pagar',
        label: 'Contas a Pagar',
        periodModel: 'monthly',
        filesPerPeriod: 1,
        columns: [
          { sourceColumn: 'Fornecedor', targetField: 'fornecedor', dataType: 'text' },
          { sourceColumn: 'Valor', targetField: 'valor', dataType: 'currency', format: '1.234,56' },
        ],
      },
    ],
    fields: [
      {
        id: 'receita_total',
        label: 'Receita Total',
        source: 'contas_a_receber',
        column: 'valor_original',
        aggregation: 'SUM',
        filter: 'status = \'pago\'',
      },
      {
        id: 'despesas_total',
        label: 'Despesas Total',
        source: 'contas_a_pagar',
        column: 'valor',
        aggregation: 'SUM',
      },
    ],
    formulas: [
      {
        id: 'margem_bruta',
        label: 'Margem Bruta',
        expression: 'receita_total - despesas_total',
        format: 'currency',
        references: ['receita_total', 'despesas_total'],
      },
      {
        id: 'margem_pct',
        label: 'Margem %',
        expression: '(receita_total - despesas_total) / receita_total * 100',
        format: 'percentage',
        references: ['receita_total', 'despesas_total'],
      },
    ],
    manualInputs: [],
    settings: [],
    classifications: [],
    thresholds: [],
  },
}

// ─── Helper ──────────────────────────────────────────────────────────────

function getFile(files: SpecFile[], filename: string): SpecFile {
  const file = files.find((f) => f.filename === filename)
  if (!file) throw new Error(`File ${filename} not found in spec output`)
  return file
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('generateProductSpec', () => {
  it('returns exactly 6 SpecFile objects', () => {
    const result = generateProductSpec(minimalManifest)
    expect(result).toHaveLength(6)
  })

  it('returns correct filenames', () => {
    const result = generateProductSpec(minimalManifest)
    const filenames = result.map((f: SpecFile) => f.filename)
    expect(filenames).toEqual([
      'product-spec.md',
      'database-schema.sql',
      'data-layer.md',
      'screens.md',
      'branding.md',
      'upload-rules.md',
    ])
  })

  it('each SpecFile has non-empty content', () => {
    const result = generateProductSpec(minimalManifest)
    for (const file of result) {
      expect(file.content.length).toBeGreaterThan(0)
    }
  })

  it('product-spec.md contains client label and slug', () => {
    const result = generateProductSpec(minimalManifest)
    const productSpec = result.find((f: SpecFile) => f.filename === 'product-spec.md')!
    expect(productSpec.content).toContain('Test Client')
    expect(productSpec.content).toContain('test-client')
  })

  it('database-schema.sql contains CREATE TABLE for each reportType table', () => {
    const result = generateProductSpec(minimalManifest)
    const dbSchema = result.find((f: SpecFile) => f.filename === 'database-schema.sql')!
    expect(dbSchema.content).toContain('CREATE TABLE contas_a_receber')
  })

  it('branding.md contains --brand-primary CSS variable', () => {
    const result = generateProductSpec(minimalManifest)
    const branding = result.find((f: SpecFile) => f.filename === 'branding.md')!
    expect(branding.content).toContain('--brand-primary')
  })

  it('screens.md contains each screen title', () => {
    const result = generateProductSpec(minimalManifest)
    const screens = result.find((f: SpecFile) => f.filename === 'screens.md')!
    expect(screens.content).toContain('Dashboard')
  })

  it('data-layer.md contains field definitions table', () => {
    const result = generateProductSpec(minimalManifest)
    const dataLayer = result.find((f: SpecFile) => f.filename === 'data-layer.md')!
    expect(dataLayer.content).toContain('receita_total')
    expect(dataLayer.content).toContain('Receita Total')
  })

  it('upload-rules.md contains report type column mappings', () => {
    const result = generateProductSpec(minimalManifest)
    const uploadRules = result.find((f: SpecFile) => f.filename === 'upload-rules.md')!
    expect(uploadRules.content).toContain('contas_a_receber')
    expect(uploadRules.content).toContain('Contas a Receber')
  })
})

// ─── Content-depth tests (rich manifest) ─────────────────────────────────

describe('product-spec.md content depth', () => {
  const files = generateProductSpec(richManifest)
  const spec = getFile(files, 'product-spec.md')

  it('contains Navigation section with screen titles in a table', () => {
    expect(spec.content).toContain('## Navigation')
    expect(spec.content).toContain('Visao Geral')
    expect(spec.content).toContain('Upload')
    expect(spec.content).toContain('| Screen |')
  })

  it('contains Auth Roles section with admin/editor/viewer rows', () => {
    expect(spec.content).toContain('## Auth Roles')
    expect(spec.content).toContain('| admin |')
    expect(spec.content).toContain('| editor |')
    expect(spec.content).toContain('| viewer |')
  })

  it('contains API Endpoints section with GET /api/data', () => {
    expect(spec.content).toContain('## API Endpoints')
    expect(spec.content).toContain('GET')
    expect(spec.content).toContain('/api/data/:screenId')
  })
})

describe('database-schema.sql content depth', () => {
  const files = generateProductSpec(richManifest)
  const sql = getFile(files, 'database-schema.sql')

  it('starts with SQL comment header', () => {
    expect(sql.content).toMatch(/^-- Database Schema/)
  })

  it('contains CREATE TABLE for each manifest table', () => {
    expect(sql.content).toContain('CREATE TABLE contas_a_receber')
    expect(sql.content).toContain('CREATE TABLE contas_a_pagar')
  })

  it('contains CREATE INDEX statements', () => {
    expect(sql.content).toContain('CREATE INDEX idx_contas_a_receber_period_month_period_year')
    expect(sql.content).toContain('CREATE INDEX idx_contas_a_pagar_period_month_period_year')
    expect(sql.content).toContain('CREATE UNIQUE INDEX idx_contas_a_pagar_fornecedor')
  })

  it('contains ENABLE ROW LEVEL SECURITY', () => {
    expect(sql.content).toContain('ENABLE ROW LEVEL SECURITY')
    expect(sql.content).toContain('CREATE POLICY')
  })

  it('contains FOREIGN KEY for contas_a_pagar', () => {
    expect(sql.content).toContain('FOREIGN KEY (fornecedor) REFERENCES fornecedores(id)')
  })
})

describe('screens.md content depth', () => {
  const files = generateProductSpec(richManifest)
  const screens = getFile(files, 'screens.md')

  it('contains Visual Properties for each section', () => {
    expect(screens.content).toContain('**Visual Properties:**')
    // KPI grid visual props
    expect(screens.content).toContain('Columns: 4')
    // Chart visual props
    expect(screens.content).toContain('Chart type: bar-line')
  })

  it('contains Data Binding for bound sections', () => {
    expect(screens.content).toContain('**Data Binding: KPI Grid**')
    expect(screens.content).toContain('**Data Binding: Bar/Line Chart**')
    expect(screens.content).toContain('**Data Binding: Data Table**')
  })

  it('renders KPI items with threshold and comparison', () => {
    expect(screens.content).toContain('receita_total')
    expect(screens.content).toContain('th_receita')
    expect(screens.content).toContain('mes-anterior')
  })

  it('renders chart data source and groupBy', () => {
    expect(screens.content).toContain('receita_mensal')
    expect(screens.content).toContain('month')
  })

  it('renders table columns with format', () => {
    expect(screens.content).toContain('desc')
    expect(screens.content).toContain('descricao')
    expect(screens.content).toContain('currency')
  })

  it('renders screen without sections (Upload)', () => {
    expect(screens.content).toContain('## Upload')
    expect(screens.content).toContain('upload')
  })
})

describe('branding.md content depth', () => {
  const files = generateProductSpec(richManifest)
  const branding = getFile(files, 'branding.md')

  it('contains Google Fonts section', () => {
    expect(branding.content).toContain('## Google Fonts')
    expect(branding.content).toContain('Poppins')
    expect(branding.content).toContain('fonts.googleapis.com')
  })

  it('contains --brand-primary, --brand-secondary, --brand-accent CSS variables', () => {
    expect(branding.content).toContain('--brand-primary: #1B3A5C')
    expect(branding.content).toContain('--brand-secondary: #4A90D9')
    expect(branding.content).toContain('--brand-accent: #F5A623')
  })

  it('contains Tailwind Config section with brand colors', () => {
    expect(branding.content).toContain('## Tailwind Config')
    expect(branding.content).toContain('#1B3A5C')
    expect(branding.content).toContain('tailwind.config.js')
  })

  it('contains logo URL when provided', () => {
    expect(branding.content).toContain('https://example.com/logo.png')
  })
})

describe('upload-rules.md content depth', () => {
  const files = generateProductSpec(richManifest)
  const upload = getFile(files, 'upload-rules.md')

  it('contains column mapping table per report type', () => {
    expect(upload.content).toContain('Contas a Receber')
    expect(upload.content).toContain('Contas a Pagar')
    expect(upload.content).toContain('| Source Column |')
  })

  it('contains BR normalization references', () => {
    expect(upload.content).toContain('parseBRCurrency()')
    expect(upload.content).toContain('parseBRDate()')
  })

  it('contains accepted file formats', () => {
    expect(upload.content).toContain('CSV')
    expect(upload.content).toContain('XLSX')
  })

  it('contains validation rules section', () => {
    expect(upload.content).toContain('## Validation Rules')
    expect(upload.content).toContain('period_month')
    expect(upload.content).toContain('period_year')
  })
})

describe('data-layer.md content depth', () => {
  const files = generateProductSpec(richManifest)
  const dataLayer = getFile(files, 'data-layer.md')

  it('contains Field Definitions table', () => {
    expect(dataLayer.content).toContain('## Field Definitions')
    expect(dataLayer.content).toContain('receita_total')
    expect(dataLayer.content).toContain('despesas_total')
    expect(dataLayer.content).toContain('SUM')
  })

  it('contains Formula Definitions table with references', () => {
    expect(dataLayer.content).toContain('## Formula Definitions')
    expect(dataLayer.content).toContain('margem_bruta')
    expect(dataLayer.content).toContain('margem_pct')
    expect(dataLayer.content).toContain('receita_total - despesas_total')
    expect(dataLayer.content).toContain('receita_total, despesas_total')
  })

  it('contains report types with column mappings', () => {
    expect(dataLayer.content).toContain('## Report Types')
    expect(dataLayer.content).toContain('Contas a Receber')
    expect(dataLayer.content).toContain('data_vencimento')
    expect(dataLayer.content).toContain('valor_original')
  })
})
