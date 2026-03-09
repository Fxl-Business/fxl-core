// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { render, screen } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { WireframeThemeProvider, useWireframeTheme } from './wireframe-theme'

const STORAGE_KEY = 'fxl_wf_theme'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(WireframeThemeProvider, null, children)
}

describe('WireframeThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a div with data-wf-theme="light" by default', () => {
    render(
      createElement(WireframeThemeProvider, null, createElement('span', { 'data-testid': 'child' }, 'hello'))
    )
    const child = screen.getByTestId('child')
    const container = child.closest('[data-wf-theme]')
    expect(container).not.toBeNull()
    expect(container?.getAttribute('data-wf-theme')).toBe('light')
  })

  it('reads stored theme from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'dark')
    render(
      createElement(WireframeThemeProvider, null, createElement('span', { 'data-testid': 'child' }, 'hello'))
    )
    const child = screen.getByTestId('child')
    const container = child.closest('[data-wf-theme]')
    expect(container?.getAttribute('data-wf-theme')).toBe('dark')
  })

  it('toggle switches between light and dark', () => {
    const { result } = renderHook(() => useWireframeTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggle()
    })
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggle()
    })
    expect(result.current.theme).toBe('light')
  })

  it('setTheme changes theme to dark', () => {
    const { result } = renderHook(() => useWireframeTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.setTheme('dark')
    })
    expect(result.current.theme).toBe('dark')
  })

  it('persists theme to localStorage on change', () => {
    const { result } = renderHook(() => useWireframeTheme(), { wrapper })

    act(() => {
      result.current.setTheme('dark')
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
  })

  it('useWireframeTheme throws outside provider', () => {
    expect(() => {
      renderHook(() => useWireframeTheme())
    }).toThrow('useWireframeTheme must be used within WireframeThemeProvider')
  })
})
