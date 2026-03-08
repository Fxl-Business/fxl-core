import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DonutChartSection } from '@tools/wireframe-builder/types/blueprint'

type Props = {
  section: DonutChartSection
  onChange: (updated: DonutChartSection) => void
}

export default function DonutChartForm({ section, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="donut-title">Titulo</Label>
        <Input
          id="donut-title"
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </div>
    </div>
  )
}
