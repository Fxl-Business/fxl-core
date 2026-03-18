# v7.0 — Admin-Only Org Management

## Problem

Currently any user who signs up can create their own organization via `/criar-empresa` (Clerk client-side `createOrganization()`). This was acceptable during early development but now needs to be locked down: only the FXL super admin should be able to create organizations. Users who sign up without being linked to an org should see a "request access" screen instead of being able to self-provision.

Additionally, there's no safe deletion flow for tenants — they can only be created, not archived/removed.

## Goals

1. **Admin-only org creation** — remove self-service `/criar-empresa`, only super admin creates orgs via admin panel
2. **Unaffiliated user experience** — users without an org see a clear "request access" screen
3. **Admin user-org management** — improve existing admin UI for linking/unlinking users to orgs
4. **Safe tenant deletion** — archive pattern (soft-delete) with data preservation, not hard delete
5. **Admin user management** — ability to view unaffiliated users and manage them

## Non-Goals

- User self-service org creation behind a feature flag (removed entirely)
- Invitation system / email invites (future milestone)
- Approval workflow for access requests (manual process via admin panel for now)

---

## Architecture

### Phase 1: Remove Self-Service & Add "Request Access" Screen

**Changes:**
- Remove `/criar-empresa` route and `CriarEmpresa.tsx` page
- Modify `ProtectedRoute.tsx`: instead of redirecting to `/criar-empresa` when user has no org, redirect to `/solicitar-acesso`
- New page `SolicitarAcesso.tsx` at `/solicitar-acesso`:
  - Clean, branded screen with FXL/Nexo logo
  - Message: "Sua conta foi criada com sucesso. Para acessar a plataforma, solicite acesso a uma organização."
  - Contact info or instruction to reach the admin
  - Sign out button
  - No form submission (manual process for now — admin checks unaffiliated users in admin panel)

### Phase 2: Admin Panel — Unaffiliated Users & Org Linking

**Changes:**
- Enhance `UsersPage.tsx` to show a filter/tab for "unaffiliated users" (users with 0 org memberships)
- Add quick action to link an unaffiliated user to an org directly from the users list
- Add badge/indicator showing user status: "active" (has org), "pending" (no org)
- Enhance `TenantDetailPage.tsx` with a "Add member" flow that can search existing unaffiliated users

**Edge function changes:**
- `admin-users`: add query param `?filter=unaffiliated` to return only users with 0 memberships
- `admin-tenants`: existing `add-member` action already works, just needs UI improvement

### Phase 3: Safe Tenant Deletion (Archive Pattern)

**Strategy:** Soft-delete via Supabase `archived_at` column + Clerk org metadata flag.

**Database changes:**
- Add `archived_at TIMESTAMPTZ` and `archived_by TEXT` columns to all org-scoped tables that matter:
  - `clients`, `projects`, `briefing_configs`, `blueprint_configs`, `documents` (tenant-scoped), `comments`, `share_tokens`
- New migration: add columns + index on `archived_at`
- Update RLS policies: add `AND archived_at IS NULL` to SELECT policies (archived data hidden from normal users but visible to super admin)

**Clerk org archival:**
- Set `publicMetadata.archived = true` + `publicMetadata.archived_at = ISO date` on the Clerk org
- Edge function `admin-tenants`: add `?action=archive` endpoint that:
  1. Sets Clerk org metadata to archived
  2. Runs Supabase query to set `archived_at` on all org-scoped rows
  3. Removes all org memberships (users become unaffiliated)
- Edge function `admin-tenants`: add `?action=restore` endpoint for reversibility

**Admin UI:**
- Add "Archive" button to `TenantDetailPage.tsx` with confirmation dialog
- Show archived tenants in a separate tab on `TenantsPage.tsx` with "Restore" option
- Archived tenants shown with visual indicator (grayed out, badge)

### Phase 4: Admin Dashboard Improvements

**Changes:**
- Dashboard stats: add "unaffiliated users" count card
- Dashboard stats: add "archived tenants" count card
- Quick actions section: "View unaffiliated users", "View archived tenants"

---

## Data Flow

```
User signs up (Clerk)
  → Has org membership?
    → YES → Normal app flow
    → NO → /solicitar-acesso (request access screen)

Admin creates org (admin panel)
  → POST /admin-tenants → Clerk creates org
  → Admin links user to org → POST /admin-tenants?action=add-member
  → User refreshes → now has org → normal app flow

Admin archives tenant
  → POST /admin-tenants?action=archive
  → Clerk org metadata: archived=true
  → Supabase: archived_at=NOW() on all org rows
  → Members removed → become unaffiliated
  → Data preserved, hidden from normal queries
```

## Security Considerations

- All admin operations require `super_admin: true` JWT claim (already enforced)
- Archive is soft-delete — data preserved for compliance/recovery
- Removing self-service eliminates unauthorized org creation
- Unaffiliated users have zero data access (no org_id in JWT = no RLS match)

## Success Criteria

- [ ] `/criar-empresa` removed, no client-side org creation possible
- [ ] Users without org see `/solicitar-acesso` screen
- [ ] Admin can view unaffiliated users in admin panel
- [ ] Admin can link users to orgs from admin panel
- [ ] Admin can archive tenants (soft-delete with data preservation)
- [ ] Admin can restore archived tenants
- [ ] Archived tenant data hidden from normal queries but preserved
- [ ] Dashboard shows unaffiliated users and archived tenant counts
- [ ] All operations require super_admin auth
