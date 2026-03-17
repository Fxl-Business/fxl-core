# Phase 88: Quality Gate & Security Audit - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning
**Mode:** auto (all decisions use recommended defaults)

<domain>
## Phase Boundary

Run a full TypeScript type-check pass (`npx tsc --noEmit`) and fix all errors found across the codebase. Audit every admin route (/admin/*) to verify it is wrapped in SuperAdminRoute or equivalent protection so non-super_admin users can never see admin UI.

This is a quality/audit phase, not a feature phase. No new features, no UI changes, no new routes. Only fix type errors and verify security gating.

</domain>

<decisions>
## Implementation Decisions

### TypeScript Error Resolution (GEN-01)
- [auto] Run `npx tsc --noEmit` and fix ALL errors -- zero errors is the acceptance criterion
- [auto] Never use `any` as a fix -- use proper types, generics, or type assertions with specific types
- [auto] If errors come from newly added Phase 85/86/87 code, fix them in place
- [auto] If errors come from older code, fix with minimal changes to avoid regressions
- [auto] Prioritize: type narrowing, proper interface definitions, missing imports -- never suppress errors

### Admin Route Security Audit (GEN-02)
- [auto] Verify that every route under /admin/* is wrapped in SuperAdminRoute at the router level (AppRouter.tsx)
- [auto] SuperAdminRoute checks: isSignedIn + user.publicMetadata.super_admin === true -- this pattern is already in place
- [auto] Verify no admin page component has a secondary route or export that could be rendered outside SuperAdminRoute
- [auto] Check that no admin page renders any content before the super_admin check completes (loading states must show generic loading, not admin UI)
- [auto] If any gap found: fix by wrapping in SuperAdminRoute or adding the check

### Fix Strategy
- [auto] Fix tsc errors first, then audit routes -- type errors may reveal security issues (e.g., missing type for auth check)
- [auto] Commit type fixes and security fixes separately for clear git history
- [auto] Run `npx tsc --noEmit` after every batch of fixes to verify progress toward zero errors

### Claude's Discretion
- Exact type solutions for each error (interface vs type alias, generic parameter choices)
- Whether to refactor adjacent code when fixing a type error if it improves clarity
- Order of error resolution (by file, by error type, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` -- GEN-01 (tsc zero errors) and GEN-02 (all admin pages super_admin only)

### Admin Route Architecture
- `src/platform/router/AppRouter.tsx` -- All route definitions. Admin routes at lines 73-89 wrapped in SuperAdminRoute. This is the primary audit target.
- `src/platform/auth/SuperAdminRoute.tsx` -- The guard component. Checks isSignedIn + publicMetadata.super_admin. Reference implementation for security.
- `src/platform/auth/ProtectedRoute.tsx` -- Standard auth guard for non-admin routes. Not the focus but relevant for understanding auth patterns.

### Admin Pages (audit targets)
- `src/platform/pages/admin/AdminDashboard.tsx` -- Main admin dashboard
- `src/platform/pages/admin/TenantsPage.tsx` -- Tenant list
- `src/platform/pages/admin/TenantDetailPage.tsx` -- Tenant detail view
- `src/platform/pages/admin/UsersPage.tsx` -- User list (added in Phase 87)
- `src/platform/pages/admin/ModulesPanel.tsx` -- Module management
- `src/platform/pages/admin/ConnectorsPanel.tsx` -- Connector management
- `src/platform/pages/admin/SettingsPanel.tsx` -- Admin settings
- `src/platform/pages/admin/ProductDocsPage.tsx` -- Product docs management

### Design Spec
- `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` -- Overall v4.3 design spec with admin architecture decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SuperAdminRoute` component: already wraps all /admin/* routes at the router level in AppRouter.tsx
- `ProtectedRoute` component: standard auth guard pattern, not used for admin routes
- `AuthOnlyRoute` inline function: thin auth-only guard in AppRouter.tsx for pre-org routes

### Established Patterns
- Admin routes use a nested Route structure: outer Route has SuperAdminRoute + AdminLayout, inner Routes are individual pages
- All admin pages are lazy-loaded with Suspense fallbacks
- SuperAdminRoute loading state shows generic "Carregando..." text, not admin content
- Auth checks use Clerk hooks: useAuth (isSignedIn, isLoaded), useUser (publicMetadata)

### Integration Points
- AppRouter.tsx lines 73-89: single SuperAdminRoute wrapper for all admin routes -- this is the security perimeter
- AdminLayout provides the admin sidebar/nav -- it only renders inside SuperAdminRoute
- TopNav.tsx shows admin link conditionally based on isSuperAdmin -- this is UI convenience, not security

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- this is a binary pass/fail audit phase. Zero tsc errors + all admin routes gated = done.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope.

</deferred>

---

*Phase: 88-quality-gate-security-audit*
*Context gathered: 2026-03-17*
