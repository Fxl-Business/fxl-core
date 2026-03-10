import { describe, it, expect } from 'vitest'
import { generateBlueprint } from './generation-engine'
import { BlueprintConfigSchema } from './blueprint-schema'
import { CURRENT_SCHEMA_VERSION } from './blueprint-migrations'
import { VERTICAL_TEMPLATES } from './vertical-templates'
import type { BriefingConfig } from '../types/briefing'

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const financeiroBriefing: BriefingConfig = {
  companyInfo: {
    name: 'Acme Corp',
    segment: 'financeiro',
    size: 'PME',
    description: 'Empresa de consultoria financeira',
  },
  dataSources: [
    { system: 'Conta Azul', exportType: 'CSV', fields: ['receita', 'despesa', 'centro_custo'] },
  ],
  modules: [
    { name: 'DRE Gerencial', kpis: ['Receita Total', 'Despesa Total', 'Resultado'] },
    { name: 'Receita', kpis: ['Receita Recorrente', 'Ticket Medio'] },
    { name: 'Despesas', kpis: ['Custo Fixo', 'Custo Variavel'] },
  ],
  targetAudience: 'Diretor financeiro',
  freeFormNotes: '',
}

const fiveModuleBriefing: BriefingConfig = {
  companyInfo: {
    name: 'Big Five Corp',
    segment: 'financeiro',
    size: 'Medio',
    description: 'Grupo empresarial com 5 unidades',
  },
  dataSources: [
    { system: 'SAP', exportType: 'XLSX', fields: ['receita', 'despesa', 'margem', 'fluxo'] },
  ],
  modules: [
    { name: 'DRE Gerencial', kpis: ['Receita Bruta', 'Lucro Liquido', 'EBITDA'], businessRules: 'DRE simplificado' },
    { name: 'Receita', kpis: ['Receita Total', 'Receita Recorrente', 'Ticket Medio', 'Clientes Ativos'] },
    { name: 'Despesas', kpis: ['Despesa Total', 'Custo Fixo', 'Custo Variavel'] },
    { name: 'Margens', kpis: ['Margem Bruta', 'Margem Operacional', 'Margem Liquida'] },
    { name: 'Fluxo Mensal', kpis: ['Saldo Atual', 'Entradas', 'Saidas', 'Fluxo Liquido'] },
  ],
  targetAudience: 'Diretoria',
  freeFormNotes: 'Precisamos de indicadores de fluxo de caixa detalhados.',
}

const emptyModulesBriefing: BriefingConfig = {
  companyInfo: {
    name: 'Empty Corp',
    segment: 'geral',
    size: 'PME',
  },
  dataSources: [],
  modules: [],
  targetAudience: 'CEO',
  freeFormNotes: '',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateBlueprint', () => {
  it('returns config with 3 screens for a 3-module financeiro briefing', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    expect(config.screens).toHaveLength(3)
  })

  it('starts from financeiro template (10 screens) when vertical=financeiro and merges briefing screens', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp', { vertical: 'financeiro' })
    // financeiro template has 10 screens; 3 briefing modules match existing template screens
    // Result should have at least 10 screens (template base)
    expect(config.screens.length).toBeGreaterThanOrEqual(VERTICAL_TEMPLATES.financeiro.screens.length)
  })

  it('builds screens from scratch using findBestRecipe without vertical', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    // Each module produces one screen
    expect(config.screens).toHaveLength(financeiroBriefing.modules.length)
    // Each screen should have sections from the matched recipe
    for (const screen of config.screens) {
      expect(screen.sections.length).toBeGreaterThan(0)
    }
  })

  it('always sets schemaVersion to CURRENT_SCHEMA_VERSION', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    expect(config.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)

    const configWithVertical = generateBlueprint(financeiroBriefing, 'acme-corp', { vertical: 'financeiro' })
    expect(configWithVertical.schemaVersion).toBe(CURRENT_SCHEMA_VERSION)
  })

  it('sets slug to the provided clientSlug', () => {
    const config = generateBlueprint(financeiroBriefing, 'my-client')
    expect(config.slug).toBe('my-client')
  })

  it('sets label to briefing.companyInfo.name', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    expect(config.label).toBe('Acme Corp')
  })

  it('passes BlueprintConfigSchema.parse() for a realistic 5-module briefing', () => {
    const config = generateBlueprint(fiveModuleBriefing, 'big-five-corp')
    // Should not throw
    const validated = BlueprintConfigSchema.parse(config)
    expect(validated.slug).toBe('big-five-corp')
    expect(validated.screens).toHaveLength(5)
  })

  it('generates kebab-case screen ids from module names', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    const ids = config.screens.map(s => s.id)
    expect(ids).toContain('dre-gerencial')
    expect(ids).toContain('receita')
    expect(ids).toContain('despesas')
  })

  it('produces config with zero screens for empty modules array', () => {
    const config = generateBlueprint(emptyModulesBriefing, 'empty-corp')
    expect(config.screens).toHaveLength(0)
    // Still valid
    const validated = BlueprintConfigSchema.parse(config)
    expect(validated.slug).toBe('empty-corp')
  })

  it('incorporates briefing module KPI names in generated screen KPI labels', () => {
    const config = generateBlueprint(financeiroBriefing, 'acme-corp')
    const dreScreen = config.screens.find(s => s.id === 'dre-gerencial')
    expect(dreScreen).toBeDefined()

    // Find the kpi-grid section
    const kpiGrid = dreScreen!.sections.find(s => s.type === 'kpi-grid')
    expect(kpiGrid).toBeDefined()
    if (kpiGrid && kpiGrid.type === 'kpi-grid') {
      const labels = kpiGrid.items.map(i => i.label)
      // Briefing KPIs for DRE: 'Receita Total', 'Despesa Total', 'Resultado'
      expect(labels).toContain('Receita Total')
      expect(labels).toContain('Despesa Total')
      expect(labels).toContain('Resultado')
    }
  })
})
