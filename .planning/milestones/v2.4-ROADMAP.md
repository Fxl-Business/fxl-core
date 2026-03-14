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
- ✅ **v2.3 Inline Editing UX** - Phases 54-57 (shipped 2026-03-13) — see milestones/v2.3-ROADMAP.md
- 🚧 **v2.4 Component Picker Preview Mode** - Phases 58-59 (in progress)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

### 🚧 v2.4 Component Picker Preview Mode (In Progress)

**Milestone Goal:** Adicionar modo preview ao ComponentPicker do Wireframe Builder, permitindo visualizar mini-renders reais de cada tipo de seção antes de adicionar ao blueprint.

## Phases

- [ ] **Phase 58: Preview Rendering Infrastructure** - Mini-renders funcionais via defaultProps() do registry + WireframeThemeProvider
- [ ] **Phase 59: Dialog Dual-Mode UX** - Toggle preview/compacto, grid layout, dialog maior, click behavior

## Phase Details

### Phase 58: Preview Rendering Infrastructure
**Goal**: Each section type renders a faithful mini-preview using its own registry defaultProps and the correct wireframe theme
**Depends on**: Nothing (first phase of milestone)
**Requirements**: PREV-01, PREV-04
**Success Criteria** (what must be TRUE):
  1. Calling `defaultProps()` from the section registry for any of the 28 section types produces valid props without runtime errors
  2. A mini-render of any section type displays inside a `WireframeThemeProvider` with correct --wf-* token styling (not raw unstyled DOM)
  3. The preview component is self-contained: no external data fetching, no Supabase calls, renders synchronously from props
  4. TypeScript compiles with zero errors (`tsc --noEmit`) across all preview-related files
**Plans**: TBD

### Phase 59: Dialog Dual-Mode UX
**Goal**: Operators can toggle between compact and preview mode in the section picker dialog, with the preview mode showing a 2-3 column grid of mini-renders and click-to-add behavior identical to compact mode
**Depends on**: Phase 58
**Requirements**: PICK-01, PICK-02, PICK-03, PICK-04, PREV-02, PREV-03
**Success Criteria** (what must be TRUE):
  1. Dialog opens in preview mode by default, showing a 2-3 column grid of section preview cards organized by category with vertical scroll
  2. A toggle control switches between preview and compact mode; both modes maintain category separators and scroll position is preserved per session
  3. Dialog is visually larger in preview mode to accommodate the grid (compact mode retains original dialog size)
  4. Clicking a preview card adds the section to the blueprint immediately — identical behavior to clicking in compact mode, no additional confirmation step
  5. All 28 section types appear in the preview grid; no type is missing or broken
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 58. Preview Rendering Infrastructure | v2.4 | 0/? | Not started | - |
| 59. Dialog Dual-Mode UX | v2.4 | 0/? | Not started | - |
