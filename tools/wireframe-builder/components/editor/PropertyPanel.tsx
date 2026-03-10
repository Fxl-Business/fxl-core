import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { BlueprintSection } from '@tools/wireframe-builder/types/blueprint'
import { getPropertyForm, getSectionLabel } from '@tools/wireframe-builder/lib/section-registry'

type Props = {
  open: boolean
  section: BlueprintSection | null
  onClose: () => void
  onChange: (updated: BlueprintSection) => void
}

export default function PropertyPanel({
  open,
  section,
  onClose,
  onChange,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] overflow-y-auto"
      >
        {section && (
          <>
            <SheetHeader>
              <SheetTitle>Editar {getSectionLabel(section.type)}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {(() => {
                const Form = getPropertyForm(section.type)
                return <Form section={section} onChange={onChange} />
              })()}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
