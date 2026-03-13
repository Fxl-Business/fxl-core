# Feature Research: v1.6 — 12 New Chart/Section Types

**Domain:** Wireframe Builder — BI Dashboard Chart Library Expansion
**Researched:** 2026-03-12
**Confidence:** HIGH for Recharts-native charts (documented API verified). MEDIUM for non-native charts requiring custom implementation (Range Bar, Bump Chart — no built-in Recharts support confirmed). LOW for Heatmap pattern without external library.

---

## Scope

This research covers ONLY the 12 new chart/section types for v1.6. It answers:

- What are the **table stakes** features each chart type must have in a BI wireframe context?
- What are **differentiators** — enhancements worth having but not blocking?
- What are **anti-features** — commonly requested things that add complexity without proportional value?
- What are the **expected interactions** (tooltip, hover, click, drill-down)?
- What is the **implementation path** in the existing Recharts 2.x + section registry architecture?

The existing 22 section types, `--wf-*` tokens, `chartColors?: string[]` prop, and section registry pattern are treated as **fixed infrastructure**.

---

## Architecture Context

All 12 new types plug into the existing pattern:

1. **New `ChartType` union member** OR **new `BlueprintSection` type** — depends on whether the chart is a sub-variant of `bar-line-chart` (dispatched in `ChartRenderer`) or a standalone section type (registered directly in `SECTION_REGISTRY`).
2. **New renderer component** in `tools/wireframe-builder/components/`
3. **New property form** in `tools/wireframe-builder/components/editor/property-forms/`
4. **New `SECTION_REGISTRY` entry** in `lib/section-registry.tsx`
5. **Zod schema** in `lib/blueprint-schema.ts`
6. **`BlueprintSection` union member** in `types/blueprint.ts`

Wave classification from PROJECT.md:
- **Wave 1 (chart sub-variants):** Grouped Bar, Bullet Chart, Step Line, Pie Chart — these are new `chartType` values under `BarLineChartSection`
- **Wave 2 (standalone sections):** Heatmap, Sparkline Grid, Progress Grid — these are new `BlueprintSection` types
- **Wave 3 (advanced charts):** Sankey, Bump Chart, Range Bar, Lollipop, Polar — these are new `BlueprintSection` types

---

## Feature Landscape by Chart Type

### 1. Grouped Bar (Wave 1 — `chartType: 'grouped-bar'`)

**What it is:** Multiple data series rendered as bars side-by-side per category (not stacked). Standard for comparing two or three metrics across the same X categories.

**BI use cases:** Receita vs Meta por mês, Realizado vs Orçado por categoria, Vendas por canal por período.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple bars side-by-side per category | Core definition of grouped bar | LOW | Recharts BarChart with multiple `<Bar>` components, each with a different `dataKey` |
| Tooltip showing all series on hover | Users expect all values per category in one tooltip | LOW | Recharts default Tooltip handles multi-bar automatically |
| Legend with series labels | Users need to distinguish series | LOW | Recharts `<Legend>` component |
| X and Y axis with proper tick labels | Orientation and scale comprehension | LOW | Same as existing BarLineChart pattern |
| `chartColors` palette applied per series | Consistent branding | LOW | Map `chartColors[i]` to each `<Bar fill>` |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `barGap` and `barCategoryGap` config props | Fine-tune visual density | LOW | Recharts BarChart accepts these props directly |
| Optional value labels on top of bars | Quick reading without tooltip | MEDIUM | Recharts `<LabelList>` inside `<Bar>` |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| More than 3 series side-by-side | More data is better | Bars become too narrow to read; defeats purpose | Use stacked-bar or separate charts for >3 series |
| Click-to-filter behavior | Interactivity | Out of scope for wireframe context (wireframes show intent, not behavior) | Document the interaction intent in blueprint description field |

**Recharts path:** Recharts `BarChart` with multiple `<Bar>` elements. Set `barCategoryGap="20%"` and `barGap={4}` on the chart. Each `<Bar>` gets `fill={chartColors[i]}`. This is a native, well-supported pattern.

**Confidence:** HIGH — verified against Recharts BarChart API docs.

---

### 2. Bullet Chart (Wave 1 — `chartType: 'bullet'`)

**What it is:** A horizontal bar showing current value against a target marker, with optional background reference bands (poor / satisfactory / good zones). Stephen Few's design for replacing gauge charts with less visual noise.

**BI use cases:** Vendas realizadas vs meta, Taxa de conversão vs benchmark, NPS vs target, Margem vs objetivo.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Horizontal bar showing current value | Core visual | MEDIUM | Recharts `BarChart` layout="vertical" with a single `<Bar>` |
| Target marker line at the goal value | The distinguishing element of bullet chart | MEDIUM | Recharts `<ReferenceLine>` on the bar axis |
| Tooltip on hover showing current and target | Data comprehension | LOW | Custom Tooltip formatter |
| Label with metric name and unit | Context | LOW | Config prop |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Reference bands (background zones) | Visual encoding of performance zones | HIGH | Stack multiple transparent `<Bar>` components behind the main bar to fake reference bands — Recharts has no native band support |
| Multiple bullet rows in one component | Compare several metrics at once | MEDIUM | Iterate `items` array, render one horizontal BarChart per row |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Animated fill on load | Looks polished | Adds complexity, conflicts with `isAnimationActive={false}` used for consistency in wireframe context | Keep static like other components |
| Vertical orientation | "Different layout" | Loses the key advantage of bullet chart (dense horizontal layout compares multiple KPIs at once) | Use GaugeChart for vertical single-value display |

**Recharts path:** Recharts does NOT have a native bullet chart. Implementation: `BarChart` with `layout="vertical"`, single `<Bar>` for the value, `<ReferenceLine>` for target. Reference bands require stacking transparent background bars — HIGH complexity. For Wave 1, build without reference bands (LOW complexity) and treat bands as a differentiator for a future micro-iteration.

**Confidence:** MEDIUM — Recharts `<ReferenceLine>` confirmed, reference band hack is community-proven but not documented officially.

---

### 3. Step Line (Wave 1 — `chartType: 'step-line'`)

**What it is:** A line chart where segments between data points are horizontal-then-vertical (steps) rather than interpolated curves. Used for data that changes at discrete moments (pricing changes, policy changes, tier changes).

**BI use cases:** Histórico de preço de produto, Evolução de limite de crédito, Plano de taxa contratada, Regras de desconto por faixa.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Step interpolation (no curve) | Core definition | LOW | Recharts `<Line type="stepAfter">` — native, confirmed |
| Tooltip on hover with value | Standard expectation | LOW | Recharts default Tooltip |
| X axis (time/categories) | Orientation | LOW | Same as existing line chart |
| Y axis with value scale | Scale comprehension | LOW | Same as existing line chart |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `stepBefore` vs `stepAfter` config | Semantic accuracy (does change happen before or after the tick?) | LOW | Single prop `type` on `<Line>` — `stepBefore` or `stepAfter` |
| Area fill below step line | Visual weight for emphasis | LOW | Use `<AreaChart>` with `type="stepAfter"` instead of `LineChart` |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Smooth curve option | "Flexibility" | Defeats the semantic purpose of step line (smooth means continuous change) | Use existing `line` chartType for smooth lines |

**Recharts path:** Near-zero complexity. In `ChartRenderer`, add `case 'step-line'` dispatching to `AreaChartComponent` (or a new `StepLineChartComponent`) with `type="stepAfter"` on the Line/Area element. Reuses existing patterns entirely.

**Confidence:** HIGH — `type="stepAfter"` on Recharts `<Line>` is documented and confirmed.

---

### 4. Pie Chart (Wave 1 — `chartType: 'pie'` or new section type)

**What it is:** Classic pizza-style pie chart (full circle, unlike the existing donut). Slices fill the full circle. Legend shows slice labels and values.

**Note:** The existing `donut-chart` section type uses `<Pie innerRadius="40%" outerRadius="70%">`. A pie chart is the same with `innerRadius={0}`. This is a sub-variant of donut, NOT a new section type.

**BI use cases:** Distribuição de receita por produto, Participação de mercado, Composição de carteira.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full circle (no hole) | Distinction from donut | LOW | `innerRadius={0}` on the existing `<Pie>` component |
| Slice labels showing percentage | Standard comprehension | LOW | Recharts `<LabelList>` or custom `label` prop on `<Pie>` |
| Legend with slice names | Identification | LOW | Recharts `<Legend>` |
| Tooltip on hover showing name and value | Standard | LOW | Recharts default Tooltip |
| `slices` data array with label+value | Config interface | LOW | Same as existing `donut-chart` section |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom label rendering (outside arc, with line) | Professional look | MEDIUM | Recharts custom `label` render prop on `<Pie>` |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Exploded slices (one slice pulled out) | Emphasis on one slice | Implementation complexity disproportionate to wireframe value | Use a separate donut chart with that slice highlighted |
| 3D effect | "Looks impressive" | Misrepresents data (skews area perception) | Never implement |

**Recharts path:** This can be added as `chartType: 'pie'` to the existing `bar-line-chart` section and dispatched in `ChartRenderer` to a new `PieChartComponent` that wraps the existing `DonutChart` logic with `innerRadius={0}`. Alternatively, add a `variant: 'pie' | 'donut'` prop to `DonutChartSection` — this is cleaner and avoids duplicating the section type.

**Recommendation:** Add `variant?: 'pie' | 'donut'` to `DonutChartSection` and handle in `DonutChart` component. No new section type needed. This is the lowest-complexity, highest-consistency path.

**Confidence:** HIGH — Recharts `<Pie innerRadius={0}>` is trivially supported.

---

### 5. Heatmap (Wave 2 — new standalone section type)

**What it is:** A matrix of colored cells where color intensity encodes a numeric value. Rows are one dimension, columns are another. Used for finding patterns across two categorical dimensions.

**BI use cases:** Vendas por produto × mês, Chamados por tipo × dia da semana, NPS por região × trimestre, Performance por vendedor × produto.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grid of colored cells | Core visual | MEDIUM | Recharts has no native heatmap — must use pure CSS/SVG grid with `color-mix()` for intensity |
| Color scale (low = light, high = dark) | Encoding convention | MEDIUM | Manual CSS interpolation between two CSS vars using inline `opacity` or `color-mix` |
| Row labels (Y axis) and column headers (X axis) | Axis orientation | LOW | Regular div layout |
| Tooltip on cell hover with exact value | Data reading | LOW | CSS title attribute or custom hover state |
| `rows` × `columns` data structure in config | Config interface | LOW | `{ rowLabel: string, cells: { colLabel: string, value: number }[] }[]` |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Color range configurable (e.g., blue-to-red) | Semantics for different data (heat vs cold, good vs bad) | MEDIUM | `colorScale: [lowColor, highColor]` config prop mapped to `color-mix` |
| Cell value displayed inside cell | Reduces need to hover | LOW | Conditional rendering based on cell size |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| D3/visx/nivo dependency for heatmap | "More capable" | Adds a significant new dependency to the project for one chart type; stack policy is Recharts | Pure CSS grid with inline styles using `color-mix(in srgb, var(--wf-chart-1) X%, transparent)` |
| Animated transitions between filter states | Polished feel | Wireframes are static by design; no real data transition happens | Accept static rendering |
| Zoom/pan on large grids | Handles big datasets | Wireframe context doesn't need real data handling | Limit to 12×12 cells max in config schema |

**Recharts path:** NOT a Recharts chart. Build as pure HTML/CSS grid using `display: grid`. Use `color-mix(in srgb, var(--wf-accent) ${pct}%, var(--wf-bg) 100%)` for intensity interpolation. This follows the same approach as `CompositionBar` (pure HTML/CSS, no Recharts). Medium complexity but clean implementation.

**Confidence:** MEDIUM — CSS approach is well-established; confirmed `color-mix` is already used in existing components (`ProgressBarRenderer` uses it).

---

### 6. Sparkline Grid (Wave 2 — new standalone section type)

**What it is:** A grid of small inline charts — each cell shows a mini line/bar chart (no axes, no labels) alongside a metric label and current value. Designed for scanning many metrics at once.

**BI use cases:** Dashboard de tendências (receita, margem, tickets, NPS em uma grade), Resumo executivo com mini-gráficos, Visão geral de produtos/regiões.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grid of mini-charts (label + value + sparkline) | Core visual | MEDIUM | `display: grid` with configurable `columns` prop; each cell renders a mini Recharts chart without axes |
| No axes, no grid lines, no tooltip on sparklines | Sparklines are ambient, not interactive | LOW | Omit `<XAxis>`, `<YAxis>`, `<CartesianGrid>` — Recharts supports this |
| Label and primary value per cell | Context at a glance | LOW | Config: `{ label: string, value: string, data: number[] }[]` |
| Configurable chart variant per cell (line, bar, area) | Different metrics suit different encodings | LOW | `sparkType?: 'line' | 'bar' | 'area'` per item |
| `chartColors` respected for fill/stroke | Brand consistency | LOW | Pass first `chartColor` to each mini-chart |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Trend indicator badge (up/down arrow + %) | Instant reading without scanning the sparkline | LOW | Same as `KpiCard` variation/semaforo pattern — reuse existing logic |
| Optional `sparkType` per item | Richer scanning patterns | LOW | Config field with enum |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Interactive sparklines (click to expand) | Drill-down feel | Wireframe context is static; interactions are documented in intent, not implemented | Note interaction intent in blueprint description |
| External sparkline library (`react-sparklines`, etc.) | Dedicated sparkline features | Adds dependency; Recharts `LineChart` without axes is sufficient and already available | Use minimal Recharts `LineChart` with axes hidden |

**Recharts path:** Grid of `<LineChart height={40}>` (or `BarChart`) with no `<XAxis>`, `<YAxis>`, no `<CartesianGrid>`, `margin={{ top: 4, right: 4, bottom: 4, left: 4 }}`. Minimal Recharts usage that is already confirmed. Low friction.

**Confidence:** HIGH — Recharts axes are optional and simply omitted. Pattern is standard.

---

### 7. Progress Grid (Wave 2 — new standalone section type)

**What it is:** A vertical list of rows, each showing a metric name, current value, target value, and a horizontal progress bar. Like the existing `progress-bar` section but with explicit target tracking and current/target value display.

**Distinction from existing `progress-bar`:** The existing section shows `value/max` as percentage. Progress Grid adds a `target` separate from `max` (allowing "above target" visualization), shows numeric values explicitly, and is optimized for BI KPI tracking with named metrics and status coloring.

**BI use cases:** Metas de vendas por representante, OKRs operacionais, Budget vs Realizado por centro de custo, Plano de ação com % de avanço.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Metric label | Identification | LOW | Config `label` field |
| Current value display (numeric + formatted) | Current state | LOW | Config `current` field |
| Target value display | Goal context | LOW | Config `target` field |
| Progress bar filled to `current/max` percentage | Visual progress | LOW | Same as `ProgressBarRenderer` — reuse the bar rendering pattern |
| Target marker line on the bar | Shows where the goal sits | MEDIUM | Absolute-positioned thin vertical line at `(target/max)*100%` within the bar container |
| Status color (red/yellow/green based on ratio) | At-a-glance health | LOW | Conditional color: `current >= target ? --wf-positive : current >= target*0.8 ? --wf-chart-warn : --wf-negative` |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Configurable status thresholds (e.g., 80%=yellow, 100%=green) | Business-specific definitions of "on track" | MEDIUM | `thresholds?: { warn: number, ok: number }` per item |
| Row-level period label (e.g., "Q1 2026") | Multi-period comparison | LOW | Optional `period` config field |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Animated fill on mount | Polished UX | Wireframe context is static; adds implementation noise | Static fill only |
| Click to edit values inline | Interactive | Out of scope for wireframe; editing is via blueprint config | Document interaction intent |

**Recharts path:** Pure HTML/CSS (no Recharts). Same pattern as existing `ProgressBarRenderer` with additions: target marker via absolute positioning, current/target values as text, status color computation. LOW complexity addition over existing patterns.

**Confidence:** HIGH — extends proven `ProgressBarRenderer` pattern.

---

### 8. Sankey Diagram (Wave 3 — new standalone section type)

**What it is:** A flow diagram where nodes represent entities and links represent flows, with link width proportional to flow magnitude. Used for visualizing how quantities move between states.

**BI use cases:** Fluxo de caixa (origens → destinos), Funil de conversão com percentuais, Distribuição de receita por canal → produto → cliente, Origem de leads por canal → estágio → fechamento.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Nodes as labeled boxes | Core visual | LOW | Recharts `<Sankey>` component — confirmed native in Recharts 2.x |
| Links with proportional width | Encoding magnitude | LOW | Native Recharts Sankey behavior |
| Node and link coloring via `chartColors` | Brand consistency | MEDIUM | Recharts Sankey accepts `node` and `link` render props for custom coloring |
| Tooltip on link hover showing flow value | Data reading | LOW | Recharts Sankey supports Tooltip |
| Config data: `nodes: {name}[]` + `links: {source, target, value}[]` | Standard Sankey data format | LOW | Exact Recharts Sankey API format — no transformation needed |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Node value labels (total flow in/out) | Reduce mental calculation | MEDIUM | Custom `node` render prop in Recharts Sankey |
| Color nodes by index (first palette color per node) | Visual clarity | MEDIUM | Custom node render prop mapping `chartColors[i % chartColors.length]` |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Drag to reorder nodes | Interactive layout | Complex interaction outside wireframe scope | Accept default Recharts layout algorithm |
| Animated flow particles | Looks impressive | Significant custom animation code; no native support | Static diagram |
| D3-sankey dependency | More control over layout | Adds dependency; Recharts Sankey is sufficient for wireframe fidelity | Use Recharts native `<Sankey>` |

**Recharts path:** Recharts 2.x has a `<Sankey>` component with `data={{ nodes: [...], links: [...] }}` API. CONFIRMED in official API docs. This is a standalone section type (not a `bar-line-chart` sub-variant) because it uses a completely different data shape. Medium complexity due to custom node/link rendering for colors.

**Confidence:** HIGH for native Recharts Sankey existence. MEDIUM for color customization implementation.

---

### 9. Range Bar / Gantt (Wave 3 — new standalone section type)

**What it is:** Horizontal bars with explicit start and end values (not from zero). Used for time ranges, project phases, availability windows, or any interval data.

**BI use cases:** Cronograma de projetos, Janelas de disponibilidade de recursos, Contratos com vigência, Faixas de metas por período.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bars with start and end (not from zero) | Core definition | HIGH | Recharts does NOT natively support range bars. Workaround: use two stacked bars (transparent base + visible top) via `stackId`. Community-confirmed but hacky |
| Row labels (Y axis) | Task/entity identification | LOW | Recharts horizontal BarChart `<YAxis dataKey="label">` |
| X axis as time/value scale | Orientation | LOW | Standard XAxis |
| Tooltip showing label, start, end | Data reading | MEDIUM | Custom Tooltip formatter |
| Color per row or category | Visual differentiation | LOW | `fill={chartColors[i % n]}` |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Today/reference line marker | Contextual anchor | LOW | Recharts `<ReferenceLine x={today}>` |
| Category grouping by color | Visual grouping of task types | LOW | Assign `chartColors` index by category |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| True Gantt with dependencies (arrows) | Full Gantt chart | Requires D3 or dedicated Gantt library — completely outside Recharts | Document as "schedule view" wireframe intent; implement in generated product |
| Drag-to-resize bars | Interactive scheduling | Out of scope for wireframe | Note interaction intent |

**Recharts path:** HIGH complexity. Recharts has no native range bar. Standard workaround: `BarChart layout="vertical"` with two `<Bar stackId="a">` — transparent bar fills the offset (start value), visible bar fills the duration (end - start). TypeScript types are tricky (data needs `[offset, end-offset]` tuple form). Issue #4038 on Recharts GitHub confirms this is the known workaround. Consider whether wireframe fidelity justifies this complexity vs. a simple pure-HTML Gantt row layout.

**Recommendation:** Implement as pure HTML/CSS (not Recharts) — a flex row per task with `marginLeft: (start/max)*100%` and `width: ((end-start)/max)*100%`. This is the CompositionBar pattern adapted to multi-row. Much lower complexity, same visual output.

**Confidence:** MEDIUM for the CSS-flex approach. LOW for the Recharts workaround approach.

---

### 10. Bump Chart (Wave 3 — new standalone section type)

**What it is:** A line chart where the Y axis shows rank position (1 = top) and X axis shows time periods. Lines connect each entity's rank across periods, showing whether things are rising or falling in relative standing.

**BI use cases:** Ranking de produtos por receita ao longo do tempo, Posição de vendedores no ranking mensal, Evolução de categorias por participação.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple colored lines connecting rank positions | Core visual | MEDIUM | Recharts `<LineChart>` with multiple `<Line>` series — standard multi-line chart |
| Y axis inverted (1 at top) | Rank convention — rank 1 is best, displayed at top | LOW | Recharts `<YAxis reversed={true}>` |
| Y axis showing integer ranks | Clarity | LOW | `tickCount` set to number of entities; `<YAxis type="number">` |
| End-of-line labels showing entity name | Reading rank at last period | MEDIUM | Custom `<Label>` on each `<Line>` or `dot` render at last data point |
| Tooltip showing all ranks at a time period | Cross-entity comparison | LOW | Recharts default multi-line Tooltip |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Curved lines (monotone) vs straight | Aesthetic smoothness | LOW | `type="monotone"` on `<Line>` |
| Highlighted entity (bold line, others muted) | Focus on specific | MEDIUM | Custom `strokeWidth` and `opacity` based on a `highlighted` config prop |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Interactive hover to highlight one entity | Polished interaction | Complex state management in static wireframe context | Accept static rendering of all lines |
| Dedicated bump chart library | Correct interpolation between ranks | Adds dependency; LineChart with `reversed` Y axis is functionally equivalent for wireframe | Use Recharts LineChart |

**Recharts path:** Recharts `<LineChart>` with `<YAxis reversed>` is the correct approach. Data format: `{ period: 'Jan', entityA: 2, entityB: 1, entityC: 3 }[]` — standard multi-series line chart. Medium complexity due to end-of-line labeling and reversed Y axis. No new Recharts dependencies.

**Confidence:** HIGH for the core implementation. MEDIUM for end-of-line labels (custom dot/label render).

---

### 11. Lollipop (Wave 3 — new standalone section type or `chartType: 'lollipop'`)

**What it is:** A bar chart alternative where each value is represented by a thin vertical line topped with a filled circle. Visually cleaner than bars for comparison with many categories.

**BI use cases:** Top 10 produtos por receita, Comparação de métricas por região, Ranking de representantes, Distribuição de tickets por categoria.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Vertical line from zero to value | Core visual (the "stick") | MEDIUM | Recharts `<LineChart>` with `dot` only at the value endpoint, OR a `<BarChart>` with very thin bars (`barSize={2}`) |
| Circle at the top of each stick | Core visual (the "lollipop") | MEDIUM | Recharts custom `dot` render prop on `<Line>`, or `<Scatter>` overlay on the bar endpoint |
| Category labels on X axis | Identification | LOW | Standard `<XAxis dataKey>` |
| Y axis with value scale | Scale | LOW | Standard `<YAxis>` |
| Tooltip on hover | Data reading | LOW | Recharts default |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Horizontal layout option | Better for many categories | LOW | `layout="horizontal"` with `<BarChart>` |
| Color per lollipop | Visual variation across categories | MEDIUM | Map `chartColors` by index, or use single brand color |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Interactive click-to-highlight | Polished UX | Not needed for wireframe | Note in description |
| Multiple series as grouped lollipops | Richer data | Very complex to implement cleanly; defeats visual simplicity | Use grouped-bar for multi-series comparisons |

**Recharts path:** Two viable approaches:
1. `<BarChart barSize={2}>` with `<Bar>` for the stick + a `<Scatter>` component (from `<ComposedChart>`) for the circles — uses Recharts natively but requires ComposedChart.
2. `<LineChart>` with `dot={customDot}` and `activeDot={false}`, where each "line" is a vertical segment from (category, 0) to (category, value) — requires unusual data shaping.

**Recommendation:** Approach 1 (ComposedChart with Bar + Scatter) is cleaner and better-typed. Medium complexity.

**Confidence:** MEDIUM — approach is community-proven (confirmed via react-graph-gallery.com). No single official Recharts example for lollipop.

---

### 12. Polar / Rose (Wave 3 — new standalone section type)

**What it is:** Bars radiating from a center in polar coordinates. Each category gets an angular slice; the bar extends outward proportional to its value. The Nightingale/Rose chart version uses equal angles with varying radius (value encodes radius). The Radial Bar chart version uses equal radii per track with varying arc length.

**Recharts support:** Recharts has a native `<RadialBarChart>` component with `<RadialBar>` — this is the most accessible implementation. True Nightingale/Rose (equal angle, value = radius) requires custom SVG or is only partially achievable via Recharts `<PolarAngleAxis>` + `<RadialBarChart>`.

**BI use cases:** Distribuição por dia da semana, Comparação de KPIs em formato radar-like, Performance por região em layout circular, Sazonalidade.

**Table Stakes**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bars or arcs in polar coordinates | Core visual | LOW | Recharts `<RadialBarChart>` with `<RadialBar>` — native and documented |
| Category labels around the circle | Identification | LOW | Recharts `<Legend>` or custom label at each arc |
| Tooltip on hover | Data reading | LOW | Recharts default Tooltip on RadialBarChart |
| Color per arc from `chartColors` | Brand | LOW | `fill={chartColors[i]}` per RadialBar Cell |
| `items: { label, value }[]` config | Config interface | LOW | Same shape as DonutChart slices |

**Differentiators**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Inner radius config (rose vs ring) | Visual style variation | LOW | `innerRadius` prop on `<RadialBarChart>` |
| Clockwise vs counter-clockwise start angle | Orientation preference | LOW | `startAngle` / `endAngle` on `<RadialBarChart>` |

**Anti-Features**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| True equal-angle sectors (Nightingale rose) | More "correct" rose chart | Not natively supported in Recharts 2.x — requires custom SVG path math | Use RadialBarChart with arcs, document as "radial bar / rose-style" |
| 3D polar chart | Dramatic visual | Misrepresents data; no React charting library supports it without canvas hacks | Never implement |

**Recharts path:** Recharts `<RadialBarChart>` is native and documented. Use `<RadialBar dataKey="value">` with multiple `<Cell>` for color. This is the same internal component used by some polar chart examples in the official Recharts docs. LOW complexity.

**Confidence:** HIGH for RadialBarChart. Confirmed in official Recharts docs and shadcn/ui charts documentation.

---

## Feature Dependencies

```
Wave 1 charts (Grouped Bar, Bullet, Step Line, Pie)
    └──require──> Existing BarLineChartSection schema + ChartType union
                       └──require──> Existing ChartRenderer dispatch switch

Wave 2 sections (Heatmap, Sparkline Grid, Progress Grid)
    └──require──> New BlueprintSection union members
    └──require──> New SECTION_REGISTRY entries
    └──require──> New Zod schemas in blueprint-schema.ts

Wave 3 charts (Sankey, Bump Chart, Range Bar, Lollipop, Polar)
    └──require──> New BlueprintSection union members (each is standalone)
    └──require──> New SECTION_REGISTRY entries

Sparkline Grid ──enhances──> KPI Grid (similar scanning purpose, different data density)
Progress Grid ──extends──> progress-bar section (reuses bar rendering logic)
Bullet Chart ──shares target-marker pattern──> Progress Grid
Pie Chart ──shares data shape──> DonutChartSection (variant prop, not new type)
```

### Dependency Notes

- **Wave 1 charts require existing infrastructure:** They add new `ChartType` values and dispatch cases in `ChartRenderer`. No new section types needed for Grouped Bar, Bullet, Step Line. Pie Chart adds a `variant` to DonutChartSection.
- **Wave 2 and 3 are standalone section types:** Each gets its own entry in `BlueprintSection` union, `SECTION_REGISTRY`, and Zod schema.
- **Progress Grid extends progress-bar:** The existing `ProgressBarRenderer` rendering logic (CSS bar, color-mix) should be extracted into a shared utility or Progress Grid should be built referencing that pattern.
- **Heatmap uses color-mix:** Already confirmed working in `ProgressBarRenderer` — reusable pattern.

---

## MVP Definition

### Launch With (v1.6)

Minimum viable feature set to cover the milestone scope. All 12 chart types must be implemented to deliver the milestone.

- [ ] **Grouped Bar** — Completes the "standard bar chart" family; HIGH business value for comparison use cases
- [ ] **Step Line** — LOW complexity add, covers pricing/policy data patterns missing today
- [ ] **Pie Chart** — Trivial add as DonutChartSection variant; rounds out the pie/donut family
- [ ] **Sparkline Grid** — HIGH scan-density value for executive dashboards; medium complexity
- [ ] **Progress Grid** — Extends proven pattern; HIGH use in goals/OKR screens
- [ ] **Polar / Rose** — Native Recharts support; LOW complexity; covers circular comparison use cases
- [ ] **Lollipop** — Medium complexity, clean visual alternative to bar for ranked data
- [ ] **Bump Chart** — Medium complexity, specific use case for ranking/competitive analysis
- [ ] **Sankey Diagram** — Native Recharts; covers flow/funnel use cases currently not served
- [ ] **Heatmap** — Pure CSS approach; covers matrix analysis use cases
- [ ] **Bullet Chart** — Medium complexity; HIGH value for KPI vs target display
- [ ] **Range Bar** — HIGH complexity; covers timeline/Gantt use cases (recommend CSS-flex approach over Recharts workaround)

### Sequencing Recommendation (within v1.6)

Wave 1 first (lowest complexity, builds on existing infrastructure):
1. Step Line (lowest complexity — one `type` prop change)
2. Pie Chart (one `variant` prop on DonutChartSection)
3. Grouped Bar (multi-Bar in existing BarChart)
4. Bullet Chart (ReferenceLine, horizontal BarChart)

Wave 2 second (standalone sections, medium complexity):
5. Progress Grid (extends progress-bar pattern)
6. Sparkline Grid (minimal Recharts, grid layout)
7. Heatmap (pure CSS, color-mix)

Wave 3 last (highest complexity or unique data shapes):
8. Polar / Rose (native RadialBarChart — actually LOW)
9. Lollipop (ComposedChart approach)
10. Bump Chart (LineChart + reversed Y)
11. Sankey (native Recharts, custom node colors)
12. Range Bar (CSS-flex approach recommended)

---

## Feature Prioritization Matrix

| Chart Type | BI User Value | Implementation Cost | Priority | Wave |
|------------|---------------|---------------------|----------|------|
| Grouped Bar | HIGH — most common comparison chart | LOW | P1 | 1 |
| Step Line | MEDIUM — niche but specific | LOW | P1 | 1 |
| Pie Chart | MEDIUM — familiar, covers full-circle preference | LOW | P1 | 1 |
| Bullet Chart | HIGH — KPI vs target is core BI use case | MEDIUM | P1 | 1 |
| Sparkline Grid | HIGH — compact scanning for executives | MEDIUM | P1 | 2 |
| Progress Grid | HIGH — OKR/goal tracking | LOW-MEDIUM | P1 | 2 |
| Heatmap | HIGH — matrix analysis, no alternative today | MEDIUM | P1 | 2 |
| Polar / Rose | MEDIUM — circular comparisons, niche | LOW | P2 | 3 |
| Lollipop | MEDIUM — visual alternative to bar | MEDIUM | P2 | 3 |
| Bump Chart | LOW-MEDIUM — ranking analysis | MEDIUM | P2 | 3 |
| Sankey | MEDIUM — flow/funnel visualization | MEDIUM | P2 | 3 |
| Range Bar | MEDIUM — timeline/schedule | HIGH | P2 | 3 |

---

## Implementation Notes by Architecture Touchpoint

### Wave 1: New `ChartType` union values → existing `bar-line-chart` section

Touch points:
- `types/blueprint.ts`: Add `'grouped-bar' | 'bullet' | 'step-line'` to `ChartType` union
- `DonutChartSection`: Add `variant?: 'pie' | 'donut'` (no new section type)
- `lib/blueprint-schema.ts`: Update `ChartTypeLiteral` enum in `BarLineChartSectionSchema`
- `components/sections/ChartRenderer.tsx`: Add `case` for each new chartType
- New component files: `GroupedBarChartComponent.tsx`, `BulletChartComponent.tsx`, `StepLineChartComponent.tsx`
- `components/DonutChart.tsx`: Add `variant` prop handling
- `components/editor/property-forms/BarLineChartForm.tsx`: Add new types to the chartType select
- `components/editor/property-forms/DonutChartForm.tsx`: Add variant toggle

### Wave 2: New standalone section types

Touch points for each (Heatmap, Sparkline Grid, Progress Grid):
- `types/blueprint.ts`: New section type interface + add to `BlueprintSection` union
- `lib/blueprint-schema.ts`: New Zod schema
- `lib/section-registry.tsx`: New `SECTION_REGISTRY` entry with renderer, propertyForm, catalogEntry, defaultProps, schema
- New renderer: `components/sections/HeatmapRenderer.tsx`, `SparklineGridRenderer.tsx`, `ProgressGridRenderer.tsx`
- New property form: `components/editor/property-forms/HeatmapForm.tsx`, etc.

### Wave 3: New standalone section types (same touchpoints as Wave 2)

Same pattern as Wave 2 for each of: Sankey, Bump Chart, Range Bar, Lollipop, Polar.

---

## Sources

- [Recharts BarChart API — barCategoryGap, barGap, multiple Bar components](https://recharts.github.io/en-US/api/BarChart/)
- [Recharts Sankey API — nodes/links data format, node/link render props](https://recharts.github.io/en-US/api/Sankey/)
- [Recharts Line type="stepAfter" — confirmed in API docs](https://recharts.github.io/en-US/api/Line/)
- [Recharts RadialBarChart — polar/rose chart native support](https://recharts.github.io/en-US/api/)
- [Recharts Gantt/Range Bar community issue #4038 — confirms no native support](https://github.com/recharts/recharts/issues/4038)
- [Nightingale/Rose charts Recharts issue #2386 — confirms no native equal-angle support](https://github.com/recharts/recharts/issues/2386)
- [Lollipop plot with React (react-graph-gallery) — confirms ComposedChart approach](https://www.react-graph-gallery.com/lollipop-plot)
- [shadcn/ui Radial Charts — RadialBarChart usage examples](https://ui.shadcn.com/charts/radial)
- [BI Dashboard best practices — tooltip and drill-down interaction patterns](https://www.domo.com/learn/article/bi-dashboards-building-and-designing-best-practices)
- [Custom Dot Line Chart (recharts) — confirms customized dot for lollipop circle](https://recharts.github.io/en-US/examples/CustomizedDotLineChart/)

---

*Feature research for: v1.6 Wireframe Builder Chart Expansion*
*Researched: 2026-03-12*
