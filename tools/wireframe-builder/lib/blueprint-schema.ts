import { z } from 'zod'

// ---------------------------------------------------------------------------
// Primitive / shared schemas
// ---------------------------------------------------------------------------

const PeriodTypeSchema = z.enum(['mensal', 'anual', 'none'])

const KpiConfigSchema = z.object({
  label: z.string(),
  value: z.string(),
  sub: z.string().optional(),
  variation: z.string().optional(),
  variationPositive: z.boolean().optional(),
  sparkline: z.array(z.number()).optional(),
  semaforo: z.enum(['verde', 'amarelo', 'vermelho']).optional(),
  semaforoLabel: z.string().optional(),
  wide: z.boolean().optional(),
})

const ColumnConfigSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).optional(),
  compareOnly: z.boolean().optional(),
})

const AdjustEntrySchema = z.object({
  id: z.string(),
  type: z.enum(['receita', 'despesa']),
  month: z.string(),
  value: z.string(),
  description: z.string(),
})

const HistoryEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.string(),
  period: z.string(),
  records: z.number(),
  status: z.enum(['success', 'warning', 'error']),
})

const BankEntrySchema = z.object({
  label: z.string(),
  value: z.string(),
})

const FilterOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
})

// Component types -- mirrored for runtime DB validation
// Note: DrilRow.data and ClickRow.data use Record<string, React.ReactNode>
// in TS types, but z.record(z.string(), z.unknown()) for JSON storage.

const CalculoRowSchema = z.object({
  operator: z.enum(['(-)', '(=)', '(+)']).optional(),
  label: z.string(),
  value: z.string(),
  pct: z.string().optional(),
  highlight: z.boolean().optional(),
  valueCompare: z.string().optional(),
  variation: z.string().optional(),
  variationPositive: z.boolean().optional(),
})

const WaterfallBarSchema = z.object({
  label: z.string(),
  value: z.number(),
  type: z.enum(['positive', 'negative', 'subtotal']),
})

const DrilColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).optional(),
})

// DrilRow is recursive (children?: DrilRow[])
const BaseDrilRowSchema = z.object({
  id: z.string(),
  data: z.record(z.string(), z.unknown()),
  isTotal: z.boolean().optional(),
  className: z.string().optional(),
})

type DrilRowInput = z.input<typeof BaseDrilRowSchema> & {
  children?: DrilRowInput[]
}

const DrilRowSchema: z.ZodType<DrilRowInput> = BaseDrilRowSchema.extend({
  children: z.lazy(() => z.array(DrilRowSchema)).optional(),
})

const ClickColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).optional(),
})

const ClickRowSchema = z.object({
  id: z.string(),
  data: z.record(z.string(), z.unknown()),
  variant: z.enum(['default', 'total', 'highlight']).optional(),
})

const ConfigColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['text', 'select', 'badge', 'actions', 'status']).optional(),
  options: z.array(z.string()).optional(),
  width: z.string().optional(),
})

const ConfigRowSchema = z.record(z.string(), z.string())

// ---------------------------------------------------------------------------
// Section type schemas (15 types, discriminated union on 'type')
// ---------------------------------------------------------------------------

const KpiGridSectionSchema = z.object({
  type: z.literal('kpi-grid'),
  columns: z.number().optional(),
  groupLabel: z.string().optional(),
  items: z.array(KpiConfigSchema),
})

const BarLineChartSectionSchema = z.object({
  type: z.literal('bar-line-chart'),
  title: z.string(),
  chartType: z.enum(['bar', 'line', 'bar-line']),
  height: z.number().optional(),
  compareOnly: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
})

const DonutChartSectionSchema = z.object({
  type: z.literal('donut-chart'),
  title: z.string(),
  height: z.number().optional(),
  slices: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .optional(),
})

const WaterfallChartSectionSchema = z.object({
  type: z.literal('waterfall-chart'),
  title: z.string(),
  bars: z.array(WaterfallBarSchema),
  compareBars: z.array(WaterfallBarSchema).optional(),
  height: z.number().optional(),
})

const ParetoChartSectionSchema = z.object({
  type: z.literal('pareto-chart'),
  title: z.string(),
  height: z.number().optional(),
  data: z
    .array(z.object({ label: z.string(), value: z.number() }))
    .optional(),
})

const CalculoCardSectionSchema = z.object({
  type: z.literal('calculo-card'),
  title: z.string(),
  rows: z.array(CalculoRowSchema),
})

const DataTableSectionSchema = z.object({
  type: z.literal('data-table'),
  title: z.string(),
  columns: z.array(ColumnConfigSchema),
  rowCount: z.number().optional(),
})

const DrillDownTableSectionSchema = z.object({
  type: z.literal('drill-down-table'),
  title: z.string(),
  subtitle: z.string().optional(),
  columns: z.array(DrilColumnSchema),
  rows: z.array(DrilRowSchema),
  viewSwitcher: z
    .object({
      options: z.array(z.string()),
      default: z.string(),
      rowsByView: z.record(z.string(), z.array(DrilRowSchema)),
    })
    .optional(),
})

const ClickableTableSectionSchema = z.object({
  type: z.literal('clickable-table'),
  title: z.string(),
  subtitle: z.string().optional(),
  columns: z.array(ClickColumnSchema),
  rows: z.array(ClickRowSchema),
  modalTitleKey: z.string().optional(),
  // modalFooter is React.ReactNode in TS -- not serializable to JSON
  modalFooter: z.unknown().optional(),
})

const SaldoBancoSectionSchema = z.object({
  type: z.literal('saldo-banco'),
  title: z.string().optional(),
  note: z.string().optional(),
  banks: z.array(BankEntrySchema),
  total: z.string(),
})

const ManualInputSectionSchema = z.object({
  type: z.literal('manual-input'),
  title: z.string().optional(),
  initialBalance: z.string().optional(),
  entries: z.array(AdjustEntrySchema).optional(),
})

const UploadSectionSchema = z.object({
  type: z.literal('upload-section'),
  label: z.string(),
  acceptedFormats: z.array(z.string()).optional(),
  successMessage: z.string().optional(),
  errorMessages: z.array(z.string()).optional(),
  history: z.array(HistoryEntrySchema).optional(),
})

const ConfigTableSectionSchema = z.object({
  type: z.literal('config-table'),
  title: z.string(),
  addLabel: z.string().optional(),
  columns: z.array(ConfigColumnSchema),
  rows: z.array(ConfigRowSchema),
})

const InfoBlockSectionSchema = z.object({
  type: z.literal('info-block'),
  content: z.string(),
  variant: z.enum(['info', 'warning']).optional(),
})

// ---------------------------------------------------------------------------
// Discriminated union of all 15 section types
// Note: ChartGridSection has recursive items: BlueprintSection[]
// We define the non-recursive schemas first, then build the union
// with ChartGrid inline using z.lazy() for the recursive reference.
// ---------------------------------------------------------------------------

// Non-recursive section schemas (14 types)
const nonRecursiveSections = [
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
] as const

// ChartGridSection is defined inline to avoid circular const reference.
// The explicit z.ZodType annotation breaks the TS inference cycle.
export const BlueprintSectionSchema: z.ZodType = z.discriminatedUnion('type', [
  ...nonRecursiveSections,
  z.object({
    type: z.literal('chart-grid'),
    columns: z.number().optional(),
    items: z.lazy(() => z.array(BlueprintSectionSchema)),
  }),
])

// ---------------------------------------------------------------------------
// ScreenRow schema (layout + sections)
// ---------------------------------------------------------------------------

const GridLayoutSchema = z.enum(['1', '2', '3', '2-1', '1-2'])

export const ScreenRowSchema = z.object({
  id: z.string(),
  layout: GridLayoutSchema,
  sections: z.array(BlueprintSectionSchema),
})

// ---------------------------------------------------------------------------
// BlueprintScreen and BlueprintConfig
// ---------------------------------------------------------------------------

export const BlueprintScreenSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  periodType: PeriodTypeSchema,
  filters: z.array(FilterOptionSchema),
  hasCompareSwitch: z.boolean(),
  sections: z.array(BlueprintSectionSchema),
  rows: z.array(ScreenRowSchema).optional(),
})

export const BlueprintConfigSchema = z.object({
  slug: z.string(),
  label: z.string(),
  schemaVersion: z.number().default(1),
  screens: z.array(BlueprintScreenSchema),
})

// ---------------------------------------------------------------------------
// Inferred type (runtime-validated variant of BlueprintConfig)
// ---------------------------------------------------------------------------

export type ValidatedBlueprintConfig = z.infer<typeof BlueprintConfigSchema>
