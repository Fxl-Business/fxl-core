import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { HeaderConfig, PeriodType } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  open: boolean
  headerConfig: HeaderConfig
  configLabel: string
  onUpdate: (updater: (header: HeaderConfig) => HeaderConfig) => void
  onClose: () => void
}

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

export default function HeaderConfigPanel({
  open,
  headerConfig,
  configLabel,
  onUpdate,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Header Config</SheetTitle>
          <SheetDescription>Configure a aparencia do header do dashboard</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Group 1: Aparencia */}
          <div>
            <h4 className="text-sm font-medium">Aparencia</h4>
            <div className="mt-3 space-y-4">
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
          </div>

          <Separator />

          {/* Group 2: Periodo */}
          <div>
            <h4 className="text-sm font-medium">Periodo</h4>
            <div className="mt-3 space-y-4">
              {/* Seletor de Periodo */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showPeriodSelector">Seletor de Periodo</Label>
                  <p className="text-xs text-muted-foreground">Mostra o seletor de periodo no header</p>
                </div>
                <Switch
                  id="showPeriodSelector"
                  checked={headerConfig.showPeriodSelector !== false}
                  onCheckedChange={(checked) =>
                    onUpdate((h) => ({ ...h, showPeriodSelector: checked }))
                  }
                />
              </div>

              {/* Tipo de Periodo */}
              {headerConfig.showPeriodSelector !== false && (
                <div className="space-y-2">
                  <Label htmlFor="periodType">Tipo de Periodo</Label>
                  <Select
                    value={headerConfig.periodType ?? 'mensal'}
                    onValueChange={(value) =>
                      onUpdate((h) => ({ ...h, periodType: value as PeriodType }))
                    }
                  >
                    <SelectTrigger id="periodType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define o tipo de periodo exibido no seletor do header
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Group 3: Usuario */}
          <div>
            <h4 className="text-sm font-medium">Usuario</h4>
            <div className="mt-3 space-y-4">
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
          </div>

          <Separator />

          {/* Group 4: Acoes */}
          <div>
            <h4 className="text-sm font-medium">Acoes</h4>
            <div className="mt-3 space-y-4">
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
