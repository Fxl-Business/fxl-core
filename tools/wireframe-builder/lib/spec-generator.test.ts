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
