import { useState } from 'react'
import WireframeFilterBar from '@skills/wireframe-builder/components/WireframeFilterBar'
import type { FilterOption } from '@skills/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@skills/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@skills/wireframe-builder/components/BarLineChart'
import DonutChart from '@skills/wireframe-builder/components/DonutChart'
import ClickableTable from '@skills/wireframe-builder/components/ClickableTable'
import WireframeModal from '@skills/wireframe-builder/components/WireframeModal'
import type { ClickRow, ClickColumn } from '@skills/wireframe-builder/components/ClickableTable'

const CC_FILTERS: FilterOption[] = [
  { key: 'centro-custo', label: 'Centro de Custo' },
]

const COLS_BASE: ClickColumn[] = [
  { key: 'cc',     label: 'Centro de Custo' },
  { key: 'receita',label: 'Receita',      align: 'right' },
  { key: 'cv',     label: 'C. Variáveis', align: 'right' },
  { key: 'mc',     label: 'M. Contrib.',  align: 'right' },
  { key: 'pctMc',  label: '% MC',         align: 'right' },
  { key: 'cf',     label: 'C. Fixos',     align: 'right' },
  { key: 'ro',     label: 'Result. Op.',  align: 'right' },
  { key: 'pctRo',  label: '% RO',         align: 'right' },
  { key: 'df',     label: 'D. Fin.',      align: 'right' },
  { key: 'rf',     label: 'Result. Final',align: 'right' },
  { key: 'partic', label: '% Partic.',    align: 'right' },
]

const COLS_COMPARE: ClickColumn[] = [
  ...COLS_BASE,
  { key: 'anterior', label: 'Mês Ant.',  align: 'right' },
  { key: 'variacao', label: 'Var. %',    align: 'right' },
]

export default function CentroCustoScreen() {
  const [modal, setModal] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  const rows: ClickRow[] = [
    { id: 'sp', data: { cc: 'Unidade SP', receita: '242.600', cv: '121.300', mc: '121.300', pctMc: '50,0%', cf: '72.780', ro: '48.520', pctRo: '20,0%', df: '14.556', rf: '33.964', partic: '50%', anterior: '224.000', variacao: '▲ 8,3%' } },
    { id: 'rj', data: { cc: 'Unidade RJ', receita: '145.560', cv: '80.058',  mc: '65.502',  pctMc: '45,0%', cf: '38.000', ro: '27.502', pctRo: '18,9%', df: '8.734',  rf: '18.768', partic: '30%', anterior: '134.340', variacao: '▲ 8,3%' } },
    { id: 'bh', data: { cc: 'Unidade BH', receita: '97.040',  cv: '58.224',  mc: '38.816',  pctMc: '40,0%', cf: '20.216', ro: '18.600', pctRo: '19,2%', df: '5.822',  rf: '12.778', partic: '20%', anterior: '89.460',  variacao: '▲ 8,5%' } },
    { id: 'total', variant: 'total', data: { cc: 'Total', receita: '485.200', cv: '259.582', mc: '225.618', pctMc: '46,5%', cf: '130.996', ro: '94.622', pctRo: '19,5%', df: '29.112', rf: '65.510', partic: '100%', anterior: '447.800', variacao: '▲ 8,3%' } },
  ]

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={CC_FILTERS}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-3 gap-4">
        <KpiCardFull label="Receita Total (CCs)" value="R$ 485.200" variation="▲ 12,4% YoY" variationPositive sparkline={[430, 445, 455, 462, 470, 478, 485]} compareMode={compareMode} />
        <KpiCardFull label="Custo Total Alocado" value="R$ 397.864" sub="82,0% sobre receita" sparkline={[350, 360, 368, 375, 381, 388, 398]} compareMode={compareMode} />
        <KpiCardFull label="Resultado Consolidado" value="R$ 87.336" sub="18,0% margem" semaforo="verde" semaforoLabel="Saudável" sparkline={[65, 70, 74, 78, 82, 85, 87]} compareMode={compareMode} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BarLineChart
          title={compareMode ? `Receita × Custo × Resultado por CC — Atual vs ${comparePeriod}` : 'Receita × Custo × Resultado por CC'}
          type="bar"
          height={220}
        />
        <DonutChart
          title="% Participação na Receita Total"
          centerValue="100%"
          centerLabel="Total"
          data={[
            { label: 'SP — 50%', value: 242600, pct: '50%' },
            { label: 'RJ — 30%', value: 145560, pct: '30%' },
            { label: 'BH — 20%', value: 97040,  pct: '20%' },
          ]}
        />
      </div>

      <ClickableTable
        title="DRE por Centro de Custo"
        subtitle="Clique em uma linha para ver detalhes"
        columns={compareMode ? COLS_COMPARE : COLS_BASE}
        rows={rows}
        onRowClick={() => setModal(true)}
      />

      <WireframeModal
        title="Detalhamento — Unidade SP"
        open={modal}
        onClose={() => setModal(false)}
        footer={
          <>
            <span className="text-xs text-gray-500">Receita: <strong className="text-green-700">R$ 242.600</strong></span>
            <span className="text-xs text-gray-500">Custo Total: <strong className="text-red-700">R$ 208.636</strong></span>
            <span className="text-xs text-gray-500">Resultado: <strong className="text-green-700">R$ 33.964</strong></span>
          </>
        }
      >
        <p className="text-sm text-gray-500">Detalhamento por subcategoria da Unidade SP...</p>
      </WireframeModal>
    </div>
  )
}
