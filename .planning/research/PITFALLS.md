# Pitfalls Research

**Domain:** Adding modular architecture, auto-fed knowledge base, and task management to an existing React 18 + Vite + TypeScript SPA (28 phases of accumulated code, 86 wireframe component files, 4 Supabase tables, single App.tsx routing)
**Researched:** 2026-03-12
**Confidence:** HIGH (grounded in direct codebase analysis of App.tsx, src/lib/docs-parser.ts, supabase/migrations/, vite.config.ts, and the current PROJECT.md; supplemented by WebSearch on circular dependency detection, ESLint boundary enforcement, Vite import.meta.glob constraints, and Supabase JSONB migration patterns)

---

## Critical Pitfalls

### Pitfall 1: Refactoring to Modules Without Enforcing Boundaries First

**What goes wrong:**
The team reorganizes files into `src/modules/docs/`, `src/modules/wireframe-builder/`, `src/modules/knowledge-base/`, `src/modules/tasks/` but never installs a boundary linter. Within two sprints, cross-module imports reappear: the task module imports a helper from the wireframe-builder module, the knowledge-base imports a type from the docs module's internals. The modular directory structure exists cosmetically but the dependency graph is still a tangled monolith. When a module needs to be extracted or independently deployed later, untangling takes as long as the original refactor.

**Why it happens:**
Directory restructuring is visible progress. Import enforcement is invisible discipline. Without a lint rule that fails CI when `src/modules/tasks` imports from `src/modules/wireframe-builder`, the boundary erodes silently on every PR that "just needs this one utility from over there."

**How to avoid:**
Install `eslint-plugin-boundaries` (no Nx required, works in any Vite project) before moving a single file. Define allowed dependency directions:

```jsonc
// .eslintrc boundaries config
"boundaries/element-types": [
  "error",
  {
    "default": "disallow",
    "rules": [
      { "from": "modules/tasks", "allow": ["modules/shared"] },
      { "from": "modules/knowledge-base", "allow": ["modules/shared"] },
      { "from": "modules/docs", "allow": ["modules/shared"] },
      { "from": "modules/wireframe-builder", "allow": ["modules/shared"] }
    ]
  }
]
```

Cross-module needs go through `src/modules/shared/` (types, hooks, utilities). Modules communicate via shared contracts, not direct imports.

**Warning signs:**
- Files moved to new module directories but no new ESLint config committed
- A module's `index.ts` re-exports internal implementation files (barrel file over-exposure)
- TypeScript builds cleanly but `madge --circular src/` shows cycles between modules

**Phase to address:**
Module Foundation phase (first) — boundary rules must be in place before any code moves. Enforcing boundaries AFTER migration is exponentially harder.

---

### Pitfall 2: App.tsx Route Explosion as Modules Add Their Own Pages

**What goes wrong:**
The current `App.tsx` already has 20+ route definitions mixing client pages, tool pages, doc pages, and auth. As the knowledge-base module adds `/kb/*` routes and the task module adds `/tasks/*` routes, `App.tsx` grows to 40-60 route entries, becoming unreadable and a merge conflict magnet. Worse: each module's routes are embedded in the same file as unrelated routes, so adding a new module-level route means touching the top-level routing file, violating the encapsulation goal of modularization.

**Why it happens:**
React Router's flat route array in a single file is the path of least resistance. Each new feature adds two lines and moves on. The file is never "broken" — it just grows.

**How to avoid:**
Establish a route composition pattern from day one of the module phase. Each module exports its own routes array:

```typescript
// src/modules/knowledge-base/routes.tsx
export const kbRoutes = [
  { path: '/kb', element: <KnowledgeBaseHome /> },
  { path: '/kb/:entryId', element: <KbEntryView /> },
]
```

`App.tsx` composes them:
```typescript
import { kbRoutes } from '@/modules/knowledge-base/routes'
import { taskRoutes } from '@/modules/tasks/routes'
// ...
<Routes>
  {kbRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
  {taskRoutes.map(r => <Route key={r.path} path={r.path} element={r.element} />)}
</Routes>
```

This keeps `App.tsx` as an orchestrator, not an implementation file.

**Warning signs:**
- App.tsx exceeds 80 lines during module migration
- A module's page component is imported directly at the top of App.tsx alongside unrelated pages
- PRs for different modules always touch App.tsx and create merge conflicts

**Phase to address:**
Module Foundation phase — establish route composition pattern alongside boundary enforcement, before modules ship pages.

---

### Pitfall 3: import.meta.glob Literal-Only Constraint Breaks Knowledge Base Dynamic Indexing

**What goes wrong:**
The current docs parser uses `import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true })` — a literal string pattern. The knowledge base needs to index files from a different directory (e.g. `.planning/research/` or a future `knowledge/` directory). The temptation is to accept a directory path as a parameter and pass it to `import.meta.glob`. This silently fails at build time or throws a runtime error: Vite requires ALL arguments to `import.meta.glob` to be string literals, resolved at build time. Variables are not allowed.

**Why it happens:**
Vite's `import.meta.glob` looks like a regular function call in TypeScript but is actually a build-time transformation. The constraint (literals only) is documented but easy to miss, especially when adapting the existing `docs-parser.ts` pattern for the knowledge base.

Source: Vite issue #15926 — "Making a function that uses `import.meta.glob()` is not statically analyzable when it could be."

**How to avoid:**
Each distinct directory that needs globbing must have its own top-level `import.meta.glob` call with a literal pattern:

```typescript
// In knowledge-base parser — literal only
const kbFiles = import.meta.glob('/knowledge/**/*.md', { query: '?raw', import: 'default', eager: true })

// Cannot do this — will break at build time:
// function parseDirectory(dir: string) {
//   const files = import.meta.glob(`${dir}/**/*.md`) // ERROR: not a literal
// }
```

Design the knowledge base indexer with separate, static glob patterns per content type. If the knowledge base needs to pull from multiple directories, declare multiple top-level glob calls.

**Warning signs:**
- A knowledge base indexer function accepts a `basePath` or `directory` parameter and passes it to `import.meta.glob`
- Vite build succeeds locally but the knowledge base shows empty results in production (eager: false glob with variable path fails silently in prod bundle)
- The pattern was adapted from `docs-parser.ts` but the directory path is a variable rather than a literal

**Phase to address:**
Knowledge Base phase — verify the glob pattern before building the indexer. Test with `eager: true` to confirm files are picked up at build time.

---

### Pitfall 4: Knowledge Base Growing Unbounded Without Prune/Archive Strategy

**What goes wrong:**
The knowledge base is designed to be "auto-fed" — bugs, decisions, and patterns are added over time. Six months in, it has 300+ entries. The docs-parser (which uses `eager: true` glob loading) pulls ALL entries into the initial JavaScript bundle. Search index grows. The initial page load time increases to 4-6 seconds. Claude's context window fills with KB entries before it reads the relevant ones. The knowledge base has become the problem it was meant to solve: noise drowning out signal.

**Why it happens:**
Adding entries is frictionless by design. Removing entries feels like losing knowledge. There is no defined maximum size, no archival policy, no mechanism to mark entries as "resolved" or "superseded."

**How to avoid:**
Define the retention policy before the first entry is written:
1. **Entry states:** Active (current, searchable), Resolved (superseded, archive-only), Archived (older than 6 months or explicitly closed)
2. **Bundle boundary:** Only Active entries are included in the eager glob. Resolved/Archived entries live in a separate directory and are lazy-loaded.
3. **Size gate:** Monthly review — any KB section with more than 50 entries triggers a summary/consolidation pass (combine related entries into a pattern document).
4. **Supabase persistence option:** For long-lived KB, consider moving entries to Supabase table (`knowledge_entries`) with metadata (tags, status, created_at, superseded_by). The Vite glob approach is appropriate for bootstrapping; it hits limits at ~200 entries.

**Warning signs:**
- KB directory has more than 100 `.md` files with no subdirectory organization
- `npx vite build` bundle analysis shows KB content in the main chunk rather than code-split
- Claude's responses in sessions start with extensive KB context summaries before addressing the actual question

**Phase to address:**
Knowledge Base phase — architecture (file layout, naming, active/archived split) before content creation. Do not design the indexer without also designing the archival boundary.

---

### Pitfall 5: Circular Dependencies Introduced During Module Extraction

**What goes wrong:**
The existing codebase has no circular dependency enforcement. When moving files from `src/components/` and `src/pages/` into module directories, it is common to create cycles: `modules/shared` imports from `modules/docs` for a utility, `modules/docs` imports from `modules/shared` for a type, and now shared → docs → shared is a cycle. TypeScript does not error on cycles. Vite does not warn on cycles at build time (though webpack's `circular-dependency-plugin` exists, Vite's equivalent is not built-in). The cycle manifests as an undefined import at runtime in specific execution orders — a bug that is intermittent and hard to reproduce.

**Why it happens:**
Large codebases accumulate implicit dependencies. When files are moved, their hidden coupling becomes cycles. Barrel files (`index.ts` that re-exports everything in a directory) are a primary amplifier — importing anything from a barrel transitively imports everything, creating cycles through paths that were never intended.

**How to avoid:**
1. Run `madge --circular --extensions ts,tsx src/` before starting any module extraction. Fix existing cycles first.
2. Add `eslint-plugin-import/no-cycle` to the ESLint config.
3. Avoid barrel files in modules. Instead of `modules/docs/index.ts` re-exporting everything, export only the module's public API explicitly.
4. Use `import type { Foo }` for type-only imports — these are erased at runtime and cannot create runtime cycles.

```bash
# Install detection tools before refactoring
npm install -D madge eslint-plugin-import
npx madge --circular --extensions ts,tsx src/
```

**Warning signs:**
- A module's `index.ts` re-exports more than 5-6 symbols (barrel file scope creep)
- TypeScript compiles but a module's import resolves to `undefined` at runtime on first load
- `import.meta.hot` reloads cause inconsistent module initialization in development

**Phase to address:**
Module Foundation phase — run circular dependency audit before extraction begins. The report is a prerequisite for the extraction plan.

---

### Pitfall 6: Task Management Scope Creep (Starting Simple, Ending Jira)

**What goes wrong:**
The task management MVP is scoped as "basic kanban/list per client + for FXL Core itself." During implementation, feature requests arrive: due dates, assignees, priority levels, recurring tasks, task dependencies, email notifications, time tracking. Each request seems small. After six weeks, the task module is 30+ components, 5 new Supabase tables, and 3,000 lines of TypeScript. It has consumed the entire v1.5 milestone. The original goals (modular architecture, knowledge base) are deprioritized.

**Why it happens:**
Task management has an infinite feature surface. Every team has "just one more thing" they need. The first usable state (a list you can check off) is actually enough value to justify stopping there for v1, but it feels incomplete compared to commercial tools.

**How to avoid:**
Define the hard boundary for v1.5 task management in the phase plan, not the feature plan:
- **In scope v1.5:** Task entity (title, status, client_slug, created_at), list view per client, create/complete/delete, link to existing client entities (blueprint, wireframe screens)
- **Out of scope v1.5:** Due dates, assignees, priorities, notifications, subtasks, dependencies, recurring tasks, time tracking, comments on tasks (separate from wireframe comments)

Pin the Supabase schema to exactly ONE new table (`tasks`) in the migration for this milestone. If a feature requires a second table, it is deferred to v1.6.

**Warning signs:**
- The task module plan lists more than 8 distinct user-facing features
- A new Supabase migration is proposed for tasks during the same milestone as the module foundation migration
- The task component count exceeds 10 files before the basic list view is shipped

**Phase to address:**
Task Management phase — write the "out of scope" list in the phase plan before writing any code. Show it to all stakeholders. Treat it as a contract.

---

### Pitfall 7: Supabase Schema Migration Breaks Existing RLS Policies

**What goes wrong:**
The v1.5 milestone adds new tables (`knowledge_entries`, `tasks`). The migration also restructures an existing table (e.g. adding a `module` column to `blueprint_configs` to support per-module filtering). The migration runs successfully in development. In production, the new `ALTER TABLE` statement succeeds but the existing RLS policies reference columns that have been renamed or the policy `WITH CHECK` clause is evaluated against the new schema and silently rejects inserts from the anon role. Wireframe saves start failing for the pilot client.

**Why it happens:**
The existing tables use permissive RLS policies (`USING (true)` for anon) inherited from the Clerk migration (002). These are broad by design. But if a migration renames a column referenced in a policy expression, or adds a `NOT NULL` constraint to a column without a default, the policy evaluation fails. Supabase CLI does not validate policy correctness against the new schema before applying.

**How to avoid:**
1. **Never alter existing tables in the same migration as creating new tables.** Separate concerns into atomic migrations: `005_knowledge_entries.sql` and `006_tasks.sql` and `007_blueprint_module_column.sql`.
2. **Test migrations against production data shapes locally using `make migrate`** with a snapshot of the production schema before pushing.
3. **After every migration in production, immediately test the affected operation** (e.g. save a blueprint, create a comment) before assuming success.
4. **Column additions to existing tables must have DEFAULT values or be nullable** if existing rows must remain valid.

```sql
-- Safe: nullable addition, no existing rows break
ALTER TABLE public.blueprint_configs ADD COLUMN module text;

-- Risky: NOT NULL without default breaks existing rows
ALTER TABLE public.blueprint_configs ADD COLUMN module text NOT NULL; -- DO NOT DO THIS
```

**Warning signs:**
- A migration file that contains both `CREATE TABLE` and `ALTER TABLE` on different existing tables
- A new column added to an existing table without a `DEFAULT` or `NULL` declaration
- Post-migration: Supabase dashboard shows increased error rates in the `blueprint_configs` table operations

**Phase to address:**
Every phase that adds a Supabase migration — review the migration against existing RLS policies before applying. Add a post-migration verification checklist item.

---

### Pitfall 8: Modular Home Page Becomes a Static Hub That Needs Constant Manual Updates

**What goes wrong:**
The home page is redesigned as a "module hub" with cards for Docs, Wireframe Builder, Knowledge Base, Tasks. Each card is hardcoded in `Home.tsx` with a title, description, and link. When a new module is added in v1.6, someone must remember to add a card to Home.tsx. Six months later, the home page doesn't reflect the actual modules active in the system. More subtly: the home page shows the Knowledge Base card even when there are zero entries, and the Tasks card even when no tasks exist — making the platform feel empty to a new user.

**Why it happens:**
The first implementation of a hub page is always hardcoded. It ships fast, looks complete, and seems like it can be made dynamic "later." Later never comes because the hub works well enough.

**How to avoid:**
Design the home page against a `ModuleManifest` type from day one:

```typescript
type ModuleCard = {
  id: string
  title: string
  description: string
  href: string
  isActive: boolean // computed, not hardcoded
  count?: number    // e.g. number of KB entries, tasks in flight
}
```

Each module exports its manifest entry. `Home.tsx` maps over the array. Adding a module = adding one manifest entry, not editing the home page. The `isActive` flag allows hiding modules with no content.

**Warning signs:**
- `Home.tsx` contains hardcoded string titles and descriptions for each module (not imported from module manifests)
- A new module shipped in a PR did not include an update to the home page
- The home page shows "0 entries" or empty state for multiple modules simultaneously

**Phase to address:**
Module Foundation phase — define `ModuleManifest` type as part of the module contract. Home page phase — implement map-over-manifest rendering, not hardcoded cards.

---

### Pitfall 9: GSD Workflow (.claude/) Tightly Coupled to File Paths That Move During Modularization

**What goes wrong:**
The GSD workflow (`.claude/get-shit-done/`, slash commands) reads from and writes to specific paths: `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/research/`. Phase plans reference `src/components/layout/`, `src/pages/`, `src/lib/`. After modularization, some files move to `src/modules/docs/components/`, `src/modules/shared/lib/`. Existing phase plans and the ARCHITECTURE.md in `.planning/codebase/` now reference wrong paths. Claude Code, reading these plans, writes new code to the old locations or reads stale architecture context.

**Why it happens:**
Planning documents are written once and read many times. They are not code — they don't fail a build when they go stale. The GSD system has no mechanism to detect that an architecture snapshot has diverged from the actual codebase.

**How to avoid:**
1. **In the Module Foundation phase plan, explicitly list every file that will move**, its current path and its target path. This creates a migration manifest that can be referenced during execution.
2. **Update `.planning/codebase/ARCHITECTURE.md` as part of the Module Foundation phase completion criteria**, not as an afterthought.
3. **After modularization, run a quick validation:** `grep -r "src/components/layout\|src/pages/clients" .planning/` — any hits in phase plans that still reference old paths need updating.
4. **Do not rename or move `.planning/` directory structure.** The GSD workflow reads `.planning/STATE.md` and `.planning/ROADMAP.md` as fixed paths. These are infrastructure, not code.

**Warning signs:**
- A phase plan from a previous milestone references `src/pages/` paths that no longer exist
- Claude Code creates a new component in `src/components/` during the module phase instead of the target module directory
- `.planning/codebase/ARCHITECTURE.md` was last updated before the module migration

**Phase to address:**
Module Foundation phase — update ARCHITECTURE.md as a gating condition for phase completion. Add a "stale path audit" to the verification checklist.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Keeping all routes in App.tsx during module migration | Avoids restructuring routing mid-flight | App.tsx becomes a 60-line merge conflict magnet; new modules must touch unrelated file | Never — establish route composition at phase start |
| Using directory structure alone (no ESLint boundary rules) as module enforcement | Fast to set up, zero tooling | Boundaries erode within 2 sprints; cross-module imports reappear silently | Never — linting is the only enforcement that survives team growth |
| Eager-loading all KB entries in a single `import.meta.glob` | Simple, works immediately | Bundle grows linearly with KB content; initial load time degrades past 100 entries | Acceptable for initial KB prototype up to ~50 entries; migrate to lazy/paginated before that |
| Hardcoding task management MVP features as separate Supabase tables each | Each feature ships independently | Schema sprawl; future consolidation is a data migration; RLS policies per table multiply | Never for v1.5 — one `tasks` table covers the MVP; additional tables are v1.6 |
| Skipping circular dependency audit before modularization | Saves 2 hours upfront | Runtime `undefined` imports appear intermittently; root cause is a 3-hop cycle through barrel files — takes days to debug | Never — madge scan is a 10-minute investment |
| Knowledge base entries stored as flat `.md` files in a single directory | Zero schema design required | Past 80 entries, navigation and search degrade; no metadata for filtering by tag, status, or module | Acceptable for initial 20-30 entries; design subdirectory structure and metadata before that |

---

## Integration Gotchas

Common mistakes when connecting the new modules to existing services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase + new module tables | Adding `NOT NULL` column to existing table without `DEFAULT` in the migration | Always add a `DEFAULT` or declare `NULL`; test migration against a copy of the current production data shape |
| Clerk auth + task ownership | Storing `clerk_user_id` as a foreign key in tasks but not in an RLS policy, making all tasks visible to all operators | Add RLS policy that filters by `auth.uid()` equivalent for Clerk; or use Clerk org membership as the access control boundary |
| Vite aliases + new module directories | Importing from `@/modules/tasks/` when Vite alias `@` only resolves to `src/` | `@/modules/tasks/` already works if modules live under `src/modules/`. Verify with a test import before restructuring 20 files. |
| docs-parser + knowledge base parser | Copying docs-parser.ts and adding a `kbFiles` variable with a dynamic path argument | `import.meta.glob` arguments must be string literals — separate static glob calls per directory, not a parameterized function |
| App theme tokens + module-specific tokens | A new module adds custom CSS variables to `globals.css` that collide with existing `--primary`, `--card`, `--border` | Use a module-specific prefix: `--kb-*` for knowledge base, `--task-*` for tasks. Never add to the global token namespace without a prefix. |
| Sidebar navigation + dynamic modules | Manually adding sidebar entries in `Sidebar.tsx` for each new module | Sidebar reads from a nav config array; each module exports its nav entry; `Sidebar.tsx` maps over the array |

---

## Performance Traps

Patterns that work at small scale but fail as the system grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Eager-loading all KB markdown files at build time | Build succeeds; initial load is slow; main bundle is large | Use `eager: false` for KB files; implement paginated or search-triggered loading | Around 80-100 KB entries (~300-500KB raw markdown) |
| Sidebar rendering the full doc tree on every navigation | Sidebar re-renders on every route change; sluggish navigation | Memoize sidebar nav config; compute it once outside the component render cycle | Not noticeable until docs/ has 50+ pages or the sidebar has 3+ levels of nesting |
| Supabase `tasks` table with no index on `client_slug` | Queries are fast with 1 client and 50 tasks; slow with 10 clients and 500 tasks | Add `CREATE INDEX idx_tasks_client_slug ON tasks(client_slug)` in the initial migration | Around 500 rows with full-table scans per client page load |
| Knowledge base search scanning all entries in JavaScript | Fast for 30 entries; slow for 300 | Use a search index (Fuse.js or similar) built at parse time; do not filter in render | Around 100 entries where linear JS search exceeds 16ms frame budget |

---

## Security Mistakes

Domain-specific security issues for this milestone.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Knowledge base entries stored in `.planning/` or `docs/` with internal business data (client pricing, internal decisions) committed to git | Internal business data leaked if repo is ever made public or shared with contractors | Separate "internal KB" (stays in .planning/, never committed to a public repo) from "operational KB" (safe to commit); add `.gitignore` entries for sensitive KB directories |
| Tasks with client context visible to all Clerk-authenticated operators without per-client access control | Operator A sees Client B's tasks | For v1.5, tasks are operator-wide (all operators see all tasks — this is an internal tool); document this assumption explicitly so it is not accidentally treated as multi-tenant |
| Supabase anon-access policies inherited from existing tables applied to new `tasks` table without review | Any anonymous request can read/write tasks | Each new table migration must include explicit RLS policy review; the pattern `USING (true)` for anon is appropriate for blueprint_configs (public wireframes) but NOT for internal tasks |

---

## UX Pitfalls

Common user experience mistakes when adding these modules.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Knowledge base entry page has no "back to list" navigation | Operator reads a KB entry, loses context, has to use browser back | Each KB entry view includes breadcrumb back to KB list; sidebar highlights active KB section |
| Task list shows tasks for ALL clients on a single screen | Visual noise; operator has to scan past irrelevant tasks | Default task view is scoped to the current client context (from URL slug); "All tasks" is an explicit opt-in filter |
| Modular home page cards are equal size regardless of module maturity | New empty modules appear alongside mature feature-rich modules — feels padded | Cards reflect module activity (entry count, last modified, active tasks); empty modules are de-emphasized or hidden until they have content |
| Knowledge base search returns results with no context snippet | Operator sees a list of entry titles but cannot tell which entry answers their question | Search results show the matching paragraph context (2-3 lines around the search term), not just the entry title |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Module boundary enforcement:** ESLint boundary rules installed and passing — not just directory structure created. Verify: `npx eslint src/modules/tasks/components/TaskList.tsx` produces an error if it imports from `src/modules/wireframe-builder/`.
- [ ] **Knowledge base indexer:** Uses static `import.meta.glob` literals, not parameterized paths. Verify: build with `eager: true` and confirm entries appear in the Vite bundle analysis.
- [ ] **Route composition:** Each module exports a routes array. App.tsx composes them — does not contain module-specific component imports directly. Verify: `wc -l src/App.tsx` stays under 60 lines after all modules are added.
- [ ] **Supabase migrations:** Every new table has an explicit RLS policy (not inherited). Every `ALTER TABLE` on existing tables is a separate migration file from `CREATE TABLE` statements. Verify: run `make migrate` on a fresh local Supabase project and confirm no errors.
- [ ] **Task management scope:** The tasks Supabase table has exactly the columns defined in the v1.5 phase plan (no bonus columns added during implementation). Verify: compare `tasks` table schema against the phase plan spec.
- [ ] **GSD paths updated:** `.planning/codebase/ARCHITECTURE.md` reflects new module structure. No `.planning/phases/*.md` references paths that no longer exist. Verify: `grep -r "src/components\|src/pages" .planning/phases/` returns no hits for paths moved to modules.
- [ ] **Circular dependencies resolved:** `npx madge --circular --extensions ts,tsx src/` returns zero cycles. Verify as part of Module Foundation phase completion gate.
- [ ] **Knowledge base retention policy defined:** Active/Archived split exists in directory structure before the first 10 entries are added. Verify: `ls knowledge/` (or equivalent) shows at minimum `active/` and `archived/` subdirectories.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Module boundaries eroded (Pitfall 1) | MEDIUM | Install eslint-plugin-boundaries; run lint; fix each violation file-by-file; violations are usually "I just needed one function" — move that function to shared/. Takes 1-2 days for a 10-module system. |
| App.tsx route explosion (Pitfall 2) | LOW | Extract module route arrays one module at a time; App.tsx slims down with each extraction; zero runtime impact. |
| import.meta.glob with variable path (Pitfall 3) | LOW | Replace parameterized function with separate top-level glob constants; rebuild; test. One-hour fix. |
| KB bundle bloat (Pitfall 4) | MEDIUM | Change `eager: true` to `eager: false`; implement lazy loading with `import()`; add search index build step. Half-day effort. |
| Circular dependencies after extraction (Pitfall 5) | HIGH | Run `madge --circular`; each cycle requires deciding where the shared dependency actually belongs; may require moving 3-5 files to `modules/shared/`. Risk of regressions during moves. Allow 1-3 days. |
| Task scope creep (Pitfall 6) | HIGH | Freeze feature additions for the milestone; ship what exists; move deferred features to v1.6 backlog. The cost is not technical — it is the conversation about what ships now. |
| Supabase migration breaks RLS (Pitfall 7) | MEDIUM | Add backward-compatible migration (rollback is not possible in hosted Supabase without data loss); restore permissive policy; fix the policy expression; re-apply. Test in staging before production. |
| GSD paths stale after modularization (Pitfall 9) | LOW | `grep -r "src/components\|src/pages" .planning/` finds hits; update each reference. Pure documentation — no code change. 1-2 hours. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Module boundaries erode (Pitfall 1) | Module Foundation — install eslint-plugin-boundaries before moving files | `npx eslint` on a cross-module import produces an error |
| App.tsx route explosion (Pitfall 2) | Module Foundation — establish route composition pattern | App.tsx under 60 lines after all modules added |
| import.meta.glob variable path (Pitfall 3) | Knowledge Base phase — design indexer with literal patterns | `vite build` succeeds; KB entries appear in bundle |
| KB unbounded growth (Pitfall 4) | Knowledge Base phase — define active/archived split in directory design | Directory structure has active/archived before first entry |
| Circular dependencies (Pitfall 5) | Module Foundation — pre-extraction audit with madge | `madge --circular src/` returns zero |
| Task scope creep (Pitfall 6) | Task Management phase — write out-of-scope list before first commit | tasks table has exactly the columns in the phase plan spec |
| Supabase migration breaks RLS (Pitfall 7) | Every migration phase — separate new tables from existing table alterations | Post-migration: blueprint save and comment post succeed |
| Home page static hub (Pitfall 8) | Module Foundation — define ModuleManifest type | Adding a new module in v1.6 requires zero changes to Home.tsx |
| GSD paths stale (Pitfall 9) | Module Foundation — ARCHITECTURE.md update as completion gate | `grep -r "src/components\|src/pages" .planning/phases/` returns no moved paths |

---

## Sources

- FXL Core codebase: `src/App.tsx` — 20+ flat route entries, single-file routing, direct component imports
- FXL Core codebase: `src/lib/docs-parser.ts` — `import.meta.glob('/docs/**/*.md', { eager: true })` with literal path pattern; the correct model for KB indexer
- FXL Core codebase: `vite.config.ts` — aliases: `@` → `src/`, `@tools` → `tools/`, `@clients` → `clients/`; no module boundaries beyond directory convention
- FXL Core codebase: `supabase/migrations/` — 4 existing migrations; `003_blueprint_configs.sql` uses `USING (true)` anon policies as the baseline pattern
- FXL Core `.planning/PROJECT.md` — v1.5 goals: modular architecture, knowledge base, home page, task management
- Vite GitHub issue #15926: `import.meta.glob` is not statically analyzable when wrapped in a function — arguments must be string literals
- eslint-plugin-boundaries (npm): boundary enforcement without Nx; supports `from`/`allow` rules for cross-module imports
- Madge (npm): circular dependency detection for TypeScript projects; `madge --circular --extensions ts,tsx src/` command
- eslint-plugin-import/no-cycle: prevents new circular imports from being introduced; integrates with existing ESLint setup
- WebSearch: "circular imports React TypeScript" — barrel files as primary amplifier of circular dependency cycles; `import type` as mitigation
- WebSearch: "eslint import boundaries module enforcement" — `no-restricted-imports` as built-in alternative; eslint-plugin-boundaries as purpose-built solution

---
*Pitfalls research for: v1.5 Modular Foundation & Knowledge Base — adding modular architecture, auto-fed knowledge base, and task management to an existing React 18 + Vite SPA*
*Researched: 2026-03-12*
