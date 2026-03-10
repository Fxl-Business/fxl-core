# Phase 11: AI-Assisted Generation - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Claude Code generates a complete BlueprintConfig from a client briefing stored in Supabase, using screen recipes and vertical templates as guiding knowledge. The generated blueprint is saved directly to Supabase and immediately viewable/editable in the wireframe viewer. No approval flow — operator edits after generation via existing visual editor.

</domain>

<decisions>
## Implementation Decisions

### Generation trigger
- Claude Code SKILL (SKILL.md in wireframe-builder) — operator invokes from terminal
- Reads briefing from Supabase via `briefing-store.ts`
- Generates valid BlueprintConfig, validates with Zod schema
- Saves directly to Supabase via `blueprint-store.ts`
- Operator opens wireframe viewer and sees the result immediately

### Generation intelligence
- Claude Code analyzes the business type and needs from the briefing
- Maps business context to appropriate screens: financial data -> financial screens, operational data -> operational screens
- Chooses best chart types, section types, and KPI layouts for each business context
- Uses screen recipes and vertical templates as structured knowledge base
- Leverages existing blueprints (financeiro-conta-azul) as reference for quality and structure

### No approval flow
- First version is generated directly — no preview/diff/accept workflow
- Operator edits the generated blueprint using the existing wireframe visual editor
- This keeps the scope minimal and leverages Phase 7-10 infrastructure

### Output destination
- Direct to Supabase (same table/pattern as manual blueprints)
- Operator can immediately view, edit, and iterate via wireframe viewer
- No local file intermediary

### Claude's Discretion
- Screen recipe structure: typed screen templates vs section combo patterns vs reference blueprint analysis — choose best approach given the codebase
- Vertical template scope: financeiro-only vs 3 verticals (financeiro/varejo/servicos) — guided by AIGE-03 requirements and what makes sense for v1.1
- SKILL.md design: invocation syntax, parameters, output format
- How much intelligence comes from typed recipes vs Claude's own analysis
- Error handling when briefing is incomplete or ambiguous

</decisions>

<specifics>
## Specific Ideas

- "Eu quero que o Claude Code analise o tipo de negocio e as necessidades do negocio, baseada no briefing, e automaticamente gere um blueprint que faca sentido"
- "Se o tipo de cliente tem dados financeiros, gere telas financeiras. Se tem dados operacionais, gere telas operacionais com os melhores tipos de grafico"
- "A primeira versao nao precisa ser aprovada. Ele vai apenas gerar, e em cima dele eu vou alterando"
- Generation must produce a BlueprintConfig that passes Zod validation and renders without errors in the wireframe viewer (Success Criteria 1)
- Briefing form from Phase 10 was designed to "capture enough structure for Claude Code to generate a blueprint programmatically"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `briefing-store.ts`: loadBriefing(clientSlug) — reads structured briefing from Supabase
- `briefing-schema.ts`: Zod validation for BriefingConfig (companyInfo, dataSources, modules, targetAudience, freeFormNotes)
- `blueprint-store.ts`: saveBlueprint(clientSlug, config, updatedBy) — saves to Supabase with optimistic locking
- `blueprint-schema.ts`: Zod validation for all 21 section types — generation output MUST pass this
- `section-registry.tsx`: getDefaultSection(type) creates valid section templates with default props
- `blueprint-text.ts`: extractBlueprintSummary() for post-generation verification
- `blueprint-export.ts`: exportBlueprintMarkdown() for readable output
- `config-validator.ts`: validateConfigs() for coverage checks
- `spec-writer.ts`: full downstream pipeline (validate -> resolve -> generate 6 spec files)

### Established Patterns
- Supabase table: client_slug PK, JSONB config column, anon RLS policies
- BlueprintConfig type with discriminated union for 21 section types
- Section registry: single source of truth for type -> renderer/form/defaults/schema mapping
- Schema versioning with auto-migration on load
- Wireframe tokens (--wf-*) for all visual rendering

### Integration Points
- BriefingConfig (Supabase) -> generation input
- BlueprintConfig (Supabase) -> generation output
- Wireframe viewer -> immediate visualization of generated blueprint
- Visual editor -> operator post-generation editing
- SKILL.md -> Claude Code invocation pattern (same as wireframe-builder/SKILL.md)

### Reference Data
- financeiro-conta-azul: 10 screens, 21 section types used, complete briefing + blueprint
- briefing.md: 9 modules (DRE, Receita, Despesa, Centro de Custo, Margens, Fluxo Mensal, Fluxo Anual, Indicadores, Configuracoes)
- BriefingConfig type: companyInfo, dataSources[], modules[] (name, kpis[], businessRules), targetAudience, freeFormNotes

</code_context>

<deferred>
## Deferred Ideas

- AI-assisted briefing filling from pre-defined forms (BRFA-01 — v2)
- Supabase MCP for direct Claude Code DB access (BRFA-02 — v2)
- Blueprint diff and merge visual (ADVW-01 — v2)
- Progressive refinement / regenerate individual screens (ADVW-02 — v2)
- Natural language editing ("aumenta o grafico") (ADVW-05 — v2)
- UI button that triggers generation from browser (requires API integration — future)

</deferred>

---

*Phase: 11-ai-assisted-generation*
*Context gathered: 2026-03-10*
