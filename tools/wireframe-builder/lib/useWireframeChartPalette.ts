import { useEffect, useState } from 'react'
import type React from 'react'

/**
 * Resolve wireframe chart palette CSS vars to hex strings.
 *
 * Recharts SVG fill/stroke attributes accept var() directly, but Recharts
 * <Legend> renders <li> elements with inline background-color which CANNOT
 * resolve CSS custom properties. This hook reads the computed values from
 * the DOM so they can be passed as resolved hex strings.
 *
 * Usage:
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const palette = useWireframeChartPalette(containerRef)
 * // palette = ['#1152d4', '#4f46e5', '#60a5fa', '#94a3b8', '#475569']
 * ```
 */
export function useWireframeChartPalette(
  containerRef: React.RefObject<HTMLElement | null>,
): string[] {
  const [palette, setPalette] = useState<string[]>([])

  useEffect(() => {
    if (!containerRef.current) return
    const style = getComputedStyle(containerRef.current)
    setPalette([
      style.getPropertyValue('--wf-chart-1').trim(),
      style.getPropertyValue('--wf-chart-2').trim(),
      style.getPropertyValue('--wf-chart-3').trim(),
      style.getPropertyValue('--wf-chart-4').trim(),
      style.getPropertyValue('--wf-chart-5').trim(),
    ])
  }, [containerRef])

  return palette
}
