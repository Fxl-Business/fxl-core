import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { SparklineGridItem } from '../types/blueprint'

type Props = {
  title: string
  columns?: number
  items: SparklineGridItem[]
  chartColors?: string[]
}

export default function SparklineGridComponent({ title, columns = 3, items, chartColors }: Props) {
  const lineColor = chartColors?.[0] ?? 'var(--wf-chart-1)'

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '1rem',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{ border: '1px solid var(--wf-border)' }}
          >
            <p
              className="text-xs"
              style={{ color: 'var(--wf-muted)' }}
            >
              {item.label}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: 'var(--wf-heading)' }}
            >
              {item.value}
            </p>
            <ResponsiveContainer width="100%" height={40}>
              <LineChart
                data={item.data.map((v) => ({ v }))}
                margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
              >
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={lineColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
