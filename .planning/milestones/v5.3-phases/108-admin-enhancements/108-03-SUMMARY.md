---
plan: 108-03
title: ImpersonationContext + ImpersonationBanner + Layout Wiring
status: complete
---

## What was built

**`src/platform/auth/ImpersonationContext.tsx`** — Full context provider:
- `ImpersonationProvider` wraps app, exposes `useImpersonation()` hook
- `enterImpersonation(orgId, orgName)` — saves original token to `useRef` (non-reactive), calls `getImpersonationToken`, overrides Supabase JWT via `setOrgAccessToken()`
- `exitImpersonation()` — restores original token from ref, clears state
- State: `isImpersonating`, `impersonatedOrgId`, `impersonatedOrgName`, `impersonationError`

**`src/platform/layout/ImpersonationBanner.tsx`** — Amber banner:
- Returns `null` when not impersonating
- Shows Eye icon + org name + "Sair da impersonação" button
- Exit calls `exitImpersonation()` then navigates to `/admin/tenants`
- Colors: `bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800`

**Wiring:**
- `src/App.tsx` — `ImpersonationProvider` added inside `BrowserRouter`
- `src/platform/layout/Layout.tsx` — `<ImpersonationBanner />` added after `<TopNav />`
- `src/platform/layout/AdminLayout.tsx` — same

## Key decisions

- Uses `setOrgAccessToken()` NOT Clerk `setActive` — admin's Clerk session is unchanged, only Supabase JWT is overridden
- `originalTokenRef` is `useRef` to avoid triggering re-renders on save/restore

## Commits

- `app(108-03): add ImpersonationContext, ImpersonationBanner, wire both layouts`
