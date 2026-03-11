# Stack Research: v1.3 Builder & Components

**Domain:** Wireframe builder expansion -- charts, layout components, gallery reorganization
**Researched:** 2026-03-10
**Confidence:** HIGH (verified against npm registry, recharts API docs, existing codebase analysis)

## Scope

This research covers ONLY stack additions/changes needed for v1.3. The existing validated stack is unchanged:

- React 18.3 + TypeScript 5.6 strict + Tailwind CSS 3.4 + Vite 5.4
- Recharts 2.13.3 (current) -- all chart types already available
- Zod 4.3 for blueprint validation
- @dnd-kit for drag-reorder
- lucide-react for icons
- shadcn/ui for UI primitives
- --wf-* design token system for wireframe theming
- Section registry pattern with 21 types

Three target areas:
1. **20+ chart types** -- expanding from 9 to 20+ via Recharts 2.x built-in components
2. **Configurable sidebar/header/filter bar** -- blueprint schema additions for layout shell
3. **Component gallery reorganization** -- structural refactor, no new dependencies

**Critical finding: Zero new npm packages required.** Recharts 2.x already ships all needed chart containers. The expansion is pure application code -- new components, new section types, and schema evolution.

---

## Recommended Stack Changes

### 1. Recharts Version Bump: 2.13.3 -> 2.15.4

| Technology | Current | Target | Why |
|------------|---------|--------|-----|
| recharts | 2.13.3 | 2.15.4 | Latest stable 2.x. Bug fixes for Treemap, RadialBarChart, FunnelChart rendering. No breaking changes within 2.x line. Project explicitly excludes Recharts 3.x (migration guide shows significant breaking changes). |

**Verification:** `npm view recharts versions --json` confirms 2.15.4 is the latest stable 2.x release. The `latest` dist-tag points to 3.8.0, but the project constraint ("Recharts 3.x upgrade -- breaking changes, 2.x tem todos os charts necessarios") rules this out.

**Confidence:** HIGH -- 2.x minor versions are backward-compatible. Same API surface, same dependencies. Drop-in upgrade.

**Installation:**
```bash
npm install recharts@^2.15.4
```

### 2. No New Chart Libraries Needed

Recharts 2.x provides **12 chart containers** out of the box. The project currently uses 9 of them. The remaining 3 are directly available:

| Chart Container | Status | Used In Project |
|-----------------|--------|-----------------|
| BarChart | Built-in | Yes (BarLineChart.tsx) |
| LineChart | Built-in | Yes (BarLineChart.tsx) |
| ComposedChart | Built-in | Yes (BarLineChart.tsx, bar-line mode) |
| PieChart | Built-in | Yes (DonutChart.tsx) |
| RadarChart | Built-in | Yes (RadarChartComponent.tsx) |
| ScatterChart | Built-in | Yes (ScatterChartComponent.tsx) |
| FunnelChart | Built-in | Yes (FunnelChartComponent.tsx) |
| Treemap | Built-in | Yes (TreemapComponent.tsx) |
| AreaChart | Built-in | Yes (AreaChartComponent.tsx) |
| **RadialBarChart** | Built-in | **Not yet used** -- needed for gauge/radial bar |
| **Sankey** | Built-in | **Not yet used** -- available but LOW priority for BI |
| **SunburstChart** | Built-in | **Not yet used** -- available but LOW priority for BI |

**New chart types achievable with zero dependencies** by leveraging existing Recharts components in new combinations:

| New Chart Type | Recharts Components Used | Implementation Pattern |
|----------------|--------------------------|----------------------|
| Stacked Bar | BarChart + multiple Bar (same stackId) | Prop variation on BarLineChart |
| Grouped Bar | BarChart + multiple Bar (different dataKeys) | Prop variation on BarLineChart |
| Horizontal Bar | BarChart with layout="vertical" | Prop variation on BarLineChart |
| Stacked Area | AreaChart + multiple Area (stackId) | Prop variation on AreaChartComponent |
| 100% Stacked Bar | BarChart + percentage data normalization | Data transform + BarChart |
| Radial Bar / Gauge | RadialBarChart + RadialBar | New component (RadialBarChartComponent.tsx) |
| Pie (non-donut) | PieChart + Pie (innerRadius=0) | Prop variation on DonutChart |
| Multi-Line | LineChart + multiple Line | Prop variation on BarLineChart |
| Combo (multi-series) | ComposedChart + mixed Bar/Line/Area | Extended BarLineChart |
| Bullet Chart | BarChart with reference lines | Custom composition (BarChart + ReferenceLine) |
| Mini Sparkline | LineChart (no axis, minimal) | Thin wrapper, already partially in KpiCard |

### 3. No New UI Libraries Needed

**shadcn/ui Chart component (NOT recommended):**
shadcn/ui offers a Chart component (`npx shadcn-ui@latest add chart`) that wraps Recharts with ChartContainer, ChartTooltip, and ChartConfig abstractions. However:

- The project already has a mature charting pattern: each chart component wraps Recharts directly with --wf-* token integration and chartColors passthrough
- Adding ChartContainer would create two competing wrappers
- The ChartConfig pattern (mapping data keys to labels/colors) conflicts with the blueprint-driven approach where config comes from BlueprintSection types
- Zero value-add for wireframe components that already handle responsive sizing and theming

**Verdict:** Continue using Recharts directly. The existing pattern (ResponsiveContainer + chart + --wf-* tokens + chartColors prop) is clean and consistent across 9 chart components. Extending it to 20+ follows the same pattern.

---

## Blueprint Schema Additions (Pure TypeScript/Zod)

### Layout Shell Configuration

Currently, sidebar/header/filter bar are separate components outside the blueprint schema. For v1.3, they become configurable at the blueprint level. This requires schema evolution, not new libraries.

**New types needed in blueprint.ts:**
```typescript
// Blueprint-level layout configuration (new in v1.3)
export type SidebarConfig = {
  enabled: boolean
  width?: number            // default: 48 (w-48 = 192px)
  logo?: string             // icon name from lucide-react
  title?: string            // brand label
  collapsible?: boolean     // allow toggle
  groups?: {
    label?: string
    items: { screenId: string; label: string; icon?: string }[]
  }[]
}

export type HeaderConfig = {
  enabled: boolean
  height?: number           // default: 56px
  title?: string
  showPeriodSelector?: boolean
  periodType?: PeriodType
  actions?: { label: string; icon?: string; variant?: 'primary' | 'ghost' }[]
}

export type FilterBarConfig = {
  enabled: boolean
  position?: 'below-header' | 'inline-content'
  filters: FilterOption[]
  showSearch?: boolean
  showCompareSwitch?: boolean
}

// Extended BlueprintConfig
export type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number      // bump to 2
  layout?: {                  // NEW -- layout shell config
    sidebar?: SidebarConfig
    header?: HeaderConfig
    filterBar?: FilterBarConfig
  }
  screens: BlueprintScreen[]
}
```

**Zod schema extension** follows the existing pattern (add schemas to blueprint-schema.ts, export for registry). The recursive BlueprintSectionSchema is unaffected -- layout config is at the BlueprintConfig level, not section level.

**Schema migration:** The existing `schemaVersion: 1` data will work as-is (layout field is optional). New blueprints with layout config get `schemaVersion: 2`. The migration path is additive, not breaking.

---

## ChartType Enum Expansion

The current `ChartType` union covers 8 values:
```typescript
export type ChartType = 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
```

**Recommended expansion to 16+ values:**
```typescript
export type ChartType =
  // Existing
  | 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
  // New bar variants
  | 'stacked-bar' | 'grouped-bar' | 'horizontal-bar' | 'stacked-bar-100'
  // New line/area variants
  | 'multi-line' | 'stacked-area'
  // New chart types
  | 'radial-bar' | 'pie'
```

**Why this expansion pattern works:**
- All variants share the `bar-line-chart` section type -- ChartRenderer.tsx dispatches by `chartType`
- New variants are handled by existing components (BarLineChart) with prop variations, or by new single-file components (RadialBarChartComponent)
- The Zod schema just extends the z.enum array in BarLineChartSectionSchema
- The section registry entry for 'bar-line-chart' already covers all chartType sub-variants -- no new registry entries needed for chart sub-types

**Separate section types to add (distinct section types, not chartType variants):**

| New Section Type | Purpose | Rationale for Separate Type |
|-----------------|---------|---------------------------|
| `radial-bar` | Gauge/radial progress visualization | Different data shape (single value + max, not series data) |
| `pie-chart` | Standard pie (non-donut) | Could reuse donut with innerRadius=0, but pie has different config (no hole, label layout) |

**Total section types after v1.3: ~23** (21 existing + 2 new). The registry pattern scales cleanly.

---

## What Stays Unchanged

| Technology | Current Version | Why No Change |
|------------|----------------|---------------|
| react | ^18.3.1 | Component expansion is standard React patterns. No hooks/API changes needed. |
| typescript | ^5.6.3 | Strict mode with z.ZodType for recursive types works. Discriminated unions scale to 23+ types. |
| tailwindcss | ^3.4.15 | All wireframe styling uses --wf-* CSS vars + Tailwind utilities. No config changes. |
| vite | ^5.4.10 | No build changes. More components = more tree-shaking-eligible code, no build pipeline impact. |
| zod | ^4.3.6 | z.discriminatedUnion scales to 23+ types. z.enum scales to 16+ chart types. No Zod changes. |
| @dnd-kit/core | ^6.3.1 | Drag-reorder in BlueprintRenderer unaffected by new section types. |
| @dnd-kit/sortable | ^10.0.0 | Same. |
| lucide-react | ^0.460.0 | New section types need icons -- lucide has 1500+. No version bump needed. |
| shadcn/ui | current | UI primitives (Switch, Select, Dialog) used in property forms. No new shadcn components needed. |
| @supabase/supabase-js | ^2.98.0 | Blueprint storage unchanged. Schema evolution is in the JSON payload, not the DB schema. |

---

## What NOT to Add

### Recharts 3.x: DO NOT UPGRADE
Per PROJECT.md: "Recharts 3.x upgrade -- breaking changes, 2.x tem todos os charts necessarios." The 3.x migration guide (https://github.com/recharts/recharts/wiki/3.0-migration-guide) shows significant API changes. The 2.x line (up to 2.15.4) has every chart type needed for this milestone. The `latest` npm tag points to 3.8.0 -- **do not use `npm install recharts@latest`**, use `npm install recharts@^2.15.4` explicitly.

### D3.js Direct: DO NOT ADD
Recharts wraps D3 internally. Adding d3 directly would create competing rendering approaches. Every chart type in scope is achievable with Recharts components. If a chart needs custom SVG (e.g., bullet chart), use Recharts' `<ReferenceLine>` and `<ReferenceArea>` components, not raw D3.

### Chart.js / react-chartjs-2: DO NOT ADD
Mixing charting libraries creates inconsistent theming, different API patterns, and double the bundle size for charts. Recharts covers all BI chart types needed.

### nivo / visx: DO NOT ADD
Same reasoning as Chart.js. These are complete charting frameworks that would conflict with the Recharts-based architecture. nivo has its own theming system that would clash with --wf-* tokens.

### @tanstack/react-table: PREMATURE
The existing table components (DataTable, DrillDownTable, ClickableTable, ConfigTable) are custom wireframe-styled components with mock data. They render blueprint-defined column/row structure, not real data. @tanstack/react-table is for runtime data management (sorting, filtering, pagination) which is out of scope for wireframe preview components.

### Additional Zod or Form Libraries (react-hook-form, etc.): NOT NEEDED
Property forms in the editor use controlled state (`onChange` callbacks). The existing pattern (PropertyFormProps with `section` and `onChange`) scales to new section types without form libraries. Zod is used for DB validation, not form validation.

### react-grid-layout or Similar: NOT NEEDED
The grid system already exists (GridLayoutPicker with '1', '2', '3', '2-1', '1-2' layouts). New section types render within this existing grid. Full Figma-style drag-and-drop is explicitly deferred to v2 (ADVW-04).

### shadcn/ui Charts Component: NOT NEEDED
As analyzed above, it would create a competing abstraction layer over Recharts. The project's direct Recharts wrapper pattern is more appropriate for wireframe components where theming comes from --wf-* tokens and chartColors prop, not shadcn's ChartConfig.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Recharts 2.15.4 (minor bump) | Recharts 3.8.0 (major upgrade) | 3.x has breaking API changes. PROJECT.md explicitly excludes. 2.x has all chart types. |
| Direct Recharts wrapping | shadcn/ui Chart component | shadcn Charts add ChartContainer/ChartConfig that conflict with --wf-* token approach. |
| ChartType enum expansion (16 variants) | Separate section types per chart | Would bloat section registry to 35+ types. Chart sub-variants share the same data shape and section config -- only the rendering differs. |
| Layout config at BlueprintConfig level | Sidebar/Header as section types | Layout shell is not a "section" -- it wraps all sections. Modeling it as section types would break the rendering hierarchy. |
| RadialBarChart from Recharts | react-gauge-chart npm package | Adds a dependency for one chart type. RadialBarChart + custom component achieves the same with existing recharts. |
| Custom heatmap via Recharts ScatterChart | nivo HeatMap or react-heatmap | Heatmaps are LOW priority for BI wireframes. If needed later, a custom component using Recharts grid + colored cells is sufficient. Not worth a new dependency. |
| Pie chart as DonutChart variant (innerRadius=0) | Separate pie-chart section type | RECOMMENDED to keep as variant first, promote to section type only if the config shape diverges significantly. |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| recharts@2.15.4 | react@^18.3.1 | Uses react-is@^18.3.1 internally. Compatible. |
| recharts@2.15.4 | typescript@^5.6.3 | Ships with @types included. No separate @types/recharts needed. |
| recharts@2.15.4 | vite@^5.4.10 | Tree-shakes unused chart components. No build config changes. |
| zod@^4.3.6 | z.enum with 16+ values | z.enum scales to arbitrary string unions. No performance concern. |
| zod@^4.3.6 | z.discriminatedUnion with 23+ branches | Validated in existing 21-type union. 23 is well within limits. |

---

## Chart Type Inventory: Current vs Target

### Currently Implemented (9 chart components)

| # | Chart Type | Component File | Section Type | Blueprint ChartType |
|---|-----------|---------------|-------------|-------------------|
| 1 | Bar | BarLineChart.tsx | bar-line-chart | 'bar' |
| 2 | Line | BarLineChart.tsx | bar-line-chart | 'line' |
| 3 | Bar+Line Combo | BarLineChart.tsx | bar-line-chart | 'bar-line' |
| 4 | Donut | DonutChart.tsx | donut-chart | n/a (own type) |
| 5 | Waterfall | WaterfallChart.tsx | waterfall-chart | n/a (own type) |
| 6 | Pareto | ParetoChart.tsx | pareto-chart | n/a (own type) |
| 7 | Radar | RadarChartComponent.tsx | bar-line-chart | 'radar' |
| 8 | Treemap | TreemapComponent.tsx | bar-line-chart | 'treemap' |
| 9 | Funnel | FunnelChartComponent.tsx | bar-line-chart | 'funnel' |
| 10 | Scatter | ScatterChartComponent.tsx | bar-line-chart | 'scatter' |
| 11 | Area | AreaChartComponent.tsx | bar-line-chart | 'area' |

*(Note: 11 logical types, 9 distinct component files -- bar/line/bar-line share BarLineChart.tsx)*

### New Chart Types for v1.3 (target: 20+ total)

| # | New Chart Type | Implementation | Recharts Components | Effort |
|---|---------------|---------------|-------------------|--------|
| 12 | Stacked Bar | Extend BarLineChart | BarChart + multiple Bar (stackId) | Low |
| 13 | Grouped Bar | Extend BarLineChart | BarChart + multiple Bar | Low |
| 14 | Horizontal Bar | Extend BarLineChart | BarChart (layout="vertical") | Low |
| 15 | 100% Stacked Bar | New component or extend | BarChart + percentage normalization | Medium |
| 16 | Stacked Area | Extend AreaChartComponent | AreaChart + multiple Area (stackId) | Low |
| 17 | Multi-Line | Extend BarLineChart | LineChart + multiple Line | Low |
| 18 | Radial Bar / Gauge | New: RadialBarChartComponent.tsx | RadialBarChart + RadialBar | Medium |
| 19 | Pie (non-donut) | Variant of DonutChart | PieChart + Pie (innerRadius=0) | Low |
| 20 | Combo Multi-Series | Extend BarLineChart | ComposedChart + mixed types | Medium |
| 21 | Bullet | New: BulletChartComponent.tsx | BarChart + ReferenceLine | Medium |

**Total after v1.3: 21 chart types minimum** (11 existing + 10 new), achievable with 2-3 new component files and extensions to existing ones.

### Chart Types Explicitly Deferred

| Chart Type | Why Defer | Recharts Support |
|-----------|----------|-----------------|
| Sankey | Complex data shape (links + nodes). Niche BI use. | Yes (Sankey component) |
| Sunburst | Hierarchical data rare in PME BI. | Yes (SunburstChart) |
| Heatmap | Not a native Recharts component. Needs custom SVG or ScatterChart hack. | Partial |
| Calendar Chart | GitHub-contribution-style. Not standard BI. | No (would need custom) |
| Bubble Chart | Niche. Can be approximated via ScatterChart with variable size. | Partial |

---

## Implementation Pattern for New Charts

All new chart components follow the **established pattern** visible in existing components:

```typescript
// Pattern: tools/wireframe-builder/components/[Name]ChartComponent.tsx

import { [Container], [Items], ResponsiveContainer, Tooltip } from 'recharts'

type Props = {
  title: string
  height?: number
  chartColors?: string[]  // Brand palette passthrough
  // Chart-specific props
}

export default function [Name]ChartComponent({ title, height = 250, chartColors }: Props) {
  const data = MOCK_DATA  // Wireframe = mock data always

  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
      <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
      <ResponsiveContainer width="100%" height={height}>
        {/* Recharts chart here */}
      </ResponsiveContainer>
    </div>
  )
}
```

**Key invariants maintained:**
- --wf-card, --wf-card-border, --wf-heading tokens for container
- chartColors prop for brand color passthrough
- ResponsiveContainer for sizing
- Mock data (wireframes show structure, not real data)
- TypeScript strict, zero `any`

**For chart sub-variants (stacked, grouped, horizontal):** extend ChartRenderer.tsx's switch statement with new chartType cases, reusing BarLineChart with additional props or minor modifications.

---

## Installation Plan

```bash
# Single dependency update -- minor version bump
npm install recharts@^2.15.4
```

**Total: 0 new packages, 1 minor version bump.** Everything else is application code.

**Bundle size impact:** Negligible. Recharts 2.15.4 is the same size as 2.13.3 (same major features). New chart components import from the same recharts package -- tree-shaking handles unused chart containers.

---

## Sources

- [Recharts API Documentation](https://recharts.github.io/en-US/api/) -- full list of chart containers and components (HIGH confidence)
- [npm: recharts versions](https://www.npmjs.com/package/recharts) -- 2.15.4 confirmed as latest stable 2.x via `npm view recharts versions --json` (HIGH confidence)
- [Recharts GitHub Releases](https://github.com/recharts/recharts/releases) -- 3.x migration guide confirms breaking changes (HIGH confidence)
- [Recharts 3.0 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) -- breaking changes documented (HIGH confidence)
- [shadcn/ui Chart Component](https://ui.shadcn.com/docs/components/radix/chart) -- thin Recharts wrappers, not needed for this project (HIGH confidence)
- [Recharts Stacked Bar Example](https://recharts.github.io/en-US/examples/StackedBarChart/) -- stackId pattern verified (MEDIUM confidence)
- [Recharts RadialBarChart API](https://recharts.github.io/en-US/api/RadialBarChart/) -- gauge/radial bar capability verified (MEDIUM confidence)
- Existing codebase analysis: 11 chart components, 21 section types, section-registry.tsx, blueprint-schema.ts, ChartRenderer.tsx, BlueprintRenderer.tsx, ComponentGallery.tsx (HIGH confidence)

---
*Stack research for: FXL Core v1.3 Builder & Components*
*Researched: 2026-03-10*
