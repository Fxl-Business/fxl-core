---
phase: quick
plan: 14
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/docs-service.ts
autonomous: false
requirements: []

must_haves:
  truths:
    - "First doc page load triggers a single getAllDocuments() query to Supabase"
    - "Subsequent page navigations serve docs from in-memory cache with zero network requests"
    - "useDoc hook API remains unchanged (returns { doc, loading, error })"
    - "DocRenderer, useDocsNav, and search-index continue working without modifications"
    - "Cache is populated whether the first call comes from useDocsNav or useDoc"
  artifacts:
    - path: "src/lib/docs-service.ts"
      provides: "In-memory cache layer over Supabase queries"
      contains: "docsCache"
  key_links:
    - from: "src/lib/docs-service.ts"
      to: "supabase.from('documents')"
      via: "Single getAllDocuments() call populates cache, getDocBySlug reads from it"
      pattern: "docsCache"
    - from: "src/hooks/useDoc.ts"
      to: "src/lib/docs-service.ts"
      via: "getDocBySlug import (unchanged)"
      pattern: "getDocBySlug"
---

<objective>
Add an in-memory cache layer to docs-service.ts so that ALL documents are fetched once
from Supabase on first request, then all subsequent getDocBySlug() calls resolve
instantly from the cache. This eliminates per-page-navigation network requests.

Purpose: Currently, every doc page navigation triggers an individual Supabase query.
With ~62 docs, fetching all at once and caching is far more efficient. The sidebar
(useDocsNav) already calls getAllDocuments() on mount, so the cache will be warm
before the user navigates to any page.

Output: Modified docs-service.ts with cache (single file change)
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/docs-service.ts
@src/hooks/useDoc.ts
@src/lib/docs-parser.ts
@src/pages/DocRenderer.tsx
@src/hooks/useDocsNav.ts
@src/lib/search-index.ts

<interfaces>
<!-- Current API surface that MUST remain unchanged for consumers -->

From src/lib/docs-service.ts:
```typescript
export type DocumentRow = {
  id: string; title: string; badge: string; description: string;
  slug: string; parent_path: string; body: string; sort_order: number;
  created_at: string; updated_at: string;
}
export async function getDocBySlug(slug: string): Promise<DocumentRow | null>
export async function getAllDocuments(): Promise<DocumentRow[]>
export async function getDocsByParentPath(parentPath: string): Promise<DocumentRow[]>
```

From src/hooks/useDoc.ts:
```typescript
type UseDocResult = { doc: ParsedDoc | null; loading: boolean; error: string | null }
export function useDoc(slug: string): UseDocResult
```

Consumers (NO changes needed to these):
- src/hooks/useDocsNav.ts — calls getAllDocuments() on mount
- src/lib/search-index.ts — calls getAllDocuments() for search
- src/pages/DocRenderer.tsx — calls useDoc(slug)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add in-memory cache layer to docs-service.ts</name>
  <files>src/lib/docs-service.ts</files>
  <action>
Add a module-level cache to docs-service.ts with these specifics:

1. Create a module-level variable:
   - `let docsCache: DocumentRow[] | null = null` — holds all docs after first fetch
   - `let docsCachePromise: Promise<DocumentRow[]> | null = null` — prevents concurrent fetches

2. Create a private `ensureCache()` function:
   - If `docsCache` is not null, return it immediately via `Promise.resolve(docsCache)`
   - If `docsCachePromise` is not null, return it (another caller is already fetching)
   - Otherwise, set `docsCachePromise` to the Supabase query (the existing getAllDocuments logic:
     `supabase.from('documents').select('*').order('parent_path').order('sort_order')`),
     then on resolve set `docsCache = data` and clear `docsCachePromise`
   - On error, clear `docsCachePromise` (so next call retries) and return empty array
   - This ensures exactly ONE Supabase query no matter how many concurrent callers

3. Modify `getAllDocuments()`:
   - Replace the direct Supabase query with `return ensureCache()`
   - The sorted order is already handled by the Supabase query inside ensureCache

4. Modify `getDocBySlug(slug)`:
   - Call `await ensureCache()` to get all docs
   - Return `docs.find(d => d.slug === slug) ?? null`
   - This replaces the individual `.eq('slug', slug).single()` query

5. Modify `getDocsByParentPath(parentPath)`:
   - Call `await ensureCache()` to get all docs
   - Return `docs.filter(d => d.parent_path === parentPath)` — already sorted by sort_order
     since ensureCache returns docs ordered by parent_path then sort_order

6. Add an `invalidateDocsCache()` export:
   - Sets `docsCache = null` and `docsCachePromise = null`
   - This is for future use (e.g., after sync-up) but export it now for completeness

Do NOT change the exported function signatures or the DocumentRow type.
Do NOT change useDoc.ts — it already calls getDocBySlug which will now use the cache.
Do NOT use React context or providers — this is a pure service-level cache.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/Projetos/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - docs-service.ts has module-level cache (docsCache, docsCachePromise, ensureCache)
    - getAllDocuments() uses ensureCache() instead of direct Supabase query
    - getDocBySlug() looks up from cache via ensureCache()
    - getDocsByParentPath() filters from cache via ensureCache()
    - invalidateDocsCache() is exported
    - All existing exports and types unchanged
    - TypeScript compiles with zero errors
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify instant navigation in browser</name>
  <files>n/a</files>
  <action>
User verifies that document navigation is instant after first load, with no
additional Supabase network requests on page changes.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/Projetos/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - User confirms single Supabase query on app load
    - User confirms zero network requests on subsequent navigations
    - Sidebar, search, and doc rendering all work correctly
  </done>
  <what-built>
In-memory document cache that fetches ALL docs on first request and serves
subsequent navigations instantly from memory. No changes to useDoc hook,
DocRenderer, useDocsNav, or search-index needed.
  </what-built>
  <how-to-verify>
1. Run `make dev` and open the app in browser
2. Open browser DevTools -> Network tab, filter by "rest" or "supabase" to see Supabase requests
3. Navigate to any doc page (e.g., /processo/index)
4. Observe: ONE request to Supabase `documents` table (the bulk fetch)
5. Navigate to a different doc page (e.g., /processo/fases/fase1)
6. Observe: NO new Supabase request — page loads instantly from cache
7. Navigate to 2-3 more pages to confirm zero additional network requests
8. Verify sidebar navigation still works (populated from same cache)
9. Verify search still works (Cmd+K or search UI)
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Network tab shows single Supabase documents query on app load
- Subsequent doc navigations produce zero Supabase requests
- Sidebar nav renders correctly
- Search index works
- Doc pages render with correct content, breadcrumbs, TOC
</verification>

<success_criteria>
- Page-to-page doc navigation is instant (no loading skeleton after first page)
- Only ONE Supabase query for documents table per app session
- All existing functionality (nav, search, doc rendering) works unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/14-prefetch-all-docs-on-first-load-for-inst/14-SUMMARY.md`
</output>
