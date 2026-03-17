import { Link } from 'react-router-dom'
import type { FxlFieldDefinition } from '../types'
import { formatFieldValue } from './EntityFields'

interface EntityTableProps {
  fields: FxlFieldDefinition[]
  rows: Record<string, unknown>[]
  entityType: string
  appId: string
}

/**
 * Generic data table for entities.
 * Columns are derived from FieldDefinition[].
 * Each row links to the entity detail page.
 */
export default function EntityTable({ fields, rows, entityType, appId }: EntityTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
            {fields.map(field => (
              <th
                key={field.key}
                className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, rowIdx) => {
            const id = (row['id'] as string | undefined) ?? String(rowIdx)
            return (
              <tr
                key={id}
                className="bg-white transition-colors hover:bg-slate-50 dark:bg-card dark:hover:bg-slate-800/50"
              >
                {fields.map((field, colIdx) => (
                  <td key={field.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                    {colIdx === 0 ? (
                      <Link
                        to={`/apps/${appId}/${entityType}/${id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {formatFieldValue(row[field.key], field.type)}
                      </Link>
                    ) : (
                      formatFieldValue(row[field.key], field.type)
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
