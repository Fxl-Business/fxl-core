/**
 * Module ID constants — zero imports, prevents circular dependency.
 * Every module manifest references its own ID from here.
 * Extension `requires[]` arrays use these constants instead of raw strings.
 */
export const MODULE_IDS = {
  DOCS: 'docs',
  FERRAMENTAS: 'ferramentas',
  CLIENTS: 'clients',
  TASKS: 'tasks',
} as const

export type ModuleId = typeof MODULE_IDS[keyof typeof MODULE_IDS]

/**
 * Slot ID constants — zero imports, prevents circular dependency.
 * Manifests with extensions reference these instead of importing from registry.
 */
export const SLOT_IDS = {
  HOME_DASHBOARD: 'home.dashboard',
  HOME_QUICK_ACTIONS: 'home.quick-actions',
} as const

export type SlotId = typeof SLOT_IDS[keyof typeof SLOT_IDS]
