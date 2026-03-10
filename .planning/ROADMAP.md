# Roadmap: FXL Core

## Milestones

- v1.0 MVP -- Phases 1-6 (shipped 2026-03-09)
- v1.1 Wireframe Evolution -- Phases 7-11 (shipped 2026-03-10)
- **v1.2 Visual Redesign** -- Phases 12-16 (in progress)

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

<details>
<summary>v1.1 Wireframe Evolution (Phases 7-11) -- SHIPPED 2026-03-10</summary>

- [x] Phase 7: Blueprint Infrastructure (3/3 plans) -- completed 2026-03-09
- [x] Phase 8: Wireframe Design System (3/3 plans) -- completed 2026-03-10
- [x] Phase 9: Component Library Expansion (4/4 plans) -- completed 2026-03-10
- [x] Phase 10: Briefing & Blueprint Views (3/3 plans) -- completed 2026-03-10
- [x] Phase 11: AI-Assisted Generation (2/2 plans) -- completed 2026-03-10

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

### v1.2 Visual Redesign

- [x] **Phase 12: Design Foundation** - Slate + indigo palette, Inter/JetBrains Mono fonts, scrollbar styling, wireframe token isolation (completed 2026-03-10)
- [x] **Phase 13: Layout Shell** - Frosted glass header, three-column layout, viewport scroll context, search bar restyle (completed 2026-03-10)
- [ ] **Phase 14: Sidebar Navigation** - Border-l rail nav, uppercase section headers, indigo active state, collapsible sections
- [ ] **Phase 15: Doc Rendering and TOC** - Page headers, breadcrumbs, dark code blocks, syntax highlighting, right-side TOC with scroll tracking
- [ ] **Phase 16: Consistency Pass** - Home, client pages, login/profile, PromptBlock, and Callout aligned to new visual language

## Phase Details

### Phase 12: Design Foundation
**Goal**: The app renders with the correct color palette and typography everywhere, and wireframe components remain visually unchanged
**Depends on**: Nothing (first phase of v1.2)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. All text in the app renders in Inter font (visible difference from system-ui in letter spacing and weight rendering)
  2. Code blocks render in JetBrains Mono font (visible difference from system monospace)
  3. Primary color throughout the app is indigo instead of the previous dark charcoal (buttons, links, active states all indigo)
  4. Scrollbar is slim (6px) and uses slate-200 color on pages with overflow
  5. Wireframe viewer for financeiro-conta-azul shows identical colors as before the palette change (stone gray + gold accent preserved)
**Plans**: 1 plan

Plans:
- [x] 12-01-PLAN.md -- Install fonts, swap palette to slate + indigo, add scrollbar styling, verify wireframe isolation

### Phase 13: Layout Shell
**Goal**: The app has a frosted glass sticky header with brand identity and search, and the page uses viewport-level scrolling that enables proper sticky positioning for sidebar and TOC
**Depends on**: Phase 12
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05
**Success Criteria** (what must be TRUE):
  1. Header stays visible at top of page while scrolling, with content scrolling beneath it (visible frosted blur effect)
  2. Header shows "Nucleo FXL" brand name with "FXL-CORE" subtitle, and a search bar showing Cmd+K shortcut
  3. The page layout supports three columns (sidebar + content + right area) without nested scroll containers
  4. Opening Cmd+K search dialog does not cause the header to shift horizontally (no scrollbar-gutter jump)
  5. Long doc pages scroll the entire viewport (not an inner container), and scroll position resets on navigation
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md -- Frosted glass header, viewport scroll context, search bar restyle, page width delegation

### Phase 14: Sidebar Navigation
**Goal**: The sidebar is the most polished navigation element in the app, with clear visual hierarchy and indigo active states
**Depends on**: Phase 13
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Sidebar has a light slate background with a right border, and stays fixed while content scrolls (sticky positioning)
  2. Section headers (Processo, Padroes, Ferramentas, Clientes) are uppercase, small, bold, and visually distinct from nav items
  3. Currently active nav item shows an indigo left border and indigo text, clearly distinguishable from inactive items
  4. Sections expand and collapse with a chevron toggle, and sub-items are indented under their parent
**Plans**: TBD

Plans:
- [ ] 14-01: TBD

### Phase 15: Doc Rendering and TOC
**Goal**: Doc pages have production-quality typography, dark-themed code blocks with syntax highlighting, and a right-side table of contents that tracks scroll position
**Depends on**: Phase 14
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07, TOC-01, TOC-02, TOC-03, TOC-04
**Success Criteria** (what must be TRUE):
  1. Doc pages show breadcrumbs (section > page) and a colored badge pill matching the frontmatter badge value
  2. Page titles are large (4xl/5xl), extrabold, and followed by a slate-600 description paragraph
  3. Code blocks have dark slate-900 background with rounded corners, decorative terminal dots, and syntax-colored tokens (keywords, strings, comments visually distinct)
  4. Right sidebar shows "NESTA PAGINA" heading with clickable headings that scroll to the correct position (accounting for sticky header offset)
  5. Active heading in TOC updates as user scrolls through the page, with nested h3 items indented under h2
**Plans**: TBD

Plans:
- [ ] 15-01: TBD
- [ ] 15-02: TBD

### Phase 16: Consistency Pass
**Goal**: Every page in the app uses the new visual language consistently -- no page looks like it belongs to the old design
**Depends on**: Phase 15
**Requirements**: CONSIST-01, CONSIST-02, CONSIST-03, CONSIST-04
**Success Criteria** (what must be TRUE):
  1. Home page uses the new typography scale, slate + indigo palette, and card styling consistent with doc pages
  2. Client pages (index listing and doc viewer) use the same visual language as the main doc pages
  3. Login and profile pages (Clerk-powered) render with slate + indigo palette without visual conflicts
  4. PromptBlock and Callout components use the new palette (indigo accents, slate backgrounds) instead of previous colors
**Plans**: TBD

Plans:
- [ ] 16-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 12 -> 13 -> 14 -> 15 -> 16

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
| 9. Component Library Expansion | v1.1 | 4/4 | Complete | 2026-03-10 |
| 10. Briefing & Blueprint Views | v1.1 | 3/3 | Complete | 2026-03-10 |
| 11. AI-Assisted Generation | v1.1 | 2/2 | Complete | 2026-03-10 |
| 12. Design Foundation | v1.2 | 1/1 | Complete | 2026-03-10 |
| 13. Layout Shell | v1.2 | 1/1 | Complete | 2026-03-10 |
| 14. Sidebar Navigation | v1.2 | 0/? | Not started | - |
| 15. Doc Rendering and TOC | v1.2 | 0/? | Not started | - |
| 16. Consistency Pass | v1.2 | 0/? | Not started | - |
