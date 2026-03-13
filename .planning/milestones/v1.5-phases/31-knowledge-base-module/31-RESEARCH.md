# Phase 31: Knowledge Base Module — Research

**Researched:** 2026-03-12
**Domain:** React SPA CRUD module with Supabase full-text search, markdown rendering, and ADR templating
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KB-02 | Pagina de listagem /knowledge-base com filtro por tipo, tags e cliente | Filter UI patterns, Supabase .overlaps() for array tags, composed filter query chain |
| KB-03 | Pagina de detalhe /knowledge-base/:id com render markdown e metadados | MarkdownRenderer already in codebase; useParams for id; metadata display layout |
| KB-04 | Formulario de criacao/edicao com type selector, markdown body, tags, client_slug | Controlled form with shadcn Select + Textarea, tags parsed from comma input to string[], toast feedback via sonner |
| KB-05 | Full-text search via tsvector/tsquery (portugues) com pagina de busca | Supabase .textSearch() with { config: 'portuguese', type: 'plain' }; column name is search_vec (Phase 30 schema) |
| KB-06 | Entries do tipo 'decision' seguem formato ADR (Context, Decision, Consequences sections) | ADR Markdown template constant injected when type === 'decision' and body is empty |

</phase_requirements>

---

## Summary

Phase 31 builds the complete Knowledge Base UI on top of the data layer created in Phase 30. The module lives in `src/modules/knowledge-base/` following the folder convention established in Phase 29. All data access goes through `kb-service.ts` — Phase 31 only writes UI pages, components, and hooks.

The stack is entirely pre-installed: shadcn/ui for forms and filter controls, `react-markdown` + `remark-gfm` for markdown body rendering (via the existing `MarkdownRenderer` component), `react-router-dom` v6 for routing, `sonner` for toast feedback, and `lucide-react` for icons. Zero new dependencies are needed.

**Two critical facts from upstream phases to carry forward:**
1. The tsvector column in `knowledge_entries` is named `search_vec` (not `search_vector`) — this was established in Phase 30 research. Phase 31 hooks and service calls MUST use `search_vec`.
2. The module folder structure (`src/modules/knowledge-base/`) does not yet exist — Phase 29 creates it. Phase 31 must check Phase 29's output before creating files.

**Primary recommendation:** Follow the module structure from Phase 29 without deviation, reuse `MarkdownRenderer` for KB-03, use a single `useKBEntries` hook for KB-02 with local filter state, and call `.textSearch('search_vec', query, { config: 'portuguese', type: 'plain' })` for KB-05.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 | CRUD + FTS queries via kb-service | Project data layer; Phase 30 creates tables |
| react-router-dom | ^6.27.0 | /knowledge-base routing | App-wide router; already in App.tsx |
| react-markdown + remark-gfm | ^9.0.1 / ^4.0.0 | Render markdown body in detail page | Already used by MarkdownRenderer component |
| shadcn/ui (radix-ui) | various | Select, Input, Textarea, Button, Badge, Card | Project UI system |
| sonner | ^2.0.7 | Toast notifications on save/error | Already wired via Toaster in App.tsx |
| lucide-react | ^0.460.0 | Icons (Search, Plus, Tag, Filter) | Project icon system |

### No New Dependencies

Do NOT add any npm packages. All tools are in `package.json`.

---

## Architecture Patterns

### Module Folder Structure (follows Phase 29 convention)

```
src/modules/knowledge-base/
├── pages/
│   ├── KBListPage.tsx         # /knowledge-base — list + filter
│   ├── KBDetailPage.tsx       # /knowledge-base/:id — detail view
│   ├── KBFormPage.tsx         # /knowledge-base/new + /knowledge-base/:id/edit
│   └── KBSearchPage.tsx       # /knowledge-base/search — FTS results
├── components/
│   ├── KBEntryCard.tsx        # Card used in list + search results
│   ├── KBTypeFilter.tsx       # Button-group filter for type (bug/decision/pattern/lesson)
│   ├── KBTagFilter.tsx        # Tag input or comma-separated filter
│   └── KBMetaPanel.tsx        # Metadata sidebar for detail page (type, tags, client, dates)
├── hooks/
│   ├── useKBEntries.ts        # Fetch list with composed filters (type, tags, client_slug)
│   ├── useKBEntry.ts          # Fetch single entry by id
│   └── useKBSearch.ts         # Full-text search hook
└── types/
    └── kb.ts                  # Re-export KBEntry, KBEntryType from kb-service
```

Routes (added to module manifest in Phase 29 registry, or directly in App.tsx if registry not yet wired for this module):

```
/knowledge-base              → KBListPage
/knowledge-base/search       → KBSearchPage     (static, must come BEFORE /:id)
/knowledge-base/new          → KBFormPage (create mode, static, must come BEFORE /:id)
/knowledge-base/:id          → KBDetailPage
/knowledge-base/:id/edit     → KBFormPage (edit mode)
```

### Pattern 1: Service Layer Consumption (never import supabase directly in UI)

The module never imports `supabase` directly. All calls go through `kb-service.ts` from Phase 30. Hooks call service functions and manage loading/error state locally.

```typescript
// src/modules/knowledge-base/hooks/useKBEntries.ts
import { useEffect, useState } from 'react'
import { listKBEntries } from '@/lib/kb-service'
import type { KBEntry, KBFilters } from '@/lib/kb-service'

export function useKBEntries(filters: KBFilters) {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listKBEntries(filters)
      .then((data) => {
        if (!cancelled) { setEntries(data); setLoading(false) }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })
    return () => { cancelled = true }
  // Tags array must be serialized to avoid infinite renders (see Pitfall 2)
  }, [filters.entry_type, filters.client_slug, JSON.stringify(filters.tags)])

  return { entries, loading, error }
}
```

### Pattern 2: Supabase Full-Text Search — Column Name is `search_vec`

Phase 30 research specifies the tsvector GENERATED column is named `search_vec`. Always use this name, not `search_vector`.

```typescript
// src/lib/kb-service.ts (Phase 30 output — verify before building hooks)
export async function searchKBEntries(queryText: string): Promise<KBEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .textSearch('search_vec', queryText, {
      config: 'portuguese',
      type: 'plain',   // Required: allows plain text, not raw tsquery syntax
    })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
```

The `type: 'plain'` option is mandatory for multi-word queries. Without it, Supabase expects tsquery syntax (e.g. `erro & producao`) — plain text fails or returns no results.

### Pattern 3: Tag Filtering with Array Operators

The `tags` column is `text[]`. Use `.overlaps()` to find entries containing ANY of the selected tags (more user-friendly than `.contains()` which requires ALL tags):

```typescript
// In listKBEntries filter composition
if (filters.tags && filters.tags.length > 0) {
  query = query.overlaps('tags', filters.tags)
}
```

### Pattern 4: ADR Template for Decision Entries

When the user selects `type = 'decision'`, inject the template if and only if the body is currently empty (guard against overwriting existing content on edit):

```typescript
// Constant defined at module top-level
const ADR_TEMPLATE = `## Context

Descreva o contexto e o problema que motivou esta decisao.

## Decision

Descreva a decisao tomada.

## Consequences

Descreva as consequencias positivas e negativas desta decisao.
`

// In KBFormPage.tsx — watch for type change
useEffect(() => {
  // GUARD: only inject if body is empty (never overwrite on edit)
  if (formData.entry_type === 'decision' && !formData.body.trim()) {
    setFormData(prev => ({ ...prev, body: ADR_TEMPLATE }))
  }
}, [formData.entry_type])
```

### Pattern 5: Reuse Existing MarkdownRenderer

`src/components/docs/MarkdownRenderer.tsx` accepts `{ content: string }` and renders with prose styles, GFM tables, and syntax highlighting. Use it directly in KBDetailPage.

```typescript
// KBDetailPage.tsx
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
// ...
<MarkdownRenderer content={entry.body} />
```

Do NOT introduce another markdown library or build a custom renderer.

### Pattern 6: Tags Input — Parse on Submit

Tags are `text[]` in Supabase but the form uses a single comma-separated text Input. Parse on submit only:

```typescript
// On form submit
const parsedTags = formData.tagsInput
  .split(',')
  .map(t => t.trim())
  .filter(Boolean)

await createKBEntry({ ...formData, tags: parsedTags })
```

When loading an existing entry for edit, join the array back to string: `entry.tags.join(', ')`.

### Pattern 7: Card Layout (follows existing visual language)

Based on the Home.tsx card pattern — rounded-xl, border, white bg, hover:border-indigo-200:

```typescript
// KBEntryCard.tsx
<Link to={`/knowledge-base/${entry.id}`} className="h-full">
  <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card">
    <div className="mb-2 flex items-center gap-2">
      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {entry.entry_type}
      </span>
      {entry.client_slug && (
        <span className="text-[10px] text-slate-400">{entry.client_slug}</span>
      )}
    </div>
    <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">{entry.title}</h3>
    {entry.tags.length > 0 && (
      <div className="mt-2 flex flex-wrap gap-1">
        {entry.tags.map(tag => (
          <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            {tag}
          </span>
        ))}
      </div>
    )}
    <p className="mt-auto pt-3 text-[10px] text-slate-400">
      {new Date(entry.created_at).toLocaleDateString('pt-BR')}
    </p>
  </div>
</Link>
```

### Pattern 8: shadcn Select for entry_type

Follows the same pattern used in `BriefingForm.tsx` (which uses the identical Select components):

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select
  value={formData.entry_type}
  onValueChange={(v) => setFormData(prev => ({ ...prev, entry_type: v as KBEntryType }))}
>
  <SelectTrigger>
    <SelectValue placeholder="Tipo de entrada" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="bug">Bug</SelectItem>
    <SelectItem value="decision">Decisao</SelectItem>
    <SelectItem value="pattern">Padrao</SelectItem>
    <SelectItem value="lesson">Licao</SelectItem>
  </SelectContent>
</Select>
```

### Pattern 9: Post-Save Navigation (optimistic-free)

After creating or editing an entry, navigate back to `/knowledge-base`. The list page re-fetches on mount — this is sufficient for a single-operator tool. Do not implement optimistic list updates.

```typescript
import { useNavigate } from 'react-router-dom'
// ...
const navigate = useNavigate()

async function handleSubmit() {
  try {
    if (isEditing) {
      await updateKBEntry(id, formData)
    } else {
      await createKBEntry(formData)
    }
    toast.success('Entrada salva com sucesso')
    navigate('/knowledge-base')
  } catch (err) {
    toast.error('Erro ao salvar entrada')
  }
}
```

### Anti-Patterns to Avoid

- **Importing supabase directly in components or hooks:** Always go through `kb-service.ts` functions
- **Creating a new markdown parser:** Reuse `MarkdownRenderer` — do not add `@uiw/react-md-editor` or similar
- **Storing tags as string in DB call:** Always parse `tagsInput` to `string[]` before calling the service
- **Hooks after conditional returns:** Project memory rule — hooks must always be declared before any early return (caused crashes in WireframeViewerInner)
- **Using `any` for entry types:** Import `KBEntry` and `KBEntryType` from `kb-service.ts` or `types/kb.ts`
- **`search_vector` column name:** The Phase 30 schema names the column `search_vec` — never use `search_vector`

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom renderer | `MarkdownRenderer` (src/components/docs/) | Already styled, GFM, syntax highlighting, prose classes |
| Toast notifications | Custom alert state | `sonner` via `toast()` | Already wired in App.tsx via Toaster |
| Form select dropdowns | Custom dropdown | shadcn `Select` + `SelectItem` | Accessible, styled, keyboard-nav |
| Tag input manager | Complex tag UI | Comma-separated `Input` parsed on submit | Sufficient for internal tool |
| Full-text search engine | LIKE queries with JS filtering | Supabase `textSearch()` with 'portuguese' | Phase 30 sets up tsvector + GIN index |
| Date formatting | `toLocaleDateString()` wrapping | Direct `new Date(str).toLocaleDateString('pt-BR')` | Zero dependency, sufficient for display |

**Key insight:** Phase 31 is UI wiring, not invention. Every technical capability is pre-built. The work is assembling existing pieces in the right module structure.

---

## Common Pitfalls

### Pitfall 1: Wrong Column Name for textSearch (`search_vector` vs `search_vec`)
**What goes wrong:** Calling `.textSearch('search_vector', ...)` when the column is named `search_vec` returns a Supabase error or no results.
**Why it happens:** Early research used `search_vector`; Phase 30 research locked the name as `search_vec`.
**How to avoid:** Always use `search_vec`. Verify the column name by reading the Phase 30 migration file `005_knowledge_entries.sql` before building the search hook.
**Warning signs:** Supabase returns a 400 error with "column does not exist" or similar.

### Pitfall 2: Infinite Re-Render from Tags Array in useEffect
**What goes wrong:** Putting `filters.tags` (array reference) in a `useEffect` dependency array causes infinite re-renders — a new array object is created on every render.
**Why it happens:** React compares dependencies by reference; arrays are never equal across renders unless memoized.
**How to avoid:** Use `JSON.stringify(filters.tags)` in the dependency array, or memoize filters with `useMemo`.
**Warning signs:** "Maximum update depth exceeded" console error; network tab shows continuous Supabase requests.

### Pitfall 3: Route Order Conflict — `/new` Matches `/:id`
**What goes wrong:** If `/knowledge-base/:id` is defined before `/knowledge-base/new`, navigating to `/knowledge-base/new` opens the detail page with id = "new".
**Why it happens:** react-router-dom v6 matches the first applicable route in tree order.
**How to avoid:** Define static routes before parametric routes: `/search` and `/new` must come before `/:id` in the route definitions.
**Warning signs:** Detail page mounts and calls `getKBEntry('new')` → Supabase error.

### Pitfall 4: Tags String vs Array Mismatch
**What goes wrong:** Saving `tagsInput` string directly to Supabase causes a type error since `tags` is `text[]`.
**Why it happens:** Natural to handle tags as a single text input for UX, but the column expects an array.
**How to avoid:** Parse on submit: `tags: formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean)`. Load-to-edit converts back: `tagsInput: entry.tags.join(', ')`.

### Pitfall 5: ADR Template Overwrites Existing Body on Edit
**What goes wrong:** When editing an existing `decision` entry, the ADR template replaces the real content.
**Why it happens:** The `useEffect` watching `entry_type` fires when the form mounts with pre-loaded data.
**How to avoid:** Guard with `!formData.body.trim()` — only inject template if body is currently empty.

### Pitfall 6: textSearch Multi-Word Queries Without `type: 'plain'`
**What goes wrong:** Searching "erro autenticacao" without `type: 'plain'` option causes a Supabase error or zero results.
**Why it happens:** Default tsquery expects operators like `erro & autenticacao`; plain text isn't valid tsquery syntax.
**How to avoid:** Always pass `{ config: 'portuguese', type: 'plain' }` in every `.textSearch()` call.
**Warning signs:** 400 errors with "syntax error in tsquery" in the response body.

### Pitfall 7: Hooks After Conditional Returns (Project Memory Rule)
**What goes wrong:** Placing hooks (useState, useEffect, useParams, etc.) after early conditional returns causes React's Rules of Hooks to be violated, crashing the component.
**Why it happens:** React requires hooks to be called in the same order on every render. An early `return null` changes the hook call count.
**How to avoid:** Declare ALL hooks at the top of the component before any conditional return. Gate the render conditionally, not the hooks.
**Warning signs:** "Rendered more hooks than during the previous render" React error; documented in project MEMORY.md as a prior crash pattern.

---

## Code Examples

### useKBSearch hook
```typescript
// src/modules/knowledge-base/hooks/useKBSearch.ts
import { useState, useEffect } from 'react'
import { searchKBEntries } from '@/lib/kb-service'
import type { KBEntry } from '@/lib/kb-service'

export function useKBSearch(query: string) {
  const [results, setResults] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    searchKBEntries(query)
      .then((data) => {
        if (!cancelled) { setResults(data); setLoading(false) }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [query])

  return { results, loading, error }
}
```

### KBListPage filter state pattern
```typescript
// src/modules/knowledge-base/pages/KBListPage.tsx
type KBListFilters = {
  entry_type: KBEntryType | ''
  client_slug: string
  tags: string[]
}

// Filter state — passed to useKBEntries
const [filters, setFilters] = useState<KBListFilters>({
  entry_type: '',
  client_slug: '',
  tags: [],
})

// Pass to hook (undefined means "no filter")
const { entries, loading, error } = useKBEntries({
  entry_type: filters.entry_type || undefined,
  client_slug: filters.client_slug || undefined,
  tags: filters.tags.length > 0 ? filters.tags : undefined,
})
```

### Supabase service — list with filter composition
```typescript
// From Phase 30 service pattern (verify actual exports when Phase 30 executes)
export async function listKBEntries(filters?: KBFilters): Promise<KBEntry[]> {
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
  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as KBEntry[]
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Files scattered in src/pages/ | Module folder per feature (pages/, components/, hooks/, types/) | Phase 29 (v1.5) | Phase 31 must follow module structure |
| Supabase Auth (uuid) | Clerk auth; Supabase as data-only store with anon-permissive RLS | Migration 002 | No auth checks in KB service; anon key sufficient |
| Switch statements for variants | Discriminated union types | v1.3 (section registry) | KBEntryType as `'bug' | 'decision' | 'pattern' | 'lesson'` |
| Per-component markdown setup | Shared MarkdownRenderer component | v1.2 | Reuse existing component; don't configure react-markdown again |

**Deprecated/outdated:**
- `search_vector` as column name: Phase 30 locked the name as `search_vec` — do not use `search_vector`
- Direct supabase import in React components: Project-wide prohibition since v1.0

---

## Open Questions

1. **Exact `kb-service.ts` function signatures after Phase 30 executes**
   - What we know: Phase 30 research documents service stubs with `listKBEntries(filters?)`, `createKBEntry(params)`, `searchKBEntries(query)`, `getKBEntry(id)`, `updateKBEntry(id, params)`, `deleteKBEntry(id)`
   - What's unclear: Whether Phase 30 execution used exactly these names or slightly different ones
   - Recommendation: Wave 0 of Phase 31 reads the actual `kb-service.ts` file and adapts hook imports accordingly

2. **Phase 29 module folder convention**
   - What we know: Phase 29 establishes `src/modules/` structure
   - What's unclear: Phase 29 has not yet executed — the exact folder names may differ from `src/modules/knowledge-base/`
   - Recommendation: Wave 0 reads the Phase 29 output (`src/modules/registry.ts` and any existing module manifests) and follows whatever convention was established

3. **Whether the KB module manifest gets added to MODULE_REGISTRY in Phase 31 or Phase 29**
   - What we know: Phase 29 creates MODULE_REGISTRY and wrapper manifests for docs and wireframe-builder; KB is a v1.5 module
   - Recommendation: Phase 31 adds the KB manifest to MODULE_REGISTRY and adds routes via the manifest. If the routing pattern from Phase 29 differs from the pattern assumed here, adapt accordingly.

---

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run src/modules/knowledge-base` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KB-02 | Filter composition (type, tags, client) builds correct query | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBEntries.test.ts` | ❌ Wave 0 |
| KB-03 | Detail page renders entry title and body | manual-only | Visual browser check on /knowledge-base/:id | N/A |
| KB-04 | Form saves entry and navigates back to list | manual-only | Visual browser check: create + verify appears in list | N/A |
| KB-05 | searchKBEntries calls textSearch with search_vec + portuguese + plain | unit | `npx vitest run src/modules/knowledge-base/hooks/useKBSearch.test.ts` | ❌ Wave 0 |
| KB-06 | ADR template injected when type=decision and body is empty | unit | `npx vitest run src/modules/knowledge-base/pages/KBFormPage.test.ts` | ❌ Wave 0 |
| ALL | Zero TypeScript errors | type check | `npx tsc --noEmit` | Existing |

KB-03 and KB-04 are manual-only because they require a live Supabase connection and browser rendering. KB-02, KB-05, and KB-06 can be unit-tested with mocked Supabase (same mock pattern as `blueprint-store.test.ts`).

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npx vitest run src/modules/knowledge-base`
- **Phase gate:** Zero TypeScript errors + visual browser validation on all 5 routes + full vitest suite green

### Wave 0 Gaps

- [ ] `src/modules/knowledge-base/hooks/useKBEntries.test.ts` — covers KB-02 filter composition with mocked service
- [ ] `src/modules/knowledge-base/hooks/useKBSearch.test.ts` — covers KB-05 column name `search_vec` and `type: 'plain'`
- [ ] `src/modules/knowledge-base/pages/KBFormPage.test.ts` — covers KB-06 ADR template injection guard logic

Mock pattern: same as `tools/wireframe-builder/lib/blueprint-store.test.ts` — mock `@/lib/supabase` with `vi.mock()`, wire fluent chain with `vi.fn()`.

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/docs/MarkdownRenderer.tsx`, `src/pages/clients/BriefingForm.tsx`, `src/lib/supabase.ts`, `package.json`, `vite.config.ts` — existing patterns and component API confirmed
- `.planning/REQUIREMENTS.md` — exact requirement definitions for KB-02 through KB-06
- `.planning/STATE.md` Accumulated Context — locked decisions: `entry_type` column name, `'portuguese'` tsvector language
- `.planning/ROADMAP.md` Phase 31 success criteria — authoritative definition of done
- `tools/wireframe-builder/lib/blueprint-store.test.ts` — Supabase mock pattern for vitest (confirmed)
- Phase 30 RESEARCH.md — locked column name `search_vec` (not `search_vector`); anon-permissive RLS pattern
- Phase 29 RESEARCH.md — module folder convention `src/modules/[name]/pages|components|hooks|types`

### Secondary (MEDIUM confidence)

- Supabase JS v2 `.textSearch()` with `type: 'plain'` option — documented for v2; `{ config, type }` options object verified against version ^2.98.0 in package.json
- Supabase JS `.overlaps()` for `text[]` columns — documented array operator

### Tertiary (LOW confidence)

- None — all critical claims verified from project source or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed in package.json; no new installs; MarkdownRenderer API confirmed by direct read
- Architecture: HIGH — module folder pattern from Phase 29 research; UI patterns from BriefingForm.tsx and Sidebar.tsx direct reads
- tsvector column name: HIGH — locked in Phase 30 research as `search_vec`; confirmed by Phase 30 migration SQL pattern
- textSearch `type: 'plain'`: MEDIUM — documented in supabase-js v2 but not validated against live DB; risk is low (alternative is tsquery format which fails silently)
- Pitfalls: HIGH — hooks-after-returns from project MEMORY.md (confirmed crash); array dependency from React docs; route order from react-router v6 behavior

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable stack; revisit if supabase-js upgrades beyond ^2.x or Phase 30 changes column names)
