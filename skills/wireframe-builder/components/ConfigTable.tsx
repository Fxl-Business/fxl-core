import { cn } from '@/lib/utils'

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
  'Caixa':       'bg-gray-100 text-gray-600',
  'Sim':         'bg-green-50 text-green-700',
  'Não':         'bg-red-50 text-red-600',
}

export default function ConfigTable({ title, addLabel, columns, rows }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {addLabel && (
          <button type="button" disabled className="cursor-default rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200">
            {addLabel}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left font-medium text-gray-500 whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-gray-100 hover:bg-gray-50/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-gray-600">
                    {col.type === 'select' ? (
                      <div className="cursor-default rounded border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 inline-block min-w-[120px]">
                        {row[col.key]} <span className="text-gray-300 ml-1">▾</span>
                      </div>
                    ) : col.type === 'badge' ? (
                      <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', BADGE_COLORS[row[col.key]] ?? 'bg-gray-100 text-gray-500')}>
                        {row[col.key]}
                      </span>
                    ) : col.type === 'status' ? (
                      <span className={cn('rounded px-2 py-0.5 text-[10px] font-medium', BADGE_COLORS[row[col.key]] ?? 'bg-gray-100 text-gray-500')}>
                        {row[col.key]}
                      </span>
                    ) : col.type === 'actions' ? (
                      <div className="flex gap-1">
                        <button type="button" disabled className="cursor-default rounded border border-gray-200 px-2 py-0.5 text-gray-400 text-[11px]">Editar</button>
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
