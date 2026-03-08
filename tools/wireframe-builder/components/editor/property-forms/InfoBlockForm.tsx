import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InfoBlockSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: InfoBlockSection
  onChange: (updated: InfoBlockSection) => void
}

export default function InfoBlockForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="info-content">Conteudo</Label>
        <Textarea
          id="info-content"
          value={section.content}
          onChange={(e) => onChange({ ...section, content: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label>Variante</Label>
        <Select
          value={section.variant ?? 'info'}
          onValueChange={(v) =>
            onChange({
              ...section,
              variant: v as InfoBlockSection['variant'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Informacao</SelectItem>
            <SelectItem value="warning">Alerta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
