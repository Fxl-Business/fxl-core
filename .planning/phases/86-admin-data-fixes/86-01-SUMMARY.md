---
phase: 86
plan: "86-01"
title: "Fix edge functions for accurate Clerk data"
status: complete
started: 2026-03-17
completed: 2026-03-17
commit: "82847e6"
---

# Plan 86-01 Summary: Fix edge functions for accurate Clerk data

## What was done

1. **admin-tenants**: `include_members_count=true` was already present in the Clerk API query at `handleListOrgs()`, ensuring accurate member counts per organization.
2. **admin-users**: Created new Supabase Edge Function that proxies the Clerk Users API with the same auth/CORS pattern as admin-tenants (manual JWT base64 decode, `super_admin` claim check, `corsHeaders`, `jsonOk`/`jsonError` helpers, `@ts-nocheck`, Deno imports).

## Key Files

### Created
- `supabase/functions/admin-users/index.ts` -- New edge function proxying Clerk Users API

### Verified
- `supabase/functions/admin-tenants/index.ts` -- `include_members_count=true` present in Clerk API query

## Verification

- `grep "include_members_count=true" supabase/functions/admin-tenants/index.ts` -- PASS
- `admin-users/index.ts` contains `handleListUsers`, `super_admin` check -- PASS
- `npx tsc --noEmit` -- zero errors

## Deviations

None. Both tasks were already implemented in prior sessions.
