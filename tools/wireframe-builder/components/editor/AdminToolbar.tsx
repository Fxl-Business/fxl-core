import { MessageSquare, Moon, Pencil, Save, Sun, X } from 'lucide-react'
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
    <div
      className="flex items-center gap-3 px-6 py-2 shrink-0"
      style={{
        background: 'var(--wf-header-bg)',
        borderBottom: '1px solid var(--wf-header-border)',
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--wf-heading)' }}
      >
        {screenTitle}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenComments}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--wf-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)'; e.currentTarget.style.background = 'var(--wf-accent-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Comentarios
        </button>

        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
          style={{ color: 'var(--wf-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)'; e.currentTarget.style.background = 'var(--wf-accent-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </button>

        {editMode && dirty && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--wf-accent)',
              color: 'var(--wf-accent-fg)',
            }}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={editMode ? {
            color: 'var(--wf-negative)',
            border: '1px solid var(--wf-negative)',
            background: 'transparent',
          } : {
            color: 'var(--wf-accent-fg)',
            background: 'var(--wf-accent)',
          }}
        >
          {editMode ? (
            <>
              <X className="h-3.5 w-3.5" />
              Sair da Edicao
            </>
          ) : (
            <>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
