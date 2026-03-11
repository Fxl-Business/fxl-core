import { useState } from 'react'
import { cn } from '@/lib/utils'

export type DrilColumn = {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

export type DrilRow = {
  id: string
  data: Record<string, React.ReactNode>
  children?: DrilRow[]
  isTotal?: boolean
  className?: string
}

type Props = {
  title?: string
  subtitle?: string
  columns: DrilColumn[]
  rows: DrilRow[]
  footer?: Record<string, string>
}

function Row({ row, columns, depth }: { row: DrilRow; columns: DrilColumn[]; depth: number }) {
  const [open, setOpen] = useState(false)
  const hasKids = (row.children?.length ?? 0) > 0
  return (
    <>
      <tr
        onClick={() => hasKids && setOpen((v) => !v)}
        className={cn(
          'border-t border-wf-card-border transition-colors',
          hasKids && 'cursor-pointer hover:bg-wf-table-header',
          row.isTotal && 'bg-wf-canvas',
          row.className,
        )}
      >
        {columns.map((col, ci) => (
          <td
            key={col.key}
            className={cn(
              'px-4 py-2.5 text-xs',
              row.isTotal ? 'text-wf-accent font-extrabold uppercase' : 'text-wf-body',
              col.align === 'right' && 'text-right',
              col.align === 'center' && 'text-center',
            )}
          >
            {ci === 0 ? (
              <span
                className="flex items-center gap-1"
                style={{ paddingLeft: depth * 16 }}
              >
                {hasKids && (
                  <span className="w-4 flex-shrink-0 text-wf-muted text-[11px]">
                    {open ? '▾' : '▸'}
                  </span>
                )}
                <span>{row.data[col.key]}</span>
              </span>
            ) : (
              row.data[col.key] ?? '—'
            )}
          </td>
        ))}
      </tr>
      {open && row.children?.map((child) => (
        <Row key={child.id} row={child} columns={columns} depth={depth + 1} />
      ))}
    </>
  )
}

export default function DrillDownTable({ title, subtitle, columns, rows, footer }: Props) {
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
              <Row key={row.id} row={row} columns={columns} depth={0} />
            ))}
          </tbody>
          {footer && (
            <tfoot>
              <tr className="bg-wf-table-footer">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-xs font-black text-wf-table-footer-fg',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {footer[col.key] ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
