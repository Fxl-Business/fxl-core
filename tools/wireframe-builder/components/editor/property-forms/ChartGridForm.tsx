import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { ChartGridSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ChartGridSection
  onChange: (updated: ChartGridSection) => void
}

export default function ChartGridForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chartgrid-cols">Colunas</Label>
        <Input
          id="chartgrid-cols"
          type="number"
          min={1}
          max={4}
          value={section.columns ?? 2}
          onChange={(e) =>
            onChange({ ...section, columns: Number(e.target.value) })
          }
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Sub-itens sao gerenciados pelo editor principal.
      </p>
    </div>
  )
}
