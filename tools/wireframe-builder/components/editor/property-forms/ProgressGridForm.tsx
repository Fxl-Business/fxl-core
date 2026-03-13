import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { ProgressGridSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ProgressGridSection
  onChange: (updated: ProgressGridSection) => void
}

export default function ProgressGridForm({ section, onChange }: Props) {
  const items = section.items

  function addItem() {
    onChange({
      ...section,
      items: [...items, { label: 'Nova metrica', current: 50, target: 100, max: 120 }],
    })
  }

  function updateItem(index: number, field: keyof typeof items[number], val: string) {
    const updated = [...items]
    if (field === 'label') {
      updated[index] = { ...updated[index], label: val }
    } else {
      updated[index] = { ...updated[index], [field]: Number(val) || 0 }
    }
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
        <Label htmlFor="progress-grid-title">Titulo</Label>
        <Input
          id="progress-grid-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Metricas</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="mt-2 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(i, 'label', e.target.value)}
                  placeholder="Label"
                />
                <div className="flex gap-1">
                  <Input
                    type="number"
                    value={item.current}
                    onChange={(e) => updateItem(i, 'current', e.target.value)}
                    placeholder="Atual"
                    className="w-20"
                  />
                  <Input
                    type="number"
                    value={item.target}
                    onChange={(e) => updateItem(i, 'target', e.target.value)}
                    placeholder="Meta"
                    className="w-20"
                  />
                  <Input
                    type="number"
                    value={item.max}
                    onChange={(e) => updateItem(i, 'max', e.target.value)}
                    placeholder="Max"
                    className="w-20"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-1 h-8 w-8 shrink-0"
                onClick={() => removeItem(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
