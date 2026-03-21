import type { ModuleStatus } from '@platform/module-loader/registry'

/**
 * Serializable node for SVG diagram — no LucideIcon, no React.ComponentType.
 * Icon is resolved at render time from MODULE_REGISTRY.
 */
export interface GraphNode {
  id: string
  label: string
  status: ModuleStatus
  x: number
  y: number
}

/**
 * Directed edge: source module declares the extension, target is the required module.
 */
export interface GraphEdge {
  source: string
  target: string
  extensionId: string
  slot: string
}

/**
 * Complete graph data derived from MODULE_REGISTRY.
 */
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
