---
plan: 105-01
status: complete
completed: 2026-03-18
---

# Summary: Plan 105-01 — Token Exchange Hook + Supabase JWT Wiring

## What was built

Created `useOrgTokenExchange` hook in `src/platform/tenants/useOrgTokenExchange.ts` that exchanges the Clerk session token for a Supabase-compatible JWT via the existing `auth-token-exchange` edge function. Wired the hook into `ProtectedRoute.tsx` so it runs unconditionally on every authenticated render. The hook uses an `onOrgChange` callback pattern (avoiding platform→modules import boundary violation) — `ProtectedRoute` passes `invalidateDocsCache` as the callback so the docs in-memory cache resets on org switch.

`supabase.ts` already had the correct fetch interceptor — no changes needed. `invalidateDocsCache` already existed in `docs-service.ts` — no changes needed.

## Key files

### Created
- `src/platform/tenants/useOrgTokenExchange.ts` — hook with `onOrgChange` callback pattern

### Modified
- `src/platform/auth/ProtectedRoute.tsx` — imports and calls `useOrgTokenExchange({ onOrgChange: invalidateDocsCache })`; renders error UI on token exchange failure

## Deviations

- `invalidateDocsCache` was already present in `docs-service.ts` (no addition needed)
- `supabase.ts` fetch interceptor confirmed correct — no changes needed

## Self-Check: PASSED

- `npx tsc --noEmit` → zero errors
- Hook file exists at `src/platform/tenants/useOrgTokenExchange.ts`
- `ProtectedRoute.tsx` imports both `useOrgTokenExchange` and `invalidateDocsCache`
- `setOrgAccessToken(null)` called in catch block
