import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'

type Props = {
  id: string
  editMode: boolean
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  children: React.ReactNode
}

export default function EditableSectionWrapper({
  id,
  editMode,
  selected,
  onSelect,
  onDelete,
  children,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!editMode) {
    return <>{children}</>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative rounded-lg border-2 border-dashed cursor-pointer group transition-all ${
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-muted-foreground/30 hover:border-muted-foreground/50'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="absolute -left-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-background border shadow-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* Delete button */}
      <div className="absolute -right-2 -top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <div
            className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-muted-foreground">Remover?</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
                setConfirmDelete(false)
              }}
              className="rounded px-1.5 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              Confirmar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(false)
              }}
              className="rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDelete(true)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md border bg-background shadow-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Section content */}
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}
