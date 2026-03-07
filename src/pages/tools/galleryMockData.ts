import type { WaterfallBar } from '@tools/wireframe-builder/components/WaterfallChart'
import type { ClickColumn, ClickRow } from '@tools/wireframe-builder/components/ClickableTable'
import type { DrilColumn, DrilRow } from '@tools/wireframe-builder/components/DrillDownTable'
import type { ConfigColumn, ConfigRow } from '@tools/wireframe-builder/components/ConfigTable'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'
import type { CalculoRow } from '@tools/wireframe-builder/components/CalculoCard'

// KpiCard
export const kpiCardMock = {
  label: 'Faturamento Bruto',
  value: 'R$ 1.250.000',
  variation: '+12,5%',
  variationPositive: true,
  description: 'Acumulado no período',
}

// KpiCardFull
export const kpiCardFullMock = {
  label: 'Receita Líquida',
  value: 'R$ 980.000',
  sub: '78,4% do faturamento',
  variation: '+8,2%',
  variationPositive: true,
  semaforo: 'verde' as const,
  semaforoLabel: 'Dentro da meta',
  sparkline: [42, 55, 61, 48, 70, 65, 74, 80, 68, 85, 90, 78],
  compareMode: true,
}

// BarLineChart
export const barLineChartMock = {
  title: 'Receita por Mês',
  type: 'bar' as const,
}

// WaterfallChart
export const waterfallChartMock = {
  title: 'Resultado do Mês',
  bars: [
    { label: 'Receita', value: 150000, type: 'positive' },
    { label: 'Impostos', value: -22000, type: 'negative' },
    { label: 'Rec. Líquida', value: 128000, type: 'subtotal' },
    { label: 'Custos', value: -45000, type: 'negative' },
    { label: 'Despesas', value: -38000, type: 'negative' },
    { label: 'Resultado', value: 45000, type: 'subtotal' },
  ] as WaterfallBar[],
}

// DonutChart
export const donutChartMock = {
  title: 'Distribuição de Despesas',
  data: [
    { label: 'Pessoal', value: 45000, pct: '38%' },
    { label: 'Operacional', value: 28000, pct: '24%' },
    { label: 'Administrativo', value: 18000, pct: '15%' },
    { label: 'Comercial', value: 15000, pct: '13%' },
    { label: 'Outros', value: 12000, pct: '10%' },
  ],
  centerValue: 'R$ 118k',
  centerLabel: 'Total',
}

// ParetoChart
export const paretoChartMock = {
  title: 'Concentração de Despesas',
  data: [
    { label: 'Salários', value: 45000 },
    { label: 'Aluguel', value: 18000 },
    { label: 'Marketing', value: 15000 },
    { label: 'Software', value: 12000 },
    { label: 'Energia', value: 8000 },
    { label: 'Telecom', value: 5000 },
    { label: 'Outros', value: 3000 },
  ],
  valueLabel: 'Valor (R$)',
}

// DataTable
export const dataTableMock = {
  title: 'Receita por Categoria',
  columns: [
    { key: 'categoria', label: 'Categoria' },
    { key: 'valor', label: 'Valor (R$)', align: 'right' as const },
    { key: 'pct', label: '% Total', align: 'right' as const },
    { key: 'var', label: 'Var. %', align: 'right' as const },
  ],
  rowCount: 5,
}

// DrillDownTable
export const drillDownTableMock = {
  title: 'DRE — Resultado Mensal',
  subtitle: 'Clique para expandir',
  columns: [
    { key: 'conta', label: 'Conta' },
    { key: 'realizado', label: 'Realizado', align: 'right' as const },
    { key: 'pct', label: '% Receita', align: 'right' as const },
  ] as DrilColumn[],
  rows: [
    {
      id: '1', data: { conta: 'Receita Bruta', realizado: 'R$ 150.000', pct: '100%' },
      children: [
        { id: '1.1', data: { conta: 'Vendas', realizado: 'R$ 120.000', pct: '80%' } },
        { id: '1.2', data: { conta: 'Serviços', realizado: 'R$ 30.000', pct: '20%' } },
      ],
    },
    {
      id: '2', data: { conta: 'Deduções', realizado: '(R$ 22.000)', pct: '14,7%' },
      children: [
        { id: '2.1', data: { conta: 'Impostos', realizado: '(R$ 18.000)', pct: '12%' } },
        { id: '2.2', data: { conta: 'Devoluções', realizado: '(R$ 4.000)', pct: '2,7%' } },
      ],
    },
    { id: '3', data: { conta: 'Receita Líquida', realizado: 'R$ 128.000', pct: '85,3%' }, isTotal: true },
  ] as DrilRow[],
}

// ClickableTable
export const clickableTableMock = {
  title: 'Fluxo de Caixa Diário',
  subtitle: 'Clique em uma linha para detalhes',
  columns: [
    { key: 'dia', label: 'Dia' },
    { key: 'entradas', label: 'Entradas', align: 'right' as const },
    { key: 'saidas', label: 'Saídas', align: 'right' as const },
    { key: 'saldo', label: 'Saldo', align: 'right' as const },
  ] as ClickColumn[],
  rows: [
    { id: '1', data: { dia: '01/03', entradas: 'R$ 12.000', saidas: 'R$ 8.500', saldo: 'R$ 3.500' } },
    { id: '2', data: { dia: '02/03', entradas: 'R$ 5.200', saidas: 'R$ 15.000', saldo: '(R$ 9.800)' }, variant: 'highlight' as const },
    { id: '3', data: { dia: '03/03', entradas: 'R$ 22.000', saidas: 'R$ 4.300', saldo: 'R$ 17.700' } },
    { id: 'total', data: { dia: 'Total', entradas: 'R$ 39.200', saidas: 'R$ 27.800', saldo: 'R$ 11.400' }, variant: 'total' as const },
  ] as ClickRow[],
}

// ConfigTable
export const configTableMock = {
  title: 'Categorias de Despesa',
  addLabel: '+ Nova Categoria',
  columns: [
    { key: 'nome', label: 'Nome', type: 'text' as const },
    { key: 'grupo', label: 'Grupo', type: 'select' as const, options: ['Fixo', 'Variável'] },
    { key: 'tipo', label: 'Tipo', type: 'badge' as const },
    { key: 'ativo', label: 'Ativo', type: 'status' as const },
    { key: 'acoes', label: 'Ações', type: 'actions' as const, width: '140px' },
  ] as ConfigColumn[],
  rows: [
    { nome: 'Aluguel', grupo: 'Fixo', tipo: 'Fixo', ativo: 'Sim' },
    { nome: 'Marketing Digital', grupo: 'Variável', tipo: 'Variável', ativo: 'Sim' },
    { nome: 'Energia', grupo: 'Fixo', tipo: 'Fixo', ativo: 'Não' },
  ] as ConfigRow[],
}

// CalculoCard
export const calculoCardMock = {
  title: 'Resumo do Resultado',
  rows: [
    { label: 'Receita Bruta', value: 'R$ 150.000', pct: '100%' },
    { operator: '(-)', label: 'Impostos', value: 'R$ 22.000', pct: '14,7%' },
    { operator: '(=)', label: 'Receita Líquida', value: 'R$ 128.000', pct: '85,3%', highlight: true },
    { operator: '(-)', label: 'Custos Variáveis', value: 'R$ 45.000', pct: '30,0%' },
    { operator: '(=)', label: 'Margem Contribuição', value: 'R$ 83.000', pct: '55,3%', highlight: true },
    { operator: '(-)', label: 'Despesas Fixas', value: 'R$ 38.000', pct: '25,3%' },
    { operator: '(=)', label: 'Resultado Operacional', value: 'R$ 45.000', pct: '30,0%', highlight: true },
  ] as CalculoRow[],
}

// WireframeSidebar
export const wireframeSidebarMock = {
  screens: [
    { label: 'Resultado Mensal', active: true },
    { label: 'Receita Analítica' },
    { label: 'Despesas Analítica' },
    { label: 'Fluxo de Caixa' },
    { label: 'Indicadores' },
    { label: 'Configurações' },
  ],
}

// WireframeHeader
export const wireframeHeaderMock = {
  title: 'Dashboard Financeiro',
  periodType: 'mensal' as const,
}

// WireframeFilterBar
export const wireframeFilterBarMock = {
  filters: [
    { key: 'unidade', label: 'Unidade', options: ['Todas'] },
    { key: 'centro', label: 'Centro de Custo', options: ['Todos'] },
  ] as FilterOption[],
  showSearch: true,
  searchPlaceholder: 'Buscar categoria...',
  showCompareSwitch: true,
}

// GlobalFilters
export const globalFiltersMock = {
  filters: ['periodo', 'segmento', 'vendedor'] as ('periodo' | 'segmento' | 'vendedor')[],
}

// CommentOverlay
export const commentOverlayMock = {
  clientSlug: 'financeiro-conta-azul',
  screenId: 'resultado-mensal',
  targetId: 'screen:resultado-mensal',
  targetLabel: 'Resultado Mensal',
  authorName: 'Operador FXL',
  authorRole: 'operador' as const,
  open: true,
  onClose: () => { /* noop for gallery preview */ },
}

// InputsScreen
export const inputsScreenMock = {
  acceptedFormats: ['XLS', 'XLSX', 'CSV'],
  instructions: 'Faça upload do relatório mensal exportado do ERP.',
  fieldName: 'Relatório Financeiro',
}

// DetailViewSwitcher
export const detailViewSwitcherMock = {
  options: ['Centro de Custo', 'Categoria', 'Fornecedor'],
  activeOption: 'Centro de Custo',
}

// UploadSection
export const uploadSectionMock = {
  label: 'Upload — Extrato Bancário',
  acceptedFormats: ['XLS', 'XLSX', 'CSV', 'OFX'],
  successMessage: 'Arquivo "extrato_mar26.xlsx" carregado — 142 registros identificados.',
  history: [
    { id: '1', date: '01/03/2026', type: 'Extrato', period: 'Fev/2026', records: 198, status: 'success' as const },
    { id: '2', date: '15/02/2026', type: 'Extrato', period: 'Jan/2026', records: 210, status: 'success' as const },
    { id: '3', date: '02/02/2026', type: 'DRE', period: 'Jan/2026', records: 45, status: 'warning' as const },
  ],
}

// ManualInputSection
export const manualInputSectionMock = {
  title: 'Simulação de Ajustes Manuais',
  initialBalance: 'R$ 85.000,00',
  entries: [
    { id: '1', type: 'receita' as const, month: 'Mar/2026', value: 'R$ 15.000', description: 'Receita extra prevista' },
    { id: '2', type: 'despesa' as const, month: 'Abr/2026', value: 'R$ 8.500', description: 'Manutenção equipamento' },
  ],
}

// SaldoBancoInput
export const saldoBancoInputMock = {
  title: 'Saldo Atual por Banco',
  banks: [
    { label: 'Banco do Brasil — Conta Corrente', value: 'R$ 45.000,00' },
    { label: 'Itaú — Conta Corrente', value: 'R$ 32.500,00' },
    { label: 'Itaú — Aplicação', value: 'R$ 120.000,00' },
    { label: 'Caixa Físico', value: 'R$ 2.500,00' },
  ],
  total: 'R$ 200.000,00',
}

// WireframeModal
export const wireframeModalMock = {
  title: 'Detalhes — 01/03/2026',
  size: 'lg' as const,
}

// WaterfallChart — compareBars (periodo anterior)
export const waterfallCompareBars: WaterfallBar[] = [
  { label: 'Receita', value: 135000, type: 'positive' },
  { label: 'Impostos', value: -19000, type: 'negative' },
  { label: 'Rec. Líquida', value: 116000, type: 'subtotal' },
  { label: 'Custos', value: -42000, type: 'negative' },
  { label: 'Despesas', value: -35000, type: 'negative' },
  { label: 'Resultado', value: 39000, type: 'subtotal' },
]

// CalculoCard — rows com dados de comparacao
export const calculoCardCompareRows: CalculoRow[] = [
  { label: 'Receita Bruta', value: 'R$ 150.000', pct: '100%', valueCompare: 'R$ 135.000', variation: '+11,1%', variationPositive: true },
  { operator: '(-)', label: 'Impostos', value: 'R$ 22.000', pct: '14,7%', valueCompare: 'R$ 19.000', variation: '+15,8%', variationPositive: false },
  { operator: '(=)', label: 'Receita Líquida', value: 'R$ 128.000', pct: '85,3%', highlight: true, valueCompare: 'R$ 116.000', variation: '+10,3%', variationPositive: true },
  { operator: '(-)', label: 'Custos Variáveis', value: 'R$ 45.000', pct: '30,0%', valueCompare: 'R$ 42.000', variation: '+7,1%', variationPositive: false },
  { operator: '(=)', label: 'Margem Contribuição', value: 'R$ 83.000', pct: '55,3%', highlight: true, valueCompare: 'R$ 74.000', variation: '+12,2%', variationPositive: true },
  { operator: '(-)', label: 'Despesas Fixas', value: 'R$ 38.000', pct: '25,3%', valueCompare: 'R$ 35.000', variation: '+8,6%', variationPositive: false },
  { operator: '(=)', label: 'Resultado Operacional', value: 'R$ 45.000', pct: '30,0%', highlight: true, valueCompare: 'R$ 39.000', variation: '+15,4%', variationPositive: true },
]
