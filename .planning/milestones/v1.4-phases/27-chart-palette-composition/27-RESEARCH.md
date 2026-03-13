# Phase 27: Chart Palette & Composition — Research

**Researched:** 2026-03-11
**Domain:** Recharts chart restyling, CSS custom properties, new React component (CompositionBar)
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHRT-01 | Chart palette uses primary blue + indigo + blue-400 + slate scale (replacing gold/amber) | Tokens `--wf-chart-1` through `--wf-chart-5` already updated in Phase 22. All chart components already reference `var(--wf-chart-*)`. The CHRT-01 work is token verification + container restyle only. |
| CHRT-02 | Chart containers use white/slate-900 background with rounded-xl border and shadow-sm | All chart components currently use `rounded-lg border border-wf-card-border bg-wf-card p-4` — must upgrade to `rounded-xl shadow-sm` to match card aesthetic from Phase 24. |
| CHRT-03 | Chart headers have font-bold title with legend dots (rounded-full colored indicators) | All chart components currently use `text-sm font-semibold` title. Upgrade to `font-bold`. Custom legend dots must replace Recharts default `<Legend />` in stacked charts. |
| CHRT-04 | Bar charts support group-hover transitions from muted to full opacity | Recharts `Bar` does not natively support group-hover CSS effects. Must use Recharts `activeBar` prop or pure CSS approach. Analysis below. |
| CHRT-05 | CompositionBar component (new): horizontal stacked bar with hover:brightness-90 and legend grid | Net-new component. No existing pattern to restyle. Pure HTML/CSS/div implementation — no Recharts needed for this one. |
</phase_requirements>

---

## Summary

Phase 27 has two distinct workstreams:

**Workstream A — Restyle (CHRT-01, CHRT-02, CHRT-03, CHRT-04):** Apply visual polish to existing chart components. The palette tokens (`--wf-chart-1` through `--wf-chart-5`) were already established in Phase 22 with the correct blue/indigo/slate values. The pending work is: (1) upgrading container classes from `rounded-lg` to `rounded-xl shadow-sm`, (2) upgrading title from `font-semibold` to `font-bold`, (3) replacing Recharts `<Legend />` with custom `rounded-full` dot indicators, (4) adding muted-to-full-opacity group-hover behavior on bar charts.

**Workstream B — New component (CHRT-05):** Build `CompositionBar`, a standalone horizontal stacked bar implemented in pure HTML/div (no Recharts). It must show proportional segments with `hover:brightness-90` transitions and a color/label legend grid below. This is the only new component in v1.4.

**Primary recommendation:** Restyle the 10 chart components in a single plan (CHRT-01/02/03/04), then build CompositionBar as a separate plan (CHRT-05) with its gallery entry and mock data.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 2.13.x (pinned) | Bar, Line, Area, Pie, Composed, Scatter, Radar, Treemap, Funnel, Bubble charts | Already the project chart library — no alternatives |
| CSS custom properties (`--wf-chart-*`) | CSS spec | Chart palette tokens already defined in `wireframe-tokens.css` | Token-first system established in Phase 22 |
| Tailwind CSS 3 | 3.4.x | Container and header styling utilities | Project stack |
| React 18 | 18.3.x | Component model for CompositionBar | Project stack |
| `var()` inline style attributes | CSS spec | Pass CSS vars as `fill`/`stroke` in Recharts SVG | Recharts SVG elements accept `var()` in fill/stroke directly |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useWireframeChartPalette` hook | local lib | Resolve `--wf-chart-*` CSS vars to hex strings for Recharts `<Legend>` | Only needed when `<Legend />` renders HTML (not SVG). Custom dot legends avoid this entirely. |
| TypeScript strict | 5.x | Type gate for CompositionBar props | `npx tsc --noEmit` is the acceptance criterion |
| Vitest | 4.x | No new tests needed for chart restyle | Not applicable to this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom dot legend (HTML spans) | Recharts `<Legend />` with custom renderer | Custom dots are simpler, token-aware, and avoid CSS var mis-resolution in Recharts HTML cells |
| Pure div/CSS for CompositionBar | Recharts stacked bar layout | Recharts cannot do single-row horizontal proportional bars cleanly without a full chart axis setup. Pure CSS flexbox is the correct approach. |
| `hover:opacity-100` class toggle | Recharts `activeBar` prop | CSS group-hover approach (opacity on sibling bars when parent hovered) requires custom bar shape or wrapper; full-group hover needs a React state approach |

**Installation:** No new dependencies required for this phase.

---

## Architecture Patterns

### Files to Touch

**Chart restyle (CHRT-01, CHRT-02, CHRT-03, CHRT-04):**
```
tools/wireframe-builder/components/
├── BarLineChart.tsx              ← container, title, group-hover bars
├── StackedBarChartComponent.tsx  ← container, title, custom legend, group-hover
├── HorizontalBarChartComponent.tsx ← container, title
├── AreaChartComponent.tsx        ← container, title
├── StackedAreaChartComponent.tsx ← container, title, custom legend
├── DonutChart.tsx                ← container, title, legend dots already rounded-sm → rounded-full
├── WaterfallChart.tsx            ← container, title
├── ParetoChart.tsx               ← container, title
├── ComposedChartComponent.tsx    ← container, title, custom legend
└── GaugeChartComponent.tsx       ← container, title
```

**CompositionBar (CHRT-05):**
```
tools/wireframe-builder/components/
└── CompositionBar.tsx            ← NEW: horizontal stacked bar (pure div/CSS)

src/pages/tools/
├── ComponentGallery.tsx          ← add CompositionBar entry to 'charts' category
└── galleryMockData.ts            ← add compositionBarMock export
```

### Pattern 1: Container Restyle (CHRT-02)

**What:** Every chart component wraps output in a card div. Change `rounded-lg` to `rounded-xl` and add `shadow-sm`.
**Current:**
```tsx
<div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
```
**Target:**
```tsx
<div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
```
This matches the KpiCardFull pattern from Phase 24.

### Pattern 2: Title Header Upgrade (CHRT-03)

**What:** Title changes from `font-semibold` to `font-bold`.
**Current:**
```tsx
<p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>
```
**Target:**
```tsx
<p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
```

### Pattern 3: Custom Legend Dots (CHRT-03)

**What:** Replace Recharts `<Legend />` with a custom row of `rounded-full` colored dots + labels.
**When to use:** Any chart component that currently renders `<Legend />` — specifically `StackedBarChartComponent`, `StackedAreaChartComponent`, `ComposedChartComponent`.
**Example:**
```tsx
// Remove: <Legend /> from <BarChart>/<StackedAreaChart>/<ComposedChart>
// Add above <ResponsiveContainer>:
function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-wf-muted">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
```
Colors can use `var(--wf-chart-N)` directly in the `style` prop since these are HTML spans (not Recharts SVG), so CSS var resolution works correctly.

### Pattern 4: Group-Hover Bar Opacity (CHRT-04)

**What:** When hovering over a bar group (set of bars at the same X position), non-hovered bars within the same group should transition from muted to full opacity.
**Analysis:** Recharts `Bar` component supports `opacity` prop and has `onMouseEnter`/`onMouseLeave` on the `<Bar>` element, but individual bar group hover requires either:
  - **Option A (React state):** Track `activeIndex` in state via `onMouseEnter` on `<Bar>`. Set `opacity` on each `<Bar>` conditionally — when `activeIndex !== null` and `i !== activeIndex`, use `opacity={0.4}`.
  - **Option B (Recharts activeBar):** Pass `activeBar={{ opacity: 1 }}` and set default `opacity={0.5}` on each `Bar`. Recharts highlights the hovered bar automatically.

**Recommended approach — Option B (simpler, no state):**
```tsx
// In BarLineChart (type='bar') and StackedBarChartComponent:
<Bar
  dataKey="bar"
  fill="var(--wf-chart-1)"
  radius={[3, 3, 0, 0]}
  opacity={0.65}
  activeBar={{ opacity: 1, fill: 'var(--wf-chart-1)' }}
/>
```
The `activeBar` prop activates on the hovered data point (x-group for grouped bars). For non-active bars, the base `opacity={0.65}` gives the "muted" appearance. This is a Recharts built-in behavior — no custom state needed.

**Scope:** Apply to `BarLineChart` (type `bar` and `bar-line`) and `StackedBarChartComponent`. Not applicable to area, line, donut, waterfall, pareto, gauge, radar, treemap, funnel, scatter, bubble, composed.

### Pattern 5: CompositionBar Component (CHRT-05)

**What:** A horizontal proportional stacked bar. Each segment is a div with `flex` width proportional to its value/total. On hover, segment dims to `brightness-90`. Below the bar, a legend grid lists segment color + label + value.
**When to use:** As a gallery-registered standalone component. Can be dropped into any blueprint via direct import.

```tsx
type Segment = {
  label: string
  value: number
  color?: string  // defaults to --wf-chart-N by index
}

type Props = {
  title: string
  segments: Segment[]
  height?: number        // bar height in px, default 32
  showLegend?: boolean   // default true
  formatValue?: (v: number) => string
}

export default function CompositionBar({ title, segments, height = 32, showLegend = true, formatValue }: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const palette = ['var(--wf-chart-1)', 'var(--wf-chart-2)', 'var(--wf-chart-3)', 'var(--wf-chart-4)', 'var(--wf-chart-5)']

  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
      {/* Stacked bar */}
      <div className="flex w-full overflow-hidden rounded-md" style={{ height }}>
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className="transition-[filter] duration-150 hover:brightness-90"
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color ?? palette[i % palette.length],
            }}
            title={`${seg.label}: ${formatValue ? formatValue(seg.value) : seg.value}`}
          />
        ))}
      </div>
      {/* Legend grid */}
      {showLegend && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {segments.map((seg, i) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: seg.color ?? palette[i % palette.length] }}
              />
              <span className="min-w-0 truncate text-xs text-wf-muted">{seg.label}</span>
              <span className="ml-auto text-xs font-medium text-wf-heading tabular-nums">
                {formatValue ? formatValue(seg.value) : `${((seg.value / total) * 100).toFixed(0)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Using Tailwind `dark:` variants inside wireframe components:** Wireframe theming is controlled by `data-wf-theme` attribute, not Tailwind dark mode. Use `var(--wf-*)` tokens only.
- **Using `bg-wf-chart-N` Tailwind classes:** `--wf-chart-*` tokens are NOT registered in `tailwind.config.ts`. Use `style={{ backgroundColor: 'var(--wf-chart-N)' }}` for HTML elements, `fill="var(--wf-chart-N)"` for SVG/Recharts.
- **Replacing `<Legend />` with a resolver hook:** The `useWireframeChartPalette` hook requires a `ref` and async DOM reads. For custom dot legends, pass `var(--wf-chart-N)` as style directly — no hook needed since we control the HTML.
- **Applying group-hover to all chart types:** Only bar charts (single bars and stacked bars) have meaningful group-hover behavior. Line, area, donut, waterfall, etc. do not need opacity changes.
- **Adding new blueprint section type for CompositionBar:** Per v1.4 scope, CompositionBar is gallery-only. Do NOT add a new `BlueprintSection` discriminant or update `SectionRenderer`. If a future phase needs it in blueprints, that is a v2 concern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive container for charts | Custom resize observer | `ResponsiveContainer` from Recharts | Already in all chart components |
| Active bar highlighting | Custom mouse event tracking on SVG paths | Recharts `activeBar` prop on `<Bar>` | Built-in Recharts feature |
| Color resolution from CSS vars | Custom `getComputedStyle` logic | `useWireframeChartPalette` hook (existing in `lib/`) | Already implemented in Phase 22 |

---

## Common Pitfalls

### Pitfall 1: `--wf-chart-*` Not in Tailwind Config
**What goes wrong:** Writing `className="bg-wf-chart-1"` produces no color — the class doesn't exist.
**Why it happens:** Only `bg-wf-*` tokens registered in `tailwind.config.ts` produce Tailwind classes. Chart tokens (`--wf-chart-1` through `--wf-chart-5`) are CSS-var-only.
**How to avoid:** Always use `style={{ backgroundColor: 'var(--wf-chart-N)' }}` for HTML elements and `fill="var(--wf-chart-N)"` for Recharts SVG props.
**Warning signs:** No color appears on a custom legend dot or CompositionBar segment.

### Pitfall 2: Recharts `<Legend />` Cannot Resolve CSS Vars
**What goes wrong:** Recharts `<Legend />` renders HTML `<li>` elements with inline `background-color`. CSS custom properties (`var()`) do not resolve in this context when the `data-wf-theme` scope is on an ancestor element.
**Why it happens:** Recharts Legend renders outside the Recharts SVG tree into HTML — CSS vars in SVG `fill` resolve fine, but `background-color` on a detached `<li>` may not inherit the theme scope.
**How to avoid:** Replace `<Legend />` with a custom dot legend using HTML spans (see Pattern 3). This eliminates the resolution problem entirely.
**Warning signs:** Legend dots are transparent or show wrong color.

### Pitfall 3: Recharts `activeBar` Applies Per Data Point, Not Per Group
**What goes wrong:** In a grouped bar chart with multiple `<Bar>` series, `activeBar` on one `<Bar>` highlights only that series' bar at the hovered index, not the entire column group.
**Why it happens:** Recharts `activeBar` is per-`<Bar>` series, not per X-axis group.
**How to avoid:** For single-series bar charts (`BarLineChart` type `bar`), `activeBar` works as expected. For multi-series grouped bars, use React state with `onMouseEnter`/`onMouseLeave` on the `<BarChart>` to track `activeIndex` and conditionally set `opacity` on each `<Bar>`. For stacked bars, since all data is one visual column, `activeBar` behavior is acceptable.
**Warning signs:** Hovering highlights only one bar in a group when it should highlight the full column.

### Pitfall 4: DonutChart Legend Dots Already Use `rounded-sm`
**What goes wrong:** DonutChart legend is already implemented with `rounded-sm` colored squares (not `rounded-full` circles). CHRT-03 requires `rounded-full`.
**Why it happens:** The legend was built before the v1.4 design spec was finalized.
**How to avoid:** In `DonutChart.tsx`, change the legend dot from `rounded-sm` to `rounded-full` on line 62.
**Warning signs:** DonutChart legend shows square dots instead of circle dots after phase.

### Pitfall 5: CompositionBar Segment Widths Must Guard Against Zero Total
**What goes wrong:** If `total === 0`, all `width` calculations produce `NaN%` or `Infinity%`, breaking layout.
**Why it happens:** Division by zero in `(seg.value / total) * 100`.
**How to avoid:** Guard: `const total = Math.max(1, segments.reduce(...))` or render a fallback state when `segments.length === 0`.

---

## Code Examples

### Container + Title Upgrade (CHRT-02, CHRT-03)
```tsx
// Before (all chart components):
<div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
  <p className="mb-3 text-sm font-semibold text-wf-heading">{title}</p>

// After:
<div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
  <p className="mb-3 text-sm font-bold text-wf-heading">{title}</p>
```

### Custom Legend Dots (CHRT-03) — StackedBarChartComponent example
```tsx
// Remove <Legend /> from BarChart
// Add this above <ResponsiveContainer>:
const legendItems = [
  { label: 'Serie A', color: palette[0] },
  { label: 'Serie B', color: palette[1] },
  { label: 'Serie C', color: palette[2] },
]

// Render:
<div className="mb-3 flex flex-wrap gap-3">
  {legendItems.map((item) => (
    <div key={item.label} className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
      <span className="text-xs text-wf-muted">{item.label}</span>
    </div>
  ))}
</div>
```

### Group-Hover Bar Opacity (CHRT-04) — BarLineChart type 'bar'
```tsx
// Single-series bar: activeBar highlights hovered data point
<Bar
  dataKey="bar"
  fill={chartColors?.[0] ?? 'var(--wf-chart-1)'}
  radius={[3, 3, 0, 0]}
  opacity={0.7}
  activeBar={{ opacity: 1, fill: chartColors?.[0] ?? 'var(--wf-chart-1)' }}
/>
```

### Gallery Entry for CompositionBar
```tsx
// In ComponentGallery.tsx, add to 'charts' category:
{
  name: 'CompositionBar',
  status: 'available',
  props: ['title', 'segments: Segment[]', 'height?', 'showLegend?', 'formatValue?'],
  render: () => (
    <div className="rounded-lg border border-dashed border-border bg-wf-canvas p-4">
      <CompositionBar {...compositionBarMock} />
    </div>
  ),
}

// In galleryMockData.ts:
export const compositionBarMock = {
  title: 'Composição de Receita por Canal',
  segments: [
    { label: 'Direto', value: 48 },
    { label: 'Parceiros', value: 27 },
    { label: 'Online', value: 15 },
    { label: 'Outros', value: 10 },
  ],
  formatValue: (v: number) => `${v}%`,
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `rounded-lg` card containers | `rounded-xl shadow-sm` | Phase 24 (KPI cards) | Chart containers now match card aesthetic |
| `font-semibold` titles | `font-bold` titles | Phase 27 | Stronger visual hierarchy |
| Recharts `<Legend />` | Custom `rounded-full` dot legend | Phase 27 | Token-aware, no CSS var mis-resolution |
| Gold/amber chart palette | Blue/indigo/slate palette | Phase 22 (tokens) | Palette tokens updated, components auto-update |

**Existing decisions that remain valid:**
- `var(--wf-chart-*)` tokens are used as `fill`/`stroke` in SVG Recharts props — this works fine, no change.
- `useWireframeChartPalette` hook remains available for cases where hex strings are needed (e.g., tooltip custom content). Not needed for dot legends.
- `CompositionBar` is gallery-only — no `BlueprintSection` type, no `SectionRenderer` case, no `ChartRenderer` dispatch.

---

## Open Questions

1. **Group-hover for stacked bar multi-series (CHRT-04)**
   - What we know: `activeBar` works cleanly for single-series bars. For `StackedBarChartComponent` with 3 series, the entire stacked column is visually one unit.
   - What's unclear: Whether applying `opacity={0.7}` + `activeBar={{ opacity: 1 }}` on all 3 `<Bar>` elements correctly highlights the full column on hover (it should, since Recharts highlights the same index across all stacked bars).
   - Recommendation: Implement with `activeBar` first; validate visually. If it only highlights one layer, fall back to `onMouseEnter` + React state approach.

2. **CompositionBar in BlueprintConfig future**
   - What we know: v1.4 scope explicitly excludes new section types except CompositionBar as gallery-only.
   - What's unclear: Future blueprint usage will require a new type discriminant and `SectionRenderer` case.
   - Recommendation: Build the component cleanly with typed props now. When Phase 28/v2 needs blueprint integration, the component is ready — only wiring is needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vite.config.ts` (vitest config inline) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHRT-01 | Chart palette tokens render blue/indigo/slate | manual | Visual inspection in gallery | N/A |
| CHRT-02 | Chart containers have rounded-xl + shadow-sm | manual | Visual inspection in gallery | N/A |
| CHRT-03 | Chart headers have font-bold title + legend dots | manual | Visual inspection in gallery | N/A |
| CHRT-04 | Bar charts show muted-to-full opacity on hover | manual | Visual interaction in gallery | N/A |
| CHRT-05 | CompositionBar renders + legend grid | manual | Visual inspection in gallery | N/A (new component) |
| TypeScript gate | Zero type errors across all touched files | lint | `npx tsc --noEmit` | ✅ |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npx vitest run`
- **Phase gate:** Full suite green + visual gallery review before `/gsd:verify-work`

### Wave 0 Gaps
None — this phase is purely visual restyle + one new component. No new business logic tests are required. The TypeScript gate (`npx tsc --noEmit`) is the automated acceptance criterion. Visual correctness is validated by gallery inspection.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase audit — `tools/wireframe-builder/styles/wireframe-tokens.css` (chart palette tokens confirmed present)
- Direct codebase audit — all 10 chart component files (container classes, title styles, Legend usage confirmed)
- Direct codebase audit — `src/pages/tools/ComponentGallery.tsx` (gallery entry pattern confirmed)
- Direct codebase audit — `src/pages/tools/galleryMockData.ts` (mock data pattern confirmed)
- Direct codebase audit — `tailwind.config.ts` (confirmed `--wf-chart-*` NOT registered as Tailwind classes)
- Direct codebase audit — `lib/useWireframeChartPalette.ts` (existing hook confirmed)
- `.planning/STATE.md` — v1.4 architectural decisions confirming CompositionBar gallery-only scope

### Secondary (MEDIUM confidence)
- Recharts documentation pattern for `activeBar` prop — consistent with Recharts 2.x API
- CSS `brightness()` filter via Tailwind `hover:brightness-90` — standard Tailwind 3.x utility

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tech already in use, no new dependencies
- Architecture (restyle): HIGH — direct codebase reading, patterns from phases 23/24/25 confirmed
- Architecture (CompositionBar): HIGH — pure HTML/CSS component, no external API dependency
- Pitfalls: HIGH — identified from direct code inspection and previous phase patterns

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable libraries, token system established)
