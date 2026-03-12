# Architecture Research

**Domain:** Modular SPA — Knowledge Base + Task Management integration into existing React + Supabase platform
**Researched:** 2026-03-12
**Confidence:** HIGH (based on direct codebase reading + established React SPA patterns)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TopNav (sticky, full-width)               │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                   │
│   Sidebar.tsx    │            <Outlet /> (page content)             │
│   (w-64, fixed)  │                                                   │
│                  │   / Home (modular hub)                           │
│   [nav tree      │   /processo/*  DocRenderer                       │
│    hardcoded     │   /ferramentas/* DocRenderer                     │
│    today]        │   /clients/:slug/* interactive pages             │
│                  │   /knowledge-base/* (NEW)                        │
│                  │   /tasks/* (NEW)                                  │
│                  │                                                   │
├──────────────────┴──────────────────────────────────────────────────┤
│                        Supabase (data layer)                        │
│  comments | share_tokens | blueprint_configs | briefing_configs     │
│  knowledge_entries (NEW) | tasks (NEW) | projects (NEW)             │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities (Current State)

| Component | Responsibility | Location |
|-----------|---------------|----------|
| `App.tsx` | Route definitions, layout grouping | `src/App.tsx` |
| `Layout.tsx` | Sidebar + TopNav + Outlet wrapper | `src/components/layout/` |
| `Sidebar.tsx` | Hardcoded nav tree (`NavItem[]`) | `src/components/layout/` |
| `docs-parser.ts` | `import.meta.glob` over `docs/`, frontmatter + section parsing | `src/lib/` |
| `search-index.ts` | Builds flat `SearchEntry[]` from all docs | `src/lib/` |
| `DocRenderer.tsx` | Route handler for any `/docs/*.md` path | `src/pages/` |
| `WireframeViewer` | Full-screen, outside Layout, parametric by `:clientSlug` | `src/pages/clients/` |

---

## Recommended Structure for v1.5

The existing architecture is a flat SPA. The modularization goal is NOT a micro-frontend split — it is
organizing code into module-shaped feature folders while keeping a single React app, single router,
and single Supabase client.

### Target File Structure

```
src/
├── modules/                     # NEW — feature modules, each self-contained
│   ├── knowledge-base/
│   │   ├── index.ts             # module manifest (routes, nav items, display name)
│   │   ├── pages/
│   │   │   ├── KBIndex.tsx      # list view — all entries, filterable
│   │   │   └── KBEntry.tsx      # single entry detail view
│   │   ├── components/
│   │   │   ├── KBEntryCard.tsx
│   │   │   └── KBEntryForm.tsx
│   │   ├── lib/
│   │   │   └── kb-service.ts    # Supabase CRUD wrappers for knowledge_entries
│   │   └── types.ts             # KnowledgeEntry, KBCategory, etc.
│   │
│   ├── tasks/
│   │   ├── index.ts             # module manifest
│   │   ├── pages/
│   │   │   ├── TasksIndex.tsx   # board / list view
│   │   │   └── TaskDetail.tsx
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskStatusBadge.tsx
│   │   ├── lib/
│   │   │   └── tasks-service.ts
│   │   └── types.ts             # Task, Project, TaskStatus, etc.
│   │
│   ├── docs/                    # WRAP existing doc machinery (not rewrite)
│   │   └── index.ts             # manifest only — pages/lib already in src/pages + src/lib
│   │
│   └── wireframe-builder/       # WRAP existing tool (not move)
│       └── index.ts             # manifest only — code stays in tools/wireframe-builder/
│
├── registry/
│   └── modules.ts               # imports all module manifests, exports MODULE_REGISTRY
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx           # unchanged structure
│   │   ├── Sidebar.tsx          # MODIFY: accepts nav from registry instead of hardcoded tree
│   │   ├── TopNav.tsx           # unchanged
│   │   ├── ThemeToggle.tsx      # unchanged
│   │   └── ScrollToTop.tsx      # unchanged
│   ├── docs/                    # unchanged
│   └── ui/                      # unchanged (shadcn)
│
├── pages/                       # unchanged — existing pages stay here
│   ├── Home.tsx                 # MODIFY: reads MODULE_REGISTRY to render module cards
│   ├── DocRenderer.tsx          # unchanged
│   ├── Login.tsx                # unchanged
│   ├── Profile.tsx              # unchanged
│   ├── SharedWireframeView.tsx  # unchanged
│   ├── clients/                 # unchanged
│   └── docs/                   # unchanged
│
├── lib/                         # unchanged
│   ├── docs-parser.ts           # unchanged
│   ├── search-index.ts          # MODIFY: include KB entries in search
│   ├── supabase.ts              # unchanged
│   └── utils.ts                 # unchanged
│
└── App.tsx                      # MODIFY: reads MODULE_REGISTRY to register routes
```

### Structure Rationale

- **`src/modules/`:** Each module owns its pages, components, lib, and types. This is the key addition — it creates a named boundary without requiring a micro-frontend split. Existing code is NOT moved inside; legacy code remains in `src/pages/`, `src/lib/`, and `tools/`.

- **`src/registry/modules.ts`:** Single import point. `App.tsx` and `Sidebar.tsx` read from it. This is the "module registry" pattern that lets new modules be added by creating a folder + exporting a manifest.

- **Module manifests (`index.ts`):** Lightweight descriptor objects — not runtime classes. Keep them plain data so App.tsx can safely import without circular deps.

- **Wrapper manifests for existing code:** `docs/index.ts` and `wireframe-builder/index.ts` do NOT move code. They exist only so the registry knows these areas exist and can surface them in Home + Sidebar. This preserves the migration path: zero risk of breaking existing pages.

---

## Architectural Patterns

### Pattern 1: Module Manifest

**What:** Each module exports a plain object describing its identity, routes, nav items, and home card. The registry assembles them.
**When to use:** Whenever a new top-level area of the platform is added.
**Trade-offs:** Simpler than dynamic import() plugin systems. No lazy discovery — all modules are statically imported. That is intentional: small team, explicit control.

```typescript
// src/modules/knowledge-base/index.ts
import type { ModuleManifest } from '@/registry/modules'
import KBIndex from './pages/KBIndex'
import KBEntry from './pages/KBEntry'
import KBEntryForm from './pages/KBEntryForm'

export const knowledgeBaseModule: ModuleManifest = {
  id: 'knowledge-base',
  displayName: 'Knowledge Base',
  description: 'Registro estruturado de bugs, decisoes e padroes',
  icon: 'BookOpen',
  rootPath: '/knowledge-base',
  navItems: [
    { label: 'Todas as Entradas', href: '/knowledge-base' },
    { label: 'Nova Entrada', href: '/knowledge-base/new' },
  ],
  routes: [
    { path: '/knowledge-base', component: KBIndex },
    { path: '/knowledge-base/new', component: KBEntryForm },
    { path: '/knowledge-base/:id', component: KBEntry },
  ],
  homeCard: {
    badge: 'Knowledge Base',
    title: 'Bugs, decisoes e padroes',
    description: 'Consulte antes de investigar qualquer problema',
    href: '/knowledge-base',
  },
}
```

```typescript
// src/registry/modules.ts
import type { ComponentType } from 'react'

export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
}

export type RouteDescriptor = {
  path: string
  component: ComponentType
}

export type HomeCard = {
  badge: string
  title: string
  description: string
  href: string
}

export type ModuleManifest = {
  id: string
  displayName: string
  description: string
  icon: string
  rootPath: string
  navItems: NavItem[]
  routes: RouteDescriptor[]
  homeCard: HomeCard
}

import { docsModule } from '@/modules/docs'
import { wireframeBuilderModule } from '@/modules/wireframe-builder'
import { knowledgeBaseModule } from '@/modules/knowledge-base'
import { tasksModule } from '@/modules/tasks'

export const MODULE_REGISTRY: ModuleManifest[] = [
  docsModule,
  wireframeBuilderModule,
  knowledgeBaseModule,
  tasksModule,
]
```

### Pattern 2: Registry-Driven Sidebar

**What:** Sidebar reads `MODULE_REGISTRY` instead of a hardcoded `navigation` array. The existing `NavItem[]` type in Sidebar.tsx maps 1:1 to manifest `navItems`.
**When to use:** Immediately when introducing the registry.
**Trade-offs:** Slightly less direct than hardcoded nav, but eliminates the need to manually sync App.tsx + Sidebar.tsx + Home.tsx every time a module is added.

The migration is:
1. Extract hardcoded `navigation` array into `docsModule.navItems` + `wireframeBuilderModule.navItems`
2. Sidebar reads `MODULE_REGISTRY.flatMap(m => m.navItems)`
3. No change to `NavSection` component — structure is identical to existing `NavItem[]` shape

### Pattern 3: Registry-Driven Route Registration

**What:** App.tsx reads `MODULE_REGISTRY` to register routes instead of hardcoding every import.
**When to use:** Alongside Pattern 2 — these ship together.
**Trade-offs:** Slightly harder to trace at a glance vs explicit imports, but scales cleanly. Component references (not strings) in route descriptors preserve TypeScript safety and tree-shaking.

```tsx
// App.tsx — new section inside the Layout route group
{MODULE_REGISTRY.flatMap(mod =>
  mod.routes.map(route => (
    <Route
      key={route.path}
      path={route.path}
      element={<route.component />}
    />
  ))
)}
```

All module routes go inside the `<ProtectedRoute><Layout /></ProtectedRoute>` group. The existing hardcoded client/doc routes stay hardcoded until explicitly migrated.

### Pattern 4: Service Layer per Module

**What:** Each module has a `lib/[module]-service.ts` that wraps all Supabase calls. Pages import from the service, not from `src/lib/supabase.ts` directly.
**When to use:** For any new Supabase-backed feature (KB, tasks).
**Trade-offs:** Thin indirection, but consistent with how the rest of the app works. Supabase client access stays in lib files only.

```typescript
// src/modules/knowledge-base/lib/kb-service.ts
import { supabase } from '@/lib/supabase'
import type { KnowledgeEntry, CreateKnowledgeEntryInput } from '../types'

export async function getKBEntries(): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createKBEntry(
  input: CreateKnowledgeEntryInput
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data
}
```

---

## Data Flow

### Knowledge Base Entry Flow

```
User submits KB form
    |
KBEntryForm.tsx
    |
kb-service.createKBEntry(input)
    |
Supabase INSERT knowledge_entries
    |
Redirect to /knowledge-base/:id
    |
KBEntry.tsx -> kb-service.getKBEntry(id) -> render detail
```

### Task Creation Flow (with Client Link)

```
User creates task from client page
    |
TaskForm.tsx (receives clientSlug prop or from URL context)
    |
tasks-service.createTask({ ...input, client_slug })
    |
Supabase INSERT tasks
    |
Redirect to /tasks/:id (or back to client page)
    |
TaskDetail.tsx loads task + linked entities (blueprint, KB entries)
```

### Module Registration Flow (build time)

```
Developer adds new module folder + exports ModuleManifest
    |
Import manifest in src/registry/modules.ts
    |
MODULE_REGISTRY updated (static constant)
    |
Vite rebuilds — App.tsx picks up new routes
Sidebar.tsx renders new nav section
Home.tsx renders new module card
```

---

## Supabase Schema for New Features

### knowledge_entries table (migration 005)

```sql
CREATE TABLE public.knowledge_entries (
  id          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text      NOT NULL
                CHECK (category IN ('bug', 'decision', 'pattern', 'gotcha')),
  title       text      NOT NULL,
  body        text      NOT NULL,         -- markdown content
  tags        text[]    DEFAULT '{}',
  client_slug text,                       -- nullable: global or client-specific
  related_phase text,                     -- optional: 'wireframe', 'briefing', etc.
  author_id   text,                       -- Clerk user ID (text, not uuid)
  author_name text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Same anon-permissive RLS as blueprint_configs / briefing_configs
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_kb" ON knowledge_entries FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_kb" ON knowledge_entries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_kb" ON knowledge_entries FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_kb" ON knowledge_entries FOR DELETE TO anon USING (true);
```

### tasks table (migration 006)

```sql
CREATE TABLE public.tasks (
  id                          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  title                       text    NOT NULL,
  description                 text,           -- markdown
  status                      text    NOT NULL DEFAULT 'open'
                                CHECK (status IN ('open', 'in_progress', 'done', 'blocked')),
  priority                    text    NOT NULL DEFAULT 'medium'
                                CHECK (priority IN ('low', 'medium', 'high')),
  project_slug                text    NOT NULL, -- 'fxl-core' | client slug
  client_slug                 text,             -- nullable: internal tasks have no client
  assignee_id                 text,             -- Clerk user ID
  assignee_name               text,
  due_date                    date,
  linked_kb_entry_id          uuid    REFERENCES knowledge_entries(id) ON DELETE SET NULL,
  linked_blueprint_client_slug text,            -- soft link, not FK (clients are FS-based)
  created_by                  text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  slug         text    PRIMARY KEY,         -- 'fxl-core', 'financeiro-conta-azul', etc.
  display_name text    NOT NULL,
  description  text,
  status       text    NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'paused', 'archived')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Same anon-permissive RLS pattern
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_projects" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## Integration Points

### New vs Modified

| File | Status | What Changes |
|------|--------|-------------|
| `src/App.tsx` | MODIFY | Add module route registration from registry |
| `src/components/layout/Sidebar.tsx` | MODIFY | Read nav from MODULE_REGISTRY instead of hardcoded array |
| `src/pages/Home.tsx` | MODIFY | Add KB + Tasks module cards; reads homeCard from registry |
| `src/lib/search-index.ts` | MODIFY | Add async KB entries fetch; return combined SearchEntry[] |
| `src/registry/modules.ts` | NEW | ModuleManifest type + MODULE_REGISTRY constant |
| `src/modules/knowledge-base/` | NEW | Full module: index, pages, components, lib, types |
| `src/modules/tasks/` | NEW | Full module: index, pages, components, lib, types |
| `src/modules/docs/index.ts` | NEW | Wrapper manifest only — no code moved |
| `src/modules/wireframe-builder/index.ts` | NEW | Wrapper manifest only — no code moved |
| `supabase/migrations/005_knowledge_base.sql` | NEW | `knowledge_entries` table + RLS |
| `supabase/migrations/006_tasks.sql` | NEW | `tasks` + `projects` tables + RLS |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Module pages -> Supabase | Via module-scoped service (`lib/[module]-service.ts`) | No direct supabase import in components |
| KB entries -> Search | `search-index.ts` calls Supabase async for KB entries | KB results shown in a distinct section of the Cmd+K palette; docs search remains static (import.meta.glob) |
| Tasks -> Clients | Task holds `client_slug` text field | No FK (clients are filesystem-based, not DB rows). Resolve client display name from slug at render time. |
| Tasks -> KB | `linked_kb_entry_id` FK | Optional link: "this task fixed this KB bug" |
| Sidebar -> Registry | Static import | Registry is a module constant, not React context |
| Home -> Registry | Static import | Same constant, no prop drilling |
| App.tsx -> Registry | Static import | Same constant |

### External Services

| Service | Integration | Notes |
|---------|-------------|-------|
| Supabase | New tables via migration files | Same anon RLS pattern as blueprint_configs and briefing_configs — Clerk handles auth externally |
| Clerk | No change | author_id stored as Clerk user ID (text) in new tables — same as existing pattern |
| Vercel | No change | SPA deploy — new routes handled by Vite client-side routing |

---

## Build Order (considers dependencies)

The registry must exist before any module uses it. Supabase migrations must run before service layer code is tested. Home page changes are the lowest risk and can be done last.

1. **Registry scaffold** — Create `src/registry/modules.ts` with the `ModuleManifest` type and an empty `MODULE_REGISTRY`. Update `Sidebar.tsx` to accept nav from the registry alongside (or replacing) the hardcoded tree. This is the foundation; nothing else can be registered until this exists.

2. **Supabase migrations** — Run `005_knowledge_base.sql` and `006_tasks.sql`. No app code depends on this, but the service layer cannot be tested until tables exist.

3. **Knowledge Base module** — Full module: types, service, pages, components, manifest. Register in `MODULE_REGISTRY`. Wire routes in `App.tsx`. Independent of Tasks, can ship first.

4. **Tasks module** — Types, service, pages, components, manifest. Depends on KB types for the `linked_kb_entry_id` reference. Register in `MODULE_REGISTRY`.

5. **Home page modular hub** — Refactor `Home.tsx` to read `MODULE_REGISTRY.map(m => m.homeCard)` for the module card grid. Depends on registry having final shape (after KB and Tasks are registered).

6. **Search integration** — Extend `search-index.ts` to include KB entries. Depends on KB module being live and `knowledge_entries` table existing.

7. **Wrapper manifests for existing modules** — `docs/index.ts` and `wireframe-builder/index.ts`. No behavior change. Can be done at any point but are lowest priority — they only affect Home page layout.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Moving Existing Code into Module Folders

**What people do:** Move `src/pages/DocRenderer.tsx` into `src/modules/docs/pages/DocRenderer.tsx` on the same PR that adds the registry.

**Why it's wrong:** High breakage risk for zero feature gain. Existing routes, imports, and tests reference the old paths. Two concerns — registry introduction + code reorganization — should be separate phases.

**Do this instead:** Create `src/modules/docs/index.ts` as a manifest only. Leave code in `src/pages/`. Move later, in a dedicated refactoring phase if desired.

### Anti-Pattern 2: Anon RLS with Clerk JWT Assumptions

**What people do:** Add `USING (auth.uid() = author_id::uuid)` to new table RLS policies, assuming Clerk's JWT works with `auth.uid()`.

**Why it's wrong:** Clerk JWTs are not Supabase Auth JWTs. `auth.uid()` returns NULL for Clerk sessions. The existing pattern in this codebase (anon-permissive RLS, Clerk handles auth externally) is already the validated workaround.

**Do this instead:** Keep the anon-permissive RLS pattern from `003_blueprint_configs.sql` and `004_briefing_configs.sql`. Application-level auth via Clerk (check `useAuth()` before calling service functions that write data).

### Anti-Pattern 3: String-Based Component Resolution in Registry

**What people do:** Store component names as strings in the registry (`route.component = 'KBIndex'`) and use a generic string-to-component lookup map.

**Why it's wrong:** Loses TypeScript type safety, breaks tree-shaking, and moves errors from compile time to runtime.

**Do this instead:** Import page components directly in the module manifest. Pass `ComponentType` references in the route descriptor. The `ModuleManifest` type enforces this.

### Anti-Pattern 4: Dynamic Sidebar via Context/State

**What people do:** Introduce a `SidebarContext` that modules push nav items into at runtime (e.g., on component mount).

**Why it's wrong:** Causes nav to flicker on load, creates ordering ambiguity, and couples page lifecycle to nav rendering. Hard to debug.

**Do this instead:** Registry is a static constant. Nav is determined at compile time. Simpler, faster, and predictable.

### Anti-Pattern 5: Overloading the Supabase Client for App-Level Auth Checks

**What people do:** Use `supabase.auth.getUser()` to check operator identity before KB/task writes.

**Why it's wrong:** Supabase Auth is not the auth layer here — Clerk is. `supabase.auth.getUser()` returns nothing meaningful for Clerk sessions. Auth checks must go through `@clerk/react`'s `useAuth()` hook.

**Do this instead:** Gate write operations with `useAuth().isSignedIn` from Clerk. The service functions themselves are auth-agnostic (anon policies allow all); the UI enforces access.

---

## Scaling Considerations

This is an internal operator tool. Scaling to millions of users is out of scope. The relevant scaling concerns:

| Concern | Current (1-5 users) | If FXL grows (10-50 clients) |
|---------|---------------------|------------------------------|
| KB entries volume | Trivial | Add pagination + `pg_trgm` full-text search in Supabase |
| Tasks volume | Trivial | Add filters by project/status/assignee; manageable in Supabase |
| Module count | 4 modules in v1.5 | Add new module folder + manifest; no architectural change needed |
| Bundle size | Fine — Vite splits by route already | Use `React.lazy` per module if bundle grows |
| RLS security | Anon-permissive (operator-only tool) | Add Clerk JWT integration when multi-tenant v2 ships (SEC-01/02 in backlog) |

---

## Sources

- Direct codebase reading: `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Layout.tsx`, `src/pages/Home.tsx`, `src/lib/docs-parser.ts`, `src/lib/search-index.ts`, `supabase/migrations/001-004`
- `.planning/PROJECT.md` — architecture decisions, constraints, key decisions table, v1.5 milestone goals
- Established React SPA feature-folder patterns (MEDIUM confidence — widely documented, no single canonical source; consistent with how the wireframe-builder module is already structured)
- Supabase anon RLS + Clerk external auth pattern — HIGH confidence (already validated in production in this codebase since v1.1)

---

*Architecture research for: v1.5 Modular Foundation & Knowledge Base — FXL Core*
*Researched: 2026-03-12*
