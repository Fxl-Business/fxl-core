# Stack Research: v1.5 Modular Foundation & Knowledge Base

**Domain:** React SPA — modular architecture, auto-fed knowledge base, task/project management
**Researched:** 2026-03-12
**Confidence:** HIGH (official docs verified, existing codebase analyzed, hooks reference confirmed)

## Scope

This research covers ONLY what is NEW for v1.5. The validated existing stack is unchanged:

- React 18.3 + TypeScript 5.6 strict + Tailwind CSS 3.4 + Vite 5.4 + Vercel
- Supabase (comments, blueprints, briefings) + Clerk (auth)
- recharts 2.13.3, lucide-react 0.460, shadcn/ui, cmdk, sonner, dnd-kit
- Zod 4.x, react-markdown + remark-gfm + rehype-highlight, yaml
- react-router-dom 6.27, @fontsource-variable/inter + jetbrains-mono
- vitest 4.x, @testing-library/react 16.x

Four questions to answer: (1) How to structure independent modules in the existing SPA? (2) What storage + retrieval approach for the knowledge base? (3) What data model for task/project management? (4) How to auto-feed the knowledge base from GSD workflow events?

---

## Decision Summary: Zero New Runtime Dependencies

The v1.5 features are implementable with the existing stack plus two Supabase migrations and
Claude Code hook scripts (Node.js, no new npm packages). The module system uses React's built-in
`lazy` + `Suspense` with Vite's automatic code splitting. State management uses React Context
(already the project pattern) — Zustand is not needed at this scale. TanStack Query is deferred
per PROJECT.md (v2 item AGEN-02).

---

## Part 1: Module System Architecture

### Pattern: Feature-Based Directory Modules with Lazy-Loaded Routes

The correct approach for this SPA is **feature-based directory modules** — not micro-frontends,
not a monorepo, not a custom module registry. This is the standard pattern for React SPAs at
this scale, and it integrates directly with how Vite handles code splitting.

**Module = a directory with its own components/, pages/, types/, and an index barrel.**

Each module is lazy-loaded at the route level via `React.lazy()`. Vite automatically splits
lazy-imported components into separate chunks during build — zero configuration required. At
the current project scale (single operator, internal tool), micro-frontends would be massive
overkill with no benefit.

**Directory structure for modules:**

```
src/
  modules/
    docs/               ← existing docs viewer, moved here
      components/
      pages/
      types/
      index.ts          ← barrel (re-exports public API)
    wireframe-builder/  ← existing builder, moved here
      components/
      pages/
      types/
      index.ts
    knowledge-base/     ← NEW
      components/
      pages/
      types/
      index.ts
    projects/           ← NEW (task/project management)
      components/
      pages/
      types/
      index.ts
  components/           ← shared shell components (layout, nav, ui)
  pages/                ← top-level pages (Home, Login, Profile)
  lib/                  ← shared utilities (supabase, docs-parser, search-index)
  App.tsx               ← route definitions with lazy imports
```

**Route-level lazy loading pattern (App.tsx):**

```tsx
import { lazy, Suspense } from 'react'

const KnowledgeBase = lazy(() => import('./modules/knowledge-base/pages/KnowledgeBasePage'))
const Projects = lazy(() => import('./modules/projects/pages/ProjectsPage'))

// In router:
<Route path="/kb/*" element={
  <Suspense fallback={<PageSkeleton />}>
    <KnowledgeBase />
  </Suspense>
} />
```

**Why this and not alternatives:**
- Micro-frontends: overkill — independent deployments, separate build pipelines, module federation
  complexity are all irrelevant for a single-operator internal tool. Adds 10x the complexity for
  zero operational benefit at this scale.
- Monorepo (nx, turborepo): appropriate when teams are separate or packages are published. This is
  one team, one app, one deploy target.
- Custom module manifest: unnecessary indirection — Vite's static analysis handles chunking.

**Module boundary rules (to enforce now, prevent future coupling):**
1. Modules do NOT import from each other's internal directories. Only from their public `index.ts`.
2. Shared types (client entities, user, etc.) live in `src/types/` — not in any module.
3. Supabase client, Clerk, and routing utilities live in `src/lib/` — imported by all modules.
4. No module imports from `src/components/layout/` or other shell components directly — they are
   provided by the Layout wrapper at the route level.

**Confidence:** HIGH — This is the documented React + Vite pattern. Official React docs, Vite
docs, and the developer-way.com deep-dive on project structure all confirm feature-based
organization with lazy-loaded routes.

---

## Part 2: Knowledge Base — Storage and Retrieval

### Storage: Supabase (Postgres) — No New Service Needed

The knowledge base is structured entries (bugs, decisions, patterns), not unstructured documents.
Postgres + tsvector full-text search is the correct solution. This avoids introducing a vector
database, Algolia, or any external search service. The existing Supabase project handles this.

**Schema (one migration):**

```sql
CREATE TABLE knowledge_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL CHECK (kind IN ('bug', 'decision', 'pattern', 'pitfall')),
  title       text NOT NULL,
  body        text NOT NULL,           -- markdown, full description
  tags        text[] NOT NULL DEFAULT '{}',
  source      text,                    -- 'gsd-hook', 'manual', 'git-commit'
  phase_ref   text,                    -- e.g. '25-table-components'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  search_vec  tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '') || ' ' || coalesce(array_to_string(tags, ' '), ''))
  ) STORED
);

CREATE INDEX knowledge_entries_search_idx ON knowledge_entries USING GIN (search_vec);
CREATE INDEX knowledge_entries_kind_idx ON knowledge_entries (kind);
CREATE INDEX knowledge_entries_tags_idx ON knowledge_entries USING GIN (tags);
```

**Why generated column (not trigger) for tsvector:**
Generated columns with `STORED` are the modern Postgres approach (Postgres 12+, Supabase supports
this). They are automatically updated on INSERT/UPDATE without a separate trigger function.
Supabase's hosted Postgres is version 15.x — generated columns are fully supported.

**Retrieval (via Supabase JS client, no new packages):**

```typescript
// Full-text search — already available in @supabase/supabase-js 2.x
const { data } = await supabase
  .from('knowledge_entries')
  .select('*')
  .textSearch('search_vec', query, { type: 'websearch', config: 'english' })
  .order('created_at', { ascending: false })
  .limit(20)

// Tag filter
const { data } = await supabase
  .from('knowledge_entries')
  .select('*')
  .contains('tags', ['typescript', 'clerk'])
  .eq('kind', 'bug')
```

**Why NOT vector/semantic search for this use case:**
Semantic search (pgvector, Supabase AI) is valuable for "find conceptually similar" queries.
The knowledge base is queried by keyword, tag, kind, and phase reference — all well-served by
tsvector. Adding vector embeddings requires an embedding model API call on every insert, adds
cost, and introduces a new external dependency. Defer to v2 if semantic search becomes needed.

**Confidence:** HIGH — Supabase full-text search documentation confirms tsvector generated
columns and GIN indexes. The @supabase/supabase-js 2.x textSearch() method is documented.

---

## Part 3: Task/Project Management — Data Model

### Approach: Thin Postgres Schema, No External PM Library

A minimal task management model linked to existing entities (clients, phases). No external
library (no Linear SDK, no ClickUp integration). The UI uses shadcn/ui components already
in the project. This is scoped to MVP: project + task lists, status, assignment to phase/client.

**Schema (one migration, same file or separate):**

```sql
-- Projects (one per client engagement or one for FXL Core itself)
CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  client_slug   text,                -- null = internal (FXL Core)
  status        text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Tasks within a project
CREATE TABLE tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         text NOT NULL,
  body          text,                -- markdown, optional details
  status        text NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in-progress', 'done', 'blocked')),
  priority      text NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  phase_ref     text,                -- link to GSD phase (e.g. '25-table-components')
  kb_entry_id   uuid REFERENCES knowledge_entries(id),  -- optional link to KB
  due_date      date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_project_id_idx ON tasks (project_id);
CREATE INDEX tasks_status_idx ON tasks (status);
```

**Why this schema:**
- `client_slug` ties to the existing clients/ taxonomy without a foreign key to a clients table
  (which doesn't exist in Supabase yet — clients are file-system entities). Keeps it loose.
- `phase_ref` is a text field (e.g. '25-table-components') that mirrors the .planning/phases/
  directory naming — no migration needed when phases change, just a text reference.
- `kb_entry_id` allows surfacing related knowledge entries from a task without coupling the
  schemas tightly (nullable FK, not enforced as required).
- Status and priority as constrained text columns over ENUMs: easier to ALTER if values change
  (ALTER TYPE in Postgres requires a workaround; text CHECK is simpler to migrate).

**No external library for task UI:**
shadcn/ui already provides Card, Badge, Select, Dialog, Popover — sufficient for task cards,
status badges, priority selectors, and task detail dialogs. dnd-kit (already installed) can
handle kanban drag-reorder if needed. No react-beautiful-dnd, no dnd-kit upgrade.

**Confidence:** HIGH — Schema design based on project's established Supabase patterns (existing
comments and blueprints tables). No new packages.

---

## Part 4: Auto-Feed Mechanism — Claude Code Hooks

### Pattern: PostToolUse + Stop hooks → Node.js script → Supabase REST API

The project already has a hooks infrastructure in `.claude/settings.json`:
- `SessionStart` → `gsd-check-update.js`
- `PostToolUse` → `gsd-context-monitor.js`
- `Stop` → `pre-stop-checklist.sh`

The auto-feed mechanism extends this existing pattern. A new hook script detects when Claude
resolves a bug, records a decision, or completes a phase, then inserts a knowledge entry.

**Trigger points:**
- `Stop` hook — fires when Claude finishes a response. Parse stop context for decision/bug keywords.
- `PostToolUse` on `Write` — fires after writing `.planning/` files. Detect phase summaries written.
- Manual: `/gsd:kb-add` slash command (creates entry via Supabase REST without leaving Claude Code).

**Hook approach (no new npm packages):**

```javascript
// .claude/hooks/kb-auto-feed.js
// Called from Stop hook. Reads the GSD state, detects KB-worthy events,
// posts to Supabase via fetch() (Node.js 18+ native — no node-fetch needed).

const input = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'))
// input.stop_hook_active — if true, exit 0 immediately (prevent infinite loop)
if (input.stop_hook_active) process.exit(0)

// Detect: did Claude just write a VERIFICATION.md or phase SUMMARY.md?
// Read recent STATE.md, extract decisions section, post to knowledge_entries.
```

**Why fetch() (native) and not supabase-js in the hook:**
The hooks run as Node.js scripts. `@supabase/supabase-js` is a browser+Node package, but loading
it in a hook adds startup latency and requires the package to be resolvable from `~/.claude/`.
Native `fetch()` + the Supabase REST API (`https://[project].supabase.co/rest/v1/knowledge_entries`)
with the `apikey` header is simpler, faster, and has zero dependency. The hook reads `VITE_SUPABASE_URL`
and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env.local` (same pattern as the existing `make migrate`
approach that reads credentials from `.env.local`).

```javascript
// Supabase REST insert — no SDK needed in hooks
const response = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_entries`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({ kind, title, body, tags, source: 'gsd-hook', phase_ref })
})
```

**Why NOT git hooks (pre-commit, post-commit):**
Git hooks fire on every commit — the signal-to-noise ratio is low. Most commits are not
KB-worthy. Claude Code's `Stop` and `PostToolUse` hooks have access to the conversation
context (what Claude just did), making them better triggers. Git hooks don't know if Claude
resolved a bug or just formatted code.

**Confidence:** HIGH — Claude Code hooks reference confirmed. Native fetch() confirmed in Node.js
18+ (the system runs macOS with Node.js 22+ given darwin 25.3.0). `.env.local` reading pattern
confirmed from existing codebase (`make migrate` reads it via `--env-file .env.local`).

---

## State Management: React Context (No Zustand)

The project uses React Context for module-level state (WireframeThemeProvider is the example).
This pattern scales to the new modules.

**Decision: Do not add Zustand.**

Rationale: The KB and task management UIs are read-heavy (fetch from Supabase, display). There
is no complex derived state, no cross-module real-time synchronization, and no optimistic update
choreography that would justify a state management library. React Context + useReducer covers:
- Filter/sort state in the KB list view (local to that page)
- Active task status changes (single Supabase mutation, then re-fetch)
- Module navigation state (already handled by react-router-dom)

TanStack Query (React Query v5) would genuinely improve the DX for KB and tasks — caching, background
re-fetch, loading states. However, PROJECT.md explicitly defers it to v2 (AGEN-02). The milestone
goal is to ship the features, not to solve caching elegance. Manual fetch + useState is sufficient
for an internal tool with one operator.

**When to reconsider:** If KB entries exceed 500+ rows and list view performance degrades, or if
two browser tabs show stale data simultaneously, TanStack Query becomes the right answer. That is
a v2 concern.

**Confidence:** HIGH — Existing codebase pattern analysis. PROJECT.md confirms AGEN-02 deferral.

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Zustand | No complex cross-module state at this scale; deferred by PROJECT.md | React Context + useReducer |
| TanStack Query / React Query | Deferred to v2 (AGEN-02) in PROJECT.md | useState + useEffect fetch pattern |
| pgvector / Supabase AI embeddings | Overkill for keyword+tag search KB; adds cost, external LLM API | Postgres tsvector (built-in) |
| Algolia / Meilisearch | External service, cost, sync complexity for a small internal KB | Supabase full-text search |
| node-fetch in hooks | Node.js 18+ has native fetch() | fetch() (no package) |
| Micro-frontends | One team, one deploy, internal tool — massive complexity for zero benefit | Feature-based modules with lazy routes |
| nx / turborepo | No separate teams, no publishable packages, no independent deployments | Single repo, feature directories |
| react-beautiful-dnd | Archived/unmaintained | @dnd-kit (already installed) |
| Supabase Realtime for KB/tasks | One operator, no concurrent editing — polling or manual refresh is sufficient | Supabase REST via supabase-js |
| New shadcn components for task UI | Card, Badge, Select, Dialog, Popover already installed | Existing shadcn/ui components |

---

## Installation Plan

```bash
# No new runtime dependencies.
# No new dev dependencies.
# No package.json changes.

# New Supabase migration files:
# supabase/migrations/005_knowledge_base.sql
# supabase/migrations/006_projects_tasks.sql
# (or combined: 005_knowledge_projects.sql)

# New hook script:
# .claude/hooks/kb-auto-feed.js

# New slash command:
# .claude/commands/gsd/kb-add.md
```

**Total: 0 new npm packages. 1-2 Supabase migrations. 1 Claude Code hook script.**

---

## Version Compatibility

| Package | Current Version | v1.5 Impact | Notes |
|---------|-----------------|-------------|-------|
| @supabase/supabase-js | ^2.98.0 | No change | textSearch() and .contains() for arrays supported in 2.x |
| react-router-dom | ^6.27.0 | No change | React.lazy + Suspense + nested routes already supported |
| React | ^18.3.1 | No change | lazy(), Suspense, useReducer all built-in |
| Vite | ^5.4.10 | No change | Automatic code splitting on dynamic imports, no config change |
| zod | ^4.3.6 | New schemas for KB entries and tasks | No upgrade needed; z.enum() for kind/status/priority |

---

## Sources

- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide) — hook events (PostToolUse, Stop), input schema, exit codes, stop_hook_active field (HIGH confidence, official docs, fetched directly)
- [Supabase Full Text Search](https://supabase.com/docs/guides/database/full-text-search) — tsvector generated columns, GIN index, textSearch() client method (HIGH confidence, official Supabase docs)
- [React lazy() and Suspense — React docs](https://react.dev/reference/react/lazy) — lazy import pattern, Suspense fallback (HIGH confidence, official React docs)
- Existing codebase analysis: `.claude/settings.json` hooks config, `supabase/migrations/`, `src/`, `package.json`, `.planning/PROJECT.md` (HIGH confidence, direct inspection)
- [React State Management in 2025](https://www.developerway.com/posts/react-state-management-2025) — Context vs Zustand decision framework (MEDIUM confidence, authoritative blog)
- [React project structure](https://www.developerway.com/posts/react-project-structure) — feature-based module organization rationale (MEDIUM confidence, authoritative blog)
- [How to Use Supabase with TanStack Query](https://makerkit.dev/blog/saas/supabase-react-query) — confirmed deferral rationale; v5 integration pattern for v2 reference (MEDIUM confidence)

---
*Stack research for: FXL Core v1.5 Modular Foundation & Knowledge Base*
*Researched: 2026-03-12*
