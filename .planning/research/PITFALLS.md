# Pitfalls Research

**Domain:** Wireframe builder expansion -- configurable layout elements (sidebar/header/filter bar in blueprint schema), massive component repertoire expansion (20+ chart types, tables, KPIs), gallery reorganization
**Researched:** 2026-03-10
**Confidence:** HIGH (grounded in codebase analysis of section-registry.tsx, blueprint-schema.ts, blueprint.ts, blueprint-migrations.ts, BlueprintRenderer.tsx, ChartRenderer.tsx, WireframeViewer.tsx, ComponentGallery.tsx, PropertyPanel.tsx; verified against Zod v4 docs, TypeScript union performance reports, Recharts bundle analysis)

## Critical Pitfalls

### Pitfall 1: Zod Discriminated Union Becomes Unmaintainable at 40+ Types

**What goes wrong:**
The current `BlueprintSectionSchema` is a `z.discriminatedUnion('type', [...])` with 21 members (20 non-recursive + 1 recursive chart-grid). Adding 20+ new section types (sidebar-nav, header-config, filter-bar-config, plus 15+ chart variants, new table types, new KPI types) pushes this to 40+ members. Three things break simultaneously:

1. **TypeScript compile time degrades.** Discriminated unions with 40+ members force the TypeScript compiler into pairwise comparison to eliminate redundant members. This is O(n^2) in the worst case. Known TypeScript issue #42522 documents "unexpected slowness initializing large array with discriminated union constituents." The current `tsc --noEmit` gate (which must pass with zero errors) could slow from ~3 seconds to 10+ seconds, frustrating development cycles.

2. **The section registry file becomes a 1000+ line single-file import graph.** Currently section-registry.tsx has 97 lines of imports (14 renderers, 21 property forms, 20 schema imports) and 547 total lines. Doubling the section count means ~200 import lines and ~1100 total lines. Every new section type requires touching 6 coordination points: (a) Zod schema in blueprint-schema.ts, (b) TypeScript type in blueprint.ts, (c) union member in both files, (d) renderer component, (e) property form component, (f) registry entry. Missing any one creates a runtime crash (registry lookup fails) or a Zod validation rejection (unknown discriminator value). The existing test `section-registry.test.ts` catches mismatches, but only after the developer remembers to update the ALL_SECTION_TYPES array.

3. **The `z.ZodType` annotation on BlueprintSectionSchema breaks type inference.** The current schema uses `export const BlueprintSectionSchema: z.ZodType = ...` to break the circular reference with chart-grid's lazy self-reference. The `z.ZodType` annotation erases the discriminated union's type information, meaning TypeScript cannot narrow section types after `safeParse()`. This is tolerable at 21 types where the developer knows the shape. At 40+ types, losing discriminated union narrowing makes every downstream consumer write manual type guards.

**Why it happens:**
The section registry was designed for ~15 types and extended to 21. The architecture works well at that scale. But the fundamental pattern -- a single discriminated union, a single registry object, all imports in one file -- does not scale linearly. Each new type adds import overhead, coordination overhead, and TypeScript compiler overhead. The 6-point coordination (schema + type + union + renderer + form + registry) is the real maintenance burden.

**How to avoid:**
1. **Split schemas by category.** Instead of one flat `nonRecursiveSections` array with 40+ members, create category-level sub-unions: `ChartSectionSchema`, `TableSectionSchema`, `KpiSectionSchema`, `LayoutSectionSchema`, `FilterSectionSchema`. Then compose: `BlueprintSectionSchema = z.discriminatedUnion('type', [...ChartSchemas, ...TableSchemas, ...KpiSchemas, ...LayoutSchemas, ...FilterSchemas])`. This keeps each category manageable (~8-10 members) and allows per-category ownership.

2. **Use a registration function instead of a single object literal.** Replace the giant `SECTION_REGISTRY: Record<...> = { ... }` with:
   ```typescript
   const registry = new Map<string, SectionRegistration>()
   export function registerSection(type: string, reg: SectionRegistration) { registry.set(type, reg) }
   ```
   Each category file registers its own sections. The registry file becomes a coordinator that imports category modules, not 40+ individual components.

3. **Lazy-load renderers and property forms.** The section registry currently eagerly imports ALL renderers and ALL property forms. At 40+ types, this means 80+ component imports loaded on every page, even the component gallery. Use `React.lazy()` for renderers and property forms:
   ```typescript
   renderer: lazy(() => import('../components/sections/ChartRenderer'))
   ```
   The registry stores lazy references; the actual component code loads only when that section type is encountered in a blueprint.

4. **Add a code generator or template.** Create a script that generates the boilerplate when adding a new section type: schema, type, renderer stub, form stub, registry entry, test entry. This reduces the 6-point coordination to a single command.

5. **Keep the existing test that validates registry completeness**, but enhance it: automatically derive ALL_SECTION_TYPES from the BlueprintSection union type at compile time (using a mapped type or const array), rather than maintaining a separate hand-written list.

**Warning signs:**
- `tsc --noEmit` takes noticeably longer after adding 5+ new types
- Blueprint validation errors in production because a new type was added to the TypeScript union but not to the Zod discriminated union (or vice versa)
- Developers avoid adding new section types because the "add a section type" process involves touching 6+ files
- The section-registry.tsx file exceeds 1000 lines
- Code review misses that a defaultProps function returns data that fails Zod validation (the round-trip test catches this, but only if the test list is updated)

**Phase to address:**
Phase 1 (Schema/registry refactoring) -- restructure the registry and schema BEFORE adding new types. Adding 20+ types to the current flat structure and then refactoring is much harder than refactoring first.

---

### Pitfall 2: Sidebar/Header/Filter Bar as Blueprint Schema Items Creates a Layout vs Content Conceptual Confusion

**What goes wrong:**
The current blueprint schema treats everything as "sections within a screen." Screens contain `sections: BlueprintSection[]` (content blocks in a vertically scrolling area) and `rows: ScreenRow[]` (same content in a grid layout). Adding sidebar, header, and filter bar as "configurable items in the blueprint" creates an architectural ambiguity: are these layout-level elements or section-level elements?

If sidebar/header/filter are modeled as regular `BlueprintSection` members (e.g., `type: 'sidebar-nav'` alongside `type: 'kpi-grid'`), they end up in the `sections` or `rows` array -- which means they can be drag-reordered into the middle of content, deleted accidentally, or placed inside a `chart-grid`. The BlueprintRenderer renders sections vertically inside the scrollable content area. A sidebar does not belong there -- it belongs outside the scroll area, in the fixed layout shell.

If sidebar/header/filter are modeled as top-level BlueprintScreen properties (e.g., `screen.sidebar: SidebarConfig`), they are semantically correct but break the "sections are the building blocks" mental model. The visual editor's AddSectionButton and ComponentPicker would not offer them. The PropertyPanel (which dispatches forms by section type) would need a separate dispatch path for layout-level properties.

The worst outcome is a hybrid: sidebar lives at screen level, but its nav items reference screen IDs (creating a circular dependency), and filter bar lives in the sections array but is always rendered at the top (special-cased in BlueprintRenderer to extract and hoist it). This hybrid approach is the most likely to emerge organically and the hardest to maintain.

**Why it happens:**
The existing blueprint schema was designed for dashboard CONTENT -- KPIs, charts, tables arranged vertically. Layout chrome (sidebar, header) was hardcoded in WireframeViewer.tsx (lines 683-765). Making layout configurable requires extending the schema's conceptual scope from "what content is on this screen" to "what does the entire dashboard look like." This is a different level of abstraction. Mixing abstraction levels in one flat union is the root cause.

**How to avoid:**
1. **Model layout elements at the BlueprintConfig level, NOT the BlueprintSection level.** Add a `layout` property to `BlueprintConfig`:
   ```typescript
   type BlueprintConfig = {
     slug: string
     label: string
     schemaVersion: number
     layout: {
       sidebar?: SidebarConfig   // nav items, logo position, collapse behavior
       header?: HeaderConfig     // title source, period selector, actions
       filterBar?: FilterBarConfig // global filters above content
     }
     screens: BlueprintScreen[]
   }
   ```
   This keeps layout config separate from content sections. The SidebarConfig contains references to screen IDs (navigation), not screen content.

2. **The sidebar config should derive navigation from screens, not duplicate it.** Do NOT store a separate list of nav items that can diverge from the screens array. Instead, sidebar config specifies display options (icon source, grouping, collapse behavior) and the actual nav items are derived from `config.screens.map(s => ({ id: s.id, title: s.title, icon: s.icon }))` at render time.

3. **Filter bar has two scopes: global (layout-level) and per-screen (section-level).** The existing `screen.filters` array already handles per-screen filters. The new filter bar config should handle GLOBAL filters (date range that applies to all screens). Keep these separate: `layout.filterBar` for globals, `screen.filters` for per-screen.

4. **The visual editor needs a separate editing surface for layout.** Do not try to edit sidebar/header through the same PropertyPanel + section selection flow. Add a "Layout Settings" panel (or tab) that edits `config.layout` properties. This is a clear separation that avoids the hybrid trap.

5. **Zod validation: layout config schemas are separate from BlueprintSectionSchema.** They are never members of the discriminated union. They have their own schemas composed into BlueprintConfigSchema.

**Warning signs:**
- A `type: 'sidebar-nav'` appears in the `nonRecursiveSections` array in blueprint-schema.ts
- The BlueprintRenderer has special-case code like `if (section.type === 'sidebar-nav') return null` to skip layout sections
- Sidebar nav items get out of sync with the screens array
- Drag-reorder lets a user drag the sidebar into the middle of a KPI grid
- The PropertyPanel has a growing list of `if (section.type === 'sidebar-nav' || section.type === 'header-config') { /* different edit flow */ }`

**Phase to address:**
Phase 1 (Schema design) -- the schema extension for layout elements must be designed BEFORE any implementation. Getting this wrong means a schema migration later that rewrites every stored blueprint.

---

### Pitfall 3: Blueprint Schema Migration Breaks Existing Client Data in Supabase

**What goes wrong:**
The current `CURRENT_SCHEMA_VERSION = 1` with a single migrator (v0 -> v1). Adding layout config, new section types, and potentially restructuring screens requires bumping to v2. The migration must:
1. Add `layout: {}` to existing configs that lack it
2. Keep existing `sections` and `rows` arrays intact
3. Not invalidate any existing section type data

The danger: the `migrateBlueprint()` function runs the migration chain AND validates via `BlueprintConfigSchema.safeParse()`. If the v2 schema adds `layout` as a REQUIRED field and the migrator forgets to provide a default, every existing blueprint fails validation after migration. The `loadBlueprint()` function returns `null` on validation failure, which shows "Nenhum blueprint encontrado" -- the user's data appears to have vanished.

Worse: the lazy migration in `blueprint-store.ts` (loadBlueprint, lines 41-63) writes the migrated data back to Supabase immediately. If the migration produces invalid data and writes it back, the ORIGINAL valid data is overwritten with corrupted data. There is no rollback mechanism.

The existing pilot client `financeiro-conta-azul` has 10 screens with complex content. A botched migration destroys this data.

**Why it happens:**
The migration system was designed for the simple v0->v1 bootstrap case (just adding `schemaVersion: 1`). It does not have: backup before migration, dry-run validation, rollback capability, or migration testing with real data. The "validate after migrate" approach catches structural errors but the write-back-immediately behavior turns validation failures into data corruption.

**How to avoid:**
1. **Never write migrated data back to DB before confirming the migration produces valid data.** Change `loadBlueprint()` to: (a) read raw data, (b) migrate in memory, (c) validate, (d) if valid, write back, (e) if invalid, return the PRE-migration data with a warning, do NOT write back.

2. **Make ALL new schema fields OPTIONAL with sensible defaults.** The `layout` field should be `layout: z.object({...}).optional()`. The BlueprintRenderer defaults to the current hardcoded layout when `layout` is undefined. This means v1 data is valid v2 data without any transformation -- the migrator only needs to set `schemaVersion: 2`.

3. **Write the migration with a snapshot test.** Take the actual `financeiro-conta-azul` blueprint JSON, run the v1->v2 migrator on it, and assert the output matches expected structure. Check this test into the codebase. This catches migration bugs before they hit production data.

4. **Add a backup step.** Before writing migrated data back to DB, store the pre-migration JSON in a `config_backup` column or a separate `blueprint_config_history` table. This allows manual recovery if migration corrupts data.

5. **Test the migration on a Supabase branch or local instance BEFORE deploying to production.** The `make migrate` target handles SQL migrations. Add a similar workflow for blueprint data migrations: export current data, run migration locally, validate, then deploy the code.

**Warning signs:**
- After deploying new code, wireframe viewer shows "Nenhum blueprint encontrado" for existing clients
- The Supabase `blueprint_configs` table shows `config` column with truncated or malformed JSON
- `migrateBlueprint()` throws but the error is caught and returns null silently (the catch block in loadBlueprint line 58-60)
- New fields added to BlueprintConfigSchema as required (not optional)

**Phase to address:**
Phase 1 (Schema design + migration) -- write migration code with snapshot tests BEFORE changing the schema. Deploy schema changes and migration together in a single release. Never deploy schema validation changes before the migration code is ready.

---

### Pitfall 4: ChartRenderer Switch Statement Explosion and Sub-Variant Confusion

**What goes wrong:**
The current `ChartRenderer.tsx` already has a nested switch: outer switch on `section.type` (4 chart types), inner switch on `section.chartType` (8 sub-variants for bar-line-chart: bar, line, bar-line, radar, treemap, funnel, scatter, area). Adding 20+ new chart types means either:

(a) Adding 15+ more `chartType` values to the `bar-line-chart` section's enum, making the single `BarLineChartSectionSchema` responsible for radically different chart types (a treemap has nothing in common with a bar chart beyond being "a chart"). The Zod schema for `bar-line-chart` already has fields that only apply to some sub-variants (`categories` is meaningless for treemap, `xLabel`/`yLabel` are meaningless for funnel). At 20+ sub-variants, most fields are optional/irrelevant for most types -- the schema becomes a "god object" that validates nothing useful.

(b) Promoting each chart type to its own section type (`type: 'radar-chart'`, `type: 'treemap-chart'`, etc.). This is cleaner per-type but adds 15+ new entries to the discriminated union, property form roster, and registry -- compounding Pitfall 1.

The worst outcome is a mix: some chart variants stay as `chartType` sub-variants under `bar-line-chart`, while new ones get their own section types. This makes it impossible to answer "where is the radar chart defined?" without checking both paths.

**Why it happens:**
The original design collapsed all Recharts chart types under `bar-line-chart` to keep the discriminated union small. This was a reasonable trade-off at 3 sub-variants (bar, line, bar-line). At 5+ sub-variants (v1.1 added radar, treemap, funnel, scatter, area), the pattern was already strained. At 20+ total chart types, it breaks down.

**How to avoid:**
1. **Use a two-level dispatch: category + variant.** Define chart categories: `cartesian` (bar, line, area, bar-line), `distribution` (donut, pie, treemap, sunburst), `flow` (funnel, sankey, waterfall), `statistical` (scatter, bubble, radar, heatmap), `comparison` (pareto, grouped-bar, stacked-bar). Each category has its own section type and Zod schema with category-appropriate fields:
   ```typescript
   type CartesianChartSection = {
     type: 'cartesian-chart'
     variant: 'bar' | 'line' | 'area' | 'bar-line' | 'stacked-bar' | 'grouped-bar'
     title: string
     categories?: string[]
     xLabel?: string
     yLabel?: string
   }
   type DistributionChartSection = {
     type: 'distribution-chart'
     variant: 'donut' | 'pie' | 'treemap' | 'sunburst'
     title: string
     slices?: { label: string; value: number }[]
   }
   ```
   This keeps the discriminated union at ~10 section types (categories) while supporting 20+ visual variants.

2. **The variant dispatch happens inside a category renderer**, not in a giant switch. `CartesianChartRenderer` handles bar/line/area; `DistributionChartRenderer` handles donut/pie/treemap. Each renderer is focused and testable.

3. **Property forms follow the same pattern.** `CartesianChartForm` shows fields relevant to all cartesian charts (title, x/y labels, categories) plus variant-specific fields conditionally rendered based on `section.variant`.

4. **This is a BREAKING CHANGE to existing data.** Existing `type: 'bar-line-chart'` with `chartType: 'radar'` must migrate to `type: 'statistical-chart'` with `variant: 'radar'`. This is a schema v2 migration task. Plan it with Pitfall 3's migration safety in mind.

5. **If the breaking change is too risky, keep existing types frozen and add new types as separate entries.** Existing 5 section types (bar-line-chart, donut-chart, waterfall-chart, pareto-chart + chart-grid) remain as-is. New chart types get new section types. This avoids migration risk at the cost of some inconsistency.

**Warning signs:**
- `BarLineChartSectionSchema` has 15+ optional fields, most of which are irrelevant for any given chartType
- The ChartRenderer switch statement exceeds 100 lines
- A property form for `bar-line-chart` shows 20 fields, of which only 3 apply to the selected chartType
- Developers add a new chart type but forget to add its specific fields to the Zod schema, so the data silently passes validation but renders incorrectly

**Phase to address:**
Phase 1 (Schema design) -- decide the chart taxonomy before implementation. This directly affects the discriminated union structure, the migration, and every renderer/form downstream.

---

### Pitfall 5: Component Gallery Becomes Unmaintainable with 40+ Components and Hardcoded Mock Data

**What goes wrong:**
The current `ComponentGallery.tsx` is a 650-line file with hardcoded category arrays, manually imported components, and inline render functions for each preview. The mock data lives in a separate `galleryMockData.ts` file. Adding 20+ new components means:

1. **The gallery file grows to 1500+ lines** with each new component requiring: an import, a mock data definition, a potentially stateful preview wrapper function (like `BarLineChartPreview`, `WaterfallChartPreview`), and a category entry with props/specHref/render function.

2. **Mock data explodes.** Each new chart type needs realistic mock data (labels, values, colors). The `galleryMockData.ts` file, already substantial, must provide data for 40+ component variants. Mock data maintenance becomes a significant effort -- any schema change to a component requires updating its mock data.

3. **The gallery categories diverge from the section registry categories.** The gallery has 5 hardcoded categories (Cards, Graficos, Tabelas, Layout, Inputs). The section registry has 7 categories (KPIs, Graficos, Tabelas, Inputs, Layout, Formularios, Filtros, Metricas). These are already misaligned. Adding 20+ components with new categories widens the gap.

4. **Gallery imports create a massive initial bundle.** Every component is eagerly imported at the top of ComponentGallery.tsx. With 40+ components, opening the gallery page downloads all wireframe components, all their Recharts dependencies, and all mock data -- even if the user only wants to see the "Cards" category.

**Why it happens:**
The gallery was built as a catalog of existing components (22 block specs). It was designed for browsing, not for being the source of truth for the component system. As the component count doubles, the gallery's "flat list of imports" pattern does not scale.

**How to avoid:**
1. **Generate gallery entries from the section registry.** The `SECTION_REGISTRY` already has `catalogEntry` (type, label, description, icon, category) and `defaultProps()`. The gallery should consume the registry instead of maintaining a parallel catalog. Each registry entry provides its own preview data via `defaultProps()`, eliminating the need for separate mock data.

2. **Lazy-load gallery sections.** Use `React.lazy()` for each category's component previews. When the user selects "Graficos," only chart components load. This avoids the 40+ component bundle on initial gallery load.

3. **Align gallery categories with registry categories.** The `getCatalog()` function already groups entries by category. Use it directly: `const categories = getCatalog()`. This ensures gallery categories always match registry categories.

4. **Move preview wrappers (stateful prop toggles) into the component definitions.** Instead of `BarLineChartPreview` living in the gallery file, create a `__preview.tsx` file co-located with each renderer. The gallery imports only the lazy preview, not the full component implementation.

5. **Use the component's `defaultProps()` for base preview data, with optional overrides for richer demos.** This eliminates the mock data file as a maintenance burden.

**Warning signs:**
- ComponentGallery.tsx exceeds 1000 lines
- Adding a new component to the gallery is a "chore" that gets skipped (components exist in the registry but not the gallery)
- The gallery shows stale or incorrect mock data for a component
- The gallery page takes 3+ seconds to load on first visit (bundle size from eager imports)
- Gallery categories do not match the ComponentPicker categories (different grouping/ordering)

**Phase to address:**
Phase 2 or 3 (Gallery reorganization) -- refactor the gallery to consume the section registry BEFORE adding 20+ new components. Adding them to the current flat structure and then refactoring means touching every entry twice.

---

### Pitfall 6: Property Panel Forms Do Not Scale -- Each New Section Type Needs a Separate Form Component

**What goes wrong:**
Every section type has a dedicated property form component (`KpiGridForm.tsx`, `BarLineChartForm.tsx`, `DonutChartForm.tsx`, etc.). Currently there are 21 form files. Adding 20+ new section types means 20+ new form files, each reimplementing similar patterns: controlled inputs for title, dimensions, and type-specific arrays/objects. Common patterns (title input, height picker, column count selector) are duplicated across forms with slight variations.

The cost is not just in writing the forms but in maintaining consistency. If the "title" field's styling or behavior changes, it must be updated in 40+ form files. If a new "description" field is added to the base section interface, every form must independently add it.

**Why it happens:**
The PropertyPanel dispatches to forms by section type using `getPropertyForm(section.type)`. Each form is a standalone component with full control over its UI. There is no shared form infrastructure -- no field components, no form builder, no base form class.

**How to avoid:**
1. **Create shared field components for common properties.** Extract: `TitleField`, `HeightField`, `ColumnCountField`, `ArrayEditor<T>` (for items/rows/slices arrays), `EnumSelector<T>` (for chartType/variant/filterType). Each form composes these shared fields, reducing per-form code from ~100 lines to ~30 lines.

2. **Create a `BasePropertyForm` wrapper that provides common fields.** Every section has a title (or equivalent). The base form renders the title input, then delegates to a type-specific "extra fields" component. This ensures consistency and reduces duplication.

3. **For chart variants with the same field structure, share a single form.** If `CartesianChartSection` covers bar/line/area/bar-line, one `CartesianChartForm` handles all variants. The form shows/hides variant-specific fields based on the selected variant.

4. **Use form state management (controlled form with section + onChange pattern is fine, but consider React Hook Form for complex forms with validation).** The current pattern works but each form reimplements change handling. A standard approach reduces bugs.

**Warning signs:**
- A new section type is added but the property form is a copy-paste of an existing form with minor changes
- Title field styling is inconsistent across different property forms
- A bug fix in one form (e.g., number input not accepting decimals) needs to be replicated in 20+ form files
- Developers add a new section type but skip the property form, resulting in an empty panel when the section is selected in the editor

**Phase to address:**
Phase 2 (Implementation of new components) -- extract shared field components BEFORE building 20+ new forms. Building them after means refactoring every existing form.

---

### Pitfall 7: Wireframe Viewer Layout Restructuring Breaks Fixed Sidebar + Scroll + z-index Stack

**What goes wrong:**
The current WireframeViewer.tsx has the sidebar as a `position: fixed; left: 0; top: 0; height: 100vh` element, with the main content area using `marginLeft: 240px`. The v1.3 goal is "Header do wireframe acima de tudo (inclusive sidebar)." This means the header must span the full viewport width (including over the sidebar area) with a higher z-index. Currently the header is inside the main content area, offset by the sidebar's 240px. Moving it above the sidebar requires:

1. Pulling the header OUT of the `main` element to a viewport-level position
2. Giving the header a z-index higher than the sidebar (sidebar has no explicit z-index, header currently has z-index: 10)
3. Pushing the sidebar's top offset down by the header height
4. Pushing the main content area's top offset down by the header height

This creates a cascading CSS change that touches the entire wireframe layout. Common failure modes:
- The AdminToolbar (edit mode controls, z-index not set) renders between header and sidebar, creating a visual gap
- The PropertyPanel (Sheet overlay, z-index: 50) opens under the new full-width header
- Comment overlays and modals (fixed position, various z-indices) appear under or above the wrong elements
- The WireframeFilterBar renders at the wrong vertical position (it is currently the first child of the scrollable content area)

**Why it happens:**
The wireframe viewer has 4+ overlapping positioning contexts: fixed sidebar, sticky header, absolutely positioned AdminToolbar, Sheet-based PropertyPanel, fixed-position CommentOverlay, fixed-position floating comment button. Each has its own z-index and positioning strategy. Changing the header's scope from "inside main" to "above everything" requires re-evaluating every z-index in the stack.

**How to avoid:**
1. **Define a z-index scale BEFORE restructuring.** Document and commit:
   ```
   z-0:   Content (sections, charts)
   z-10:  Wireframe header (full-width, above sidebar)
   z-20:  AdminToolbar (edit mode bar, below header)
   z-30:  Sidebar (below modals, above content)
   z-40:  Property panel overlay
   z-50:  Comment overlay / drawers
   z-60:  Modals (share, conflict, unsaved changes)
   z-70:  Toast notifications
   ```

2. **Use a layout shell component.** Instead of WireframeViewer.tsx managing all 4 positioning contexts inline (currently ~280 lines of JSX), extract: `WireframeShell` (manages sidebar + header + content area positioning), `WireframeContent` (scrollable content with BlueprintRenderer), `WireframeOverlays` (all overlay/modal components). The shell owns the z-index stack.

3. **The header "above sidebar" pattern requires the header at the top of the DOM, outside both sidebar and main.** The layout structure should be:
   ```
   <div class="h-screen flex flex-col">
     <Header z-10 full-width />           <!-- above everything -->
     <div class="flex flex-1 overflow-hidden">
       <Sidebar z-0 />                    <!-- below header -->
       <main class="flex-1 overflow-y-auto">
         <FilterBar />
         <BlueprintRenderer />
       </main>
     </div>
   </div>
   ```

4. **Test overlay stacking order explicitly.** After restructuring: open PropertyPanel (should overlay content but not header), open a Dialog (should overlay everything), trigger a toast (should be topmost). Test on the shared wireframe view (no AdminToolbar) and the authenticated view (with AdminToolbar).

**Warning signs:**
- The header appears behind the sidebar
- Clicking a section in edit mode opens the PropertyPanel but the panel appears under the header
- The floating comment button is hidden behind the sidebar or header
- The AdminToolbar's edit/save buttons are not clickable (hidden behind another element)
- The conflict or unsaved-changes modal appears behind other elements

**Phase to address:**
Phase 1 (Layout restructuring) -- fix the wireframe layout hierarchy BEFORE adding new components. All renderers and forms depend on the layout being stable.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Adding chartType sub-variants to bar-line-chart instead of separate section types | Avoids growing the discriminated union | God-object schema where most fields are irrelevant; giant switch in ChartRenderer | Never after 8+ sub-variants -- refactor to category-based types |
| Copy-pasting a property form for a new section type | Fast initial implementation | 40+ near-identical form files; inconsistent UX; bugs fixed in one form but not others | Acceptable for first 2-3 forms of a new category; then extract shared components |
| Skipping gallery entry when adding a section type | Saves time on the feature itself | Gallery diverges from registry; operators cannot preview all available components | Never -- gallery is the operator interface. If it is too painful, fix the gallery architecture first |
| Making new layout config fields required in Zod schema | Forces migration to provide the field | Existing data fails validation; lazy migration writes invalid data back to DB | Never for a field that has a sensible default. Use `.optional()` with `.default()` |
| Using `as unknown as ComponentType<SectionRendererProps>` type casts in registry | Avoids fixing renderer prop type mismatches | Type safety is bypassed; runtime crashes possible if prop shape changes | Acceptable short-term; track as debt, fix during registry refactoring |
| Hardcoding sidebar width (240px) in WireframeViewer | Simple layout math | Cannot make sidebar collapsible or configurable without touching multiple hardcoded values | Replace with CSS custom property `--wf-sidebar-width` when adding sidebar configurability |

## Integration Gotchas

Common mistakes when working with the existing system.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Zod v4 discriminatedUnion + new types | Adding a type to the TS union but not to the Zod union (or vice versa) | The round-trip test in section-registry.test.ts catches this. Always run tests before committing new types. |
| Blueprint store + schema migration | Deploying new Zod schema before migration code is ready | Deploy migration code FIRST (or simultaneously). Never have a window where new schema rejects old data. |
| Recharts + many chart components | Importing all chart types eagerly, inflating bundle | Use dynamic imports for chart components that are not on the initial viewport. Recharts components are individually importable. |
| Section registry + ComponentPicker | Adding a section to registry but not providing a meaningful `defaultProps()` | `defaultProps()` is what gets inserted when operator clicks "Add Section." If it fails Zod validation, the section cannot be added. |
| WireframeThemeProvider + new layout elements | New layout components (sidebar, header) not wrapped in WireframeThemeProvider | All wireframe layout chrome must render inside the theme provider to pick up `--wf-*` tokens. The provider is currently at the outermost div in WireframeViewer.tsx. |
| Supabase blueprint_configs + large JSON | Blueprint JSON exceeds PostgreSQL's JSONB index/query performance threshold | At 40+ section types and complex layout config, a single blueprint JSON could reach 100KB+. Monitor config size. Consider splitting screen data into separate rows if configs exceed 500KB. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Eager import of 40+ renderers + 40+ forms in section-registry.tsx | Gallery page and wireframe viewer load slowly; main bundle exceeds 500KB | Lazy-load renderers and forms via React.lazy() or dynamic import | At ~30 components with Recharts dependency per chart type |
| Recharts components re-render on parent state change | Charts flicker when editing unrelated sections; lag when typing in property forms | Use React.memo() on chart renderers; isolate chart state from form state | At 5+ charts on one screen with frequent property panel updates |
| `structuredClone(config)` on every edit mode entry | Deep clone of large blueprint config (100KB+) causes a visible pause | Use immutable update patterns (spread + replace) instead of full clone; or only clone the active screen | At 20+ screens with complex content per screen |
| BlueprintSectionSchema.safeParse() on every save | Zod validation of 40+ discriminated union at save time takes 50-200ms | Cache the parse result; only re-validate changed sections, not the full config | At configs with 100+ sections across all screens |
| Component gallery renders all 40+ components at once | Initial render takes 2+ seconds; scroll is janky with 40+ Recharts instances | Virtualize the gallery list; use IntersectionObserver to lazy-render previews | At 30+ component previews with live Recharts charts |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Blueprint JSON stored without size limit in Supabase | DoS via crafted mega-blueprint that OOMs the browser on load | Add a max config size check in saveBlueprint() (e.g., JSON.stringify(config).length < 1MB) |
| No validation of section type values from DB | A tampered blueprint with unknown section types crashes the registry lookup | getRenderer() and getPropertyForm() should gracefully handle unknown types (return a fallback "unknown section" renderer) |
| Sidebar nav items could contain script injection via title field | XSS if title is rendered with dangerouslySetInnerHTML | Never use dangerouslySetInnerHTML for user-editable fields. React's default escaping handles this, but verify no raw HTML insertion path exists |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| ComponentPicker shows 40+ items in a flat list | Operator cannot find the component they want; abandoned edit | Group by category with collapsible sections; add search/filter; show recently used |
| Property forms for complex components show 20+ fields | Operator is overwhelmed; fills only title and leaves defaults | Group fields into sections: "Basic" (title, variant), "Dimensions" (height, columns), "Data" (items, slices). Collapse non-essential sections by default |
| Gallery page loads all 40+ components eagerly | 3+ second load time; operator navigates away | Category-based lazy loading; show skeleton placeholders; default to first category not "all" |
| New chart types have no preview data in gallery | Operator sees an empty box and does not understand the chart type | Every new chart type MUST have mock data in its defaultProps() that produces a meaningful visual |
| Layout editing (sidebar/header config) mixed with content editing | Operator accidentally changes sidebar while trying to edit a chart | Separate "Layout" and "Content" editing modes, or use tabs in the editor toolbar |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **New section type:** Has Zod schema, TS type, union member, renderer, property form, registry entry, test entry, gallery entry, AND defaultProps that passes Zod validation. Missing any one = partial implementation that fails at runtime.
- [ ] **Chart variant:** Renders with mock data, renders with real blueprint data from DB, handles compareMode correctly, handles chartColors branding correctly, has correct property form with variant-specific fields.
- [ ] **Layout config (sidebar/header/filter):** Works on authenticated view (with AdminToolbar), works on shared view (without AdminToolbar), works with branding overrides, works in dark mode, works when config.layout is undefined (backward compat).
- [ ] **Schema migration v1->v2:** Tested with actual financeiro-conta-azul data snapshot. Pre-migration data is backed up. Optional fields have defaults. schemaVersion is bumped.
- [ ] **Gallery reorganization:** Categories match section registry getCatalog(). All registry entries have gallery representation. Gallery does not eagerly load all components. Each preview has meaningful mock data.
- [ ] **Property form:** All editable fields persist to blueprint JSON. Changing a field and saving actually produces the visual change in the renderer. Form handles undefined/optional fields gracefully (no crash on missing props).
- [ ] **Wireframe palette softening:** Chart components use `--wf-*` tokens, not hardcoded colors. Palette changes in wireframe-tokens.css cascade to all chart fills and strokes. Branding overrides still work after palette change.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Discriminated union too large, tsc slow (Pitfall 1) | MEDIUM | Split into category sub-unions. Requires touching blueprint-schema.ts and every consumer of BlueprintSectionSchema. One-time refactoring effort. |
| Layout elements in wrong schema location (Pitfall 2) | HIGH | Schema v3 migration to move sidebar/header from sections array to config.layout. Must migrate ALL stored blueprints. Much harder than getting it right initially. |
| Migration corrupts blueprint data (Pitfall 3) | HIGH if no backup, LOW if backed up | Restore from config_backup column or blueprint_config_history table. If no backup exists: Supabase point-in-time recovery (last 7 days on Pro plan). |
| Chart god-object schema (Pitfall 4) | MEDIUM | Introduce category-based chart types as new section types. Keep old types frozen for backward compat. Deprecate over time. |
| Gallery unmaintainable (Pitfall 5) | LOW | Refactor gallery to consume section registry. Can be done incrementally (one category at a time). |
| Property forms inconsistent (Pitfall 6) | MEDIUM | Extract shared field components. Refactor existing forms one at a time. Each form is independent, so risk is contained. |
| Z-index stacking broken (Pitfall 7) | LOW | Define z-index scale. Update individual elements. Each element's z-index is independent, so changes are contained. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Registry/union scaling (Pitfall 1) | Phase 1 -- Schema/registry refactoring | Registry accepts 40+ types without tsc degradation. Adding a new type touches max 3 files (schema category, renderer, form). |
| Layout vs content confusion (Pitfall 2) | Phase 1 -- Schema design | sidebar/header/filter live at config.layout level, NOT in sections array. BlueprintRenderer never encounters a layout section type. |
| Migration data corruption (Pitfall 3) | Phase 1 -- Schema migration | financeiro-conta-azul snapshot test passes. loadBlueprint returns valid data for both v1 and v2 configs. No data loss. |
| Chart type explosion (Pitfall 4) | Phase 1 -- Schema design | Chart types organized into categories. No section type has more than 8 sub-variants. ChartRenderer switch has max 5 cases per category. |
| Gallery unmaintainable (Pitfall 5) | Phase 2/3 -- Gallery reorganization | Gallery categories derived from getCatalog(). Adding a registry entry automatically appears in gallery. Gallery page loads in under 2 seconds. |
| Form duplication (Pitfall 6) | Phase 2 -- Component implementation | Shared field components exist. New form is under 50 lines. Title styling is consistent across all forms. |
| Z-index stacking (Pitfall 7) | Phase 1 -- Layout restructuring | z-index scale documented. Header renders above sidebar. PropertyPanel renders above content but below modals. All overlays accessible. |

## Sources

- FXL Core codebase: `tools/wireframe-builder/lib/section-registry.tsx` -- 21-entry registry with 97 import lines, 547 total lines, `as unknown as ComponentType` casts
- FXL Core codebase: `tools/wireframe-builder/lib/blueprint-schema.ts` -- Zod v4 discriminated union with `z.ZodType` annotation, 20 non-recursive + 1 recursive schema
- FXL Core codebase: `tools/wireframe-builder/types/blueprint.ts` -- 21-member discriminated union type, BlueprintConfig/Screen/Section hierarchy
- FXL Core codebase: `tools/wireframe-builder/lib/blueprint-migrations.ts` -- CURRENT_SCHEMA_VERSION=1, write-back-immediately pattern, no backup
- FXL Core codebase: `tools/wireframe-builder/lib/blueprint-store.ts` -- loadBlueprint with lazy migration and safeParse gate, saveBlueprint with optimistic locking
- FXL Core codebase: `tools/wireframe-builder/components/sections/ChartRenderer.tsx` -- nested switch on type then chartType, 8 sub-variants
- FXL Core codebase: `tools/wireframe-builder/components/BlueprintRenderer.tsx` -- row-based rendering with DndContext, no layout-level awareness
- FXL Core codebase: `src/pages/clients/WireframeViewer.tsx` -- 945 lines, fixed sidebar at 240px, inline styles for layout isolation, 4+ z-index layers
- FXL Core codebase: `src/pages/tools/ComponentGallery.tsx` -- 650 lines, 5 hardcoded categories, eager imports, separate mock data file
- FXL Core codebase: `tools/wireframe-builder/lib/section-registry.test.ts` -- ALL_SECTION_TYPES hand-maintained list, round-trip Zod validation test
- [TypeScript issue #42522](https://github.com/microsoft/TypeScript/issues/42522) -- discriminated union initialization slowness
- [TypeScript issue #47481](https://github.com/microsoft/TypeScript/issues/47481) -- poor conditional type performance with large string literal unions
- [Zod issue #2106](https://github.com/colinhacks/zod/issues/2106) -- discriminatedUnion deprecation discussion (z.switch replacement)
- [Zod v4 migration guide](https://zod.dev/v4/changelog) -- discriminatedUnion still supported in v4
- [Recharts bundle size issue #3697](https://github.com/recharts/recharts/issues/3697) -- large bundle size concerns
- [Recharts performance guide](https://recharts.github.io/en-US/guide/performance/) -- isolation patterns for multi-chart pages
- [shadcn/ui sidebar overlap issue #5636](https://github.com/shadcn-ui/ui/discussions/5636) -- sidebar covering header z-index problems
- [Scaling React Dashboards: Component Composition (2025)](https://medium.com/@connect.hashblock/scaling-react-dashboards-component-composition-for-large-data-apps-cfe34daea275) -- composition patterns for large component systems

---
*Pitfalls research for: v1.3 Builder & Components -- wireframe builder expansion with configurable layout, 20+ chart types, gallery reorganization*
*Researched: 2026-03-10*
