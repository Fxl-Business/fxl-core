# Summary: Phase 125, Plan 02 — Error Boundary Integration + Sentry Context

**Status:** Complete
**One-liner:** Wrapped all module routes with ModuleErrorBoundary in AppRouter, added SentryContextSetter with org_id and userId context

## What was built
- Wrapped every module route in `AppRouter.tsx` with `ModuleErrorBoundary` (docs, tasks, wireframe, projects, clients, connector, admin, home)
- Created `SentryContextSetter` component in `App.tsx` that sets Sentry user context from Clerk userId and org_id tag from active org
- Layout shell (header + sidebar) remains outside all error boundaries — fully navigable during module crashes

## Files changed
- `src/platform/router/AppRouter.tsx` (modified)
- `src/App.tsx` (modified)
