import { useWireframeBranding } from '../../lib/branding-context'

type Props = {
  section: { type: 'branding-editor'; title?: string }
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
          width: 80,
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

export default function BrandingEditorRenderer({ section }: Props) {
  const ctx = useWireframeBranding()

  if (!ctx) {
    return (
      <div
        style={{
          padding: 24,
          color: 'var(--wf-muted)',
          fontSize: 13,
          background: 'var(--wf-card)',
          borderRadius: 12,
          border: '1px solid var(--wf-border)',
        }}
      >
        Branding editor não disponível neste contexto.
      </div>
    )
  }

  const { branding, updateBranding } = ctx

  return (
    <div
      style={{
        background: 'var(--wf-card)',
        borderRadius: 12,
        border: '1px solid var(--wf-border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--wf-border)',
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--wf-heading)',
            margin: 0,
          }}
        >
          {section.title ?? 'Identidade Visual'}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: 'var(--wf-muted)',
            margin: '4px 0 0',
          }}
        >
          Personalize as cores do dashboard
        </p>
      </div>

      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <ColorField
          label="Cor Primária"
          value={branding.primaryColor}
          onChange={(hex) => updateBranding({ primaryColor: hex })}
        />
        <ColorField
          label="Cor Secundária"
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
          height: 8,
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
