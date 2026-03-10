# Roadmap: FXL Core

## Milestones

- ✅ **v1.0 MVP** -- Phases 1-6 (shipped 2026-03-09)
- [ ] **v1.1 Wireframe Evolution** -- Phases 7-11 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-6) -- SHIPPED 2026-03-09</summary>

- [x] Phase 1: Documentation (2/2 plans) -- completed 2026-03-07
- [x] Phase 2: Wireframe Comments (3/3 plans) -- completed 2026-03-07
- [x] Phase 02.1: Melhoria e organizacao de dominio (3/3 plans) -- completed 2026-03-07
- [x] Phase 02.2: Evolucao de Blocos Disponiveis (3/3 plans) -- completed 2026-03-08
- [x] Phase 02.3: Reformulacao Visual (4/4 plans) -- completed 2026-03-08
- [x] Phase 3: Wireframe Visual Editor (4/4 plans) -- completed 2026-03-09
- [x] Phase 4: Branding Process (3/3 plans) -- completed 2026-03-09
- [x] Phase 5: Technical Configuration (2/2 plans) -- completed 2026-03-09
- [x] Phase 6: System Generation (3/3 plans) -- completed 2026-03-09

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### v1.1 Wireframe Evolution

- [x] **Phase 7: Blueprint Infrastructure** - DB as sole source of truth with schema versioning, runtime validation, and optimistic locking
- [x] **Phase 8: Wireframe Design System** - Semantic token layer for wireframes with dark/light mode and branding integration
- [ ] **Phase 9: Component Library Expansion** - Registry pattern + 6 new section types + 5 chart types + generic wireframe viewer
- [ ] **Phase 10: Briefing & Blueprint Views** - Structured briefing input, blueprint text view, MD export, and share link fix
- [ ] **Phase 11: AI-Assisted Generation** - Blueprint generation from briefing with screen recipes and vertical templates

## Phase Details

### Phase 7: Blueprint Infrastructure
**Goal**: Operators work exclusively with blueprints stored in Supabase -- no .ts file dependency, with safe schema evolution and conflict protection
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Operator can load the wireframe viewer and see blueprint data fetched entirely from Supabase (no .ts config file import in rendering path)
  2. Operator can save blueprint edits and the stored JSON includes a schemaVersion field that persists across reads
  3. Operator sees a validation error toast when blueprint data from DB has structural problems (zod parse catches malformed data instead of silent cast)
  4. When two browser tabs edit the same blueprint, the second save warns the operator of a conflict instead of silently overwriting
**Plans**: 3 plans

Plans:
- [x] 07-01-PLAN.md -- Zod schema, migration framework, and store refactor (TDD)
- [x] 07-02-PLAN.md -- Migrate viewers to DB-only loading, add sonner, delete .ts config
- [x] 07-03-PLAN.md -- Optimistic locking, conflict modal, stale data polling

### Phase 8: Wireframe Design System
**Goal**: Wireframes render with their own visual identity (neutral palette + gold accent) independent of the app theme, with dark/light toggle and client branding layered on top
**Depends on**: Phase 7
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Wireframe components use --wf-* CSS variables for all colors (no hardcoded hex values or app theme tokens like --primary)
  2. Operator can toggle dark/light mode in the wireframe viewer and all wireframe components respond to the theme change
  3. Client branding colors override wireframe tokens in the viewer without affecting the surrounding app shell colors
  4. Wireframe palette renders 10-step neutral scale plus gold accent, visually distinct from the app's blue/purple palette
**Plans**: 3 plans

Plans:
- [x] 08-01-PLAN.md -- Token CSS layer, WireframeThemeProvider, Tailwind extension, branding override helper
- [x] 08-02-PLAN.md -- Migrate 26 wireframe components from hardcoded colors to --wf-* tokens
- [x] 08-03-PLAN.md -- Wire theme provider into viewers, add dark/light toggle, apply branding overrides

### Phase 9: Component Library Expansion
**Goal**: Operators can build richer wireframes with 6 new block types, 5 additional chart types, and a single generic viewer that works for any client
**Depends on**: Phase 8
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09
**Success Criteria** (what must be TRUE):
  1. New section types are added by registering in a single registry file (no more touching 5+ switch statements across the codebase)
  2. Operator can add each of the 6 new block types (settings-page, form-section, filter-config, stat-card, progress-bar, divider) from the component picker and see them render in the wireframe
  3. Operator can select RadarChart, Treemap, FunnelChart, ScatterChart, or AreaChart as chart variants and see them render with sample data
  4. Navigating to /clients/:clientSlug/wireframe loads the correct blueprint and branding for any client without a dedicated page per client
**Plans**: 4 plans

Plans:
- [ ] 09-01-PLAN.md -- Section registry pattern, types/schemas for 6 new blocks + 5 chart variants, dispatcher migration
- [ ] 09-02-PLAN.md -- 6 new block renderers and property forms (settings-page, form-section, filter-config, stat-card, progress-bar, divider)
- [ ] 09-03-PLAN.md -- 5 new Recharts chart variants (Radar, Treemap, Funnel, Scatter, Area) + ChartRenderer extension
- [ ] 09-04-PLAN.md -- Generic parametric wireframe viewer replacing hardcoded client pages

### Phase 10: Briefing & Blueprint Views
**Goal**: Operators can input client briefings through the UI, view blueprints as structured text, export blueprints for Claude Code, and share wireframes with clients
**Depends on**: Phase 7 (independent of Phase 9 -- can run in parallel)
**Requirements**: BRFG-01, BRFG-02, BRFG-03, BRFG-04
**Success Criteria** (what must be TRUE):
  1. Operator can fill out a structured briefing form (company info, data sources, KPI goals) and see it persisted in Supabase across page reloads
  2. Operator can open a blueprint text view that shows screens, sections, and properties as readable structured text (not raw JSON)
  3. Operator can export a blueprint as Markdown file that Claude Code can read for context during generation tasks
  4. Operator can generate a share link for any client wireframe and the client can view it without authentication
**Plans**: TBD

### Phase 11: AI-Assisted Generation
**Goal**: Claude Code can generate a complete blueprint from a client briefing, guided by screen recipes and vertical templates, with operator review before acceptance
**Depends on**: Phase 9, Phase 10
**Requirements**: AIGE-01, AIGE-02, AIGE-03
**Success Criteria** (what must be TRUE):
  1. Claude Code can read a briefing from Supabase and generate a valid BlueprintConfig that passes zod validation and renders without errors in the wireframe viewer
  2. Screen recipes exist as typed objects (not just markdown) that map business contexts (e.g., faturamento, estoque) to recommended screen structures with section types and layouts
  3. Operator can select a vertical template (financeiro, varejo, servicos) as a starting point for blueprint generation instead of starting from scratch
**Plans**: TBD

## Progress

**Execution Order:**
Phase 7 -> 8 -> 9 (and 10 in parallel) -> 11

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Documentation | v1.0 | 2/2 | Complete | 2026-03-07 |
| 2. Wireframe Comments | v1.0 | 3/3 | Complete | 2026-03-07 |
| 02.1. Melhoria e organizacao de dominio | v1.0 | 3/3 | Complete | 2026-03-07 |
| 02.2. Evolucao de Blocos Disponiveis | v1.0 | 3/3 | Complete | 2026-03-08 |
| 02.3. Reformulacao Visual | v1.0 | 4/4 | Complete | 2026-03-08 |
| 3. Wireframe Visual Editor | v1.0 | 4/4 | Complete | 2026-03-09 |
| 4. Branding Process | v1.0 | 3/3 | Complete | 2026-03-09 |
| 5. Technical Configuration | v1.0 | 2/2 | Complete | 2026-03-09 |
| 6. System Generation | v1.0 | 3/3 | Complete | 2026-03-09 |
| 7. Blueprint Infrastructure | v1.1 | 3/3 | Complete | 2026-03-09 |
| 8. Wireframe Design System | v1.1 | 3/3 | Complete | 2026-03-10 |
| 9. Component Library Expansion | v1.1 | 0/4 | Not started | - |
| 10. Briefing & Blueprint Views | v1.1 | 0/? | Not started | - |
| 11. AI-Assisted Generation | v1.1 | 0/? | Not started | - |
