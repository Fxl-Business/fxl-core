import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UploadSectionConfig } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: UploadSectionConfig
  onChange: (updated: UploadSectionConfig) => void
}

export default function UploadSectionForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="upload-label">Label</Label>
        <Input
          id="upload-label"
          value={section.label}
          onChange={(e) => onChange({ ...section, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="upload-success">Mensagem de Sucesso</Label>
        <Input
          id="upload-success"
          value={section.successMessage ?? ''}
          onChange={(e) =>
            onChange({ ...section, successMessage: e.target.value })
          }
          placeholder="Ex: Arquivo importado com sucesso"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Formatos aceitos sao configurados no blueprint config.
      </p>
    </div>
  )
}
