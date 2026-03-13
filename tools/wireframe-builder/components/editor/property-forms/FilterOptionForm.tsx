import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'

const FILTER_TYPE_OPTIONS: { value: NonNullable<FilterOption['filterType']>; label: string }[] = [
  { value: 'select', label: 'Select' },
  { value: 'date-range', label: 'Intervalo de Data' },
  { value: 'multi-select', label: 'Multi-Select' },
  { value: 'search', label: 'Busca' },
  { value: 'toggle', label: 'Toggle' },
]

function showOptionsField(filterType: NonNullable<FilterOption['filterType']>): boolean {
  return filterType === 'select' || filterType === 'multi-select'
}

type FilterOptionFormProps = {
  filter: FilterOption
  onChange: (updated: FilterOption) => void
}

export default function FilterOptionForm({ filter, onChange }: FilterOptionFormProps) {
  function handleUpdateLabel(label: string) {
    onChange({ ...filter, label })
  }

  function handleUpdateFilterType(filterType: NonNullable<FilterOption['filterType']>) {
    const next: FilterOption = { ...filter, filterType }
    if (!showOptionsField(filterType)) {
      const { options: _options, ...rest } = next
      void _options
      onChange(rest)
    } else {
      onChange(next)
    }
  }

  function handleUpdateOptions(raw: string) {
    const options = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    onChange({ ...filter, options: options.length > 0 ? options : undefined })
  }

  return (
    <div className="space-y-4">
      {/* Key badge (read-only) */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Chave</Label>
        <div>
          <Badge variant="secondary" className="font-mono text-xs">
            {filter.key}
          </Badge>
        </div>
      </div>

      {/* Label field */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Label</Label>
        <Input
          value={filter.label}
          onChange={(e) => handleUpdateLabel(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* FilterType field */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">Tipo</Label>
        <Select
          value={filter.filterType ?? 'select'}
          onValueChange={(v) =>
            handleUpdateFilterType(v as NonNullable<FilterOption['filterType']>)
          }
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Options field — only for select/multi-select */}
      {showOptionsField(filter.filterType ?? 'select') && (
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">
            Opcoes (separadas por virgula)
          </Label>
          <Input
            value={filter.options?.join(', ') ?? ''}
            onChange={(e) => handleUpdateOptions(e.target.value)}
            placeholder="Opcao 1, Opcao 2, ..."
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  )
}
