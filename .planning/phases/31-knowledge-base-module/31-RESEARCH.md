# Phase 31: Knowledge Base Module — Research

**Researched:** 2026-03-12
**Domain:** React SPA CRUD module with Supabase full-text search, markdown rendering, and ADR templating
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KB-02 | Pagina de listagem /knowledge-base com filtro por tipo, tags e cliente | Filter UI patterns, Supabase .contains() for array tags, client-side filter composition |
| KB-03 | Pagina de detalhe /knowledge-base/:id com render markdown e metadados | MarkdownRenderer already exists in codebase; useParams for id; metadata display layout |
| KB-04 | Formulario de criacao/edicao com type selector, markdown body, tags, client_slug | Controlled form with Select + Textarea (shadcn), tags as comma-separated input parsed to string[], toast feedback |
| KB-05 | Full-text search via tsvector/tsquery (portugues) com pagina de busca | Supabase .textSearch() with 'portuguese' config; Phase 30 creates tsvector column |
| KB-06 | Entries do tipo 'decision' seguem formato ADR (Context, Decision, Consequences sections) | ADR Markdown template injected when type === 'decision'; template string with ## headings |
</phase_requirements>

---

## Summary

Phase 31 builds the entire Knowledge Base UI on top of the Supabase data layer created in Phase 30. The module follows the `src/modules/knowledge-base/` folder structure established in Phase 29 (module foundation), containing `pages/`, `components/`, `hooks/`, and `types/`. All data access goes through a `kb-service.ts` created in Phase 30 — Phase 31 only writes UI code.

The stack is already in place: shadcn/ui components for forms and filters, react-markdown + remark-gfm for rendering the markdown body, react-router-dom v6 for routing, and the existing Supabase client in `src/lib/supabase.ts`. No new dependencies are required. The `MarkdownRenderer` component in `src/components/docs/MarkdownRenderer.tsx` can be reused directly for the detail page.

The most critical technical decision for this phase is correctly calling Supabase full-text search (`textSearch()`) and composing array-tag filters with `.contains()` or `.overlaps()`. The ADR template for `decision` entries is a pure string constant injected as the default body when `type === 'decision'` is selected — no special rendering is required.

**Primary recommendation:** Follow the module structure from Phase 29, reuse `MarkdownRenderer` for KB-03, use a single `useKBEntries` hook for KB-02 with local filter state, and call `supabase.from('knowledge_entries').textSearch('search_vector', query, { config: 'portuguese' })` for KB-05.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.98.0 | CRUD + FTS queries | Project data layer, Phase 30 creates the tables |
| react-router-dom | ^6.27.0 | /knowledge-base, /knowledge-base/:id routing | App-wide router, already in App.tsx |
| react-markdown + remark-gfm | ^9.0.1 / ^4.0.0 | Render markdown body in detail page | Already used by MarkdownRenderer component |
| shadcn/ui (radix-ui) | various | Select, Input, Textarea, Button, Badge, Card | Project UI system |
| sonner | ^2.0.7 | Toast notifications on save/error | Already wired via Toaster in App.tsx |
| lucide-react | ^0.460.0 | Icons (Search, Plus, Tag, Filter) | Project icon system |

### No New Dependencies Required

All tools needed for this phase are already in `package.json`. Do NOT add any new packages.

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
│   ├── KBTypeFilter.tsx       # Segmented filter for type (bug/decision/pattern/lesson)
│   ├── KBTagFilter.tsx        # Tag multi-select or comma-separated filter
│   └── KBMetaPanel.tsx        # Sidebar with type, tags, client, dates for detail page
├── hooks/
│   ├── useKBEntries.ts        # Fetch list with filters (type, tags, client_slug)
│   ├── useKBEntry.ts          # Fetch single entry by id
│   └── useKBSearch.ts         # FTS query hook
└── types/
    └── kb.ts                  # Re-export or mirror types from kb-service.ts
```

Routes added to App.tsx (or module manifest in Phase 29 registry):
```
/knowledge-base              → KBListPage
/knowledge-base/search       → KBSearchPage
/knowledge-base/new          → KBFormPage (create mode)
/knowledge-base/:id          → KBDetailPage
/knowledge-base/:id/edit     → KBFormPage (edit mode)
```

### Pattern 1: Service Layer Consumption

The module never imports `supabase` directly in components or hooks. All Supabase calls go through `kb-service.ts` (created in Phase 30). Hooks call service functions and manage loading/error state locally.

```typescript
// src/modules/knowledge-base/hooks/useKBEntries.ts
import { useEffect, useState } from 'react'
import { listKBEntries, type KBEntry, type KBFilters } from '@/lib/kb-service'

export function useKBEntries(filters: KBFilters) {
  const [entries, setEntries] = useState<KBEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listKBEntries(filters).then((data) => {
      if (!cancelled) {
        setEntries(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [filters.type, filters.clientSlug, JSON.stringify(filters.tags)])

  return { entries, loading, error }
}
```

### Pattern 2: Supabase Full-Text Search Call

Phase 30 creates a `search_vector` tsvector column with 'portuguese' config. The query call:

```typescript
// Inside kb-service.ts (Phase 30 stub, Phase 31 may need to verify)
export async function searchKBEntries(query: string): Promise<KBEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .textSearch('search_vector', query, { config: 'portuguese' })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
```

**Note:** `textSearch()` takes the column name (`search_vector`), the query string, and an options object with `config`. The query string is passed as plain text — Supabase converts it to tsquery internally. Verified against @supabase/supabase-js v2 docs.

### Pattern 3: Tag Filtering with Supabase Array Operators

The `tags` column is `text[]`. To filter entries that contain ALL selected tags use `.contains()`. To filter entries that contain ANY selected tag use `.overlaps()`:

```typescript
// For "entry must include all selected tags"
query = query.contains('tags', selectedTags)

// For "entry includes any of selected tags" (more user-friendly)
query = query.overlaps('tags', selectedTags)
```

Recommended UX: use `.overlaps()` — more forgiving for a small internal tool.

### Pattern 4: ADR Template for Decision Entries

When the user selects `type = 'decision'` in the form, inject this default body if the body is empty:

```typescript
const ADR_TEMPLATE = `## Context

Descreva o contexto e o problema que motivou esta decisao.

## Decision

Descreva a decisao tomada.

## Consequences

Descreva as consequencias positivas e negativas desta decisao.
`

// In KBFormPage.tsx — watch for type change:
useEffect(() => {
  if (formData.type === 'decision' && !formData.body) {
    setFormData(prev => ({ ...prev, body: ADR_TEMPLATE }))
  }
}, [formData.type])
```

This satisfies KB-06 without any special rendering — it's just a markdown template pre-filled in the Textarea.

### Pattern 5: Reusing MarkdownRenderer

The existing `MarkdownRenderer` component in `src/components/docs/MarkdownRenderer.tsx` accepts `{ content: string }` and renders with prose styles. Use it directly in `KBDetailPage` for the body.

```typescript
// KBDetailPage.tsx
import MarkdownRenderer from '@/components/docs/MarkdownRenderer'
// ...
<MarkdownRenderer content={entry.body} />
```

### Pattern 6: Optimistic UI for List After Create/Edit

After saving a new or edited entry, navigate back to `/knowledge-base` and rely on the list page re-fetching. Do not attempt optimistic updates to the list — the re-fetch on mount is sufficient for a single-operator tool.

### Anti-Patterns to Avoid

- **Importing supabase directly in components:** Always via service functions in `kb-service.ts`
- **Creating a separate markdown parser:** Reuse `MarkdownRenderer` — do not introduce another markdown library
- **Storing tags as comma-separated string in DB:** Phase 30 creates `tags text[]` — always use array operations
- **Using `any` for entry types:** Define/import `KBEntry` type from `kb-service.ts` or `src/modules/knowledge-base/types/kb.ts`
- **Hooks after conditional returns:** Memory rule — hooks must be declared before any early returns (previous crash pattern)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom renderer | `MarkdownRenderer` (already in codebase) | Already styled, handles GFM, prose classes |
| Toast notifications | Custom alert state | `sonner` via `toast()` | Already wired in App.tsx |
| Form select dropdowns | Custom dropdown | shadcn `Select` + `SelectItem` | Accessible, styled, keyboard-nav |
| Tag input UX | Complex tag manager | Simple comma-separated `Input` parsed on save | Sufficient for internal tool |
| Full-text search engine | Custom fuzzy search | Supabase `textSearch()` with 'portuguese' | Phase 30 already sets up tsvector |

**Key insight:** This phase is almost entirely UI wiring. The data layer (Phase 30), component system (shadcn), and markdown renderer are all pre-built. The implementation risk is low — the main work is composing existing pieces correctly.

---

## Common Pitfalls

### Pitfall 1: textSearch() query format
**What goes wrong:** Passing a multi-word string like "erro producao" to `textSearch()` without converting to tsquery format causes no results or a Supabase error.
**Why it happens:** Supabase `textSearch()` by default expects tsquery syntax (`erro & producao`), not plain text.
**How to avoid:** Use the `type: 'plain'` option which accepts plain text: `.textSearch('search_vector', query, { config: 'portuguese', type: 'plain' })`. Verified: supabase-js v2 `textSearch` supports `type: 'plain' | 'phrase' | 'websearch'`.
**Warning signs:** Empty results for multi-word queries, or 400 errors with tsquery syntax messages.

### Pitfall 2: Filter dependency array with tags array
**What goes wrong:** Using `filters.tags` (array reference) directly in `useEffect` dependency array causes infinite re-renders because a new array reference is created on each render.
**Why it happens:** Arrays are compared by reference in JavaScript.
**How to avoid:** Serialize tags to string: `JSON.stringify(filters.tags)` in the dependency array, or memoize the filters object with `useMemo` in the parent.
**Warning signs:** Console warning "Maximum update depth exceeded" or network tab showing infinite Supabase calls.

### Pitfall 3: Route order conflict for /new vs /:id
**What goes wrong:** `/knowledge-base/new` matches `/:id` route if `:id` is listed first, opening a detail page for "new" as an id.
**Why it happens:** react-router-dom v6 uses best-match routing, but static segments beat params only when ordered correctly in the JSX.
**How to avoid:** Always list static routes before parametric routes in the route tree. `/knowledge-base/new` must come before `/knowledge-base/:id`.

### Pitfall 4: Tags stored as string in state, array expected by Supabase
**What goes wrong:** Tags are typed as `text[]` in Supabase but the form uses a comma-separated text input. Saving the raw string causes a type mismatch.
**Why it happens:** Natural to use a single Input for tags UX, but Supabase expects `string[]`.
**How to avoid:** Parse on submit: `tags: formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean)`.

### Pitfall 5: ADR template overwriting existing body on edit
**What goes wrong:** When editing an existing `decision` entry, the ADR template is injected over the real content.
**Why it happens:** The `useEffect` watching `type` fires when the component mounts with existing data.
**How to avoid:** Guard the injection: `if (formData.type === 'decision' && !formData.body.trim())` — only inject if body is empty.

---

## Code Examples

### Supabase list with filters
```typescript
// Source: supabase-js v2 official docs — .select(), .eq(), .contains(), .overlaps()
export async function listKBEntries(filters: KBFilters): Promise<KBEntry[]> {
  let query = supabase
    .from('knowledge_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.type) {
    query = query.eq('entry_type', filters.type)
  }
  if (filters.clientSlug) {
    query = query.eq('client_slug', filters.clientSlug)
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
```

### Supabase FTS with plain text
```typescript
// Source: supabase-js v2 docs — textSearch with type:'plain'
export async function searchKBEntries(queryText: string): Promise<KBEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .textSearch('search_vector', queryText, {
      config: 'portuguese',
      type: 'plain',
    })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}
```

### shadcn Select for entry_type
```typescript
// Pattern from existing BriefingForm.tsx — uses same Select components
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

<Select
  value={formData.type}
  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as KBEntryType }))}
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

### KBEntryCard layout pattern (follows existing Home.tsx card pattern)
```typescript
// Pattern from Home.tsx — rounded-xl border bg-white p-5 hover:border-indigo-200
<Link to={`/knowledge-base/${entry.id}`} className="h-full">
  <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-card">
    <div className="mb-2 flex items-center gap-2">
      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800">
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
  </div>
</Link>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-feature lib choices | Module folder per feature (pages/, components/, hooks/, types/) | Phase 29 | Phase 31 must follow module structure |
| Supabase Auth for user identity | Clerk auth, Supabase as pure data store with anon-permissive RLS | Migration 002 | No auth checks in KB service; anon key is fine |
| Switch statements for rendering variants | Pattern from section registry; use discriminated unions | v1.3 | KBEntryType should be a union type, not magic strings |

---

## Open Questions

1. **Does Phase 30 expose `kb-service.ts` with the exact function signatures needed?**
   - What we know: Phase 30 creates service stubs; exact signatures are TBD until Phase 30 executes
   - What's unclear: Whether `listKBEntries(filters)` accepts the filter object shape described above
   - Recommendation: Phase 31 Wave 0 should verify `kb-service.ts` exports before building hooks. If signatures differ, adapt hooks — service is the contract.

2. **Does Phase 29 define the module folder convention for `src/modules/knowledge-base/`?**
   - What we know: Phase 29 creates `src/modules/registry.ts` with MOD-01/02/03
   - What's unclear: Exact folder structure decided in Phase 29 — may use `src/modules/[name]/` or `src/features/[name]/`
   - Recommendation: Phase 31 Wave 0 reads Phase 29 output and follows its convention exactly.

3. **Minimum `knowledge_entries` columns needed for filter UI**
   - What we know: Phase 30 creates `entry_type`, `tags text[]`, `client_slug`, `title`, `body`, `created_at`, `updated_at`
   - What's unclear: Whether `author_id` or `created_by` is included (needed to show "created by" in detail?)
   - Recommendation: Only display what columns exist. Skip author display if column not present — metadata panel shows type, tags, client, dates only (per KB-03 success criteria).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

**Note:** No existing test files found. The test include pattern is `tools/**/*.test.ts` and `src/**/*.test.ts`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KB-02 | Filter composition (type + tags + client) in service | unit | `npx vitest run src/modules/knowledge-base` | ❌ Wave 0 |
| KB-03 | Detail page renders metadata fields | manual-only | Visual browser check | N/A |
| KB-04 | Form saves entry and navigates back | manual-only | Visual browser check | N/A |
| KB-05 | textSearch call constructs correct query | unit | `npx vitest run src/modules/knowledge-base` | ❌ Wave 0 |
| KB-06 | ADR template injected for decision type | unit | `npx vitest run src/modules/knowledge-base` | ❌ Wave 0 |

KB-03 and KB-04 are manual-only because they require browser rendering and Supabase connection. KB-02, KB-05, KB-06 can be unit-tested by mocking the Supabase client or testing pure logic functions.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (TypeScript gate per CLAUDE.md)
- **Per wave merge:** `npx tsc --noEmit && npx vitest run`
- **Phase gate:** Zero TypeScript errors + visual browser validation on all 5 routes

### Wave 0 Gaps
- [ ] `src/modules/knowledge-base/hooks/useKBEntries.test.ts` — covers KB-02 filter composition
- [ ] `src/modules/knowledge-base/hooks/useKBSearch.test.ts` — covers KB-05 query construction
- [ ] `src/modules/knowledge-base/pages/KBFormPage.test.ts` — covers KB-06 ADR template injection logic

*(These are optional unit tests — the hard gate is always `npx tsc --noEmit` per project rules)*

---

## Sources

### Primary (HIGH confidence)
- Project source code (`src/lib/supabase.ts`, `src/components/docs/MarkdownRenderer.tsx`, `src/pages/clients/BriefingForm.tsx`, `src/components/layout/Sidebar.tsx`) — direct inspection of existing patterns
- `package.json` — confirmed all required dependencies already installed
- `.planning/REQUIREMENTS.md` — exact requirement definitions for KB-02 through KB-06
- `.planning/STATE.md` — v1.5 decisions including `entry_type` column name and 'portuguese' tsvector config
- `supabase/migrations/002_clerk_migration.sql` — confirmed anon-permissive RLS pattern

### Secondary (MEDIUM confidence)
- Supabase JS v2 `.textSearch()` API with `type: 'plain'` option — based on library version ^2.98.0 in package.json; `type: 'plain'` is documented for v2

### Tertiary (LOW confidence)
- None — all findings verified against project source code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies confirmed in package.json, no new installs needed
- Architecture: HIGH — module pattern follows decisions already logged in STATE.md; UI patterns directly from existing BriefingForm.tsx and Home.tsx
- Pitfalls: HIGH — filter dependency array, route order, and tag parsing are known React/Supabase patterns verified against existing code
- FTS query: MEDIUM — textSearch with `type: 'plain'` is standard in supabase-js v2 but the exact column name depends on Phase 30 output

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (stable stack, no fast-moving dependencies)
