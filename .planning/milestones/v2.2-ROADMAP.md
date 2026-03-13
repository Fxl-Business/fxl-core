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
- 🚧 **v2.2 Wireframe Builder — Configurable Layout Components** - Phases 47-53 (in progress)

## Phases

### 🚧 v2.2 Wireframe Builder — Configurable Layout Components (In Progress)

**Milestone Goal:** Tornar sidebar, header e filter bar do wireframe totalmente configuráveis via visual editor, com suporte a widgets compostos na sidebar (workspace switcher, user menu) e filter bar editor por tela.

- [x] **Phase 47: Schema Foundation** - Extend SidebarConfig schema with SidebarWidget type in Zod and TypeScript (completed 2026-03-13)
- [x] **Phase 48: Header Render Wiring** - Wire all HeaderConfig fields to WireframeHeader renderer (completed 2026-03-13)
- [x] **Phase 49: Dashboard Mutation Infrastructure** - updateWorkingConfig helper + AdminToolbar Layout button group (completed 2026-03-13)
- [x] **Phase 50: Header Config Panel** - Sheet panel for all header toggles, brand label, and period type (completed 2026-03-13)
- [x] **Phase 51: Sidebar Widget Renderers** - SIDEBAR_WIDGET_REGISTRY + WorkspaceSwitcher and UserMenu widget components (completed 2026-03-13)
- [x] **Phase 52: Sidebar Config Panel** - Sheet panel for groups, footer text, screen assignment, and widget management (completed 2026-03-13)
- [x] **Phase 53: Filter Bar Editor** - Sheet panel for per-screen FilterOption[] CRUD with presets (completed 2026-03-13)

## Phase Details

### Phase 47: Schema Foundation
**Goal**: SidebarConfig schema extended with SidebarWidget discriminated union — all downstream TypeScript code compiles against the new types with zero any
**Depends on**: Nothing (first phase of milestone)
**Requirements**: INFRA-03
**Success Criteria** (what must be TRUE):
  1. `SidebarWidget` type and `SidebarWidgetType` union exist in `types/blueprint.ts` and are importable by any component
  2. `SidebarConfigSchema` in `lib/blueprint-schema.ts` includes `SidebarWidgetSchema` with `.passthrough()` so new widget fields survive a `BlueprintConfigSchema.parse()` round-trip
  3. The existing `financeiro-conta-azul` blueprint JSON passes `BlueprintConfigSchema.safeParse` with no errors after schema changes (backward compatibility confirmed)
  4. `npx tsc --noEmit` reports zero errors with the new types in place
**Plans**: 1 (47-01)

### Phase 48: Header Render Wiring
**Goal**: Every field in HeaderConfig is consumed by WireframeHeader — toggling showPeriodSelector, showUserIndicator, or any action field produces an immediate visible change in the wireframe chrome
**Depends on**: Phase 47
**Requirements**: HDR-01, HDR-02, HDR-03
**Success Criteria** (what must be TRUE):
  1. Operator sets `showPeriodSelector: false` in the blueprint config and the period selector disappears from the wireframe header without any other change
  2. Operator sets `showUserIndicator: false` and the user/role chip disappears from the wireframe header
  3. Operator sets any `actions.*` field to false and the corresponding action button disappears from the wireframe header
  4. All existing wireframe header renders are visually unchanged when HeaderConfig fields are undefined (backward compatibility)
**Plans**: 1 (48-01)

### Phase 49: Dashboard Mutation Infrastructure
**Goal**: Operators have a mutation helper for dashboard-level config and a clear Layout entry point in the AdminToolbar — the plumbing needed before any layout config panel can persist changes
**Depends on**: Phase 47
**Requirements**: INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):
  1. AdminToolbar shows a "Layout" button group (Sidebar, Header, Filtros) when wireframe is in edit mode — buttons are not visible in view mode
  2. Clicking each Layout button opens its corresponding panel Sheet (even if panels are stubs at this stage)
  3. `updateWorkingConfig()` helper mutates `workingConfig.sidebar` or `workingConfig.header` correctly and triggers a save cycle — no silent no-ops or screen-level data corruption
**Plans**: 1 (49-01)

### Phase 50: Header Config Panel
**Goal**: Operators can configure all header appearance options from a single Sheet panel — every toggle produces an immediately visible change in the wireframe header
**Depends on**: Phase 48, Phase 49
**Requirements**: HDR-04, HDR-05, HDR-06
**Success Criteria** (what must be TRUE):
  1. Operator opens Header Config Panel from AdminToolbar and sees Switch toggles for showLogo, showPeriodSelector, showUserIndicator, and each action (manage, share, export)
  2. Flipping any toggle in the panel immediately updates the wireframe header render (live preview while the Sheet is open)
  3. Operator sets a custom `brandLabel` in the panel and sees it replace the default config.label in the header
  4. Operator sets `periodType` (mensal/anual) in the panel and the period selector in the header reflects that value
  5. Changes are persisted when the operator saves the blueprint — reloading the wireframe restores the configured header state
**Plans**: 1 (50-01)

### Phase 51: Sidebar Widget Renderers
**Goal**: WorkspaceSwitcher and UserMenu widgets render correctly in the wireframe sidebar — each widget appears in its designated zone and degrades gracefully when sidebar is in rail (collapsed) mode
**Depends on**: Phase 47
**Requirements**: SIDE-04, SIDE-05
**Success Criteria** (what must be TRUE):
  1. When `widgets` array in SidebarConfig contains a workspace-switcher entry, a dropdown chip with label and chevron appears in the sidebar header zone
  2. When `widgets` array contains a user-menu entry, an avatar initials chip with name and role appears in the sidebar footer zone — visually distinct from the plain text status footer
  3. In sidebar rail (collapsed) mode, each widget renders as an icon-only button using its registered icon from SIDEBAR_WIDGET_REGISTRY
  4. When no widgets are configured, the sidebar renders exactly as before (no visual regression)
**Plans**: 1 (51-01)

### Phase 52: Sidebar Config Panel
**Goal**: Operators can manage sidebar groups, assign screens to groups, edit footer text, and add or remove sidebar widgets — all from a single Sheet panel
**Depends on**: Phase 49, Phase 51
**Requirements**: SIDE-01, SIDE-02, SIDE-03
**Success Criteria** (what must be TRUE):
  1. Operator opens Sidebar Config Panel and can type a new footer text that immediately updates the sidebar footer in the wireframe
  2. Operator can create a new sidebar group, rename it, and delete it — group list in the wireframe sidebar reflects changes live
  3. Operator can assign a screen to a group via the panel — the screen appears under that group in the sidebar nav; each screen belongs to at most one group
  4. Operator can add a WorkspaceSwitcher or UserMenu widget via the widget picker — the widget appears in the wireframe sidebar after adding
  5. Changes survive a blueprint save-and-reload cycle
**Plans**: 1 (52-01)

### Phase 53: Filter Bar Editor
**Goal**: Operators can add, remove, and configure any FilterOption in a screen's sticky filter bar from a dedicated Sheet panel — filter bar changes are scoped strictly to the current screen
**Depends on**: Phase 49
**Requirements**: FILT-01, FILT-02, FILT-03, FILT-04, FILT-05
**Success Criteria** (what must be TRUE):
  1. Operator opens Filter Bar Editor from AdminToolbar for the current screen and sees the existing FilterOption[] rendered as an editable list
  2. Operator adds a new filter by entering key, label, filterType, and options — the new filter chip appears in the screen's sticky filter bar
  3. Operator removes an existing filter from the list — the filter chip disappears from the sticky filter bar
  4. Operator edits filter label, filterType (any of the 5 variants: date-range, multi-select, search, toggle, period-presets), and options inline without leaving the panel
  5. Operator clicks a preset button (Período, Empresa, Produto, Status, Responsável) and a pre-configured FilterOption is added to the screen's filter bar with one click
  6. Filter edits are scoped to the current screen only — no other screen's filters are affected
**Plans**: 1 (53-01)

## Progress

**Execution Order:**
Phases execute in dependency order: 47 → 48 → 49 → 50 → 51 → 52 → 53

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 47. Schema Foundation | 1/1 | Complete    | 2026-03-13 | - |
| 48. Header Render Wiring | 1/1 | Complete    | 2026-03-13 | - |
| 49. Dashboard Mutation Infrastructure | 1/1 | Complete    | 2026-03-13 | - |
| 50. Header Config Panel | 1/1 | Complete    | 2026-03-13 | - |
| 51. Sidebar Widget Renderers | 1/1 | Complete    | 2026-03-13 | - |
| 52. Sidebar Config Panel | 1/1 | Complete    | 2026-03-13 | - |
| 53. Filter Bar Editor | 1/1 | Complete    | 2026-03-13 | - |
