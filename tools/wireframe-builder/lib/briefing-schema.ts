import { z } from 'zod'

// ---------------------------------------------------------------------------
// Briefing sub-schemas
// ---------------------------------------------------------------------------

const ProductContextSchema = z.object({
  productType: z.string().optional(),
  sourceSystem: z.string().optional(),
  objective: z.string().optional(),
  approval: z.string().optional(),
  corePremise: z.string().optional(),
})

const FieldMappingSchema = z.object({
  field: z.string(),
  usage: z.string(),
})

const DataSourceSchema = z.object({
  system: z.string().min(1),
  exportType: z.string().min(1),
  fields: z.array(z.string()),
  fieldMappings: z.array(FieldMappingSchema).optional(),
})

const BriefingModuleSchema = z.object({
  name: z.string().min(1),
  kpis: z.array(z.string()),
  businessRules: z.string().optional(),
})

const CompanyInfoSchema = z.object({
  name: z.string().min(1),
  segment: z.string().min(1),
  size: z.string().min(1),
  description: z.string().optional(),
})

const KpiCategorySchema = z.object({
  category: z.string(),
  confirmed: z.array(z.string()),
  suggested: z.array(z.string()).optional(),
  blocked: z.array(z.string()).optional(),
})

const StatusRuleSchema = z.object({
  condition: z.string(),
  status: z.string(),
})

const BusinessRuleSchema = z.object({
  rule: z.string(),
})

// ---------------------------------------------------------------------------
// BriefingConfigSchema — full Zod validation for BriefingConfig
// ---------------------------------------------------------------------------

export const BriefingConfigSchema = z.object({
  companyInfo: CompanyInfoSchema,
  dataSources: z.array(DataSourceSchema),
  modules: z.array(BriefingModuleSchema),
  targetAudience: z.string(),
  freeFormNotes: z.string(),
  // Extended briefing fields (optional for backward compat)
  productContext: ProductContextSchema.optional(),
  kpiCategories: z.array(KpiCategorySchema).optional(),
  statusRules: z.array(StatusRuleSchema).optional(),
  businessRules: z.array(BusinessRuleSchema).optional(),
})

// ---------------------------------------------------------------------------
// Inferred type (runtime-validated variant of BriefingConfig)
// ---------------------------------------------------------------------------

export type ValidatedBriefingConfig = z.infer<typeof BriefingConfigSchema>
