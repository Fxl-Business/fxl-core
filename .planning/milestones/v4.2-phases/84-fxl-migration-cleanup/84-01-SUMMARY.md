---
phase: 84-fxl-migration-cleanup
plan: 01
subsystem: auth
tags: [rls, supabase, clerk, migration, cleanup, auth-config]
requirements-completed: [ONB-04, ONB-05, ONB-06, ONB-07]

# Dependency graph
requires:
  - phase: 83-onboarding-flow
    provides: CriarEmpresa page and org routing gates
provides:
  - Strict RLS policies for all 8 tables (no COALESCE anon fallback)
  - Parameterized data migration script (014) to move org_fxl_default to real Clerk org
  - Single-mode Supabase client (no anonClient/orgClient branch)
  - Complete removal of isOrgMode, VITE_AUTH_MODE, AnonModuleEnabledProvider from codebase
affects: [all future phases — no anon compatibility layer remains]

# Tech tracking
tech-stack:
  - supabase-rls
  - clerk-organizations
  - react
  - typescript

# Decisions
decisions:
  - Migration numbers shifted: 013 for RLS hardening (plan said 012, but 012 was scope backfill from phase 82), 014 for data migration
  - auth-config.ts deleted entirely; 8 source files cleaned of conditional auth logic
  - supabase.ts simplified to single orgClient (anonClient removed)
  - AnonModuleEnabledProvider removed; ModuleEnabledProvider always renders OrgModuleEnabledProvider
  - Migration 014 (data migration) is MANUAL — requires SET app.new_org_id before running
  - vite-env.d.ts cleaned of VITE_AUTH_MODE declaration

# What was built
## Migration 013: RLS Hardening
- Drops all existing org_access policies (7 tables from 009 + 4 document policies from 011)
- Recreates with strict pattern: `(jwt_org_id) = org_id` instead of `COALESCE(jwt_org_id, org_id)`
- Super admin bypass preserved on all policies
- Documents SELECT keeps `scope = 'product'` global read rule

## Migration 014: FXL Data Migration (MANUAL)
- Parameterized DO $$ block requiring `SET app.new_org_id = 'org_XXXX'`
- Updates all 8 tables from org_fxl_default to real Clerk org_id
- Safety guard: raises exception if app.new_org_id is not set

## Code Cleanup
- Deleted: src/platform/auth/auth-config.ts
- Cleaned: ProtectedRoute.tsx, useActiveOrg.ts, OrgPicker.tsx, token-exchange.ts, Home.tsx, CriarEmpresa.tsx, supabase.ts, useModuleEnabled.tsx
- Cleaned: vite-env.d.ts (removed VITE_AUTH_MODE declaration)

# Verification
- npx tsc --noEmit: zero errors
- grep for isOrgMode/VITE_AUTH_MODE/AnonModuleEnabledProvider/auth-config in src/: zero results
- auth-config.ts: file does not exist

# Pending
_(none — migration 014 executed manually and verified in production database 2026-03-17)_
---
