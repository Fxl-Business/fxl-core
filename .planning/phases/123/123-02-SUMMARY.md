---
phase: 123-modules-org-lifecycle
plan: 02
status: done
started: "2026-03-19T18:15:00Z"
finished: "2026-03-19T18:17:00Z"
---

## Summary

### Task 1: Create module-signals.ts and wire ImpersonationContext

**module-signals.ts** (new file): Pub/sub for module invalidation + impersonated org_id tracking:
- `onModulesInvalidated(cb)` → subscribe to module invalidation, returns unsubscribe
- `invalidateModules()` → notify all listeners
- `setImpersonationOrgId(orgId | null)` → set/clear impersonated org override
- `getImpersonationOrgId()` → get current impersonated org_id

**ImpersonationContext.tsx**: Wired both signals:
- `enterImpersonation`: calls `setImpersonationOrgId(orgId)` + `invalidateModules()` after setting token
- `exitImpersonation`: calls `setImpersonationOrgId(null)` + `invalidateModules()` after restoring token

### Task 2: Update useModuleEnabled to use effective org_id

**useModuleEnabled.tsx**:
- Added `refetchTick` state + `onModulesInvalidated` subscription
- Fetch useEffect now depends on `refetchTick` (re-fetches on impersonation change)
- Uses `getImpersonationOrgId() ?? activeOrg.id` as effective org_id for the WHERE clause
- During impersonation: queries tenant_modules for the impersonated org
- On exit: reverts to admin's own activeOrg.id

npx tsc --noEmit = zero errors.

## Key Files

### Created
- `src/platform/module-loader/module-signals.ts` — module invalidation pub/sub + impersonation org tracking

### Modified
- `src/platform/auth/ImpersonationContext.tsx` — wire module signals on enter/exit
- `src/platform/module-loader/hooks/useModuleEnabled.tsx` — effective org_id + refetchTick

## Deviations
- None
