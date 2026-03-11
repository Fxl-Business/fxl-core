# Feature Research: v1.4 Wireframe Visual Redesign

**Domain:** BI Dashboard Wireframe Component Visual System — Professional Financial Dashboard Aesthetic
**Researched:** 2026-03-11
**Confidence:** HIGH (HTML reference is the ground truth; patterns extracted directly)

## Scope

This research covers the visual redesign features for v1.4 only. The existing component architecture
(39 root components, 14 renderers, 21 section types, WireframeThemeProvider, blueprint pipeline)
is treated as baseline. Research focuses exclusively on:

1. What visual patterns from the HTML reference must be systematized
2. Which patterns are table stakes vs differentiators for professional dashboard aesthetic
3. Dependencies between visual patterns (what must exist before what can be built)

**HTML reference analyzed:** `.planning/research/visual-redesign-reference.html` (dummy.html — the
financial dashboard reference with "NexusFin" branding). Key design language confirmed directly from
source: primary blue `#1152d4`, background-light `#f6f6f8`, background-dark `#101622`, slate-900
sidebar, Inter extrabold typography.

---

## Feature Landscape

### Table Stakes (Without These the Redesign Fails)

Features that any professional BI financial dashboard must have. Missing these means the wireframe
still looks like a prototype rather than a production-grade dashboard deliverable.

| Feature | Why Expected | Complexity | Current State Gap |
|---------|--------------|------------|-------------------|
| Token system: primary blue + slate scale | Every professional dashboard uses a consistent primary color. Current tokens use warm stone gray + gold (not aligned with financial blue typical of banking/fintech dashboards) | LOW | Must change `--wf-chart-1` from gold `#d4a017` to primary blue `#1152d4`. Also needs `--wf-background-light #f6f6f8`, `--wf-background-dark #101622`. All downstream components update automatically via CSS vars |
| Dark sidebar (slate-900) with icon nav | Industry standard: Power BI, Tableau, Metabase all use dark sidebars. WireframeSidebar currently renders `bg-wf-sidebar` (mapped to `--wf-neutral-800` = `#292524`). The reference uses `bg-slate-900` with lucide icons per item and `bg-primary/10 text-primary` for active state | MEDIUM | WireframeSidebar exists but lacks: icon rendering per item (icon field exists but is unused), section group labels, footer status block. Component needs structural expansion |
| KPI cards: icon slot + rounded-full trend badge | Reference KPI card has: icon in `bg-primary/10 rounded-lg` top-left, trend badge in `rounded-full` (not `rounded` as current), `text-2xl font-extrabold` value (current uses `font-bold`), `text-sm` label below icon. Current `KpiCard` has none of these structural slots | MEDIUM | KpiCard needs restructure: add `icon?: string` prop, change badge from `rounded` to `rounded-full`, add `bg-primary/10 group-hover:bg-primary` icon container |
| Tables: `tracking-widest` + `font-black` th headers | Reference table uses `text-[10px] font-black uppercase tracking-widest text-slate-500` headers. Current DataTable uses `text-[11px] font-medium uppercase tracking-wide`. The difference between `tracking-wide` vs `tracking-widest` and `font-medium` vs `font-black` is visually significant at small sizes | LOW | One-line Tailwind class update per table component (DataTable, ClickableTable, DrillDownTable, ConfigTable) |
| Tables: dark `tfoot` with total rows | Reference table footer row: `bg-slate-900 text-white` with last column `bg-white text-primary`. Current DataTable has no `<tfoot>` element at all | MEDIUM | DataTable needs `showTotals?: boolean` prop + `tfoot` rendering with dark background styling |
| Header: search input + notifications + user chip | Reference header right side has: search input (`bg-slate-100 rounded-lg`), notifications icon button, dark mode toggle, divider, user chip (name + role text right-aligned, avatar `rounded-lg ring-2 ring-transparent group-hover:ring-primary`). Current WireframeHeader right side is empty (`<div style={{ flex: 1 }} />`) | MEDIUM | WireframeHeader needs right-side slots: `showSearch`, `showNotifications`, `showUserChip` props with user data from config |
| Filter bar: backdrop-blur sticky | Reference filter bar uses `bg-background-light/95 backdrop-blur-sm border-b`. Current WireframeFilterBar uses `background: 'var(--wf-card)'` (opaque, no blur). Also: reference uses `text-[10px] font-bold uppercase text-slate-500` filter labels and transparent selects with primary color values | LOW | WireframeFilterBar: add `backdrop-blur-sm` + `bg-background-light/95` (via new token). Change internal label styling from current `11px font-medium` to `10px font-bold uppercase` |
| Micro typography: 10px bold uppercase labels | Reference systematically uses `text-[10px] font-bold uppercase tracking-wider text-slate-500` for ALL secondary labels (section group headers in sidebar, filter labels, table sub-labels). Current components use inconsistent mix of 10px, 11px, `font-medium`, `font-semibold`, `tracking-wide` | LOW | Audit all components for secondary label typography. Establish rule: 10px = `font-bold uppercase tracking-wider`. 11px = `font-semibold`. No exceptions |
| Card hover group effects | Reference KPI cards use `hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer group`. Icon inside card transitions from `bg-primary/10 text-primary` → `bg-primary text-white` on `group-hover`. This makes the entire card feel interactive without JavaScript | MEDIUM | KpiCard and KpiCardFull need: `group` class on wrapper, `group-hover:` variants on icon container and shadow. Requires CSS class-based approach (Tailwind JIT) not inline style |
| Chart palette: primary blue scale | Reference charts use primary blue `#1152d4` as main bar color with `bg-primary/60` and `bg-primary/40` for secondary series. Current chart tokens use gold/amber palette (`--wf-chart-1: #d4a017`). Chart colors must shift to blue-centric scale | LOW | Update `--wf-chart-1` through `--wf-chart-5` in wireframe-tokens.css. All Recharts components that use `var(--wf-chart-N)` update automatically |

### Differentiators (Professional Aesthetic Polish)

These patterns distinguish a production-grade financial dashboard wireframe from a generic one. Not
strictly required for baseline redesign but critical for "wow factor" with clients.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| KPI sparkline (mini bar chart) | Reference KPI card 4 (Lucro Liquido) has a 4-column CSS mini sparkline: `div.w-2.bg-primary/40.h-2`, `.h-3`, `.h-4`, `.h-6`. Pure CSS — no Recharts. Shows trend without full chart area. PME clients love seeing at-a-glance trend | LOW | Add optional `sparkline?: number[]` prop to KpiCard. Render as CSS-only absolute-height bars. No dependency on Recharts |
| Sidebar footer: status indicator | Reference sidebar footer has `bg-slate-800/50 p-4 rounded-xl border border-slate-700/50` container with green pulse dot (`h-2 w-2 rounded-full bg-emerald-500`) + "Operacao Normal" text. Signals production system status — builds trust | LOW | `WireframeSidebar` already supports `footer` via `SidebarConfig` (added in v1.3 schema). Just needs visual implementation of the status block pattern |
| Grouped bar chart: CSS hover tooltip | Reference bar chart uses `group-hover:opacity-100` CSS tooltip (no Recharts Tooltip) positioned absolutely above bars. Pure CSS — zero JavaScript. More reliable than Recharts tooltip in wireframe context | HIGH | Would require replacing Recharts `<Tooltip>` with CSS-only implementation. High complexity and deviation from existing Recharts pattern. Better approached as an enhancement to existing tooltip styling |
| Stacked horizontal composition bar | Reference "Composicao de Custos" section uses a single-row `h-12` stacked horizontal bar with `w-[40%]`, `w-[25%]` etc. segments + hover brightness. Below it: color-coded legend rows with `w-3 h-3 rounded-sm` color swatches and percentage labels. This is NOT a Recharts chart — it's pure CSS | MEDIUM | New standalone component `CompositionBar` or enhanced `ProgressBar`. Receives `segments: { label, pct, color }[]`. Renders CSS flex-based stacked bar. Existing `ProgressBar` component is single-series — this is multi-series |
| Header user chip: avatar ring-primary hover | Reference user chip: right-aligned name (`text-xs font-bold`) + role (`text-[10px] text-slate-500 font-medium`) with avatar image `ring-2 ring-transparent group-hover:ring-primary transition-all`. Communicates personalization and role-based context | LOW | WireframeHeader prop: `user?: { name: string; role: string; avatarUrl?: string }`. Render chip in header right. Avatar uses `rounded-lg` (not `rounded-full`) consistent with reference |
| Tab group switcher in card header | Reference tables have tab switchers in their header: `px-3 py-1 text-[11px] font-bold` tabs inside `bg-slate-100 p-1 rounded-lg` pill container. Active tab gets `bg-white shadow-sm`. This pattern appears on multiple cards | MEDIUM | Standalone `ViewSwitcher` component (pill tabs). Receives `tabs: string[]` + `activeTab`. Used by DataTable header and ChartGrid header. Actually `DetailViewSwitcher` already exists — verify if it matches this pattern and update |
| Status dot in table rows | Reference table last column has `h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10` status indicators (green/amber/slate). Current DataTable has no status column support | LOW | DataTable `columns` type: add `type?: 'status'` to Column. Render status dot when `type === 'status'` using value as color key |
| Section header legend (chart) | Reference chart card header has custom legend with `w-2.5 h-2.5 rounded-full` color dots + `text-[11px] text-slate-500 font-medium` labels. Replaces Recharts default legend with cleaner custom rendering | MEDIUM | Chart components that use `<Legend />` from Recharts should render a custom header legend instead. Affects BarLineChart, StackedBarChartComponent, ComposedChartComponent |
| Inter extrabold headings | Reference uses `font-extrabold` (`font-weight: 800`) for h1/h2 in card headers and KPI values. Current components use `font-bold` (`700`) at most. The difference at large sizes is visually significant | LOW | Tailwind class change: `font-bold` → `font-extrabold` on: card title elements, KPI value text, page h1 inside content area. Does not affect body text |

### Anti-Features (Avoid During Redesign)

Patterns that seem appealing but would introduce complexity, inconsistency, or violate the
wireframe-as-prototype constraint.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Replace Recharts with CSS-only charts | Reference bar charts are pure CSS divs with hover effects — cleaner, lighter | Recharts is already deeply integrated. All 14 chart types use it. Replacing Recharts would mean rewriting all chart components, losing responsive containers, tooltips, animations. CSS charts look great in the reference but don't scale to the variety of chart types FXL needs | Apply reference visual language (colors, typography, hover patterns) to Recharts containers. Replace Recharts' `<Legend>` with custom header legend component. Keep Recharts as the rendering engine |
| Material Icons font dependency | Reference uses `material-symbols-outlined` Google font for icons. Looks polished | Adds `@font-face` dependency, FOUT risk, bundle bloat. FXL already uses `lucide-react` across the entire codebase | Keep lucide-react. All reference icons have lucide equivalents: `trending_up` → `TrendingUp`, `payments` → `CreditCard`, `dashboard` → `LayoutDashboard`. No functional gap |
| Inline style removal (all CSS vars → Tailwind) | Codebase mixes inline styles and Tailwind. Would be cleaner if consistent | Mass refactor of 39 components introduces regression risk. Inline styles that reference `var(--wf-*)` tokens are safe and intentional — they respond to theme switching. CSS vars cannot be used in Tailwind classes without arbitrary value syntax | Keep CSS vars in inline styles where they enable theme switching. Use Tailwind classes for structural/layout properties that don't vary by theme |
| Unique color per KPI card icon | Reference has card 1 `bg-primary/10`, card 2 `bg-slate-100`, card 4 `bg-indigo-100`. Gives visual variety | Defeats the systematic token approach. Each card would need a manual color assignment. Makes blueprint config more complex | Use `--wf-primary` consistently for icon containers. Clients who want variation can use their `--brand-*` branding overrides |
| Dark mode as primary mode | Reference dashboard looks great in dark. Should we ship dark-first? | Light mode is what clients present to their customers. Dark mode is a toggle feature. Designing dark-first creates light mode as an afterthought | Light mode is primary. Dark mode inherits updated tokens automatically via `[data-wf-theme="dark"]` overrides. Update dark mode tokens after light tokens are finalized |
| Pixel-perfect CSS-only animated charts | Reference bar charts animate on hover with CSS transitions. Beautiful | Animation in wireframes distracts from the UX review process. Clients focus on the animation, not the data structure | Use `transition-all` and `transition-colors` for hover state changes only. No CSS keyframe animations. Recharts handles smooth chart rendering |
| Custom scrollbar styling for sidebar | Reference has custom slim scrollbar on sidebar | Minor cosmetic detail. Chrome/Safari/Firefox have different scrollbar APIs. Adds CSS that only works on WebKit | Defer. Browser default scrollbar is acceptable for wireframe context. Apply if a single CSS rule covers all needs without pseudo-class hacks |

---

## Feature Dependencies

```
Layer 0: CSS Token System Update (MUST BE FIRST)
    |
    +-- Replaces warm stone/gold palette with primary blue + slate scale
    +-- Adds: --wf-primary (#1152d4), --wf-background (#f6f6f8), --wf-background-dark (#101622)
    +-- Updates: --wf-chart-1 through --wf-chart-5 to blue-centric scale
    +-- All components that use var(--wf-*) tokens update automatically
    |
    v
Layer 1: Core Components (CAN RUN IN PARALLEL after Layer 0)
    |
    +-- KpiCard visual restructure
    |       |-- Requires token update (uses --wf-primary for icon bg)
    |       |-- icon slot, rounded-full badge, font-extrabold, group hover
    |       |-- sparkline prop (pure CSS, no other dependency)
    |
    +-- WireframeHeader right-side expansion
    |       |-- Requires token update (search uses --wf-primary on focus ring)
    |       |-- showSearch, showNotifications, showUserChip props
    |       |-- user chip avatar with ring-primary hover
    |
    +-- WireframeSidebar visual expansion
    |       |-- Requires token update (sidebar uses --wf-sidebar-bg)
    |       |-- Icon rendering (lucide), status footer block
    |       |-- Visual styling of existing groups (already schema-driven from v1.3)
    |
    +-- Table component updates (ALL 4 tables)
    |       |-- Requires token update (uses --wf-table-header-bg)
    |       |-- tracking-widest + font-black headers
    |       |-- tfoot dark row (DataTable, ClickableTable, DrillDownTable)
    |       |-- status dot column type
    |
    +-- WireframeFilterBar backdrop-blur + micro typography
    |       |-- Requires token update (uses --wf-canvas)
    |       |-- Label typography: 10px font-bold uppercase
    |       |-- backdrop-blur-sm on sticky container
    |
    v
Layer 2: Secondary Components (AFTER Layer 1)
    |
    +-- CompositionBar new component
    |       |-- Requires token update (uses --wf-primary for segments)
    |       |-- No dependency on other Layer 1 changes
    |
    +-- Custom chart header legend
    |       |-- Replaces Recharts <Legend> in: BarLineChart, StackedBarChartComponent, ComposedChartComponent
    |       |-- Requires Layer 1 chart palette update to be visible
    |
    +-- DetailViewSwitcher audit + update
    |       |-- Verify matches reference pill-tab pattern
    |       |-- Updates DataTable header integration
    |
    v
Layer 3: Gallery Update (MUST BE LAST)
    |
    +-- All component previews reflect new visual language
    +-- Requires ALL Layer 1 and Layer 2 components to be updated
    +-- Gallery screenshots/previews must use updated token system
```

### Dependency Notes

- **Token system is the only strict blocker.** Every visual component uses `var(--wf-*)` tokens. Changing tokens from gold to primary blue immediately affects all components that render in the wireframe. Start here.
- **Layer 1 components are safe to parallelize.** KpiCard, WireframeHeader, WireframeSidebar, table components, and WireframeFilterBar do not share state or call each other. Each can be updated independently after tokens are done.
- **KpiCard hover requires Tailwind class approach.** The `group`/`group-hover:` pattern only works with Tailwind class strings, not inline styles. The existing `KpiCard` uses inline styles for `backgroundColor` via `color-mix()`. Hover state for the icon container must use Tailwind classes, not inline styles. This is a known pattern conflict that must be resolved in implementation.
- **Table tfoot is additive.** Adding `<tfoot>` does not break existing `<tbody>` rendering. DataTable, ClickableTable, DrillDownTable, and ConfigTable can each add `showTotals?: boolean` independently.
- **CompositionBar is a new component, not a modification.** It does not replace ProgressBar or HorizontalBarChart. It's a new visual primitive for composition/breakdown displays. No existing component collision.
- **Gallery update depends on EVERYTHING.** Do not update gallery previews until all components are updated. Gallery runs live renders of the components — it will automatically reflect changes once components are updated.

---

## MVP Definition (v1.4 Visual Redesign Scope)

### Must Ship (Core Redesign)

These establish the new visual identity. Without all of these, the redesign is incomplete.

- [ ] Token system update: primary blue `#1152d4`, background-light `#f6f6f8`, background-dark `#101622`, slate chart palette — why: every other visual change flows from this
- [ ] KpiCard: icon slot + `rounded-full` trend badge + `font-extrabold` value + `group` hover with icon color transition — why: KPIs are the first thing clients see on any dashboard
- [ ] DataTable: `tracking-widest font-black` headers + dark `<tfoot>` with totals row — why: tables are the most-used section type; headers are visually prominent
- [ ] WireframeSidebar: icon rendering per nav item + section group label micro typography + footer status block — why: sidebar is visible on every screen, wrong aesthetic breaks the entire layout
- [ ] WireframeHeader: search input slot + notifications + user chip right side — why: header empty right side currently looks unfinished compared to reference
- [ ] WireframeFilterBar: backdrop-blur sticky + 10px bold uppercase filter labels — why: filter bar is sticky and always visible; current styling is too soft for the new palette
- [ ] Chart palette: update `--wf-chart-1` through `--wf-chart-5` from gold/amber to blue/slate scale — why: charts render with wrong color scheme until this changes
- [ ] Table component audit: apply `tracking-widest font-black` to ClickableTable, DrillDownTable, ConfigTable (not just DataTable) — why: all table components must be consistent
- [ ] Inter `font-extrabold` headings: card titles, KPI values, page h1 — why: weight difference at large sizes is what makes the reference feel "premium"

### Add After Core (Polish Pass)

Features that add differentiation once core is solid.

- [ ] KpiCard sparkline: optional 4-column CSS mini bar in top-right of card — trigger: core KpiCard restructure done
- [ ] CompositionBar new component: multi-segment stacked horizontal bar + color legend — trigger: at least one blueprint screen needs composition breakdown
- [ ] Custom chart header legend: replace Recharts `<Legend>` with header-aligned custom legend — trigger: chart palette update done
- [ ] Table status dot column: `type: 'status'` on Column renders `h-2 w-2 rounded-full` with ring — trigger: DataTable tfoot done
- [ ] DetailViewSwitcher audit: verify pill-tab pattern matches reference, update if needed — trigger: DataTable header update
- [ ] Sidebar avatar/logo in header top: update logo display with ring-primary hover on user chip — trigger: WireframeHeader right side done

### Defer to v2+

- [ ] CSS-only animated charts (keyframe): visual distraction in wireframe review context
- [ ] Custom WebKit scrollbar styling: minor cosmetic, cross-browser risk
- [ ] Replace Recharts with CSS-only charts: too much regression risk, no functional benefit
- [ ] Full dark-first mode redesign: light is primary, dark inherits automatically

---

## Feature Prioritization Matrix

| Feature | Client Impact | Implementation Cost | Priority |
|---------|---------------|---------------------|----------|
| CSS token system update | HIGH (everything else) | LOW | P1 |
| KpiCard visual restructure + hover group | HIGH (first visible section) | MEDIUM | P1 |
| DataTable headers `tracking-widest` | HIGH (most-used section) | LOW | P1 |
| DataTable dark `tfoot` totals row | HIGH (financial tables need totals) | MEDIUM | P1 |
| WireframeSidebar icon rendering | HIGH (visible every screen) | MEDIUM | P1 |
| WireframeSidebar section groups micro label | MEDIUM | LOW | P1 |
| WireframeHeader right side (search + user) | HIGH (unfinished look currently) | MEDIUM | P1 |
| WireframeFilterBar backdrop-blur | MEDIUM | LOW | P1 |
| Filter bar label micro typography (10px bold) | MEDIUM | LOW | P1 |
| Chart palette: blue-centric scale | HIGH (all 14 chart types) | LOW | P1 |
| `font-extrabold` headings pass | MEDIUM | LOW | P1 |
| Table audit (ClickableTable, DrillDownTable, ConfigTable) | MEDIUM | LOW | P1 |
| KpiCard sparkline (CSS mini bars) | MEDIUM (delight detail) | LOW | P2 |
| CompositionBar new component | MEDIUM (new visual primitive) | MEDIUM | P2 |
| Custom chart header legend | LOW (replaces default Recharts legend) | MEDIUM | P2 |
| Table status dot column | LOW | LOW | P2 |
| DetailViewSwitcher audit | LOW | LOW | P2 |
| Gallery preview update | HIGH (gallery is entry point) | LOW (automatic) | P1 (after all others) |

**Priority key:**
- P1: Must ship in v1.4 core pass
- P2: Should ship in v1.4 polish pass, add after P1 complete
- P3: Future milestone

---

## Visual Pattern Reference Index

Extracted directly from `dummy.html`. Each pattern mapped to implementation target.

### Pattern 1: KPI Card with Group Hover

**Reference:** `bg-white p-6 rounded-xl border border-slate-200 hover:bg-slate-50 hover:shadow-md transition-all cursor-pointer group`

**Icon container:** `bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors`

**Trend badge:** `flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full`

**Value:** `text-2xl font-extrabold text-slate-900`

**Sub-label:** `text-[10px] text-slate-400 mt-2`

**Maps to:** `KpiCard.tsx`, `KpiCardFull.tsx`

### Pattern 2: Sidebar Dark with Section Groups

**Reference:** `w-64 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800`

**Nav item active:** `flex items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-lg font-medium transition-all group`

**Nav item default:** `flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800 hover:text-white rounded-lg transition-all text-slate-400`

**Section group label:** `text-[10px] font-bold uppercase tracking-wider text-slate-500`

**Footer block:** `bg-slate-800/50 p-4 rounded-xl border border-slate-700/50` + green pulse dot

**Maps to:** `WireframeSidebar.tsx`

### Pattern 3: Header with Right-Side Controls

**Reference height:** `h-14 flex-shrink-0 bg-white border-b border-slate-200`

**Search:** `bg-slate-100 border-none rounded-lg pl-10 pr-4 py-1.5 text-xs w-64`

**Icons:** `text-slate-500 hover:text-primary transition-colors`

**Divider:** `h-8 w-[1px] bg-slate-200 mx-2`

**User name:** `text-xs font-bold text-slate-900`

**User role:** `text-[10px] text-slate-500 font-medium`

**Avatar:** `size-8 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-primary transition-all`

**Maps to:** `WireframeHeader.tsx`

### Pattern 4: Sticky Filter Bar with Backdrop Blur

**Reference:** `sticky top-0 z-20 bg-background-light/95 backdrop-blur-sm border-b border-slate-200 px-8 py-3`

**Filter label:** `text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap`

**Select:** `bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-0 pr-6 cursor-pointer`

**Toggle:** `peer-checked:bg-primary` on checkbox with custom div track

**Action button (primary):** `px-3 py-1 bg-primary text-white rounded-lg text-[11px] font-bold shadow-sm hover:brightness-110`

**Action button (ghost):** `border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-primary`

**Maps to:** `WireframeFilterBar.tsx`

### Pattern 5: Table Headers `tracking-widest`

**Reference th:** `px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500`

**Reference tfoot:** `bg-slate-900 text-white` with last column `bg-white text-primary font-black`

**Body row hover:** `hover:bg-slate-100 transition-colors cursor-pointer group`

**Body cell value:** `text-sm font-semibold text-slate-900` (label col) / `text-sm font-bold text-right text-slate-900` (value col)

**Deviation positive:** `font-bold text-emerald-500`

**Deviation negative:** `font-bold text-rose-500`

**Maps to:** `DataTable.tsx`, `ClickableTable.tsx`, `DrillDownTable.tsx`, `ConfigTable.tsx`

### Pattern 6: Composition Bar (New Component)

**Reference:** `w-full h-12 bg-slate-100 rounded-lg overflow-hidden flex cursor-pointer group`

**Segment:** CSS `div` with `width: [pct]%`, `bg-primary` / `bg-indigo-500` / `bg-blue-400` / `bg-slate-400`, `hover:brightness-90 transition-all border-r border-white/20`

**Legend row:** `flex items-center justify-between` with `w-3 h-3 rounded-sm [color]` swatch + `text-[11px] font-semibold text-slate-600` label + `text-[11px] font-bold text-slate-900` percentage

**Maps to:** New `CompositionBar.tsx` component

### Pattern 7: CSS Sparkline (KPI Card Variant)

**Reference:** `w-16 h-8 bg-slate-50 rounded flex items-end gap-0.5 px-1 py-1` container with inner divs:
`w-2 bg-primary/40 h-2 rounded-t-[1px]`, `w-2 bg-primary/60 h-3`, `w-2 bg-primary/80 h-4`, `w-2 bg-primary h-6`

**Maps to:** `KpiCard.tsx` optional `sparkline?: number[]` prop (4 values max, relative heights)

### Pattern 8: Micro Label Typography System

**Rule:** Secondary labels are ALWAYS `text-[10px] font-bold uppercase tracking-wider text-wf-muted`

**Used in:** Sidebar section groups, filter bar labels, table sub-labels, card footer context

**Current inconsistency in codebase:**
- `WireframeSidebar`: `text-[10px] font-semibold uppercase tracking-widest` — close but `font-semibold` not `font-bold`
- `WireframeFilterBar` labels: `fontSize: 11, fontWeight: 500` — wrong on both size and weight
- `DataTable` headers: `text-[11px] font-medium uppercase tracking-wide` — wrong on size, weight, and tracking

**Target:** Consolidate to single pattern. `tracking-widest` for table th specifically (matches reference exactly). `tracking-wider` for secondary labels.

---

## Sources

- `dummy.html` (`.planning/research/visual-redesign-reference.html`) — primary reference, direct analysis of HTML/CSS patterns
- [Tabular Editor: KPI card best practices for BI dashboards](https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design) — confirms icon slot + trend badge as table stakes in financial BI
- [Metabase BI Dashboard Best Practices](https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/bi-dashboard-best-practices) — confirms dark sidebar + grouped nav as standard pattern
- [Design Tokens specification (W3C Community Group)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — confirms token-first approach as industry standard for design system redesigns
- [Martin Fowler: Design Token-Based UI Architecture](https://martinfowler.com/articles/design-token-based-ui-architecture.html) — confirms tokens-first dependency order (tokens → components → gallery)

---
*Feature research for: v1.4 Wireframe Visual Redesign (BI Dashboard — Professional Financial Dashboard Aesthetic)*
*Researched: 2026-03-11*
