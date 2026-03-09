import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { DonutChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: DonutChartSection
  onChange: (updated: DonutChartSection) => void
}

export default function DonutChartForm({ section, onChange }: Props) {
  const slices = section.slices ?? []

  function addSlice() {
    onChange({
      ...section,
      slices: [...slices, { label: 'Novo item', value: 100 }],
    })
  }

  function updateSlice(index: number, field: 'label' | 'value', val: string) {
    const updated = [...slices]
    if (field === 'label') {
      updated[index] = { ...updated[index], label: val }
    } else {
      updated[index] = { ...updated[index], value: Number(val) || 0 }
    }
    onChange({ ...section, slices: updated })
  }

  function removeSlice(index: number) {
    onChange({
      ...section,
      slices: slices.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="donut-title">Titulo</Label>
        <Input
          id="donut-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="donut-height">Altura (px)</Label>
        <Input
          id="donut-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: 200"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Fatias</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addSlice}>
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={slice.label}
                onChange={(e) => updateSlice(i, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                type="number"
                value={slice.value}
                onChange={(e) => updateSlice(i, 'value', e.target.value)}
                placeholder="Valor"
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeSlice(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {slices.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhuma fatia configurada
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
