import type { ModuleDefinition } from '@platform/module-loader/registry'
import type { GraphData, GraphNode, GraphEdge } from './diagram-types'

/**
 * Fixed layout positions for diagram nodes.
 * 2-row x 3-column grid layout, centered in a 600x300 viewBox.
 * Nodes are 160x56, spaced 200px horizontally and 120px vertically.
 */
const NODE_POSITIONS: [number, number][] = [
  [100, 60],   // row 0, col 0
  [300, 60],   // row 0, col 1
  [500, 60],   // row 0, col 2
  [100, 200],  // row 1, col 0
  [300, 200],  // row 1, col 1
  [500, 200],  // row 1, col 2
]

/**
 * Derives graph data from MODULE_REGISTRY.
 *
 * Node mapping: Each module becomes a GraphNode at a fixed grid position.
 * Edge mapping: For each extension, create an edge from the declaring module
 * to each module in requires[] — but ONLY if:
 *   1. The required ID exists in the registry (filter out slot IDs)
 *   2. The required ID is different from the declaring module (no self-edges)
 *
 * Current reality: tasks and connector both self-reference in requires[],
 * so the diagram will have 6 nodes and 0 edges. When cross-module
 * dependencies are added, edges will appear automatically.
 */
export function buildGraph(registry: ModuleDefinition[]): GraphData {
  const moduleIds = new Set<string>(registry.map(m => m.id))

  const nodes: GraphNode[] = registry.map((mod, index) => ({
    id: mod.id,
    label: mod.label,
    status: mod.status,
    x: NODE_POSITIONS[index]?.[0] ?? 100 + (index % 3) * 200,
    y: NODE_POSITIONS[index]?.[1] ?? 60 + Math.floor(index / 3) * 140,
  }))

  const edges: GraphEdge[] = []

  for (const mod of registry) {
    for (const ext of mod.extensions ?? []) {
      const slotIds = Object.keys(ext.injects)
      for (const reqId of ext.requires) {
        // Filter: must be a real module (not a slot) and not self-referencing
        if (!moduleIds.has(reqId)) continue
        if (reqId === mod.id) continue
        edges.push({
          source: mod.id,
          target: reqId,
          extensionId: ext.id,
          slot: slotIds[0] ?? '',
        })
      }
    }
  }

  return { nodes, edges }
}
