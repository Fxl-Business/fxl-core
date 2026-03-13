import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'
import { docsManifest } from './docs/manifest'
import { wireframeBuilderManifest } from './wireframe-builder/manifest'
import { clientsManifest } from './clients/manifest'
import { knowledgeBaseManifest } from './knowledge-base/manifest'
import { tasksManifest } from './tasks/manifest'

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

export const MODULE_REGISTRY: ModuleManifest[] = [
  docsManifest,
  wireframeBuilderManifest,
  clientsManifest,
  knowledgeBaseManifest,
  tasksManifest,
]
