import { cn } from '@shared/utils'

export type ConfigColumn = {
  key: string
  label: string
  type?: 'text' | 'select' | 'badge' | 'actions' | 'status'
  options?: string[]
  width?: string
}

export type ConfigRow = Record<string, string>

type Props = {
  title: string
  addLabel?: string
  columns: ConfigColumn[]
  rows: ConfigRow[]
}

const BADGE_COLORS: Record<string, string> = {
  'Variável':    'bg-blue-50 text-blue-700',
  'Fixo':        'bg-purple-50 text-purple-700',
  'Financeiro':  'bg-orange-50 text-orange-700',
  'Corrente':    'bg-green-50 text-green-700',
  'Aplicação':   'bg-teal-50 text-teal-700',
  'Caixa':       'bg-wf-canvas text-wf-body',
  'Sim':         'bg-green-50 text-green-700',
  'Não':         'bg-red-50 text-red-600',
}

export default function ConfigTable({ title, addLabel, columns, rows }: Props) {
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-wf-card-border px-4 py-3">
        <p className="text-sm font-semibold text-wf-heading">{title}</p>
        {addLabel && (
          <button type="button" disabled className="cursor-default rounded-md bg-wf-canvas px-3 py-1.5 text-xs font-medium text-wf-muted border border-wf-card-border">
            {addLabel}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-wf-table-header">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-wf-card-border hover:bg-wf-canvas/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-wf-body">
                    {col.type === 'select' ? (
                      <div className="cursor-default rounded border border-wf-card-border bg-wf-card px-2.5 py-1 text-xs text-wf-muted inline-block min-w-[120px]">
                        {row[col.key]} <span className="text-wf-muted ml-1">▾</span>
                      </div>
                    ) : col.type === 'badge' ? (
                      <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', BADGE_COLORS[row[col.key]] ?? 'bg-wf-canvas text-wf-muted')}>
                        {row[col.key]}
                      </span>
                    ) : col.type === 'status' ? (
                      <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', BADGE_COLORS[row[col.key]] ?? 'bg-wf-canvas text-wf-muted')}>
                        {row[col.key]}
                      </span>
                    ) : col.type === 'actions' ? (
                      <div className="flex gap-1">
                        <button type="button" disabled className="cursor-default rounded border border-wf-card-border px-2 py-0.5 text-wf-muted text-[11px]">Editar</button>
                        <button type="button" disabled className="cursor-default rounded border border-red-100 px-2 py-0.5 text-red-300 text-[11px]">Excluir</button>
                      </div>
                    ) : (
                      <span>{row[col.key]}</span>
                    )}
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
