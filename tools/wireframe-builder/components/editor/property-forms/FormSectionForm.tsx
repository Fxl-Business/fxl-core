import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import type { FormSectionSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: FormSectionSection
  onChange: (updated: FormSectionSection) => void
}

type Field = FormSectionSection['fields'][number]

const DEFAULT_FIELD: Field = {
  label: 'Novo campo',
  inputType: 'text',
}

export default function FormSectionForm({ section, onChange }: Props) {
  function updateField(index: number, patch: Partial<Field>) {
    onChange({
      ...section,
      fields: section.fields.map((f, i) =>
        i === index ? { ...f, ...patch } : f
      ),
    })
  }

  function addField() {
    onChange({
      ...section,
      fields: [...section.fields, { ...DEFAULT_FIELD }],
    })
  }

  function removeField(index: number) {
    onChange({
      ...section,
      fields: section.fields.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="form-title">Titulo</Label>
        <Input
          id="form-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="form-columns">Colunas</Label>
        <Input
          id="form-columns"
          type="number"
          min={1}
          max={4}
          value={section.columns ?? 2}
          onChange={(e) =>
            onChange({ ...section, columns: Number(e.target.value) })
          }
        />
      </div>

      <div>
        <Label>Campos</Label>
        <div className="space-y-2 mt-1">
          {section.fields.map((field, index) => (
            <div
              key={index}
              className="p-3 rounded-md border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Campo {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeField(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Input
                placeholder="Label"
                value={field.label}
                onChange={(e) =>
                  updateField(index, { label: e.target.value })
                }
              />

              <Select
                value={field.inputType}
                onValueChange={(v) =>
                  updateField(index, { inputType: v as Field['inputType'] })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Numero</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Placeholder (opcional)"
                value={field.placeholder ?? ''}
                onChange={(e) =>
                  updateField(index, { placeholder: e.target.value || undefined })
                }
              />

              {field.inputType === 'select' && (
                <Input
                  placeholder="Opcoes (separadas por virgula)"
                  value={(field.options ?? []).join(', ')}
                  onChange={(e) =>
                    updateField(index, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required ?? false}
                  onCheckedChange={(v) =>
                    updateField(index, { required: v })
                  }
                />
                <span className="text-xs text-muted-foreground">
                  Obrigatorio
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={addField}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar Campo
        </Button>
      </div>
    </div>
  )
}
