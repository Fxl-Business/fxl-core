# Project Research Summary

**Project:** FXL Core v1.3 -- Builder & Components
**Domain:** BI Dashboard Wireframe Builder -- configurable layout shell, chart type expansion, gallery reorganization
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

FXL Core v1.3 expands the wireframe builder from a content-section system (21 section types, 11 chart types) into a full-dashboard authoring tool where the entire dashboard chrome -- sidebar, header, filter bar -- is declarative and blueprint-driven. The second pillar is chart coverage: expanding from 11 to 20+ chart types to match Power BI and Metabase parity for PME BI use cases. The third is reorganizing the component gallery from a hardcoded flat list into a registry-driven, categorized experience. The critical finding across all research: zero new npm packages are required. Recharts 2.x already ships every chart container needed, and the layout/schema work is pure TypeScript/Zod application code. The only dependency change is a minor Recharts bump (2.13.3 to 2.15.4).

The recommended approach is schema-first: extend `BlueprintConfig` with a `layout` field for sidebar/header/filter bar configuration (dashboard-level, not section-level), expand the `ChartType` enum for cartesian chart variants, and introduce new section types only for charts with fundamentally different data shapes (gauge, radial-bar). Layout elements must NOT be modeled as section types -- they are shell/chrome that wraps all screens, not content within a screen. This is the single most important architectural decision and getting it wrong would require a painful schema migration later. The gallery should be refactored to consume the section registry before new components are added, not after.

The primary risks are: (1) blueprint schema migration corrupting existing client data in Supabase if new fields are required instead of optional, (2) the discriminated union and section registry becoming unmaintainable as types grow from 21 toward 26+, and (3) the wireframe viewer's z-index/layout stack breaking when the header is restructured to sit above the sidebar. All three are mitigable with upfront design decisions in Phase 1 before any component implementation begins.

## Key Findings

### Recommended Stack

Zero new packages. The existing stack (React 18, TypeScript 5, Tailwind 3, Recharts 2.x, Zod 4, shadcn/ui, dnd-kit) covers every v1.3 requirement. The only change is a Recharts minor bump for bug fixes in RadialBarChart and FunnelChart rendering.

**Core technologies (unchanged, confirmed adequate):**
- **Recharts 2.15.4:** All 12 chart containers built in; 3 unused ones (RadialBarChart, Sankey, SunburstChart) become available without new imports. Recharts 3.x is explicitly excluded (breaking API changes, per PROJECT.md).
- **Zod 4.3:** Discriminated union scales to 26+ types. `z.enum` scales to 16+ chart type values. Schema migration system already proven with v0-to-v1.
- **TypeScript 5.6 strict:** Discriminated unions and template literal types handle the expanded type system. Monitor compile time if types exceed 40.
- **shadcn/ui Charts component:** Evaluated and rejected -- it adds a ChartContainer/ChartConfig abstraction that conflicts with the existing `--wf-*` token + `chartColors` prop pattern. Continue wrapping Recharts directly.

**What NOT to add:** D3.js, Chart.js, nivo, visx, react-grid-layout, @tanstack/react-table, react-hook-form. Each was evaluated and excluded for concrete reasons (see STACK.md).

### Expected Features

**Must have (table stakes):**
- Configurable sidebar via blueprint schema (groups, icons, collapsible, derived from screens)
- Configurable header via blueprint schema (period selector toggle, action buttons, full-width above sidebar)
- Extended filter types with discriminator (`select`, `multi-select`, `date-range`, `search`)
- Stacked bar, stacked area, horizontal bar chart variants (every BI tool has these)
- Gauge/radial meter chart (KPI vs target -- standard in Metabase, Power BI)
- Bubble chart variant (scatter with size dimension)
- Gallery organized by thematic sections from section registry categories
- Softer wireframe palette (less harsh blacks)

**Should have (differentiators):**
- Blueprint-driven layout hierarchy (entire dashboard structure as typed schema -- no competitor does this for wireframes)
- Composed chart with configurable multi-series
- Sidebar badge counts, footer with version/environment
- Boolean toggle filter, date-range calendar widget
- Logo/brand display in header

**Defer to v2+:**
- Map/geographic charts (heavy dependency, niche for PME)
- Pivot table / matrix (extreme complexity, react-pivottable needed)
- Cross-chart filtering (meaningless with mock data, requires global state)
- Sankey, sunburst, histogram, box plot (niche/statistical, low PME demand)
- Nested sidebar 3+ levels, drag-and-drop sidebar reordering

### Architecture Approach

The architecture extends three established patterns: (1) section registry for new chart types, (2) blueprint schema for layout configuration, and (3) ChartRenderer dispatch for chart sub-variants. The key structural change is lifting sidebar/header/filter bar from hardcoded elements in `WireframeViewer.tsx` into configurable components driven by `BlueprintConfig.layout`. Content sections continue to flow through the existing `SectionRenderer -> SECTION_REGISTRY -> Renderer` pipeline unchanged. Gallery becomes registry-driven (auto-generated from `getCatalog()`) with a separate curated tier for shell components.

**Major components and their v1.3 changes:**
1. **BlueprintConfig schema** -- gains `layout?: { sidebar, header, filterBar }` at config level (not screen level). Schema version bumps. All new fields optional for backward compatibility.
2. **WireframeViewer** -- restructured from `flex row (sidebar + column(header, main))` to `flex column (header + row(sidebar, main))`. Header becomes full-width, highest z-order.
3. **Section registry + ChartRenderer** -- adds 5 new `chartType` sub-variants to `bar-line-chart`, plus 1-2 new section types (`gauge-chart`, potentially `radial-bar-chart`) with full registry entries.
4. **ComponentGallery** -- refactored from hardcoded imports to registry-driven tier (sections from `SECTION_REGISTRY`) + curated tier (shell components).
5. **Property forms** -- shared field components extracted (`TitleField`, `HeightField`, `EnumSelector`) before building new forms.

### Critical Pitfalls

1. **Layout vs content confusion (CRITICAL)** -- Sidebar/header modeled as section types would break the rendering hierarchy (drag-reorderable, deletable, inside scroll area). Model them at `BlueprintConfig.layout` level. Decide this in Phase 1 before any implementation.

2. **Blueprint migration corrupts data (CRITICAL)** -- The `loadBlueprint()` write-back-immediately pattern overwrites original data with migrated data. If the v2 schema rejects old data, client blueprints appear to vanish. Make all new fields optional, add snapshot tests with real client data, consider a backup column.

3. **Discriminated union scaling (HIGH)** -- At 40+ types, TypeScript compile time degrades (O(n^2) pairwise comparison). The `z.ZodType` annotation erases type inference. Split schemas by category before adding types, not after.

4. **ChartRenderer switch explosion (HIGH)** -- The `bar-line-chart` section is already overloaded with 8 sub-variants. Adding 5 more is acceptable. Adding 15+ creates a god-object schema. Keep cartesian variants in `bar-line-chart`, give unique data shapes their own section types.

5. **Z-index stacking breaks on layout restructure (MEDIUM)** -- Moving header from inside-content to above-sidebar cascades through AdminToolbar, PropertyPanel, CommentOverlay, and modals. Define a z-index scale before restructuring, extract a `WireframeShell` component.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Schema Foundation & Layout Restructure
**Rationale:** Every downstream phase depends on the type system, Zod schemas, and layout hierarchy being correct. Schema design errors compound -- a wrong decision here requires migrating every stored blueprint later. This is the highest-risk, lowest-code-volume phase.
**Delivers:** Extended `BlueprintConfig` with `layout` field, expanded `ChartType` enum, new section type definitions (gauge-chart, radial-bar-chart), Zod schemas, schema migration v1-to-v2 with snapshot tests, WireframeViewer layout restructure (header above sidebar), z-index scale, Recharts bump to 2.15.4.
**Addresses features:** SidebarConfig, HeaderConfig, FilterOption type extension, header-above-sidebar layout, "Gerenciar" as header button.
**Avoids pitfalls:** Layout-vs-content confusion (Pitfall 2), migration data corruption (Pitfall 3), z-index stacking (Pitfall 7).

### Phase 2: Chart Type Expansion
**Rationale:** Chart components are independent of each other and parallelizable. Each follows the proven section registry pattern (type + schema + component + renderer + form + registry entry). Low risk per component, high cumulative value.
**Delivers:** 5 new chartType sub-variants (stacked-bar, grouped-bar, horizontal-bar, stacked-area, multi-line/bubble) in ChartRenderer, 1-2 new section types (gauge-chart, radial-bar-chart) with full registry entries, updated property forms with shared field components.
**Addresses features:** All P1 chart types, gauge chart with target zones, bubble chart.
**Avoids pitfalls:** ChartRenderer explosion (Pitfall 4) -- keep variant count per section type under 8. Property form duplication (Pitfall 6) -- extract shared fields first.

### Phase 3: Configurable Layout Components
**Rationale:** Depends on schema from Phase 1 being stable. The sidebar, header, and filter bar components are refactored from hardcoded to config-driven. This is the most complex UI work -- WireframeViewer refactoring, new ConfigurableSidebar/ConfigurableHeader components, LayoutConfigPanel for the editor.
**Delivers:** ConfigurableSidebar (groups, icons, collapsible), ConfigurableHeader (period selector toggle, actions, full-width), extended WireframeFilterBar (multi-select, date-range, search filter types), LayoutConfigPanel in editor, softer wireframe palette.
**Addresses features:** Sidebar icons, sidebar groups, collapsible sidebar, configurable header, extended filter types, palette softening.
**Avoids pitfalls:** Z-index stacking (Pitfall 7) -- uses scale defined in Phase 1. Layout-content confusion (Pitfall 2) -- layout editing is separate from content editing.

### Phase 4: Gallery Reorganization & Polish
**Rationale:** Must come last because it depends on all new components and section types existing in the registry. Refactoring the gallery to be registry-driven before all components exist would leave gaps. Refactoring it after is clean.
**Delivers:** Registry-driven gallery (auto-generated from `getCatalog()`), shell component tier (manually curated sidebar/header/filter bar previews), lazy-loaded category sections, mock data for all new chart types, aligned categories between gallery and ComponentPicker.
**Addresses features:** Gallery reorganization by thematic sections, all new chart types visible with previews.
**Avoids pitfalls:** Gallery unmaintainability (Pitfall 5) -- drives from registry, not hardcoded list.

### Phase Ordering Rationale

- **Phase 1 before everything:** Types and schemas are the foundation. Every component, renderer, form, and gallery entry references types defined here. The layout restructure (header above sidebar) must be stable before building configurable layout components on top of it.
- **Phase 2 before Phase 3:** Chart components are simpler (follow existing registry pattern) and can be built in parallel. Layout components require the more complex WireframeViewer refactoring. Delivering charts early provides visible progress.
- **Phase 3 after Phase 1+2:** Layout components are the riskiest UI work (refactoring a 945-line WireframeViewer). Having stable schemas and a working chart expansion reduces the variables.
- **Phase 4 last:** Gallery is a consumption layer. Building it before the components it displays would require constant updates. Building it after lets it consume the final registry state.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Schema):** The chart taxonomy decision (which charts stay as `bar-line-chart` sub-variants vs get their own section types) has significant downstream impact. Research-phase recommended to finalize the taxonomy with concrete Zod schema prototypes.
- **Phase 3 (Layout Components):** The WireframeViewer refactoring touches 945 lines across 4+ positioning contexts. Research-phase recommended to map every CSS positioning dependency before coding.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Charts):** Well-documented Recharts API. Each new chart follows the identical pattern of existing 11 chart components. No ambiguity.
- **Phase 4 (Gallery):** Straightforward UI refactoring. The registry API (`getCatalog()`, `defaultProps()`) already exists. Just wire the gallery to consume it.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against npm registry, Recharts docs, existing codebase. Zero new dependencies confirmed. |
| Features | HIGH | Cross-referenced against Power BI, Metabase, Looker, Databricks. Feature taxonomy grounded in competitive analysis. |
| Architecture | HIGH | Based on complete codebase analysis of section registry, blueprint schema, renderer pipeline. Patterns proven in v1.1/v1.2. |
| Pitfalls | HIGH | Grounded in specific code locations (line numbers), verified against TypeScript/Zod issue trackers, codebase measurements (file sizes, import counts). |

**Overall confidence:** HIGH

### Gaps to Address

- **Chart taxonomy finalization:** Research identifies two valid approaches (keep `bar-line-chart` overloaded vs introduce category-based chart types). The recommendation leans toward keeping existing patterns and adding only 1-2 new section types, but the final taxonomy should be validated with concrete Zod schema prototypes in Phase 1 planning.
- **Migration safety for client data:** The `financeiro-conta-azul` blueprint is the only production data. A snapshot test must be written before any schema change. The current `loadBlueprint()` write-back-immediately pattern needs a safety check (validate before writing) -- this is not a research gap but a required implementation task.
- **Wireframe palette specifics:** "Softer palette" is a design decision, not a technical one. The `--wf-*` token system supports any palette values. The specific color choices need design input during Phase 3.
- **Composed chart complexity:** The multi-series composed chart (multiple bar + line + area series in one chart) has a complex config schema. Whether this ships in v1.3 or defers to v1.4 depends on Phase 2 velocity.

## Sources

### Primary (HIGH confidence)
- Recharts API Documentation -- chart container inventory, RadialBarChart/Sankey/SunburstChart availability
- npm registry (`recharts versions`) -- 2.15.4 confirmed as latest stable 2.x
- Recharts 3.0 Migration Guide -- breaking changes documented, exclusion justified
- FXL Core codebase analysis -- section-registry.tsx, blueprint-schema.ts, blueprint.ts, blueprint-migrations.ts, BlueprintRenderer.tsx, ChartRenderer.tsx, WireframeViewer.tsx, ComponentGallery.tsx (all files directly inspected)

### Secondary (MEDIUM confidence)
- Metabase Visualization Overview and Dashboard Filters -- chart type taxonomy, filter widget patterns
- Power BI Charts & Visualizations -- competitive chart coverage analysis
- Databricks Dashboard Filter Types -- filter widget pattern validation
- shadcn/ui Sidebar and Radial Charts -- architecture patterns for sidebar and gauge charts
- TypeScript issue #42522 -- discriminated union performance at scale
- Dashboard Design Best Practices -- layout and sidebar patterns from DataCamp, Yellowfin, Justinmind

### Tertiary (LOW confidence, needs validation)
- Estimated compile time impact of 40+ discriminated union members -- based on reported issues, not measured on this codebase
- Bundle size estimates for 26+ chart components -- theoretical, not profiled

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
