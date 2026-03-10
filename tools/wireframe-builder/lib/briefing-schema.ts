import { z } from 'zod'

// ---------------------------------------------------------------------------
// Briefing sub-schemas
// ---------------------------------------------------------------------------

const DataSourceSchema = z.object({
  system: z.string().min(1),
  exportType: z.string().min(1),
  fields: z.array(z.string()),
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

// ---------------------------------------------------------------------------
// BriefingConfigSchema — full Zod validation for BriefingConfig
// ---------------------------------------------------------------------------

export const BriefingConfigSchema = z.object({
  companyInfo: CompanyInfoSchema,
  dataSources: z.array(DataSourceSchema),
  modules: z.array(BriefingModuleSchema),
  targetAudience: z.string(),
  freeFormNotes: z.string(),
})

// ---------------------------------------------------------------------------
// Inferred type (runtime-validated variant of BriefingConfig)
// ---------------------------------------------------------------------------

export type ValidatedBriefingConfig = z.infer<typeof BriefingConfigSchema>
