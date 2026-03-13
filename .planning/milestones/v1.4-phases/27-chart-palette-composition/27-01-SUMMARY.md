---
phase: 27-chart-palette-composition
plan: "01"
subsystem: wireframe-builder/charts
tags: [charts, recharts, restyle, legend, activeBar, v1.4]
dependency_graph:
  requires: [phase-22-token-foundation, phase-24-kpi-cards, phase-25-table-components]
  provides: [CHRT-01, CHRT-02, CHRT-03, CHRT-04]
  affects: [tools/wireframe-builder/components]
tech_stack:
  added: []
  patterns:
    - Custom rounded-full dot legend (HTML spans + CSS var) replacing Recharts <Legend /> in stacked charts
    - Recharts activeBar prop for muted-to-full opacity hover on bar charts
key_files:
  created: []
  modified:
    - tools/wireframe-builder/components/BarLineChart.tsx
    - tools/wireframe-builder/components/StackedBarChartComponent.tsx
    - tools/wireframe-builder/components/HorizontalBarChartComponent.tsx
    - tools/wireframe-builder/components/AreaChartComponent.tsx
    - tools/wireframe-builder/components/StackedAreaChartComponent.tsx
    - tools/wireframe-builder/components/DonutChart.tsx
    - tools/wireframe-builder/components/WaterfallChart.tsx
    - tools/wireframe-builder/components/ParetoChart.tsx
    - tools/wireframe-builder/components/ComposedChartComponent.tsx
    - tools/wireframe-builder/components/GaugeChartComponent.tsx
    - tools/wireframe-builder/components/RadarChartComponent.tsx
    - tools/wireframe-builder/components/ScatterChartComponent.tsx
    - tools/wireframe-builder/components/FunnelChartComponent.tsx
    - tools/wireframe-builder/components/BubbleChartComponent.tsx
    - tools/wireframe-builder/components/TreemapComponent.tsx
decisions:
  - "[Phase 27-01] StackedBarChart activeBar applied in Task 1 write to avoid duplicate edit pass — both opacity and Legend removal done in single rewrite"
  - "[Phase 27-01] WaterfallChart hidden Legend (display: none) preserved — required for Recharts internal tooltip pairing in compareMode"
  - "[Phase 27-01] GaugeChartComponent title uses mb-2 (not mb-3) — preserved as-is per plan spec"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-11"
  tasks_completed: 2
  files_modified: 15
---

# Phase 27 Plan 01: Chart Palette Composition Summary

**One-liner:** Restyled 15 Recharts chart components to rounded-xl shadow-sm containers, font-bold titles, custom CSS-var-aware rounded-full dot legends, and activeBar muted-to-full opacity on bar charts.

## What Was Built

Applied the v1.4 premium financial dashboard aesthetic to all 15 chart components in the wireframe builder.

### Task 1: Container + title + legend restyle (15 files)
- **Container:** `rounded-lg` → `rounded-xl` + added `shadow-sm` on all 15 outermost card divs
- **Title:** `font-semibold` → `font-bold` on all 15 title `<p>` elements
- **WaterfallChart:** Two card divs updated (compareMode and simple view); title in compareMode is inside a flex row
- **GaugeChartComponent:** Title uses `mb-2` (not `mb-3`) — preserved as specified
- **Custom legend dots (3 charts):** Replaced Recharts `<Legend />` with custom `rounded-full` dot rows in `StackedBarChartComponent`, `StackedAreaChartComponent`, `ComposedChartComponent`
  - Removed `Legend` from recharts import in all three
  - Added `legendItems` array using palette CSS vars (`var(--wf-chart-1)` etc.) passed via inline `style={{ backgroundColor }}` — token-aware without needing hook
- **DonutChart legend fix:** `rounded-sm` → `rounded-full` on legend dot span (squares → circles)

### Task 2: ActiveBar opacity hover (2 files)
- **BarLineChart:** Added `opacity={0.7}` + `activeBar={{ opacity: 1, fill: chartColors?.[0] ?? 'var(--wf-chart-1)' }}` to `<Bar>` in both the `BarChart` (type='bar') and `ComposedChart` (type='bar-line') branches
- **StackedBarChartComponent:** `opacity={0.7}` + `activeBar={{ opacity: 1 }}` added to all 3 stacked `<Bar>` elements (applied in Task 1 rewrite to minimize edit passes)

## Commits

| Hash | Description |
|------|-------------|
| e055373 | feat(27-01): container + title + legend restyle across 15 chart components |
| 87d9ac5 | feat(27-01): activeBar opacity hover on bar chart variants |

## Deviations from Plan

None — plan executed exactly as written. The StackedBarChart activeBar props (Task 2 scope) were included in the Task 1 file rewrite to avoid a second edit pass on the same file, but the logical requirements are identical.

## Verification

- `npx tsc --noEmit` — PASSED (zero errors, both after Task 1 and Task 2)
- All 15 chart components: `rounded-xl` + `shadow-sm` in container className
- All 15 chart components: `font-bold` on title element
- No Recharts `<Legend />` in StackedBarChart, StackedAreaChart, or ComposedChart
- WaterfallChart hidden `<Legend wrapperStyle={{ display: 'none' }} />` preserved
- DonutChart legend uses `rounded-full`
- BarLineChart and StackedBarChart `<Bar>` elements have `opacity` and `activeBar` props

## Self-Check: PASSED

Files confirmed present:
- tools/wireframe-builder/components/BarLineChart.tsx — FOUND
- tools/wireframe-builder/components/StackedBarChartComponent.tsx — FOUND
- tools/wireframe-builder/components/DonutChart.tsx — FOUND
- tools/wireframe-builder/components/ComposedChartComponent.tsx — FOUND
- tools/wireframe-builder/components/StackedAreaChartComponent.tsx — FOUND

Commits confirmed:
- e055373 — FOUND
- 87d9ac5 — FOUND
