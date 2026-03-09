# Phase 5: Technical Configuration - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Operators define data semantics (imports, formulas, manual inputs, settings) for any blueprint and get a validated, generation-ready artifact. Deliverables: (1) TechnicalConfig TypeScript schema in wireframe-builder, (2) Config Resolver that merges Blueprint + TechnicalConfig + Branding into a generation SKILL.md, (3) Claude-assisted TechnicalConfig draft from briefing/blueprint, (4) validation that TechnicalConfig covers all blueprint sections.

Global definitions (schema, types, validation) live in `tools/wireframe-builder/`. Per-client TechnicalConfig lives in `clients/[slug]/wireframe/technical.config.ts`. Blueprint and wireframe are two views of the same data — TechnicalConfig adds the data layer on top.

</domain>

<decisions>
## Implementation Decisions

### Import/Upload model
- Report-type based: each client declares N report types (e.g., "Contas a Receber", "Contas a Pagar"), each with its own column mapping
- Periods are monthly only (month+year). Covers PME use cases. Flexible granularity deferred
- Each period can have 1+ file uploads per report type (dynamic count per client)
- Column mapping by exact column name from source file (e.g., "Nome do cliente" → `clientName`)
- Each mapped column declares expected type (text, number, date, currency) and format (dd/mm/yyyy, 1.234,56) for auto-normalization of BR formats

### Formula/calculation engine
- String expressions for formulas: `"receita_total - custos_variaveis"` — readable, easy for Claude to generate and operators to review
- Fields derived from column aggregations: each field is a named aggregation over imported columns (e.g., `SUM(contas_receber.valor_recebido) WHERE status='pago'`)
- Time-based comparisons (mês anterior, mesmo mês ano anterior, média anual) are display-level concerns, not part of the formula itself — KPI formula calculates the base value, display config declares which comparisons to show
- Classification rules (grupos de despesa: Variável/Fixo/Financeiro) declared as defaults in TechnicalConfig, editable by user at runtime in the generated system's Settings page

### Manual input definitions
- Typed input declarations: each manual input point declares field name, data type (currency/number/text), frequency (per-month/one-time), and which screen/section consumes it
- Cadastros (grupos de despesa, centros de custo, bancos) are a separate "settings" section — lookup tables, not periodic inputs
- Bank balances follow the same monthly period model as uploads — each bank gets a balance per period
- Thresholds (e.g., semaforização R$ 10.000) are configurable in TechnicalConfig with defaults from briefing — different clients may need different limits

### Generation output format
- Output is a Claude Code SKILL.md file — self-contained spec for another Claude Code instance to generate the Next.js project
- Follows existing SKILL.md pattern from wireframe-builder
- Includes complete Supabase schema: CREATE TABLE, indexes, RLS policies — ready-to-run SQL migrations
- Blueprint layout embedded in the output (section types, order, grid layout) merged with TechnicalConfig data bindings — no external file references needed
- Validation step (TCONF-04) runs before generation: checks every blueprint section has corresponding data bindings, formulas, and sources — flags gaps before wasting a generation cycle

### Claude's Discretion
- Exact TechnicalConfig TypeScript type structure and nesting
- Formula parser implementation approach
- Validation CLI/script design
- How the Config Resolver composes the final SKILL.md sections
- AI draft generation prompt strategy (how Claude reads briefing → suggests TechnicalConfig)

</decisions>

<specifics>
## Specific Ideas

- Process flow is: Briefing → Blueprint/Wireframe (same data, two views) → Branding → TechnicalConfig → Generation SKILL.md
- All global specs, types, blocks, validation rules live in `tools/wireframe-builder/` — per-client config is just an instance
- Designed for 50-100+ clients — schema must be general enough, per-client config must be lean
- Pilot client (financeiro-conta-azul) has detailed briefing with 2 report types, 9 modules, confirmed KPIs and DRE structure
- The SKILL.md output must have "maximum detail level" — another Claude Code instance reads it and generates code without asking questions
- Semaforização thresholds, classification defaults, and comparison types are all configurable per-client

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/wireframe-builder/types/blueprint.ts`: BlueprintConfig, BlueprintScreen, 15 BlueprintSection types — TechnicalConfig references these section types for data binding
- `tools/wireframe-builder/types/branding.ts`: BrandingConfig type — same pattern for TechnicalConfig type definition
- `tools/wireframe-builder/lib/blueprint-store.ts`: Supabase CRUD (load/save/seedFromFile) — same pattern applicable for TechnicalConfig persistence if needed
- `tools/wireframe-builder/lib/branding.ts`: resolveBranding, brandingToCssVars, getChartPalette, derivePalette — branding resolution pattern reusable for config resolution
- `tools/wireframe-builder/SKILL.md`: Existing SKILL.md pattern — generation output follows this convention
- `clients/financeiro-conta-azul/docs/briefing.md`: Complete pilot briefing with report structure, KPIs, DRE formula, módulos

### Established Patterns
- Config-as-TypeScript: `blueprint.config.ts` and `branding.config.ts` in `clients/[slug]/wireframe/` — TechnicalConfig follows same convention
- Type definitions in `tools/wireframe-builder/types/` — global schema lives here
- Lib utilities in `tools/wireframe-builder/lib/` — resolver, validation, helpers live here
- Discriminated union for section types — data bindings map to these same types

### Integration Points
- `tools/wireframe-builder/types/technical.ts` (new) — TechnicalConfig type definition
- `tools/wireframe-builder/lib/config-resolver.ts` (new) — merges Blueprint + TechnicalConfig + Branding → SKILL.md
- `tools/wireframe-builder/lib/config-validator.ts` (new) — validates TechnicalConfig covers all blueprint sections
- `clients/[slug]/wireframe/technical.config.ts` (new per client) — per-client TechnicalConfig instance
- Pilot: `clients/financeiro-conta-azul/wireframe/technical.config.ts` — first implementation

</code_context>

<deferred>
## Deferred Ideas

- Flexible period granularity (quarterly, annual) — future enhancement if monthly is insufficient
- Supabase persistence for TechnicalConfig (like blueprint-store) — evaluate after v1
- Visual editor for TechnicalConfig (UI form instead of .ts file editing) — future phase
- API-based data import (instead of file upload) — mentioned in briefing as "API futura, fora do escopo"

</deferred>

---

*Phase: 05-technical-configuration*
*Context gathered: 2026-03-09*
