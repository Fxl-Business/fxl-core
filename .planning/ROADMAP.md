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
- **v4.2 Docs do Sistema + Tenant Onboarding** - Phases 81-84 (shipped 2026-03-17) -- see milestones/v4.2-ROADMAP.md
- **v4.3 Admin Polish & Custom Auth** - Phases 85-88 (shipped 2026-03-17) -- see milestones/v4.3-ROADMAP.md
- **v5.0 SDK Docs** - Phases 89-93 (shipped 2026-03-17) -- see milestones/v5.0-ROADMAP.md
- **v5.1 MCP Server** - Phases 94-98 (shipped 2026-03-18) -- see milestones/v5.1-ROADMAP.md
- **v5.2 Nexo Skill** - Phases 99-104 (shipped 2026-03-18) -- see milestones/v5.2-ROADMAP.md
- **v5.3 UX Polish** - Phases 105-111 (shipped 2026-03-18) -- see milestones/v5.3-ROADMAP.md
- **v6.0 Reestruturação de Módulos** - Phases 112-116 (shipped 2026-03-18) -- see milestones/v6.0-ROADMAP.md
- **v7.0 Admin-Only Org Management** - Phases 117-120 (active)

## Phases

- [ ] **Phase 117: Access Control Lockdown** - Remove self-service org creation and add unaffiliated user screen
- [ ] **Phase 118: Admin User Management** - Unaffiliated users filter, search, and org linking from admin panel
- [ ] **Phase 119: Tenant Archival** - Soft-delete with restore capability and archived tenants visibility
- [ ] **Phase 120: Admin Dashboard Improvements** - Unaffiliated and archived counts with quick action links

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## Phase Details

### Phase 117: Access Control Lockdown
**Goal**: Users without org membership can no longer create organizations themselves — they see a branded holding screen and must wait for admin intervention
**Depends on**: Nothing (first phase of milestone)
**Requirements**: ACC-01, ACC-02, ACC-03, ACC-04
**Success Criteria** (what must be TRUE):
  1. Navigating to `/criar-empresa` or clicking any "create org" flow no longer works — the route/button is absent
  2. A user with no org membership is automatically redirected to `/solicitar-acesso` instead of the app
  3. The `/solicitar-acesso` screen displays Nexo branding, a clear message explaining they need admin approval, and a functional sign out button
  4. Only super admin can create a new organization (via the admin panel — no client-side `createOrganization()` call exists)
**Plans**: 2 plans

Plans:
- [ ] 117-01-PLAN.md — Create SolicitarAcesso page (new branded holding screen)
- [ ] 117-02-PLAN.md — Remove CriarEmpresa, update router and ProtectedRoute redirect

### Phase 118: Admin User Management
**Goal**: Admin can identify all unaffiliated users at a glance and link them to organizations without leaving the users panel
**Depends on**: Phase 117
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04
**Success Criteria** (what must be TRUE):
  1. `/admin/users` shows a filter or tab that isolates users with zero org memberships
  2. Admin can switch between "all", "unaffiliated", and "affiliated" views of the user list
  3. From the unaffiliated users list, admin can assign a user to an existing organization without navigating away
  4. When adding a member to a tenant via TenantDetailPage, admin can search existing unaffiliated users by name/email to find them quickly
**Plans**: 2 plans

Plans:
- [ ] 118-01-PLAN.md — UsersPage filter (Todos/Sem org/Com org) and org assignment dialog
- [ ] 118-02-PLAN.md — TenantDetailPage user search combobox replacing raw userId input

### Phase 119: Tenant Archival
**Goal**: Admin can safely archive a tenant — hiding it from normal operation while preserving all data — and can restore it later
**Depends on**: Phase 117
**Requirements**: ARC-01, ARC-02, ARC-03, ARC-04, ARC-05
**Success Criteria** (what must be TRUE):
  1. Admin can archive a tenant from the admin panel; after archiving, the tenant disappears from the active tenants list
  2. Archived tenants have Clerk org metadata set to `archived=true` and no active org memberships remain
  3. Normal application queries never surface data from archived tenants (RLS enforces `archived_at IS NULL`)
  4. Admin can navigate to an "Archived" tab on the tenants page and see all archived tenants listed
  5. Admin can restore an archived tenant, which re-enables the org, reverses the soft-delete, and makes the tenant active again
**Plans**: TBD

### Phase 120: Admin Dashboard Improvements
**Goal**: Admin dashboard surfaces at-a-glance counts for unaffiliated users and archived tenants, with direct navigation to each view
**Depends on**: Phase 118, Phase 119
**Requirements**: DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Admin dashboard metric cards include a count of users with zero org memberships
  2. Admin dashboard metric cards include a count of archived tenants
  3. Each new metric card links directly to the relevant filtered view (unaffiliated users tab, archived tenants tab)
**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 117. Access Control Lockdown | 0/2 | Not started | - |
| 118. Admin User Management | 0/? | Not started | - |
| 119. Tenant Archival | 0/? | Not started | - |
| 120. Admin Dashboard Improvements | 0/? | Not started | - |

---

<details>
<summary>✅ v6.0 Reestruturação de Módulos (Phases 112-116) — SHIPPED 2026-03-18</summary>

- [x] Phase 112: DB Migration (1/1 plan) — completed 2026-03-18
- [x] Phase 113: Code Restructure — completed 2026-03-18
- [x] Phase 114: Projetos Module — completed 2026-03-18
- [x] Phase 115: Clientes Module — completed 2026-03-18
- [x] Phase 116: Sidebar Workspace — completed 2026-03-18

See: milestones/v6.0-ROADMAP.md

</details>

---

<details>
<summary>✅ v5.3 UX Polish (Phases 105-111) — SHIPPED 2026-03-18</summary>

- [x] Phase 105: Data Isolation (4/4 plans) — completed 2026-03-18
- [x] Phase 106: Data Recovery (1/1 plan) — completed 2026-03-18
- [x] Phase 107: Header UX (1/1 plan) — completed 2026-03-18
- [x] Phase 108: Admin Enhancements (4/4 plans) — completed 2026-03-18
- [x] Phase 109: Blueprint RLS (1/1 plan) — completed 2026-03-18
- [x] Phase 110: Phase 108 Verification (1/1 plan) — completed 2026-03-18
- [x] Phase 111: Audit Closure (1/1 plan) — completed 2026-03-18

See: milestones/v5.3-ROADMAP.md

</details>
