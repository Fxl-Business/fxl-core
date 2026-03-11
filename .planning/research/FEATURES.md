# Feature Research: v1.3 Builder & Components

**Domain:** BI Dashboard Wireframe Builder -- Configurable Layout + Chart Expansion
**Researched:** 2026-03-10
**Confidence:** HIGH

## Scope

This research covers the NEW features for v1.3 only. The existing 21 section types, visual editor, blueprint pipeline, branding system, and component gallery are treated as baseline. Research focuses on:

1. Configurable sidebar/header/filter bar in the blueprint schema
2. Chart type expansion (target: 20+ types)
3. Sidebar/header/filter bar component patterns standard in BI
4. Gallery reorganization

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any BI dashboard wireframe builder must support. Missing these makes the product feel incomplete for PME BI dashboards.

#### Chart Types -- Must Have

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Stacked bar chart | Every BI tool has it. Composition over time (revenue by product line) | LOW | Existing `bar-line-chart` section -- add `stacked-bar` variant to `chartType` |
| Stacked area chart | Proportional trends over time. Power BI, Metabase, Looker all include it | LOW | Existing `AreaChartComponent` -- add `stacked` prop via `stacked-area` chartType |
| Combo/composed chart (bar + line overlay) | Already exists as `bar-line` chartType but needs explicit multi-series stacking | LOW | Existing `BarLineChart` -- already works, verify visual fidelity |
| Gauge/radial meter | KPI vs target visualization. Metabase has gauge, Power BI has KPI visual. Essential for goal-tracking dashboards | MEDIUM | Recharts `RadialBarChart` -- new component `GaugeChartComponent`, new section type `gauge-chart` |
| Horizontal bar chart | Category rankings (top clients, expense categories). Standard in all BI tools. Metabase calls it "Row chart" | LOW | Existing `BarLineChart` -- add `horizontal-bar` chartType, set `layout="vertical"` on Recharts |
| Bubble chart | Scatter with size dimension. Power BI and Metabase include it | LOW | Existing `ScatterChartComponent` -- add `ZAxis` for size via `bubble` chartType |

#### Sidebar -- Must Have

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Configurable sidebar via blueprint schema | v1.3 goal. Currently `WireframeSidebar` receives a flat list of screen labels. Sidebar items, icons, and groups must be declarative in the blueprint, not hardcoded | MEDIUM | New `SidebarConfig` type on `BlueprintConfig` |
| Icons per menu item | Every BI dashboard sidebar uses icons per nav item. `BlueprintScreen` already has an `icon?: string` field but `WireframeSidebar` ignores it completely | LOW | Render existing `icon` field in sidebar using lucide-react dynamic import |
| Active state highlighting | Current screen must be visually distinct. Already works in `WireframeSidebar` but must remain intact with new schema-driven approach | LOW | Already exists -- preserve behavior |
| Collapsible sidebar (icon-only mode) | Standard pattern in all BI tools (Power BI, Metabase, Databricks). Sidebar collapses to an icon rail on user toggle or narrow viewports | MEDIUM | New collapse state in wireframe viewer layout |
| Sidebar groups/sections | Screens grouped by category (e.g., "Financeiro", "Operacional", "Configuracoes"). Standard in any BI tool with 5+ screens. Power BI uses bookmarks/pages, Metabase uses collections | MEDIUM | New `groups` array in `SidebarConfig` referencing `BlueprintScreen.id` |

#### Header -- Must Have

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Configurable header via blueprint schema | v1.3 goal. Currently `WireframeHeader` is hardcoded with title + period selector. Header layout (title, period, actions) must be declarative | MEDIUM | New `HeaderConfig` type on `BlueprintConfig` |
| Header above sidebar (full-width, highest z-order) | v1.3 goal. The header must span the entire viewport width, with the sidebar starting below it. Current layout has sidebar and header at the same level | LOW | CSS layout restructure in wireframe viewer -- change from `flex` row to column-first |
| "Gerenciar" as header button | v1.3 goal. Move from current location into the header action area | LOW | Relocate existing button into `HeaderConfig.actions` |
| Logo/brand display in header | Client branding logo in dashboard header. Every production BI dashboard has client branding. Data already available from branding config | LOW | Read from existing `branding.md` / CSS vars |
| User/role indicator in header | Show current context ("Admin", client company name). Standard in multi-user BI tools | LOW | Static text from config |

#### Filter Bar -- Must Have

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Filter bar as configurable blueprint item | v1.3 goal. Currently `WireframeFilterBar` is rendered inside `BlueprintRenderer`. Filter bar should be a first-class configurable element per screen | MEDIUM | Enhance existing `FilterOption` type with a `filterType` discriminator |
| Date range picker filter | The single most important interactive filter in BI. Metabase has 6 date filter sub-types. Power BI has date slicers. Databricks has date-range-picker widget | MEDIUM | New `filterType: 'date-range'` in `FilterOption` |
| Multi-select dropdown filter | Select multiple values from a list (e.g., multiple cost centers, multiple products). Every BI tool supports multi-select. Metabase calls it "Multiple values filter" | MEDIUM | New `filterType: 'multi-select'` in `FilterOption` |
| Search/text filter | Free-text search within data. Existing `showSearch` prop on `WireframeFilterBar` but not driven by blueprint config | LOW | Promote `showSearch` into `FilterOption` array as `filterType: 'search'` |
| Period quick-select presets | "Last 30 days", "This month", "YTD" -- predefined date ranges. Standard in Metabase (Quick Filters), Databricks, GoodData | LOW | Add `presets` array to date-range filter config |

#### Gallery -- Must Have

| Feature | Why Expected | Complexity | Depends On |
|---------|--------------|------------|------------|
| Gallery organized by thematic sections | v1.3 goal. Current gallery is a flat list. Must group by function (Charts, KPIs, Tables, Layout, Inputs, Filters, Metricas) | LOW | Use existing `category` field from section registry `catalogEntry` |
| All new chart types visible in gallery | Each new chart must have a gallery entry with mock data and description | LOW per chart | Depends on each new chart component existing |

### Differentiators (Competitive Advantage)

Features that set FXL apart from generic BI wireframe tools. Not expected, but highly valuable for the PME BI consulting workflow.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Blueprint-driven layout hierarchy | Sidebar/header/filter bar as first-class blueprint config objects -- not just content sections. The entire dashboard layout (chrome + content) is declarative. No other wireframe tool treats dashboard structure as a typed schema | MEDIUM | This is the core v1.3 innovation. Unlocks AI generation of complete dashboard layouts, not just content sections |
| Gauge chart with colored target zones | Show KPI value vs target with zones (green/yellow/red). Integrates with existing `semaforo` system. PME clients love "are we on track?" visuals | MEDIUM | Recharts `RadialBarChart` + custom colored zone overlay. Reuse existing semaforo color semantics |
| Composed chart with configurable series | Define multiple data series (bar + line + area) in a single chart via blueprint config. Most wireframe tools show one chart type per widget | HIGH | New `series` array in chart section config. Recharts `ComposedChart` supports natively but config schema is complex |
| Sidebar badge/notification count | Show count badges on sidebar items (e.g., "3 pending uploads", "5 alerts"). Useful for operational dashboards common in PME | LOW | Add optional `badge?: string` to sidebar item config |
| Boolean toggle filter | On/off toggles for boolean flags (e.g., "Show inactive", "Include estimates"). Metabase has this, most wireframe tools do not | LOW | Add `filterType: 'boolean'` to `FilterOption` |
| Sidebar footer with version/environment | Show "v1.0 - Producao" or environment indicator. Distinguishes staging from production for PME clients | LOW | Add optional `footer?: { text: string }` to `SidebarConfig` |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create complexity, confusion, or scope bloat for v1.3.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Map/geographic chart | "We need a map for regional sales" | Requires geo data, tile servers, new dependency (leaflet/mapbox). Very heavy for wireframes with mock data. Few PME clients need it | Use a table with region column + horizontal bar chart by region. Defer maps to v2+ |
| Pivot table / matrix | "We need Excel-like pivot in the dashboard" | Extremely complex interaction (drag columns/rows, subtotals, expand/collapse). Recharts does not support it. Would need separate library (e.g., react-pivottable) | Use existing `drill-down-table` with `viewSwitcher` for different groupings. Covers 90% of the use case |
| Cross-chart filtering | "Clicking a bar should filter the whole page" | Requires global state management across all sections. Breaks section isolation principle. Meaningless with mock data | Document as a v2 generated-system feature. Wireframes show the filter bar, not cross-filtering |
| Nested sidebar 3+ levels | "We need sub-sub-menus for complex dashboards" | Creates confusion, breaks scanning patterns, terrible on mobile. PME dashboards rarely exceed 15 screens | Two levels max: groups + items. More screens = more groups, not deeper nesting |
| Custom color picker per individual chart | "Each chart should have its own color scheme" | Breaks visual consistency. Branding system already handles palette globally via `chartColors` | Use existing branding system. The palette applies to all charts consistently |
| Histogram / box plot | "We need statistical distributions" | PME BI clients almost never need statistical charts. These are data-science/analytics tools, not business dashboards | Defer to v2+. Focus on business charts (bar, line, gauge, waterfall) |
| Sankey / sunburst chart | "We need flow diagrams and multi-ring donuts" | Niche use cases. Sankey requires complex data relationships. Sunburst is a multi-dimensional donut few users understand | Defer to v2+. Donut covers proportional display. Waterfall covers flow |
| Drag-and-drop sidebar reordering | "Let users reorder sidebar items by dragging" | Already have drag-reorder for sections. Sidebar order should match blueprint screen order -- reordering sidebar means reordering screens, which is a different UX | Sidebar order follows `groups[].screenIds` order in blueprint. Edit via blueprint config |
| Real-time filter updates / live preview | "Filters should show real-time data changes" | Wireframes use mock data. There is no backend to filter against. This is a generated-system concern | Filter widgets show the UI pattern. Data does not change because it is mock data |

---

## Feature Dependencies

```
BlueprintConfig Schema Changes (foundational -- must be first)
    |
    |-- SidebarConfig type
    |       |-- icon rendering (uses existing BlueprintScreen.icon)
    |       |-- sidebar groups/sections
    |       |-- collapsible sidebar (icon-only rail)
    |       |-- sidebar badge counts (differentiator)
    |       |-- sidebar footer (differentiator)
    |
    |-- HeaderConfig type
    |       |-- header-above-sidebar (CSS layout restructure)
    |       |-- "Gerenciar" button relocation
    |       |-- logo/brand display
    |       |-- period selector (existing, becomes config-driven)
    |
    |-- FilterOption type extension
            |-- filterType discriminator ('select' | 'multi-select' | 'date-range' | 'search' | 'boolean')
            |-- date-range filter widget
            |-- multi-select filter widget
            |-- period quick-select presets

ChartType Expansion (independent of layout changes)
    |-- stacked-bar (extends BarLineChart, adds stackId)
    |-- stacked-area (extends AreaChartComponent, adds stackId)
    |-- horizontal-bar (extends BarLineChart, layout="vertical")
    |-- bubble (extends ScatterChartComponent, adds ZAxis)
    |-- gauge-chart (NEW section type in registry)
    |-- composed (extends/replaces bar-line-chart, uses ComposedChart)

Gallery Reorganization (LAST -- requires all components to exist)
    |-- uses category field from section registry
    |-- must include all new chart types
```

### Dependency Notes

- **Blueprint schema changes are foundational:** `SidebarConfig`, `HeaderConfig`, and `FilterOption` extension must be designed and implemented before the corresponding UI components are built. These are new top-level fields on `BlueprintConfig`.
- **Sidebar/header are config-level, not screen-level:** Sidebar and header are shared across all screens in a dashboard. They belong on `BlueprintConfig`, not `BlueprintScreen`. Filter bar remains screen-level because different screens have different filter needs. This matches how Power BI, Metabase, and Looker all work: navigation is global, filters are per-page.
- **Chart extensions are low-risk and parallelizable:** Most new chart types are sub-variants of existing Recharts components with additional props. They extend `ChartType` union and dispatch through existing `ChartRenderer`.
- **Gauge chart is the only truly new section type:** All other chart additions are new values in the `ChartType` union, dispatched in `ChartRenderer`. Only `gauge-chart` needs a new entry in `SECTION_REGISTRY` (component, form, schema, catalog entry).
- **Gallery reorganization must be last:** It depends on all new components and section types being registered in the section registry.
- **Header-above-sidebar is a CSS-only change** but affects the entire wireframe viewer layout container. Must be done early because sidebar/header components reference the layout.
- **Zod schema and DB migration:** Adding `SidebarConfig` and `HeaderConfig` to `BlueprintConfig` requires updating the Zod schema in `blueprint-schema.ts` AND bumping `schemaVersion` to 3. Existing blueprints without these fields must still validate (optional fields).

---

## MVP Definition (v1.3 Scope)

### Must Ship

- [ ] `SidebarConfig` in blueprint schema -- groups, items referencing screen IDs, collapsible flag
- [ ] `HeaderConfig` in blueprint schema -- title source, period selector toggle, action buttons
- [ ] `FilterOption` type extension -- `filterType` discriminator with `select`, `multi-select`, `date-range`, `search`
- [ ] Header above sidebar (CSS layout hierarchy fix)
- [ ] "Gerenciar" as header action button
- [ ] Sidebar icons rendered from `BlueprintScreen.icon` field
- [ ] Sidebar groups/sections with labeled headings
- [ ] Collapsible sidebar (icon-only rail mode)
- [ ] Gauge chart -- new section type `gauge-chart` with target zones
- [ ] Stacked bar chart variant (`chartType: 'stacked-bar'`)
- [ ] Stacked area chart variant (`chartType: 'stacked-area'`)
- [ ] Horizontal bar chart variant (`chartType: 'horizontal-bar'`)
- [ ] Bubble chart variant (`chartType: 'bubble'`)
- [ ] Gallery reorganized by thematic sections
- [ ] Softer wireframe palette (less harsh black)

### Should Ship (if time permits)

- [ ] Composed chart with configurable multi-series (`chartType: 'composed'`)
- [ ] Sidebar badge/notification counts
- [ ] Period quick-select presets in date-range filter
- [ ] Boolean toggle filter type
- [ ] Sidebar footer (version/environment text)
- [ ] Logo/brand display in header
- [ ] Date-range picker visual calendar widget (vs text input)
- [ ] User/role indicator text in header

### Defer to v2+

- [ ] Map/geographic charts
- [ ] Pivot table / matrix
- [ ] Cross-chart filtering
- [ ] Histogram / box plot
- [ ] Sankey diagram
- [ ] Sunburst chart (multi-ring donut)
- [ ] Nested sidebar (3+ levels)
- [ ] Custom color per individual chart
- [ ] Drag-and-drop sidebar reordering

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Header above sidebar (z-order fix) | HIGH | LOW | P1 |
| SidebarConfig in blueprint schema | HIGH | MEDIUM | P1 |
| HeaderConfig in blueprint schema | HIGH | MEDIUM | P1 |
| Sidebar icons rendering | HIGH | LOW | P1 |
| Sidebar groups/sections | HIGH | MEDIUM | P1 |
| "Gerenciar" as header button | MEDIUM | LOW | P1 |
| Gauge chart (new section type) | HIGH | MEDIUM | P1 |
| Stacked bar variant | HIGH | LOW | P1 |
| Stacked area variant | HIGH | LOW | P1 |
| Horizontal bar variant | HIGH | LOW | P1 |
| FilterOption type extension | HIGH | MEDIUM | P1 |
| Gallery reorganization | MEDIUM | LOW | P1 |
| Collapsible sidebar (icon rail) | MEDIUM | MEDIUM | P1 |
| Softer wireframe palette | MEDIUM | LOW | P1 |
| Bubble chart variant | MEDIUM | LOW | P1 |
| Date-range filter type | MEDIUM | MEDIUM | P2 |
| Multi-select dropdown filter | MEDIUM | MEDIUM | P2 |
| Composed chart (multi-series) | MEDIUM | HIGH | P2 |
| Sidebar badges | LOW | LOW | P2 |
| Boolean toggle filter | LOW | LOW | P2 |
| Logo in header | LOW | LOW | P2 |
| Period quick-select presets | LOW | LOW | P2 |
| Sidebar footer | LOW | LOW | P3 |
| Map charts | LOW | HIGH | P3 (v2+) |
| Pivot table | LOW | HIGH | P3 (v2+) |
| Sankey diagram | LOW | HIGH | P3 (v2+) |

**Priority key:**
- P1: Must have for v1.3 launch
- P2: Should have, add if time permits within v1.3
- P3: Defer to future milestone

---

## Competitor Feature Analysis

### Chart Type Coverage

| Chart Type | Power BI | Metabase | Looker | FXL Current (21 types) | FXL v1.3 Target |
|------------|----------|----------|--------|------------------------|-----------------|
| Bar (vertical) | Yes | Yes | Yes | Yes (`chartType: 'bar'`) | Yes |
| Bar (horizontal/row) | Yes | Yes (Row) | Yes | No | **Add** (`chartType: 'horizontal-bar'`) |
| Stacked bar | Yes | Yes | Yes | No | **Add** (`chartType: 'stacked-bar'`) |
| Line | Yes | Yes | Yes | Yes (`chartType: 'line'`) | Yes |
| Area | Yes | Yes | Yes | Yes (`chartType: 'area'`) | Yes |
| Stacked area | Yes | Yes | Yes | No | **Add** (`chartType: 'stacked-area'`) |
| Pie/Donut | Yes | Yes | Yes | Yes (`donut-chart`) | Yes |
| Waterfall | Yes | Yes | No | Yes (`waterfall-chart`) | Yes |
| Funnel | Yes | Yes | No | Yes (`chartType: 'funnel'`) | Yes |
| Scatter | Yes | Yes | Yes | Yes (`chartType: 'scatter'`) | Yes |
| Bubble | Yes | Yes | Yes | No | **Add** (`chartType: 'bubble'`) |
| Radar | Yes | No | No | Yes (`chartType: 'radar'`) | Yes |
| Treemap | Yes | No | No | Yes (`chartType: 'treemap'`) | Yes |
| Gauge/Radial | Yes | Yes | No | No | **Add** (new `gauge-chart` section) |
| Combo/Composed | Yes | Yes (Combo) | Yes | Partial (`bar-line`) | **Extend** |
| Pareto | Custom | No | No | Yes (`pareto-chart`) | Yes |
| KPI Card | Yes | Yes (Numbers) | Yes | Yes (`kpi-grid`, `stat-card`) | Yes |
| Progress bar | No | Yes | No | Yes (`progress-bar`) | Yes |
| Sankey | No | Yes | No | No | Defer |
| Map | Yes | Yes | Yes | No | Defer |
| Box plot | No | Yes | No | No | Defer |
| Histogram | No | Yes | No | No | Defer |
| Sunburst | No | Yes | No | No | Defer |

**After v1.3, FXL will cover 17 distinct chart types** (vs 12 currently). The 5 deferred types (Sankey, Map, Box plot, Histogram, Sunburst) are either statistically-oriented, geographically-dependent, or require heavy additional dependencies -- none are essential for PME BI dashboards.

### Sidebar/Header/Filter Patterns

| Feature | Power BI | Metabase | Looker | FXL Current | FXL v1.3 Target |
|---------|----------|----------|--------|-------------|-----------------|
| Configurable sidebar | Yes (pages) | Yes (collections) | Yes (explores) | Flat list, no config | **Add to blueprint schema** |
| Sidebar with icons | Yes | Yes | Yes | Icon field exists, not rendered | **Render icons** |
| Sidebar groups | Yes | Yes | Yes | No groups | **Add groups** |
| Collapsible sidebar | Yes | Yes | No | No | **Add** |
| Configurable header | Yes | Yes | Yes | Hardcoded title + period | **Add to blueprint schema** |
| Period selector in header | Yes | No (uses filter) | Yes | Already exists | **Make config-driven** |
| Filter bar per screen | Yes (slicers) | Yes (dashboard filters) | Yes | Exists, select-only | **Extend with more types** |
| Date range filter | Yes | Yes (6 sub-types) | Yes | No | **Add** |
| Multi-select filter | Yes | Yes | Yes | No | **Add** |
| Search filter | Yes | Yes | Yes | Exists as prop, not in blueprint | **Promote to blueprint** |
| Boolean filter | No | Yes | No | No | **Add** |

---

## Blueprint Schema Design Implications

### Current Schema (what exists today)

```typescript
type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number      // currently 1 or 2
  screens: BlueprintScreen[]
  // NO sidebar config
  // NO header config
}

type BlueprintScreen = {
  id: string
  title: string
  icon?: string                // exists but ignored by sidebar
  periodType: PeriodType
  filters: FilterOption[]      // select-only filters
  hasCompareSwitch: boolean
  sections: BlueprintSection[]
}

type FilterOption = {
  key: string
  label: string
  options?: string[]           // no filterType discriminator
}

type ChartType = 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
```

### Proposed Schema Additions for v1.3

```typescript
// Top-level layout config additions
type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion: number          // bump to 3
  sidebar?: SidebarConfig        // NEW -- dashboard-level
  header?: HeaderConfig          // NEW -- dashboard-level
  screens: BlueprintScreen[]
}

// NEW: Sidebar configuration (dashboard-level, shared across screens)
type SidebarConfig = {
  collapsible?: boolean           // allow icon-only mode toggle
  defaultCollapsed?: boolean      // start in collapsed state
  logo?: { src: string; alt: string }
  groups: SidebarGroup[]
  footer?: { text: string }       // e.g., "v1.0 - Producao"
}

type SidebarGroup = {
  label: string                   // group heading (e.g., "Financeiro")
  screenIds: string[]             // references to BlueprintScreen.id
}

// NEW: Header configuration (dashboard-level, shared across screens)
type HeaderConfig = {
  showPeriodSelector?: boolean    // default true (inherits from screen.periodType)
  showLogo?: boolean              // default false
  actions?: HeaderAction[]        // buttons in header right area
}

type HeaderAction = {
  label: string
  icon?: string                   // lucide icon name
  variant: 'primary' | 'ghost'
  action: 'manage' | 'share' | 'export' | 'custom'
}

// EXTENDED: Filter types with discriminator
type FilterOption = {
  key: string
  label: string
  filterType?: 'select' | 'multi-select' | 'date-range' | 'search' | 'boolean'
  // filterType optional for backward compat (defaults to 'select')
  options?: string[]              // for select/multi-select
  defaultValue?: string
  presets?: string[]              // for date-range: "Ultimos 30 dias", "Este mes", "YTD"
}

// EXTENDED: Chart type union with new variants
type ChartType =
  | 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
  | 'stacked-bar' | 'stacked-area' | 'horizontal-bar' | 'bubble' | 'composed'

// NEW: Gauge chart section type (the only new section type needed)
type GaugeChartSection = {
  type: 'gauge-chart'
  title: string
  value: number
  max?: number                    // default 100
  label?: string                  // e.g., "% da Meta"
  zones?: {
    min: number
    max: number
    color: 'verde' | 'amarelo' | 'vermelho'
  }[]
}
```

### Key Design Decision: Config Level vs Screen Level

Sidebar and header are dashboard-level (shared across all screens). They belong on `BlueprintConfig`, not on `BlueprintScreen`. This matches the universal BI tool pattern:
- **Power BI:** Navigation pane is report-level. Slicers are page-level.
- **Metabase:** Collection nav is dashboard-level. Filters are per-question or per-dashboard.
- **Looker:** Explore sidebar is global. Filters are per-look.

Filter bar stays on `BlueprintScreen` because different screens genuinely need different filter configurations (a "DRE" screen needs period filters; a "Configuracoes" screen needs no filters).

---

## Implementation Notes

### Chart Expansion Strategy

Most new chart types are NOT new section types. They are sub-variants of existing `bar-line-chart` via the `chartType` discriminator, dispatched in `ChartRenderer.tsx`:

| New Chart | Approach | Section Type | Changes Needed |
|-----------|----------|-------------|----------------|
| Stacked bar | `chartType: 'stacked-bar'` | `bar-line-chart` | `BarLineChart`: add `stackId="stack"` to all `<Bar>` components |
| Stacked area | `chartType: 'stacked-area'` | `bar-line-chart` | `AreaChartComponent`: add `stackId="stack"` to all `<Area>` components |
| Horizontal bar | `chartType: 'horizontal-bar'` | `bar-line-chart` | `BarLineChart`: set `layout="vertical"` on `<BarChart>` container |
| Bubble | `chartType: 'bubble'` | `bar-line-chart` | `ScatterChartComponent`: add `<ZAxis>` for bubble size dimension |
| Composed | `chartType: 'composed'` | `bar-line-chart` | New `ComposedChartComponent` using Recharts `<ComposedChart>` |
| Gauge | NEW section type | `gauge-chart` | New `GaugeChartComponent` using `<RadialBarChart>`, new registry entry |

This means only **1 new section type** in the registry (`gauge-chart`), keeping the schema clean. The `ChartRenderer` switch statement handles dispatch for all bar-line-chart sub-types.

### Recharts Capabilities (verified via official docs)

All proposed chart types are natively supported by Recharts 2.x (already installed):
- `BarChart` with `stackId` prop for stacked bars -- [StackedBarChart example](https://recharts.github.io/en-US/examples/StackedBarChart/)
- `BarChart` with `layout="vertical"` for horizontal bars -- native Recharts prop
- `AreaChart` with `stackId` for stacked areas -- [StackedAreaChart example](https://recharts.github.io/en-US/examples/StackedAreaChart/)
- `ScatterChart` with `ZAxis` for bubble charts -- [ScatterChart examples](https://recharts.github.io/en-US/examples/)
- `ComposedChart` for bar + line + area combos -- [LineBarAreaComposedChart](https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/)
- `RadialBarChart` for gauge/meter visualization -- [SimpleRadialBarChart](https://recharts.github.io/en-US/examples/SimpleRadialBarChart/)
- **No additional npm dependencies needed** for any chart type

### Wireframe Viewer Layout Restructure

Current layout (simplified):
```
<div class="flex h-screen">
  <WireframeSidebar />        <!-- left, full height -->
  <div class="flex-1 flex flex-col">
    <WireframeHeader />       <!-- top of content area only -->
    <main>...</main>
  </div>
</div>
```

Target layout for v1.3:
```
<div class="flex flex-col h-screen">
  <WireframeHeader />          <!-- TOP, full width, highest z-order -->
  <div class="flex flex-1 overflow-hidden">
    <WireframeSidebar />       <!-- left, below header -->
    <main>
      <WireframeFilterBar />   <!-- per-screen, inside content area -->
      <sections />
    </main>
  </div>
</div>
```

This is a structural CSS change in the wireframe viewer page (likely `WireframeViewer.tsx` or `SharedWireframeView.tsx`). It does not affect the BlueprintRenderer internals.

### Component Count Impact

Current state: 21 section types in registry, ~70 component files total.

After v1.3:
- 22 section types (add `gauge-chart`)
- 5 new `chartType` values (stacked-bar, stacked-area, horizontal-bar, bubble, composed)
- ~5 new component files (GaugeChartComponent, ComposedChartComponent, updated sidebar/header/filter bar)
- ~3 new property form files (GaugeChartForm, and potentially forms for new filter types)
- Zod schema additions for new types
- Updated mock data for gallery

Estimated: 8-12 new files, 15-20 modified files.

---

## Sources

- [Recharts Official Examples](https://recharts.github.io/en-US/examples/) -- verified chart type availability and API
- [Metabase Visualization Overview](https://www.metabase.com/docs/latest/questions/visualizations/visualizing-results) -- complete chart type taxonomy
- [Metabase Dashboard Filters](https://www.metabase.com/docs/latest/dashboards/filters) -- filter type patterns and widget options
- [Power BI Charts & Visualizations](https://www.catchr.io/post/power-bi-charts-visualizations) -- complete Power BI chart taxonomy
- [Databricks Dashboard Filter Types](https://learn.microsoft.com/en-us/azure/databricks/dashboards/filter-types) -- filter widget patterns
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/radix/sidebar) -- sidebar architecture patterns
- [shadcn/ui Radial Charts](https://ui.shadcn.com/charts/radial) -- gauge/radial chart patterns with Recharts
- [Dashboard Design Best Practices - DataCamp](https://www.datacamp.com/tutorial/dashboard-design-tutorial) -- layout patterns and sidebar design
- [Yellowfin BI Dashboard Components](https://www.yellowfinbi.com/blog/critical-elements-of-effective-bi-dashboards) -- essential BI dashboard components
- [Metabase BI Dashboard Best Practices](https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/bi-dashboard-best-practices) -- dashboard design principles
- [Top 5 Data Visualization Tools 2025](https://valiotti.com/blog/top-5-data-visualization-tools/) -- comparative analysis of BI tools
- [Sidebar Navigation Patterns 2025](https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples) -- sidebar design examples
- [Dashboard Design - Justinmind](https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux) -- header layout patterns

---
*Feature research for: v1.3 Builder & Components (BI Dashboard Wireframe Builder)*
*Researched: 2026-03-10*
