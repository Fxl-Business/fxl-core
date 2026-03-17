---
phase: 81-docs-data-model
plan: 01
subsystem: database
tags: [supabase, postgres, rls, multi-tenant, documents, migrations]

# Dependency graph
requires: []
provides:
  - scope column on documents table with CHECK constraint IN ('tenant', 'product')
  - Four split RLS policies (select/insert/update/delete) replacing the original combined policy
  - idx_documents_scope index on documents table
  - DocumentScope type in docs-service.ts
  - org_id and scope fields on DocumentRow type
  - getProductDocs() and getTenantDocs() exported query helpers
affects:
  - 82-docs-admin-ui
  - 83-docs-sidebar-separation
  - src/modules/docs

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "scope column pattern: 'tenant' (default, org-isolated) vs 'product' (globally readable)"
    - "Split RLS policies per operation (SELECT/INSERT/UPDATE/DELETE) for fine-grained control"
    - "In-memory cache filtered client-side by scope; no extra DB queries needed"

key-files:
  created:
    - supabase/migrations/011_documents_scope.sql
  modified:
    - src/modules/docs/services/docs-service.ts

key-decisions:
  - "scope = 'product' short-circuits org_id check in SELECT policy so product docs are globally visible without modifying org_id"
  - "Write policies (INSERT/UPDATE/DELETE) do NOT include scope = 'product' bypass — only super_admin can write product docs"
  - "In-memory cache strategy unchanged; scope filtering happens client-side via getProductDocs/getTenantDocs"
  - "org_id was already in DB but missing from DocumentRow type — added it alongside scope to align type with table"

patterns-established:
  - "Scope-aware RLS pattern: SELECT allows scope='product' globally; write operations require org_id match or super_admin"
  - "DocumentScope type union ('tenant' | 'product') for type-safe scope handling"

requirements-completed: [DOCS-01, DOCS-02, DOCS-03]

# Metrics
duration: 8min
completed: 2026-03-17
---

# Phase 81 Plan 01: Docs Data Model Summary

**Scope column added to documents table with split RLS policies — product docs globally readable, tenant docs org-isolated, with TypeScript type updates and scope-filtering query helpers**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-17T00:00:00Z
- **Completed:** 2026-03-17T00:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Migration 011 adds scope column (NOT NULL DEFAULT 'tenant', CHECK IN ('tenant', 'product')) with backfill of existing rows
- Drops old combined `documents_org_access` policy, replaces with 4 split policies (documents_select, documents_insert, documents_update, documents_delete)
- SELECT policy allows scope='product' rows through regardless of org_id, enabling globally visible product documentation
- Write policies preserve existing org_id-based isolation — tenants cannot create/modify product docs
- `idx_documents_scope` index added for query performance
- `DocumentRow` type updated with `org_id: string` and `scope: DocumentScope` fields
- `getProductDocs()` and `getTenantDocs()` helpers exported, filtering the in-memory cache

## Task Commits

Each task was committed atomically:

1. **Tasks 1 + 2: Migration + TypeScript update** - `e8bf620` (feat)

## Files Created/Modified
- `supabase/migrations/011_documents_scope.sql` - Scope column, CHECK constraint, 4 split RLS policies, scope index
- `src/modules/docs/services/docs-service.ts` - DocumentScope type, org_id + scope in DocumentRow, getProductDocs + getTenantDocs helpers

## Decisions Made
- scope = 'product' only bypasses the org_id check in the SELECT policy — write policies intentionally do not include this bypass, ensuring only super_admin can create or modify product-scoped documents
- In-memory cache strategy unchanged: `.select('*')` already returns all columns including the new scope and org_id fields; filtering is done client-side
- org_id was already in the DB but absent from the TypeScript type — aligned type with table reality alongside the scope addition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Migration will apply automatically on next Supabase deploy.

## Next Phase Readiness
- Data model foundation for v4.2 docs separation is complete
- Phase 82 (admin UI + sidebar separation + content migration) can now proceed
- `getProductDocs()` and `getTenantDocs()` are ready for consumption by sidebar and admin components

## Self-Check

- [x] `supabase/migrations/011_documents_scope.sql` exists
- [x] `src/modules/docs/services/docs-service.ts` has DocumentScope, org_id, scope, getProductDocs, getTenantDocs
- [x] Commit e8bf620 exists
- [x] `npx tsc --noEmit` exits zero

## Self-Check: PASSED

---
*Phase: 81-docs-data-model*
*Completed: 2026-03-17*
