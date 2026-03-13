import { ChevronDown, ChevronUp, MessageSquare, Moon, Palette, Pencil, Save, Share2, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'
import BrandingPopover from './BrandingPopover'

type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  collapsed: boolean
  onToggleCollapse: () => void
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
  collapsed,
  onToggleCollapse,
  onToggleEdit,
  onSave,
  onOpenComments,
  onOpenShare,
  userDisplayName,
  userRole,
}: Props) {
  const { theme, toggle } = useWireframeTheme()
  const [brandingOpen, setBrandingOpen] = useState(false)

  if (collapsed) {
    return (
      <div className="relative shrink-0" style={{ height: 0 }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute left-1/2 top-0 z-30 -translate-x-1/2 rounded-b-md px-4 py-0.5 transition-colors"
          style={{
            background: 'var(--wf-toolbar-bg)',
            border: '1px solid var(--wf-toolbar-border)',
            borderTop: 'none',
            color: 'var(--wf-toolbar-muted)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-muted)' }}
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
        background: 'var(--wf-toolbar-bg)',
        borderBottom: '1px solid var(--wf-toolbar-border)',
      }}
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--wf-toolbar-fg)' }}
      >
        Wireframe Builder
      </span>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="inline-flex items-center justify-center rounded-md p-1 transition-colors"
        style={{ color: 'var(--wf-toolbar-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-muted)' }}
        title="Retrair toolbar"
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        {userDisplayName && (
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs"
            style={{
              background: 'var(--wf-toolbar-hover)',
              border: '1px solid var(--wf-toolbar-border)',
              color: 'var(--wf-toolbar-fg)',
            }}
          >
            <span className="font-semibold" style={{ color: 'var(--wf-toolbar-fg)' }}>{userDisplayName}</span>
            <span style={{ color: 'var(--wf-toolbar-muted)' }}>{userRole ?? 'Operador'}</span>
          </div>
        )}

        {editMode && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setBrandingOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ color: brandingOpen ? 'var(--wf-toolbar-fg)' : 'var(--wf-toolbar-muted)', background: brandingOpen ? 'var(--wf-toolbar-hover)' : 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)'; e.currentTarget.style.background = 'var(--wf-toolbar-hover)' }}
              onMouseLeave={(e) => {
                if (!brandingOpen) {
                  e.currentTarget.style.color = 'var(--wf-toolbar-muted)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Palette className="h-3.5 w-3.5" />
              Cores
            </button>
            <BrandingPopover open={brandingOpen} onClose={() => setBrandingOpen(false)} />
          </div>
        )}

        <button
          type="button"
          onClick={onOpenShare}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--wf-toolbar-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)'; e.currentTarget.style.background = 'var(--wf-toolbar-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar
        </button>

        <button
          type="button"
          onClick={onOpenComments}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--wf-toolbar-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)'; e.currentTarget.style.background = 'var(--wf-toolbar-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Comentarios
        </button>

        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors"
          style={{ color: 'var(--wf-toolbar-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-fg)'; e.currentTarget.style.background = 'var(--wf-toolbar-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-toolbar-muted)'; e.currentTarget.style.background = 'transparent' }}
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
