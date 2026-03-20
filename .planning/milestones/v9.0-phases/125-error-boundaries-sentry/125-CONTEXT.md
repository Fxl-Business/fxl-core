# Phase 125: Error Boundaries + Sentry - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Isolate module crashes via React error boundaries so a failure in any module (docs, tasks, wireframe, connector, projects, clients) displays a fallback UI within that module without taking down the header, sidebar, or other modules. Integrate Sentry in the frontend to capture all runtime errors and network failures with actionable context (module name, org_id, stack trace, URL, status code).

</domain>

<decisions>
## Implementation Decisions

### Fallback UI design
- Inline card within the module content area showing: error icon, module name, brief error message, and a "Tentar novamente" (retry) button
- Fallback stays inside the Layout shell — header, sidebar, and other modules remain fully functional and navigable
- Retry button resets the error boundary state (re-renders the module)
- No full-page error screens — the boundary catches and contains within the module zone

### Error boundary granularity
- One `ModuleErrorBoundary` component wrapping each module's route group inside `Layout`
- Boundary placement in `AppRouter.tsx` where module routes are rendered, wrapping each module's `<Route>` elements
- Each boundary receives the module name as a prop for Sentry tagging and fallback display
- Admin routes (`/admin/*`) get their own boundary inside `AdminLayout`
- The existing `PreviewErrorBoundary` in SectionPreviewCard.tsx remains untouched (inner boundary for preview rendering)

### Sentry SDK integration
- Install `@sentry/react` package
- `Sentry.init()` in `main.tsx` (before React render) with DSN from `VITE_SENTRY_DSN` env var
- Error boundaries call `Sentry.captureException(error, { tags: { module, org_id } })` in `componentDidCatch`
- Sentry `beforeSend` callback enriches events with org_id from Clerk session when available
- Environment tag: `VITE_SENTRY_ENVIRONMENT` (defaults to `production`)
- Source maps uploaded via Vite plugin (`@sentry/vite-plugin`) for readable stack traces in Sentry dashboard

### Network error capture
- Use `Sentry.addBreadcrumb` for fetch activity tracking (Sentry SDK auto-instruments fetch by default)
- Configure Sentry `beforeSend` to tag network errors with URL and HTTP status code
- No custom global fetch wrapper needed — Sentry's built-in fetch instrumentation captures network failures automatically
- Failed fetch calls surface in Sentry with request URL, method, and status code as breadcrumbs attached to the error event

### Claude's Discretion
- Exact visual styling of the fallback card (colors, spacing, icon choice)
- Whether to use class component or functional wrapper for error boundary
- Sentry sample rate configuration
- Whether to add a Sentry ErrorBoundary wrapper from @sentry/react or build custom class component
- Breadcrumb configuration details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture
- `.planning/milestones/v9.0-ROADMAP.md` — Phase 125 success criteria and requirement mapping (ISO-01, OBS-01, OBS-02)
- `.planning/REQUIREMENTS.md` — ISO-01 (error boundary isolation), OBS-01 (Sentry runtime capture), OBS-02 (error boundary Sentry reporting)

### Codebase entry points
- `src/App.tsx` — Provider stack, top-level component tree
- `src/platform/router/AppRouter.tsx` — Route structure where module boundaries must be inserted
- `src/platform/layout/Layout.tsx` — Shell layout (header + sidebar + outlet) that must remain functional during module crash
- `src/platform/module-loader/registry.ts` — MODULE_REGISTRY defining all 6 modules and their route configs
- `src/platform/tenants/useOrgTokenExchange.ts` — Org context source for enriching Sentry with org_id

### Existing patterns
- `tools/wireframe-builder/components/editor/SectionPreviewCard.tsx` — Existing PreviewErrorBoundary (lightweight class component pattern)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PreviewErrorBoundary` in SectionPreviewCard.tsx: Lightweight class-based error boundary pattern that can be referenced for the new `ModuleErrorBoundary`
- `MODULE_REGISTRY` array: Provides module IDs and labels for tagging errors per module
- `useOrgTokenExchange` hook: Source of org_id for Sentry context enrichment
- Clerk `useAuth()`: Provides user identity for Sentry user context

### Established Patterns
- Provider nesting in App.tsx: BrowserRouter > ImpersonationProvider > ModuleEnabledProvider > ExtensionProvider > AppRouter — Sentry init goes in main.tsx before this tree
- Lazy loading with Suspense: Admin pages and some module pages already use `lazy()` + `<Suspense>` — error boundaries should wrap outside Suspense
- Module route registration via `MODULE_REGISTRY.flatMap(m => m.routeConfig)` — boundary can wrap each module's routes
- Environment variables prefixed with `VITE_` for client-side access

### Integration Points
- `main.tsx`: Sentry.init() placement (before ReactDOM.createRoot)
- `AppRouter.tsx`: ModuleErrorBoundary wrapping around module route groups inside Layout
- `Layout.tsx`: The `<Outlet />` renders module content — error boundary goes between Layout and module content
- `AdminLayout.tsx`: Separate boundary for admin module routes
- `package.json`: New dependency `@sentry/react` + `@sentry/vite-plugin` (devDep)
- `vite.config.ts`: Sentry Vite plugin for source map upload
- `.env` / Vercel env: `VITE_SENTRY_DSN` and `VITE_SENTRY_ENVIRONMENT` variables

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The key constraint is that error boundaries must align with the modular architecture (6 modules in MODULE_REGISTRY) and Sentry must provide actionable context (module name + org_id) so errors can be triaged by module owner and tenant.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 125-error-boundaries-sentry*
*Context gathered: 2026-03-19*
