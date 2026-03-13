# Pitfalls Research

**Domain:** Extending a Recharts 2.x wireframe builder with 12 new chart/section types
**Researched:** 2026-03-12
**Confidence:** HIGH (based on direct codebase inspection of all 5 integration points + verified Recharts 2.x GitHub issues + Zod v3 composability constraints)

---

## Critical Pitfalls

### Pitfall 1: ChartType Enum Has 4 Sync Points — Missing Any One Causes Silent Fallback

**What goes wrong:**
`ChartType` is maintained in 4 places simultaneously: the TypeScript union in `types/blueprint.ts`, the `z.enum([...])` in `BarLineChartSectionSchema` in `blueprint-schema.ts`, the inner `switch(section.chartType)` dispatch in `ChartRenderer.tsx`, and the `import` list at the top of `ChartRenderer.tsx`. The new sub-variants for Onda 1 (Grouped Bar, Bullet, Step Line, Pie as `chartType` values) require all 4 to be updated together. Missing the Zod enum causes Supabase round-trips to reject blueprints that use the new type. Missing the switch case causes the component to silently render a plain bar chart (the `default:` branch in `ChartRenderer` casts the value as `'bar' | 'line' | 'bar-line'`).

**Why it happens:**
TypeScript enforces the type annotation at compile time, but only where a variable is explicitly typed as `ChartType`. The `default:` cast in `ChartRenderer` masks the missing case without a compile error. The Zod schema is a manual mirror — no tooling flags when they diverge.

**How to avoid:**
Extend all 4 sync points in one commit, in this order:
1. `ChartType` union in `types/blueprint.ts`
2. `z.enum([...])` in `BarLineChartSectionSchema` in `blueprint-schema.ts`
3. New `case` branch inside `switch(section.chartType)` in `ChartRenderer.tsx`
4. New component import at the top of `ChartRenderer.tsx`

Extend `blueprint-schema.test.ts` with a fixture for each new `chartType` value. Run `npx tsc --noEmit` after each new case — the `default:` cast does NOT catch missing cases.

**Warning signs:**
- New chartType value displays as a plain bar chart instead of the intended visualization
- No TypeScript error despite the missing case (the `as` cast swallows it)
- `BlueprintConfigSchema.safeParse()` rejects a config with the new chartType value

**Phase to address:**
Phase 1 (Onda 1 — sub-variant charts). Create a 4-point checklist as a phase acceptance criterion before implementation starts.

---

### Pitfall 2: Sankey Requires Integer-Index Node References, Not String Names

**What goes wrong:**
Recharts `<Sankey>` requires `data.nodes` (array of `{ name: string }`) and `data.links` (array of `{ source: number, target: number, value: number }`) where `source` and `target` are **integer array indices** into `data.nodes`. All other Recharts charts accept named string keys. If `SankeySectionSchema` is designed with string-based node references in links (which feels more readable), the chart renders completely blank with no console error. Additionally, if a node is removed from `data.nodes`, all link indices must be re-calculated manually — a footgun for any future dynamic-data scenario.

**Why it happens:**
The Recharts documentation shows the index-based format but does not prominently warn that string names cannot be used. Developers who are familiar with other Recharts charts (which accept `dataKey: 'revenue'`) assume the same naming pattern applies. The chart fails silently because Recharts renders an empty SVG rather than throwing when indices are invalid.

**How to avoid:**
The `SankeySectionSchema` and `SankeySection` type must match Recharts' exact expected shape:
```typescript
type SankeySection = {
  type: 'sankey'
  title: string
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
  height?: number
}
```
Hardcode the indices in `defaultProps()` to match the `nodes` array. Add an inline comment documenting the index constraint in the component file.

**Warning signs:**
- Sankey chart area renders but is completely empty
- No console error in development
- `data.links` entries use string `source`/`target` instead of numbers

**Phase to address:**
Phase 3 (Onda 3 — advanced charts). Verify data shape against the official Recharts Sankey API before writing the component.

---

### Pitfall 3: Heatmap Has No Native Recharts Component — Cannot Be a `chartType` Sub-Variant

**What goes wrong:**
Recharts 2.x has no `<Heatmap>` component (confirmed in recharts/recharts#237, no change since). A Heatmap must be built as a standalone section type using CSS grid or SVG rectangles — it is NOT a `chartType` value for `bar-line-chart`. If misclassified as a `chartType` sub-variant, `ChartRenderer`'s `default:` branch renders a plain bar chart. If classified as a standalone section but only the TypeScript type is added (without the matching Zod schema), `SectionRenderer` returns null silently because `SECTION_REGISTRY[type]` is undefined.

**Why it happens:**
The sub-variant path (adding a `chartType` string) is simpler than the standalone path (5-file checklist). Developers facing Heatmap, Sparkline Grid, and Progress Grid may attempt to reuse the sub-variant path to reduce the file count per chart.

**How to avoid:**
Heatmap, Sparkline Grid, and Progress Grid are standalone section types. Each requires the full 5-file checklist:
1. Type in `BlueprintSection` union (`types/blueprint.ts`)
2. Zod schema in `nonRecursiveSections` array (`blueprint-schema.ts`)
3. Renderer component (`HeatmapRenderer.tsx`, etc.)
4. Property form component (`HeatmapForm.tsx`, etc.)
5. Registry entry in `SECTION_REGISTRY` (`section-registry.tsx`)

For Heatmap specifically: implement as a CSS grid with background colors derived from `color-mix(in srgb, var(--wf-chart-1) XX%, transparent)` — the same pattern used by the existing badge fills in the app.

**Warning signs:**
- `SectionRenderer` returns null for the new type (registry lookup fails silently)
- Section does not appear in the `ComponentPicker` catalog
- TypeScript passes even though the Zod schema was not added (the union type and schema are separate)

**Phase to address:**
Phase 2 (Onda 2). The 5-file standalone checklist must be a phase acceptance criterion.

---

### Pitfall 4: Zod `discriminatedUnion` Cannot Be Extended After Construction — Schema Must Be Edited In-Place

**What goes wrong:**
`BlueprintSectionSchema` is assembled at module load time via `z.discriminatedUnion('type', [...nonRecursiveSections, <chart-grid>])`. Zod v3 `discriminatedUnion` validates that all members have unique `type` literals and is not composable — you cannot call `.or()` on a discriminated union or add new members by spreading. Attempting to extend by patching the array after-the-fact (e.g., by pushing to it outside `blueprint-schema.ts`) causes a TypeScript error because `nonRecursiveSections` is typed as `readonly [...] as const`. Using `z.union()` as an alternative breaks Zod's discriminated parse performance and removes the "unrecognized key" error that protects against typos.

**Why it happens:**
Zod's composability limitation (`colinhacks/zod#2567`) means developers who want to add schemas in separate files must bring them all back into `blueprint-schema.ts`. The temptation to define a new section's schema adjacent to its component is understandable but breaks the single assembly point.

**How to avoid:**
All section schemas must be defined inside `blueprint-schema.ts`. The addition pattern is:
1. Define `const NewSectionSchema = z.object({ type: z.literal('new-type'), ... })` in `blueprint-schema.ts`
2. Add it to `nonRecursiveSections`
3. Export it at the bottom named exports block
4. Import it in `section-registry.tsx`

Never define section schemas in component files or renderer files.

**Warning signs:**
- TypeScript error "Argument of type 'readonly [...]' is not assignable" when trying to extend the array
- A developer defines a Zod schema inside a renderer or form component file
- Runtime Zod error "ZodDiscriminatedUnion: Invalid discriminator value" after a new type is added

**Phase to address:**
All phases. Document this constraint in every phase plan's implementation notes.

---

### Pitfall 5: CSS Custom Properties Cannot Resolve in Recharts `<Legend>` Background Colors

**What goes wrong:**
Recharts `<Legend>` renders colored swatches as HTML `<li>` elements with inline `background-color`. SVG `fill="var(--wf-chart-1)"` works correctly inside chart paths (SVG attributes can resolve CSS custom properties via the cascade), but `background-color: var(--wf-chart-1)` set as an inline style by Recharts' Legend renderer resolves to an empty string in Chromium. Swatches appear grey in light mode and invisible in dark mode. This affects every new chart component that uses `<Legend>` if they pass CSS vars directly.

**Why it happens:**
This is a well-known Recharts limitation. The codebase already has `useWireframeChartPalette.ts` specifically to work around it — the hook reads resolved hex strings from `getComputedStyle`. New chart components that do not accept the `chartColors?: string[]` prop and use it for Legend payload colors will silently break the legend in dark mode.

**How to avoid:**
Every new chart component that renders a `<Legend>` must:
1. Accept `chartColors?: string[]` prop
2. Use `chartColors?.[i] ?? 'var(--wf-chart-N)'` for SVG `fill`/`stroke` attributes and Legend `color` values
3. The parent renderer (`ChartRenderer` or standalone renderer) passes resolved colors from `useWireframeChartPalette`

For charts without `<Legend>` (Heatmap, Sparkline Grid, Lollipop), CSS vars used directly in SVG `fill` are safe.

Copy the prop signature from `BarLineChart.tsx` — the existing pattern is correct.

**Warning signs:**
- Legend swatches appear grey or invisible when dark mode is toggled
- New component does not accept `chartColors` prop
- `fill="var(--wf-chart-1)"` appears directly in a `<Legend>` `payload` entry

**Phase to address:**
All phases. Gate every new chart component on `chartColors` prop presence during the code review step.

---

### Pitfall 6: Recharts `<Pie>` Cell Key Prop Misalignment Causes Stale Colors After Branding Override

**What goes wrong:**
Recharts `<Pie>` requires `<Cell>` child components to control per-slice colors. If `<Cell key={slice.label}>` uses the label string as a key, React's reconciler reuses cell DOM nodes when labels stay the same but colors change (e.g., after a branding override is applied). The chart visually appears to update but slice colors remain from the previous render cycle. The bug is only visible after switching a client's branding or toggling dark mode — not during initial load.

**Why it happens:**
Using semantic keys (label) is a standard React pattern for list items. The problem is specific to Recharts `<Cell>` because Recharts controls fill as a prop — React does not re-render the SVG element if the key matches.

**How to avoid:**
Always use `key={i}` (array index) for `<Cell>` inside `<Pie>`. The existing `GaugeChartComponent.tsx` and `DonutChart.tsx` follow this pattern. Copy them. Never use `key={slice.label}` or `key={slice.value}`.

**Warning signs:**
- Applying a branding override does not update Pie/Donut slice colors until page reload
- Colors from one client's branding appear in another client's wireframe after switching

**Phase to address:**
Phase 1 (Onda 1 — Pie chart as sub-variant or standalone). Verify during the mandatory browser validation step.

---

### Pitfall 7: `isAnimationActive={false}` Omitted — Visual Editor Re-Animations on Every Prop Change

**What goes wrong:**
Every existing chart in the codebase sets `isAnimationActive={false}` on all series components (`<Bar>`, `<Line>`, `<Area>`, `<Pie>`, etc.). New chart components that omit this prop will animate every time the visual editor's property panel changes a value — which happens on every keystroke in a text field. The chart re-animates from zero on each render, making the editor feel broken and causing layout jank.

**Why it happens:**
`isAnimationActive` defaults to `true` in Recharts. The existing charts disable it by convention but this is not enforced by TypeScript or any lint rule.

**How to avoid:**
Set `isAnimationActive={false}` on every series child of every new chart component. This is a mandatory implementation rule, not a performance optimization. Add it to the phase plan acceptance checklist.

**Warning signs:**
- Typing in a chart's title field causes the chart bars/lines to animate from zero
- Chart looks visually "bouncy" while navigating properties in the editor

**Phase to address:**
All phases. Add `isAnimationActive={false}` to the "Looks Done But Isn't" checklist for every chart.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping the property form for a new chart type | Saves ~1h per chart | Section cannot be edited in the visual editor; must resort to raw JSON in Supabase | Never — all SECTION_REGISTRY entries require a propertyForm |
| Reusing `BarLineChartForm` unchanged for new chartType sub-variants | Zero new code | Form shows irrelevant fields (categories, xLabel/yLabel) for charts like Pie or Polar that do not use them | Acceptable only if irrelevant fields are conditionally hidden by `chartType` value |
| Hardcoding colors in chart components instead of using `chartColors` prop | Simpler component, faster to write | Dark mode broken, branding override ignored for that component | Never for chart fill/stroke; acceptable for structural SVG (axes, grid lines) |
| Adding `type` to `BlueprintSection` union but not to Zod schema | TypeScript passes | Supabase round-trip drops the section during safeParse validation | Never — union and schema must be in sync |
| Implementing Heatmap or Progress Grid with Recharts as a workaround | Stays within the chart library | Recharts has no native heatmap; workarounds are complex, token-incompatible, and unmaintainable | Never — use CSS grid for Heatmap, Progress Grid |
| Using `z.unknown()` for chart-specific data fields to avoid schema design | Avoids upfront schema thinking | No runtime validation; malformed data reaches renderer silently | Acceptable for v1 wireframe mock data where types are controlled; never for production data ingestion |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Recharts `<Sankey>` | Passing string node names as `source`/`target` in links | Use integer array indices matching the position in `data.nodes` |
| Recharts `<Pie>` (standalone Pie chart section) | Using `PieChart` component inside a `chart-grid` that already contains a `GaugeChartSection` (which also uses `PieChart`) | Each is independent; no conflict — they render in separate DOM subtrees. Ensure section type is `'pie-chart'` (standalone) not a `chartType` on `bar-line-chart` |
| Recharts `<ResponsiveContainer>` | Parent container has `height: auto` or a flex parent without explicit height — container collapses to 0 | Always set explicit `style={{ height: N }}` on the direct parent `<div>` of `<ResponsiveContainer>`, or pass a numeric `height` prop |
| Recharts `<Tooltip>` | Tooltip background hardcoded white — invisible in dark mode | Use `contentStyle={{ background: 'var(--wf-surface)', border: '1px solid var(--wf-card-border)', color: 'var(--wf-heading)' }}` on every `<Tooltip>` |
| `section-registry.tsx` type cast | Forgetting the `as unknown as ComponentType<SectionRendererProps>` double cast on new renderer — TypeScript error in registry entry | Copy the cast pattern from existing entries; the cast exists because renderer prop types are narrower than the generic `SectionRendererProps` |
| `blueprint-migrations.ts` | Adding a required (non-optional) field to an existing section type without writing a migrator | Mark new fields `.optional()` in Zod or provide a `DEFAULT`; write a migrator only when a field must be required for all existing data |
| `screen-recipes.ts` / `vertical-templates.ts` | New chart types are never referenced — AI generation never suggests them | After each wave, add at least one recipe section using the new types; update keyword matching in `SCREEN_RECIPES` |
| `ComponentGallery.tsx` | New component exists in `tools/` but not imported or rendered in the gallery page | Add import + render block with mock data; verify in browser — the gallery is the visual regression test for all components |
| `z.lazy()` and recursive `chart-grid` | Concern that new types break the lazy reference | New types in `nonRecursiveSections` are automatically included; the lazy reference rebuilds the discriminated union correctly. No special handling needed. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple `<ResponsiveContainer>` instances with `height="100%"` | Scroll janky on screens with 6+ charts; ResizeObserver triggers on every pixel | Use `width="100%"` + fixed numeric `height` prop instead of `height="100%"` | Noticeably at 8+ charts on a single screen |
| Recharts animation enabled on all new charts | Visual editor blinks and re-animates on every property change keystroke | Set `isAnimationActive={false}` on every `<Bar>`, `<Line>`, `<Area>`, `<Pie>` | Immediately visible in the visual editor, regardless of chart count |
| `useWireframeChartPalette` called per-chart inside `chart-grid` | 12 DOM reads per render cycle; excessive `getComputedStyle` calls | Hook is called once at `BlueprintRenderer` level; resolved array passed down as `chartColors` prop — existing pattern is correct | Noticeable when `chart-grid` nests 4+ charts |
| New chart calling `getComputedStyle` directly at render time | Race condition: styles not available on first paint → empty string → chart renders colorless | Use the passed-in `chartColors` prop exclusively; never call `getComputedStyle` inside a chart component | On first mount; intermittent in test environments |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Bump Chart mock data has flat or ascending rank (no crossing lines) | Users cannot understand the chart represents rankings; looks like a line chart | Mock data must show clear rank position changes: a series starting at position 3, dropping to 1, then recovering to 2 |
| Lollipop Chart using same blue as bar charts in nearby sections | Visually indistinct from a BarChart in the component gallery and wireframe previews | Use `--wf-chart-1` for lollipop heads, `--wf-muted-foreground` for the stick/stem |
| Polar/Radar-style chart with more than 8 spokes | Labels overlap and become unreadable; chart looks cluttered | Limit mock data to 5-6 categories; document maximum in the section's `description` field in `catalogEntry` |
| Heatmap without `xLabels` and `yLabels` | Users cannot interpret what each axis represents | `HeatmapSection` type must include `xLabels: string[]`, `yLabels: string[]` as required fields, not optional |
| Sankey without `nodePadding` configured | Nodes overlap visually when there are more than 6 nodes (known Recharts issue from v2.15.0) | Set `nodePadding={20}` as default in the component; expose it as an optional override |
| Sparkline Grid showing all-zero arrays in `defaultProps()` | Grid renders as flat lines — indistinguishable from "no data" state | Default mock data must show a visible trend; never use all-zero arrays in `defaultProps()` |
| Progress Grid without `max` defined per item | All bars render at 100% OR throw NaN if `max` is 0 | `max` should be a required numeric field in `ProgressGridItem`, not optional |

---

## "Looks Done But Isn't" Checklist

For each new chart/section type, verify all of the following before considering it complete:

- [ ] **TypeScript union updated:** `ChartType` (for sub-variants) or `BlueprintSection` union (for standalone types) includes the new type — `npx tsc --noEmit` passes with zero errors
- [ ] **Zod schema added:** New schema in `nonRecursiveSections` array in `blueprint-schema.ts` — `BlueprintConfigSchema.safeParse()` accepts a minimal valid example of the new type
- [ ] **Registry entry complete:** `SECTION_REGISTRY` entry has all 5 fields: `renderer`, `propertyForm`, `catalogEntry`, `defaultProps`, `schema`
- [ ] **Dark mode verified:** Wireframe viewer dark mode toggle — chart renders correctly in both modes (no invisible elements, no hardcoded white backgrounds, legend swatches visible)
- [ ] **`chartColors` prop wired:** If the component uses `<Legend>`, it accepts and uses `chartColors` prop — verified in browser with a branding override applied
- [ ] **`isAnimationActive={false}`:** Set on every `<Bar>`, `<Line>`, `<Area>`, `<Pie>`, or equivalent series component
- [ ] **Tooltip dark mode styled:** `<Tooltip>` uses `contentStyle` with `--wf-*` CSS vars (or the chart has no tooltip)
- [ ] **`defaultProps()` is non-trivial:** The default section produces a visually meaningful chart — no empty arrays, no all-zero values, no blank titles
- [ ] **Property form exists and works:** New section can be edited in the visual editor — open the property panel, change at least one field, confirm the chart updates
- [ ] **ComponentGallery updated:** `src/pages/tools/ComponentGallery.tsx` imports and renders the new component with mock data
- [ ] **Recipe updated:** At least one entry in `screen-recipes.ts` or `vertical-templates.ts` references the new section type
- [ ] **Schema test added:** `blueprint-schema.test.ts` has a fixture for the new type with a `safeParse` assertion

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| ChartType enum updated but Zod schema not — existing blueprints fail safeParse | LOW | Add the new value to `z.enum([...])` in `BarLineChartSectionSchema`; no data migration needed |
| Standalone section added to union but not Zod schema — section silently dropped from DB | LOW | Add Zod schema; re-save any affected blueprints from the visual editor |
| Sankey data shape wrong — chart renders blank | LOW | Update `SankeySection` type and schema to use integer indices; update `defaultProps()` with correct index values |
| CSS var in Legend swatch — swatches grey or invisible in dark mode | LOW | Wire `chartColors` prop from parent; replace `fill="var(--wf-chart-1)"` with `fill={chartColors?.[0] ?? 'var(--wf-chart-1)'}` |
| Section missing from `SECTION_REGISTRY` — `SectionRenderer` silently returns null | LOW | Add registry entry; no data migration needed |
| ComponentGallery not updated — new component not visible | MEDIUM | Add import and render block; verify visually in browser; requires full dark/light mode check |
| Screen recipe not updated — AI generation never uses new types | MEDIUM | Add recipe section; run `generation-engine.test.ts` to confirm new type appears in generated output |
| Animation not disabled — visual editor feels broken | LOW | Add `isAnimationActive={false}` to all series elements; verify in editor with property panel open |
| Required field added to existing section type without migrator | HIGH | Mark field `.optional()` in Zod; add a schema migration (`v1 → v2`) to `blueprint-migrations.ts` that fills the default value; bump `CURRENT_SCHEMA_VERSION`; test against the pilot client's existing blueprint in Supabase |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| ChartType 4-point sync | Phase 1 (Onda 1) | `npx tsc --noEmit` + `blueprint-schema.test.ts` green after each new `chartType` |
| Pie chart `<Cell>` key | Phase 1 (Onda 1 — Pie) | Browser: apply branding override, verify slice colors update without page reload |
| Heatmap misclassified as chartType | Phase 2 (Onda 2) | Heatmap appears in `ComponentPicker` under correct category; not in ChartRenderer switch |
| Standalone section missing from Zod | Phase 2 (Onda 2) | `safeParse()` passes for each Onda 2 type in `blueprint-schema.test.ts` |
| Zod schema non-extensibility | All phases | `npx tsc --noEmit` + Zod tests green after each section schema addition |
| Sankey index-based data | Phase 3 (Onda 3) | Sankey renders with visible flow: nodes, links, and labels in browser |
| CSS vars in Legend swatches | All phases (charts with Legend) | Dark mode toggle in browser; all legend swatches remain visible |
| Tooltip dark mode | All phases (charts with Tooltip) | Dark mode in browser; tooltip background readable against chart |
| Animation not disabled | All phases | Open visual editor; type in chart title field — no chart re-animation |
| ComponentGallery out of sync | End of each wave | Gallery page shows every new component with correct light/dark styling |
| Screen recipes not updated | End of each wave | `generation-engine.test.ts` passes; new type appears in at least one generated blueprint |
| ResponsiveContainer height collapse | All phases | Resize browser window; no chart collapses to 0 height |

---

## Per-Chart Warning Signs Quick Reference

| Chart Type | Wave | Recharts Component | Primary Risk | Data Shape Gotcha |
|------------|------|-------------------|--------------|-------------------|
| Grouped Bar | 1 | `<BarChart>` with multiple `<Bar>` | Missing `barCategoryGap` — bars overlap | `data[i]` must have one numeric key per group |
| Bullet Chart | 1 | Custom SVG (no Recharts analog) | Misclassifying as `chartType` | `{ label, actual, target, ranges[] }` per item |
| Step Line | 1 | `<LineChart>` with `type="stepAfter"` on `<Line>` | Forgetting `type="stepAfter"` — renders as smooth curve | Same as standard line chart |
| Pie Chart | 1 | `<PieChart>` + `<Pie>` + `<Cell>` | `<Cell key={index}>` — must use array index; label overlap for small slices | `data[i].value` must be numeric |
| Heatmap | 2 | CSS grid (no Recharts) | Using Recharts ScatterChart hack — CSS vars not applied | `matrix[row][col]` numeric intensity; `xLabels`, `yLabels` required |
| Sparkline Grid | 2 | `<LineChart>` without axes | Axes not hidden — padding steals sparkline height | `data[i]` must be `{ v: number }`; no empty arrays in defaultProps |
| Progress Grid | 2 | CSS `<div>` bars (no Recharts) | `max` undefined → NaN → 0% bar | `{ label, value, max }` — `max` required |
| Sankey | 3 | `<Sankey>` | Index-based links misunderstood as string names | `{ nodes: [{name}], links: [{source: idx, target: idx, value}] }` |
| Bump Chart | 3 | `<LineChart>` inverted Y axis | Flat mock data — no visible rank crossings | `data[period]` has rank as y value; lower rank number = top |
| Range Bar | 3 | `<BarChart>` with two stacked `<Bar>` | No native range bar — use invisible base + visible range | `{ category, start, end }` per item |
| Lollipop | 3 | `<ComposedChart>` with `<Scatter>` + `<ErrorBar>` | `ErrorBar` direction must be `"y"` for vertical lollipop | `{ x: string, y: number }` per item |
| Polar | 3 | `<RadarChart>` (type already exists) | Duplicate of existing `radar` chartType — only implement if distinct "polar area fill" style is needed | Same as Radar |

---

## Sources

- Direct codebase inspection: `tools/wireframe-builder/lib/blueprint-schema.ts` — `nonRecursiveSections` pattern and `z.discriminatedUnion` assembly
- Direct codebase inspection: `tools/wireframe-builder/lib/section-registry.tsx` — 5-field registry structure with `as unknown as ComponentType<SectionRendererProps>` cast pattern
- Direct codebase inspection: `tools/wireframe-builder/components/sections/ChartRenderer.tsx` — 4-point sync issue and `default:` cast
- Direct codebase inspection: `tools/wireframe-builder/lib/useWireframeChartPalette.ts` — documented rationale for CSS var → hex resolution
- Direct codebase inspection: `tools/wireframe-builder/components/GaugeChartComponent.tsx` — correct `<Cell key={i}>` pattern
- [Recharts Sankey API — recharts.github.io](https://recharts.github.io/en-US/api/Sankey/)
- [Recharts Sankey index-based node references — GitHub Discussion #2771](https://github.com/recharts/recharts/discussions/2771)
- [Recharts Sankey node visual overlap in v2.15.0 — GitHub Issue #5559](https://github.com/recharts/recharts/issues/5559)
- [Recharts no native heatmap — GitHub Issue #237](https://github.com/recharts/recharts/issues/237)
- [Recharts Pie chart label overlap — GitHub Issue #903](https://github.com/recharts/recharts/issues/903)
- [Zod discriminatedUnion not composable — GitHub Issue #2567](https://github.com/colinhacks/zod/issues/2567)
- [Recharts official performance guide — recharts.github.io/guide/performance](https://recharts.github.io/en-US/guide/performance/)
- [Recharts CSS variables for dark mode — Reshaped docs](https://www.reshaped.so/docs/getting-started/guidelines/recharts)
- `.planning/PROJECT.md` — v1.6 milestone target features, constraint list, and out-of-scope decisions

---
*Pitfalls research for: v1.6 — 12 new chart/section types in Recharts 2.x wireframe builder*
*Researched: 2026-03-12*
