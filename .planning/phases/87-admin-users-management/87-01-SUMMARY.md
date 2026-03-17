# Plan 87-01 Summary: Edge Functions + Types + Service Layer

**Status:** Complete
**Duration:** Single session

## What was built

Expanded the backend data layer for admin users management:

1. **Admin types** (`src/platform/types/admin.ts`): Added `OrgMembership`, `OrgMember`, `OrgMemberListResponse` types. Extended `AdminUser` with `organizationMemberships: OrgMembership[]`.

2. **admin-users edge function** (`supabase/functions/admin-users/index.ts`): Expanded user mapping to include `organizationMemberships` array from Clerk's `organization_memberships` response field.

3. **admin-tenants edge function** (`supabase/functions/admin-tenants/index.ts`): Added `GET /:orgId/members` route that proxies Clerk's `GET /v1/organizations/:orgId/memberships`. Uses `public_user_data` to avoid N+1 user lookups.

4. **admin-service** (`src/platform/services/admin-service.ts`): Added `listOrgMembers(orgId)` function and expanded type re-exports.

## Key files

### Created
- None (all modifications to existing files)

### Modified
- `src/platform/types/admin.ts`
- `supabase/functions/admin-users/index.ts`
- `supabase/functions/admin-tenants/index.ts`
- `src/platform/services/admin-service.ts`

## Self-Check: PASSED

- All types compile cleanly (`npx tsc --noEmit` zero errors)
- Edge functions follow established patterns (JWT auth, CORS, Clerk API proxy)
- Service follows existing `tenant-service.ts` pattern
