---
phase: 86
plan: "86-02"
title: "Refactor AdminDashboard to use edge function data"
status: complete
started: 2026-03-17
completed: 2026-03-17
commit: "1174b42"
---

# Plan 86-02 Summary: Refactor AdminDashboard to use edge function data

## What was done

1. **admin.ts types**: Created `AdminUser` and `AdminUserListResponse` interfaces (plus `OrgMembership`, `OrgMember`, `OrgMemberListResponse` added in phase 87).
2. **admin-service.ts**: Created client-side service following the exact pattern of `tenant-service.ts` -- module-level token getter (`setAdminClerkTokenGetter`), `getAuthHeaders`, `listUsers` function calling the `admin-users` edge function.
3. **AdminDashboard.tsx**: Removed `useOrganizationList` from `@clerk/react`. Added `useSession`, imported `listTenants`/`setClerkTokenGetter` from tenant-service and `listUsers`/`setAdminClerkTokenGetter` from admin-service. Uses `useEffect` + `useState` fetch pattern with `Promise.all([listTenants(), listUsers()])` for parallel data loading.

## Key Files

### Created
- `src/platform/types/admin.ts` -- AdminUser, AdminUserListResponse interfaces
- `src/platform/services/admin-service.ts` -- Client-side admin user service

### Modified
- `src/platform/pages/admin/AdminDashboard.tsx` -- Replaced Clerk hooks with edge function calls

## Verification

- `useOrganizationList` not present in AdminDashboard.tsx -- PASS (HOOK REMOVED)
- `listTenants` and `listUsers` present in AdminDashboard.tsx -- PASS (SERVICES USED)
- `npx tsc --noEmit` -- zero errors

## Deviations

None. All three tasks were already implemented in prior sessions.
