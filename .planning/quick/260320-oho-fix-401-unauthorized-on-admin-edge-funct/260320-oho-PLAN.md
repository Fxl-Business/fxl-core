---
id: 260320-oho
title: Fix 401 Unauthorized on admin edge functions
mode: quick
status: complete
---

# Quick Task: Fix 401 Unauthorized on admin edge functions (admin-users, admin-tenants)

## Task 1: Diagnose and fix 401 errors

**files:** supabase/functions/admin-users/index.ts, supabase/functions/admin-tenants/index.ts, scripts/check-edge-functions.ts
**action:** Investigate why admin edge functions return 401 despite valid Clerk JWT
**verify:** Admin dashboard loads tenants and users without 401 errors
**done:** Redeployed both functions with verify_jwt=false

### Root Cause

Both `admin-users` and `admin-tenants` were deployed with `verify_jwt: true` (Supabase default).
The Supabase gateway validates the Authorization header JWT against the Supabase JWT secret.
Since these functions receive a Clerk JWT (not a Supabase JWT), the gateway rejected them with 401
before the function code even ran.

The functions handle auth internally — they decode the Clerk JWT and check for the `super_admin` claim.
This requires `verify_jwt: false` so the gateway passes the request through.

### Fix Applied

- Redeployed `admin-users` with `verify_jwt: false` (v11 → v12)
- Redeployed `admin-tenants` with `verify_jwt: false` (v15 → v16)
- No code changes needed — infrastructure config only
