# Phase 130: Data + Security - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Fill two placeholder SDK pages: `docs/sdk/database.md` (SDKP-02) and `docs/sdk/security.md` (SDKP-03). Each page must be written as a complete `.md` file AND synced to the Supabase `documents` table. No code changes to the app -- pure documentation work.

</domain>

<decisions>
## Implementation Decisions

### Content Structure -- database.md
- Organize by pattern sections: Modelagem Supabase, Migrations Numeradas, Row Level Security, Indices, Multi-Tenant Patterns
- Each section starts with the principle/rule, then shows a real Nexo migration as example
- Migration naming convention: `NNN_descriptive_name.sql` (sequential numbering, snake_case)
- Show the full RLS policy evolution: basic org_id (migration 008) -> super_admin bypass (migration 009) -> scope-based (migration 020)
- Include multi-tenant table design pattern: `org_id text NOT NULL` on every tenant-scoped table
- Cover index creation pattern: `CREATE INDEX IF NOT EXISTS idx_{table}_{column}` for idempotency

### Content Structure -- security.md
- Organize as a flow-based pipeline: Auth (Clerk) -> JWT Bridge (Edge Function) -> RLS (Supabase) -> API Safety (ConnectorResult)
- Section 1: Clerk auth setup (ClerkProvider, useSession, useOrganizationList, ProtectedRoute pattern)
- Section 2: JWT bridge Clerk->Supabase (token-exchange edge function, OrgTokenContext, withRetry wrapping)
- Section 3: RLS by tenant (org_id claim extraction, super_admin bypass, scope-based policies for documents)
- Section 4: HTTP security headers and env vars protection (VITE_ prefix rules, never expose secrets in client)
- Section 5: ConnectorResult<T> pattern for external API validation (ok/error discriminated union, error types, fallbacks)
- Section 6: API safety rules from PITFALLS.md (Promise.allSettled, null safety with `?? []`, sub-path vs query params in edge functions, response shape validation)

### Code Examples Approach
- Use REAL Nexo code as primary examples (migrations 008/009/020, token-exchange.ts, connector-service.ts, OrgTokenContext.tsx, retry.ts)
- Show complete, copy-pasteable snippets with comments explaining WHY, not just what
- After each real example, provide a generic template that spoke developers can adapt
- Code blocks must be valid TypeScript/SQL that would pass `tsc --noEmit` or `psql` respectively

### Tone and Audience
- Primary readers: spoke developers using Claude Code -- docs consumed by both humans and AI agents
- Prescriptive tone: "Do this, here is why" rather than "You could consider..."
- Portuguese for prose (consistent with existing SDK pages), English for code/comments
- Each section should be actionable -- a developer should be able to follow it step by step

### Cross-referencing
- database.md references security.md for RLS deep-dive details
- security.md references database.md for schema/migration patterns
- Both pages inline relevant PITFALLS.md rules (Promise.allSettled, null safety, edge function sub-paths) with context
- Reference the existing `docs/sdk/stack.md` for the approved technology stack

### Sync to Supabase
- Each page must be synced to Supabase `documents` table with correct metadata
- database.md: slug `sdk/database`, scope `product`, sort_order 90, badge `SDK`
- security.md: slug `sdk/security`, scope `product`, sort_order 100, badge `SDK`
- Body field contains ONLY markdown (no frontmatter block)
- Title, badge, description are separate columns
- Sync via `mcp__supabase__execute_sql` UPDATE on `documents` table where `slug = 'sdk/database'` and `slug = 'sdk/security'`

### Claude's Discretion
- Exact heading hierarchy within each section (H2/H3/H4 nesting)
- Whether to use callout tags (`{% callout %}`) for warnings vs inline bold text
- Ordering of sub-sections within each major section
- Whether to include a TL;DR summary at the top of each page
- Exact wording of cross-reference links between pages

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database patterns (real examples)
- `supabase/migrations/008_multi_tenant_schema.sql` -- Multi-tenant schema: org_id on all tables, RLS policies with COALESCE fallback, org_id indexes
- `supabase/migrations/009_super_admin_rls.sql` -- Super admin bypass pattern: JWT claim check before org_id filter
- `supabase/migrations/020_documents_rls_fix.sql` -- Scope-based RLS: product docs public, tenant docs isolated, no anon access
- `supabase/migrations/` (all 20 files) -- Sequential migration numbering convention and idempotent patterns

### Security patterns (real examples)
- `src/platform/tenants/token-exchange.ts` -- JWT bridge: Clerk token -> Supabase Edge Function -> org-scoped JWT
- `src/platform/tenants/OrgTokenContext.tsx` -- Token lifecycle: exchange on mount/org-switch, AbortController, withRetry wrapping
- `src/modules/connector/services/connector-service.ts` -- ConnectorResult<T> discriminated union, ConnectorError types, timeout pattern
- `src/platform/lib/retry.ts` -- withRetry utility with exponential backoff, AbortSignal support, retryable detection

### API safety rules
- `.planning/PITFALLS.md` -- All 17 pitfall rules, especially: #1 (Promise.allSettled), #5 (sub-paths), #6 (null safety), #9 (verify_jwt), #11 (secret naming), #12 (Clerk org_id)

### Existing SDK pages (for format/tone consistency)
- `docs/sdk/database.md` -- Current placeholder (to be replaced)
- `docs/sdk/security.md` -- Current placeholder (to be replaced)
- `docs/sdk/stack.md` -- Approved stack reference (for cross-linking)

### Project rules
- `CLAUDE.md` -- Commit conventions, sync rules, frontmatter format, never use `any`
- `.planning/REQUIREMENTS.md` -- SDKP-02 and SDKP-03 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 20 Supabase migrations with consistent patterns (idempotent DDL, sequential numbering, descriptive names)
- `ConnectorResult<T>` and `ConnectorError` types in connector-service.ts -- complete discriminated union for API responses
- `withRetry()` utility with full options (maxRetries, baseDelay, backoffFactor, signal, isRetryable)
- `exchangeToken()` function showing the complete Clerk->Supabase JWT bridge pattern
- `OrgTokenContext` showing provider pattern with AbortController lifecycle

### Established Patterns
- RLS policy pattern: `COALESCE(nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id', org_id) = org_id`
- Super admin bypass: check `super_admin = 'true'` claim before org_id filter
- Scope-based access: `product` docs readable by all authenticated, `tenant` docs filtered by org_id
- Edge function auth: `verify_jwt: false` + manual JWT validation for Clerk RS256 tokens
- Env var convention: `VITE_` prefix for client-side, `JWT_SIGNING_SECRET` (no `SUPABASE_` prefix) for edge functions

### Integration Points
- Existing SDK sidebar in Nexo already shows database and security pages (as placeholders)
- `documents` table already has rows for both pages with correct slugs, sort_order, and scope
- No routing changes needed -- pages render via the existing DocRenderer pipeline

</code_context>

<specifics>
## Specific Ideas

- database.md should show the evolution from single-tenant (migration 001-007) to multi-tenant (008+) to illustrate the pattern progression
- security.md should include the edge function checklist from PITFALLS.md as a concrete "before deploying" section
- The ConnectorResult<T> pattern should be presented as the FXL standard for ALL external API calls, not just connector module
- The PITFALLS.md rules about null safety and response shape validation should be presented as mandatory coding rules, not suggestions
- Pitfall #12 (Clerk session token default not including org_id) is critical knowledge that should be prominently documented

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 0130-data-security*
*Context gathered: 2026-03-19*
