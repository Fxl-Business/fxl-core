---
phase: quick-14
plan: 14
subsystem: database
tags: [supabase, cache, docs-service, performance]

requires: []
provides:
  - "In-memory cache layer in docs-service.ts that fetches all docs in one Supabase query and serves subsequent navigations from memory"
affects: [docs-service, useDoc, useDocsNav, search-index]

tech-stack:
  added: []
  patterns: ["Module-level cache with in-flight promise deduplication (ensureCache pattern)"]

key-files:
  created: []
  modified:
    - src/lib/docs-service.ts

key-decisions:
  - "Used module-level variables (docsCache, docsCachePromise) instead of React context — pure service-level cache, no provider needed"
  - "In-flight promise deduplication via docsCachePromise prevents concurrent callers from triggering multiple Supabase queries"
  - "async fetchAllDocs() + sync ensureCache() split needed because Supabase builder returns PromiseLike, not a true Promise with .catch()"
  - "invalidateDocsCache() exported for future use after sync-up operations"

patterns-established:
  - "ensureCache pattern: check populated cache → check in-flight promise → start new fetch; works for any service-level bulk-fetch cache"

requirements-completed: []

duration: ~10min
completed: 2026-03-13
---

# Quick Task 14: Prefetch All Docs on First Load — Summary

**In-memory bulk-fetch cache for docs-service.ts: single Supabase query on first request, zero network requests on subsequent navigations**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-13T~14:00Z
- **Completed:** 2026-03-13
- **Tasks:** 1 of 2 (Task 2 is human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

- Added module-level `docsCache: DocumentRow[] | null` and `docsCachePromise` for deduplication
- `ensureCache()` ensures exactly one Supabase query per app session, regardless of concurrent callers
- `getAllDocuments()`, `getDocBySlug()`, and `getDocsByParentPath()` all serve from cache
- Exported `invalidateDocsCache()` for future post-sync-up use
- All existing exported function signatures and `DocumentRow` type unchanged
- TypeScript compiles with zero errors

## Task Commits

1. **Task 1: Add in-memory cache layer to docs-service.ts** - `2f06186` (feat)

## Files Created/Modified

- `/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/src/lib/docs-service.ts` - Added ensureCache pattern; all three query functions now read from cache

## Decisions Made

- Used `async fetchAllDocs()` helper (called by `ensureCache()`) because the Supabase query builder returns a `PromiseLike`, not a native `Promise` — chaining `.catch()` directly caused TS2339. Wrapping in `async/await` normalizes it.
- Kept cache invalidation simple (`null` both variables) — caller retries on next request.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript errors from chaining .catch() on Supabase PromiseLike**
- **Found during:** Task 1 (implementation + tsc verification)
- **Issue:** `supabase.from(...).then(...).catch(...)` fails with TS2339 because the builder is a `PromiseLike`, not a full `Promise`
- **Fix:** Extracted `async fetchAllDocs()` that uses `await` and try/catch — called by the synchronous `ensureCache()`
- **Files modified:** src/lib/docs-service.ts
- **Verification:** `npx tsc --noEmit` — zero errors
- **Committed in:** 2f06186 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — TypeScript compatibility bug)
**Impact on plan:** Fix was necessary for compilation; no scope creep, behavior identical.

## Issues Encountered

None beyond the TS2339 auto-fix above.

## Next Steps

- Task 2 (human-verify): Open app in browser, check Network tab to confirm single Supabase query on load and zero additional requests on page navigation.

---
*Phase: quick-14*
*Completed: 2026-03-13*
