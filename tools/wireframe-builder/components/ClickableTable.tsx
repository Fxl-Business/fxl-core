import { cn } from '@shared/utils'

/**
 * Trend indicator cell pattern (TBL-05):
 * Row data values support ReactNode — use inline JSX for trend icons:
 *
 * ```tsx
 * import { TrendingUp, TrendingDown } from 'lucide-react'
 *
 * const row: ClickRow = {
 *   id: 'row-1',
 *   data: {
 *     produto: 'Produto A',
 *     variacao: (
 *       <span className="inline-flex items-center gap-1 text-emerald-600 transition-transform hover:scale-110">
 *         <TrendingUp className="h-3.5 w-3.5" />
 *         <span>+8%</span>
 *       </span>
 *     ),
 *   },
 * }
 * ```
 *
 * Negative trends: use text-rose-500 + TrendingDown.
 * Color tokens: var(--wf-positive) for up, var(--wf-negative) for down.
 */

export type ClickColumn = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

export type ClickRow = {
  id: string
  data: Record<string, React.ReactNode>
  variant?: 'default' | 'total' | 'highlight'
}

type Props = {
  title?: string
  subtitle?: string
  columns: ClickColumn[]
  rows: ClickRow[]
  onRowClick?: (row: ClickRow) => void
}

export default function ClickableTable({ title, subtitle, columns, rows, onRowClick }: Props) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card overflow-hidden">
      {title && (
        <div className="border-b border-wf-card-border px-4 py-3">
          <p className="text-sm font-semibold text-wf-heading">{title}</p>
          {subtitle && <p className="text-xs text-wf-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-wf-table-header">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    (!col.align || col.align === 'left') && 'text-left',
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-t border-wf-card-border transition-colors',
                  'cursor-pointer hover:bg-wf-table-header',
                  row.variant === 'total' && 'bg-wf-canvas',
                  row.variant === 'highlight' && 'bg-wf-accent-muted',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-xs text-wf-body',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                      (row.variant === 'total' || row.variant === 'highlight') && 'text-wf-accent font-extrabold uppercase',
                    )}
                  >
                    {row.data[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
