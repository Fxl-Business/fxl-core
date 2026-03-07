import { useState } from 'react'
import { CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import KpiCard from '@tools/wireframe-builder/components/KpiCard'
import KpiCardFull from '@tools/wireframe-builder/components/KpiCardFull'
import BarLineChart from '@tools/wireframe-builder/components/BarLineChart'
import WaterfallChart from '@tools/wireframe-builder/components/WaterfallChart'
import DonutChart from '@tools/wireframe-builder/components/DonutChart'
import ParetoChart from '@tools/wireframe-builder/components/ParetoChart'
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
} from './galleryMockData'

type ComponentStatus = 'available' | 'pending'

type ComponentEntry = {
  name: string
  status: ComponentStatus
  description?: string
  props?: string[]
  render?: () => React.ReactNode
  hasToolbar?: boolean
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
        className="rounded-md bg-gray-800 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700"
      >
        Abrir Modal
      </button>
      <WireframeModal
        title={wireframeModalMock.title}
        open={open}
        onClose={() => setOpen(false)}
        size={wireframeModalMock.size}
        footer={
          <div className="flex w-full items-center justify-between text-xs text-gray-500">
            <span>Total: R$ 12.500,00</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white"
            >
              Fechar
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">Conteudo do modal renderizado com dados fictícios.</p>
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
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-gray-200">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-colors',
            !value ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
          )}
        >
          OFF
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            'px-2.5 py-1 text-[11px] font-medium transition-colors',
            value ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
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
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-gray-200">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium transition-colors',
              value === opt ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50',
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
    <div className="flex flex-wrap items-center gap-4 rounded-t-lg border border-b-0 border-gray-200 bg-gray-100 px-4 py-2.5">
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
      <div className="rounded-b-lg border border-gray-200 bg-gray-50/50 p-4">
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
      <div className="rounded-b-lg border border-gray-200 bg-gray-50/50 p-4">
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
      <div className="rounded-b-lg border border-gray-200 bg-gray-50/50 p-4">
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
      <div className="rounded-b-lg border border-gray-200 bg-gray-50/50 p-4">
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
      <div className="rounded-b-lg border border-gray-200 bg-gray-50/50 p-4">
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
      <div className="overflow-hidden rounded-b-lg border border-gray-200">
        <WireframeHeader title={wireframeHeaderMock.title} periodType={periodType} />
      </div>
    </div>
  )
}

function CommentOverlayPreview() {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <p className="p-4 text-xs text-gray-400">
        Drawer lateral de comentarios com Supabase. Requer autenticacao (Clerk) e conexao ao banco.
        Props: clientSlug, screenId, targetId, authorId, authorName, authorRole, open, onClose.
      </p>
    </div>
  )
}

const categories: Category[] = [
  {
    id: 'cards',
    label: 'Cards',
    components: [
      {
        name: 'KpiCard',
        status: 'available',
        hasToolbar: true,
        props: ['label', 'value', 'variation?', 'description?', 'variationPositive?'],
        render: () => <KpiCardPreview />,
      },
      {
        name: 'KpiCardFull',
        status: 'available',
        hasToolbar: true,
        props: ['label', 'value', 'sub?', 'variation?', 'variationPositive?', 'semaforo?', 'semaforoLabel?', 'sparkline?', 'wide?', 'compareMode?'],
        render: () => <KpiCardFullPreview />,
      },
      {
        name: 'CalculoCard',
        status: 'available',
        hasToolbar: true,
        props: ['title?', 'rows: CalculoRow[]', 'compareMode?', 'comparePeriodLabel?'],
        render: () => <CalculoCardPreview />,
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
      },
      {
        name: 'WaterfallChart',
        status: 'available',
        hasToolbar: true,
        props: ['title', 'bars: WaterfallBar[]', 'height?', 'compareMode?', 'compareBars?', 'comparePeriodLabel?'],
        render: () => <WaterfallChartPreview />,
      },
      {
        name: 'DonutChart',
        status: 'available',
        props: ['title', 'data: Slice[]', 'centerValue?', 'centerLabel?', 'height?'],
        render: () => <DonutChart {...donutChartMock} />,
      },
      {
        name: 'ParetoChart',
        status: 'available',
        props: ['title', 'data: Entry[]', 'height?', 'valueLabel?'],
        render: () => <ParetoChart {...paretoChartMock} />,
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
      },
      {
        name: 'DrillDownTable',
        status: 'available',
        props: ['title?', 'subtitle?', 'columns: DrilColumn[]', 'rows: DrilRow[]'],
        render: () => <DrillDownTable {...drillDownTableMock} />,
      },
      {
        name: 'ClickableTable',
        status: 'available',
        props: ['title?', 'subtitle?', 'columns: ClickColumn[]', 'rows: ClickRow[]', 'onRowClick?'],
        render: () => <ClickableTable {...clickableTableMock} />,
      },
      {
        name: 'ConfigTable',
        status: 'available',
        props: ['title', 'addLabel?', 'columns: ConfigColumn[]', 'rows: ConfigRow[]'],
        render: () => <ConfigTable {...configTableMock} />,
      },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    components: [
      {
        name: 'WireframeSidebar',
        status: 'available',
        props: ['screens: Screen[]', 'onSelect?'],
        render: () => (
          <div className="h-48 w-56 overflow-hidden rounded border border-gray-200">
            <WireframeSidebar {...wireframeSidebarMock} />
          </div>
        ),
      },
      {
        name: 'WireframeHeader',
        status: 'available',
        hasToolbar: true,
        props: ['title', 'periodType?: mensal | anual | none'],
        render: () => <WireframeHeaderPreview />,
      },
      {
        name: 'WireframeFilterBar',
        status: 'available',
        props: ['filters: FilterOption[]', 'showSearch?', 'showCompareSwitch?', 'compareMode?', 'comparePeriodType?'],
        render: () => <WireframeFilterBar {...wireframeFilterBarMock} />,
      },
      {
        name: 'GlobalFilters',
        status: 'available',
        props: ['filters: FilterType[]'],
        render: () => <GlobalFilters {...globalFiltersMock} />,
      },
      {
        name: 'CommentOverlay',
        status: 'available',
        props: ['screenName', 'comments?'],
        render: () => <CommentOverlayPreview />,
      },
      {
        name: 'WireframeModal',
        status: 'available',
        props: ['title', 'open', 'onClose', 'children', 'footer?', 'size?: md | lg | xl'],
        render: () => <ModalPreview />,
      },
      {
        name: 'DetailViewSwitcher',
        status: 'available',
        props: ['options: string[]', 'activeOption', 'onChange'],
        render: () => <DetailViewSwitcherPreview />,
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
      },
      {
        name: 'UploadSection',
        status: 'available',
        props: ['label', 'acceptedFormats?', 'successMessage?', 'errorMessages?', 'history?'],
        render: () => <UploadSection {...uploadSectionMock} />,
      },
      {
        name: 'ManualInputSection',
        status: 'available',
        props: ['title?', 'initialBalance?', 'entries?'],
        render: () => <ManualInputSection {...manualInputSectionMock} />,
      },
      {
        name: 'SaldoBancoInput',
        status: 'available',
        props: ['title?', 'note?', 'banks: BankEntry[]', 'total'],
        render: () => <SaldoBancoInput {...saldoBancoInputMock} />,
      },
    ],
  },
]

function ComponentCard({ entry }: { entry: ComponentEntry }) {
  const [expanded, setExpanded] = useState(true)
  const isAvailable = entry.status === 'available'

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <code className="text-sm font-semibold text-gray-800">{entry.name}</code>
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
            'h-4 w-4 text-gray-400 transition-transform',
            !expanded && '-rotate-90',
          )}
        />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {isAvailable && entry.render ? (
            entry.hasToolbar ? (
              entry.render()
            ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4">
              {entry.render()}
            </div>
            )
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10">
              <div className="text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">Componente pendente de implementação</p>
                {entry.description && (
                  <p className="mt-1 max-w-md text-xs text-gray-400">{entry.description}</p>
                )}
              </div>
            </div>
          )}

          {entry.props && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Props</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.props.map((prop) => (
                  <code
                    key={prop}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {prop}
                  </code>
                ))}
              </div>
            </div>
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
        <h1 className="text-xl font-bold text-gray-800">
          Galeria de Componentes — Wireframe Builder
        </h1>
        <p className="mt-1 text-sm text-gray-500">
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
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
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
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
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
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
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
