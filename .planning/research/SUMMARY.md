# Project Research Summary

**Project:** FXL Core v1.6 — Wireframe Builder Chart Library Expansion
**Domain:** React/Recharts 2.x chart component extension (12 new chart/section types)
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

This milestone extends the existing Wireframe Builder with 12 new chart and section types, all implementable using the already-installed Recharts 2.13.3 — zero new npm dependencies required. The architecture has two well-defined extension points: (A) chartType sub-variants that plug into the existing `bar-line-chart` section via new `ChartType` union literals and a dispatch case in `ChartRenderer`, and (B) standalone section types that require the full 5-file checklist (type, Zod schema, renderer, property form, registry entry). The 12 new types split 7-to-5 across these two patterns, with Wave 1 charts (Grouped Bar, Bullet, Step Line, Lollipop, Range Bar, Bump, Polar) using Extension Point A and Wave 2/3 standalone types (Pie, Heatmap, Sparkline Grid, Progress Grid, Sankey) using Extension Point B.

The recommended implementation approach is strictly serial within each section type: add all 4 sync points for a chartType sub-variant (or all 5 files for a standalone type) atomically, run `npx tsc --noEmit` after each unit, and proceed to the next. The biggest risk is a silent-failure mode baked into the existing `ChartRenderer` — its `default:` cast silently renders a plain bar chart for any unrecognized `chartType`, meaning a missing switch case produces no TypeScript error. The second biggest risk is the Recharts Sankey component's index-based node reference pattern, which fails silently (blank chart, no console error) when developers assume string-based names like every other Recharts chart.

The BI use cases across all 12 types are concrete and high-value: Grouped Bar covers the most requested comparison pattern, Heatmap and Sparkline Grid unlock executive scan-density layouts, and Sankey plus Range Bar fill the flow-visualization and timeline gaps that today require workarounds. No feature in scope is exotic — every type maps directly to common BI dashboard requests. Implementation risk is low-to-medium overall, with Range Bar being the most complex due to Recharts' lack of native range bar support (recommended mitigation: CSS-flex approach over Recharts stacked-bar workaround).

---

## Key Findings

### Recommended Stack

All 12 chart types are covered by Recharts 2.13.3 already installed in the project. No new packages should be added. The Recharts `<Sankey>` component is a confirmed named export in 2.x; `react-sparklines` is unmaintained (last commit 2021) and unnecessary since stripped `LineChart` instances handle sparklines natively; Recharts 3.x introduces breaking API changes (new store-based architecture, `Cell` as primary API removed) and must not be adopted for this milestone.

Two chart types (Heatmap, Progress Grid) and the Range Bar implementation deliberately avoid Recharts in favor of pure HTML/CSS with `--wf-*` CSS variable tokens. This is the correct pattern, not a workaround — these types do not benefit from Recharts and the CSS implementation is simpler, more maintainable, and consistent with the existing `ProgressBarRenderer` and `CompositionBar` patterns already in the codebase.

**Core technologies:**
- **Recharts 2.13.3:** 10 of the 12 chart types — verified via official API docs and GitHub 2.x source (HIGH)
- **CSS grid + `color-mix(in srgb, ...)`:** Heatmap and Progress Grid renderers — already used in `ProgressBarRenderer` (HIGH)
- **`--wf-*` CSS custom properties:** Theming and dark mode for all new components — unchanged infrastructure (HIGH)

### Expected Features

**Must have (table stakes) — all 12 types are in scope for v1.6:**
- Grouped Bar: multiple bars side-by-side per category, tooltip, legend, `chartColors` per series
- Bullet Chart: horizontal bar + `<ReferenceLine>` target marker, tooltip, labels
- Step Line: `type="stepAfter"` on `<Line>`, same axis pattern as existing line charts
- Pie Chart: full-circle (no hole), slice labels, legend, `slices` data shape shared with Donut
- Heatmap: CSS grid with `color-mix` intensity, `xLabels`/`yLabels` required fields, cell hover tooltip
- Sparkline Grid: grid of axes-hidden mini `LineChart` instances, label + value per cell
- Progress Grid: metric label, current/target/max values, target marker line, status color
- Sankey: nodes + integer-index-based links, proportional link width, node colors from `chartColors`
- Bump Chart: multi-line with `<YAxis reversed>`, end-of-line labels, rank crossings in mock data
- Range Bar: CSS-flex rows with `marginLeft`/`width` computed from start/end values, optional reference line
- Lollipop: `<ComposedChart>` with thin `<Bar>` stick + `<Scatter>` dot heads
- Polar/Rose: `<RadialBarChart>` + `<RadialBar>` with `<Cell>` per arc

**Should have (competitive differentiators — deferred to micro-iterations post v1.6):**
- Bullet Chart reference bands (background zones for poor/satisfactory/good)
- Sparkline Grid trend indicator badge (up/down arrow + %)
- Heatmap configurable color range (e.g., blue-to-red scale)
- Bump Chart highlighted entity (bold line, others muted)
- Progress Grid configurable status thresholds

**Defer (v2+, explicitly out of scope):**
- Animated fills or transitions on any chart type
- Interactive drill-down, click-to-filter, or click-to-highlight behaviors
- True Gantt with dependency arrows
- True equal-angle Nightingale rose chart (requires custom SVG path math)
- Any new npm dependency beyond current stack

### Architecture Approach

The Wireframe Builder follows a strict registry-based architecture where every section type is registered in `SECTION_REGISTRY` with 5 required fields: `renderer`, `propertyForm`, `catalogEntry`, `defaultProps`, and `schema`. The TypeScript discriminated union in `blueprint.ts` and the Zod `z.discriminatedUnion` in `blueprint-schema.ts` must stay in sync — they are maintained separately with no shared codegen. The `ChartRenderer.tsx` inner switch handles only chartType sub-variants; standalone types route directly through the registry. All leaf components follow a consistent prop interface (`title`, `height`, `categories`, `chartColors`) with extensions only where the data model demands it. The `section-registry.test.ts` enforces exact component counts (currently 23) and is the primary safety net — it must be updated for every new standalone type.

**Major components:**
1. `types/blueprint.ts` — TypeScript discriminated union; `ChartType` union grows by 7 literals; `BlueprintSection` union grows by 5 new standalone types
2. `lib/blueprint-schema.ts` — All Zod schemas defined here in `nonRecursiveSections[]`; never in component files; Zod v3 discriminated unions are non-composable
3. `lib/section-registry.tsx` — Runtime registry; 5-field entry per standalone type; count grows from 23 to 28
4. `components/sections/ChartRenderer.tsx` — Inner switch for 7 new chartType values; updated atomically with the leaf component
5. Leaf components (`[Name]Component.tsx`) — `isAnimationActive={false}` mandatory on all series; `chartColors` prop mandatory for any component with `<Legend>`

### Critical Pitfalls

1. **ChartType 4-point sync gap** — `ChartType` union, `z.enum` in Zod schema, switch `case` in `ChartRenderer`, and component import must all be updated in one commit. The `default:` cast silently renders a plain bar chart with no TypeScript error. Prevention: treat as a 4-point atomic checklist for every Wave 1 chart.

2. **Sankey index-based node references** — `<Sankey>` requires `source` and `target` in `links` to be integer array indices into `nodes[]`, not string names. Chart renders blank with no console error when strings are used. Prevention: hardcode indices in `defaultProps()`, add inline comment documenting the constraint.

3. **CSS vars in Recharts `<Legend>` swatches** — Recharts renders Legend swatches as `background-color` inline styles, which cannot resolve CSS custom properties. Dark mode breaks silently. Prevention: every new chart with `<Legend>` must accept and use the `chartColors?: string[]` prop (resolved hex values from `useWireframeChartPalette`).

4. **`isAnimationActive={false}` omitted** — Recharts defaults to animated entry. In the visual editor, every property panel keystroke triggers chart re-animation from zero. Prevention: add `isAnimationActive={false}` to every series element as a mandatory per-chart checklist item.

5. **Zod `discriminatedUnion` non-extensibility** — Zod v3 discriminated unions cannot be extended by composition or spread. All section schemas must be defined in `blueprint-schema.ts` in `nonRecursiveSections[]`. Prevention: never define section schemas in renderer or component files.

---

## Implications for Roadmap

Based on the dependency graph across all four research files, the natural phase structure maps to the Wave classification in PROJECT.md with serial atomic delivery per chart type within each wave.

### Phase 1: Wave 1 — chartType Sub-Variants (7 charts)

**Rationale:** Lowest coordination cost — only 4 files change per chart (type union, Zod enum, ChartRenderer case, leaf component). No registry updates needed. Validates the A-pattern end-to-end and builds execution momentum before the higher-complexity standalone work. Failures are caught immediately by `tsc --noEmit` and have zero risk to existing section types.
**Delivers:** 7 new `chartType` values available in the editor and ComponentGallery — Grouped Bar, Bullet, Step Line, Lollipop, Range Bar, Bump, Polar.
**Addresses:** P1 comparison-chart use cases (Grouped Bar), discrete-change line charts (Step Line), KPI vs target display (Bullet), ranking analysis (Bump).
**Avoids:** ChartType 4-point sync pitfall (atomic 4-point checklist as acceptance criterion per chart). `isAnimationActive` pitfall. CSS vars in Legend swatch pitfall.
**Recommended sequence within phase:** Grouped Bar → Step Line → Lollipop → Range Bar → Bump → Bullet → Polar.

### Phase 2: Wave 2 — Standalone Section Types (Pie, Heatmap, Sparkline Grid, Progress Grid)

**Rationale:** Standalone types require 5-file coordination and touch 3 shared files. Building one complete type before starting the next serializes shared-file edits and avoids type accumulation inconsistencies. Pie Chart is first because it mirrors the existing donut-chart pattern most closely and validates the B-pattern with lowest risk. Heatmap and Progress Grid use pure CSS (no Recharts), which makes them safe and fast to build after the pattern is proven with Pie.
**Delivers:** 4 new standalone section types registered in the catalog. Section count grows from 23 to 27.
**Addresses:** Full-circle pie charts, matrix analysis (Heatmap), executive scan-density dashboards (Sparkline Grid), OKR/goal tracking (Progress Grid).
**Avoids:** Heatmap-as-chartType-sub-variant anti-pattern. Zod non-extensibility pitfall. `<Cell key={i}>` stale-color bug for Pie Chart. `section-registry.test.ts` count must increment per type.
**Recommended sequence within phase:** Pie Chart → Progress Grid → Heatmap → Sparkline Grid.

### Phase 3: Wave 3 — Sankey (Final Standalone)

**Rationale:** Sankey is the most complex type overall — unique data shape (nodes[] + integer-indexed links[]), custom node/link coloring via render props, and the pre-build verification requirement. Building it last means the B-pattern is already proven by Phase 2, so only Sankey's specific complexity remains. All other Wave 3 chart types (Bump, Range Bar, Lollipop, Polar) are Extension Point A sub-variants and belong in Phase 1.
**Delivers:** Sankey diagram as a standalone section type. Final section count: 28. Milestone v1.6 complete.
**Addresses:** Flow/funnel visualization use cases (cash flow, conversion funnel, revenue distribution by channel).
**Avoids:** Index-based node reference pitfall (verify data shape first). `nodePadding={20}` default to prevent node overlap (known Recharts v2.15.0 issue #5559). Sankey-as-chartType-sub-variant anti-pattern.
**Pre-build gate:** Run `node -e "const r = require('./node_modules/recharts'); console.log(!!r.Sankey)"` before writing `SankeyComponent.tsx` to resolve the STACK.md vs ARCHITECTURE.md discrepancy on Sankey availability.

### Phase 4: Cross-Cutting Finalization

**Rationale:** ComponentGallery sync and screen recipe updates reference all new types from prior phases. Deferring to a dedicated finalization phase prevents blocking individual chart delivery on gallery work while ensuring no chart ships without gallery coverage and AI generation support.
**Delivers:** ComponentGallery updated with all 12 new components and mock data. `screen-recipes.ts`/`vertical-templates.ts` updated so AI generation can suggest new types. `generation-engine.test.ts` passing with new types represented.
**Addresses:** ComponentGallery sync pitfall. Screen recipe update pitfall. Confirms all 12 types render correctly in both light and dark mode.

### Phase Ordering Rationale

- Wave 1 before Wave 2 because sub-variants have lower coordination overhead and build developer familiarity with the codebase extension pattern before higher-complexity standalone work begins.
- Wave 2 before Sankey because the B-pattern should be proven on simpler types (Pie mirrors Donut; Progress Grid is pure CSS) before Sankey's unique complexity.
- Sankey last among new section types because it is the only one with a pre-build verification requirement and the highest risk of silent failure.
- Finalization phase last because it is cross-cutting and depends on all chart types existing.
- Within Wave 1: start with Grouped Bar (closest to existing stacked-bar) to validate the A-pattern with the least novel code before building novel types.

### Research Flags

Phases with standard patterns where `/gsd:research-phase` is not needed:
- **Phase 1 (Wave 1):** All chartType sub-variants use well-documented Recharts APIs verified in official docs. The A-pattern is proven in 14 existing cases in `ChartRenderer`. Skip additional research.
- **Phase 2 (Wave 2):** Pie, Progress Grid, and Heatmap have fully documented implementation strategies from ARCHITECTURE.md. Skip research.
- **Phase 4 (Finalization):** Gallery and recipe updates are mechanical and follow existing patterns. Skip research.

Phases requiring pre-implementation verification before building (not full research-phase):
- **Phase 2 — Sparkline Grid:** Verify `<ResponsiveContainer>` behavior inside a CSS grid container before building. Confirm whether `height="100%"` or a fixed numeric `height` is required when `ResponsiveContainer` is nested in a Tailwind CSS grid cell. This is a known React resize issue, not blocking, but worth a 10-minute test before the 50-line component is written.
- **Phase 3 — Sankey:** Run the CLI check (`node -e "const r = require('./node_modules/recharts'); console.log(!!r.Sankey)"`) before writing any component code. If false: plan fallback (`d3-sankey` ~15KB or pure SVG paths). Do not block Phases 1 or 2 on this.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct Recharts 2.x official API docs + GitHub 2.x source confirmation. Zero-dependency decision strongly supported. Single open gap: Sankey named export — resolvable with a CLI check. |
| Features | HIGH | All Recharts-native charts verified against official API. CSS-based types (Heatmap, Progress Grid, Range Bar) follow proven codebase patterns in `ProgressBarRenderer` and `CompositionBar`. |
| Architecture | HIGH | Based on direct inspection of 6 core wireframe builder files. Extension points clearly defined. Pattern proven by 23 existing section types across identical 5-file checklist. |
| Pitfalls | HIGH | 7 critical pitfalls identified from codebase inspection + GitHub issue references. Silent-failure modes documented precisely with specific warning signs and low-cost recovery steps. |

**Overall confidence:** HIGH

### Gaps to Address

- **Sankey named export ambiguity:** STACK.md (cites official API docs + GitHub 2.x source) confirms Sankey is a standard named export; ARCHITECTURE.md (written with awareness of conflicting information) warns to verify before building. Resolve with a 5-second CLI check at the start of Phase 3. If the export is absent, fallback options are `d3-sankey` (~15KB) or pure SVG paths — both are viable and documented in ARCHITECTURE.md. Do not block Phase 1 or Phase 2 on this gap.

- **Pie Chart registration strategy:** FEATURES.md recommends `variant: 'pie' | 'donut'` on the existing `DonutChartSection`. ARCHITECTURE.md recommends a new standalone `pie-chart` section type to preserve clean discriminated union semantics. ARCHITECTURE.md's rationale (single-visual-identity principle, avoids conditional branching in an existing component) is stronger. The roadmap should lock the standalone `pie-chart` decision in the Phase 2 plan. This is a small decision but affects which acceptance tests are written for the Pie unit.

- **Polar classification (sub-variant vs. standalone):** FEATURES.md classifies Polar as a Wave 3 standalone section. ARCHITECTURE.md classifies it as a chartType sub-variant (Extension Point A) because it uses the standard `categories[]` + `chartColors[]` contract. ARCHITECTURE.md is based on direct codebase inspection and is authoritative. The roadmap planner should explicitly classify Polar as a Phase 1 chartType sub-variant (`chartType: 'polar'`), not a standalone section type.

---

## Sources

### Primary (HIGH confidence)
- `tools/wireframe-builder/lib/section-registry.tsx` — registry pattern, 5-field contract, cast pattern
- `tools/wireframe-builder/lib/blueprint-schema.ts` — Zod discriminated union, nonRecursiveSections pattern
- `tools/wireframe-builder/types/blueprint.ts` — BlueprintSection union, ChartType union
- `tools/wireframe-builder/components/sections/ChartRenderer.tsx` — 4-point sync issue, default: cast behavior
- `tools/wireframe-builder/lib/section-registry.test.ts` — count assertion safety net
- [Recharts Sankey API](https://recharts.github.io/en-US/api/Sankey/) — component props and index-based data structure
- [Recharts Sankey source (2.x)](https://github.com/recharts/recharts/blob/2.x/src/chart/Sankey.tsx) — confirmed standard named export
- [Recharts Line API](https://recharts.github.io/en-US/api/Line/) — `type` prop values including stepAfter, bump
- [Recharts RadialBarChart API](https://recharts.github.io/en-US/api/RadialBarChart/) — native polar chart component
- [Zod discriminatedUnion non-composable issue #2567](https://github.com/colinhacks/zod/issues/2567)

### Secondary (MEDIUM confidence)
- [Recharts Gantt/Range Bar issue #4038](https://github.com/recharts/recharts/issues/4038) — confirms no native range bar support
- [Recharts Sankey node overlap issue #5559](https://github.com/recharts/recharts/issues/5559) — nodePadding default recommendation
- [Lollipop plot with React (react-graph-gallery)](https://www.react-graph-gallery.com/lollipop-plot) — ComposedChart + Scatter approach
- [shadcn/ui Radial Charts](https://ui.shadcn.com/charts/radial) — RadialBarChart usage examples
- [Recharts Cell migration guide](https://recharts.github.io/en-US/guide/cell/) — Cell deprecated in 4.x, functional in 2.x

### Tertiary (LOW confidence — verify before using)
- [recharts-gantt-chart community repo](https://github.com/rudrodip/recharts-gantt-chart) — proof of concept for BarChart with [start, end] dataKey; CSS-flex approach is recommended over this

---

*Research completed: 2026-03-12*
*Ready for roadmap: yes*
