# Summary: Phase 126, Plan 02 — Consumer Migration

**Status:** Complete
**One-liner:** Migrated ProtectedRoute, SuperAdminRoute, and ImpersonationContext to useOrgToken() context, deleted old useOrgTokenExchange hook

## What was built
- `src/App.tsx` — OrgTokenProvider wraps the component tree above ImpersonationProvider
- `src/platform/auth/ProtectedRoute.tsx` — uses `useOrgToken()` instead of old hook
- `src/platform/auth/SuperAdminRoute.tsx` — uses `useOrgToken()` instead of old hook
- `src/platform/auth/ImpersonationContext.tsx` — uses `setTokenOverride()`/`clearTokenOverride()` from context
- Deleted `useOrgTokenExchange.ts` and its test file

## Files changed
- `src/App.tsx` (modified)
- `src/platform/auth/ProtectedRoute.tsx` (modified)
- `src/platform/auth/SuperAdminRoute.tsx` (modified)
- `src/platform/auth/ImpersonationContext.tsx` (modified)
- `src/platform/tenants/useOrgTokenExchange.ts` (deleted)
- `src/platform/tenants/useOrgTokenExchange.test.ts` (deleted)
