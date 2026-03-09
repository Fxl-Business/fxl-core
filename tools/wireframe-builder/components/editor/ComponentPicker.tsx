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
  description: string
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
      { type: 'kpi-grid', label: 'KPI Grid', description: 'Cards com metricas-chave em linha', icon: LayoutGrid },
    ],
  },
  {
    name: 'Graficos',
    items: [
      { type: 'bar-line-chart', label: 'Barras / Linhas', description: 'Grafico de barras, linhas ou combinado', icon: BarChart3 },
      { type: 'donut-chart', label: 'Rosca', description: 'Distribuicao percentual em fatias', icon: PieChart },
      { type: 'waterfall-chart', label: 'Waterfall', description: 'Evolucao com positivos e negativos', icon: TrendingDown },
      { type: 'pareto-chart', label: 'Pareto', description: 'Barras ordenadas + linha acumulada', icon: BarChartHorizontal },
    ],
  },
  {
    name: 'Tabelas',
    items: [
      { type: 'data-table', label: 'Tabela de Dados', description: 'Tabela simples com colunas configuraveis', icon: Table2 },
      { type: 'drill-down-table', label: 'Drill Down', description: 'Tabela com linhas expandiveis', icon: Table2 },
      { type: 'clickable-table', label: 'Tabela Clicavel', description: 'Linhas clicaveis que navegam para detalhes', icon: Table2 },
      { type: 'config-table', label: 'Config', description: 'Tabela editavel para configuracoes', icon: Table2 },
    ],
  },
  {
    name: 'Inputs',
    items: [
      { type: 'saldo-banco', label: 'Saldo Banco', description: 'Saldos por banco com total consolidado', icon: Landmark },
      { type: 'manual-input', label: 'Input Manual', description: 'Campo para entrada manual de dados', icon: Keyboard },
      { type: 'upload-section', label: 'Upload', description: 'Area de upload de arquivos', icon: Upload },
    ],
  },
  {
    name: 'Layout',
    items: [
      { type: 'chart-grid', label: 'Grid de Graficos', description: 'Multiplos graficos em grid', icon: Columns3 },
      { type: 'info-block', label: 'Bloco de Info', description: 'Texto informativo com destaque visual', icon: Info },
      { type: 'calculo-card', label: 'Card de Calculo', description: 'Detalhamento de calculo passo a passo', icon: Calculator },
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
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((entry) => {
                  const Icon = entry.icon
                  return (
                    <button
                      key={entry.type}
                      type="button"
                      onClick={() => handleSelect(entry.type)}
                      className="flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium leading-tight text-foreground">{entry.label}</span>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{entry.description}</p>
                      </div>
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
