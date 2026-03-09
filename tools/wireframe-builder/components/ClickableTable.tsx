import { cn } from '@/lib/utils'

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
  /** Brand primary color (resolved hex). Used for header background with white text. */
  brandPrimary?: string
}

export default function ClickableTable({ title, subtitle, columns, rows, onRowClick, brandPrimary }: Props) {
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
            <tr
              className={brandPrimary ? undefined : 'bg-wf-table-header'}
              style={brandPrimary ? { backgroundColor: brandPrimary } : undefined}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 font-medium whitespace-nowrap',
                    brandPrimary ? 'text-wf-table-header-fg' : 'text-wf-table-header-fg',
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
                  onRowClick && 'cursor-pointer hover:bg-wf-accent-muted',
                  row.variant === 'total' && 'bg-wf-canvas font-semibold',
                  row.variant === 'highlight' && 'bg-red-50/60',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-xs text-wf-body',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                      row.variant === 'total' && 'font-semibold text-wf-heading',
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
