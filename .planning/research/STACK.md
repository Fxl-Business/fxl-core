# Stack Research

**Domain:** Wireframe Builder — 12 New Chart/Section Types (v1.6)
**Researched:** 2026-03-12
**Confidence:** HIGH

> This is an additive research document. The base stack (React 18, TypeScript strict,
> Tailwind CSS 3, Vite 5, Recharts 2.13.3, lucide-react) is validated and unchanged.
> This document covers ONLY what is new or changed for the 12 new chart types.

---

## Executive Decision: Zero New Dependencies

All 12 chart types can be implemented using **Recharts 2.13.3 alone**, already installed.
No new npm packages are required. Each chart maps to a Recharts primitive or a custom
composition of existing Recharts primitives, with pure HTML/CSS for the two non-chart sections.

---

## Chart-by-Chart Recharts Mapping

### Wave 1 — chartType Sub-variants (bar-line-chart section type)

| Chart | Recharts Primitive | Implementation Strategy | Confidence |
|-------|--------------------|------------------------|------------|
| **Grouped Bar** | `BarChart` + multiple `Bar` | Multiple `Bar` components inside one `BarChart`. Recharts groups them automatically by category with no `stackId`. Standard `barCategoryGap` and `barGap` props control spacing. | HIGH |
| **Bullet Chart** | `BarChart` + `ReferenceLine` per category | Single thin `Bar` per category plus a background `Bar` (target range, low opacity). One `ReferenceLine` per row for the target marker. Best with `layout="vertical"`. | HIGH |
| **Step Line** | `LineChart` + `Line type="stepAfter"` | The `type` prop on `Line` natively accepts `"step"`, `"stepBefore"`, and `"stepAfter"`. No extra package. Verified in Recharts API docs. | HIGH |
| **Range Bar / Gantt** | `BarChart layout="vertical"` + `Bar` with `[start, end]` dataKey | In Recharts 2.x, a `Bar` `dataKey` can reference an array `[low, high]` to render floating/range bars. Standard approach for Gantt-style timelines. Pair with `XAxis type="number"`. | HIGH |
| **Bump Chart** | `LineChart` + `Line type="bump"` | The `Line` component's `type` prop supports `"bump"`, `"bumpX"`, and `"bumpY"` natively. Used for rank-over-time charts. Verified in official Recharts Line API docs. | HIGH |
| **Lollipop Chart** | `ComposedChart` + thin `Bar` + `Line` with custom dot | Thin `Bar` serves as the stem. A `Line` with `dot` rendered as a large `<circle>` via the custom `dot` prop makes the lollipop head. The `CustomizedDotLineChart` example in Recharts docs covers this pattern. | HIGH |
| **Polar / Rose Chart** | `RadialBarChart` + `RadialBar` | `RadialBarChart` is a standard Recharts component. When all bars share the same angle domain and only differ in length, it renders as a Nightingale/Rose chart. No separate library. | HIGH |

### Wave 2 — Standalone Section Types (new entries in section registry)

| Chart | Recharts Primitive | Implementation Strategy | Confidence |
|-------|--------------------|------------------------|------------|
| **Pie Chart** | `PieChart` + `Pie innerRadius={0}` | Identical to the existing `DonutChart` but `innerRadius={0}`. Recommend implementing as a `chartType: 'pie'` variant on the existing `donut-chart` section type to avoid schema duplication — both use the same `slices` data structure. | HIGH |
| **Heatmap** | Pure HTML/CSS grid | Recharts has no native Heatmap component. The ScatterChart workaround requires significant coordinate math. For wireframe purposes a CSS `grid` with color-coded cells using `--wf-*` tokens is simpler, produces cleaner code, and results in identical visual fidelity. Zero Recharts dependency. | HIGH |
| **Sparkline Grid** | `LineChart` (stripped) | A grid of mini `LineChart` instances, each with `XAxis hide`, `YAxis hide`, no `CartesianGrid`, no `Tooltip` — just a `Line` and `ResponsiveContainer`. The existing `KpiCard` already renders inline sparklines via this pattern. Reuse at grid scale. `react-sparklines` adds a dependency for what Recharts already handles. | HIGH |
| **Progress Grid** | Pure HTML/CSS | A CSS grid of labeled progress bars. `div` with Tailwind `w-[{pct}%]` and `--wf-*` token fills. The existing `ProgressBarRenderer` covers single bars; this is the grid variant of the same pattern. Zero Recharts dependency. | HIGH |
| **Sankey Diagram** | `Sankey` (native Recharts) | Recharts 2.x ships a `Sankey` component as a named export. Source-verified: it is NOT experimental — it is a standard public TypeScript class export (`export class Sankey extends PureComponent<Props, State>`). Required prop: `data: { nodes: Array<{name}>, links: Array<{source: number, target: number, value: number}> }`. | HIGH |

---

## Recommended Stack (Additions Only)

### Core Technologies

No changes. Recharts 2.13.3 already installed covers all 12 types.

### Supporting Libraries

No new packages required.

### Development Tools

No changes.

---

## Installation

```bash
# No new packages needed.
# All 12 chart types are implementable with existing recharts@2.13.3
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Recharts native `Sankey` | `react-sankey-chart` (npm) | Recharts ships Sankey natively. Adding a package for what is already available is unnecessary bundle weight. |
| Pure CSS grid for Heatmap | Recharts `ScatterChart` + custom `shape` | ScatterChart approach requires cell-coordinate math and custom SVG shapes. CSS grid is simpler, more readable, and achieves identical wireframe fidelity. |
| Pure CSS for Progress Grid | `@radix-ui/react-progress` (already installed) | Radix Progress is designed for accessible production UI. For wireframe mock data, plain `div` width utilities are sufficient and already the pattern in `ProgressBarRenderer`. |
| Recharts `LineChart` stripped | `react-sparklines` package | `react-sparklines` (borisyankov) is unmaintained (last commit 2021). A bare `LineChart` with hidden axes is the same visual output with zero new dependency. |
| Recharts `RadialBarChart` | `echarts-for-react` | ECharts has a more feature-rich polar/rose implementation, but adding the entire ECharts library (~1MB) for one chart type is not justified. Recharts `RadialBarChart` achieves wireframe-fidelity equivalence. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-sankey-chart` or `recharts-sankey` | Recharts 2.x ships Sankey as a named export with full TypeScript types | `import { Sankey } from 'recharts'` |
| `react-sparklines` | Unmaintained (2021), unnecessary for what Recharts already handles | Stripped `LineChart` (no axes, no grid, no tooltip) |
| `d3` direct imports | D3 is Recharts' internal dependency. Direct D3 usage creates version coupling and bypasses the section registry pattern | Recharts primitives or pure HTML/CSS |
| `@mui/x-charts` for Heatmap | Requires the full MUI ecosystem. Overkill for a wireframe mock | Pure CSS grid with `--wf-*` tokens |
| `react-google-charts` for Gantt | ~200kb external bundle, requires Google CDN. Not justified for one chart type | `BarChart` with `[start, end]` `dataKey` array |
| Recharts 3.x upgrade | Breaking API changes: new store-based architecture, `Cell` as primary API removed, different animation model. PROJECT.md explicitly defers this. | Stay on 2.13.3 |

---

## Stack Patterns by Variant

**For chartType sub-variants (Grouped Bar, Bullet, Step Line, Range Bar, Bump, Lollipop, Polar):**
- Add new `chartType` string literals to the `ChartType` union in `tools/wireframe-builder/types/blueprint.ts`
- Add a `case` in `ChartRenderer.tsx` inner switch on `section.chartType`
- Create one component file per chart in `tools/wireframe-builder/components/`
- Follow existing naming convention: `GroupedBarChartComponent.tsx`, `BulletChartComponent.tsx`, etc.

**For standalone sections (Heatmap, Sparkline Grid, Progress Grid, Sankey):**
- Add a new section type to the discriminated union in `blueprint.ts`
- Register in the section registry (v1.1 decision: one-file change to add a section type)
- Create a new renderer in `tools/wireframe-builder/components/sections/`
- Heatmap and Progress Grid: no Recharts import needed in those renderers

**For Pie Chart specifically:**
- Pie uses the same `slices: { label, value }[]` data structure as Donut
- Recommend `chartType: 'pie'` variant on the existing `donut-chart` section type
- Renderer change: `innerRadius={0}` instead of `"40%"` — trivial modification to `DonutChart.tsx`
- If a distinct schema is ever needed, a separate `pie-chart` section type can be added later

---

## Recharts 2.x Sankey — Key Integration Notes

```typescript
// Named export — no plugin, no separate package
import { Sankey } from 'recharts'

// Data shape (differs from all other Recharts charts)
// source and target are INDEX references to the nodes array, NOT names
type SankeyData = {
  nodes: Array<{ name: string }>
  links: Array<{
    source: number   // index into nodes[]
    target: number   // index into nodes[]
    value: number    // flow width
  }>
}

// Usage
<Sankey
  data={sankeyData}   // required
  width={960}
  height={500}
  nodePadding={50}
  nodeWidth={10}
/>
```

This `source`/`target` as index pattern is the primary integration gotcha — it differs
from every other Recharts chart that references data by key name.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `recharts` | 2.13.3 | React 18, TypeScript 5 strict | All 12 chart types covered natively |
| `recharts` `Cell` component | 2.13.3 | Deprecated for 4.x, functional in 2.x | Existing Gauge uses `Cell`. Continue using for 2.x. No action needed. |
| Recharts `Sankey` | 2.13.3 | Standard named export | Full TypeScript types: `SankeyData`, `SankeyNodeOptions`, `SankeyLinkOptions` |

---

## Sources

- [Recharts Sankey API](https://recharts.github.io/en-US/api/Sankey/) — Component props and data structure (HIGH)
- [Recharts Sankey source](https://github.com/recharts/recharts/blob/2.x/src/chart/Sankey.tsx) — Confirmed standard named export, no experimental marker (HIGH)
- [Recharts Line API](https://recharts.github.io/en-US/api/Line/) — `type` prop values including `"step"`, `"stepAfter"`, `"bump"`, `"bumpX"`, `"bumpY"` (HIGH)
- [Recharts RadialBarChart API](https://recharts.github.io/en-US/api/RadialBarChart/) — Native polar chart component (HIGH)
- [Recharts CustomizedDotLineChart example](https://recharts.github.io/en-US/examples/CustomizedDotLineChart/) — Custom dot pattern for lollipop implementation (HIGH)
- [Recharts Cell migration guide](https://recharts.github.io/en-US/guide/cell/) — Cell deprecated in 4.x, functional in 2.x (HIGH)
- [recharts-gantt-chart community repo](https://github.com/rudrodip/recharts-gantt-chart) — Proof of concept: BarChart with `[start, end]` dataKey for Gantt (MEDIUM)
- [Recharts BarChart API](https://recharts.github.io/en-US/api/BarChart/) — barCategoryGap, barGap, barSize props for grouped bar (HIGH)

---

*Stack research for: FXL Core v1.6 — 12 new chart/section types*
*Researched: 2026-03-12*
