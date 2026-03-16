import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type {
  KpiGridSection,
  KpiConfig,
} from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: KpiGridSection
  onChange: (updated: KpiGridSection) => void
}

const DEFAULT_ITEM: KpiConfig = {
  label: 'Novo KPI',
  value: 'R$ 0',
}

export default function KpiGridForm({ section, onChange }: Props) {
  function handleAddItem() {
    onChange({ ...section, items: [...section.items, { ...DEFAULT_ITEM }] })
  }

  function handleRemoveItem(index: number) {
    onChange({
      ...section,
      items: section.items.filter((_, i) => i !== index),
    })
  }

  function handleUpdateItem(
    index: number,
    field: keyof KpiConfig,
    value: string
  ) {
    onChange({
      ...section,
      items: section.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="kpi-columns">Colunas</Label>
        <Input
          id="kpi-columns"
          type="number"
          min={1}
          max={6}
          value={section.columns ?? 4}
          onChange={(e) =>
            onChange({ ...section, columns: Number(e.target.value) })
          }
        />
      </div>

      <div>
        <Label htmlFor="kpi-group-label">Label do Grupo</Label>
        <Input
          id="kpi-group-label"
          value={section.groupLabel ?? ''}
          onChange={(e) => onChange({ ...section, groupLabel: e.target.value })}
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>Itens KPI</Label>
        <div className="space-y-2 mt-1">
          {section.items.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) =>
                  handleUpdateItem(index, 'label', e.target.value)
                }
              />
              <Input
                placeholder="Valor"
                value={item.value}
                onChange={(e) =>
                  handleUpdateItem(index, 'value', e.target.value)
                }
              />
              <Input
                placeholder="Sub (opcional)"
                value={item.sub ?? ''}
                onChange={(e) =>
                  handleUpdateItem(index, 'sub', e.target.value)
                }
              />
              <Input
                placeholder="Variacao (opcional)"
                value={item.variation ?? ''}
                onChange={(e) =>
                  handleUpdateItem(index, 'variation', e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={handleAddItem}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar KPI
        </Button>
      </div>
    </div>
  )
}
