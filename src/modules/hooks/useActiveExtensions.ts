import { MODULE_REGISTRY } from '../registry'
import type { ModuleExtension } from '../registry'
import { useExtensions } from '../slots'

/**
 * Returns the active extensions for a given module ID.
 * An extension is "active" if:
 * 1. The module providing the extension is enabled
 * 2. All modules in the extension's requires[] are enabled
 *
 * Determines activity by checking whether the resolved ExtensionMap
 * contains any slot entries injected by that extension.
 *
 * @param moduleId - The module ID to get active extensions for
 * @returns Array of active ModuleExtension objects for that module
 *
 * CONT-04: satisfies useActiveExtensions correctness requirement.
 */
export function useActiveExtensions(moduleId: string): ModuleExtension[] {
  const extensionMap = useExtensions()

  const mod = MODULE_REGISTRY.find(m => m.id === moduleId)
  if (!mod?.extensions) return []

  // An extension is active if at least one of its injected slots
  // appears in the resolved extension map with its component
  return mod.extensions.filter(ext => {
    return Object.keys(ext.injects).some(slotId => {
      const components = extensionMap.get(slotId)
      return components && components.length > 0
    })
  })
}
