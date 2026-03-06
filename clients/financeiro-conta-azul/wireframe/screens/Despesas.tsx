import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'
import GlobalFilters from '@tools/wireframe-builder/components/GlobalFilters'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal' },
  { label: 'Receitas' },
  { label: 'Despesas', active: true },
  { label: 'Fluxo de Caixa' },
  { label: 'Inadimplência' },
  { label: 'Inputs' },
]

const TABLE_COLUMNS = [
  { key: 'data', label: 'Data' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'valor', label: 'Valor', align: 'right' as const },
  { key: 'status', label: 'Status' },
]

export default function Despesas() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Despesas</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Despesas</h1>
        </div>

        <GlobalFilters filters={['periodo', 'categoria', 'status']} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Despesa Total"
            value="R$ 61.480,00"
            variation="+5% vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Ticket Médio"
            value="R$ 980,00"
            variation="+1% vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Despesas Pagas"
            value="R$ 54.200,00"
            variationPositive={true}
          />
          <KpiCard
            label="Despesas a Pagar"
            value="R$ 7.280,00"
            variationPositive={false}
          />
        </div>

        <BarLineChart title="Despesa por Categoria" type="bar" />

        <DataTable title="Lançamentos de Despesa" columns={TABLE_COLUMNS} />
      </main>

      <CommentOverlay screenName="despesas" />
    </div>
  )
}
