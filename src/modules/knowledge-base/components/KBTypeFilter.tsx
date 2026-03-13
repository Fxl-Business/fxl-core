import { KB_ENTRY_TYPES } from '../types/kb'
import type { KBEntryType } from '../types/kb'

// ---------------------------------------------------------------------------
// KBTypeFilter — pill-based filter for entry type
// ---------------------------------------------------------------------------

interface KBTypeFilterProps {
  value: KBEntryType | undefined
  onChange: (type: KBEntryType | undefined) => void
}

export function KBTypeFilter({ value, onChange }: KBTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "Todos" pill — clears filter */}
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={[
          'rounded-full px-3 py-1 text-xs font-medium transition-colors',
          value === undefined
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
        ].join(' ')}
      >
        Todos
      </button>

      {/* Type pills */}
      {KB_ENTRY_TYPES.map(({ value: typeValue, label }) => (
        <button
          key={typeValue}
          type="button"
          onClick={() => onChange(typeValue)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            value === typeValue
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
