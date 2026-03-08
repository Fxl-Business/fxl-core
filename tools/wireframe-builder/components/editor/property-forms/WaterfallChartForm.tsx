import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { WaterfallChartSection } from '@tools/wireframe-builder/types/blueprint'
import type { WaterfallBar } from '@tools/wireframe-builder/components/WaterfallChart'

type Props = {
  section: WaterfallChartSection
  onChange: (updated: WaterfallChartSection) => void
}

const DEFAULT_BAR: WaterfallBar = {
  label: 'Nova barra',
  value: 0,
  type: 'positive',
}

export default function WaterfallChartForm({ section, onChange }: Props) {
  function handleAddBar() {
    onChange({ ...section, bars: [...section.bars, { ...DEFAULT_BAR }] })
  }

  function handleRemoveBar(index: number) {
    onChange({
      ...section,
      bars: section.bars.filter((_, i) => i !== index),
    })
  }

  function handleUpdateBar(
    index: number,
    field: keyof WaterfallBar,
    value: string | number
  ) {
    onChange({
      ...section,
      bars: section.bars.map((bar, i) =>
        i === index ? { ...bar, [field]: value } : bar
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="waterfall-title">Titulo</Label>
        <Input
          id="waterfall-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="waterfall-height">Altura (px)</Label>
        <Input
          id="waterfall-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: auto"
        />
      </div>

      <div>
        <Label>Barras</Label>
        <div className="space-y-2 mt-1">
          {section.bars.map((bar, index) => (
            <div
              key={index}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Barra {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveBar(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Label"
                value={bar.label}
                onChange={(e) =>
                  handleUpdateBar(index, 'label', e.target.value)
                }
              />
              <Input
                placeholder="Valor"
                type="number"
                value={bar.value}
                onChange={(e) =>
                  handleUpdateBar(index, 'value', Number(e.target.value))
                }
              />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={handleAddBar}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Barra
        </Button>
      </div>
    </div>
  )
}
