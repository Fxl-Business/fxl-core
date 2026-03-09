/**
 * GenerationManifest -- merged output type that combines BlueprintConfig,
 * TechnicalConfig, and BrandingConfig into a single self-contained object
 * for SKILL.md rendering and system generation.
 */

import type { BlueprintSection } from './blueprint'
import type { BrandingConfig } from './branding'
import type {
  ReportType,
  FieldDefinition,
  FormulaDefinition,
  ManualInputDefinition,
  SettingsTable,
  ClassificationRule,
  ThresholdDefinition,
  SectionBinding,
} from './technical'

// ─── Supabase schema types ────────────────────────────────────────────────

export type TableSpec = {
  name: string
  columns: {
    name: string
    type: string
    nullable: boolean
    default?: string
  }[]
  primaryKey: string
  foreignKeys?: {
    column: string
    references: string
  }[]
}

export type IndexSpec = {
  table: string
  columns: string[]
  unique?: boolean
}

export type RlsSpec = {
  table: string
  name: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
  using?: string
  withCheck?: string
}

// ─── Generation screen type ───────────────────────────────────────────────

export type GenerationScreen = {
  id: string
  title: string
  icon?: string
  periodType: 'mensal' | 'anual' | 'none'
  hasCompareSwitch: boolean
  sections: {
    blueprint: BlueprintSection
    binding?: SectionBinding
  }[]
}

// ─── Top-level GenerationManifest ─────────────────────────────────────────

export type GenerationManifest = {
  meta: {
    clientSlug: string
    clientLabel: string
    generatedAt: string
    schemaVersion: '1.0'
  }
  branding: BrandingConfig
  supabaseSchema: {
    tables: TableSpec[]
    indexes: IndexSpec[]
    rlsPolicies: RlsSpec[]
  }
  screens: GenerationScreen[]
  dataLayer: {
    reportTypes: ReportType[]
    fields: FieldDefinition[]
    formulas: FormulaDefinition[]
    manualInputs: ManualInputDefinition[]
    settings: SettingsTable[]
    classifications: ClassificationRule[]
    thresholds: ThresholdDefinition[]
  }
}
