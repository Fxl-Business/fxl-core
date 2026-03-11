import { useState } from 'react'

type PeriodType = 'mensal' | 'anual' | 'none'

type Props = {
  title: string
  periodType?: PeriodType
  // Logo / branding
  logoUrl?: string          // from branding.logoUrl — shown in header left
  brandLabel?: string       // from config.label — fallback text when no logo
  showLogo?: boolean        // from config.header?.showLogo — defaults true
  // Period selector
  showPeriodSelector?: boolean  // from config.header?.showPeriodSelector — defaults true
  // User indicator
  showUserIndicator?: boolean   // from config.header?.showUserIndicator — defaults true
  userDisplayName?: string      // from Clerk user.fullName or user.firstName
  userRole?: string             // default 'Operador'
  // Action buttons
  onGerenciar?: () => void
  showManage?: boolean          // from config.header?.actions?.manage — defaults true (shows Gerenciar)
  onShare?: () => void          // from config.header?.actions?.share — defaults true
  onExport?: () => void         // from config.header?.actions?.export — defaults false
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const arrowButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--wf-card-border)',
  borderRadius: 4,
  width: 24,
  height: 24,
  fontSize: 16,
  color: 'var(--wf-body)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--wf-card-border)',
  borderRadius: 4,
  padding: '4px 12px',
  fontSize: 12,
  color: 'var(--wf-body)',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}

export default function WireframeHeader({
  title,
  periodType = 'mensal',
  logoUrl,
  brandLabel,
  showLogo,
  showPeriodSelector,
  showUserIndicator,
  userDisplayName,
  userRole,
  onGerenciar,
  showManage,
  onShare,
  onExport,
}: Props) {
  const [mensal, setMensal] = useState({ monthIndex: 0, year: 2026 })
  const [anualYear, setAnualYear] = useState(2025)

  function prevMensal() {
    setMensal((prev) => {
      if (prev.monthIndex === 0) return { monthIndex: 11, year: prev.year - 1 }
      return { ...prev, monthIndex: prev.monthIndex - 1 }
    })
  }

  function nextMensal() {
    setMensal((prev) => {
      if (prev.monthIndex === 11) return { monthIndex: 0, year: prev.year + 1 }
      return { ...prev, monthIndex: prev.monthIndex + 1 }
    })
  }

  return (
    <header
      style={{
        height: 56,
        background: 'var(--wf-header-bg)',
        borderBottom: '1px solid var(--wf-header-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
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

      {/* Center: period selector (absolute centered) */}
      {(showPeriodSelector !== false) && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {periodType === 'mensal' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={arrowButtonStyle} onClick={prevMensal}>‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wf-heading)', minWidth: 130, textAlign: 'center' }}>
                {MESES[mensal.monthIndex]} / {String(mensal.year).slice(2)}
              </span>
              <button style={arrowButtonStyle} onClick={nextMensal}>›</button>
            </div>
          )}

          {periodType === 'anual' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={arrowButtonStyle} onClick={() => setAnualYear((y) => y - 1)}>‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--wf-heading)', minWidth: 60, textAlign: 'center' }}>
                {anualYear}
              </span>
              <button style={arrowButtonStyle} onClick={() => setAnualYear((y) => y + 1)}>›</button>
            </div>
          )}
        </div>
      )}

      {/* Right: user chip + action buttons */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        {/* User indicator chip */}
        {(showUserIndicator !== false) && userDisplayName && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            background: 'var(--wf-card-bg)',
            border: '1px solid var(--wf-card-border)',
            borderRadius: 20,
            fontSize: 11,
            color: 'var(--wf-body)',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--wf-heading)' }}>{userDisplayName}</span>
            <span style={{ color: 'var(--wf-sidebar-muted)' }}>{userRole ?? 'Operador'}</span>
          </div>
        )}

        {/* Export button (only when onExport provided) */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            style={buttonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-body)' }}
          >
            Exportar
          </button>
        )}

        {/* Share button */}
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            style={buttonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-body)' }}
          >
            Compartilhar
          </button>
        )}

        {/* Gerenciar button (conditionally shown) */}
        {onGerenciar && (showManage !== false) && (
          <button
            type="button"
            onClick={onGerenciar}
            style={buttonStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--wf-heading)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--wf-body)' }}
          >
            Gerenciar
          </button>
        )}
      </div>
    </header>
  )
}
