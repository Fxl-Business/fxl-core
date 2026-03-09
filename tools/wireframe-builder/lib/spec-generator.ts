/**
 * Product Spec Generator -- transforms a GenerationManifest into a set of
 * self-contained files that Claude Code can consume for system generation.
 *
 * Replaces the monolithic renderSkillMd() with a multi-file pipeline.
 * Each file describes WHAT to build (screens, data, rules, branding),
 * not HOW to use the stack (global skills handle that).
 */

import type {
  GenerationManifest,
  GenerationScreen,
  RlsSpec,
} from '../types/generation'
import type { BrandingConfig } from '../types/branding'
import type {
  SectionBinding,
  KpiGridBinding,
  CalculoCardBinding,
  ChartBinding,
  TableBinding,
  UploadBinding,
  ManualInputBinding,
  SaldoBancoBinding,
  ConfigTableBinding,
  ChartGridBinding,
} from '../types/technical'
import type { BlueprintSection } from '../types/blueprint'

// ─── Public types ────────────────────────────────────────────────────────

export type SpecFile = {
  filename: string
  content: string
}

// ─── Section binding renderer (reused from skill-renderer) ───────────────

function renderSectionBinding(binding: SectionBinding): string {
  const lines: string[] = []

  switch (binding.sectionType) {
    case 'kpi-grid': {
      const b = binding as KpiGridBinding
      lines.push('**Data Binding: KPI Grid**')
      lines.push('')
      lines.push('| # | Field/Formula | Sub-expression | Threshold | Comparisons |')
      lines.push('|---|---|---|---|---|')
      for (let i = 0; i < b.items.length; i++) {
        const item = b.items[i]
        lines.push(
          `| ${i + 1} | \`${item.fieldOrFormula}\` | ${item.subExpression ? `\`${item.subExpression}\`` : '-'} | ${item.threshold ?? '-'} | ${item.comparisonTypes?.join(', ') ?? '-'} |`,
        )
      }
      break
    }

    case 'calculo-card': {
      const b = binding as CalculoCardBinding
      lines.push('**Data Binding: Calculo Card**')
      lines.push('')
      lines.push('| # | Field/Formula | Operator | Highlight |')
      lines.push('|---|---|---|---|')
      for (let i = 0; i < b.rows.length; i++) {
        const row = b.rows[i]
        lines.push(
          `| ${i + 1} | \`${row.fieldOrFormula}\` | ${row.operator ?? '-'} | ${row.highlight ? 'Yes' : '-'} |`,
        )
      }
      break
    }

    case 'bar-line-chart':
    case 'donut-chart':
    case 'waterfall-chart':
    case 'pareto-chart': {
      const b = binding as ChartBinding
      const labelMap: Record<string, string> = {
        'bar-line-chart': 'Bar/Line Chart',
        'donut-chart': 'Donut Chart',
        'waterfall-chart': 'Waterfall Chart',
        'pareto-chart': 'Pareto Chart',
      }
      lines.push(`**Data Binding: ${labelMap[b.sectionType]}**`)
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.groupBy) lines.push(`- Group by: \`${b.groupBy}\``)
      break
    }

    case 'data-table':
    case 'drill-down-table':
    case 'clickable-table': {
      const b = binding as TableBinding
      const labelMap: Record<string, string> = {
        'data-table': 'Data Table',
        'drill-down-table': 'Drill-Down Table',
        'clickable-table': 'Clickable Table',
      }
      lines.push(`**Data Binding: ${labelMap[b.sectionType]}**`)
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.drillDownBy) lines.push(`- Drill-down by: \`${b.drillDownBy}\``)
      lines.push('')
      lines.push('| Column Key | Field/Formula | Format |')
      lines.push('|---|---|---|')
      for (const col of b.columns) {
        lines.push(`| ${col.key} | \`${col.fieldOrFormula}\` | ${col.format ?? '-'} |`)
      }
      break
    }

    case 'upload-section': {
      const b = binding as UploadBinding
      lines.push('**Data Binding: Upload Section**')
      lines.push(`- Report type: \`${b.reportType}\``)
      lines.push(`- Accepted formats: ${b.acceptedFormats.join(', ')}`)
      break
    }

    case 'manual-input': {
      const b = binding as ManualInputBinding
      lines.push('**Data Binding: Manual Input**')
      lines.push(`- Inputs: ${b.inputs.map((id) => `\`${id}\``).join(', ')}`)
      break
    }

    case 'saldo-banco': {
      const b = binding as SaldoBancoBinding
      lines.push('**Data Binding: Saldo Banco**')
      lines.push(`- Settings table: \`${b.settingsTable}\``)
      break
    }

    case 'config-table': {
      const b = binding as ConfigTableBinding
      lines.push('**Data Binding: Config Table**')
      lines.push(`- Settings table: \`${b.settingsTable}\``)
      break
    }

    case 'info-block': {
      lines.push('**Static content -- no data binding**')
      break
    }

    case 'chart-grid': {
      const b = binding as ChartGridBinding
      lines.push('**Data Binding: Chart Grid**')
      lines.push('')
      for (let i = 0; i < b.items.length; i++) {
        const item = b.items[i]
        lines.push(`- Chart ${i + 1} (${item.sectionType}): data source \`${item.dataSource}\`${item.groupBy ? `, group by \`${item.groupBy}\`` : ''}`)
      }
      break
    }
  }

  return lines.join('\n')
}

// ─── Blueprint visual property renderer ──────────────────────────────────

function renderBlueprintVisual(section: BlueprintSection): string {
  const lines: string[] = []

  switch (section.type) {
    case 'kpi-grid':
      lines.push(`- Columns: ${section.columns ?? 'auto'}`)
      if (section.groupLabel) lines.push(`- Group label: ${section.groupLabel}`)
      lines.push(`- Items count: ${section.items.length}`)
      break

    case 'bar-line-chart':
      lines.push(`- Chart type: ${section.chartType}`)
      if (section.height) lines.push(`- Height: ${section.height}px`)
      if (section.compareOnly) lines.push('- Compare-only: yes')
      if (section.xLabel) lines.push(`- X label: ${section.xLabel}`)
      if (section.yLabel) lines.push(`- Y label: ${section.yLabel}`)
      break

    case 'donut-chart':
      if (section.height) lines.push(`- Height: ${section.height}px`)
      if (section.slices) lines.push(`- Slices: ${section.slices.length}`)
      break

    case 'waterfall-chart':
      lines.push(`- Bars: ${section.bars.length}`)
      if (section.height) lines.push(`- Height: ${section.height}px`)
      if (section.compareBars) lines.push(`- Compare bars: ${section.compareBars.length}`)
      break

    case 'pareto-chart':
      if (section.height) lines.push(`- Height: ${section.height}px`)
      if (section.data) lines.push(`- Data points: ${section.data.length}`)
      break

    case 'calculo-card':
      lines.push(`- Rows: ${section.rows.length}`)
      break

    case 'data-table':
      lines.push(`- Columns: ${section.columns.map((c) => c.label).join(', ')}`)
      if (section.rowCount) lines.push(`- Row count: ${section.rowCount}`)
      break

    case 'drill-down-table':
      lines.push(`- Columns: ${section.columns.map((c) => c.label).join(', ')}`)
      if (section.subtitle) lines.push(`- Subtitle: ${section.subtitle}`)
      if (section.viewSwitcher) lines.push(`- View switcher: ${section.viewSwitcher.options.join(', ')}`)
      break

    case 'clickable-table':
      lines.push(`- Columns: ${section.columns.map((c) => c.label).join(', ')}`)
      if (section.subtitle) lines.push(`- Subtitle: ${section.subtitle}`)
      break

    case 'saldo-banco':
      lines.push(`- Banks: ${section.banks.length}`)
      break

    case 'manual-input':
      if (section.entries) lines.push(`- Entries: ${section.entries.length}`)
      break

    case 'upload-section':
      lines.push(`- Label: ${section.label}`)
      if (section.acceptedFormats) lines.push(`- Formats: ${section.acceptedFormats.join(', ')}`)
      break

    case 'config-table':
      lines.push(`- Columns: ${section.columns.map((c) => c.label).join(', ')}`)
      lines.push(`- Rows: ${section.rows.length}`)
      break

    case 'info-block':
      lines.push(`- Variant: ${section.variant ?? 'info'}`)
      break

    case 'chart-grid':
      lines.push(`- Grid columns: ${section.columns ?? 'auto'}`)
      lines.push(`- Items: ${section.items.length} charts`)
      break
  }

  return lines.join('\n')
}

// ─── Individual file renderers ───────────────────────────────────────────

function renderProductOverview(manifest: GenerationManifest): string {
  const { meta, screens } = manifest
  const sections: string[] = []

  sections.push(`# Product Spec -- ${meta.clientLabel} BI Dashboard`)
  sections.push('')
  sections.push('## System Identity')
  sections.push(`- Client: ${meta.clientLabel}`)
  sections.push(`- Slug: ${meta.clientSlug}`)
  sections.push(`- Type: Dashboard BI`)
  sections.push(`- Generated: ${meta.generatedAt}`)
  sections.push(`- Schema version: ${meta.schemaVersion}`)
  sections.push('')

  // Navigation table
  sections.push('## Navigation (Sidebar)')
  sections.push('')
  sections.push('| Screen | Icon | Period Type |')
  sections.push('|--------|------|-------------|')
  for (const screen of screens) {
    sections.push(`| ${screen.title} | ${screen.icon ?? '-'} | ${screen.periodType} |`)
  }
  sections.push('')

  // Auth roles table
  sections.push('## Auth Roles')
  sections.push('')
  sections.push('| Role | Screens | Upload | Settings | User Management |')
  sections.push('|------|---------|--------|----------|-----------------|')
  sections.push('| admin | All | Yes | Yes | Yes |')
  sections.push('| editor | All | Yes | No | No |')
  sections.push('| viewer | All except Upload/Settings | No | No | No |')
  sections.push('')

  // API endpoints table
  sections.push('## API Endpoints (backend)')
  sections.push('')
  sections.push('| Method | Path | Purpose | Roles |')
  sections.push('|--------|------|---------|-------|')
  sections.push('| GET | /api/data/:screenId | Screen data with period filter | all |')
  sections.push('| POST | /api/upload/:reportType | File upload + parse | admin, editor |')
  sections.push('| GET | /api/settings/:tableId | Read settings | all |')
  sections.push('| PUT | /api/settings/:tableId/:rowId | Update setting row | admin |')
  sections.push('| GET | /api/users | List users | admin |')
  sections.push('| POST | /api/users/invite | Invite user | admin |')

  return sections.join('\n')
}

function renderDatabaseSchema(manifest: GenerationManifest): string {
  const { tables, indexes, rlsPolicies } = manifest.supabaseSchema
  const sections: string[] = []

  sections.push('-- Database Schema')
  sections.push(`-- Client: ${manifest.meta.clientLabel} (${manifest.meta.clientSlug})`)
  sections.push(`-- Generated: ${manifest.meta.generatedAt}`)
  sections.push('')

  // CREATE TABLE statements
  for (const table of tables) {
    sections.push(`-- Table: ${table.name}`)
    sections.push(`CREATE TABLE ${table.name} (`)

    const colDefs = table.columns.map((col) => {
      let def = `  ${col.name} ${col.type}`
      if (!col.nullable) def += ' NOT NULL'
      if (col.default) def += ` DEFAULT ${col.default}`
      return def
    })
    colDefs.push(`  PRIMARY KEY (${table.primaryKey})`)

    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        colDefs.push(`  FOREIGN KEY (${fk.column}) REFERENCES ${fk.references}`)
      }
    }

    sections.push(colDefs.join(',\n'))
    sections.push(');')
    sections.push('')
  }

  // CREATE INDEX statements
  if (indexes.length > 0) {
    sections.push('-- Indexes')
    for (const idx of indexes) {
      const idxName = `idx_${idx.table}_${idx.columns.join('_')}`
      const unique = idx.unique ? 'UNIQUE ' : ''
      sections.push(`CREATE ${unique}INDEX ${idxName} ON ${idx.table} (${idx.columns.join(', ')});`)
    }
    sections.push('')
  }

  // RLS policies
  if (rlsPolicies.length > 0) {
    sections.push('-- Row Level Security')

    // Group by table
    const byTable = new Map<string, RlsSpec[]>()
    for (const pol of rlsPolicies) {
      const list = byTable.get(pol.table) ?? []
      list.push(pol)
      byTable.set(pol.table, list)
    }

    for (const [table, policies] of byTable) {
      sections.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`)
      for (const pol of policies) {
        if (pol.using && pol.withCheck) {
          sections.push(
            `CREATE POLICY "${pol.name}" ON ${table} FOR ${pol.operation} USING (${pol.using}) WITH CHECK (${pol.withCheck});`,
          )
        } else if (pol.using) {
          sections.push(
            `CREATE POLICY "${pol.name}" ON ${table} FOR ${pol.operation} USING (${pol.using});`,
          )
        } else if (pol.withCheck) {
          sections.push(
            `CREATE POLICY "${pol.name}" ON ${table} FOR ${pol.operation} WITH CHECK (${pol.withCheck});`,
          )
        }
      }
    }
  }

  return sections.join('\n')
}

function renderDataLayerSpec(manifest: GenerationManifest): string {
  const { reportTypes, fields, formulas, manualInputs, settings, classifications, thresholds } =
    manifest.dataLayer
  const sections: string[] = []

  sections.push('# Data Layer')
  sections.push('')

  // Report types
  sections.push('## Report Types')
  sections.push('')
  for (const rt of reportTypes) {
    sections.push(`### ${rt.label} (\`${rt.id}\`)`)
    sections.push(`- Period model: ${rt.periodModel}`)
    sections.push(`- Files per period: ${rt.filesPerPeriod}`)
    sections.push('')
    sections.push('| Source Column | Target Field | Data Type | Format |')
    sections.push('|---|---|---|---|')
    for (const col of rt.columns) {
      sections.push(`| ${col.sourceColumn} | \`${col.targetField}\` | ${col.dataType} | ${col.format ?? '-'} |`)
    }
    sections.push('')
  }

  // Fields
  sections.push('## Field Definitions')
  sections.push('')
  sections.push('| ID | Label | Source | Column | Aggregation | Filter |')
  sections.push('|---|---|---|---|---|---|')
  for (const f of fields) {
    sections.push(`| \`${f.id}\` | ${f.label} | ${f.source} | ${f.column} | ${f.aggregation} | ${f.filter ?? '-'} |`)
  }
  sections.push('')

  // Formulas
  sections.push('## Formula Definitions')
  sections.push('')
  sections.push('| ID | Label | Expression | Format | References |')
  sections.push('|---|---|---|---|---|')
  for (const f of formulas) {
    sections.push(`| \`${f.id}\` | ${f.label} | \`${f.expression}\` | ${f.format} | ${f.references.join(', ')} |`)
  }
  sections.push('')

  // Manual inputs
  if (manualInputs.length > 0) {
    sections.push('## Manual Input Definitions')
    sections.push('')
    sections.push('| ID | Label | Data Type | Frequency | Target Screen |')
    sections.push('|---|---|---|---|---|')
    for (const mi of manualInputs) {
      sections.push(`| \`${mi.id}\` | ${mi.label} | ${mi.dataType} | ${mi.frequency} | ${mi.targetScreen} |`)
    }
    sections.push('')
  }

  // Settings tables
  if (settings.length > 0) {
    sections.push('## Settings Tables')
    sections.push('')
    for (const st of settings) {
      sections.push(`### ${st.label} (\`${st.id}\`)`)
      sections.push('')
      sections.push(`Columns: ${st.columns.map((c) => `${c.label} (${c.type})`).join(', ')}`)
      sections.push('')
      if (st.defaultRows && st.defaultRows.length > 0) {
        sections.push(`Default rows: ${st.defaultRows.length}`)
        sections.push('')
      }
    }
  }

  // Classifications
  if (classifications.length > 0) {
    sections.push('## Classification Rules')
    sections.push('')
    for (const cr of classifications) {
      sections.push(`### ${cr.label} (\`${cr.id}\`)`)
      sections.push(`- Categories: ${cr.categories.map((c) => `${c.label} (\`${c.value}\`)`).join(', ')}`)
      sections.push(`- Default mappings: ${Object.keys(cr.defaultMappings).length} entries`)
      sections.push('')
    }
  }

  // Thresholds
  if (thresholds.length > 0) {
    sections.push('## Threshold Definitions')
    sections.push('')
    sections.push('| ID | Label | Metric | Verde | Amarelo | Vermelho |')
    sections.push('|---|---|---|---|---|---|')
    for (const t of thresholds) {
      const verde = `${t.levels.verde.operator} ${t.levels.verde.value}`
      const amarelo = `${t.levels.amarelo.operator} ${t.levels.amarelo.value}${t.levels.amarelo.upperOperator ? ` AND ${t.levels.amarelo.upperOperator} ${t.levels.amarelo.upperValue}` : ''}`
      const vermelho = `${t.levels.vermelho.operator} ${t.levels.vermelho.value}`
      sections.push(`| \`${t.id}\` | ${t.label} | \`${t.metric}\` | ${verde} | ${amarelo} | ${vermelho} |`)
    }
    sections.push('')
  }

  return sections.join('\n')
}

function renderScreensSpec(screens: GenerationScreen[]): string {
  const sections: string[] = []

  sections.push('# Screens')
  sections.push('')

  for (const screen of screens) {
    sections.push(`## ${screen.title}`)
    sections.push('')
    sections.push(`- **ID:** \`${screen.id}\``)
    if (screen.icon) sections.push(`- **Icon:** ${screen.icon}`)
    sections.push(`- **Period type:** ${screen.periodType}`)
    sections.push(`- **Compare switch:** ${screen.hasCompareSwitch ? 'yes' : 'no'}`)
    sections.push('')

    for (let i = 0; i < screen.sections.length; i++) {
      const { blueprint, binding } = screen.sections[i]
      sections.push(`### Section ${i}: ${blueprint.type}${'title' in blueprint ? ` -- ${(blueprint as { title: string }).title}` : ''}`)
      sections.push('')

      // Visual properties from blueprint
      sections.push('**Visual Properties:**')
      sections.push(renderBlueprintVisual(blueprint))
      sections.push('')

      // Data binding from technical config
      if (binding) {
        sections.push(renderSectionBinding(binding))
      } else {
        sections.push('*No data binding (static content)*')
      }
      sections.push('')
    }
  }

  return sections.join('\n')
}

function renderBrandingSpec(branding: BrandingConfig): string {
  const sections: string[] = []

  sections.push('# Branding')
  sections.push('')

  sections.push('## Colors')
  sections.push('')
  sections.push('| Token | Value | Usage |')
  sections.push('|---|---|---|')
  sections.push(`| Primary | \`${branding.primaryColor}\` | Sidebar bg, header accents, table headers, KPI highlights |`)
  sections.push(`| Secondary | \`${branding.secondaryColor}\` | Chart secondary series, hover states |`)
  sections.push(`| Accent | \`${branding.accentColor}\` | Chart accent series, callout highlights |`)
  sections.push('')

  sections.push('## Fonts')
  sections.push('')
  sections.push('| Role | Font |')
  sections.push('|---|---|')
  sections.push(`| Heading | ${branding.headingFont} |`)
  sections.push(`| Body | ${branding.bodyFont} |`)
  sections.push('')

  // Google Fonts loading
  sections.push('## Google Fonts Loading')
  sections.push('')
  const fonts = new Set([branding.headingFont, branding.bodyFont])
  for (const font of fonts) {
    const encoded = font.replace(/\s+/g, '+')
    sections.push(`- \`${font}\`: \`https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap\``)
  }
  sections.push('')

  sections.push('## Logo')
  sections.push('')
  if (branding.logoUrl) {
    sections.push(`Logo URL: \`${branding.logoUrl}\``)
  } else {
    sections.push('No logo configured -- use text fallback with client label.')
  }
  sections.push('')

  sections.push('## CSS Variable Pattern')
  sections.push('')
  sections.push('Inject at app container level using `--brand-*` prefix:')
  sections.push('')
  sections.push('```css')
  sections.push(':root {')
  sections.push(`  --brand-primary: ${branding.primaryColor};`)
  sections.push(`  --brand-secondary: ${branding.secondaryColor};`)
  sections.push(`  --brand-accent: ${branding.accentColor};`)
  sections.push(`  --brand-heading-font: '${branding.headingFont}', sans-serif;`)
  sections.push(`  --brand-body-font: '${branding.bodyFont}', sans-serif;`)
  sections.push('}')
  sections.push('```')

  return sections.join('\n')
}

function renderUploadRules(manifest: GenerationManifest): string {
  const { reportTypes } = manifest.dataLayer
  const sections: string[] = []

  sections.push('# Upload Rules')
  sections.push('')
  sections.push('## Accepted File Formats')
  sections.push('')
  sections.push('- CSV (comma-separated, UTF-8)')
  sections.push('- XLSX (Excel 2007+)')
  sections.push('')

  sections.push('## BR Format Normalization Rules')
  sections.push('')
  sections.push('| Data Type | Input Format | Output | Example |')
  sections.push('|-----------|-------------|--------|---------|')
  sections.push('| currency | `1.234,56` or `R$ 1.234,56` | `number` | `1234.56` |')
  sections.push('| date | `dd/mm/yyyy` | `YYYY-MM-DD` | `25/03/2026` -> `2026-03-25` |')
  sections.push('| number | `1.234,56` | `number` | `1234.56` |')
  sections.push('| text | as-is | `string` | no conversion |')
  sections.push('')

  sections.push('## Report Types')
  sections.push('')
  for (const rt of reportTypes) {
    sections.push(`### ${rt.label} (\`${rt.id}\`)`)
    sections.push('')
    sections.push(`- Period model: ${rt.periodModel}`)
    sections.push(`- Files per period: ${rt.filesPerPeriod}`)
    sections.push('')
    sections.push('**Column Mappings:**')
    sections.push('')
    sections.push('| Source Column | Target Field | Data Type | Format | Normalization |')
    sections.push('|---|---|---|---|---|')
    for (const col of rt.columns) {
      const normalization = col.dataType === 'currency'
        ? 'parseBRCurrency()'
        : col.dataType === 'date'
          ? 'parseBRDate()'
          : col.dataType === 'number'
            ? 'parseFloat()'
            : 'none'
      sections.push(`| ${col.sourceColumn} | \`${col.targetField}\` | ${col.dataType} | ${col.format ?? '-'} | ${normalization} |`)
    }
    sections.push('')
  }

  return sections.join('\n')
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Generate a multi-file product spec from a GenerationManifest.
 *
 * Returns 6 self-contained files for Claude Code consumption:
 * - product-spec.md: System overview, navigation, auth roles, API endpoints
 * - database-schema.sql: Complete SQL (tables, indexes, RLS)
 * - data-layer.md: Fields, formulas, aggregations, thresholds
 * - screens.md: Per-screen section definitions with bindings
 * - branding.md: Colors, fonts, logo, CSS variables
 * - upload-rules.md: Report types, column mappings, BR format rules
 */
export function generateProductSpec(manifest: GenerationManifest): SpecFile[] {
  return [
    { filename: 'product-spec.md', content: renderProductOverview(manifest) },
    { filename: 'database-schema.sql', content: renderDatabaseSchema(manifest) },
    { filename: 'data-layer.md', content: renderDataLayerSpec(manifest) },
    { filename: 'screens.md', content: renderScreensSpec(manifest.screens) },
    { filename: 'branding.md', content: renderBrandingSpec(manifest.branding) },
    { filename: 'upload-rules.md', content: renderUploadRules(manifest) },
  ]
}
