import { useState } from 'react'
import WireframeFilterBar from '@skills/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@skills/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@skills/wireframe-builder/components/BarLineChart'
import ManualInputSection from '@skills/wireframe-builder/components/ManualInputSection'
import ClickableTable from '@skills/wireframe-builder/components/ClickableTable'
import type { ClickRow, ClickColumn } from '@skills/wireframe-builder/components/ClickableTable'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const rows: ClickRow[] = [
  {
    id: 'entradas',
    variant: 'total',
    data: { linha: 'Total Entradas', jan: '310k', fev: '325k', mar: '355k', abr: '368k', mai: '380k', jun: '392k', jul: '405k', ago: '418k', set: '430k', out: '445k', nov: '460k', dez: '485k' },
  },
  {
    id: 'saidas',
    variant: 'total',
    data: { linha: 'Total Saídas', jan: '289k', fev: '298k', mar: '316k', abr: '328k', mai: '340k', jun: '352k', jul: '362k', ago: '375k', set: '385k', out: '398k', nov: '412k', dez: '428k' },
  },
  {
    id: 'saldo-mes',
    data: { linha: 'Saldo do Mês', jan: '21k', fev: '27k', mar: '39k', abr: '40k', mai: '40k', jun: '40k', jul: '43k', ago: '43k', set: '45k', out: '47k', nov: '48k', dez: '57k' },
  },
  {
    id: 'saldo-acum',
    variant: 'highlight',
    data: { linha: 'Saldo Acumulado', jan: '306k', fev: '333k', mar: '372k', abr: '412k', mai: '452k', jun: '492k', jul: '535k', ago: '578k', set: '623k', out: '670k', nov: '718k', dez: '775k' },
  },
]

const cols: ClickColumn[] = [
  { key: 'linha', label: 'Linha' },
  ...MONTHS.map((m) => ({ key: m.toLowerCase(), label: m, align: 'right' as const })),
]

export default function FluxoAnualScreen() {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('2025')

  return (
    <div className="space-y-6">
      <WireframeFilterBar
        filters={[]}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        comparePeriodType="anual"
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCardFull label="Total Entradas 2026" value="R$ 4,77M" variation={`▲ 10,2% vs ${comparePeriod}`} variationPositive sparkline={[400, 415, 430, 448, 465, 482, 500, 518, 536, 555, 574, 595]} compareMode={compareMode} />
        <KpiCardFull label="Total Saídas 2026" value="R$ 4,08M" sub="85,6% s/ entradas" sparkline={[340, 353, 366, 380, 395, 410, 425, 440, 456, 472, 490, 510]} compareMode={compareMode} />
        <KpiCardFull label="Saldo Líquido 2026" value="R$ 690k" variation={`▲ 18,5% vs ${comparePeriod}`} variationPositive sparkline={[60, 62, 64, 68, 70, 72, 75, 78, 80, 83, 84, 85]} compareMode={compareMode} />
        <KpiCardFull label="Saldo Final Projetado" value="R$ 775k" sub="Dez/2026" semaforo="verde" semaforoLabel="Meta atingida" sparkline={[306, 333, 372, 412, 452, 492, 535, 578, 623, 670, 718, 775]} compareMode={compareMode} />
      </div>

      <BarLineChart
        title={compareMode ? `Entradas × Saídas × Saldo Acumulado — 2026 vs ${comparePeriod}` : 'Entradas × Saídas × Saldo Acumulado — 12 Meses'}
        type="bar-line"
        height={280}
      />

      <div className="overflow-x-auto">
        <ClickableTable
          title="Projeção Mensal Detalhada"
          subtitle="Entradas, saídas e saldos mês a mês"
          columns={cols}
          rows={rows}
        />
      </div>

      <ManualInputSection
        title="Simulação de Cenários"
        initialBalance="285.600"
      />
    </div>
  )
}
