# Phase 37 Research: Finalization — Gallery & Cross-Cutting

**Phase:** 37
**Goal:** ComponentGallery fully synchronized with all 12 new chart/section types from v1.6
**Requirement:** XCUT-04
**Depends on:** Phase 36 (all 12 types must exist before gallery sync)
**Researched:** 2026-03-12

---

## Current Gallery Architecture

### ComponentGallery.tsx (`src/pages/tools/ComponentGallery.tsx`)

The gallery is a single-page React component organized as follows:

1. **Top-level**: `ComponentGallery` wraps everything in `WireframeThemeProvider` with optional branding overrides
2. **GalleryContent**: Contains category filter pills, theme/branding toggles, and renders filtered categories
3. **categories array**: Static `Category[]` with 6 groups: shell, charts, cards, tables, inputs, modals
4. **ComponentCard**: Renders each component with expand/collapse, status badge, props list, spec link, and preview

Key types:
```typescript
type ComponentEntry = {
  name: string
  status: ComponentStatus  // 'available' | 'pending'
  description?: string
  props?: string[]
  render?: () => React.ReactNode
  hasToolbar?: boolean
  specHref?: string
}

type Category = {
  id: string
  label: string
  components: ComponentEntry[]
}
```

### Gallery Preview Patterns

There are two preview rendering patterns:

1. **Simple inline**: Component rendered directly inside a `div.rounded-lg.border-dashed.bg-wf-canvas.p-4` wrapper
   - Example: `DonutChart`, `DataTable`, `SaldoBancoInput`
   - Used when the component has no interactive props to toggle

2. **Dedicated Preview component**: A `[Name]Preview` function component that manages local state for interactive prop toggling
   - Example: `KpiCardPreview` (toggles `variationPositive`), `BarLineChartPreview` (toggles chart `type`)
   - Uses `PropsToolbar` + `PropToggle`/`PropPills` for controls
   - Has `hasToolbar: true` on the entry (changes the wrapping behavior)

### galleryMockData.ts (`src/pages/tools/galleryMockData.ts`)

Contains exported const objects for each component's mock data. All data uses realistic Brazilian Portuguese financial labels and values (R$, %, dates in dd/mm/yyyy format). Pattern:
- Each mock is a named export: `export const [componentName]Mock = { ... }`
- Types are imported from the component files when needed (e.g., `WaterfallBar`, `CalculoRow`)
- Currently has 27 mock data exports covering all existing gallery components

### Dark/Light Mode Handling

The gallery wraps everything in a single `WireframeThemeProvider`. The `GalleryThemeToggle` button calls `useWireframeTheme().toggle()`. All component previews inherit the theme via CSS `--wf-*` custom properties. No per-component theme management needed.

The branding toggle passes `wfOverrides` to `WireframeThemeProvider`, which applies `--wf-primary` override via CSS vars. Components using `chartColors` prop get resolved hex values from `useWireframeChartPalette`.

### Current Gallery Counts

- **6 categories**: shell (4), charts (11), cards (3), tables (4), inputs (4), modals (3)
- **29 total component entries** (all status: 'available')
- **27 mock data exports** in galleryMockData.ts

---

## New Components from Phases 34-36

### Phase 34 — Wave 1 ChartType Sub-Variants (7 new)

These are new `chartType` values dispatched through `ChartRenderer` under the existing `bar-line-chart` section type. Each has a dedicated leaf component.

| # | Chart | Component File | Props Interface |
|---|-------|---------------|-----------------|
| 1 | Grouped Bar | `GroupedBarChartComponent.tsx` | `title, height?, categories?, chartColors?` |
| 2 | Bullet | `BulletChartComponent.tsx` | `title, height?, chartColors?` (+ target/value data) |
| 3 | Step Line | `StepLineChartComponent.tsx` | `title, height?, categories?, chartColors?` |
| 4 | Lollipop | `LollipopChartComponent.tsx` | `title, height?, categories?, chartColors?` |
| 5 | Range Bar | `RangeBarComponent.tsx` | `title, height?, chartColors?` (CSS-flex, not Recharts) |
| 6 | Bump | `BumpChartComponent.tsx` | `title, height?, categories?, chartColors?` |
| 7 | Polar | `PolarChartComponent.tsx` | `title, height?, chartColors?` |

**Gallery integration pattern:** These follow the same pattern as existing charts in the "Graficos" category. Each needs:
- A named mock export in `galleryMockData.ts`
- An import of the leaf component in `ComponentGallery.tsx`
- A `ComponentEntry` in the `charts` category of the `categories` array
- A simple render function (most won't need `hasToolbar` since they don't have togglable props)

### Phase 35 — Wave 2 Standalone Section Types (4 new)

These are new section types with their own renderers, distinct from the chart dispatch pattern.

| # | Section | Component/Renderer | Props Interface |
|---|---------|-------------------|-----------------|
| 1 | Pie Chart | `PieChartComponent.tsx` | `title, slices?, height?, chartColors?` |
| 2 | Heatmap | `HeatmapRenderer.tsx` | `title, xLabels, yLabels, cells, height?` (CSS grid) |
| 3 | Sparkline Grid | `SparklineGridRenderer.tsx` | `title, columns?, items: {label, value, data}[]` |
| 4 | Progress Grid | `ProgressGridRenderer.tsx` | `title, items: {label, current, target, max}[]` |

**Gallery integration pattern:** These need new entries. Pie Chart goes in "Graficos". The other three may go in "Graficos" or a new category — but since the existing gallery has "Graficos" for all chart-like visualizations, all 4 should be added there for consistency.

### Phase 36 — Wave 3 Sankey (1 new)

| # | Section | Component/Renderer | Props Interface |
|---|---------|-------------------|-----------------|
| 1 | Sankey | `SankeyComponent.tsx` | `title, nodes, links, height?, chartColors?` |

**Gallery integration pattern:** Goes in "Graficos" category. Needs mock data with nodes + integer-indexed links.

---

## Mock Data Requirements

All mock data must use realistic Brazilian Portuguese financial/business context. Here are the representative data needs per chart type:

1. **Grouped Bar**: 3 series (Realizado/Meta/Anterior) across 6 months
2. **Bullet**: Single metric with current value + target reference line
3. **Step Line**: 8-10 data points showing discrete changes (e.g., pricing tiers)
4. **Lollipop**: 6-8 categories with values (e.g., revenue by product)
5. **Range Bar**: 5-6 rows with start/end positions (e.g., project timeline)
6. **Bump**: 4-5 entities ranked across 6 periods
7. **Polar**: 5-6 categories with values for radial display
8. **Pie Chart**: 5 slices with labels, values, percentages
9. **Heatmap**: 5x6 matrix (e.g., product x month)
10. **Sparkline Grid**: 6 items with label, value, and 12-point data arrays
11. **Progress Grid**: 5 metrics with current/target/max values
12. **Sankey**: 6 nodes + 8 links with integer indices

---

## Implementation Approach

### Single Plan Rationale

This phase is mechanical — it follows a proven, well-documented pattern. All 12 chart types will already exist and render correctly from Phases 34-36. The work is:
1. Create 12 mock data exports (uniform complexity, ~5-15 lines each)
2. Import 12 components + mock data into ComponentGallery
3. Add 12 `ComponentEntry` objects to the `categories` array
4. Run `npx tsc --noEmit` to verify
5. Visual validation in browser (light + dark mode)

No architectural decisions needed. No new patterns to establish. One plan is sufficient.

### Risk Assessment

- **LOW risk**: All components will be pre-built and tested in Phases 34-36
- **Only risk**: Component prop interfaces may differ slightly from what is assumed in this research. The executor must check actual component files at execution time.
- **Mitigation**: The executor reads each component's actual props before writing mock data

---

## Key Files

| File | Role |
|------|------|
| `src/pages/tools/ComponentGallery.tsx` | Gallery page — add imports, entries, preview functions |
| `src/pages/tools/galleryMockData.ts` | Mock data — add 12 new exports |
| `tools/wireframe-builder/components/*.tsx` | Leaf components — imported for gallery previews |
| `tools/wireframe-builder/components/sections/*Renderer.tsx` | Section renderers — not directly used in gallery (gallery uses leaf components) |

---

*Research completed: 2026-03-12*
*Ready for planning: yes*
