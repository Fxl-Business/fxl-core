import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@shared/ui/context-menu'
import {
  GripVertical,
  Plus,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@shared/utils'
import type { BlueprintScreen, PeriodType } from '@tools/wireframe-builder/types/blueprint'
import IconPicker, { getIconComponent } from './IconPicker'

type Props = {
  screens: BlueprintScreen[]
  activeIndex: number
  editMode: boolean
  onSelectScreen: (index: number) => void
  onAddScreen: (screen: BlueprintScreen) => void
  onDeleteScreen: (index: number) => void
  onRenameScreen: (index: number, title: string) => void
  onReorderScreens: (screens: BlueprintScreen[]) => void
  /** Pin position for each screen ('top' | 'bottom' | null) */
  getPinnedPosition?: (screenId: string) => 'top' | 'bottom' | null
  /** Pin a screen to top or bottom */
  onPinScreen?: (screenId: string, position: 'top' | 'bottom') => void
  /** Unpin a screen */
  onUnpinScreen?: (screenId: string) => void
}

// -- Sortable screen item -------------------------------------------------

function SortableScreenItem({
  screen,
  isActive,
  editMode,
  pinnedPosition,
  onSelect,
  onRename,
  onDelete,
  onPinTop,
  onPinBottom,
  onUnpin,
}: {
  screen: BlueprintScreen
  isActive: boolean
  editMode: boolean
  pinnedPosition: 'top' | 'bottom' | null
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
  onPinTop?: () => void
  onPinBottom?: () => void
  onUnpin?: () => void
}) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(screen.title)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screen.id, disabled: !editMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = getIconComponent(screen.icon ?? 'layout-dashboard')

  function handleRenameSubmit() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== screen.title) {
      onRename(trimmed)
    }
    setRenaming(false)
  }

  const itemContent = (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs transition-colors',
          isActive
            ? 'bg-wf-accent-muted text-wf-accent font-medium'
            : 'text-wf-sidebar-muted hover:bg-white/10 hover:text-white'
        )}
        onClick={() => {
          if (!renaming && !confirmDelete) onSelect()
        }}
      >
        {editMode && (
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-wf-sidebar-muted hover:text-wf-sidebar-fg shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        {pinnedPosition && (
          <Pin className="h-3 w-3 shrink-0 text-wf-accent" style={{ opacity: 0.7 }} />
        )}
        {Icon && <Icon className="h-4 w-4 shrink-0" />}

        {renaming ? (
          <Input
            className="h-6 bg-wf-sidebar border-wf-sidebar-border text-wf-sidebar-fg text-sm px-1"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit()
              if (e.key === 'Escape') {
                setRenameValue(screen.title)
                setRenaming(false)
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{screen.title}</span>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="mt-1 rounded-md border border-wf-sidebar-border bg-wf-sidebar p-2 text-xs text-wf-sidebar-muted">
          <p>
            Esta tela tem {screen.sections.length} secoes. Deseja excluir?
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
                setConfirmDelete(false)
              }}
            >
              Confirmar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-wf-sidebar-muted"
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(false)
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  if (!editMode) return itemContent

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {itemContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-[#0f172a] border-[var(--wf-sidebar-border)] text-white">
        <ContextMenuItem
          className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
          onClick={() => {
            setRenameValue(screen.title)
            setRenaming(true)
          }}
        >
          Renomear
        </ContextMenuItem>
        {(onPinTop || onPinBottom || onUnpin) && (
          <>
            <ContextMenuSeparator className="bg-[var(--wf-sidebar-border)]" />
            {pinnedPosition === null && onPinBottom && (
              <ContextMenuItem
                className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onPinBottom()}
              >
                <ArrowDown className="h-3.5 w-3.5 mr-2" />
                Fixar no Rodape
              </ContextMenuItem>
            )}
            {pinnedPosition === null && onPinTop && (
              <ContextMenuItem
                className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onPinTop()}
              >
                <ArrowUp className="h-3.5 w-3.5 mr-2" />
                Fixar no Topo
              </ContextMenuItem>
            )}
            {pinnedPosition === 'bottom' && onPinTop && (
              <ContextMenuItem
                className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onPinTop()}
              >
                <ArrowUp className="h-3.5 w-3.5 mr-2" />
                Mover para Topo
              </ContextMenuItem>
            )}
            {pinnedPosition === 'top' && onPinBottom && (
              <ContextMenuItem
                className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onPinBottom()}
              >
                <ArrowDown className="h-3.5 w-3.5 mr-2" />
                Mover para Rodape
              </ContextMenuItem>
            )}
            {pinnedPosition !== null && onUnpin && (
              <ContextMenuItem
                className="text-xs hover:bg-white/10 focus:bg-white/10 focus:text-white"
                onClick={() => onUnpin()}
              >
                <PinOff className="h-3.5 w-3.5 mr-2" />
                Desfixar
              </ContextMenuItem>
            )}
          </>
        )}
        <ContextMenuSeparator className="bg-[var(--wf-sidebar-border)]" />
        <ContextMenuItem
          className="text-xs text-red-400 hover:bg-white/10 focus:bg-white/10 focus:text-red-400"
          onClick={() => setConfirmDelete(true)}
        >
          Excluir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// -- Add Screen Dialog -----------------------------------------------------

function AddScreenDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (screen: BlueprintScreen) => void
}) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('layout-dashboard')
  const [periodType, setPeriodType] = useState<PeriodType>('mensal')

  function handleCreate() {
    if (!title.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      icon,
      periodType,
      filters: [],
      hasCompareSwitch: false,
      sections: [],
      rows: [],
    })
    setTitle('')
    setIcon('layout-dashboard')
    setPeriodType('mensal')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tela</DialogTitle>
          <DialogDescription>
            Crie uma nova tela para o wireframe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="new-screen-title">Titulo</Label>
            <Input
              id="new-screen-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: DRE Mensal"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              autoFocus
            />
          </div>

          <div>
            <Label>Icone</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>

          <div>
            <Label>Tipo de Periodo</Label>
            <Select
              value={periodType}
              onValueChange={(v) => setPeriodType(v as PeriodType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="none">Nenhum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Criar Tela
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// -- Main ScreenManager ----------------------------------------------------

export default function ScreenManager({
  screens,
  activeIndex,
  editMode,
  onSelectScreen,
  onAddScreen,
  onDeleteScreen,
  onRenameScreen,
  onReorderScreens,
  getPinnedPosition,
  onPinScreen,
  onUnpinScreen,
}: Props) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = screens.findIndex((s) => s.id === active.id)
    const newIndex = screens.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    onReorderScreens(arrayMove(screens, oldIndex, newIndex))
  }

  const screenIds = screens.map((s) => s.id)

  return (
    <div className="space-y-1">
      {editMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={screenIds}
            strategy={verticalListSortingStrategy}
          >
            {screens.map((screen, index) => (
              <SortableScreenItem
                key={screen.id}
                screen={screen}
                isActive={index === activeIndex}
                editMode={editMode}
                pinnedPosition={getPinnedPosition?.(screen.id) ?? null}
                onSelect={() => onSelectScreen(index)}
                onRename={(title) => onRenameScreen(index, title)}
                onDelete={() => onDeleteScreen(index)}
                onPinTop={onPinScreen ? () => onPinScreen(screen.id, 'top') : undefined}
                onPinBottom={onPinScreen ? () => onPinScreen(screen.id, 'bottom') : undefined}
                onUnpin={onUnpinScreen ? () => onUnpinScreen(screen.id) : undefined}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        screens.map((screen, index) => {
          const Icon = getIconComponent(screen.icon ?? 'layout-dashboard')
          return (
            <button
              key={screen.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors',
                index === activeIndex
                  ? 'bg-wf-accent-muted text-wf-accent font-medium'
                  : 'text-wf-sidebar-muted hover:bg-white/10 hover:text-white'
              )}
              onClick={() => onSelectScreen(index)}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{screen.title}</span>
              {screen.badge !== undefined && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--wf-accent)',
                  color: 'var(--wf-accent-fg)',
                  fontSize: 10,
                  fontWeight: 600,
                  borderRadius: 10,
                  padding: '1px 6px',
                  minWidth: 18,
                  textAlign: 'center' as const,
                  lineHeight: '16px',
                  flexShrink: 0,
                }}>
                  {screen.badge}
                </span>
              )}
            </button>
          )
        })
      )}

      {editMode && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-wf-sidebar-muted hover:text-white hover:bg-white/10 mt-2"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Nova Tela
        </Button>
      )}

      <AddScreenDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={onAddScreen}
      />
    </div>
  )
}
