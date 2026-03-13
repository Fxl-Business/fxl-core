import { useState, useCallback } from 'react'

export type PickerMode = 'preview' | 'compact'

const STORAGE_KEY = 'fxl_picker_mode'

function readStoredMode(): PickerMode {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored === 'preview' || stored === 'compact' ? stored : 'preview'
  } catch {
    // SSR or sessionStorage unavailable
    return 'preview'
  }
}

function persistMode(mode: PickerMode) {
  try {
    sessionStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // sessionStorage unavailable — silent fail
  }
}

export function usePickerMode(): {
  mode: PickerMode
  setMode: (mode: PickerMode) => void
  toggleMode: () => void
} {
  const [mode, setModeState] = useState<PickerMode>(readStoredMode)

  const setMode = useCallback((next: PickerMode) => {
    setModeState(next)
    persistMode(next)
  }, [])

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'preview' ? 'compact' : 'preview'
      persistMode(next)
      return next
    })
  }, [])

  return { mode, setMode, toggleMode }
}
