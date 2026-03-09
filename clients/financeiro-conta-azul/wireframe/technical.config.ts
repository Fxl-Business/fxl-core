import type { TechnicalConfig } from '@tools/wireframe-builder/types/technical'

const config: TechnicalConfig = {
  slug: 'financeiro-conta-azul',
  version: '1.0',

  // ─── Data Layer: Report Types ─────────────────────────────────────────

  reportTypes: [
    {
      id: 'contas-a-receber',
      label: 'Contas a Receber',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Nome do cliente', targetField: 'clientName', dataType: 'text' },
        { sourceColumn: 'Data de competencia', targetField: 'competenceDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data de vencimento', targetField: 'dueDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data do ultimo pagamento', targetField: 'lastPaymentDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Valor original da parcela (R$)', targetField: 'valorOriginal', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor recebido da parcela (R$)', targetField: 'valorRecebido', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor da parcela em aberto (R$)', targetField: 'valorAberto', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Categoria 1', targetField: 'category', dataType: 'text' },
        { sourceColumn: 'Centro de Custo 1', targetField: 'costCenter', dataType: 'text' },
      ],
    },
    {
      id: 'contas-a-pagar',
      label: 'Contas a Pagar',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Nome do fornecedor', targetField: 'supplierName', dataType: 'text' },
        { sourceColumn: 'Data de competencia', targetField: 'competenceDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data de vencimento', targetField: 'dueDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data do ultimo pagamento', targetField: 'lastPaymentDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Valor original da parcela (R$)', targetField: 'valorOriginal', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor pago da parcela (R$)', targetField: 'valorPago', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor da parcela em aberto (R$)', targetField: 'valorAberto', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Categoria 1', targetField: 'category', dataType: 'text' },
        { sourceColumn: 'Centro de Custo 1', targetField: 'costCenter', dataType: 'text' },
      ],
    },
    {
      id: 'extrato-bancario',
      label: 'Extrato Bancario',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Data', targetField: 'transactionDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Descricao', targetField: 'description', dataType: 'text' },
        { sourceColumn: 'Valor', targetField: 'amount', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Banco', targetField: 'bank', dataType: 'text' },
      ],
    },
  ],

  // ─── Data Layer: Fields (Named Aggregations) ──────────────────────────

  fields: [
    // Receita
    { id: 'receita_total', label: 'Receita Total Prevista', source: 'contas-a-receber', column: 'valorOriginal', aggregation: 'SUM' },
    { id: 'receita_recebida', label: 'Receita Recebida', source: 'contas-a-receber', column: 'valorRecebido', aggregation: 'SUM' },
    { id: 'receita_vencida', label: 'Receita Vencida', source: 'contas-a-receber', column: 'valorAberto', aggregation: 'SUM', filter: "vencimento <= hoje AND status != 'pago'" },
    { id: 'receita_a_vencer', label: 'Receita a Vencer', source: 'contas-a-receber', column: 'valorAberto', aggregation: 'SUM', filter: "vencimento > hoje" },

    // Despesa
    { id: 'despesa_total', label: 'Total Previsto Despesas', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM' },
    { id: 'despesa_paga', label: 'Total Pago', source: 'contas-a-pagar', column: 'valorPago', aggregation: 'SUM' },
    { id: 'despesa_vencida', label: 'Despesa Vencida', source: 'contas-a-pagar', column: 'valorAberto', aggregation: 'SUM', filter: "vencimento <= hoje AND status != 'pago'" },
    { id: 'despesa_a_vencer', label: 'Despesa a Vencer', source: 'contas-a-pagar', column: 'valorAberto', aggregation: 'SUM', filter: "vencimento > hoje" },

    // DRE components (by classification)
    { id: 'custos_variaveis', label: 'Custos Operacionais Variaveis', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM', filter: "classificacao = 'variavel'" },
    { id: 'custos_fixos', label: 'Custos Fixos', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM', filter: "classificacao = 'fixo'" },
    { id: 'despesas_financeiras', label: 'Despesas Financeiras', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM', filter: "classificacao = 'financeiro'" },

    // Cash flow
    { id: 'total_entradas', label: 'Total Entradas', source: 'contas-a-receber', column: 'valorRecebido', aggregation: 'SUM' },
    { id: 'total_saidas', label: 'Total Saidas', source: 'contas-a-pagar', column: 'valorPago', aggregation: 'SUM' },

    // Counters
    { id: 'titulos_a_vencer_receita', label: 'Titulos a Vencer (Receita)', source: 'contas-a-receber', column: 'valorAberto', aggregation: 'COUNT', filter: "vencimento > hoje" },
    { id: 'titulos_a_vencer_despesa', label: 'Titulos a Vencer (Despesa)', source: 'contas-a-pagar', column: 'valorAberto', aggregation: 'COUNT', filter: "vencimento > hoje" },

    // By-dimension aggregations (centro de custo)
    { id: 'custo_total_alocado', label: 'Custo Total Alocado', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM' },

    // Performance indicators
    { id: 'ebitda_valor', label: 'EBITDA', source: 'contas-a-receber', column: 'valorOriginal', aggregation: 'SUM' },
    { id: 'ticket_medio', label: 'Ticket Medio', source: 'contas-a-receber', column: 'valorOriginal', aggregation: 'AVG' },
  ],

  // ─── Data Layer: Formulas ─────────────────────────────────────────────

  formulas: [
    // DRE chain
    {
      id: 'margem_contribuicao',
      label: 'Margem de Contribuicao',
      expression: 'receita_total - custos_variaveis',
      format: 'currency',
      references: ['receita_total', 'custos_variaveis'],
    },
    {
      id: 'margem_contribuicao_pct',
      label: 'Margem de Contribuicao %',
      expression: 'margem_contribuicao / receita_total * 100',
      format: 'percentage',
      references: ['margem_contribuicao', 'receita_total'],
    },
    {
      id: 'resultado_operacional',
      label: 'Resultado Operacional',
      expression: 'margem_contribuicao - custos_fixos',
      format: 'currency',
      references: ['margem_contribuicao', 'custos_fixos'],
    },
    {
      id: 'resultado_operacional_pct',
      label: 'Resultado Operacional %',
      expression: 'resultado_operacional / receita_total * 100',
      format: 'percentage',
      references: ['resultado_operacional', 'receita_total'],
    },
    {
      id: 'resultado_final',
      label: 'Resultado Final',
      expression: 'resultado_operacional - despesas_financeiras',
      format: 'currency',
      references: ['resultado_operacional', 'despesas_financeiras'],
    },
    {
      id: 'resultado_final_pct',
      label: 'Resultado Final %',
      expression: 'resultado_final / receita_total * 100',
      format: 'percentage',
      references: ['resultado_final', 'receita_total'],
    },

    // Ratios
    {
      id: 'pct_recebido',
      label: '% Recebido sobre Previsto',
      expression: 'receita_recebida / receita_total * 100',
      format: 'percentage',
      references: ['receita_recebida', 'receita_total'],
    },
    {
      id: 'pct_inadimplencia',
      label: '% Inadimplencia',
      expression: 'receita_vencida / receita_total * 100',
      format: 'percentage',
      references: ['receita_vencida', 'receita_total'],
    },
    {
      id: 'pct_despesa_paga',
      label: '% Despesa Paga',
      expression: 'despesa_paga / despesa_total * 100',
      format: 'percentage',
      references: ['despesa_paga', 'despesa_total'],
    },
    {
      id: 'pct_despesa_vencida',
      label: '% Despesa Vencida',
      expression: 'despesa_vencida / despesa_total * 100',
      format: 'percentage',
      references: ['despesa_vencida', 'despesa_total'],
    },

    // Cash flow
    {
      id: 'saldo_periodo',
      label: 'Saldo do Periodo',
      expression: 'total_entradas - total_saidas',
      format: 'currency',
      references: ['total_entradas', 'total_saidas'],
    },
    {
      id: 'saldo_final_projetado',
      label: 'Saldo Final Projetado',
      expression: 'saldo_inicial_caixa + total_entradas - total_saidas',
      format: 'currency',
      references: ['total_entradas', 'total_saidas'],
    },

    // Centro de custo
    {
      id: 'resultado_consolidado_cc',
      label: 'Resultado Consolidado por CC',
      expression: 'receita_total - custo_total_alocado',
      format: 'currency',
      references: ['receita_total', 'custo_total_alocado'],
    },
    {
      id: 'margem_cc_pct',
      label: 'Margem por CC %',
      expression: 'resultado_consolidado_cc / receita_total * 100',
      format: 'percentage',
      references: ['resultado_consolidado_cc', 'receita_total'],
    },

    // Annual
    {
      id: 'saldo_liquido_anual',
      label: 'Saldo Liquido Anual',
      expression: 'total_entradas - total_saidas',
      format: 'currency',
      references: ['total_entradas', 'total_saidas'],
    },
  ],

  // ─── Input Layer: Manual Inputs ───────────────────────────────────────

  manualInputs: [
    {
      id: 'saldo_inicial_caixa',
      label: 'Saldo Inicial do Mes',
      dataType: 'currency',
      frequency: 'per-month',
      targetScreen: 'fluxo-de-caixa-mensal',
    },
    {
      id: 'ajuste_manual_fluxo',
      label: 'Ajustes Manuais no Fluxo',
      dataType: 'currency',
      frequency: 'per-month',
      targetScreen: 'fluxo-de-caixa-mensal',
    },
    {
      id: 'simulacao_cenarios',
      label: 'Simulacao de Cenarios',
      dataType: 'currency',
      frequency: 'per-month',
      targetScreen: 'fluxo-de-caixa-anual-projetado',
    },
  ],

  // ─── Input Layer: Settings Tables ─────────────────────────────────────

  settings: [
    {
      id: 'categorias-financeiras',
      label: 'Categorias Financeiras',
      columns: [
        { key: 'nome', label: 'Categoria', type: 'text' },
        { key: 'grupo', label: 'Grupo', type: 'badge' },
        { key: 'tipo', label: 'Tipo', type: 'badge' },
        { key: 'conta', label: 'Conta Contabil', type: 'text' },
        { key: 'ativo', label: 'Ativo', type: 'status' },
        { key: 'acoes', label: 'Acoes', type: 'actions' },
      ],
      defaultRows: [
        { nome: 'Consultoria Tecnica', grupo: 'Receita Operacional', tipo: 'Variavel', conta: '3.1.01', ativo: 'Sim' },
        { nome: 'Projetos de Implantacao', grupo: 'Receita Operacional', tipo: 'Variavel', conta: '3.1.02', ativo: 'Sim' },
        { nome: 'Licencas de Software', grupo: 'Receita Recorrente', tipo: 'Fixo', conta: '3.1.03', ativo: 'Sim' },
        { nome: 'Mao de Obra Variavel', grupo: 'Custo Variavel', tipo: 'Variavel', conta: '4.1.01', ativo: 'Sim' },
        { nome: 'Folha de Pagamento', grupo: 'Custo Fixo', tipo: 'Fixo', conta: '4.2.01', ativo: 'Sim' },
        { nome: 'Aluguel', grupo: 'Custo Fixo', tipo: 'Fixo', conta: '4.2.02', ativo: 'Sim' },
        { nome: 'Juros Bancarios', grupo: 'Financeiro', tipo: 'Variavel', conta: '5.1.01', ativo: 'Sim' },
        { nome: 'Tarifas Bancarias', grupo: 'Financeiro', tipo: 'Fixo', conta: '5.1.02', ativo: 'Nao' },
      ],
    },
    {
      id: 'contas-bancarias',
      label: 'Contas Bancarias',
      columns: [
        { key: 'banco', label: 'Banco', type: 'text' },
        { key: 'agencia', label: 'Agencia', type: 'text' },
        { key: 'conta', label: 'Conta', type: 'text' },
        { key: 'tipo', label: 'Tipo', type: 'badge' },
        { key: 'saldo', label: 'Saldo Ref.', type: 'text' },
        { key: 'ativo', label: 'Ativo', type: 'status' },
        { key: 'acoes', label: 'Acoes', type: 'actions' },
      ],
      defaultRows: [
        { banco: 'Itau', agencia: '0001', conta: '12345-6', tipo: 'Corrente', saldo: 'R$ 198.450', ativo: 'Sim' },
        { banco: 'Bradesco', agencia: '1234', conta: '98765-4', tipo: 'Corrente', saldo: 'R$ 87.320', ativo: 'Sim' },
        { banco: 'Santander', agencia: '0567', conta: '11223-3', tipo: 'Corrente', saldo: 'R$ 24.800', ativo: 'Sim' },
        { banco: 'Nubank', agencia: '-', conta: '44556-7', tipo: 'Corrente', saldo: 'R$ 14.518', ativo: 'Sim' },
      ],
    },
    {
      id: 'centros-custo',
      label: 'Centros de Custo',
      columns: [
        { key: 'nome', label: 'Centro de Custo', type: 'text' },
        { key: 'codigo', label: 'Codigo', type: 'text' },
        { key: 'resp', label: 'Responsavel', type: 'text' },
        { key: 'ativo', label: 'Ativo', type: 'status' },
        { key: 'acoes', label: 'Acoes', type: 'actions' },
      ],
      defaultRows: [
        { nome: 'Unidade Sao Paulo', codigo: 'CC-SP', resp: 'Ana Lima', ativo: 'Sim' },
        { nome: 'Unidade Rio de Janeiro', codigo: 'CC-RJ', resp: 'Carlos Melo', ativo: 'Sim' },
        { nome: 'Unidade Belo Horizonte', codigo: 'CC-BH', resp: 'Julia Reis', ativo: 'Sim' },
        { nome: 'Corporativo', codigo: 'CC-00', resp: 'Diego Souza', ativo: 'Sim' },
      ],
    },
    {
      id: 'metas-semaforos',
      label: 'Metas e Semaforos',
      columns: [
        { key: 'indicador', label: 'Indicador', type: 'text' },
        { key: 'semVerde', label: 'Semaforo Verde', type: 'text' },
        { key: 'semAmarelo', label: 'Semaforo Amarelo', type: 'text' },
        { key: 'semVerm', label: 'Semaforo Vermelho', type: 'text' },
        { key: 'acoes', label: 'Acoes', type: 'actions' },
      ],
      defaultRows: [
        { indicador: 'Margem de Contribuicao', semVerde: '>= 40%', semAmarelo: '30%-39%', semVerm: '< 30%' },
        { indicador: 'Resultado Operacional', semVerde: '>= 15%', semAmarelo: '10%-14%', semVerm: '< 10%' },
        { indicador: 'Resultado Final / EBITDA', semVerde: '>= 10%', semAmarelo: '5%-9%', semVerm: '< 5%' },
        { indicador: 'Inadimplencia', semVerde: '<= 5%', semAmarelo: '5%-10%', semVerm: '> 10%' },
        { indicador: 'Liquidez Corrente', semVerde: '>= 1.5', semAmarelo: '1.0-1.49', semVerm: '< 1.0' },
        { indicador: 'Divida / EBITDA', semVerde: '<= 1.5', semAmarelo: '1.5-2.5', semVerm: '> 2.5' },
      ],
    },
  ],

  // ─── Business Rules: Classifications ──────────────────────────────────

  classifications: [
    {
      id: 'tipo-despesa',
      label: 'Classificacao de Despesas',
      categories: [
        { value: 'variavel', label: 'Variavel' },
        { value: 'fixo', label: 'Fixo' },
        { value: 'financeiro', label: 'Financeiro' },
      ],
      defaultMappings: {
        'Folha Variavel': 'variavel',
        'Insumos': 'variavel',
        'Comissoes': 'variavel',
        'Compra de Mercadoria': 'variavel',
        'Custos com Frota': 'variavel',
        'Custos com Impostos': 'variavel',
        'Custos Operacionais': 'variavel',
        'Administrativo': 'fixo',
        'Operacional': 'fixo',
        'Ocupacao': 'fixo',
        'Recursos Humanos': 'fixo',
        'Despesas Administrativas': 'fixo',
        'Imovel': 'fixo',
        'Despesas com Diretoria': 'fixo',
        'Despesas Comerciais e Marketing': 'fixo',
        'Folha de Pagamento': 'fixo',
        'Aluguel': 'fixo',
        'Juros bancarios': 'financeiro',
        'Tarifas e IOF': 'financeiro',
        'Multas e juros mora': 'financeiro',
        'Tarifas Bancarias': 'financeiro',
      },
    },
  ],

  // ─── Business Rules: Thresholds ───────────────────────────────────────

  thresholds: [
    {
      id: 'semafor-caixa',
      label: 'Semaforizacao do Fluxo de Caixa',
      metric: 'saldo_final_projetado',
      levels: {
        verde: { operator: '>=', value: 10000 },
        amarelo: { operator: '>=', value: 0, upperOperator: '<', upperValue: 10000 },
        vermelho: { operator: '<', value: 0 },
      },
    },
    {
      id: 'semafor-margem-contrib',
      label: 'Semaforizacao Margem de Contribuicao',
      metric: 'margem_contribuicao_pct',
      levels: {
        verde: { operator: '>=', value: 40 },
        amarelo: { operator: '>=', value: 30, upperOperator: '<', upperValue: 40 },
        vermelho: { operator: '<', value: 30 },
      },
    },
    {
      id: 'semafor-resultado-op',
      label: 'Semaforizacao Resultado Operacional',
      metric: 'resultado_operacional_pct',
      levels: {
        verde: { operator: '>=', value: 15 },
        amarelo: { operator: '>=', value: 10, upperOperator: '<', upperValue: 15 },
        vermelho: { operator: '<', value: 10 },
      },
    },
    {
      id: 'semafor-resultado-final',
      label: 'Semaforizacao Resultado Final',
      metric: 'resultado_final_pct',
      levels: {
        verde: { operator: '>=', value: 10 },
        amarelo: { operator: '>=', value: 5, upperOperator: '<', upperValue: 10 },
        vermelho: { operator: '<', value: 5 },
      },
    },
    {
      id: 'semafor-inadimplencia',
      label: 'Semaforizacao Inadimplencia',
      metric: 'pct_inadimplencia',
      levels: {
        verde: { operator: '<=', value: 5 },
        amarelo: { operator: '>', value: 5, upperOperator: '<=', upperValue: 10 },
        vermelho: { operator: '>', value: 10 },
      },
    },
  ],

  // ─── Section Bindings ─────────────────────────────────────────────────

  bindings: [
    // ─── Screen 1: resultado-mensal-dfc ─────────────────────────────────

    // [0] kpi-grid: 4 KPIs -- Receita, MC, RO, RF
    {
      sectionType: 'kpi-grid',
      screenId: 'resultado-mensal-dfc',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'receita_total', comparisonTypes: ['mes-anterior', 'mesmo-mes-ano-anterior'] },
        { fieldOrFormula: 'margem_contribuicao', subExpression: 'margem_contribuicao_pct', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_operacional', subExpression: 'resultado_operacional_pct', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_final', subExpression: 'resultado_final_pct', comparisonTypes: ['mes-anterior'] },
      ],
    },

    // [1] calculo-card: DRE breakdown
    {
      sectionType: 'calculo-card',
      screenId: 'resultado-mensal-dfc',
      sectionIndex: 1,
      rows: [
        { fieldOrFormula: 'receita_total' },
        { fieldOrFormula: 'custos_variaveis', operator: '(-)' },
        { fieldOrFormula: 'margem_contribuicao', operator: '(=)', highlight: true },
        { fieldOrFormula: 'custos_fixos', operator: '(-)' },
        { fieldOrFormula: 'resultado_operacional', operator: '(=)', highlight: true },
        { fieldOrFormula: 'despesas_financeiras', operator: '(-)' },
        { fieldOrFormula: 'resultado_final', operator: '(=)', highlight: true },
      ],
    },

    // [2] waterfall-chart: DRE waterfall
    {
      sectionType: 'waterfall-chart',
      screenId: 'resultado-mensal-dfc',
      sectionIndex: 2,
      dataSource: 'resultado_final',
      groupBy: 'dre-components',
    },

    // [3] drill-down-table: DFC Gerencial
    {
      sectionType: 'drill-down-table',
      screenId: 'resultado-mensal-dfc',
      sectionIndex: 3,
      dataSource: 'contas-a-pagar',
      columns: [
        { key: 'linha', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'atual', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'pct', fieldOrFormula: 'margem_contribuicao_pct', format: 'percentage' },
      ],
      drillDownBy: 'classification',
    },

    // ─── Screen 2: visao-por-receita ────────────────────────────────────

    // [0] kpi-grid: Receita Prevista, Recebida, a Vencer, Vencida
    {
      sectionType: 'kpi-grid',
      screenId: 'visao-por-receita',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'receita_total', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'receita_recebida', subExpression: 'pct_recebido' },
        { fieldOrFormula: 'receita_a_vencer' },
        { fieldOrFormula: 'receita_vencida', subExpression: 'pct_inadimplencia', threshold: 'semafor-inadimplencia' },
      ],
    },

    // [1] chart-grid: 2 charts (donut + bar)
    {
      sectionType: 'chart-grid',
      screenId: 'visao-por-receita',
      sectionIndex: 1,
      items: [
        { sectionType: 'donut-chart', screenId: 'visao-por-receita', sectionIndex: 1, dataSource: 'receita_total', groupBy: 'status' },
        { sectionType: 'bar-line-chart', screenId: 'visao-por-receita', sectionIndex: 1, dataSource: 'receita_total', groupBy: 'category' },
      ],
    },

    // [2] bar-line-chart: Receita por Status comparativo
    {
      sectionType: 'bar-line-chart',
      screenId: 'visao-por-receita',
      sectionIndex: 2,
      dataSource: 'receita_total',
      groupBy: 'status',
    },

    // [3] data-table: Top Clientes
    {
      sectionType: 'data-table',
      screenId: 'visao-por-receita',
      sectionIndex: 3,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'rank', fieldOrFormula: 'receita_total', format: 'number' },
        { key: 'cliente', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'prevista', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'recebida', fieldOrFormula: 'receita_recebida', format: 'currency' },
        { key: 'aberto', fieldOrFormula: 'receita_a_vencer', format: 'currency' },
        { key: 'status', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'pct', fieldOrFormula: 'pct_recebido', format: 'percentage' },
      ],
    },

    // [4] data-table: Receita por Categoria
    {
      sectionType: 'data-table',
      screenId: 'visao-por-receita',
      sectionIndex: 4,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'categoria', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'atual', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'pct', fieldOrFormula: 'pct_recebido', format: 'percentage' },
      ],
    },

    // ─── Screen 3: visao-por-despesas ───────────────────────────────────

    // [0] kpi-grid: Despesa Prevista, Pagas, a Vencer, Vencidas
    {
      sectionType: 'kpi-grid',
      screenId: 'visao-por-despesas',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'despesa_total' },
        { fieldOrFormula: 'despesa_paga', subExpression: 'pct_despesa_paga' },
        { fieldOrFormula: 'despesa_a_vencer' },
        { fieldOrFormula: 'despesa_vencida', subExpression: 'pct_despesa_vencida', threshold: 'semafor-inadimplencia' },
      ],
    },

    // [1] chart-grid: donut + bar
    {
      sectionType: 'chart-grid',
      screenId: 'visao-por-despesas',
      sectionIndex: 1,
      items: [
        { sectionType: 'donut-chart', screenId: 'visao-por-despesas', sectionIndex: 1, dataSource: 'despesa_total', groupBy: 'classification' },
        { sectionType: 'bar-line-chart', screenId: 'visao-por-despesas', sectionIndex: 1, dataSource: 'despesa_total', groupBy: 'classification' },
      ],
    },

    // [2] bar-line-chart: Despesa por Status comparativo
    {
      sectionType: 'bar-line-chart',
      screenId: 'visao-por-despesas',
      sectionIndex: 2,
      dataSource: 'despesa_total',
      groupBy: 'status',
    },

    // [3] data-table: Analise por Categoria
    {
      sectionType: 'data-table',
      screenId: 'visao-por-despesas',
      sectionIndex: 3,
      dataSource: 'contas-a-pagar',
      columns: [
        { key: 'categoria', fieldOrFormula: 'despesa_total', format: 'text' },
        { key: 'grupo', fieldOrFormula: 'despesa_total', format: 'text' },
        { key: 'tipo', fieldOrFormula: 'despesa_total', format: 'text' },
        { key: 'atual', fieldOrFormula: 'despesa_total', format: 'currency' },
        { key: 'pctRec', fieldOrFormula: 'pct_despesa_paga', format: 'percentage' },
      ],
    },

    // ─── Screen 4: visao-por-centro-de-custo ────────────────────────────

    // [0] kpi-grid: Receita CC, Custo CC, Resultado CC
    {
      sectionType: 'kpi-grid',
      screenId: 'visao-por-centro-de-custo',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'receita_total', comparisonTypes: ['mesmo-mes-ano-anterior'] },
        { fieldOrFormula: 'custo_total_alocado' },
        { fieldOrFormula: 'resultado_consolidado_cc', subExpression: 'margem_cc_pct', threshold: 'semafor-resultado-op' },
      ],
    },

    // [1] chart-grid: bar + donut
    {
      sectionType: 'chart-grid',
      screenId: 'visao-por-centro-de-custo',
      sectionIndex: 1,
      items: [
        { sectionType: 'bar-line-chart', screenId: 'visao-por-centro-de-custo', sectionIndex: 1, dataSource: 'resultado_consolidado_cc', groupBy: 'costCenter' },
        { sectionType: 'donut-chart', screenId: 'visao-por-centro-de-custo', sectionIndex: 1, dataSource: 'receita_total', groupBy: 'costCenter' },
      ],
    },

    // [2] clickable-table: DRE por Centro de Custo
    {
      sectionType: 'clickable-table',
      screenId: 'visao-por-centro-de-custo',
      sectionIndex: 2,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'cc', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'receita', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'cv', fieldOrFormula: 'custos_variaveis', format: 'currency' },
        { key: 'mc', fieldOrFormula: 'margem_contribuicao', format: 'currency' },
        { key: 'pctMc', fieldOrFormula: 'margem_contribuicao_pct', format: 'percentage' },
        { key: 'cf', fieldOrFormula: 'custos_fixos', format: 'currency' },
        { key: 'ro', fieldOrFormula: 'resultado_operacional', format: 'currency' },
        { key: 'pctRo', fieldOrFormula: 'resultado_operacional_pct', format: 'percentage' },
        { key: 'df', fieldOrFormula: 'despesas_financeiras', format: 'currency' },
        { key: 'rf', fieldOrFormula: 'resultado_final', format: 'currency' },
        { key: 'partic', fieldOrFormula: 'receita_total', format: 'percentage' },
      ],
      drillDownBy: 'costCenter',
    },

    // ─── Screen 5: margens-reais-da-operacao ────────────────────────────

    // [0] kpi-grid: MC%, RO%, RF%
    {
      sectionType: 'kpi-grid',
      screenId: 'margens-reais-da-operacao',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'margem_contribuicao_pct', threshold: 'semafor-margem-contrib', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_operacional_pct', threshold: 'semafor-resultado-op', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_final_pct', threshold: 'semafor-resultado-final', comparisonTypes: ['mes-anterior'] },
      ],
    },

    // [1] bar-line-chart: Composicao do Resultado
    {
      sectionType: 'bar-line-chart',
      screenId: 'margens-reais-da-operacao',
      sectionIndex: 1,
      dataSource: 'resultado_final_pct',
      groupBy: 'dre-components-pct',
    },

    // [2] bar-line-chart: Margens comparativo
    {
      sectionType: 'bar-line-chart',
      screenId: 'margens-reais-da-operacao',
      sectionIndex: 2,
      dataSource: 'margem_contribuicao_pct',
    },

    // ─── Screen 6: fluxo-de-caixa-mensal ────────────────────────────────

    // [0] kpi-grid: Saldo Inicial, Entradas, Saidas, Saldo Final
    {
      sectionType: 'kpi-grid',
      screenId: 'fluxo-de-caixa-mensal',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'total_entradas' },
        { fieldOrFormula: 'total_entradas' },
        { fieldOrFormula: 'total_saidas' },
        { fieldOrFormula: 'saldo_final_projetado', threshold: 'semafor-caixa' },
      ],
    },

    // [1] bar-line-chart: Entradas x Saidas x Saldo diario
    {
      sectionType: 'bar-line-chart',
      screenId: 'fluxo-de-caixa-mensal',
      sectionIndex: 1,
      dataSource: 'saldo_final_projetado',
      groupBy: 'day',
    },

    // [2] saldo-banco
    {
      sectionType: 'saldo-banco',
      screenId: 'fluxo-de-caixa-mensal',
      sectionIndex: 2,
      settingsTable: 'contas-bancarias',
    },

    // [3] clickable-table: Fluxo Previsto x Realizado
    {
      sectionType: 'clickable-table',
      screenId: 'fluxo-de-caixa-mensal',
      sectionIndex: 3,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'descricao', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'previsto', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'realizado', fieldOrFormula: 'receita_recebida', format: 'currency' },
        { key: 'diferenca', fieldOrFormula: 'saldo_periodo', format: 'currency' },
        { key: 'status', fieldOrFormula: 'pct_recebido', format: 'percentage' },
      ],
    },

    // [4] manual-input: Ajustes Manuais
    {
      sectionType: 'manual-input',
      screenId: 'fluxo-de-caixa-mensal',
      sectionIndex: 4,
      inputs: ['saldo_inicial_caixa', 'ajuste_manual_fluxo'],
    },

    // ─── Screen 7: fluxo-de-caixa-anual-projetado ──────────────────────

    // [0] kpi-grid: Entradas anuais, Saidas anuais, Saldo Liquido, Saldo Final
    {
      sectionType: 'kpi-grid',
      screenId: 'fluxo-de-caixa-anual-projetado',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'total_entradas', comparisonTypes: ['mesmo-mes-ano-anterior'] },
        { fieldOrFormula: 'total_saidas' },
        { fieldOrFormula: 'saldo_liquido_anual', comparisonTypes: ['mesmo-mes-ano-anterior'] },
        { fieldOrFormula: 'saldo_final_projetado', threshold: 'semafor-caixa' },
      ],
    },

    // [1] bar-line-chart: Entradas x Saidas x Saldo Acumulado mensal
    {
      sectionType: 'bar-line-chart',
      screenId: 'fluxo-de-caixa-anual-projetado',
      sectionIndex: 1,
      dataSource: 'saldo_liquido_anual',
      groupBy: 'month',
    },

    // [2] clickable-table: Projecao Mensal Detalhada
    {
      sectionType: 'clickable-table',
      screenId: 'fluxo-de-caixa-anual-projetado',
      sectionIndex: 2,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'linha', fieldOrFormula: 'total_entradas', format: 'text' },
        { key: 'jan', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'fev', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'mar', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'abr', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'mai', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'jun', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'jul', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'ago', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'set', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'out', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'nov', fieldOrFormula: 'total_entradas', format: 'currency' },
        { key: 'dez', fieldOrFormula: 'total_entradas', format: 'currency' },
      ],
    },

    // [3] manual-input: Simulacao de Cenarios
    {
      sectionType: 'manual-input',
      screenId: 'fluxo-de-caixa-anual-projetado',
      sectionIndex: 3,
      inputs: ['simulacao_cenarios'],
    },

    // ─── Screen 8: indicadores-de-desempenho ────────────────────────────

    // [0] kpi-grid: Liquidez (4 items)
    {
      sectionType: 'kpi-grid',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'receita_total', threshold: 'semafor-caixa' },
        { fieldOrFormula: 'receita_total', threshold: 'semafor-caixa' },
        { fieldOrFormula: 'receita_total', threshold: 'semafor-caixa' },
        { fieldOrFormula: 'receita_total', threshold: 'semafor-caixa' },
      ],
    },

    // [1] kpi-grid: Rentabilidade (4 items)
    {
      sectionType: 'kpi-grid',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 1,
      items: [
        { fieldOrFormula: 'resultado_final_pct', threshold: 'semafor-resultado-final' },
        { fieldOrFormula: 'ebitda_valor' },
        { fieldOrFormula: 'ticket_medio', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'receita_total' },
      ],
    },

    // [2] kpi-grid: Endividamento & Cobertura (3 items)
    {
      sectionType: 'kpi-grid',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 2,
      items: [
        { fieldOrFormula: 'despesas_financeiras' },
        { fieldOrFormula: 'resultado_operacional' },
        { fieldOrFormula: 'pct_inadimplencia', threshold: 'semafor-inadimplencia' },
      ],
    },

    // [3] bar-line-chart: KPIs comparativo
    {
      sectionType: 'bar-line-chart',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 3,
      dataSource: 'resultado_final',
    },

    // [4] pareto-chart: Principais Categorias de Despesa
    {
      sectionType: 'pareto-chart',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 4,
      dataSource: 'despesa_total',
      groupBy: 'category',
    },

    // [5] data-table: Painel de KPIs Resumo
    {
      sectionType: 'data-table',
      screenId: 'indicadores-de-desempenho',
      sectionIndex: 5,
      dataSource: 'contas-a-receber',
      columns: [
        { key: 'indicador', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'valor', fieldOrFormula: 'receita_total', format: 'currency' },
        { key: 'meta', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'status', fieldOrFormula: 'receita_total', format: 'text' },
        { key: 'tendencia', fieldOrFormula: 'receita_total', format: 'text' },
      ],
    },

    // ─── Screen 9: upload-de-relatorios ─────────────────────────────────

    // [0] info-block: instructions (static content -- no data binding)
    {
      sectionType: 'info-block',
      screenId: 'upload-de-relatorios',
      sectionIndex: 0,
    },

    // [1] upload-section: Contas a Receber
    {
      sectionType: 'upload-section',
      screenId: 'upload-de-relatorios',
      sectionIndex: 1,
      reportType: 'contas-a-receber',
      acceptedFormats: ['XLS', 'XLSX', 'CSV'],
    },

    // [2] upload-section: Contas a Pagar
    {
      sectionType: 'upload-section',
      screenId: 'upload-de-relatorios',
      sectionIndex: 2,
      reportType: 'contas-a-pagar',
      acceptedFormats: ['XLS', 'XLSX', 'CSV'],
    },

    // [3] upload-section: Extrato Bancario
    {
      sectionType: 'upload-section',
      screenId: 'upload-de-relatorios',
      sectionIndex: 3,
      reportType: 'extrato-bancario',
      acceptedFormats: ['XLS', 'XLSX', 'OFX', 'CSV'],
    },

    // ─── Screen 10: configuracoes ───────────────────────────────────────

    // [0] config-table: Categorias Financeiras
    {
      sectionType: 'config-table',
      screenId: 'configuracoes',
      sectionIndex: 0,
      settingsTable: 'categorias-financeiras',
    },

    // [1] config-table: Contas Bancarias
    {
      sectionType: 'config-table',
      screenId: 'configuracoes',
      sectionIndex: 1,
      settingsTable: 'contas-bancarias',
    },

    // [2] config-table: Centros de Custo
    {
      sectionType: 'config-table',
      screenId: 'configuracoes',
      sectionIndex: 2,
      settingsTable: 'centros-custo',
    },

    // [3] config-table: Metas e Semaforos
    {
      sectionType: 'config-table',
      screenId: 'configuracoes',
      sectionIndex: 3,
      settingsTable: 'metas-semaforos',
    },
  ],
}

export default config
