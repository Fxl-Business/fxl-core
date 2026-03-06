import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

type Entry = { label: string; value: number }

type Props = {
  title: string
  data: Entry[]
  height?: number
  valueLabel?: string
}

export default function ParetoChart({ title, data, height = 250, valueLabel = 'Valor' }: Props) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const total = sorted.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const enriched = sorted.map((d) => {
    acc += d.value
    return { ...d, accumulated: Math.round((acc / total) * 100) }
  })

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={enriched} margin={{ top: 4, right: 32, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === 'accumulated' ? `${value}%` : value.toLocaleString('pt-BR')
            }
            labelFormatter={(l) => l}
          />
          <Bar yAxisId="left" dataKey="value" name={valueLabel} fill="#374151" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="accumulated"
            name="% Acumulado"
            stroke="#DC2626"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#DC2626' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
