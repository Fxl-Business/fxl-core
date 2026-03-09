import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { ParetoChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ParetoChartSection
  onChange: (updated: ParetoChartSection) => void
}

export default function ParetoChartForm({ section, onChange }: Props) {
  const entries = section.data ?? []

  function addEntry() {
    onChange({
      ...section,
      data: [...entries, { label: 'Novo item', value: 100 }],
    })
  }

  function updateEntry(index: number, field: 'label' | 'value', val: string) {
    const updated = [...entries]
    if (field === 'label') {
      updated[index] = { ...updated[index], label: val }
    } else {
      updated[index] = { ...updated[index], value: Number(val) || 0 }
    }
    onChange({ ...section, data: updated })
  }

  function removeEntry(index: number) {
    onChange({
      ...section,
      data: entries.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pareto-title">Titulo</Label>
        <Input
          id="pareto-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="pareto-height">Altura (px)</Label>
        <Input
          id="pareto-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: 250"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Dados</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addEntry}>
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={entry.label}
                onChange={(e) => updateEntry(i, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1"
              />
              <Input
                type="number"
                value={entry.value}
                onChange={(e) => updateEntry(i, 'value', e.target.value)}
                placeholder="Valor"
                className="w-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeEntry(i)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhum dado configurado
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
