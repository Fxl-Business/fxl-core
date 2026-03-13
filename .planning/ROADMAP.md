# Roadmap: FXL Core

## Milestones

- v1.0 MVP -- Phases 1-6 (shipped 2026-03-09)
- v1.1 Wireframe Evolution -- Phases 7-11 (shipped 2026-03-10)
- v1.2 Visual Redesign -- Phases 12-16 (shipped 2026-03-11)
- v1.3 Builder & Components -- Phases 17-21 (shipped 2026-03-11)
- v1.4 Wireframe Visual Redesign -- Phases 22-28 (shipped 2026-03-13)
- v1.5 Modular Foundation & Knowledge Base -- Phases 29-33 (shipped 2026-03-13)
- v1.6 12 Novos Graficos -- Phases 34-37 (in progress)

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

<details>
<summary>v1.4 Wireframe Visual Redesign (Phases 22-28) -- SHIPPED 2026-03-13</summary>

- [x] Phase 22: Token Foundation (2/2 plans) -- completed 2026-03-11
- [x] Phase 23: Sidebar & Header Chrome (2/2 plans) -- completed 2026-03-11
- [x] Phase 24: KPI Cards (1/1 plan) -- completed 2026-03-11
- [x] Phase 25: Table Components (2/2 plans) -- completed 2026-03-11
- [x] Phase 26: Filter Bar Enhancement (1/1 plan) -- completed 2026-03-11
- [x] Phase 27: Chart Palette & Composition (2/2 plans) -- completed 2026-03-11
- [x] Phase 28: Editor Sync & Gallery Validation (2/2 plans) -- completed 2026-03-13

Full details: [milestones/v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md)

</details>

<details>
<summary>v1.5 Modular Foundation & Knowledge Base (Phases 29-33) -- SHIPPED 2026-03-13</summary>

- [x] Phase 29: Module Foundation & Registry (2/2 plans) -- completed 2026-03-13
- [x] Phase 30: Supabase Migrations & Data Layer (2/2 plans) -- completed 2026-03-13
- [x] Phase 31: Knowledge Base Module (3/3 plans) -- completed 2026-03-13
- [x] Phase 32: Task Management Module (3/3 plans) -- completed 2026-03-13
- [x] Phase 33: Home Page & Cross-Module Integration (3/3 plans) -- completed 2026-03-13

Full details: [milestones/v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md)

</details>

### v1.6 12 Novos Graficos (In Progress)

**Milestone Goal:** Expandir a biblioteca de componentes do wireframe builder com 12 novos tipos de grafico/secao para cobrir mais cenarios de BI financeiro/operacional.

- [ ] **Phase 34: Wave 1 — ChartType Sub-Variants** - 7 new chartType values via Extension Point A (4-point atomic sync per chart)
- [ ] **Phase 35: Wave 2 — Standalone Section Types** - 4 new standalone sections via Extension Point B (5-file checklist per type)
- [ ] **Phase 36: Wave 3 — Sankey Diagram** - Sankey as final standalone section with pre-build Recharts export verification
- [ ] **Phase 37: Finalization — Gallery & Cross-Cutting** - ComponentGallery updated with all 12 new types and mock data

## Phase Details

### Phase 34: Wave 1 — ChartType Sub-Variants
**Goal**: All 7 new chartType values are available in the wireframe editor and render correctly — Grouped Bar, Bullet Chart, Step Line, Lollipop, Range Bar, Bump Chart, and Polar/Rose.
**Depends on**: Nothing (first phase of v1.6)
**Requirements**: CHART-01, CHART-02, CHART-03, CHART-04, CHART-05, CHART-06, CHART-07, XCUT-01, XCUT-02, XCUT-03, XCUT-05
**Success Criteria** (what must be TRUE):
  1. A blueprint section with chartType "grouped-bar" renders multiple side-by-side bars per category with tooltip and legend using chartColors resolved hex values (not CSS vars)
  2. A blueprint section with chartType "bullet" renders a horizontal bar with a ReferenceLine target marker and no chart animation on any keystroke in the editor
  3. A blueprint section with chartType "step-line" renders a line with stepAfter interpolation, chartType "lollipop" renders a thin bar stick with scatter dot heads, and chartType "polar" renders bars in polar coordinates via RadialBarChart
  4. A blueprint section with chartType "range-bar" renders CSS-flex rows with start/end positions (not from zero) and chartType "bump" renders multi-line with reversed Y-axis and end-of-line rank labels
  5. All 7 charts render without visual breakage in both light and dark wireframe mode, and tsc --noEmit passes with zero errors after each chart is added
**Plans**: TBD

Plans:
- [ ] 34-01: TBD

### Phase 35: Wave 2 — Standalone Section Types
**Goal**: Four new standalone section types are registered in the section registry and available in the editor — Pie Chart, Progress Grid, Heatmap, and Sparkline Grid.
**Depends on**: Phase 34
**Requirements**: SECT-01, SECT-02, SECT-03, SECT-04, XCUT-06
**Success Criteria** (what must be TRUE):
  1. A blueprint screen can contain a "pie-chart" section that renders a full-circle pizza with labeled slices and a legend using chartColors resolved hex values
  2. A blueprint screen can contain a "progress-grid" section that renders horizontal progress bars with current value, target marker line, and max value per metric row
  3. A blueprint screen can contain a "heatmap" section that renders a CSS grid matrix with color-mix intensity encoding and cell hover tooltips using --wf-* tokens in both light and dark mode
  4. A blueprint screen can contain a "sparkline-grid" section that renders a grid of axes-hidden mini LineChart instances with a label and value per cell, each ResponsiveContainer sized correctly inside a CSS grid cell
  5. section-registry.test.ts count assertion passes at 27 (up from 23), tsc --noEmit passes with zero errors, and Zod schemas for all 4 types are defined in blueprint-schema.ts (not in renderer files)
**Plans**: TBD

Plans:
- [ ] 35-01: TBD

### Phase 36: Wave 3 — Sankey Diagram
**Goal**: The Sankey diagram is available as a standalone section type, completing the milestone's 12-chart expansion, with the Recharts Sankey named export verified before any component code is written.
**Depends on**: Phase 35
**Requirements**: SECT-05
**Success Criteria** (what must be TRUE):
  1. Before writing SankeyComponent.tsx, the CLI check `node -e "const r = require('./node_modules/recharts'); console.log(!!r.Sankey)"` returns true (or fallback plan is activated)
  2. A blueprint screen can contain a "sankey" section that renders proportional flow between nodes with links defined as integer array indices (not string names) and node colors from chartColors
  3. section-registry.test.ts count assertion passes at 28, tsc --noEmit passes with zero errors, and the Sankey defaultProps hardcode integer indices with an inline comment documenting the constraint
**Plans**: TBD

Plans:
- [ ] 36-01: TBD

### Phase 37: Finalization — Gallery & Cross-Cutting
**Goal**: The ComponentGallery is fully synchronized with all 12 new chart and section types, each with realistic mock data, confirming the milestone is visually complete.
**Depends on**: Phase 36
**Requirements**: XCUT-04
**Success Criteria** (what must be TRUE):
  1. The ComponentGallery page shows preview cards for all 12 new types (Grouped Bar, Bullet, Step Line, Lollipop, Range Bar, Bump, Polar, Pie, Heatmap, Sparkline Grid, Progress Grid, Sankey) with representative mock data
  2. All 12 gallery previews render without errors in both light and dark mode of the wireframe viewer
  3. tsc --noEmit passes with zero errors across the entire codebase after gallery additions
**Plans**: TBD

Plans:
- [ ] 37-01: TBD

## Progress

**Execution Order:** 34 → 35 → 36 → 37

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-6 | v1.0 | 27/27 | Complete | 2026-03-09 |
| 7-11 | v1.1 | 15/15 | Complete | 2026-03-10 |
| 12-16 | v1.2 | 7/7 | Complete | 2026-03-11 |
| 17-21 | v1.3 | 14/14 | Complete | 2026-03-11 |
| 22-28 | v1.4 | 12/12 | Complete | 2026-03-13 |
| 29-33 | v1.5 | 14/14 | Complete | 2026-03-13 |
| 34. Wave 1 ChartType Sub-Variants | v1.6 | 0/TBD | Not started | - |
| 35. Wave 2 Standalone Section Types | v1.6 | 0/TBD | Not started | - |
| 36. Wave 3 Sankey Diagram | v1.6 | 0/TBD | Not started | - |
| 37. Finalization Gallery & Cross-Cutting | v1.6 | 0/TBD | Not started | - |
