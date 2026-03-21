# Roadmap: Nexo

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) -- see milestones/v1.0-ROADMAP.md
- ✅ **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) -- see milestones/v1.1-ROADMAP.md
- ✅ **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) -- see milestones/v1.2-ROADMAP.md
- ✅ **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) -- see milestones/v1.3-ROADMAP.md
- ✅ **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) -- see milestones/v1.4-ROADMAP.md
- ✅ **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) -- see milestones/v1.5-ROADMAP.md
- ✅ **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) -- see milestones/v1.6-ROADMAP.md
- ✅ **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) -- see milestones/v2.0-ROADMAP.md
- ✅ **v2.1 Dynamic Data Layer** - Phases 43-46 (shipped 2026-03-13) -- see milestones/v2.1-ROADMAP.md
- ✅ **v2.2 Wireframe Builder -- Configurable Layout Components** - Phases 47-53 (shipped 2026-03-13) -- see milestones/v2.2-ROADMAP.md
- ✅ **v2.3 Inline Editing UX** - Phases 54-57 (shipped 2026-03-13) -- see milestones/v2.3-ROADMAP.md
- ✅ **v2.4 Component Picker Preview Mode** - Phases 58-59 (shipped 2026-03-14) -- see milestones/v2.4-ROADMAP.md
- ✅ **v3.0 Reorganizacao Modular** - Phases 60-63 (shipped 2026-03-17) -- see milestones/v3.0-ROADMAP.md
- ✅ **v3.1 Multi-tenancy** - Phases 64-67 (shipped 2026-03-17) -- see milestones/v3.1-ROADMAP.md
- ✅ **v3.2 FXL SDK Skill** - Phases 68-69 (shipped 2026-03-17) -- see milestones/v3.2-ROADMAP.md
- ✅ **v3.3 Generic Connector Module** - Phases 70-72 (shipped 2026-03-17) -- see milestones/v3.3-ROADMAP.md
- ✅ **v4.0 Rebrand Nexo** - Phases 73-74 (shipped 2026-03-17) -- see milestones/v4.0-ROADMAP.md
- ✅ **v4.1 Super Admin** - Phases 75-80 (shipped 2026-03-17) -- see milestones/v4.1-ROADMAP.md
- ✅ **v4.2 Docs do Sistema + Tenant Onboarding** - Phases 81-84 (shipped 2026-03-17) -- see milestones/v4.2-ROADMAP.md
- ✅ **v4.3 Admin Polish & Custom Auth** - Phases 85-88 (shipped 2026-03-17) -- see milestones/v4.3-ROADMAP.md
- ✅ **v5.0 SDK Docs** - Phases 89-93 (shipped 2026-03-17) -- see milestones/v5.0-ROADMAP.md
- ✅ **v5.1 MCP Server** - Phases 94-98 (shipped 2026-03-18) -- see milestones/v5.1-ROADMAP.md
- ✅ **v5.2 Nexo Skill** - Phases 99-104 (shipped 2026-03-18) -- see milestones/v5.2-ROADMAP.md
- ✅ **v5.3 UX Polish** - Phases 105-111 (shipped 2026-03-18) -- see milestones/v5.3-ROADMAP.md
- ✅ **v6.0 Reestruturação de Módulos** - Phases 112-116 (shipped 2026-03-18) -- see milestones/v6.0-ROADMAP.md
- ✅ **v7.0 Admin-Only Org Management** - Phases 117-120 (shipped 2026-03-18) -- see milestones/v7.0-ROADMAP.md
- ✅ **v8.0 Estabilidade Multi-Tenant** - Phases 121-124 (shipped 2026-03-19) -- see milestones/v8.0-ROADMAP.md
- ✅ **v9.0 Resiliencia de Plataforma** - Phases 125-128 (shipped 2026-03-20) -- see milestones/v9.0-ROADMAP.md
- ✅ **v10.0 SDK Expansion** - Phases 129-133 (shipped 2026-03-20) -- see milestones/v10.0-ROADMAP.md
- ✅ **v11.0 Audit Logging** - Phases 134-138 (shipped 2026-03-21) -- see milestones/v11.0-ROADMAP.md
- 🔄 **v12.0 Admin Modules Overview** - Phases 139-142 (active)

## Phases

- [ ] **Phase 139: Toggle Extraction** - Extract module toggle logic into TenantModulesSection component and wire into TenantDetailPage
- [ ] **Phase 140: Dependency Diagram** - Build interactive SVG module dependency diagram with hover edge highlighting
- [ ] **Phase 141: Module Overview Cards** - Build read-only ModuleOverviewCard grid and transform ModulesPanel scaffold
- [ ] **Phase 142: Integration and QA** - Wire diagram click-to-scroll navigation and complete full system QA pass

## Phase Details

### Phase 139: Toggle Extraction
**Goal**: Tenant module management is fully functional on TenantDetailPage with zero logic in ModulesPanel
**Depends on**: Nothing (first phase of milestone, can run independently)
**Requirements**: TOGL-01, TOGL-02, TOGL-03
**Success Criteria** (what must be TRUE):
  1. Admin can navigate to a tenant on TenantDetailPage and toggle modules on/off without visiting /admin/modules
  2. ModulesPanel no longer contains a tenant selector dropdown or module toggle switches
  3. The "Gerenciar modulos" deep-link from TenantDetailPage to /admin/modules is removed
  4. TenantModulesSection accepts an orgId prop and manages all Supabase state internally
**Plans**: 139-01 (create TenantModulesSection + wire into TenantDetailPage), 139-02 (strip ModulesPanel to scaffold)

### Phase 140: Dependency Diagram
**Goal**: Admin can see and interact with a custom SVG diagram showing all platform modules and their extension dependencies
**Depends on**: Nothing (can run in parallel with Phase 139)
**Requirements**: DIAG-01, DIAG-02, DIAG-04
**Success Criteria** (what must be TRUE):
  1. Admin sees all platform modules rendered as labeled nodes in a single SVG diagram at /admin/modules
  2. Admin can hover over a module node and see its connecting edges highlighted while unrelated edges dim
  3. The diagram renders with correct node colors and edge styles in both dark and light mode
  4. The GraphNode type contains only serializable primitives (no LucideIcon or React.ComponentType fields)
**Plans**: TBD

### Phase 141: Module Overview Cards
**Goal**: Admin can read complete module information from a card grid on /admin/modules without any toggle controls
**Depends on**: Phase 139 complete (toggles removed from ModulesPanel before card grid is inserted)
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04
**Success Criteria** (what must be TRUE):
  1. Admin sees a card for every module with its name, description, and status badge (Active / Beta / Coming Soon)
  2. Admin can read the list of main features for each module directly on its card
  3. Admin can see which extensions each module provides and which slots it injects into, displayed on the card
  4. Cards are arranged in a responsive grid that reflows correctly from 1 to 3 columns across viewport sizes
**Plans**: 2 plans
Plans:
- [ ] 141-01-PLAN.md -- Type changes, shared constants, manifest features
- [ ] 141-02-PLAN.md -- ModuleOverviewCard component and ModulesPanel transformation

### Phase 142: Integration and QA
**Goal**: The diagram and card grid are fully connected — clicking a node scrolls to its card — and the complete page passes TypeScript and visual QA
**Depends on**: Phase 140 (diagram) + Phase 141 (cards) both complete
**Requirements**: DIAG-03
**Success Criteria** (what must be TRUE):
  1. Admin can click any module node in the diagram and the page scrolls to the corresponding module card, which receives a visible ring highlight
  2. `grep -r "admin/modules" src/` returns zero results inside TenantDetailPage.tsx
  3. `grep -r "<Switch" src/platform/pages/admin/ModulesPanel` returns zero results
  4. `npx tsc --noEmit` passes with zero errors after all changes
**Plans**: 142-01 (click-to-scroll wiring), 142-02 (full QA pass)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 139. Toggle Extraction | 0/2 | Planned | - |
| 140. Dependency Diagram | 0/? | Not started | - |
| 141. Module Overview Cards | 0/2 | Planned | - |
| 142. Integration and QA | 0/2 | Planned | - |

---
*v12.0 milestone — 4 phases (139-142) — 11 requirements*
