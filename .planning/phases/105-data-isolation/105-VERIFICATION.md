# Phase 105: Data Isolation — Verification

**Date:** 2026-03-18
**Status:** PASS

---

## Acceptance Criteria

### AC-1: Token exchange hook wiring
- [x] `useOrgTokenExchange` hook created at `src/platform/tenants/useOrgTokenExchange.ts`
- [x] Hook calls `exchangeToken(clerkToken)` and `setOrgAccessToken(result.access_token)`
- [x] Effect re-runs when `activeOrg?.id` changes
- [x] On token exchange failure: sets `orgAccessToken` to null, surfaces error state
- [x] `ProtectedRoute.tsx` consumes the hook and displays token error UI
- [x] `onOrgChange` callback passed from `ProtectedRoute` to invalidate docs cache on org switch — avoids platform→modules import boundary violation

### AC-2: Docs cache invalidation on org switch
- [x] `invalidateDocsCache()` already existed in `docs-service.ts` (nullifies both `docsCache` and `docsCachePromise`)
- [x] Called via `onOrgChange` callback in `useOrgTokenExchange`, wired through `ProtectedRoute`

### AC-3: clients table + RLS
- [x] Migration `016_clients_table.sql` applied to Supabase
- [x] `clients` table with `org_id`, RLS enabled, JWT-based row filtering
- [x] `financeiro-conta-azul` seed row with `org_id='org_fxl_default'`
- [x] Index on `(org_id, slug)`

### AC-4: clients-service.ts
- [x] Created at `src/modules/clients/services/clients-service.ts`
- [x] `Client` interface typed strictly (no `any`)
- [x] `listClients()` and `getClient(slug)` implemented

### AC-5: ClientsIndex.tsx dynamic
- [x] Hardcoded `CLIENTS` array replaced with dynamic `listClients()` Supabase fetch
- [x] Loading, error, empty state, and cards grid rendered correctly

### AC-6: tasks service org_id
- [x] `Task` interface has `org_id: string`
- [x] `CreateTaskParams` requires `org_id`
- [x] INSERT in `createTask` passes `org_id`
- [x] `TaskForm.tsx` passes `activeOrg?.id ?? ''` on create
- [x] All test call sites updated

### AC-7: TypeScript strict
- [x] `npx tsc --noEmit` → 0 errors

---

## What Was Out of Scope (deferred)
- Wireframe/blueprint table `org_id` column (depends on migration sequence)
- Data recovery for orphaned rows (Phase 106)
- Header UX org-switcher improvements (Phase 107)
- Admin enhancements (Phase 108)

---

## Result: PASS — Phase 105 complete
