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
- **v4.3 Admin Polish & Custom Auth** - Phases 85-88 (in progress)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v4.3 Admin Polish & Custom Auth

**Milestone Goal:** Corrigir bugs em auth flow e metricas admin, criar tela de login custom seguindo design Nexo, e adicionar gestao de usuarios.

**Track Note:** AUTH track (phase 85) and ADMIN track (phases 86-87) are independent and can be executed in parallel. Within ADMIN: phase 86 (data fixes) before phase 87 (users management), because edge function patterns from 86 are reused in 87. Phase 88 is the quality gate and runs last.

### Phases

- [ ] **Phase 85: Auth Fix & Custom Login** - Fix ProtectedRoute infinite loading and build custom login page with Google OAuth + email/password
- [ ] **Phase 86: Admin Data Fixes** - Fix member count and dashboard metrics using edge functions instead of client-side Clerk hooks
- [ ] **Phase 87: Admin Users Management** - New admin-users edge function, /admin/users page, and members list in TenantDetailPage
- [ ] **Phase 88: Quality Gate & Security Audit** - TypeScript zero-errors pass and verify all admin routes are super_admin-gated

### Phase Details

### Phase 85: Auth Fix & Custom Login
**Goal**: Users can authenticate via a custom-designed Nexo login page, and unauthenticated users are never stuck in an infinite loading state
**Depends on**: Phase 84 (v4.2 complete)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. Navigating to any protected route while logged out shows the login page immediately (no spinner, no blank screen)
  2. The login page displays Nexo branding, a Google OAuth button, and an email/password form following the Nexo design system (Inter, indigo/slate)
  3. Clicking "Continue with Google" completes the OAuth flow and lands the user in the app as authenticated
  4. Submitting valid email/password credentials logs the user in end-to-end
  5. The "Nao tem conta?" link navigates to the signup page
**Plans**: 85-01 (ProtectedRoute fix + SSO callback), 85-02 (Custom login page)

### Phase 86: Admin Data Fixes
**Goal**: The admin dashboard and tenant list display accurate headcounts that match Clerk data
**Depends on**: Phase 84 (v4.2 complete) -- independent of phase 85
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04
**Success Criteria** (what must be TRUE):
  1. The TenantsPage shows a non-zero, accurate member count for each organization that has members in Clerk
  2. The AdminDashboard "Tenants" metric shows the total count of all Clerk organizations
  3. The AdminDashboard "Usuarios" metric shows the total count of all Clerk users
  4. The TenantDetailPage member count matches the count shown in TenantsPage for the same org
**Plans**: TBD

### Phase 87: Admin Users Management
**Goal**: Super admins can see a global list of all platform users and view which members belong to each tenant
**Depends on**: Phase 86
**Requirements**: USR-01, USR-02, USR-03, USR-04
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin/users shows a list of all Clerk users with name, email, organizations, and relevant dates
  2. Each user entry shows which organizations (tenants) they belong to
  3. The TenantDetailPage has a "Membros" section listing all org members with their role badges (admin, member, etc.)
  4. All user and member data is fetched via Supabase edge functions, not Clerk client-side hooks
**Plans**: TBD

### Phase 88: Quality Gate & Security Audit
**Goal**: The codebase is TypeScript-clean and every admin route is verified to require super_admin access
**Depends on**: Phase 87
**Requirements**: GEN-01, GEN-02
**Success Criteria** (what must be TRUE):
  1. Running `npx tsc --noEmit` produces zero errors across the entire codebase
  2. Every route under /admin/* is inaccessible to non-super_admin users (returns to app or shows unauthorized, never renders admin UI)
**Plans**: TBD

## Progress

**Execution Order:**
Phase 85 (AUTH) and Phase 86 (ADMIN data fixes) can run in parallel.
Phase 87 depends on Phase 86 (edge function patterns).
Phase 88 runs last (quality gate).

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 85. Auth Fix & Custom Login | v4.3 | 0/2 | Planned | - |
| 86. Admin Data Fixes | v4.3 | 0/TBD | Not started | - |
| 87. Admin Users Management | v4.3 | 0/TBD | Not started | - |
| 88. Quality Gate & Security Audit | v4.3 | 0/TBD | Not started | - |
