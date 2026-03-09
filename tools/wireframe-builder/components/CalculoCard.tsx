export interface CalculoRow {
  operator?: '(-)' | '(=)' | '(+)'
  label: string
  value: string
  pct?: string
  highlight?: boolean
  valueCompare?: string
  variation?: string
  variationPositive?: boolean
}

interface CalculoCardProps {
  title?: string
  rows: CalculoRow[]
  compareMode?: boolean
  comparePeriodLabel?: string
}

function isNegativeValue(v: string) {
  return v.startsWith('(') || v.startsWith('-')
}

export default function CalculoCard({
  title,
  rows,
  compareMode,
  comparePeriodLabel,
}: CalculoCardProps) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card">
      {title && (
        <div className="border-b border-wf-card-border px-4 py-2">
          <p className="text-sm font-semibold text-wf-heading">{title}</p>
        </div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-wf-table-header text-wf-table-header-fg">
            <th className="px-3 py-2 text-left font-medium">Resumo</th>
            <th className="px-3 py-2 text-right font-medium">Valores</th>
            <th className="px-3 py-2 text-right font-medium">% s/ Faturamento</th>
            {compareMode && (
              <>
                <th className="px-3 py-2 text-right font-medium">
                  {comparePeriodLabel ?? 'Período Anterior'}
                </th>
                <th className="px-3 py-2 text-right font-medium">Var. %</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const bgClass = row.highlight
              ? 'font-semibold border-t'
              : i % 2 === 0
                ? 'bg-wf-card'
                : 'bg-wf-canvas'

            return (
              <tr
                key={i}
                className={bgClass}
                style={row.highlight ? {
                  backgroundColor: 'color-mix(in srgb, var(--wf-positive) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--wf-positive) 30%, transparent)',
                } : undefined}
              >
                <td className="px-3 py-2 text-left">
                  {row.operator && (
                    <span className="mr-1.5 font-mono text-[10px] text-wf-muted">
                      {row.operator}
                    </span>
                  )}
                  <span className="text-wf-heading">{row.label}</span>
                </td>
                <td
                  className="px-3 py-2 text-right tabular-nums"
                  style={{ color: isNegativeValue(row.value) ? 'var(--wf-negative)' : 'var(--wf-accent)' }}
                >
                  {row.value}
                </td>
                <td className="px-3 py-2 text-right text-wf-muted">
                  {row.pct ?? '—'}
                </td>
                {compareMode && (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums text-wf-body">
                      {row.valueCompare ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.variation ? (
                        <span
                          className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: row.variationPositive
                              ? 'color-mix(in srgb, var(--wf-positive) 15%, transparent)'
                              : 'color-mix(in srgb, var(--wf-negative) 15%, transparent)',
                            color: row.variationPositive ? 'var(--wf-positive)' : 'var(--wf-negative)',
                          }}
                        >
                          {row.variation}
                        </span>
                      ) : (
                        <span className="text-wf-muted">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
