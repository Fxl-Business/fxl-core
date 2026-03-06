import KpiCard from '@skills/wireframe-builder/components/KpiCard'
import BarLineChart from '@skills/wireframe-builder/components/BarLineChart'
import DataTable from '@skills/wireframe-builder/components/DataTable'
import GlobalFilters from '@skills/wireframe-builder/components/GlobalFilters'
import CommentOverlay from '@skills/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@skills/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal' },
  { label: 'Receitas', active: true },
  { label: 'Despesas' },
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

export default function Receitas() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Receitas</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Receitas</h1>
        </div>

        <GlobalFilters filters={['periodo', 'categoria', 'status']} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Receita Total"
            value="R$ 84.320,00"
            variation="+12% vs mês anterior"
            variationPositive={true}
          />
          <KpiCard
            label="Ticket Médio"
            value="R$ 1.406,00"
            variation="+3% vs mês anterior"
            variationPositive={true}
          />
          <KpiCard
            label="Receitas Recebidas"
            value="R$ 76.100,00"
            variationPositive={true}
          />
          <KpiCard
            label="Receitas a Receber"
            value="R$ 8.220,00"
            variationPositive={true}
          />
        </div>

        <BarLineChart title="Receita por Categoria" type="bar" />

        <DataTable title="Lançamentos de Receita" columns={TABLE_COLUMNS} />
      </main>

      <CommentOverlay screenName="receitas" />
    </div>
  )
}
