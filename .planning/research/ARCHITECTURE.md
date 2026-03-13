# Architecture Research — v1.6: 12 New Chart/Section Types

**Domain:** Wireframe Builder — Chart and Section Component Expansion
**Researched:** 2026-03-12
**Confidence:** HIGH (based on direct codebase inspection)

---

## System Overview

```
BlueprintConfig (Supabase JSON)
    ↓ Zod parse (BlueprintConfigSchema)
BlueprintRenderer
    ↓ iterates screens → rows → sections
SectionRenderer
    ↓ looks up type in SECTION_REGISTRY
Renderer Component         Property Form (editor only)
    ↓                           ↓
Chart/Section Component    Property Panel UI
    ↓
--wf-* CSS vars + chartColors[]
```

### The Two Extension Points

The architecture has two distinct extension points, not one. The 12 new types split cleanly across them:

```
Extension Point A — chartType sub-variant
──────────────────────────────────────────
BlueprintSection type stays 'bar-line-chart'
ChartType enum grows + ChartRenderer switch grows
No registry changes needed

Extension Point B — standalone section type
────────────────────────────────────────────
New literal in BlueprintSection union
New entry in SECTION_REGISTRY
New Zod schema added to discriminated union
New Renderer + PropertyForm + leaf Component
```

### Classification of the 12 New Types

| New Type | Extension Point | Rationale |
|----------|----------------|-----------|
| Grouped Bar | A — chartType sub-variant | Same axes + categories pattern as stacked-bar |
| Bullet Chart | A — chartType sub-variant | Single-metric bar, extends horizontal-bar idiom |
| Step Line | A — chartType sub-variant | Line variant — Recharts `type="stepBefore"` flag |
| Polar Area | A — chartType sub-variant | Angular/radar variant with filled wedges |
| Bump Chart | A — chartType sub-variant | Ranking over time — categories drive X axis |
| Lollipop | A — chartType sub-variant | Bar + dot combination, categorical data |
| Range Bar | A — chartType sub-variant | Bar pair (min/max per category) |
| Pie Chart | B — standalone section | Different data shape: slices[], no categories axis |
| Heatmap | B — standalone section | 2D matrix — row/col labels, intensity values |
| Sparkline Grid | B — standalone section | Grid of micro-charts with own layout model |
| Progress Grid | B — standalone section | Grid of labeled progress items, distinct from progress-bar |
| Sankey | B — standalone section | Node-link flow data (source/target/value) |

**Note on Pie Chart vs Donut:** Although `donut-chart` exists as a standalone type, Pie warrants its own section type (`pie-chart`) rather than a flag on donut-chart. Pie has no center hole and different slice label placement. Keeping them as separate types preserves clean discriminated union semantics and simple property forms.

---

## Component Architecture

### Existing Component Boundaries

| Layer | File / Folder | Responsibility |
|-------|--------------|----------------|
| Schema | `lib/blueprint-schema.ts` | Zod discriminated union, one schema per section type |
| Types | `types/blueprint.ts` | TypeScript `BlueprintSection` discriminated union + `ChartType` |
| Registry | `lib/section-registry.tsx` | Maps section type → renderer + form + schema + defaultProps |
| Dispatcher (chart) | `components/sections/ChartRenderer.tsx` | Inner switch for `bar-line-chart` chartType variants |
| Dispatcher (all) | `components/sections/SectionRenderer.tsx` | Calls SECTION_REGISTRY lookup by type |
| Leaf component | `components/[Name]Component.tsx` | Pure Recharts component, accepts title/height/categories/chartColors |
| Renderer | `components/sections/[Name]Renderer.tsx` | Casts BlueprintSection → typed section, calls leaf |
| Form | `components/editor/property-forms/[Name]Form.tsx` | Editor UI for section properties |
| Gallery | `src/pages/tools/ComponentGallery.tsx` | Visual catalog — imports leaf components directly with mock data |

---

## Patterns per Extension Point

### Pattern A: chartType Sub-Variant

No new renderer or registry entry needed. Three targeted edits across shared files, plus one new leaf component file:

**New file:**
- `tools/wireframe-builder/components/[Name]ChartComponent.tsx`

**Modified shared files (additive only):**
- `tools/wireframe-builder/types/blueprint.ts` — add literal to `ChartType` union
- `tools/wireframe-builder/lib/blueprint-schema.ts` — add literal to `BarLineChartSectionSchema.chartType` z.enum
- `tools/wireframe-builder/components/sections/ChartRenderer.tsx` — add `case '[name]':` to inner switch

The `BarLineChartSectionSchema`, `BarLineChartSection` type, `BarLineChartForm`, and the `'bar-line-chart'` registry entry are untouched. The section-registry test passes unchanged.

```typescript
// types/blueprint.ts — add to ChartType union
export type ChartType =
  | 'bar' | 'line' | 'bar-line' | 'radar' | 'treemap' | 'funnel'
  | 'scatter' | 'area' | 'stacked-bar' | 'stacked-area'
  | 'horizontal-bar' | 'bubble' | 'composed'
  // v1.6:
  | 'grouped-bar' | 'bullet' | 'step-line' | 'range-bar' | 'bump' | 'lollipop' | 'polar'

// lib/blueprint-schema.ts — extend the z.enum
chartType: z.enum([
  'bar', 'line', 'bar-line', 'radar', 'treemap', 'funnel',
  'scatter', 'area', 'stacked-bar', 'stacked-area',
  'horizontal-bar', 'bubble', 'composed',
  'grouped-bar', 'bullet', 'step-line', 'range-bar', 'bump', 'lollipop', 'polar',
]),

// components/sections/ChartRenderer.tsx — add case
case 'grouped-bar':
  return (
    <GroupedBarChartComponent
      title={section.title}
      height={section.height}
      categories={section.categories}
      chartColors={chartColors}
    />
  )
```

### Pattern B: Standalone Section Type

Five files per new section type (leaf + renderer + form + schema + type), plus additive changes to three shared files and the test.

**New files (per standalone type):**
- `tools/wireframe-builder/components/[Name]Component.tsx` — leaf Recharts/CSS component
- `tools/wireframe-builder/components/sections/[Name]Renderer.tsx` — thin cast layer
- `tools/wireframe-builder/components/editor/property-forms/[Name]Form.tsx` — property editor

**Modified shared files (additive only):**
- `tools/wireframe-builder/types/blueprint.ts` — add `[Name]Section` type + add to `BlueprintSection` union
- `tools/wireframe-builder/lib/blueprint-schema.ts` — add `[Name]SectionSchema` + push to `nonRecursiveSections[]`
- `tools/wireframe-builder/lib/section-registry.tsx` — add entry to `SECTION_REGISTRY`

**Updated test (not optional):**
- `tools/wireframe-builder/lib/section-registry.test.ts` — `ALL_SECTION_TYPES` array + `toHaveLength` count

The renderer is always a thin cast layer — no logic belongs there:

```typescript
// components/sections/HeatmapRenderer.tsx
import type { HeatmapSection } from '../../types/blueprint'
import type { SectionRendererProps } from '../../lib/section-registry'
import HeatmapComponent from '../HeatmapComponent'

export default function HeatmapRenderer({ section, chartColors }: SectionRendererProps) {
  const s = section as HeatmapSection
  return (
    <HeatmapComponent
      title={s.title}
      rowLabels={s.rowLabels}
      colLabels={s.colLabels}
      height={s.height}
      chartColors={chartColors}
    />
  )
}
```

The schema follows the established pattern — one `z.object` with `type: z.literal(...)`, pushed to `nonRecursiveSections[]` (not inline in the discriminated union call):

```typescript
// lib/blueprint-schema.ts
const HeatmapSectionSchema = z.object({
  type: z.literal('heatmap'),
  title: z.string(),
  rowLabels: z.array(z.string()).optional(),
  colLabels: z.array(z.string()).optional(),
  height: z.number().optional(),
})

const nonRecursiveSections = [
  ...(existing schemas),
  HeatmapSectionSchema,
] as const
```

---

## Leaf Component Contract

All chart leaf components follow this prop interface regardless of chart type. Deviations exist only when the data model requires it (Sankey, Heatmap, Sparkline Grid):

```typescript
// Standard interface (chartType sub-variants + Pie, ProgressGrid)
type Props = {
  title: string
  height?: number
  categories?: string[]      // X-axis labels; defaults to Jan-Dez
  chartColors?: string[]     // Brand palette; falls back to --wf-chart-* CSS vars
}

// Extended interface for data-model-specific types
// Heatmap adds: rowLabels?, colLabels?
// SparklineGrid adds: count?, sparklineHeight?
// Sankey adds: nodes?, links?
```

All leaf components use this theming pattern:

```typescript
const palette = chartColors ?? [
  'var(--wf-chart-1)',
  'var(--wf-chart-2)',
  'var(--wf-chart-3)',
]
```

All use `--wf-*` CSS vars for borders, backgrounds, and text (`var(--wf-card)`, `var(--wf-card-border)`, `var(--wf-muted)`, `var(--wf-heading)`). Never use raw Tailwind color classes on chart containers.

---

## Data Flow

### chartType Sub-Variant Flow

```
blueprint JSON: { type: 'bar-line-chart', chartType: 'grouped-bar', title: '...' }
    ↓ BlueprintSectionSchema.safeParse()  [Zod validates chartType enum]
    ↓ SECTION_REGISTRY['bar-line-chart'].renderer  →  ChartRenderer
    ↓ ChartRenderer outer switch: case 'bar-line-chart'
    ↓ ChartRenderer inner switch: case 'grouped-bar'
    ↓ <GroupedBarChartComponent title={...} chartColors={chartColors} />
    ↓ Recharts BarChart with grouped bars using --wf-chart-* CSS vars
```

### Standalone Section Flow

```
blueprint JSON: { type: 'heatmap', title: '...', rowLabels: [...] }
    ↓ BlueprintSectionSchema.safeParse()  [discriminated union picks HeatmapSectionSchema]
    ↓ SECTION_REGISTRY['heatmap'].renderer  →  HeatmapRenderer
    ↓ HeatmapRenderer casts: const s = section as HeatmapSection
    ↓ <HeatmapComponent title={s.title} rowLabels={s.rowLabels} chartColors={chartColors} />
    ↓ CSS grid or Recharts using --wf-chart-* CSS vars
```

### Theming Flow (unchanged for all new types)

```
BrandingConfig → brandingToWfOverrides() → CSS vars on :root scope
chartColors[] = resolved hex palette from useWireframeChartPalette()
All leaf components: palette = chartColors ?? ['var(--wf-chart-1)', ...]
```

---

## Recommended Project Structure (v1.6 additions)

```
tools/wireframe-builder/
├── components/
│   ├── GroupedBarChartComponent.tsx        new (chartType: grouped-bar)
│   ├── BulletChartComponent.tsx            new (chartType: bullet)
│   ├── StepLineChartComponent.tsx          new (chartType: step-line)
│   ├── RangeBarChartComponent.tsx          new (chartType: range-bar)
│   ├── BumpChartComponent.tsx              new (chartType: bump)
│   ├── LollipopChartComponent.tsx          new (chartType: lollipop)
│   ├── PolarAreaChartComponent.tsx         new (chartType: polar)
│   ├── HeatmapComponent.tsx                new (standalone section)
│   ├── SparklineGridComponent.tsx          new (standalone section)
│   ├── ProgressGridComponent.tsx           new (standalone section)
│   ├── PieChartComponent.tsx               new (standalone section)
│   ├── SankeyComponent.tsx                 new (standalone section)
│   └── sections/
│       ├── HeatmapRenderer.tsx             new
│       ├── SparklineGridRenderer.tsx       new
│       ├── ProgressGridRenderer.tsx        new
│       ├── PieChartRenderer.tsx            new
│       └── SankeyRenderer.tsx              new
│   └── editor/property-forms/
│       ├── HeatmapForm.tsx                 new
│       ├── SparklineGridForm.tsx           new
│       ├── ProgressGridForm.tsx            new
│       ├── PieChartForm.tsx                new
│       └── SankeyForm.tsx                  new
├── types/
│   └── blueprint.ts                        modified (ChartType union + 5 new section types + BlueprintSection union)
└── lib/
    ├── blueprint-schema.ts                 modified (chartType enum + 5 new schemas + nonRecursiveSections)
    ├── section-registry.tsx                modified (5 new entries in SECTION_REGISTRY)
    └── section-registry.test.ts            modified (ALL_SECTION_TYPES: 23 → 28, toHaveLength: 23 → 28)
```

No new folders. No changes to `src/` outside of `ComponentGallery.tsx`.

---

## Build Order (Dependency-Aware)

### Wave 1 — chartType Sub-Variants (low risk, no registry changes)

Each type in this wave is independent. They can be built in any order. The only shared constraint: all literals must be added to `ChartType` and `chartType` z.enum before `tsc --noEmit` will pass cleanly.

Recommended sequence within Wave 1:

1. **Grouped Bar** — closest to existing stacked-bar pattern, validates the A-pattern end-to-end
2. **Step Line** — line variant, minimal divergence from existing `AreaChartComponent`
3. **Lollipop** — bar + dot, uses Recharts ComposedChart (same as existing composed chart)
4. **Range Bar** — introduces min/max data shape, slightly more custom data synthesis
5. **Bump Chart** — ranking lines over time, most novel data synthesis in Wave 1
6. **Bullet Chart** — horizontal progress-bar-like chart using ComposedChart
7. **Polar Area** — RadarChart with `fill` variant; confirm Recharts behavior before building

After all 7: run `npx tsc --noEmit` to verify all enum additions are consistent.

### Wave 2 — Standalone Sections (higher coordination cost)

Build one complete type end-to-end before starting the next. This serializes edits to shared files (blueprint.ts, blueprint-schema.ts, section-registry.tsx) and avoids merge conflicts.

Recommended sequence within Wave 2:

1. **Pie Chart** — mirrors `donut-chart` pattern most closely. Validates the B-pattern end-to-end with minimal risk. Recharts `PieChart` component is well-documented.
2. **Heatmap** — 2D matrix, synthetic grid data, no external deps. Can use CSS grid instead of Recharts for the cell layout.
3. **Progress Grid** — pure CSS/HTML grid of labeled progress bars. No Recharts. Simplest implementation in Wave 2.
4. **Sparkline Grid** — grid of tiny Recharts `LineChart` instances. Layout challenge: sizing micro-charts. Recharts `ResponsiveContainer` in a CSS grid context.
5. **Sankey** — most complex. **Requires pre-build investigation.** Recharts 2.x does not include a Sankey component. Options: (a) `d3-sankey` as an added dependency (~15KB), (b) pure SVG paths using precalculated layout, (c) `react-sankey-diagram` or similar. Decide and confirm before implementing.

After each standalone type: run `npx tsc --noEmit` and `section-registry.test.ts` suite.

### Wave Independence

Wave 1 and Wave 2 are fully independent. They share no files in a conflicting way (Wave 1 only touches `ChartType` and `ChartRenderer`; Wave 2 touches different parts of the schema and registry). They can be built in parallel or interleaved.

### Gating Criterion

Each unit (one chart type) must pass `npx tsc --noEmit` before the next unit begins. This prevents type errors from accumulating across types.

---

## Integration Points

### Section Registry Test (CRITICAL — will fail if not updated)

`lib/section-registry.test.ts` asserts an exact count and enumerates `ALL_SECTION_TYPES`. Every new standalone section type requires:
- Adding the type string to `ALL_SECTION_TYPES`
- Updating `toHaveLength(23)` to the new count (one increment per new standalone type)

The test fails if either is missed. This is the intended safety net.

chartType sub-variants do NOT require any test changes.

### Component Gallery (`src/pages/tools/ComponentGallery.tsx`)

The gallery imports leaf components directly (not via the registry) and registers them manually with hardcoded mock data. Every new component — chartType variant or standalone — needs:
- An import at the top of `ComponentGallery.tsx`
- A `ComponentEntry` object with `render: () => <Component {...mockProps} />`
- Mock data added to `./galleryMockData` (separate file)

This is a manual sync step, not automated by the registry.

### AI Generation Engine (`lib/screen-recipes.ts`, `lib/generation-engine.ts`)

Screen recipes reference `BlueprintSection['type']` and specify `defaults: Partial<BlueprintSection>`. New standalone types can be added to `SCREEN_RECIPES` after registration. chartType sub-variants only need the `chartType` string updated in existing recipe defaults — no structural recipe changes.

### Blueprint Migrations

Existing blueprints in Supabase are unaffected. Adding new section types to the discriminated union is additive — Zod parses existing documents without errors. No `schemaVersion` bump needed. No migration file needed.

### `blueprint-schema.ts` Export Convention

Individual schemas are exported by name for use in section-registry.tsx. New standalone schemas follow the same pattern: either `export const [Name]SectionSchema` at the declaration site, or named export in the bottom `export { }` block. GaugeChartSectionSchema uses the first pattern; most others use the second. Either is correct — maintain consistency within each new schema.

---

## Anti-Patterns

### Anti-Pattern 1: Sankey as a chartType Sub-Variant

**What people do:** Add `'sankey'` to `ChartType` and dispatch it inside `ChartRenderer.tsx`.

**Why it's wrong:** Sankey has a fundamentally different data model (nodes[] + links[] with source/target/value), not the `categories[]` + `chartColors[]` that `BarLineChartSection` provides. Forcing it into `BarLineChartSection` requires unsafe casts and schema hacks.

**Do this instead:** Implement Sankey as a standalone section type with `nodes` and `links` fields in its Zod schema.

### Anti-Pattern 2: Adding All Type Literals Before Building Components

**What people do:** Add all 7 chartType literals to `ChartType` and all 5 standalone types to `BlueprintSection` in one commit before any leaf component exists.

**Why it's wrong:** TypeScript will error because the registry references renderers that don't exist yet. The test will fail because the count assertion is wrong. The codebase will not compile mid-build.

**Do this instead:** Add each type's artifacts atomically — type + schema + registry entry + renderer + form in one unit. Run `npx tsc --noEmit` after each unit.

### Anti-Pattern 3: Assuming Recharts 2.x Has a Sankey Component

**What people do:** Proceed to build `SankeyComponent.tsx` using `import { Sankey } from 'recharts'`.

**Why it's wrong:** Recharts 2.x does not ship a Sankey chart. The import will fail at runtime.

**Do this instead:** Verify the Recharts version in `package.json`, check the Recharts 2.x component list, and plan for either `d3-sankey` or a hand-rolled SVG implementation before starting SankeyComponent.

### Anti-Pattern 4: Pie Chart as a Donut Variant

**What people do:** Add `variant: 'pie' | 'donut'` to `DonutChartSection` and branch inside `DonutChart.tsx`.

**Why it's wrong:** `donut-chart` is already a registered standalone type with its own schema, form, and defaultProps. Extending it for a second visual variant adds conditional branches and breaks the single-visual-identity principle.

**Do this instead:** Register `pie-chart` as a new standalone section type. The leaf component is a Recharts `PieChart` without `innerRadius` — a small, clean component.

### Anti-Pattern 5: Using Tailwind Color Classes on Chart Containers

**What people do:** Apply `bg-white border-gray-200` directly to chart card divs in new components.

**Why it's wrong:** Breaks dark mode support. All existing components use `--wf-*` CSS vars (`bg-wf-card`, `border-wf-card-border`) which switch automatically via the WireframeThemeProvider.

**Do this instead:** Follow the same pattern as `StackedBarChartComponent.tsx` — use Tailwind utilities that reference `--wf-*` tokens: `bg-wf-card`, `border-wf-card-border`, `text-wf-heading`, `text-wf-muted`.

---

## Scaling Considerations

| Concern | Current (23 types) | After v1.6 (28 types) | If further growth (50+ types) |
|---------|-------------------|----------------------|-------------------------------|
| `section-registry.tsx` | ~630 lines | ~750 lines | Split into category files, re-export from index |
| `ChartRenderer.tsx` inner switch | 14 cases | 21 cases | Consider map-based dispatch `{ [key]: Component }` |
| `blueprint-schema.ts` | ~480 lines | ~600 lines | Split into schema modules by category |
| `section-registry.test.ts` | 23 types enumerated | 28 types enumerated | Auto-generate from `Object.keys(SECTION_REGISTRY)` |

At 28 types, none of these thresholds are critical. Noting for awareness.

---

## Sources

- Direct inspection: `tools/wireframe-builder/lib/section-registry.tsx` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/lib/blueprint-schema.ts` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/types/blueprint.ts` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/components/sections/ChartRenderer.tsx` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/lib/section-registry.test.ts` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/components/StackedBarChartComponent.tsx` — HIGH confidence
- Direct inspection: `tools/wireframe-builder/components/sections/GaugeChartRenderer.tsx` — HIGH confidence
- Recharts 2.x component inventory — training knowledge (MEDIUM confidence — verify Sankey absence before building)
- `.planning/PROJECT.md` milestone context — HIGH confidence

---

*Architecture research for: v1.6 — 12 New Chart/Section Types*
*Researched: 2026-03-12*
