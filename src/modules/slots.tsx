import React, { useMemo, createContext, useContext } from 'react'
import type { ComponentType } from 'react'
import type { SlotComponentProps } from './registry'
import { MODULE_REGISTRY } from './registry'
import { resolveExtensions } from './extension-registry'
import type { ExtensionMap } from './extension-registry'
import { useModuleEnabled } from './hooks/useModuleEnabled'

const ExtensionContext = createContext<ExtensionMap>(new Map())

/**
 * Provides the resolved extension map to all descendants.
 *
 * Must be mounted INSIDE ModuleEnabledProvider (so useModuleEnabled works),
 * INSIDE BrowserRouter (so slot components can use routing),
 * and OUTSIDE Routes (so all routes including /admin/modules share the same map).
 */
export function ExtensionProvider({ children }: { children: React.ReactNode }) {
  const { enabledModules } = useModuleEnabled()
  const map = useMemo(
    () => resolveExtensions(MODULE_REGISTRY, enabledModules),
    [enabledModules],
  )
  return <ExtensionContext.Provider value={map}>{children}</ExtensionContext.Provider>
}

/**
 * Low-level hook — returns the full ExtensionMap.
 * Prefer useActiveExtensions(moduleId) for module-scoped access.
 */
export function useExtensions(): ExtensionMap {
  return useContext(ExtensionContext)
}

/**
 * Renders all components injected into a given slot ID.
 * Returns null (not an empty fragment) when no extensions are registered.
 *
 * CONT-03: satisfies the ExtensionSlot null-graceful requirement.
 */
export function ExtensionSlot({
  id,
  context,
  className,
}: {
  id: string
  context?: Record<string, string | number | boolean>
  className?: string
}) {
  const map = useContext(ExtensionContext)
  const components = map.get(id) as ComponentType<SlotComponentProps>[] | undefined
  if (!components || components.length === 0) return null
  return (
    <>
      {components.map((Component, i) => (
        <Component key={i} context={context} className={className} />
      ))}
    </>
  )
}
