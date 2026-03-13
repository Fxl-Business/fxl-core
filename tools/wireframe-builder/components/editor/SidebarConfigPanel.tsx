import type { SidebarConfig } from '@tools/wireframe-builder/types/blueprint'
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
  onUpdate?: (patch: Partial<SidebarConfig>) => void
}

export default function SidebarConfigPanel({ open, onClose, onUpdate: _onUpdate }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configurar Sidebar</SheetTitle>
          <SheetDescription>
            Gerencie grupos, footer e widgets da sidebar.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Configuracoes da sidebar serao implementadas em breve.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
