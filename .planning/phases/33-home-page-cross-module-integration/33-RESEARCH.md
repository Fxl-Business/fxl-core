# Phase 33: Home Page & Cross-Module Integration — Research

**Researched:** 2026-03-12
**Domain:** React SPA home page composition, async Supabase activity feeds, Cmd+K integration with async KB search
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | Module hub com grid de cards lendo MODULE_REGISTRY (Docs, WF Builder, Clientes, KB, Tarefas) | MODULE_REGISTRY created in Phase 29; Home.tsx receives it as import; renders grid of Link cards |
| HOME-02 | Activity feed com ultimas 10 atualizacoes cross-module (kb_entries, tasks, comments) | Supabase union query via two separate .select() calls merged client-side; ordered by updated_at desc, limit 10 |
| HOME-03 | Secao "Conhecimento" na pagina do cliente mostrando KB entries daquele client_slug | kb-service.ts `listKBEntries({ clientSlug })` call in FinanceiroIndex (and future generic client page); renders list below existing Documentos table |
| KB-07 | Resultados de KB integrados no Cmd+K (async fetch, grupo separado) | SearchCommand.tsx gets a `useKBSearch` hook call; debounced fetch on query input; renders CommandGroup "Base de Conhecimento" below docs groups |
</phase_requirements>

---

## Summary

Phase 33 is the integration phase that ties together all previous v1.5 work. It has four distinct sub-problems: (1) replacing Home.tsx static card sections with data driven from MODULE_REGISTRY; (2) building an activity feed that merges `kb_entries` and `tasks` from Supabase by `updated_at` recency; (3) adding a "Conhecimento" section to the existing client workspace page (FinanceiroIndex); and (4) extending SearchCommand (Cmd+K) to also query KB entries asynchronously alongside the static docs index.

All dependencies (MODULE_REGISTRY from Phase 29, kb-service.ts and tasks-service.ts from Phase 30, KB module from Phase 31, Tasks module from Phase 32) must exist before this phase can be implemented. The phase adds no new database tables and requires no new npm packages — it purely integrates existing pieces.

The most technically interesting sub-problem is KB-07 (Cmd+K integration). The current SearchCommand builds the entire index synchronously via `buildSearchIndex()` (using `import.meta.glob` over docs files). Adding async KB results requires either: (a) debouncing the input and fetching on each keystroke, or (b) fetching all KB entries once on dialog open and filtering locally. Option (b) is simpler and appropriate for an internal tool with a small KB dataset. It avoids race conditions from debounced async input and keeps the UX snappy.

**Primary recommendation:** For KB-07, fetch all KB entries once when the CommandDialog opens (`onOpenChange` → `setOpen(true)`) and filter them locally using the same string-matching logic the cmdk library uses. Use a separate `CommandGroup heading="Base de Conhecimento"` below the docs groups.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 | Activity feed query, KB entry fetch for Cmd+K and client page | Already in project; all data access via service functions |
| react-router-dom | ^6.27.0 | Links in module hub cards, client page routing | App-wide router |
| shadcn/ui command | existing | Cmd+K dialog — CommandGroup, CommandItem | Already in SearchCommand.tsx |
| lucide-react | ^0.460.0 | Icons in module hub cards (sourced from ModuleManifest.icon) | Already installed; icons come from registry |

### No New Dependencies Required

Phase 33 requires zero new npm packages. All capabilities exist in the current stack.

**Installation:**
```bash
# Nothing to install
```

---

## Architecture Patterns

### Recommended File Changes

```
src/
├── pages/
│   └── Home.tsx                          # REPLACE static sections with MODULE_REGISTRY grid + activity feed
├── components/layout/
│   └── SearchCommand.tsx                 # ADD async KB group (KB-07)
├── pages/clients/FinanceiroContaAzul/
│   └── Index.tsx                         # ADD "Conhecimento" section (HOME-03)
└── (no new files required — all integration of existing modules)
```

If Phase 29 creates a generic `/clients/:clientSlug` page, HOME-03 goes there instead of only in FinanceiroIndex. If not, FinanceiroIndex is the only client page and is the correct target.

### Pattern 1: Home — Module Hub Grid (HOME-01)

**What:** Replace the static `quickActions` and `sections` arrays in Home.tsx with a grid mapped from MODULE_REGISTRY.
**When to use:** After Phase 29 ships MODULE_REGISTRY with all 5 module manifests (docs, wireframe-builder, clientes, knowledge-base, tarefas).

The MODULE_REGISTRY `ModuleManifest` shape from Phase 29 research:
```typescript
interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus   // 'active' | 'beta' | 'coming-soon'
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
  description?: string   // Home.tsx needs a description — verify Phase 29 adds this field
}
```

**CRITICAL:** Check Phase 29 output to see if `description` is included in ModuleManifest. If not, either: add it to the manifest in Phase 29's registry update, or maintain a local `HOME_MODULE_DESCRIPTIONS` record keyed by module id. The simpler path is adding `description?: string` to ModuleManifest in Phase 29.

```typescript
// Home.tsx — module grid section
import { MODULE_REGISTRY } from '@/modules/registry'

// In JSX:
<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {MODULE_REGISTRY.map((mod) => {
    const Icon = mod.icon
    return (
      <Link key={mod.id} to={mod.route} className="h-full">
        <div className="flex h-full min-h-[120px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card dark:hover:border-indigo-800">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">{mod.label}</h3>
              {mod.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{mod.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            {mod.status !== 'active' && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800">
                {mod.status}
              </span>
            )}
            <ArrowRight className="h-4 w-4 text-slate-400 ml-auto dark:text-slate-500" />
          </div>
        </div>
      </Link>
    )
  })}
</div>
```

### Pattern 2: Home — Activity Feed (HOME-02)

**What:** Fetch the last 10 updates across `knowledge_entries` and `tasks` ordered by `updated_at` descending. Merge client-side and show in a unified feed.
**Why client-side merge:** Supabase JS client does not support SQL UNION queries directly. The cleanest approach for 2 small tables is 2 concurrent fetches, merge, sort, slice(10).

```typescript
// src/pages/Home.tsx (or extracted to useActivityFeed hook)
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ActivityItem = {
  id: string
  title: string
  type: 'kb_entry' | 'task'
  subtype?: string   // entry_type for KB, status for tasks
  client_slug?: string
  updated_at: string
  href: string
}

function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [kbResult, taskResult] = await Promise.all([
        supabase
          .from('knowledge_entries')
          .select('id, title, entry_type, client_slug, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10),
        supabase
          .from('tasks')
          .select('id, title, status, client_slug, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10),
      ])

      const kbItems: ActivityItem[] = (kbResult.data ?? []).map(e => ({
        id: e.id,
        title: e.title,
        type: 'kb_entry',
        subtype: e.entry_type,
        client_slug: e.client_slug,
        updated_at: e.updated_at,
        href: `/knowledge-base/${e.id}`,
      }))

      const taskItems: ActivityItem[] = (taskResult.data ?? []).map(t => ({
        id: t.id,
        title: t.title,
        type: 'task',
        subtype: t.status,
        client_slug: t.client_slug,
        updated_at: t.updated_at,
        href: `/tarefas`,
      }))

      const merged = [...kbItems, ...taskItems]
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, 10)

      setItems(merged)
      setLoading(false)
    }

    fetch()
  }, [])

  return { items, loading }
}
```

**IMPORTANT:** Call `useActivityFeed()` unconditionally at the top of the Home component (before any early returns) to respect the hooks-before-early-returns rule from project memory.

Activity feed item render:
```typescript
// Relative time formatting — use Intl.RelativeTimeFormat or simple date string
// No library needed — format as "dd/mm/yyyy" from the timestamp
function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
```

### Pattern 3: Client Page "Conhecimento" Section (HOME-03)

**What:** Add a section below the existing "Documentos" table in FinanceiroIndex.tsx (and any future generic client page) that fetches and lists KB entries for the client's slug.
**When to use:** Always — if there are no KB entries, render an empty state (not an error).

```typescript
// In FinanceiroIndex.tsx (or generic ClientPage)
import { useEffect, useState } from 'react'
import { listKBEntries, type KBEntry } from '@/lib/kb-service'
import { Link } from 'react-router-dom'

// Hook called unconditionally at top of component
const [kbEntries, setKbEntries] = useState<KBEntry[]>([])
const [kbLoading, setKbLoading] = useState(true)

useEffect(() => {
  listKBEntries({ clientSlug: 'financeiro-conta-azul' }).then((data) => {
    setKbEntries(data)
    setKbLoading(false)
  }).catch(() => setKbLoading(false))
}, [])

// In JSX:
<div className="mt-8">
  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-foreground">
    Conhecimento
  </h2>
  {kbLoading ? (
    <p className="text-sm text-slate-400">Carregando...</p>
  ) : kbEntries.length === 0 ? (
    <p className="text-sm text-slate-400">Nenhum conhecimento registrado para este cliente.</p>
  ) : (
    <div className="grid gap-3 sm:grid-cols-2">
      {kbEntries.map(entry => (
        <Link key={entry.id} to={`/knowledge-base/${entry.id}`}
          className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {entry.entry_type}
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-foreground">{entry.title}</p>
          {entry.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {entry.tags.map(tag => (
                <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  )}
</div>
```

**Note on hardcoded slug:** FinanceiroIndex.tsx is a hardcoded page for a single client. The slug `financeiro-conta-azul` is hardcoded throughout the file already. This is consistent with Phase 29 wrapper manifest approach — no refactor needed. If a generic `/clients/:clientSlug` page is created in Phase 29/31/32, the slug comes from `useParams()`.

### Pattern 4: Cmd+K KB Integration (KB-07)

**What:** SearchCommand.tsx fetches KB entries when the dialog opens, holds them in local state, and renders a `CommandGroup heading="Base de Conhecimento"` that cmdk filters automatically based on the `value` prop.
**Why fetch-on-open over debounced-on-type:** The cmdk library filters `CommandItem` entries client-side based on the `value` prop and the user's input. This means all we need to do is populate KB entries into `CommandItem` nodes — cmdk handles the filtering for free. A one-time fetch on dialog open is simpler, has no race conditions, and performs well for a small internal KB.

```typescript
// SearchCommand.tsx additions
import { BookOpen } from 'lucide-react'
import { listKBEntries, type KBEntry } from '@/lib/kb-service'

// Add to SearchCommand component (hooks at top, before any early returns):
const [kbEntries, setKbEntries] = useState<KBEntry[]>([])

// Fetch on dialog open:
function handleOpenChange(next: boolean) {
  setOpen(next)
  if (next && kbEntries.length === 0) {
    listKBEntries({}).then(setKbEntries).catch(() => {})
  }
}

// Replace setOpen directly in useEffect keyboard handler:
// setOpen((prev) => !prev)  →  handleOpenChange(!open)

// In JSX, add a KB group after docs groups:
{kbEntries.length > 0 && (
  <CommandGroup heading="Base de Conhecimento">
    {kbEntries.map((entry) => (
      <CommandItem
        key={entry.id}
        value={`${entry.title} ${entry.entry_type} ${entry.tags.join(' ')}`}
        onSelect={() => handleSelect(`/knowledge-base/${entry.id}`)}
      >
        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm">{entry.title}</span>
          <span className="text-xs text-muted-foreground">{entry.entry_type}</span>
        </div>
      </CommandItem>
    ))}
  </CommandGroup>
)}
```

**Keyboard handler update (KB-07 requires):**
The existing keyboard `useEffect` calls `setOpen((prev) => !prev)` directly. Replace with `handleOpenChange(!open)` to trigger the KB fetch. However, note that `open` in the closure may be stale — use a ref or pass the new value:

```typescript
// Correct pattern avoiding stale closure:
const openRef = useRef(open)
openRef.current = open

useEffect(() => {
  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      handleOpenChange(!openRef.current)
    }
  }
  document.addEventListener('keydown', onKeyDown)
  return () => document.removeEventListener('keydown', onKeyDown)
}, [])  // empty deps — uses ref for current value
```

### Anti-Patterns to Avoid

- **Importing supabase directly in Home.tsx:** The `useActivityFeed` hook should either call service functions or, if the activity feed is a unique cross-module concern without a dedicated service, can call `supabase` directly in the hook file. Using a dedicated `useActivityFeed` hook (rather than inline in Home.tsx) keeps the page component clean.
- **Debouncing async fetches in Cmd+K:** Adds complexity and race conditions. Fetch-on-open with local cmdk filtering is simpler and adequate.
- **Clearing KB entries on dialog close:** Keep `kbEntries` populated across dialog open/close cycles so the second open is instant (no re-fetch unless explicitly needed).
- **Hooks after conditional returns in Home.tsx:** Both `useActivityFeed()` and any local state must be called before any early return (memory rule — previous crash pattern).
- **Blocking render on activity feed:** Always render the Home page shell immediately. Show a loading skeleton or "Carregando..." text while the feed loads.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cmd+K filtering of KB results | Custom filter function | cmdk's built-in matching via `value` prop | CommandItem `value` is already fuzzy-matched by cmdk; just populate it |
| Activity feed pagination | Custom infinite scroll | Limit 10 client-side slice | Single-operator tool, 10 items is the spec requirement |
| Relative time formatting | moment.js / date-fns | `Intl.RelativeTimeFormat` or `toLocaleDateString('pt-BR')` | No new dependency needed for simple date display |
| Cross-table union query | Supabase RPC with UNION SQL | Two parallel `.from()` calls merged client-side | Simpler, typed, no custom SQL function needed |
| KB search in Cmd+K | Supabase textSearch per keystroke | Fetch all on open, cmdk filters locally | Less complexity, no debounce logic, no race conditions |

**Key insight:** This phase is almost pure integration — connecting existing pieces. Resist the temptation to add abstraction. Direct service calls in hooks, direct registry import in Home.tsx, direct `listKBEntries` call in the client page.

---

## Common Pitfalls

### Pitfall 1: Hook Called After Conditional Return in Home.tsx
**What goes wrong:** If Home.tsx has any early return (e.g., loading guard before hooks are declared), React throws "Rendered more hooks than during the previous render" crash.
**Why it happens:** This exact crash occurred twice in WireframeViewerInner — it's recorded in project memory as a critical rule.
**How to avoid:** Declare ALL hooks (useState, useEffect, useActivityFeed, etc.) before the first `if (...) return null` statement.
**Warning signs:** React DevTools shows "Hooks called in different order" error; blank page after data loads.

### Pitfall 2: stale closure in Cmd+K keyboard handler
**What goes wrong:** `handleOpenChange(!open)` captures `open` as `false` forever because the `useEffect` has empty deps array. The toggle logic never correctly opens/closes.
**Why it happens:** `open` is a state variable; closures capture the value at useEffect creation time.
**How to avoid:** Use a `useRef` mirroring `open` (as shown in Pattern 4), or change the `useEffect` deps to include `open` (which re-registers the event listener on every toggle — less clean).
**Warning signs:** Cmd+K only opens, never closes; or toggle gets stuck.

### Pitfall 3: Activity feed errors when tables don't exist yet
**What goes wrong:** If Phase 30 migrations haven't been applied, the `knowledge_entries` or `tasks` Supabase queries return a PostgreSQL error. This should not crash Home.tsx.
**Why it happens:** Phase ordering — Home.tsx will be developed after Phase 30, but in dev/test environments the DB may lag.
**How to avoid:** Always `.catch()` the Promise.all in `useActivityFeed`. On error, set `items = []` and show an empty state. Do not rethrow.
**Warning signs:** Blank Home.tsx or unhandled promise rejection in console.

### Pitfall 4: MODULE_REGISTRY missing description field
**What goes wrong:** Home.tsx uses `mod.description` in the card but Phase 29's ModuleManifest doesn't include that field. TypeScript error or undefined renders as nothing.
**Why it happens:** Phase 29 research defines `ModuleManifest` without `description` (it's focused on routing/sidebar, not home page display).
**How to avoid:** Either add `description?: string` to ModuleManifest in Phase 29 output, OR define a separate record in Home.tsx: `const MODULE_DESCRIPTIONS: Record<string, string> = { docs: '...', ... }`. The latter keeps the manifest focused on routing concerns.
**Warning signs:** TypeScript "Property 'description' does not exist on type 'ModuleManifest'" error.

### Pitfall 5: Cmd+K KB entries visible before search input (empty state)
**What goes wrong:** On first open with an empty query, all KB entries appear in the KB group, making the dialog overwhelming.
**Why it happens:** cmdk shows all items when the query is empty.
**How to avoid:** Only render the KB `CommandGroup` when there is a non-empty search query. Use a `value` state that tracks the CommandInput:
```typescript
const [query, setQuery] = useState('')
// ...
<CommandInput value={query} onValueChange={setQuery} ... />
// ...
{query.length > 0 && kbEntries.length > 0 && (
  <CommandGroup heading="Base de Conhecimento">
    ...
  </CommandGroup>
)}
```
This matches the behavior of the existing docs groups (which also only show when there's a query that matches something, but cmdk hides empty groups automatically — this is an extra guard).

### Pitfall 6: listKBEntries signature mismatch from Phase 30
**What goes wrong:** `listKBEntries({})` (no filters) must work to fetch all entries for Cmd+K. If Phase 30's function signature requires at least one filter, the call fails TypeScript validation.
**Why it happens:** Service layer design decisions in Phase 30 may have made filters required.
**How to avoid:** Phase 33 Wave 0 should verify Phase 30's `kb-service.ts` exports. If `KBFilters` fields are all optional, `{}` works. If not, pass `{ type: undefined }` or adjust the type.
**Warning signs:** TypeScript error "Argument of type '{}' is not assignable to parameter of type 'KBFilters'".

---

## Code Examples

### Activity Feed — complete useActivityFeed hook pattern

```typescript
// Can live in src/pages/Home.tsx directly (no need for separate file given single use)
// Source: project pattern (useEffect + Promise.all + Supabase client)
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ActivityItem = {
  id: string
  title: string
  type: 'kb_entry' | 'task'
  subtype?: string
  client_slug?: string | null
  updated_at: string
  href: string
}

function useActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [kbResult, taskResult] = await Promise.all([
          supabase
            .from('knowledge_entries')
            .select('id, title, entry_type, client_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10),
          supabase
            .from('tasks')
            .select('id, title, status, client_slug, updated_at')
            .order('updated_at', { ascending: false })
            .limit(10),
        ])

        if (cancelled) return

        const kbItems: ActivityItem[] = (kbResult.data ?? []).map(e => ({
          id: e.id,
          title: e.title,
          type: 'kb_entry' as const,
          subtype: e.entry_type,
          client_slug: e.client_slug,
          updated_at: e.updated_at,
          href: `/knowledge-base/${e.id}`,
        }))

        const taskItems: ActivityItem[] = (taskResult.data ?? []).map(t => ({
          id: t.id,
          title: t.title,
          type: 'task' as const,
          subtype: t.status,
          client_slug: t.client_slug,
          updated_at: t.updated_at,
          href: `/tarefas`,
        }))

        const merged = [...kbItems, ...taskItems]
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
          .slice(0, 10)

        setItems(merged)
      } catch {
        // Silently ignore — tables may not exist yet, activity feed is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { items, loading }
}
```

### SearchCommand — additions for KB-07

```typescript
// Source: extends existing SearchCommand.tsx pattern
// New state added to existing component (all hooks before early returns)
const [kbEntries, setKbEntries] = useState<KBEntry[]>([])
const [query, setQuery] = useState('')

// Replace the direct setOpen usage with:
function handleOpenChange(next: boolean) {
  setOpen(next)
  if (next && kbEntries.length === 0) {
    listKBEntries({}).then(setKbEntries).catch(() => {})
  }
  if (!next) setQuery('')
}

// In JSX — add after existing docs CommandGroups:
{query.length > 0 && kbEntries.length > 0 && (
  <CommandGroup heading="Base de Conhecimento">
    {kbEntries.map((entry) => (
      <CommandItem
        key={entry.id}
        value={`${entry.title} ${entry.entry_type} ${entry.tags.join(' ')}`}
        onSelect={() => handleSelect(`/knowledge-base/${entry.id}`)}
      >
        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm">{entry.title}</span>
          <span className="text-xs text-muted-foreground capitalize">{entry.entry_type}</span>
        </div>
      </CommandItem>
    ))}
  </CommandGroup>
)}

// CommandInput must be controlled to enable query guard:
<CommandInput
  placeholder="Pesquisar documentacao e conhecimento..."
  value={query}
  onValueChange={setQuery}
/>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static `quickActions` + `sections` arrays in Home.tsx | Grid from MODULE_REGISTRY | Phase 33 | Adding a module auto-adds it to the home page |
| Cmd+K searches only static docs via import.meta.glob | Cmd+K searches docs + KB entries (async fetch on open) | Phase 33 (KB-07) | Knowledge base entries become discoverable via universal search |
| Client pages have no KB integration | FinanceiroIndex shows KB entries for client_slug | Phase 33 (HOME-03) | Operators see relevant knowledge inline while working on a client |
| Home page has no live data | Activity feed shows last 10 updates cross-module | Phase 33 (HOME-02) | Home becomes a live operational dashboard |

**Deprecated/outdated:**
- Static `quickActions` and `sections` constants in Home.tsx: replaced by MODULE_REGISTRY iteration
- Direct `setOpen` calls in SearchCommand keyboard handler: replaced by `handleOpenChange` to trigger KB fetch

---

## Open Questions

1. **Does ModuleManifest include a `description` field?**
   - What we know: Phase 29 research defines the manifest with id, label, route, icon, status, navChildren, routeConfig — no description field
   - What's unclear: Phase 29 execution may or may not add description
   - Recommendation: Phase 33 Wave 0 reads Phase 29 output. If no description on manifest, define `MODULE_DESCRIPTIONS: Record<string, string>` locally in Home.tsx. Do not block on Phase 29 adding the field.

2. **Is there a generic `/clients/:clientSlug` page from Phase 29/31/32?**
   - What we know: FinanceiroIndex.tsx exists and handles `/clients/financeiro-conta-azul` with hardcoded slug
   - What's unclear: Phases 31/32 may introduce a generic client workspace page for HOME-03
   - Recommendation: HOME-03 is satisfied by adding the Conhecimento section to FinanceiroIndex.tsx. If a generic page exists, add it there too. Adds ~30 lines to existing component.

3. **Do `tasks` table rows have a `/tarefas/:id` detail route?**
   - What we know: Phase 32 creates `/tarefas` list and `/tarefas/kanban` but no detail page per TASK-02/03/04
   - What's unclear: Whether the activity feed task items should link to `/tarefas` (list) or to a specific task
   - Recommendation: Link task items to `/tarefas` — no per-task detail page in scope. Phase 33 activity feed uses `href: '/tarefas'` for all task items.

4. **Can `listKBEntries({})` be called with an empty filter object?**
   - What we know: Phase 30 creates `kb-service.ts` with `KBFilters` type; exact type TBD until Phase 30 executes
   - What's unclear: Whether all `KBFilters` fields are optional
   - Recommendation: Verify in Phase 33 Wave 0. If required fields exist, pass `{ type: undefined, clientSlug: undefined, tags: [] }`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | vitest.config.ts (or vite.config.ts inline) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOME-01 | Module cards render from MODULE_REGISTRY | unit | `npx vitest run src/pages/Home.test.tsx` | ❌ Wave 0 |
| HOME-02 | Activity feed merges and sorts kb + tasks items | unit | `npx vitest run src/pages/Home.test.tsx` | ❌ Wave 0 |
| HOME-03 | Client page renders KB section | manual-only | Visual browser check (requires live Supabase) | N/A |
| KB-07 | KB entries appear in Cmd+K results | manual-only | Visual browser check (requires live Supabase) | N/A |
| KB-07 | KB entries don't show with empty query | unit | `npx vitest run src/components/layout/SearchCommand.test.tsx` | ❌ Wave 0 |

HOME-03 and KB-07 require a live Supabase connection with KB data — they are manual-only. HOME-01 and HOME-02 activity feed merge logic can be unit tested by mocking the Supabase client or testing the pure merge/sort function in isolation.

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npx vitest run`
- **Phase gate:** Zero TypeScript errors + visual browser validation for all 4 requirements before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/pages/Home.test.tsx` — covers HOME-01 (registry grid), HOME-02 (feed merge logic)
- [ ] `src/components/layout/SearchCommand.test.tsx` — covers KB-07 empty-query guard

*(These are optional unit tests — the hard gate is always `npx tsc --noEmit` per CLAUDE.md. Visual browser validation is mandatory for all four requirements.)*

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `src/pages/Home.tsx`, `src/components/layout/SearchCommand.tsx`, `src/components/layout/Sidebar.tsx`, `src/App.tsx`, `src/lib/search-index.ts`, `src/lib/supabase.ts`, `src/pages/clients/FinanceiroContaAzul/Index.tsx` — complete understanding of all files to be modified
- `.planning/phases/29-module-foundation-registry/29-RESEARCH.md` — ModuleManifest type and registry pattern
- `.planning/phases/30-supabase-migrations-data-layer/30-RESEARCH.md` — knowledge_entries schema, search_vec column name, KBFilters pattern
- `.planning/phases/31-knowledge-base-module/31-RESEARCH.md` — listKBEntries, KBEntry type, KBEntryCard pattern
- `.planning/REQUIREMENTS.md` — exact requirement definitions
- `.planning/STATE.md` — v1.5 decisions (service layer pattern, anon RLS, no direct supabase in components)
- `CLAUDE.md` — hooks-before-early-returns rule, zero `any`, visual validation requirement

### Secondary (MEDIUM confidence)

- cmdk library behavior (CommandItem value + filtering): based on reading the existing SearchCommand.tsx implementation — cmdk filters items by the `value` prop substring match automatically; this behavior is consistent with the existing code pattern
- Supabase JS v2 Promise.all parallel fetch pattern: verified against existing blueprint-store.ts multi-query usage in the codebase

### Tertiary (LOW confidence)

- None — all findings grounded in existing project source code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; all tools verified in package.json and prior phase research
- Architecture: HIGH — all 4 patterns are direct extensions of existing code in the repo (SearchCommand.tsx, Home.tsx, FinanceiroIndex.tsx are fully read and understood)
- Pitfalls: HIGH — hooks-before-returns from project memory, stale closure from React patterns, service signature concern from Phase 30 dependency
- Cmd+K KB integration: HIGH — fetch-on-open + cmdk local filtering is directly supported by the existing SearchCommand architecture

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable stack, no fast-moving external dependencies for this phase)
