import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'
import { docsManifest } from './docs/manifest'
import { ferramentasManifest } from './ferramentas/manifest'
import { clientsManifest } from './clients/manifest'
import { knowledgeBaseManifest } from './knowledge-base/manifest'
import { tasksManifest } from './tasks/manifest'

export { MODULE_IDS, type ModuleId } from './module-ids'
import type { ModuleId } from './module-ids'

export type ModuleStatus = 'active' | 'beta' | 'coming-soon'

export interface NavItem {
  label: string
  href?: string
  external?: boolean
  children?: NavItem[]
}

export interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
}

/**
 * Typed extension descriptor — declares a cross-module capability.
 * The `injects` field will be added in Phase 39 when SlotComponentProps is defined.
 */
export interface ModuleExtension {
  id: string
  description: string
  requires: ModuleId[]
}

/**
 * Full module definition — extends ModuleManifest with registry metadata.
 * Plan 02 will update each manifest to satisfy this interface.
 */
export interface ModuleDefinition extends ModuleManifest {
  id: ModuleId
  description: string
  badge?: number
  enabled?: boolean
  extensions?: ModuleExtension[]
}

// Current registry — backward compatible (manifests still typed as ModuleManifest).
// Plan 02 will update all manifests to ModuleDefinition and then change this type.
export const MODULE_REGISTRY: ModuleManifest[] = [
  docsManifest,
  ferramentasManifest,
  clientsManifest,
  knowledgeBaseManifest,
  tasksManifest,
]
