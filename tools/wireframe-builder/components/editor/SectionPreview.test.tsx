// @vitest-environment jsdom

// Polyfill ResizeObserver for jsdom (required by recharts)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { createElement } from 'react'
import SectionPreview from './SectionPreview'
import { SECTION_REGISTRY } from '../../lib/section-registry'
import type { BlueprintSection } from '../../types/blueprint'

const ALL_SECTION_TYPES = Object.keys(SECTION_REGISTRY) as BlueprintSection['type'][]

afterEach(cleanup)

describe('SectionPreview', () => {
  it('returns null for unknown section type', () => {
    // Force an invalid type to test the guard
    const { container } = render(
      createElement(SectionPreview, {
        sectionType: 'nonexistent-type' as BlueprintSection['type'],
      })
    )
    expect(container.innerHTML).toBe('')
  })

  for (const sectionType of ALL_SECTION_TYPES) {
    it(`renders "${sectionType}" without throwing`, () => {
      expect(() => {
        const { unmount } = render(
          createElement(SectionPreview, { sectionType })
        )
        unmount()
      }).not.toThrow()
    })
  }

  it('wraps content in WireframeThemeProvider with data-wf-theme', () => {
    const { container } = render(
      createElement(SectionPreview, {
        sectionType: 'kpi-grid',
        theme: 'dark',
      })
    )
    const themeDiv = container.querySelector('[data-wf-theme="dark"]')
    expect(themeDiv).not.toBeNull()
  })

  it('applies pointer-events:none on outer container', () => {
    const { container } = render(
      createElement(SectionPreview, { sectionType: 'stat-card' })
    )
    const outer = container.firstElementChild as HTMLElement
    expect(outer?.style.pointerEvents).toBe('none')
  })

  it('respects custom width and height', () => {
    const { container } = render(
      createElement(SectionPreview, {
        sectionType: 'divider',
        width: 320,
        height: 200,
      })
    )
    const outer = container.firstElementChild as HTMLElement
    expect(outer?.style.width).toBe('320px')
    expect(outer?.style.height).toBe('200px')
  })

  it('uses light theme by default', () => {
    const { container } = render(
      createElement(SectionPreview, { sectionType: 'info-block' })
    )
    const themeDiv = container.querySelector('[data-wf-theme="light"]')
    expect(themeDiv).not.toBeNull()
  })
})
