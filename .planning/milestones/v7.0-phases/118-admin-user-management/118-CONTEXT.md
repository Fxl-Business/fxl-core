# Phase 118: Admin User Management - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can identify all unaffiliated users (zero org memberships) at a glance and link them to organizations without leaving the admin users panel. Additionally, the TenantDetailPage member-add flow is upgraded from raw userId input to a searchable user picker. Requirements: ADM-01, ADM-02, ADM-03, ADM-04.

</domain>

<decisions>
## Implementation Decisions

### Filter/Tab UX (ADM-01, ADM-02)
- Segmented control with three options: "Todos", "Sem org", "Com org"
- Each segment shows a count badge (e.g., "Todos (12)", "Sem org (3)", "Com org (9)")
- Placed below page header, above the user list
- Default selection on page load: "Todos" (shows all users)
- Filtering is client-side — the existing `listUsers()` response already includes `organizationMemberships` per user

### Org Assignment from Users List (ADM-03)
- Each unaffiliated user row shows an action button (e.g., "Vincular" with Link icon)
- Button only appears on rows where `organizationMemberships.length === 0`
- Clicking opens a Dialog with a Select dropdown listing all organizations
- Org list fetched from `admin-tenants` edge function (via existing `tenant-service.listTenants`)
- After successful assignment: close dialog, refresh user list, show toast via Sonner
- Uses existing `addOrgMember()` from `admin-service.ts` — no new API needed

### User Search in TenantDetailPage (ADM-04)
- Replace the raw `user_...` text input with a Combobox/autocomplete component
- Search scope: only unaffiliated users (those with zero org memberships)
- Data source: call `listUsers()` once, filter client-side by name/email
- Instant client-side filtering (no debounce needed — user count is small)
- Selected user shows avatar + full name + email for identity confirmation
- Uses existing Popover + Command components from shadcn/ui for combobox pattern
- After selection, same `addOrgMember()` flow as current implementation

### Claude's Discretion
- Exact segmented control styling (can use existing button group pattern or custom)
- Dialog layout details for org assignment
- Combobox dropdown height and empty state message
- Whether to show a success animation or just a toast

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin infrastructure
- `.planning/REQUIREMENTS.md` — ADM-01 through ADM-04 acceptance criteria
- `.planning/phases/117-access-control-lockdown/117-CONTEXT.md` — Prior phase decisions (SolicitarAcesso, no form submission, admin manual check)

### Existing admin pages (modify)
- `src/platform/pages/admin/UsersPage.tsx` — Current users list, needs filter/tab + action button
- `src/platform/pages/admin/TenantDetailPage.tsx` — Current member management, needs user search combobox (lines 313-335)

### Services and types (reuse)
- `src/platform/services/admin-service.ts` — `listUsers()`, `addOrgMember()` already implemented
- `src/platform/types/admin.ts` — `AdminUser`, `AdminUserListResponse`, `AddMemberResponse` types
- `src/platform/services/tenant-service.ts` — `listTenants()` for org picker dropdown

### Edge functions (no changes needed)
- `supabase/functions/admin-users/index.ts` — Returns users with org memberships, client-side filtering sufficient
- `supabase/functions/admin-tenants/index.ts` — Supports `add-member` action, already used by `addOrgMember()`

### UI components (reuse)
- `src/shared/ui/dialog.tsx` — For org assignment dialog
- `src/shared/ui/select.tsx` — For org picker dropdown
- `src/shared/ui/command.tsx` — For combobox search pattern in TenantDetailPage
- `src/shared/ui/popover.tsx` — For combobox popover container
- `src/shared/ui/sonner.tsx` — For toast notifications

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `listUsers()` in admin-service.ts: Returns all users with `organizationMemberships[]` — sufficient for client-side filtering
- `addOrgMember(orgId, userId)` in admin-service.ts: Already handles the Clerk API call via edge function
- `listTenants()` in tenant-service.ts: Returns all organizations — needed for org picker in assignment dialog
- Dialog, Select, Command, Popover components from shadcn/ui: All installed and available
- Sonner toast: Already configured for notifications

### Established Patterns
- Admin pages use `useSession()` + `setAdminClerkTokenGetter()` pattern for auth
- User list rows use avatar + name/email + badges layout (UsersPage.tsx)
- TenantDetailPage already has add/remove member flows with loading/error states
- Admin service uses module-level token getter pattern (not hooks)
- Edge functions use Promise.all for parallel Clerk API calls (note: PITFALLS.md says use Promise.allSettled for client code)

### Integration Points
- `UsersPage.tsx` — Add segmented filter control and action button per row
- `TenantDetailPage.tsx` — Replace lines 313-335 (raw input form) with combobox
- No new routes needed — both pages already exist at `/admin/users` and `/admin/tenants/:orgId`
- No edge function changes — client-side filtering of existing data
- No new Supabase migrations — all data comes from Clerk API

</code_context>

<specifics>
## Specific Ideas

- The "Sem org" badge already exists on user rows (line 138-141 of UsersPage.tsx) — the filter should complement this visual indicator
- TenantDetailPage currently requires typing `user_...` IDs manually — the combobox is a significant UX improvement
- All text in Portuguese: "Vincular", "Todos", "Sem org", "Com org", "Buscar usuario..."

</specifics>

<deferred>
## Deferred Ideas

- Email invitation system for new users (INV-01, INV-02 in REQUIREMENTS.md — future milestone)
- Access request form on `/solicitar-acesso` (REQ-01 through REQ-03 — future milestone)
- Bulk org assignment for multiple unaffiliated users at once (potential future enhancement)

</deferred>

---

*Phase: 118-admin-user-management*
*Context gathered: 2026-03-18*
