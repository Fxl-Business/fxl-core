import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import type { ManualInputSectionConfig } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ManualInputSectionConfig
  onChange: (updated: ManualInputSectionConfig) => void
}

export default function ManualInputForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="manual-title">Titulo</Label>
        <Input
          id="manual-title"
          value={section.title ?? ''}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="manual-balance">Saldo Inicial</Label>
        <Input
          id="manual-balance"
          value={section.initialBalance ?? ''}
          onChange={(e) =>
            onChange({ ...section, initialBalance: e.target.value })
          }
          placeholder="Ex: R$ 10.000,00"
        />
      </div>
    </div>
  )
}
