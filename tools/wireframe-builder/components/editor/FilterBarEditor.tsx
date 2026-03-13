import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import type { FilterOption } from '@tools/wireframe-builder/components/WireframeFilterBar'

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const FILTER_PRESETS: FilterOption[] = [
  {
    key: 'periodo',
    label: 'Periodo',
    filterType: 'date-range',
  },
  {
    key: 'empresa',
    label: 'Empresa',
    filterType: 'multi-select',
    options: ['Empresa A', 'Empresa B'],
  },
  {
    key: 'produto',
    label: 'Produto',
    filterType: 'multi-select',
    options: ['Produto A', 'Produto B'],
  },
  {
    key: 'status',
    label: 'Status',
    filterType: 'multi-select',
    options: ['Ativo', 'Inativo', 'Pendente'],
  },
  {
    key: 'responsavel',
    label: 'Responsavel',
    filterType: 'search',
  },
]

// ---------------------------------------------------------------------------
// FilterType options
// ---------------------------------------------------------------------------

const FILTER_TYPE_OPTIONS: { value: NonNullable<FilterOption['filterType']>; label: string }[] = [
  { value: 'select', label: 'Select' },
  { value: 'date-range', label: 'Intervalo de Data' },
  { value: 'multi-select', label: 'Multi-Select' },
  { value: 'search', label: 'Busca' },
  { value: 'toggle', label: 'Toggle' },
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type FilterBarEditorProps = {
  open: boolean
  filters: FilterOption[]
  onChange: (filters: FilterOption[]) => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Add-new filter form state
// ---------------------------------------------------------------------------

type NewFilterForm = {
  key: string
  label: string
  filterType: NonNullable<FilterOption['filterType']>
  options: string
}

const EMPTY_FORM: NewFilterForm = {
  key: '',
  label: '',
  filterType: 'select',
  options: '',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function showOptionsField(filterType: NonNullable<FilterOption['filterType']>): boolean {
  return filterType === 'select' || filterType === 'multi-select'
}

function sanitizeKey(raw: string): string {
  return raw.toLowerCase().replace(/\s+/g, '-')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FilterBarEditor({ open, filters, onChange, onClose }: FilterBarEditorProps) {
  const [newForm, setNewForm] = useState<NewFilterForm>(EMPTY_FORM)

  // ---- Preset helpers ----

  function handleAddPreset(preset: FilterOption) {
    if (filters.some((f) => f.key === preset.key)) return
    onChange([...filters, { ...preset }])
  }

  // ---- Existing filter mutations ----

  function handleUpdateLabel(index: number, label: string) {
    const updated = filters.map((f, i) => (i === index ? { ...f, label } : f))
    onChange(updated)
  }

  function handleUpdateFilterType(index: number, filterType: NonNullable<FilterOption['filterType']>) {
    const updated = filters.map((f, i) => {
      if (i !== index) return f
      const next: FilterOption = { ...f, filterType }
      // Clear options when switching away from select/multi-select
      if (!showOptionsField(filterType)) {
        const { options: _options, ...rest } = next
        void _options
        return rest
      }
      return next
    })
    onChange(updated)
  }

  function handleUpdateOptions(index: number, raw: string) {
    const options = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const updated = filters.map((f, i) =>
      i === index ? { ...f, options: options.length > 0 ? options : undefined } : f,
    )
    onChange(updated)
  }

  function handleDelete(index: number) {
    const updated = filters.filter((_, i) => i !== index)
    onChange(updated)
  }

  // ---- Add new filter ----

  const isKeyDuplicate = filters.some((f) => f.key === newForm.key)
  const isAddDisabled = newForm.key.trim() === '' || isKeyDuplicate

  function handleAddNew() {
    if (isAddDisabled) return
    const filter: FilterOption = {
      key: newForm.key.trim(),
      label: newForm.label.trim() || newForm.key.trim(),
      filterType: newForm.filterType,
    }
    if (showOptionsField(newForm.filterType) && newForm.options.trim() !== '') {
      filter.options = newForm.options
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    }
    onChange([...filters, filter])
    setNewForm(EMPTY_FORM)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros da Tela</SheetTitle>
          <SheetDescription>
            Adicione e configure os filtros da barra fixa desta tela.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">

          {/* ---- Preset buttons ---- */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Adicionar Predefinido
            </Label>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => {
                const exists = filters.some((f) => f.key === preset.key)
                return (
                  <Button
                    key={preset.key}
                    variant="outline"
                    size="sm"
                    disabled={exists}
                    onClick={() => handleAddPreset(preset)}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {preset.label}
                  </Button>
                )
              })}
            </div>
            <Separator />
          </div>

          {/* ---- Existing filter list ---- */}
          <div className="space-y-3">
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum filtro configurado. Use os botoes acima para adicionar filtros predefinidos ou crie um novo abaixo.
              </p>
            ) : (
              filters.map((filter, index) => (
                <div key={filter.key} className="rounded-lg border p-4 space-y-3">
                  {/* Header row: key badge + delete button */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {filter.key}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Label field */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Label
                    </Label>
                    <Input
                      value={filter.label}
                      onChange={(e) => handleUpdateLabel(index, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* FilterType field */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Tipo
                    </Label>
                    <Select
                      value={filter.filterType ?? 'select'}
                      onValueChange={(v) =>
                        handleUpdateFilterType(index, v as NonNullable<FilterOption['filterType']>)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTER_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Options field — only for select/multi-select */}
                  {showOptionsField(filter.filterType ?? 'select') && (
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Opcoes (separadas por virgula)
                      </Label>
                      <Input
                        value={filter.options?.join(', ') ?? ''}
                        onChange={(e) => handleUpdateOptions(index, e.target.value)}
                        placeholder="Opcao 1, Opcao 2, ..."
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ---- Add new filter form ---- */}
          <div className="rounded-lg border border-dashed p-4 space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Novo Filtro
            </Label>

            {/* Key input */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Chave (read-only apos criacao)
              </Label>
              <Input
                value={newForm.key}
                onChange={(e) =>
                  setNewForm((prev) => ({ ...prev, key: sanitizeKey(e.target.value) }))
                }
                placeholder="chave-do-filtro"
                className="h-8 text-sm font-mono"
              />
              {isKeyDuplicate && newForm.key !== '' && (
                <p className="text-xs text-destructive">Chave ja existe nos filtros desta tela.</p>
              )}
            </div>

            {/* Label input */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Label
              </Label>
              <Input
                value={newForm.label}
                onChange={(e) => setNewForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Label do filtro"
                className="h-8 text-sm"
              />
            </div>

            {/* FilterType select */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Tipo
              </Label>
              <Select
                value={newForm.filterType}
                onValueChange={(v) =>
                  setNewForm((prev) => ({
                    ...prev,
                    filterType: v as NonNullable<FilterOption['filterType']>,
                  }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options input — only for select/multi-select */}
            {showOptionsField(newForm.filterType) && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Opcoes (separadas por virgula)
                </Label>
                <Input
                  value={newForm.options}
                  onChange={(e) => setNewForm((prev) => ({ ...prev, options: e.target.value }))}
                  placeholder="Opcao 1, Opcao 2, ..."
                  className="h-8 text-sm"
                />
              </div>
            )}

            {/* Add button */}
            <Button
              onClick={handleAddNew}
              disabled={isAddDisabled}
              size="sm"
              className="w-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adicionar Filtro
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
