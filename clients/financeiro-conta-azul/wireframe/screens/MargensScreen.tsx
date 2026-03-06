import { useState } from 'react'
import WireframeFilterBar from '@skills/wireframe-builder/components/WireframeFilterBar'
import KpiCardFull from '@skills/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@skills/wireframe-builder/components/BarLineChart'

export default function MargensScreen() {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState('Fev/2026')

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

      <div className="grid grid-cols-3 gap-4">
        <KpiCardFull
          label="% Margem de Contribuição"
          value="45,0%"
          semaforo="verde"
          semaforoLabel="Verde (≥40%)"
          variation="▲ 2,1 pp vs Fev/2026"
          variationPositive
          sparkline={[38, 39, 40, 41, 42, 43, 44, 45]}
          compareMode={compareMode}
        />
        <KpiCardFull
          label="% Resultado Operacional"
          value="18,0%"
          semaforo="verde"
          semaforoLabel="Verde (≥15%)"
          variation="▲ 3,2 pp vs Fev/2026"
          variationPositive
          sparkline={[13, 14, 15, 15, 16, 17, 17, 18]}
          compareMode={compareMode}
        />
        <KpiCardFull
          label="% Resultado Final / EBITDA"
          value="12,0%"
          semaforo="verde"
          semaforoLabel="Verde (≥10%)"
          variation="▼ 1,2 pp vs Fev/2026"
          variationPositive={false}
          sparkline={[10, 11, 12, 13, 13, 12, 12, 12]}
          compareMode={compareMode}
        />
      </div>

      <BarLineChart
        title="Composição do Resultado (% sobre Faturamento)"
        type="bar"
        height={260}
      />

      {compareMode && (
        <BarLineChart
          title={`Margens Atuais vs ${comparePeriod} — MC%, RO%, RF%`}
          type="bar"
          height={240}
        />
      )}
    </div>
  )
}
