---
plan: 108-01
title: Edge Function — Member Management + Impersonation Token
status: complete
---

## What was built

Updated `supabase/functions/admin-tenants/index.ts` to support three new actions via query params:

- `?action=add-member` (POST) — adds a Clerk user to an org via Clerk API
- `?action=remove-member` (DELETE) — removes a Clerk user from an org via Clerk API
- `?action=impersonate-token` (POST) — mints a Supabase JWT with `org_id` and `is_impersonation: true` claims using `jose.SignJWT`

## Key decisions

- Action routing via `?action=` query params (never sub-paths — CLAUDE.md rule)
- Action routes checked before existing org_id path routing to avoid conflicts
- `SUPABASE_JWT_SECRET` read from env to mint impersonation tokens
- CORS updated to allow `GET, POST, DELETE, OPTIONS`
- Deployed as version 5, ACTIVE

## Commits

- `app(108-01): update admin-tenants edge fn with member management and impersonation token`
