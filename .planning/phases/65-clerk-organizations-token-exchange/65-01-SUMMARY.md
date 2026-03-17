---
phase: 65-clerk-organizations-token-exchange
plan: 01
subsystem: auth
tags: [clerk, supabase, jwt, edge-function, multi-tenancy, organizations]

requires:
  - phase: 64-supabase-schema-migrations
    provides: org_id columns, RLS policies, tenant_modules table

provides:
  - VITE_AUTH_MODE=anon|org flag for dual auth behavior
  - useActiveOrg hook for Clerk Organizations
  - Token exchange client + Edge Function for Clerk->Supabase JWT bridge
  - Supabase client with dual mode (anon key vs org-scoped JWT)
  - OrgPicker component in TopNav

affects: [66-module-system-multi-tenancy, 67-integration-verification]

tech-stack:
  added: [jose (Deno, Edge Function only)]
  patterns: [auth-mode flag, token exchange, dual Supabase client, org picker]

key-files:
  created:
    - src/platform/auth/auth-config.ts
    - src/platform/tenants/useActiveOrg.ts
    - src/platform/tenants/token-exchange.ts
    - src/platform/tenants/OrgPicker.tsx
    - supabase/functions/auth-token-exchange/index.ts
  modified:
    - src/platform/supabase.ts
    - src/platform/layout/TopNav.tsx
    - vite-env.d.ts

key-decisions:
  - "organizationSyncOptions not available in @clerk/react 6.0.1; org persistence handled by Clerk session via useOrganizationList setActive"
  - "Supabase org client uses custom fetch wrapper with mutable token ref instead of setSession for simpler token updates"
  - "Edge Function uses @ts-nocheck since Deno runtime is not checked by project tsconfig"

patterns-established:
  - "Auth mode check: import { isOrgMode } from '@platform/auth/auth-config' for conditional behavior"
  - "Org context: import { useActiveOrg } from '@platform/tenants/useActiveOrg' for org-aware components"
  - "Token exchange: setOrgAccessToken() updates the Supabase client JWT dynamically"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, CLERK-01, CLERK-02, CLERK-03]

duration: 3min
completed: 2026-03-17
---

# Phase 65: Clerk Organizations + Token Exchange Summary

**Dual-mode auth infrastructure with Clerk Organizations, Edge Function JWT bridge, org picker UI, and VITE_AUTH_MODE flag for backward-compatible dev/staging**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T01:05:45Z
- **Completed:** 2026-03-17T01:09:00Z
- **Tasks:** 8 (grouped into 2 plan commits)
- **Files modified:** 8

## Accomplishments
- VITE_AUTH_MODE=anon|org flag with type-safe config, default anon preserves current behavior
- useActiveOrg hook wrapping Clerk useOrganization + useOrganizationList with org switching
- Supabase client refactored for dual mode: anon (current) vs org (dynamic JWT via token exchange)
- Edge Function auth-token-exchange validates Clerk JWT via JWKS and mints Supabase JWT with org_id claims
- OrgPicker component: dropdown for 2+ orgs, badge for 1 org, hidden in anon mode
- TopNav integration with OrgPicker between logo and search
- ImportMetaEnv types added for all VITE_ env vars

## Task Commits

Each plan was committed atomically:

1. **Plan 65-01: Core Auth Infrastructure** - `1f2871e` (feat)
   - auth-config.ts, useActiveOrg.ts, token-exchange.ts, supabase.ts refactor, Edge Function, vite-env.d.ts
2. **Plan 65-02: Org Picker UI** - `6e4a798` (feat)
   - OrgPicker.tsx, TopNav.tsx integration

## Files Created/Modified
- `src/platform/auth/auth-config.ts` - VITE_AUTH_MODE type-safe reader, isOrgMode() helper
- `src/platform/tenants/useActiveOrg.ts` - Clerk Organizations hook with activeOrg, orgs, switchOrg, isLoading
- `src/platform/tenants/token-exchange.ts` - Client for Edge Function JWT bridge
- `src/platform/tenants/OrgPicker.tsx` - Org picker dropdown/badge for TopNav
- `supabase/functions/auth-token-exchange/index.ts` - Deno Edge Function: Clerk JWKS validation + Supabase JWT minting
- `src/platform/supabase.ts` - Dual-mode client (anon vs org with custom fetch)
- `src/platform/layout/TopNav.tsx` - OrgPicker integration
- `vite-env.d.ts` - ImportMetaEnv with all VITE_ vars typed

## Decisions Made
- organizationSyncOptions not available in @clerk/react 6.0.1 — Clerk handles org persistence via session/setActive automatically
- Supabase org client uses custom fetch wrapper with mutable token ref (simpler than setSession for token updates)
- Edge Function uses @ts-nocheck annotation since it runs in Deno, not project tsconfig
- Token expiry set to 1 hour in Edge Function (TOKEN_EXPIRY_SECONDS = 3600)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed organizationSyncOptions from ClerkProvider**
- **Found during:** Task 6 (ClerkProvider update)
- **Issue:** organizationSyncOptions prop does not exist in @clerk/react 6.0.1
- **Fix:** Removed the prop; org sync is handled automatically by Clerk session via useOrganizationList setActive
- **Files modified:** src/main.tsx (reverted to original)
- **Verification:** tsc --noEmit passes
- **Committed in:** No change needed (reverted before commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** CLERK-03 requirement (organizationSyncOptions) adapted — org persistence works via Clerk session without the prop. No scope creep.

## Issues Encountered
None beyond the organizationSyncOptions compatibility issue resolved above.

## User Setup Required

For org mode to work, the following environment variables are needed:
- `VITE_AUTH_MODE=org` — activates org-scoped Supabase client
- `VITE_SUPABASE_FUNCTIONS_URL` — Supabase project functions URL (e.g., `https://<project>.supabase.co/functions/v1`)

Edge Function deployment requires:
- `CLERK_ISSUER` — Clerk instance URL (e.g., `https://clerk.your-domain.com`)
- `SUPABASE_JWT_SECRET` — Supabase JWT secret from Dashboard -> Settings -> API

Default mode (`VITE_AUTH_MODE=anon` or unset) works without any changes.

## Next Phase Readiness
- useActiveOrg hook ready for Phase 66 (useModuleEnabled refactor to read from tenant_modules)
- Supabase dual-mode client ready for Phase 66 (org-scoped queries)
- OrgPicker ready for org switching UX
- Edge Function ready for deployment (requires CLERK_ISSUER and SUPABASE_JWT_SECRET secrets)

---
*Phase: 65-clerk-organizations-token-exchange*
*Completed: 2026-03-17*
