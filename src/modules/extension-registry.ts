import type { ComponentType } from 'react'
import type { ModuleDefinition, SlotComponentProps } from './registry'

export type ExtensionMap = Map<string, ComponentType<SlotComponentProps>[]>

/**
 * Pure function: resolves which extensions are active based on enabled modules.
 * No React, no side effects — fully unit-testable.
 *
 * For each module in the registry:
 * 1. Skip if module is not in enabledIds
 * 2. For each extension in the module's extensions[]:
 *    a. Check if all requires[] are satisfied (all in enabledIds)
 *    b. If satisfied, add each injects entry to the result map
 *
 * @param registry - The MODULE_REGISTRY array
 * @param enabledIds - Set of currently enabled module IDs
 * @returns Map from slot ID to array of components to render in that slot
 */
export function resolveExtensions(
  registry: ModuleDefinition[],
  enabledIds: Set<string>,
): ExtensionMap {
  const map: ExtensionMap = new Map()

  for (const mod of registry) {
    if (!enabledIds.has(mod.id)) continue
    for (const ext of mod.extensions ?? []) {
      const satisfied = ext.requires.every(id => enabledIds.has(id))
      if (!satisfied) continue
      for (const [slotId, Component] of Object.entries(ext.injects)) {
        const existing = map.get(slotId) ?? []
        map.set(slotId, [...existing, Component])
      }
    }
  }

  return map
}
