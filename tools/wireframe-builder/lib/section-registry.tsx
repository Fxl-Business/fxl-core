import type { ComponentType } from 'react'
import type { BlueprintSection } from '../types/blueprint'
import type { z } from 'zod'

import {
  LayoutGrid,
  BarChart3,
  PieChart,
  TrendingDown,
  BarChartHorizontal,
  Calculator,
  Table2,
  Landmark,
  Keyboard,
  Upload,
  Columns3,
  Info,
  Settings,
  FormInput,
  Filter,
  Activity,
  BarChart2,
  Minus,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Section renderers (existing)
// ---------------------------------------------------------------------------

import KpiGridRenderer from '../components/sections/KpiGridRenderer'
import ChartRenderer from '../components/sections/ChartRenderer'
import CalculoCardRenderer from '../components/sections/CalculoCardRenderer'
import TableRenderer from '../components/sections/TableRenderer'
import InputRenderer from '../components/sections/InputRenderer'
import ConfigTableRenderer from '../components/sections/ConfigTableRenderer'
import ChartGridRenderer from '../components/sections/ChartGridRenderer'
import InfoBlockRenderer from '../components/sections/InfoBlockRenderer'

// ---------------------------------------------------------------------------
// Property forms (existing)
// ---------------------------------------------------------------------------

import KpiGridForm from '../components/editor/property-forms/KpiGridForm'
import BarLineChartForm from '../components/editor/property-forms/BarLineChartForm'
import DonutChartForm from '../components/editor/property-forms/DonutChartForm'
import WaterfallChartForm from '../components/editor/property-forms/WaterfallChartForm'
import ParetoChartForm from '../components/editor/property-forms/ParetoChartForm'
import CalculoCardForm from '../components/editor/property-forms/CalculoCardForm'
import DataTableForm from '../components/editor/property-forms/DataTableForm'
import DrillDownTableForm from '../components/editor/property-forms/DrillDownTableForm'
import ClickableTableForm from '../components/editor/property-forms/ClickableTableForm'
import SaldoBancoForm from '../components/editor/property-forms/SaldoBancoForm'
import ManualInputForm from '../components/editor/property-forms/ManualInputForm'
import UploadSectionForm from '../components/editor/property-forms/UploadSectionForm'
import ConfigTableForm from '../components/editor/property-forms/ConfigTableForm'
import InfoBlockForm from '../components/editor/property-forms/InfoBlockForm'
import ChartGridForm from '../components/editor/property-forms/ChartGridForm'

// ---------------------------------------------------------------------------
// Zod schemas (individual)
// ---------------------------------------------------------------------------

import {
  KpiGridSectionSchema,
  BarLineChartSectionSchema,
  DonutChartSectionSchema,
  WaterfallChartSectionSchema,
  ParetoChartSectionSchema,
  CalculoCardSectionSchema,
  DataTableSectionSchema,
  DrillDownTableSectionSchema,
  ClickableTableSectionSchema,
  SaldoBancoSectionSchema,
  ManualInputSectionSchema,
  UploadSectionSchema,
  ConfigTableSectionSchema,
  InfoBlockSectionSchema,
  SettingsPageSectionSchema,
  FormSectionSchema,
  FilterConfigSectionSchema,
  StatCardSectionSchema,
  ProgressBarSectionSchema,
  DividerSectionSchema,
  BlueprintSectionSchema,
} from './blueprint-schema'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props passed to every section renderer by SectionRenderer. */
export type SectionRendererProps = {
  section: BlueprintSection
  compareMode: boolean
  comparePeriod: string
  chartColors?: string[]
}

/** Props passed to every property form. */
export type PropertyFormProps = {
  section: BlueprintSection
  onChange: (updated: BlueprintSection) => void
}

export type CatalogEntry = {
  type: BlueprintSection['type']
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  category: string
}

export type SectionRegistration = {
  renderer: ComponentType<SectionRendererProps>
  propertyForm: ComponentType<PropertyFormProps>
  catalogEntry: CatalogEntry
  defaultProps: () => BlueprintSection
  schema: z.ZodType
  label: string
}

// ---------------------------------------------------------------------------
// Placeholder components for new section types (replaced by real ones in Plan 02)
// ---------------------------------------------------------------------------

function PlaceholderRenderer({ section }: SectionRendererProps) {
  return (
    <div
      style={{
        padding: 16,
        color: 'var(--wf-muted)',
        border: '1px dashed var(--wf-border)',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 14,
      }}
    >
      {section.type}
    </div>
  )
}

function PlaceholderForm({ section }: PropertyFormProps) {
  return (
    <div className="text-sm text-muted-foreground p-4">
      Formulario para {section.type} em desenvolvimento
    </div>
  )
}

// ---------------------------------------------------------------------------
// Registry: single source of truth for all 21 section types
// ---------------------------------------------------------------------------

export const SECTION_REGISTRY: Record<BlueprintSection['type'], SectionRegistration> = {
  // === KPIs ===
  'kpi-grid': {
    renderer: KpiGridRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: KpiGridForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'kpi-grid',
      label: 'KPI Grid',
      description: 'Cards com metricas-chave em linha',
      icon: LayoutGrid,
      category: 'KPIs',
    },
    defaultProps: () => ({
      type: 'kpi-grid' as const,
      columns: 4,
      items: [{ label: 'Novo KPI', value: 'R$ 0' }],
    }),
    schema: KpiGridSectionSchema,
    label: 'KPI Grid',
  },

  // === Graficos ===
  'bar-line-chart': {
    renderer: ChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: BarLineChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'bar-line-chart',
      label: 'Barras / Linhas',
      description: 'Grafico de barras, linhas ou combinado',
      icon: BarChart3,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'bar-line-chart' as const,
      title: 'Novo Grafico',
      chartType: 'bar' as const,
    }),
    schema: BarLineChartSectionSchema,
    label: 'Grafico de Barras/Linhas',
  },

  'donut-chart': {
    renderer: ChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: DonutChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'donut-chart',
      label: 'Rosca',
      description: 'Distribuicao percentual em fatias',
      icon: PieChart,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'donut-chart' as const,
      title: 'Novo Grafico de Rosca',
    }),
    schema: DonutChartSectionSchema,
    label: 'Grafico Donut',
  },

  'waterfall-chart': {
    renderer: ChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: WaterfallChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'waterfall-chart',
      label: 'Waterfall',
      description: 'Evolucao com positivos e negativos',
      icon: TrendingDown,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'waterfall-chart' as const,
      title: 'Novo Waterfall',
      bars: [{ label: 'Item', value: 100, type: 'positive' as const }],
    }),
    schema: WaterfallChartSectionSchema,
    label: 'Grafico Waterfall',
  },

  'pareto-chart': {
    renderer: ChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ParetoChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'pareto-chart',
      label: 'Pareto',
      description: 'Barras ordenadas + linha acumulada',
      icon: BarChartHorizontal,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'pareto-chart' as const,
      title: 'Novo Pareto',
    }),
    schema: ParetoChartSectionSchema,
    label: 'Grafico Pareto',
  },

  // === Tabelas ===
  'data-table': {
    renderer: TableRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: DataTableForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'data-table',
      label: 'Tabela de Dados',
      description: 'Tabela simples com colunas configuraveis',
      icon: Table2,
      category: 'Tabelas',
    },
    defaultProps: () => ({
      type: 'data-table' as const,
      title: 'Nova Tabela',
      columns: [{ key: 'col1', label: 'Coluna 1' }],
      rowCount: 5,
    }),
    schema: DataTableSectionSchema,
    label: 'Tabela de Dados',
  },

  'drill-down-table': {
    renderer: TableRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: DrillDownTableForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'drill-down-table',
      label: 'Drill Down',
      description: 'Tabela com linhas expandiveis',
      icon: Table2,
      category: 'Tabelas',
    },
    defaultProps: () => ({
      type: 'drill-down-table' as const,
      title: 'Nova Tabela Drill',
      columns: [{ key: 'col1', label: 'Coluna 1' }],
      rows: [],
    }),
    schema: DrillDownTableSectionSchema,
    label: 'Tabela Drill-Down',
  },

  'clickable-table': {
    renderer: TableRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ClickableTableForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'clickable-table',
      label: 'Tabela Clicavel',
      description: 'Linhas clicaveis que navegam para detalhes',
      icon: Table2,
      category: 'Tabelas',
    },
    defaultProps: () => ({
      type: 'clickable-table' as const,
      title: 'Nova Tabela Clicavel',
      columns: [{ key: 'col1', label: 'Coluna 1' }],
      rows: [],
    }),
    schema: ClickableTableSectionSchema,
    label: 'Tabela Clicavel',
  },

  'config-table': {
    renderer: ConfigTableRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ConfigTableForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'config-table',
      label: 'Config',
      description: 'Tabela editavel para configuracoes',
      icon: Table2,
      category: 'Tabelas',
    },
    defaultProps: () => ({
      type: 'config-table' as const,
      title: 'Nova Config',
      columns: [],
      rows: [],
    }),
    schema: ConfigTableSectionSchema,
    label: 'Tabela de Configuracao',
  },

  // === Inputs ===
  'saldo-banco': {
    renderer: InputRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: SaldoBancoForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'saldo-banco',
      label: 'Saldo Banco',
      description: 'Saldos por banco com total consolidado',
      icon: Landmark,
      category: 'Inputs',
    },
    defaultProps: () => ({
      type: 'saldo-banco' as const,
      banks: [],
      total: 'R$ 0',
    }),
    schema: SaldoBancoSectionSchema,
    label: 'Saldo Banco',
  },

  'manual-input': {
    renderer: InputRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ManualInputForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'manual-input',
      label: 'Input Manual',
      description: 'Campo para entrada manual de dados',
      icon: Keyboard,
      category: 'Inputs',
    },
    defaultProps: () => ({
      type: 'manual-input' as const,
      title: 'Novo Input Manual',
    }),
    schema: ManualInputSectionSchema,
    label: 'Entrada Manual',
  },

  'upload-section': {
    renderer: InputRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: UploadSectionForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'upload-section',
      label: 'Upload',
      description: 'Area de upload de arquivos',
      icon: Upload,
      category: 'Inputs',
    },
    defaultProps: () => ({
      type: 'upload-section' as const,
      label: 'Upload de Dados',
    }),
    schema: UploadSectionSchema,
    label: 'Upload',
  },

  // === Layout ===
  'calculo-card': {
    renderer: CalculoCardRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: CalculoCardForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'calculo-card',
      label: 'Card de Calculo',
      description: 'Detalhamento de calculo passo a passo',
      icon: Calculator,
      category: 'Layout',
    },
    defaultProps: () => ({
      type: 'calculo-card' as const,
      title: 'Novo Calculo',
      rows: [],
    }),
    schema: CalculoCardSectionSchema,
    label: 'Card de Calculo',
  },

  'chart-grid': {
    renderer: ChartGridRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ChartGridForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'chart-grid',
      label: 'Grid de Graficos',
      description: 'Multiplos graficos em grid',
      icon: Columns3,
      category: 'Layout',
    },
    defaultProps: () => ({
      type: 'chart-grid' as const,
      columns: 2,
      items: [],
    }),
    schema: BlueprintSectionSchema, // ChartGrid uses recursive schema
    label: 'Grade de Graficos',
  },

  'info-block': {
    renderer: InfoBlockRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: InfoBlockForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'info-block',
      label: 'Bloco de Info',
      description: 'Texto informativo com destaque visual',
      icon: Info,
      category: 'Layout',
    },
    defaultProps: () => ({
      type: 'info-block' as const,
      content: 'Novo bloco de informacao',
      variant: 'info' as const,
    }),
    schema: InfoBlockSectionSchema,
    label: 'Bloco de Informacao',
  },

  'divider': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'divider',
      label: 'Divisor',
      description: 'Separador visual entre secoes',
      icon: Minus,
      category: 'Layout',
    },
    defaultProps: () => ({
      type: 'divider' as const,
    }),
    schema: DividerSectionSchema,
    label: 'Divisor',
  },

  // === Formularios (new) ===
  'settings-page': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'settings-page',
      label: 'Pagina de Config',
      description: 'Configuracoes agrupadas com toggles e selects',
      icon: Settings,
      category: 'Formularios',
    },
    defaultProps: () => ({
      type: 'settings-page' as const,
      title: 'Configuracoes',
      groups: [
        {
          label: 'Geral',
          settings: [{ label: 'Opcao', inputType: 'toggle' as const }],
        },
      ],
    }),
    schema: SettingsPageSectionSchema,
    label: 'Pagina de Configuracoes',
  },

  'form-section': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'form-section',
      label: 'Formulario',
      description: 'Campos de entrada com validacao',
      icon: FormInput,
      category: 'Formularios',
    },
    defaultProps: () => ({
      type: 'form-section' as const,
      title: 'Novo Formulario',
      fields: [{ label: 'Campo', inputType: 'text' as const }],
    }),
    schema: FormSectionSchema,
    label: 'Formulario',
  },

  // === Filtros (new category) ===
  'filter-config': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'filter-config',
      label: 'Config de Filtros',
      description: 'Filtros configuraveis por tipo',
      icon: Filter,
      category: 'Filtros',
    },
    defaultProps: () => ({
      type: 'filter-config' as const,
      filters: [{ label: 'Filtro', filterType: 'select' as const }],
    }),
    schema: FilterConfigSectionSchema,
    label: 'Configuracao de Filtros',
  },

  // === Metricas (new) ===
  'stat-card': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'stat-card',
      label: 'Card de Metrica',
      description: 'Metrica destacada com tendencia',
      icon: Activity,
      category: 'Metricas',
    },
    defaultProps: () => ({
      type: 'stat-card' as const,
      title: 'Metrica',
      value: 'R$ 0',
    }),
    schema: StatCardSectionSchema,
    label: 'Card de Metrica',
  },

  'progress-bar': {
    renderer: PlaceholderRenderer,
    propertyForm: PlaceholderForm,
    catalogEntry: {
      type: 'progress-bar',
      label: 'Barra de Progresso',
      description: 'Indicadores de progresso com meta',
      icon: BarChart2,
      category: 'Metricas',
    },
    defaultProps: () => ({
      type: 'progress-bar' as const,
      title: 'Progresso',
      items: [{ label: 'Item', value: 50 }],
    }),
    schema: ProgressBarSectionSchema,
    label: 'Barra de Progresso',
  },
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export function getRenderer(type: BlueprintSection['type']): ComponentType<SectionRendererProps> {
  return SECTION_REGISTRY[type].renderer
}

export function getPropertyForm(type: BlueprintSection['type']): ComponentType<PropertyFormProps> {
  return SECTION_REGISTRY[type].propertyForm
}

export function getDefaultSection(type: BlueprintSection['type']): BlueprintSection {
  return SECTION_REGISTRY[type].defaultProps()
}

export function getSectionLabel(type: BlueprintSection['type']): string {
  return SECTION_REGISTRY[type].label
}

/**
 * Returns categories with their catalog entries, grouped by catalogEntry.category.
 * Order preserves insertion order of the first entry per category.
 */
export function getCatalog(): { name: string; items: CatalogEntry[] }[] {
  const byCategory = new Map<string, CatalogEntry[]>()
  for (const reg of Object.values(SECTION_REGISTRY)) {
    const cat = reg.catalogEntry.category
    if (!byCategory.has(cat)) byCategory.set(cat, [])
    byCategory.get(cat)!.push(reg.catalogEntry)
  }
  return Array.from(byCategory, ([name, items]) => ({ name, items }))
}
