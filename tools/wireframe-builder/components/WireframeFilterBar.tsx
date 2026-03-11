import { useState } from 'react'
import { Search } from 'lucide-react'

export type FilterOption = {
  key: string
  label: string
  options?: string[]
  filterType?: 'select' | 'date-range' | 'multi-select' | 'search' | 'toggle'
}

type Props = {
  filters: FilterOption[]
  showSearch?: boolean
  searchPlaceholder?: string
  showCompareSwitch?: boolean
  compareMode?: boolean
  onCompareModeChange?: (on: boolean) => void
  comparePeriodType?: 'mensal' | 'anual'
  comparePeriod?: string
  onComparePeriodChange?: (period: string) => void
}

const MESES_MOCK = [
  'Fev/2026', 'Jan/2026', 'Dez/2025', 'Nov/2025', 'Out/2025',
  'Set/2025', 'Ago/2025', 'Jul/2025', 'Jun/2025', 'Mai/2025',
  'Abr/2025', 'Mar/2025',
]

const ANOS_MOCK = ['2025', '2024', '2023']

export default function WireframeFilterBar({
  filters,
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  showCompareSwitch = true,
  compareMode,
  onCompareModeChange,
  comparePeriodType = 'mensal',
  comparePeriod,
  onComparePeriodChange,
}: Props) {
  const [internalCompareMode, setInternalCompareMode] = useState(false)
  const [internalPeriod, setInternalPeriod] = useState(
    comparePeriodType === 'anual' ? '2025' : 'Fev/2026'
  )

  const isCompareOn = compareMode !== undefined ? compareMode : internalCompareMode
  const currentPeriod = comparePeriod !== undefined ? comparePeriod : internalPeriod

  const handleToggle = () => {
    const next = !isCompareOn
    if (onCompareModeChange) onCompareModeChange(next)
    else setInternalCompareMode(next)
  }

  const handlePeriodChange = (val: string) => {
    if (onComparePeriodChange) onComparePeriodChange(val)
    else setInternalPeriod(val)
  }

  const periodOptions = comparePeriodType === 'anual' ? ANOS_MOCK : MESES_MOCK

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--wf-card)',
        border: '1px solid var(--wf-card-border)',
        borderRadius: 12,
        padding: '8px 16px',
        flexWrap: 'wrap',
      }}
    >
      {showSearch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 180 }}>
          <Search size={13} color="var(--wf-muted)" />
          <input
            disabled
            placeholder={searchPlaceholder}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'var(--wf-muted)',
              background: 'transparent',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      )}

      {showSearch && filters.length > 0 && (
        <div style={{ width: 1, height: 20, background: 'var(--wf-card-border)', margin: '0 4px' }} />
      )}

      {filters.map((filter) => (
        <div key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {filter.label}:
          </span>
          <select
            disabled
            style={{
              fontSize: 12,
              color: 'var(--wf-body)',
              border: 'none',
              background: 'transparent',
              cursor: 'default',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              padding: '2px 4px',
            }}
          >
            <option>{filter.options?.[0] ?? 'Todos'}</option>
          </select>
        </div>
      ))}

      {showCompareSwitch && (
        <>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Period selector — visible only when compare is ON, sits LEFT of the label */}
            {isCompareOn && (
              <>
                <select
                  value={currentPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  style={{
                    fontSize: 12,
                    color: 'var(--wf-accent)',
                    border: '1px solid var(--wf-accent-muted)',
                    borderRadius: 6,
                    background: 'var(--wf-accent-muted)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    padding: '2px 8px',
                    cursor: 'pointer',
                  }}
                >
                  {periodOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </>
            )}

            <div style={{ width: 1, height: 20, background: 'var(--wf-card-border)' }} />

            <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              Comparar
            </span>

            {/* Toggle switch — fixed position, never shifts */}
            <button
              onClick={handleToggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                width: 36,
                height: 20,
                borderRadius: 10,
                background: isCompareOn ? 'var(--wf-accent)' : 'var(--wf-card-border)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--wf-card)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transform: isCompareOn ? 'translateX(18px)' : 'translateX(2px)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
