# Stack Research

**Domain:** Automated BI Dashboard Generation from Declarative Blueprints
**Researched:** 2026-03-07
**Confidence:** HIGH

## Context

FXL needs to generate standalone BI dashboard applications from BlueprintConfig specifications. The generated projects live in separate repositories per client, deployed independently. The first target is `financeiro-conta-azul` -- a 10-screen financial dashboard consuming CSV/XLSX exports from Conta Azul.

The existing FXL ecosystem already has strong opinions documented in the Tech Radar (`docs/build/tech-radar.md`). This research aligns with those decisions while recommending specific additions for the code generation use case.

## Recommended Stack

### Core Framework (Generated Projects)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 16.1.6 | Full-stack framework for generated dashboards | API Route Handlers needed for CSV/XLSX import, data processing, and server-side data aggregation. This is the exact "exception" case documented in FXL's Tech Radar -- generated dashboards need API routes in the same repo. Verified: Next.js 16.1.6 is current stable (npm registry, 2026-03-07). Turbopack is now the default bundler. |
| React | 19.2.4 | UI layer | Next.js 16 uses React canary with all stable React 19 features. Server Components for data-heavy dashboard pages reduce client bundle. |
| TypeScript | 5.9.3 | Type safety | Strict mode mandatory per FXL policy. The BlueprintConfig types already exist in `tools/wireframe-builder/types/blueprint.ts` -- generated projects will consume an extended version of these types. |
| Tailwind CSS | 4.2.1 | Styling | FXL standard. Tailwind v4 is current but uses a new CSS-first config approach. **Decision point: use Tailwind 3.x (3.4.x) for generated projects initially** to match FXL Core's existing Tailwind 3 config and component styles. Migrating to v4 adds risk with no BI-specific benefit. |

**Confidence:** HIGH -- Next.js version verified via npm registry and official docs. The Vite-to-Next.js shift is justified because generated dashboards need server-side data processing (CSV parsing, aggregation queries) that a pure SPA cannot handle without a separate backend.

### Database & Auth

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase (PostgreSQL) | JS SDK 2.98.0 | Database, Auth, RLS | FXL standard (Tech Radar: Active). Already documented with RLS patterns, migration conventions, and auth flows in `docs/build/techs/supabase.md`. No reason to deviate. |
| Supabase Auth | (included in SDK) | Authentication | Email + password as primary method per FXL policy. Magic link as alternative. RLS provides row-level data isolation per client organization. |
| Supabase Edge Functions | (platform feature) | Server-side processing | For heavy data processing that should not run in Route Handlers (long CSV parsing, scheduled data refresh). Use when `service_role` key is needed. |

**Confidence:** HIGH -- Supabase is the documented FXL standard with detailed patterns already in place. SDK version verified via npm.

### Data Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zod | 4.3.6 | Schema validation | FXL standard (permitted without justification). Validates CSV import structure, API inputs, and BlueprintConfig at runtime. |
| @tanstack/react-query | 5.90.21 | Async state management | FXL standard (permitted without justification). Handles dashboard data fetching with caching, background refetching, and stale-while-revalidate for real-time feel. |
| xlsx (SheetJS Community) | 0.18.5 | XLSX/XLS/CSV parsing | The blueprint requires importing Conta Azul exports in XLS, XLSX, and CSV formats. SheetJS is the de facto standard for spreadsheet parsing in JS. Runs both server-side (Route Handlers) and client-side (validation preview). |
| date-fns | 4.1.0 | Date manipulation | FXL standard (permitted without justification). Financial dashboards are date-intensive -- period filtering, month comparison, YoY calculations. Tree-shakeable, no Moment.js bulk. |

**Confidence:** HIGH -- All libraries are either FXL-approved or de facto standards. Versions verified via npm.

### Visualization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| recharts | 3.8.0 | Charts (bar, line, donut, waterfall, pareto) | FXL standard. The wireframe-builder already uses recharts extensively. Generated projects reuse the same chart component patterns. Recharts 3.x is a significant upgrade from the 2.x in FXL Core -- use 3.x for new generated projects. |
| @tanstack/react-table | 8.21.3 | Data tables with sorting, filtering, drill-down | The blueprint has complex table requirements: drill-down, clickable rows, modals, view switching. TanStack Table is headless (works with any UI) and handles these patterns natively. More powerful than the custom DataTable in wireframe-builder for production use with real data. |
| lucide-react | 0.577.0 | Icons | FXL standard. |

**Confidence:** HIGH -- recharts is the established FXL choice. TanStack Table is the dominant React table library. Versions verified via npm.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.8.9 | URL-based state for filters/periods | Dashboard filter state (period, centro de custo, comparison mode) should be URL-encoded so users can bookmark and share specific views. Works natively with Next.js App Router. |
| papaparse | 5.5.3 | CSV-specific parsing | Alternative to xlsx for CSV-only parsing. Faster and streaming-capable for large CSV files. Use alongside xlsx when CSV is the primary format. |
| clsx + tailwind-merge | (latest) | Class composition | Already used in FXL Core. Standard for conditional Tailwind classes in shadcn/ui components. |
| shadcn/ui | (latest) | UI component primitives | FXL standard. Generated projects use the same component library. Copy components into generated project (shadcn/ui is copy-paste by design, not a dependency). |

**Confidence:** HIGH for core libraries. MEDIUM for nuqs (strong fit but FXL has not used it before -- needs validation during implementation).

### Infrastructure & Deploy

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel | (platform) | Hosting & deployment | FXL standard (Tech Radar: Active). Auto-deploys from GitHub. Preview URLs per PR. Handles Next.js natively (it is Vercel's own framework). |
| GitHub | (platform) | Source control | FXL standard. One repo per client project. |
| GitHub Actions | (platform) | CI/CD | FXL standard (Tech Radar: In evaluation). Use for: `tsc --noEmit` gate, lint, test on PR. Lightweight -- Vercel handles actual deployment. |

**Confidence:** HIGH -- All are existing FXL standards.

### Code Generation Layer (in FXL Core)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js fs + path | (built-in) | File generation | The code generator lives in FXL Core's `tools/` directory and outputs files to a target directory. No need for a template engine library -- TypeScript template literals with the existing BlueprintConfig types are sufficient. The config is already structured data; transformation to code is straightforward. |
| Zod | 4.3.6 | Config validation before generation | Validate the TechnicalConfig (extended BlueprintConfig) before generating code. Catch errors at generation time, not at runtime in the generated project. |
| ts-morph | (latest) | AST-based code generation (optional) | For generating TypeScript files that need to be syntactically correct. Consider only if string-based templates become error-prone. Start without it. |

**Confidence:** MEDIUM -- The code generation approach (template-based vs AST-based) needs validation during implementation. Starting with simple string templates is the pragmatic choice; ts-morph is a fallback if complexity grows.

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint (flat config) | Linting | Next.js 16 uses flat ESLint config by default. `next build` no longer runs linter automatically (verified in docs). |
| Biome | Fast lint + format alternative | Next.js 16 supports Biome natively. Consider as ESLint replacement for speed. |
| Turbopack | Dev bundler | Default in Next.js 16. No configuration needed. |
| Vitest | Unit/integration testing | Compatible with Next.js via `@vitejs/plugin-react`. Preferred over Jest for speed and Vite ecosystem alignment. |

## Installation (Generated Project)

```bash
# Create project
npx create-next-app@latest [client-slug]-dashboard --yes

# Core data layer
npm install @supabase/supabase-js @tanstack/react-query zod date-fns

# Visualization
npm install recharts @tanstack/react-table lucide-react

# Data import
npm install xlsx papaparse

# URL state
npm install nuqs

# UI (then add shadcn components via CLI)
npx shadcn@latest init

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Installation (FXL Core -- Generator Tool)

```bash
# No new dependencies needed for basic generation
# The generator uses Node.js built-ins + existing Zod

# Only if AST-based generation is needed later:
npm install -D ts-morph
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 (App Router) | Vite + React SPA | Only if the dashboard has zero server-side needs (no CSV processing, no API routes). Unlikely for BI dashboards with data import. |
| Supabase | Prisma + PostgreSQL (self-hosted) | Only if client requires on-premise database or Supabase's free tier limits are exceeded. Prisma 7.4.2 is excellent but adds operational complexity FXL does not need. |
| Supabase Auth | NextAuth/Auth.js 4.24.x | Only if the client requires OAuth providers not supported by Supabase (rare). NextAuth adds complexity; Supabase Auth is simpler and already standardized at FXL. |
| recharts | Tremor / Nivo / Victory | Only if recharts cannot handle a specific visualization. Tremor is beautiful but opinionated (locks you into its design system). Nivo is powerful but heavier. FXL already has recharts expertise and component library. |
| xlsx (SheetJS) | ExcelJS | If the generated dashboard needs to also WRITE Excel files (reports export). ExcelJS is better at writing; SheetJS is better at reading/parsing. For import-only (Conta Azul use case), SheetJS is sufficient. |
| @tanstack/react-table | AG Grid / custom tables | AG Grid is more feature-complete but adds 200KB+ to bundle and has a commercial license for advanced features. TanStack Table is headless, free, and covers the drill-down/modal patterns in the blueprint. |
| Template string generation | Plop / Hygen / Yeoman | Full scaffolding tools add overhead for what is essentially "read BlueprintConfig, write files." FXL's generator is a custom tool anyway (it reads FXL-specific config). Generic scaffolders would need heavy customization. |
| Tailwind 3.x | Tailwind 4.x | Use Tailwind 4 only after FXL Core migrates. Generated projects should match the component library source. Tailwind 4's CSS-first config is a breaking change from the JS-based tailwind.config.ts. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Prisma for generated projects | Adds ORM complexity on top of Supabase. Supabase client already provides typed queries, RLS, and migrations. Double abstraction. | Supabase JS client directly |
| Redux / Zustand for dashboard state | React Query handles async state (data fetching). URL params handle filter state. Local state handles UI state. No global state store needed. | @tanstack/react-query + nuqs + useState |
| axios | Supabase client handles DB queries. fetch() handles any external API calls. axios adds unnecessary bundle size. FXL explicitly prohibits it. | Native fetch + Supabase client |
| Moment.js | Large bundle (300KB+), mutable API, officially in maintenance mode. | date-fns (tree-shakeable, immutable) |
| CSS-in-JS (styled-components, emotion) | FXL standard is Tailwind. CSS-in-JS adds runtime cost and conflicts with server components. | Tailwind CSS |
| D3.js directly | Low-level, imperative. recharts provides the declarative React wrapper FXL already uses. | recharts |
| Metabase / Superset embedded | Heavy, requires separate infrastructure, fights FXL's custom design system and component library. | Custom dashboard with recharts + TanStack Table |
| create-react-app (CRA) | Deprecated. No longer maintained. | Next.js (for generated projects) or Vite (for SPAs) |
| Webpack | Turbopack is now default in Next.js 16. Webpack is the fallback, not the primary. | Turbopack (default) |

## Stack Patterns by Variant

**If the generated dashboard is read-only (no data import, data loaded externally):**
- Skip xlsx/papaparse
- Supabase client-only queries are sufficient
- Could potentially use Vite + React SPA (no API routes needed)
- Still recommend Next.js for consistency across generated projects

**If the generated dashboard needs multi-tenant isolation:**
- Supabase RLS with organization_id pattern (already documented in `docs/build/techs/supabase.md`)
- Add organization selector in dashboard header
- Edge Functions for cross-tenant aggregation (admin views)

**If the generated dashboard needs scheduled data refresh (future):**
- Supabase Edge Functions with cron triggers
- Or Vercel Cron Jobs (built into Next.js on Vercel)
- Not needed for v1 (manual upload via Tela 9)

**If a future generated project needs Python data processing:**
- Supabase Edge Functions support Deno (not Python directly)
- Consider a separate Python microservice (FXL Tech Radar has Python "in evaluation")
- Route Handler in Next.js calls the Python service
- Not needed for v1 dashboard generation

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.1.6 | react@19.2.4, react-dom@19.2.4 | Next.js 16 requires React 19 canary. Uses canary releases with all stable React 19 features. |
| @supabase/supabase-js@2.98.0 | next@16.x | Supabase JS client works in both client and server components. Use `@supabase/ssr` helper for server-side auth in Next.js. |
| recharts@3.8.0 | react@19.x | recharts 3.x supports React 19. Major upgrade from 2.x with improved performance. |
| @tanstack/react-query@5.90.x | react@19.x | Full React 19 support. Use with Next.js App Router via QueryClientProvider in root layout. |
| @tanstack/react-table@8.21.x | react@19.x | Headless, no React version constraints. |
| tailwindcss@3.4.x | next@16.x | Tailwind 3 works with Next.js 16 via PostCSS. Do NOT use Tailwind 4 yet. |
| shadcn/ui | tailwindcss@3.x, react@19.x | shadcn/ui components are copied in. Ensure generated project uses matching Tailwind version. |
| nuqs@2.8.x | next@16.x | Built specifically for Next.js App Router. Handles URL state with server component support. |

## Key Architectural Decision: Why NOT Vite + React SPA

The FXL Tech Radar marks Vite + React as the default and Next.js as an exception. Generated BI dashboards are precisely the exception case, for these reasons:

1. **CSV/XLSX Processing**: Parsing large spreadsheet files (Conta Azul exports can be thousands of rows) should happen server-side. Route Handlers in Next.js handle this without a separate backend service.

2. **Data Aggregation**: KPIs, chart data, and table rollups involve SQL queries that benefit from server-side execution (closer to database, no client bundle overhead).

3. **Auth Flow**: Supabase Auth with Next.js App Router uses `@supabase/ssr` for proper cookie-based session management. Pure SPA auth is simpler but less secure (token in localStorage vs httpOnly cookies).

4. **Vercel Optimization**: Vercel is the FXL deploy standard. Next.js on Vercel gets edge caching, ISR, and zero-config serverless functions. A Vite SPA on Vercel is just static hosting -- wastes the platform.

5. **Consistency**: All generated dashboard projects use the same framework. One code generator, one deployment pattern, one debugging mental model.

## Sources

- Next.js 16.1.6 official docs (https://nextjs.org/docs/app/getting-started/installation) -- verified via WebFetch 2026-03-07. Confirmed: Turbopack default, React 19 canary, App Router standard.
- Next.js Route Handlers docs (https://nextjs.org/docs/app/api-reference/file-conventions/route) -- verified via WebFetch 2026-03-07. Confirmed: FormData handling, streaming, standard Web APIs.
- npm registry -- all version numbers verified via `npm view [package] version` on 2026-03-07.
- FXL internal documentation -- `docs/build/tech-radar.md`, `docs/build/techs/supabase.md`, `docs/build/techs/vercel.md`, `docs/build/techs/nextjs.md`, `docs/build/premissas-gerais.md`, `docs/build/seguranca.md`.
- FXL existing codebase -- `tools/wireframe-builder/types/blueprint.ts`, `clients/financeiro-conta-azul/wireframe/blueprint.config.ts`.

---
*Stack research for: Automated BI Dashboard Generation from Declarative Blueprints*
*Researched: 2026-03-07*
