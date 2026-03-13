import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import type React from 'react'

type WorkspaceSwitcherWidgetProps = {
  label?: string
  collapsed: boolean
}

export function WorkspaceSwitcherWidget({ label, collapsed }: WorkspaceSwitcherWidgetProps) {
  const [hovered, setHovered] = useState(false)

  const displayLabel = label ?? 'Workspace'

  if (collapsed) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 6,
          background: hovered ? '#1e293b' : 'transparent',
          cursor: 'default',
          transition: 'background 150ms ease',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={displayLabel}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: 'var(--wf-accent)',
            flexShrink: 0,
          }}
        />
      </div>
    )
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 6,
    background: hovered ? '#1e293b' : 'var(--wf-sidebar-border)',
    cursor: 'default',
    transition: 'background 150ms ease',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Brand square */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          background: 'var(--wf-accent)',
          flexShrink: 0,
        }}
      />
      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: 12,
          fontWeight: 600,
          color: hovered ? '#fff' : 'var(--wf-sidebar-fg)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 150ms ease',
        }}
      >
        {displayLabel}
      </span>
      {/* Chevron */}
      <ChevronsUpDown
        style={{
          width: 14,
          height: 14,
          color: hovered ? '#fff' : 'var(--wf-sidebar-muted)',
          flexShrink: 0,
          transition: 'color 150ms ease',
        }}
      />
    </div>
  )
}

export default WorkspaceSwitcherWidget
