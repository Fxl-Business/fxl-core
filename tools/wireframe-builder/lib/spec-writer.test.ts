import { describe, it, expect, afterEach } from 'vitest'
import { writeProductSpec } from './spec-writer'
import { rmSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { BlueprintConfig } from '../types/blueprint'
import type { TechnicalConfig } from '../types/technical'

// ─── Minimal mock configs for unit tests ─────────────────────────────────

const minimalBlueprint = {
  slug: 'test-client',
  label: 'Test Client',
  screens: [
    {
      id: 'screen1',
      title: 'Dashboard',
      periodType: 'mensal' as const,
      filters: [],
      hasCompareSwitch: false,
      sections: [
        {
          type: 'kpi-grid' as const,
          columns: 4,
          items: [{ label: 'KPI', value: 'R$ 100' }],
        },
      ],
    },
  ],
} satisfies BlueprintConfig

const minimalTechnical: TechnicalConfig = {
  slug: 'test-client',
  version: '1.0',
  reportTypes: [
    {
      id: 'contas_a_receber',
      label: 'Contas a Receber',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Valor', targetField: 'valor', dataType: 'currency', format: '1.234,56' },
      ],
    },
  ],
  fields: [
    { id: 'receita_total', label: 'Receita Total', source: 'contas_a_receber', column: 'valor', aggregation: 'SUM' },
  ],
  formulas: [],
  manualInputs: [],
  settings: [],
  classifications: [],
  thresholds: [],
  bindings: [
    {
      sectionType: 'kpi-grid',
      screenId: 'screen1',
      sectionIndex: 0,
      items: [{ fieldOrFormula: 'receita_total' }],
    },
  ],
}

const mismatchedTechnical: TechnicalConfig = {
  ...minimalTechnical,
  slug: 'different-slug',
}

// ─── Temp dir management ─────────────────────────────────────────────────

const tempDirs: string[] = []

function createTempDir(): string {
  const dir = join(tmpdir(), `spec-writer-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true })
    }
  }
  tempDirs.length = 0
})

// ─── Unit tests ──────────────────────────────────────────────────────────

describe('writeProductSpec', () => {
  it('returns success: false with slug-mismatch error for mismatched slugs', () => {
    const outputDir = createTempDir()
    const result = writeProductSpec(minimalBlueprint, mismatchedTechnical, undefined, outputDir)
    expect(result.success).toBe(false)
    expect(result.validation.valid).toBe(false)
    expect(result.validation.errors.some((e) => e.type === 'slug-mismatch')).toBe(true)
    expect(result.files).toHaveLength(0)
  })

  it('returns success: true with 6 files for valid configs', () => {
    const outputDir = createTempDir()
    const result = writeProductSpec(minimalBlueprint, minimalTechnical, undefined, outputDir)
    expect(result.success).toBe(true)
    expect(result.files).toHaveLength(6)
    expect(result.validation.valid).toBe(true)
  })

  it('creates output directory if it does not exist', () => {
    const outputDir = createTempDir()
    expect(existsSync(outputDir)).toBe(false)
    writeProductSpec(minimalBlueprint, minimalTechnical, undefined, outputDir)
    expect(existsSync(outputDir)).toBe(true)
  })

  it('writes 6 files to the output directory', () => {
    const outputDir = createTempDir()
    writeProductSpec(minimalBlueprint, minimalTechnical, undefined, outputDir)
    const files = readdirSync(outputDir)
    expect(files).toHaveLength(6)
    expect(files.sort()).toEqual([
      'branding.md',
      'data-layer.md',
      'database-schema.sql',
      'product-spec.md',
      'screens.md',
      'upload-rules.md',
    ])
  })
})

// ─── Integration test with pilot client configs ──────────────────────────

describe('writeProductSpec integration (pilot client)', () => {
  it('succeeds with real pilot client configs', async () => {
    const blueprint = (await import('@clients/financeiro-conta-azul/wireframe/blueprint.config')).default
    const technical = (await import('@clients/financeiro-conta-azul/wireframe/technical.config')).default
    const branding = (await import('@clients/financeiro-conta-azul/wireframe/branding.config')).default

    const outputDir = createTempDir()
    const result = writeProductSpec(blueprint, technical, branding, outputDir)

    expect(result.success).toBe(true)
    expect(result.files).toHaveLength(6)
  })

  it('produces 6 non-empty files on disk', async () => {
    const blueprint = (await import('@clients/financeiro-conta-azul/wireframe/blueprint.config')).default
    const technical = (await import('@clients/financeiro-conta-azul/wireframe/technical.config')).default
    const branding = (await import('@clients/financeiro-conta-azul/wireframe/branding.config')).default

    const outputDir = createTempDir()
    writeProductSpec(blueprint, technical, branding, outputDir)

    const expectedFiles = [
      'product-spec.md',
      'database-schema.sql',
      'data-layer.md',
      'screens.md',
      'branding.md',
      'upload-rules.md',
    ]

    for (const filename of expectedFiles) {
      const filePath = join(outputDir, filename)
      expect(existsSync(filePath), `${filename} should exist`).toBe(true)
      const content = readFileSync(filePath, 'utf-8')
      expect(content.length, `${filename} should not be empty`).toBeGreaterThan(0)
    }
  })

  it('product-spec.md contains pilot client label', async () => {
    const blueprint = (await import('@clients/financeiro-conta-azul/wireframe/blueprint.config')).default
    const technical = (await import('@clients/financeiro-conta-azul/wireframe/technical.config')).default
    const branding = (await import('@clients/financeiro-conta-azul/wireframe/branding.config')).default

    const outputDir = createTempDir()
    writeProductSpec(blueprint, technical, branding, outputDir)

    const content = readFileSync(join(outputDir, 'product-spec.md'), 'utf-8')
    expect(content).toContain('Financeiro Conta Azul')
  })

  it('database-schema.sql contains contas_a_receber table', async () => {
    const blueprint = (await import('@clients/financeiro-conta-azul/wireframe/blueprint.config')).default
    const technical = (await import('@clients/financeiro-conta-azul/wireframe/technical.config')).default
    const branding = (await import('@clients/financeiro-conta-azul/wireframe/branding.config')).default

    const outputDir = createTempDir()
    writeProductSpec(blueprint, technical, branding, outputDir)

    const content = readFileSync(join(outputDir, 'database-schema.sql'), 'utf-8')
    expect(content).toContain('contas_a_receber')
  })

  it('screens.md contains all 10 pilot client screen titles', async () => {
    const blueprint = (await import('@clients/financeiro-conta-azul/wireframe/blueprint.config')).default
    const technical = (await import('@clients/financeiro-conta-azul/wireframe/technical.config')).default
    const branding = (await import('@clients/financeiro-conta-azul/wireframe/branding.config')).default

    const outputDir = createTempDir()
    writeProductSpec(blueprint, technical, branding, outputDir)

    const content = readFileSync(join(outputDir, 'screens.md'), 'utf-8')

    const screenTitles = [
      'Resultado Mensal (DFC)',
      'Receita',
      'Despesas',
      'Centro de Custo',
      'Margens Reais',
      'Fluxo de Caixa Mensal',
      'Fluxo de Caixa Anual',
      'Indicadores de Desempenho',
      'Upload',
      'Configura',
    ]

    for (const title of screenTitles) {
      expect(content, `screens.md should contain "${title}"`).toContain(title)
    }
  })
})
