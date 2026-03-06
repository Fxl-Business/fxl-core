import KpiCard from '@skills/wireframe-builder/components/KpiCard'
import BarLineChart from '@skills/wireframe-builder/components/BarLineChart'
import DataTable from '@skills/wireframe-builder/components/DataTable'
import GlobalFilters from '@skills/wireframe-builder/components/GlobalFilters'
import CommentOverlay from '@skills/wireframe-builder/components/CommentOverlay'
import WireframeSidebar from '@skills/wireframe-builder/components/WireframeSidebar'

const SCREENS = [
  { label: 'Dashboard Principal' },
  { label: 'Receitas' },
  { label: 'Despesas' },
  { label: 'Fluxo de Caixa', active: true },
  { label: 'Inadimplência' },
  { label: 'Inputs' },
]

const TABLE_COLUMNS = [
  { key: 'data', label: 'Data' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'valor', label: 'Valor', align: 'right' as const },
  { key: 'saldo', label: 'Saldo Acumulado', align: 'right' as const },
]

export default function FluxoDeCaixa() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="p-4">
        <WireframeSidebar screens={SCREENS} />
      </div>

      <main className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs text-gray-400">Financeiro Conta Azul &rsaquo; Fluxo de Caixa</p>
          <h1 className="mt-0.5 text-lg font-bold text-gray-800">Fluxo de Caixa</h1>
        </div>

        <GlobalFilters filters={['periodo']} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Saldo Inicial"
            value="R$ 38.500,00"
            variationPositive={true}
          />
          <KpiCard
            label="Total de Entradas"
            value="R$ 76.100,00"
            variation="+8% vs mês anterior"
            variationPositive={true}
          />
          <KpiCard
            label="Total de Saídas"
            value="R$ 54.200,00"
            variation="+3% vs mês anterior"
            variationPositive={false}
          />
          <KpiCard
            label="Saldo Final"
            value="R$ 60.400,00"
            variation="+57% vs mês anterior"
            variationPositive={true}
          />
        </div>

        <BarLineChart title="Fluxo de Caixa — Movimentação e Saldo Acumulado" type="bar-line" />

        <DataTable title="Movimentações do Período" columns={TABLE_COLUMNS} />
      </main>

      <CommentOverlay screenName="fluxo-de-caixa" />
    </div>
  )
}
