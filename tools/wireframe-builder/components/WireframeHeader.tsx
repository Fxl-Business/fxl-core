import { Search, Bell, Moon, Sun, Settings, Share2, Download, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'
import type { PeriodType } from '@tools/wireframe-builder/types/blueprint'
import type { HeaderElementType } from '@tools/wireframe-builder/types/editor'

type Props = {
  title: string
  // Logo / branding
  logoUrl?: string          // from branding.logoUrl — shown in header left
  brandLabel?: string       // from config.label — fallback text when no logo
  showLogo?: boolean        // from config.header?.showLogo — defaults true
  // Period selector
  showPeriodSelector?: boolean  // from config.header?.showPeriodSelector — defaults true
  periodType?: PeriodType       // from config.header?.periodType — determines period label
  // User indicator
  showUserIndicator?: boolean   // from config.header?.showUserIndicator — defaults true
  // Action buttons
  actions?: {
    manage?: boolean    // defaults true
    share?: boolean     // defaults true
    export?: boolean    // defaults false
  }
  // Edit mode
  editMode?: boolean
  selectedElement?: HeaderElementType | null
  onSelectElement?: (element: HeaderElementType) => void
}

function ZoneWrapper({
  elementType,
  editMode,
  selected,
  onSelect,
  visible,
  placeholderLabel,
  children,
}: {
  elementType: HeaderElementType
  editMode?: boolean
  selected?: boolean
  onSelect?: (element: HeaderElementType) => void
  visible: boolean
  placeholderLabel: string
  children: React.ReactNode
}) {
  if (!editMode) {
    return visible ? <>{children}</> : null
  }

  const borderClass = selected
    ? 'border-primary ring-2 ring-primary/20'
    : 'border-transparent hover:border-muted-foreground/30'

  return (
    <div
      className={`border-2 border-dashed rounded-md cursor-pointer transition-all ${borderClass}`}
      style={{ display: 'flex', alignItems: 'center' }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(elementType)
      }}
    >
      {visible ? (
        children
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            fontSize: 10,
            color: 'var(--wf-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus style={{ width: 12, height: 12 }} />
          <span>{placeholderLabel}</span>
        </div>
      )}
    </div>
  )
}

export default function WireframeHeader({
  title,
  logoUrl,
  brandLabel,
  showLogo,
  showPeriodSelector,
  periodType,
  showUserIndicator,
  actions,
  editMode,
  selectedElement,
  onSelectElement,
}: Props) {
  const { theme, toggle } = useWireframeTheme()

  const brandContent = (
    <div style={{ flex: '0 0 auto', minWidth: 160, display: 'flex', alignItems: 'center' }}>
      {(showLogo !== false) && logoUrl ? (
        <img
          src={logoUrl}
          alt={brandLabel ?? 'Logo'}
          style={{ maxHeight: 28, maxWidth: 100, objectFit: 'contain' }}
        />
      ) : (showLogo !== false) && brandLabel ? (
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--wf-heading)', letterSpacing: 0.5 }}>
          {brandLabel}
        </span>
      ) : (
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--wf-heading)', margin: 0 }}>{title}</h1>
      )}
    </div>
  )

  const periodContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 4 }}>
      <button
        type="button"
        style={{
          padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
          color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ChevronLeft style={{ width: 14, height: 14 }} />
      </button>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
        borderRadius: 6, background: 'var(--wf-header-search-bg)',
        fontSize: 11, fontWeight: 600, color: 'var(--wf-heading)', whiteSpace: 'nowrap',
      }}>
        <Calendar style={{ width: 12, height: 12, color: 'var(--wf-muted)' }} />
        <span>{periodType === 'anual' ? '2026' : 'Jan / 26'}</span>
      </div>
      <button
        type="button"
        style={{
          padding: 4, borderRadius: 6, border: 'none', background: 'transparent',
          color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ChevronRight style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )

  const actionsContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {actions?.manage !== false && (
        <button
          type="button"
          style={{
            padding: '4px 8px', borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          }}
        >
          <Settings style={{ width: 14, height: 14 }} />
          <span>Gerenciar</span>
        </button>
      )}
      {actions?.share !== false && (
        <button
          type="button"
          style={{
            padding: '4px 8px', borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          }}
        >
          <Share2 style={{ width: 14, height: 14 }} />
          <span>Compartilhar</span>
        </button>
      )}
      {actions?.export === true && (
        <button
          type="button"
          style={{
            padding: '4px 8px', borderRadius: 6, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          }}
        >
          <Download style={{ width: 14, height: 14 }} />
          <span>Exportar</span>
        </button>
      )}
    </div>
  )

  const hasAnyAction = actions?.manage !== false || actions?.share !== false || actions?.export === true

  const userContent = (
    <>
      {/* Divider */}
      <div style={{ height: 20, width: 1, background: 'var(--wf-border)', margin: '0 4px' }} />

      {/* User chip — static mock data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--wf-heading)', lineHeight: 1.3, margin: 0 }}>Operador FXL</p>
          <p style={{ fontSize: 10, color: 'var(--wf-muted)', lineHeight: 1.3, margin: 0 }}>Analista</p>
        </div>
        <div style={{
          height: 32, width: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>OF</span>
        </div>
      </div>
    </>
  )

  return (
    <header
      style={{
        height: 56,
        background: 'var(--wf-header-bg)',
        borderBottom: '1px solid var(--wf-header-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Left: brand zone */}
      <ZoneWrapper
        elementType="header-brand"
        editMode={editMode}
        selected={selectedElement === 'header-brand'}
        onSelect={onSelectElement}
        visible={true}
        placeholderLabel="Marca"
      >
        {brandContent}
      </ZoneWrapper>

      {/* Center: search input (decorative — not editable) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 32px' }}>
          <Search
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--wf-muted)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Pesquisar..."
            readOnly
            style={{
              width: '100%',
              borderRadius: 8,
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 6,
              paddingBottom: 6,
              fontSize: 12,
              color: 'var(--wf-body)',
              background: 'var(--wf-header-search-bg)',
              border: 'none',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Right: actions area */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Period selector zone */}
        <ZoneWrapper
          elementType="header-period"
          editMode={editMode}
          selected={selectedElement === 'header-period'}
          onSelect={onSelectElement}
          visible={showPeriodSelector !== false}
          placeholderLabel="Periodo"
        >
          {periodContent}
        </ZoneWrapper>

        {/* Actions zone */}
        <ZoneWrapper
          elementType="header-actions"
          editMode={editMode}
          selected={selectedElement === 'header-actions'}
          onSelect={onSelectElement}
          visible={hasAnyAction}
          placeholderLabel="Acoes"
        >
          {actionsContent}
        </ZoneWrapper>

        {/* Notification bell — decorative (not editable) */}
        <button
          type="button"
          style={{
            padding: 6, borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Bell style={{ width: 16, height: 16 }} />
        </button>

        {/* Dark mode toggle — functional (not editable) */}
        <button
          type="button"
          onClick={toggle}
          style={{
            padding: 6, borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {theme === 'light' ? <Moon style={{ width: 16, height: 16 }} /> : <Sun style={{ width: 16, height: 16 }} />}
        </button>

        {/* User indicator zone */}
        <ZoneWrapper
          elementType="header-user"
          editMode={editMode}
          selected={selectedElement === 'header-user'}
          onSelect={onSelectElement}
          visible={showUserIndicator !== false}
          placeholderLabel="Usuario"
        >
          {userContent}
        </ZoneWrapper>
      </div>
    </header>
  )
}
