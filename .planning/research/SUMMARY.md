# Project Research Summary

**Project:** FXL Core v1.4 — Wireframe Visual Redesign
**Domain:** CSS token migration + BI dashboard component visual redesign (financial dashboard aesthetic)
**Researched:** 2026-03-11
**Confidence:** HIGH

## Executive Summary

The v1.4 milestone is a visual redesign of the existing wireframe component library — replacing the warm stone + gold palette with a professional financial dashboard aesthetic (primary blue `#1152d4`, slate neutrals, dark slate-950 sidebar). All four research areas converge on the same conclusion: the underlying architecture is already well-suited to this change. The CSS token system (`wireframe-tokens.css` scoped to `[data-wf-theme]`) means the vast majority of components (approximately 75 of 85) update automatically when token values change. Only 10 files require structural JSX edits. The stack change required is exactly one new dev dependency: `@tailwindcss/container-queries@0.1.1`.

The recommended execution strategy is token-first and incremental. Phase 1 updates only `wireframe-tokens.css` and `tailwind.config.ts`, which immediately propagates the new palette to ~55 auto-updating components. Subsequent phases handle the 7 components requiring structural JSX changes (sidebar, header, filter bar, KPI cards, tables) independently of each other. This approach yields visible progress after a single small commit, reduces regression surface at each step, and makes the work reviewable in isolation. The alternative — a big-bang simultaneous redesign — turns a low-risk CSS migration into a high-risk 86-file PR.

The primary risks are not in implementation complexity but in discipline: renaming existing `--wf-*` tokens (breaks 240 usages silently, no TypeScript enforcement), updating light-mode tokens without updating their dark-mode counterparts, and introducing hardcoded hex values or Radix portal-based components during JSX restructures. All of these are entirely avoidable with explicit checklists. The secondary risk is ensuring client branding (`financeiro-conta-azul`, `primaryColor: '#1B6B93'`) still overrides the new `--wf-primary` token correctly after the redesign.

## Key Findings

### Recommended Stack

The existing stack requires no version upgrades. One new plugin is needed: `@tailwindcss/container-queries@0.1.1`, which enables `@container` + `@sm:`/`@md:` responsive utilities for KPI cards that appear in 1-column, 2-column, and 3-column grid layouts at the same viewport width. All other CSS patterns used in the HTML reference (backdrop-blur, color-mix, group-hover, Inter extrabold) are already supported by Tailwind 3.4 and the existing browser baseline. The icon library stays as lucide-react — the HTML reference uses Material Symbols only because it is a static prototype; switching would touch 86 component files and add a bundle dependency with no capability gap.

**Core technologies:**
- `@tailwindcss/container-queries@0.1.1` (new devDep): KPI card responsive layout at container level, not viewport — peerDep compatible with Tailwind 3.4.15, verified on npm registry
- `--wf-* CSS token system` (existing, primary change surface): update values in `wireframe-tokens.css`, zero component file renames
- `lucide-react@0.460` (existing, keep): 86 files import it; icon fill/strokeWidth props replicate the filled/outlined icon variants from the reference design
- `color-mix(in srgb, ...)` (existing): all semi-transparent badge fills, already 92%+ browser support baseline
- `backdrop-filter: blur` via Tailwind `backdrop-blur-sm` (existing): sticky filter bar blur, 95.75% browser support, already used in app shell header

**Critical constraint:** Do NOT upgrade Tailwind v4, Recharts 3.x, or add Material Symbols/Framer Motion — all explicitly excluded.

### Expected Features

The HTML reference (`dummy.html`) is the ground truth for all feature decisions. Features fall into a strict dependency order: token system must be done before any component changes; gallery update must be done last.

**Must have (table stakes — core redesign):**
- CSS token update: primary blue `#1152d4`, background-light `#f6f6f8`, background-dark `#101622`, slate chart palette — all other visual changes flow from this
- KpiCard: icon slot with `bg-primary/10` container, `rounded-full` trend badge, `font-extrabold` value text, `group`/`group-hover:` card hover effects
- DataTable: `tracking-widest font-black` th headers + dark `<tfoot>` row with totals (`--wf-table-footer-bg`/`fg` tokens)
- WireframeSidebar: icon rendering per nav item, section group micro-labels (`text-[10px] font-bold uppercase tracking-wider`), footer status block with green pulse dot
- WireframeHeader: right-side search input + notification bell + user chip with avatar `ring-primary hover`
- WireframeFilterBar: `backdrop-blur-sm` sticky container + 10px bold uppercase filter labels
- Chart palette: update `--wf-chart-1` through `--wf-chart-5` from gold/amber to blue/slate/indigo scale
- Table audit: apply same `tracking-widest font-black` header treatment to ClickableTable, DrillDownTable, ConfigTable
- Inter `font-extrabold` pass: card titles, KPI values, page h1

**Should have (polish pass, P2):**
- KpiCard sparkline: 4-column pure-CSS mini bar chart as `sparkline?: number[]` prop — zero Recharts dependency
- CompositionBar: new component for multi-segment stacked horizontal bar + color legend
- Custom chart header legend: replaces Recharts default `<Legend>` with header-aligned custom rendering
- Table status dot column: `type: 'status'` on Column definition renders `h-2 w-2 rounded-full` with ring
- DetailViewSwitcher audit: verify existing component matches the pill-tab reference pattern

**Defer to v2+:**
- CSS-only animated charts (keyframe animations distract from wireframe UX review)
- Custom WebKit scrollbar styling (cross-browser risk for cosmetic gain)
- Replace Recharts with CSS-only charts (regression risk across 14 chart types)
- Full dark-first mode redesign (light is primary; dark inherits via `[data-wf-theme="dark"]` block)

### Architecture Approach

The token architecture enforces a strict four-layer hierarchy: CSS token definition (`wireframe-tokens.css`) → theme provider (sets `data-wf-theme` attribute) → Tailwind alias layer (`tailwind.config.ts` `wf:` block) → component layer (85 files using Pattern A Tailwind classes, Pattern B inline `var()`, or Pattern C `color-mix()`). The key architectural insight: ALL token changes are purely CSS-side — zero component file edits required for value-only updates. Only structural JSX changes (new search input, icon slots, group hover classes) touch component files. Three new CSS tokens must be added (`--wf-header-search-bg`, `--wf-table-footer-bg`, `--wf-table-footer-fg`) and two hardcoded values must be converted to tokens (`--wf-accent-muted` from static `rgba()` to `color-mix()`, `GaugeChartComponent` `#f59e0b` to `--wf-warning`).

**Major components by migration category:**
1. `wireframe-tokens.css` + `tailwind.config.ts` — Phase 1 sole targets; 75 components auto-update
2. `WireframeSidebar`, `WireframeHeader`, `WireframeFilterBar` — structural JSX expansion, new sub-elements
3. `KpiCard`, `KpiCardFull` — JSX restructure for hover group pattern (cannot use inline styles for `group-hover:`)
4. `DataTable`, `DrillDownTable` — additive `<tfoot>` rendering with new footer tokens
5. `ScreenManager` — cosmetic sync with WireframeSidebar, behavior unchanged
6. Component gallery — smoke test only, no development; auto-reflects component changes

### Critical Pitfalls

1. **Renaming or removing existing `--wf-*` tokens** — 240 usages across 31 files fail silently (CSS custom properties have no TypeScript enforcement). Prevention: change values only, never names. Add aliases for backward compat. Run `grep -r 'wf-[token-name]'` before any removal.

2. **Recharts legend/tooltip ignoring CSS var updates** — `fill="var(--wf-chart-1)"` works for SVG bars but Recharts Legend renders HTML spans where color may not re-resolve after token changes. Prevention: implement `useWireframeChartPalette()` hook that calls `getComputedStyle` to resolve tokens to hex strings at runtime, re-executed on theme change.

3. **Dark mode breakage from light-only token updates** — `[data-wf-theme="light"]` and `[data-wf-theme="dark"]` blocks are independent. Updating one without the other produces visible inconsistency. Prevention: always update both blocks in the same file edit; visual gallery dark-mode pass after every component phase.

4. **WireframeThemeProvider boundary violations** — All `var(--wf-*)` tokens only resolve inside the `data-wf-theme` container div. Radix UI portals (shadcn `Select`, `Dialog`, `Tooltip`) render into `document.body`, outside the boundary. Prevention: never introduce shadcn portal-based components in wireframe components; use absolutely-positioned divs for dropdowns as current components do.

5. **Client branding break via new `--wf-primary` token** — The `financeiro-conta-azul` client has `primaryColor: '#1B6B93'`. If redesigned components use `--wf-primary` for interactive elements but `generateBrandCssVars()` does not map `--brand-primary` to override `--wf-primary`, the client's teal is ignored. Prevention: decide branding overridability for each new token in Phase 1; update `generateBrandCssVars()` accordingly; test with the pilot client after every phase.

## Implications for Roadmap

Based on the dependency graph validated by all four research files, the phase structure is clear and non-negotiable in terms of ordering. Phase 1 is the only strict blocker for everything else. Phases 2-6 are independent of each other once Phase 1 is committed.

### Phase 1: Token Foundation
**Rationale:** Every subsequent visual change depends on the token system being correct first. This phase touches 0 component files — only 2 files (`wireframe-tokens.css`, `tailwind.config.ts`) — yet immediately updates ~55 components automatically via CSS cascade. Highest leverage-to-risk ratio of any commit in the milestone.
**Delivers:** New slate neutral scale, primary blue `#1152d4` replacing gold `#d4a017`, updated chart palette (5 tokens per theme), 3 new tokens (`--wf-header-search-bg`, `--wf-table-footer-*`), `--wf-warning` token for GaugeChartComponent, `--wf-accent-muted` converted from static `rgba()` to `color-mix()`, `@tailwindcss/container-queries` installed, branding overridability decision documented.
**Addresses:** Token table stakes from FEATURES.md; chart palette; Pitfalls 1, 2, 3, 5, 8.
**Avoids:** Any token rename — values only; both light AND dark blocks updated in the same edit.

### Phase 2: Sidebar + Header Chrome
**Rationale:** Sidebar and header are visible on every wireframe screen. Wrong aesthetic on chrome breaks the overall design impression regardless of content quality. These are independent of each other (sidebar first — simpler, no state management; header second — has period selector state).
**Delivers:** WireframeSidebar with icon rendering per nav item, section group micro-labels, status footer block with green pulse dot. WireframeHeader with right-side search pill, notification bell, dark mode toggle, divider, user chip with avatar.
**Uses:** `--wf-header-search-bg` new token from Phase 1; lucide-react icon mapping for sidebar items.
**Avoids:** No shadcn portal components; all chrome inside `data-wf-theme` div (Pitfall 7). Dark mode visual pass after each component (Pitfall 3).

### Phase 3: KPI Cards
**Rationale:** KPI cards are the first content section on any financial dashboard and have the highest impact on the "premium" feeling of the new design. The `group`/`group-hover:` hover pattern is a known conflict with the existing inline style approach and must be addressed explicitly.
**Delivers:** `KpiCard` and `KpiCardFull` with icon slot, `rounded-full` trend badge, `font-extrabold` values, `group` hover effects (icon transitions from `bg-primary/10 text-primary` to `bg-primary text-white`), optional `sparkline?: number[]` pure-CSS mini bars. `@container` applied for grid-responsive layout.
**Avoids:** Do not use inline styles for `group-hover:` variants — must be Tailwind class strings only.

### Phase 4: Table Components
**Rationale:** Tables are the most-used section type in financial dashboards. The `<tfoot>` addition is purely additive — zero risk of breaking existing `<tbody>` rendering. All four table components must be updated together to maintain visual consistency.
**Delivers:** `DataTable`, `ClickableTable`, `DrillDownTable`, `ConfigTable` with `tracking-widest font-black` th headers. `DataTable` and `DrillDownTable` with dark `<tfoot>` totals row using `--wf-table-footer-bg`/`fg` tokens. Optional `status` column type with `h-2 w-2 rounded-full` status dots.
**Avoids:** Test dark mode table footer contrast after implementation (Pitfall 3). Audit `galleryMockData.ts` for hardcoded hex colors before finalizing (Pitfall 6).

### Phase 5: Filter Bar Enhancement
**Rationale:** Filter bar is sticky and always visible, making its styling prominent. It also has the highest inline style density in the codebase (46 `--wf-*` references in WireframeFilterBar alone). Deserves its own phase to audit and eliminate hardcoded values before adding `backdrop-blur`.
**Delivers:** `WireframeFilterBar` with `backdrop-blur-sm` on sticky container, 10px bold uppercase filter labels, action buttons (primary and ghost variants). All hardcoded `fontFamily: 'Inter, sans-serif'` strings removed in favor of Tailwind `font-sans`. All `rgba(0,0,0,N)` shadow values replaced with `--wf-shadow-sm`/`md` tokens (added to Phase 1 if possible, else Phase 5).
**Avoids:** `backdrop-blur` must be a Tailwind className, not inline `backdropFilter` style (Pitfall 4). Maintain non-portal dropdown approach for filters (Pitfall 7).

### Phase 6: ScreenManager Sync
**Rationale:** ScreenManager uses `wf-sidebar-*` Tailwind classes and should visually match the redesigned WireframeSidebar to avoid the admin UI looking out-of-sync with the wireframe preview. Cosmetic-only change — behavior unchanged. Must follow Phase 2 (sidebar).
**Delivers:** `ScreenManager.tsx` updated with Phase 2 sidebar visual: correct spacing, icon sizing, typography. Zero behavior changes.

### Phase 7: Gallery Validation + Final Verification
**Rationale:** Gallery auto-reflects component changes because previews render inside `WireframeThemeProvider`. This phase is smoke-testing only — no development. Structured checklist from PITFALLS.md governs what must pass.
**Delivers:** Confirmation that all 86 wireframe components render correctly in light and dark mode. Client branding verified with `financeiro-conta-azul` (`#1B6B93` teal in interactive elements). `npx tsc --noEmit` zero errors. Gallery mock data audited for hardcoded hex colors.
**Avoids:** Do not change `--primary` in `globals.css` in the same commit as any wireframe token change (Pitfall 6).

### Phase Ordering Rationale

- Phase 1 is the only strict prerequisite — Phases 2-6 are fully independent of each other and can be committed in any order after Phase 1. Phase 7 is always last.
- Sidebar + header grouped in Phase 2 because they share the same visual context and are simultaneously visible on every screen.
- KPI cards (Phase 3) before tables (Phase 4) follows visual hierarchy: cards are above-the-fold, tables are scrolled content.
- Filter bar (Phase 5) after KPI cards because the `group-hover:` pattern conflict resolution in Phase 3 informs how to handle similar Tailwind-vs-inline-style tensions in the filter bar.
- ScreenManager (Phase 6) strictly after sidebar Phase 2 since it mirrors the sidebar visually.
- Token-first approach eliminates Pitfall 1 risk entirely; phase isolation enables targeted dark-mode verification after each commit (Pitfall 3); additive-only changes minimize regression surface (Pitfalls 6, 7).

### Research Flags

All phases have well-documented patterns. No phase requires a dedicated research-phase during planning.

Standard patterns (skip research-phase):
- **Phase 1 (Token Foundation):** Pure mechanical value substitution on a fully inventoried token system. Zero implementation ambiguity.
- **Phase 2 (Chrome):** Lucide icon mapping to sidebar items is a naming exercise, not a structural problem. Standard JSX restructure.
- **Phase 3 (KPI Cards):** `group`/`group-hover:` is documented Tailwind pattern. Container queries plugin is verified and installed.
- **Phase 4 (Tables):** Additive `<tfoot>` with pre-defined tokens. No complex patterns.
- **Phase 5 (Filter Bar):** `backdrop-blur-sm` via Tailwind class is straightforward. Token cleanup is grep-driven.
- **Phase 6 (ScreenManager):** Cosmetic sync only.
- **Phase 7 (Gallery):** Verification only.

One implementation decision to make explicitly in Phase 1 planning (not a research gap):
- **`useWireframeChartPalette()` hook** (Pitfall 2): Decide whether to implement the `getComputedStyle`-based hook in Phase 1 or defer. Recommendation: implement in Phase 1 — small code, high long-term value for Recharts legend/tooltip color consistency.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm registry verified, official docs consulted, existing codebase directly inspected. One new package with confirmed peer dependency compatibility. |
| Features | HIGH | HTML reference (`dummy.html`) is ground truth — patterns extracted directly from source, not inferred. Table stakes confirmed against Metabase/Power BI conventions. |
| Architecture | HIGH | All findings code-verified via direct codebase inspection (grep counts, line references, file counts). Token inventory is exhaustive — 240 usages across 31 files accounted for. |
| Pitfalls | HIGH | All 8 critical pitfalls grounded in direct file inspection (hardcoded hex locations, inline style counts, provider boundary analysis, specific line numbers). No speculative pitfalls. |

**Overall confidence:** HIGH

### Gaps to Address

- **`useWireframeChartPalette()` hook — implement or defer:** The Recharts CSS var resolution issue (Pitfall 2) is confirmed but the fix adds implementation work to Phase 1. Decide in Phase 1 planning whether to implement proactively or do a manual visual verification pass of all 14 chart types post token-update. Recommendation: implement — it is a small hook with outsized long-term value.

- **`--wf-accent` alias strategy must be explicit:** STACK.md and ARCHITECTURE.md both confirm that keeping `--wf-accent: var(--wf-primary)` as a transitional alias (rather than renaming 240 usages) is the correct approach for v1.4. This must be stated explicitly in Phase 1 implementation notes so no one attempts a direct rename.

- **Branding overridability for `--wf-primary` must be decided in Phase 1:** Should `generateBrandCssVars()` map `--brand-primary` to also override `--wf-primary`? Research says yes (Pitfall 5). This is a one-line addition to `branding.ts` but must be done alongside the token addition, not discovered afterward.

## Sources

### Primary (HIGH confidence)
- `tools/wireframe-builder/styles/wireframe-tokens.css` — 124 lines, 45 token definitions, complete inventory confirmed
- `tailwind.config.ts` — `wf:` extension block, 18 registered aliases, app theme tokens
- `src/styles/globals.css` — app theme root, wireframe-tokens.css import confirmed
- `tools/wireframe-builder/lib/wireframe-theme.tsx` — WireframeThemeProvider scope boundary
- `tools/wireframe-builder/lib/branding.ts` — generateBrandCssVars, chartColors prop chain, brandingToWfOverrides no-op
- `tools/wireframe-builder/components/GaugeChartComponent.tsx` — hardcoded `#f59e0b` line 45 confirmed
- `tools/wireframe-builder/components/WireframeFilterBar.tsx` — 46 inline style token references confirmed
- `clients/financeiro-conta-azul/wireframe/branding.config.ts` — `primaryColor: '#1B6B93'` confirmed
- `.planning/research/visual-redesign-reference.html` — HTML reference design, all CSS patterns extracted directly
- [npm: @tailwindcss/container-queries](https://www.npmjs.com/package/@tailwindcss/container-queries) — version 0.1.1, peerDep tailwindcss >= 3.2.0, verified
- [GitHub: tailwindlabs/tailwindcss-container-queries](https://github.com/tailwindlabs/tailwindcss-container-queries) — official plugin, Tailwind 3.2+ compatible
- [Can I use: CSS backdrop-filter](https://caniuse.com/css-backdrop-filter) — 95.75% global support
- [Can I use: color-mix()](https://caniuse.com/mdn-css_types_color_color-mix) — 92%+ global support, Baseline Widely Available

### Secondary (MEDIUM confidence)
- [Tailwind CSS v3 docs: hover-focus-and-other-states](https://v3.tailwindcss.com/docs/hover-focus-and-other-states) — group-hover pattern and limitations
- [Lucide: lucide-react guide](https://lucide.dev/guide/packages/lucide-react) — fill/strokeWidth props for icon variants
- [Metabase BI Dashboard Best Practices](https://www.metabase.com/learn/metabase-basics/querying-and-dashboards/dashboards/bi-dashboard-best-practices) — dark sidebar as industry standard
- [Design Tokens specification (W3C Community Group)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — token-first approach confirmed as standard
- Recharts GitHub issue #2239 — CSS variables in `fill` prop, Legend color swatch inconsistency pattern

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
