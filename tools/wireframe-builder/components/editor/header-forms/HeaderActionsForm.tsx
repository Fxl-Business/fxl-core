import { Switch } from '@shared/ui/switch'
import { Label } from '@shared/ui/label'
import type { HeaderFormProps } from './index'

type ActionToggleProps = {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function ActionToggle({ id, label, description, checked, onCheckedChange }: ActionToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function HeaderActionsForm({
  headerConfig,
  onUpdate,
}: HeaderFormProps) {
  return (
    <div className="space-y-4">
      <ActionToggle
        id="action-manage"
        label="Gerenciar"
        description="Exibe o botao Gerenciar no header"
        checked={headerConfig.actions?.manage !== false}
        onCheckedChange={(checked) =>
          onUpdate((h) => ({
            ...h,
            actions: { ...h.actions, manage: checked },
          }))
        }
      />
      <ActionToggle
        id="action-share"
        label="Compartilhar"
        description="Exibe o botao Compartilhar no header"
        checked={headerConfig.actions?.share !== false}
        onCheckedChange={(checked) =>
          onUpdate((h) => ({
            ...h,
            actions: { ...h.actions, share: checked },
          }))
        }
      />
      <ActionToggle
        id="action-export"
        label="Exportar"
        description="Exibe o botao Exportar no header"
        checked={headerConfig.actions?.export === true}
        onCheckedChange={(checked) =>
          onUpdate((h) => ({
            ...h,
            actions: { ...h.actions, export: checked },
          }))
        }
      />
    </div>
  )
}
