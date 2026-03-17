import type { FxlFieldDefinition } from '../types'

/**
 * Format a field value based on its type.
 * Exported for use by EntityTable as well.
 */
export function formatFieldValue(
  value: unknown,
  fieldType: FxlFieldDefinition['type'],
): string {
  if (value === null || value === undefined) return '—'

  switch (fieldType) {
    case 'string':
      return String(value)

    case 'number': {
      const num = Number(value)
      if (Number.isNaN(num)) return String(value)
      // Use pt-BR formatting for numbers
      return num.toLocaleString('pt-BR')
    }

    case 'date': {
      const date = new Date(String(value))
      if (Number.isNaN(date.getTime())) return String(value)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    }

    case 'boolean':
      return value ? 'Sim' : 'Nao'

    default:
      return String(value)
  }
}

interface EntityFieldsProps {
  fields: FxlFieldDefinition[]
  data: Record<string, unknown>
}

/**
 * Renders all fields of an entity in a vertical key-value layout.
 * Used by EntityDetail page.
 */
export default function EntityFields({ fields, data }: EntityFieldsProps) {
  return (
    <dl className="divide-y divide-slate-100 dark:divide-slate-800">
      {fields.map(field => (
        <div key={field.key} className="flex items-baseline gap-4 py-3">
          <dt className="w-1/3 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
            {field.label}
            {field.required && (
              <span className="ml-1 text-rose-400">*</span>
            )}
          </dt>
          <dd className="text-sm text-slate-900 dark:text-foreground">
            {formatFieldValue(data[field.key], field.type)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
