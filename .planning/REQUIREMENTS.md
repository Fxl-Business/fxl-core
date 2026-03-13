# Requirements: FXL Core v2.3

**Defined:** 2026-03-13
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v2.3 Requirements

Requirements for Inline Editing UX — Click-to-Edit para Header, Sidebar e Filtros.

### Header Inline Editing

- [ ] **HDR-10**: Operator can click on the header area in edit mode and see a visual selection indicator (matching block selection pattern)
- [ ] **HDR-11**: Operator can click on individual header elements (logo, period selector, user indicator, action buttons) to open a contextual PropertyPanel with that element's config
- [ ] **HDR-12**: Header inline editing reuses the existing PropertyPanel Sheet pattern (right-side drawer) with element-specific forms

### Sidebar Inline Editing

- [ ] **SIDE-10**: Operator can click on sidebar groups to rename them inline
- [ ] **SIDE-11**: Operator can click on sidebar footer to edit footer text inline
- [ ] **SIDE-12**: Operator can click on sidebar widgets (WorkspaceSwitcher, UserMenu) to configure them via contextual PropertyPanel
- [ ] **SIDE-13**: Operator can add/remove sidebar widgets and groups via contextual controls (+ button, delete button) visible in edit mode

### Filter Inline Editing

- [ ] **FILT-10**: Operator can click on a filter chip in the sticky filter bar to open its config in a contextual PropertyPanel
- [ ] **FILT-11**: Operator can add new filters via a "+" button in the filter bar (visible in edit mode)
- [ ] **FILT-12**: Operator can remove filters via a delete button on each chip (visible in edit mode)
- [ ] **FILT-13**: Filter presets (Periodo, Empresa, Produto, Status, Responsavel) available via the add-filter flow

### Cleanup

- [ ] **CLN-01**: AdminToolbar Layout button group (Sidebar/Header/Filtros) removed — editing triggered by click on component
- [ ] **CLN-02**: Sheet panel components (HeaderConfigPanel, SidebarConfigPanel, FilterBarEditor as standalone panels) replaced by inline PropertyPanel forms
- [ ] **CLN-03**: layoutPanel state variable removed from WireframeViewer (no longer needed)

## Future Requirements

### Sidebar (v2.4+)

- **SIDE-06**: Search widget in sidebar nav (decorative disabled input above screen list)
- **SIDE-07**: Account Selector widget in sidebar header (secondary slot below workspace switcher)
- **SIDE-08**: Sidebar icon assignment via inline editing
- **SIDE-09**: Sidebar badge count configuration per screen

### Header (v2.4+)

- **HDR-07**: Per-screen header config overrides

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop header elements to reorder | Fixed layout positions sufficient for wireframe demos |
| Sidebar element drag reordering | Fixed zone positions (header/nav/footer) are sufficient |
| WYSIWYG text editing in sidebar/header | Input fields in PropertyPanel are sufficient |
| New schema changes | v2.2 schemas (SidebarWidget, HeaderConfig, FilterOption) are sufficient — this is UX only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HDR-10 | - | Pending |
| HDR-11 | - | Pending |
| HDR-12 | - | Pending |
| SIDE-10 | - | Pending |
| SIDE-11 | - | Pending |
| SIDE-12 | - | Pending |
| SIDE-13 | - | Pending |
| FILT-10 | - | Pending |
| FILT-11 | - | Pending |
| FILT-12 | - | Pending |
| FILT-13 | - | Pending |
| CLN-01 | - | Pending |
| CLN-02 | - | Pending |
| CLN-03 | - | Pending |

**Coverage:**
- v2.3 requirements: 14 total
- Mapped to phases: 0
- Unmapped: 14

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
