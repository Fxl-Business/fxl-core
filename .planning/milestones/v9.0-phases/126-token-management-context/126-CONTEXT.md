# Phase 126: Token Management Context - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate the org-scoped access token from a global mutable variable (`let orgAccessToken` in `supabase.ts`) to a React Context provider, and cancel all in-flight requests from the previous org via AbortController when the user switches orgs. The goal is to eliminate the risk of stale org data populating the UI after an org switch.

This phase does NOT add retry logic (Phase 128), error boundaries (Phase 125), or CI/CD (Phase 127).

</domain>

<decisions>
## Implementation Decisions

### Context API Shape
- Create `OrgTokenContext` with a provider (`OrgTokenProvider`) and consumer hook (`useOrgToken()`)
- Context value exposes: `orgToken: string | null`, `isReady: boolean`, `error: string | null`, `supabase: SupabaseClient`, `getAbortSignal: () => AbortSignal`
- `useOrgTokenExchange` hook logic moves INTO the provider -- the provider IS the token exchange orchestrator
- All 20+ files currently importing `supabase` from `@platform/supabase` will instead get it from `useOrgToken().supabase` (for components) or continue using the singleton for non-React code (service files called from hooks)
- The `setOrgAccessToken()` / `getOrgAccessToken()` imperative API is removed from public exports -- token is managed exclusively inside the provider

### AbortController Integration
- A single `AbortController` instance lives inside `OrgTokenProvider`
- On every org switch (when `activeOrg.id` changes), the provider: (1) calls `.abort()` on the current controller, (2) creates a new `AbortController`, (3) starts the token exchange
- `getAbortSignal()` returns the current controller's signal -- consumers pass this to fetch calls or Supabase queries
- The custom fetch wrapper on the Supabase client automatically injects the current AbortSignal, so existing Supabase calls get cancellation for free without changing 20+ callsites
- Aborted requests resolve as cancelled (not error) -- the UI shows loading state for the new org, not an error from the old org's aborted request

### Supabase Client Lifecycle
- Keep the singleton `supabase` client from `@platform/supabase` -- do NOT create a new client per context render
- Replace the module-level `let orgAccessToken` variable with a closure-based approach: the provider sets a callback/ref that the custom fetch wrapper reads
- This means the custom `fetch` in `createClient` reads the token from a ref that the provider controls, rather than from a module-level variable
- The 20+ files importing `{ supabase }` continue working -- no mass refactor of service files
- Service files that are called from React hooks (all current cases) get cancellation via the injected AbortSignal in the custom fetch

### ImpersonationContext Compatibility
- `ImpersonationContext` will call methods on `OrgTokenContext` to override the token during impersonation (e.g., `setTokenOverride(token)` / `clearTokenOverride()`)
- This replaces the current pattern of directly calling `setOrgAccessToken()` / `getOrgAccessToken()`
- During impersonation, the AbortController is NOT reset (impersonation is admin-only, not a tenant data leak risk)
- On exit impersonation, the provider restores the original org token and creates a fresh AbortController

### Claude's Discretion
- Exact naming of the context provider and hook (e.g., `OrgTokenProvider` vs `TokenProvider`)
- Whether to use `useRef` or `useState` for the AbortController instance inside the provider
- Error handling specifics for abort-cancelled requests (swallow silently vs log)
- Test structure and coverage approach for the new context

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Token Management (current implementation)
- `src/platform/supabase.ts` -- Global mutable `orgAccessToken` variable, custom fetch wrapper, Supabase client singleton. THIS IS THE PRIMARY REFACTOR TARGET.
- `src/platform/tenants/useOrgTokenExchange.ts` -- Current hook that orchestrates Clerk-to-Supabase token exchange. Logic moves into the new provider.
- `src/platform/tenants/token-exchange.ts` -- The `exchangeToken()` fetch call to the Edge Function. Needs AbortSignal parameter added.
- `src/platform/tenants/useActiveOrg.ts` -- Provides `activeOrg` with `switchOrg()`. NOT refactored -- consumed by the new provider.

### Auth integration points
- `src/platform/auth/ProtectedRoute.tsx` -- Consumes `useOrgTokenExchange()`. Will consume `useOrgToken()` instead.
- `src/platform/auth/SuperAdminRoute.tsx` -- Same pattern as ProtectedRoute, also consumes token exchange.
- `src/platform/auth/ImpersonationContext.tsx` -- Directly mutates `orgAccessToken` via set/get functions. Must be refactored to use context methods.

### Existing tests
- `src/platform/tenants/useOrgTokenExchange.test.ts` -- 6+ test cases covering token exchange lifecycle. Must be adapted for context-based approach.
- `src/platform/tenants/token-exchange.test.ts` -- Tests for the raw `exchangeToken()` function.

### Supabase client consumers (20+ files)
- `src/modules/docs/services/docs-service.ts`
- `src/modules/tasks/services/tasks-service.ts`
- `src/modules/clients/services/clients-service.ts`
- `src/modules/projects/services/projects-service.ts`
- `src/modules/connector/services/connector-config-service.ts`
- `src/platform/services/admin-service.ts`
- `src/platform/services/tenant-service.ts`
- `src/platform/services/activity-feed.ts`
- `src/platform/services/module-stats.ts`
- `tools/wireframe-builder/lib/comments.ts`
- `tools/wireframe-builder/lib/tokens.ts`
- `tools/wireframe-builder/lib/blueprint-store.ts`
- `tools/wireframe-builder/lib/briefing-store.ts`
- `tools/wireframe-builder/lib/project-resolver.ts`
- (and others -- grep for `import.*supabase.*from.*@platform/supabase`)

### Requirements
- `.planning/REQUIREMENTS.md` -- ISO-02 (token via Context), ISO-03 (AbortController on org switch)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useActiveOrg()` hook: Already provides `activeOrg`, `switchOrg`, `orgs` -- the new provider wraps around this
- `exchangeToken()` function: Pure fetch call, easily extended with AbortSignal parameter
- `ImpersonationContext`: Established pattern for React Context with provider/consumer/hook -- follow same structure
- `invalidateDocsCache()` and `invalidateModules()`: Existing cache invalidation functions called on org switch -- integrate into provider's org-change lifecycle

### Established Patterns
- React Context with `createContext` + `useContext` + provider component (see `ImpersonationContext.tsx`)
- Custom fetch wrapper on Supabase client for header injection (see `supabase.ts` lines 41-50)
- `onOrgChange` callback pattern for cross-module cache invalidation (see `useOrgTokenExchange.ts`)
- Ref-based session tracking to avoid re-renders (`sessionRef`, `onOrgChangeRef`, `prevOrgIdRef`)

### Integration Points
- `OrgTokenProvider` must be placed in the component tree ABOVE `ProtectedRoute` and `ImpersonationProvider`
- The provider needs access to `ClerkProvider` context (for session) and `useActiveOrg()` (for active org)
- Module-level service files (e.g., `docs-service.ts`) import `supabase` at module scope -- the singleton must remain importable without React context

</code_context>

<specifics>
## Specific Ideas

- The key architectural insight is that the Supabase client singleton can stay as-is, but its custom `fetch` wrapper must read the token from a provider-controlled ref instead of a module-level `let`. This avoids refactoring 20+ import sites.
- The AbortController cancellation happens at the fetch wrapper level too -- every Supabase call automatically gets the current signal without callsite changes.
- The `exchangeToken()` function in `token-exchange.ts` should accept an optional `AbortSignal` parameter so the token exchange fetch itself can be cancelled if the user switches orgs mid-exchange.

</specifics>

<deferred>
## Deferred Ideas

- Retry with exponential backoff on token exchange failure -- Phase 128 (RES-01, RES-02)
- Error boundary around modules to isolate crashes -- Phase 125 (ISO-01)
- React Query migration for data fetching (would naturally handle abort/retry) -- future milestone

</deferred>

---

*Phase: 126-token-management-context*
*Context gathered: 2026-03-19*
