import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@shared/ui/sheet'
import type { FilterBarActionsConfig } from '@tools/wireframe-builder/types/blueprint'
import type { FilterBarActionElement } from '@tools/wireframe-builder/types/editor'
import FilterBarActionsForm from './property-forms/FilterBarActionsForm'

const ACTION_LABELS: Record<FilterBarActionElement, string> = {
  'date-picker': 'Seletor de Periodo',
  'share': 'Compartilhar',
  'export': 'Exportar',
  'compare': 'Comparar',
}

type Props = {
  open: boolean
  actionElement: FilterBarActionElement | null
  config: FilterBarActionsConfig
  onClose: () => void
  onChange: (updated: FilterBarActionsConfig) => void
}

export default function FilterBarActionsPanel({
  open,
  actionElement,
  config,
  onClose,
  onChange,
}: Props) {
  const title = actionElement
    ? `Editar: ${ACTION_LABELS[actionElement]}`
    : 'Acoes da Barra de Filtros'

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[450px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FilterBarActionsForm config={config} onChange={onChange} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
