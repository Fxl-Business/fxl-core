import type { BlueprintSection } from '../../types/blueprint'
import { getCatalog } from '../../lib/section-registry'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePickerMode } from './usePickerMode'
import SectionPreviewCard from './SectionPreviewCard'
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
  const { mode, setMode } = usePickerMode()

  function handleSelect(type: BlueprintSection['type']) {
    onSelect(type)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className={mode === 'preview' ? 'max-w-4xl' : 'max-w-lg'}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Adicionar Secao</DialogTitle>
              <DialogDescription>Selecione o tipo de secao para adicionar</DialogDescription>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  mode === 'preview'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Modo preview"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMode('compact')}
                className={cn(
                  'rounded-md p-1.5 transition-colors',
                  mode === 'compact'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Modo compacto"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {catalog.map((category) => (
            <div key={category.name}>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                {category.name}
              </h4>
              {mode === 'preview' ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {category.items.map((entry) => (
                    <SectionPreviewCard
                      key={entry.type}
                      type={entry.type}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
