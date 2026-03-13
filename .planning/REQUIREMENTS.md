# Requirements: FXL Core v2.2

**Defined:** 2026-03-13
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v2.2 Requirements

Requirements for Wireframe Builder — Configurable Layout Components.

### Infrastructure

- [ ] **INFRA-01**: Operator can mutate dashboard-level config (sidebar, header) via updateWorkingConfig() helper following same pattern as updateWorkingScreen()
- [ ] **INFRA-02**: Operator sees "Layout" button group in AdminToolbar (edit mode) with entry points for Sidebar, Header, and Filter panels
- [x] **INFRA-03**: SidebarConfig schema extended with widget fields (headerWidget, workspaceName, footerWidget, showSearch) in both Zod and TypeScript — backward compatible with existing blueprints

### Header

- [x] **HDR-01**: Operator can toggle showPeriodSelector in header and see period selector appear/disappear in the wireframe header
- [x] **HDR-02**: Operator can toggle showUserIndicator in header and see user/role chip appear/disappear in the wireframe header
- [x] **HDR-03**: Operator can toggle actions (manage, share, export) individually in header and see action buttons appear/disappear
- [ ] **HDR-04**: Operator can open Header Config Panel (Sheet) from AdminToolbar and configure all header toggles visually
- [ ] **HDR-05**: Operator can set a custom brandLabel in header that overrides the default config.label
- [ ] **HDR-06**: Operator can set a dashboard-level periodType (mensal/anual) in header config that the period selector respects

### Sidebar

- [ ] **SIDE-01**: Operator can edit sidebar footer text via Sidebar Config Panel
- [ ] **SIDE-02**: Operator can create, rename, and delete sidebar groups via Sidebar Config Panel
- [ ] **SIDE-03**: Operator can assign screens to groups via checkbox selection in Sidebar Config Panel
- [ ] **SIDE-04**: Operator can enable Workspace Switcher widget in sidebar header — renders as dropdown chip with label + chevron (decorative, shadcn sidebar-07 style)
- [ ] **SIDE-05**: Operator can enable User Menu widget in sidebar footer — renders as avatar initials + name/role chip (alternate to status footer)

### Filter Bar

- [ ] **FILT-01**: Operator can open Filter Bar Editor Panel for the current screen (Sheet) from edit mode
- [ ] **FILT-02**: Operator can add a new filter to the current screen's sticky filter bar (key, label, filterType, options)
- [ ] **FILT-03**: Operator can remove existing filters from the current screen's sticky filter bar
- [ ] **FILT-04**: Operator can edit filter label, filterType, and options inline in the Filter Bar Editor
- [ ] **FILT-05**: Operator can quick-add common BI filter presets (Período, Empresa, Produto, Status, Responsável) with one click

## Future Requirements

### Sidebar (v2.3+)

- **SIDE-06**: Search widget in sidebar nav (decorative disabled input above screen list)
- **SIDE-07**: Account Selector widget in sidebar header (secondary slot below workspace switcher)
- **SIDE-08**: Sidebar icon assignment via sidebar config panel
- **SIDE-09**: Sidebar badge count configuration per screen

### Header (v2.3+)

- **HDR-07**: Per-screen header config overrides

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop screens between sidebar groups | DnD context layering complexity — multi-select checkbox is sufficient |
| Replace custom sidebar with shadcn SidebarProvider | CSS var collision between --sidebar-* and --wf-sidebar-* — design reference only |
| Live filter logic (filtering actual section content) | Wireframes use mock data — filters are interactive decorations, not functional |
| Per-screen header config overrides | Schema complexity — dashboard-level config is the right boundary |
| Sidebar widget drag reordering between zones | Fixed zone positions (header/nav/footer) are sufficient for wireframe demos |
| Mobile sidebar drawer mode | Explicitly out of scope per PROJECT.md |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 49 | Pending |
| INFRA-02 | Phase 49 | Pending |
| INFRA-03 | Phase 47 | Complete |
| HDR-01 | Phase 48 | Complete |
| HDR-02 | Phase 48 | Complete |
| HDR-03 | Phase 48 | Complete |
| HDR-04 | Phase 50 | Pending |
| HDR-05 | Phase 50 | Pending |
| HDR-06 | Phase 50 | Pending |
| SIDE-01 | Phase 52 | Pending |
| SIDE-02 | Phase 52 | Pending |
| SIDE-03 | Phase 52 | Pending |
| SIDE-04 | Phase 51 | Pending |
| SIDE-05 | Phase 51 | Pending |
| FILT-01 | Phase 53 | Pending |
| FILT-02 | Phase 53 | Pending |
| FILT-03 | Phase 53 | Pending |
| FILT-04 | Phase 53 | Pending |
| FILT-05 | Phase 53 | Pending |

**Coverage:**
- v2.2 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
