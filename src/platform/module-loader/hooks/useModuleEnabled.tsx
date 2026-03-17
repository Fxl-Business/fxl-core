import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ModuleId } from '@platform/module-loader/registry'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import { isOrgMode } from '@platform/auth/auth-config'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'
import { supabase } from '@platform/supabase'

// All modules enabled by default
const ALL_MODULE_IDS: ModuleId[] = Object.values(MODULE_IDS)

// ---------------------------------------------------------------------------
// Context interface (same for both modes)
// ---------------------------------------------------------------------------

interface ModuleEnabledContextValue {
  enabledModules: Set<ModuleId>
  toggleModule: (id: ModuleId) => void
  isEnabled: (id: ModuleId) => boolean
  isLoading: boolean
  error: string | null
}

const ModuleEnabledContext = createContext<ModuleEnabledContextValue | null>(null)

// ---------------------------------------------------------------------------
// Anon Provider — all modules enabled, no toggling
// ---------------------------------------------------------------------------

function AnonModuleEnabledProvider({ children }: { children: ReactNode }) {
  const value: ModuleEnabledContextValue = {
    enabledModules: new Set(ALL_MODULE_IDS),
    toggleModule: () => {},
    isEnabled: () => true,
    isLoading: false,
    error: null,
  }
  return (
    <ModuleEnabledContext.Provider value={value}>
      {children}
    </ModuleEnabledContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Org Provider (Supabase tenant_modules)
// ---------------------------------------------------------------------------

function OrgModuleEnabledProvider({ children }: { children: ReactNode }) {
  const { activeOrg, isLoading: orgLoading } = useActiveOrg()
  const [enabledModules, setEnabledModules] = useState<Set<ModuleId>>(new Set(ALL_MODULE_IDS))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch enabled modules from tenant_modules for the active org
  useEffect(() => {
    if (orgLoading) return
    if (!activeOrg) {
      // No org selected — show all modules as enabled (graceful fallback)
      setEnabledModules(new Set(ALL_MODULE_IDS))
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    async function fetchModules(orgId: string) {
      if (cancelled) return

      const { data, error: fetchError } = await supabase
        .from('tenant_modules')
        .select('module_id, enabled')
        .eq('org_id', orgId)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        // On error, fall back to all enabled
        setEnabledModules(new Set(ALL_MODULE_IDS))
        setIsLoading(false)
        return
      }

      if (!data || data.length === 0) {
        // No rows yet — all modules enabled by default
        setEnabledModules(new Set(ALL_MODULE_IDS))
        setIsLoading(false)
        return
      }

      // Build enabled set from rows where enabled=true
      const enabledSet = new Set<ModuleId>()
      for (const row of data) {
        if (row.enabled && ALL_MODULE_IDS.includes(row.module_id as ModuleId)) {
          enabledSet.add(row.module_id as ModuleId)
        }
      }

      // For modules not in tenant_modules at all, consider them enabled (opt-out model)
      const modulesInDb = new Set(data.map((r: { module_id: string }) => r.module_id))
      for (const moduleId of ALL_MODULE_IDS) {
        if (!modulesInDb.has(moduleId)) {
          enabledSet.add(moduleId)
        }
      }

      setEnabledModules(enabledSet)
      setIsLoading(false)
    }

    fetchModules(activeOrg.id)

    return () => { cancelled = true }
  }, [activeOrg, orgLoading])

  const toggleModule = useCallback(async (id: ModuleId) => {
    if (!activeOrg) return

    const currentlyEnabled = enabledModules.has(id)
    const newEnabled = !currentlyEnabled

    // Optimistic update
    setEnabledModules(prev => {
      const next = new Set(prev)
      if (newEnabled) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })

    // Upsert to Supabase
    const { error: upsertError } = await supabase
      .from('tenant_modules')
      .upsert(
        { org_id: activeOrg.id, module_id: id, enabled: newEnabled },
        { onConflict: 'org_id,module_id' }
      )

    if (upsertError) {
      // Revert optimistic update
      setEnabledModules(prev => {
        const reverted = new Set(prev)
        if (currentlyEnabled) {
          reverted.add(id)
        } else {
          reverted.delete(id)
        }
        return reverted
      })
      setError(upsertError.message)
    }
  }, [activeOrg, enabledModules])

  const isEnabled = useCallback((id: ModuleId) => {
    return enabledModules.has(id)
  }, [enabledModules])

  return (
    <ModuleEnabledContext.Provider value={{ enabledModules, toggleModule, isEnabled, isLoading, error }}>
      {children}
    </ModuleEnabledContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export function ModuleEnabledProvider({ children }: { children: ReactNode }) {
  if (isOrgMode()) {
    return <OrgModuleEnabledProvider>{children}</OrgModuleEnabledProvider>
  }
  return <AnonModuleEnabledProvider>{children}</AnonModuleEnabledProvider>
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
