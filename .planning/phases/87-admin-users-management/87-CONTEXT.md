# Phase 87: Admin Users Management - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Super admins can see a global list of all platform users and view which members belong to each tenant. This includes:
1. A new `/admin/users` page listing all Clerk users with name, email, organizations, and relevant dates
2. Each user entry shows which organizations (tenants) they belong to
3. The TenantDetailPage gets a "Membros" section listing all org members with their role badges (admin, member, etc.)
4. All user and member data is fetched via Supabase edge functions, not Clerk client-side hooks

This is a read-only management phase. No user CRUD, no member add/remove, no user detail page.

</domain>

<decisions>
## Implementation Decisions

### Edge Function: admin-users expansion (USR-01, USR-02, USR-04)
- [auto] Expand existing `admin-users` edge function (created in Phase 86) to include organization memberships per user
- Current edge function returns minimal user data — expand to include `organizationMemberships` array
- Clerk Users API already returns `organization_memberships` field when fetching users — map it to `{ orgId, orgName, role }[]`
- Keep the existing `GET /admin-users` list endpoint, enrich the response shape
- No need for a separate `GET /admin-users/:userId` detail endpoint in this phase (list view only per design spec)

### Edge Function: admin-tenants members endpoint (USR-03, USR-04)
- [auto] Add new route `GET /admin-tenants/:orgId/members` to existing `admin-tenants` edge function
- Proxies Clerk API `GET /v1/organizations/:orgId/memberships?limit=100`
- Response shape: `{ members: OrgMember[], totalCount: number }`
- OrgMember: `{ userId, firstName, lastName, email, imageUrl, role, joinedAt }`
- Requires fetching each member's user profile from Clerk to get name/email (Clerk memberships only return userId + role)
- Alternative: Use `GET /v1/organizations/:orgId/memberships?limit=100` which includes `public_user_data` (preferred — single API call)

### UsersPage layout (USR-01, USR-02)
- [auto] Follow same visual pattern as TenantsPage — header, stats bar, clickable list rows in rounded-xl card
- Each row shows: avatar, full name (firstName + lastName), primary email, org badges (pill badges with org names), last sign-in date
- Org badges use the same pill style as member count badges on TenantsPage (rounded-full, bg-slate-100, text-xs)
- Multiple orgs per user shown as horizontal pill list (most users will have 1-2 orgs)
- Stats bar shows total user count badge (same style as TenantsPage's "N organizacoes" badge)
- No search/filter in this phase — straight list (out of scope per REQUIREMENTS.md)

### TenantDetailPage members section (USR-03)
- [auto] Add a "Membros" section below the existing info cards grid, before the "Metadados" section
- Section header: "Membros" with uppercase tracking-wider style (matches existing section headers)
- Members list in a rounded-xl bordered card, same row pattern as TenantsPage list items
- Each member row: avatar, name, email, role badge (admin = indigo, member = slate)
- Role badge uses rounded-full pill style: `bg-indigo-50 text-indigo-700` for admin, `bg-slate-100 text-slate-600` for member
- Loading state: 3 skeleton rows (same pulse pattern as existing loading states)
- Empty state: "Nenhum membro encontrado" centered text

### Admin types expansion
- [auto] Expand `AdminUser` type in `src/platform/types/admin.ts` to include `organizationMemberships`
- New type `OrgMembership`: `{ orgId: string; orgName: string; role: string }`
- New type `OrgMember`: `{ userId: string; firstName: string | null; lastName: string | null; email: string; imageUrl: string; role: string; joinedAt: number }`
- New type `OrgMemberListResponse`: `{ members: OrgMember[]; totalCount: number }`

### Admin service expansion
- [auto] Add `listOrgMembers(orgId: string)` function to `admin-service.ts`
- Calls `GET /admin-tenants/:orgId/members` endpoint
- Follows exact same fetch + getAuthHeaders pattern as existing `listUsers()`
- Uses the same `_clerkTokenGetter` already set up in admin-service

### Router and sidebar updates
- [auto] Add `/admin/users` route to AppRouter.tsx (lazy loaded, inside SuperAdminRoute)
- Add "Users" nav item to AdminSidebar between "Dashboard" and "Tenants" (Users icon from lucide-react)
- Add "Usuarios" quick link card in AdminDashboard (alongside existing "Gerenciar Tenants" and "Modulos")
- Make the "Usuarios" MetricCard on AdminDashboard clickable (href="/admin/users")

### Claude's Discretion
- Loading skeleton exact design for UsersPage and members section
- Error state handling and retry button placement
- Exact spacing between org badges in user rows
- Whether to show "Criado em" or "Ultimo login" as the date column on UsersPage (design spec says both — Claude decides column priority)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec (primary source of truth)
- `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` — Section 4 "Track ADMIN" defines edge function changes, UsersPage layout, TenantDetailPage members section, and response shapes
- `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` §6 — Acceptance criteria USR-01 through USR-04

### Requirements
- `.planning/REQUIREMENTS.md` — USR-01 through USR-04 definitions (lines 28-31)
- `.planning/ROADMAP.md` — Phase 87 success criteria (lines 73-82)

### Phase 86 context (dependency — patterns to follow)
- `.planning/phases/86-admin-data-fixes/86-CONTEXT.md` — Edge function patterns, service layer approach, type patterns established in Phase 86

### Edge functions to modify
- `supabase/functions/admin-users/index.ts` — Expand with organization memberships in user data
- `supabase/functions/admin-tenants/index.ts` — Add `GET /:orgId/members` route for org member listing

### Frontend services to extend
- `src/platform/services/admin-service.ts` — Add `listOrgMembers()` function
- `src/platform/types/admin.ts` — Add `OrgMembership`, `OrgMember`, `OrgMemberListResponse` types

### Pages to create/modify
- `src/platform/pages/admin/TenantsPage.tsx` — Visual pattern reference for UsersPage (list layout, stats bar, row design)
- `src/platform/pages/admin/TenantDetailPage.tsx` — Add "Membros" section below info cards
- `src/platform/pages/admin/AdminDashboard.tsx` — Add "Usuarios" quick link, make user metric clickable

### Router and navigation
- `src/platform/router/AppRouter.tsx` — Add `/admin/users` route
- `src/platform/layout/AdminSidebar.tsx` — Add "Users" nav item

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TenantsPage.tsx`: Full list page pattern with header, stats bar, loading/error/empty states, clickable rows — exact template for UsersPage
- `TenantDetailPage.tsx`: Section pattern with InfoCard grid, section headers — extend with members section
- `admin-service.ts`: Module-level `_clerkTokenGetter` pattern with `setAdminClerkTokenGetter()` and `getAuthHeaders()` — add `listOrgMembers()` following same pattern
- `admin-tenants/index.ts`: Full Clerk API proxy with JWT decode, super_admin enforcement, URL path routing — add members endpoint following same routing pattern
- `admin-users/index.ts`: Minimal user listing — expand response shape to include org memberships
- `MetricCard` in AdminDashboard: Already supports `href` and `loading` props — just add href to Users card

### Established Patterns
- Edge functions use `@ts-nocheck` comment (Deno runtime)
- Edge functions use manual base64 JWT decode (not jose library)
- Services use `VITE_SUPABASE_FUNCTIONS_URL` env var
- Components register token getter via `useEffect` on session change
- List pages follow: header (h1 + description) → stats bar → loading/error/empty → list card with row buttons
- Section headers use `text-sm font-bold uppercase tracking-wider`
- Role/status badges use `rounded-full px-2.5 py-0.5 text-xs font-medium` pattern
- Dates formatted with `new Date(timestamp).toLocaleDateString('pt-BR')`

### Integration Points
- AppRouter.tsx: Add lazy import + Route inside SuperAdminRoute block (line ~80-86)
- AdminSidebar.tsx: Add nav item to `adminNavItems` array (line ~14-21)
- AdminDashboard.tsx: Add href to Users MetricCard + add quick link card
- No new Supabase migrations needed — all data comes from Clerk API
- Edge function deployment: `supabase functions deploy admin-users --no-verify-jwt` and `supabase functions deploy admin-tenants --no-verify-jwt`

</code_context>

<specifics>
## Specific Ideas

- UsersPage should visually mirror TenantsPage as closely as possible — same card structure, row layout, hover states
- Org badges on user rows should be clickable links to `/admin/tenants/:orgId` (easy cross-navigation between users and tenants)
- TenantDetailPage members section should look like a mini version of the tenants list rows — consistent visual language
- The admin-users edge function should fetch org memberships from Clerk's user response (Clerk includes `organization_memberships` array when listing users) — no need for separate API calls per user
- For the admin-tenants members endpoint, use Clerk's `GET /v1/organizations/:orgId/memberships` which includes `public_user_data` (name, email, image) — avoids N+1 user lookups

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 87-admin-users-management*
*Context gathered: 2026-03-17*
