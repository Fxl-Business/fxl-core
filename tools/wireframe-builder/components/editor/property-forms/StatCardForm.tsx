import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Switch } from '@shared/ui/switch'
import type { StatCardSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: StatCardSection
  onChange: (updated: StatCardSection) => void
}

export default function StatCardForm({ section, onChange }: Props) {
  const hasTrend = !!section.trend

  function toggleTrend(enabled: boolean) {
    if (enabled) {
      onChange({
        ...section,
        trend: { value: '+5%', positive: true },
      })
    } else {
      const { trend: _, ...rest } = section
      onChange(rest as StatCardSection)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="stat-title">Titulo</Label>
        <Input
          id="stat-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="stat-value">Valor</Label>
        <Input
          id="stat-value"
          value={section.value}
          onChange={(e) => onChange({ ...section, value: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="stat-subtitle">Subtitulo</Label>
        <Input
          id="stat-subtitle"
          value={section.subtitle ?? ''}
          onChange={(e) =>
            onChange({ ...section, subtitle: e.target.value || undefined })
          }
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label htmlFor="stat-icon">Icone (nome lucide)</Label>
        <Input
          id="stat-icon"
          value={section.icon ?? ''}
          onChange={(e) =>
            onChange({ ...section, icon: e.target.value || undefined })
          }
          placeholder="Ex: trending-up, dollar-sign"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={hasTrend}
            onCheckedChange={toggleTrend}
          />
          <Label>Tendencia</Label>
        </div>

        {hasTrend && section.trend && (
          <div className="pl-2 border-l space-y-2">
            <Input
              placeholder="Valor da tendencia"
              value={section.trend.value}
              onChange={(e) =>
                onChange({
                  ...section,
                  trend: { ...section.trend!, value: e.target.value },
                })
              }
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={section.trend.positive}
                onCheckedChange={(v) =>
                  onChange({
                    ...section,
                    trend: { ...section.trend!, positive: v },
                  })
                }
              />
              <span className="text-xs text-muted-foreground">
                Positivo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
