import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  const categoriesText = (section.categories ?? []).join('\n')

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
          placeholder="Padrao: 250"
        />
      </div>

      <div>
        <Label htmlFor="barchart-categories">Categorias do eixo X (uma por linha)</Label>
        <Textarea
          id="barchart-categories"
          value={categoriesText}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter((l) => l.trim() !== '')
            onChange({
              ...section,
              categories: lines.length > 0 ? lines : undefined,
            })
          }}
          placeholder={'Jan\nFev\nMar\n...'}
          rows={4}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Deixe vazio para usar Jan-Dez como padrao
        </p>
      </div>

      <div>
        <Label htmlFor="barchart-xlabel">Label do eixo X</Label>
        <Input
          id="barchart-xlabel"
          value={section.xLabel ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              xLabel: e.target.value || undefined,
            })
          }
          placeholder="Ex: Meses"
        />
      </div>

      <div>
        <Label htmlFor="barchart-ylabel">Label do eixo Y</Label>
        <Input
          id="barchart-ylabel"
          value={section.yLabel ?? ''}
          onChange={(e) =>
            onChange({
              ...section,
              yLabel: e.target.value || undefined,
            })
          }
          placeholder="Ex: Valor (R$)"
        />
      </div>
    </div>
  )
}
