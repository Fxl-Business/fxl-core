# Architecture Research: v1.3 Builder & Components Integration

**Domain:** Wireframe builder expansion (sidebar/header/filter as blueprint items, 20+ chart types, gallery reorganization)
**Researched:** 2026-03-10
**Confidence:** HIGH (based on complete codebase analysis of existing section registry, BlueprintConfig schema, renderer pipeline, and component gallery)

## System Overview: Current Architecture

```
BlueprintConfig (Supabase DB)
    |
    v
BlueprintScreen[] -----> WireframeViewer (page-level)
    |                         |
    |                    +----|----+----------+
    |                    |         |          |
    |               AdminToolbar  WireframeHeader  Sidebar (hardcoded aside)
    |                              (hardcoded)      (ScreenManager)
    |
    v
ScreenRow[] (id + GridLayout + sections[])
    |
    v
BlueprintRenderer -----> DndContext + SortableContext
    |                         |
    |                    WireframeFilterBar (conditional, from screen.filters)
    |
    v
SectionRenderer -----> SECTION_REGISTRY[type].renderer
    |                         |
    |                    ChartRenderer (dispatches chartType sub-variants)
    |                    TableRenderer
    |                    InputRenderer
    |                    ...14 other renderers
    v
PropertyPanel -----> SECTION_REGISTRY[type].propertyForm
```

### Current Component Responsibilities

| Component | Responsibility | Current Implementation |
|-----------|----------------|------------------------|
| `WireframeViewer` | Page-level orchestrator | Hardcodes sidebar `<aside>`, `WireframeHeader`, `AdminToolbar` layout |
| `BlueprintRenderer` | Renders ScreenRow grid + sections | Receives `screen` prop, shows `WireframeFilterBar` inline if filters exist |
| `SectionRenderer` | Dispatches to correct renderer via registry | Lookup `SECTION_REGISTRY[type].renderer`, passes through props |
| `ChartRenderer` | Routes chart section to correct chart component | Switch on `section.type` then `section.chartType` for bar-line variants |
| `SECTION_REGISTRY` | Single source of truth for all 21 section types | Maps type -> renderer, propertyForm, catalogEntry, defaultProps, schema |
| `ComponentPicker` | Add-section dialog in editor | Uses `getCatalog()` from registry, groups by `catalogEntry.category` |
| `ComponentGallery` | Standalone page showing all components | Hardcoded `categories[]` array with manual imports and mock data |
| `WireframeHeader` | Period navigation (month/year arrows) | Hardcoded in WireframeViewer layout, not a blueprint item |
| `WireframeSidebar` | Gallery-only preview component | NOT used in WireframeViewer (sidebar is hardcoded there) |
| `WireframeFilterBar` | Filter dropdowns + compare switch | Rendered conditionally inside BlueprintRenderer from `screen.filters` |
| `AdminToolbar` | Edit/save/share/comments/theme toggle | Fixed bar above WireframeHeader in WireframeViewer |

## Integration Analysis: Three Key Changes

### 1. Sidebar/Header/Filter Bar as Configurable Blueprint Items

**Current state:** The WireframeViewer (line 672-837) hardcodes the layout shell:
- Sidebar `<aside>` at fixed 240px with ScreenManager + branding logo
- WireframeHeader with period navigation
- WireframeFilterBar rendered conditionally inside BlueprintRenderer

**Target state:** These become configurable at the BlueprintConfig level, allowing each blueprint to define its own sidebar style, header behavior, and filter bar configuration.

**Recommended approach: Layout config at BlueprintConfig level, NOT as section types.**

Sidebar, header, and filter bar are fundamentally different from content sections. They are **shell/chrome elements** that wrap all screens, not content that lives inside a screen's sections array. Treating them as section types would be architecturally wrong because:

1. They do not belong in `screen.sections[]` -- a sidebar wraps all screens, not one screen
2. They have different rendering contexts (fixed position, outside the scroll area)
3. They need different property forms (screen list is a sidebar concern, not a section concern)

**Recommended schema change -- add `layout` config to `BlueprintConfig`:**

```typescript
// NEW: Layout configuration at blueprint level
export type SidebarConfig = {
  variant: 'standard' | 'compact' | 'icon-only' | 'none'
  position: 'left' | 'right'
  width?: number           // default: 240
  showLogo?: boolean       // default: true
  showFooter?: boolean     // default: true
  sections?: SidebarSection[]  // optional custom grouping of screens
}

export type SidebarSection = {
  label: string
  screenIds: string[]  // references to screen.id values
}

export type HeaderConfig = {
  variant: 'standard' | 'compact' | 'minimal' | 'none'
  showPeriodNav?: boolean  // default: true (respects screen.periodType)
  showBreadcrumb?: boolean
  position: 'above-sidebar' | 'beside-sidebar'  // controls z-layer
}

export type FilterBarConfig = {
  variant: 'inline' | 'sticky' | 'drawer' | 'none'
  position: 'below-header' | 'in-content'
}

// MODIFIED: BlueprintConfig gets layout field
export type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number
  layout?: {
    sidebar?: SidebarConfig
    header?: HeaderConfig
    filterBar?: FilterBarConfig
  }
  screens: BlueprintScreen[]
}
```

**Why this approach:**
- Layout config is a blueprint-level concern, not a per-screen concern
- Each field has sensible defaults, so existing blueprints with no `layout` field continue working unchanged (backward compatible)
- The WireframeViewer reads `config.layout?.sidebar`, `config.layout?.header`, etc. and passes to configurable components
- Schema migration `v1 -> v2` adds `layout: undefined` (no-op, defaults kick in)
- Zod schema extension is additive (`.optional()` fields)

**Files that need modification:**

| File | Change | Type |
|------|--------|------|
| `types/blueprint.ts` | Add `SidebarConfig`, `HeaderConfig`, `FilterBarConfig`, `LayoutConfig` types; add `layout?` to `BlueprintConfig` | Modified |
| `lib/blueprint-schema.ts` | Add Zod schemas for layout config types; extend `BlueprintConfigSchema` | Modified |
| `lib/blueprint-migrations.ts` | Add v1->v2 migrator (set schemaVersion: 2, layout: undefined) | Modified |
| `WireframeViewer.tsx` | Extract hardcoded sidebar/header into configurable components; read `config.layout` | Modified |
| `WireframeHeader.tsx` | Accept `HeaderConfig` props for variant/position control | Modified |
| `WireframeSidebar.tsx` | Rewrite to accept `SidebarConfig` + screens + branding, replace hardcoded aside | Modified |
| `components/editor/LayoutConfigPanel.tsx` | New property panel for editing layout config | **New** |
| `AdminToolbar.tsx` | Add "Layout" button to open LayoutConfigPanel | Modified |

### 2. Expanding Chart Types via the Section Registry

**Current state:** 9 chart variants exist across 5 section types:
- `bar-line-chart` section with `chartType: 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'` (8 sub-variants)
- `donut-chart` section (1 type)
- `waterfall-chart` section (1 type)
- `pareto-chart` section (1 type)
- Total: 5 section types, but `bar-line-chart` is overloaded with 8 chartType sub-variants

**Available Recharts 2.15.4 chart primitives:**
- `BarChart`, `LineChart`, `AreaChart` -- cartesian, composable
- `ComposedChart` -- mixed bar+line+area
- `PieChart` -- pie/donut
- `RadarChart` -- polar/spider
- `ScatterChart` -- x/y scatter
- `FunnelChart` -- funnel
- `Treemap` -- hierarchical
- `RadialBarChart` -- circular bars (gauges)
- `SunburstChart` -- hierarchical pie
- `Sankey` -- flow diagrams

**Problem with current design:** The `bar-line-chart` section type is a "god section" that overloads 8 different chart types into one discriminated type. Adding more chart types (radial bar, sunburst, sankey, composed, stacked, grouped, horizontal) into this same type makes the overloading worse. The ChartRenderer switch statement grows unbounded.

**Recommended approach: Keep the existing `bar-line-chart` overloaded pattern, but introduce new top-level section types only for charts with fundamentally different data shapes.**

Rationale: Charts that share the same data model (x-axis categories, y-axis values) should stay in the `bar-line-chart` family. Charts with unique data shapes deserve their own section type.

**Chart type taxonomy for v1.3:**

| Chart | Data Shape | Section Type | Status | Implementation |
|-------|-----------|--------------|--------|----------------|
| Bar | categories + values | `bar-line-chart` (chartType: 'bar') | Exists | BarLineChart component |
| Line | categories + values | `bar-line-chart` (chartType: 'line') | Exists | BarLineChart component |
| Bar+Line | categories + dual values | `bar-line-chart` (chartType: 'bar-line') | Exists | BarLineChart component |
| Area | categories + values | `bar-line-chart` (chartType: 'area') | Exists | AreaChartComponent |
| Stacked Bar | categories + multi-series | `bar-line-chart` (chartType: 'stacked-bar') | **New sub-type** | New component |
| Grouped Bar | categories + multi-series | `bar-line-chart` (chartType: 'grouped-bar') | **New sub-type** | New component |
| Horizontal Bar | categories + values | `bar-line-chart` (chartType: 'horizontal-bar') | **New sub-type** | New component |
| Stacked Area | categories + multi-series | `bar-line-chart` (chartType: 'stacked-area') | **New sub-type** | New component |
| Multi-Line | categories + multi-series | `bar-line-chart` (chartType: 'multi-line') | **New sub-type** | New component |
| Radar | categories + values (polar) | `bar-line-chart` (chartType: 'radar') | Exists | RadarChartComponent |
| Treemap | hierarchical blocks | `bar-line-chart` (chartType: 'treemap') | Exists | TreemapComponent |
| Funnel | ordered stages | `bar-line-chart` (chartType: 'funnel') | Exists | FunnelChartComponent |
| Scatter | x/y pairs | `bar-line-chart` (chartType: 'scatter') | Exists | ScatterChartComponent |
| Donut | label/value slices | `donut-chart` | Exists | DonutChart component |
| Pie | label/value slices | `donut-chart` (variant prop) | **New variant** | DonutChart with innerRadius=0 |
| Waterfall | labeled bars +/- | `waterfall-chart` | Exists | WaterfallChart component |
| Pareto | bars + cumulative line | `pareto-chart` | Exists | ParetoChart component |
| Radial Bar | circular progress bars | `radial-bar-chart` | **New section type** | **New** component + registry entry |
| Gauge | single-value semicircle | `gauge-chart` | **New section type** | **New** component + registry entry |
| Sankey | flow/node links | `sankey-chart` | **New section type** | **New** component + registry entry |
| Sunburst | hierarchical pie | `sunburst-chart` | **New section type** | **New** component + registry entry |
| Bullet | target vs actual bar | `bullet-chart` | **New section type** | **New** component (custom, not native Recharts) |
| Sparkline (inline) | mini trend line | (embedded in KpiCard) | Exists | sparkline prop on KpiCard |

**New chartType values for `bar-line-chart`:** `'stacked-bar' | 'grouped-bar' | 'horizontal-bar' | 'stacked-area' | 'multi-line'`

**New section types (unique data shapes, 5 total):**

```typescript
// Radial bar -- circular progress indicators
export type RadialBarSection = {
  type: 'radial-bar-chart'
  title: string
  items: { label: string; value: number; fill?: string }[]
  height?: number
}

// Gauge -- single value on semicircle
export type GaugeSection = {
  type: 'gauge-chart'
  title: string
  value: number
  min?: number
  max?: number
  thresholds?: { value: number; color: string }[]
  height?: number
}

// Sankey -- flow diagram
export type SankeySection = {
  type: 'sankey-chart'
  title: string
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
  height?: number
}

// Sunburst -- hierarchical pie
export type SunburstSection = {
  type: 'sunburst-chart'
  title: string
  data: SunburstNode
  height?: number
}
type SunburstNode = {
  name: string
  value?: number
  children?: SunburstNode[]
}

// Bullet -- target vs actual
export type BulletSection = {
  type: 'bullet-chart'
  title: string
  items: { label: string; actual: number; target: number; ranges?: number[] }[]
  height?: number
}
```

**Files that need modification:**

| File | Change | Type |
|------|--------|------|
| `types/blueprint.ts` | Add 5 new section types to union; extend `ChartType` with 5 new sub-types | Modified |
| `lib/blueprint-schema.ts` | Add 5 new Zod section schemas; extend `ChartType` enum; add to discriminated union | Modified |
| `lib/section-registry.tsx` | Add 5+5 new entries (5 new section types + chart sub-types don't need registry entries) | Modified |
| `sections/ChartRenderer.tsx` | Add 5 new cases to `chartType` switch for bar-line sub-variants | Modified |
| `components/StackedBarChart.tsx` | New component | **New** |
| `components/GroupedBarChart.tsx` | New component | **New** |
| `components/HorizontalBarChart.tsx` | New component | **New** |
| `components/StackedAreaChart.tsx` | New component | **New** |
| `components/MultiLineChart.tsx` | New component | **New** |
| `components/RadialBarChartComponent.tsx` | New component + renderer | **New** |
| `components/GaugeChart.tsx` | New component + renderer | **New** |
| `components/SankeyChart.tsx` | New component + renderer | **New** |
| `components/SunburstChart.tsx` | New component + renderer | **New** |
| `components/BulletChart.tsx` | New component + renderer | **New** |
| `sections/RadialBarRenderer.tsx` | New renderer | **New** |
| `sections/GaugeRenderer.tsx` | New renderer | **New** |
| `sections/SankeyRenderer.tsx` | New renderer | **New** |
| `sections/SunburstRenderer.tsx` | New renderer | **New** |
| `sections/BulletRenderer.tsx` | New renderer | **New** |
| `editor/property-forms/RadialBarForm.tsx` | New property form | **New** |
| `editor/property-forms/GaugeForm.tsx` | New property form | **New** |
| `editor/property-forms/SankeyForm.tsx` | New property form | **New** |
| `editor/property-forms/SunburstForm.tsx` | New property form | **New** |
| `editor/property-forms/BulletForm.tsx` | New property form | **New** |

### 3. Component Gallery Reorganization

**Current state:** The `ComponentGallery.tsx` has 5 hardcoded categories:
- Cards (3): KpiCard, KpiCardFull, CalculoCard
- Graficos (4): BarLineChart, WaterfallChart, DonutChart, ParetoChart
- Tabelas (4): DataTable, DrillDownTable, ClickableTable, ConfigTable
- Layout (7): WireframeSidebar, WireframeHeader, WireframeFilterBar, GlobalFilters, CommentOverlay, WireframeModal, DetailViewSwitcher
- Inputs (4): InputsScreen, UploadSection, ManualInputSection, SaldoBancoInput

**Problem:** The gallery does NOT use the section registry. It's a completely independent hardcoded list of components with its own mock data, its own category scheme, and its own imports. This means:
1. Adding a new section type requires changes in both the registry AND the gallery
2. The gallery's categories don't match the registry's categories
3. Components in the gallery (WireframeSidebar, WireframeModal, etc.) are not section types at all

**Recommended approach: Hybrid gallery with registry-driven sections + curated non-section components.**

The gallery should have two tiers:
1. **Registry-driven sections** -- auto-generated from `SECTION_REGISTRY`, grouped by `catalogEntry.category`
2. **Shell components** -- manually curated (WireframeSidebar, WireframeHeader, WireframeFilterBar, WireframeModal, etc.)

```
Gallery Structure:
  [Tab: Secoes]        <-- auto from SECTION_REGISTRY grouped by category
    KPIs               <-- from catalogEntry.category
    Graficos
    Tabelas
    Inputs
    Layout
    Formularios
    Filtros
    Metricas
  [Tab: Layout/Shell]  <-- manually curated
    Sidebar
    Header
    Filter Bar
    Modal
    Detail Switcher
  [Tab: Compostos]     <-- optional, for compound patterns
    Screen com sidebar + header + filter + content
```

**Recommended category reorganization for the registry (v1.3):**

| Category | Current Types | New Types (v1.3) |
|----------|--------------|-------------------|
| KPIs | kpi-grid | (unchanged) |
| Metricas | stat-card, progress-bar | radial-bar-chart, gauge-chart, bullet-chart |
| Graficos | bar-line-chart, donut-chart, waterfall-chart, pareto-chart | sankey-chart, sunburst-chart |
| Tabelas | data-table, drill-down-table, clickable-table, config-table | (unchanged) |
| Inputs | saldo-banco, manual-input, upload-section | (unchanged) |
| Layout | calculo-card, chart-grid, info-block, divider | (unchanged) |
| Formularios | settings-page, form-section | (unchanged) |
| Filtros | filter-config | (unchanged) |

**Files that need modification:**

| File | Change | Type |
|------|--------|------|
| `src/pages/tools/ComponentGallery.tsx` | Rewrite to use registry-driven tier + shell tier | Modified |
| `src/pages/tools/galleryMockData.ts` | Add mock data for new chart types | Modified |
| `lib/section-registry.tsx` | Update `catalogEntry.category` for new types | Modified |

## Data Flow Changes

### Current Data Flow (Unchanged for Content Sections)

```
BlueprintConfig.screens[i].rows[j].sections[k]
    |
    v
BlueprintRenderer
    |
    v
SectionRenderer(section) ---lookup---> SECTION_REGISTRY[section.type]
    |                                        |
    |                                   .renderer component
    v
<RendererComponent section={section} compareMode={...} />
```

### New Data Flow: Layout Config

```
BlueprintConfig.layout?.sidebar
BlueprintConfig.layout?.header
BlueprintConfig.layout?.filterBar
    |
    v
WireframeViewer reads layout config
    |
    +---> <ConfigurableSidebar config={sidebarConfig} screens={screens} branding={branding} />
    |         |
    |         v
    |     Renders sidebar variant based on config.variant
    |     Renders screen groups based on config.sections[]
    |
    +---> <ConfigurableHeader config={headerConfig} screen={activeScreen} />
    |         |
    |         v
    |     Renders header variant based on config.variant
    |     Position determines z-index stacking
    |
    +---> BlueprintRenderer receives filterBarConfig
              |
              v
          Renders filter bar based on config.variant
```

### Schema Migration Flow

```
DB raw JSON (schemaVersion: 1)
    |
    v
migrateBlueprint()
    |
    v
migrators[1](config)  --> adds layout: undefined, sets schemaVersion: 2
    |
    v
BlueprintConfigSchema.safeParse() --> validates, defaults kick in
    |
    v
ValidatedBlueprintConfig (schemaVersion: 2)
```

## Architectural Patterns

### Pattern 1: Section Registry Extension (Proven, HIGH confidence)

**What:** Add new section types by following the established registry pattern -- type definition, Zod schema, renderer, property form, catalog entry, all registered in `SECTION_REGISTRY`.

**When to use:** Every new content section that lives inside `screen.rows[].sections[]`.

**Trade-offs:** Each new section type requires 5-6 files (type, schema, renderer, form, component, registry entry). This is intentional -- it ensures type safety and completeness. The registry guarantees no dead code paths.

**Checklist for adding one section type:**
```
1. types/blueprint.ts       -- add SectionType to union
2. lib/blueprint-schema.ts  -- add Zod schema, add to discriminated union
3. components/MyChart.tsx    -- presentational component
4. sections/MyRenderer.tsx   -- registry-compatible renderer
5. editor/property-forms/MyForm.tsx -- property editor
6. lib/section-registry.tsx  -- register all pieces
```

### Pattern 2: Config-Level Layout (New, for v1.3)

**What:** Blueprint-level configuration for shell elements (sidebar, header, filter bar) that sit outside the per-screen content area.

**When to use:** Elements that wrap or sit alongside all screens, not elements within a screen's content flow.

**Trade-offs:** Introduces a new configuration surface (layout config panel) and new components. However, it cleanly separates shell concerns from content concerns and avoids the anti-pattern of putting layout chrome into the sections array.

### Pattern 3: ChartType Sub-Dispatch (Existing, Extended)

**What:** The `bar-line-chart` section type has a `chartType` discriminator that selects the specific chart component. ChartRenderer contains the dispatch switch.

**When to use:** Charts sharing the same core data model (categories-based cartesian charts: bar, line, area, stacked, grouped, horizontal).

**Trade-offs:** The switch statement in ChartRenderer grows, but all these charts share the same `BarLineChartSection` type definition (title, chartType, height, categories, xLabel, yLabel). This is correct because they genuinely share a data shape. The alternative (separate section types for each) would create 13 near-identical types.

## Anti-Patterns

### Anti-Pattern 1: Sidebar/Header as Section Types

**What people do:** Add sidebar and header as entries in `SECTION_REGISTRY` and put them in `screen.sections[]`.

**Why it's wrong:** Sidebar wraps ALL screens, not one screen. Header has fixed positioning outside the content scroll area. Putting them in sections would mean they appear in the drag-reorder list, can be deleted by users, and render inside the scrollable content area. It fundamentally breaks the layout model.

**Do this instead:** Add `layout` config at `BlueprintConfig` level (see Pattern 2 above).

### Anti-Pattern 2: God ChartRenderer

**What people do:** Put every possible chart type through the same ChartRenderer switch, even those with entirely different data shapes (sankey nodes/links vs bar categories).

**Why it's wrong:** Forces unrelated data shapes into the same section type schema. The `BarLineChartSection` type would need optional fields for nodes, links, sunburst children, etc., making it impossible to validate properly.

**Do this instead:** Create new section types for charts with fundamentally different data shapes. Keep `bar-line-chart` for charts that genuinely share the categories/values data model.

### Anti-Pattern 3: Gallery as Independent Data Source

**What people do:** Maintain the gallery as a completely separate hardcoded component list (current state).

**Why it's wrong:** Double maintenance burden -- every new section type needs changes in both the registry and the gallery. Categories drift out of sync. Components exist in gallery but not in registry, or vice versa.

**Do this instead:** Drive the gallery from `SECTION_REGISTRY` for content sections. Manually curate only shell components (sidebar, header, modal) that are not section types.

### Anti-Pattern 4: Schema Version Skip

**What people do:** Change the schema shape without bumping `schemaVersion` and adding a migrator.

**Why it's wrong:** Existing blueprints in Supabase will fail Zod validation. The `migrateBlueprint()` pipeline exists specifically to handle this.

**Do this instead:** Always bump `CURRENT_SCHEMA_VERSION`, add a migrator function for the previous version, and handle defaults for new optional fields.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Impact of v1.3 |
|----------|---------------|-----------------|
| `BlueprintConfig` <-> `WireframeViewer` | Direct prop passing from DB load | Add `layout` field reading |
| `SECTION_REGISTRY` <-> `SectionRenderer` | Lookup by `section.type` key | Add 5 new keys |
| `SECTION_REGISTRY` <-> `ComponentPicker` | `getCatalog()` function | Auto-picks up new entries |
| `SECTION_REGISTRY` <-> `ComponentGallery` | Currently NONE (independent) | Must connect via registry |
| `ChartRenderer` <-> chart components | Switch dispatch on `chartType` | Add 5 new cases |
| `blueprint-schema.ts` <-> `blueprint-migrations.ts` | Schema version + migrators | Bump to v2, add migrator |
| `WireframeViewer` <-> `WireframeHeader` | Direct rendering, hardcoded | Extract to configurable component |
| `WireframeViewer` <-> sidebar `<aside>` | Hardcoded HTML in viewer | Extract to `ConfigurableSidebar` component |

### Supabase Impact

| Table | Change | Migration Needed |
|-------|--------|-----------------|
| `blueprints` | JSON column gains `layout` field | No SQL migration -- JSON is schemaless. Handled by app-level `migrateBlueprint()` |

### Zod Schema Impact

The discriminated union in `BlueprintSectionSchema` currently has 21 members. Adding 5 new section types brings it to 26. This is within Zod's comfortable handling range. The `ChartType` enum extends from 8 to 13 values.

```typescript
// Extended ChartType
export type ChartType =
  | 'bar' | 'line' | 'bar-line' | 'area'       // existing
  | 'radar' | 'treemap' | 'funnel' | 'scatter'  // existing
  | 'stacked-bar' | 'grouped-bar' | 'horizontal-bar'  // new
  | 'stacked-area' | 'multi-line'                      // new
```

## Recommended Build Order

Build order follows dependency chains. Each phase can be independently tested.

### Phase 1: Schema & Infrastructure (Foundation)
1. Extend `ChartType` enum in `types/blueprint.ts` (add 5 sub-types)
2. Add 5 new section types to `BlueprintSection` union in `types/blueprint.ts`
3. Add `LayoutConfig` types (`SidebarConfig`, `HeaderConfig`, `FilterBarConfig`) to `types/blueprint.ts`
4. Add `layout?` to `BlueprintConfig` type
5. Extend `lib/blueprint-schema.ts` with all new Zod schemas
6. Bump `CURRENT_SCHEMA_VERSION` to 2 in `lib/blueprint-migrations.ts`
7. Add v1->v2 migrator
8. Update tests

**Rationale:** Everything downstream depends on types and schemas being correct first.

### Phase 2: New Chart Components (Independent, Parallelizable)
For each new chart type, create the component + renderer + property form + registry entry. These are independent of each other.

**Bar-line sub-variants (5 components, use existing `bar-line-chart` section type):**
1. `StackedBarChart.tsx` + update ChartRenderer switch
2. `GroupedBarChart.tsx` + update ChartRenderer switch
3. `HorizontalBarChart.tsx` + update ChartRenderer switch
4. `StackedAreaChart.tsx` + update ChartRenderer switch
5. `MultiLineChart.tsx` + update ChartRenderer switch
6. Update `BarLineChartForm` to show new chartType options

**New section types (5 complete sets: component + renderer + form + registry):**
1. `RadialBarChartComponent` + `RadialBarRenderer` + `RadialBarForm` + registry entry
2. `GaugeChart` + `GaugeRenderer` + `GaugeForm` + registry entry
3. `SankeyChart` + `SankeyRenderer` + `SankeyForm` + registry entry
4. `SunburstChart` + `SunburstRenderer` + `SunburstForm` + registry entry
5. `BulletChart` + `BulletRenderer` + `BulletForm` + registry entry

**Rationale:** Each chart is self-contained. The registry pattern means adding one chart never affects another.

### Phase 3: Layout Config (Sidebar/Header/Filter)
1. Extract sidebar from hardcoded `<aside>` in WireframeViewer into `ConfigurableSidebar` component
2. Update `WireframeSidebar.tsx` to accept `SidebarConfig` props
3. Update `WireframeHeader.tsx` to accept `HeaderConfig` props
4. Create `LayoutConfigPanel.tsx` (editor panel for layout settings)
5. Wire `AdminToolbar` to open layout config panel
6. Update WireframeViewer to read `config.layout` and pass to components
7. Ensure header z-index stacking respects `header.position` setting

**Rationale:** Depends on schema (Phase 1). Most complex change. Requires careful refactoring of WireframeViewer without breaking existing functionality.

### Phase 4: Gallery Reorganization
1. Refactor `ComponentGallery.tsx` to use registry-driven tier for section types
2. Create mock data rendering for new section types
3. Add shell/chrome tier for non-section components
4. Add tab or section navigation for the expanded gallery

**Rationale:** Depends on all new section types existing in the registry (Phase 2). Low risk, mostly UI reorganization.

## Scaling Considerations

| Concern | Current (21 types) | After v1.3 (26 types) | At 40+ types |
|---------|---------------------|------------------------|--------------|
| Registry object size | Trivial | Trivial | Still trivial (JS objects, not arrays) |
| Bundle size | ~150KB for chart components | ~200KB estimated | Consider lazy loading per chart type |
| ComponentPicker dialog | 7 categories, fits in dialog | 8 categories, still fits | May need search/filter in picker |
| Schema validation | Fast (<5ms) | Fast | Still fast (discriminated union is O(1) lookup) |
| ChartRenderer switch | 8 cases | 13 cases | Consider dynamic dispatch map instead of switch |

**First bottleneck:** Bundle size as chart components grow. Mitigation: React.lazy() for chart components that are rarely used (sankey, sunburst, bullet). The registry can store lazy component references.

**Second bottleneck:** ComponentPicker UX with 26+ types in the dialog. Mitigation: Add search/filter to the picker dialog (keyboard-driven, like the existing Cmd+K search).

## Sources

- Complete codebase analysis of all files listed above (HIGH confidence)
- Recharts 2.15.4 installed package -- verified available chart primitives via `es6/index.js` exports
- Existing section registry pattern established in v1.1 (proven in production)
- Blueprint schema migration system established in v1.1 (proven with v0->v1 migration)

---
*Architecture research for: v1.3 Builder & Components*
*Researched: 2026-03-10*
