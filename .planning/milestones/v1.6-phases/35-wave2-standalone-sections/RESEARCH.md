# Phase 35 Research: Wave 2 — Standalone Section Types

**Phase:** 35
**Milestone:** v1.6 — 12 Novos Graficos
**Researched:** 2026-03-12
**Requirements:** SECT-01, SECT-02, SECT-03, SECT-04, XCUT-06

---

## Goal

Register 4 new standalone section types in the section registry: Pie Chart, Progress Grid, Heatmap, and Sparkline Grid. Each must follow the 5-file checklist (Extension Point B) and be fully functional in the wireframe editor.

---

## Architecture Context

### Extension Point B — Standalone Section Type

Each new standalone section type requires changes in these files:

**3 new files per type:**
1. `tools/wireframe-builder/components/[Name]Component.tsx` — leaf component (Recharts or CSS)
2. `tools/wireframe-builder/components/sections/[Name]Renderer.tsx` — thin cast layer
3. `tools/wireframe-builder/components/editor/property-forms/[Name]Form.tsx` — editor UI

**3 shared files (additive edits only):**
4. `tools/wireframe-builder/types/blueprint.ts` — new type + add to `BlueprintSection` union
5. `tools/wireframe-builder/lib/blueprint-schema.ts` — new Zod schema + add to `nonRecursiveSections[]`
6. `tools/wireframe-builder/lib/section-registry.tsx` — new `SECTION_REGISTRY` entry

**1 test file (mandatory update):**
7. `tools/wireframe-builder/lib/section-registry.test.ts` — add to `ALL_SECTION_TYPES[]` + update `toHaveLength()`

### Current State

- Section registry: 23 entries (current `toHaveLength(23)`)
- After Phase 35: 27 entries (`toHaveLength(27)`)
- `BlueprintSection` union: 23 types in `types/blueprint.ts`
- `nonRecursiveSections` array: 22 schemas in `blueprint-schema.ts`
- Chart palette: 5 CSS vars (`--wf-chart-1` through `--wf-chart-5`) + `chartColors?: string[]` prop

### Phase 34 Dependency

Phase 35 depends on Phase 34 (Wave 1 — ChartType Sub-Variants). Phase 34 adds 7 new `chartType` values to `BarLineChartSectionSchema` but does NOT add any standalone section types. The registry count remains 23 after Phase 34. Phase 35 bumps it to 27.

---

## Per-Type Research

### 1. Pie Chart (SECT-01)

**What it is:** Full-circle pizza chart (no center hole). Recharts `<PieChart>` with `<Pie innerRadius={0}>`.

**Decision: New standalone type, NOT a donut variant.**
Per ARCHITECTURE.md anti-pattern 4: "Register `pie-chart` as a new standalone section type. The leaf component is a Recharts PieChart without innerRadius — a small, clean component." This preserves discriminated union semantics.

**Data shape:**
```typescript
type PieChartSection = {
  type: 'pie-chart'
  title: string
  height?: number
  slices?: { label: string; value: number }[]
}
```

**Implementation:** Nearly identical to existing `DonutChart.tsx` but with `innerRadius={0}` and no center value. Uses Recharts `<PieChart>`, `<Pie>`, `<Cell>`, `<Legend>`, `<Tooltip>`. Must use `chartColors` prop (not CSS vars) for Legend swatches (Pitfall 5).

**Existing reference:** `DonutChart.tsx` (lines 1-73), `DonutChartForm.tsx`

**Complexity:** LOW — mirrors donut pattern closely.

---

### 2. Progress Grid (SECT-04)

**What it is:** Vertical list of metric rows with: label, current value, target marker line, max value, and horizontal progress bar. Pure CSS/HTML — no Recharts.

**Distinction from existing `progress-bar`:** The existing section shows `value/max` as percentage. Progress Grid adds an explicit `target` field (separate from `max`), numeric value display, and a target marker line on the bar.

**Data shape:**
```typescript
type ProgressGridItem = {
  label: string
  current: number
  target: number
  max: number
}

type ProgressGridSection = {
  type: 'progress-grid'
  title: string
  items: ProgressGridItem[]
}
```

**Key pitfall (from PITFALLS.md):** `max` must be a required numeric field, not optional. If `max` is 0 or undefined, bars render as NaN. All three values (`current`, `target`, `max`) are required per item.

**Implementation:** Pure CSS bars using the same `color-mix(in srgb, ...)` pattern from `ProgressBarRenderer.tsx`. Target marker is an absolute-positioned thin vertical line at `(target/max)*100%`. Status color logic: `current >= target ? --wf-positive : current >= target*0.8 ? --wf-chart-warn : --wf-negative`.

**Existing reference:** `ProgressBarRenderer.tsx` (lines 1-67) — bar rendering pattern

**Complexity:** LOW-MEDIUM — extends proven pattern with target marker.

---

### 3. Heatmap (SECT-02)

**What it is:** 2D matrix of colored cells where color intensity encodes a numeric value. Pure CSS grid — no Recharts.

**Data shape:**
```typescript
type HeatmapSection = {
  type: 'heatmap'
  title: string
  rows: {
    label: string
    cells: number[]
  }[]
  colLabels?: string[]
  height?: number
}
```

**Key decisions:**
- Pure CSS grid layout (NOT Recharts — no native heatmap component)
- `color-mix(in srgb, var(--wf-chart-1) XX%, var(--wf-card))` for intensity encoding
- Cell hover tooltip via `title` attribute (not a custom tooltip component)
- Uses `--wf-*` tokens for borders, backgrounds, text — works in both light/dark mode
- `chartColors?.[0]` for the intensity base color

**Key pitfall (from PITFALLS.md):** `colLabels` and row labels should be present — users cannot interpret the chart without axis labels.

**Implementation:** CSS `display: grid` with `grid-template-columns: auto repeat(cols, 1fr)`. First column = row labels. Header row = column labels. Each cell gets background via inline `color-mix()`.

**Existing reference:** `ProgressBarRenderer.tsx` for `color-mix` pattern

**Complexity:** MEDIUM — novel layout, but no Recharts complexity.

---

### 4. Sparkline Grid (SECT-03)

**What it is:** Grid of small inline charts — each cell shows a mini line chart (no axes, no labels) alongside a metric label and current value.

**Data shape:**
```typescript
type SparklineGridItem = {
  label: string
  value: string
  data: number[]
  sparkType?: 'line' | 'bar' | 'area'
}

type SparklineGridSection = {
  type: 'sparkline-grid'
  title: string
  columns?: number
  items: SparklineGridItem[]
}
```

**Key decisions:**
- Uses Recharts `<LineChart>` (or `<BarChart>`/`<AreaChart>`) without `<XAxis>`, `<YAxis>`, `<CartesianGrid>` — axes hidden for sparkline effect
- Each mini-chart wrapped in `<ResponsiveContainer width="100%" height={40}>`
- CSS grid layout with configurable columns
- `isAnimationActive={false}` mandatory on all series elements

**Key pitfalls:**
- **ResponsiveContainer height:** Must use fixed numeric height (not `height="100%"`) to avoid collapse inside CSS grid cells (PITFALLS.md Performance Trap 1)
- **Default data:** Must NOT use all-zero arrays — sparklines should show visible trend in `defaultProps()` (PITFALLS.md UX Pitfall)

**Existing reference:** None directly, but Recharts without axes is a documented pattern. `AreaChartComponent.tsx` for Recharts patterns.

**Complexity:** MEDIUM — ResponsiveContainer inside CSS grid is the main risk.

---

## Shared File Edit Sequence

All 4 types modify 3 shared files. To avoid merge conflicts and ensure `tsc --noEmit` passes after each type, build types serially in this order:

1. **Pie Chart** — closest to existing donut pattern, validates Extension Point B end-to-end
2. **Progress Grid** — pure CSS, extends proven ProgressBar pattern
3. **Heatmap** — pure CSS, novel layout but no Recharts
4. **Sparkline Grid** — uses Recharts, ResponsiveContainer risk needs validation

After each type: run `npx tsc --noEmit` to verify compilation.
After all 4: update test count assertion to 27 and run test suite.

---

## Registry Category Assignment

| Section Type | Category | Icon (lucide-react) |
|-------------|----------|-------------------|
| pie-chart | Graficos | PieChart |
| progress-grid | Metricas | Target |
| heatmap | Graficos | Grid3x3 |
| sparkline-grid | KPIs | TrendingUp |

Note: `PieChart` icon is already imported in section-registry.tsx (used by donut-chart). Will need a different icon or the same one with a different label. Use `CircleDot` for pie-chart to distinguish from donut-chart's `PieChart` icon.

---

## Test Impact

Current `section-registry.test.ts`:
- `ALL_SECTION_TYPES` array: 23 entries
- `toHaveLength(23)` assertion
- `defaultProps <-> Zod round-trip` test covers all types

After Phase 35:
- `ALL_SECTION_TYPES`: 27 entries (add `'pie-chart'`, `'progress-grid'`, `'heatmap'`, `'sparkline-grid'`)
- `toHaveLength(27)` assertion
- Round-trip test automatically covers new types (no additional test code needed beyond adding to the array)

---

## Files Created (total)

| File | Type |
|------|------|
| `components/PieChartComponent.tsx` | Leaf component |
| `components/sections/PieChartRenderer.tsx` | Renderer |
| `components/editor/property-forms/PieChartForm.tsx` | Property form |
| `components/ProgressGridComponent.tsx` | Leaf component |
| `components/sections/ProgressGridRenderer.tsx` | Renderer |
| `components/editor/property-forms/ProgressGridForm.tsx` | Property form |
| `components/HeatmapComponent.tsx` | Leaf component |
| `components/sections/HeatmapRenderer.tsx` | Renderer |
| `components/editor/property-forms/HeatmapForm.tsx` | Property form |
| `components/SparklineGridComponent.tsx` | Leaf component |
| `components/sections/SparklineGridRenderer.tsx` | Renderer |
| `components/editor/property-forms/SparklineGridForm.tsx` | Property form |

**Total new files:** 12
**Modified shared files:** 4 (types/blueprint.ts, blueprint-schema.ts, section-registry.tsx, section-registry.test.ts)

---

## Sources

- Direct inspection: `tools/wireframe-builder/lib/section-registry.tsx` (23 entries, registry pattern)
- Direct inspection: `tools/wireframe-builder/lib/blueprint-schema.ts` (nonRecursiveSections array, Zod patterns)
- Direct inspection: `tools/wireframe-builder/types/blueprint.ts` (BlueprintSection union, type patterns)
- Direct inspection: `tools/wireframe-builder/components/DonutChart.tsx` (Recharts Pie pattern)
- Direct inspection: `tools/wireframe-builder/components/sections/ProgressBarRenderer.tsx` (CSS bar + color-mix pattern)
- Direct inspection: `tools/wireframe-builder/components/sections/GaugeChartRenderer.tsx` (standalone renderer pattern)
- Direct inspection: `tools/wireframe-builder/components/editor/property-forms/DonutChartForm.tsx` (slice form pattern)
- Direct inspection: `tools/wireframe-builder/components/editor/property-forms/GaugeChartForm.tsx` (simple form pattern)
- `.planning/research/ARCHITECTURE.md` — Extension Point B 5-file checklist
- `.planning/research/FEATURES.md` — Feature landscape per chart type
- `.planning/research/PITFALLS.md` — Per-type pitfalls and prevention
- `.planning/REQUIREMENTS.md` — SECT-01 through SECT-04, XCUT-06
- `tools/wireframe-builder/styles/wireframe-tokens.css` — --wf-* token definitions

---
*Research for Phase 35: Wave 2 — Standalone Section Types*
*Researched: 2026-03-12*
