import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@shared/ui/sheet'

type Props = {
  open: boolean
  onClose: () => void
}

export default function FilterBarPanel({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editor de Filtros</SheetTitle>
          <SheetDescription>
            Adicione, remova e configure filtros da barra de filtros desta tela.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Editor de filtros sera implementado em breve.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
