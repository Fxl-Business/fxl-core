import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { HeaderConfig } from '@tools/wireframe-builder/types/blueprint'
import type { HeaderElementType } from '@tools/wireframe-builder/types/editor'
import { getHeaderForm, getHeaderElementLabel } from './header-forms'

type Props = {
  open: boolean
  elementType: HeaderElementType | null
  headerConfig: HeaderConfig
  configLabel: string
  onUpdate: (updater: (header: HeaderConfig) => HeaderConfig) => void
  onClose: () => void
}

export default function HeaderPropertyPanel({
  open,
  elementType,
  headerConfig,
  configLabel,
  onUpdate,
  onClose,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        {elementType && (
          <>
            <SheetHeader>
              <SheetTitle>Editar {getHeaderElementLabel(elementType)}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {(() => {
                const Form = getHeaderForm(elementType)
                return (
                  <Form
                    headerConfig={headerConfig}
                    configLabel={configLabel}
                    onUpdate={onUpdate}
                  />
                )
              })()}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
