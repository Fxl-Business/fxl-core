---
phase: 82-docs-ui-migration
plan: 01
subsystem: ui
tags: [react, supabase, sidebar, docs, clerk, admin, rls, typescript]

# Dependency graph
requires:
  - phase: 81-docs-data-model
    provides: scope column on documents table, DocumentScope type, getProductDocs/getTenantDocs helpers, split RLS policies
provides:
  - ProductDocsPage.tsx — admin CRUD UI for scope='product' documents at /admin/product-docs
  - useDocsNav returning { tenantItems, productItems } dual-section nav
  - Sidebar showing "Docs da Empresa" and "Docs do Produto" labeled sections
  - DocRenderer read-only banner for product docs on non-super-admin users
  - useDoc returning rawDoc (DocumentRow) alongside ParsedDoc
  - Migration 012 — backfill scope='product' for sdk/* slugs
affects:
  - 83-docs-sidebar-separation
  - src/modules/docs
  - src/platform/layout

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin CRUD pattern: getProductDocs() on mount, supabase.insert/update/delete for writes, invalidateDocsCache() after mutations"
    - "Dual-section sidebar pattern: useDocsNav returns typed { tenantItems, productItems } split by scope"
    - "Read-only guard: rawDoc.scope === 'product' && !isSuperAdmin triggers informational banner"
    - "useDoc extended to return rawDoc (DocumentRow) for scope checking without re-fetching"

key-files:
  created:
    - src/platform/pages/admin/ProductDocsPage.tsx
    - supabase/migrations/012_scope_data_migration.sql
  modified:
    - src/modules/docs/hooks/useDocsNav.ts
    - src/modules/docs/hooks/useDoc.ts
    - src/modules/docs/pages/DocRenderer.tsx
    - src/platform/layout/Sidebar.tsx
    - src/platform/layout/AdminSidebar.tsx
    - src/platform/router/AppRouter.tsx

key-decisions:
  - "useDoc returns rawDoc alongside ParsedDoc — avoids a second getDocBySlug call in DocRenderer for scope check"
  - "Sidebar section labels use NavItem with href=undefined so they render as toggle-only depth=0 nodes (existing NavSection pattern)"
  - "Product docs flat nav (not hierarchical) in sidebar for v4.2 — tree structure not needed yet"
  - "ProductDocsPage inline form shown above list for create, below row for edit — no modal/Sheet pattern"

patterns-established:
  - "Scope-aware sidebar: useDocsNav splits docs by scope client-side, returns typed { tenantItems, productItems }"
  - "rawDoc pattern in useDoc: return both ParsedDoc (for rendering) and DocumentRow (for metadata like scope)"

requirements-completed: [DOCS-04, DOCS-05, DOCS-06, DOCS-07, DOCS-08, DOCS-09, DOCS-10]

# Metrics
duration: 15min
completed: 2026-03-17
---

# Phase 82 Plan 01: Docs UI & Migration Summary

**Admin CRUD page for product docs at /admin/product-docs, dual-section sidebar splitting "Docs da Empresa" from "Docs do Produto", read-only banner for operators on product docs, and SQL migration backfilling sdk/* slugs to scope='product'**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-17T00:00:00Z
- **Completed:** 2026-03-17T00:15:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- `ProductDocsPage.tsx` created with full inline CRUD (create/edit/delete) for scope='product' docs, following TenantsPage visual pattern
- `useDocsNav` refactored to return `{ tenantItems, productItems }` split by scope; Sidebar updated to show two labeled sections with fallback to static navChildren on cache miss
- `DocRenderer` shows a read-only banner ("Doc do Produto — somente leitura para operadores.") for non-super-admin users viewing product-scoped docs; `useDoc` extended with `rawDoc` field to avoid re-fetching for scope check
- Migration 012 backfills `sdk/*` slugs to `scope = 'product'`; all other docs remain `scope = 'tenant'`
- AdminSidebar "Product Docs" link enabled (removed `disabled: true`); AppRouter wired to lazy `ProductDocsPage`

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin product docs CRUD page** - `e800983` (feat)
2. **Task 2: Dual-section sidebar nav + read-only guard** - `8d8eab7` (feat)
3. **Task 3: Scope backfill migration** - `f7313b4` (feat)

## Files Created/Modified
- `src/platform/pages/admin/ProductDocsPage.tsx` - Full CRUD admin page for product docs; inline create/edit form, list with Pencil/Trash2 actions, loading/error/empty states
- `src/modules/docs/hooks/useDocsNav.ts` - Returns `{ tenantItems: NavItem[], productItems: NavItem[] }` split by scope; product items are flat sorted by sort_order
- `src/modules/docs/hooks/useDoc.ts` - Extended to return `rawDoc: DocumentRow | null` alongside `ParsedDoc`
- `src/modules/docs/pages/DocRenderer.tsx` - Uses rawDoc.scope + isSuperAdmin to conditionally render read-only banner; imports BookOpen from lucide-react and useUser from @clerk/react
- `src/platform/layout/Sidebar.tsx` - Destructures `{ tenantItems, productItems }` from useDocsNav; builds two NavItem sections with section labels when non-empty
- `src/platform/layout/AdminSidebar.tsx` - Removed `disabled: true` from Product Docs nav item
- `src/platform/router/AppRouter.tsx` - Added lazy ProductDocsPage import; replaced placeholder div at /admin/product-docs
- `supabase/migrations/012_scope_data_migration.sql` - UPDATE documents SET scope='product' WHERE slug LIKE 'sdk/%'; advisory NOTICE with post-migration counts

## Decisions Made
- `useDoc` returns `rawDoc` to avoid a duplicate `getDocBySlug` call in DocRenderer — cleaner and uses the already-loaded cache entry
- Section labels in sidebar use `NavItem` with `href: undefined` — these render as toggle-only depth=0 nodes using the existing `NavSection` component's uppercase label style
- Product docs use flat nav in the sidebar (not hierarchical) — adequate for v4.2, tree structure can be added in a future phase when product doc hierarchy is needed
- ProductDocsPage uses inline form pattern (not Sheet/Dialog) — consistent with plan spec and avoids additional modal overhead

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - run `make migrate` to apply migration 012 to the Supabase database.

## Next Phase Readiness
- All v4.2 docs separation requirements (DOCS-04 through DOCS-10) are now complete
- Super admin can manage product docs at /admin/product-docs
- Sidebar displays two correctly labeled doc sections
- Migration 012 is ready to apply via `make migrate`
- No blockers for next phase

## Self-Check

- [x] `src/platform/pages/admin/ProductDocsPage.tsx` exists
- [x] `supabase/migrations/012_scope_data_migration.sql` exists with UPDATE WHERE slug LIKE 'sdk/%'
- [x] `useDocsNav` returns `{ tenantItems, productItems }`
- [x] Commits e800983, 8d8eab7, f7313b4 exist
- [x] `npx tsc --noEmit` exits zero

## Self-Check: PASSED

---
*Phase: 82-docs-ui-migration*
*Completed: 2026-03-17*
