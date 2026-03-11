# Stack Research: v1.4 Wireframe Visual Redesign

**Domain:** Wireframe component visual redesign — financial dashboard aesthetic
**Researched:** 2026-03-11
**Confidence:** HIGH (npm registry verified, official docs consulted, existing codebase analyzed)

## Scope

This research covers ONLY stack additions/changes needed for v1.4. The validated existing stack is unchanged:

- React 18.3 + TypeScript 5.6 strict + Tailwind CSS 3.4 + Vite 5.4
- Recharts 2.13.3 (all chart types), lucide-react 0.460, shadcn/ui
- --wf-* CSS design token system (wireframe-tokens.css, ~45 variables)
- WireframeThemeProvider context, color-mix(in srgb) already in use
- Inter Variable font already loaded via @fontsource-variable/inter

The HTML reference design (`visual-redesign-reference.html`) uses:
- Tailwind CSS CDN with `plugins=forms,container-queries`
- Google Fonts CDN for Inter (not variable font)
- Material Symbols Outlined icons via CSS ligature font (not React components)
- CSS patterns: `backdrop-blur-md`, `bg-white/80`, hover states, `tracking-widest`

Questions to answer: (1) container-queries plugin needed? (2) icon strategy — keep lucide or switch to Material Symbols? (3) any new CSS features needed?

---

## Recommended Stack Changes

### Critical Finding: One New Package, Zero Breaking Changes

The visual redesign requires exactly **one new npm package** (`@tailwindcss/container-queries`) and
**one Tailwind config change** (add plugin, expand wf color tokens). The CSS patterns in the reference
HTML (backdrop-blur, color-mix, group-hover) are already supported by Tailwind 3 + the existing
browser baseline. The icon strategy stays with lucide-react.

---

## Package Change: @tailwindcss/container-queries

| | Details |
|-|---------|
| **Package** | `@tailwindcss/container-queries` |
| **Version** | `0.1.1` (latest — last published March 2023, stable) |
| **Peer dep** | `tailwindcss >= 3.2.0` (project uses 3.4.15 — compatible) |
| **Purpose** | Enables `@container` + `@sm:`, `@md:`, `@lg:` responsive utilities |
| **Why** | The reference HTML uses container queries for KPI cards that reflow based on their grid cell width, not viewport. This is the correct pattern for dashboard grid components that appear in 1-col, 2-col, and 3-col layouts at the same viewport width. |

**Installation:**

```bash
npm install -D @tailwindcss/container-queries
```

**Tailwind config change (tailwind.config.ts):**

```typescript
import containerQueries from '@tailwindcss/container-queries'
import animate from 'tailwindcss-animate'

const config: Config = {
  // ... existing config unchanged ...
  plugins: [animate, containerQueries],
}
```

**Note on Tailwind v4:** Container queries are built-in to Tailwind v4 (no plugin needed). But
PROJECT.md explicitly defers the Tailwind v4 upgrade. For v1.4, the plugin is the correct path.

**Usage pattern in wireframe components:**

```tsx
// Parent container: mark as @container
<div className="@container rounded-lg border border-wf-card-border bg-wf-card">
  {/* Child: respond to container width, not viewport */}
  <div className="flex flex-col @md:flex-row @md:items-center gap-3">
    <p className="text-2xl font-bold @md:text-3xl">{value}</p>
  </div>
</div>
```

**When to use it:** Only in KpiCard and KpiCardFull where the same component appears in 1, 2, or 3
column grids. Do NOT apply `@container` to section wrappers — those already use the viewport-level
grid system. Overusing container queries adds unnecessary nesting complexity.

**Confidence:** HIGH — peerDependencies verified against npm registry. Plugin is stable (2023, no
reported issues with Tailwind 3.4). Official Tailwind docs confirm this is the Tailwind 3 path.

---

## Icon Strategy: Keep lucide-react, Do NOT Add Material Symbols

**Decision: Keep lucide-react exclusively. Do not install any Material Symbols package.**

### Why the HTML reference uses Material Symbols but we should not

The HTML reference was a quick prototype built with Google CDN tools, not a React project. It uses
Material Symbols as a webfont because that's the easiest path for a static HTML file. In a Vite +
React project, the calculus is different.

### Why lucide-react is the correct choice for this codebase

| Criterion | lucide-react | Material Symbols (any approach) |
|-----------|-------------|----------------------------------|
| Already in codebase | Yes — 86 component files import from it | No — would require audit + migration |
| Tree-shaking | Per-icon SVG import, zero unused bundle | webfont: loads all 2500+ icons; SVG pkg: needs careful import discipline |
| Tailwind integration | `className` prop, `currentColor` fill | Same for SVG packages; webfont uses CSS font-size for sizing |
| Consistency with app | Entire FXL Core app uses lucide-react | Mixing sets creates visual inconsistency (stroke weight, grid size) |
| TypeScript | Fully typed, named exports | Varies by package; some packages have 3000+ named exports |
| Maintenance surface | One package, stable API | Adds new dependency for visual-only reason |
| Design delta | New dashboard design uses filled/outlined icons — lucide has both styles via `fill` prop | Only reason to switch |

### What "matching the reference design" actually requires

The reference HTML uses filled/outlined icon variants for visual hierarchy (filled = active state,
outlined = default). **lucide-react achieves this with the `fill` prop and `strokeWidth` control:**

```tsx
// Default (outline, equivalent to Material Symbols Outlined)
<LayoutDashboard size={20} strokeWidth={1.5} />

// Active/filled state (equivalent to Material Symbols Filled)
<LayoutDashboard size={20} fill="currentColor" strokeWidth={0} />
```

The specific icon vocabulary differs (lucide has `LayoutDashboard`, not Material's `grid_view`),
but dashboard icons — home, charts, settings, user, notifications, search — exist in both sets.
Map Material Symbols icon names to lucide equivalents during component implementation, not during
research. This is a one-time naming exercise, not a structural problem.

**Confidence:** HIGH — lucide-react is already installed and used throughout the project. The
decision to not add Material Symbols is based on existing codebase analysis, bundle architecture,
and the absence of any capability gap that would justify the migration cost.

---

## CSS Features: Already Supported, No New Packages

### backdrop-blur (filter bar, header)

**Status:** Already works. Tailwind 3 ships `backdrop-blur-*` utilities natively.
**Browser support:** 95.75% globally (Chrome 76+, Firefox 103+, Safari 9+, Edge 17+).
**Current use in codebase:** The FXL Core app shell already uses `backdrop-blur-md` on the sticky
header (frosted glass pattern from v1.2). The wireframe filter bar redesign can use the same pattern.

```tsx
// WireframeFilterBar redesign — works today, no new packages
<div className="sticky top-14 z-10 backdrop-blur-md bg-wf-canvas/80 border-b border-wf-border">
```

Note: `bg-wf-canvas/80` requires wf-canvas to be a hex value (or hsl) that Tailwind can apply
opacity to. The current `--wf-canvas: var(--wf-neutral-100)` (a CSS variable reference) does NOT
work with Tailwind's opacity modifier. **Fix:** update `wf.canvas` in tailwind.config.ts to use
`color-mix(in srgb, var(--wf-canvas) 80%, transparent)` via inline style for the blur effect, OR
add a dedicated `--wf-canvas-80` token. See Token Update section below.

### color-mix(in srgb) (badge fills, semi-transparent backgrounds)

**Status:** Already in use. KpiCard.tsx uses `color-mix(in srgb, var(--wf-positive) 10%, transparent)`.
**Browser support:** 92%+ globally, Baseline Widely Available since May 2023.
**No changes needed.** Continue using this pattern for all badge/chip backgrounds in the redesign.

```tsx
// Already established pattern — use for all trend badges, status chips
style={{
  backgroundColor: 'color-mix(in srgb, var(--wf-primary) 12%, transparent)',
  color: 'var(--wf-primary)',
}}
```

### group-hover (KPI card hover effects)

**Status:** Already supported in Tailwind 3. Mark parent with `group`, children use `group-hover:`.
**Limitation:** Tailwind's `group-hover:` modifier generates predefined utility classes only — it
cannot dynamically change CSS custom property values. For hover effects that need to change CSS var
values, use inline styles + CSS transitions, or add dedicated Tailwind utility classes to the wf
color palette.

**Pattern for KPI card hover effects:**

```tsx
// Correct pattern: group-hover with standard Tailwind utilities
<div className="group rounded-lg border border-wf-card-border bg-wf-card
                transition-shadow hover:shadow-md cursor-pointer">
  <div className="text-wf-muted group-hover:text-wf-body transition-colors">
    {label}
  </div>
</div>

// For CSS var changes on hover: use CSS in wireframe-tokens.css directly
// [data-wf-theme] .group:hover .kpi-trend { color: var(--wf-primary); }
```

### Inter font weight axis (extrabold headings)

**Status:** Already loaded via `@fontsource-variable/inter` (package already installed, font-sans
already configured). The variable font covers weights 100–900, including `font-extrabold` (800)
and `font-black` (900). No new font package needed.

```tsx
// Already works — Inter Variable supports all weights
<h1 className="text-4xl font-extrabold tracking-tight text-wf-heading">
```

### tracking-widest, text-[10px], text-[11px] (micro labels)

**Status:** Supported natively. `tracking-widest` is a core Tailwind utility.
Arbitrary text sizes like `text-[10px]` and `text-[11px]` work with Tailwind 3's JIT engine —
no configuration needed.

---

## Token System Updates: wireframe-tokens.css

The v1.4 redesign introduces a new primary color (`#1152d4` — blue, replacing gold accent) and
new neutral palette (`background-light #f6f6f8`, `background-dark #101622`). The existing
`--wf-*` token schema is the right structure — only the values and a few new tokens change.

**New tokens to add (in wireframe-tokens.css):**

```css
[data-wf-theme="light"] {
  /* Replace warm stone grays with slate scale */
  --wf-neutral-50:  #f8fafc;   /* slate-50 */
  --wf-neutral-100: #f1f5f9;   /* slate-100 */
  --wf-neutral-200: #e2e8f0;   /* slate-200 */
  --wf-neutral-300: #cbd5e1;   /* slate-300 */
  --wf-neutral-400: #94a3b8;   /* slate-400 */
  --wf-neutral-500: #64748b;   /* slate-500 */
  --wf-neutral-600: #475569;   /* slate-600 */
  --wf-neutral-700: #334155;   /* slate-700 */
  --wf-neutral-800: #1e293b;   /* slate-800 */
  --wf-neutral-900: #0f172a;   /* slate-900 */

  /* New semantic background */
  --wf-canvas: #f6f6f8;          /* background-light from reference */

  /* Primary blue (replaces gold accent) */
  --wf-primary: #1152d4;
  --wf-primary-muted: color-mix(in srgb, #1152d4 12%, transparent);
  --wf-primary-fg: #ffffff;

  /* Keep --wf-accent as alias for backward compat during transition */
  --wf-accent: var(--wf-primary);
  --wf-accent-muted: var(--wf-primary-muted);

  /* New chart palette (blue-first) */
  --wf-chart-1: #1152d4;   /* primary blue */
  --wf-chart-2: #4f46e5;   /* indigo-600 */
  --wf-chart-3: #7c3aed;   /* violet-600 */
  --wf-chart-4: #0891b2;   /* cyan-600 */
  --wf-chart-5: #059669;   /* emerald-600 */

  /* Header update: white with blur */
  --wf-header-bg: rgba(255, 255, 255, 0.85);
}

[data-wf-theme="dark"] {
  --wf-canvas: #101622;          /* background-dark from reference */
  --wf-primary: #3b82f6;         /* blue-500 (brighter for dark bg) */
  --wf-primary-muted: color-mix(in srgb, #3b82f6 15%, transparent);
  --wf-primary-fg: #ffffff;

  /* Keep sidebar dark (--wf-sidebar-bg stays slate-900/950) */
  --wf-sidebar-bg: #0d1117;

  /* New chart palette (brighter for dark) */
  --wf-chart-1: #60a5fa;   /* blue-400 */
  --wf-chart-2: #818cf8;   /* indigo-400 */
  --wf-chart-3: #a78bfa;   /* violet-400 */
  --wf-chart-4: #22d3ee;   /* cyan-400 */
  --wf-chart-5: #34d399;   /* emerald-400 */
}
```

**Tailwind config additions (tailwind.config.ts) for new wf tokens:**

```typescript
wf: {
  // ... existing tokens unchanged ...
  primary: 'var(--wf-primary)',
  'primary-muted': 'var(--wf-primary-muted)',
  'primary-fg': 'var(--wf-primary-fg)',
}
```

**Migration note:** `--wf-accent` remains as an alias during v1.4 to avoid breaking 86 component
files. After v1.4 ships, a cleanup pass can replace `wf-accent` → `wf-primary` across all files.
The alias (`--wf-accent: var(--wf-primary)`) means no visual regression during the transition.

---

## What Stays Unchanged

| Technology | Version | Why No Change |
|------------|---------|---------------|
| React | ^18.3.1 | Standard component patterns. No new hooks or APIs needed. |
| TypeScript | ^5.6.3 | Strict mode. No type changes from CSS updates. |
| Tailwind CSS | ^3.4.15 | Container queries added via plugin (not upgrade). All other patterns already work. |
| Vite | ^5.4.10 | No build changes. |
| lucide-react | ^0.460.0 | Stays. All 86 wireframe files keep their current icons. New components use lucide. |
| recharts | ^2.13.3 | Chart palette updates via chartColors prop — no Recharts changes. |
| @fontsource-variable/inter | ^5.2.8 | Already loaded, covers all weights including extrabold. |
| tailwindcss-animate | ^1.0.7 | Transition utilities (hover effects) already covered. |
| shadcn/ui | current | No new shadcn components for the redesign. |
| --wf-* token system | — | Schema unchanged. Only values and 2-3 new tokens added. |

---

## What NOT to Add

### Material Symbols (any package): DO NOT ADD

The three candidate packages are `react-material-symbols@4.4.0`, `@material-symbols-svg/react@4.4.0`,
and `@project-lary/react-material-symbols`. All are rejected:

- `react-material-symbols` — webfont ligature approach, loads full font (not tree-shaken)
- `@material-symbols-svg/react` — SVG components, but adds 3000+ named exports, requires
  discipline in imports to avoid bundle bloat, and creates a two-icon-system in the codebase
- `@project-lary/react-material-symbols` — same as above

The reference HTML uses Material Symbols because it's a static HTML prototype. React components
should use what the project already has. lucide-react is already integrated, tree-shaken, and
used consistently across the entire codebase. Adding Material Symbols to match a prototype aesthetic
is a dependency with no capability justification.

### Google Fonts CDN for Inter: DO NOT ADD

The reference HTML loads Inter via `fonts.googleapis.com`. The project uses
`@fontsource-variable/inter` which self-hosts the variable font — faster (no external CDN), works
offline, and already includes all weights. Do not add a Google Fonts link tag.

### Tailwind v4 Upgrade: DO NOT DO

PROJECT.md explicitly defers this. Container queries are built-in to v4, but the upgrade itself
has breaking changes (configuration format, CSS-first config, plugin API changes) that are out of
scope for a visual redesign milestone.

### Recharts 3.x: DO NOT UPGRADE

Established constraint from PROJECT.md. The chart palette update for v1.4 is purely in the
`chartColors` prop and `--wf-chart-*` tokens — no Recharts API changes needed.

### Framer Motion / React Spring for animations: DO NOT ADD

The reference design uses CSS transitions (`transition-all`, `transition-colors`) — standard
Tailwind utilities via `tailwindcss-animate`. No JavaScript animation library is needed for
hover effects, smooth transitions, or the blur effect. CSS transitions are sufficient and
keep the bundle lean.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| @tailwindcss/container-queries@0.1.1 | Inline CSS container query styles | Plugin generates consistent `@sm:`, `@md:` utilities; raw CSS in JSX loses Tailwind's utility-first consistency |
| @tailwindcss/container-queries@0.1.1 | Upgrade to Tailwind v4 (built-in CQ) | v4 upgrade is deferred in PROJECT.md; too broad a change for a visual redesign milestone |
| lucide-react (keep) | react-material-symbols@4.4.0 | Webfont approach; not tree-shaken; adds external font dependency; 86 files already use lucide |
| lucide-react (keep) | @material-symbols-svg/react@4.4.0 | 3000+ SVG components; requires import discipline; visual inconsistency mixing icon sets |
| --wf-primary replacing --wf-accent (alias) | Rename --wf-accent across all 86 files immediately | Alias approach (--wf-accent: var(--wf-primary)) allows incremental migration with zero visual regression risk |
| color-mix(in srgb) for semi-transparent fills | Hardcoded rgba values | color-mix keeps relationship to token values; rgba values drift out of sync when tokens update |
| backdrop-blur via Tailwind utility + inline style for opacity | New --wf-canvas-blur token | Inline style is clearer intent for one-off use; a dedicated token adds complexity for a single component |

---

## Installation Plan

```bash
# New package (devDependency — Tailwind plugin)
npm install -D @tailwindcss/container-queries

# No other package changes
```

**Total: 1 new package (dev dependency only). Zero breaking changes. Zero new runtime dependencies.**

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @tailwindcss/container-queries@0.1.1 | tailwindcss@^3.4.15 | peerDependencies: tailwindcss >= 3.2.0. Verified. |
| @tailwindcss/container-queries@0.1.1 | tailwindcss-animate@^1.0.7 | Both are plugins in the same array. No conflicts. |
| color-mix(in srgb) | All target browsers | 92%+ global support. Baseline Widely Available since May 2023. Already used in production in KpiCard.tsx. |
| backdrop-filter: blur | All target browsers | 95.75% global support. Chrome 76+, Firefox 103+, Safari 9+. Already used in FXL Core app shell header. |

---

## Sources

- [npm: @tailwindcss/container-queries](https://www.npmjs.com/package/@tailwindcss/container-queries) — version 0.1.1, peerDep tailwindcss >= 3.2.0 (HIGH confidence, npm registry)
- [GitHub: tailwindlabs/tailwindcss-container-queries](https://github.com/tailwindlabs/tailwindcss-container-queries) — official plugin, compatible with Tailwind 3.2+ (HIGH confidence, official source)
- [Tailwind CSS v3 docs: hover-focus-and-other-states](https://v3.tailwindcss.com/docs/hover-focus-and-other-states) — group-hover pattern and limitations (HIGH confidence, official docs)
- [Can I use: CSS backdrop-filter](https://caniuse.com/css-backdrop-filter) — 95.75% global support (HIGH confidence, caniuse)
- [Can I use: color-mix()](https://caniuse.com/mdn-css_types_color_color-mix) — 92%+ global support, Baseline Widely Available (HIGH confidence, caniuse)
- [Google Fonts: Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols) — webfont approach, variable font axes (HIGH confidence, official Google docs)
- [npm: react-material-symbols@4.4.0](https://www.npmjs.com/package/react-material-symbols) — version confirmed via npm registry (HIGH confidence)
- [Lucide: lucide-react guide](https://lucide.dev/guide/packages/lucide-react) — icon customization including fill/strokeWidth props (HIGH confidence, official docs)
- Existing codebase analysis: 86 wireframe component files, wireframe-tokens.css (~45 vars), tailwind.config.ts, KpiCard.tsx (color-mix pattern), WireframeHeader.tsx, package.json (HIGH confidence, direct inspection)

---
*Stack research for: FXL Core v1.4 Wireframe Visual Redesign*
*Researched: 2026-03-11*
