# Phase 21: Gallery Reorganization - Research

**Researched:** 2026-03-11
**Domain:** ComponentGallery.tsx refactor — registry-driven, thematic sections, new chart mocks
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAL-01 | Component gallery reorganized by thematic sections | Current `categories[]` static array must be replaced with registry-driven section grouping; section taxonomy defined below |
| GAL-02 | All new chart types visible in gallery with representative mock data | 6 new chartType sub-variants + GaugeChartComponent all need Preview wrappers and mock data entries; their props are fully documented in this research |
</phase_requirements>

---

## Summary

Phase 21 is a **pure frontend refactor** of `src/pages/tools/ComponentGallery.tsx` and its companion `src/pages/tools/galleryMockData.ts`. No new components, no new schema changes, no backend work. The goal is to (1) organize the gallery into well-labeled thematic sections that match the established SECTION_REGISTRY categories, and (2) make all Phase 20 chart variants (stacked-bar, stacked-area, horizontal-bar, bubble, composed, and gauge-chart) visible with proper preview wrappers and mock data.

The `SECTION_REGISTRY` in `tools/wireframe-builder/lib/section-registry.tsx` is already the authoritative catalog. It groups all 22 section types under 8 categories: KPIs, Graficos, Tabelas, Inputs, Layout, Formularios, Filtros, Metricas. The gallery's static `categories[]` array should mirror these groups — or a curated subset suited to the gallery UX — and draw its component entries from the registry's catalog metadata combined with manual preview renderers.

The key insight: chart sub-variants (stacked-bar, stacked-area, horizontal-bar, bubble, composed) are NOT separate section types in the registry — they are `chartType` enum values under the single `bar-line-chart` section type. The gallery must show each chartType variant as a separate card within the Graficos section. Only `gauge-chart` is a dedicated section type (Phase 20 decision).

**Primary recommendation:** Replace the static `categories` array with a curated gallery sections array derived from registry categories; add preview wrappers for the 6 Phase 20 chart additions; update mock data in `galleryMockData.ts`.

---

## Standard Stack

### Core (already in place — no new installs)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | 18.x | Component rendering, local state | Project standard |
| TypeScript 5 | strict: true | Type safety | Project standard — `npx tsc --noEmit` must pass |
| recharts | 2.x | Chart rendering (used by all chart components) | Project decision — zero new npm packages |
| lucide-react | latest | Icons | Project standard |
| shadcn/ui + Tailwind 3 | project ver | Gallery card styling | Project standard |

**Installation:** No new packages needed. All chart components are already implemented.

---

## Architecture Patterns

### Current gallery structure (to be replaced)

```
src/pages/tools/
├── ComponentGallery.tsx   -- static categories[], Preview wrappers, ComponentCard
└── galleryMockData.ts     -- mock data exports for each component
```

The current `ComponentGallery.tsx` has:
- `ComponentEntry` type with `name`, `status`, `render`, `props`, `specHref`
- `Category` type with `id`, `label`, `components: ComponentEntry[]`
- Static `categories` array (5 sections: Cards, Graficos, Tabelas, Layout, Inputs)
- Individual Preview function per component variant

### Recommended gallery structure (after Phase 21)

```
src/pages/tools/
├── ComponentGallery.tsx   -- gallery sections driven by SECTION_REGISTRY categories
└── galleryMockData.ts     -- extended with new chart mock data
```

### Pattern 1: Registry-Derived Sections

The gallery should not auto-populate directly from SECTION_REGISTRY (that would expose editor-only types like `divider` and `filter-config` in the gallery). Instead, define a **gallery section mapping** that maps SECTION_REGISTRY category names to curated gallery sections with explicit render entries.

The simplest correct approach: keep the `Category` / `ComponentEntry` types and the static per-component render functions, but **restructure the `categories` array** to align with SECTION_REGISTRY taxonomy and add entries for Phase 20 chart types.

**This approach is preferred** because:
- It does not require architectural surgery (no new abstraction needed)
- It is already the pattern the codebase uses — just extend it
- Full registry auto-population is complex (renderers need props, not just type metadata)
- The planner avoids over-engineering: the user's goal is correctness, not pure automation

### Recommended Section Taxonomy

Aligned with SECTION_REGISTRY categories, but merged/renamed for gallery UX:

| Gallery Section ID | Gallery Label | What it contains |
|-------------------|---------------|-----------------|
| `shell` | Layout / Shell | WireframeSidebar, WireframeHeader, WireframeFilterBar, GlobalFilters (formerly split between 'layout' and 'cards') |
| `charts` | Graficos | All chart variants: bar, line, bar-line (existing), stacked-bar, stacked-area, horizontal-bar, bubble, composed (Phase 20), + donut, waterfall, pareto, gauge-chart |
| `cards` | Cards & Metricas | KpiCard, KpiCardFull, CalculoCard (formerly 'Cards') |
| `tables` | Tabelas | DataTable, DrillDownTable, ClickableTable, ConfigTable |
| `inputs` | Inputs | InputsScreen, UploadSection, ManualInputSection, SaldoBancoInput |
| `modals` | Modais & Overlays | WireframeModal, CommentOverlay, DetailViewSwitcher |

Note: current gallery has CommentOverlay and WireframeModal in 'layout' with no clear reason. Moving them to a dedicated 'modals' section improves UX.

### Pattern 2: New Chart Preview Wrappers (Phase 20)

The 6 new chart components have simple props — title, height, categories?, xLabel?, yLabel?, chartColors?. They do NOT need complex PropToggle controls (unlike BarLineChart which switches between 3 legacy types). Each gets a direct render function with a meaningful title:

```typescript
// Source: tools/wireframe-builder/components/StackedBarChartComponent.tsx
// Props: title, height?, categories?, chartColors?
render: () => (
  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
    <StackedBarChartComponent title="Receita por Canal (Acumulado)" />
  </div>
)
```

```typescript
// Source: tools/wireframe-builder/components/GaugeChartComponent.tsx
// Props: title, value, min?, max?, zones?, height?, chartColors?
render: () => (
  <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4">
    <GaugeChartComponent title="Margem Operacional" value={68} min={0} max={100} />
  </div>
)
```

### Pattern 3: BarLineChartPreview extension for new chartTypes

The existing `BarLineChartPreview` uses `PropPills` with `['bar', 'line', 'bar-line']`. The cleanest approach for Phase 20 variants is NOT to extend this single preview (it would get too wide). Instead, create separate gallery cards for each new chartType variant, each with its own dedicated render function and a simple wrapper (no toolbar needed since there are no variants to toggle):

```typescript
{
  name: 'StackedBarChart',
  status: 'available',
  props: ['title', 'height?', 'categories?', 'chartColors?'],
  render: () => <div className="..."><StackedBarChartComponent title="..." /></div>,
}
```

### Anti-Patterns to Avoid

- **Full registry auto-population:** Auto-mapping all 22 SECTION_REGISTRY types to gallery cards would include `divider`, `filter-config`, `settings-page` etc. which are not useful to showcase as standalone components. The gallery is a component showcase, not a registry dump.
- **Extending BarLineChartPreview with 9 options:** Adding all chartType variants to a single PropPills control would overflow. One card per variant for Phase 20 additions.
- **Importing section schemas in the gallery:** ComponentGallery.tsx should import chart components directly (like it does today), not via the section registry. The registry is for the wireframe editor, not the gallery.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG charts | Existing components (StackedBarChartComponent, etc.) | They already exist, implement all Phase 20 types |
| Section grouping | Data-driven registry auto-render | Extended static `categories` array | Simpler, no new abstraction needed for this phase scope |
| Filter bar preview | Build new filter controls | Import existing `WireframeFilterBar` with mock FilterOption[] | Phase 19 completed all filter types |
| Header preview | Build new header component | Import existing `WireframeHeader` with new props | Phase 18 completed header with all props |

---

## Common Pitfalls

### Pitfall 1: Stale Props in WireframeHeader preview

**What goes wrong:** The existing `WireframeHeaderPreview` uses `wireframeHeaderMock` which only has `title` and `periodType`. After Phase 18, WireframeHeader has many new optional props (`logoUrl`, `brandLabel`, `showLogo`, `showUserIndicator`, `userDisplayName`, `userRole`, `onGerenciar`, `showManage`, `onShare`, `onExport`). The gallery preview should show these new features.

**How to avoid:** Update `wireframeHeaderMock` to include `brandLabel` and `userDisplayName` so the header preview demonstrates the Phase 18 features. Add PropPills/PropToggle controls for the new boolean props.

**Warning signs:** Header preview shows same as pre-Phase-18 behavior.

### Pitfall 2: WireframeFilterBar mock uses old FilterOption shape

**What goes wrong:** The existing `wireframeFilterBarMock` uses only `filterType` implicitly-defaulting-to-'select' filters. After Phase 19, the gallery should demonstrate all 5 filter types (date-range, multi-select, search, toggle, select).

**How to avoid:** Expand `wireframeFilterBarMock.filters` array to include one filter of each new filterType. The WireframeFilterBar component renders each type automatically via the `FilterControl` dispatcher.

**Warning signs:** FilterBar preview shows only legacy select filters.

### Pitfall 3: Importing new chart components without matching the import pattern

**What goes wrong:** Developer adds new imports at the wrong path or without the `@tools/wireframe-builder/components/` prefix.

**How to avoid:** Follow exact import pattern from existing imports in ComponentGallery.tsx:
```typescript
import StackedBarChartComponent from '@tools/wireframe-builder/components/StackedBarChartComponent'
```

All 6 new chart component files confirmed to exist:
- `tools/wireframe-builder/components/StackedBarChartComponent.tsx`
- `tools/wireframe-builder/components/StackedAreaChartComponent.tsx`
- `tools/wireframe-builder/components/HorizontalBarChartComponent.tsx`
- `tools/wireframe-builder/components/BubbleChartComponent.tsx`
- `tools/wireframe-builder/components/ComposedChartComponent.tsx`
- `tools/wireframe-builder/components/GaugeChartComponent.tsx`

### Pitfall 4: TypeScript strict mode failures from untyped mock data

**What goes wrong:** Mock data added without proper type annotations causes `tsc --noEmit` to fail.

**How to avoid:** In `galleryMockData.ts`, import the types you need and annotate arrays explicitly. Pattern from existing file: `as FilterOption[]`, `as WaterfallBar[]`, etc. Never use `any`.

### Pitfall 5: GaugeChartComponent needs `value` (no default)

**What goes wrong:** `GaugeChartComponent` requires `title` and `value` as non-optional props. The mock must supply a numeric `value` in [min, max] range.

**How to avoid:** Always provide `value` in GaugeChart mock data. Example: `{ title: 'Margem Operacional', value: 68, min: 0, max: 100 }`.

---

## Code Examples

### Complete new chart type signatures (from source code)

```typescript
// Source: tools/wireframe-builder/components/StackedBarChartComponent.tsx
type Props = {
  title: string
  height?: number           // default 300
  categories?: string[]     // default 12-month labels Jan–Dez
  chartColors?: string[]    // palette override
}
```

```typescript
// Source: tools/wireframe-builder/components/StackedAreaChartComponent.tsx
type Props = {
  title: string
  height?: number           // default 300
  categories?: string[]
  chartColors?: string[]
}
```

```typescript
// Source: tools/wireframe-builder/components/HorizontalBarChartComponent.tsx
type Props = {
  title: string
  height?: number           // default 300
  categories?: string[]
  xLabel?: string
  yLabel?: string
  chartColors?: string[]
}
```

```typescript
// Source: tools/wireframe-builder/components/BubbleChartComponent.tsx
type Props = {
  title: string
  height?: number           // default 300
  xLabel?: string
  yLabel?: string
  chartColors?: string[]    // [0] = bubble fill
}
// Note: uses DEFAULT_DATA internally (x, y, z points) — no data prop needed for gallery
```

```typescript
// Source: tools/wireframe-builder/components/ComposedChartComponent.tsx
type Props = {
  title: string
  height?: number           // default 300
  categories?: string[]
  chartColors?: string[]    // [0]=bar, [1]=line, [2]=area
}
```

```typescript
// Source: tools/wireframe-builder/components/GaugeChartComponent.tsx
type GaugeZone = { label?: string; value: number; color?: string }

type Props = {
  title: string
  value: number             // REQUIRED — current value (no default)
  min?: number              // default 0
  max?: number              // default 100
  zones?: GaugeZone[]       // optional; falls back to 3-zone red/amber/green
  height?: number           // default 200
  chartColors?: string[]    // unused (ignored internally)
}
```

### Mock data pattern for gallery (from galleryMockData.ts)

```typescript
// Minimal mock data for new chart types — all rely on internal DEFAULT_* fallbacks
export const stackedBarChartMock = {
  title: 'Receita por Canal — Acumulado',
}

export const stackedAreaChartMock = {
  title: 'Evolucao de Despesas por Categoria',
}

export const horizontalBarChartMock = {
  title: 'Ranking de Produtos por Receita',
}

export const bubbleChartMock = {
  title: 'Dispersao: Volume x Margem x Ticket',
  xLabel: 'Volume',
  yLabel: 'Margem (%)',
}

export const composedChartMock = {
  title: 'DRE Gerencial — Resultado + Tendencia',
}

export const gaugeChartMock = {
  title: 'Margem Operacional',
  value: 68,
  min: 0,
  max: 100,
}
```

### Updated WireframeFilterBar mock (shows all filter types)

```typescript
// galleryMockData.ts — expand wireframeFilterBarMock to show Phase 19 types
export const wireframeFilterBarMock = {
  filters: [
    { key: 'periodo', label: 'Período', filterType: 'date-range' as const },
    { key: 'unidade', label: 'Unidade', filterType: 'multi-select' as const, options: ['Matriz', 'Filial SP', 'Filial RJ'] },
    { key: 'busca', label: 'Buscar', filterType: 'search' as const },
    { key: 'centro', label: 'Centro de Custo', filterType: 'select' as const, options: ['Todos'] },
    { key: 'ativo', label: 'Apenas ativos', filterType: 'toggle' as const },
  ] as FilterOption[],
  showSearch: false,
  showCompareSwitch: true,
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static 5-section gallery (Cards, Graficos, Tabelas, Layout, Inputs) | 6-section gallery aligned with SECTION_REGISTRY (Shell, Graficos, Cards & Metricas, Tabelas, Inputs, Modais) | Phase 21 | Gallery taxonomy matches editor catalog |
| 4 chart types shown (bar, waterfall, donut, pareto) | 10 chart type cards shown (+stacked-bar, stacked-area, horizontal-bar, bubble, composed, gauge) | Phase 21 | Gallery reflects full Phase 20 repertoire |
| FilterBar mock shows only select filters | FilterBar mock shows all 5 filter types | Phase 21 | Gallery demonstrates Phase 19 features |
| WireframeHeader mock: title + periodType only | WireframeHeader mock: includes brandLabel, userDisplayName | Phase 21 | Gallery shows Phase 18 header features |

---

## Open Questions

1. **Should BarLineChartPreview be extended to include legacy chart types (area, radar, treemap, funnel, scatter)?**
   - What we know: these chartTypes existed before Phase 20 (they are in BarLineChartSectionSchema enum) but were never added to the gallery
   - What's unclear: phase scope says "all new chart types from Phase 20" — not pre-Phase-20 types
   - Recommendation: include area/radar/treemap/funnel/scatter for completeness (they have components: AreaChartComponent, RadarChartComponent, TreemapComponent, FunnelChartComponent, ScatterChartComponent), but treat as bonus. If it adds complexity, skip and document as gap.

2. **Does GaugeChartComponent need zones mock data for a useful preview?**
   - What we know: zones is optional; component falls back to 3-zone red/amber/green
   - Recommendation: use default (no zones prop) for the gallery — simpler, still visually representative

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts) |
| Config file | `/Users/cauetpinciara/Documents/fxl/fxl-core/vitest.config.ts` |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAL-01 | Gallery shows thematic sections | smoke/visual | Manual browser check | N/A — visual |
| GAL-01 | Categories match SECTION_REGISTRY taxonomy | unit | `npx vitest run tools/wireframe-builder/lib/section-registry.test.ts` | Yes |
| GAL-02 | All 6 Phase 20 chart type components render | smoke/visual | Manual browser check | N/A — visual |
| GAL-02 | TypeScript compiles with zero errors | compile | `npx tsc --noEmit` | N/A — always run |

Note: GAL-01 and GAL-02 are primarily UI/visual requirements. The existing `section-registry.test.ts` (270 tests green) validates the registry completeness. ComponentGallery.tsx is a display component with no logic to unit-test. The phase gate is: zero TS errors + visual inspection confirms new sections and chart previews appear.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx vitest run` (270 tests must remain green)
- **Phase gate:** `npx tsc --noEmit` + zero errors + visual checkpoint in browser

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. No new test files needed. The registry tests already verify catalog completeness; the gallery itself is visual-only.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct read: `src/pages/tools/ComponentGallery.tsx` — current gallery structure, all 5 sections, existing Preview wrappers
- Codebase direct read: `src/pages/tools/galleryMockData.ts` — all existing mock data exports
- Codebase direct read: `tools/wireframe-builder/lib/section-registry.tsx` — SECTION_REGISTRY with all 22 types, 8 categories
- Codebase direct read: `tools/wireframe-builder/components/StackedBarChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/StackedAreaChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/HorizontalBarChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/BubbleChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/ComposedChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/GaugeChartComponent.tsx` — Props confirmed
- Codebase direct read: `tools/wireframe-builder/components/WireframeHeader.tsx` — Updated Props (Phase 18)
- Codebase direct read: `tools/wireframe-builder/components/WireframeFilterBar.tsx` — Updated Props (Phase 19)
- Codebase direct read: `tools/wireframe-builder/lib/blueprint-schema.ts` — chartType enum confirmed
- Codebase direct read: `tools/wireframe-builder/lib/section-registry.test.ts` — test count 270 all green
- Codebase direct read: `.planning/REQUIREMENTS.md` — GAL-01, GAL-02 requirements
- Codebase direct read: `.planning/STATE.md` — project decisions and history
- Codebase direct read: `vitest.config.ts` — test configuration

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all components already implemented
- Architecture: HIGH — direct codebase inspection, exact component props documented
- Pitfalls: HIGH — pitfalls derived from reading actual component code and mock data

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable codebase, no external dependencies)
