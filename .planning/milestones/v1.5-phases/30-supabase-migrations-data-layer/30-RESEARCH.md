# Phase 30: Supabase Migrations & Data Layer - Research

**Researched:** 2026-03-12
**Domain:** Supabase PostgreSQL migrations, tsvector full-text search, typed TypeScript service layer
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KB-01 | Tabela kb_entries no Supabase com 4 tipos (bug, decision, pattern, lesson), tags, client_slug | Migration 005 schema design, tsvector generated column, GIN index, CHECK constraint for entry_type |
| TASK-01 | Tabela tasks no Supabase com status enum, priority, client_slug, due_date | Migration 006 schema design, status CHECK constraint (todo/in_progress/done/blocked), typed service |

</phase_requirements>

## Summary

Phase 30 is a pure database + service layer phase — no UI is built. Two migrations are needed: `005_knowledge_entries.sql` and `006_tasks.sql`. Both follow the project's established pattern (anon-permissive RLS, no Supabase Auth, text IDs for Clerk compatibility). The new tables introduce PostgreSQL features not yet used in this project: a `tsvector` GENERATED ALWAYS column for full-text search (with Portuguese stemming), a GIN index over it, and a `CHECK` constraint enforcing an enum-like status column.

The service layer follows the pattern established in `tools/wireframe-builder/lib/comments.ts` and `blueprint-store.ts`: a TypeScript module that imports `supabase` from `@/lib/supabase`, exports named async functions, and uses explicit types — no `any`, no direct Supabase client usage inside React components. Both `kb-service.ts` and `tasks-service.ts` belong in `src/lib/` or a future `src/modules/[name]/lib/` folder depending on Phase 29 module structure decisions.

**Primary recommendation:** Write migrations first, apply via `make migrate`, then build typed service stubs against the live schema — no hand-rolled query builders, no raw SQL in React components.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 (installed) | DB client for CRUD and FTS queries | Already in project, all existing tables use it |
| PostgreSQL tsvector | native (Supabase-managed PG 15+) | Full-text search with Portuguese stemming | No external search service needed; native GIN index is fast enough for internal tool |
| Supabase CLI | via `make migrate` | Apply migrations to remote DB | Already configured — `make migrate` reads SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD from .env.local |

### No New Dependencies

Phase 30 requires zero new npm packages. All capabilities are native to the existing stack:
- Full-text search: PostgreSQL `tsvector`, `tsquery` via Supabase RPC or `.textSearch()`
- Type safety: TypeScript interfaces derived from column definitions
- Service pattern: Supabase JS client already in project

---

## Architecture Patterns

### Migration Naming Convention (from existing migrations)

```
supabase/migrations/
├── 001_comments_schema.sql         # Original tables
├── 002_clerk_migration.sql         # Auth migration
├── 003_blueprint_configs.sql       # Blueprint table
├── 004_briefing_configs.sql        # Briefing table
├── 005_knowledge_entries.sql       # NEW: KB-01
└── 006_tasks.sql                   # NEW: TASK-01
```

All migrations are standalone SQL files with:
- Table creation with `gen_random_uuid()` primary key
- RLS enabled immediately after table creation
- Anon-permissive policies (project-wide pattern since migration 002)
- Indexes on frequently queried columns (client_slug, etc.)

### Pattern 1: Migration 005 — knowledge_entries

**What:** Creates the `knowledge_entries` table with a tsvector GENERATED ALWAYS column for Portuguese FTS and a GIN index.

```sql
-- Source: Existing migration pattern + PostgreSQL docs for tsvector generated columns
CREATE TABLE public.knowledge_entries (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type  text        NOT NULL CHECK (entry_type IN ('bug', 'decision', 'pattern', 'lesson')),
  title       text        NOT NULL,
  body        text        NOT NULL,
  tags        text[]      NOT NULL DEFAULT '{}',
  client_slug text,
  created_by  text,                         -- Clerk user ID (text, like other tables)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  search_vec  tsvector    GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) STORED
);

ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_knowledge_entries"
  ON knowledge_entries FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_knowledge_entries"
  ON knowledge_entries FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_knowledge_entries"
  ON knowledge_entries FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_knowledge_entries"
  ON knowledge_entries FOR DELETE TO anon USING (true);

CREATE INDEX idx_knowledge_entries_search ON knowledge_entries USING GIN (search_vec);
CREATE INDEX idx_knowledge_entries_client_slug ON knowledge_entries (client_slug);
CREATE INDEX idx_knowledge_entries_entry_type ON knowledge_entries (entry_type);
```

**Key decisions from STATE.md:**
- Column is named `entry_type` (NOT `kind` or `category`) — locked decision
- tsvector language is `'portuguese'` (KB content is in Portuguese) — locked decision
- Table is named `knowledge_entries` (not `kb_entries`) — per phase goal wording in ROADMAP.md; REQUIREMENTS.md says `kb_entries` but ROADMAP success criteria say `knowledge_entries` — use `knowledge_entries` to match the phase success criteria

### Pattern 2: Migration 006 — tasks

**What:** Creates the `tasks` table with a CHECK constraint on status column matching the Kanban states.

```sql
-- Source: Existing migration pattern
CREATE TABLE public.tasks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  status      text        NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
  priority    text        NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  client_slug text,
  due_date    date,
  created_by  text,                         -- Clerk user ID (text)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_tasks"
  ON tasks FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_tasks"
  ON tasks FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_tasks"
  ON tasks FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_tasks"
  ON tasks FOR DELETE TO anon USING (true);

CREATE INDEX idx_tasks_client_slug ON tasks (client_slug);
CREATE INDEX idx_tasks_status ON tasks (status);
```

### Pattern 3: Service Layer Convention

**What:** Service modules follow `tools/wireframe-builder/lib/comments.ts` pattern — named exports, typed params objects, throw on error.

**Where to put them:** The location depends on Phase 29's module structure. Given that Phase 29 creates `src/modules/[name]/` folders, services should go in:
- `src/modules/knowledge-base/lib/kb-service.ts`
- `src/modules/tasks/lib/tasks-service.ts`

However, if Phase 29 is not yet complete when Phase 30 executes, put them in `src/lib/` temporarily and note they will move to module folders in Phase 31/32.

```typescript
// Source: Established pattern from tools/wireframe-builder/lib/comments.ts
import { supabase } from '@/lib/supabase'

export type KnowledgeEntryType = 'bug' | 'decision' | 'pattern' | 'lesson'

export interface KnowledgeEntry {
  id: string
  entry_type: KnowledgeEntryType
  title: string
  body: string
  tags: string[]
  client_slug: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CreateKnowledgeEntryParams {
  entry_type: KnowledgeEntryType
  title: string
  body: string
  tags?: string[]
  client_slug?: string
  created_by?: string
}

export async function createKnowledgeEntry(
  params: CreateKnowledgeEntryParams
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert({
      entry_type: params.entry_type,
      title: params.title,
      body: params.body,
      tags: params.tags ?? [],
      client_slug: params.client_slug ?? null,
      created_by: params.created_by ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function listKnowledgeEntries(filters?: {
  entry_type?: KnowledgeEntryType
  client_slug?: string
}): Promise<KnowledgeEntry[]> {
  let query = supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.entry_type) {
    query = query.eq('entry_type', filters.entry_type)
  }
  if (filters?.client_slug) {
    query = query.eq('client_slug', filters.client_slug)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as KnowledgeEntry[]
}

export async function searchKnowledgeEntries(
  queryText: string
): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .textSearch('search_vec', queryText, { config: 'portuguese' })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as KnowledgeEntry[]
}
```

```typescript
// tasks-service.ts pattern
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  client_slug: string | null
  due_date: string | null    // ISO date string (date column returns string)
  created_by: string | null
  created_at: string
  updated_at: string
}
```

### Anti-Patterns to Avoid

- **Generating tsvector in application code:** Always use PostgreSQL `GENERATED ALWAYS AS ... STORED` — the DB maintains it automatically on every insert/update, no app code needed.
- **Using `authenticated` role in RLS:** Project switched to `anon` role in migration 002. All new policies must target `anon`, not `authenticated`.
- **Importing `supabase` inside React components:** The service module is the only consumer of the client. Components call service functions.
- **Using `any` in service return types:** Cast with `as KnowledgeEntry` after `if (error) throw error` — matches the project pattern in comments.ts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full-text search | Custom LIKE/ilike queries with JS filtering | PostgreSQL tsvector + `.textSearch()` | Native FTS handles stemming, ranking, multi-word queries — LIKE cannot stem "decisoes" → "decisão" |
| Enum validation | JS-level enum checks before insert | PostgreSQL CHECK constraint | DB rejects invalid values at the wire, no need for app-level guards |
| Search index maintenance | App code that updates a search index column | GENERATED ALWAYS tsvector column | Postgres updates it automatically on every INSERT/UPDATE — no trigger needed |
| Status state machine | Custom transition validation logic | CHECK constraint + typed union | Phase 30 is a data layer stub; complex transitions belong in Phase 32 UI |

---

## Common Pitfalls

### Pitfall 1: tsvector GENERATED ALWAYS — Column Cannot Be Written
**What goes wrong:** Attempting to INSERT or UPDATE the `search_vec` column directly causes a PostgreSQL error: "cannot insert into column "search_vec"".
**Why it happens:** GENERATED columns are computed by the DB — they are read-only from the application perspective.
**How to avoid:** Never include `search_vec` in `.insert()` or `.update()` calls. Only include it in `.select()` for debugging, or omit it (Supabase JS returns all columns by default via `select('*')`).
**Warning signs:** Error message mentioning "generated column" during insert.

### Pitfall 2: Migration Numbering Gaps
**What goes wrong:** Creating `005_` when the Supabase remote already has migrations up to 004. If a migration number is skipped or duplicated, `supabase db push` may fail or apply migrations out of order.
**Why it happens:** Local file names must be sequential and unique.
**How to avoid:** Verify the highest existing migration number before creating new files. Current state: 004 is the latest → next are 005 and 006.

### Pitfall 3: `.textSearch()` Configuration Mismatch
**What goes wrong:** Calling `.textSearch('search_vec', query)` without specifying `{ config: 'portuguese' }` uses the default `'english'` stemmer, which won't stem Portuguese words correctly.
**Why it happens:** The tsvector is built with `to_tsvector('portuguese', ...)` but the tsquery defaults to `'english'` if not specified.
**How to avoid:** Always pass `{ config: 'portuguese' }` in the `.textSearch()` options object.

### Pitfall 4: `date` Column Type vs TypeScript `string`
**What goes wrong:** PostgreSQL `date` column (for `due_date`) is returned as a `string` (e.g., `"2026-03-15"`) by Supabase JS, not a JavaScript `Date` object.
**Why it happens:** Supabase JS serializes dates as ISO strings.
**How to avoid:** Type `due_date` as `string | null` in the TypeScript interface, not `Date | null`. Parse with `new Date(due_date)` only when needed in UI.

### Pitfall 5: Existing Operations Regression
**What goes wrong:** Adding new migrations can fail silently if the Supabase project has schema drift (local differs from remote).
**Why it happens:** If previous migrations were applied manually or the project was reset, the migration history may not match.
**How to avoid:** Run `make migrate` after each migration file, check the Supabase dashboard to confirm table creation. Test at minimum one existing operation (blueprint save) after applying both migrations.

---

## Code Examples

### Full-text search query via Supabase JS

```typescript
// Source: @supabase/supabase-js docs — .textSearch() method
const { data, error } = await supabase
  .from('knowledge_entries')
  .select('id, title, entry_type, tags, client_slug, created_at')
  .textSearch('search_vec', userQuery, { config: 'portuguese' })
  .order('created_at', { ascending: false })
  .limit(20)

// userQuery can be a plain word ("decisao") or multiple words ("bug autenticacao")
// Supabase converts it to a tsquery automatically
```

### Applying tags filter (array contains)

```typescript
// PostgreSQL array column: use .contains() for tag filter
const { data, error } = await supabase
  .from('knowledge_entries')
  .select('*')
  .contains('tags', ['autenticacao'])  // entries that have this tag
```

### Service error handling convention (from existing codebase)

```typescript
// Source: tools/wireframe-builder/lib/comments.ts pattern
const { data, error } = await supabase
  .from('knowledge_entries')
  .insert({ ... })
  .select()
  .single()

if (error) throw error        // Let caller handle — no silent swallowing
return data as KnowledgeEntry  // Explicit cast after validation
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Supabase Auth (uuid author_id) | Clerk auth (text author_id) | Migration 002 | All new tables use `text` for user IDs, anon role for RLS |
| `authenticated` role in RLS | `anon` role in RLS | Migration 002 | All policies target `anon` — this is the project-wide pattern |
| Separate search table / LIKE queries | tsvector GENERATED ALWAYS + GIN index | Phase 30 (new) | First FTS feature in the project |

**No deprecated patterns apply for this phase** — the patterns being introduced (tsvector, GIN index, CHECK constraints) are stable PostgreSQL features available in all Supabase PG 15+ projects.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run src/lib/kb-service.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KB-01 | `createKnowledgeEntry` inserts a row with correct entry_type | unit (Supabase mock) | `npx vitest run src/lib/kb-service.test.ts` | Wave 0 |
| KB-01 | `listKnowledgeEntries` filters by entry_type | unit (Supabase mock) | `npx vitest run src/lib/kb-service.test.ts` | Wave 0 |
| KB-01 | `searchKnowledgeEntries` calls .textSearch with portuguese config | unit (Supabase mock) | `npx vitest run src/lib/kb-service.test.ts` | Wave 0 |
| TASK-01 | `createTask` inserts row with valid status | unit (Supabase mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 |
| TASK-01 | `updateTaskStatus` updates only status field | unit (Supabase mock) | `npx vitest run src/lib/tasks-service.test.ts` | Wave 0 |
| KB-01 + TASK-01 | `npx tsc --noEmit` compiles service files without errors | type check | `npx tsc --noEmit` | Existing |

**Note:** Migration correctness (table schema, GIN index, CHECK constraint) is verified by applying `make migrate` against the live Supabase instance and querying the information schema or Supabase dashboard — not via automated unit tests. Regression check for existing operations is a manual smoke test.

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/kb-service.test.ts src/lib/tasks-service.test.ts`
- **Per wave merge:** `npx vitest run && npx tsc --noEmit`
- **Phase gate:** Full suite green + migration applied cleanly + `npx tsc --noEmit` zero errors

### Wave 0 Gaps

- [ ] `src/lib/kb-service.test.ts` — covers KB-01 (create, list, search with mocked Supabase)
- [ ] `src/lib/tasks-service.test.ts` — covers TASK-01 (create, list, update status with mocked Supabase)

Mock pattern to use: same as `tools/wireframe-builder/lib/blueprint-store.test.ts` — mock `@/lib/supabase` via `vi.mock()`, wire fluent chain with `vi.fn()`.

---

## Open Questions

1. **Service file location: `src/lib/` vs `src/modules/[name]/lib/`**
   - What we know: Phase 29 creates `src/modules/[name]/` folder structure
   - What's unclear: Whether Phase 29 will be complete before Phase 30 runs, and whether the planner should pre-position service files in module folders or in `src/lib/` temporarily
   - Recommendation: Place in `src/lib/kb-service.ts` and `src/lib/tasks-service.ts` for Phase 30 (safe, unconditional). Phase 31/32 can move them to `src/modules/knowledge-base/lib/` and `src/modules/tasks/lib/` when the module structure exists.

2. **`knowledge_entries` vs `kb_entries` table name**
   - What we know: REQUIREMENTS.md KB-01 says `kb_entries`; ROADMAP.md Phase 30 success criteria says `knowledge_entries`
   - What's unclear: Which name the planner intends
   - Recommendation: Use `knowledge_entries` — the success criteria are more specific and authoritative. The service functions can be aliased for brevity.

---

## Sources

### Primary (HIGH confidence)

- Existing migrations `001`–`004` in `supabase/migrations/` — RLS pattern, naming, anon role
- `tools/wireframe-builder/lib/comments.ts` — service layer pattern to replicate
- `tools/wireframe-builder/lib/blueprint-store.test.ts` — Supabase mock pattern for vitest
- `.planning/STATE.md` Accumulated Context — locked decisions: `entry_type` column name, `'portuguese'` tsvector language
- `.planning/ROADMAP.md` Phase 30 success criteria — table names, column requirements

### Secondary (MEDIUM confidence)

- PostgreSQL documentation on `GENERATED ALWAYS AS ... STORED` tsvector columns — verified behavior matches project's PostgreSQL version (Supabase runs PG 15+)
- Supabase JS `.textSearch()` method — verified `config` option for language-specific stemming

### Tertiary (LOW confidence)

- None — all critical claims verified from project's own codebase or official docs

---

## Metadata

**Confidence breakdown:**
- Migration schema: HIGH — derived directly from existing migration files in the repo
- tsvector/FTS pattern: HIGH — standard PostgreSQL feature, consistent with project's Supabase version
- Service layer pattern: HIGH — copied directly from `comments.ts` which is production code
- RLS pattern: HIGH — locked by migration 002 and confirmed in migrations 003-004
- Test mock pattern: HIGH — exists in `blueprint-store.test.ts`

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable PostgreSQL + Supabase JS patterns)
