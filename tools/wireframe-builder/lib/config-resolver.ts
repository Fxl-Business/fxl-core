/**
 * Config Resolver -- merges BlueprintConfig, TechnicalConfig, and BrandingConfig
 * into a single GenerationManifest for SKILL.md rendering and system generation.
 *
 * Pure function: no side effects, no I/O. Deterministic output for a given input.
 */

import type { BlueprintConfig } from '../types/blueprint'
import type { BrandingConfig } from '../types/branding'
import type {
  TechnicalConfig,
  ColumnDataType,
} from '../types/technical'
import type {
  GenerationManifest,
  GenerationScreen,
  TableSpec,
  IndexSpec,
  RlsSpec,
} from '../types/generation'
import { resolveBranding } from './branding'

// ─── Postgres type mapping ───────────────────────────────────────────────

const PG_TYPE_MAP: Record<ColumnDataType, string> = {
  text: 'TEXT',
  number: 'NUMERIC',
  date: 'DATE',
  currency: 'NUMERIC(15,2)',
}

// ─── Internal: Supabase schema derivation ────────────────────────────────

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

function deriveSupabaseSchema(technical: TechnicalConfig): {
  tables: TableSpec[]
  indexes: IndexSpec[]
  rlsPolicies: RlsSpec[]
} {
  const tables: TableSpec[] = []
  const indexes: IndexSpec[] = []
  const rlsPolicies: RlsSpec[] = []

  // --- Import tables (one per reportType) ---
  for (const rt of technical.reportTypes) {
    const tableName = toSnakeCase(rt.id)

    const columns: TableSpec['columns'] = [
      { name: 'id', type: 'UUID', nullable: false, default: 'gen_random_uuid()' },
      { name: 'period_month', type: 'INT', nullable: false },
      { name: 'period_year', type: 'INT', nullable: false },
    ]

    for (const col of rt.columns) {
      columns.push({
        name: toSnakeCase(col.targetField),
        type: PG_TYPE_MAP[col.dataType],
        nullable: true,
      })
    }

    columns.push(
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()' },
      { name: 'uploaded_by', type: 'TEXT', nullable: true },
    )

    tables.push({ name: tableName, columns, primaryKey: 'id' })

    // Composite index on period columns
    indexes.push({ table: tableName, columns: ['period_month', 'period_year'] })
  }

  // --- Settings tables ---
  for (const st of technical.settings) {
    const tableName = toSnakeCase(st.id)

    const columns: TableSpec['columns'] = [
      { name: 'id', type: 'UUID', nullable: false, default: 'gen_random_uuid()' },
    ]

    for (const col of st.columns) {
      if (col.type === 'actions') continue // actions is a UI-only column
      columns.push({
        name: toSnakeCase(col.key),
        type: 'TEXT',
        nullable: true,
      })
    }

    columns.push(
      { name: 'is_active', type: 'BOOLEAN', nullable: false, default: 'true' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()' },
    )

    tables.push({ name: tableName, columns, primaryKey: 'id' })
  }

  // --- Manual inputs table ---
  if (technical.manualInputs.length > 0) {
    tables.push({
      name: 'manual_inputs',
      columns: [
        { name: 'id', type: 'UUID', nullable: false, default: 'gen_random_uuid()' },
        { name: 'input_id', type: 'TEXT', nullable: false },
        { name: 'period_month', type: 'INT', nullable: false },
        { name: 'period_year', type: 'INT', nullable: false },
        { name: 'value', type: 'TEXT', nullable: false },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()' },
        { name: 'updated_by', type: 'TEXT', nullable: true },
      ],
      primaryKey: 'id',
    })

    indexes.push({ table: 'manual_inputs', columns: ['input_id', 'period_month', 'period_year'] })
  }

  // --- RLS policies for all tables ---
  for (const table of tables) {
    rlsPolicies.push(
      {
        table: table.name,
        name: `${table.name}_select_anon`,
        operation: 'SELECT',
        using: 'true',
      },
      {
        table: table.name,
        name: `${table.name}_insert_auth`,
        operation: 'INSERT',
        withCheck: "auth.role() = 'authenticated'",
      },
      {
        table: table.name,
        name: `${table.name}_update_auth`,
        operation: 'UPDATE',
        using: "auth.role() = 'authenticated'",
      },
      {
        table: table.name,
        name: `${table.name}_delete_auth`,
        operation: 'DELETE',
        using: "auth.role() = 'authenticated'",
      },
    )
  }

  return { tables, indexes, rlsPolicies }
}

// ─── Internal: Screen merging ────────────────────────────────────────────

function mergeScreens(
  blueprint: BlueprintConfig,
  bindings: TechnicalConfig['bindings'],
): GenerationScreen[] {
  return blueprint.screens.map((screen) => ({
    id: screen.id,
    title: screen.title,
    icon: screen.icon,
    periodType: screen.periodType,
    hasCompareSwitch: screen.hasCompareSwitch,
    sections: screen.sections.map((section, idx) => ({
      blueprint: section,
      binding: bindings.find(
        (b) => b.screenId === screen.id && b.sectionIndex === idx,
      ),
    })),
  }))
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Merge BlueprintConfig + TechnicalConfig + optional BrandingConfig
 * into a single GenerationManifest ready for SKILL.md rendering.
 *
 * @throws Error if blueprint and technical slugs do not match.
 */
export function resolveConfig(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig,
  branding?: Partial<BrandingConfig>,
): GenerationManifest {
  // 1. Validate slug match
  if (blueprint.slug !== technical.slug) {
    throw new Error(
      `Slug mismatch: blueprint="${blueprint.slug}" technical="${technical.slug}". ` +
      'Both configs must reference the same client.',
    )
  }

  // 2. Resolve branding with defaults
  const resolvedBranding = resolveBranding(branding)

  // 3. Derive Supabase schema
  const supabaseSchema = deriveSupabaseSchema(technical)

  // 4. Merge screens with bindings
  const screens = mergeScreens(blueprint, technical.bindings)

  // 5. Assemble GenerationManifest
  return {
    meta: {
      clientSlug: blueprint.slug,
      clientLabel: blueprint.label,
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0',
    },
    branding: resolvedBranding,
    supabaseSchema,
    screens,
    dataLayer: {
      reportTypes: technical.reportTypes,
      fields: technical.fields,
      formulas: technical.formulas,
      manualInputs: technical.manualInputs,
      settings: technical.settings,
      classifications: technical.classifications,
      thresholds: technical.thresholds,
    },
  }
}
