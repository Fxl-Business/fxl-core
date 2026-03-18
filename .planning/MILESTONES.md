# Milestones

## v5.3 UX Polish (Shipped: 2026-03-18)

**Phases completed:** 7 phases, 13 plans, 5 tasks

**Key accomplishments:**
- (none recorded)

---

## v4.3 Admin Polish & Custom Auth (Shipped: 2026-03-17)

**Phases:** 4 (85-88) | **Plans:** 8 | **Tasks:** ~12
**Timeline:** 1 day (2026-03-17) | **Commits:** 23 | **LOC delta:** +2,586 / -51
**Git range:** 82847e6 → acc1047

**Delivered:** Fixed auth flow bugs, built custom Nexo login page, replaced broken Clerk client-side hooks with server-side edge functions for accurate admin metrics, and added full users management with org membership visibility.

**Key accomplishments:**
1. Custom Nexo login page (Login.tsx) with Google OAuth + email/password, replacing default Clerk SignIn component
2. Fixed ProtectedRoute infinite loading for unauthenticated users + SSO callback route
3. Admin dashboard metrics now use edge functions showing ALL Clerk orgs/users (not just current user's)
4. New admin-users edge function proxying Clerk Users API with super_admin JWT auth
5. /admin/users page listing all platform users with clickable org membership badges
6. TenantDetailPage "Membros" section with role badges (admin/member) via edge function

**Archive:** [v4.3-ROADMAP.md](milestones/v4.3-ROADMAP.md) | [v4.3-REQUIREMENTS.md](milestones/v4.3-REQUIREMENTS.md) | [v4.3-MILESTONE-AUDIT.md](milestones/v4.3-MILESTONE-AUDIT.md)

---

## v4.1 Super Admin (Shipped: 2026-03-17)

**Phases completed:** 7 phases, 10 plans, 6 tasks

**Key accomplishments:**
- (none recorded)

---

## v4.0 Rebrand Nexo (Shipped: 2026-03-17)

**Phases:** 2 (73-74) | **Plans:** 2 | **Tasks:** 4
**Timeline:** 1 session (2026-03-17) | **Commits:** 3
**Git range:** 399273e → 8e27105

**Delivered:** Renamed product from "FXL Core" / "Nucleo FXL" to "Nexo" across all user-visible surfaces, meta files, and documentation. Zero functional changes.

**Key accomplishments:**
1. Renamed 10 files across UI (Login, TopNav, Home, AppRouter), meta (index.html), and docs (CLAUDE.md, PROJECT.md, spoke-onboarding, fase2, branding-collection)
2. Preserved "FXL SDK" references (company name, not product)
3. tsc --noEmit zero errors, npm run build clean (16.36s, 3448 modules)
4. Zero grep matches for "FXL Core" or "Nucleo FXL" in src/

**Archive:** [v4.0-ROADMAP.md](milestones/v4.0-ROADMAP.md) | [v4.0-REQUIREMENTS.md](milestones/v4.0-REQUIREMENTS.md)

---

## v3.3 Generic Connector Module (Shipped: 2026-03-17)

**Phases:** 3 (70-72) | **Plans:** 3 | **Tasks:** ~6
**Timeline:** 1 session (2026-03-16) | **Commits:** 4 | **LOC delta:** +2,039 / -50
**Git range:** f75ae43 → f1f5de9

**Delivered:** Created generic connector module that consumes any spoke app via FxlAppManifest contract, rendering entities in tables/detail views and widgets (KPI, chart, table, list) with dynamic routing via catch-all `/apps/:appId/*`.

**Key accomplishments:**
1. Connector module foundation: CLAUDE.md, manifest, MODULE_IDS.CONNECTOR, catch-all route registration
2. Contract types copied inline from SDK skill with ConnectorResult<T> discriminated union pattern
3. connector-service with 5 fetch functions, 5s AbortController timeout, and 1min in-memory manifest cache
4. Icon map covering ~100 lucide icons with Box fallback for spoke icon resolution
5. Complete UI layer: EntityTable, EntityFields (pt-BR formatting), EntityList, EntityDetail, ConnectorDashboard
6. 4 widget types (KpiWidget, ChartWidget, TableWidget, ListWidget) + ConnectorRouter with nested entity routes
7. HOME_DASHBOARD extension slot integration via ConnectorHomeWidget

**Archive:** [v3.3-ROADMAP.md](milestones/v3.3-ROADMAP.md) | [v3.3-REQUIREMENTS.md](milestones/v3.3-REQUIREMENTS.md)

---

## v3.0 Reorganizacao Modular (Shipped: 2026-03-17)

**Phases completed:** 4 phases, 9 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v2.4 Component Picker Preview Mode (Shipped: 2026-03-14)

**Phases:** 2 (58-59) | **Plans:** 4 | **Tasks:** 8
**Timeline:** 1 session (2026-03-13) | **Commits:** 4 | **LOC delta:** +514 / -31
**Git range:** ed59fb9 → ea8169b

**Delivered:** Added dual-mode preview/compact toggle to the ComponentPicker dialog, allowing operators to see scaled mini-renders of all 28 section types in a 2-3 column grid before adding to the blueprint.

**Key accomplishments:**
1. Hardened defaultProps for all 28 section types with complete, Zod-valid sample data for visual rendering (6 previously empty types enriched, 17 renderability tests)
2. SectionPreview component rendering any section type as scaled-down mini-preview using registry defaultProps + WireframeThemeProvider
3. SectionPreviewCard with 25% CSS scale mini-previews, error boundary isolation, and usePickerMode hook with sessionStorage persistence
4. ComponentPicker dual-mode: preview grid (2-3 columns, max-w-4xl) + compact list toggle, mode-conditional rendering, category separators preserved

**Archive:** [v2.4-ROADMAP.md](milestones/v2.4-ROADMAP.md) | [v2.4-REQUIREMENTS.md](milestones/v2.4-REQUIREMENTS.md) | [v2.4-MILESTONE-AUDIT.md](milestones/v2.4-MILESTONE-AUDIT.md)

---

## v2.3 Inline Editing UX (Shipped: 2026-03-13)

**Phases:** 4 (54-57) | **Plans:** 7 | **Tasks:** ~14
**Timeline:** 1 session (2026-03-13) | **Commits:** 11 | **LOC delta:** +2,557 / -1,218
**Git range:** df3706c → 0725eef

**Delivered:** Replaced Sheet panels (Header, Sidebar, Filtros) with inline click-to-edit UX. Operators now click directly on any wireframe component to edit it via contextual PropertyPanel — same pattern as content blocks. AdminToolbar Layout buttons removed, 903 lines of dead code eliminated.

**Key accomplishments:**
1. Header inline editing: 4 clickable zones (logo, period, user, actions) with ZoneWrapper pattern and per-element PropertyPanel forms
2. Sidebar inline editing: clickable groups, footer, widgets with SidebarPropertyPanel routing to 3 specialized forms
3. Filter inline editing: clickable filter chips with FilterPropertyPanel, "+" button with 5 BI preset picker
4. Five-way selection mutex: header, sidebar, filter, filter-bar-action, and content selections are mutually exclusive
5. Cleanup: deleted HeaderConfigPanel, SidebarConfigPanel, FilterBarEditor (903 lines), removed AdminToolbar Layout buttons and layoutPanel state

**Archive:** [v2.3-ROADMAP.md](milestones/v2.3-ROADMAP.md) | [v2.3-REQUIREMENTS.md](milestones/v2.3-REQUIREMENTS.md) | [v2.3-MILESTONE-AUDIT.md](milestones/v2.3-MILESTONE-AUDIT.md)

---

## v2.2 Wireframe Builder — Configurable Layout Components (Shipped: 2026-03-13)

**Phases:** 7 (47-53) | **Plans:** 7 | **Tasks:** 21
**Timeline:** 1 session (2026-03-13) | **Commits:** 28 | **LOC delta:** +3,398 / -108
**Git range:** dd235b3 → b7aee95

**Delivered:** Made sidebar, header, and filter bar of the wireframe fully configurable via visual editor panels. Added widget system for sidebar (WorkspaceSwitcher, UserMenu), extended HeaderConfig with brandLabel/periodType, and built per-screen filter bar editor with BI presets.

**Key accomplishments:**
1. SidebarWidget discriminated union (TypeScript + Zod) with backward-compatible schema extension and .passthrough() for forward-compat
2. All HeaderConfig fields wired to conditional rendering in WireframeHeader across 4 call sites (period selector, user indicator, action buttons)
3. Dashboard-level mutation infrastructure: updateWorkingConfig() helper + AdminToolbar Layout button group + 3 Sheet panels
4. HeaderConfigPanel with live preview: toggles, brandLabel input, periodType select (mensal/anual)
5. SIDEBAR_WIDGET_REGISTRY + WorkspaceSwitcherWidget + UserMenuWidget with collapsed rail mode degradation
6. SidebarConfigPanel: footer text, group CRUD with screen assignment, widget picker
7. FilterBarEditor: per-screen FilterOption[] CRUD with 5 BI presets and inline editing of all 5 filter types

**Archive:** [v2.2-ROADMAP.md](milestones/v2.2-ROADMAP.md) | [v2.2-REQUIREMENTS.md](milestones/v2.2-REQUIREMENTS.md)

---

## v2.1 Dynamic Data Layer (Shipped: 2026-03-13)

**Phases:** 4 (43, 44, 45, 46) | **Plans:** 8 | **Tasks:** ~16
**Timeline:** 1 session (2026-03-13) | **Commits:** 25 | **LOC delta:** +1,024 / -34
**Git range:** bc96816 → 722abe9

**Delivered:** Migrated all process/documentation content from static .md files to Supabase, with dynamic rendering in the app (DocRenderer, sidebar nav, search index all consuming database), bidirectional sync CLI for Claude Code workflow, and in-memory prefetch cache for instant navigation.

**Key accomplishments:**
1. Supabase `documents` table with B-tree indexes on parent_path/sort_order, anon-permissive RLS, and migration 007
2. Seed script migrating all 62 docs with frontmatter extraction, custom tag preservation, and 15-point automated verification
3. DocRenderer fetching from Supabase with skeleton loading, docs-service data access layer, and useDoc hook
4. Dynamic sidebar navigation via useDocsNav hook building NavItem tree from documents table
5. Async search index loaded lazily on Cmd+K, fully decoupled from Vite glob imports
6. Bidirectional sync CLI: `make sync-down` (DB→filesystem) and `make sync-up` (filesystem→DB) with YAML frontmatter reconstruction

**Archive:** [v2.1-ROADMAP.md](milestones/v2.1-ROADMAP.md) | [v2.1-REQUIREMENTS.md](milestones/v2.1-REQUIREMENTS.md)

---

## v2.0 Framework Shell + Arquitetura Modular (Shipped: 2026-03-13)

**Phases:** 5 (38, 39, 40, 41, 42) | **Plans:** 8 | **Tasks:** ~16
**Timeline:** 1 session (2026-03-13) | **Commits:** 26 | **LOC delta:** +3,089 / -381
**Git range:** 4177548 → 98634e8

**Delivered:** Transformed FXL Core from monolithic app into modular framework shell with typed ModuleDefinition registry, cross-module extension architecture (slots + contracts), runtime module enable/disable, Home 2.0 control center, and admin panel for module management.

**Key accomplishments:**
1. Module Registry Foundation: zero-import `module-ids.ts` constants, `ModuleDefinition` extending `ModuleManifest` with extensions/badge/enabled, `useModuleEnabled` hook with localStorage persistence
2. Slot Architecture & Contract Types: `SlotComponentProps`, `SLOT_IDS`, pure `resolveExtensions()` function, `ExtensionProvider`/`ExtensionSlot` React runtime wired into App.tsx provider stack
3. Routing Refactor: sidebar driven by enabled modules via `useModuleEnabled` context, Home NavLink `end` prop exact-match fix
4. Home 2.0 Control Center: asymmetric 2/3+1/3 layout with featured module card, FXL identity card, Supabase-backed activity feed and module stats
5. Contract Population & Admin Panel: 2 real cross-module extension widgets (RecentTasksWidget, RecentKBWidget) rendering via slot injection, `/admin/modules` panel with enable/disable toggles and extension visibility

**Archive:** [v2.0-ROADMAP.md](milestones/v2.0-ROADMAP.md) | [v2.0-REQUIREMENTS.md](milestones/v2.0-REQUIREMENTS.md)

---

## v1.6 12 Novos Graficos (Shipped: 2026-03-13)

**Phases:** 4 (34, 35, 36, 37) | **Plans:** 7 | **Tasks:** ~17
**Timeline:** 1 day (2026-03-12 → 2026-03-13) | **Commits:** 10 | **LOC:** 33,583 TypeScript
**Git range:** c738499 → b9522bd

**Delivered:** Expanded wireframe builder component library with 12 new chart/section types — 7 chartType sub-variants via Extension Point A, 4 standalone sections via Extension Point B, and 1 Sankey diagram — all with ComponentGallery entries, mock data, and light/dark mode validation.

**Key accomplishments:**
1. Extended ChartType union with 7 new literals (grouped-bar, bullet, step-line, lollipop, range-bar, bump, polar) and implemented all with ChartRenderer wiring
2. Added 4 standalone section types (Pie Chart, Progress Grid, Heatmap, Sparkline Grid) via 5-file checklist pattern (type, schema, component, renderer, form, registry)
3. Added Sankey diagram as 28th section type with Recharts Sankey export verification
4. Updated ComponentGallery with all 12 new types and realistic Brazilian Portuguese financial mock data
5. Visual validation of all 12 types in light/dark mode; synced gallery wireframe theme with global app theme
6. Section registry grew from 23 to 28 types; 34 files changed, +2,363 lines

**Archive:** [v1.6-ROADMAP.md](milestones/v1.6-ROADMAP.md) | [v1.6-REQUIREMENTS.md](milestones/v1.6-REQUIREMENTS.md)

---

## v1.5 Modular Foundation & Knowledge Base (Shipped: 2026-03-13)

**Phases:** 5 (29, 30, 31, 32, 33) | **Plans:** 14 | **Tasks:** ~28
**Timeline:** 1 day (2026-03-12 → 2026-03-13) | **Commits:** 53 | **LOC:** 30,289 TypeScript
**Git range:** 294d3a7 → 7c5250f

**Delivered:** Transformed FXL Core from monolithic system into modular platform with typed module registry, knowledge base with full-text search (Portuguese), task management with kanban board, and operational home page hub with cross-module activity feed.

**Key accomplishments:**
1. Module registry pattern: ModuleManifest type + MODULE_REGISTRY driving sidebar, routing, and home page — replaced 126-line hardcoded nav array
2. Supabase migrations for knowledge_entries (tsvector/GIN FTS) and tasks (status/priority CHECK constraints) with anon-permissive RLS
3. Knowledge Base module: list/detail/form/search pages with 4 entry types, ADR template for decisions, full-text search in Portuguese
4. Task Management module: list/kanban/form pages with optimistic status updates and DocumentarButton cross-module link to KB
5. Home page rewrite: MODULE_REGISTRY grid + useActivityFeed hook with parallel Supabase queries
6. KB integration: Conhecimento section in client workspace + KB entries in Cmd+K search dialog

**Archive:** [v1.5-ROADMAP.md](milestones/v1.5-ROADMAP.md) | [v1.5-REQUIREMENTS.md](milestones/v1.5-REQUIREMENTS.md)

---

## v1.4 Wireframe Visual Redesign (Shipped: 2026-03-13)

**Phases:** 7 (22, 23, 24, 25, 26, 27, 28) | **Plans:** 12 | **Tasks:** ~24
**Timeline:** 2 days (2026-03-11 → 2026-03-13) | **Commits:** 44 | **LOC delta:** +6,878 / -430
**Git range:** 2b3ed25 → 87d9ac5

**Delivered:** Complete visual overhaul of all wireframe components with professional financial dashboard aesthetic — primary blue #1152d4, slate palette, Inter extrabold typography, dark sidebar, group-hover effects, backdrop-blur filter bar, and new CompositionBar chart type.

**Key accomplishments:**
1. Token foundation: slate + blue palette replacing stone/gold, --wf-primary as canonical accent, branding override pipeline with WireframeThemeProvider
2. Sidebar & header chrome: dark slate sidebar with active/hover states, 3-column header with search/notifications/user chip
3. KPI cards: icon slot with group-hover color inversion, rounded-full trend badges, extrabold values
4. Table components: text-[10px] font-black uppercase tracking-widest headers, dark footer totals row
5. Filter bar: sticky backdrop-blur-sm container, vertical stacked labels, action button hierarchy
6. Chart palette: blue-slate chart colors across all 15 components, activeBar opacity hover, new CompositionBar component

**Archive:** [v1.4-ROADMAP.md](milestones/v1.4-ROADMAP.md) | [v1.4-REQUIREMENTS.md](milestones/v1.4-REQUIREMENTS.md)

---

## v1.3 Builder & Components (Shipped: 2026-03-11)

**Phases:** 5 (17, 18, 19, 20, 21) | **Plans:** 14 | **Tasks:** ~28
**Timeline:** 1 day (2026-03-11) | **Commits:** 39 | **LOC delta:** +7,874 / -184
**Git range:** eaadf76 → f1f1af4

**Delivered:** Expanded wireframe builder with configurable sidebar/header driven by BlueprintConfig data, typed filter dispatch with 5 sub-components, 6 new chart variants (stacked-bar, stacked-area, horizontal-bar, bubble, gauge, composed), and gallery reorganized into 6 thematic sections.

**Key accomplishments:**
1. Schema foundation: SidebarConfig and HeaderConfig at dashboard level in BlueprintConfig, FilterOption.filterType discriminator
2. Configurable sidebar: collapse rail, grouped sections with icons, badge counts, footer from config
3. Configurable header: logo/brand slot, period selector, user/role indicator, action buttons
4. Filter bar expansion: 5 filter sub-components (Select, DateRange, MultiSelect, Search, Toggle) with compare toggle
5. Chart type expansion: 6 new variants including GaugeChart with PieChart arcs + SVG needle
6. Gallery reorganized into 6 thematic sections with all new component previews

**Archive:** [v1.3-ROADMAP.md](milestones/v1.3-ROADMAP.md) | [v1.3-REQUIREMENTS.md](milestones/v1.3-REQUIREMENTS.md)

---

## v1.2 Visual Redesign (Shipped: 2026-03-11)

**Phases:** 5 (12, 13, 14, 15, 16) | **Plans:** 7 | **Tasks:** ~14
**Timeline:** 4 days (2026-03-06 → 2026-03-10) | **Commits:** 38 | **LOC delta:** +5,483 / -334
**Git range:** 42d4c29 → eec033c

**Delivered:** Complete visual redesign of FXL Core with slate + indigo palette, Inter/JetBrains Mono typography, frosted glass header, border-l rail navigation, dark-themed syntax-highlighted code blocks, right-side TOC with scroll tracking, and consistent visual language across all pages.

**Key accomplishments:**
1. Design foundation with slate + indigo CSS palette, Inter/JetBrains Mono fonts via @fontsource-variable, and wireframe --wf-* token isolation
2. Frosted glass sticky header with viewport-level scrolling, input-styled search trigger, and page-delegated width constraints
3. Sidebar border-l rail navigation with indigo-600 active states, uppercase section headers, and container-level sub-item indentation
4. Dark-themed code blocks with rehype-highlight syntax highlighting, terminal dots, and upgraded prose typography hierarchy
5. Right-side table of contents with IntersectionObserver scroll tracking, border-l rail, and sticky positioning
6. Consistency pass aligning Home, client pages, auth pages, and shared components (Callout, PromptBlock, InfoBlock) to new visual language

**Archive:** [v1.2-ROADMAP.md](milestones/v1.2-ROADMAP.md) | [v1.2-REQUIREMENTS.md](milestones/v1.2-REQUIREMENTS.md)

---

## v1.1 Wireframe Evolution (Shipped: 2026-03-10)

**Phases:** 5 (7, 8, 9, 10, 11) | **Plans:** 15 | **Tasks:** ~30
**Timeline:** 2 days (2026-03-09 → 2026-03-10) | **Commits:** 90 | **LOC delta:** +10,716 / -2,192
**Git range:** 443e9e4 → HEAD

**Delivered:** Wireframe system evolved from static config files into a full DB-backed pipeline with semantic design tokens, 21 section types, structured briefing input, and AI-assisted blueprint generation from business context.

**Key accomplishments:**
1. Blueprint infrastructure: DB-only storage with Zod validation (21 section types), schema migration framework, and optimistic locking with conflict resolution
2. Wireframe design system: --wf-* semantic tokens (warm stone grays + gold accent), dark/light mode toggle, client branding overrides without app theme collision
3. Section registry pattern: single source of truth for 21 types replacing 5+ switch statements, with 6 new blocks and 5 new chart variants
4. Generic parametric wireframe viewer (/clients/:clientSlug/wireframe) replacing hardcoded per-client pages
5. Structured briefing form with Supabase persistence, blueprint text view with collapsible screens, and Markdown export for Claude Code
6. AI generation engine: pure function mapping BriefingConfig modules to screens via 10 typed recipes + 3 vertical templates, with CLI bridge for operator invocation

**Archive:** [v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md) | [v1.1-REQUIREMENTS.md](milestones/v1.1-REQUIREMENTS.md)

---

## v1.0 MVP (Shipped: 2026-03-09)

**Phases:** 9 (1, 2, 02.1, 02.2, 02.3, 3, 4, 5, 6) | **Plans:** 27 | **Tasks:** ~58
**Timeline:** 4 days (2026-03-06 → 2026-03-09) | **Commits:** 180 | **LOC:** 16,808 TypeScript
**Git range:** ad5ab8e → 91a6c68

**Delivered:** FXL Core evolved from static documentation renderer into full operational platform with interactive wireframe editing, client feedback, structured branding, config pipeline, and automated BI dashboard spec generation.

**Key accomplishments:**
1. Documentation reorganized with 4-section taxonomy (Processo, Padroes, Ferramentas, Clientes) and operator onboarding
2. Persistent wireframe comments with Supabase + Clerk auth + client share links
3. 22 block specs as detailed component-generation prompts with synchronized gallery
4. Production-grade visual redesign with semantic token system and dark mode
5. Full wireframe visual editor with property panels, screen management, and Supabase sync
6. Structured branding process with automatic CSS var + chart color application to wireframes
7. TechnicalConfig schema + Config Resolver merging Blueprint + TechnicalConfig + Branding into GenerationManifest
8. Product spec generator producing 6-file BI dashboard specs ready for Claude Code generation

### Known Gaps

- **GSKILL-01/GSKILL-02:** Global Skills for Claude Code (deferred to v2 — phase never materialized when 02.3 was repurposed)
- **BRND-01/02/03:** Missing VERIFICATION.md for Phase 04 (work confirmed via SUMMARYs, no independent verification)

**Archive:** [v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md) | [v1.0-REQUIREMENTS.md](milestones/v1.0-REQUIREMENTS.md) | [v1.0-MILESTONE-AUDIT.md](milestones/v1.0-MILESTONE-AUDIT.md)

---

