# Phase 5: Technical Configuration - Research

**Researched:** 2026-03-09
**Domain:** TypeScript configuration schema, formula expressions, config merging, validation, AI-assisted generation
**Confidence:** HIGH

## Summary

Phase 5 bridges the visual wireframe layer (BlueprintConfig + BrandingConfig) with the data/logic layer needed for system generation. The core deliverable is a TechnicalConfig TypeScript schema that declares data sources, column mappings, KPI formulas, manual input definitions, classification rules, and thresholds -- all bound to specific blueprint sections. A Config Resolver merges Blueprint + TechnicalConfig + Branding into a single generation SKILL.md file that another Claude Code instance consumes to generate the full Next.js project.

The existing codebase already establishes strong patterns: discriminated unions for section types (15 types in `blueprint.ts`), config-as-TypeScript files per client (`blueprint.config.ts`, `branding.config.ts`), utility modules in `tools/wireframe-builder/lib/`, and type definitions in `tools/wireframe-builder/types/`. TechnicalConfig follows these exact patterns -- no new paradigms are needed.

The formula engine decision is the most critical technical choice: string expressions like `"receita_total - custos_variaveis"` evaluated against named fields derived from column aggregations. This is a configuration-time concern (declaring formulas), not a runtime concern (executing them) -- the SKILL.md output embeds the formulas as specifications for the generated system. No formula parsing library is needed in FXL Core itself.

**Primary recommendation:** Keep TechnicalConfig as pure TypeScript type definitions with no runtime dependencies. Formulas are string literals validated by the config validator (structural checks only). The Config Resolver is a pure function that reads three configs and produces a Markdown SKILL.md string.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Report-type based import model: each client declares N report types (e.g., "Contas a Receber", "Contas a Pagar"), each with its own column mapping
- Periods are monthly only (month+year). Covers PME use cases. Flexible granularity deferred
- Each period can have 1+ file uploads per report type (dynamic count per client)
- Column mapping by exact column name from source file (e.g., "Nome do cliente" -> `clientName`)
- Each mapped column declares expected type (text, number, date, currency) and format (dd/mm/yyyy, 1.234,56) for auto-normalization of BR formats
- String expressions for formulas: `"receita_total - custos_variaveis"` -- readable, easy for Claude to generate and operators to review
- Fields derived from column aggregations: each field is a named aggregation over imported columns (e.g., `SUM(contas_receber.valor_recebido) WHERE status='pago'`)
- Time-based comparisons (mes anterior, mesmo mes ano anterior, media anual) are display-level concerns, not part of the formula itself
- Classification rules (grupos de despesa: Variavel/Fixo/Financeiro) declared as defaults in TechnicalConfig, editable by user at runtime
- Typed input declarations: each manual input point declares field name, data type (currency/number/text), frequency (per-month/one-time), and which screen/section consumes it
- Cadastros (grupos de despesa, centros de custo, bancos) are a separate "settings" section -- lookup tables, not periodic inputs
- Bank balances follow the same monthly period model as uploads
- Thresholds (e.g., semaforizacao R$ 10.000) are configurable in TechnicalConfig with defaults from briefing
- Output is a Claude Code SKILL.md file -- self-contained spec for another Claude Code instance to generate the Next.js project
- Follows existing SKILL.md pattern from wireframe-builder
- Includes complete Supabase schema: CREATE TABLE, indexes, RLS policies -- ready-to-run SQL migrations
- Blueprint layout embedded in the output (section types, order, grid layout) merged with TechnicalConfig data bindings
- Validation step (TCONF-04) runs before generation: checks every blueprint section has corresponding data bindings, formulas, and sources

### Claude's Discretion
- Exact TechnicalConfig TypeScript type structure and nesting
- Formula parser implementation approach
- Validation CLI/script design
- How the Config Resolver composes the final SKILL.md sections
- AI draft generation prompt strategy (how Claude reads briefing -> suggests TechnicalConfig)

### Deferred Ideas (OUT OF SCOPE)
- Flexible period granularity (quarterly, annual) -- future enhancement if monthly is insufficient
- Supabase persistence for TechnicalConfig (like blueprint-store) -- evaluate after v1
- Visual editor for TechnicalConfig (UI form instead of .ts file editing) -- future phase
- API-based data import (instead of file upload) -- mentioned in briefing as "API futura, fora do escopo"
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TCONF-01 | TechnicalConfig schema TypeScript que define fonte de dados, formulas KPI e regras de negocio por secao | Standard Stack (type definitions), Architecture Patterns (TechnicalConfig type hierarchy), Code Examples (full type definition) |
| TCONF-02 | Config Resolver que merge Blueprint + TechnicalConfig + Branding em GenerationManifest | Architecture Patterns (Config Resolver pure function), Code Examples (merge logic, SKILL.md template) |
| TCONF-03 | Claude sugere TechnicalConfig draft a partir do briefing/blueprint para operador revisar | Architecture Patterns (AI draft generation), Code Examples (prompt template structure) |
| TCONF-04 | Validacao automatica de que TechnicalConfig cobre todas as secoes do blueprint | Architecture Patterns (validation script), Code Examples (section coverage checker) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.6.3 | Type definitions for TechnicalConfig schema | Already in project. strict: true with discriminated unions provides exhaustive checking |
| N/A (pure types) | - | Formula declarations | Formulas are string literals in config, not evaluated at FXL Core level. Generated system handles evaluation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js fs | built-in | Config Resolver reads .ts files, writes SKILL.md | Resolver script reads configs from filesystem |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure TS types | Zod runtime validation | Zod adds 57KB dependency. Not in project. TypeScript compiler already catches structural errors. Manual validation script is lighter |
| String formula literals | fparser (v4.2.0) | Would add runtime formula parsing. Not needed -- formulas are specifications for the generated system, not evaluated in FXL Core |
| Custom validation script | JSON Schema | Over-engineered. Configs are .ts files, not JSON. TypeScript compiler is the schema validator |

**No new npm dependencies needed.** All work uses existing TypeScript types, Node.js built-ins, and follows established patterns.

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  types/
    blueprint.ts          # existing -- BlueprintConfig, BlueprintSection (15 types)
    branding.ts           # existing -- BrandingConfig
    technical.ts          # NEW -- TechnicalConfig, all sub-types
    generation.ts         # NEW -- GenerationManifest (merged output type)
  lib/
    branding.ts           # existing -- resolveBranding, derivePalette
    config-resolver.ts    # NEW -- resolveConfig() -> GenerationManifest
    config-validator.ts   # NEW -- validateConfig() -> ValidationResult
    skill-renderer.ts     # NEW -- renderSkillMd(manifest) -> string

clients/[slug]/wireframe/
    blueprint.config.ts   # existing
    branding.config.ts    # existing
    technical.config.ts   # NEW -- per-client TechnicalConfig instance
```

### Pattern 1: TechnicalConfig Type Hierarchy (Discriminated Union Mapping)

**What:** TechnicalConfig binds data semantics to blueprint sections using the same discriminated union `type` field. Each blueprint section type has a corresponding data binding type.

**When to use:** Always -- this is the core schema pattern.

**Design:**
```typescript
// tools/wireframe-builder/types/technical.ts

// --- Column types from source files ---
type ColumnDataType = 'text' | 'number' | 'date' | 'currency'
type ColumnFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy' | '1.234,56' | '1,234.56' | 'text'

type ColumnMapping = {
  sourceColumn: string       // exact name from CSV/XLSX: "Nome do cliente"
  targetField: string        // normalized name: "clientName"
  dataType: ColumnDataType
  format?: ColumnFormat      // for auto-normalization of BR formats
}

// --- Report types (imports) ---
type ReportType = {
  id: string                 // "contas-a-receber"
  label: string              // "Contas a Receber"
  columns: ColumnMapping[]
  periodModel: 'monthly'     // locked to monthly for v1
  filesPerPeriod: number     // typically 1, but dynamic per client
}

// --- Named fields (aggregations over imported columns) ---
type AggregationFunction = 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'

type FieldDefinition = {
  id: string                 // "receita_recebida"
  label: string              // "Receita Recebida"
  source: string             // report type id: "contas-a-receber"
  column: string             // target field: "valor_recebido"
  aggregation: AggregationFunction
  filter?: string            // WHERE clause: "status='pago'"
}

// --- Formula definitions ---
type FormulaDefinition = {
  id: string                 // "margem_contribuicao"
  label: string              // "Margem de Contribuicao"
  expression: string         // "receita_total - custos_variaveis"
  format: 'currency' | 'percentage' | 'number'
  references: string[]       // field/formula IDs used: ["receita_total", "custos_variaveis"]
}

// --- Manual input definitions ---
type ManualInputDefinition = {
  id: string                 // "saldo_inicial_caixa"
  label: string              // "Saldo Inicial"
  dataType: 'currency' | 'number' | 'text'
  frequency: 'per-month' | 'one-time'
  targetScreen: string       // screen id where it appears
  targetSection?: string     // optional section reference
}

// --- Settings (cadastros / lookup tables) ---
type SettingsTable = {
  id: string                 // "grupos-despesa"
  label: string              // "Grupos de Despesa"
  columns: { key: string; label: string; type: 'text' | 'badge' | 'status' | 'actions' }[]
  defaultRows?: Record<string, string>[]
}

// --- Classification rules ---
type ClassificationRule = {
  id: string                 // "tipo-despesa"
  label: string              // "Classificacao de Despesas"
  categories: { value: string; label: string }[]  // [{value: 'variavel', label: 'Variavel'}, ...]
  defaultMappings: Record<string, string>  // {"Folha Variavel": "variavel", ...}
}

// --- Threshold definitions ---
type ThresholdDefinition = {
  id: string                 // "semafor-caixa"
  label: string              // "Semaforizacao do Fluxo de Caixa"
  metric: string             // field/formula ID
  levels: {
    verde: { operator: '>=' | '>' | '<=' | '<'; value: number }
    amarelo: { operator: '>=' | '>' | '<=' | '<'; value: number; upperOperator?: '>=' | '>' | '<=' | '<'; upperValue?: number }
    vermelho: { operator: '>=' | '>' | '<=' | '<'; value: number }
  }
}

// --- Section data bindings (maps to BlueprintSection types) ---
type KpiGridBinding = {
  sectionType: 'kpi-grid'
  screenId: string
  sectionIndex: number
  items: {
    fieldOrFormula: string   // references FieldDefinition.id or FormulaDefinition.id
    subExpression?: string   // e.g., "45,0% s/ receita" -> formula for sub text
    threshold?: string       // ThresholdDefinition.id for semaforo
    comparisonTypes?: ('mes-anterior' | 'mesmo-mes-ano-anterior' | 'media-anual')[]
  }[]
}

type CalculoCardBinding = {
  sectionType: 'calculo-card'
  screenId: string
  sectionIndex: number
  rows: {
    fieldOrFormula: string
    operator?: string        // '(-)', '(=)', etc.
    highlight?: boolean
  }[]
}

type ChartBinding = {
  sectionType: 'bar-line-chart' | 'donut-chart' | 'waterfall-chart' | 'pareto-chart'
  screenId: string
  sectionIndex: number
  dataSource: string         // field/formula ID or aggregation expression
  groupBy?: string           // column to group by (for donut slices, bar categories)
}

type TableBinding = {
  sectionType: 'data-table' | 'drill-down-table' | 'clickable-table'
  screenId: string
  sectionIndex: number
  dataSource: string         // report type or derived query
  columns: {
    key: string
    fieldOrFormula: string
    format?: 'currency' | 'percentage' | 'number' | 'text' | 'date'
  }[]
  drillDownBy?: string       // column for hierarchical grouping
}

type UploadBinding = {
  sectionType: 'upload-section'
  screenId: string
  sectionIndex: number
  reportType: string         // ReportType.id
  acceptedFormats: string[]
}

type ManualInputBinding = {
  sectionType: 'manual-input'
  screenId: string
  sectionIndex: number
  inputs: string[]           // ManualInputDefinition.id[]
}

type SaldoBancoBinding = {
  sectionType: 'saldo-banco'
  screenId: string
  sectionIndex: number
  settingsTable: string      // SettingsTable.id for bank list
}

type ConfigTableBinding = {
  sectionType: 'config-table'
  screenId: string
  sectionIndex: number
  settingsTable: string      // SettingsTable.id
}

type InfoBlockBinding = {
  sectionType: 'info-block'
  screenId: string
  sectionIndex: number
  // static content -- no data binding needed
}

type ChartGridBinding = {
  sectionType: 'chart-grid'
  screenId: string
  sectionIndex: number
  items: ChartBinding[]
}

type SectionBinding =
  | KpiGridBinding
  | CalculoCardBinding
  | ChartBinding
  | TableBinding
  | UploadBinding
  | ManualInputBinding
  | SaldoBancoBinding
  | ConfigTableBinding
  | InfoBlockBinding
  | ChartGridBinding

// --- Top-level TechnicalConfig ---
type TechnicalConfig = {
  slug: string               // must match BlueprintConfig.slug
  version: '1.0'             // schema version for future migrations

  // Data layer
  reportTypes: ReportType[]
  fields: FieldDefinition[]
  formulas: FormulaDefinition[]

  // Input layer
  manualInputs: ManualInputDefinition[]
  settings: SettingsTable[]

  // Business rules
  classifications: ClassificationRule[]
  thresholds: ThresholdDefinition[]

  // Section bindings (maps blueprint sections to data)
  bindings: SectionBinding[]
}
```

### Pattern 2: Config Resolver (Pure Function Merge)

**What:** A pure function that takes BlueprintConfig + TechnicalConfig + BrandingConfig and produces a GenerationManifest -- a self-contained object with all data needed to render the SKILL.md.

**When to use:** TCONF-02 -- the merge step before SKILL.md generation.

**Design:**
```typescript
// tools/wireframe-builder/types/generation.ts
type GenerationManifest = {
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

// tools/wireframe-builder/lib/config-resolver.ts
import type { BlueprintConfig } from '../types/blueprint'
import type { BrandingConfig } from '../types/branding'
import type { TechnicalConfig } from '../types/technical'
import type { GenerationManifest } from '../types/generation'
import { resolveBranding } from './branding'

export function resolveConfig(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig,
  branding?: Partial<BrandingConfig>
): GenerationManifest {
  // 1. Validate slug match
  if (blueprint.slug !== technical.slug) {
    throw new Error(`Slug mismatch: blueprint="${blueprint.slug}" technical="${technical.slug}"`)
  }

  // 2. Resolve branding with defaults
  const resolvedBranding = resolveBranding(branding)

  // 3. Derive Supabase schema from technical config
  const supabaseSchema = deriveSupabaseSchema(technical)

  // 4. Merge blueprint screens with technical bindings
  const screens = mergeScreens(blueprint.screens, technical.bindings)

  // 5. Assemble manifest
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
```

### Pattern 3: SKILL.md Renderer (Template-based)

**What:** A function that takes a GenerationManifest and renders it as a Markdown SKILL.md file with embedded code blocks for Supabase SQL, TypeScript types, and implementation instructions.

**When to use:** TCONF-02 -- final output step.

**Design:** The renderer uses template literals to produce structured Markdown. Each section of the SKILL.md corresponds to a domain: project setup, Supabase schema, data layer, screens, branding. The generated SKILL.md follows the existing `tools/wireframe-builder/SKILL.md` convention (identity, when to use, how to use, rules).

```typescript
// tools/wireframe-builder/lib/skill-renderer.ts
export function renderSkillMd(manifest: GenerationManifest): string {
  const sections = [
    renderMeta(manifest.meta),
    renderSupabaseSchema(manifest.supabaseSchema),
    renderDataLayer(manifest.dataLayer),
    renderBranding(manifest.branding),
    renderScreens(manifest.screens),
    renderImplementationRules(),
  ]
  return sections.join('\n\n---\n\n')
}
```

### Pattern 4: Validation Script (Section Coverage)

**What:** A TypeScript script that reads a client's BlueprintConfig and TechnicalConfig, then checks that every blueprint section has a corresponding data binding in the technical config.

**When to use:** TCONF-04 -- validation step before generation.

**Design:**
```typescript
// tools/wireframe-builder/lib/config-validator.ts
type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  coverage: { total: number; bound: number; percentage: number }
}

type ValidationError = {
  type: 'missing-binding' | 'invalid-reference' | 'slug-mismatch' | 'orphan-binding'
  screenId: string
  sectionIndex?: number
  sectionType?: string
  message: string
}

export function validateConfig(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig
): ValidationResult {
  // 1. Check slug match
  // 2. For each screen.section, find corresponding binding
  // 3. Validate field/formula references exist
  // 4. Validate report type references exist
  // 5. Check for orphan bindings (bindings that reference non-existent sections)
  // 6. Calculate coverage percentage
}
```

### Pattern 5: AI Draft Generation (Prompt Template)

**What:** A structured prompt template that Claude uses to generate a TechnicalConfig draft by reading the client's briefing.md and blueprint.config.ts.

**When to use:** TCONF-03 -- operator workflow for new clients.

**Design:** The prompt is a Markdown template stored as a file (not code). The operator invokes Claude Code with a command like `/project:generate-technical-config [slug]` and Claude reads:
1. `clients/[slug]/docs/briefing.md` -- data sources, KPIs, business rules
2. `clients/[slug]/wireframe/blueprint.config.ts` -- section structure
3. `tools/wireframe-builder/types/technical.ts` -- schema to conform to

Claude then produces `clients/[slug]/wireframe/technical.config.ts` as a draft. The operator reviews and adjusts before running validation.

### Anti-Patterns to Avoid
- **Runtime formula evaluation in FXL Core:** Formulas are specifications for the generated system. FXL Core never evaluates `"receita_total - custos_variaveis"` -- it only validates that referenced field IDs exist.
- **Mixing blueprint visual data with technical bindings:** Blueprint sections contain visual/layout data (titles, demo values). TechnicalConfig adds the data layer on top. Never add data binding fields to BlueprintSection types.
- **Monolithic TechnicalConfig:** Do not put everything in one flat object. Use the domain-grouped structure (reportTypes, fields, formulas, manualInputs, settings, classifications, thresholds, bindings).
- **Generating SKILL.md with external file references:** The SKILL.md must be completely self-contained. No `import from ...` or `see file X`. Everything inlined.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formula evaluation | Runtime expression parser | String literals + reference validation | Formulas are specs for the generated system. FXL Core only validates that referenced IDs exist |
| Schema validation | Custom type checker at runtime | TypeScript compiler (`npx tsc --noEmit`) | Configs are .ts files -- the compiler IS the schema validator |
| Supabase SQL generation | Manual SQL string concatenation | Template-based renderer with structured TableSpec objects | Prevents SQL injection patterns, ensures consistent naming |
| Section type exhaustiveness | Manual if/else chains | TypeScript exhaustive switch with `never` type | Compiler catches missing cases when new section types are added |
| Deep object merging | Custom recursive merge | Structured merge by domain (not generic deep merge) | Config domains are well-defined -- a generic deep merge hides bugs |

**Key insight:** TechnicalConfig is a design-time artifact, not a runtime system. It describes what the generated system should do. FXL Core's job is to (1) define the schema, (2) validate completeness, (3) merge configs, and (4) render a SKILL.md. All four operations are pure functions over typed data.

## Common Pitfalls

### Pitfall 1: Binding Addressing Ambiguity
**What goes wrong:** Using section `type` alone to match bindings to blueprint sections fails because a screen can have multiple sections of the same type (e.g., two `kpi-grid` sections on the same screen).
**Why it happens:** Blueprint sections are positional (array index), not named.
**How to avoid:** Bindings use `screenId + sectionIndex` as the composite key. The validator checks that these indices exist and are within bounds.
**Warning signs:** Validator reports "duplicate binding" or "binding points to non-existent section index."

### Pitfall 2: Circular Formula References
**What goes wrong:** Formula A references Formula B which references Formula A. The generated system enters an infinite loop.
**Why it happens:** Formulas reference other formulas by ID, making cycles possible.
**How to avoid:** The validator performs a topological sort on the formula dependency graph. Any cycle is reported as a validation error.
**Warning signs:** Validator reports "circular reference detected in formula chain."

### Pitfall 3: Orphan Fields After Blueprint Changes
**What goes wrong:** Operator edits the blueprint (adds/removes sections) but forgets to update TechnicalConfig bindings.
**Why it happens:** Blueprint and TechnicalConfig are separate files with no automatic sync.
**How to avoid:** Always run validation after blueprint changes. The validator detects both uncovered sections and orphan bindings.
**Warning signs:** Validation coverage drops below 100%.

### Pitfall 4: ChartGrid Section Nesting
**What goes wrong:** `chart-grid` sections contain nested `BlueprintSection[]` items. The validator must recurse into these to check bindings.
**Why it happens:** ChartGrid is a container type -- its items are themselves chart sections.
**How to avoid:** The ChartGridBinding type includes an `items: ChartBinding[]` array. The validator recurses into ChartGrid items.
**Warning signs:** Validation reports 100% coverage but nested chart sections inside chart-grid have no bindings.

### Pitfall 5: SKILL.md Output Size
**What goes wrong:** The generated SKILL.md exceeds practical limits for a single Claude Code context window.
**Why it happens:** Merging blueprint layout + technical bindings + Supabase schema + branding for 10+ screens produces a very large file.
**How to avoid:** Structure the SKILL.md with clear section headers and use summary tables instead of verbose prose. The renderer should aim for density over verbosity.
**Warning signs:** SKILL.md exceeds ~2000 lines. Consider splitting into per-screen sections if this happens.

## Code Examples

### Example 1: Pilot Client TechnicalConfig Structure

Based on the existing pilot blueprint (10 screens, 15 section types used), the TechnicalConfig for `financeiro-conta-azul` would look like:

```typescript
// clients/financeiro-conta-azul/wireframe/technical.config.ts
import type { TechnicalConfig } from '@tools/wireframe-builder/types/technical'

const config: TechnicalConfig = {
  slug: 'financeiro-conta-azul',
  version: '1.0',

  reportTypes: [
    {
      id: 'contas-a-receber',
      label: 'Contas a Receber',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Nome do cliente', targetField: 'clientName', dataType: 'text' },
        { sourceColumn: 'Data de competencia', targetField: 'competenceDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Valor original da parcela (R$)', targetField: 'valorOriginal', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor recebido da parcela (R$)', targetField: 'valorRecebido', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor da parcela em aberto (R$)', targetField: 'valorAberto', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Data de vencimento', targetField: 'dueDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data do ultimo pagamento', targetField: 'lastPaymentDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Categoria 1', targetField: 'category', dataType: 'text' },
        { sourceColumn: 'Centro de Custo 1', targetField: 'costCenter', dataType: 'text' },
      ],
    },
    {
      id: 'contas-a-pagar',
      label: 'Contas a Pagar',
      periodModel: 'monthly',
      filesPerPeriod: 1,
      columns: [
        { sourceColumn: 'Nome do fornecedor', targetField: 'supplierName', dataType: 'text' },
        { sourceColumn: 'Data de competencia', targetField: 'competenceDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Valor original da parcela (R$)', targetField: 'valorOriginal', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor pago da parcela (R$)', targetField: 'valorPago', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Valor da parcela em aberto (R$)', targetField: 'valorAberto', dataType: 'currency', format: '1.234,56' },
        { sourceColumn: 'Data de vencimento', targetField: 'dueDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Data do ultimo pagamento', targetField: 'lastPaymentDate', dataType: 'date', format: 'dd/mm/yyyy' },
        { sourceColumn: 'Categoria 1', targetField: 'category', dataType: 'text' },
        { sourceColumn: 'Centro de Custo 1', targetField: 'costCenter', dataType: 'text' },
      ],
    },
  ],

  fields: [
    { id: 'receita_total', label: 'Receita Total Prevista', source: 'contas-a-receber', column: 'valorOriginal', aggregation: 'SUM' },
    { id: 'receita_recebida', label: 'Receita Recebida', source: 'contas-a-receber', column: 'valorRecebido', aggregation: 'SUM', filter: "status='pago'" },
    { id: 'despesa_total', label: 'Total Previsto Despesas', source: 'contas-a-pagar', column: 'valorOriginal', aggregation: 'SUM' },
    { id: 'despesa_paga', label: 'Total Pago', source: 'contas-a-pagar', column: 'valorPago', aggregation: 'SUM', filter: "status='pago'" },
    // ... more fields
  ],

  formulas: [
    { id: 'margem_contribuicao', label: 'Margem de Contribuicao', expression: 'receita_total - custos_variaveis', format: 'currency', references: ['receita_total', 'custos_variaveis'] },
    { id: 'margem_contribuicao_pct', label: 'Margem de Contribuicao %', expression: 'margem_contribuicao / receita_total * 100', format: 'percentage', references: ['margem_contribuicao', 'receita_total'] },
    { id: 'resultado_operacional', label: 'Resultado Operacional', expression: 'margem_contribuicao - custos_fixos', format: 'currency', references: ['margem_contribuicao', 'custos_fixos'] },
    { id: 'resultado_final', label: 'Resultado Final', expression: 'resultado_operacional - despesas_financeiras', format: 'currency', references: ['resultado_operacional', 'despesas_financeiras'] },
  ],

  manualInputs: [
    { id: 'saldo_inicial_caixa', label: 'Saldo Inicial do Mes', dataType: 'currency', frequency: 'per-month', targetScreen: 'fluxo-de-caixa-mensal' },
  ],

  settings: [
    {
      id: 'grupos-despesa',
      label: 'Grupos de Despesa',
      columns: [
        { key: 'categoria', label: 'Categoria', type: 'text' },
        { key: 'grupo', label: 'Grupo', type: 'badge' },
        { key: 'tipo', label: 'Tipo', type: 'badge' },
      ],
    },
    { id: 'centros-custo', label: 'Centros de Custo', columns: [{ key: 'nome', label: 'Nome', type: 'text' }] },
    { id: 'bancos', label: 'Bancos', columns: [{ key: 'nome', label: 'Nome', type: 'text' }, { key: 'ativo', label: 'Ativo', type: 'status' }] },
  ],

  classifications: [
    {
      id: 'tipo-despesa',
      label: 'Classificacao de Despesas',
      categories: [
        { value: 'variavel', label: 'Variavel' },
        { value: 'fixo', label: 'Fixo' },
        { value: 'financeiro', label: 'Financeiro' },
      ],
      defaultMappings: {
        'Folha Variavel': 'variavel',
        'Insumos': 'variavel',
        'Comissoes': 'variavel',
        'Administrativo': 'fixo',
        'Ocupacao': 'fixo',
        'Juros bancarios': 'financeiro',
      },
    },
  ],

  thresholds: [
    {
      id: 'semafor-caixa',
      label: 'Semaforizacao do Fluxo de Caixa',
      metric: 'saldo_projetado',
      levels: {
        verde: { operator: '>=', value: 10000 },
        amarelo: { operator: '>=', value: 0, upperOperator: '<', upperValue: 10000 },
        vermelho: { operator: '<', value: 0 },
      },
    },
  ],

  bindings: [
    // Screen: resultado-mensal-dfc, section 0 (kpi-grid)
    {
      sectionType: 'kpi-grid',
      screenId: 'resultado-mensal-dfc',
      sectionIndex: 0,
      items: [
        { fieldOrFormula: 'receita_total', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'margem_contribuicao', subExpression: 'margem_contribuicao_pct', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_operacional', comparisonTypes: ['mes-anterior'] },
        { fieldOrFormula: 'resultado_final', comparisonTypes: ['mes-anterior'] },
      ],
    },
    // ... more bindings for all sections
  ],
}

export default config
```

### Example 2: Validation Script Usage

```typescript
// Usage in a validation script (run via npx tsx)
import { validateConfig } from '@tools/wireframe-builder/lib/config-validator'
import blueprint from '@clients/financeiro-conta-azul/wireframe/blueprint.config'
import technical from '@clients/financeiro-conta-azul/wireframe/technical.config'

const result = validateConfig(blueprint, technical)

if (!result.valid) {
  console.error('Validation failed:')
  for (const error of result.errors) {
    console.error(`  [${error.type}] ${error.screenId}:${error.sectionIndex} - ${error.message}`)
  }
  process.exit(1)
}

console.log(`Validation passed. Coverage: ${result.coverage.percentage}%`)
console.log(`  ${result.coverage.bound}/${result.coverage.total} sections have data bindings`)
```

### Example 3: Config Resolver Output Shape

```typescript
// The Config Resolver merges three configs into a GenerationManifest
// which is then rendered as SKILL.md by the skill-renderer

const manifest = resolveConfig(blueprint, technical, branding)
const skillMd = renderSkillMd(manifest)

// skillMd is a complete Markdown string with sections:
// 1. # Skill -- [Client Label] System
// 2. ## Identidade (meta info)
// 3. ## Supabase Schema (CREATE TABLE, indexes, RLS)
// 4. ## Data Layer (report types, fields, formulas)
// 5. ## Screens (per-screen layout + data bindings)
// 6. ## Branding (colors, fonts)
// 7. ## Rules (implementation constraints)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Runtime formula evaluation in config tool | String-literal formulas as specs | Phase 5 decision | No formula parser library needed in FXL Core |
| JSON config files | TypeScript config files (.config.ts) | Phase 3 (blueprint) | Type-safe at author time, compiler validates |
| Manual SKILL.md writing | Template-based rendering from manifest | Phase 5 (new) | Consistent, validated output |

**Deprecated/outdated:**
- None specific to this phase. The project established config-as-TypeScript in Phase 3 and this phase extends the pattern.

## Open Questions

1. **SKILL.md Size Management**
   - What we know: The pilot client has 10 screens with ~60 sections total. The SKILL.md must be self-contained.
   - What's unclear: Whether a single SKILL.md will fit comfortably in a Claude Code context window for generation.
   - Recommendation: Implement the renderer to produce dense, structured output. If output exceeds ~2000 lines, add a "split mode" that produces per-screen SKILL files. Defer split mode unless the pilot proves it necessary.

2. **Supabase Schema Derivation Complexity**
   - What we know: The SKILL.md must include complete SQL (CREATE TABLE, indexes, RLS). Report types map to tables. Settings map to lookup tables.
   - What's unclear: The exact SQL template for each table type (imports, settings, manual inputs).
   - Recommendation: Start with a conservative schema template. The pilot client (2 report types, 3 settings tables, 1 manual input) provides a bounded test case.

3. **AI Draft Prompt Effectiveness**
   - What we know: Claude can read briefing.md and blueprint.config.ts to suggest a TechnicalConfig draft.
   - What's unclear: How reliably Claude maps briefing KPI descriptions to the TechnicalConfig schema without hallucinating field references.
   - Recommendation: Provide the full TechnicalConfig type definition in the prompt context. Use the pilot client as the validation case -- compare Claude's draft to the manually authored config.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework installed (no vitest/jest in package.json) |
| Config file | none -- see Wave 0 |
| Quick run command | `npx tsc --noEmit` (TypeScript compiler check) |
| Full suite command | `npx tsc --noEmit` (no test suite exists) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TCONF-01 | TechnicalConfig schema compiles and exports correctly | type-check | `npx tsc --noEmit` | N/A (compiler) |
| TCONF-02 | Config Resolver merges 3 configs into GenerationManifest without data loss | manual | Run resolver against pilot client, inspect output | Wave 0 |
| TCONF-03 | Claude generates valid TechnicalConfig draft from briefing | manual-only | Operator runs Claude Code with prompt, reviews output | N/A (AI interaction) |
| TCONF-04 | Validator catches missing bindings and reports coverage | manual | Run validator script against pilot client | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit` + run validator against pilot client
- **Phase gate:** TypeScript clean + validator reports 100% coverage on pilot

### Wave 0 Gaps
- [ ] No test framework installed -- `npx tsc --noEmit` is the only automated check
- [ ] Validation script (TCONF-04) doubles as the "test" for TCONF-02 -- if resolver output validates, merge worked
- [ ] AI draft quality (TCONF-03) is inherently manual -- operator reviews output

Note: This phase produces design-time artifacts (TypeScript types, pure functions, Markdown templates). The primary quality gate is `npx tsc --noEmit` (zero errors) per project convention. Adding vitest for unit tests on the resolver and validator is recommended but is a tooling decision outside this phase's scope.

## Sources

### Primary (HIGH confidence)
- `tools/wireframe-builder/types/blueprint.ts` -- BlueprintConfig, 15 BlueprintSection discriminated union types (read directly)
- `tools/wireframe-builder/types/branding.ts` -- BrandingConfig type and DEFAULT_BRANDING (read directly)
- `tools/wireframe-builder/lib/branding.ts` -- resolveBranding, derivePalette, brandingToCssVars patterns (read directly)
- `tools/wireframe-builder/lib/blueprint-store.ts` -- Supabase CRUD pattern with upsert (read directly)
- `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` -- 10 screens, ~60 sections, full pilot config (read directly)
- `clients/financeiro-conta-azul/docs/briefing.md` -- Complete pilot briefing with 2 report types, 9 modules, KPIs (read directly)
- `tools/wireframe-builder/SKILL.md` -- Existing SKILL.md convention and patterns (read directly)
- `tsconfig.json` -- Path aliases @/, @tools/, @clients/ (read directly)
- `package.json` -- No test framework, no Zod, TypeScript 5.6.3 (read directly)

### Secondary (MEDIUM confidence)
- [TypeScript Discriminated Unions patterns](https://www.convex.dev/typescript/advanced/type-operators-manipulation/typescript-discriminated-union) -- confirmed discriminated union is the standard pattern for this use case
- [fparser v4.2.0](https://github.com/bylexus/fparse) -- evaluated and rejected; formulas are specifications, not runtime evaluations

### Tertiary (LOW confidence)
- SKILL.md output size limits -- estimated based on 10 screens x ~60 sections. Actual limits depend on Claude Code context window size at generation time.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, extends established patterns from codebase
- Architecture: HIGH - TechnicalConfig type structure directly mirrors BlueprintConfig and BrandingConfig patterns already in the codebase
- Pitfalls: HIGH - derived from analysis of actual blueprint.config.ts structure (section nesting, chart-grid recursion, addressing by index)
- Validation approach: MEDIUM - no test framework exists; validation relies on TypeScript compiler + custom validation script

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain -- TypeScript types and config patterns)
