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
}

const MOCK_DATA = [
  { month: 'Jan', bar: 42, line: 38 },
  { month: 'Fev', bar: 55, line: 47 },
  { month: 'Mar', bar: 61, line: 52 },
  { month: 'Abr', bar: 48, line: 44 },
  { month: 'Mai', bar: 70, line: 63 },
  { month: 'Jun', bar: 65, line: 58 },
  { month: 'Jul', bar: 74, line: 66 },
  { month: 'Ago', bar: 80, line: 71 },
  { month: 'Set', bar: 68, line: 60 },
  { month: 'Out', bar: 85, line: 76 },
  { month: 'Nov', bar: 90, line: 82 },
  { month: 'Dez', bar: 78, line: 72 },
]

export default function BarLineChart({ title, type, height = 250 }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={MOCK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="bar" fill="#d1d5db" radius={[3, 3, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={MOCK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="line" stroke="#9ca3af" strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <ComposedChart data={MOCK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
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
