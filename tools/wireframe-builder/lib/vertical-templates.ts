import type { BlueprintConfig, BlueprintScreen, BlueprintSection } from '../types/blueprint'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VerticalId = 'financeiro' | 'varejo' | 'servicos'

// ---------------------------------------------------------------------------
// Helper: common filters
// ---------------------------------------------------------------------------

const periodFilter = { key: 'period', label: 'Periodo' }

// ---------------------------------------------------------------------------
// FINANCEIRO template (10 screens -- high quality, reference-grade)
// ---------------------------------------------------------------------------

const financeiroScreens: BlueprintScreen[] = [
  // 1. Resultado Mensal (DRE)
  {
    id: 'resultado-mensal',
    title: 'Resultado Mensal',
    icon: 'TrendingUp',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'cost-center', label: 'Centro de Custo' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Receita Total', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
          { label: 'Despesa Total', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
          { label: 'Resultado', value: 'R$ 87.200', variation: '+28,7%', variationPositive: true },
          { label: 'Margem Liquida', value: '30,5%', variation: '+4,2pp', variationPositive: true },
        ],
      },
      {
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
      {
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
      {
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
    ],
  },

  // 2. Receita
  {
    id: 'receita',
    title: 'Visao por Receita',
    icon: 'DollarSign',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'category', label: 'Categoria' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Receita Total', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
          { label: 'Receita Recorrente', value: 'R$ 195.000', variation: '+8,1%', variationPositive: true },
          { label: 'Ticket Medio', value: 'R$ 3.200', variation: '+2,5%', variationPositive: true },
          { label: 'Clientes Ativos', value: '89', variation: '+5', variationPositive: true },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'donut-chart', title: 'Distribuicao por Categoria' } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
        ],
      },
      {
        type: 'clickable-table',
        title: 'Top Clientes por Receita',
        columns: [
          { key: 'cliente', label: 'Cliente' },
          { key: 'receita', label: 'Receita', align: 'right' as const },
          { key: 'participacao', label: '%', align: 'right' as const },
        ],
        rows: [],
      },
      {
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
    ],
  },

  // 3. Despesas
  {
    id: 'despesas',
    title: 'Visao por Despesas',
    icon: 'Receipt',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'category', label: 'Categoria' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Despesa Total', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
          { label: 'Custo Fixo', value: 'R$ 85.000', variation: '+2,0%', variationPositive: false },
          { label: 'Custo Variavel', value: 'R$ 113.200', variation: '+7,8%', variationPositive: false },
          { label: '% sobre Receita', value: '69,5%', variation: '-4,2pp', variationPositive: true },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'donut-chart', title: 'Distribuicao por Categoria' } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
        ],
      },
      {
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
    ],
  },

  // 4. Centro de Custo
  {
    id: 'centro-custo',
    title: 'Visao por Centro de Custo',
    icon: 'Building',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'cost-center', label: 'Centro de Custo' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Total Alocado', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
          { label: 'Maior Centro', value: 'Comercial', sub: 'R$ 72.300' },
          { label: 'Centros Ativos', value: '6' },
          { label: 'Variacao Media', value: '+3,2%' },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'bar-line-chart', title: 'Comparativo por Centro', chartType: 'bar' as const } as BlueprintSection,
          { type: 'donut-chart', title: 'Composicao Percentual' } as BlueprintSection,
        ],
      },
      {
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
    ],
  },

  // 5. Margens
  {
    id: 'margens',
    title: 'Margens',
    icon: 'Percent',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Margem Bruta', value: '50,0%', variation: '+2,1pp', variationPositive: true },
          { label: 'Margem Operacional', value: '30,5%', variation: '+4,2pp', variationPositive: true },
          { label: 'Margem Liquida', value: '25,8%', variation: '+3,0pp', variationPositive: true },
          { label: 'Markup Medio', value: '1,52x', variation: '+0,08', variationPositive: true },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'bar-line-chart', title: 'Evolucao das Margens', chartType: 'bar' as const } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Comparativo Mensal', chartType: 'bar' as const } as BlueprintSection,
        ],
      },
      {
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
    ],
  },

  // 6. Fluxo Mensal
  {
    id: 'fluxo-mensal',
    title: 'Fluxo de Caixa Mensal',
    icon: 'Wallet',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'bank', label: 'Banco' }],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'saldo-banco',
        title: 'Saldos Bancarios',
        banks: [
          { label: 'Itau', value: 'R$ 45.200' },
          { label: 'Bradesco', value: 'R$ 32.100' },
          { label: 'Nubank', value: 'R$ 18.700' },
        ],
        total: 'R$ 96.000',
      },
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Saldo Atual', value: 'R$ 96.000', variation: '+15,2%', variationPositive: true },
          { label: 'Entradas', value: 'R$ 285.400', variation: '+12,3%', variationPositive: true },
          { label: 'Saidas', value: 'R$ 198.200', variation: '+5,1%', variationPositive: false },
          { label: 'Fluxo Liquido', value: 'R$ 87.200', variation: '+28,7%', variationPositive: true },
        ],
      },
      {
        type: 'bar-line-chart',
        title: 'Fluxo de Caixa Diario',
        chartType: 'bar-line' as const,
      },
      {
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
    ],
  },

  // 7. Fluxo Anual
  {
    id: 'fluxo-anual',
    title: 'Fluxo de Caixa Anual',
    icon: 'Calendar',
    periodType: 'anual',
    filters: [{ key: 'year', label: 'Ano' }],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'manual-input',
        title: 'Saldo Inicial e Ajustes',
        initialBalance: 'R$ 50.000',
      },
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Saldo Projetado', value: 'R$ 180.000', variation: '+22%', variationPositive: true },
          { label: 'Total Entradas', value: 'R$ 3.200.000' },
          { label: 'Total Saidas', value: 'R$ 2.400.000' },
          { label: 'Fluxo Anual', value: 'R$ 800.000' },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Projecao de Caixa', chartType: 'line' as const } as BlueprintSection,
        ],
      },
      {
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
    ],
  },

  // 8. Indicadores
  {
    id: 'indicadores',
    title: 'Indicadores',
    icon: 'BarChart',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'ROI', value: '24,5%', variation: '+3,2pp', variationPositive: true },
          { label: 'EBITDA', value: 'R$ 95.000', variation: '+18%', variationPositive: true },
          { label: 'Liquidez Corrente', value: '1,85', variation: '+0,12', variationPositive: true },
          { label: 'Endividamento', value: '32%', variation: '-2pp', variationPositive: true },
        ],
      },
      {
        type: 'pareto-chart',
        title: 'Analise de Pareto - Indicadores',
      },
      {
        type: 'data-table',
        title: 'Detalhamento de Indicadores',
        columns: [
          { key: 'indicador', label: 'Indicador' },
          { key: 'valor', label: 'Valor', align: 'right' as const },
          { key: 'meta', label: 'Meta', align: 'right' as const },
          { key: 'atingimento', label: '% Ating.', align: 'right' as const },
        ],
        rowCount: 10,
      },
    ],
  },

  // 9. Upload
  {
    id: 'upload',
    title: 'Upload de Dados',
    icon: 'Upload',
    periodType: 'none',
    filters: [],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'upload-section',
        label: 'Upload de Dados',
        acceptedFormats: ['.csv', '.xlsx', '.xls'],
        successMessage: 'Arquivo importado com sucesso!',
      },
      {
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
    ],
  },

  // 10. Configuracoes
  {
    id: 'configuracoes',
    title: 'Configuracoes',
    icon: 'Settings',
    periodType: 'none',
    filters: [],
    hasCompareSwitch: false,
    sections: [
      {
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
      {
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
      {
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
      {
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
    ],
  },
]

// ---------------------------------------------------------------------------
// VAREJO template (5 screens -- medium quality, retail-focused)
// ---------------------------------------------------------------------------

const varejoScreens: BlueprintScreen[] = [
  // 1. Visao Geral
  {
    id: 'visao-geral',
    title: 'Visao Geral',
    icon: 'LayoutDashboard',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'store', label: 'Loja' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Faturamento', value: 'R$ 420.000', variation: '+8,5%', variationPositive: true },
          { label: 'Ticket Medio', value: 'R$ 85', variation: '+3,2%', variationPositive: true },
          { label: 'Volume de Vendas', value: '4.941', variation: '+5,1%', variationPositive: true },
          { label: 'Conversao', value: '12,3%', variation: '+1,1pp', variationPositive: true },
        ],
      },
      {
        type: 'stat-card',
        title: 'Meta do Mes',
        value: 'R$ 500.000',
        subtitle: '84% atingido',
        trend: { value: '+8,5%', positive: true },
      },
      {
        type: 'bar-line-chart',
        title: 'Faturamento x Meta',
        chartType: 'bar-line' as const,
      },
    ],
  },

  // 2. Vendas
  {
    id: 'vendas',
    title: 'Vendas',
    icon: 'ShoppingCart',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'category', label: 'Categoria' }],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Total Vendas', value: 'R$ 420.000', variation: '+8,5%', variationPositive: true },
          { label: 'Vendas Online', value: 'R$ 126.000', variation: '+22%', variationPositive: true },
          { label: 'Vendas Loja', value: 'R$ 294.000', variation: '+3,8%', variationPositive: true },
          { label: 'Devolucoes', value: 'R$ 8.400', variation: '-12%', variationPositive: true },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'donut-chart', title: 'Vendas por Canal' } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Evolucao Mensal', chartType: 'bar' as const } as BlueprintSection,
        ],
      },
      {
        type: 'data-table',
        title: 'Vendas por Categoria',
        columns: [
          { key: 'categoria', label: 'Categoria' },
          { key: 'quantidade', label: 'Qtd', align: 'right' as const },
          { key: 'valor', label: 'Valor', align: 'right' as const },
          { key: 'participacao', label: '%', align: 'right' as const },
        ],
        rowCount: 10,
      },
    ],
  },

  // 3. Estoque
  {
    id: 'estoque',
    title: 'Estoque',
    icon: 'Package',
    periodType: 'none',
    filters: [{ key: 'category', label: 'Categoria' }],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Total em Estoque', value: 'R$ 850.000' },
          { label: 'SKUs Ativos', value: '1.240' },
          { label: 'Giro Medio', value: '4,2x' },
          { label: 'Ruptura', value: '3,1%', variationPositive: false },
        ],
      },
      {
        type: 'progress-bar',
        title: 'Niveis de Estoque por Categoria',
        items: [
          { label: 'Eletronicos', value: 85, max: 100 },
          { label: 'Vestuario', value: 62, max: 100 },
          { label: 'Alimentos', value: 45, max: 100 },
          { label: 'Casa & Decoracao', value: 78, max: 100 },
        ],
      },
      {
        type: 'data-table',
        title: 'Produtos com Baixo Estoque',
        columns: [
          { key: 'produto', label: 'Produto' },
          { key: 'estoque', label: 'Estoque', align: 'right' as const },
          { key: 'minimo', label: 'Minimo', align: 'right' as const },
          { key: 'status', label: 'Status' },
        ],
        rowCount: 10,
      },
    ],
  },

  // 4. Indicadores
  {
    id: 'indicadores',
    title: 'Indicadores',
    icon: 'BarChart',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Margem Bruta', value: '35,2%', variation: '+1,5pp', variationPositive: true },
          { label: 'CMV', value: 'R$ 272.000', variation: '+6,2%', variationPositive: false },
          { label: 'LTV Cliente', value: 'R$ 1.200', variation: '+8%', variationPositive: true },
          { label: 'CAC', value: 'R$ 45', variation: '-12%', variationPositive: true },
        ],
      },
      {
        type: 'pareto-chart',
        title: 'Top Produtos por Faturamento',
      },
      {
        type: 'data-table',
        title: 'Indicadores de Performance',
        columns: [
          { key: 'indicador', label: 'Indicador' },
          { key: 'valor', label: 'Valor', align: 'right' as const },
          { key: 'meta', label: 'Meta', align: 'right' as const },
          { key: 'atingimento', label: '% Ating.', align: 'right' as const },
        ],
        rowCount: 8,
      },
    ],
  },

  // 5. Configuracoes
  {
    id: 'configuracoes',
    title: 'Configuracoes',
    icon: 'Settings',
    periodType: 'none',
    filters: [],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'config-table',
        title: 'Categorias de Produto',
        addLabel: 'Adicionar Categoria',
        columns: [
          { key: 'nome', label: 'Nome', type: 'text' as const },
          { key: 'status', label: 'Status', type: 'status' as const },
          { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
        ],
        rows: [{ nome: 'Eletronicos', status: 'ativo' }],
      },
      {
        type: 'config-table',
        title: 'Lojas',
        addLabel: 'Adicionar Loja',
        columns: [
          { key: 'nome', label: 'Nome', type: 'text' as const },
          { key: 'cidade', label: 'Cidade', type: 'text' as const },
          { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
        ],
        rows: [{ nome: 'Loja Centro', cidade: 'Sao Paulo' }],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// SERVICOS template (5 screens -- medium quality, services-focused)
// ---------------------------------------------------------------------------

const servicosScreens: BlueprintScreen[] = [
  // 1. Visao Geral
  {
    id: 'visao-geral',
    title: 'Visao Geral',
    icon: 'LayoutDashboard',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Receita', value: 'R$ 180.000', variation: '+15%', variationPositive: true },
          { label: 'Projetos Ativos', value: '12', variation: '+3', variationPositive: true },
          { label: 'Satisfacao', value: '4,7/5', variation: '+0,2', variationPositive: true },
          { label: 'Taxa de Retencao', value: '92%', variation: '+3pp', variationPositive: true },
        ],
      },
      {
        type: 'stat-card',
        title: 'Pipeline',
        value: 'R$ 450.000',
        subtitle: '8 propostas ativas',
        trend: { value: '+22%', positive: true },
      },
      {
        type: 'bar-line-chart',
        title: 'Receita Mensal',
        chartType: 'bar-line' as const,
      },
    ],
  },

  // 2. Projetos
  {
    id: 'projetos',
    title: 'Projetos',
    icon: 'FolderKanban',
    periodType: 'mensal',
    filters: [periodFilter, { key: 'status', label: 'Status' }],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Projetos Ativos', value: '12' },
          { label: 'Em Andamento', value: '8' },
          { label: 'Concluidos (mes)', value: '4' },
          { label: 'Horas Alocadas', value: '1.280h' },
        ],
      },
      {
        type: 'progress-bar',
        title: 'Progresso dos Projetos',
        items: [
          { label: 'Projeto Alpha', value: 85, max: 100 },
          { label: 'Projeto Beta', value: 60, max: 100 },
          { label: 'Projeto Gamma', value: 35, max: 100 },
          { label: 'Projeto Delta', value: 92, max: 100 },
        ],
      },
      {
        type: 'data-table',
        title: 'Lista de Projetos',
        columns: [
          { key: 'projeto', label: 'Projeto' },
          { key: 'cliente', label: 'Cliente' },
          { key: 'valor', label: 'Valor', align: 'right' as const },
          { key: 'status', label: 'Status' },
        ],
        rowCount: 10,
      },
    ],
  },

  // 3. Financeiro
  {
    id: 'financeiro',
    title: 'Financeiro',
    icon: 'DollarSign',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'Receita', value: 'R$ 180.000', variation: '+15%', variationPositive: true },
          { label: 'Custos', value: 'R$ 108.000', variation: '+8%', variationPositive: false },
          { label: 'Margem', value: '40%', variation: '+4pp', variationPositive: true },
          { label: 'A Receber', value: 'R$ 65.000' },
        ],
      },
      {
        type: 'chart-grid',
        columns: 2,
        items: [
          { type: 'donut-chart', title: 'Receita por Tipo de Servico' } as BlueprintSection,
          { type: 'bar-line-chart', title: 'Receita vs Custos', chartType: 'bar' as const } as BlueprintSection,
        ],
      },
      {
        type: 'data-table',
        title: 'Faturamento por Projeto',
        columns: [
          { key: 'projeto', label: 'Projeto' },
          { key: 'receita', label: 'Receita', align: 'right' as const },
          { key: 'custo', label: 'Custo', align: 'right' as const },
          { key: 'margem', label: 'Margem', align: 'right' as const },
        ],
        rowCount: 8,
      },
    ],
  },

  // 4. Indicadores
  {
    id: 'indicadores',
    title: 'Indicadores',
    icon: 'BarChart',
    periodType: 'mensal',
    filters: [periodFilter],
    hasCompareSwitch: true,
    sections: [
      {
        type: 'kpi-grid',
        columns: 4,
        items: [
          { label: 'NPS', value: '72', variation: '+8', variationPositive: true },
          { label: 'Churn Rate', value: '2,1%', variation: '-0,5pp', variationPositive: true },
          { label: 'Utilizacao', value: '78%', variation: '+5pp', variationPositive: true },
          { label: 'Prazo Medio', value: '45 dias', variation: '-3 dias', variationPositive: true },
        ],
      },
      {
        type: 'pareto-chart',
        title: 'Receita por Cliente',
      },
      {
        type: 'data-table',
        title: 'Indicadores de Performance',
        columns: [
          { key: 'indicador', label: 'Indicador' },
          { key: 'valor', label: 'Valor', align: 'right' as const },
          { key: 'meta', label: 'Meta', align: 'right' as const },
          { key: 'atingimento', label: '% Ating.', align: 'right' as const },
        ],
        rowCount: 8,
      },
    ],
  },

  // 5. Configuracoes
  {
    id: 'configuracoes',
    title: 'Configuracoes',
    icon: 'Settings',
    periodType: 'none',
    filters: [],
    hasCompareSwitch: false,
    sections: [
      {
        type: 'config-table',
        title: 'Tipos de Servico',
        addLabel: 'Adicionar Tipo',
        columns: [
          { key: 'nome', label: 'Nome', type: 'text' as const },
          { key: 'status', label: 'Status', type: 'status' as const },
          { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
        ],
        rows: [{ nome: 'Consultoria', status: 'ativo' }],
      },
      {
        type: 'config-table',
        title: 'Equipes',
        addLabel: 'Adicionar Equipe',
        columns: [
          { key: 'nome', label: 'Nome', type: 'text' as const },
          { key: 'membros', label: 'Membros', type: 'text' as const },
          { key: 'acoes', label: 'Acoes', type: 'actions' as const, width: '100px' },
        ],
        rows: [{ nome: 'Equipe A', membros: '5' }],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// VERTICAL_TEMPLATES
// ---------------------------------------------------------------------------

export const VERTICAL_TEMPLATES: Record<VerticalId, BlueprintConfig> = {
  financeiro: {
    slug: 'template-financeiro',
    label: 'Template Financeiro',
    schemaVersion: 1,
    screens: financeiroScreens,
  },
  varejo: {
    slug: 'template-varejo',
    label: 'Template Varejo',
    schemaVersion: 1,
    screens: varejoScreens,
  },
  servicos: {
    slug: 'template-servicos',
    label: 'Template Servicos',
    schemaVersion: 1,
    screens: servicosScreens,
  },
}
