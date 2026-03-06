import { cn } from '@/lib/utils'

type Screen = { label: string; active?: boolean }

type Props = {
  screens: Screen[]
  onSelect?: (label: string) => void
}

export default function WireframeSidebar({ screens, onSelect }: Props) {
  return (
    <aside className="w-48 flex-shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-2">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Telas
      </p>
      <nav className="space-y-0.5">
        {screens.map((screen) => (
          <button
            key={screen.label}
            type="button"
            onClick={() => onSelect?.(screen.label)}
            className={cn(
              'flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs transition-colors',
              screen.active
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
          >
            {screen.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
