import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { CalculoCardSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: CalculoCardSection
  onChange: (updated: CalculoCardSection) => void
}

export default function CalculoCardForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="calculo-title">Titulo</Label>
        <Input
          id="calculo-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Dados de exemplo -- editar no config.
      </p>
    </div>
  )
}
