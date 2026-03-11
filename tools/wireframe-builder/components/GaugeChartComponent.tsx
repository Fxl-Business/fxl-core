import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

type Zone = {
  label?: string
  value: number
  color?: string
}

type Props = {
  title: string
  value: number
  min?: number
  max?: number
  zones?: Zone[]
  height?: number
  chartColors?: string[]
}

const RADIAN = Math.PI / 180

export default function GaugeChartComponent({
  title,
  value,
  min,
  max,
  zones,
  height = 200,
  chartColors: _chartColors,
}: Props) {
  const effectiveMin = min ?? 0
  const effectiveMax = max ?? 100
  const total = effectiveMax - effectiveMin

  // Build zone arc data for Pie (value = arc SIZE, not upper bound)
  const zoneData = zones
    ? zones.map((z, i) => {
        const prevBound = i === 0 ? effectiveMin : zones[i - 1].value
        return {
          value: z.value - prevBound,
          fill:
            z.color ??
            (i === 0
              ? 'var(--wf-negative)'
              : i === 1
                ? 'var(--wf-chart-warn)'
                : 'var(--wf-positive)'),
        }
      })
    : [
        { value: total * 0.4, fill: 'var(--wf-negative)' },
        { value: total * 0.3, fill: 'var(--wf-chart-warn)' },
        { value: total * 0.3, fill: 'var(--wf-positive)' },
      ]

  // Needle math: clamp value to [min, max]
  const effectiveValue = Math.min(effectiveMax, Math.max(effectiveMin, value))
  const pct = (effectiveValue - effectiveMin) / (effectiveMax - effectiveMin)
  const angleDeg = 180 - pct * 180 // 180=left (min), 0=right (max)
  const angleRad = angleDeg * RADIAN

  // Needle tip in fixed viewBox coords (center at 100, 99)
  const needleTipX = 100 + 70 * Math.cos(angleRad)
  const needleTipY = 99 - 70 * Math.sin(angleRad) // SVG Y is inverted

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-2 text-sm font-semibold text-wf-heading">{title}</p>
      <p className="mb-1 text-center text-2xl font-bold text-wf-heading">{value}</p>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={zoneData}
              startAngle={180}
              endAngle={0}
              innerRadius="55%"
              outerRadius="75%"
              cx="50%"
              cy="90%"
              dataKey="value"
              isAnimationActive={false}
              strokeWidth={0}
            >
              {zoneData.map((zone, i) => (
                <Cell key={i} fill={zone.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* SVG needle overlay — absolutely positioned over chart */}
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%"
          height="100%"
          viewBox="0 0 200 110"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* needle line */}
          <line
            x1={100}
            y1={99}
            x2={needleTipX}
            y2={needleTipY}
            stroke="var(--wf-heading)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* needle pivot circle */}
          <circle cx={100} cy={99} r={4} fill="var(--wf-heading)" />
        </svg>
      </div>
    </div>
  )
}
