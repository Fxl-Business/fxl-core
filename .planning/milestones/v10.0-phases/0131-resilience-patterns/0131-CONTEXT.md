# Phase 131: Resilience Patterns (v9.0) - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Create three new SDK documentation pages covering the resilience patterns implemented in Nexo v9.0: error-boundaries.md, observabilidade.md, and retry-backoff.md. Each page must be written as a docs/sdk/*.md file AND synced to the Supabase `documents` table. Pages must be accessible via the SDK sidebar in Nexo and identified as v9.0 patterns.

</domain>

<decisions>
## Implementation Decisions

### Page structure and depth
- Full working code snippets that a spoke developer can copy-paste, with annotated comments explaining each part
- Each page follows the pattern: concept explanation -> Nexo reference implementation -> setup guide for a spoke -> configuration options -> common pitfalls
- Code examples come directly from the Nexo codebase (ModuleErrorBoundary.tsx, main.tsx, App.tsx, retry.ts) adapted for spoke context
- Include the actual source code from Nexo as the reference, then show the spoke adaptation

### Tone and audience
- Practical reference with setup instructions — assumes developer knows React/TypeScript but needs FXL-specific guidance
- Matches existing SDK pages (stack.md, contract.md) in structure and tone
- Written in Portuguese (matching all existing SDK content)

### Page ordering in sidebar
- error-boundaries.md: sort_order 80
- observabilidade.md: sort_order 81
- retry-backoff.md: sort_order 82
- Groups them together after the placeholder pages, before MCP/Nexo Skill pages

### v9.0 identification
- Badge remains "SDK" (no new badge category)
- Each page description includes "Padrao v9.0" or "Adicionado em v9.0"
- A callout at the top of each page notes: "Este padrao foi introduzido no Nexo v9.0 (Resiliencia de Plataforma)"
- The SDK index page (docs/sdk/index.md) must be updated to list these three pages

### Supabase sync
- Each page synced to `documents` table with scope: 'product', parent_path: 'sdk'
- Body field contains only markdown (no frontmatter block)
- Title, badge, description, slug, sort_order are separate columns
- Sync via `mcp__supabase__execute_sql` INSERT into documents table

### Claude's Discretion
- Exact prose and section headings within each page
- How much of the Nexo source to include vs summarize
- Whether to include a "Troubleshooting" section per page

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v9.0 Implementation (source material for docs)
- `src/platform/layout/ModuleErrorBoundary.tsx` — Error boundary class component with Sentry integration and fallback UI
- `src/main.tsx` — Sentry.init() setup with DSN, browser tracing, replay integration
- `src/App.tsx` — SentryContextSetter component setting user/org context on Sentry
- `src/platform/lib/retry.ts` — withRetry utility with exponential backoff, RetryOptions interface, isNetworkOrServerError
- `src/platform/lib/retry.test.ts` — Test suite showing usage patterns and edge cases
- `src/platform/router/AppRouter.tsx` — How ModuleErrorBoundary wraps every module route
- `src/platform/tenants/OrgTokenContext.tsx` — withRetry call site for token exchange (with AbortSignal)
- `src/platform/services/admin-service.ts` — withRetry call sites for admin API calls
- `src/platform/services/tenant-service.ts` — withRetry call sites for tenant API calls

### Existing SDK pages (style reference)
- `docs/sdk/index.md` — SDK index page (must be updated to list new pages)
- `docs/sdk/stack.md` — Example of well-structured SDK page with tables, callouts, code blocks
- `docs/sdk/contract.md` — Example of technical SDK page with code examples

### Requirements
- `.planning/REQUIREMENTS.md` — SDKN-01, SDKN-02, SDKN-03 define acceptance criteria
- `.planning/milestones/v10.0-ROADMAP.md` — Phase 131 success criteria (4 items)

### v9.0 Milestone (background context)
- `.planning/milestones/v9.0-ROADMAP.md` — Original v9.0 phases that implemented these patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ModuleErrorBoundary` (class component): Catches errors per module, reports to Sentry with module tag, renders fallback with retry button
- `withRetry<T>` (generic utility): Exponential backoff with configurable maxRetries, baseDelay, backoffFactor, AbortSignal support, custom isRetryable predicate
- `isNetworkOrServerError` (default predicate): Retries TypeError (network) and 5xx, never retries 4xx
- `SentryContextSetter` (side-effect component): Sets Sentry.setUser() and Sentry.setTag('org_id') based on auth state
- Sentry.init config: DSN via env var, browserTracingIntegration, replayIntegration, 0.2 traces sample rate, 1.0 error replay rate

### Established Patterns
- SDK pages use YAML frontmatter: title, badge ("SDK"), description, scope ("product"), sort_order
- SDK pages use custom tags: `{% callout type="warning|info" %}`, `{% prompt %}`, `{% operational %}`
- All SDK content is in Portuguese
- Documents table schema: title, badge, description, slug, parent_path, body (markdown without frontmatter), sort_order, scope

### Integration Points
- docs/sdk/index.md — Must add three new pages to the "Em Construcao" table (or move to a new "Resiliencia" section)
- Supabase `documents` table — INSERT rows with slug 'sdk/error-boundaries', 'sdk/observabilidade', 'sdk/retry-backoff'
- Sidebar renders dynamically from DB — pages appear automatically once inserted into documents table

</code_context>

<specifics>
## Specific Ideas

- error-boundaries.md should show the exact ModuleErrorBoundary from Nexo, then explain how a spoke adapts it for their own modules
- observabilidade.md should include the complete Sentry setup: main.tsx init + App.tsx context setter + env vars needed
- retry-backoff.md should include the full withRetry source code as the utility to copy, plus show 2-3 call site examples from OrgTokenContext and admin-service
- Each page should reference the Nexo implementation as "o Nexo usa este padrao em..." to anchor the guidance in real code

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 0131-resilience-patterns*
*Context gathered: 2026-03-19*
