import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Button } from '@shared/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { HeatmapSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: HeatmapSection
  onChange: (updated: HeatmapSection) => void
}

export default function HeatmapForm({ section, onChange }: Props) {
  const rows = section.rows ?? []

  function updateColLabels(value: string) {
    const labels = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    onChange({ ...section, colLabels: labels.length > 0 ? labels : undefined })
  }

  function addRow() {
    const cellCount = section.colLabels?.length ?? rows[0]?.cells.length ?? 6
    onChange({
      ...section,
      rows: [
        ...rows,
        { label: 'Nova linha', cells: Array(cellCount).fill(0) },
      ],
    })
  }

  function updateRowLabel(index: number, label: string) {
    const updated = [...rows]
    updated[index] = { ...updated[index], label }
    onChange({ ...section, rows: updated })
  }

  function updateRowCells(index: number, cellsStr: string) {
    const cells = cellsStr
      .split(',')
      .map((s) => Number(s.trim()) || 0)
    const updated = [...rows]
    updated[index] = { ...updated[index], cells }
    onChange({ ...section, rows: updated })
  }

  function removeRow(index: number) {
    onChange({
      ...section,
      rows: rows.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heatmap-title">Titulo</Label>
        <Input
          id="heatmap-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="heatmap-collabels">Colunas (separadas por virgula)</Label>
        <Input
          id="heatmap-collabels"
          value={(section.colLabels ?? []).join(', ')}
          onChange={(e) => updateColLabels(e.target.value)}
          placeholder="Jan, Fev, Mar, ..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label>Linhas</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-3 w-3" /> Adicionar
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <Input
                  value={row.label}
                  onChange={(e) => updateRowLabel(i, e.target.value)}
                  placeholder="Label"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRow(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                value={row.cells.join(', ')}
                onChange={(e) => updateRowCells(i, e.target.value)}
                placeholder="Valores separados por virgula"
                className="text-xs"
              />
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhuma linha configurada
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
