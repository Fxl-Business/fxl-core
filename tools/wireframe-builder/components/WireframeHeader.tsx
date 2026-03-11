import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'

type Props = {
  title: string
  // Logo / branding
  logoUrl?: string          // from branding.logoUrl — shown in header left
  brandLabel?: string       // from config.label — fallback text when no logo
  showLogo?: boolean        // from config.header?.showLogo — defaults true
}

export default function WireframeHeader({
  title,
  logoUrl,
  brandLabel,
  showLogo,
}: Props) {
  const { theme, toggle } = useWireframeTheme()

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
      {/* Left: logo or brand label or screen title */}
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
          // showLogo=false: show screen title as fallback (original behavior)
          <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--wf-heading)', margin: 0 }}>{title}</h1>
        )}
      </div>

      {/* Center: search input (decorative) */}
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

      {/* Right: actions — bell, theme toggle, divider, user chip */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification bell — decorative */}
        <button
          type="button"
          style={{
            padding: 6, borderRadius: 8, border: 'none', background: 'transparent',
            color: 'var(--wf-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Bell style={{ width: 16, height: 16 }} />
        </button>

        {/* Dark mode toggle — functional */}
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

        {/* Divider */}
        <div style={{ height: 20, width: 1, background: 'var(--wf-border)', margin: '0 4px' }} />

        {/* User chip — static mock data (HEAD-04) */}
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
      </div>
    </header>
  )
}
