import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, Moon, Pencil, Save, Share2, Sun, X } from 'lucide-react'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'

type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  onToggleEdit: () => void
  onSave: () => void
  onOpenComments: () => void
  onOpenShare: () => void
  userDisplayName?: string
  userRole?: string
}

export default function AdminToolbar({
  screenTitle: _screenTitle,
  editMode,
  dirty,
  saving,
  onToggleEdit,
  onSave,
  onOpenComments,
  onOpenShare,
  userDisplayName,
  userRole,
}: Props) {
  const { theme, toggle } = useWireframeTheme()
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="relative shrink-0" style={{ height: 0 }}>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-b-md px-4 py-0.5 transition-colors"
          style={{
            background: 'var(--wf-header-bg)',
            border: '1px solid var(--wf-header-border)',
            borderTop: 'none',
            color: 'var(--wf-muted)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-muted)' }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-6 shrink-0"
      style={{
        height: 40,
        background: 'var(--wf-header-bg)',
        borderBottom: '1px solid var(--wf-header-border)',
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--wf-heading)' }}
      >
        Wireframe Builder
      </span>

      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="inline-flex items-center justify-center rounded-md p-1 transition-colors"
        style={{ color: 'var(--wf-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-muted)' }}
        title="Retrair toolbar"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        {userDisplayName && (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs"
            style={{
              background: 'var(--wf-card-bg)',
              border: '1px solid var(--wf-card-border)',
              color: 'var(--wf-body)',
            }}
          >
            <span className="font-semibold" style={{ color: 'var(--wf-heading)' }}>{userDisplayName}</span>
            <span style={{ color: 'var(--wf-muted)' }}>{userRole ?? 'Operador'}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenShare}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--wf-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)'; e.currentTarget.style.background = 'var(--wf-accent-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar
        </button>

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
