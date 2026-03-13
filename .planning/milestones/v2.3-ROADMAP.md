# Roadmap: FXL Core

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) — see milestones/v1.0-ROADMAP.md
- ✅ **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) — see milestones/v1.1-ROADMAP.md
- ✅ **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) — see milestones/v1.2-ROADMAP.md
- ✅ **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) — see milestones/v1.3-ROADMAP.md
- ✅ **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) — see milestones/v1.4-ROADMAP.md
- ✅ **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) — see milestones/v1.5-ROADMAP.md
- ✅ **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) — see milestones/v1.6-ROADMAP.md
- ✅ **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) — see milestones/v2.0-ROADMAP.md
- ✅ **v2.1 Dynamic Data Layer** - Phases 43-46 (shipped 2026-03-13) — see milestones/v2.1-ROADMAP.md
- ✅ **v2.2 Wireframe Builder — Configurable Layout Components** - Phases 47-53 (shipped 2026-03-13) — see milestones/v2.2-ROADMAP.md
- 🚧 **v2.3 Inline Editing UX** - Phases 54-57 (in progress)

## Phases

### 🚧 v2.3 Inline Editing UX (In Progress)

**Milestone Goal:** Replace Sheet panels (Header, Sidebar, Filtros) with inline click-to-edit, where operators click directly on the component to edit it — same pattern used for content blocks.

- [x] **Phase 54: Header Inline Editing** - Operator clicks header elements to open contextual PropertyPanel forms
- [x] **Phase 55: Sidebar Inline Editing** - Operator clicks sidebar groups, footer, and widgets to edit inline
- [x] **Phase 56: Filter Inline Editing** - Operator clicks filter chips to configure, and can add/remove filters in edit mode
- [x] **Phase 57: Cleanup & Consolidation** - Remove Sheet panels and AdminToolbar Layout buttons, leaving only click-to-edit

## Phase Details

### Phase 54: Header Inline Editing
**Goal**: Operators can click on header elements to edit them directly, without navigating to a separate panel
**Depends on**: Phase 53 (v2.2 HeaderConfigPanel exists as reference; reuse mutation helpers)
**Requirements**: HDR-10, HDR-11, HDR-12
**Success Criteria** (what must be TRUE):
  1. Operator in edit mode sees a visual selection ring on the header area when hovering or clicking it
  2. Operator can click on individual header elements (logo/brand, period selector, user indicator, action buttons) and a contextual PropertyPanel opens on the right side
  3. Each element's PropertyPanel shows only that element's config fields — not the full header form
  4. Changes made in the PropertyPanel reflect immediately in the live header preview (using existing updateWorkingConfig())
**Plans:** 2 plans

Plans:
- [x] 54-01-PLAN.md — Define header element types and create per-element property forms
- [x] 54-02-PLAN.md — Wire clickable header zones, HeaderPropertyPanel, and WireframeViewer state

### Phase 55: Sidebar Inline Editing
**Goal**: Operators can click on sidebar groups, footer, and widgets to edit them inline — no separate Sheet panel needed
**Depends on**: Phase 54
**Requirements**: SIDE-10, SIDE-11, SIDE-12, SIDE-13
**Success Criteria** (what must be TRUE):
  1. Operator in edit mode can click on a sidebar group label and rename it directly (inline input or PropertyPanel)
  2. Operator in edit mode can click on the sidebar footer area and edit footer text via a contextual PropertyPanel
  3. Operator in edit mode can click on a sidebar widget (WorkspaceSwitcher, UserMenu) to open its config in a contextual PropertyPanel
  4. Operator in edit mode sees + and delete controls for adding/removing widgets and groups without opening a separate panel
**Plans:** 2 plans

Plans:
- [x] 55-01-PLAN.md — Sidebar property forms + SidebarPropertyPanel infrastructure
- [x] 55-02-PLAN.md — Wire clickable sidebar elements + inline add/delete controls in WireframeViewer

### Phase 56: Filter Inline Editing
**Goal**: Operators can click on filter chips to configure them, and can add/remove filters directly from the filter bar in edit mode
**Depends on**: Phase 55
**Requirements**: FILT-10, FILT-11, FILT-12, FILT-13
**Success Criteria** (what must be TRUE):
  1. Operator in edit mode can click on any filter chip in the sticky filter bar and a contextual PropertyPanel opens with that filter's config (filterType, label, options)
  2. Operator in edit mode sees a "+" button in the filter bar that opens an add-filter flow
  3. The add-filter flow offers the 5 BI presets (Periodo, Empresa, Produto, Status, Responsavel) as starting points
  4. Operator in edit mode sees a delete button on each filter chip to remove that filter from the screen's FilterOption[]
**Plans:** 2 plans

Plans:
- [x] 56-01-PLAN.md — Filter chip click-to-edit and delete buttons with FilterPropertyPanel
- [x] 56-02-PLAN.md — Add-filter "+" button with 5 BI preset picker

### Phase 57: Cleanup & Consolidation
**Goal**: The codebase is clean — Sheet panel components are removed, layoutPanel state is gone, and the AdminToolbar no longer has a Layout button group
**Depends on**: Phase 56
**Requirements**: CLN-01, CLN-02, CLN-03
**Success Criteria** (what must be TRUE):
  1. AdminToolbar no longer shows a Layout button group (Sidebar / Header / Filtros) — edit mode is entered by clicking directly on each component
  2. HeaderConfigPanel, SidebarConfigPanel, and FilterBarEditor as standalone Sheet panels no longer exist in the codebase — their form logic lives inside PropertyPanel forms
  3. layoutPanel state variable is removed from WireframeViewer and no references remain — TypeScript confirms zero errors
**Plans:** 1 plan

Plans:
- [x] 57-01-PLAN.md — Remove AdminToolbar Layout buttons, delete Sheet panels, clean layoutPanel state

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| All phases 1-53 shipped | v1.0-v2.2 | 100% | Complete | 2026-03-13 |
| 54. Header Inline Editing | v2.3 | 2/2 | Complete | 2026-03-13 |
| 55. Sidebar Inline Editing | v2.3 | 2/2 | Complete | 2026-03-13 |
| 56. Filter Inline Editing | v2.3 | 2/2 | Complete | 2026-03-13 |
| 57. Cleanup & Consolidation | v2.3 | 1/1 | Complete | 2026-03-13 |
