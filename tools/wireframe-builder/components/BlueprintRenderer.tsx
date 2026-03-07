import { useState } from 'react'
import type { BlueprintScreen } from '../types/blueprint'
import type { Comment } from '../types/comments'
import WireframeFilterBar from './WireframeFilterBar'
import SectionRenderer from './sections/SectionRenderer'
import SectionWrapper from './SectionWrapper'

type Props = {
  screen: BlueprintScreen
  clientSlug?: string
  comments?: Comment[]
  onOpenComments?: (targetId: string, label: string) => void
}

export default function BlueprintRenderer({
  screen,
  clientSlug,
  comments,
  onOpenComments,
}: Props) {
  const [compareMode, setCompareMode] = useState(false)
  const [comparePeriod, setComparePeriod] = useState(
    screen.periodType === 'anual' ? '2025' : 'Fev/2026',
  )

  const showFilterBar = screen.hasCompareSwitch || screen.filters.length > 0
  const hasCommentSupport = clientSlug && comments && onOpenComments

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
      {screen.sections.map((section, i) => {
        const sectionEl = (
          <SectionRenderer
            key={i}
            section={section}
            compareMode={compareMode}
            comparePeriod={comparePeriod}
          />
        )

        if (hasCommentSupport) {
          return (
            <SectionWrapper
              key={i}
              screenId={screen.id}
              sectionIndex={i}
              clientSlug={clientSlug}
              comments={comments}
              onOpenComments={onOpenComments}
            >
              {sectionEl}
            </SectionWrapper>
          )
        }

        return sectionEl
      })}
    </div>
  )
}
