# Architecture Research: v1.4 Wireframe Visual Redesign

**Domain:** CSS token system migration — warm stone + gold to slate + primary blue
**Researched:** 2026-03-11
**Confidence:** HIGH (based on direct codebase inspection, all findings code-verified)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Token Definition Layer                            │
│  wireframe-tokens.css  -- [data-wf-theme="light|dark"]              │
│  45 CSS variables: --wf-neutral-*, --wf-canvas, --wf-card,          │
│  --wf-accent (gold), --wf-sidebar-*, --wf-chart-1..5                │
└──────────────────────────┬──────────────────────────────────────────┘
                           | sets data-wf-theme attribute
┌──────────────────────────v──────────────────────────────────────────┐
│                    Theme Provider Layer                              │
│  wireframe-theme.tsx  -- WireframeThemeProvider                     │
│  Reads localStorage(fxl_wf_theme), wraps children in                │
│  <div data-wf-theme={theme}>. Exposes toggle() + setTheme().        │
└──────────────────────────┬──────────────────────────────────────────┘
                           | provides context
┌──────────────────────────v──────────────────────────────────────────┐
│                    Tailwind Alias Layer                              │
│  tailwind.config.ts  -- wf.* color map                              │
│  bg-wf-card, text-wf-heading, border-wf-card-border, etc.           │
│  Maps Tailwind class names to CSS var() references                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           | consumed by
┌──────────────────────────v──────────────────────────────────────────┐
│                    Component Layer (85 files)                        │
│  Pattern A: Tailwind classes  -- bg-wf-card, text-wf-heading        │
│  Pattern B: inline style      -- style={{ color: 'var(--wf-body)' }}│
│  Pattern C: color-mix()       -- for semi-transparent fills         │
│  7 files use Pattern C (KpiCard, KpiCardFull, StatCard, Progress,   │
│  ManualInput, CalculoCard, Waterfall)                                │
└──────────────────────────┬──────────────────────────────────────────┘
                           | branding override injected here
┌──────────────────────────v──────────────────────────────────────────┐
│                    Branding Override Layer                           │
│  branding.ts  -- brandingToCssVars() injects --brand-chart-1..5     │
│  getChartPalette() returns hex[] for recharts Cell fill              │
│  brandingToWfOverrides() currently returns {} (intentional no-op)   │
│  --brand-* vars used by chart components via chartColors? prop       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Token Inventory: Current vs Target

### Neutral Scale — Full Value Replace (0 component files affected)

Current tokens use Tailwind Stone (warm grays). Target uses Slate (cool blue-grays).
All 10 neutral vars need value updates. Names stay identical — zero component edits.

| Token | Current (Stone) | Target (Slate) |
|-------|-----------------|----------------|
| `--wf-neutral-50` | `#fafaf9` | `#f8fafc` |
| `--wf-neutral-100` | `#f5f5f4` | `#f1f5f9` |
| `--wf-neutral-200` | `#e7e5e4` | `#e2e8f0` |
| `--wf-neutral-300` | `#d6d3d1` | `#cbd5e1` |
| `--wf-neutral-400` | `#a8a29e` | `#94a3b8` |
| `--wf-neutral-500` | `#78716c` | `#64748b` |
| `--wf-neutral-600` | `#57534e` | `#475569` |
| `--wf-neutral-700` | `#44403c` | `#334155` |
| `--wf-neutral-800` | `#292524` | `#1e293b` |
| `--wf-neutral-900` | `#1c1917` | `#0f172a` |

Components reference semantic tokens (`--wf-card`, `--wf-heading`), not neutral scale directly.
Updating 10 values automatically propagates to all semantic aliases.

### Semantic Tokens — Value Update Only (0 component files affected)

| Token | Current Mapping | Target Value |
|-------|-----------------|-------------|
| `--wf-canvas` | `--wf-neutral-100` alias | `#f6f6f8` (light) / `#101622` (dark) — direct hex, not alias |
| `--wf-card` | `--wf-neutral-50` alias | `#ffffff` (light) / `#1a2236` (dark) — direct hex |
| `--wf-card-border` | `--wf-neutral-200` alias | inherits from updated neutral-200 |
| `--wf-heading` | `--wf-neutral-700` alias | inherits from updated neutral-700 |
| `--wf-body` | `--wf-neutral-600` alias | inherits from updated neutral-600 |
| `--wf-muted` | `--wf-neutral-400` alias | inherits from updated neutral-400 |
| `--wf-border` | alias of `--wf-card-border` | keep alias pattern |
| `--wf-positive` | `#16a34a` | keep — green-600 is appropriate |
| `--wf-negative` | `#dc2626` | keep — red-600 is appropriate |

Note: `--wf-canvas` and `--wf-card` should be set to direct hex values rather than neutral aliases.
The HTML reference uses `#f6f6f8` and `#ffffff` specifically, which don't exactly match slate-100/50.

### Accent — Replace Gold with Primary Blue (values only, 0 component renames)

This is the highest-impact single change. `--wf-accent` (gold `#d4a017`) is referenced in
10 component files. They all consume it via Tailwind class or `var()` reference — changing
the CSS value propagates to all automatically.

| Token | Current | Target |
|-------|---------|--------|
| `--wf-accent` | `#d4a017` (gold) | `#1152d4` (primary blue) |
| `--wf-accent-muted` | `rgba(212,160,23, 0.12)` static | `color-mix(in srgb, var(--wf-accent) 12%, transparent)` |
| `--wf-accent-fg` | `#78590a` (dark gold) | `#0e3fa8` (dark blue, light mode) |
| `--wf-accent-fg` dark | `#fef3c7` (amber-50) | `#93b4ff` (light blue, dark mode) |

Converting `--wf-accent-muted` from a static `rgba()` to a `color-mix()` form ensures it
automatically tracks future accent color changes. This is a pure CSS change affecting 0 components
(the formula resolves identically at runtime).

### Sidebar Tokens — Value Update Only (0 component renames)

The sidebar shifts from warm dark stone to true slate-950. `--wf-sidebar-active` inherits
the accent change automatically since it aliases `--wf-accent`.

| Token | Current | Target |
|-------|---------|--------|
| `--wf-sidebar-bg` | `--wf-neutral-800` (warm `#292524`) | `#0f172a` (slate-950) |
| `--wf-sidebar-fg` | `--wf-neutral-50` | `#f1f5f9` (slate-100) |
| `--wf-sidebar-active` | `--wf-accent` (gold) | `--wf-accent` (now blue — inherits) |
| `--wf-sidebar-muted` | `--wf-neutral-400` | `#64748b` (slate-500) — direct hex |
| `--wf-sidebar-border` | `--wf-neutral-700` | `#1e293b` (slate-800) — direct hex |

### Header Tokens — Keep Existing, Add 1 New Token

| Token | Status | Target Value |
|-------|--------|-------------|
| `--wf-header-bg` | Keep | `#ffffff` (light) / `#1a2236` (dark) |
| `--wf-header-border` | Keep | inherits `--wf-card-border` |
| `--wf-header-search-bg` | **NEW** | `#f6f6f8` (light) / `#0f172a` (dark) |

`--wf-header-search-bg` is the only structurally new token needed for the header redesign.
The notification bell, user chip, and dark mode toggle use existing semantic tokens.

### Table Tokens — Keep Existing, Add 2 New Tokens

| Token | Status | Change |
|-------|--------|--------|
| `--wf-table-header-bg` | Keep | Value update (lighter in new design) |
| `--wf-table-header-fg` | Keep | Value update (tracking-widest style is already in component) |
| `--wf-table-row-alt` | Keep | Value update |
| `--wf-table-border` | Keep | Value update |
| `--wf-table-footer-bg` | **NEW** | `#1e293b` (slate-800 dark footer row) |
| `--wf-table-footer-fg` | **NEW** | `#f1f5f9` (slate-100 text on dark footer) |

### Chart Palette — Full Value Replace (0 component files affected)

Current: gold/amber monochromatic. Target: primary blue + slate/indigo scale.

| Token | Current | Target |
|-------|---------|--------|
| `--wf-chart-1` | `#d4a017` (gold) | `#1152d4` (primary blue) |
| `--wf-chart-2` | `#b45309` (amber) | `#3b82f6` (blue-500) |
| `--wf-chart-3` | `#92400e` (deep amber) | `#6366f1` (indigo-500) |
| `--wf-chart-4` | `#78716c` (neutral-500) | `#0ea5e9` (sky-500) |
| `--wf-chart-5` | `#57534e` (neutral-600) | `#64748b` (slate-500) |

All 9 chart components reference `var(--wf-chart-*)` in their Recharts `<Cell fill>` or
as a COLORS array. The value update propagates automatically.

### New Tokens Summary

Three new tokens must be added to `wireframe-tokens.css` AND registered in `tailwind.config.ts`:

| Token | Light | Dark | Tailwind Key |
|-------|-------|------|-------------|
| `--wf-header-search-bg` | `#f6f6f8` | `#0f172a` | `wf.header-search-bg` |
| `--wf-table-footer-bg` | `#1e293b` | `#0f172a` | `wf.table-footer` (DEFAULT) |
| `--wf-table-footer-fg` | `#f1f5f9` | `#f1f5f9` | `wf.table-footer.fg` |

```typescript
// tailwind.config.ts — additions to wf: block
'header-search-bg': 'var(--wf-header-search-bg)',
'table-footer': {
  DEFAULT: 'var(--wf-table-footer-bg)',
  fg: 'var(--wf-table-footer-fg)',
},
```

---

## Styling Pattern Analysis

Three distinct patterns exist across the 85 component files. Migration surface per pattern:

### Pattern A: Tailwind wf-* Classes (majority — ~38 files)

```tsx
// KpiCard.tsx, DataTable.tsx, DonutChart.tsx, KpiCardFull.tsx
<div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
  <p className="text-xs font-medium text-wf-muted">{label}</p>
  <p className="text-2xl font-bold text-wf-heading">{value}</p>
```

**Migration impact for color changes: zero.** Token values update in CSS, Tailwind aliases
stay identical. Classes like `bg-wf-card`, `text-wf-heading`, `border-wf-card-border`
resolve to the updated token values automatically.

### Pattern B: Inline style with var() (~18 files)

```tsx
// WireframeHeader.tsx, WireframeFilterBar.tsx, StatCardRenderer.tsx
style={{
  background: 'var(--wf-header-bg)',
  borderBottom: '1px solid var(--wf-header-border)',
  color: 'var(--wf-body)',
}}
```

**Migration impact for color changes: zero.** Token values update in CSS. Inline
`var()` references resolve to new values automatically. Impact only when the component
needs JSX restructuring to implement new design patterns (new search input, bell icon, etc.).

### Pattern C: color-mix() for fills (7 files)

```tsx
// KpiCardFull.tsx, StatCardRenderer.tsx, ProgressBarRenderer.tsx
backgroundColor: variationPositive
  ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
  : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
```

**Migration impact: zero.** The `color-mix()` function resolves at runtime using the
updated token values automatically. These 7 files require no edits for color changes.

---

## Component Migration Surface by Category

### Category 1: Zero-edit components (token values update, components unchanged)

All 9+ chart components (BarLineChart, DonutChart, AreaChart, StackedBar, StackedArea,
HorizontalBar, Scatter, Bubble, Composed, Funnel, Radar, Treemap, Waterfall, Pareto, Gauge):
use `var(--wf-chart-*)` in COLORS arrays or Cell fill — value change propagates automatically.

All form/input components: ManualInputSection, SaldoBancoInput, InputsScreen, UploadSection.
All section renderers without new behavior: DividerRenderer, InfoBlockRenderer, FilterConfigRenderer.
All 17 property-form files: use app shadcn/ui tokens, not wf-* tokens at all.

**Count: ~55 files require zero edits.**

### Category 2: Layout restructure required (new JSX, same token names)

Token names are preserved throughout. These components need structural JSX changes to
implement the new design patterns from the HTML reference.

| Component | Required Change | Tokens Involved |
|-----------|-----------------|-----------------|
| `WireframeSidebar.tsx` | Add grouped sections, icons, status footer | `wf-sidebar-*` (unchanged names) |
| `WireframeHeader.tsx` | Add search input, bell icon, dark mode toggle, user chip | Existing + new `--wf-header-search-bg` |
| `WireframeFilterBar.tsx` | Add backdrop-blur, sticky behavior, action buttons | `wf-card`, `wf-card-border`, `wf-accent` |
| `KpiCard.tsx` | Add hover group effects, rounded-full trend badge | `wf-card`, `wf-positive`, `wf-negative` |
| `KpiCardFull.tsx` | Add hover group, sparkline stroke with accent color | Same + `--wf-accent` (now blue) |
| `DataTable.tsx` | Add dark footer row using new `--wf-table-footer-*` | New tokens from Phase 1 |
| `DrillDownTable.tsx` | Same dark footer treatment | New tokens from Phase 1 |

**Count: 7 files — JSX restructure, zero token renames.**

### Category 3: Editor components (out of v1.4 scope, except one)

25 files in `components/editor/` and `components/editor/property-forms/` use app shadcn/ui
tokens. They are the administrative editing interface, not the wireframe preview.

**Exception:** `ScreenManager.tsx` uses `wf-sidebar-*` Tailwind classes for its dark panel
(13 references confirmed by grep). It should receive visual updates alongside WireframeSidebar
to maintain consistency, but its behavior does not change.

**Count: 24 files excluded from scope, ScreenManager receives cosmetic update only.**

---

## Migration Strategy: Incremental, Token-First

The architectural separation of CSS tokens from component class names makes this uniquely
safe to execute incrementally. No feature flags, no parallel implementations needed.

**Big bang is riskier than token-first.** Restructuring 7 components simultaneously means
a large, hard-to-review PR. Token-first yields immediately visible results after Phase 1
that validate the direction, then component work proceeds at lower risk.

### Phase 1 — Token Layer (1 CSS file + 1 config file, zero component edits)

Update `wireframe-tokens.css`:
1. Replace all 10 neutral values (stone → slate)
2. Update semantic token values for `--wf-canvas` and `--wf-card` to direct hex values
3. Replace accent gold → primary blue (`--wf-accent`, `--wf-accent-muted`, `--wf-accent-fg`)
4. Convert `--wf-accent-muted` from `rgba()` to `color-mix()` form
5. Replace chart palette (5 values per theme = 10 values total)
6. Update sidebar token values (bg to slate-950, muted/border to direct slate hex)
7. Add 3 new tokens in both light and dark blocks

Update `tailwind.config.ts`:
8. Register the 3 new tokens in the `wf:` color extension block

**Result after Phase 1:** ~55 components render with the new slate + primary blue palette.
Gallery previews, KPI cards, charts, tables (minus footer row), filter bar colors — all
updated in a single commit. The wireframe visual shifts from warm stone + gold to
cool slate + blue automatically.

### Phase 2 — Chrome: WireframeSidebar + WireframeHeader

Restructure with new JSX. Color environment is already correct from Phase 1.
Only layout structure, new sub-components (search pill, bell, user chip), and
typography changes remain.

Build sidebar first: simpler structure, no internal state beyond screen selection.
Build header second: has period selector state and multiple interactive elements.

### Phase 3 — KPI Cards

Update `KpiCard.tsx` and `KpiCardFull.tsx`:
- Add `group` class to container, `group-hover:` modifiers to interactive elements
- Change trend badge from `rounded` to `rounded-full`
- Update Sparkline stroke from `var(--wf-muted)` to `var(--wf-accent)` (now blue from Phase 1)

### Phase 4 — Table Dark Footer Row

Add dark summary footer to `DataTable.tsx` and `DrillDownTable.tsx` using
`--wf-table-footer-bg` and `--wf-table-footer-fg` tokens added in Phase 1.
Low risk — additive change to existing components.

### Phase 5 — Filter Bar Enhancement

Update `WireframeFilterBar.tsx` with backdrop-blur sticky behavior and action buttons.
Color environment is already correct from Phase 1. Only structural additions needed.

### Phase 6 — ScreenManager Editor Sync

Update `ScreenManager.tsx` to match the new sidebar visual from Phase 2.
Cosmetic only — spacing, icon size, typography adjustments. Behavior unchanged.

### Phase 7 — Gallery Validation

Run through all gallery section previews. No development — smoke testing only.
Verify every component renders correctly in both light and dark mode.

---

## Build Order Dependency Graph

```
Phase 1: wireframe-tokens.css + tailwind.config.ts
    |  [single commit, zero component risk, unlocks automatic updates to ~55 files]
    |
    +---> Phase 2: WireframeSidebar  (sidebar color correct from Phase 1)
    |         |
    |         +---> Phase 6: ScreenManager  (syncs with sidebar Phase 2)
    |
    +---> Phase 2: WireframeHeader   (header color correct from Phase 1)
    |
    +---> Phase 3: KpiCard + KpiCardFull  (accent blue correct from Phase 1)
    |
    +---> Phase 4: DataTable + DrillDownTable  (footer tokens exist from Phase 1)
    |
    +---> Phase 5: WireframeFilterBar  (accent + card colors correct from Phase 1)
    |
    v
Phase 7: Gallery Validation  (after all components updated)
```

**Phases 2-5 are independent of each other** — they can be committed in any order
after Phase 1. Phase 6 should follow Phase 2 (sidebar). Phase 7 is always last.

---

## Component Counts by Phase

| Phase | Files Changed | Risk | Prereqs |
|-------|--------------|------|---------|
| 1 — Token CSS + config | 2 | Low | None |
| 2 — WireframeSidebar | 1 | Medium | Phase 1 |
| 2 — WireframeHeader | 1 | Medium | Phase 1 |
| 3 — KpiCard + KpiCardFull | 2 | Low | Phase 1 |
| 4 — DataTable + DrillDownTable | 2 | Low | Phase 1 |
| 5 — WireframeFilterBar | 1 | Medium | Phase 1 |
| 6 — ScreenManager | 1 | Low | Phase 2 Sidebar |
| 7 — Gallery Validation | 0 | Low | Phases 1-6 |

**Total files requiring edits: 10 out of 85.**
The other 75 update automatically via the CSS token changes in Phase 1.

---

## Icon System: Retain Lucide, No Migration

**Recommendation: Keep lucide-react for all wireframe icons in v1.4.**

Evidence for this decision:
- 28 component files import from lucide-react (grep confirmed)
- `IconPicker.tsx` has a typed `ICON_MAP` with 20 icons mapped to LucideIcon components
- Icon names are string literals stored in Supabase BlueprintConfig (`sidebar.items[].icon`)
- Replacing icon names requires a Supabase data migration for all existing blueprints

The visual quality gap between Lucide and Material Symbols Rounded at 16-18px wireframe
sidebar context is negligible. The design quality improvement in v1.4 comes from typography
weight changes (extrabold headings, tracking-widest labels), the new palette, and hover
group effects — not from the icon library.

**If Material Symbols is desired later (v2 scope):**
- Add `@material-symbols/font-variable` as a CSS variable font (no JS bundle cost)
- Update IconPicker.tsx ICON_MAP with new name mappings
- Write a Supabase migration to update `icon` string values in all blueprints
- This is a clean, isolated change — worth deferring until the need is demonstrated

---

## Branding Integration Points

Three integration points are affected by the token migration. All three continue working
without changes to branding.ts.

### Integration Point 1: chartColors prop chain (unchanged)

```
BrandingConfig
    -> getChartPalette() -- returns hex[]
    -> BlueprintRenderer -> SectionRenderer -> ChartRenderer
    -> DonutChart / BarLineChart / etc. (chartColors?: string[] prop)
```

When `chartColors` is present, it overrides the default `var(--wf-chart-*)` CSS vars.
This mechanism is independent of the token system. After Phase 1, the new blue
chart palette becomes the default. Client branding still overrides it via the prop chain.

### Integration Point 2: brandingToWfOverrides() (intentional no-op, unchanged)

This function returns `{}` by design. The decision that client branding does NOT
override wireframe chrome (sidebar color, header color) is preserved in v1.4.
The new slate + blue aesthetic becomes the universal wireframe chrome identity.
Client branding continues to express itself through charts, logo, and fonts only.

No changes to `branding.ts` are needed for this migration.

### Integration Point 3: tailwind.config.ts wf: extension (requires update)

The 3 new tokens must be registered. This is a prerequisite for using them as
Tailwind classes in DataTable and WireframeHeader:

```typescript
// In tailwind.config.ts, wf: block additions
'header-search-bg': 'var(--wf-header-search-bg)',
'table-footer': {
  DEFAULT: 'var(--wf-table-footer-bg)',
  fg: 'var(--wf-table-footer-fg)',
},
```

This change belongs in Phase 1 alongside the CSS token additions.

---

## Architectural Patterns

### Pattern 1: CSS-Scoped Token Themes

**What:** All token values are scoped to `[data-wf-theme="light"]` and `[data-wf-theme="dark"]`
selector blocks. WireframeThemeProvider sets the attribute. Components never handle
light/dark logic — the CSS scope does all the work.

**When to use:** Always for wireframe-specific styles. Every new token belongs in
wireframe-tokens.css, not in global CSS or component-level style blocks.

**Trade-offs:** Theme switching is zero-JS. Dark mode works automatically for every
component that uses `var(--wf-*)`. The constraint is that only light/dark variants exist —
per-client palette overrides go through the separate `--brand-*` mechanism.

### Pattern 2: Semantic Token Indirection

**What:** Components reference semantic tokens (`--wf-card`, `--wf-heading`) not
scale tokens (`--wf-neutral-50`). Semantic tokens alias to scale tokens in CSS.

**Why it matters for this migration:** Updating scale values propagates to semantics
automatically. Components are completely isolated from the scale-to-semantic mapping.

**When to break this pattern:** When the target design needs a value that doesn't
match any scale step. Example: `--wf-canvas: #f6f6f8` in the HTML reference doesn't
exactly match `--wf-neutral-100: #f1f5f9`. Use a direct hex value rather than forcing
the scale to match an arbitrary design value.

### Pattern 3: color-mix() for Transparency

**What:** Semi-transparent fills use `color-mix(in srgb, var(--wf-token) N%, transparent)`
instead of `rgba()` with hardcoded hex values.

**Why it matters:** `rgba()` with hardcoded hex becomes stale when the token changes.
`color-mix()` resolves at runtime from the current token value. The `--wf-accent-muted`
definition in wireframe-tokens.css currently uses `rgba()` — this is a debt that should
be fixed in Phase 1.

**Browser support:** color-mix() is baseline in all modern browsers. No polyfill needed.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Renaming wf-* tokens

**What people do:** Rename tokens for semantic clarity — e.g., `--wf-accent` to `--wf-primary`.

**Why it's wrong:** 31 component files reference `var(--wf-accent)` or `wf-accent` Tailwind
classes. 240 total `--wf-*` references across 31 files. Renaming propagates required edits
to every file, turning a CSS-only change into an 86-file PR.

**Do this instead:** Change values only. The accent name is still semantically correct
for a highlight/interactive color regardless of whether it is gold or blue.

### Anti-Pattern 2: Hardcoding hex values in components during restructure

**What people do:** While restructuring WireframeHeader, hardcode `color: '#1152d4'` directly.

**Why it's wrong:** Breaks dark mode (the token scoping doesn't apply to hardcoded hex),
breaks the branding layer independence, and creates drift between CSS and JSX.

**Do this instead:** If a color is needed that has no existing token, add the token to
wireframe-tokens.css first (both light and dark blocks), register it in tailwind.config.ts,
then use it via `var()` or Tailwind class in the component.

### Anti-Pattern 3: Static rgba() for token-derived transparency

**What people do:** Write `rgba(17, 82, 212, 0.12)` (the blue accent as rgba).

**Why it's wrong:** The value is frozen at that color. If the token changes in a future
redesign, the rgba doesn't follow. This is how `--wf-accent-muted` ended up as `rgba(212,160,23, 0.12)` — it was correct when written but is now stale.

**Do this instead:** Always use `color-mix(in srgb, var(--wf-token) N%, transparent)`.

### Anti-Pattern 4: Registering Tailwind aliases pointing to hardcoded values

**What people do:** Add a new entry to `wf:` in tailwind.config.ts with a hardcoded hex.

**Why it's wrong:** That color is frozen — doesn't change with dark mode, doesn't participate
in the token system.

**Do this instead:** The tailwind.config.ts `wf:` block must always point to `var(--wf-token-name)`.
The CSS file defines the actual values.

### Anti-Pattern 5: Splitting wireframe-tokens.css into per-component files

**What people do:** Create a `sidebar-tokens.css`, `header-tokens.css` for organization.

**Why it's wrong:** The light/dark scoping depends on the `[data-wf-theme]` blocks being
co-located. Splitting creates loading order dependencies and makes it easy to define a light
value without its dark counterpart.

**Do this instead:** Keep wireframe-tokens.css as the single token source file.
Use grouped comments within the file to organize sections.

---

## Sources

- Direct inspection: `tools/wireframe-builder/styles/wireframe-tokens.css` (45 tokens, 2 theme blocks)
- Direct inspection: `tailwind.config.ts` (wf: color extension, 18 registered aliases + app tokens)
- Direct inspection: `tools/wireframe-builder/lib/wireframe-theme.tsx` (WireframeThemeProvider, localStorage key)
- Direct inspection: `tools/wireframe-builder/lib/branding.ts` (brandingToCssVars, brandingToWfOverrides no-op)
- Direct inspection: `tools/wireframe-builder/types/branding.ts` (BrandingConfig, DEFAULT_BRANDING)
- Component-level inspection: KpiCard, KpiCardFull, WireframeSidebar, WireframeHeader, DataTable, WireframeFilterBar, StatCardRenderer, ProgressBarRenderer, DonutChart (all 3 styling patterns)
- Grep analysis: 240 total `--wf-*` references across 31 files; 28 files importing lucide-react
- Grep analysis: `color-mix()` in 7 files; `wf-sidebar` in 3 files (Sidebar, ScreenManager, tokens.css)
- `.planning/PROJECT.md` for v1.4 milestone goals and key decisions

---

*Architecture research for: v1.4 Wireframe Visual Redesign — token migration*
*Researched: 2026-03-11*
