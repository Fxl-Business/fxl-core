# Roadmap: FXL Core

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) -- see milestones/v1.0-ROADMAP.md
- **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) -- see milestones/v1.1-ROADMAP.md
- **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) -- see milestones/v1.2-ROADMAP.md
- **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) -- see milestones/v1.3-ROADMAP.md
- **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) -- see milestones/v1.4-ROADMAP.md
- **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) -- see milestones/v1.5-ROADMAP.md
- **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) -- see milestones/v1.6-ROADMAP.md
- **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) -- see milestones/v2.0-ROADMAP.md
- **v2.1 Dynamic Data Layer** - Phases 43-46 (shipped 2026-03-13) -- see milestones/v2.1-ROADMAP.md
- **v2.2 Wireframe Builder -- Configurable Layout Components** - Phases 47-53 (shipped 2026-03-13) -- see milestones/v2.2-ROADMAP.md
- **v2.3 Inline Editing UX** - Phases 54-57 (shipped 2026-03-13) -- see milestones/v2.3-ROADMAP.md
- **v2.4 Component Picker Preview Mode** - Phases 58-59 (shipped 2026-03-14) -- see milestones/v2.4-ROADMAP.md
- **v3.0 Reorganizacao Modular** - Phases 60-63 (shipped 2026-03-17) -- see milestones/v3.0-ROADMAP.md
- **v3.1 Multi-tenancy** - Phases 64-67 (shipped 2026-03-17) -- see milestones/v3.1-ROADMAP.md
- **v3.2 FXL SDK Skill** - Phases 68-69 (shipped 2026-03-17) -- see milestones/v3.2-ROADMAP.md

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v3.3 Generic Connector Module

**Milestone Goal:** Criar modulo generico no FXL Core que consome qualquer spoke via contrato padronizado (FxlAppManifest), renderizando entidades em tabelas/detail views e widgets (KPI, chart, table, list) com UI generica. Roteamento dinamico via catch-all `/apps/:appId/*`.

**Design spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Section 6.6)

## Phases

- [ ] **Phase 70: Core Connector Infrastructure** - Module structure, types, service, icon-map, hooks
- [ ] **Phase 71: Connector UI Components** - Entity views, widget components, router, dashboard, cards, extensions
- [ ] **Phase 72: Integration Verification** - tsc --noEmit, npm run build, route/sidebar verification

## Phase Details

### Phase 70: Core Connector Infrastructure
**Goal**: Create the connector module foundation: registration, types, API service, icon mapping, hooks
**Depends on**: Nothing (first phase of v3.3)
**Requirements**: [CON-01, CON-02, CON-03, CON-04, CON-05]
**Success Criteria** (what must be TRUE):
  1. MODULE_IDS.CONNECTOR exists and module is in MODULE_REGISTRY
  2. Contract types re-exported + ConnectorConfig type defined
  3. connector-service.ts handles manifest/entity/widget fetching with 5s timeout + error handling
  4. icon-map.ts maps ~100 common lucide icons with Box fallback
  5. useConnector and useConnectorList hooks work
**Plans:** 0/1 plans complete

### Phase 71: Connector UI Components
**Goal**: Create all UI components: entity rendering, widgets, dynamic router, dashboard, cards, home extension
**Depends on**: Phase 70
**Requirements**: [CON-06, CON-07, CON-08, CON-09, CON-10, CON-11, CON-12]
**Success Criteria** (what must be TRUE):
  1. EntityTable renders fields based on FieldDefinition type
  2. All 4 widget types render correctly
  3. ConnectorRouter resolves sub-routes from manifest entities
  4. ConnectorDashboard shows widgets grid
  5. ConnectorCard appears in Home via extension slot
**Plans:** 0/1 plans complete

### Phase 72: Integration Verification
**Goal**: Verify everything compiles and builds correctly
**Depends on**: Phase 71
**Requirements**: [CON-13]
**Success Criteria** (what must be TRUE):
  1. `npx tsc --noEmit` zero errors
  2. `npm run build` completes successfully
  3. Connector route `/apps/*` registered in router
**Plans:** 0/1 plans complete

## Progress

**Execution Order:** 70 -> 71 -> 72

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 70. Core Connector Infrastructure | 0/1 | Pending | - |
| 71. Connector UI Components | 0/1 | Pending | - |
| 72. Integration Verification | 0/1 | Pending | - |
