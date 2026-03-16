import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { SankeySection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: SankeySection
  onChange: (updated: SankeySection) => void
}

export default function SankeyForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sankey-title">Titulo</Label>
        <Input
          id="sankey-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="sankey-height">Altura (px)</Label>
        <Input
          id="sankey-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: 300"
        />
      </div>
    </div>
  )
}
