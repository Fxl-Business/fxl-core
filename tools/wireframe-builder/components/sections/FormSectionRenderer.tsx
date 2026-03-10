import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FormSectionSection } from '../../types/blueprint'

type Props = {
  section: FormSectionSection
}

export default function FormSectionRenderer({ section }: Props) {
  const cols = section.columns ?? 2

  return (
    <div
      className="rounded-lg p-5 space-y-4"
      style={{
        backgroundColor: 'var(--wf-card)',
        border: '1px solid var(--wf-border)',
      }}
    >
      {section.title && (
        <h3
          className="text-base font-semibold"
          style={{ color: 'var(--wf-body)' }}
        >
          {section.title}
        </h3>
      )}

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {section.fields.map((field, i) => (
          <div key={i} className="space-y-1.5">
            <label
              className="text-xs font-medium"
              style={{ color: 'var(--wf-muted)' }}
            >
              {field.label}
              {field.required && (
                <span style={{ color: 'var(--wf-negative, #ef4444)' }}> *</span>
              )}
            </label>

            {(field.inputType === 'text' || field.inputType === 'number' || field.inputType === 'date') && (
              <Input
                disabled
                type={field.inputType}
                placeholder={field.placeholder ?? ''}
                className="h-8 text-xs"
                style={{
                  borderColor: 'var(--wf-border)',
                  color: 'var(--wf-body)',
                }}
              />
            )}

            {field.inputType === 'select' && (
              <Select disabled value={field.options?.[0] ?? ''}>
                <SelectTrigger
                  className="h-8 text-xs"
                  style={{
                    borderColor: 'var(--wf-border)',
                    color: 'var(--wf-body)',
                  }}
                >
                  <SelectValue placeholder={field.placeholder ?? 'Selecionar'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
