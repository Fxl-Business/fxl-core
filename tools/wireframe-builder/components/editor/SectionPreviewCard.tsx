import { useMemo, Component, type ReactNode } from 'react'
import type { BlueprintSection } from '../../types/blueprint'
import { SECTION_REGISTRY } from '../../lib/section-registry'
import { WireframeThemeProvider } from '../../lib/wireframe-theme'
import SectionRenderer from '../sections/SectionRenderer'

type Props = {
  type: BlueprintSection['type']
  onSelect: (type: BlueprintSection['type']) => void
}

// ---------------------------------------------------------------------------
// Lightweight error boundary for preview rendering
// ---------------------------------------------------------------------------

type ErrorBoundaryProps = { fallback: ReactNode; children: ReactNode }
type ErrorBoundaryState = { hasError: boolean }

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// SectionPreviewCard
// ---------------------------------------------------------------------------

export default function SectionPreviewCard({ type, onSelect }: Props) {
  const entry = SECTION_REGISTRY[type]

  const sectionProps = useMemo(() => {
    if (!entry) return null
    return entry.defaultProps()
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!entry || !sectionProps) {
    return null
  }

  const { catalogEntry } = entry
  const Icon = catalogEntry.icon

  const fallback = (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
    </div>
  )

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card transition-all hover:border-primary hover:shadow-sm"
    >
      {/* Preview area */}
      <div className="relative h-[140px] overflow-hidden bg-muted/30" style={{ pointerEvents: 'none' }}>
        <PreviewErrorBoundary fallback={fallback}>
          <WireframeThemeProvider externalTheme="light">
            <div
              style={{
                width: '400%',
                height: '400%',
                transform: 'scale(0.25)',
                transformOrigin: 'top left',
              }}
            >
              <SectionRenderer
                section={sectionProps}
                compareMode={false}
                comparePeriod=""
              />
            </div>
          </WireframeThemeProvider>
        </PreviewErrorBoundary>
      </div>

      {/* Label bar */}
      <div className="flex items-center gap-2 border-t px-3 py-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-xs font-medium text-foreground">
          {catalogEntry.label}
        </span>
      </div>
    </button>
  )
}
