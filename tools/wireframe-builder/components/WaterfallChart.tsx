import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  Legend,
} from 'recharts'

export interface WaterfallBar {
  label: string
  value: number
  type: 'positive' | 'negative' | 'subtotal'
}

interface WaterfallChartProps {
  title: string
  bars: WaterfallBar[]
  height?: number
  compareMode?: boolean
  compareBars?: WaterfallBar[]
  comparePeriodLabel?: string
  /** Brand colors for subtotal and positive bars. Negative (red) stays semantic. */
  chartColors?: { primary: string; accent: string }
}

const DEFAULT_FILL: Record<WaterfallBar['type'], string> = {
  positive: 'var(--wf-positive)',
  negative: 'var(--wf-negative)',
  subtotal: 'var(--wf-chart-1)',
}

const DEFAULT_FILL_COMPARE: Record<WaterfallBar['type'], string> = {
  positive: 'color-mix(in srgb, var(--wf-positive) 40%, transparent)',
  negative: 'color-mix(in srgb, var(--wf-negative) 40%, transparent)',
  subtotal: 'color-mix(in srgb, var(--wf-chart-1) 40%, transparent)',
}

function resolveFill(chartColors?: { primary: string; accent: string }) {
  const fill: Record<WaterfallBar['type'], string> = {
    subtotal: chartColors?.primary ?? DEFAULT_FILL.subtotal,
    positive: chartColors?.accent ?? DEFAULT_FILL.positive,
    negative: DEFAULT_FILL.negative, // semantic red -- never branded
  }
  const fillCompare: Record<WaterfallBar['type'], string> = {
    subtotal: chartColors?.primary ? `${chartColors.primary}66` : DEFAULT_FILL_COMPARE.subtotal,
    positive: chartColors?.accent ? `${chartColors.accent}66` : DEFAULT_FILL_COMPARE.positive,
    negative: DEFAULT_FILL_COMPARE.negative, // semantic -- never branded
  }
  return { fill, fillCompare }
}

function formatK(v: number) {
  return `${(v / 1000).toFixed(0)}k`
}

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v)
}

function processData(bars: WaterfallBar[], fill: Record<WaterfallBar['type'], string>) {
  let running = 0
  return bars.map((bar) => {
    let spacer: number
    let barValue: number

    if (bar.type === 'subtotal') {
      spacer = 0
      barValue = bar.value
    } else if (bar.value >= 0) {
      spacer = running
      barValue = bar.value
      running += bar.value
    } else {
      const next = running + bar.value
      spacer = next
      barValue = Math.abs(bar.value)
      running = next
    }

    return {
      label: bar.label,
      spacer,
      barValue,
      fill: fill[bar.type],
      display: bar.value,
    }
  })
}

function buildGroupedData(
  bars: WaterfallBar[],
  compareBars: WaterfallBar[],
  fill: Record<WaterfallBar['type'], string>,
  fillCompare: Record<WaterfallBar['type'], string>,
) {
  return bars.map((bar, i) => {
    const cmp = compareBars[i]
    return {
      label: bar.label,
      current: Math.abs(bar.value),
      compare: cmp ? Math.abs(cmp.value) : 0,
      fillCurrent: fill[bar.type],
      fillCompare: fillCompare[bar.type],
      displayCurrent: bar.value,
      displayCompare: cmp ? cmp.value : 0,
    }
  })
}

interface TooltipPayloadEntry {
  name: string
  payload: { display: number }
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const entry = payload.find((p) => p.name === 'barValue')
  if (!entry) return null
  return (
    <div className="rounded border border-wf-card-border bg-wf-card px-3 py-2 text-xs">
      <p className="font-semibold text-wf-heading">{label}</p>
      <p className="text-wf-body">{formatBRL(entry.payload.display)}</p>
    </div>
  )
}

interface GroupedTooltipPayload {
  name: string
  value: number
  payload: { displayCurrent: number; displayCompare: number }
}

function GroupedTooltip({
  active,
  payload,
  label,
  comparePeriodLabel,
}: {
  active?: boolean
  payload?: GroupedTooltipPayload[]
  label?: string
  comparePeriodLabel?: string
}) {
  if (!active || !payload?.length) return null
  const cur = payload.find((p) => p.name === 'current')
  const cmp = payload.find((p) => p.name === 'compare')
  return (
    <div className="rounded border border-wf-card-border bg-wf-card px-3 py-2 text-xs">
      <p className="mb-1 font-semibold text-wf-heading">{label}</p>
      {cur && (
        <p className="text-wf-body">Mês Atual: {formatBRL(cur.payload.displayCurrent)}</p>
      )}
      {cmp && (
        <p className="text-wf-muted">
          {comparePeriodLabel ?? 'Período Anterior'}: {formatBRL(cmp.payload.displayCompare)}
        </p>
      )}
    </div>
  )
}

function CustomLabel(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value = 0 } = props
  const text = formatBRL(Math.abs(value))
  return (
    <text x={x + width / 2} y={y - 4} fill="var(--wf-heading)" fontSize={9} textAnchor="middle">
      {text}
    </text>
  )
}

export default function WaterfallChart({
  title,
  bars,
  height = 260,
  compareMode = false,
  compareBars,
  comparePeriodLabel = 'Período Anterior',
  chartColors,
}: WaterfallChartProps) {
  const { fill, fillCompare } = resolveFill(chartColors)

  if (compareMode && compareBars && compareBars.length > 0) {
    const groupedData = buildGroupedData(bars, compareBars, fill, fillCompare)

    return (
      <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-wf-heading">{title}</p>
          <div className="flex items-center gap-3 text-xs text-wf-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Mês Atual
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-200" />
              {comparePeriodLabel}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={groupedData}
            margin={{ top: 24, right: 8, left: 8, bottom: 4 }}
            barCategoryGap="20%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatK}
            />
            <Tooltip content={<GroupedTooltip comparePeriodLabel={comparePeriodLabel} />} />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Bar dataKey="current" name="current" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {groupedData.map((entry, i) => (
                <Cell key={i} fill={entry.fillCurrent} />
              ))}
              <LabelList dataKey="displayCurrent" content={<CustomLabel />} />
            </Bar>
            <Bar dataKey="compare" name="compare" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {groupedData.map((entry, i) => (
                <Cell key={i} fill={entry.fillCompare} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const data = processData(bars, fill)

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatK}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="spacer" stackId="wf" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="barValue" stackId="wf" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="display" content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
