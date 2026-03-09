/**
 * SKILL.md Renderer -- transforms a GenerationManifest into a self-contained
 * Markdown string that another Claude Code instance can consume for system generation.
 *
 * The output contains complete SQL, data layer specs, screen definitions,
 * branding tokens, and implementation rules. No external file references.
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

// ─── Section renderers ───────────────────────────────────────────────────

function renderSectionBinding(binding: SectionBinding): string {
  const lines: string[] = []

  switch (binding.sectionType) {
    // 1. kpi-grid
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

    // 2. calculo-card
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

    // 3. bar-line-chart
    case 'bar-line-chart': {
      const b = binding as ChartBinding
      lines.push('**Data Binding: Bar/Line Chart**')
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.groupBy) lines.push(`- Group by: \`${b.groupBy}\``)
      break
    }

    // 4. donut-chart
    case 'donut-chart': {
      const b = binding as ChartBinding
      lines.push('**Data Binding: Donut Chart**')
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.groupBy) lines.push(`- Group by: \`${b.groupBy}\``)
      break
    }

    // 5. waterfall-chart
    case 'waterfall-chart': {
      const b = binding as ChartBinding
      lines.push('**Data Binding: Waterfall Chart**')
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.groupBy) lines.push(`- Group by: \`${b.groupBy}\``)
      break
    }

    // 6. pareto-chart
    case 'pareto-chart': {
      const b = binding as ChartBinding
      lines.push('**Data Binding: Pareto Chart**')
      lines.push(`- Data source: \`${b.dataSource}\``)
      if (b.groupBy) lines.push(`- Group by: \`${b.groupBy}\``)
      break
    }

    // 7. data-table
    case 'data-table': {
      const b = binding as TableBinding
      lines.push('**Data Binding: Data Table**')
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

    // 8. drill-down-table
    case 'drill-down-table': {
      const b = binding as TableBinding
      lines.push('**Data Binding: Drill-Down Table**')
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

    // 9. clickable-table
    case 'clickable-table': {
      const b = binding as TableBinding
      lines.push('**Data Binding: Clickable Table**')
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

    // 10. upload-section
    case 'upload-section': {
      const b = binding as UploadBinding
      lines.push('**Data Binding: Upload Section**')
      lines.push(`- Report type: \`${b.reportType}\``)
      lines.push(`- Accepted formats: ${b.acceptedFormats.join(', ')}`)
      break
    }

    // 11. manual-input
    case 'manual-input': {
      const b = binding as ManualInputBinding
      lines.push('**Data Binding: Manual Input**')
      lines.push(`- Inputs: ${b.inputs.map((id) => `\`${id}\``).join(', ')}`)
      break
    }

    // 12. saldo-banco
    case 'saldo-banco': {
      const b = binding as SaldoBancoBinding
      lines.push('**Data Binding: Saldo Banco**')
      lines.push(`- Settings table: \`${b.settingsTable}\``)
      break
    }

    // 13. config-table
    case 'config-table': {
      const b = binding as ConfigTableBinding
      lines.push('**Data Binding: Config Table**')
      lines.push(`- Settings table: \`${b.settingsTable}\``)
      break
    }

    // 14. info-block (static content, no data binding)
    case 'info-block': {
      lines.push('**Static content -- no data binding**')
      break
    }

    // 15. chart-grid (recursive container)
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

// ─── Blueprint section visual props ──────────────────────────────────────

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

// ─── Section renderers ───────────────────────────────────────────────────

function renderHeader(manifest: GenerationManifest): string {
  return [
    `# Skill -- ${manifest.meta.clientLabel} BI System`,
    '',
    `> Generated: ${manifest.meta.generatedAt}`,
    `> Schema version: ${manifest.meta.schemaVersion}`,
    `> Client slug: ${manifest.meta.clientSlug}`,
  ].join('\n')
}

function renderIdentity(manifest: GenerationManifest): string {
  return [
    '## Identidade',
    '',
    `- **Cliente:** ${manifest.meta.clientLabel}`,
    `- **Slug:** ${manifest.meta.clientSlug}`,
    `- **Sistema:** Dashboard BI personalizado`,
    `- **Proposito:** Transformar dados exportados em visoes gerenciais interativas`,
  ].join('\n')
}

function renderStack(): string {
  return [
    '## Stack',
    '',
    '| Layer | Technology | Version |',
    '|---|---|---|',
    '| Framework | Next.js | 16 |',
    '| Database | Supabase (PostgreSQL) | latest |',
    '| Styling | Tailwind CSS | 3 |',
    '| Components | shadcn/ui | latest |',
    '| Charts | recharts | latest |',
    '| Auth | Clerk | latest |',
    '| Icons | lucide-react | latest |',
    '| Deploy | Vercel | - |',
  ].join('\n')
}

function renderSupabaseSchema(manifest: GenerationManifest): string {
  const { tables, indexes, rlsPolicies } = manifest.supabaseSchema
  const sections: string[] = ['## Supabase Schema', '']

  // CREATE TABLE statements
  for (const table of tables) {
    sections.push(`### Table: \`${table.name}\``)
    sections.push('')
    sections.push('```sql')
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
    sections.push('```')
    sections.push('')
  }

  // CREATE INDEX statements
  if (indexes.length > 0) {
    sections.push('### Indexes')
    sections.push('')
    sections.push('```sql')
    for (const idx of indexes) {
      const idxName = `idx_${idx.table}_${idx.columns.join('_')}`
      const unique = idx.unique ? 'UNIQUE ' : ''
      sections.push(`CREATE ${unique}INDEX ${idxName} ON ${idx.table} (${idx.columns.join(', ')});`)
    }
    sections.push('```')
    sections.push('')
  }

  // RLS policies
  if (rlsPolicies.length > 0) {
    sections.push('### RLS Policies')
    sections.push('')

    // Group by table
    const byTable = new Map<string, RlsSpec[]>()
    for (const pol of rlsPolicies) {
      const list = byTable.get(pol.table) ?? []
      list.push(pol)
      byTable.set(pol.table, list)
    }

    sections.push('```sql')
    for (const [table, policies] of byTable) {
      sections.push(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`)
      sections.push('')
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
      sections.push('')
    }
    sections.push('```')
  }

  return sections.join('\n')
}

function renderDataLayer(manifest: GenerationManifest): string {
  const { reportTypes, fields, formulas, manualInputs, settings, classifications, thresholds } =
    manifest.dataLayer
  const sections: string[] = ['## Data Layer', '']

  // Report types
  sections.push('### Report Types')
  sections.push('')
  for (const rt of reportTypes) {
    sections.push(`#### ${rt.label} (\`${rt.id}\`)`)
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
  sections.push('### Field Definitions')
  sections.push('')
  sections.push('| ID | Label | Source | Column | Aggregation | Filter |')
  sections.push('|---|---|---|---|---|---|')
  for (const f of fields) {
    sections.push(`| \`${f.id}\` | ${f.label} | ${f.source} | ${f.column} | ${f.aggregation} | ${f.filter ?? '-'} |`)
  }
  sections.push('')

  // Formulas
  sections.push('### Formula Definitions')
  sections.push('')
  sections.push('| ID | Label | Expression | Format | References |')
  sections.push('|---|---|---|---|---|')
  for (const f of formulas) {
    sections.push(`| \`${f.id}\` | ${f.label} | \`${f.expression}\` | ${f.format} | ${f.references.join(', ')} |`)
  }
  sections.push('')

  // Manual inputs
  if (manualInputs.length > 0) {
    sections.push('### Manual Input Definitions')
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
    sections.push('### Settings Tables')
    sections.push('')
    for (const st of settings) {
      sections.push(`#### ${st.label} (\`${st.id}\`)`)
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
    sections.push('### Classification Rules')
    sections.push('')
    for (const cr of classifications) {
      sections.push(`#### ${cr.label} (\`${cr.id}\`)`)
      sections.push(`- Categories: ${cr.categories.map((c) => `${c.label} (\`${c.value}\`)`).join(', ')}`)
      sections.push(`- Default mappings: ${Object.keys(cr.defaultMappings).length} entries`)
      sections.push('')
    }
  }

  // Thresholds
  if (thresholds.length > 0) {
    sections.push('### Threshold Definitions')
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

function renderBranding(branding: BrandingConfig): string {
  return [
    '## Branding',
    '',
    '### Colors',
    '',
    '| Token | Value | Usage |',
    '|---|---|---|',
    `| Primary | \`${branding.primaryColor}\` | Sidebar bg, header accents, table headers, KPI highlights |`,
    `| Secondary | \`${branding.secondaryColor}\` | Chart secondary series, hover states |`,
    `| Accent | \`${branding.accentColor}\` | Chart accent series, callout highlights |`,
    '',
    '### Fonts',
    '',
    `| Role | Font |`,
    '|---|---|',
    `| Heading | ${branding.headingFont} |`,
    `| Body | ${branding.bodyFont} |`,
    '',
    '### Logo',
    '',
    branding.logoUrl
      ? `Logo URL: \`${branding.logoUrl}\``
      : 'No logo configured -- use text fallback with client label.',
    '',
    '### CSS Variable Pattern',
    '',
    'Inject at app container level using `--brand-*` prefix:',
    '',
    '```css',
    ':root {',
    `  --brand-primary: ${branding.primaryColor};`,
    `  --brand-secondary: ${branding.secondaryColor};`,
    `  --brand-accent: ${branding.accentColor};`,
    `  --brand-heading-font: '${branding.headingFont}', sans-serif;`,
    `  --brand-body-font: '${branding.bodyFont}', sans-serif;`,
    '}',
    '```',
  ].join('\n')
}

function renderScreens(screens: GenerationScreen[]): string {
  const sections: string[] = ['## Screens', '']

  for (const screen of screens) {
    sections.push(`### ${screen.title}`)
    sections.push('')
    sections.push(`- **ID:** \`${screen.id}\``)
    if (screen.icon) sections.push(`- **Icon:** ${screen.icon}`)
    sections.push(`- **Period type:** ${screen.periodType}`)
    sections.push(`- **Compare switch:** ${screen.hasCompareSwitch ? 'yes' : 'no'}`)
    sections.push('')

    for (let i = 0; i < screen.sections.length; i++) {
      const { blueprint, binding } = screen.sections[i]
      sections.push(`#### Section ${i}: ${blueprint.type}${'title' in blueprint ? ` -- ${(blueprint as { title: string }).title}` : ''}`)
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

function renderImplementationRules(): string {
  return [
    '## Implementation Rules',
    '',
    '### UI Framework',
    '- Use **shadcn/ui** for all UI components (Button, Card, Table, Dialog, etc.)',
    '- Use **Tailwind CSS** for all styling -- no custom CSS files',
    '- Use **lucide-react** for all icons',
    '',
    '### Charts',
    '- Use **recharts** for all chart components (BarChart, LineChart, PieChart, etc.)',
    '- Chart colors: use brand palette hex values directly (CSS vars not supported in SVG fill/stroke)',
    '- Waterfall negative bars always use semantic red (#EF4444) -- never brand color',
    '',
    '### Number Formatting',
    '- Brazilian format: `1.234,56` (dot for thousands, comma for decimals)',
    '- Currency: `R$ 1.234,56`',
    '- Percentage: `45,0%`',
    '- Use `Intl.NumberFormat("pt-BR")` for formatting',
    '',
    '### Period Model',
    '- Monthly period model (period_month + period_year)',
    '- Default filter: current month',
    '- Period selector in header for all screens with periodType !== "none"',
    '',
    '### Authentication',
    '- Use **Clerk** for operator authentication',
    '- Google OAuth as primary login method',
    '- Protected routes via Clerk middleware',
    '',
    '### Data Loading',
    '- Skeleton loading on all data-dependent screens',
    '- Error boundaries for each screen section',
    '- Supabase client with RLS for all queries',
    '',
    '### Responsiveness',
    '- Desktop-first layout',
    '- Mobile functional (stacked layout, scrollable tables)',
    '- Minimum touch targets: 32px',
  ].join('\n')
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Render a GenerationManifest into a self-contained SKILL.md string.
 *
 * The output is a complete Markdown document with SQL migrations,
 * data layer specs, screen definitions, branding, and implementation rules.
 * No external file references -- ready for another Claude Code instance to consume.
 */
export function renderSkillMd(manifest: GenerationManifest): string {
  const parts = [
    renderHeader(manifest),
    renderIdentity(manifest),
    renderStack(),
    renderSupabaseSchema(manifest),
    renderDataLayer(manifest),
    renderBranding(manifest.branding),
    renderScreens(manifest.screens),
    renderImplementationRules(),
  ]

  return parts.join('\n\n---\n\n')
}
