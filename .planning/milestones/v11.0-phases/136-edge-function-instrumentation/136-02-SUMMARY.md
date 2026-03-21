---
phase: 136-edge-function-instrumentation
plan: "02"
subsystem: auth-audit
tags: [edge-function, audit, auth, clerk, supabase, fire-and-forget]
dependency_graph:
  requires:
    - 134-01: audit_logs table schema with sign_in/sign_out CHECK constraint values
    - 135-A: audit-service.ts pattern (reference for fire-and-forget)
  provides:
    - supabase/functions/audit-auth/index.ts: Edge function logging auth events to audit_logs
    - src/platform/services/audit-auth-service.ts: Frontend fire-and-forget auth event service
  affects:
    - src/platform/auth/Login.tsx: Now logs sign_in after successful email/password auth
    - src/platform/layout/UserMenu.tsx: Now logs sign_out before Clerk signOut()
    - src/platform/router/AppRouter.tsx: OAuth deferral documented
tech_stack:
  added: []
  patterns:
    - fire-and-forget fetch (no await on caller side) for audit logging
    - manual JWT base64 decode in Deno edge function (no jose dependency needed)
    - useAuth().getToken() from @clerk/react for post-auth token retrieval
key_files:
  created:
    - supabase/functions/audit-auth/index.ts
    - src/platform/services/audit-auth-service.ts
  modified:
    - src/platform/auth/Login.tsx
    - src/platform/layout/UserMenu.tsx
    - src/platform/router/AppRouter.tsx
decisions:
  - Always return 200 from audit-auth — edge function never blocks auth flow
  - JWT decoded manually (base64) — no jose import needed for read-only decode
  - useAuth().getToken() called after setActive() in Login.tsx — token is available at that point
  - logAuthEvent() is void (not async) — callers cannot accidentally await it
  - org_id may be null for sign-in (user hasn't selected org yet) — this is expected
  - Google OAuth deferral documented with TODO(CAPT-03) in AppRouter.tsx
metrics:
  duration: "~4 minutes"
  completed_date: "2026-03-20"
  tasks_completed: 2
  files_changed: 5
---

# Phase 136 Plan 02: Auth Event Audit Logging Summary

**One-liner:** Fire-and-forget auth audit via new `audit-auth` edge function — email/password sign-in and sign-out now generate `audit_logs` rows with IP and user-agent.

## What Was Built

### Task 1: audit-auth Edge Function
Created `supabase/functions/audit-auth/index.ts` — a new Deno edge function that:
- Accepts POST `{ event: 'sign_in' | 'sign_out' }` with a Clerk Bearer token
- Decodes JWT manually (base64) to extract `sub` (actor_id), `email`, `org_id`, `sid`/`jti` (session_id)
- Captures IP from `x-forwarded-for` (first in chain) or `x-real-ip` headers
- Captures `user-agent` from request headers
- Inserts a row into `audit_logs` with bare `sign_in`/`sign_out` values matching the DB CHECK constraint
- Always returns `{ ok: true }` with HTTP 200 — never blocks auth flow
- Catches all errors internally and logs to console — no throw propagation

### Task 2: Frontend Service + Integration
Created `src/platform/services/audit-auth-service.ts`:
- Exports `logAuthEvent(event, token): void` — explicitly void, fire-and-forget
- Uses `VITE_SUPABASE_FUNCTIONS_URL` env var for the edge function URL
- Errors from fetch are silently caught

Integrated in `src/platform/auth/Login.tsx`:
- Added `useAuth` import from `@clerk/react`
- After `setActive()` resolves, calls `getToken().then(token => logAuthEvent('sign_in', token))` using `.then()/.catch()` pattern (non-blocking)

Integrated in `src/platform/layout/UserMenu.tsx`:
- `handleSignOut` is now async
- Awaits `getToken()` before calling `signOut()` to capture the token while session still exists
- try/catch ensures sign-out is never blocked by audit errors

Added SSO deferral comment in `src/platform/router/AppRouter.tsx`:
- `TODO(CAPT-03)` comment at the SSO callback route documents why OAuth sign-in audit is deferred

## Verification Results

All 8 verification checks passed:
1. Edge function file exists
2. All code paths return `jsonOk()` (HTTP 200)
3. `action: event` uses bare values (not prefixed)
4. `logAuthEvent` exported from service
5. Login.tsx calls `logAuthEvent('sign_in', token)`
6. UserMenu.tsx calls `logAuthEvent('sign_out', token)`
7. `TODO(CAPT-03)` comment in AppRouter.tsx
8. No `throw err` in error paths of edge function

TypeScript: `npx tsc --noEmit` — zero errors.

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| Task 1 | 7a14958 | feat(136-02): create audit-auth edge function |
| Task 2 | 9102798 | feat(136-02): add frontend auth audit service and integrate in Login/UserMenu |

## Self-Check: PASSED

All created files confirmed on disk. All commits verified in git log.
