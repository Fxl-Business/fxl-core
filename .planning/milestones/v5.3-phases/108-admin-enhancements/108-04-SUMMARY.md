---
plan: 108-04
title: TenantDetailPage — Member Management UI + Impersonation Button
status: complete
---

## What was built

Full rewrite of `src/platform/pages/admin/TenantDetailPage.tsx`:

**Add member:**
- Form above members list with `placeholder="user_..."` input
- `user_` prefix validation with inline error message
- Calls `addOrgMember()` then reloads members list

**Remove member (2-click confirm):**
- Trash2 icon on each member row, visible on `group-hover`
- Click toggles row into confirm state: "Confirmar?" button + ✕ cancel
- Confirm calls `removeOrgMember()` then reloads members list
- Per-row loading state via `Map<string, boolean>`

**Impersonation:**
- "Entrar como esta org" button in page header (Eye icon)
- Disabled when already impersonating same org
- Calls `enterImpersonation(orgId, orgName)` from `useImpersonation()`

**Architecture:**
- Standalone `loadMembers(cancelled?)` function used by `useEffect` and all mutations
- `useImpersonation()` hook wired for state and action access

## Commits

- `app(108-04): add member management UI and impersonation button to TenantDetailPage`
