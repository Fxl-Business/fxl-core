---
plan: 108-02
title: Types + Service Layer
status: complete
---

## What was built

Extended `src/platform/types/admin.ts` with three new interfaces:
- `AddMemberResponse` — `{ userId, role, joinedAt }`
- `RemoveMemberResponse` — `{ removed, userId }`
- `ImpersonationTokenResponse` — `{ access_token, expires_in, org_id, is_impersonation }`

Extended `src/platform/services/admin-service.ts` with three new exported functions:
- `addOrgMember(orgId, userId)` — POST to `?action=add-member`
- `removeOrgMember(orgId, userId)` — DELETE to `?action=remove-member`
- `getImpersonationToken(orgId)` — POST to `?action=impersonate-token`

All functions follow the existing `getAuthHeaders()` pattern. Zero TypeScript errors.

## Commits

- `app(108-02): add member management and impersonation types and service functions`
