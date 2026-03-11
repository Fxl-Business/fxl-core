# Phase 20: Chart Type Expansion - Research

**Researched:** 2026-03-11
**Domain:** Recharts 2.x chart API — stacked/horizontal bars, bubble/scatter, gauge (PieChart SVG needle), composed multi-series
**Confidence:** HIGH (all findings from direct codebase inspection + Recharts official docs)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHART-01 | Stacked bar chart variant (`chartType: 'stacked-bar'`) | `BarChart` + multiple `Bar` components with identical `stackId="stack"` prop. Data needs multi-series shape: `[{ category, seriesA, seriesB, seriesC }]`. `categories` prop from `BarLineChartSection` drives X-axis labels. Dispatch added to `ChartRenderer` `case 'bar-line-chart'` switch. New component `StackedBarChartComponent.tsx`. |
| CHART-02 | Stacked area chart variant (`chartType: 'stacked-area'`) | `AreaChart` + multiple `Area` components with identical `stackId="stack"` prop. Same multi-series data shape. Gradient fills per series cycle through `chartColors` array. New component `StackedAreaChartComponent.tsx`. |
| CHART-03 | Horizontal bar chart variant (`chartType: 'horizontal-bar'`) | `BarChart layout="vertical"` with `XAxis type="number"` and `YAxis type="category" dataKey="category"`. Single series bar — same data shape as existing bar. New component `HorizontalBarChartComponent.tsx`. |
| CHART-04 | Bubble chart variant (`chartType: 'bubble'`) | `ScatterChart` with `ZAxis dataKey="z" range={[20, 500]}`. Data shape: `[{ x, y, z }]`. The `z` value controls circle radius via `ZAxis range` — Recharts maps the raw z values to pixel sizes within the range. New component `BubbleChartComponent.tsx` (extends existing `ScatterChartComponent` pattern). |
| CHART-05 | Gauge chart as new section type (`gauge-chart`) | New top-level `BlueprintSection` variant (`type: 'gauge-chart'`). Implementation: `PieChart` with two `Pie` components: (1) color-zone arcs (`startAngle={180} endAngle={0}`, 3 segments: green/yellow/red), (2) pure background arc; plus custom SVG needle via `customized` label on the outer Pie. Needle angle computed from `(value / max) * 180`. New `GaugeChartSection` type + `GaugeChartSectionSchema` + `GaugeChartRenderer.tsx` + registry entry. |
| CHART-06 | Composed chart with configurable multi-series (`chartType: 'composed'`) | `ComposedChart` with `Bar`, `Line`, `Area` driven by `series` config on `BarLineChartSection`. Each series item: `{ key, type: 'bar' | 'line' | 'area', color? }`. Default 3 series (bar + line + area) when no series provided. Dispatch added to `ChartRenderer` `case 'bar-line-chart'` switch. New component `ComposedChartComponent.tsx`. |
</phase_requirements>

---

## Summary

Phase 20 expands the chart repertoire from 8 `chartType` variants to 13 (5 new bar-line sub-types) plus 1 new top-level section type (`gauge-chart`). All changes are additive — no existing chart components or schemas are broken.

The work splits cleanly into two categories. First, `BarLineChartSection` gets five new `chartType` enum values (`stacked-bar`, `stacked-area`, `horizontal-bar`, `bubble`, `composed`). Each maps to a new standalone component dispatched from `ChartRenderer`'s existing switch. The `BarLineChartSectionSchema` Zod enum and `ChartType` TypeScript union both need those 5 values added. Second, `gauge-chart` is a new first-class section type: new TS type, new Zod schema, new renderer, new registry entry, new property form — following the exact same pattern as every other section type in the codebase.

All charts must use `var(--wf-*)` CSS custom properties for borders/backgrounds and honor the `chartColors` prop array for series colors. The `--wf-chart-1` through `--wf-chart-5` variables provide the fallback palette. No new npm packages are needed — Recharts 2.13.3 ships everything required: `BarChart`, `AreaChart`, `ScatterChart`, `ZAxis`, `PieChart`, `Pie`, `Cell`, `ComposedChart`, `Legend`.

**Primary recommendation:** Implement in one plan covering schema + types first, then all 6 new chart components, then registry/dispatch updates, then tests. The schema changes are the foundation that makes TypeScript happy for all downstream component work.

---

## Standard Stack

### Core (already installed, zero new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | ^2.13.3 | All new chart types | Project-wide, covers all 6 new types natively |
| React | ^18.3.1 | Component rendering | Project-wide |
| TypeScript | ^5.6.3 strict | Type-safe section/chart union | Project-wide |
| Vitest | ^4.0.18 | Unit tests for schema + registry | Established — `blueprint-schema.test.ts`, `section-registry.test.ts` |
| CSS custom props (--wf-*) | N/A | Design token system | Established wireframe token convention |
| lucide-react | ^0.460.0 | Lucide icons for property forms + registry catalog | Already used in registry |
| zod | ^4.3.6 | Schema for new `GaugeChartSectionSchema` | Established |

**Installation:** No new packages. All Recharts components needed are already exported by the installed version.

### Recharts components consumed by this phase

| Component | Import | Used for |
|-----------|--------|---------|
| `BarChart`, `Bar` | recharts | stacked-bar, horizontal-bar |
| `AreaChart`, `Area` | recharts | stacked-area |
| `ScatterChart`, `Scatter`, `ZAxis` | recharts | bubble (3D scatter) |
| `PieChart`, `Pie`, `Cell` | recharts | gauge (zone arcs + needle) |
| `ComposedChart`, `Bar`, `Line`, `Area` | recharts | composed multi-series |
| `Legend` | recharts | stacked charts (series labeling) |
| `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer` | recharts | all new components |

All confirmed present in node_modules via `node -e "require('recharts')"` check.

---

## Architecture Patterns

### Relevant File Structure (files changed/added)

```
tools/wireframe-builder/
├── types/
│   └── blueprint.ts               ← ChartType union + GaugeChartSection type added
├── lib/
│   ├── blueprint-schema.ts        ← BarLineChartSectionSchema enum + GaugeChartSectionSchema
│   ├── blueprint-schema.test.ts   ← Phase 20 test describe block added
│   └── section-registry.tsx       ← gauge-chart entry + BarLineChartForm description
├── components/
│   ├── StackedBarChartComponent.tsx   ← NEW
│   ├── StackedAreaChartComponent.tsx  ← NEW
│   ├── HorizontalBarChartComponent.tsx ← NEW
│   ├── BubbleChartComponent.tsx       ← NEW
│   ├── ComposedChartComponent.tsx     ← NEW
│   ├── GaugeChartComponent.tsx        ← NEW (standalone, not via ChartRenderer)
│   └── sections/
│       ├── ChartRenderer.tsx          ← 5 new case branches in bar-line-chart switch
│       └── GaugeChartRenderer.tsx     ← NEW (wraps GaugeChartComponent)
└── components/editor/property-forms/
    ├── BarLineChartForm.tsx           ← 5 new SelectItem entries
    └── GaugeChartForm.tsx             ← NEW
```

### Pattern 1: New chartType sub-variant (CHART-01, CHART-02, CHART-03, CHART-04, CHART-06)

**What:** Add a `case` to `ChartRenderer`'s `bar-line-chart` switch, create a dedicated component file.

**When to use:** When the new chart renders from a `bar-line-chart` section and the only differentiation is `chartType`.

**TypeScript type change:**
```typescript
// types/blueprint.ts — add 5 new values to ChartType union
export type ChartType = 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
  | 'stacked-bar' | 'stacked-area' | 'horizontal-bar' | 'bubble' | 'composed'
```

**Zod schema change:**
```typescript
// blueprint-schema.ts — extend enum in BarLineChartSectionSchema
chartType: z.enum([
  'bar', 'line', 'bar-line', 'radar', 'treemap', 'funnel', 'scatter', 'area',
  'stacked-bar', 'stacked-area', 'horizontal-bar', 'bubble', 'composed',
]),
```

**ChartRenderer dispatch pattern:**
```typescript
// ChartRenderer.tsx — new cases inside case 'bar-line-chart' switch
case 'stacked-bar':
  return <StackedBarChartComponent title={section.title} height={section.height} categories={section.categories} chartColors={chartColors} />
case 'stacked-area':
  return <StackedAreaChartComponent title={section.title} height={section.height} categories={section.categories} chartColors={chartColors} />
case 'horizontal-bar':
  return <HorizontalBarChartComponent title={section.title} height={section.height} categories={section.categories} xLabel={section.xLabel} yLabel={section.yLabel} chartColors={chartColors} />
case 'bubble':
  return <BubbleChartComponent title={section.title} height={section.height} xLabel={section.xLabel} yLabel={section.yLabel} chartColors={chartColors} />
case 'composed':
  return <ComposedChartComponent title={section.title} height={section.height} categories={section.categories} chartColors={chartColors} />
```

### Pattern 2: Stacked Bar (CHART-01)

**Recharts approach:** `BarChart` with multiple `Bar` components sharing `stackId="stack"`. Data shape has one entry per category with multiple numeric keys for series.

```typescript
// StackedBarChartComponent.tsx
// Source: https://recharts.github.io/en-US/examples/StackedBarChart/
const DEFAULT_DATA = [
  { category: 'Jan', serieA: 40, serieB: 24, serieC: 18 },
  // ... 12 entries
]

// Key: same stackId on all Bar elements
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
  <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <Tooltip />
  <Legend />
  <Bar dataKey="serieA" stackId="stack" fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} radius={[0,0,0,0]} />
  <Bar dataKey="serieB" stackId="stack" fill={chartColors?.[1] ?? 'var(--wf-chart-2)'} />
  <Bar dataKey="serieC" stackId="stack" fill={chartColors?.[2] ?? 'var(--wf-chart-3)'} radius={[3,3,0,0]} />
</BarChart>
```

**Pitfall:** Only the topmost stacked bar gets `radius={[3,3,0,0]}` (top corners). All others get `radius={[0,0,0,0]}`. If all bars get rounded corners, the visual breaks at stack seams.

### Pattern 3: Stacked Area (CHART-02)

**Recharts approach:** `AreaChart` with multiple `Area` components sharing `stackId="area"`. Gradient fills use `<defs>` with unique `id` per series.

```typescript
// StackedAreaChartComponent.tsx
// Key: stackId="area" on all Area elements
<AreaChart data={data}>
  <defs>
    <linearGradient id="areaFill0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color0} stopOpacity={0.3} />
      <stop offset="95%" stopColor={color0} stopOpacity={0.05} />
    </linearGradient>
    {/* repeat for each series with unique id */}
  </defs>
  <Area dataKey="serieA" stackId="area" stroke={color0} fill="url(#areaFill0)" />
  <Area dataKey="serieB" stackId="area" stroke={color1} fill="url(#areaFill1)" />
</AreaChart>
```

**Pitfall:** Each `linearGradient` must have a unique `id` (e.g., `areaFill0`, `areaFill1`). Duplicate SVG gradient IDs cause all series to use the same fill color.

### Pattern 4: Horizontal Bar (CHART-03)

**Recharts approach:** `BarChart layout="vertical"` with swapped axis types.

```typescript
// HorizontalBarChartComponent.tsx
// Source: https://recharts.github.io/en-US/api/BarChart/
<BarChart layout="vertical" data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
  <Tooltip />
  <Bar dataKey="value" fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} radius={[0, 3, 3, 0]} />
</BarChart>
```

**Key difference from vertical bar:**
- `XAxis` gets `type="number"` (values on X)
- `YAxis` gets `type="category"` + `dataKey="category"` (labels on Y)
- `Bar radius` becomes `[0, 3, 3, 0]` (right corners rounded, not top corners)
- `YAxis width={60}` needed to prevent label clipping

### Pattern 5: Bubble Chart (CHART-04)

**Recharts approach:** `ScatterChart` with `ZAxis` controlling circle radius. Data has `{ x, y, z }` shape where `z` is size value.

```typescript
// BubbleChartComponent.tsx
// Source: ZAxis confirmed in recharts API docs
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DEFAULT_DATA = [
  { x: 20, y: 45, z: 80 },   // z controls bubble size
  { x: 55, y: 72, z: 200 },
  // ...
]

<ScatterChart>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
  <XAxis type="number" dataKey="x" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <YAxis type="number" dataKey="y" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <ZAxis type="number" dataKey="z" range={[20, 400]} />
  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
  <Scatter data={DEFAULT_DATA} fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} fillOpacity={0.7} />
</ScatterChart>
```

**Key ZAxis facts:**
- `range={[20, 400]}` maps z values to pixel sizes (area, not radius)
- `fillOpacity={0.7}` avoids occlusion when bubbles overlap
- ZAxis does not render visually — pure size mapping

### Pattern 6: Gauge Chart (CHART-05) — new section type

**Recharts approach:** `PieChart` with two `Pie` components:
1. Zone arcs (`startAngle={180} endAngle={0}`) — 3 color segments (green/yellow/red target zones)
2. Custom SVG needle rendered as a `customized` prop or positioned via absolute CSS overlay

**Data shape for gauge section:**
```typescript
// types/blueprint.ts — new section type
export type GaugeChartSection = {
  type: 'gauge-chart'
  title: string
  value: number           // current value (e.g., 72)
  min?: number            // default 0
  max?: number            // default 100
  zones?: {
    label?: string
    value: number         // upper bound of zone
    color?: string        // optional override — else uses wf tokens
  }[]
  height?: number
}
```

**Zod schema:**
```typescript
const GaugeChartSectionSchema = z.object({
  type: z.literal('gauge-chart'),
  title: z.string(),
  value: z.number(),
  min: z.number().optional(),
  max: z.number().optional(),
  zones: z.array(z.object({
    label: z.string().optional(),
    value: z.number(),
    color: z.string().optional(),
  })).optional(),
  height: z.number().optional(),
})
```

**Needle calculation (semicircle gauge):**
```typescript
// Source: https://gist.github.com/emiloberg/ee549049ea0f6b83e25f1a1110947086 pattern
// startAngle=180 (left), endAngle=0 (right) — semicircle
// needle angle: 180 - (value - min) / (max - min) * 180 degrees
// Convert to radians for Math.cos/sin

const RADIAN = Math.PI / 180
function needleAngle(value: number, min: number, max: number): number {
  return 180 - ((value - min) / (max - min)) * 180
}
// SVG needle from (cx, cy) outward
const angle = needleAngle(value, min, max) * RADIAN
const needleX = cx + radius * 0.8 * Math.cos(angle)
const needleY = cy - radius * 0.8 * Math.sin(angle)  // Note: SVG Y is inverted
```

**Default zones when none specified:**
- 0–40: `var(--wf-negative)` (red)
- 40–70: `#f59e0b` (amber — not in wf tokens but standard)
- 70–100: `var(--wf-positive)` (green)

**GaugeChartComponent approach (pure SVG over PieChart):**
The `PieChart` handles the arc zones. The needle is an SVG `<line>` or `<path>` rendered inside `<Customized>` — Recharts 2.x provides `<Customized>` for injecting custom SVG into the chart SVG tree. Alternatively, it can be a small centered `<svg>` absolutely positioned over the ResponsiveContainer — simpler and avoids Recharts internals.

**Recommendation:** Use absolute-positioned SVG overlay for needle — avoids Recharts 2.x `Customized` prop complexities and `cx/cy` calculation from PieChart internals. The gauge container is `position: relative`, the needle SVG is `position: absolute inset-0`.

### Pattern 7: Composed Chart (CHART-06)

**Recharts approach:** `ComposedChart` with `Bar`, `Line`, and `Area` children. No `stackId` — each series is independent.

```typescript
// ComposedChartComponent.tsx
// Source: https://recharts.github.io/en-US/examples/LineBarAreaComposedChart/
const DEFAULT_DATA = [
  { category: 'Jan', bar: 40, line: 65, area: 28 },
  // ...
]

<ComposedChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--wf-card-border)" />
  <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <Tooltip />
  <Legend />
  <Bar dataKey="bar" fill={chartColors?.[0] ?? 'var(--wf-chart-1)'} radius={[3,3,0,0]} />
  <Area type="monotone" dataKey="area" fill={chartColors?.[2] ?? 'var(--wf-chart-3)'} stroke={chartColors?.[2] ?? 'var(--wf-chart-3)'} fillOpacity={0.2} />
  <Line type="monotone" dataKey="line" stroke={chartColors?.[1] ?? 'var(--wf-chart-2)'} strokeWidth={2} dot={false} />
</ComposedChart>
```

**Render order matters:** In `ComposedChart`, elements render in declaration order. Bars first, then Area (fills), then Line (on top). This produces correct visual layering.

### Pattern 8: New section type registry entry (CHART-05)

Following the exact pattern of every existing section type in `section-registry.tsx`:

```typescript
// section-registry.tsx
import GaugeChartRenderer from '../components/sections/GaugeChartRenderer'
import GaugeChartForm from '../components/editor/property-forms/GaugeChartForm'
import { GaugeChartSectionSchema } from './blueprint-schema'

// In SECTION_REGISTRY:
'gauge-chart': {
  renderer: GaugeChartRenderer as unknown as ComponentType<SectionRendererProps>,
  propertyForm: GaugeChartForm as unknown as ComponentType<PropertyFormProps>,
  catalogEntry: {
    type: 'gauge-chart',
    label: 'Gauge',
    description: 'Medidor radial com zonas e valor atual',
    icon: Gauge,       // lucide-react
    category: 'Graficos',
  },
  defaultProps: () => ({
    type: 'gauge-chart' as const,
    title: 'Novo Gauge',
    value: 65,
    min: 0,
    max: 100,
  }),
  schema: GaugeChartSectionSchema,
  label: 'Gauge',
},
```

**Note:** `Gauge` icon is available in lucide-react ^0.460.0.

### Anti-Patterns to Avoid

- **Extending `BarLineChartSection` with optional fields for gauge data:** The gauge is fundamentally different (it has `value`, `min`, `max`, zones) — it must be a separate section type, not a `chartType` variant. The STATE.md decision confirms: "Only 1 new section type in registry (gauge-chart), rest are chartType sub-variants."
- **Using duplicate SVG gradient IDs in stacked area:** Each gradient must have a unique `id` attribute or they collide in the shared SVG DOM.
- **Applying `radius` to all stacked bars equally:** Only the topmost bar in a stack should have top corner radius. Middle bars must have `radius={[0,0,0,0]}`.
- **Placing gauge needle inside Recharts' `Customized` component:** This requires accessing PieChart internals (cx, cy, innerRadius from chart context). The absolutely-positioned SVG overlay approach is simpler and equally correct for a wireframe mock.
- **Using `layout="horizontal"` for horizontal bar:** The prop value is `"vertical"` — the axis is vertical (categories on Y), which makes bars horizontal. Counterintuitive naming.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stacked chart data aggregation | Custom reducer | Raw mock data shape `[{ cat, s1, s2, s3 }]` | Recharts stacks by `stackId` — data format IS the aggregation |
| Circle size scaling for bubbles | Manual radius math | `ZAxis range={[min, max]}` | Recharts maps z-values to pixel areas automatically |
| Gauge arc drawing | Custom SVG path math | `PieChart + Pie startAngle/endAngle` | Recharts renders the arcs; only needle is custom SVG |
| Legend rendering | Custom HTML legend | Recharts `<Legend />` | Built-in, respects `chartColors` via dataKey matching |
| Tooltip formatting | Custom tooltip HTML | Recharts `<Tooltip formatter=...>` | Consistent with existing chart components |

---

## Common Pitfalls

### Pitfall 1: ChartType enum out of sync between TS type and Zod schema
**What goes wrong:** TypeScript type allows `'stacked-bar'` but Zod schema still has the old enum — blueprint Zod parse fails silently at runtime.
**Why it happens:** Two separate definitions (`types/blueprint.ts` and `lib/blueprint-schema.ts`).
**How to avoid:** Update both in the same task. The `blueprint-schema.test.ts` Phase 20 test block should assert each new chartType passes `BarLineChartSectionSchema.safeParse`.
**Warning signs:** `result.success === false` in schema tests.

### Pitfall 2: Section registry count mismatch breaks `section-registry.test.ts`
**What goes wrong:** Adding `gauge-chart` makes the registry have 22 entries, but the test has `expect(Object.keys(SECTION_REGISTRY)).toHaveLength(21)`.
**Why it happens:** The test hard-codes the count and the `ALL_SECTION_TYPES` array.
**How to avoid:** Update `section-registry.test.ts` in the same commit as the registry entry — add `'gauge-chart'` to `ALL_SECTION_TYPES` array and update the `toHaveLength` assertion to 22.
**Warning signs:** `section-registry.test.ts` fails with "Expected 21, received 22."

### Pitfall 3: `GaugeChartSection` not added to `BlueprintSection` union
**What goes wrong:** `SectionRenderer` switch falls through to `null` for `gauge-chart` sections — nothing renders.
**Why it happens:** `BlueprintSection` in `types/blueprint.ts` is a TypeScript union that must be updated alongside the Zod discriminated union in `blueprint-schema.ts`.
**How to avoid:** Add `GaugeChartSection` to both the TS union and the Zod `nonRecursiveSections` array in the same task.

### Pitfall 4: Gauge needle mispositioning in responsive container
**What goes wrong:** Needle points to wrong position because `cx`/`cy` were hardcoded based on fixed width.
**Why it happens:** Absolute pixel positions for needle math assume known container dimensions.
**How to avoid:** Use `percentage` values for `cx` (e.g., `cx="50%"`) in the Pie component, and calculate needle SVG positions from the `viewBox` of the absolute-positioned SVG overlay rather than from PieChart internals. The overlay SVG uses `viewBox="0 0 200 110"` (fixed coordinate space) for predictable needle math regardless of container width.

### Pitfall 5: BarLineChartForm missing new SelectItem entries
**What goes wrong:** The visual editor can't select the 5 new chartTypes — they only work when specified directly in `blueprint.config.ts`.
**Why it happens:** `BarLineChartForm.tsx` has a hardcoded `SelectContent` with explicit `SelectItem` entries for each chartType.
**How to avoid:** Add 5 new `SelectItem` entries when adding new chartTypes. They must match the enum values exactly.

### Pitfall 6: `blueprint-schema.test.ts` Phase 17 test "accepts 15 section types" becomes stale
**What goes wrong:** The comment "all 15 section types" in the fixture is misleading but the actual assertion (`toHaveLength(15)`) will pass because it counts the `allSections` fixture, not the registry.
**Why it happens:** The test fixture `allSections` doesn't include `gauge-chart` automatically.
**How to avoid:** The existing test is scoped to Phase 17 fixtures — add a Phase 20 describe block with `gauge-chart` specific tests rather than modifying the existing fixture.

---

## Code Examples

### Stacked Bar (CHART-01)
```typescript
// StackedBarChartComponent.tsx — key structure
// Source: recharts.github.io/en-US/examples/StackedBarChart/ pattern
const DEFAULT_CATEGORIES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const SERIES_KEYS = ['serieA', 'serieB', 'serieC']

function buildMockData(categories: string[]) {
  return categories.map((cat, i) => ({
    category: cat,
    serieA: 30 + Math.round(Math.sin(i * 0.7) * 15 + i * 2),
    serieB: 20 + Math.round(Math.sin(i * 0.5) * 10 + i * 1.5),
    serieC: 15 + Math.round(Math.sin(i * 0.9) * 8 + i * 1),
  }))
}

// Only last Bar gets top radius
<Bar dataKey="serieA" stackId="stack" fill={palette[0]} radius={[0,0,0,0]} />
<Bar dataKey="serieB" stackId="stack" fill={palette[1]} radius={[0,0,0,0]} />
<Bar dataKey="serieC" stackId="stack" fill={palette[2]} radius={[3,3,0,0]} />
```

### Horizontal Bar (CHART-03)
```typescript
// HorizontalBarChartComponent.tsx — axis swap pattern
// Source: recharts.github.io/en-US/api/BarChart/ layout prop
<BarChart layout="vertical" data={data}>
  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
  <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
  <Bar dataKey="value" fill={palette[0]} radius={[0, 3, 3, 0]} />
</BarChart>
```

### Bubble Chart (CHART-04)
```typescript
// BubbleChartComponent.tsx — ZAxis for size scaling
// Source: recharts ZAxis API (dataKey + range)
<ScatterChart>
  <ZAxis type="number" dataKey="z" range={[20, 400]} />
  <Scatter data={data} fill={palette[0]} fillOpacity={0.7} />
</ScatterChart>
```

### Gauge (CHART-05) — zone arcs + needle
```typescript
// GaugeChartComponent.tsx — PieChart semicircle + SVG needle
const RADIAN = Math.PI / 180

function needlePath(value: number, min: number, max: number, cx: number, cy: number, radius: number): string {
  const pct = (value - min) / (max - min)
  const angleDeg = 180 - pct * 180  // 180=left, 0=right
  const rad = angleDeg * RADIAN
  const x = cx + radius * Math.cos(rad)
  const y = cy - radius * Math.sin(rad)  // SVG Y inverted
  return `M ${cx} ${cy} L ${x} ${y}`
}

// Zone data for Pie (values are arc size, not boundaries)
const zones = [
  { name: 'danger',  value: 40,  fill: 'var(--wf-negative)' },
  { name: 'warning', value: 30,  fill: '#f59e0b' },
  { name: 'ok',      value: 30,  fill: 'var(--wf-positive)' },
]

<PieChart>
  <Pie data={zones} startAngle={180} endAngle={0}
    innerRadius="55%" outerRadius="75%"
    cx="50%" cy="90%" dataKey="value" isAnimationActive={false}>
    {zones.map((z, i) => <Cell key={i} fill={z.fill} />)}
  </Pie>
</PieChart>
// SVG needle overlay (absolutely positioned)
```

**Note on Pie `cy="90%"`:** For a semicircle gauge to fit in the card without cropping, `cy` should be ~90% of the container height so the flat edge sits at the bottom. Combined with a narrower `height` prop (default 180px), the gauge fits comfortably in the card.

### Composed Chart (CHART-06)
```typescript
// ComposedChartComponent.tsx — multi-series
// Source: recharts.github.io/en-US/examples/LineBarAreaComposedChart/
// Render order: Bar → Area → Line (Line on top)
<ComposedChart data={data}>
  <Bar dataKey="bar" fill={palette[0]} radius={[3,3,0,0]} />
  <Area type="monotone" dataKey="area" stroke={palette[2]} fill={palette[2]} fillOpacity={0.15} />
  <Line type="monotone" dataKey="line" stroke={palette[1]} strokeWidth={2} dot={false} />
</ComposedChart>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Existing `scatter` chartType (no z-dim) | New `bubble` chartType (ZAxis z-dim) | Phase 20 | Bubble chart replaces basic scatter for 3D data; old `scatter` remains for 2D scatter |
| No radial/gauge section | `gauge-chart` section type | Phase 20 | First radial chart in the wireframe library |
| `bar-line` (dual-axis combo) | `composed` (Bar+Line+Area single axis) | Phase 20 | `composed` is more flexible; `bar-line` is preserved for backward compat |

**Note:** The existing `scatter` chartType is kept — it remains the 2D scatter plot. `bubble` is an additive variant.

---

## Open Questions

1. **Gauge: SVG overlay vs Recharts `Customized`**
   - What we know: Both approaches work; overlay is simpler but requires `position: relative` wrapper
   - What's unclear: Whether `Customized` is fully stable in Recharts 2.13.x for accessing chart coordinates
   - Recommendation: Use absolute-positioned SVG overlay with fixed `viewBox` — simpler, more predictable, no Recharts internals dependency

2. **Composed chart: single Y axis vs dual Y axis**
   - What we know: Existing `bar-line` chart already uses dual Y axes (left + right). Composed chart with Bar+Line+Area on a single Y axis is a different use case
   - What's unclear: Whether users will want dual-axis composed charts
   - Recommendation: Single Y axis for `composed` — cleaner for wireframe mocks. Dual-axis is covered by existing `bar-line`.

3. **BarLineChartForm: whether to add series config UI for `composed`**
   - What we know: Composed chart always shows 3 fixed series (bar, line, area) with mock data
   - What's unclear: Whether property form needs series count control
   - Recommendation: No series config UI for Phase 20 — fixed 3 series with mock data is sufficient for wireframe purposes. SKILL.md says "Comportamentos tecnicos ficam internos aos componentes."

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `/Users/cauetpinciara/Documents/fxl/fxl-core/vitest.config.ts` |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHART-01 | `chartType: 'stacked-bar'` parses in `BarLineChartSectionSchema` | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts -t "Phase 20"` | ❌ Wave 0 (add describe block) |
| CHART-02 | `chartType: 'stacked-area'` parses in schema | unit | same command | ❌ Wave 0 |
| CHART-03 | `chartType: 'horizontal-bar'` parses in schema | unit | same command | ❌ Wave 0 |
| CHART-04 | `chartType: 'bubble'` parses in schema | unit | same command | ❌ Wave 0 |
| CHART-05 | `GaugeChartSectionSchema` accepts `{ type: 'gauge-chart', title, value }` | unit | same command | ❌ Wave 0 |
| CHART-05 | `gauge-chart` registered in `SECTION_REGISTRY` with renderer, form, schema, defaultProps | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts` | ❌ Wave 0 (update ALL_SECTION_TYPES + count) |
| CHART-06 | `chartType: 'composed'` parses in schema | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts -t "Phase 20"` | ❌ Wave 0 |
| ALL | defaultProps() for gauge-chart produces valid Zod-parseable object | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts` | auto (existing loop) |
| ALL | Visual render correct | manual | Open wireframe viewer with test blueprint | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run tools/wireframe-builder/lib/ --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose` + `npx tsc --noEmit`
- **Phase gate:** Full suite green + zero TypeScript errors before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `blueprint-schema.test.ts` — add `describe('Phase 20 — new chartType values and gauge-chart section', ...)` block with tests for all 5 new chartType enum values + GaugeChartSectionSchema
- [ ] `section-registry.test.ts` — update `ALL_SECTION_TYPES` array to include `'gauge-chart'` and change `toHaveLength(21)` to `toHaveLength(22)`

*(All other test infrastructure exists — Vitest, config, aliases all operational from Phase 19)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `tools/wireframe-builder/types/blueprint.ts`, `lib/blueprint-schema.ts`, `lib/section-registry.tsx`, `components/sections/ChartRenderer.tsx`, all existing chart component files — all architectural patterns verified
- `node -e "require('recharts')"` — confirmed `RadialBarChart`, `PieChart`, `Pie`, `Cell`, `ScatterChart`, `ZAxis`, `ComposedChart`, `Bar`, `Area`, `Line`, `Legend` all exported from recharts 2.13.3 in project node_modules
- `.planning/STATE.md` decisions — "Only 1 new section type in registry (gauge-chart), rest are chartType sub-variants" and "Zero new npm packages -- Recharts 2.x covers everything"

### Secondary (MEDIUM confidence)
- [Recharts BarChart API](https://recharts.github.io/en-US/api/BarChart/) — `layout` prop, `stackId` behavior verified via web fetch
- [Recharts ScatterChart API](https://recharts.github.io/en-US/api/ScatterChart/) — ZAxis `dataKey` and `range` props confirmed via search + Snyk advisor
- [Recharts Bubble Chart Example](https://recharts.github.io/en-US/examples/BubbleChart/) — `ZAxis range={[60, 400]}` confirmed in search result snippet
- [Recharts PieChartWithNeedle](https://recharts.github.io/en-US/examples/PieChartWithNeedle/) — gauge approach confirmed as PieChart + custom SVG needle

### Tertiary (LOW confidence — pattern only, not verified against 2.13.3 source)
- Gauge needle SVG approach — based on `emiloberg` gist pattern (verified approach type: PieChart zones + SVG needle, implementation details inferred from community examples)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all Recharts exports confirmed present in project node_modules
- Architecture (chart sub-variants): HIGH — follows exact existing pattern from Phase 19 research and all prior chart components
- Architecture (gauge section type): HIGH — follows exact existing section type registration pattern
- Recharts API (stacked, horizontal, composed): HIGH — axis config and stackId verified via official docs
- Recharts API (ZAxis bubble): MEDIUM — API confirmed, `range` prop behavior inferred from search results matching docs
- Gauge needle implementation: MEDIUM — PieChart approach confirmed, SVG needle detail is inferred pattern

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (Recharts 2.x stable; patterns unlikely to change)
