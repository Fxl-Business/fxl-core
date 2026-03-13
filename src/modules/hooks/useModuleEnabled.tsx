import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import type { ModuleId } from '@/modules/registry'
import { MODULE_IDS } from '@/modules/module-ids'

const STORAGE_KEY = 'fxl-enabled-modules'

// All modules enabled by default
const ALL_MODULE_IDS: ModuleId[] = Object.values(MODULE_IDS)

function loadEnabledModules(): Set<ModuleId> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return new Set(ALL_MODULE_IDS)
    const parsed = JSON.parse(stored) as string[]
    // Validate that stored IDs are valid ModuleIds
    const valid = parsed.filter((id): id is ModuleId =>
      ALL_MODULE_IDS.includes(id as ModuleId)
    )
    return new Set(valid)
  } catch {
    return new Set(ALL_MODULE_IDS)
  }
}

function persistEnabledModules(enabled: Set<ModuleId>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...enabled]))
}

interface ModuleEnabledContextValue {
  enabledModules: Set<ModuleId>
  toggleModule: (id: ModuleId) => void
  isEnabled: (id: ModuleId) => boolean
}

const ModuleEnabledContext = createContext<ModuleEnabledContextValue | null>(null)

export function ModuleEnabledProvider({ children }: { children: ReactNode }) {
  const [enabledModules, setEnabledModules] = useState<Set<ModuleId>>(loadEnabledModules)

  const toggleModule = useCallback((id: ModuleId) => {
    setEnabledModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      persistEnabledModules(next)
      return next
    })
  }, [])

  const isEnabled = useCallback((id: ModuleId) => {
    return enabledModules.has(id)
  }, [enabledModules])

  return (
    <ModuleEnabledContext.Provider value={{ enabledModules, toggleModule, isEnabled }}>
      {children}
    </ModuleEnabledContext.Provider>
  )
}

export function useModuleEnabled(): ModuleEnabledContextValue {
  const ctx = useContext(ModuleEnabledContext)
  if (!ctx) {
    throw new Error('useModuleEnabled must be used within ModuleEnabledProvider')
  }
  return ctx
}

export function useIsModuleEnabled(id: ModuleId): boolean {
  const { isEnabled } = useModuleEnabled()
  return isEnabled(id)
}
