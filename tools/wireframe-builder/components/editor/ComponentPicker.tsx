import type { BlueprintSection } from '../../types/blueprint'
import { getCatalog } from '../../lib/section-registry'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (type: BlueprintSection['type']) => void
}

export default function ComponentPicker({ open, onClose, onSelect }: Props) {
  const catalog = getCatalog()

  function handleSelect(type: BlueprintSection['type']) {
    onSelect(type)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Secao</DialogTitle>
          <DialogDescription>Selecione o tipo de secao para adicionar</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {catalog.map((category) => (
            <div key={category.name}>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                {category.name}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((entry) => {
                  const Icon = entry.icon
                  return (
                    <button
                      key={entry.type}
                      type="button"
                      onClick={() => handleSelect(entry.type)}
                      className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium leading-tight text-foreground">{entry.label}</span>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{entry.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
