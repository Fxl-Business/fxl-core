import { Switch } from '@shared/ui/switch'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import type { PeriodType } from '@tools/wireframe-builder/types/blueprint'
import type { HeaderFormProps } from './index'

export default function HeaderPeriodForm({
  headerConfig,
  onUpdate,
}: HeaderFormProps) {
  return (
    <div className="space-y-4">
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
  )
}
