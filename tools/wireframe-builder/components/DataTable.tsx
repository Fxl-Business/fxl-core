import { cn } from '@/lib/utils'

type Column = { key: string; label: string; align?: 'left' | 'right' | 'center' }

type Props = {
  title?: string
  columns: Column[]
  rowCount?: number
}

export default function DataTable({ title, columns, rowCount = 5 }: Props) {
  const rows = Array.from({ length: rowCount }, (_, i) => i)

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card overflow-hidden">
      {title && (
        <div className="border-b border-wf-card-border px-4 py-3">
          <p className="text-sm font-semibold text-wf-heading">{title}</p>
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
                    'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg',
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
              <tr key={row} className="border-t border-wf-table-border hover:bg-wf-table-header transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-wf-body',
                      col.align === 'right' && 'text-right tabular-nums',
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
