import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Button } from '@shared/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { SparklineGridSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: SparklineGridSection
  onChange: (updated: SparklineGridSection) => void
}

export default function SparklineGridForm({ section, onChange }: Props) {
  const items = section.items ?? []

  function addItem() {
    onChange({
      ...section,
      items: [
        ...items,
        { label: 'Novo KPI', value: '0', data: [10, 20, 15, 25, 30, 28, 35] },
      ],
    })
  }

  function updateItem(index: number, field: 'label' | 'value', val: string) {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: val }
    onChange({ ...section, items: updated })
  }

  function updateItemData(index: number, dataStr: string) {
    const data = dataStr
      .split(',')
      .map((s) => Number(s.trim()) || 0)
    const updated = [...items]
    updated[index] = { ...updated[index], data }
    onChange({ ...section, items: updated })
  }

  function removeItem(index: number) {
    onChange({
      ...section,
      items: items.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sparkline-title">Titulo</Label>
        <Input
          id="sparkline-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="sparkline-columns">Colunas</Label>
        <Input
          id="sparkline-columns"
          type="number"
          value={section.columns ?? 3}
          onChange={(e) =>
            onChange({
              ...section,
              columns: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: 3"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Itens</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="mt-2 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="space-y-1 rounded border p-2">
              <div className="flex items-center gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="flex-1"
                />
                <Input
                  value={item.value}
                  onChange={(e) => updateItem(i, 'value', e.target.value)}
                  placeholder="Valor"
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeItem(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={item.data.join(', ')}
                onChange={(e) => updateItemData(i, e.target.value)}
                placeholder="Dados do sparkline (separados por virgula)"
                className="text-xs"
              />
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhum item configurado
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
