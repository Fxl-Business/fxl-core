import { useState } from 'react'
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import DonutChart from '@tools/wireframe-builder/components/DonutChart'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'

type Col = { key: string; label: string; align?: 'left' | 'right' | 'center' }

const DESPESAS_FILTERS: FilterOption[] = [
  { key: 'grupo-despesa', label: 'Grupo de Despesa', options: ['Todos', 'Variáveis', 'Fixos', 'Financeiros'] },
  { key: 'centro-custo', label: 'Centro de Custo' },
]

const COLS_BASE: Col[] = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'grupo',     label: 'Grupo' },
  { key: 'tipo',      label: 'Tipo' },
  { key: 'atual',     label: 'Mês Atual',   align: 'right' },
  { key: 'pctRec',    label: '% s/ Receita', align: 'right' },
]

const COLS_COMPARE: Col[] = [
  ...COLS_BASE,
  { key: 'anterior',  label: 'Anterior',    align: 'right' },
  { key: 'variacao',  label: 'Var. %',      align: 'right' },
]

export default function DespesasScreen() {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={DESPESAS_FILTERS}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCardFull label="Despesa Prevista" value="R$ 426.976" sub="88,0% s/ receita" sparkline={[390, 398, 407, 412, 418, 423, 427]} compareMode={compareMode} />
        <KpiCardFull label="Despesas Pagas" value="R$ 318.976" sub="74,7% do total" sparkline={[290, 295, 302, 306, 310, 315, 319]} compareMode={compareMode} />
        <KpiCardFull label="Despesas a Vencer" value="R$ 91.500" sub="48 títulos" sparkline={[105, 102, 98, 95, 93, 92, 92]} compareMode={compareMode} />
        <KpiCardFull
          label="Despesas Vencidas"
          value="R$ 16.500"
          sub="3,9% do total"
          semaforo="verde"
          semaforoLabel="Verde (≤5%)"
          sparkline={[12, 13, 14, 15, 16, 16, 17]}
          compareMode={compareMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DonutChart
          title="Participação por Grupo"
          centerValue="R$ 427k"
          centerLabel="Total"
          data={[
            { label: 'Custos Variáveis', value: 266860, pct: '62%' },
            { label: 'Custos Fixos',     value: 130996, pct: '31%' },
            { label: 'Financeiros',      value: 29120,  pct: '7%'  },
          ]}
        />
        {!compareMode && (
          <BarLineChart title="Despesa por Grupo" type="bar" height={200} />
        )}
        {compareMode && (
          <BarLineChart title={`Despesa por Grupo — Atual vs ${comparePeriod}`} type="bar" height={200} />
        )}
      </div>

      {compareMode && (
        <BarLineChart title={`Despesa por Status — Atual vs ${comparePeriod}`} type="bar" height={220} />
      )}

      <DataTable
        title="Análise por Categoria"
        columns={compareMode ? COLS_COMPARE : COLS_BASE}
        rowCount={9}
      />
    </div>
  )
}
