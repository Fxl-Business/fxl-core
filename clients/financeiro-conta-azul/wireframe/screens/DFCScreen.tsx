import { useState } from 'react'
import WireframeFilterBar from '@skills/wireframe-builder/components/WireframeFilterBar'
import type { FilterOption } from '@skills/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@skills/wireframe-builder/components/KpiCardFull'
import WaterfallChart from '@skills/wireframe-builder/components/WaterfallChart'
import type { WaterfallBar } from '@skills/wireframe-builder/components/WaterfallChart'
import CalculoCard from '@skills/wireframe-builder/components/CalculoCard'
import type { CalculoRow } from '@skills/wireframe-builder/components/CalculoCard'
import DrillDownTable from '@skills/wireframe-builder/components/DrillDownTable'
import DetailViewSwitcher from '@skills/wireframe-builder/components/DetailViewSwitcher'
import type { DrilRow, DrilColumn } from '@skills/wireframe-builder/components/DrillDownTable'

const DFC_COLS_BASE: DrilColumn[] = [
  { key: 'linha', label: 'Linha DFC' },
  { key: 'atual', label: 'Mês Atual (R$)', align: 'right' },
  { key: 'pct', label: '% s/ Receita', align: 'right' },
]

const WATERFALL_DATA: WaterfallBar[] = [
  { label: 'Faturamento', value: 485200, type: 'positive' },
  { label: '(-) C. Variáveis', value: -266860, type: 'negative' },
  { label: '(=) MC', value: 218340, type: 'subtotal' },
  { label: '(-) C. Fixos', value: -130996, type: 'negative' },
  { label: '(=) RO', value: 87344, type: 'subtotal' },
  { label: '(-) D. Financ.', value: -29112, type: 'negative' },
  { label: '(=) Resultado', value: 58232, type: 'subtotal' },
]

const WATERFALL_COMPARE: WaterfallBar[] = [
  { label: 'Faturamento', value: 447300, type: 'positive' },
  { label: '(-) C. Variáveis', value: -247500, type: 'negative' },
  { label: '(=) MC', value: 199800, type: 'subtotal' },
  { label: '(-) C. Fixos', value: -125000, type: 'negative' },
  { label: '(=) RO', value: 74800, type: 'subtotal' },
  { label: '(-) D. Financ.', value: -24500, type: 'negative' },
  { label: '(=) Resultado', value: 50300, type: 'subtotal' },
]

const CALCULO_ROWS: CalculoRow[] = [
  {
    label: 'Faturamento',
    value: 'R$ 485.200',
    pct: '100,00%',
    valueCompare: 'R$ 447.300',
    variation: '▲ 8,5%',
    variationPositive: true,
  },
  {
    operator: '(-)',
    label: 'Custos Variáveis',
    value: '(R$ 266.860)',
    pct: '55,00%',
    valueCompare: '(R$ 247.500)',
    variation: '▲ 7,8%',
    variationPositive: false,
  },
  {
    operator: '(=)',
    label: 'Margem de Contribuição',
    value: 'R$ 218.340',
    pct: '45,00%',
    highlight: true,
    valueCompare: 'R$ 199.800',
    variation: '▲ 9,3%',
    variationPositive: true,
  },
  {
    operator: '(-)',
    label: 'Custos Fixos',
    value: '(R$ 130.996)',
    pct: '27,00%',
    valueCompare: '(R$ 125.000)',
    variation: '▲ 4,8%',
    variationPositive: false,
  },
  {
    operator: '(=)',
    label: 'Resultado Operacional',
    value: 'R$ 87.344',
    pct: '18,00%',
    highlight: true,
    valueCompare: 'R$ 74.800',
    variation: '▲ 16,8%',
    variationPositive: true,
  },
  {
    operator: '(-)',
    label: 'Despesas Financeiras',
    value: '(R$ 29.112)',
    pct: '6,00%',
    valueCompare: '(R$ 24.500)',
    variation: '▲ 18,8%',
    variationPositive: false,
  },
  {
    operator: '(=)',
    label: 'Resultado Final',
    value: 'R$ 58.232',
    pct: '12,00%',
    highlight: true,
    valueCompare: 'R$ 50.300',
    variation: '▲ 15,8%',
    variationPositive: true,
  },
]

const ROWS_BY_VIEW: Record<string, DrilRow[]> = {
  'Grupo de Despesa': [
    {
      id: 'receita',
      isTotal: true,
      data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
      children: [
        { id: 'rec-servicos', data: { linha: 'Serviços', atual: '290.000', pct: '59,8%', anterior: '265.000', anoAnt: '240.000', variacao: '▲ 9,4%' } },
        { id: 'rec-produtos', data: { linha: 'Produtos', atual: '135.200', pct: '27,9%', anterior: '122.800', anoAnt: '112.000', variacao: '▲ 10,1%' } },
        { id: 'rec-outros', data: { linha: 'Outros', atual: '60.000', pct: '12,3%', anterior: '60.000', anoAnt: '58.000', variacao: '—' } },
      ],
    },
    {
      id: 'cv',
      data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
      children: [
        { id: 'cv-folha', data: { linha: 'Folha Variável', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
        { id: 'cv-insumos', data: { linha: 'Insumos', atual: '(72.780)', pct: '15,0%', anterior: '(70.000)', anoAnt: '(68.000)', variacao: '▲ 4,0%' } },
        { id: 'cv-com', data: { linha: 'Comissões', atual: '(48.520)', pct: '10,0%', anterior: '(43.570)', anoAnt: '(40.000)', variacao: '▲ 11,4%' } },
      ],
    },
    {
      id: 'mc',
      isTotal: true,
      data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
    },
    {
      id: 'cf',
      data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
      children: [
        { id: 'cf-adm', data: { linha: 'Administrativo', atual: '(78.000)', pct: '16,1%', anterior: '(75.000)', anoAnt: '(70.000)', variacao: '▲ 4,0%' } },
        { id: 'cf-oper', data: { linha: 'Operacional', atual: '(27.996)', pct: '5,8%', anterior: '(25.000)', anoAnt: '(26.000)', variacao: '▲ 12,0%' } },
        { id: 'cf-alug', data: { linha: 'Ocupação', atual: '(25.000)', pct: '5,2%', anterior: '(25.000)', anoAnt: '(22.000)', variacao: '—' } },
      ],
    },
    {
      id: 'ro',
      isTotal: true,
      data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
    },
    {
      id: 'df',
      data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
      children: [
        { id: 'df-fin', data: { linha: 'Financeiro', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' } },
      ],
    },
    {
      id: 'rf',
      isTotal: true,
      data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
    },
  ],
  'Centro de Custo': [
    {
      id: 'receita',
      isTotal: true,
      data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
      children: [
        { id: 'rec-sp', data: { linha: 'CC São Paulo', atual: '291.120', pct: '60,0%', anterior: '268.680', anoAnt: '246.000', variacao: '▲ 8,3%' } },
        { id: 'rec-rj', data: { linha: 'CC Rio de Janeiro', atual: '145.560', pct: '30,0%', anterior: '134.340', anoAnt: '123.000', variacao: '▲ 8,3%' } },
        { id: 'rec-int', data: { linha: 'CC Interior', atual: '48.520', pct: '10,0%', anterior: '44.780', anoAnt: '41.000', variacao: '▲ 8,3%' } },
      ],
    },
    {
      id: 'cv',
      data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
      children: [
        { id: 'cv-sp', data: { linha: 'CC São Paulo', atual: '(160.116)', pct: '33,0%', anterior: '(148.800)', anoAnt: '(138.600)', variacao: '▲ 7,6%' } },
        { id: 'cv-rj', data: { linha: 'CC Rio de Janeiro', atual: '(80.058)', pct: '16,5%', anterior: '(74.400)', anoAnt: '(69.300)', variacao: '▲ 7,6%' } },
        { id: 'cv-int', data: { linha: 'CC Interior', atual: '(26.686)', pct: '5,5%', anterior: '(24.800)', anoAnt: '(23.100)', variacao: '▲ 7,6%' } },
      ],
    },
    {
      id: 'mc',
      isTotal: true,
      data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
    },
    {
      id: 'cf',
      data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
      children: [
        { id: 'cf-sp', data: { linha: 'CC São Paulo', atual: '(78.598)', pct: '16,2%', anterior: '(75.000)', anoAnt: '(70.800)', variacao: '▲ 4,8%' } },
        { id: 'cf-rj', data: { linha: 'CC Rio de Janeiro', atual: '(39.299)', pct: '8,1%', anterior: '(37.500)', anoAnt: '(35.400)', variacao: '▲ 4,8%' } },
        { id: 'cf-int', data: { linha: 'CC Interior', atual: '(13.099)', pct: '2,7%', anterior: '(12.500)', anoAnt: '(11.800)', variacao: '▲ 4,8%' } },
      ],
    },
    {
      id: 'ro',
      isTotal: true,
      data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
    },
    {
      id: 'df',
      data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
      children: [
        { id: 'df-sp', data: { linha: 'CC São Paulo', atual: '(17.467)', pct: '3,6%', anterior: '(14.700)', anoAnt: '(12.000)', variacao: '▲ 18,8%' } },
        { id: 'df-rj', data: { linha: 'CC Rio de Janeiro', atual: '(8.734)', pct: '1,8%', anterior: '(7.350)', anoAnt: '(6.000)', variacao: '▲ 18,8%' } },
        { id: 'df-int', data: { linha: 'CC Interior', atual: '(2.911)', pct: '0,6%', anterior: '(2.450)', anoAnt: '(2.000)', variacao: '▲ 18,8%' } },
      ],
    },
    {
      id: 'rf',
      isTotal: true,
      data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
    },
  ],
  Categoria: [
    {
      id: 'receita',
      isTotal: true,
      data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
      children: [
        { id: 'rec-cons', data: { linha: 'Consultoria', atual: '290.000', pct: '59,8%', anterior: '265.000', anoAnt: '240.000', variacao: '▲ 9,4%' } },
        { id: 'rec-proj', data: { linha: 'Projetos', atual: '135.200', pct: '27,9%', anterior: '122.800', anoAnt: '112.000', variacao: '▲ 10,1%' } },
        { id: 'rec-out', data: { linha: 'Outros', atual: '60.000', pct: '12,3%', anterior: '60.000', anoAnt: '58.000', variacao: '—' } },
      ],
    },
    {
      id: 'cv',
      data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
      children: [
        { id: 'cv-cat1', data: { linha: 'Compra de Mercadoria', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
        { id: 'cv-cat2', data: { linha: 'Custos com Frota', atual: '(22.910)', pct: '4,7%', anterior: '(21.000)', anoAnt: '(19.500)', variacao: '▲ 9,1%' } },
        { id: 'cv-cat3', data: { linha: 'Custos com Impostos', atual: '(54.753)', pct: '11,3%', anterior: '(50.000)', anoAnt: '(47.000)', variacao: '▲ 9,5%' } },
        { id: 'cv-cat4', data: { linha: 'Custos Operacionais', atual: '(43.637)', pct: '9,0%', anterior: '(40.000)', anoAnt: '(38.000)', variacao: '▲ 9,1%' } },
      ],
    },
    {
      id: 'mc',
      isTotal: true,
      data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
    },
    {
      id: 'cf',
      data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
      children: [
        { id: 'cf-rh', data: { linha: 'Recursos Humanos', atual: '(86.814)', pct: '17,9%', anterior: '(83.000)', anoAnt: '(78.000)', variacao: '▲ 4,6%' } },
        { id: 'cf-adm', data: { linha: 'Despesas Administrativas', atual: '(19.322)', pct: '4,0%', anterior: '(18.000)', anoAnt: '(17.000)', variacao: '▲ 7,3%' } },
        { id: 'cf-imovel', data: { linha: 'Imóvel', atual: '(8.050)', pct: '1,7%', anterior: '(8.000)', anoAnt: '(7.500)', variacao: '▲ 0,6%' } },
        { id: 'cf-dir', data: { linha: 'Despesas com Diretoria', atual: '(13.963)', pct: '2,9%', anterior: '(13.000)', anoAnt: '(12.000)', variacao: '▲ 7,4%' } },
        { id: 'cf-com', data: { linha: 'Despesas Comerciais e Marketing', atual: '(2.847)', pct: '0,6%', anterior: '(2.500)', anoAnt: '(2.200)', variacao: '▲ 13,9%' } },
      ],
    },
    {
      id: 'ro',
      isTotal: true,
      data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
    },
    {
      id: 'df',
      data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
      children: [
        { id: 'df-jur', data: { linha: 'Juros bancários', atual: '(15.000)', pct: '3,1%', anterior: '(12.000)', anoAnt: '(10.000)', variacao: '▲ 25,0%' } },
        { id: 'df-tar', data: { linha: 'Tarifas e IOF', atual: '(8.112)', pct: '1,7%', anterior: '(7.500)', anoAnt: '(6.000)', variacao: '▲ 8,2%' } },
        { id: 'df-mul', data: { linha: 'Multas e juros mora', atual: '(6.000)', pct: '1,2%', anterior: '(5.000)', anoAnt: '(4.000)', variacao: '▲ 20,0%' } },
      ],
    },
    {
      id: 'rf',
      isTotal: true,
      data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
    },
  ],
  'Forma de Pagamento': [
    {
      id: 'receita',
      isTotal: true,
      data: { linha: 'Receita Total', atual: '485.200', pct: '100,0%', anterior: '447.800', anoAnt: '410.000', variacao: '▲ 8,3%' },
      children: [
        { id: 'rec-conv', data: { linha: 'Convênio', atual: '71.200', pct: '14,7%', anterior: '65.000', anoAnt: '60.000', variacao: '▲ 9,5%' } },
        { id: 'rec-dup', data: { linha: 'Duplicata', atual: '152.000', pct: '31,3%', anterior: '140.000', anoAnt: '128.000', variacao: '▲ 8,6%' } },
        { id: 'rec-car', data: { linha: 'Cartão', atual: '131.600', pct: '27,1%', anterior: '121.200', anoAnt: '111.000', variacao: '▲ 8,6%' } },
        { id: 'rec-din', data: { linha: 'Dinheiro', atual: '130.400', pct: '26,9%', anterior: '121.600', anoAnt: '111.000', variacao: '▲ 7,2%' } },
      ],
    },
    {
      id: 'cv',
      data: { linha: 'Custos Variáveis', atual: '(266.860)', pct: '55,0%', anterior: '(248.000)', anoAnt: '(231.000)', variacao: '▲ 7,6%' },
      children: [
        { id: 'cv-folha', data: { linha: 'Folha Variável', atual: '(145.560)', pct: '30,0%', anterior: '(134.430)', anoAnt: '(123.000)', variacao: '▲ 8,3%' } },
        { id: 'cv-insumos', data: { linha: 'Insumos', atual: '(72.780)', pct: '15,0%', anterior: '(70.000)', anoAnt: '(68.000)', variacao: '▲ 4,0%' } },
        { id: 'cv-com', data: { linha: 'Comissões', atual: '(48.520)', pct: '10,0%', anterior: '(43.570)', anoAnt: '(40.000)', variacao: '▲ 11,4%' } },
      ],
    },
    {
      id: 'mc',
      isTotal: true,
      data: { linha: 'Margem de Contribuição', atual: '218.340', pct: '45,0%', anterior: '199.800', anoAnt: '179.000', variacao: '▲ 9,3%' },
    },
    {
      id: 'cf',
      data: { linha: 'Custos Fixos', atual: '(130.996)', pct: '27,0%', anterior: '(125.000)', anoAnt: '(118.000)', variacao: '▲ 4,8%' },
      children: [
        { id: 'cf-adm', data: { linha: 'Administrativo', atual: '(78.000)', pct: '16,1%', anterior: '(75.000)', anoAnt: '(70.000)', variacao: '▲ 4,0%' } },
        { id: 'cf-oper', data: { linha: 'Operacional', atual: '(27.996)', pct: '5,8%', anterior: '(25.000)', anoAnt: '(26.000)', variacao: '▲ 12,0%' } },
        { id: 'cf-alug', data: { linha: 'Ocupação', atual: '(25.000)', pct: '5,2%', anterior: '(25.000)', anoAnt: '(22.000)', variacao: '—' } },
      ],
    },
    {
      id: 'ro',
      isTotal: true,
      data: { linha: 'Resultado Operacional', atual: '87.344', pct: '18,0%', anterior: '74.800', anoAnt: '61.000', variacao: '▲ 16,8%' },
    },
    {
      id: 'df',
      data: { linha: 'Despesas Financeiras', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' },
      children: [
        { id: 'df-fin', data: { linha: 'Financeiro', atual: '(29.112)', pct: '6,0%', anterior: '(24.500)', anoAnt: '(20.000)', variacao: '▲ 18,8%' } },
      ],
    },
    {
      id: 'rf',
      isTotal: true,
      data: { linha: 'Resultado Final', atual: '58.232', pct: '12,0%', anterior: '50.300', anoAnt: '41.000', variacao: '▲ 15,8%' },
    },
  ],
}

const VIEW_OPTIONS = ['Grupo de Despesa', 'Centro de Custo', 'Categoria', 'Forma de Pagamento']

const DFC_FILTERS: FilterOption[] = [{ key: 'centro-custo', label: 'Centro de Custo' }]

export default function DFCScreen() {
  const [activeView, setActiveView] = useState('Grupo de Despesa')
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  const dfcColsCompare: DrilColumn[] = [
    ...DFC_COLS_BASE,
    { key: 'anterior', label: comparePeriod, align: 'right' },
    { key: 'variacao', label: 'Var. %', align: 'right' },
  ]

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={DFC_FILTERS}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCardFull
          label="Receita Total"
          value="R$ 485.200"
          variation="▲ 8,3% vs Fev/2026"
          variationPositive
          sparkline={[410, 425, 438, 447, 460, 472, 485]}
          compareMode={compareMode}
        />
        <KpiCardFull
          label="Margem de Contribuição"
          value="R$ 218.340"
          sub="45,0% s/ receita"
          variation="▲ 9,3% vs Fev/2026"
          variationPositive
          sparkline={[185000, 190000, 195000, 200000, 205000, 210000, 218340]}
          compareMode={compareMode}
        />
        <KpiCardFull
          label="Resultado Operacional"
          value="R$ 87.344"
          sub="18,0% s/ receita"
          variation="▲ 16,8% vs Fev/2026"
          variationPositive
          sparkline={[72000, 74000, 76000, 79000, 82000, 85000, 87344]}
          compareMode={compareMode}
        />
        <KpiCardFull
          label="Resultado Final"
          value="R$ 58.232"
          sub="12,0% s/ receita"
          variation="▲ 15,8% vs Fev/2026"
          variationPositive
          sparkline={[44000, 46000, 48000, 50000, 53000, 56000, 58232]}
          compareMode={compareMode}
        />
      </div>

      <div className="space-y-4">
        <CalculoCard
          title="Resumo do Resultado"
          rows={CALCULO_ROWS}
          compareMode={compareMode}
          comparePeriodLabel={comparePeriod}
        />
        <WaterfallChart
          title="Resultado do Mês"
          bars={WATERFALL_DATA}
          compareMode={compareMode}
          compareBars={compareMode ? WATERFALL_COMPARE : undefined}
          comparePeriodLabel={comparePeriod}
          height={280}
        />
      </div>

      <div className="flex justify-end">
        <DetailViewSwitcher
          options={VIEW_OPTIONS}
          activeOption={activeView}
          onChange={setActiveView}
        />
      </div>

      <DrillDownTable
        title="DFC Gerencial"
        subtitle={`Detalhe por ${activeView} — clique em uma linha para expandir`}
        columns={compareMode ? dfcColsCompare : DFC_COLS_BASE}
        rows={ROWS_BY_VIEW[activeView]}
      />
    </div>
  )
}
