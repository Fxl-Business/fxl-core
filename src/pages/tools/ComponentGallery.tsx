import { useState } from 'react'
import { CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import WaterfallChart from '@tools/wireframe-builder/components/WaterfallChart'
import DonutChart from '@tools/wireframe-builder/components/DonutChart'
import ParetoChart from '@tools/wireframe-builder/components/ParetoChart'
import StackedBarChartComponent from '@tools/wireframe-builder/components/StackedBarChartComponent'
import StackedAreaChartComponent from '@tools/wireframe-builder/components/StackedAreaChartComponent'
import HorizontalBarChartComponent from '@tools/wireframe-builder/components/HorizontalBarChartComponent'
import BubbleChartComponent from '@tools/wireframe-builder/components/BubbleChartComponent'
import ComposedChartComponent from '@tools/wireframe-builder/components/ComposedChartComponent'
import GaugeChartComponent from '@tools/wireframe-builder/components/GaugeChartComponent'
import DataTable from '@tools/wireframe-builder/components/DataTable'
import DrillDownTable from '@tools/wireframe-builder/components/DrillDownTable'
import ClickableTable from '@tools/wireframe-builder/components/ClickableTable'
import ConfigTable from '@tools/wireframe-builder/components/ConfigTable'
import CalculoCard from '@tools/wireframe-builder/components/CalculoCard'
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'
import GlobalFilters from '@tools/wireframe-builder/components/GlobalFilters'

import InputsScreen from '@tools/wireframe-builder/components/InputsScreen'
import DetailViewSwitcher from '@tools/wireframe-builder/components/DetailViewSwitcher'
import UploadSection from '@tools/wireframe-builder/components/UploadSection'
import ManualInputSection from '@tools/wireframe-builder/components/ManualInputSection'
import SaldoBancoInput from '@tools/wireframe-builder/components/SaldoBancoInput'
import WireframeModal from '@tools/wireframe-builder/components/WireframeModal'

import {
  kpiCardMock,
  kpiCardFullMock,
  barLineChartMock,
  waterfallChartMock,
  donutChartMock,
  paretoChartMock,
  dataTableMock,
  drillDownTableMock,
  clickableTableMock,
  configTableMock,
  calculoCardMock,
  wireframeSidebarMock,
  wireframeHeaderMock,
  wireframeFilterBarMock,
  globalFiltersMock,

  inputsScreenMock,
  detailViewSwitcherMock,
  uploadSectionMock,
  manualInputSectionMock,
  saldoBancoInputMock,
  wireframeModalMock,
  waterfallCompareBars,
  calculoCardCompareRows,
  stackedBarChartMock,
  stackedAreaChartMock,
  horizontalBarChartMock,
  bubbleChartMock,
  composedChartMock,
  gaugeChartMock,
} from './galleryMockData'

type ComponentStatus = 'available' | 'pending'

type ComponentEntry = {
  name: string
  status: ComponentStatus
  description?: string
  props?: string[]
  render?: () => React.ReactNode
  hasToolbar?: boolean
  specHref?: string
}

type Category = {
  id: string
  label: string
  components: ComponentEntry[]
}

function ModalPreview() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        Abrir Modal
      </button>
      <WireframeModal
        title={wireframeModalMock.title}
        open={open}
        onClose={() => setOpen(false)}
        size={wireframeModalMock.size}
        footer={
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>Total: R$ 12.500,00</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Fechar
            </button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">Conteudo do modal renderizado com dados fictícios.</p>
        <DataTable
          title="Movimentações do Dia"
          columns={[
            { key: 'desc', label: 'Descrição' },
            { key: 'valor', label: 'Valor', align: 'right' },
          ]}
          rowCount={3}
        />
      </WireframeModal>
    </>
  )
}

function DetailViewSwitcherPreview() {
  const [active, setActive] = useState(detailViewSwitcherMock.activeOption)
  return (
    <DetailViewSwitcher
      options={detailViewSwitcherMock.options}
      activeOption={active}
      onChange={setActive}
    />
  )
}

function PropToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-colors',
            !value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted',
          )}
        >
          OFF
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-colors',
            value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted',
          )}
        >
          ON
        </button>
      </div>
    </div>
  )
}

function PropPills<T extends string>({ label, options, value, onChange }: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-border">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium transition-colors',
              value === opt ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function PropsToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-t-lg border border-b-0 border-border bg-muted px-4 py-2.5">
      {children}
    </div>
  )
}

function KpiCardPreview() {
  const [positive, setPositive] = useState(true)
  return (
    <div>
      <PropsToolbar>
        <PropToggle label="variationPositive" value={positive} onChange={setPositive} />
      </PropsToolbar>
      <div className="rounded-b-lg border border-border bg-muted/50 p-4">
        <div className="max-w-xs">
          <KpiCard {...kpiCardMock} variationPositive={positive} />
        </div>
      </div>
    </div>
  )
}

function KpiCardFullPreview() {
  const [compareMode, setCompareMode] = useState(true)
  return (
    <div>
      <PropsToolbar>
        <PropToggle label="compareMode" value={compareMode} onChange={setCompareMode} />
      </PropsToolbar>
      <div className="rounded-b-lg border border-border bg-muted/50 p-4">
        <div className="max-w-xs">
          <KpiCardFull {...kpiCardFullMock} compareMode={compareMode} />
        </div>
      </div>
    </div>
  )
}

function BarLineChartPreview() {
  const [type, setType] = useState<'bar' | 'line' | 'bar-line'>('bar')
  return (
    <div>
      <PropsToolbar>
        <PropPills label="type" options={['bar', 'line', 'bar-line']} value={type} onChange={setType} />
      </PropsToolbar>
      <div className="rounded-b-lg border border-border bg-muted/50 p-4">
        <BarLineChart title={barLineChartMock.title} type={type} />
      </div>
    </div>
  )
}

function WaterfallChartPreview() {
  const [compareMode, setCompareMode] = useState(false)
  return (
    <div>
      <PropsToolbar>
        <PropToggle label="compareMode" value={compareMode} onChange={setCompareMode} />
      </PropsToolbar>
      <div className="rounded-b-lg border border-border bg-muted/50 p-4">
        <WaterfallChart
          {...waterfallChartMock}
          compareMode={compareMode}
          compareBars={compareMode ? waterfallCompareBars : undefined}
          comparePeriodLabel="Fev/2026"
        />
      </div>
    </div>
  )
}

function CalculoCardPreview() {
  const [compareMode, setCompareMode] = useState(false)
  return (
    <div>
      <PropsToolbar>
        <PropToggle label="compareMode" value={compareMode} onChange={setCompareMode} />
      </PropsToolbar>
      <div className="rounded-b-lg border border-border bg-muted/50 p-4">
        <CalculoCard
          title={calculoCardMock.title}
          rows={compareMode ? calculoCardCompareRows : calculoCardMock.rows}
          compareMode={compareMode}
          comparePeriodLabel="Fev/2026"
        />
      </div>
    </div>
  )
}

function WireframeHeaderPreview() {
  const [periodType, setPeriodType] = useState<'mensal' | 'anual' | 'none'>('mensal')
  return (
    <div>
      <PropsToolbar>
        <PropPills label="periodType" options={['mensal', 'anual', 'none']} value={periodType} onChange={setPeriodType} />
      </PropsToolbar>
      <div className="overflow-hidden rounded-b-lg border border-border">
        <WireframeHeader
          title={wireframeHeaderMock.title}
          periodType={periodType}
          brandLabel={wireframeHeaderMock.brandLabel}
        />
      </div>
    </div>
  )
}

function StackedBarChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <StackedBarChartComponent title={stackedBarChartMock.title} />
    </div>
  )
}

function StackedAreaChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <StackedAreaChartComponent title={stackedAreaChartMock.title} />
    </div>
  )
}

function HorizontalBarChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <HorizontalBarChartComponent title={horizontalBarChartMock.title} xLabel={horizontalBarChartMock.xLabel} yLabel={horizontalBarChartMock.yLabel} />
    </div>
  )
}

function BubbleChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <BubbleChartComponent title={bubbleChartMock.title} xLabel={bubbleChartMock.xLabel} yLabel={bubbleChartMock.yLabel} />
    </div>
  )
}

function ComposedChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <ComposedChartComponent title={composedChartMock.title} />
    </div>
  )
}

function GaugeChartPreview() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
      <GaugeChartComponent
        title={gaugeChartMock.title}
        value={gaugeChartMock.value}
        min={gaugeChartMock.min}
        max={gaugeChartMock.max}
      />
    </div>
  )
}

function CommentOverlayPreview() {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-border bg-muted">
      <p className="p-4 text-xs text-muted-foreground">
        Drawer lateral de comentarios com Supabase. Requer autenticacao (Clerk) e conexao ao banco.
        Props: clientSlug, screenId, targetId, authorId, authorName, authorRole, open, onClose.
      </p>
    </div>
  )
}

const categories: Category[] = [
  {
    id: 'shell',
    label: 'Layout / Shell',
    components: [
      {
        name: 'WireframeSidebar',
        status: 'available',
        props: ['screens: Screen[]', 'onSelect?'],
        render: () => (
          <div className="h-48 w-56 overflow-hidden rounded border border-border">
            <WireframeSidebar {...wireframeSidebarMock} />
          </div>
        ),
        specHref: '/ferramentas/blocos/wireframe-sidebar',
      },
      {
        name: 'WireframeHeader',
        status: 'available',
        hasToolbar: true,
        props: ['title', 'periodType?: mensal | anual | none', 'brandLabel?', 'logoUrl?', 'showLogo?', 'showPeriodSelector?'],
        render: () => <WireframeHeaderPreview />,
        specHref: '/ferramentas/blocos/wireframe-header',
      },
      {
        name: 'WireframeFilterBar',
        status: 'available',
        props: ['filters: FilterOption[]', 'showSearch?', 'showCompareSwitch?', 'compareMode?'],
        render: () => <WireframeFilterBar {...wireframeFilterBarMock} />,
        specHref: '/ferramentas/blocos/wireframe-filter-bar',
      },
      {
        name: 'GlobalFilters',
        status: 'available',
        props: ['filters: FilterType[]'],
        render: () => <GlobalFilters {...globalFiltersMock} />,
        specHref: '/ferramentas/blocos/global-filters',
      },
    ],
  },
  {
    id: 'charts',
    label: 'Gráficos',
    components: [
      {
        name: 'BarLineChart',
        status: 'available',
        hasToolbar: true,
        props: ['title', 'type: bar | line | bar-line', 'height?'],
        render: () => <BarLineChartPreview />,
        specHref: '/ferramentas/blocos/bar-line-chart',
      },
      {
        name: 'WaterfallChart',
        status: 'available',
        hasToolbar: true,
        props: ['title', 'bars: WaterfallBar[]', 'height?', 'compareMode?', 'compareBars?', 'comparePeriodLabel?'],
        render: () => <WaterfallChartPreview />,
        specHref: '/ferramentas/blocos/waterfall-chart',
      },
      {
        name: 'DonutChart',
        status: 'available',
        props: ['title', 'data: Slice[]', 'centerValue?', 'centerLabel?', 'height?'],
        render: () => <DonutChart {...donutChartMock} />,
        specHref: '/ferramentas/blocos/donut-chart',
      },
      {
        name: 'ParetoChart',
        status: 'available',
        props: ['title', 'data: Entry[]', 'height?', 'valueLabel?'],
        render: () => <ParetoChart {...paretoChartMock} />,
        specHref: '/ferramentas/blocos/pareto-chart',
      },
      {
        name: 'StackedBarChart',
        status: 'available',
        props: ['title', 'height?', 'categories?', 'chartColors?'],
        render: () => <StackedBarChartPreview />,
      },
      {
        name: 'StackedAreaChart',
        status: 'available',
        props: ['title', 'height?', 'categories?', 'chartColors?'],
        render: () => <StackedAreaChartPreview />,
      },
      {
        name: 'HorizontalBarChart',
        status: 'available',
        props: ['title', 'height?', 'categories?', 'xLabel?', 'yLabel?', 'chartColors?'],
        render: () => <HorizontalBarChartPreview />,
      },
      {
        name: 'BubbleChart',
        status: 'available',
        props: ['title', 'height?', 'xLabel?', 'yLabel?', 'chartColors?'],
        render: () => <BubbleChartPreview />,
      },
      {
        name: 'ComposedChart',
        status: 'available',
        props: ['title', 'height?', 'categories?', 'chartColors?'],
        render: () => <ComposedChartPreview />,
      },
      {
        name: 'GaugeChart',
        status: 'available',
        props: ['title', 'value', 'min?', 'max?', 'zones?', 'height?'],
        render: () => <GaugeChartPreview />,
      },
    ],
  },
  {
    id: 'cards',
    label: 'Cards & Métricas',
    components: [
      {
        name: 'KpiCard',
        status: 'available',
        hasToolbar: true,
        props: ['label', 'value', 'variation?', 'description?', 'variationPositive?'],
        render: () => <KpiCardPreview />,
        specHref: '/ferramentas/blocos/kpi-card',
      },
      {
        name: 'KpiCardFull',
        status: 'available',
        hasToolbar: true,
        props: ['label', 'value', 'sub?', 'variation?', 'variationPositive?', 'semaforo?', 'semaforoLabel?', 'sparkline?', 'wide?', 'compareMode?'],
        render: () => <KpiCardFullPreview />,
        specHref: '/ferramentas/blocos/kpi-card-full',
      },
      {
        name: 'CalculoCard',
        status: 'available',
        hasToolbar: true,
        props: ['title?', 'rows: CalculoRow[]', 'compareMode?', 'comparePeriodLabel?'],
        render: () => <CalculoCardPreview />,
        specHref: '/ferramentas/blocos/calculo-card',
      },
    ],
  },
  {
    id: 'tables',
    label: 'Tabelas',
    components: [
      {
        name: 'DataTable',
        status: 'available',
        props: ['title?', 'columns: Column[]', 'rowCount?'],
        render: () => <DataTable {...dataTableMock} />,
        specHref: '/ferramentas/blocos/data-table',
      },
      {
        name: 'DrillDownTable',
        status: 'available',
        props: ['title?', 'subtitle?', 'columns: DrilColumn[]', 'rows: DrilRow[]'],
        render: () => <DrillDownTable {...drillDownTableMock} />,
        specHref: '/ferramentas/blocos/drill-down-table',
      },
      {
        name: 'ClickableTable',
        status: 'available',
        props: ['title?', 'subtitle?', 'columns: ClickColumn[]', 'rows: ClickRow[]', 'onRowClick?'],
        render: () => <ClickableTable {...clickableTableMock} />,
        specHref: '/ferramentas/blocos/clickable-table',
      },
      {
        name: 'ConfigTable',
        status: 'available',
        props: ['title', 'addLabel?', 'columns: ConfigColumn[]', 'rows: ConfigRow[]'],
        render: () => <ConfigTable {...configTableMock} />,
        specHref: '/ferramentas/blocos/config-table',
      },
    ],
  },
  {
    id: 'inputs',
    label: 'Inputs',
    components: [
      {
        name: 'InputsScreen',
        status: 'available',
        props: ['acceptedFormats: string[]', 'instructions?', 'fieldName?'],
        render: () => <InputsScreen {...inputsScreenMock} />,
        specHref: '/ferramentas/blocos/inputs-screen',
      },
      {
        name: 'UploadSection',
        status: 'available',
        props: ['label', 'acceptedFormats?', 'successMessage?', 'errorMessages?', 'history?'],
        render: () => <UploadSection {...uploadSectionMock} />,
        specHref: '/ferramentas/blocos/upload-section',
      },
      {
        name: 'ManualInputSection',
        status: 'available',
        props: ['title?', 'initialBalance?', 'entries?'],
        render: () => <ManualInputSection {...manualInputSectionMock} />,
        specHref: '/ferramentas/blocos/manual-input-section',
      },
      {
        name: 'SaldoBancoInput',
        status: 'available',
        props: ['title?', 'note?', 'banks: BankEntry[]', 'total'],
        render: () => <SaldoBancoInput {...saldoBancoInputMock} />,
        specHref: '/ferramentas/blocos/saldo-banco-input',
      },
    ],
  },
  {
    id: 'modals',
    label: 'Modais & Overlays',
    components: [
      {
        name: 'WireframeModal',
        status: 'available',
        props: ['title', 'open', 'onClose', 'children', 'footer?', 'size?: md | lg | xl'],
        render: () => <ModalPreview />,
        specHref: '/ferramentas/blocos/wireframe-modal',
      },
      {
        name: 'DetailViewSwitcher',
        status: 'available',
        props: ['options: string[]', 'activeOption', 'onChange'],
        render: () => <DetailViewSwitcherPreview />,
        specHref: '/ferramentas/blocos/detail-view-switcher',
      },
      {
        name: 'CommentOverlay',
        status: 'available',
        props: ['screenName', 'comments?'],
        render: () => <CommentOverlayPreview />,
        specHref: '/ferramentas/blocos/comment-overlay',
      },
    ],
  },
]

function ComponentCard({ entry }: { entry: ComponentEntry }) {
  const [expanded, setExpanded] = useState(true)
  const isAvailable = entry.status === 'available'

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <code className="text-sm font-semibold text-foreground">{entry.name}</code>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
              <CheckCircle2 className="h-3 w-3" /> Disponível
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              <Clock className="h-3 w-3" /> Pendente
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {isAvailable && entry.render ? (
            entry.hasToolbar ? (
              entry.render()
            ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
              {entry.render()}
            </div>
            )
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted px-6 py-10">
              <div className="text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Componente pendente de implementação</p>
                {entry.description && (
                  <p className="mt-1 max-w-md text-xs text-muted-foreground">{entry.description}</p>
                )}
              </div>
            </div>
          )}

          {entry.props && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Props</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.props.map((prop) => (
                  <code
                    key={prop}
                    className="rounded bg-muted px-2 py-0.5 text-[11px] text-foreground"
                  >
                    {prop}
                  </code>
                ))}
              </div>
            </div>
          )}

          {entry.specHref && (
            <a
              href={entry.specHref}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              Ver spec completa
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function ComponentGallery() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === activeCategory)

  const totalComponents = categories.reduce((sum, c) => sum + c.components.length, 0)
  const availableCount = categories.reduce(
    (sum, c) => sum + c.components.filter((comp) => comp.status === 'available').length,
    0,
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Galeria de Componentes — Wireframe Builder
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {availableCount} de {totalComponents} componentes disponíveis.
          Cada preview usa dados fictícios para demonstração.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={cn(
            'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {cat.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              {cat.components.length}
            </span>
          </button>
        ))}
      </div>

      {filtered.map((category) => (
        <section key={category.id}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {category.label}
          </h2>
          <div className="space-y-4">
            {category.components.map((entry) => (
              <ComponentCard key={entry.name} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
