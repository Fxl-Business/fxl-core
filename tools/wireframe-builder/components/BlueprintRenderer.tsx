import { useState } from 'react'
import type { BlueprintScreen } from '../types/blueprint'
import WireframeFilterBar from './WireframeFilterBar'
import SectionRenderer from './sections/SectionRenderer'

export default function BlueprintRenderer({ screen }: { screen: BlueprintScreen }) {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState(
    screen.periodType === 'anual' ? '2025' : 'Fev/2026',
  )

  const showFilterBar = screen.hasCompareSwitch || screen.filters.length > 0

  return (
    <div className="space-y-6">
      {showFilterBar && (
        <WireframeFilterBar
          filters={screen.filters}
          showCompareSwitch={screen.hasCompareSwitch}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
          comparePeriodType={screen.periodType === 'anual' ? 'anual' : 'mensal'}
          comparePeriod={comparePeriod}
          onComparePeriodChange={setComparePeriod}
        />
      )}
      {screen.sections.map((section, i) => (
        <SectionRenderer
          key={i}
          section={section}
          compareMode={compareMode}
          comparePeriod={comparePeriod}
        />
      ))}
    </div>
  )
}
