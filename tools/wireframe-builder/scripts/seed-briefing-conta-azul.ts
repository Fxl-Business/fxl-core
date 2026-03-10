/**
 * Seed script for financeiro-conta-azul briefing data.
 *
 * Populates the briefing_configs table with the full structured data
 * from the briefing.md document.
 *
 * NOT a Vite module -- uses process.env, not import.meta.env.
 *
 * Usage:
 *   npx tsx --env-file .env.local tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts [--force]
 */

import { createClient } from '@supabase/supabase-js'
import { BriefingConfigSchema } from '../lib/briefing-schema'
import type { BriefingConfig } from '../types/briefing'

// ---------------------------------------------------------------------------
// Supabase client (standalone -- NOT importing @/lib/supabase)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.\n' +
    'Run with: npx tsx --env-file .env.local tools/wireframe-builder/scripts/seed-briefing-conta-azul.ts [--force]'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const forceFlag = process.argv.includes('--force')

// ---------------------------------------------------------------------------
// Briefing data — fully structured from briefing.md
// ---------------------------------------------------------------------------

const CLIENT_SLUG = 'financeiro-conta-azul'

const briefingData: BriefingConfig = {
  companyInfo: {
    name: 'Financeiro Conta Azul',
    segment: 'Financeiro',
    size: 'PME',
    description: 'Dashboard financeiro que le relatorios exportados do Conta Azul e entrega visao consolidada de DRE Gerencial, Fluxo de Caixa, Inadimplencia e Margens por Centro de Custo.',
  },

  productContext: {
    productType: 'BI de Plataforma (Produto FXL)',
    sourceSystem: 'Conta Azul - software de gestao financeira para empresas',
    objective: 'Dashboard financeiro que le os relatorios exportados do Conta Azul e entrega visao consolidada de DRE Gerencial, Fluxo de Caixa, Inadimplencia e Margens por Centro de Custo.',
    approval: 'Interna FXL (produto proprio)',
    corePremise: 'Agnostico de segmento. Os campos Categoria e Centro de Custo presentes nos exports do Conta Azul sao genericos e preenchidos pela propria empresa usuaria.',
  },

  dataSources: [
    {
      system: 'Conta Azul',
      exportType: 'XLSX',
      fields: [
        'Nome do cliente', 'Data competencia', 'Data vencimento',
        'Data ultimo pagamento', 'Valor original (R$)', 'Valor recebido (R$)',
        'Valor em aberto (R$)', 'Categoria 1', 'Centro de Custo 1',
      ],
      fieldMappings: [
        { field: 'Nome do cliente', usage: 'Ranking e filtro por cliente' },
        { field: 'Data de competencia', usage: 'Periodo de referencia' },
        { field: 'Data de vencimento', usage: 'Classificacao de status (pago / a vencer / vencido)' },
        { field: 'Data do ultimo pagamento', usage: 'Confirmacao de recebimento' },
        { field: 'Valor original da parcela (R$)', usage: 'Receita prevista' },
        { field: 'Valor recebido da parcela (R$)', usage: 'Receita recebida' },
        { field: 'Valor da parcela em aberto (R$)', usage: 'Inadimplencia / a vencer' },
        { field: 'Categoria 1', usage: 'Agrupamento de receita (definido pelo usuario)' },
        { field: 'Centro de Custo 1', usage: 'Unidade de negocio (definida pelo usuario)' },
      ],
    },
    {
      system: 'Conta Azul',
      exportType: 'XLSX',
      fields: [
        'Nome fornecedor', 'Data competencia', 'Data vencimento',
        'Data ultimo pagamento', 'Valor original (R$)', 'Valor pago (R$)',
        'Valor em aberto (R$)', 'Categoria 1', 'Centro de Custo 1',
      ],
      fieldMappings: [
        { field: 'Nome do fornecedor', usage: 'Ranking e filtro por fornecedor' },
        { field: 'Data de competencia', usage: 'Periodo de referencia' },
        { field: 'Data de vencimento', usage: 'Classificacao de status (pago / a vencer / vencido)' },
        { field: 'Data do ultimo pagamento', usage: 'Confirmacao de pagamento' },
        { field: 'Valor original da parcela (R$)', usage: 'Despesa prevista' },
        { field: 'Valor pago da parcela (R$)', usage: 'Despesa realizada' },
        { field: 'Valor da parcela em aberto (R$)', usage: 'Passivo em aberto' },
        { field: 'Categoria 1', usage: 'Natureza da despesa (definida pelo usuario)' },
        { field: 'Centro de Custo 1', usage: 'Unidade de negocio (definida pelo usuario)' },
      ],
    },
  ],

  modules: [
    { name: 'Resultado Mensal (DRE)', kpis: ['Receita Total', 'Custos Operacionais Variaveis', 'Margem de Contribuicao', 'Custos Fixos', 'Resultado Operacional', 'Despesas Financeiras', 'Resultado Final / EBITDA'], businessRules: 'Emprestimos fora do escopo v1. Despesas Financeiras = tarifas, IOF, juros, multas. Exibicao por KPI: valor absoluto, % sobre faturamento, comparativo com mes anterior, mesmo mes ano anterior e media anual.' },
    { name: 'Receita', kpis: ['Receita Total Prevista', 'Receita Recebida', 'Receita Vencida', 'Receita a Vencer', '% Recebido sobre total previsto', '% Inadimplencia'], businessRules: 'Ranking por cliente e por categoria. Comparativos mensais e anuais.' },
    { name: 'Despesa', kpis: ['Total Previsto', 'Total Pago', 'Total Vencido', 'Total a Vencer'], businessRules: 'Filtro por grupo de despesa, categoria e centro de custo. Comparativos mensais e por media.' },
    { name: 'Centro de Custo', kpis: ['Receita', 'Custos Variaveis', 'Margem', 'Custos Fixos', 'Resultado Final'], businessRules: 'Resultado por unidade. Comparativo anual e trimestral.' },
    { name: 'Margens', kpis: ['Margem de Contribuicao (R$ e %)', 'Resultado Operacional (R$ e %)', 'Resultado Final / EBITDA (R$ e %)', 'Custos Operacionais Variaveis (% sobre faturamento)', 'Custos Fixos (% sobre faturamento)'], businessRules: 'Visao simplificada de faturamento, custos e margens em % do faturamento. Evolucao mensal e anual.' },
    { name: 'Fluxo Caixa Mensal', kpis: ['Saldo Inicial', 'Receitas Previstas', 'Despesas Previstas', 'Saldo Final Projetado'], businessRules: 'Tabela dia a dia. Saldo inicial do mes inserido manualmente. Saldo inicial de cada dia = saldo final do dia anterior. Semaforizacao: Verde >= R$ 10.000 / Amarelo entre R$ 0 e R$ 10.000 / Vermelho <= R$ 0.' },
    { name: 'Fluxo Caixa Anual', kpis: ['Saldo Inicial', 'Receitas CA', 'Despesas CA', 'Inputs Manuais', 'Saldo Projetado'], businessRules: 'Projecao mensal com inputs manuais ilimitados. Simulacao de cenarios. Identificacao automatica de meses deficitarios.' },
    { name: 'Indicadores', kpis: ['Receita', 'Despesa', 'Margem', 'EBITDA', 'Caixa'], businessRules: 'Paineis com semaforizacao. Comparativos: mes vs anterior, mes vs mesmo mes ano anterior, mes vs media anual, trimestre vs trimestre anterior.' },
    { name: 'Configuracoes', kpis: [], businessRules: 'Cadastro de grupos de despesa (Variavel / Fixo / Financeiro) com vinculacao de categorias. Cadastro de Centros de Custo. Cadastro de bancos (nome + status ativo/inativo) com input manual de saldo.' },
  ],

  targetAudience: 'Qualquer empresa que utilize o Conta Azul como sistema financeiro, independente de segmento ou porte.',

  kpiCategories: [
    {
      category: 'Receita',
      confirmed: ['Receita Total Prevista', 'Receita Recebida', 'Receita Vencida (inadimplencia)', 'Receita a Vencer', '% Recebido sobre total previsto', '% Inadimplencia'],
      suggested: ['Ticket medio por categoria de receita', '% de crescimento mensal da receita', 'Receita por Centro de Custo'],
    },
    {
      category: 'Despesa',
      confirmed: ['Total Previsto', 'Total Pago', 'Total Vencido', 'Total a Vencer'],
    },
    {
      category: 'DRE / Margens',
      confirmed: ['Margem de Contribuicao (R$ e %)', 'Resultado Operacional (R$ e %)', 'Resultado Final / EBITDA (R$ e %)', 'Custos Operacionais Variaveis (% sobre faturamento)', 'Custos Fixos (% sobre faturamento)'],
      blocked: ['CMV (sem campo no export Conta Azul)', 'Margem por cliente (sem cruzamento disponivel)'],
    },
    {
      category: 'Caixa',
      confirmed: ['Saldo inicial (manual)', 'Saldo projetado dia a dia', 'Saldo final projetado', 'Saldo consolidado multi-banco'],
    },
  ],

  statusRules: [
    { condition: 'Valor pago / recebido preenchido', status: 'Pago / Recebido' },
    { condition: 'Nao pago e vencimento > hoje', status: 'A vencer' },
    { condition: 'Nao pago e vencimento <= hoje', status: 'Vencido' },
  ],

  businessRules: [
    { rule: 'Um lancamento pertence a um unico Centro de Custo' },
    { rule: 'A classificacao das categorias como Variavel / Fixo / Financeiro e feita pelo usuario nas Configuracoes' },
    { rule: 'Nao ha controle de acesso ou perfis de usuario nesta versao' },
    { rule: 'Semaforizacao do Fluxo de Caixa com limite fixo de R$ 10.000' },
  ],

  freeFormNotes: 'Formato de importacao: Excel/CSV, manual mensal. API futura prevista, fora do escopo desta versao.',
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // 1. Validate data with Zod
  console.log('Validating briefing data...')
  let validated
  try {
    validated = BriefingConfigSchema.parse(briefingData)
  } catch (err) {
    if (err instanceof Error && 'issues' in err) {
      const zodErr = err as { issues: { path: (string | number)[]; message: string }[] }
      console.error('Briefing validation failed:')
      for (const issue of zodErr.issues) {
        console.error(`  ${issue.path.join('.')}: ${issue.message}`)
      }
    } else {
      console.error('Briefing validation failed:', err)
    }
    process.exit(1)
  }
  console.log('Validation passed.')

  // 2. Check if row already exists
  const { data: existing, error: checkError } = await supabase
    .from('briefing_configs')
    .select('client_slug')
    .eq('client_slug', CLIENT_SLUG)
    .maybeSingle()

  if (checkError) {
    console.error(`Supabase error checking existing briefing: ${checkError.message}`)
    process.exit(1)
  }

  if (existing && !forceFlag) {
    console.error(
      `Briefing already exists for "${CLIENT_SLUG}". Use --force to overwrite.`
    )
    process.exit(1)
  }

  // 3. Upsert to Supabase
  console.log(`${existing ? 'Overwriting' : 'Inserting'} briefing for "${CLIENT_SLUG}"...`)
  const { error: upsertError } = await supabase
    .from('briefing_configs')
    .upsert(
      {
        client_slug: CLIENT_SLUG,
        config: validated,
        updated_by: 'system:seed',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_slug' }
    )

  if (upsertError) {
    console.error(`Supabase error saving briefing: ${upsertError.message}`)
    process.exit(1)
  }

  console.log(
    `Briefing seeded for "${CLIENT_SLUG}": ` +
    `${validated.modules.length} modules, ` +
    `${validated.dataSources.length} data sources, ` +
    `${validated.kpiCategories?.length ?? 0} KPI categories, ` +
    `${validated.statusRules?.length ?? 0} status rules, ` +
    `${validated.businessRules?.length ?? 0} business rules`
  )
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
