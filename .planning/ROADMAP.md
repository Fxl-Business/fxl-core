# Roadmap: FXL Core v1

## Overview

Evolve FXL Core from its current state (documentation + wireframe rendering) into the full operational brain of the company. Six phases deliver improvements in priority order: first reorganize documentation so operators can navigate the process, then add interactive comments to wireframes for client feedback, then build a visual editor that syncs with the blueprint config, then establish a structured branding process, then define the TechnicalConfig schema that bridges wireframes to real systems, and finally generate standalone BI dashboards from the merged configuration. Each phase delivers a complete, verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Documentation** - Reorganize docs navigation and content so operators find information naturally
- [ ] **Phase 2: Wireframe Comments** - Persistent comments on wireframes with Supabase so clients give feedback directly
- [ ] **Phase 3: Wireframe Visual Editor** - Edit wireframe layout, components, and screens via UI with blueprint sync
- [ ] **Phase 4: Branding Process** - Structured branding collection with automatic application to wireframes
- [ ] **Phase 5: Technical Configuration** - TechnicalConfig schema and config resolver bridging wireframe to functional system
- [ ] **Phase 6: System Generation** - Generate standalone Next.js BI dashboards from Blueprint + TechnicalConfig + Branding

## Phase Details

### Phase 1: Documentation
**Goal**: Operators can navigate FXL process documentation intuitively and onboard without hand-holding
**Depends on**: Nothing (first phase)
**Requirements**: DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. Sidebar navigation reflects the process structure (fases, build, referencias, operacao) and a new operator can find any topic in under 3 clicks
  2. All docs content accurately describes the current process (no outdated instructions or dead references)
  3. A new operator visiting the app for the first time can follow the onboarding page to understand the full process end-to-end
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Structure + Navigation: move files, rewrite sidebar, update routes and Home links (DOCS-01)
- [ ] 01-02-PLAN.md — Content + Onboarding: rewrite content, create merged pages, restructure fases, create onboarding (DOCS-02, DOCS-03)

### Phase 2: Wireframe Comments
**Goal**: Clients and operators can have persistent feedback conversations directly on wireframe screens and blocks
**Depends on**: Phase 1
**Requirements**: WCMT-01, WCMT-02, WCMT-03
**Success Criteria** (what must be TRUE):
  1. Operator or client clicks on a screen or block in the wireframe and leaves a comment that persists across browser sessions (stored in Supabase)
  2. An external client accesses the wireframe via a shared link and leaves comments without needing a developer account or setup
  3. Operator opens a comment management view showing all comments across screens, and can mark individual comments as resolved
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Supabase infrastructure, auth, types, CRUD functions, and migration SQL (WCMT-01, WCMT-02)
- [ ] 02-02-PLAN.md — Comment UI: refactor CommentOverlay to Supabase, section wrappers with hover icons and badges (WCMT-01)
- [ ] 02-03-PLAN.md — Client access via shared link, comment management panel with resolve (WCMT-02, WCMT-03)

### Phase 3: Wireframe Visual Editor
**Goal**: Operators can visually modify wireframe layout and components without touching code, with all changes synced to the blueprint config
**Depends on**: Phase 2
**Requirements**: WEDT-01, WEDT-02, WEDT-03, WEDT-04
**Success Criteria** (what must be TRUE):
  1. Operator can drag sections within a screen to reorder them, and add or remove sections from a screen via the UI
  2. Operator can click on any component (KPI card, chart, table) and edit its properties (title, chart type, columns) through a visual panel
  3. Operator can create new screens and delete existing screens from the wireframe without editing any file manually
  4. Every visual edit (section moves, prop changes, screen additions/removals) is automatically reflected in the blueprint.config.ts file and the wireframe re-renders from the updated config
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Branding Process
**Goal**: Client branding is collected in a structured format and automatically applied to wireframes
**Depends on**: Phase 3
**Requirements**: BRND-01, BRND-02, BRND-03
**Success Criteria** (what must be TRUE):
  1. A parseable branding file exists for a client with defined fields for colors (primary, secondary, accent), typography (font family, sizes), and logo URL
  2. The branding collection process is documented with a template that an operator follows step-by-step to gather brand assets from any client
  3. When a client's branding file is populated, the wireframe renders using those brand colors and fonts instead of defaults
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Technical Configuration
**Goal**: Operators can define data semantics for any blueprint and get a validated, merge-ready configuration for system generation
**Depends on**: Phase 4
**Requirements**: TCONF-01, TCONF-02, TCONF-03, TCONF-04
**Success Criteria** (what must be TRUE):
  1. A TechnicalConfig TypeScript schema exists that declares data sources, KPI formulas, and business rules per blueprint section
  2. The Config Resolver merges BlueprintConfig + TechnicalConfig + Branding into a single GenerationManifest without data loss
  3. Given the pilot client's briefing and blueprint, Claude produces a TechnicalConfig draft that an operator can review and adjust
  4. Running validation against the pilot blueprint flags any section missing from TechnicalConfig (zero uncovered sections)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: System Generation
**Goal**: A standalone BI dashboard is generated in a separate repository from the merged configuration, with real data and auth
**Depends on**: Phase 5
**Requirements**: SGEN-01, SGEN-02, SGEN-03, SGEN-04, SGEN-05
**Success Criteria** (what must be TRUE):
  1. Running the generator with the pilot client's GenerationManifest produces a Next.js 16 project in a separate repo with Supabase, Tailwind, and correct folder structure that starts with `npm run dev`
  2. Generated pages render KPI cards, charts, and tables matching the blueprint layout, connected to real data from Supabase
  3. User can upload a CSV/XLSX file through the generated system, with Brazilian formats (1.234,56 / dd/mm/yyyy) normalized automatically
  4. Users can log in with email/password and the system enforces role-based access (admin vs viewer)
  5. Client branding (colors, fonts, logo) from the branding config is applied automatically throughout the generated dashboard
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Documentation | 2/2 | Complete | 2026-03-07 |
| 2. Wireframe Comments | 0/3 | Planning Complete | - |
| 3. Wireframe Visual Editor | 0/3 | Not started | - |
| 4. Branding Process | 0/2 | Not started | - |
| 5. Technical Configuration | 0/2 | Not started | - |
| 6. System Generation | 0/3 | Not started | - |
