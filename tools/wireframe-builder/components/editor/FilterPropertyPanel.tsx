import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@shared/ui/sheet'
import { Button } from '@shared/ui/button'
import { Trash2 } from 'lucide-react'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'
import FilterOptionForm from './property-forms/FilterOptionForm'

type Props = {
  open: boolean
  filter: FilterOption | null
  onClose: () => void
  onChange: (updated: FilterOption) => void
  onDelete: () => void
}

export default function FilterPropertyPanel({
  open,
  filter,
  onClose,
  onChange,
  onDelete,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] overflow-y-auto"
      >
        {filter && (
          <>
            <SheetHeader>
              <SheetTitle>Editar Filtro</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterOptionForm filter={filter} onChange={onChange} />
            </div>
            <div className="mt-8 border-t pt-4">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  onDelete()
                  onClose()
                }}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remover Filtro
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
