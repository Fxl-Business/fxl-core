import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type React from 'react'

export type WireframeTheme = 'light' | 'dark'

type WireframeThemeContextValue = {
  theme: WireframeTheme
  toggle: () => void
  setTheme: (theme: WireframeTheme) => void
}

const WireframeThemeContext = createContext<WireframeThemeContextValue | null>(null)

const STORAGE_KEY = 'fxl_wf_theme'

function readStoredTheme(fallback: WireframeTheme): WireframeTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : fallback
  } catch {
    // SSR or localStorage unavailable
    return fallback
  }
}

export function WireframeThemeProvider({
  children,
  defaultTheme = 'light',
  wfOverrides,
}: {
  children: ReactNode
  defaultTheme?: WireframeTheme
  wfOverrides?: React.CSSProperties
}) {
  const [theme, setThemeState] = useState<WireframeTheme>(() =>
    readStoredTheme(defaultTheme),
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage unavailable — silent fail
    }
  }, [theme])

  const toggle = () => setThemeState((t) => (t === 'light' ? 'dark' : 'light'))

  const setTheme = (next: WireframeTheme) => setThemeState(next)

  return (
    <WireframeThemeContext.Provider value={{ theme, toggle, setTheme }}>
      <div data-wf-theme={theme} style={wfOverrides}>
        {children}
      </div>
    </WireframeThemeContext.Provider>
  )
}

export function useWireframeTheme(): WireframeThemeContextValue {
  const ctx = useContext(WireframeThemeContext)
  if (!ctx) throw new Error('useWireframeTheme must be used within WireframeThemeProvider')
  return ctx
}
