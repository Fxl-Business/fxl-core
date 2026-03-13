/**
 * Module ID constants — zero imports, prevents circular dependency.
 * Every module manifest references its own ID from here.
 * Extension `requires[]` arrays use these constants instead of raw strings.
 */
export const MODULE_IDS = {
  DOCS: 'docs',
  FERRAMENTAS: 'ferramentas',
  CLIENTS: 'clients',
  KNOWLEDGE_BASE: 'knowledge-base',
  TASKS: 'tasks',
} as const

export type ModuleId = typeof MODULE_IDS[keyof typeof MODULE_IDS]
