import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { ProgressBarSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ProgressBarSection
  onChange: (updated: ProgressBarSection) => void
}

type Item = ProgressBarSection['items'][number]

const DEFAULT_ITEM: Item = {
  label: 'Novo item',
  value: 50,
}

export default function ProgressBarForm({ section, onChange }: Props) {
  function updateItem(index: number, patch: Partial<Item>) {
    onChange({
      ...section,
      items: section.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    })
  }

  function addItem() {
    onChange({
      ...section,
      items: [...section.items, { ...DEFAULT_ITEM }],
    })
  }

  function removeItem(index: number) {
    onChange({
      ...section,
      items: section.items.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="progress-title">Titulo</Label>
        <Input
          id="progress-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Itens</Label>
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
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) =>
                  updateItem(index, { label: e.target.value })
                }
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Valor"
                    min={0}
                    value={item.value}
                    onChange={(e) =>
                      updateItem(index, { value: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max (100)"
                    min={1}
                    value={item.max ?? ''}
                    onChange={(e) =>
                      updateItem(index, {
                        max: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <Input
                placeholder="Cor (opcional, ex: #3b82f6)"
                value={item.color ?? ''}
                onChange={(e) =>
                  updateItem(index, { color: e.target.value || undefined })
                }
              />
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={addItem}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Item
        </Button>
      </div>
    </div>
  )
}
