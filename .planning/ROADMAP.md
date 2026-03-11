# Roadmap: FXL Core

## Milestones

- v1.0 MVP -- Phases 1-6 (shipped 2026-03-09)
- v1.1 Wireframe Evolution -- Phases 7-11 (shipped 2026-03-10)
- v1.2 Visual Redesign -- Phases 12-16 (shipped 2026-03-11)
- v1.3 Builder & Components -- Phases 17-21 (in progress)

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

### v1.3 Builder & Components (In Progress)

**Milestone Goal:** Expand the wireframe builder with correct layout hierarchy, blueprint-driven sidebar/header/filter bar, massive chart repertoire, and reorganized component gallery.

- [x] **Phase 17: Schema Foundation & Layout Restructure** - Types, Zod schemas, layout hierarchy (header above sidebar), softer wireframe palette (completed 2026-03-11)
- [x] **Phase 18: Configurable Sidebar & Header** - Blueprint-driven sidebar and header renderers with all visual features (completed 2026-03-11)
- [ ] **Phase 19: Filter Bar Expansion** - Five new filter type renderers (date-range, multi-select, search, period presets, boolean toggle)
- [ ] **Phase 20: Chart Type Expansion** - Six new chart types/variants (stacked-bar, stacked-area, horizontal-bar, bubble, gauge, composed)
- [ ] **Phase 21: Gallery Reorganization** - Registry-driven gallery with thematic sections and all new components visible

## Phase Details

### Phase 17: Schema Foundation & Layout Restructure
**Goal**: The type system, Zod schemas, and layout hierarchy are correct and stable so all downstream phases build on solid ground
**Depends on**: Phase 16 (v1.2 complete)
**Requirements**: VIS-01, LAYOUT-01, LAYOUT-02, SIDE-01, HEAD-01, FILT-01
**Success Criteria** (what must be TRUE):
  1. Wireframe viewer renders with header full-width above sidebar (not beside it)
  2. "Gerenciar" action lives in the header area, not in the sidebar
  3. Wireframe components use softer gray palette (no harsh blacks in cards, tables, section borders)
  4. BlueprintConfig schema accepts optional SidebarConfig and HeaderConfig at dashboard level (not screen level)
  5. FilterOption type supports a filterType discriminator field that defaults to 'select' for backward compatibility
**Plans**: 3 plans

Plans:
- [ ] 17-01-PLAN.md -- Fix --wf-border CSS token alias (VIS-01)
- [ ] 17-02-PLAN.md -- Restructure layout: full-width header above sidebar, move Gerenciar (LAYOUT-01, LAYOUT-02)
- [ ] 17-03-PLAN.md -- Extend TypeScript types and Zod schemas with SidebarConfig, HeaderConfig, filterType (SIDE-01, HEAD-01, FILT-01)

### Phase 18: Configurable Sidebar & Header
**Goal**: Operators see a fully configurable dashboard shell (sidebar + header) driven entirely by blueprint config
**Depends on**: Phase 17
**Requirements**: SIDE-02, SIDE-03, SIDE-04, SIDE-05, SIDE-06, SIDE-07, HEAD-02, HEAD-03, HEAD-04, HEAD-05
**Success Criteria** (what must be TRUE):
  1. Sidebar renders icons next to each menu item from BlueprintScreen.icon field
  2. Sidebar displays grouped sections with labeled headings and collapses to an icon-only rail
  3. Sidebar shows badge/notification counts on items and footer text (version/environment) at the bottom
  4. Header displays the client logo/brand and a period selector driven by config
  5. Header renders user/role indicator and action buttons (manage, share, export)
**Plans**: 3 plans

Plans:
- [ ] 18-01-PLAN.md -- Extend SidebarConfig, HeaderConfig, BlueprintScreen types and Zod schemas + 7 test cases (SIDE-03, SIDE-05, HEAD-02/03/04/05)
- [ ] 18-02-PLAN.md -- Sidebar collapse rail, groups rendering, badge pill, footer from config (SIDE-02, SIDE-03, SIDE-04, SIDE-05, SIDE-06, SIDE-07)
- [ ] 18-03-PLAN.md -- WireframeHeader logo, user chip, action buttons, wire in WireframeViewer (HEAD-02, HEAD-03, HEAD-04, HEAD-05)

### Phase 19: Filter Bar Expansion
**Goal**: The filter bar supports all common BI filter patterns so blueprint authors can configure rich filtering without custom code
**Depends on**: Phase 17
**Requirements**: FILT-02, FILT-03, FILT-04, FILT-05, FILT-06
**Success Criteria** (what must be TRUE):
  1. Filter bar renders a date range picker with calendar widget when filterType is 'date-range'
  2. Filter bar renders a multi-select dropdown when filterType is 'multi-select'
  3. Filter bar renders a text search input when filterType is 'search'
  4. Date range filter offers quick-select period presets (last 7 days, last month, YTD, etc.)
  5. Filter bar renders a boolean toggle switch when filterType is 'toggle'
**Plans**: TBD

### Phase 20: Chart Type Expansion
**Goal**: The chart library covers the standard BI dashboard repertoire so wireframes can represent any common data visualization
**Depends on**: Phase 17
**Requirements**: CHART-01, CHART-02, CHART-03, CHART-04, CHART-05, CHART-06
**Success Criteria** (what must be TRUE):
  1. ChartRenderer renders stacked-bar, stacked-area, and horizontal-bar variants with correct axis orientation and stacking
  2. ChartRenderer renders a bubble chart variant (scatter with size dimension) with properly scaled circles
  3. A gauge-chart section type renders a radial gauge with target zones and current value indicator
  4. ChartRenderer renders a composed chart with configurable multi-series (mixed bar + line + area in one chart)
  5. All new chart types respect --wf-* design tokens and client branding chartColors
**Plans**: TBD

### Phase 21: Gallery Reorganization
**Goal**: The component gallery is organized by thematic sections and auto-populated from the registry so new components appear without manual gallery updates
**Depends on**: Phase 18, Phase 19, Phase 20
**Requirements**: GAL-01, GAL-02
**Success Criteria** (what must be TRUE):
  1. Gallery displays components grouped into thematic sections (charts, layout/shell, data display, inputs/filters, etc.)
  2. All new chart types from Phase 20 appear in the gallery with representative mock data
  3. Sidebar, header, and filter bar previews appear in a dedicated shell/layout section of the gallery
**Plans**: TBD

## Progress

**Execution Order:**
Phases 18, 19, 20 can execute in parallel after Phase 17. Phase 21 requires 18+19+20 complete.

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
| 17. Schema Foundation & Layout Restructure | 3/3 | Complete    | 2026-03-11 | - |
| 18. Configurable Sidebar & Header | 3/3 | Complete   | 2026-03-11 | - |
| 19. Filter Bar Expansion | v1.3 | 0/0 | Not started | - |
| 20. Chart Type Expansion | v1.3 | 0/0 | Not started | - |
| 21. Gallery Reorganization | v1.3 | 0/0 | Not started | - |
