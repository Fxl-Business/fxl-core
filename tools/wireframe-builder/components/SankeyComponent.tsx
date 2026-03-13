import { useRef, useState, useEffect } from 'react'
import { Sankey, Tooltip } from 'recharts'

type SankeyNode = { name: string }
type SankeyLink = { source: number; target: number; value: number }

type Props = {
  title: string
  height?: number
  nodes?: SankeyNode[]
  links?: SankeyLink[]
  chartColors?: string[]
}

// links use integer array indices into nodes[], not string names
const DEFAULT_NODES: SankeyNode[] = [
  { name: 'Vendas Diretas' },
  { name: 'Parceiros' },
  { name: 'Online' },
  { name: 'Produto A' },
  { name: 'Produto B' },
  { name: 'Servicos' },
]

const DEFAULT_LINKS: SankeyLink[] = [
  { source: 0, target: 3, value: 40 },
  { source: 0, target: 4, value: 20 },
  { source: 1, target: 3, value: 15 },
  { source: 1, target: 5, value: 25 },
  { source: 2, target: 4, value: 30 },
  { source: 2, target: 5, value: 10 },
]

const DEFAULT_PALETTE = [
  'var(--wf-chart-1)',
  'var(--wf-chart-2)',
  'var(--wf-chart-3)',
  'var(--wf-chart-4)',
  'var(--wf-chart-5)',
]

export default function SankeyComponent({
  title,
  height = 300,
  nodes,
  links,
  chartColors,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(400)
  const palette = chartColors ?? DEFAULT_PALETTE

  const sankeyNodes = nodes ?? DEFAULT_NODES
  const sankeyLinks = links ?? DEFAULT_LINKS

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const data = {
    nodes: sankeyNodes.map((n) => ({ ...n })),
    links: sankeyLinks.map((l) => ({ ...l })),
  }

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <div ref={containerRef}>
        <Sankey
          width={width}
          height={height}
          data={data}
          nodePadding={24}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          link={{ stroke: 'var(--wf-border)' }}
          node={{
            fill: palette[0],
            stroke: 'none',
          }}
        >
          <Tooltip
            contentStyle={{
              background: 'var(--wf-card)',
              border: '1px solid var(--wf-card-border)',
              color: 'var(--wf-heading)',
            }}
          />
        </Sankey>
      </div>
    </div>
  )
}
