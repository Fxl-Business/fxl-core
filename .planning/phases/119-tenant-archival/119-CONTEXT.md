# Phase 119: Tenant Archival - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can safely archive a tenant — hiding it from normal operation while preserving all data — and can restore it later. Archiving sets `archived_at` timestamps on all org-scoped Supabase data, flags the Clerk org metadata as archived, and removes all org memberships. Restoring reverses the soft-delete and clears the Clerk flag but does not auto-restore memberships.

</domain>

<decisions>
## Implementation Decisions

### Archive trigger UX
- Archive action lives on `TenantDetailPage` (not the list page) — consistent with existing member management pattern
- Archive button uses destructive styling (red) with a 2-click confirmation dialog (not inline confirm like member removal — archiving is higher stakes)
- Confirmation dialog shows tenant name and warns about member removal
- After successful archive, redirect to TenantsPage (archived tab)

### Data isolation strategy
- Add `archived_at TIMESTAMPTZ DEFAULT NULL` column to all 10 org-scoped tables: tenant_modules, comments, share_tokens, blueprint_configs, briefing_configs, knowledge_entries, tasks, documents, clients, projects
- Update all RLS policies (migration 013 pattern) to add `AND archived_at IS NULL` condition to the non-super-admin branch — super admins can still see archived data
- Single edge function action (`admin-tenants?action=archive`) handles the complete archive flow: (1) stamp `archived_at = NOW()` on all Supabase rows matching the org_id, (2) set Clerk org `publicMetadata.archived = true`, (3) remove all org memberships
- Edge function uses Supabase service role key to bypass RLS when stamping archived_at

### Clerk org lifecycle
- Never delete the Clerk org — only set `publicMetadata.archived = true`
- The org remains in Clerk's system for restore capability
- `handleListOrgs` in edge function filters by `publicMetadata.archived !== true` for active list, includes only `archived === true` for archived list

### Restore behavior
- Restore action (`admin-tenants?action=restore`) reverses the archive: (1) clear `archived_at` on all Supabase rows matching org_id, (2) remove `archived` from Clerk org publicMetadata, (3) does NOT auto-restore memberships
- Admin must manually re-add members after restore — safer default, avoids conflicts with users who joined other orgs
- Restore button appears on each row in the archived tenants tab

### Archived tenants visibility
- TenantsPage gets a tab bar: "Ativas" (default) / "Arquivadas" with count badges on each tab
- Both tabs reuse the same tenant row component but archived tab has muted styling + "Arquivado" badge + "Restaurar" button
- Active tab hides archived orgs; archived tab shows only archived orgs
- `listTenants` service function accepts an optional `archived` parameter to filter

### Claude's Discretion
- Exact tab bar styling and layout
- Loading skeleton for tab switching
- Whether to show archived_at date on archived tenant rows
- Error state handling for archive/restore failures
- Whether to add archived tenant count to AdminDashboard in this phase or defer to Phase 120

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Edge function (archive/restore actions)
- `supabase/functions/admin-tenants/index.ts` — Existing edge function to extend with `?action=archive` and `?action=restore` routes
- `supabase/migrations/013_remove_anon_fallback.sql` — Current RLS policy pattern (super_admin bypass OR org_id match) that needs `archived_at IS NULL` addition

### Admin UI (archive trigger + archived tab)
- `src/platform/pages/admin/TenantsPage.tsx` — List page to add tab bar (Active/Archived)
- `src/platform/pages/admin/TenantDetailPage.tsx` — Detail page to add archive button with confirmation
- `src/platform/services/tenant-service.ts` — Client service to add `archiveTenant()` and `restoreTenant()` functions
- `src/platform/types/tenant.ts` — Tenant type to extend with archived status

### Existing patterns (reusable)
- `src/modules/clients/components/ClientCard.tsx` — Has `archived` status styling (muted/grayed) to reference for visual consistency
- `src/platform/services/admin-service.ts` — Action-based service pattern (add-member, remove-member) to follow for archive/restore
- `supabase/migrations/017_data_recovery.sql` — Lists all 8 tables with org_id (add clients + projects = 10 total)

### Requirements
- `.planning/REQUIREMENTS.md` — ARC-01 through ARC-05 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `admin-tenants` edge function: Already has action-based routing (`?action=add-member`, `?action=remove-member`, `?action=impersonate-token`) — archive/restore follow the same pattern
- `tenant-service.ts` + `admin-service.ts`: Clerk token getter pattern, `getAuthHeaders()`, fetch wrapper pattern — reuse for new service functions
- `ClientCard.tsx` archived styling: `bg-slate-100 text-slate-600 ring-slate-500/20` — reference for visual consistency on archived tenant rows
- `removeOrgMember()` in admin-service: Already handles member removal — archive flow calls this per member

### Established Patterns
- Action-based edge function routing via `?action=` query params (not sub-paths — per PITFALLS.md)
- RLS pattern: `super_admin bypass OR org_id match` from migration 013 — extend with `AND archived_at IS NULL`
- 2-click confirmation for destructive actions (member removal pattern in TenantDetailPage)
- Clerk token getter registration on component mount

### Integration Points
- `admin-tenants` edge function: Add `handleArchiveTenant()` and `handleRestoreTenant()` handlers
- `TenantsPage.tsx`: Add tab bar and archived tenants fetching
- `TenantDetailPage.tsx`: Add archive button and confirmation dialog
- `tenant-service.ts`: Add `archiveTenant()` and `restoreTenant()` exports
- `tenant.ts` types: Add `archived` flag to Tenant type
- New Supabase migration (019): Add `archived_at` column to all org-scoped tables + update RLS policies
- `handleListOrgs`: Add query param support for filtering active vs archived orgs via Clerk metadata

</code_context>

<specifics>
## Specific Ideas

- The edge function needs Supabase service role access to UPDATE rows across all tables — use `SUPABASE_SERVICE_ROLE_KEY` env var (already available in Supabase Functions runtime)
- Archive flow must handle the case where some tables have 0 rows for the org — UPDATE with WHERE clause naturally handles this
- Use `Promise.allSettled` (never `Promise.all`) for parallel Supabase table updates during archive
- Clerk org metadata update uses `PATCH /v1/organizations/{org_id}` with `public_metadata: { archived: true }`
- For restore, use `PATCH` with `public_metadata: {}` to clear the archived flag (or explicitly set `archived: null`)

</specifics>

<deferred>
## Deferred Ideas

- Admin dashboard archived tenant count — Phase 120 (DASH-02)
- Tenant data export before archival — out of scope per REQUIREMENTS.md
- Automatic member notification on archive — future milestone
- Bulk archive/restore — future enhancement

</deferred>

---

*Phase: 119-tenant-archival*
*Context gathered: 2026-03-18*
