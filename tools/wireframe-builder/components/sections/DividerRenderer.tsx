import type { DividerSection } from '../../types/blueprint'

type Props = {
  section: DividerSection
}

export default function DividerRenderer({ section }: Props) {
  const variant = section.variant ?? 'solid'

  if (variant === 'labeled' && section.label) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: 'var(--wf-border)' }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--wf-muted)' }}
        >
          {section.label}
        </span>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: 'var(--wf-border)' }}
        />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div
        className="w-full"
        style={{
          borderTop: variant === 'dashed'
            ? '1px dashed var(--wf-border)'
            : '1px solid var(--wf-border)',
        }}
      />
    </div>
  )
}
