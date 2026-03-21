# Quick Task 260320-oho: Summary

## What was done

Fixed 401 Unauthorized errors on `admin-users` and `admin-tenants` Supabase Edge Functions.

## Root Cause

Both functions were deployed with `verify_jwt: true` (Supabase default). The Supabase gateway
rejected the Clerk JWT in the Authorization header because it's not signed with the Supabase
JWT secret. These functions handle auth internally (decode Clerk JWT, check `super_admin` claim),
so they require `verify_jwt: false`.

This was already documented as a requirement in `scripts/check-edge-functions.ts:34-37`.

## Changes

- **admin-users**: Redeployed v11 → v12 with `verify_jwt: false`
- **admin-tenants**: Redeployed v15 → v16 with `verify_jwt: false`
- No code changes — deployment configuration fix only

## Verification

Both functions now show `verify_jwt: false` in the Supabase deployment API.
Admin dashboard should load tenants and users without 401 errors.
