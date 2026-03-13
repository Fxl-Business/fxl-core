import { useMemo } from 'react'
import type { BlueprintSection } from '../../types/blueprint'
import { SECTION_REGISTRY } from '../../lib/section-registry'
import { WireframeThemeProvider, type WireframeTheme } from '../../lib/wireframe-theme'

type Props = {
  /** The section type to preview. Must be a valid key in SECTION_REGISTRY. */
  sectionType: BlueprintSection['type']
  /** Width of the preview container in pixels. Defaults to 280. */
  width?: number
  /** Height of the preview container in pixels. Defaults to 180. */
  height?: number
  /** Which wireframe theme to use. Defaults to 'light'. */
  theme?: WireframeTheme
  /** Optional className for the outer wrapper. */
  className?: string
}

/**
 * Renders a self-contained mini-preview of a section type.
 *
 * Uses the section registry's defaultProps() to generate sample data,
 * renders the section's renderer component inside a WireframeThemeProvider,
 * and scales the output down to fit the specified dimensions.
 *
 * Key properties:
 * - No external data fetching or Supabase calls
 * - Renders synchronously from defaultProps()
 * - Non-interactive (pointer-events: none)
 * - Scoped wireframe theme tokens via WireframeThemeProvider
 */
export default function SectionPreview({
  sectionType,
  width = 280,
  height = 180,
  theme = 'light',
  className,
}: Props) {
  const entry = SECTION_REGISTRY[sectionType]
  if (!entry) return null

  // Memoize defaultProps to avoid recalculating on every render
  const sampleSection = useMemo(() => entry.defaultProps(), [entry])

  const Renderer = entry.renderer

  // The inner content renders at a "full" width (e.g., 800px) and is scaled
  // down via CSS transform to fit the preview container. This gives a faithful
  // mini-render instead of a squished responsive layout.
  const innerWidth = 800
  const scale = width / innerWidth

  return (
    <div
      className={className}
      style={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: 8,
        position: 'relative',
        pointerEvents: 'none',   // non-interactive
        userSelect: 'none',
      }}
    >
      <WireframeThemeProvider externalTheme={theme}>
        <div
          style={{
            width: innerWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            // Background from theme tokens
            backgroundColor: 'var(--wf-canvas)',
            padding: 16,
            minHeight: height / scale,
          }}
        >
          <Renderer
            section={sampleSection}
            compareMode={false}
            comparePeriod=""
          />
        </div>
      </WireframeThemeProvider>
    </div>
  )
}
