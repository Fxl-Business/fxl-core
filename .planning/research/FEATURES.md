# Feature Research: v1.5 Modular Foundation & Knowledge Base

**Domain:** Internal Operational Platform — Modular Architecture, Auto-Fed Knowledge Base, Task/Project Management, Modular Home
**Researched:** 2026-03-12
**Confidence:** HIGH for modular architecture and KB entry structure (established patterns, verified against ADR standards and React modular patterns). MEDIUM for task management data model (depends on how tightly FXL wants integration with existing Supabase tables).

---

## Scope

This research covers **only** the four new capability areas in v1.5:

1. **Modular architecture** — module manifest/registry pattern, per-module routing, sidebar integration
2. **Knowledge base** — entry types (bug, decision, pattern, lesson), auto-capture, search/retrieval
3. **Task management** — task/project entities, client association, status workflow, views
4. **Home page** — module hub, activity feed, cross-module links

The existing system (docs, wireframe-builder, briefing pipeline, client workspaces, Supabase comments/blueprints/briefings, Clerk auth, design tokens) is treated as **baseline infrastructure** that the new modules must integrate with, not replace.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any internal operational platform must have. Missing these means the platform
feels like a collection of disconnected tools, not a cohesive system.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Module manifest/registry with typed boundaries | Without explicit module definitions, the codebase becomes a monolith again as new areas are added. Operators expect to know which area owns what | MEDIUM | A `MODULE_REGISTRY` constant or typed manifest (not a runtime registry) is sufficient. Each entry declares: `id`, `label`, `route`, `icon`, `description`, `status` (active/planned/disabled). Lives in `src/modules/registry.ts`. No dynamic loading required for v1 |
| Per-module folder structure | Operators and Claude Code need predictable locations. `src/modules/[name]/` with own `pages/`, `components/`, `hooks/`, `types/` | LOW | Flat convention enforced by code review/linting. No tooling required. Three new modules: `knowledge-base`, `tasks`, `home` |
| Sidebar section for new modules | Operators navigate from sidebar. New modules not in sidebar = effectively invisible | LOW | Extend existing `navigation` array in `Sidebar.tsx`. Add "Knowledge Base" and "Tarefas" top-level sections. Sidebar already handles nested items — this is additive |
| KB entry types: bug, decision, pattern, lesson | These four types cover the full lifecycle of knowledge in a software project. Bug = what broke and why. Decision = why we chose X (ADR format). Pattern = how we solved a recurring problem. Lesson = retrospective insight. Users expect entries to be typed so they can filter | LOW | Supabase table `kb_entries` with `entry_type` enum column. No more than 4 types in v1. Types map to different icon/color in UI |
| KB entry fields: title, body (markdown), tags, client association | Minimum data model. Title for search, body for detail, tags for cross-cutting grouping, client_slug for scoping. All four are expected | LOW | `kb_entries` table: `id uuid`, `title text`, `body text`, `entry_type`, `tags text[]`, `client_slug text nullable`, `created_by text` (Clerk user ID), `created_at timestamptz`, `updated_at timestamptz` |
| KB full-text search | Operators need to find entries quickly. A KB without search is a filing cabinet | MEDIUM | Supabase full-text search on `title` + `body` via `tsvector` generated column + `tsquery`. Existing Cmd+K search uses in-memory index over docs — KB needs DB-backed search since entries are dynamic |
| Task entity: title, description, status, client association | Minimum task model. Operators expect tasks to exist independently of docs and to be linkable to clients | LOW | Supabase table `tasks`: `id uuid`, `title text`, `description text nullable`, `status` (enum: todo/in_progress/done/blocked), `client_slug text nullable`, `priority` (enum: low/medium/high), `created_by text`, `created_at timestamptz`, `due_date date nullable` |
| Task status workflow: todo → in_progress → done | Simple linear workflow. Users expect to move tasks through states. Blocked is a valid terminal state that needs human resolution | LOW | Enum-based status on table. UI renders status as badge with dropdown to change. No complex state machine — simple column update |
| List view for tasks | The most basic way to see tasks. Any other view (kanban, timeline) is additive | LOW | Simple `<ul>` with filter/sort by status, client, priority. Existing shadcn/ui components (Badge, Select, Card) cover this without new installs |
| Home page with module links | The `/` route currently shows a static home page. With new modules, it needs to become a hub that links to all active areas | LOW | Home page redesign: grid of module cards (Docs, Wireframe Builder, Clientes, Knowledge Base, Tarefas). Each card: module name, description, icon, status, quick link. Reads from `MODULE_REGISTRY` |

### Differentiators (What Makes This Worth Building)

These features distinguish a purpose-built internal platform from a generic Notion/Linear setup.
They encode FXL-specific workflow knowledge.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| KB auto-capture hooks for GSD workflow | When Claude Code completes a phase or quick task via `/gsd:execute`, it can auto-propose a KB entry (bug, decision, or pattern). The entry pre-fills from the execution summary. Operator approves/rejects. This makes the KB self-populating over time without manual effort | HIGH | Requires: (1) KB write API accessible from Claude's hooks, (2) hook in GSD workflow that fires after phase completion, (3) UI prompt to approve. For v1.5 this can be simplified: a "Create KB entry from this" button in the GSD output that pre-fills the KB entry form. Full auto-capture is v2 |
| KB entry linked to client workspace | KB entries can reference a specific client slug. This enables a "Knowledge about financeiro-conta-azul" filtered view. Client-specific bugs, decisions, and patterns stay discoverable | LOW | `client_slug` foreign reference (text, not a FK — consistent with how blueprints/briefings work). Client workspace page (`/clients/:slug`) shows a "KB for this client" section |
| Decision entries follow ADR format | Architecture Decision Records are an established engineering practice. Structuring decisions with: Context, Options considered, Decision made, Rationale, Consequences — makes the KB authoritative rather than informal | MEDIUM | For `entry_type = 'decision'`: additional fields or structured body template. Could be a YAML-like preamble in the markdown body that the renderer extracts. Keep body as plain markdown — renderer recognizes `## Context`, `## Decision`, `## Consequences` headings and applies special styling |
| Activity feed on home page | Operators see what changed recently across all modules: last KB entry added, last task updated, last wireframe commented on. Single feed = situational awareness without opening each module | MEDIUM | Supabase query joining `kb_entries`, `tasks`, and `wireframe_comments` ordered by `updated_at`. Limited to last 10 items. Custom type discriminator to render each item type differently. No realtime — polling every 60s is acceptable for internal tool |
| KB search integrated into existing Cmd+K | Operators already use Cmd+K for docs search. If KB entries live in a separate search, they will be missed. KB results should appear in the same command palette under a "Knowledge Base" group | MEDIUM | Extend `SearchCommand.tsx` to fetch KB entries from Supabase and merge into the cmdk results. Existing Cmd+K uses in-memory index for docs — KB requires async fetch. Use `cmdk`'s `shouldFilter={false}` with server-side results |
| Kanban view for tasks (board by status) | Kanban is the most efficient way to see work distribution. Three-column board (Todo / In Progress / Done) maps naturally to the status workflow. Blocked items appear in a dedicated column | MEDIUM | Four-column kanban using CSS grid. Each column shows a filtered list of tasks. Drag-and-drop is NOT needed in v1 — clicking a task card and changing status in a dialog is sufficient. Drag-drop is a v2 differentiator |
| Task → KB entry linkage | When a task resolves a bug or a decision is made during execution, the operator can create a KB entry from the task. "Document this resolution" button on a done task auto-fills a KB bug or decision entry | LOW | A button on the task detail view that navigates to the KB new entry form with `?task_id=X&prefill=true`. The KB form reads the query param and pre-fills title/body from the task |

### Anti-Features (Explicitly Out of Scope)

Features that are commonly requested for platforms like this but would hurt more than help in v1.5.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time collaboration / live cursors | "It would be great to see when someone else is editing" | Adds WebSocket infrastructure (Supabase realtime) for a single-operator internal tool. FXL has one primary operator (cauetfxl@gmail.com) with occasional collaborators. The complexity is not justified | Optimistic locking (already used for blueprints) is sufficient. Show "last updated by X at Y" timestamp |
| AI-generated KB summaries | "Claude should summarize my KB automatically" | KB entries are Claude-authored already (via GSD). AI summarizing AI output adds a layer of indirection without reducing work. Claude should write entries, not summarize existing ones | Structured entry templates with required sections do more to keep entries actionable than post-hoc AI summaries |
| Task dependencies / blocking graph | "Task A blocks Task B, I need to see the graph" | Adds significant data model complexity (adjacency table, cycle detection). FXL task volume is small — operators will not benefit from a dependency graph in v1.5 | Use `description` field to reference related tasks by ID. Visual dependency graph is a v2 feature |
| Multiple projects per client (project hierarchy) | "I want to organize tasks into sub-projects" | Creates a three-level hierarchy (module > project > task) that is overkill for a small team with one pilot client | In v1.5: tasks belong to a client directly. If a second organizational layer is needed, add a `project` entity in v2 |
| Kanban drag-and-drop | "Boards should be draggable like Linear or Jira" | Requires `@dnd-kit` or similar library. Adds bundle size and interaction complexity for status changes that are equally efficient via a dropdown | Status change via click → select dialog. Drag-and-drop deferred to v2 when task volume makes it worth the complexity |
| Email notifications for task assignments | "Notify me when a task is assigned to me" | Requires an email service (Resend, SendGrid, etc.) and a background worker. Out of scope for a Supabase + Vercel static SPA | In-app notifications via the existing activity feed on the home page. Email notifications are a v2 feature |
| Bi-directional sync with external tools (Linear, Jira, GitHub) | "Sync tasks with our GitHub issues" | Integration complexity for a tool that is meant to reduce external dependencies. FXL Core is the source of truth for FXL's operational knowledge | Use manual task creation. Import/export via CSV if needed. No sync in v1.5 |
| Versioned KB entries (history/changelog) | "I want to see what a KB entry looked like before I edited it" | Supabase doesn't provide automatic row versioning without triggers and audit tables. Adds schema complexity for a rarely-needed feature | Show `created_at` and `updated_at` timestamps. Note "last edited" in the UI. Full history is a v2 feature |

---

## Feature Dependencies

```
Existing Infrastructure (BASELINE — do not modify)
    |
    +-- Supabase (comments, blueprints, briefings tables, Clerk auth)
    +-- React Router v6 (SPA routing)
    +-- Sidebar.tsx (static navigation array)
    +-- Clerk (auth — user ID available as string)
    +-- SearchCommand.tsx (Cmd+K — in-memory docs index)
    |
    v
Layer 0: Module Registry (MUST BE FIRST — no Supabase needed)
    |
    +-- src/modules/registry.ts — typed MODULE_REGISTRY constant
    +-- Per-module folder structure created
    +-- Sidebar.tsx extended with Knowledge Base + Tarefas sections
    +-- App.tsx extended with new module routes
    |
    v
Layer 1: Data Model — Supabase migrations (AFTER Layer 0)
    |
    +-- Migration 005: kb_entries table
    |       (id, title, body, entry_type, tags, client_slug, created_by, created_at, updated_at)
    |       tsvector generated column for full-text search
    |
    +-- Migration 006: tasks table
    |       (id, title, description, status, priority, client_slug, created_by, created_at, updated_at, due_date)
    |
    v
Layer 2: Core Module Pages (CAN RUN IN PARALLEL after Layer 1)
    |
    +-- Knowledge Base module
    |       |-- KB index page: list all entries with filter by type/tags/client
    |       |-- KB entry detail page: markdown render + metadata
    |       |-- KB new/edit form: type selector + markdown body + tags + client slug
    |       |-- KB search: Supabase full-text query
    |
    +-- Tasks module
    |       |-- Task list page: filter by status/client/priority
    |       |-- Task kanban page: 4-column board (todo, in_progress, done, blocked)
    |       |-- Task detail: full task view + link to KB
    |       |-- Task create/edit form
    |
    v
Layer 3: Home Page Redesign (AFTER Layer 0, CAN PRECEDE Layer 2)
    |
    +-- Module hub: reads MODULE_REGISTRY → renders module cards
    +-- Activity feed: Supabase query across kb_entries + tasks + wireframe_comments
    |       (requires Layer 1 tables to exist)
    |
    v
Layer 4: Cross-Module Integration (AFTER Layer 2)
    |
    +-- KB search integrated into Cmd+K (extends SearchCommand.tsx)
    +-- "Create KB entry" from task detail
    +-- Client workspace shows KB entries for that client slug
```

### Dependency Notes

- **Module registry has zero runtime cost.** It's a typed constant, not a plugin loader. Defining it first establishes folder structure and routing conventions for all subsequent work without touching Supabase.
- **Supabase migrations are strictly sequential.** Migration 005 (kb_entries) must be applied before migration 006 (tasks). Both must be in place before any UI that reads from these tables is built.
- **Home page can be partially built before Layer 2.** The module cards section reads from `MODULE_REGISTRY` (Layer 0) and needs no DB. The activity feed section requires Layer 1 tables. Split the home page into two phases: module cards first, activity feed after migrations.
- **KB Cmd+K integration modifies existing SearchCommand.tsx.** This is the most fragile integration point — existing docs search must not regress. Implement KB results as a separate cmdk Group with async loading, not merged into the synchronous docs index.
- **Client workspace integration is purely additive.** Adding a "KB entries for this client" section to `/clients/financeiro-conta-azul` does not change any existing components — it appends a new section to the existing page layout.

---

## MVP Definition (v1.5 Scope)

### Launch With (Core Milestone)

These are the minimum deliverables that make v1.5 a meaningful milestone.
If all of these exist, the platform has modular architecture, a working knowledge base, and basic task tracking.

- [ ] **Module registry** (`src/modules/registry.ts`) with typed manifest for all modules (Docs, Wireframe Builder, Clientes, Knowledge Base, Tarefas) — establishes modular boundary for the entire codebase
- [ ] **Folder structure** for new modules: `src/modules/knowledge-base/`, `src/modules/tasks/`, `src/modules/home/`
- [ ] **Sidebar** extended with Knowledge Base and Tarefas sections
- [ ] **Supabase migration 005**: `kb_entries` table with entry types, tags, client_slug, full-text index
- [ ] **KB list page** (`/knowledge-base`): list entries, filter by type and client, link to detail
- [ ] **KB detail page** (`/knowledge-base/:id`): render markdown body, show metadata
- [ ] **KB new/edit form** (`/knowledge-base/new`, `/knowledge-base/:id/edit`): type selector, markdown body, tags, optional client slug
- [ ] **Supabase migration 006**: `tasks` table with status enum, priority, client_slug
- [ ] **Task list page** (`/tarefas`): table view with status badges, filter by client/status/priority
- [ ] **Task create/edit form**: title, description, status, priority, due date, client slug
- [ ] **Home page redesign**: module hub grid (reads MODULE_REGISTRY) + basic activity feed (last 10 updates across kb_entries + tasks)

### Add After Validation (v1.5.x)

Features to add once the core is shipped and operators are using it.

- [ ] **Task kanban view** — add `/tarefas/kanban` route with 4-column board; trigger: at least 10 tasks created
- [ ] **KB Cmd+K integration** — extend SearchCommand with async KB results; trigger: operators report searching for KB entries
- [ ] **Task → KB entry link** — "Document this" button on completed tasks; trigger: operators start resolving tasks and want to capture decisions
- [ ] **Client workspace KB section** — add "Conhecimento" section to `/clients/:slug` page; trigger: KB has entries for a specific client

### Future Consideration (v2+)

- [ ] **KB auto-capture from GSD hooks** — auto-propose entry after phase completion; requires GSD webhook/hook infrastructure
- [ ] **Task drag-and-drop kanban** — @dnd-kit integration; defer until task volume justifies the complexity
- [ ] **KB entry versioning/history** — Supabase row auditing; defer until data maturity
- [ ] **KB AI summary generation** — defer until entries accumulate and patterns emerge
- [ ] **Task dependencies / blocking graph** — v2 when team size or project scope requires it

---

## Feature Prioritization Matrix

| Feature | Operator Value | Implementation Cost | Priority |
|---------|----------------|---------------------|----------|
| Module registry + folder structure | HIGH (architectural foundation) | LOW | P1 |
| Sidebar extension | HIGH (discoverability) | LOW | P1 |
| Migration 005: kb_entries | HIGH (KB is inert without data) | LOW | P1 |
| KB list + detail + form | HIGH (core KB workflow) | MEDIUM | P1 |
| Migration 006: tasks | HIGH (tasks inert without data) | LOW | P1 |
| Task list + form | HIGH (core task workflow) | MEDIUM | P1 |
| Home page module hub | HIGH (entry point to platform) | LOW | P1 |
| Activity feed on home | MEDIUM (situational awareness) | MEDIUM | P1 |
| Task kanban view | MEDIUM (visual workflow) | MEDIUM | P2 |
| KB Cmd+K integration | MEDIUM (search UX) | MEDIUM | P2 |
| Task → KB link | MEDIUM (workflow integration) | LOW | P2 |
| Client workspace KB section | MEDIUM (client context) | LOW | P2 |
| KB auto-capture from GSD | HIGH (long-term value) | HIGH | P3 (v2) |
| Task drag-and-drop | LOW (nice UX) | HIGH | P3 (v2) |

**Priority key:**
- P1: Must ship in v1.5 core
- P2: Ship in v1.5.x after core is validated
- P3: Future milestone

---

## Competitive Context (Internal Platform Comparisons)

FXL Core is not competing with Notion or Linear. It is purpose-built for the FXL workflow: understanding
a PME's business, generating a BI dashboard, and delivering it. The feature decisions reflect this:

| Feature | Notion | Linear | FXL Core v1.5 |
|---------|--------|--------|---------------|
| KB structure | Flexible (free-form) | None | Typed entries (bug/decision/pattern/lesson) — opinionated by design |
| Task views | Table, Board, Timeline, Calendar | List, Board, Timeline, Cycle | List + Board — minimal, no Calendar/Cycle in v1 |
| Client association | Workspace-level | Project-level | Per-entry and per-task client_slug — matches existing FXL taxonomy |
| Search | Notion AI + text | Global text | Supabase FTS + existing Cmd+K — unified search for operators |
| Modular architecture | Monolithic DB | Issue-centric | Module registry pattern — FXL-specific, enables future module additions |
| KB auto-capture | Manual | Manual | GSD hook integration (v2) — unique to FXL's Claude-first workflow |

**FXL Core's advantage is not breadth of features — it is depth of integration with the FXL process
and Claude Code's GSD workflow.** Every feature decision should serve that integration.

---

## Data Model Sketch

### `kb_entries` (Migration 005)

```sql
create type kb_entry_type as enum ('bug', 'decision', 'pattern', 'lesson');

create table kb_entries (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null default '',         -- markdown
  entry_type  kb_entry_type not null,
  tags        text[] not null default '{}',
  client_slug text,                             -- nullable, refs clients/[slug]/
  created_by  text not null,                    -- Clerk user ID
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  search_vec  tsvector generated always as (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored
);

create index kb_entries_search_idx on kb_entries using gin(search_vec);
create index kb_entries_type_idx on kb_entries(entry_type);
create index kb_entries_client_idx on kb_entries(client_slug);
```

### `tasks` (Migration 006)

```sql
create type task_status as enum ('todo', 'in_progress', 'done', 'blocked');
create type task_priority as enum ('low', 'medium', 'high');

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,                            -- markdown
  status       task_status not null default 'todo',
  priority     task_priority not null default 'medium',
  client_slug  text,                            -- nullable
  created_by   text not null,                   -- Clerk user ID
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  due_date     date
);

create index tasks_status_idx on tasks(status);
create index tasks_client_idx on tasks(client_slug);
```

**No RLS in v1.5** — consistent with existing pattern (comments, blueprints, briefings all operate
without RLS, using Clerk auth at the application layer). RLS is deferred to v2 (SEC-01 in out-of-scope).

---

## Sources

- [Architecture Decision Records — adr.github.io](https://adr.github.io/) — confirms structure for `decision` entry type: Context, Decision, Consequences (HIGH confidence — official ADR specification)
- [MADR format — adr.github.io/madr](https://adr.github.io/madr/) — Markdown ADR template validates the "decision" KB entry type format
- [AWS: Master Architecture Decision Records best practices](https://aws.amazon.com/blogs/architecture/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making/) — confirms one decision per record, full sentences, team review (MEDIUM confidence — official AWS blog)
- [Martin Fowler: Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html) — validates feature-based module structure with own components/hooks/types per module (HIGH confidence — official Fowler article)
- [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — confirms pattern: no RLS = consistent with existing FXL Core tables (HIGH confidence — official Supabase docs)
- [BoldDesk: Internal Knowledge Base guide](https://www.bolddesk.com/learn/internal-knowledge-base) — confirms expected features: typed entries, tags, search, team creation (MEDIUM confidence — industry guide)
- [GetStream: Activity Feed Design guide](https://getstream.io/blog/activity-feed-design/) — validates activity feed as standard hub component: chronological mixed-type events (MEDIUM confidence — verified source)
- Existing FXL Core codebase analysis: `Sidebar.tsx`, `App.tsx`, `supabase/migrations/`, `src/pages/clients/` — direct inspection of existing patterns for integration (HIGH confidence — primary source)

---

*Feature research for: v1.5 Modular Foundation & Knowledge Base (Internal Operational Platform)*
*Researched: 2026-03-12*
