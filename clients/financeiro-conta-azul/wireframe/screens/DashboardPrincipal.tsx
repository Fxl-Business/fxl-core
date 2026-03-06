import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'
import GlobalFilters from '@tools/wireframe-builder/components/GlobalFilters'
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal', active: true },
  { label: 'Receitas' },
  { label: 'Despesas' },
  { label: 'Fluxo de Caixa' },
  { label: 'Inadimplência' },
  { label: 'Inputs' },
]

const TABLE_COLUMNS = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'valor', label: 'Valor' },
  { key: 'percentual', label: '% do Total' },
]

export default function DashboardPrincipal() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Dashboard Principal</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Dashboard Principal</h1>
        </div>

        <GlobalFilters filters={['periodo', 'status']} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Receita Total"
            value="R$ 84.320,00"
            variation="+12% vs mês anterior"
            variationPositive={true}
          />
          <KpiCard
            label="Despesa Total"
            value="R$ 61.480,00"
            variation="+5% vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Resultado"
            value="R$ 22.840,00"
            variation="+34% vs mês anterior"
            variationPositive={true}
          />
          <KpiCard
            label="Margem Bruta"
            value="27,1%"
            variation="+4,2pp vs mês anterior"
            variationPositive={true}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <BarLineChart title="Receita vs. Despesa por Mês" type="bar" />
          <BarLineChart title="Evolução do Resultado" type="line" />
        </div>

        <DataTable title="Resumo por Categoria" columns={TABLE_COLUMNS} />
      </main>

      <CommentOverlay screenName="dashboard-principal" />
    </div>
  )
}
