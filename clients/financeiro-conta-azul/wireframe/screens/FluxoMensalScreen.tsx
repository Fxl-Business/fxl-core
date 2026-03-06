import { useState } from 'react'
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import SaldoBancoInput from '@tools/wireframe-builder/components/SaldoBancoInput'
import ManualInputSection from '@tools/wireframe-builder/components/ManualInputSection'
import ClickableTable from '@tools/wireframe-builder/components/ClickableTable'
import WireframeModal from '@tools/wireframe-builder/components/WireframeModal'
import type { ClickRow, ClickColumn } from '@tools/wireframe-builder/components/ClickableTable'

const COLS_BASE: ClickColumn[] = [
  { key: 'descricao',  label: 'Descrição' },
  { key: 'previsto',   label: 'Previsto',   align: 'right' },
  { key: 'realizado',  label: 'Realizado',  align: 'right' },
  { key: 'diferenca',  label: 'Diferença',  align: 'right' },
  { key: 'status',     label: '% Real.',    align: 'right' },
]

export default function FluxoMensalScreen() {
  const [modal, setModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  const colsCompare: ClickColumn[] = [
    ...COLS_BASE,
    { key: 'mesComp', label: comparePeriod, align: 'right' },
  ]

  const rows: ClickRow[] = [
    { id: 'rec-cli',  data: { descricao: 'Recebimento de Clientes', previsto: '359.260', realizado: '342.800', diferenca: '(16.460)', status: '▲ 95,4%', mesComp: '330.000' } },
    { id: 'rec-out',  data: { descricao: 'Outras Entradas',         previsto: '18.000',  realizado: '12.500',  diferenca: '(5.500)',  status: '▲ 69,4%', mesComp: '11.000' }, variant: 'highlight' },
    { id: 'total-e',  data: { descricao: 'Total Entradas',          previsto: '377.260', realizado: '355.300', diferenca: '(21.960)', status: '▲ 94,2%', mesComp: '341.000' }, variant: 'total' },
    { id: 'forn',     data: { descricao: 'Pagamento Fornecedores',  previsto: '145.000', realizado: '148.200', diferenca: '(3.200)',  status: '▼ 102,2%', mesComp: '138.000' }, variant: 'highlight' },
    { id: 'folha',    data: { descricao: 'Folha de Pagamento',      previsto: '78.000',  realizado: '78.000',  diferenca: '—',        status: '= 100%', mesComp: '78.000' } },
    { id: 'alug',     data: { descricao: 'Aluguel',                 previsto: '25.000',  realizado: '25.000',  diferenca: '—',        status: '= 100%', mesComp: '25.000' } },
    { id: 'imp',      data: { descricao: 'Impostos e Tributos',     previsto: '38.000',  realizado: '35.500',  diferenca: '2.500',    status: '▲ 93,4%', mesComp: '34.000' } },
    { id: 'fin',      data: { descricao: 'Parcelas Financiamentos', previsto: '29.112',  realizado: '29.112',  diferenca: '—',        status: '= 100%', mesComp: '29.112' } },
    { id: 'total-s',  data: { descricao: 'Total Saídas',            previsto: '315.112', realizado: '315.812', diferenca: '(700)',    status: '▼ 100,2%', mesComp: '304.112' }, variant: 'total' },
    { id: 'saldo',    data: { descricao: 'Saldo do Período',        previsto: '62.148',  realizado: '39.488',  diferenca: '(22.660)', status: '▼ 63,5%', mesComp: '36.888' }, variant: 'highlight' },
  ]

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={[]}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCardFull label="Saldo Inicial" value="R$ 285.600" sub="01/Mar/2026" sparkline={[260, 268, 272, 278, 282, 284, 286]} compareMode={compareMode} />
        {/* "Previsto vs Realizado" é intrínseco ao mês — sempre visível */}
        <KpiCardFull label="Total Entradas" value="R$ 355.300" sub="Realizado" variation="▼ 5,8% vs previsto" variationPositive={false} sparkline={[310, 318, 325, 333, 340, 348, 355]} />
        <KpiCardFull label="Total Saídas" value="R$ 315.812" sub="Realizado" variation="▲ 0,2% vs previsto" variationPositive={false} sparkline={[290, 295, 300, 305, 308, 312, 316]} />
        <KpiCardFull label="Saldo Final Projetado" value="R$ 325.088" sub="31/Mar/2026" semaforo="verde" semaforoLabel="Saudável" sparkline={[280, 288, 295, 302, 310, 318, 325]} compareMode={compareMode} />
      </div>

      <BarLineChart title="Entradas × Saídas × Saldo — Dias do Mês" type="bar-line" height={240} />

      <SaldoBancoInput
        banks={[
          { label: 'Itaú — CC Principal',     value: 'R$ 198.450,00' },
          { label: 'Bradesco — CC Operacional', value: 'R$ 87.320,00' },
          { label: 'Santander — Reserva',       value: 'R$ 24.800,00' },
          { label: 'Nubank — Digital',          value: 'R$ 14.518,00' },
        ]}
        total="R$ 325.088,00"
      />

      <ClickableTable
        title="Fluxo Previsto × Realizado"
        subtitle="Clique em uma linha para ver detalhes da movimentação"
        columns={compareMode ? colsCompare : COLS_BASE}
        rows={rows}
        onRowClick={(row) => { setModalTitle(String(row.data.descricao)); setModal(true) }}
      />

      <WireframeModal
        title={`Detalhamento — ${modalTitle}`}
        open={modal}
        onClose={() => setModal(false)}
      >
        <p className="text-sm text-gray-500">Listagem de lançamentos individuais que compõem este item do fluxo...</p>
      </WireframeModal>

      <ManualInputSection
        title="Ajustes Manuais no Fluxo"
        initialBalance="285.600"
        entries={[
          { id: '1', type: 'receita', month: 'Mar/2026', value: 'R$ 15.000', description: 'Adiantamento cliente XYZ' },
          { id: '2', type: 'despesa', month: 'Mar/2026', value: 'R$ 8.500',  description: 'Manutenção emergencial servidor' },
        ]}
      />
    </div>
  )
}
