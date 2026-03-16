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
- ✅ **v2.4 Component Picker Preview Mode** - Phases 58-59 (shipped 2026-03-14) — see milestones/v2.4-ROADMAP.md

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v3.0 Reorganizacao Modular

**Milestone Goal:** Reorganizar a estrutura interna do FXL Core para modular monolith com boundaries claras (platform/, modules/, shared/), preparando para multi-tenancy e agent-per-module development. Zero mudanca funcional.

**Design spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Section 4)

## Phases

- [x] **Phase 60: Platform Scaffold + Shared Layer** - Create platform/ and shared/ directory structures with no file moves (completed 2026-03-16)
- [x] **Phase 61: Module Migration** - Move all files into autocontido modules (docs, tasks, clients, wireframe) and platform layer (completed 2026-03-16)
- [ ] **Phase 62: Removals** - Remove Knowledge Base module, dead code, and duplicates
- [ ] **Phase 63: Integration Verification** - TypeScript, build, and full visual verification of zero functional change

## Phase Details

### Phase 60: Platform Scaffold + Shared Layer
**Goal**: New directory skeleton exists for platform/, shared/, and module structures so that file moves in Phase 61 have clear targets
**Depends on**: Nothing (first phase of v3.0)
**Requirements**: ESTR-01, ESTR-06
**Success Criteria** (what must be TRUE):
  1. `src/platform/` directory exists with subdirectories layout/, auth/, tenants/, module-loader/, router/, services/, pages/
  2. `src/shared/` directory exists with subdirectories ui/, hooks/, types/, utils/
  3. Each module directory under `src/modules/` has the full autocontido structure (components/, pages/, services/, hooks/, types/) ready to receive files
  4. `tsc --noEmit` still passes (no existing code broken by new empty directories)
**Plans:** 1/1 plans complete

Plans:
- [x] 60-01-PLAN.md — Create directory skeleton (platform/, shared/, module subdirs) and update path aliases

### Phase 61: Module Migration
**Goal**: Every file lives in its correct location per the design spec Section 4.4 manifest — platform shell in platform/, module-specific code in modules/, and cross-cutting utilities in shared/
**Depends on**: Phase 60
**Requirements**: ESTR-02, ESTR-03, ESTR-04, ESTR-05, MOD-01, MOD-02, MOD-03, MOD-04, MOD-05
**Success Criteria** (what must be TRUE):
  1. Layout, Sidebar, TopNav live in `src/platform/layout/` and render correctly
  2. Auth files (ProtectedRoute, Login, Profile) live in `src/platform/auth/` and login/logout works
  3. Module system (registry, module-ids, extension-registry, slots, hooks) lives in `src/platform/module-loader/` and module toggling works
  4. App.tsx delegates routing to `src/platform/router/AppRouter.tsx` and all routes resolve
  5. Each of the 4 modules (docs, tasks, clients, wireframe) is self-contained with its own components/, pages/, services/, and CLAUDE.md
**Plans:** 7/7 plans complete

Plans:
- [x] 61-01-PLAN.md — Move platform layer files (layout, auth, module-loader, services, pages) to src/platform/
- [x] 61-02-PLAN.md — Move shadcn/ui to src/shared/ui/ and utils to src/shared/utils/
- [x] 61-03-PLAN.md — Migrate docs module (components, pages, services, hooks)
- [x] 61-04-PLAN.md — Complete tasks module (move tasks-service into module)
- [x] 61-05-PLAN.md — Migrate clients module (move all client pages into module)
- [x] 61-06-PLAN.md — Create wireframe module (pages, manifest, replace ferramentas)
- [x] 61-07-PLAN.md — Extract AppRouter from App.tsx + create module CLAUDE.md files

### Phase 62: Removals
**Goal**: Dead and redundant code is removed — Knowledge Base module, ProcessDocsViewer, duplicate components — reducing codebase size without any functional change
**Depends on**: Phase 61
**Requirements**: REM-01, REM-02, REM-03
**Success Criteria** (what must be TRUE):
  1. `src/modules/knowledge-base/` directory does not exist, and no import references it
  2. `kb-service.ts` and `kb-service.test.ts` do not exist
  3. `ProcessDocsViewer.tsx` does not exist
  4. No duplicate PageHeader.tsx or PromptBlock.tsx copies remain (only canonical versions in modules/docs/)
  5. Knowledge Base routes removed from App.tsx/AppRouter, MODULE_IDS.KNOWLEDGE_BASE removed from module-ids
**Plans:** 1 plan

Plans:
- [ ] 62-01-PLAN.md — Remove KB module, dead code, duplicates, and clean up empty directories

### Phase 63: Integration Verification
**Goal**: The reorganized codebase is verified to be functionally identical to the pre-v3.0 state through TypeScript compilation, production build, and exhaustive visual checklist
**Depends on**: Phase 62
**Requirements**: INT-01, INT-02, INT-03
**Success Criteria** (what must be TRUE):
  1. `tsc --noEmit` completes with zero errors
  2. `npm run build` completes with zero errors and produces deployable output
  3. All 11 visual checkpoints pass: Home page renders with widgets, sidebar navigation works, DocRenderer renders docs, Cmd+K search works, login/logout works, client pages (briefing/blueprint/wireframe) open, ComponentGallery renders, SharedWireframeView (public route) works, admin modules toggle works, dark mode works on all pages, inline editing works in wireframe
**Plans**: TBD

## Progress

**Execution Order:** 60 -> 61 -> 62 -> 63

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 60. Platform Scaffold + Shared Layer | 1/1 | Complete    | 2026-03-16 |
| 61. Module Migration | 7/7 | Complete    | 2026-03-16 |
| 62. Removals | 0/1 | Not started | - |
| 63. Integration Verification | 0/? | Not started | - |
