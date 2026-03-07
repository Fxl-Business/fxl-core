import type { InfoBlockSection } from '../../types/blueprint'

type Props = {
  section: InfoBlockSection
}

const VARIANT_STYLES = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-yellow-300 bg-yellow-50 text-yellow-800',
} as const

export default function InfoBlockRenderer({ section }: Props) {
  const variant = section.variant ?? 'info'

  return (
    <div className={`rounded-lg border p-4 text-sm ${VARIANT_STYLES[variant]}`}>
      {section.content}
    </div>
  )
}
