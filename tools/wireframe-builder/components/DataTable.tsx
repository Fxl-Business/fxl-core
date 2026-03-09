import { cn } from '@/lib/utils'

type Column = { key: string; label: string; align?: 'left' | 'right' | 'center' }

type Props = {
  title?: string
  columns: Column[]
  rowCount?: number
  /** Brand primary color (resolved hex). Used for header background with white text. */
  brandPrimary?: string
}

export default function DataTable({ title, columns, rowCount = 5, brandPrimary }: Props) {
  const rows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card">
      {title && (
        <div className="border-b border-wf-card-border px-4 py-3">
          <p className="text-sm font-semibold text-wf-heading">{title}</p>
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
                    'px-4 py-2.5 font-medium',
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
              <tr key={row} className="border-t border-wf-card-border">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-wf-muted',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    —
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
