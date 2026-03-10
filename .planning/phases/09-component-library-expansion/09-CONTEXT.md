# Phase 9: Component Library Expansion - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Registry pattern to centralize section type dispatching (currently 7 locations), 6 new wireframe block types (settings-page, form-section, filter-config, stat-card, progress-bar, divider), 5 additional chart variants (Radar, Treemap, Funnel, Scatter, Area), and a generic parametric viewer replacing per-client hardcoded pages.

</domain>

<decisions>
## Implementation Decisions

### Block fidelity level
- Wireframe functional: inputs, toggles, selects render visually with hover/focus states but don't process real data
- Consistent with existing blocks (KPI cards show fake numbers, tables show sample rows)
- Each new block shows realistic content structure — not just a placeholder rectangle

### Block visual style
- All new blocks follow shadcn/ui as the base style, adapted to wireframe tokens (--wf-*)
- Use shadcn component patterns (Input, Select, Switch, Progress, Separator) rendered with wireframe token colors
- "Steel" aesthetic — clean, minimal, functional look matching the warm gray + gold palette

### Generic viewer migration
- Create parametric route /clients/:clientSlug/wireframe that resolves blueprint + branding from Supabase by slug
- Delete the hardcoded FinanceiroContaAzul viewer page
- Add redirect from old route to new generic route
- SharedWireframeView remains separate (different auth model — no Clerk)

### Registry pattern
- Single registry file maps section type string → { renderer, propertyForm, catalogEntry, defaultProps }
- All 7 current dispatcher locations (SectionRenderer switch, PropertyPanel switch, ComponentPicker catalog, blueprint validation, type union, default section factory, drag preview) consume from registry
- Adding a new section type = 1 file (component) + 1 registry entry
- Existing 15 section types migrated to registry in same pass

### New chart variants
- 5 types: RadarChart, Treemap, FunnelChart, ScatterChart, AreaChart (all available in Recharts 2.13.3)
- Integrated as sub-variants of the existing chart section type (not new top-level section types)
- Added to chart type selector in property panel
- Each renders with sample data and respects chartColors from branding

### Claude's Discretion
- Registry file structure and export pattern
- Property form field layout for each new block
- Sample/default data for each new block type
- ComponentPicker category assignment for new blocks
- Zod schema additions for new section types in BlueprintSection union
- Chart sample data shape and visual configuration
- Route parameter validation and error handling for generic viewer
- Migration approach for existing FinanceiroContaAzul blueprint references

</decisions>

<specifics>
## Specific Ideas

- User wants shadcn/ui components as visual base — not raw HTML inputs
- Steel aesthetic = clean functional wireframe, not decorative
- Branding does NOT override wireframe gold accent (decision from Phase 8 carries forward)
- Three-layer token isolation preserved: app tokens, wireframe chrome (--wf-*), client branding (fonts/logo/charts only)

</specifics>

<code_context>
## Existing Code Insights

### Dispatcher Locations (7 — target: centralize to 1 registry)
1. `SectionRenderer.tsx` — switch on section.type → renderer component
2. `PropertyPanel` — switch on section.type → property form
3. `ComponentPicker` — hardcoded CatalogEntry arrays per category
4. `blueprint.ts` types — BlueprintSection discriminated union (15 types)
5. `blueprint-schema.ts` — Zod validation for each section type
6. `editor/` default section factories — createDefault*Section functions
7. Drag preview rendering — section type → preview icon/label

### Existing Section Types (15)
kpi-grid, bar-line-chart, donut-chart, waterfall-chart, pareto-chart, calculo-card, data-table, drill-down-table, clickable-table, saldo-banco, manual-input, upload-section, config-table, chart-grid, info-block

### Reusable Assets
- ComponentPicker: Dialog modal with 5 categories, CatalogEntry type { type, label, description, icon }
- 15 property form files (1 per section type) in tools/wireframe-builder/components/editor/
- BrandingConfig type with primaryColor, fonts, logo
- Recharts 2.13.3 already installed — Radar, Treemap, Funnel, Scatter, Area available

### Integration Points
- WireframeViewer.tsx (FinanceiroContaAzul) — to be replaced by generic viewer
- SharedWireframeView.tsx — stays as-is (separate auth model)
- AdminToolbar — already uses --wf-* tokens (Phase 8)
- useWireframeStore — Zustand store with blueprint CRUD + Supabase sync

</code_context>

<deferred>
## Deferred Ideas

- Drag-and-drop reorder of sections (ADVW-04 — v2)
- Custom component creation via UI (ADVW-06 — v2)
- Natural language editing of sections (ADVW-05 — v2)

</deferred>

---

*Phase: 09-component-library-expansion*
*Context gathered: 2026-03-10*
