# Phase 105: Data Isolation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up org-scoped data isolation end-to-end: activate the token exchange flow so Supabase receives the org_id JWT, and update every service/page that currently leaks cross-org data (tasks, clients, wireframes/blueprints, docs sidebar).

RLS policies, `org_id` columns, and the `auth-token-exchange` edge function all already exist. The gap is that the Supabase client never sends the org JWT — `exchangeToken()` and `setOrgAccessToken()` are dead code. No new DB schema or RLS work is needed; the phase is about connecting the existing pieces and enforcing the isolation visually.

Out of scope for this phase: data recovery/re-association of orphaned rows (Phase 106), admin enhancements (Phase 108), header UX (Phase 107).

</domain>

<decisions>
## Implementation Decisions

### Token Exchange Wiring
- Call `exchangeToken(clerkToken)` inside a React effect triggered by Clerk org selection changes, then call `setOrgAccessToken(result.access_token)` to inject the JWT into the Supabase client
- The effect must re-run whenever `activeOrg` changes (org switch) and at initial load after the user is authenticated
- Recommended location: a new `useOrgTokenExchange` hook consumed in `ProtectedRoute` or a dedicated `OrgTokenProvider` wrapping the app — keeps auth concerns in `src/platform/auth/` or `src/platform/tenants/`
- If the token exchange fails (network error, missing org), the hook should set `orgAccessToken` to null and surface an error state — do NOT silently allow anon fallback
- Token refresh: re-exchange when org changes; honor the `expires_in` from the exchange response for periodic refresh

[auto] Token Exchange Wiring — Q: "Where should the token exchange effect live?" → Selected: "New useOrgTokenExchange hook in src/platform/tenants/ consumed inside ProtectedRoute" (recommended default)

### Docs Sidebar Scope Filtering
- The docs service currently fetches all documents with no org filter — RLS will enforce org isolation once the JWT is set, but the in-memory cache must be invalidated on org switch
- Tenant docs (`scope = 'tenant'`) appear only for the org that owns them; product docs (`scope = 'product'`) remain visible to all orgs
- The sidebar nav should reflect only the documents returned by the scoped query — no additional client-side filtering needed beyond what RLS + scope provides
- Cache invalidation strategy: reset `docsCache` and `docsCachePromise` whenever org changes

[auto] Docs Sidebar Scope — Q: "How to invalidate docs cache on org switch?" → Selected: "Reset in-memory cache variables when org changes (simplest, correct)" (recommended default)

### Clients Module — Hardcoded vs Dynamic
- `ClientsIndex.tsx` currently has a static `CLIENTS` array — this must be replaced with a Supabase-backed clients table scoped by `org_id`
- A `clients` table may not exist yet in Supabase (the module uses filesystem `clients/` folder) — if not, create it with: `id`, `slug`, `name`, `description`, `org_id`, `created_at`
- The `clients/financeiro-conta-azul/` filesystem structure remains as Claude Code context; the Supabase `clients` table is the source for the UI listing
- Client detail pages (briefs, wireframes, blueprints) already use Supabase `blueprint_configs` and `briefing_configs` — those are already scoped by org_id via RLS once JWT is active
- ARCH-02: Wireframe Builder (the tool: ComponentGallery, SharedWireframeView, the section/block system) is a global tool — it appears in MODULE_REGISTRY as a module available to all orgs. Client wireframes (the data: `blueprint_configs` rows) are org-scoped data, accessible only to the org that owns them.

[auto] Clients Module — Q: "Clients table: create new or reuse existing?" → Selected: "Create clients table in Supabase if it doesn't exist, replace static array with dynamic query" (recommended default)

### Tasks Service — org_id in Mutations
- The `tasks-service.ts` does not pass `org_id` explicitly — it relies on RLS to filter via JWT
- Once the JWT is active, `SELECT` queries are automatically scoped. For `INSERT`, the `org_id` column must be set from the active org — service functions need the caller to supply `org_id`, or the service reads it from a shared store
- Recommended pattern: service functions accept `org_id` as a parameter (explicit), and callers get it from `useActiveOrg()` — avoids coupling the service to React/Clerk internals
- The `Task` type should include `org_id: string` to reflect the DB column

[auto] Tasks Service — Q: "How should org_id be passed to task INSERT operations?" → Selected: "Service functions accept org_id as explicit parameter from caller" (recommended default)

### Wireframe Builder vs Client Wireframe Separation (ARCH-01/02)
- The Wireframe Builder module (tool) should be marked as global in MODULE_REGISTRY — it is always enabled, not per-tenant toggleable (or if it is, it controls the builder tool, not the wireframe data)
- Client wireframes (blueprint_configs rows) are already scoped by org_id in the DB — once JWT is active, isolation is automatic
- No change needed to the wireframe module's component code — the separation is architectural (module = tool, blueprints = data) rather than requiring new UI

[auto] ARCH-01/02 — Q: "Does the Wireframe Builder need UI changes to communicate tool vs data separation?" → Selected: "No — the separation is architectural; no UI change needed for this phase" (recommended default)

### Claude's Discretion
- Exact placement of `useOrgTokenExchange` hook call within the provider tree
- Whether token refresh uses a `setInterval` or re-triggers on next query failure
- Error UI when token exchange fails (inline error in ProtectedRoute vs error boundary)
- Index strategy for the new `clients` table (org_id index sufficient)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### RLS and Multi-Tenant Schema
- `supabase/migrations/008_multi_tenant_schema.sql` — org_id columns, initial RLS policies with COALESCE fallback (superseded by 009, 013)
- `supabase/migrations/009_super_admin_rls.sql` — super_admin bypass added to all 8 tables
- `supabase/migrations/013_remove_anon_fallback.sql` — FINAL RLS: strict org_id match, no anon fallback; this is the active policy for all tables except documents
- `supabase/migrations/011_documents_scope.sql` — documents split-policy with scope='product' global read rule
- `supabase/migrations/012_scope_data_migration.sql` — backfills sdk/ docs to product scope
- `supabase/migrations/014_sdk_docs_scope.sql` — safety net for sdk/ product scope

### Token Exchange
- `supabase/functions/auth-token-exchange/index.ts` — Edge function that mints Supabase JWT with org_id claim from Clerk token
- `src/platform/tenants/token-exchange.ts` — Client-side exchangeToken() function (exists but is NOT called anywhere)
- `src/platform/supabase.ts` — Supabase client with setOrgAccessToken() / custom fetch interceptor (exists but orgAccessToken is never set)

### Service Layer (needs org_id wiring)
- `src/modules/tasks/services/tasks-service.ts` — listTasks/createTask/updateTask (no org_id passed to INSERT)
- `src/modules/docs/services/docs-service.ts` — in-memory cache with fetchAllDocs() (no org filter, cache not invalidated on org switch)
- `src/modules/clients/pages/ClientsIndex.tsx` — hardcoded CLIENTS array (must become dynamic Supabase query)

### Active Org Hook
- `src/platform/tenants/useActiveOrg.ts` — useActiveOrg() hook wrapping Clerk org data; use this as the source of truth for org_id in components

### Auth Flow
- `src/platform/auth/ProtectedRoute.tsx` — entry point for authenticated routes; good candidate for triggering token exchange effect
- `src/platform/layout/TopNav.tsx` — OrgPicker lives here; org switching triggers must propagate to token exchange

### Requirements
- `.planning/REQUIREMENTS.md` §Isolamento de Dados — DATA-01 through DATA-04, ARCH-01, ARCH-02
- `.planning/ROADMAP.md` §Phase 105 — success criteria (5 criteria all linked to this phase)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useActiveOrg()` hook (`src/platform/tenants/useActiveOrg.ts`): returns `activeOrg.id` as the org_id — use this in components that need to pass org_id to service calls
- `exchangeToken()` function (`src/platform/tenants/token-exchange.ts`): already implemented, just needs to be called
- `setOrgAccessToken()` function (`src/platform/supabase.ts`): already implemented, injects the JWT into all Supabase requests via custom fetch interceptor
- `auth-token-exchange` edge function: already deployed and working — verified it exists in `supabase/functions/`
- `useAdminMode()` hook (`src/platform/hooks/useAdminMode.ts`): can be referenced to understand the admin/operator hook pattern

### Established Patterns
- Service functions import `supabase` from `@platform/supabase` and run queries directly — org isolation is handled by RLS (JWT), not by adding `.eq('org_id', ...)` in queries
- `Promise.allSettled` pattern (from CLAUDE.md): use this for independent fetches, not `Promise.all`
- Edge function responses always accessed with fallbacks: `data ?? []`, `count ?? 0`
- Token getter pattern from `tenant-service.ts`: module-level `_clerkTokenGetter` registered once, used in async functions — same pattern could be used for org token refresh
- No sub-paths in Supabase edge functions — use query params instead (CLAUDE.md constraint)

### Integration Points
- `ProtectedRoute.tsx` is the mount point for all authenticated content — triggering `useOrgTokenExchange` here ensures the token is set before any module renders
- `OrgPicker.tsx` calls `switchOrg(orgId)` via Clerk's `setActive` — this changes `organization` in Clerk context, which `useActiveOrg` responds to; the token exchange hook must watch this change
- `docsCache` in `docs-service.ts` is a module-level variable — can be reset by a new exported `invalidateDocsCache()` function called from the token exchange effect when org changes
- `ClientsIndex.tsx` is currently a pure static component — converting to async Supabase query follows the pattern used in tasks module (useEffect + supabase.from(...).select())

### What Doesn't Exist Yet (needs to be created)
- `useOrgTokenExchange` hook — new file in `src/platform/tenants/` or `src/platform/auth/`
- `clients` table in Supabase — new migration (016) needed if table doesn't exist
- `clients-service.ts` in `src/modules/clients/services/` — new service wrapping the clients table

</code_context>

<specifics>
## Specific Ideas

- The token exchange hook should watch `activeOrg?.id` from `useActiveOrg()` as its dependency — when the org changes, re-run the exchange and reset the docs cache
- Wireframe Builder separation (ARCH-01/02): the module entry in MODULE_REGISTRY already distinguishes the tool from client data — no UI changes needed; the separation is conceptual and enforced by RLS
- The `clients` table slug field aligns with the existing filesystem convention (`clients/financeiro-conta-azul/`) — keep the same slugs for routing compatibility

</specifics>

<deferred>
## Deferred Ideas

- Data recovery for orphaned rows (tasks, wireframes created before isolation) — Phase 106
- Admin impersonation of orgs — Phase 108 (depends on Phase 105 isolation being in place)
- Token refresh via `setInterval` or expiry tracking — noted as possible enhancement; for Phase 105, re-exchange on org change is sufficient
- Real-time Supabase subscription filtering by org — future phase

</deferred>

---

*Phase: 105-data-isolation*
*Context gathered: 2026-03-18*
