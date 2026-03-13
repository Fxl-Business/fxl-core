# Requirements: FXL Core

**Defined:** 2026-03-13
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v2.0 Requirements

Requirements for milestone v2.0 — Framework Shell + Arquitetura Modular.

### Module Registry

- [x] **REG-01**: User can see enhanced module definitions with description, badge count, and enabled status
- [x] **REG-02**: System has module-ids.ts with string literal constants preventing circular imports
- [x] **REG-03**: ModuleDefinition type extends ModuleManifest with extensions[], badge?, enabled fields
- [x] **REG-04**: User can enable/disable modules at runtime with state persisted to localStorage

### Home

- [x] **HOME-01**: User sees Home 2.0 at route / as the app entry point (control center, not card grid)
- [x] **HOME-02**: Home displays each enabled module with name, description, icon, badge, and access link
- [x] **HOME-03**: Home has asymmetric/hierarchical layout communicating "control center" identity
- [x] **HOME-04**: Home shows secondary area with installation identity and recent activity info

### Contracts

- [x] **CONT-01**: ModuleExtension type defines id, requires[], description, and injects map
- [x] **CONT-02**: SlotComponentProps interface provides type-safe props for slot-injected components
- [x] **CONT-03**: ExtensionSlot component renders injected components for a given slot ID
- [x] **CONT-04**: useActiveExtensions(moduleId) hook returns active extensions based on enabled modules
- [ ] **CONT-05**: At least 2 real cross-module extensions are implemented and rendering end-to-end

### Routing

- [x] **ROUT-01**: Route / renders Home 2.0 (not documentation)
- [x] **ROUT-02**: Documentation view accessible at /docs with all sub-routes preserved
- [x] **ROUT-03**: Sidebar navigation driven by enabled modules from registry
- [ ] **ROUT-04**: Admin panel at /admin/modules shows all modules, extensions, and active status
- [ ] **ROUT-05**: Admin panel allows enabling/disabling modules with immediate UI feedback
- [x] **ROUT-06**: ESLint boundaries config updated to allow new registry-layer files

## Future Requirements

### Advanced Extensions

- **AEXT-01**: Extensions can inject route-level pages (not just sidebar widgets)
- **AEXT-02**: Extensions can declare data dependencies on Supabase tables
- **AEXT-03**: Module health dashboard with per-module error tracking

### Home Enhancements

- **AHOME-01**: Home widgets powered by slot injection from individual modules
- **AHOME-02**: Per-module Supabase aggregate KPI queries on home cards
- **AHOME-03**: Customizable module card ordering via drag-and-drop

## Out of Scope

| Feature | Reason |
|---------|--------|
| Supabase persistence for module state | localStorage sufficient for single-operator internal tool |
| Event bus between modules | Loses TypeScript type safety; use slot injection for UI and Supabase for data |
| Dynamic import / lazy loading of modules | Over-engineering for 5-module app; all modules ship in main bundle |
| homeWidget slot on Home cards | Static registry consumption sufficient for v2.0; slot-based Home widgets deferred |
| Module marketplace / plugin system | Internal tool with known modules; no dynamic discovery needed |
| Renaming doc routes to /docs/* | Would break 40+ hardcoded hrefs in docs manifest navChildren |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| REG-01 | Phase 38 | Complete |
| REG-02 | Phase 38 | Complete |
| REG-03 | Phase 38 | Complete |
| REG-04 | Phase 38 | Complete |
| CONT-01 | Phase 39 | Complete |
| CONT-02 | Phase 39 | Complete |
| CONT-03 | Phase 39 | Complete |
| CONT-04 | Phase 39 | Complete |
| ROUT-06 | Phase 39 | Complete |
| ROUT-01 | Phase 40 | Complete |
| ROUT-02 | Phase 40 | Complete |
| ROUT-03 | Phase 40 | Complete |
| HOME-01 | Phase 41 | Complete |
| HOME-02 | Phase 41 | Complete |
| HOME-03 | Phase 41 | Complete |
| HOME-04 | Phase 41 | Complete |
| CONT-05 | Phase 42 | Pending |
| ROUT-04 | Phase 42 | Pending |
| ROUT-05 | Phase 42 | Pending |

**Coverage:**
- v2.0 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation — 100% coverage*
