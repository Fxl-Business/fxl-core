import { useEffect, useRef } from 'react'
import { useWireframeBranding } from '../../lib/branding-context'

type Props = {
  open: boolean
  onClose: () => void
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 40,
          height: 40,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          padding: 0,
          background: 'transparent',
        }}
      />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--wf-heading)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 11,
            color: 'var(--wf-muted)',
            margin: 0,
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          {value}
        </p>
      </div>
      <div
        style={{
          width: 72,
          height: 32,
          borderRadius: 6,
          background: value,
          border: '1px solid var(--wf-border)',
          flexShrink: 0,
        }}
      />
    </div>
  )
}

export default function BrandingPopover({ open, onClose }: Props) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const ctx = useWireframeBranding()

  useEffect(() => {
    if (!open) return

    function handleMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open, onClose])

  if (!open) return null

  if (!ctx) {
    return (
      <div
        ref={popoverRef}
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          width: 320,
          zIndex: 50,
          background: 'var(--wf-card)',
          border: '1px solid var(--wf-border)',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          padding: 20,
          color: 'var(--wf-muted)',
          fontSize: 13,
        }}
      >
        Branding editor nao disponivel neste contexto.
      </div>
    )
  }

  const { branding, updateBranding } = ctx

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 6,
        width: 320,
        zIndex: 50,
        background: 'var(--wf-card)',
        border: '1px solid var(--wf-border)',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--wf-border)',
        }}
      >
        <h3
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--wf-heading)',
            margin: 0,
          }}
        >
          Identidade Visual
        </h3>
        <p
          style={{
            fontSize: 11,
            color: 'var(--wf-muted)',
            margin: '3px 0 0',
          }}
        >
          Personalize as cores do dashboard
        </p>
      </div>

      {/* Color fields */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <ColorField
          label="Cor Primaria"
          value={branding.primaryColor}
          onChange={(hex) => updateBranding({ primaryColor: hex })}
        />
        <ColorField
          label="Cor Secundaria"
          value={branding.secondaryColor}
          onChange={(hex) => updateBranding({ secondaryColor: hex })}
        />
        <ColorField
          label="Cor de Acento"
          value={branding.accentColor}
          onChange={(hex) => updateBranding({ accentColor: hex })}
        />
      </div>

      {/* Preview strip */}
      <div
        style={{
          display: 'flex',
          height: 6,
          borderTop: '1px solid var(--wf-border)',
        }}
      >
        <div style={{ flex: 1, background: branding.primaryColor }} />
        <div style={{ flex: 1, background: branding.secondaryColor }} />
        <div style={{ flex: 1, background: branding.accentColor }} />
      </div>
    </div>
  )
}
