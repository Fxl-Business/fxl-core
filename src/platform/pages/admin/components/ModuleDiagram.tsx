import { useEffect, useMemo, useState } from 'react'
import { MODULE_REGISTRY } from '@platform/module-loader/registry'
import { buildGraph } from './diagram-utils'
import type { GraphNode, GraphEdge } from './diagram-types'

// ---------------------------------------------------------------------------
// Dark mode detection hook
// ---------------------------------------------------------------------------

function useDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

// ---------------------------------------------------------------------------
// Status badge colors (SVG inline — not Tailwind classes)
// ---------------------------------------------------------------------------

const STATUS_FILLS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  active: { bg: '#ecfdf5', text: '#047857', darkBg: '#064e3b', darkText: '#34d399' },
  beta: { bg: '#fffbeb', text: '#b45309', darkBg: '#78350f', darkText: '#fbbf24' },
  'coming-soon': { bg: '#f1f5f9', text: '#64748b', darkBg: '#1e293b', darkText: '#94a3b8' },
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  beta: 'Beta',
  'coming-soon': 'Em breve',
}

// ---------------------------------------------------------------------------
// Node dimensions
// ---------------------------------------------------------------------------

const NODE_W = 160
const NODE_H = 56

// ---------------------------------------------------------------------------
// DiagramEdge
// ---------------------------------------------------------------------------

interface DiagramEdgeProps {
  edge: GraphEdge
  sourceNode: GraphNode
  targetNode: GraphNode
  isHighlighted: boolean
  isDimmed: boolean
  isDark: boolean
}

function DiagramEdge({ edge, sourceNode, targetNode, isHighlighted, isDimmed, isDark }: DiagramEdgeProps) {
  const x1 = sourceNode.x + NODE_W / 2
  const y1 = sourceNode.y + NODE_H / 2
  const x2 = targetNode.x + NODE_W / 2
  const y2 = targetNode.y + NODE_H / 2

  const defaultStroke = isDark ? '#64748b' : '#94a3b8'
  const stroke = isHighlighted ? '#6366f1' : defaultStroke
  const opacity = isDimmed ? 0.15 : 1
  const strokeWidth = isHighlighted ? 2 : 1
  const markerId = isHighlighted ? 'arrowhead-highlighted' : (isDark ? 'arrowhead-dark' : 'arrowhead')

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      markerEnd={`url(#${markerId})`}
      style={{ transition: 'opacity 200ms, stroke 200ms' }}
      data-edge-id={`${edge.source}-${edge.target}`}
    />
  )
}

// ---------------------------------------------------------------------------
// DiagramNode
// ---------------------------------------------------------------------------

interface DiagramNodeProps {
  node: GraphNode
  isHovered: boolean
  isDimmed: boolean
  isDark: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick?: () => void
}

function DiagramNode({ node, isHovered, isDimmed, isDark, onMouseEnter, onMouseLeave, onClick }: DiagramNodeProps) {
  const rectFill = isDark ? '#1e293b' : '#ffffff'
  const rectStroke = isHovered ? '#6366f1' : (isDark ? '#334155' : '#e2e8f0')
  const rectStrokeWidth = isHovered ? 2 : 1
  const labelFill = isDark ? '#f8fafc' : '#1e293b'
  const opacity = isDimmed ? 0.35 : 1

  const statusKey = node.status
  const fills = STATUS_FILLS[statusKey] ?? STATUS_FILLS.active
  const badgeBg = isDark ? fills.darkBg : fills.bg
  const badgeText = isDark ? fills.darkText : fills.text
  const statusLabel = STATUS_LABELS[statusKey] ?? statusKey

  // Badge dimensions
  const badgeW = 48
  const badgeH = 16
  const badgeX = node.x + (NODE_W - badgeW) / 2
  const badgeY = node.y + 34

  return (
    <g
      data-module-id={node.id}
      style={{ cursor: 'pointer', opacity, transition: 'opacity 200ms' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Node rectangle */}
      <rect
        x={node.x}
        y={node.y}
        width={NODE_W}
        height={NODE_H}
        rx={12}
        fill={rectFill}
        stroke={rectStroke}
        strokeWidth={rectStrokeWidth}
      />

      {/* Module label */}
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 20}
        textAnchor="middle"
        fill={labelFill}
        fontSize={13}
        fontWeight={600}
      >
        {node.label}
      </text>

      {/* Status badge background */}
      <rect
        x={badgeX}
        y={badgeY}
        width={badgeW}
        height={badgeH}
        rx={4}
        fill={badgeBg}
      />

      {/* Status badge text */}
      <text
        x={badgeX + badgeW / 2}
        y={badgeY + 12}
        textAnchor="middle"
        fill={badgeText}
        fontSize={9}
        fontWeight={500}
        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {statusLabel}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// ModuleDiagram
// ---------------------------------------------------------------------------

interface ModuleDiagramProps {
  onNodeClick?: (moduleId: string) => void
}

export default function ModuleDiagram({ onNodeClick }: ModuleDiagramProps) {
  const { nodes, edges } = useMemo(() => buildGraph(MODULE_REGISTRY), [])
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const isDark = useDarkMode()

  // Compute connected node IDs when hovering
  const connectedNodeIds = useMemo(() => {
    if (hoveredNodeId === null) return new Set<string>()
    const connected = new Set<string>()
    for (const edge of edges) {
      if (edge.source === hoveredNodeId || edge.target === hoveredNodeId) {
        connected.add(edge.source)
        connected.add(edge.target)
      }
    }
    return connected
  }, [hoveredNodeId, edges])

  // Build a lookup for nodes by id
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>()
    for (const n of nodes) {
      map.set(n.id, n)
    }
    return map
  }, [nodes])

  return (
    <svg
      viewBox="0 0 700 300"
      className="w-full h-auto"
      role="img"
      aria-label="Diagrama de dependencias entre modulos"
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
        </marker>
        <marker id="arrowhead-dark" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
        </marker>
        <marker id="arrowhead-highlighted" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>

      {/* Edges rendered first (behind nodes) */}
      {edges.map(edge => {
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)
        if (!sourceNode || !targetNode) return null

        const isHighlighted = hoveredNodeId !== null && (edge.source === hoveredNodeId || edge.target === hoveredNodeId)
        const edgeIsDimmed = hoveredNodeId !== null && !isHighlighted

        return (
          <DiagramEdge
            key={`${edge.source}-${edge.target}-${edge.extensionId}`}
            edge={edge}
            sourceNode={sourceNode}
            targetNode={targetNode}
            isHighlighted={isHighlighted}
            isDimmed={edgeIsDimmed}
            isDark={isDark}
          />
        )
      })}

      {/* Nodes rendered on top */}
      {nodes.map(node => {
        const isHovered = node.id === hoveredNodeId
        const nodeIsDimmed = hoveredNodeId !== null && node.id !== hoveredNodeId && !connectedNodeIds.has(node.id)

        return (
          <DiagramNode
            key={node.id}
            node={node}
            isHovered={isHovered}
            isDimmed={nodeIsDimmed}
            isDark={isDark}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
            onClick={() => onNodeClick?.(node.id)}
          />
        )
      })}
    </svg>
  )
}
