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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-gray-200 px-4 py-2">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
        </div>
      )}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-800 text-white">
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
              ? 'bg-green-50 font-semibold border-t border-green-200'
              : i % 2 === 0
                ? 'bg-white'
                : 'bg-gray-50'

            return (
              <tr key={i} className={bgClass}>
                <td className="px-3 py-2 text-left">
                  {row.operator && (
                    <span className="mr-1.5 font-mono text-[10px] text-gray-400">
                      {row.operator}
                    </span>
                  )}
                  <span className="text-gray-800">{row.label}</span>
                </td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    isNegativeValue(row.value) ? 'text-red-600' : 'text-blue-700'
                  }`}
                >
                  {row.value}
                </td>
                <td className="px-3 py-2 text-right text-gray-500">
                  {row.pct ?? '—'}
                </td>
                {compareMode && (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums text-gray-600">
                      {row.valueCompare ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.variation ? (
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            row.variationPositive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {row.variation}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
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
