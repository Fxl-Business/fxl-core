import type { BlueprintSection, PeriodType, FilterOption } from '../types/blueprint'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecipeSection = {
  type: BlueprintSection['type']
  purpose: string
  defaults: Partial<BlueprintSection>
}

export type ScreenRecipe = {
  id: string
  name: string
  category: 'financeiro' | 'operacional' | 'comercial' | 'geral'
  description: string
  matchKeywords: string[]
  periodType: PeriodType
  hasCompareSwitch: boolean
  suggestedFilters: FilterOption[]
  sections: RecipeSection[]
}

// ---------------------------------------------------------------------------
// SCREEN_RECIPES -- 10 recipes derived from financeiro-conta-azul reference
// ---------------------------------------------------------------------------

export const SCREEN_RECIPES: ScreenRecipe[] = [
  // 1. DRE / Resultado Mensal
  {
    id: 'dre-resultado',
    name: 'Resultado Mensal (DRE)',
    category: 'financeiro',
    description: 'Demonstracao de resultado com KPIs, calculo detalhado, waterfall e drill-down por natureza contabil',
    matchKeywords: ['DRE', 'Resultado', 'Demonstracao', 'Demonstrativo'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
      { key: 'cost-center', label: 'Centro de Custo' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'Resumo de Receita, Despesa e Resultado',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Receita Total', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
            { label: 'Despesa Total', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
            { label: 'Resultado', value: 'R$ 87.200', variation: '+28,7%', variationPositive: true },
            { label: 'Margem Liquida', value: '30,5%', variation: '+4,2pp', variationPositive: true },
          ],
        },
      },
      {
        type: 'calculo-card',
        purpose: 'Detalhamento do calculo DRE passo a passo',
        defaults: {
          type: 'calculo-card',
          title: 'Demonstrativo de Resultado',
          rows: [
            { label: 'Receita Bruta', value: 'R$ 310.000', operator: '(+)' as const },
            { label: 'Deducoes', value: 'R$ 24.600', operator: '(-)' as const },
            { label: 'Receita Liquida', value: 'R$ 285.400', operator: '(=)' as const, highlight: true },
            { label: 'Custos Diretos', value: 'R$ 142.700', operator: '(-)' as const },
            { label: 'Lucro Bruto', value: 'R$ 142.700', operator: '(=)' as const, highlight: true },
            { label: 'Despesas Operacionais', value: 'R$ 55.500', operator: '(-)' as const },
            { label: 'Resultado Operacional', value: 'R$ 87.200', operator: '(=)' as const, highlight: true },
          ],
        },
      },
      {
        type: 'waterfall-chart',
        purpose: 'Visualizacao da composicao receita -> resultado',
        defaults: {
          type: 'waterfall-chart',
          title: 'Composicao do Resultado',
          bars: [
            { label: 'Receita Bruta', value: 310000, type: 'positive' as const },
            { label: 'Deducoes', value: -24600, type: 'negative' as const },
            { label: 'Receita Liquida', value: 285400, type: 'subtotal' as const },
            { label: 'Custos', value: -142700, type: 'negative' as const },
            { label: 'Despesas', value: -55500, type: 'negative' as const },
            { label: 'Resultado', value: 87200, type: 'subtotal' as const },
          ],
        },
      },
      {
        type: 'drill-down-table',
        purpose: 'Detalhamento por natureza contabil com drill-down',
        defaults: {
          type: 'drill-down-table',
          title: 'Detalhamento por Natureza',
          columns: [
            { key: 'natureza', label: 'Natureza' },
            { key: 'realizado', label: 'Realizado', align: 'right' as const },
            { key: 'orcado', label: 'Orcado', align: 'right' as const },
            { key: 'variacao', label: 'Variacao', align: 'right' as const },
          ],
          rows: [],
        },
      },
    ],
  },

  // 2. Revenue Analysis
  {
    id: 'revenue-analysis',
    name: 'Visao por Receita',
    category: 'financeiro',
    description: 'Analise de receita com distribuicao por categoria, evolucao temporal e tabela detalhada',
    matchKeywords: ['Receita', 'Faturamento', 'Vendas'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
      { key: 'category', label: 'Categoria' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'KPIs de receita',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Receita Total', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
            { label: 'Receita Recorrente', value: 'R$ 195.000', variation: '+8,1%', variationPositive: true },
            { label: 'Ticket Medio', value: 'R$ 3.200', variation: '+2,5%', variationPositive: true },
            { label: 'Clientes Ativos', value: '89', variation: '+5', variationPositive: true },
          ],
        },
      },
      {
        type: 'chart-grid',
        purpose: 'Distribuicao (donut) + Evolucao (bar) lado a lado',
        defaults: {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'donut-chart', title: 'Distribuicao por Categoria' } as BlueprintSection,
            { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
          ],
        },
      },
      {
        type: 'clickable-table',
        purpose: 'Top clientes/categorias com link para detalhes',
        defaults: {
          type: 'clickable-table',
          title: 'Top Clientes por Receita',
          columns: [
            { key: 'cliente', label: 'Cliente' },
            { key: 'receita', label: 'Receita', align: 'right' as const },
            { key: 'participacao', label: '%', align: 'right' as const },
          ],
          rows: [],
        },
      },
      {
        type: 'data-table',
        purpose: 'Tabela detalhada de lancamentos',
        defaults: {
          type: 'data-table',
          title: 'Detalhamento de Receitas',
          columns: [
            { key: 'data', label: 'Data' },
            { key: 'descricao', label: 'Descricao' },
            { key: 'categoria', label: 'Categoria' },
            { key: 'valor', label: 'Valor', align: 'right' as const },
          ],
          rowCount: 10,
        },
      },
    ],
  },

  // 3. Expense Analysis
  {
    id: 'expense-analysis',
    name: 'Visao por Despesas',
    category: 'financeiro',
    description: 'Analise de despesas com distribuicao por categoria, evolucao e detalhamento',
    matchKeywords: ['Despesa', 'Custo', 'Gasto'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
      { key: 'category', label: 'Categoria' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'KPIs de despesa',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Despesa Total', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
            { label: 'Custo Fixo', value: 'R$ 85.000', variation: '+2,0%', variationPositive: false },
            { label: 'Custo Variavel', value: 'R$ 113.200', variation: '+7,8%', variationPositive: false },
            { label: '% sobre Receita', value: '69,5%', variation: '-4,2pp', variationPositive: true },
          ],
        },
      },
      {
        type: 'chart-grid',
        purpose: 'Distribuicao (donut) + Evolucao (bar) lado a lado',
        defaults: {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'donut-chart', title: 'Distribuicao por Categoria' } as BlueprintSection,
            { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
          ],
        },
      },
      {
        type: 'data-table',
        purpose: 'Tabela detalhada de despesas',
        defaults: {
          type: 'data-table',
          title: 'Detalhamento de Despesas',
          columns: [
            { key: 'data', label: 'Data' },
            { key: 'descricao', label: 'Descricao' },
            { key: 'categoria', label: 'Categoria' },
            { key: 'valor', label: 'Valor', align: 'right' as const },
          ],
          rowCount: 10,
        },
      },
    ],
  },

  // 4. Cost Center
  {
    id: 'cost-center',
    name: 'Visao por Centro de Custo',
    category: 'financeiro',
    description: 'Analise por centro de custo com distribuicao e comparativo',
    matchKeywords: ['Centro de Custo', 'Departamento'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
      { key: 'cost-center', label: 'Centro de Custo' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'KPIs por centro de custo',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Total Alocado', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
            { label: 'Maior Centro', value: 'Comercial', sub: 'R$ 72.300' },
            { label: 'Centros Ativos', value: '6' },
            { label: 'Variacao Media', value: '+3,2%', variationPositive: false },
          ],
        },
      },
      {
        type: 'chart-grid',
        purpose: 'Distribuicao (bar) + Composicao (donut) lado a lado',
        defaults: {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'bar-line-chart', title: 'Comparativo por Centro', chartType: 'bar' as const } as BlueprintSection,
            { type: 'donut-chart', title: 'Composicao Percentual' } as BlueprintSection,
          ],
        },
      },
      {
        type: 'data-table',
        purpose: 'Tabela detalhada por centro de custo',
        defaults: {
          type: 'data-table',
          title: 'Detalhamento por Centro de Custo',
          columns: [
            { key: 'centro', label: 'Centro de Custo' },
            { key: 'orcado', label: 'Orcado', align: 'right' as const },
            { key: 'realizado', label: 'Realizado', align: 'right' as const },
            { key: 'variacao', label: 'Variacao', align: 'right' as const },
          ],
          rowCount: 8,
        },
      },
    ],
  },

  // 5. Margins
  {
    id: 'margins',
    name: 'Margens',
    category: 'financeiro',
    description: 'Analise de margens bruta, operacional e liquida com evolucao temporal',
    matchKeywords: ['Margem', 'Lucratividade', 'Markup'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'KPIs de margens',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Margem Bruta', value: '50,0%', variation: '+2,1pp', variationPositive: true },
            { label: 'Margem Operacional', value: '30,5%', variation: '+4,2pp', variationPositive: true },
            { label: 'Margem Liquida', value: '25,8%', variation: '+3,0pp', variationPositive: true },
            { label: 'Markup Medio', value: '1,52x', variation: '+0,08', variationPositive: true },
          ],
        },
      },
      {
        type: 'chart-grid',
        purpose: 'Evolucao das margens (bar) + Comparativo (bar)',
        defaults: {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'bar-line-chart', title: 'Evolucao das Margens', chartType: 'bar' as const } as BlueprintSection,
            { type: 'bar-line-chart', title: 'Comparativo Mensal', chartType: 'bar' as const } as BlueprintSection,
          ],
        },
      },
      {
        type: 'data-table',
        purpose: 'Tabela de margens por produto/servico',
        defaults: {
          type: 'data-table',
          title: 'Margens por Produto/Servico',
          columns: [
            { key: 'produto', label: 'Produto/Servico' },
            { key: 'receita', label: 'Receita', align: 'right' as const },
            { key: 'custo', label: 'Custo', align: 'right' as const },
            { key: 'margem', label: 'Margem %', align: 'right' as const },
          ],
          rowCount: 8,
        },
      },
    ],
  },

  // 6. Cash Flow Daily/Monthly
  {
    id: 'cash-flow-daily',
    name: 'Fluxo de Caixa Mensal',
    category: 'financeiro',
    description: 'Fluxo de caixa diario/mensal com saldos bancarios, evolucao e movimentacoes',
    matchKeywords: ['Fluxo Mensal', 'Fluxo de Caixa', 'Caixa Diario'],
    periodType: 'mensal',
    hasCompareSwitch: false,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
      { key: 'bank', label: 'Banco' },
    ],
    sections: [
      {
        type: 'saldo-banco',
        purpose: 'Saldos por banco com total consolidado',
        defaults: {
          type: 'saldo-banco',
          title: 'Saldos Bancarios',
          banks: [
            { label: 'Itau', value: 'R$ 45.200' },
            { label: 'Bradesco', value: 'R$ 32.100' },
            { label: 'Nubank', value: 'R$ 18.700' },
          ],
          total: 'R$ 96.000',
        },
      },
      {
        type: 'kpi-grid',
        purpose: 'KPIs de fluxo de caixa',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Saldo Atual', value: 'R$ 96.000', variation: '+15,2%', variationPositive: true },
            { label: 'Entradas', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
            { label: 'Saidas', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
            { label: 'Fluxo Liquido', value: 'R$ 87.200', variation: '+28,7%', variationPositive: true },
          ],
        },
      },
      {
        type: 'bar-line-chart',
        purpose: 'Evolucao diaria do fluxo de caixa',
        defaults: {
          type: 'bar-line-chart',
          title: 'Fluxo de Caixa Diario',
          chartType: 'bar-line' as const,
        },
      },
      {
        type: 'clickable-table',
        purpose: 'Movimentacoes com link para detalhes',
        defaults: {
          type: 'clickable-table',
          title: 'Movimentacoes Recentes',
          columns: [
            { key: 'data', label: 'Data' },
            { key: 'descricao', label: 'Descricao' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'valor', label: 'Valor', align: 'right' as const },
          ],
          rows: [],
        },
      },
    ],
  },

  // 7. Cash Flow Annual
  {
    id: 'cash-flow-annual',
    name: 'Fluxo de Caixa Anual',
    category: 'financeiro',
    description: 'Fluxo de caixa anual com projecao, input manual e comparativo mensal',
    matchKeywords: ['Fluxo Anual', 'Caixa Anual'],
    periodType: 'anual',
    hasCompareSwitch: false,
    suggestedFilters: [
      { key: 'year', label: 'Ano' },
    ],
    sections: [
      {
        type: 'manual-input',
        purpose: 'Entrada manual de saldo inicial e ajustes',
        defaults: {
          type: 'manual-input',
          title: 'Saldo Inicial e Ajustes',
          initialBalance: 'R$ 50.000',
        },
      },
      {
        type: 'kpi-grid',
        purpose: 'KPIs anuais',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Saldo Projetado', value: 'R$ 180.000', variation: '+22%', variationPositive: true },
            { label: 'Total Entradas', value: 'R$ 3.200.000' },
            { label: 'Total Saidas', value: 'R$ 2.400.000' },
            { label: 'Fluxo Anual', value: 'R$ 800.000' },
          ],
        },
      },
      {
        type: 'chart-grid',
        purpose: 'Evolucao anual (bar) + Projecao (line)',
        defaults: {
          type: 'chart-grid',
          columns: 2,
          items: [
            { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
            { type: 'bar-line-chart', title: 'Projecao de Caixa', chartType: 'line' as const } as BlueprintSection,
          ],
        },
      },
      {
        type: 'clickable-table',
        purpose: 'Detalhamento mensal com link para drill-down',
        defaults: {
          type: 'clickable-table',
          title: 'Resumo por Mes',
          columns: [
            { key: 'mes', label: 'Mes' },
            { key: 'entradas', label: 'Entradas', align: 'right' as const },
            { key: 'saidas', label: 'Saidas', align: 'right' as const },
            { key: 'saldo', label: 'Saldo', align: 'right' as const },
          ],
          rows: [],
        },
      },
    ],
  },

  // 8. KPI Dashboard (generic -- also fallback)
  {
    id: 'kpi-dashboard',
    name: 'Indicadores e KPIs',
    category: 'geral',
    description: 'Dashboard de indicadores com KPIs, pareto e tabela de detalhamento',
    matchKeywords: ['Indicadores', 'KPI', 'Performance'],
    periodType: 'mensal',
    hasCompareSwitch: true,
    suggestedFilters: [
      { key: 'period', label: 'Periodo' },
    ],
    sections: [
      {
        type: 'kpi-grid',
        purpose: 'KPIs principais',
        defaults: {
          type: 'kpi-grid',
          columns: 4,
          items: [
            { label: 'Indicador 1', value: 'R$ 0', variation: '+0%', variationPositive: true },
            { label: 'Indicador 2', value: 'R$ 0', variation: '+0%', variationPositive: true },
            { label: 'Indicador 3', value: '0%' },
            { label: 'Indicador 4', value: '0' },
          ],
        },
      },
      {
        type: 'pareto-chart',
        purpose: 'Analise pareto dos indicadores',
        defaults: {
          type: 'pareto-chart',
          title: 'Analise de Pareto',
        },
      },
      {
        type: 'data-table',
        purpose: 'Tabela de detalhamento',
        defaults: {
          type: 'data-table',
          title: 'Detalhamento',
          columns: [
            { key: 'indicador', label: 'Indicador' },
            { key: 'valor', label: 'Valor', align: 'right' as const },
            { key: 'meta', label: 'Meta', align: 'right' as const },
            { key: 'atingimento', label: '% Ating.', align: 'right' as const },
          ],
          rowCount: 10,
        },
      },
    ],
  },

  // 9. Data Upload
  {
    id: 'data-upload',
    name: 'Upload de Dados',
    category: 'geral',
    description: 'Area de importacao de dados com upload e historico de importacoes',
    matchKeywords: ['Upload', 'Importacao', 'Dados'],
    periodType: 'none',
    hasCompareSwitch: false,
    suggestedFilters: [],
    sections: [
      {
        type: 'upload-section',
        purpose: 'Upload de arquivos de dados',
        defaults: {
          type: 'upload-section',
          label: 'Upload de Dados',
          acceptedFormats: ['.csv', '.xlsx', '.xls'],
          successMessage: 'Arquivo importado com sucesso!',
        },
      },
      {
        type: 'data-table',
        purpose: 'Historico de importacoes',
        defaults: {
          type: 'data-table',
          title: 'Historico de Importacoes',
          columns: [
            { key: 'data', label: 'Data' },
            { key: 'arquivo', label: 'Arquivo' },
            { key: 'registros', label: 'Registros', align: 'right' as const },
            { key: 'status', label: 'Status' },
          ],
          rowCount: 5,
        },
      },
    ],
  },

  // 10. Settings
  {
    id: 'settings',
    name: 'Configuracoes',
    category: 'geral',
    description: 'Tela de configuracoes com tabelas editaveis para categorias, centros de custo e parametros',
    matchKeywords: ['Configuracao', 'Config', 'Setup'],
    periodType: 'none',
    hasCompareSwitch: false,
    suggestedFilters: [],
    sections: [
      {
        type: 'config-table',
        purpose: 'Categorias de receita',
        defaults: {
          type: 'config-table',
          title: 'Categorias de Receita',
          addLabel: 'Adicionar Categoria',
          columns: [
            { key: 'nome', label: 'Nome', type: 'text' as const },
            { key: 'status', label: 'Status', type: 'status' as const },
            { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
          ],
          rows: [{ nome: 'Servicos', status: 'ativo' }],
        },
      },
      {
        type: 'config-table',
        purpose: 'Categorias de despesa',
        defaults: {
          type: 'config-table',
          title: 'Categorias de Despesa',
          addLabel: 'Adicionar Categoria',
          columns: [
            { key: 'nome', label: 'Nome', type: 'text' as const },
            { key: 'status', label: 'Status', type: 'status' as const },
            { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
          ],
          rows: [{ nome: 'Pessoal', status: 'ativo' }],
        },
      },
      {
        type: 'config-table',
        purpose: 'Centros de custo',
        defaults: {
          type: 'config-table',
          title: 'Centros de Custo',
          addLabel: 'Adicionar Centro',
          columns: [
            { key: 'nome', label: 'Nome', type: 'text' as const },
            { key: 'responsavel', label: 'Responsavel', type: 'text' as const },
            { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
          ],
          rows: [{ nome: 'Comercial', responsavel: 'Joao' }],
        },
      },
      {
        type: 'config-table',
        purpose: 'Parametros gerais',
        defaults: {
          type: 'config-table',
          title: 'Parametros Gerais',
          addLabel: 'Adicionar Parametro',
          columns: [
            { key: 'parametro', label: 'Parametro', type: 'text' as const },
            { key: 'valor', label: 'Valor', type: 'text' as const },
            { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
          ],
          rows: [{ parametro: 'Moeda', valor: 'BRL' }],
        },
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// findBestRecipe -- match module name + segment to a recipe
// ---------------------------------------------------------------------------

export function findBestRecipe(moduleName: string, segment: string): ScreenRecipe {
  const nameLC = moduleName.toLowerCase()
  const segmentLC = segment.toLowerCase()

  let bestRecipe: ScreenRecipe | null = null
  let bestScore = 0

  for (const recipe of SCREEN_RECIPES) {
    let score = 0

    // Score by keyword match (case-insensitive, partial match)
    for (const keyword of recipe.matchKeywords) {
      const keywordLC = keyword.toLowerCase()
      if (nameLC.includes(keywordLC) || keywordLC.includes(nameLC)) {
        // Exact keyword match scores higher
        if (nameLC === keywordLC) {
          score += 10
        } else {
          score += 5
        }
      }
    }

    // Bonus for category matching segment
    if (recipe.category === segmentLC) {
      score += 2
    }

    if (score > bestScore) {
      bestScore = score
      bestRecipe = recipe
    }
  }

  // Fallback to kpi-dashboard if no match
  if (!bestRecipe || bestScore === 0) {
    return SCREEN_RECIPES.find(r => r.id === 'kpi-dashboard')!
  }

  return bestRecipe
}
