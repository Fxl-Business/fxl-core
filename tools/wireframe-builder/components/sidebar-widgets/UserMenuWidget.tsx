import { useState } from 'react'
import type React from 'react'

type UserMenuWidgetProps = {
  label?: string
  role?: string
  collapsed: boolean
}

export function UserMenuWidget({ label, role, collapsed }: UserMenuWidgetProps) {
  const [hovered, setHovered] = useState(false)

  const displayName = label ?? 'Operador'
  const displayRole = role ?? 'Admin'
  const initials = displayName.charAt(0).toUpperCase()

  if (collapsed) {
    const buttonStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: hovered ? '#1e293b' : 'transparent',
      border: 'none',
      cursor: 'default',
      transition: 'background 150ms ease',
      padding: 0,
      flexShrink: 0,
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 0 8px',
        }}
      >
        <div
          style={buttonStyle}
          title={displayName}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--wf-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {initials}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const containerStyle: React.CSSProperties = {
    padding: 12,
    margin: '0 12px 12px',
    borderRadius: 8,
    border: '1px solid var(--wf-sidebar-border)',
    flexShrink: 0,
    background: hovered ? '#1e293b' : 'transparent',
    transition: 'background 150ms ease',
    cursor: 'default',
  }

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Avatar circle */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--wf-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {initials}
          </span>
        </div>
        {/* Name + role */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: hovered ? '#fff' : 'var(--wf-sidebar-fg)',
              lineHeight: 1.3,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
          >
            {displayName}
          </p>
          <p
            style={{
              fontSize: 10,
              color: hovered ? 'rgba(255,255,255,0.6)' : 'var(--wf-sidebar-muted)',
              lineHeight: 1.3,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease',
            }}
          >
            {displayRole}
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserMenuWidget
