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
  Gauge,
  Palette,
  CircleDot,
  Target,
  Grid3X3,
  TrendingUp,
  GitBranch,
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
import SettingsPageRenderer from '../components/sections/SettingsPageRenderer'
import FormSectionRenderer from '../components/sections/FormSectionRenderer'
import FilterConfigRenderer from '../components/sections/FilterConfigRenderer'
import StatCardRenderer from '../components/sections/StatCardRenderer'
import ProgressBarRenderer from '../components/sections/ProgressBarRenderer'
import DividerRenderer from '../components/sections/DividerRenderer'
import GaugeChartRenderer from '../components/sections/GaugeChartRenderer'
import BrandingEditorRenderer from '../components/sections/BrandingEditorRenderer'
import PieChartRenderer from '../components/sections/PieChartRenderer'
import ProgressGridRenderer from '../components/sections/ProgressGridRenderer'
import HeatmapRenderer from '../components/sections/HeatmapRenderer'
import SparklineGridRenderer from '../components/sections/SparklineGridRenderer'
import SankeyRenderer from '../components/sections/SankeyRenderer'

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
import SettingsPageForm from '../components/editor/property-forms/SettingsPageForm'
import FormSectionForm from '../components/editor/property-forms/FormSectionForm'
import FilterConfigForm from '../components/editor/property-forms/FilterConfigForm'
import StatCardForm from '../components/editor/property-forms/StatCardForm'
import ProgressBarForm from '../components/editor/property-forms/ProgressBarForm'
import DividerForm from '../components/editor/property-forms/DividerForm'
import GaugeChartForm from '../components/editor/property-forms/GaugeChartForm'
import BrandingEditorForm from '../components/editor/property-forms/BrandingEditorForm'
import PieChartForm from '../components/editor/property-forms/PieChartForm'
import ProgressGridForm from '../components/editor/property-forms/ProgressGridForm'
import HeatmapForm from '../components/editor/property-forms/HeatmapForm'
import SparklineGridForm from '../components/editor/property-forms/SparklineGridForm'
import SankeyForm from '../components/editor/property-forms/SankeyForm'

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
  GaugeChartSectionSchema,
  BrandingEditorSectionSchema,
  PieChartSectionSchema,
  ProgressGridSectionSchema,
  HeatmapSectionSchema,
  SparklineGridSectionSchema,
  SankeySectionSchema,
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
// Registry: single source of truth for all 22 section types
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
      label: 'Grafico',
      description: 'Barra, linha, area, radar, dispersao, funil ou treemap',
      icon: BarChart3,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'bar-line-chart' as const,
      title: 'Novo Grafico',
      chartType: 'bar' as const,
    }),
    schema: BarLineChartSectionSchema,
    label: 'Grafico',
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
      columns: [
        { key: 'categoria', label: 'Categoria' },
        { key: 'valor', label: 'Valor' },
        { key: 'percentual', label: '%' },
      ],
      rows: [
        { id: 'r1', data: { categoria: 'Produto A', valor: 'R$ 12.500', percentual: '45%' } },
        { id: 'r2', data: { categoria: 'Produto B', valor: 'R$ 8.300', percentual: '30%' } },
        { id: 'r3', data: { categoria: 'Produto C', valor: 'R$ 6.900', percentual: '25%' } },
      ],
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
      columns: [
        { key: 'nome', label: 'Nome' },
        { key: 'status', label: 'Status' },
        { key: 'valor', label: 'Valor' },
      ],
      rows: [
        { id: 'r1', data: { nome: 'Item A', status: 'Ativo', valor: 'R$ 1.200' } },
        { id: 'r2', data: { nome: 'Item B', status: 'Pendente', valor: 'R$ 850' } },
        { id: 'r3', data: { nome: 'Item C', status: 'Ativo', valor: 'R$ 2.100' } },
      ],
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
      columns: [
        { key: 'parametro', label: 'Parametro' },
        { key: 'valor', label: 'Valor' },
      ],
      rows: [
        { parametro: 'Taxa Base', valor: '12%' },
        { parametro: 'Limite', valor: 'R$ 50.000' },
      ],
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
      banks: [
        { label: 'Banco do Brasil', value: 'R$ 45.000' },
        { label: 'Itau', value: 'R$ 32.000' },
        { label: 'Bradesco', value: 'R$ 18.500' },
      ],
      total: 'R$ 95.500',
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
      rows: [
        { label: 'Receita Bruta', value: 'R$ 100.000', operator: '(+)' as const },
        { label: '(-) Impostos', value: 'R$ 15.000', operator: '(-)' as const },
        { label: '(-) Custos', value: 'R$ 35.000', operator: '(-)' as const },
        { label: 'Lucro Liquido', value: 'R$ 50.000', operator: '(=)' as const, highlight: true },
      ],
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
      items: [
        {
          type: 'bar-line-chart' as const,
          title: 'Vendas por Mes',
          chartType: 'bar' as const,
        },
        {
          type: 'donut-chart' as const,
          title: 'Distribuicao',
        },
      ],
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
    renderer: DividerRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: DividerForm as unknown as ComponentType<PropertyFormProps>,
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
    renderer: SettingsPageRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: SettingsPageForm as unknown as ComponentType<PropertyFormProps>,
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
    renderer: FormSectionRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: FormSectionForm as unknown as ComponentType<PropertyFormProps>,
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
    renderer: FilterConfigRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: FilterConfigForm as unknown as ComponentType<PropertyFormProps>,
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
    renderer: StatCardRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: StatCardForm as unknown as ComponentType<PropertyFormProps>,
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
    renderer: ProgressBarRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ProgressBarForm as unknown as ComponentType<PropertyFormProps>,
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

  // === Gauge ===
  'gauge-chart': {
    renderer: GaugeChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: GaugeChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'gauge-chart',
      label: 'Gauge',
      description: 'Medidor radial com zonas e valor atual',
      icon: Gauge,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'gauge-chart' as const,
      title: 'Novo Gauge',
      value: 65,
      min: 0,
      max: 100,
    }),
    schema: GaugeChartSectionSchema,
    label: 'Gauge',
  },

  // === Branding ===
  'branding-editor': {
    renderer: BrandingEditorRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: BrandingEditorForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'branding-editor',
      label: 'Identidade Visual',
      description: 'Color pickers para personalizar cores do dashboard',
      icon: Palette,
      category: 'Formularios',
    },
    defaultProps: () => ({
      type: 'branding-editor' as const,
      title: 'Identidade Visual',
    }),
    schema: BrandingEditorSectionSchema,
    label: 'Editor de Identidade Visual',
  },

  // === Pie Chart (standalone) ===
  'pie-chart': {
    renderer: PieChartRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: PieChartForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'pie-chart',
      label: 'Pizza',
      description: 'Grafico de pizza com fatias e legenda',
      icon: CircleDot,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'pie-chart' as const,
      title: 'Novo Grafico de Pizza',
      slices: [
        { label: 'Produto A', value: 400 },
        { label: 'Produto B', value: 300 },
        { label: 'Produto C', value: 200 },
        { label: 'Outros', value: 100 },
      ],
    }),
    schema: PieChartSectionSchema,
    label: 'Grafico de Pizza',
  },

  // === Progress Grid (standalone) ===
  'progress-grid': {
    renderer: ProgressGridRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: ProgressGridForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'progress-grid',
      label: 'Grid de Progresso',
      description: 'Metricas com barra de progresso, valor atual e meta',
      icon: Target,
      category: 'Metricas',
    },
    defaultProps: () => ({
      type: 'progress-grid' as const,
      title: 'Metas do Trimestre',
      items: [
        { label: 'Receita', current: 85000, target: 100000, max: 120000 },
        { label: 'Novos Clientes', current: 42, target: 50, max: 60 },
        { label: 'NPS', current: 72, target: 80, max: 100 },
      ],
    }),
    schema: ProgressGridSectionSchema,
    label: 'Grid de Progresso',
  },

  // === Heatmap (standalone) ===
  'heatmap': {
    renderer: HeatmapRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: HeatmapForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'heatmap',
      label: 'Mapa de Calor',
      description: 'Matriz com intensidade de cor por valor',
      icon: Grid3X3,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'heatmap' as const,
      title: 'Vendas por Produto x Mes',
      colLabels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      rows: [
        { label: 'Produto A', cells: [120, 150, 180, 90, 200, 170] },
        { label: 'Produto B', cells: [80, 110, 95, 130, 140, 160] },
        { label: 'Produto C', cells: [200, 180, 160, 140, 120, 100] },
        { label: 'Produto D', cells: [50, 70, 90, 110, 130, 150] },
      ],
    }),
    schema: HeatmapSectionSchema,
    label: 'Mapa de Calor',
  },

  // === Sparkline Grid (standalone) ===
  'sparkline-grid': {
    renderer: SparklineGridRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: SparklineGridForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'sparkline-grid',
      label: 'Sparkline Grid',
      description: 'Grid de mini-graficos com metrica e tendencia',
      icon: TrendingUp,
      category: 'KPIs',
    },
    defaultProps: () => ({
      type: 'sparkline-grid' as const,
      title: 'Visao Geral',
      columns: 3,
      items: [
        { label: 'Receita', value: 'R$ 125k', data: [30, 45, 38, 52, 48, 60, 55, 70] },
        { label: 'Margem', value: '32%', data: [28, 30, 27, 32, 35, 31, 33, 32] },
        { label: 'Clientes', value: '1.240', data: [800, 900, 950, 1000, 1050, 1100, 1180, 1240] },
        { label: 'NPS', value: '72', data: [65, 68, 70, 67, 72, 75, 71, 72] },
        { label: 'Tickets', value: '45', data: [60, 55, 50, 48, 52, 47, 44, 45] },
        { label: 'Conversao', value: '18%', data: [12, 14, 15, 16, 17, 16, 18, 18] },
      ],
    }),
    schema: SparklineGridSectionSchema,
    label: 'Grid de Sparklines',
  },

  // === Sankey (standalone) ===
  'sankey': {
    renderer: SankeyRenderer as unknown as ComponentType<SectionRendererProps>,
    propertyForm: SankeyForm as unknown as ComponentType<PropertyFormProps>,
    catalogEntry: {
      type: 'sankey',
      label: 'Sankey',
      description: 'Diagrama de fluxo proporcional entre nos',
      icon: GitBranch,
      category: 'Graficos',
    },
    defaultProps: () => ({
      type: 'sankey' as const,
      title: 'Novo Sankey',
      // links use integer array indices into nodes[], not string names
      nodes: [
        { name: 'Receita A' },
        { name: 'Receita B' },
        { name: 'Departamento X' },
        { name: 'Departamento Y' },
        { name: 'Resultado' },
      ],
      links: [
        { source: 0, target: 2, value: 40 },
        { source: 0, target: 3, value: 20 },
        { source: 1, target: 2, value: 10 },
        { source: 1, target: 3, value: 30 },
        { source: 2, target: 4, value: 50 },
        { source: 3, target: 4, value: 50 },
      ],
    }),
    schema: SankeySectionSchema,
    label: 'Diagrama Sankey',
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
