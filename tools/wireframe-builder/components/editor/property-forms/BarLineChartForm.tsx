import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BarLineChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: BarLineChartSection
  onChange: (updated: BarLineChartSection) => void
}

export default function BarLineChartForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="barchart-title">Titulo</Label>
        <Input
          id="barchart-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label>Tipo de Grafico</Label>
        <Select
          value={section.chartType}
          onValueChange={(v) =>
            onChange({
              ...section,
              chartType: v as BarLineChartSection['chartType'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Barra</SelectItem>
            <SelectItem value="line">Linha</SelectItem>
            <SelectItem value="bar-line">Barra + Linha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="barchart-height">Altura (px)</Label>
        <Input
          id="barchart-height"
          type="number"
          value={section.height ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              height: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          placeholder="Padrao: auto"
        />
      </div>
    </div>
  )
}
