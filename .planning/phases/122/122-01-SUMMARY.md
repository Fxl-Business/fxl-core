---
phase: 122-document-scoping-rls
plan: 01
status: done
started: "2026-03-19T18:00:00Z"
finished: "2026-03-19T18:10:00Z"
---

## Summary

### Task 1: Migration 020 — fix documents_select RLS policy

Created `supabase/migrations/020_documents_rls_fix.sql` that drops all 4 document policies
from migration 013 and recreates them with correct scoping:

- **Super admin** (`super_admin='true'` in JWT): sees ALL documents (bypass)
- **Tenant members**: see only their org's `scope='tenant'` docs (matching `org_id`)
- **Product docs** (`scope='product'`): visible ONLY to super admin (no independent `OR scope='product'` clause)
- **No anon access**: all policies use `TO authenticated` only (removed `anon` role)

Applied via `mcp__supabase__execute_sql`. Verified:
- `pg_policies` shows 4 policies with `roles={authenticated}`
- FXL org member (super_admin=false): 74 tenant docs, 0 product docs
- Super admin: 74 tenant + 18 product docs
- Empty org: 0 docs
- Empty JWT: 0 docs

### Task 2: Fix useDocsNav re-fetch after org switch

**docs-service.ts**: Added `cacheVersion` counter + `getDocsCacheVersion()` export.
`invalidateDocsCache()` now increments `cacheVersion` in addition to clearing cache.

**useDocsNav.ts**: Added polling interval (100ms) that watches `getDocsCacheVersion()`.
When cache is invalidated (org switch), `cacheVersion` state updates, triggering the
fetch useEffect to re-run. Items reset to `[]` before re-fetch to avoid stale data.

### Files modified

- `supabase/migrations/020_documents_rls_fix.sql` (new)
- `src/modules/docs/services/docs-service.ts` (cacheVersion + getDocsCacheVersion)
- `src/modules/docs/hooks/useDocsNav.ts` (cacheVersion polling + deps fix)

### Verification

- `npx tsc --noEmit`: zero errors
- RLS verified via raw SQL with SET LOCAL ROLE authenticated
