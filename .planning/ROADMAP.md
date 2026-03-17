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

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v3.1 Multi-tenancy

**Milestone Goal:** Integrar Clerk Organizations para multi-tenancy real: org picker, tenant_modules no Supabase, RLS por org_id em todas as tabelas, Edge Function para JWT bridge Clerk-Supabase, e flag VITE_AUTH_MODE para fallback dev/staging. FXL como primeiro tenant.

**Design spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Section 5)

## Phases

- [x] **Phase 64: Supabase Schema & Migrations** - tenant_modules table, org_id on existing tables, RLS policies, indexes (completed 2026-03-17)
- [ ] **Phase 65: Clerk Organizations + Token Exchange** - useActiveOrg hook, org picker UI, Edge Function JWT bridge, auth mode flag, Supabase client refactor
- [ ] **Phase 66: Module System Multi-tenancy** - Refactor useModuleEnabled for Supabase, tenantScoped field, sidebar/home filtering, localStorage migration
- [ ] **Phase 67: Integration Verification + Auth Mode** - TypeScript/build verification, end-to-end manual test, anon mode backward compatibility

## Phase Details

### Phase 64: Supabase Schema & Migrations
**Goal**: All Supabase tables are multi-tenant-ready with org_id columns, RLS policies that filter by org_id from JWT claims, and a new tenant_modules table for per-org module configuration
**Depends on**: Nothing (first phase of v3.1)
**Requirements**: [SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04]
**Success Criteria** (what must be TRUE):
  1. Table `tenant_modules` exists with `(org_id, module_id)` primary key, `enabled` boolean, `config` jsonb
  2. All 7 existing tables (comments, share_tokens, blueprint_configs, briefing_configs, tasks, documents, knowledge_entries) have `org_id text NOT NULL DEFAULT 'org_fxl_default'`
  3. Backfill migration sets `org_id = 'org_fxl_default'` for all existing rows
  4. RLS policies on all tables filter by `org_id` from JWT claims (with anon fallback for backward compat)
  5. Indexes on `org_id` exist for all tables
  6. `make migrate` applies cleanly on fresh and existing databases
**Plans:** 1/1 plans complete

### Phase 65: Clerk Organizations + Token Exchange
**Goal**: Clerk Organizations integrated in the frontend with org picker, and a Supabase Edge Function bridges Clerk JWTs to Supabase JWTs with org_id claims, controlled by VITE_AUTH_MODE flag
**Depends on**: Phase 64 (RLS policies need to exist before org-scoped JWT is used)
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, CLERK-01, CLERK-02, CLERK-03]
**Success Criteria** (what must be TRUE):
  1. `useActiveOrg` hook returns `activeOrg`, `orgs[]`, `switchOrg()`, `isLoading`
  2. Org picker in TopNav shows dropdown for 2+ orgs, badge for 1 org
  3. Edge Function `/auth/token-exchange` validates Clerk token and returns Supabase JWT with `org_id`
  4. `VITE_AUTH_MODE=anon` (default) preserves current behavior; `=org` activates org-scoped Supabase client
  5. `src/platform/supabase.ts` dynamically uses anon key or org-scoped JWT based on auth mode
  6. Switching org triggers token re-exchange and Supabase client update
**Plans:** [To be planned]

### Phase 66: Module System Multi-tenancy
**Goal**: Module enable/disable reads from Supabase tenant_modules (per org) instead of localStorage, with tenantScoped field on ModuleDefinition controlling visibility, and sidebar/home reflecting the active org's module set
**Depends on**: Phase 64 (tenant_modules table), Phase 65 (useActiveOrg hook, Supabase client with org JWT)
**Requirements**: [MOD-01, MOD-02, MOD-03, MOD-04]
**Success Criteria** (what must be TRUE):
  1. `useModuleEnabled` fetches from `tenant_modules` when `VITE_AUTH_MODE=org`, falls back to localStorage when `=anon`
  2. `ModuleDefinition` interface has `tenantScoped?: boolean` field
  3. Sidebar shows only modules where `enabled=true` in tenant_modules for active org
  4. Home page module grid filters by active org's enabled modules
  5. One-time migration script transfers localStorage toggles to tenant_modules for FXL default org
  6. Changing org in org picker immediately updates sidebar and home
**Plans:** [To be planned]

### Phase 67: Integration Verification + Auth Mode
**Goal**: The complete multi-tenancy stack is verified end-to-end: TypeScript compiles, build succeeds, anon mode has zero regression, and org mode correctly isolates data and modules by organization
**Depends on**: Phase 64, Phase 65, Phase 66
**Requirements**: [INT-01, INT-02, INT-03, INT-04]
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` completes with zero errors
  2. `npm run build` completes with zero errors
  3. With `VITE_AUTH_MODE=anon`: all existing functionality works identically to pre-v3.1
  4. With `VITE_AUTH_MODE=org`: login shows org picker (for multi-org user), selecting org filters modules, RLS isolates data
  5. Token exchange Edge Function returns valid JWT that Supabase accepts
  6. No data leaks between orgs (query from org A returns zero rows belonging to org B)
**Plans:** [To be planned]

## Progress

**Execution Order:** 64 -> 65 -> 66 -> 67

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 64. Supabase Schema & Migrations | 1/1 | Complete   | 2026-03-17 |
| 65. Clerk Organizations + Token Exchange | 0/0 | Pending | — |
| 66. Module System Multi-tenancy | 0/0 | Pending | — |
| 67. Integration Verification + Auth Mode | 0/0 | Pending | — |
