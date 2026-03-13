import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { HeaderFormProps } from './index'

export default function HeaderUserForm({
  headerConfig,
  onUpdate,
}: HeaderFormProps) {
  return (
    <div className="space-y-4">
      {/* Indicador de Usuario */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="showUserIndicator">Indicador de Usuario</Label>
          <p className="text-xs text-muted-foreground">Mostra o nome e cargo do usuario no header</p>
        </div>
        <Switch
          id="showUserIndicator"
          checked={headerConfig.showUserIndicator !== false}
          onCheckedChange={(checked) =>
            onUpdate((h) => ({ ...h, showUserIndicator: checked }))
          }
        />
      </div>
    </div>
  )
}
