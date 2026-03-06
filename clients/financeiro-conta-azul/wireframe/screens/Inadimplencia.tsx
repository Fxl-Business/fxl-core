import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'
import GlobalFilters from '@tools/wireframe-builder/components/GlobalFilters'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal' },
  { label: 'Receitas' },
  { label: 'Despesas' },
  { label: 'Fluxo de Caixa' },
  { label: 'Inadimplência', active: true },
  { label: 'Inputs' },
]

const TABLE_COLUMNS = [
  { key: 'vencimento', label: 'Vencimento' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'valor', label: 'Valor', align: 'right' as const },
  { key: 'diasAtraso', label: 'Dias em Atraso', align: 'center' as const },
  { key: 'status', label: 'Status' },
]

export default function Inadimplencia() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Inadimplência</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Inadimplência</h1>
        </div>

        <GlobalFilters filters={['periodo', 'status']} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Total Inadimplente"
            value="R$ 12.640,00"
            variation="+18% vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Lançamentos em Atraso"
            value="9"
            variation="+2 vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Ticket Médio Inadimplente"
            value="R$ 1.404,00"
            variationPositive={false}
          />
          <KpiCard
            label="Taxa de Inadimplência"
            value="14,99%"
            variation="+2,1pp vs mês anterior"
            variationPositive={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BarLineChart title="Inadimplência por Faixa de Atraso" type="bar" />
          <BarLineChart title="Evolução da Inadimplência" type="line" />
        </div>

        <DataTable title="Lançamentos em Atraso" columns={TABLE_COLUMNS} />
      </main>

      <CommentOverlay screenName="inadimplencia" />
    </div>
  )
}
