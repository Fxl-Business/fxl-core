import type { HeaderConfig } from '@tools/wireframe-builder/types/blueprint'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type Props = {
  open: boolean
  onClose: () => void
  onUpdate?: (patch: Partial<HeaderConfig>) => void
}

export default function HeaderConfigPanel({ open, onClose, onUpdate: _onUpdate }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurar Header</SheetTitle>
          <SheetDescription>
            Configure logo, seletor de periodo, acoes e indicadores do header.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Configuracoes do header serao implementadas em breve.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
