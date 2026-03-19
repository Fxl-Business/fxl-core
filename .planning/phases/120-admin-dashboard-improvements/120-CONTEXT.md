# Phase 120: Admin Dashboard Improvements - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Add two new metric cards to the admin dashboard: unaffiliated user count and archived tenant count. Each card links directly to the relevant filtered view (UsersPage with unaffiliated filter, TenantsPage with archived tab).

</domain>

<decisions>
## Implementation Decisions

### Data sourcing
- Unaffiliated user count derives from the existing `listUsers()` call — filter client-side by `organizationMemberships.length === 0`, same as UsersPage does
- Archived tenant count uses a separate `listTenants('archived')` call — the service already supports the status parameter
- Both counts use the SAME data sources as their respective pages (critical per CLAUDE.md: "Nunca exibir card de contagem e lista dos mesmos dados com fontes diferentes")
- Use `Promise.allSettled` for all fetches (never `Promise.all`)

### Grid layout
- Change metrics grid from `sm:grid-cols-3` to `sm:grid-cols-2 lg:grid-cols-3` so 5 cards wrap naturally (3+2 on large screens, 2+2+1 on medium, stacked on mobile)
- New cards go after the existing 3 cards

### Card visual differentiation
- Unaffiliated users card uses amber/orange icon background (`bg-amber-50 text-amber-600` / dark: `bg-amber-950/50 text-amber-400`) to signal items needing attention
- Archived tenants card uses amber/orange icon background (same palette) to signal items needing attention
- Existing cards (Tenants, Usuarios, Media modulos) keep their indigo styling

### Navigation targets
- Unaffiliated users card links to `/admin/users?filter=unaffiliated` — UsersPage must read this query param to pre-select the filter
- Archived tenants card links to `/admin/tenants?tab=archived` — TenantsPage must read this query param to pre-select the tab
- Both pages need minor updates to respect URL query params for initial state

### Claude's Discretion
- Icon choice for the two new cards (e.g., UserX for unaffiliated, Archive for archived)
- Whether to add the new cards to the "Acesso Rapido" quick links section as well
- Loading skeleton details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin dashboard
- `src/platform/pages/admin/AdminDashboard.tsx` — Current dashboard with MetricCard component, existing data fetching pattern
- `.planning/REQUIREMENTS.md` — DASH-01, DASH-02, DASH-03 requirements

### Data sources (must match these pages)
- `src/platform/pages/admin/UsersPage.tsx` — Unaffiliated filter logic (`organizationMemberships.length === 0`), filter state management
- `src/platform/pages/admin/TenantsPage.tsx` — Archived tab logic, `listTenants('archived')` usage

### Services
- `src/platform/services/admin-service.ts` — `listUsers()` returns `AdminUserListResponse` with users array
- `src/platform/services/tenant-service.ts` — `listTenants('archived')` returns `TenantListResponse` with totalCount
- `src/platform/types/admin.ts` — AdminUser type with `organizationMemberships` array

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MetricCard` component (internal to AdminDashboard.tsx): Already supports `label`, `value`, `icon`, `href`, `loading` — can be extended with optional icon color props or used as-is with wrapper styling
- `listUsers()` from admin-service: Returns `{ users: AdminUser[], totalCount }` — unaffiliated count = `users.filter(u => u.organizationMemberships.length === 0).length`
- `listTenants('archived')` from tenant-service: Returns `{ tenants: Tenant[], totalCount }` — archived count = `totalCount`

### Established Patterns
- Dashboard uses `Promise.allSettled` for parallel fetches with independent error handling per result
- Token getters registered via `useEffect` on session change
- `cancelled` flag pattern for cleanup in async effects

### Integration Points
- AdminDashboard.tsx is the only file that needs new metric cards
- UsersPage.tsx needs to read `?filter=` query param for initial filter state
- TenantsPage.tsx needs to read `?tab=` query param for initial tab state

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The implementation is straightforward: add two cards and wire up query param navigation.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 120-admin-dashboard-improvements*
*Context gathered: 2026-03-18*
