# Roadmap: Nexo

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
- **v3.3 Generic Connector Module** - Phases 70-72 (shipped 2026-03-17) -- see milestones/v3.3-ROADMAP.md
- **v4.0 Rebrand Nexo** - Phases 73-74 (shipped 2026-03-17) -- see milestones/v4.0-ROADMAP.md
- **v4.1 Super Admin** - Phases 75-80 (shipped 2026-03-17) -- see milestones/v4.1-ROADMAP.md
- **v4.2 Docs do Sistema + Tenant Onboarding** - Phases 81-84 (in progress)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v4.2 Docs do Sistema + Tenant Onboarding

**Milestone Goal:** Separar product docs de enterprise docs (scope-based), criar fluxo real de onboarding de tenants, e migrar FXL de org_fxl_default para org Clerk real.

**Track Note:** DOCS track (phases 81-82) and ONB track (phases 83-84) are independent and can be executed in parallel — they touch different areas of the codebase.

### Phases

- [x] **Phase 81: Docs Data Model** - Add scope column, RLS changes, product doc visibility (completed 2026-03-17)
- [x] **Phase 82: Docs UI & Migration** - Admin CRUD for product docs, sidebar separation, content migration (completed 2026-03-17)
- [x] **Phase 83: Onboarding Flow** - Org creation screen, empty states, no-modules state (completed 2026-03-17)
- [x] **Phase 84: FXL Migration & Cleanup** - Migrate FXL to real Clerk org, remove legacy auth artifacts (code complete 2026-03-17, pending manual data migration)

### Phase Details

### Phase 81: Docs Data Model
**Goal**: The documents table supports scope-based visibility so product docs are accessible to all tenants and enterprise docs remain tenant-isolated
**Depends on**: Phase 80 (v4.1 complete)
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. A document with `scope = 'product'` is returned when queried by any tenant, regardless of org_id
  2. A document with `scope = 'tenant'` (default) is only returned for the org_id it belongs to
  3. New documents created without an explicit scope default to `scope = 'tenant'`
  4. Existing documents continue to behave as before (no data loss or access regression)
**Plans**: 1 plan
Plans:
- [ ] 81-01-PLAN.md — Add scope column + RLS policies + TypeScript types

### Phase 82: Docs UI & Migration
**Goal**: Super admin can manage product docs via a dedicated admin panel, the sidebar shows two distinct doc sections, and all existing FXL docs are correctly scoped
**Depends on**: Phase 81
**Requirements**: DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08, DOCS-09, DOCS-10
**Success Criteria** (what must be TRUE):
  1. Super admin can create, edit, and delete product docs at `/admin/product-docs`
  2. Tenant admin can create and edit enterprise docs via the normal docs interface
  3. Sidebar shows "Docs da Empresa" and "Docs do Produto" as separate, labeled sections
  4. Operators (non-super-admin) can read product docs but have no create/edit/delete controls
  5. All FXL process docs appear under enterprise docs for the FXL tenant; SDK/onboarding docs appear under product docs for all tenants
**Plans**: 1 plan
Plans:
- [ ] 82-01-PLAN.md — ProductDocsPage, dual sidebar nav, read-only guard, scope backfill migration

### Phase 83: Onboarding Flow
**Goal**: New users without an organization are guided to create one, and tenants without modules see a clear empty state instead of a broken UI
**Depends on**: Phase 80 (v4.1 complete) -- independent of phases 81-82
**Requirements**: ONB-01, ONB-02, ONB-03
**Success Criteria** (what must be TRUE):
  1. A user who signs up and has no Clerk org sees the "Criar Empresa" screen (not a blank or broken page)
  2. Submitting the create-company form creates a Clerk Organization and assigns the user as admin
  3. After org creation, the user lands in the normal app flow with their new tenant context
  4. A tenant that exists but has zero enabled modules sees the "Sem modulos" screen with a clear message
**Plans**: 1 plan
Plans:
- [ ] 83-01-PLAN.md — CriarEmpresa page, SemModulos page, routing gates

### Phase 84: FXL Migration & Cleanup
**Goal**: FXL operates as a real Clerk Organization with all data correctly migrated, and all legacy auth fallbacks are removed from the codebase
**Depends on**: Phase 83
**Requirements**: ONB-04, ONB-05, ONB-06, ONB-07
**Success Criteria** (what must be TRUE):
  1. FXL team members log in through a real Clerk org (not the `org_fxl_default` stub)
  2. All existing FXL documents, tasks, and records are accessible under the new org_id
  3. `VITE_AUTH_MODE` and all references to it are removed from the codebase
  4. RLS policies contain no COALESCE anon fallback; every policy requires a valid org_id
**Plans**: 1 plan
Plans:
- [x] 84-01-PLAN.md — RLS hardening migration + FXL data migration + VITE_AUTH_MODE removal + AnonModuleEnabledProvider removal

## Progress

**Execution Order:**
Phases 81-82 (DOCS track) and 83-84 (ONB track) can be executed in parallel.
Within each track: 81 before 82, 83 before 84.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 81. Docs Data Model | 1/1 | Complete   | 2026-03-17 | - |
| 82. Docs UI & Migration | 1/1 | Complete   | 2026-03-17 | - |
| 83. Onboarding Flow | 1/1 | Complete   | 2026-03-17 | - |
| 84. FXL Migration & Cleanup | v4.2 | 1/1 | Code complete (pending manual data migration) | 2026-03-17 |
