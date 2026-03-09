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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {title && (
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              className={brandPrimary ? undefined : 'bg-gray-100'}
              style={brandPrimary ? { backgroundColor: brandPrimary } : undefined}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 font-medium',
                    brandPrimary ? 'text-white' : 'text-gray-500',
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
              <tr key={row} className="border-t border-gray-200">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-gray-400',
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
