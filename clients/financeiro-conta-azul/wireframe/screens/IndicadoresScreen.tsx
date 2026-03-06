import { useState } from 'react'
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import ParetoChart from '@tools/wireframe-builder/components/ParetoChart'
import DataTable from '@tools/wireframe-builder/components/DataTable'

type Col = { key: string; label: string; align?: 'left' | 'right' | 'center' }

const INDICADORES_FILTERS: FilterOption[] = [
  { key: 'centro-custo', label: 'Centro de Custo' },
]

const COLS_KPI_BASE: Col[] = [
  { key: 'indicador', label: 'Indicador' },
  { key: 'valor',     label: 'Valor Atual', align: 'right' },
  { key: 'meta',      label: 'Meta',         align: 'right' },
  { key: 'status',    label: 'Status' },
  { key: 'tendencia', label: 'Tendência',    align: 'center' },
]

const COLS_KPI_COMPARE: Col[] = [
  ...COLS_KPI_BASE,
  { key: 'anterior',  label: 'Mês Ant.',     align: 'right' },
  { key: 'anoAnt',    label: 'Ano Ant.',     align: 'right' },
]

export default function IndicadoresScreen() {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={INDICADORES_FILTERS}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="mensal"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      {/* Bloco Liquidez */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Liquidez</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCardFull label="Liquidez Corrente" value="2,14" sub="Ativo / Passivo Circulante" semaforo="verde" semaforoLabel="Verde (≥1,5)" sparkline={[1.8, 1.9, 1.95, 2.0, 2.05, 2.1, 2.14]} compareMode={compareMode} />
          <KpiCardFull label="Liquidez Imediata" value="1,42" sub="Caixa / Passivo Circulante" semaforo="verde" semaforoLabel="Verde (≥1,0)" sparkline={[1.1, 1.15, 1.2, 1.25, 1.3, 1.38, 1.42]} compareMode={compareMode} />
          <KpiCardFull label="Prazo Médio Recebimento" value="28 dias" semaforo="verde" semaforoLabel="Verde (≤35 dias)" sparkline={[35, 34, 32, 31, 30, 29, 28]} compareMode={compareMode} />
          <KpiCardFull label="Prazo Médio Pagamento" value="42 dias" semaforo="verde" semaforoLabel="Verde (≥30 dias)" sparkline={[38, 39, 40, 40, 41, 42, 42]} compareMode={compareMode} />
        </div>
      </div>

      {/* Bloco Rentabilidade */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Rentabilidade</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCardFull label="ROE" value="18,4%" sub="Retorno s/ Patrimônio" semaforo="verde" semaforoLabel="Verde (≥15%)" sparkline={[14, 15, 16, 16, 17, 17, 18]} compareMode={compareMode} />
          <KpiCardFull label="EBITDA" value="R$ 92.150" sub="19,0% s/ receita" semaforo="verde" semaforoLabel="Verde (≥18%)" sparkline={[72, 75, 80, 83, 87, 90, 92]} compareMode={compareMode} />
          <KpiCardFull label="Ticket Médio" value="R$ 24.260" variation="▲ 6,2% vs Fev/2026" variationPositive sparkline={[21000, 21500, 22000, 22500, 23000, 23800, 24260]} compareMode={compareMode} />
          <KpiCardFull label="Custo de Aquisição (CAC)" value="R$ 3.850" variation="▼ 4,1% vs Fev/2026" variationPositive sparkline={[4200, 4100, 4000, 3980, 3950, 3900, 3850]} compareMode={compareMode} />
        </div>
      </div>

      {/* Bloco Endividamento */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Endividamento & Cobertura</p>
        <div className="grid grid-cols-3 gap-4">
          <KpiCardFull label="Dívida / EBITDA" value="1,8x" semaforo="amarelo" semaforoLabel="Amarelo (1,5x–2,5x)" sparkline={[2.1, 2.0, 1.95, 1.9, 1.85, 1.82, 1.8]} compareMode={compareMode} />
          <KpiCardFull label="Cobertura de Juros" value="5,2x" sub="EBIT / Despesas Financeiras" semaforo="verde" semaforoLabel="Verde (≥4x)" sparkline={[4.2, 4.4, 4.6, 4.8, 5.0, 5.1, 5.2]} compareMode={compareMode} />
          <KpiCardFull label="Inadimplência" value="4,9%" semaforo="verde" semaforoLabel="Verde (≤5%)" sparkline={[5.8, 5.5, 5.2, 5.0, 4.9, 4.9, 4.9]} compareMode={compareMode} />
        </div>
      </div>

      {compareMode && (
        <BarLineChart title={`KPIs do Mês vs ${comparePeriod}`} type="bar" height={260} />
      )}

      <ParetoChart
        title="Principais Categorias de Despesa (Pareto)"
        data={[
          { label: 'Mão de Obra',   value: 145560 },
          { label: 'Insumos',       value: 72780 },
          { label: 'Comissões',     value: 48520 },
          { label: 'Folha Fixa',    value: 78000 },
          { label: 'Administrativo',value: 27996 },
          { label: 'Aluguel',       value: 25000 },
          { label: 'Financeiros',   value: 29112 },
        ]}
        valueLabel="Despesa (R$)"
        height={260}
      />

      <DataTable
        title="Painel de KPIs — Resumo"
        columns={compareMode ? COLS_KPI_COMPARE : COLS_KPI_BASE}
        rowCount={10}
      />
    </div>
  )
}
