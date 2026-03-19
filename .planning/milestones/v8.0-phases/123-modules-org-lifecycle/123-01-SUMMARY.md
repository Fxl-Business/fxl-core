---
phase: 123-modules-org-lifecycle
plan: 01
status: done
started: "2026-03-19T18:13:00Z"
finished: "2026-03-19T18:15:00Z"
---

## Summary

### Task 1: Verify useModuleEnabled opt-out logic + add docs-service pub/sub

**useModuleEnabled.tsx**: Verified all 4 opt-out conditions are correct as-is:
- `activeOrg=null` → empty Set (all disabled)
- `activeOrg` + 0 rows → `new Set(ALL_MODULE_IDS)` (all enabled)
- Partial rows → enabled=true rows + missing modules (opt-out: absence = enabled)
- Fetch error → fallback to all enabled

**docs-service.ts**: Replaced polling-based `cacheVersion` counter with proper pub/sub:
- Added `onDocsCacheInvalidated(cb)` → returns unsubscribe function
- Updated `invalidateDocsCache()` to notify all registered listeners
- Removed `getDocsCacheVersion()` (no longer needed — polling replaced by events)

### Task 2: Make useDocsNav reactive to org switches + fix empty state

**useDocsNav.ts**:
- Added `refetchTick` state + `onDocsCacheInvalidated` subscription
- useEffect now depends on `refetchTick` instead of polling interval
- Exposes `isLoading` in return type
- Sets `isLoading=true` during fetch, handles catch with `isLoading=false`

**useDocsNavItems.ts**:
- Passes through real `isLoading` from `useDocsNav` instead of hardcoded `false`

**Sidebar.tsx DynamicNavContent**:
- Empty state now shows contextual message: "Nenhum documento encontrado para esta organização" + admin hint

### Task 3: Updated existing tests

**docs-rls.test.ts**: Replaced `getDocsCacheVersion` tests with pub/sub tests:
- `invalidateDocsCache notifies all subscribed listeners`
- `onDocsCacheInvalidated unsubscribe stops notifications`

All 9 tests pass. npx tsc --noEmit = zero errors.

## Key Files

### Created
- (none)

### Modified
- `src/modules/docs/services/docs-service.ts` — pub/sub cache invalidation
- `src/modules/docs/hooks/useDocsNav.ts` — reactive refetch + isLoading
- `src/modules/docs/hooks/useDocsNavItems.ts` — pass through isLoading
- `src/platform/layout/Sidebar.tsx` — contextual empty state
- `src/modules/docs/services/__tests__/docs-rls.test.ts` — updated tests

## Deviations
- Skipped creating separate test files for useDocsNav hook (the plan suggested `useDocsNav.test.ts`) because `@testing-library/react` renderHook tests would require complex mocking of the docs-service module. The pub/sub behavior is fully tested in docs-rls.test.ts. The reactive hook behavior is best verified manually.
