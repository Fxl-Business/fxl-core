import { MessageSquare, Moon, Pencil, Sun, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'

type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  onToggleEdit: () => void
  onSave: () => void
  onOpenComments: () => void
}

export default function AdminToolbar({
  screenTitle,
  editMode,
  dirty,
  saving,
  onToggleEdit,
  onSave,
  onOpenComments,
}: Props) {
  const { theme, toggle } = useWireframeTheme()

  return (
    <div className="flex items-center gap-3 border-b bg-background px-6 py-2 shrink-0">
      <span className="text-sm font-medium text-foreground">{screenTitle}</span>

      <div className="ml-auto flex gap-2">
        <Button variant="ghost" size="sm" onClick={onOpenComments}>
          <MessageSquare className="h-4 w-4" />
          Comentarios
        </Button>

        <Button variant="ghost" size="sm" onClick={toggle}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {editMode && dirty && (
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}

        <Button
          variant={editMode ? 'outline' : 'default'}
          size="sm"
          onClick={onToggleEdit}
          className={editMode ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}
        >
          {editMode ? (
            <>
              <X className="h-4 w-4" />
              Sair da Edicao
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" />
              Editar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
