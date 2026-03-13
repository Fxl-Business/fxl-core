import { useState, useEffect, useRef } from 'react'
import { Search, Calendar, ChevronDown, Share2, Download, Trash2, Plus } from 'lucide-react'
import type { FilterBarActionsConfig } from '../types/blueprint'
import type { FilterBarActionElement } from '../types/editor'

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
  editMode?: boolean
  onFilterClick?: (filterIndex: number) => void
  onFilterDelete?: (filterIndex: number) => void
  onAddFilter?: (filter: FilterOption) => void
  filterBarActions?: FilterBarActionsConfig
  selectedFilterBarAction?: FilterBarActionElement | null
  onFilterBarActionClick?: (action: FilterBarActionElement) => void
}

const MESES_MOCK = [
  'Fev/2026', 'Jan/2026', 'Dez/2025', 'Nov/2025', 'Out/2025',
  'Set/2025', 'Ago/2025', 'Jul/2025', 'Jun/2025', 'Mai/2025',
  'Abr/2025', 'Mar/2025',
]

const ANOS_MOCK = ['2025', '2024', '2023']

const FILTER_PRESETS: FilterOption[] = [
  { key: 'periodo', label: 'Periodo', filterType: 'date-range' },
  { key: 'empresa', label: 'Empresa', filterType: 'multi-select', options: ['Empresa A', 'Empresa B'] },
  { key: 'produto', label: 'Produto', filterType: 'multi-select', options: ['Produto A', 'Produto B'] },
  { key: 'status', label: 'Status', filterType: 'multi-select', options: ['Ativo', 'Inativo', 'Pendente'] },
  { key: 'responsavel', label: 'Responsavel', filterType: 'search' },
]

// ---------------------------------------------------------------------------
// Filter sub-components (module-private)
// ---------------------------------------------------------------------------

function SelectFilter({ filter }: { filter: FilterOption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--wf-neutral-500)', whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <select disabled style={{
        fontSize: 12, color: 'var(--wf-accent)', border: 'none',
        background: 'transparent', cursor: 'default',
        fontFamily: 'Inter, sans-serif', fontWeight: 700, padding: '2px 4px',
      }}>
        <option>{filter.options?.[0] ?? 'Todos'}</option>
      </select>
    </div>
  )
}

function DateRangeFilter({ filter }: { filter: FilterOption }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--wf-neutral-500)', whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--wf-body)', fontWeight: 500,
          border: '1px solid var(--wf-card-border)', borderRadius: 8,
          background: 'transparent', padding: '2px 8px',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        <Calendar size={12} color="var(--wf-muted)" />
        01/01/2026 — 28/02/2026
        <ChevronDown size={12} color="var(--wf-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
          background: 'var(--wf-card)', border: '1px solid var(--wf-card-border)',
          borderRadius: 8, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          minWidth: 280,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {['Últimos 7 dias', 'Últimos 30 dias', 'Mês anterior', 'YTD', 'Último ano'].map(p => (
              <button key={p} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                border: '1px solid var(--wf-card-border)',
                background: 'transparent', color: 'var(--wf-body)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" disabled defaultValue="2026-01-01"
              style={{
                fontSize: 12, padding: '4px 6px', border: '1px solid var(--wf-card-border)',
                borderRadius: 4, color: 'var(--wf-body)', background: 'var(--wf-card)',
                fontFamily: 'Inter, sans-serif',
              }} />
            <span style={{ color: 'var(--wf-muted)', fontSize: 12 }}>—</span>
            <input type="date" disabled defaultValue="2026-02-28"
              style={{
                fontSize: 12, padding: '4px 6px', border: '1px solid var(--wf-card-border)',
                borderRadius: 4, color: 'var(--wf-body)', background: 'var(--wf-card)',
                fontFamily: 'Inter, sans-serif',
              }} />
          </div>
        </div>
      )}
    </div>
  )
}

function MultiSelectFilter({ filter }: { filter: FilterOption }) {
  const [open, setOpen] = useState(false)
  const selected = filter.options?.slice(0, 2) ?? ['Todos']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--wf-neutral-500)', whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, border: '1px solid var(--wf-card-border)', borderRadius: 6,
          background: 'var(--wf-card)', padding: '2px 8px', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {selected.map(s => (
          <span key={s} style={{
            fontSize: 11, background: 'var(--wf-accent-muted)', color: 'var(--wf-accent-fg)',
            borderRadius: 4, padding: '1px 6px', fontWeight: 500,
          }}>{s}</span>
        ))}
        {(filter.options?.length ?? 0) > 2 && (
          <span style={{ fontSize: 11, color: 'var(--wf-muted)' }}>
            +{(filter.options?.length ?? 0) - 2}
          </span>
        )}
        <ChevronDown size={12} color="var(--wf-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
          background: 'var(--wf-card)', border: '1px solid var(--wf-card-border)',
          borderRadius: 8, padding: 8, minWidth: 160,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {(filter.options ?? ['Todos']).map(opt => (
            <div key={opt} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', fontSize: 12, color: 'var(--wf-body)',
              cursor: 'default',
            }}>
              <span style={{
                width: 14, height: 14, border: '1px solid var(--wf-card-border)',
                borderRadius: 3, background: 'var(--wf-accent-muted)', display: 'inline-block',
              }} />
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchFilter({ filter }: { filter: FilterOption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--wf-neutral-500)', whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        border: '1px solid var(--wf-card-border)', borderRadius: 6,
        background: 'var(--wf-card)', padding: '2px 8px',
      }}>
        <Search size={12} color="var(--wf-muted)" />
        <input
          disabled
          placeholder="Buscar..."
          style={{
            border: 'none', outline: 'none', fontSize: 12, color: 'var(--wf-muted)',
            background: 'transparent', width: 120, fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
    </div>
  )
}

function ToggleFilter({ filter }: { filter: FilterOption }) {
  const [on, setOn] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--wf-neutral-500)', whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <button
        onClick={() => setOn(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center',
          width: 36, height: 20, borderRadius: 10,
          background: on ? 'var(--wf-accent)' : 'var(--wf-card-border)',
          border: 'none', cursor: 'pointer', transition: 'background 0.2s',
          padding: 0, flexShrink: 0,
        }}
      >
        <span style={{
          display: 'block', width: 16, height: 16, borderRadius: '50%',
          background: 'var(--wf-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: on ? 'translateX(18px)' : 'translateX(2px)',
          transition: 'transform 0.2s',
        }} />
      </button>
    </div>
  )
}

function FilterControl({ filter }: { filter: FilterOption }) {
  const ft = filter.filterType ?? 'select'
  if (ft === 'date-range')   return <DateRangeFilter filter={filter} />
  if (ft === 'multi-select') return <MultiSelectFilter filter={filter} />
  if (ft === 'search')       return <SearchFilter filter={filter} />
  if (ft === 'toggle')       return <ToggleFilter filter={filter} />
  return <SelectFilter filter={filter} />
}

// ---------------------------------------------------------------------------
// Editable action wrapper (edit mode clickable container for filter bar actions)
// ---------------------------------------------------------------------------

function EditableActionWrapper({
  actionKey,
  editMode,
  selected,
  onClick,
  children,
}: {
  actionKey: FilterBarActionElement
  editMode?: boolean
  selected: boolean
  onClick?: (action: FilterBarActionElement) => void
  children: React.ReactNode
}) {
  if (!editMode) return <>{children}</>

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 8,
        border: selected
          ? '2px solid var(--wf-accent)'
          : '1px dashed var(--wf-card-border)',
        padding: 2,
        cursor: 'pointer',
        transition: 'border-color 150ms ease',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(actionKey)
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--wf-accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--wf-card-border)'
          e.currentTarget.style.border = '1px dashed var(--wf-card-border)'
        }
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

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
  editMode,
  onFilterClick,
  onFilterDelete,
  onAddFilter,
  filterBarActions,
  selectedFilterBarAction,
  onFilterBarActionClick,
}: Props) {
  const [showPresetPicker, setShowPresetPicker] = useState(false)
  const presetPickerRef = useRef<HTMLDivElement>(null)
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

  // Close preset picker on click outside
  useEffect(() => {
    if (!showPresetPicker) return
    function handleClickOutside(e: MouseEvent) {
      if (presetPickerRef.current && !presetPickerRef.current.contains(e.target as Node)) {
        setShowPresetPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPresetPicker])

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'color-mix(in srgb, var(--wf-canvas) 85%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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

      {filters.map((filter, index) => (
        editMode ? (
          <div
            key={filter.key}
            style={{
              position: 'relative',
              borderRadius: 8,
              border: '1px dashed var(--wf-card-border)',
              padding: '2px 4px',
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
            }}
            onClick={() => onFilterClick?.(index)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--wf-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--wf-card-border)'
            }}
          >
            <FilterControl filter={filter} />
            <button
              type="button"
              title="Remover filtro"
              onClick={(e) => {
                e.stopPropagation()
                onFilterDelete?.(index)
              }}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '1px solid var(--wf-card-border)',
                background: 'var(--wf-card)',
                color: 'var(--wf-muted)',
                cursor: 'pointer',
                transition: 'color 150ms ease, background 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444'
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.borderColor = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--wf-muted)'
                e.currentTarget.style.background = 'var(--wf-card)'
                e.currentTarget.style.borderColor = 'var(--wf-card-border)'
              }}
            >
              <Trash2 style={{ width: 10, height: 10 }} />
            </button>
          </div>
        ) : (
          <FilterControl key={filter.key} filter={filter} />
        )
      ))}

      {/* Add filter button (edit mode only) */}
      {editMode && onAddFilter && (
        <div ref={presetPickerRef} style={{ position: 'relative' }}>
          <button
            type="button"
            title="Adicionar filtro"
            onClick={() => setShowPresetPicker((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 8,
              border: '1px dashed var(--wf-card-border)',
              background: 'transparent',
              color: 'var(--wf-muted)',
              cursor: 'pointer',
              transition: 'border-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--wf-accent)'
              e.currentTarget.style.color = 'var(--wf-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--wf-card-border)'
              e.currentTarget.style.color = 'var(--wf-muted)'
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />
          </button>

          {showPresetPicker && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 20,
              marginTop: 4,
              background: 'var(--wf-card)',
              border: '1px solid var(--wf-card-border)',
              borderRadius: 8,
              padding: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              minWidth: 180,
            }}>
              {FILTER_PRESETS.map((preset) => {
                const exists = filters.some((f) => f.key === preset.key)
                return (
                  <button
                    key={preset.key}
                    type="button"
                    disabled={exists}
                    onClick={() => {
                      onAddFilter(preset)
                      setShowPresetPicker(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: 12,
                      fontWeight: 500,
                      fontFamily: 'Inter, sans-serif',
                      border: 'none',
                      borderRadius: 6,
                      background: 'transparent',
                      color: exists ? 'var(--wf-muted)' : 'var(--wf-body)',
                      cursor: exists ? 'not-allowed' : 'pointer',
                      opacity: exists ? 0.5 : 1,
                      transition: 'background 150ms ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!exists) e.currentTarget.style.background = 'var(--wf-accent-muted)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Plus style={{ width: 12, height: 12, flexShrink: 0 }} />
                    {preset.label}
                  </button>
                )
              })}
              <div style={{
                height: 1,
                background: 'var(--wf-card-border)',
                margin: '4px 0',
              }} />
              <button
                type="button"
                onClick={() => {
                  const key = `filtro-${filters.length + 1}`
                  onAddFilter({
                    key,
                    label: 'Novo Filtro',
                    filterType: 'select',
                  })
                  setShowPresetPicker(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif',
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  color: 'var(--wf-body)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--wf-accent-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Plus style={{ width: 12, height: 12, flexShrink: 0 }} />
                Filtro Personalizado
              </button>
            </div>
          )}
        </div>
      )}

      {showCompareSwitch && (
        <>
          <div style={{ flex: 1 }} />

          {/* Action buttons: date picker (outline) + share (outline) + export (filled) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {(filterBarActions?.showDatePicker !== false) && (
              <EditableActionWrapper
                actionKey="date-picker"
                editMode={editMode}
                selected={selectedFilterBarAction === 'date-picker'}
                onClick={onFilterBarActionClick}
              >
                <button type="button" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  border: '1px solid var(--wf-card-border)', background: 'transparent',
                  borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--wf-body)',
                  padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  <Calendar size={12} color="var(--wf-muted)" />
                  {filterBarActions?.datePickerLabel ?? 'Jan — Mar 2026'}
                </button>
              </EditableActionWrapper>
            )}
            {(filterBarActions?.showShare !== false) && (
              <EditableActionWrapper
                actionKey="share"
                editMode={editMode}
                selected={selectedFilterBarAction === 'share'}
                onClick={onFilterBarActionClick}
              >
                <button type="button" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  border: '1px solid var(--wf-card-border)', background: 'transparent',
                  borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--wf-body)',
                  padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  <Share2 size={12} color="var(--wf-muted)" />
                  {filterBarActions?.shareLabel ?? 'Compartilhar'}
                </button>
              </EditableActionWrapper>
            )}
            {(filterBarActions?.showExport !== false) && (
              <EditableActionWrapper
                actionKey="export"
                editMode={editMode}
                selected={selectedFilterBarAction === 'export'}
                onClick={onFilterBarActionClick}
              >
                <button type="button" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)',
                  border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>
                  <Download size={12} />
                  {filterBarActions?.exportLabel ?? 'Exportar'}
                </button>
              </EditableActionWrapper>
            )}
          </div>

          {/* Compare toggle — respects filterBarActions.showCompare override */}
          {(filterBarActions?.showCompare !== undefined
            ? filterBarActions.showCompare
            : true
          ) && (
          <EditableActionWrapper
            actionKey="compare"
            editMode={editMode}
            selected={selectedFilterBarAction === 'compare'}
            onClick={onFilterBarActionClick}
          >
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

            <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
          </EditableActionWrapper>
          )}
        </>
      )}
    </div>
  )
}
