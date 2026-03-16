import { Input } from '@shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import type { FilterConfigSection } from '../../types/blueprint'

type Props = {
  section: FilterConfigSection
}

const PERIOD_OPTIONS = ['Mensal', 'Trimestral', 'Semestral', 'Anual']

export default function FilterConfigRenderer({ section }: Props) {
  return (
    <div
      className="flex flex-wrap items-end gap-4 pb-3"
      style={{
        borderBottom: '1px solid var(--wf-border)',
      }}
    >
      {section.filters.map((filter, i) => (
        <div key={i} className="space-y-1">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--wf-muted)' }}
          >
            {filter.label}
          </label>

          {filter.filterType === 'period' && (
            <Select disabled value={filter.defaultValue ?? PERIOD_OPTIONS[0]}>
              <SelectTrigger
                className="h-8 text-xs w-36"
                style={{
                  borderColor: 'var(--wf-border)',
                  color: 'var(--wf-body)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(filter.options ?? PERIOD_OPTIONS).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filter.filterType === 'select' && (
            <Select disabled value={filter.defaultValue ?? filter.options?.[0] ?? ''}>
              <SelectTrigger
                className="h-8 text-xs w-36"
                style={{
                  borderColor: 'var(--wf-border)',
                  color: 'var(--wf-body)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filter.filterType === 'date-range' && (
            <div className="flex items-center gap-2">
              <Input
                disabled
                type="date"
                className="h-8 text-xs w-32"
                style={{
                  borderColor: 'var(--wf-border)',
                  color: 'var(--wf-body)',
                }}
              />
              <span
                className="text-xs"
                style={{ color: 'var(--wf-muted)' }}
              >
                ate
              </span>
              <Input
                disabled
                type="date"
                className="h-8 text-xs w-32"
                style={{
                  borderColor: 'var(--wf-border)',
                  color: 'var(--wf-body)',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
