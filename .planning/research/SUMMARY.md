# Project Research Summary

**Project:** FXL Core v1.5 — Modular Foundation & Knowledge Base
**Domain:** Internal Operational Platform — React SPA with modular architecture, auto-fed knowledge base, and task management
**Researched:** 2026-03-12
**Confidence:** HIGH

## Executive Summary

FXL Core v1.5 is a modular upgrade to an existing React 18 + TypeScript + Supabase SPA. The project is not a greenfield build — it is layering three new capabilities (module registry, knowledge base, task management) onto 28 phases of accumulated production code. The validated approach is feature-based directory modules with a static manifest registry pattern: each new area of the platform lives under `src/modules/[name]/` and exports a typed `ModuleManifest` that drives routing, sidebar navigation, and the home page — replacing hardcoded arrays with a single source of truth. This pattern adds zero new npm dependencies and integrates directly with the existing Vite + React Router setup.

The recommended implementation path is strictly ordered: the module registry scaffold and boundary enforcement must come first (before any feature code), followed by Supabase migrations, then the Knowledge Base module, then Tasks. The knowledge base uses Supabase Postgres full-text search (tsvector generated columns + GIN index) via the existing `@supabase/supabase-js` client — no vector database, no external search service, no new packages. The task management scope is intentionally minimal (one table, one status workflow, no dependencies or notifications) to avoid the well-documented scope creep trap that turns simple task lists into Jira.

The highest-risk moment in this milestone is the module extraction phase itself. Without ESLint boundary rules installed before any file moves, cross-module imports will silently reappear within two sprints and the modular directory structure will be cosmetic only. The second critical risk is `import.meta.glob`'s requirement for string literal arguments — the knowledge base indexer cannot be parameterized and must use top-level static glob patterns per directory. Both risks are fully preventable with the tooling identified in research and must be addressed in Phase 1, not retrofitted later.

---

## Key Findings

### Recommended Stack

The v1.5 milestone requires zero new runtime npm dependencies. The entire feature set — module system, knowledge base, task management — is implementable with the existing stack. The module system uses React's built-in `lazy` + `Suspense` with Vite's automatic code splitting. State management stays with React Context + useReducer (Zustand is not needed at this scale; TanStack Query is deferred to v2 per existing PROJECT.md decision AGEN-02). New infrastructure is limited to two Supabase migrations and one optional Claude Code hook script.

**Core technologies (existing — no changes):**
- React 18.3 + TypeScript 5.6 strict — module manifests as typed constants, `ComponentType` references in route descriptors
- Vite 5.4 — automatic code splitting on `React.lazy()` dynamic imports, zero config change
- `@supabase/supabase-js` 2.x — tsvector full-text search via `.textSearch()` and `.contains()` already supported
- shadcn/ui (Card, Badge, Select, Dialog, Popover) — sufficient for all new UI without new component installs
- `@dnd-kit` (already installed) — available for kanban drag-and-drop if needed in v1.5.x

**New infrastructure (not packages):**
- Supabase migration 005: `knowledge_entries` table with tsvector generated column + GIN indexes
- Supabase migration 006: `tasks` table (and optional `projects` table) with text CHECK constraints
- Optional: `.claude/hooks/kb-auto-feed.js` — Node.js hook using native `fetch()` to Supabase REST API

**What NOT to add:** Zustand, TanStack Query, pgvector, Algolia, Meilisearch, node-fetch, micro-frontends, nx/turborepo, react-beautiful-dnd, Supabase Realtime.

### Expected Features

**Must have — table stakes (P1, ship in v1.5 core):**
- Module registry (`src/registry/modules.ts`) with typed `ModuleManifest` — architectural foundation, drives sidebar and home page dynamically
- Per-module folder structure: `src/modules/knowledge-base/`, `src/modules/tasks/`, wrapper manifests for `docs/` and `wireframe-builder/`
- Sidebar extended to render from `MODULE_REGISTRY` (replaces hardcoded navigation array)
- Migration 005: `knowledge_entries` table (entry_type/title/body/tags/client_slug/tsvector)
- KB list page, detail page, and new/edit form at `/knowledge-base/*`
- Migration 006: `tasks` table (title/description/status/priority/client_slug/due_date)
- Task list page and create/edit form at `/tasks/*`
- Home page redesign: module hub grid from registry + basic activity feed (last 10 updates across kb_entries + tasks)

**Should have — differentiators (P2, ship in v1.5.x after validation):**
- Task kanban view (`/tasks/kanban`) — 4-column board, no drag-and-drop required
- KB search integrated into existing Cmd+K (`SearchCommand.tsx`) — async KB results as a separate cmdk Group
- Task to KB entry linkage — "Document this" button on completed tasks
- Client workspace KB section — additive "Conhecimento" section in `/clients/:slug`

**Defer to v2+:**
- KB auto-capture from GSD hooks (full automation requires hook infrastructure maturity)
- Task drag-and-drop kanban
- KB entry versioning/history
- KB AI summary generation
- Task dependencies / blocking graph
- Email notifications
- Bi-directional sync with external tools

### Architecture Approach

The architecture is a single React SPA with feature-based module directories. The key structural addition is `src/registry/modules.ts` — a static constant that all three consumer points (App.tsx routes, Sidebar.tsx nav, Home.tsx cards) read from. Each module exports a `ModuleManifest` (plain TypeScript object with `id`, `displayName`, `icon`, `navItems`, `routes`, `homeCard`). Module pages access Supabase only through a module-scoped service layer (`src/modules/[name]/lib/[name]-service.ts`), never importing the Supabase client directly in components. Existing code (DocRenderer, WireframeViewer, client pages) is NOT moved during v1.5 — wrapper manifests bridge the registry without refactoring risk.

**Major components:**
1. `src/registry/modules.ts` — ModuleManifest type + MODULE_REGISTRY array, single import point for App.tsx / Sidebar.tsx / Home.tsx
2. `src/modules/knowledge-base/` — KB pages, components, service layer (`kb-service.ts`), types
3. `src/modules/tasks/` — Task pages, components, service layer (`tasks-service.ts`), types
4. Supabase migrations 005 + 006 — `knowledge_entries` (tsvector FTS) and `tasks` tables with anon-permissive RLS (same pattern as `blueprint_configs` and `briefing_configs`)
5. Modified `Sidebar.tsx` — reads `MODULE_REGISTRY.flatMap(m => m.navItems)` instead of hardcoded array
6. Modified `Home.tsx` — renders `MODULE_REGISTRY.map(m => m.homeCard)` for the module hub grid

**Critical patterns:**
- Module boundaries enforced by `eslint-plugin-boundaries` before any file moves
- Routes as `ComponentType` references in manifests (not strings) — preserves TypeScript safety and tree-shaking
- Anon-permissive RLS on new tables + Clerk auth at application layer (`useAuth().isSignedIn` gating writes) — same as existing tables
- `import.meta.glob` with string literals only — separate top-level glob constants per directory, never parameterized

### Critical Pitfalls

1. **Module boundaries without enforcement** — Directory structure alone is cosmetic. Install `eslint-plugin-boundaries` and define allowed dependency directions before moving a single file. Cross-module needs go through `src/modules/shared/`. Run `npx madge --circular --extensions ts,tsx src/` before extraction to find existing cycles. Recovery after the fact costs 1-3 days.

2. **`import.meta.glob` with variable paths** — Vite transforms `import.meta.glob` at build time; arguments must be string literals. Parameterizing the directory path silently fails or returns empty results in production. Each directory that needs globbing requires its own top-level literal call.

3. **Supabase migration breaks existing RLS** — Never mix `CREATE TABLE` for new tables and `ALTER TABLE` on existing tables in the same migration file. Column additions to existing tables must include a `DEFAULT` or be declared nullable. After every migration, immediately test the affected existing operations (blueprint save, wireframe comment).

4. **App.tsx route explosion** — Each module should export its own routes array; App.tsx composes them. Establish this composition pattern before modules ship pages. Target: App.tsx stays under 60 lines after all modules are added.

5. **Task management scope creep** — Pin the v1.5 schema to exactly one table (`tasks`). Write the "out of scope" list as a contract in the phase plan before writing any code. If a feature requires a second table, it is v1.6.

---

## Implications for Roadmap

Based on the dependency graph across all four research files, the natural phase structure is:

### Phase 1: Module Foundation & Registry

**Rationale:** The module registry is the prerequisite for everything else. Nothing else can be built with module boundaries until the registry type, boundary enforcement, and route composition pattern are in place. This is the highest-leverage phase — getting it wrong means every subsequent phase inherits the technical debt.

**Delivers:**
- `src/registry/modules.ts` with `ModuleManifest` type and initial MODULE_REGISTRY
- `eslint-plugin-boundaries` configured and passing in CI
- Pre-extraction circular dependency audit (`madge --circular`)
- Route composition pattern in App.tsx (module routes exported from modules, composed in App.tsx)
- `Sidebar.tsx` reads nav from MODULE_REGISTRY
- Wrapper manifests for existing `docs/` and `wireframe-builder/` modules
- `.planning/codebase/ARCHITECTURE.md` updated to reflect new structure

**Features addressed:** Module registry, per-module folder structure, sidebar integration (all P1 table stakes)

**Pitfalls avoided:** Module boundaries eroding, App.tsx route explosion, circular dependencies, GSD paths going stale, home page hardcoding

### Phase 2: Supabase Migrations & Data Layer

**Rationale:** Migrations must precede any UI that reads from new tables. Running migrations as a dedicated phase (not mixed with feature code) isolates the risk of production RLS issues to a single, reviewable changeset.

**Delivers:**
- `supabase/migrations/005_knowledge_entries.sql` — `knowledge_entries` table with tsvector generated column, GIN indexes, anon-permissive RLS
- `supabase/migrations/006_tasks.sql` — `tasks` table with text CHECK constraints, indexes, anon-permissive RLS
- Service layer stubs: `kb-service.ts` and `tasks-service.ts` (typed wrappers, no UI yet)
- Zod schemas for KB entry and task input validation

**Pitfalls avoided:** Migrations breaking existing RLS, anon RLS applied without review

### Phase 3: Knowledge Base Module

**Rationale:** KB is the more architecturally novel feature (full-text search, markdown body, typed entry kinds) and should be validated before the simpler task management. The KB also establishes the service layer pattern that the task module will follow.

**Delivers:**
- Full `src/modules/knowledge-base/` module: types, service, pages (KBIndex, KBEntry, KBEntryForm), components (KBEntryCard)
- Routes registered via manifest: `/knowledge-base`, `/knowledge-base/new`, `/knowledge-base/:id`
- Supabase full-text search on title + body via `.textSearch('search_vec', query, { type: 'websearch' })`
- Static `import.meta.glob` indexer using literal path pattern (not parameterized)
- Active/archived directory split defined before first entry (retention policy)

**Features addressed:** KB list + detail + form, KB full-text search, KB entry types (all P1)

**Pitfalls avoided:** `import.meta.glob` variable path, KB unbounded growth

### Phase 4: Task Management Module

**Rationale:** Tasks follow the same service layer pattern established by the KB module. Scope must be explicitly bounded before this phase begins — the "out of scope" list is a phase plan prerequisite.

**Delivers:**
- Full `src/modules/tasks/` module: types, service, pages (TasksIndex, TaskDetail), components (TaskCard, TaskForm, TaskStatusBadge)
- Routes registered via manifest: `/tasks`, `/tasks/new`, `/tasks/:id`
- List view with filter by status/client/priority
- Status workflow: todo → in_progress → done / blocked (status badge + dropdown)
- Scope hard stop: one table, no due dates/assignees/notifications in v1.5

**Features addressed:** Task entity, task status workflow, task list view, task create/edit form (all P1)

**Pitfalls avoided:** Task scope creep

### Phase 5: Home Page Modular Hub

**Rationale:** The home page redesign depends on the registry having its final shape (all modules registered). Building it last means the module grid accurately reflects what exists. The activity feed requires both new tables to be populated.

**Delivers:**
- `Home.tsx` redesigned to render `MODULE_REGISTRY.map(m => m.homeCard)` — module hub grid
- Activity feed: Supabase query across `knowledge_entries` + `tasks` ordered by `updated_at`, last 10 items
- Module cards reflect activity (entry count, last modified) — empty modules de-emphasized
- `isActive` flag per module to hide zero-content modules

**Features addressed:** Home page module hub, activity feed on home (P1)

**Pitfalls avoided:** Static home page requiring manual updates

### Phase 6: Cross-Module Integration (v1.5.x)

**Rationale:** These features depend on both KB and Tasks being live and validated by real usage. They modify existing components (SearchCommand.tsx, client pages) and should not be bundled with the primary module delivery to limit regression risk.

**Delivers:**
- KB search in Cmd+K: extend `SearchCommand.tsx` with async KB results as separate cmdk Group (`shouldFilter={false}`)
- Task to KB entry link: "Document this" button on completed tasks
- Client workspace KB section: additive "Conhecimento" section in `/clients/:slug` page
- Task kanban view: `/tasks/kanban` 4-column board (click to change status, no drag-and-drop)

**Features addressed:** KB Cmd+K integration, task kanban, task-to-KB link, client workspace KB section (all P2)

### Phase Ordering Rationale

- Registry must precede all module code — `ModuleManifest` type must exist before any module can export one; boundary rules must be in place before files move.
- Migrations must precede service layer tests — cannot test `kb-service.ts` against a table that does not exist.
- KB before Tasks — KB establishes the service layer and module structure pattern that Tasks will follow. Debugging two modules simultaneously is harder than validating one first.
- Home page last — depends on registry having final shape; home page module grid is only accurate when all modules are registered.
- Cross-module integrations in v1.5.x — these touch existing stable components; isolating them reduces regression risk on the core delivery.

### Research Flags

Phases requiring careful execution (well-documented patterns, but execution-sensitive):

- **Phase 1 (Module Foundation):** ESLint boundary configuration requires exact syntax — verify against current `eslint-plugin-boundaries` npm docs during execution. Circular dependency audit may reveal unexpected existing cycles that need resolution before proceeding.
- **Phase 3 (Knowledge Base):** `import.meta.glob` literal constraint needs explicit verification in the codebase before the indexer is built. Supabase tsvector generated column syntax should be tested in a migration dry-run.

Phases with standard, well-documented patterns (lower risk):
- **Phase 2 (Migrations):** Migration pattern is identical to existing migrations 003 and 004. Anon RLS policy is copy-paste verified.
- **Phase 4 (Tasks):** Task UI uses only existing shadcn/ui components already installed. No new patterns beyond what KB established.
- **Phase 5 (Home):** Pure read-from-registry rendering. No new Supabase calls beyond what modules already established.
- **Phase 6 (Cross-Module):** All integrations are additive — no existing behavior is changed, only extended.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new packages — all decisions grounded in existing installed versions and official docs. Supabase textSearch() and React.lazy() both verified against official documentation. |
| Features | HIGH | Table stakes and differentiators clearly separated. P1/P2/P3 prioritization grounded in operator workflow analysis and existing codebase patterns. ADR format for decision entries validated against official adr.github.io spec. |
| Architecture | HIGH | Based on direct codebase reading (App.tsx, Sidebar.tsx, supabase/migrations/). Module manifest pattern directly derived from Martin Fowler's modularizing React apps article and existing wireframe-builder structure. |
| Pitfalls | HIGH | All 9 pitfalls grounded in codebase analysis (existing App.tsx route count, docs-parser.ts glob pattern, migration RLS patterns) plus verified external sources (Vite issue #15926 for glob constraint). |

**Overall confidence:** HIGH

### Gaps to Address

- **`knowledge_entries` column naming inconsistency across research files:** STACK.md uses `kind`, FEATURES.md uses `entry_type`, ARCHITECTURE.md uses `category`. The canonical decision: use `entry_type` as the column name with values `('bug', 'decision', 'pattern', 'lesson')` — FEATURES.md rationale is most complete (ADR format validated for 'decision', retrospective insight validated for 'lesson'). Resolve in Phase 2 migration.

- **tsvector language config:** STACK.md specifies `to_tsvector('english', ...)`, FEATURES.md specifies `to_tsvector('portuguese', ...)`. FXL's KB content is in Portuguese. Use `'portuguese'` — FEATURES.md is correct. Resolve in Phase 2 migration.

- **RLS policy for `tasks` table:** Both ARCHITECTURE.md and FEATURES.md default to anon-permissive RLS (consistent with existing tables). PITFALLS.md correctly flags that this is appropriate for wireframes (public) but potentially not for internal tasks. For v1.5 (single operator), anon-permissive is acceptable. Document the assumption explicitly in migration 006: "anon-permissive intentional for single-operator v1; upgrade to Clerk JWT integration in v2 (SEC-01)."

- **Activity feed polling interval:** No research source validates the 60-second polling interval for the home page activity feed. This is a reasonable assumption for a one-operator tool but needs a conscious implementation decision in Phase 5 (polling vs. manual refresh on navigate).

---

## Sources

### Primary (HIGH confidence)
- Official React docs — `React.lazy()` and Suspense pattern
- Official Vite docs — automatic code splitting on dynamic imports
- Supabase full-text search docs — tsvector generated columns, GIN index, `textSearch()` JS client method
- Claude Code hooks reference — PostToolUse, Stop hooks, `stop_hook_active` field
- adr.github.io + MADR — ADR format for decision KB entry type
- Vite GitHub issue #15926 — `import.meta.glob` literal-only constraint
- Direct codebase analysis — `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `src/lib/docs-parser.ts`, `supabase/migrations/001-004`, `.planning/PROJECT.md`

### Secondary (MEDIUM confidence)
- Martin Fowler — Modularizing React Applications (feature-based module structure)
- developer-way.com — React project structure and state management decisions
- getstream.io — Activity feed design patterns
- BoldDesk — Internal knowledge base expected features
- AWS blog — ADR best practices
- eslint-plugin-boundaries (npm) — boundary enforcement without Nx
- madge (npm) — circular dependency detection for TypeScript projects

### Tertiary (LOW confidence / needs validation during execution)
- 60-second polling interval for activity feed — reasonable assumption, not from a sourced reference
- eslint-plugin-boundaries exact configuration syntax — verify against current npm docs during Phase 1

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
