type FilterType = 'periodo' | 'ano' | 'segmento' | 'vendedor' | 'unidade' | 'categoria' | 'status'

const FILTER_LABELS: Record<FilterType, string> = {
  periodo:   'Período',
  ano:       'Ano',
  segmento:  'Segmento',
  vendedor:  'Vendedor',
  unidade:   'Unidade',
  categoria: 'Categoria',
  status:    'Status',
}

type Props = {
  filters: FilterType[]
}

export default function GlobalFilters({ filters }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      {filters.map((filter) => (
        <div key={filter} className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {FILTER_LABELS[filter]}
          </label>
          <select
            disabled
            className="cursor-default rounded border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-400 shadow-sm"
          >
            <option>Todos</option>
          </select>
        </div>
      ))}
    </div>
  )
}
