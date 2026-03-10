import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DividerSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: DividerSection
  onChange: (updated: DividerSection) => void
}

export default function DividerForm({ section, onChange }: Props) {
  const variant = section.variant ?? 'solid'

  return (
    <div className="space-y-4">
      <div>
        <Label>Variante</Label>
        <Select
          value={variant}
          onValueChange={(v) =>
            onChange({
              ...section,
              variant: v as DividerSection['variant'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solido</SelectItem>
            <SelectItem value="dashed">Tracejado</SelectItem>
            <SelectItem value="labeled">Com label</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {variant === 'labeled' && (
        <div>
          <Label htmlFor="divider-label">Label</Label>
          <Input
            id="divider-label"
            value={section.label ?? ''}
            onChange={(e) =>
              onChange({ ...section, label: e.target.value || undefined })
            }
            placeholder="Texto do separador"
          />
        </div>
      )}
    </div>
  )
}
