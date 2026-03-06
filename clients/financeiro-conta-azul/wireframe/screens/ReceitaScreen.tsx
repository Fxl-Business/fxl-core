import { useState } from 'react'
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import DonutChart from '@tools/wireframe-builder/components/DonutChart'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'

type Col = { key: string; label: string; align?: 'left' | 'right' | 'center' }

const RECEITA_FILTERS: FilterOption[] = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'centro-custo', label: 'Centro de Custo' },
  { key: 'cliente', label: 'Cliente' },
]

const COLS_CATEGORIA_BASE: Col[] = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'atual',     label: 'Atual',     align: 'right' },
  { key: 'pct',       label: '% s/ Total', align: 'right' },
]

const COLS_CATEGORIA_COMPARE: Col[] = [
  ...COLS_CATEGORIA_BASE,
  { key: 'anterior',  label: 'Anterior',  align: 'right' },
  { key: 'variacao',  label: 'Var. %',    align: 'right' },
]

export default function ReceitaScreen() {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={RECEITA_FILTERS}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCardFull label="Receita Prevista" value="R$ 485.200" variation="▲ 8,3% vs Fev/2026" variationPositive sparkline={[420, 430, 445, 455, 465, 478, 485]} compareMode={compareMode} />
        <KpiCardFull label="Receitas Recebidas" value="R$ 359.260" sub="74,0% recebido" sparkline={[300, 310, 325, 335, 340, 350, 359]} compareMode={compareMode} />
        <KpiCardFull label="Receitas a Vencer" value="R$ 102.440" sub="32 títulos" sparkline={[120, 115, 110, 108, 105, 103, 102]} compareMode={compareMode} />
        <KpiCardFull
          label="Receitas Vencidas"
          value="R$ 23.500"
          sub="4,9% inadimplência"
          semaforo="verde"
          semaforoLabel="Verde (≤5%)"
          sparkline={[18, 20, 21, 22, 23, 23, 24]}
          variationPositive={false}
          compareMode={compareMode}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DonutChart
          title="Distribuição por Status"
          centerValue="R$ 485k"
          centerLabel="Total"
          data={[
            { label: 'Recebido',  value: 359260, pct: '74%' },
            { label: 'A Vencer',  value: 102440, pct: '21%' },
            { label: 'Vencido',   value: 23500,  pct: '5%'  },
          ]}
        />
        {!compareMode && (
          <BarLineChart title="Receita por Categoria" type="bar" height={200} />
        )}
        {compareMode && (
          <BarLineChart title={`Receita por Categoria — Atual vs ${comparePeriod}`} type="bar" height={200} />
        )}
      </div>

      {compareMode && (
        <BarLineChart title={`Receita por Status — Atual vs ${comparePeriod}`} type="bar" height={220} />
      )}

      <DataTable
        title="Top Clientes por Receita"
        columns={[
          { key: 'rank',      label: '#',          align: 'center' },
          { key: 'cliente',   label: 'Cliente' },
          { key: 'prevista',  label: 'Prevista',   align: 'right' },
          { key: 'recebida',  label: 'Recebida',   align: 'right' },
          { key: 'aberto',    label: 'Em Aberto',  align: 'right' },
          { key: 'status',    label: 'Status' },
          { key: 'pct',       label: '% s/ Total', align: 'right' },
        ]}
        rowCount={6}
      />

      <DataTable
        title="Receita por Categoria"
        columns={compareMode ? COLS_CATEGORIA_COMPARE : COLS_CATEGORIA_BASE}
        rowCount={5}
      />
    </div>
  )
}
