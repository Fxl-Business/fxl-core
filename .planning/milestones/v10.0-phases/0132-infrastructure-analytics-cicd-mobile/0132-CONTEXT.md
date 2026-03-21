# Phase 132: Infrastructure, Analytics, CI/CD + Mobile - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Preencher 3 paginas placeholder do SDK (infrastructure.md, analytics.md, mobile.md) e atualizar ci-cd.md para refletir o pipeline real do Nexo v9.0. Todas as paginas devem ser escritas no filesystem E sincronizadas na tabela `documents` do Supabase. Nenhum codigo de aplicacao e alterado — apenas documentacao.

</domain>

<decisions>
## Implementation Decisions

### Content depth and structure
- Reference documentation with code examples (not tutorial-style step-by-step)
- Consistent with existing SDK pages (stack.md, ci-cd.md) that use tables, code blocks, and callouts
- Each page covers the "what" and "how" concisely — not the "why" in depth
- Use frontmatter format: title, badge (SDK), description, scope (product), sort_order

### Code examples source
- Use real Nexo v9.0 code as reference examples where applicable
- infrastructure.md: reference actual Sentry setup from src/main.tsx, Vercel deploy from vercel.json
- analytics.md: reference Connector module patterns from src/modules/connector/
- ci-cd.md: copy actual .github/workflows/ci.yml content (already real)
- mobile.md: use recommended patterns (no real Nexo mobile code exists yet)

### CI/CD update scope
- The existing ci-cd.md documents an OUTDATED workflow (npm ci, Node 18, no vitest, no env vars)
- Must update to match the ACTUAL .github/workflows/ci.yml:
  - Node 20 (not 18)
  - `npm install --ignore-scripts` (not `npm ci`)
  - `npx vitest run` as test step
  - Placeholder env vars (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_CLERK_PUBLISHABLE_KEY)
  - Concurrency group with cancel-in-progress
  - PR-only trigger (not push to main)
- Remove the callout recommending `npm ci` — the project explicitly chose `npm install`
- Keep fxl-doctor.sh, Vercel deploy, and branch protection sections as-is (still accurate)

### Infrastructure page content
- Ambientes: dev (localhost), staging (Vercel preview), prod (Vercel production)
- Monitoring: Sentry setup for frontend (DSN, source maps, module context)
- Deploy frontend: Vercel with vercel.json config (already in ci-cd.md, reference it)
- Deploy backend: NestJS recommended pattern for spokes that need server-side
- No Docker/Kubernetes — FXL spokes are Vite SPAs deployed to Vercel

### Analytics page content
- Metricas obrigatorias por tipo de dashboard (financeiro, vendas, operacional)
- Extracao de dados via Connector module (ConnectorResult<T> pattern)
- Dashboards padrao esperados para spoke BI (KPIs, trends, tables, charts)
- Event tracking recommendations (lightweight, no heavy analytics SDK)

### Mobile page content
- React Native with Expo as recommended stack
- Compartilhamento web/mobile: types/, utils/, services/ can be shared
- Push notifications via Expo Notifications API
- App store publication guidelines (basic)
- Explicit note: no FXL spoke has mobile yet — these are recommended patterns

### Claude's Discretion
- Exact section ordering within each page
- Level of detail in code examples (snippets vs full files)
- Whether to include troubleshooting sections (follow ci-cd.md pattern if yes)
- Typography and callout placement

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing SDK pages (pattern reference)
- `docs/sdk/ci-cd.md` — Current CI/CD page to be UPDATED (not rewritten from scratch)
- `docs/sdk/infrastructure.md` — Current placeholder to be filled
- `docs/sdk/analytics.md` — Current placeholder to be filled
- `docs/sdk/mobile.md` — Current placeholder to be filled
- `docs/sdk/stack.md` — Reference for tone, depth, and formatting patterns

### Real implementation references
- `.github/workflows/ci.yml` — The ACTUAL CI pipeline (source of truth for ci-cd.md update)
- `src/main.tsx` — Sentry initialization code (reference for infrastructure page)
- `src/platform/layout/ModuleErrorBoundary.tsx` — Error boundary pattern (reference for infrastructure monitoring)
- `src/platform/lib/retry.ts` — Retry utility (reference for infrastructure resilience)
- `src/modules/connector/` — Connector module (reference for analytics data extraction)

### Project configuration
- `CLAUDE.md` — Commit conventions, doc format rules, stack reference
- `.planning/REQUIREMENTS.md` — SDKP-04, SDKP-05, SDKP-07, SDKU-01 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/sdk/ci-cd.md`: Existing well-structured page with tables, code blocks, callouts — update in place
- `docs/sdk/stack.md`: Template for tone and structure of new SDK pages
- `.github/workflows/ci.yml`: Actual CI workflow with vitest, npm install, placeholder env vars
- `src/main.tsx`: Sentry.init() call with DSN, environment, source maps config
- `src/modules/connector/`: ConnectorResult<T>, connector-service.ts patterns

### Established Patterns
- SDK pages use YAML frontmatter (title, badge, description, scope, sort_order)
- Content uses custom tags: `{% callout %}`, `{% prompt %}`, `{% operational %}`
- Tables for comparing options, code blocks for examples, callouts for warnings
- Sync to Supabase `documents` table after writing .md file

### Integration Points
- Supabase `documents` table: each page needs INSERT or UPDATE with slug `sdk/page-name`
- Sidebar nav: driven by `documents` table — pages appear automatically when synced
- sort_order values: analytics=110, infrastructure=120, mobile=130, ci-cd=70

</code_context>

<specifics>
## Specific Ideas

- CI/CD page must reflect the REAL pipeline — the current page documents an outdated workflow that uses npm ci and lacks vitest
- Infrastructure should NOT mention Docker/Kubernetes — FXL spokes are Vite SPAs on Vercel
- Analytics should reference the Connector module as the data extraction pattern
- Mobile is forward-looking documentation — no spoke has mobile yet, document recommended patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 0132-infrastructure-analytics-cicd-mobile*
*Context gathered: 2026-03-19*
