# Phase 86: Admin Data Fixes - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the admin dashboard and tenant list to display accurate headcounts that match Clerk data. The current implementation uses client-side Clerk hooks (`useOrganizationList`) that only see orgs the current user belongs to, and the edge function omits `include_members_count=true` causing all member counts to be 0.

This is a pure data-fix phase: modify existing edge function, create a minimal new edge function for user counts, and refactor AdminDashboard to use edge function data instead of Clerk hooks. No new UI pages, no new visual components.

</domain>

<decisions>
## Implementation Decisions

### Edge Function: admin-tenants fix (ADM-01, ADM-04)
- [auto] Modify existing `admin-tenants` edge function — do NOT create a new function
- Add `include_members_count=true` query parameter to the Clerk API call in `handleListOrgs()`
- Current line: `${CLERK_API_BASE}/organizations?limit=100&order_by=-created_at`
- Fixed: `${CLERK_API_BASE}/organizations?limit=100&order_by=-created_at&include_members_count=true`
- The `handleGetOrg()` single-org endpoint already returns `members_count` from Clerk's org detail response, so ADM-04 (TenantDetailPage) should work once the list endpoint is fixed

### Edge Function: admin-users (new, minimal for ADM-03)
- [auto] Create a new `admin-users` edge function — follows same auth pattern as `admin-tenants`
- For Phase 86, only the list endpoint is needed (returns `totalCount` for the dashboard metric)
- Phase 87 will expand this function with full user data, org memberships, and detail endpoint
- Auth: Bearer token with `super_admin` JWT claim (same decode pattern as admin-tenants)
- Clerk API: `GET /v1/users?limit=100&order_by=-created_at`
- Response shape: `{ users: MinimalUser[], totalCount: number }`
- MinimalUser for Phase 86 can be lightweight (id, email, name) — Phase 87 adds full fields
- Deploy with `--no-verify-jwt` (same as admin-tenants — function handles auth itself)

### AdminDashboard refactor (ADM-02, ADM-03)
- [auto] Remove `useOrganizationList` hook entirely from AdminDashboard
- Tenant count: call `listTenants()` from existing `tenant-service.ts` — use `totalCount` from response
- User count: call a new function (e.g., `getUserCount()`) that hits the `admin-users` edge function
- The new user-related service function can live in a new `admin-service.ts` or extend `tenant-service.ts`
- Keep the existing Supabase `tenant_modules` query for avg modules/tenant (already correct per design spec)
- Register `setClerkTokenGetter` in AdminDashboard (same pattern as TenantsPage)

### Service layer approach
- [auto] Create a new `admin-service.ts` in `src/platform/services/` for the admin-users edge function calls
- Follows exact same pattern as `tenant-service.ts` (module-level token getter, `getAuthHeaders()`, fetch wrapper)
- This keeps tenant and user concerns separated, and Phase 87 extends `admin-service.ts` naturally

### Claude's Discretion
- Loading state UX during the transition from hooks to fetch calls (skeleton vs spinner)
- Error handling for edge function failures in AdminDashboard
- Whether to add a "Refresh" button on the AdminDashboard metrics
- Exact field selection for the minimal admin-users Phase 86 response

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec (primary source of truth)
- `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` — Root cause analysis (section 3), architecture decisions (section 4), acceptance criteria (section 6). Contains exact bug locations and fix descriptions.

### Requirements
- `.planning/REQUIREMENTS.md` — ADM-01 through ADM-04 definitions (lines 21-24)
- `.planning/ROADMAP.md` — Phase 86 success criteria (lines 63-71)

### Existing implementation (files to modify)
- `supabase/functions/admin-tenants/index.ts` — Edge function to fix (add `include_members_count=true` on line 97)
- `src/platform/pages/admin/AdminDashboard.tsx` — Remove `useOrganizationList`, replace with edge function calls
- `src/platform/services/tenant-service.ts` — Existing service pattern to follow for new admin-service
- `src/platform/types/tenant.ts` — Existing type pattern for Tenant/TenantDetail

### Edge function patterns
- `supabase/functions/auth-token-exchange/index.ts` — Reference for Deno edge function patterns (CORS, auth, jose)
- `supabase/functions/admin-tenants/index.ts` — Primary reference for Clerk API proxy pattern with JWT claim validation

### Admin pages (verify fixes)
- `src/platform/pages/admin/TenantsPage.tsx` — Consumes `listTenants()` — should show correct counts after edge function fix
- `src/platform/pages/admin/TenantDetailPage.tsx` — Consumes `getTenantDetail()` — verify member count matches

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tenant-service.ts`: Module-level `_clerkTokenGetter` pattern with `setClerkTokenGetter()` and `getAuthHeaders()` — exact pattern to replicate in new `admin-service.ts`
- `admin-tenants/index.ts`: Full Clerk API proxy pattern with JWT decode, super_admin enforcement, CORS, and `jsonOk`/`jsonError` helpers — copy for `admin-users`
- `MetricCard` component in AdminDashboard: Already supports `loading` prop — no UI changes needed
- `Tenant` and `TenantDetail` types: Pattern for creating `AdminUser` / `AdminUserListResponse` types

### Established Patterns
- Edge functions use `@ts-nocheck` comment (Deno runtime, not checked by project tsc)
- Edge functions import from Deno std library (`https://deno.land/std@0.177.0/http/server.ts`)
- CORS headers are defined as constant and spread into all responses
- JWT decoding is manual base64 (not jose library) in admin-tenants — simpler for non-JWKS verification
- Services use `VITE_SUPABASE_FUNCTIONS_URL` env var for edge function base URL
- Components register token getter via `useEffect` on session change

### Integration Points
- `AdminDashboard` currently imports `useOrganizationList` from `@clerk/react` — this import gets removed
- `AdminDashboard` needs to import from `tenant-service.ts` and new `admin-service.ts`
- New `admin-users` edge function needs to be deployed to Supabase (`supabase functions deploy admin-users --no-verify-jwt`)
- `CLERK_SECRET_KEY` env var already configured in Supabase for `admin-tenants` — shared by new function automatically
- Router already has `/admin/*` routes — no routing changes needed

</code_context>

<specifics>
## Specific Ideas

- The design spec (section 3) provides exact line numbers and root causes for each bug — follow those precisely
- admin-tenants fix is literally a one-line change: add `&include_members_count=true` to the query string
- AdminDashboard refactor should use `useEffect` + `useState` for fetching (same pattern as TenantsPage), not introduce React Query or other data fetching libraries
- The admin-users edge function in Phase 86 should be intentionally minimal — Phase 87 (Admin Users Management) depends on it and will add full user data, org memberships, and the UsersPage

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 86-admin-data-fixes*
*Context gathered: 2026-03-17*
