# Phase 34 Research: Wave 1 — ChartType Sub-Variants

**Researched:** 2026-03-12
**Confidence:** HIGH

---

## Overview

Phase 34 adds 7 new `chartType` sub-variant values to the existing `bar-line-chart` section type via Extension Point A. This is the lowest-coordination-cost pattern in the wireframe builder — only 4 shared files change per chart (type union, Zod enum, ChartRenderer case, leaf component), plus the BarLineChartForm select.

---

## Extension Point A — 4-Point Atomic Sync

Each chartType sub-variant requires exactly 4 synchronized changes:

1. **`types/blueprint.ts`** — add literal to `ChartType` union (line ~69)
2. **`lib/blueprint-schema.ts`** — add literal to `BarLineChartSectionSchema.chartType` z.enum (line ~157)
3. **`components/sections/ChartRenderer.tsx`** — add `case` to inner switch (before `default:`)
4. **New leaf component file** — `components/[Name]ChartComponent.tsx`

Plus one editor touchpoint:
5. **`components/editor/property-forms/BarLineChartForm.tsx`** — add `<SelectItem>` to chartType picker

No registry changes, no test count changes, no new renderers or forms needed. The existing `bar-line-chart` registry entry, `BarLineChartForm`, and `ChartRenderer` handle everything.

---

## Current State of Shared Files

### ChartType union (types/blueprint.ts:69-82)

```typescript
export type ChartType =
  | 'bar' | 'line' | 'bar-line'
  | 'radar' | 'treemap' | 'funnel' | 'scatter' | 'area'
  | 'stacked-bar' | 'stacked-area' | 'horizontal-bar' | 'bubble' | 'composed'
```

13 values currently. After Phase 34: 20 values (+7).

### BarLineChartSectionSchema z.enum (blueprint-schema.ts:157-160)

```typescript
chartType: z.enum([
  'bar', 'line', 'bar-line', 'radar', 'treemap', 'funnel', 'scatter', 'area',
  'stacked-bar', 'stacked-area', 'horizontal-bar', 'bubble', 'composed',
]),
```

Must add same 7 values to stay in sync with the TypeScript union.

### ChartRenderer inner switch (ChartRenderer.tsx:45-153)

Currently 10 explicit cases (radar, treemap, funnel, scatter, area, stacked-bar, stacked-area, horizontal-bar, bubble, composed) plus a `default:` fallback that casts to legacy types (bar/line/bar-line).

**Critical pitfall:** The `default:` case silently renders a plain bar chart for any unrecognized chartType. If a new value is added to the union/schema but a case is missing in ChartRenderer, no TypeScript error occurs — the chart just renders incorrectly as a bar chart. This is why every chart must be verified visually after wiring.

### BarLineChartForm SelectContent (BarLineChartForm.tsx:47-59)

Currently 13 `<SelectItem>` entries. Must add 7 new entries with Portuguese labels.

---

## The 7 New ChartTypes

### 1. grouped-bar — Grouped Bar Chart

**Recharts approach:** `BarChart` with multiple `<Bar>` elements (no `stackId`). Each Bar has a different `dataKey` and color from `chartColors`.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 3 series (serieA, serieB, serieC) per category.
**Key details:**
- `barCategoryGap="20%"` and `barGap={4}` for visual separation
- Custom legend (same pattern as StackedBarChartComponent)
- `isAnimationActive={false}` on every `<Bar>` (XCUT-02)
- `chartColors` resolved hex for legend swatches (XCUT-01)

**Complexity:** LOW — mirrors StackedBarChartComponent minus `stackId`.

### 2. bullet — Bullet Chart

**Recharts approach:** `BarChart` with `layout="vertical"`, single `<Bar>` for actual value, `<ReferenceLine>` for target marker.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 3-5 metric rows, each with actual value and a target line.
**Key details:**
- Horizontal bars (layout="vertical" in Recharts) — same as HorizontalBarChartComponent
- `<ReferenceLine x={targetValue}>` with `stroke` from palette, `strokeDasharray="4 4"`
- No background reference bands in v1.6 (deferred to ENH-01)
- `isAnimationActive={false}` on `<Bar>` (XCUT-02)
- Height default 200 (shorter — compact horizontal display)

**Complexity:** MEDIUM — ReferenceLine positioning and horizontal layout.

### 3. step-line — Step Line Chart

**Recharts approach:** `AreaChart` with `<Area type="stepAfter">` for the stepped line effect with fill.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 12 months with discrete-step values (pricing tier changes).
**Key details:**
- `type="stepAfter"` on `<Area>` — native Recharts prop, confirmed
- Gradient fill under step line (same pattern as AreaChartComponent)
- `isAnimationActive={false}` on `<Area>` (XCUT-02)
- No `<Legend>` needed (single series)

**Complexity:** LOW — near-identical to AreaChartComponent with one prop change.

### 4. lollipop — Lollipop Chart

**Recharts approach:** `ComposedChart` with thin `<Bar barSize={2}>` for sticks + `<Scatter>` for dot heads.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 8 categories with varying values.
**Key details:**
- `<Bar barSize={2}>` creates thin vertical sticks
- `<Scatter>` overlaid at the same data points creates the circles
- Data shape: `{ category, value }[]` — Scatter needs `{ category, value }[]` with numeric index for positioning
- `isAnimationActive={false}` on both `<Bar>` and `<Scatter>` (XCUT-02)
- Single palette color for both stick and dot

**Complexity:** MEDIUM — ComposedChart with Bar+Scatter overlay requires careful data alignment.

### 5. range-bar — Range Bar (CSS-Flex)

**Recharts approach:** NOT Recharts. Pure HTML/CSS flex rows per the STATE.md decision.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 5-6 rows with label, start, end, max values.
**Key details:**
- Each row: label div + flex bar container with `marginLeft: (start/max)*100%` and `width: ((end-start)/max)*100%`
- Uses `--wf-card`, `--wf-card-border`, `--wf-muted`, `--wf-heading` tokens
- Color per row from `chartColors[i % n]`
- No Recharts dependency — follows CompositionBar pattern
- `isAnimationActive` not applicable (no Recharts)
- Light/dark mode works via --wf-* tokens

**Complexity:** MEDIUM — CSS layout math for start/end positioning.

### 6. bump — Bump Chart

**Recharts approach:** `LineChart` with multiple `<Line>` elements + `<YAxis reversed>`.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 4 entities ranked across 6 time periods with rank crossings.
**Key details:**
- `<YAxis reversed domain={[1, entityCount]} tickCount={entityCount}>` — rank 1 at top
- Multiple `<Line>` elements, one per entity, each with different color from palette
- End-of-line labels: custom `dot` render prop on last data point showing entity name
- `type="monotone"` for smooth rank transitions
- `isAnimationActive={false}` on every `<Line>` (XCUT-02)
- Custom legend showing entity names with palette colors

**Complexity:** MEDIUM-HIGH — custom dot render for end-of-line labels + reversed Y axis.

### 7. polar — Polar/Rose Chart

**Recharts approach:** `RadialBarChart` with `<RadialBar>` and `<Cell>` per arc.
**Props:** Standard `{ title, height?, categories?, chartColors? }`
**Mock data:** 5-6 categories with values representing arc extent.
**Key details:**
- `<RadialBarChart>` with `cx="50%" cy="50%"` and `innerRadius="20%" outerRadius="90%"`
- Each data item gets a `<Cell fill={chartColors[i]}>` for per-arc coloring
- `<Tooltip>` for data reading on hover
- Custom legend showing category labels with colors
- `isAnimationActive={false}` on `<RadialBar>` (XCUT-02)

**Complexity:** LOW — native RadialBarChart, similar to existing RadarChartComponent.

---

## Shared Pattern for All 7 Components

All leaf components follow the established convention from existing chart components:

```typescript
// Card wrapper
<div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
  <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
  {/* Custom legend if multi-series */}
  <ResponsiveContainer width="100%" height={height}>
    {/* Chart content */}
  </ResponsiveContainer>
</div>
```

Palette resolution:
```typescript
const palette = chartColors ?? [
  'var(--wf-chart-1)', 'var(--wf-chart-2)', 'var(--wf-chart-3)',
  'var(--wf-chart-4)', 'var(--wf-chart-5)',
]
```

Axis styling:
```typescript
tick={{ fill: 'var(--wf-muted)', fontSize: 11 }}
tickLine={false}
axisLine={false}
```

---

## Plan Splitting Decision

The 7 charts split naturally into 2 plans:

**Plan 01: Schema + 4 simpler charts (Grouped Bar, Step Line, Lollipop, Polar)**
- All 7 ChartType literals added to union and Zod enum in one shot (prevents partial compilation)
- All 7 SelectItem entries added to BarLineChartForm in one shot
- 4 leaf components + 4 ChartRenderer cases
- Rationale: Grouped Bar (LOW), Step Line (LOW), Lollipop (MEDIUM), Polar (LOW) — all use Recharts

**Plan 02: 3 remaining charts (Range Bar, Bump, Bullet)**
- 3 leaf components + 3 ChartRenderer cases
- Rationale: Range Bar (MEDIUM, CSS-only), Bump (MEDIUM-HIGH, custom dots), Bullet (MEDIUM, ReferenceLine) — more complex implementations

This split balances plan size (4+3) and complexity (lower first, harder second).

---

## Verification Strategy

After each plan:
1. `npx tsc --noEmit` — zero errors
2. `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` — existing tests pass
3. `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts` — still 23 entries (no standalone types added)
4. Visual check: each new chartType renders correctly via the wireframe editor
5. Light/dark mode check for each new component

---

## Sources

All findings from direct codebase inspection:
- `tools/wireframe-builder/types/blueprint.ts` — ChartType union, BarLineChartSection
- `tools/wireframe-builder/lib/blueprint-schema.ts` — Zod enum in BarLineChartSectionSchema
- `tools/wireframe-builder/components/sections/ChartRenderer.tsx` — dispatch pattern, default: silent fallback
- `tools/wireframe-builder/components/editor/property-forms/BarLineChartForm.tsx` — SelectItem entries
- `tools/wireframe-builder/components/StackedBarChartComponent.tsx` — reference pattern (grouped bar)
- `tools/wireframe-builder/components/AreaChartComponent.tsx` — reference pattern (step line)
- `tools/wireframe-builder/components/ComposedChartComponent.tsx` — reference pattern (lollipop)
- `tools/wireframe-builder/components/HorizontalBarChartComponent.tsx` — reference pattern (bullet)
- `tools/wireframe-builder/components/RadarChartComponent.tsx` — reference pattern (polar)
- `tools/wireframe-builder/lib/useWireframeChartPalette.ts` — chartColors resolution
- `.planning/research/SUMMARY.md` — pitfalls and architecture guidance
- `.planning/research/FEATURES.md` — feature specs per chart type
- `.planning/research/ARCHITECTURE.md` — Extension Point A pattern

---

*Research for Phase 34 completed: 2026-03-12*
