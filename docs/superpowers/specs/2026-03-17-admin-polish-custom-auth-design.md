# Admin Polish & Custom Auth — Design Spec

**Date:** 2026-03-17
**Author:** Cauet + Claude
**Status:** Approved
**Scope:** Bug fixes in auth flow and admin metrics, custom login page, users management

---

## 1. Context

After completing v4.2 (Docs do Sistema + Tenant Onboarding), several issues were identified
in the running application:

- Organizations display "0 membros" despite Clerk showing correct member counts
- Admin dashboard shows incorrect tenant and user counts
- Logging out causes infinite loading instead of redirecting to login
- Login page uses Clerk's default `<SignIn>` component instead of matching Nexo's design
- No way to see all users across the platform
- Tenant detail page doesn't show the org's members

## 2. Decisions Made

| Decision | Value |
|----------|-------|
| Login approach | Custom UI with `useSignIn` hooks (not Clerk Appearance API) |
| Auth methods | Google OAuth + email/password (existing) |
| Login visual | Follow Nexo design system (Inter, indigo/slate, clean layout) |
| Users data source | Clerk Users API proxied via new edge function |
| Members per tenant | Clerk Org Members API proxied via expanded admin-tenants edge function |
| Dashboard metrics source | Edge function admin-tenants (not useOrganizationList) |

## 3. Root Cause Analysis

### Bug: 0 members on all organizations
**File:** `supabase/functions/admin-tenants/index.ts` line 97
**Cause:** `GET /v1/organizations` called without `include_members_count=true` query param.
Clerk does not return `members_count` by default; the field is omitted and fallback `?? 0` kicks in.
**Fix:** Add `include_members_count=true` to the query string.

### Bug: Dashboard shows 1 tenant / wrong user count
**File:** `src/platform/pages/admin/AdminDashboard.tsx` lines 56-66
**Cause:** Uses `useOrganizationList({ userMemberships: { infinite: true } })` which only returns
orgs the current user belongs to. If super admin is member of 1 org, shows 1.
User count is sum of `membersCount` across those orgs (also wrong due to bug above).
**Fix:** Fetch metrics from `admin-tenants` edge function (lists ALL Clerk orgs).

### Bug: Infinite loading after logout
**File:** `src/platform/auth/ProtectedRoute.tsx` lines 20-31
**Cause:** `useOrganizationList` is called unconditionally at component top level.
When user is not signed in, the hook never resolves `orgsLoaded`.
The guard `!isLoaded || !orgsLoaded` stays true forever, showing "Carregando..." infinitely.
**Fix:** Check `isSignedIn` before waiting for `orgsLoaded`.

## 4. Architecture

### Track AUTH — Login & Auth Flow

#### Custom Login Page

Replace Clerk's `<SignIn>` with custom UI using `useSignIn` hook:

```
┌─────────────────────────────────────────┐
│              min-h-screen               │
│         bg-slate-50 / dark:bg           │
│                                         │
│            ┌───────────┐                │
│            │   Nexo    │                │
│            │ subtitle  │                │
│            └───────────┘                │
│                                         │
│     ┌──────────────────────────┐        │
│     │  ┌────────────────────┐  │        │
│     │  │ Entrar com Google  │  │        │
│     │  └────────────────────┘  │        │
│     │                          │        │
│     │  ──── ou ────            │        │
│     │                          │        │
│     │  Email: [____________]   │        │
│     │  Senha: [____________]   │        │
│     │                          │        │
│     │  [    Entrar    ]        │        │
│     │                          │        │
│     │  Nao tem conta? Criar    │        │
│     └──────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

**Flow:**
1. User clicks "Entrar com Google" → `signIn.authenticateWithRedirect({ strategy: 'oauth_google' })`
2. OR fills email + password → `signIn.create({ identifier, password })` → handle MFA if needed
3. On success → `setActive({ session })` → redirect to `/`

#### ProtectedRoute Fix

```typescript
// Current (broken):
if (!isLoaded || !orgsLoaded) return loading  // orgsLoaded never resolves when signed out
if (!isSignedIn) return redirect

// Fixed:
if (!isLoaded) return loading
if (!isSignedIn) return redirect
if (!orgsLoaded) return loading  // only reached when signed in
```

### Track ADMIN — Dashboard & Users

#### Edge Function Changes

**admin-tenants (modified):**
- List endpoint: add `include_members_count=true` to Clerk API query
- New endpoint: `GET /admin-tenants/:orgId/members` → proxy `GET /v1/organizations/:orgId/members`

**admin-users (new):**
- `GET /admin-users` → proxy `GET /v1/users` with pagination
- `GET /admin-users/:userId` → proxy `GET /v1/users/:userId` (future use)
- Auth: same pattern as admin-tenants (super_admin JWT claim required)

Response shape:
```typescript
// List
{ users: User[], totalCount: number }

// User
{
  id: string
  firstName: string | null
  lastName: string | null
  email: string           // primary email
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
  organizationMemberships: { orgId: string; orgName: string; role: string }[]
}
```

#### AdminDashboard Refactor

Replace `useOrganizationList` with fetches to edge functions:
- Tenant count: from `admin-tenants` response `totalCount`
- User count: from `admin-users` response `totalCount`
- Avg modules/tenant: keep existing Supabase query (already correct)

#### UsersPage (new)

Route: `/admin/users`
Layout: same pattern as TenantsPage (header, stats bar, list)

Each row shows:
- Avatar
- Name (firstName + lastName)
- Primary email
- Org badges (org names the user belongs to)
- Last sign-in date

Clickable rows → future detail page (not in this milestone).

#### TenantDetailPage — Members Section

Add a "Membros" section below the info cards:
- Fetch members from `GET /admin-tenants/:orgId/members`
- Show list: avatar, name, email, role badge (admin/member)
- No edit/remove in this milestone (read-only)

## 5. Tracks & Phases

Two independent tracks that can be parallelized:

### Track AUTH (login + auth guards)
- **Phase A: Auth Flow Fixes** — Fix ProtectedRoute + custom login page with Google OAuth

### Track ADMIN (dashboard + users)
- **Phase B: Admin Data Fixes** — Fix member count in edge function + dashboard metrics
- **Phase C: Users Management** — New admin-users edge function + UsersPage + members in TenantDetail

Dependency: Phase C depends on Phase B (edge function patterns established in B, reused in C).
Tracks AUTH and ADMIN are independent.

## 6. Acceptance Criteria

### Auth Flow
- AUTH-01: Logged-out user accessing any protected route sees the login page (not infinite loading)
- AUTH-02: Login page shows "Nexo" branding with Google OAuth button and email/password form
- AUTH-03: Google OAuth login works end-to-end (click → Google → redirect → authenticated)
- AUTH-04: Email/password login works end-to-end
- AUTH-05: Login page follows Nexo design system (Inter font, indigo/slate palette, dark mode support)
- AUTH-06: "Nao tem conta?" link navigates to signup flow

### Admin Data
- ADM-01: TenantsPage shows correct member count per organization (matching Clerk dashboard)
- ADM-02: AdminDashboard "Tenants" metric shows total count of ALL Clerk organizations
- ADM-03: AdminDashboard "Usuarios" metric shows total count of ALL Clerk users
- ADM-04: Tenant detail page shows correct member count

### Users Management
- USR-01: `/admin/users` page lists all Clerk users with name, email, orgs, dates
- USR-02: Each user row shows which organizations they belong to
- USR-03: TenantDetailPage shows a "Membros" section listing org members with role badges
- USR-04: Users and members data is fetched via edge functions (not client-side Clerk hooks)

### General
- GEN-01: `npx tsc --noEmit` zero errors
- GEN-02: All admin pages accessible only to super_admin users

## 7. Out of Scope

| Feature | Reason |
|---------|--------|
| User CRUD (create/delete users) | Future — admin only views for now |
| Member add/remove from tenant | Future — managed via Clerk Dashboard |
| User detail page | Future — list view sufficient for v4.3 |
| Signup page redesign | Low priority — current wrapper is acceptable |
| Password reset flow | Handled by Clerk, no custom UI needed |
| MFA setup | Handled by Clerk account portal |
