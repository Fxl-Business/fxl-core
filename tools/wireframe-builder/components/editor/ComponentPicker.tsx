import {
  BarChart3,
  PieChart,
  Table2,
  Upload,
  LayoutGrid,
  Calculator,
  Info,
  Columns3,
  Landmark,
  Keyboard,
  TrendingDown,
  BarChartHorizontal,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { BlueprintSection } from '../../types/blueprint'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (type: BlueprintSection['type']) => void
}

type CatalogEntry = {
  type: BlueprintSection['type']
  label: string
  icon: ComponentType<{ className?: string }>
}

type Category = {
  name: string
  items: CatalogEntry[]
}

const SECTION_CATALOG: Category[] = [
  {
    name: 'KPIs',
    items: [
      { type: 'kpi-grid', label: 'KPI Grid', icon: LayoutGrid },
    ],
  },
  {
    name: 'Graficos',
    items: [
      { type: 'bar-line-chart', label: 'Grafico de Barras/Linhas', icon: BarChart3 },
      { type: 'donut-chart', label: 'Grafico de Rosca', icon: PieChart },
      { type: 'waterfall-chart', label: 'Waterfall', icon: TrendingDown },
      { type: 'pareto-chart', label: 'Pareto', icon: BarChartHorizontal },
    ],
  },
  {
    name: 'Tabelas',
    items: [
      { type: 'data-table', label: 'Tabela de Dados', icon: Table2 },
      { type: 'drill-down-table', label: 'Tabela Drill Down', icon: Table2 },
      { type: 'clickable-table', label: 'Tabela Clicavel', icon: Table2 },
      { type: 'config-table', label: 'Tabela de Config', icon: Table2 },
    ],
  },
  {
    name: 'Inputs',
    items: [
      { type: 'saldo-banco', label: 'Saldo Banco', icon: Landmark },
      { type: 'manual-input', label: 'Input Manual', icon: Keyboard },
      { type: 'upload-section', label: 'Upload de Dados', icon: Upload },
    ],
  },
  {
    name: 'Layout',
    items: [
      { type: 'chart-grid', label: 'Grid de Graficos', icon: Columns3 },
      { type: 'info-block', label: 'Bloco de Info', icon: Info },
      { type: 'calculo-card', label: 'Card de Calculo', icon: Calculator },
    ],
  },
]

export default function ComponentPicker({ open, onClose, onSelect }: Props) {
  function handleSelect(type: BlueprintSection['type']) {
    onSelect(type)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Secao</DialogTitle>
          <DialogDescription>Selecione o tipo de secao para adicionar</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {SECTION_CATALOG.map((category) => (
            <div key={category.name}>
              <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                {category.name}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {category.items.map((entry) => {
                  const Icon = entry.icon
                  return (
                    <button
                      key={entry.type}
                      type="button"
                      onClick={() => handleSelect(entry.type)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs leading-tight text-foreground">{entry.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
