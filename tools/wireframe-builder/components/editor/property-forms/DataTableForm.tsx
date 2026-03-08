import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type {
  DataTableSection,
  ColumnConfig,
} from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: DataTableSection
  onChange: (updated: DataTableSection) => void
}

const DEFAULT_COLUMN: ColumnConfig = {
  key: 'nova_coluna',
  label: 'Nova Coluna',
}

export default function DataTableForm({ section, onChange }: Props) {
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
    field: keyof ColumnConfig,
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
        <Label htmlFor="datatable-title">Titulo</Label>
        <Input
          id="datatable-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="datatable-rowcount">Linhas</Label>
        <Input
          id="datatable-rowcount"
          type="number"
          min={1}
          value={section.rowCount ?? 5}
          onChange={(e) =>
            onChange({ ...section, rowCount: Number(e.target.value) })
          }
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
              <Select
                value={col.align ?? 'left'}
                onValueChange={(v) =>
                  handleUpdateColumn(index, 'align', v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
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
