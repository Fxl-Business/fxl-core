# Summary: 120-01 Dashboard Metric Cards + Query Param Navigation

## Status: COMPLETE

## What was built
Added two new metric cards to the admin dashboard showing unaffiliated user count and archived tenant count with amber styling to signal items needing attention. Each card links to the relevant filtered view. Updated UsersPage and TenantsPage to read URL query params for initial filter/tab state.

## Tasks completed
| # | Task | Status |
|---|------|--------|
| 1 | Add metric cards to AdminDashboard | Done |
| 2 | UsersPage reads ?filter= query param | Done |
| 3 | TenantsPage reads ?tab= query param | Done |

## Key files modified
- `src/platform/pages/admin/AdminDashboard.tsx` — 2 new MetricCard instances, extended MetricCard with iconBg/iconColor props, grid updated to 5-card layout, listTenants('archived') added to Promise.allSettled
- `src/platform/pages/admin/UsersPage.tsx` — useSearchParams for initial filter from ?filter= param
- `src/platform/pages/admin/TenantsPage.tsx` — useSearchParams for initial tab from ?tab= param

## Requirements addressed
- DASH-01: Dashboard shows count of unaffiliated users
- DASH-02: Dashboard shows count of archived tenants
- DASH-03: Each new metric card links directly to the relevant filtered view

## Self-Check: PASSED
- `npx tsc --noEmit` — zero errors
- All acceptance criteria verified

## Deviations
None — implemented as planned.
