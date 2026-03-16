import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { FilterConfigSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: FilterConfigSection
  onChange: (updated: FilterConfigSection) => void
}

type Filter = FilterConfigSection['filters'][number]

const DEFAULT_FILTER: Filter = {
  label: 'Novo filtro',
  filterType: 'select',
}

export default function FilterConfigForm({ section, onChange }: Props) {
  function updateFilter(index: number, patch: Partial<Filter>) {
    onChange({
      ...section,
      filters: section.filters.map((f, i) =>
        i === index ? { ...f, ...patch } : f
      ),
    })
  }

  function addFilter() {
    onChange({
      ...section,
      filters: [...section.filters, { ...DEFAULT_FILTER }],
    })
  }

  function removeFilter(index: number) {
    onChange({
      ...section,
      filters: section.filters.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <Label>Filtros</Label>
      <div className="space-y-2">
        {section.filters.map((filter, index) => (
          <div
            key={index}
            className="p-3 rounded-md border space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Filtro {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeFilter(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Input
              placeholder="Label"
              value={filter.label}
              onChange={(e) =>
                updateFilter(index, { label: e.target.value })
              }
            />

            <Select
              value={filter.filterType}
              onValueChange={(v) =>
                updateFilter(index, { filterType: v as Filter['filterType'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="period">Periodo</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="date-range">Intervalo de Data</SelectItem>
              </SelectContent>
            </Select>

            {(filter.filterType === 'period' || filter.filterType === 'select') && (
              <Input
                placeholder="Opcoes (separadas por virgula)"
                value={(filter.options ?? []).join(', ')}
                onChange={(e) =>
                  updateFilter(index, {
                    options: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            )}

            <Input
              placeholder="Valor padrao (opcional)"
              value={filter.defaultValue ?? ''}
              onChange={(e) =>
                updateFilter(index, { defaultValue: e.target.value || undefined })
              }
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={addFilter}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Adicionar Filtro
      </Button>
    </div>
  )
}
