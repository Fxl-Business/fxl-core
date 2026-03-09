import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { BlueprintSection } from '../../types/blueprint'
import { getDefaultSection } from '../../lib/defaults'
import ComponentPicker from './ComponentPicker'

type Props = {
  onAdd: (section: BlueprintSection) => void
  /** "row" = dashed line between rows (default); "cell" = empty grid cell placeholder */
  variant?: 'row' | 'cell'
}

export default function AddSectionButton({ onAdd, variant = 'row' }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  function handleSelect(type: BlueprintSection['type']) {
    const section = getDefaultSection(type)
    onAdd(section)
  }

  if (variant === 'cell') {
    return (
      <>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 cursor-pointer"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs">Adicionar</span>
        </button>

        <ComponentPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      </>
    )
  }

  return (
    <>
      <div className="relative flex items-center py-2">
        <div className="flex-1 border-t border-dashed border-muted-foreground/40" />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="mx-2 flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex-1 border-t border-dashed border-muted-foreground/40" />
      </div>

      <ComponentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </>
  )
}
