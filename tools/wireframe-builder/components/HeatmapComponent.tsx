import type { HeatmapRow } from '../types/blueprint'

type Props = {
  title: string
  rows: HeatmapRow[]
  colLabels?: string[]
  height?: number
  chartColors?: string[]
}

export default function HeatmapComponent({ title, rows, colLabels, chartColors }: Props) {
  const baseColor = chartColors?.[0] ?? 'var(--wf-chart-1)'
  const colCount = colLabels?.length ?? rows[0]?.cells.length ?? 0

  // Compute global min/max across all cells
  let minVal = Infinity
  let maxVal = -Infinity
  for (const row of rows) {
    for (const cell of row.cells) {
      if (cell < minVal) minVal = cell
      if (cell > maxVal) maxVal = cell
    }
  }

  function intensity(value: number): number {
    if (maxVal <= minVal) return 50
    return ((value - minVal) / (maxVal - minVal)) * 100
  }

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>

      <div
        className="gap-1"
        style={{
          display: 'grid',
          gridTemplateColumns: `auto repeat(${colCount}, 1fr)`,
        }}
      >
        {/* Header row: empty corner + column labels */}
        <div />
        {(colLabels ?? rows[0]?.cells.map((_, i) => `${i + 1}`) ?? []).map(
          (label, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-medium"
              style={{ color: 'var(--wf-muted)' }}
            >
              {label}
            </div>
          )
        )}

        {/* Data rows */}
        {rows.map((row, ri) => {
          return (
            <div key={ri} className="contents">
              {/* Row label */}
              <div
                className="flex items-center justify-end pr-2 text-xs"
                style={{ color: 'var(--wf-muted)' }}
              >
                {row.label}
              </div>

              {/* Cells */}
              {row.cells.map((cell, ci) => {
                const pct = intensity(cell)
                return (
                  <div
                    key={ci}
                    className="flex items-center justify-center rounded-sm aspect-square min-h-[28px]"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${baseColor} ${pct}%, var(--wf-card))`,
                    }}
                    title={String(cell)}
                  >
                    <span
                      className="text-[10px] font-medium"
                      style={{
                        color: pct > 70 ? 'white' : 'var(--wf-heading)',
                      }}
                    >
                      {cell}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
