import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HeaderFormProps } from './index'

export default function HeaderBrandForm({
  headerConfig,
  configLabel,
  onUpdate,
}: HeaderFormProps) {
  return (
    <div className="space-y-4">
      {/* Exibir Logo */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="showLogo">Exibir Logo</Label>
          <p className="text-xs text-muted-foreground">Mostra o logo ou nome da marca no header</p>
        </div>
        <Switch
          id="showLogo"
          checked={headerConfig.showLogo !== false}
          onCheckedChange={(checked) =>
            onUpdate((h) => ({ ...h, showLogo: checked }))
          }
        />
      </div>

      {/* Label Customizado */}
      <div className="space-y-2">
        <Label htmlFor="brandLabel">Label Customizado</Label>
        <Input
          id="brandLabel"
          placeholder={configLabel}
          value={headerConfig.brandLabel ?? ''}
          onChange={(e) =>
            onUpdate((h) => ({
              ...h,
              brandLabel: e.target.value || undefined,
            }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Substitui o nome padrao &quot;{configLabel}&quot; no header
        </p>
      </div>
    </div>
  )
}
