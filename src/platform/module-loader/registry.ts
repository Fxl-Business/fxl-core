import React from 'react'
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'
import { docsManifest } from '@modules/docs/manifest'
import { ferramentasManifest } from '@modules/wireframe/manifest'
import { clientsManifest } from '@modules/clients/manifest'
import { knowledgeBaseManifest } from '@modules/knowledge-base/manifest'
import { tasksManifest } from '@modules/tasks/manifest'

export { MODULE_IDS, type ModuleId, SLOT_IDS, type SlotId } from './module-ids'
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

// SLOT_IDS and SlotId re-exported from module-ids.ts (see above)

/**
 * The contract every slot-registered component must satisfy.
 * MUST be defined before ModuleExtension to prevent ComponentType<any> usage.
 */
export interface SlotComponentProps {
  context?: Record<string, string | number | boolean>
  className?: string
}

/**
 * Typed extension descriptor — declares a cross-module capability.
 */
export interface ModuleExtension {
  id: string
  requires: string[]
  description: string
  injects: Record<string, React.ComponentType<SlotComponentProps>>
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

// All manifests now satisfy ModuleDefinition — typed accordingly.
export const MODULE_REGISTRY: ModuleDefinition[] = [
  docsManifest,
  ferramentasManifest,
  clientsManifest,
  knowledgeBaseManifest,
  tasksManifest,
]
