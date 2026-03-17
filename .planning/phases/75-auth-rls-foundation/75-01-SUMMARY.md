---
phase: 75-auth-rls-foundation
plan: "01"
subsystem: auth
tags: [auth, rls, super-admin, clerk, supabase, route-guard]
dependency_graph:
  requires: []
  provides: [SuperAdminRoute, super_admin_rls_bypass]
  affects: [src/platform/router/AppRouter.tsx, supabase/migrations/]
tech_stack:
  added: []
  patterns: [clerk-publicMetadata-check, jwt-rls-bypass, route-guard-composition]
key_files:
  created:
    - src/platform/auth/SuperAdminRoute.tsx
    - supabase/migrations/009_super_admin_rls.sql
  modified:
    - src/platform/router/AppRouter.tsx
decisions:
  - "SuperAdminRoute uses useUser() (not useAuth) because publicMetadata is only on the user object, not the auth session"
  - "Admin route group nests ProtectedRoute > SuperAdminRoute > Layout to ensure auth then role check before render"
  - "RLS bypass uses string comparison (= 'true') because JWT claims are always serialized as strings"
metrics:
  duration: "2m 6s"
  completed: "2026-03-17"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 1
---

# Phase 75 Plan 01: Auth & RLS Foundation Summary

**One-liner:** SuperAdminRoute guard via Clerk publicMetadata.super_admin + Supabase RLS bypass for all 8 tables using JWT super_admin claim.

## What Was Built

### SuperAdminRoute component (`src/platform/auth/SuperAdminRoute.tsx`)

Route guard following the same pattern as ProtectedRoute but checking the super_admin claim from Clerk's publicMetadata. Uses `useUser()` (not `useAuth()`) because publicMetadata is only exposed on the user object. Shows a loading state while Clerk initializes, redirects unauthenticated users to sign-in, and redirects non-super-admin users to home (`/`) with no content flash.

### AppRouter protection (`src/platform/router/AppRouter.tsx`)

The `/admin/modules` and `/admin/connectors` routes were moved from the operator-only Route group into a dedicated admin Route group. The new group composes guards as: `ProtectedRoute > SuperAdminRoute > Layout`, ensuring auth is verified first, then the super_admin role, before the Layout shell renders.

### Migration 009 (`supabase/migrations/009_super_admin_rls.sql`)

Drops all 8 `*_org_access` policies from migration 008 and replaces them with updated policies that include a super_admin JWT bypass check before the org_id filter. When the JWT contains `super_admin = 'true'`, the USING/WITH CHECK condition is satisfied for any row, enabling cross-org access. For all other users, the org_id filtering from migration 008 remains intact.

Tables covered: tenant_modules, comments, share_tokens, blueprint_configs, briefing_configs, knowledge_entries, tasks, documents.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create SuperAdminRoute component | c1535fb | src/platform/auth/SuperAdminRoute.tsx |
| 2 | Protect /admin/* routes with SuperAdminRoute | 3db9601 | src/platform/router/AppRouter.tsx |
| 3 | Migration 009 — super_admin RLS bypass | 234f26d | supabase/migrations/009_super_admin_rls.sql |

## Verification Results

- `npx tsc --noEmit` — PASS (zero errors)
- SuperAdminRoute imports `useUser` and checks `publicMetadata.super_admin === true` — PASS
- AppRouter has SuperAdminRoute wrapping admin routes — PASS
- Migration 009: 8 DROP POLICY, 8 CREATE POLICY, 25 super_admin references — PASS
- No /admin/* routes remain in the operator-only Route group — PASS

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/platform/auth/SuperAdminRoute.tsx` — FOUND
- `src/platform/router/AppRouter.tsx` — FOUND (modified)
- `supabase/migrations/009_super_admin_rls.sql` — FOUND
- Commit c1535fb — FOUND
- Commit 3db9601 — FOUND
- Commit 234f26d — FOUND
