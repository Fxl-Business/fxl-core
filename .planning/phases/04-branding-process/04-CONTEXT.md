# Phase 4: Branding Process - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Structured branding collection with automatic application to wireframes. Three deliverables: (1) parseable branding file format per client, (2) documented collection process with template, (3) wireframe rendering using client brand colors and fonts instead of hardcoded defaults.

</domain>

<decisions>
## Implementation Decisions

### Branding file format
- Use TypeScript schema (`BrandingConfig` type) for type-safe branding data
- Store as `branding.config.ts` in `clients/[slug]/wireframe/` alongside `blueprint.config.ts`
- Fields: primary color, secondary color, accent color, font family (heading + body), logo URL, favicon URL
- Keep `branding.md` as the human-readable version for client-facing documentation
- `branding.config.ts` is the machine-readable source of truth consumed by components

### Collection process
- Template questionnaire in `docs/ferramentas/` documenting the step-by-step branding collection
- Operator fills in branding.md during client session, then generates branding.config.ts
- Minimum viable branding: primary color + logo URL (everything else has sensible defaults)
- Include a default/fallback BrandingConfig for clients without branding yet

### Wireframe application — Full theme override
- Primary, secondary, accent colors override wireframe chrome (sidebar, header, toolbar)
- Charts use client color palette (bars, lines, donut slices, waterfall positive/negative)
- KPI cards use primary color for value highlights
- Table headers use primary color background
- Font family applied to all wireframe text (heading font for titles, body font for content)
- Logo renders in wireframe sidebar header replacing "FXL" text
- Neutral tones (backgrounds, borders, muted text) stay as-is — branding affects accent/emphasis, not structure

### Implementation approach
- BrandingConfig passed as prop through BlueprintRenderer → SectionRenderer → components
- CSS custom properties injected at wireframe container level for cascading brand colors
- Components read brand colors from CSS vars with fallback to current hardcoded values
- No changes to FXL Core app theme (Phase 02.3) — branding only affects wireframe rendering
- SharedWireframeView also applies branding (client sees their brand)

### Claude's Discretion
- Exact CSS variable naming convention for brand tokens
- Default fallback palette when no branding configured
- Chart color palette generation algorithm (derive N colors from primary/secondary/accent)
- Template questionnaire structure and wording
- Whether to also store branding in Supabase (alongside blueprint) or keep as .ts file only

</decisions>

<specifics>
## Specific Ideas

- User wants Claude to make all best decisions — no specific visual preferences expressed
- Branding should "just work" without manual tweaking once the config is filled in
- Existing branding.md placeholder (clients/financeiro-conta-azul/docs/branding.md) has sections for paleta, tipografia, logo, tom/voz, referencias — keep compatible structure

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `clients/[slug]/docs/branding.md`: Existing placeholder with sections (paleta, tipografia, logo, tom/voz, referencias)
- `tools/wireframe-builder/types/blueprint.ts`: BlueprintConfig type — branding config will follow same pattern
- `tools/wireframe-builder/lib/blueprint-store.ts`: Supabase CRUD pattern reusable for branding if stored in DB
- `tools/wireframe-builder/SKILL.md`: Already instructs Claude to read branding.md (line 169)

### Established Patterns
- Blueprint declarative config → renderer pipeline: branding follows same `config.ts` → component props pattern
- Phase 02.3 semantic token system (CSS custom properties): same approach for brand tokens
- structuredClone for edit mode isolation (Phase 03): applicable if branding becomes editable

### Integration Points
- `BlueprintRenderer` → needs to accept BrandingConfig and inject CSS vars
- `SectionRenderer` → passes brand-aware props to individual chart/table/KPI components
- `WireframeViewer` → loads BrandingConfig alongside BlueprintConfig
- `SharedWireframeView` → also loads branding for client-facing view
- `WireframeHeader` → logo and primary color from branding
- All chart components (BarLineChart, DonutChart, ParetoChart, WaterfallChart) → brand color palette
- `KpiCard` → primary color for value emphasis

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-branding-process*
*Context gathered: 2026-03-09*
