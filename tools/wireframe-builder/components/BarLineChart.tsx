import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  type: 'bar' | 'line' | 'bar-line'
  xLabel?: string
  yLabel?: string
  height?: number
  categories?: string[]
}

const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function buildMockData(categories: string[]) {
  return categories.map((cat, i) => ({
    category: cat,
    bar: 40 + Math.round(Math.sin(i * 0.8) * 20 + i * 4),
    line: 35 + Math.round(Math.sin(i * 0.6) * 18 + i * 3.5),
  }))
}

export default function BarLineChart({ title, type, height = 250, categories, xLabel, yLabel }: Props) {
  const data = buildMockData(categories ?? DEFAULT_CATEGORIES)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <Tooltip />
            <Bar dataKey="bar" fill="#d1d5db" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <Tooltip />
            <Line type="monotone" dataKey="line" stroke="#9ca3af" strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -5, fontSize: 10 } : undefined} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 } : undefined} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar yAxisId="left" dataKey="bar" fill="#d1d5db" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="line" stroke="#6b7280" strokeWidth={2} dot={false} />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
