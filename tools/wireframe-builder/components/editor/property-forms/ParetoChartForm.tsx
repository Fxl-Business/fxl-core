import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ParetoChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: ParetoChartSection
  onChange: (updated: ParetoChartSection) => void
}

export default function ParetoChartForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pareto-title">Titulo</Label>
        <Input
          id="pareto-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
    </div>
  )
}
