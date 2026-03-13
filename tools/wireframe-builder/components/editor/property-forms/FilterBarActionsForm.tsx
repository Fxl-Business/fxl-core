import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { FilterBarActionsConfig } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  config: FilterBarActionsConfig
  onChange: (updated: FilterBarActionsConfig) => void
}

export default function FilterBarActionsForm({ config, onChange }: Props) {
  return (
    <div className="space-y-5">
      {/* Date Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="fba-date-picker" className="text-sm font-medium">
            Seletor de Periodo
          </Label>
          <Switch
            id="fba-date-picker"
            checked={config.showDatePicker !== false}
            onCheckedChange={(checked) =>
              onChange({ ...config, showDatePicker: checked })
            }
          />
        </div>
        {config.showDatePicker !== false && (
          <div>
            <Label htmlFor="fba-date-label" className="text-xs text-muted-foreground">
              Label
            </Label>
            <Input
              id="fba-date-label"
              value={config.datePickerLabel ?? 'Jan — Mar 2026'}
              onChange={(e) =>
                onChange({ ...config, datePickerLabel: e.target.value })
              }
              className="mt-1"
              placeholder="Jan — Mar 2026"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Share */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="fba-share" className="text-sm font-medium">
            Compartilhar
          </Label>
          <Switch
            id="fba-share"
            checked={config.showShare !== false}
            onCheckedChange={(checked) =>
              onChange({ ...config, showShare: checked })
            }
          />
        </div>
        {config.showShare !== false && (
          <div>
            <Label htmlFor="fba-share-label" className="text-xs text-muted-foreground">
              Label
            </Label>
            <Input
              id="fba-share-label"
              value={config.shareLabel ?? 'Compartilhar'}
              onChange={(e) =>
                onChange({ ...config, shareLabel: e.target.value })
              }
              className="mt-1"
              placeholder="Compartilhar"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Export */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="fba-export" className="text-sm font-medium">
            Exportar
          </Label>
          <Switch
            id="fba-export"
            checked={config.showExport !== false}
            onCheckedChange={(checked) =>
              onChange({ ...config, showExport: checked })
            }
          />
        </div>
        {config.showExport !== false && (
          <div>
            <Label htmlFor="fba-export-label" className="text-xs text-muted-foreground">
              Label
            </Label>
            <Input
              id="fba-export-label"
              value={config.exportLabel ?? 'Exportar'}
              onChange={(e) =>
                onChange({ ...config, exportLabel: e.target.value })
              }
              className="mt-1"
              placeholder="Exportar"
            />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Compare */}
      <div className="flex items-center justify-between">
        <Label htmlFor="fba-compare" className="text-sm font-medium">
          Comparar
        </Label>
        <Switch
          id="fba-compare"
          checked={config.showCompare !== false}
          onCheckedChange={(checked) =>
            onChange({ ...config, showCompare: checked })
          }
        />
      </div>
    </div>
  )
}
