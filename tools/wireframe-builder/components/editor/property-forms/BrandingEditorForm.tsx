import type { BlueprintSection } from '@tools/wireframe-builder/types/blueprint'

type BrandingEditorSection = Extract<BlueprintSection, { type: 'branding-editor' }>

type Props = {
  section: BrandingEditorSection
  onChange: (updated: BrandingEditorSection) => void
}

export default function BrandingEditorForm({ section, onChange }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-wf-heading">
        Título
        <input
          type="text"
          value={section.title ?? 'Identidade Visual'}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-wf-border bg-wf-card px-2 py-1.5 text-xs text-wf-body"
        />
      </label>
    </div>
  )
}
