# Roadmap: FXL Core

## Milestones

- v1.0 MVP -- Phases 1-6 (shipped 2026-03-09)
- v1.1 Wireframe Evolution -- Phases 7-11 (shipped 2026-03-10)
- v1.2 Visual Redesign -- Phases 12-16 (shipped 2026-03-11)
- v1.3 Builder & Components -- Phases 17-21 (shipped 2026-03-11)
- v1.4 Wireframe Visual Redesign -- Phases 22-28 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-6) -- SHIPPED 2026-03-09</summary>

- [x] Phase 1: Documentation (2/2 plans) -- completed 2026-03-07
- [x] Phase 2: Wireframe Comments (3/3 plans) -- completed 2026-03-07
- [x] Phase 02.1: Melhoria e organizacao de dominio (3/3 plans) -- completed 2026-03-07
- [x] Phase 02.2: Evolucao de Blocos Disponiveis (3/3 plans) -- completed 2026-03-08
- [x] Phase 02.3: Reformulacao Visual (4/4 plans) -- completed 2026-03-08
- [x] Phase 3: Wireframe Visual Editor (4/4 plans) -- completed 2026-03-09
- [x] Phase 4: Branding Process (3/3 plans) -- completed 2026-03-09
- [x] Phase 5: Technical Configuration (2/2 plans) -- completed 2026-03-09
- [x] Phase 6: System Generation (3/3 plans) -- completed 2026-03-09

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>v1.1 Wireframe Evolution (Phases 7-11) -- SHIPPED 2026-03-10</summary>

- [x] Phase 7: Blueprint Infrastructure (3/3 plans) -- completed 2026-03-09
- [x] Phase 8: Wireframe Design System (3/3 plans) -- completed 2026-03-10
- [x] Phase 9: Component Library Expansion (4/4 plans) -- completed 2026-03-10
- [x] Phase 10: Briefing & Blueprint Views (3/3 plans) -- completed 2026-03-10
- [x] Phase 11: AI-Assisted Generation (2/2 plans) -- completed 2026-03-10

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

<details>
<summary>v1.2 Visual Redesign (Phases 12-16) -- SHIPPED 2026-03-11</summary>

- [x] Phase 12: Design Foundation (1/1 plan) -- completed 2026-03-10
- [x] Phase 13: Layout Shell (1/1 plan) -- completed 2026-03-10
- [x] Phase 14: Sidebar Navigation (1/1 plan) -- completed 2026-03-10
- [x] Phase 15: Doc Rendering and TOC (2/2 plans) -- completed 2026-03-10
- [x] Phase 16: Consistency Pass (2/2 plans) -- completed 2026-03-10

Full details: [milestones/v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md)

</details>

<details>
<summary>v1.3 Builder & Components (Phases 17-21) -- SHIPPED 2026-03-11</summary>

- [x] Phase 17: Schema Foundation & Layout Restructure (3/3 plans) -- completed 2026-03-11
- [x] Phase 18: Configurable Sidebar & Header (3/3 plans) -- completed 2026-03-11
- [x] Phase 19: Filter Bar Expansion (2/2 plans) -- completed 2026-03-11
- [x] Phase 20: Chart Type Expansion (4/4 plans) -- completed 2026-03-11
- [x] Phase 21: Gallery Reorganization (2/2 plans) -- completed 2026-03-11

Full details: [milestones/v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md)

</details>

### v1.4 Wireframe Visual Redesign (In Progress)

**Milestone Goal:** Reformular o visual de todos os componentes de wireframe com novo design system (primary blue #1152d4, slate palette, Inter extrabold typography, dark sidebar, group-hover effects, professional financial dashboard aesthetic).

- [x] **Phase 22: Token Foundation** - Update wireframe-tokens.css and tailwind.config.ts; new palette propagates to ~55 components automatically (completed 2026-03-11)
- [x] **Phase 23: Sidebar & Header Chrome** - Dark slate sidebar with nav groups and footer; white header with search, notifications, and user chip (completed 2026-03-11)
- [x] **Phase 24: KPI Cards** - Icon slot, group-hover transitions, rounded-full trend badges, extrabold values, optional sparkline (completed 2026-03-11)
- [x] **Phase 25: Table Components** - Tracking-widest font-black headers, dark tfoot row, hover transitions, trend icons across all 4 table variants (completed 2026-03-11)
- [ ] **Phase 26: Filter Bar Enhancement** - backdrop-blur sticky bar, 10px uppercase labels, action button hierarchy, compare toggle
- [ ] **Phase 27: Chart Palette & Composition** - Primary blue + slate chart palette, custom header legend, CompositionBar new component
- [ ] **Phase 28: Editor Sync & Gallery Validation** - ScreenManager visual sync with sidebar, gallery smoke test, final TypeScript verification

## Phase Details

### Phase 22: Token Foundation
**Goal**: The wireframe token system reflects the new financial dashboard palette so all downstream component changes build on correct base values
**Depends on**: Phase 21 (v1.3 complete)
**Requirements**: TOK-01, TOK-02, TOK-03, TOK-04, TOK-05, TOK-06, TOK-07
**Success Criteria** (what must be TRUE):
  1. Wireframe components render with primary blue #1152d4 replacing gold #d4a017 as accent color
  2. Background tokens show #f6f6f8 in light mode and #101622 in dark mode
  3. --wf-accent-muted uses color-mix() derived from --wf-accent (no hardcoded rgba values remain)
  4. Three new tokens exist and resolve correctly: --wf-header-search-bg, --wf-table-footer-bg, --wf-table-footer-fg
  5. Client branding for financeiro-conta-azul (#1B6B93) still overrides --wf-primary correctly in the wireframe viewer
**Plans:** 2/2 plans complete
Plans:
- [ ] 22-01-PLAN.md -- Slate + blue token overhaul, GaugeChart hardcode fix, Tailwind config update
- [ ] 22-02-PLAN.md -- Branding override pipeline (brandingToWfOverrides + WireframeThemeProvider) and chart palette hook

### Phase 23: Sidebar & Header Chrome
**Goal**: Every wireframe screen shows a professional dark sidebar and clean white header that immediately communicate financial dashboard quality
**Depends on**: Phase 22
**Requirements**: SIDE-01, SIDE-02, SIDE-03, SIDE-04, SIDE-05, HEAD-01, HEAD-02, HEAD-03, HEAD-04
**Success Criteria** (what must be TRUE):
  1. Sidebar displays with slate-900/950 dark background, slate-300/400 text, and primary/10 background on the active nav item
  2. Sidebar nav items show hover:bg-slate-800 hover:text-white transitions and section group labels in 10px uppercase tracking-wider style
  3. Sidebar footer shows a status indicator (colored dot + label) inside a bordered card at the bottom of the panel
  4. Header renders with white/slate-900 background, bottom border, and a rounded-lg search input with slate-100/800 background
  5. Header right side displays notification icon, dark mode toggle, and a user chip with avatar showing name and role
**Plans:** 2/2 plans complete
Plans:
- [x] 23-01-PLAN.md — Sidebar chrome: dark tokens, active/hover states, group labels, status footer
- [x] 23-02-PLAN.md — Header chrome: search input, bell, theme toggle, user chip

### Phase 24: KPI Cards
**Goal**: KPI cards deliver the premium hover-responsive feel that defines a professional financial dashboard first impression
**Depends on**: Phase 22
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05
**Success Criteria** (what must be TRUE):
  1. KPI cards render on white/slate-900 background with rounded-xl border and shadow-sm
  2. Hovering a KPI card transitions the icon container from primary/10 background with primary text to solid primary background with white text
  3. Trend badges display as rounded-full pills with emerald background for positive values and rose background for negative values
  4. Card values use text-2xl font-extrabold and labels use text-sm font-medium slate-500
  5. Comparison text appears below the value at text-[10px] text-slate-400
**Plans:** 1/1 plans complete
Plans:
- [ ] 24-01-PLAN.md — KpiCardFull + KpiCard restyle (icon slot, group-hover, rounded-full badges, extrabold values, type update)

### Phase 25: Table Components
**Goal**: All four table variants share a consistent professional header treatment and the primary analytical table gains a dark footer totals row
**Depends on**: Phase 22
**Requirements**: TBL-01, TBL-02, TBL-03, TBL-04, TBL-05
**Success Criteria** (what must be TRUE):
  1. All four table components (DataTable, ClickableTable, DrillDownTable, ConfigTable) show headers with text-[10px] font-black uppercase tracking-widest slate-500 on slate-50/800 background
  2. Table rows highlight with hover:bg-slate-100 dark:hover:bg-slate-800 and cursor-pointer on interactive tables
  3. Highlight and total rows use primary-colored text with font-extrabold uppercase styling
  4. DataTable and DrillDownTable render a dark footer row (bg-slate-900 text-white font-black) with aggregate totals when footer data is provided
  5. Trend indicator cells show color-coded icons that scale to scale-110 on hover
**Plans:** 2/2 plans complete
Plans:
- [x] 25-01-PLAN.md — Header typography, row hover, total/highlight row restyle across all 4 tables (completed 2026-03-11)
- [ ] 25-02-PLAN.md — Dark footer row (type + render) and trend indicator cell pattern

### Phase 26: Filter Bar Enhancement
**Goal**: The sticky filter bar reads as a premium control surface with blur depth and typographic clarity that matches the dashboard chrome
**Depends on**: Phase 22
**Requirements**: FILT-01, FILT-02, FILT-03, FILT-04, FILT-05
**Success Criteria** (what must be TRUE):
  1. Filter bar sticks at the top of the content area with backdrop-blur-sm and semi-transparent background visible behind scrolled content
  2. Filter select controls display transparent background with bold primary text and no visible border
  3. Filter labels appear at 10px uppercase bold slate-500 above their controls
  4. Action buttons (date picker, share, export) render with distinct hierarchy: outline style for secondary actions and filled for primary actions, all with rounded-lg shape
  5. Compare toggle uses a primary-colored switch with 11px bold label
**Plans:** 2 plans
Plans:
- [ ] 23-01-PLAN.md — Sidebar chrome: dark tokens, active/hover states, group labels, status footer
- [ ] 23-02-PLAN.md — Header chrome: search input, bell, theme toggle, user chip

### Phase 27: Chart Palette & Composition
**Goal**: All charts use the new blue-slate palette and the gallery gains a new CompositionBar component for horizontal stacked breakdown visualization
**Depends on**: Phase 22
**Requirements**: CHRT-01, CHRT-02, CHRT-03, CHRT-04, CHRT-05
**Success Criteria** (what must be TRUE):
  1. Chart palette tokens --wf-chart-1 through --wf-chart-5 render primary blue, indigo, blue-400, and slate tones (no gold or amber)
  2. Chart containers use white/slate-900 background with rounded-xl border and shadow-sm matching card aesthetic
  3. Chart headers show font-bold title with colored rounded-full legend dots replacing Recharts default legend
  4. Bar chart variants transition individual bars from muted to full opacity on group hover
  5. A new CompositionBar component renders a horizontal stacked bar with hover:brightness-90 segments and a color legend grid below
**Plans:** 2 plans
Plans:
- [ ] 23-01-PLAN.md — Sidebar chrome: dark tokens, active/hover states, group labels, status footer
- [ ] 23-02-PLAN.md — Header chrome: search input, bell, theme toggle, user chip

### Phase 28: Editor Sync & Gallery Validation
**Goal**: The editor UI matches the new wireframe aesthetic and all 86 wireframe components are confirmed working in both light and dark mode
**Depends on**: Phase 23, Phase 24, Phase 25, Phase 26, Phase 27
**Requirements**: EDIT-01, GAL-01, GAL-02
**Success Criteria** (what must be TRUE):
  1. ScreenManager sidebar displays the same dark slate background, typography, and spacing as the redesigned WireframeSidebar
  2. All gallery component previews render with the new visual design in both light and dark mode
  3. Client branding (financeiro-conta-azul #1B6B93) applied in the gallery passes the branding-override visual check
  4. npx tsc --noEmit reports zero errors after all phases
**Plans:** 2 plans
Plans:
- [ ] 23-01-PLAN.md — Sidebar chrome: dark tokens, active/hover states, group labels, status footer
- [ ] 23-02-PLAN.md — Header chrome: search input, bell, theme toggle, user chip

## Progress

**Execution Order:**
Phase 22 is the strict prerequisite. Phases 23-27 are independent of each other and can execute in any order after Phase 22. Phase 28 requires all prior phases complete.

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Documentation | v1.0 | 2/2 | Complete | 2026-03-07 |
| 2. Wireframe Comments | v1.0 | 3/3 | Complete | 2026-03-07 |
| 02.1. Melhoria e organizacao | v1.0 | 3/3 | Complete | 2026-03-07 |
| 02.2. Evolucao de Blocos | v1.0 | 3/3 | Complete | 2026-03-08 |
| 02.3. Reformulacao Visual | v1.0 | 4/4 | Complete | 2026-03-08 |
| 3. Wireframe Visual Editor | v1.0 | 4/4 | Complete | 2026-03-09 |
| 4. Branding Process | v1.0 | 3/3 | Complete | 2026-03-09 |
| 5. Technical Configuration | v1.0 | 2/2 | Complete | 2026-03-09 |
| 6. System Generation | v1.0 | 3/3 | Complete | 2026-03-09 |
| 7. Blueprint Infrastructure | v1.1 | 3/3 | Complete | 2026-03-09 |
| 8. Wireframe Design System | v1.1 | 3/3 | Complete | 2026-03-10 |
| 9. Component Library Expansion | v1.1 | 4/4 | Complete | 2026-03-10 |
| 10. Briefing & Blueprint Views | v1.1 | 3/3 | Complete | 2026-03-10 |
| 11. AI-Assisted Generation | v1.1 | 2/2 | Complete | 2026-03-10 |
| 12. Design Foundation | v1.2 | 1/1 | Complete | 2026-03-10 |
| 13. Layout Shell | v1.2 | 1/1 | Complete | 2026-03-10 |
| 14. Sidebar Navigation | v1.2 | 1/1 | Complete | 2026-03-10 |
| 15. Doc Rendering and TOC | v1.2 | 2/2 | Complete | 2026-03-10 |
| 16. Consistency Pass | v1.2 | 2/2 | Complete | 2026-03-10 |
| 17. Schema Foundation & Layout Restructure | v1.3 | 3/3 | Complete | 2026-03-11 |
| 18. Configurable Sidebar & Header | v1.3 | 3/3 | Complete | 2026-03-11 |
| 19. Filter Bar Expansion | v1.3 | 2/2 | Complete | 2026-03-11 |
| 20. Chart Type Expansion | v1.3 | 4/4 | Complete | 2026-03-11 |
| 21. Gallery Reorganization | v1.3 | 2/2 | Complete | 2026-03-11 |
| 22. Token Foundation | 2/2 | Complete    | 2026-03-11 | - |
| 23. Sidebar & Header Chrome | v1.4 | Complete    | 2026-03-11 | 2026-03-11 |
| 24. KPI Cards | 1/1 | Complete    | 2026-03-11 | - |
| 25. Table Components | 2/2 | Complete   | 2026-03-11 | - |
| 26. Filter Bar Enhancement | v1.4 | TBD | Not started | - |
| 27. Chart Palette & Composition | v1.4 | TBD | Not started | - |
| 28. Editor Sync & Gallery Validation | v1.4 | TBD | Not started | - |
