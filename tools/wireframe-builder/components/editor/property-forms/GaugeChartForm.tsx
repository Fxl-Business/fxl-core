import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GaugeChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: GaugeChartSection
  onChange: (updated: GaugeChartSection) => void
}

export default function GaugeChartForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="gauge-title">Titulo</Label>
        <Input
          id="gauge-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="gauge-value">Valor atual</Label>
        <Input
          id="gauge-value"
          type="number"
          value={section.value}
          onChange={(e) => onChange({ ...section, value: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="gauge-min">Valor minimo</Label>
        <Input
          id="gauge-min"
          type="number"
          value={section.min ?? ''}
          onChange={(e) =>
            onChange({ ...section, min: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="Padrao: 0"
        />
      </div>
      <div>
        <Label htmlFor="gauge-max">Valor maximo</Label>
        <Input
          id="gauge-max"
          type="number"
          value={section.max ?? ''}
          onChange={(e) =>
            onChange({ ...section, max: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="Padrao: 100"
        />
      </div>
      <div>
        <Label htmlFor="gauge-height">Altura (px)</Label>
        <Input
          id="gauge-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({ ...section, height: e.target.value ? Number(e.target.value) : undefined })
          }
          placeholder="Padrao: 200"
        />
      </div>
    </div>
  )
}
