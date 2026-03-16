import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { ConfigTableSection } from '@tools/wireframe-builder/types/blueprint'
import type { ConfigColumn } from '@tools/wireframe-builder/components/ConfigTable'

type Props = {
  section: ConfigTableSection
  onChange: (updated: ConfigTableSection) => void
}

const DEFAULT_COLUMN: ConfigColumn = {
  key: 'nova_coluna',
  label: 'Nova Coluna',
}

export default function ConfigTableForm({ section, onChange }: Props) {
  function handleAddColumn() {
    onChange({
      ...section,
      columns: [...section.columns, { ...DEFAULT_COLUMN }],
    })
  }

  function handleRemoveColumn(index: number) {
    onChange({
      ...section,
      columns: section.columns.filter((_, i) => i !== index),
    })
  }

  function handleUpdateColumn(
    index: number,
    field: keyof ConfigColumn,
    value: string
  ) {
    onChange({
      ...section,
      columns: section.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col
      ),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="config-title">Titulo</Label>
        <Input
          id="config-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="config-addlabel">Label do Botao Adicionar</Label>
        <Input
          id="config-addlabel"
          value={section.addLabel ?? ''}
          onChange={(e) => onChange({ ...section, addLabel: e.target.value })}
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label>Colunas</Label>
        <div className="space-y-2 mt-1">
          {section.columns.map((col, index) => (
            <div
              key={index}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Coluna {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveColumn(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                placeholder="Key"
                value={col.key}
                onChange={(e) =>
                  handleUpdateColumn(index, 'key', e.target.value)
                }
              />
              <Input
                placeholder="Label"
                value={col.label}
                onChange={(e) =>
                  handleUpdateColumn(index, 'label', e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={handleAddColumn}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Coluna
        </Button>
      </div>
    </div>
  )
}
