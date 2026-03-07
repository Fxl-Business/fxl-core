# Architecture Research

**Domain:** Automated BI dashboard code generation from declarative blueprints
**Researched:** 2026-03-07
**Confidence:** HIGH (architecture derived from codebase analysis + verified stack decisions)

## System Overview

The generation system bridges two worlds: the **specification world** (FXL Core, where blueprints and configs live) and the **output world** (standalone client repos with functional BI dashboards). The architecture has five distinct layers.

```
FXL Core (specification world)
+-----------------------------------------------------------------+
|  +----------------+  +----------------+  +------------+          |
|  | BlueprintConfig|  |TechnicalConfig |  |  Branding  |          |
|  |  (existing)    |  |   (new)        |  |  (existing)|          |
|  +-------+--------+  +-------+--------+  +------+-----+         |
|          |                    |                   |               |
|          +----------+---------+-------------------+              |
|                     v                                            |
|  +---------------------------------------------+                |
|  |         Config Resolver                      |                |
|  |  Merges + validates + normalizes             |                |
|  |  all configs into GenerationManifest         |                |
|  +---------------------+-----+-----------------+                |
|                        v                                         |
|  +---------------------------------------------+                |
|  |         Generation Engine                    |                |
|  |  +-------------+  +-------------+            |                |
|  |  |  Scaffold   |  | Component   |            |                |
|  |  |  Generator  |  | Generator   |            |                |
|  |  +------+------+  +------+------+            |                |
|  |         |                |                   |                |
|  |  +------+----------------+------+            |                |
|  |  |     Template Registry       |            |                |
|  |  |  (TypeScript string templates)|           |                |
|  |  +-----------------------------+            |                |
|  +---------------------+-----------------------+                |
+-----------------------|-------------------------------------+
                        v
Output (standalone client repos -- Next.js 16 App Router)
+-----------------------------------------------------------------+
|  +----------+  +----------+  +----------+  +----------+          |
|  | Project  |  | Pages +  |  | Supabase |  | Route    |          |
|  | Scaffold |  |Components|  | Schema   |  | Handlers |          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                   |
|   Complete Next.js+Supabase project, ready to deploy on Vercel    |
+-----------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Location |
|-----------|----------------|----------|
| **BlueprintConfig** (existing) | Declares screens, sections, KPIs, charts, tables -- the "what" of the UI | `clients/[slug]/wireframe/blueprint.config.ts` |
| **TechnicalConfig** (new) | Declares data sources, business logic, auth model, design tokens -- the "how" | `clients/[slug]/wireframe/technical.config.ts` |
| **Branding** (existing) | Colors, typography, logo, visual identity | `clients/[slug]/docs/branding.md`, parsed to structured data |
| **Config Resolver** | Merges all three inputs, validates cross-references, produces GenerationManifest | `tools/project-generator/resolver/` |
| **Generation Engine** | Orchestrates file generation using typed string templates | `tools/project-generator/engine/` |
| **Scaffold Generator** | Creates Next.js 16 project skeleton: package.json, next.config, App Router layout, env setup | Template-based, runs once per project |
| **Component Generator** | Creates pages, components, hooks, types, and Supabase schema from the manifest | Template-based, runs per-screen and per-section |
| **Template Registry** | Stores all code templates with slots for dynamic content | TypeScript tagged template literals in `tools/project-generator/templates/` |

## Recommended Project Structure

### Generation Tool (lives in FXL Core)

```
tools/
+-- project-generator/              # the generation tool
    +-- SKILL.md                     # instructions for Claude Code
    +-- types/
    |   +-- technical-config.ts      # TechnicalConfig schema
    |   +-- generation-manifest.ts   # merged/resolved config
    |   +-- index.ts                 # re-exports
    +-- resolver/
    |   +-- config-resolver.ts       # merges Blueprint + Technical + Branding
    |   +-- validators/
    |   |   +-- data-source.ts       # validates data source references
    |   |   +-- cross-reference.ts   # validates section->datasource links
    |   |   +-- completeness.ts      # ensures no unresolved slots
    |   +-- index.ts
    +-- engine/
    |   +-- generator.ts             # main orchestrator
    |   +-- scaffold.ts              # Next.js project skeleton generation
    |   +-- pages.ts                 # page generation from screens
    |   +-- components.ts            # shared component generation
    |   +-- data-layer.ts            # hooks, queries, types from data sources
    |   +-- route-handlers.ts        # API Route Handler generation
    |   +-- supabase-schema.ts       # migrations from data model
    |   +-- config-files.ts          # env, package.json, next.config, etc.
    +-- templates/
    |   +-- scaffold/                # Next.js project skeleton templates
    |   |   +-- package.json.ts
    |   |   +-- next.config.ts.ts
    |   |   +-- tailwind.config.ts.ts
    |   |   +-- layout.tsx.ts        # root layout with providers
    |   |   +-- globals.css.ts
    |   +-- pages/                   # page templates by screen type
    |   |   +-- dashboard-page.tsx.ts
    |   |   +-- input-page.tsx.ts
    |   |   +-- config-page.tsx.ts
    |   +-- components/              # component templates by section type
    |   |   +-- kpi-grid.tsx.ts
    |   |   +-- chart-section.tsx.ts
    |   |   +-- data-table.tsx.ts
    |   |   +-- ...
    |   +-- data-layer/              # data access templates
    |   |   +-- use-query-hook.ts.ts
    |   |   +-- supabase-client.ts.ts
    |   |   +-- supabase-server.ts.ts  # server-side Supabase client
    |   |   +-- types.ts.ts
    |   +-- api/                     # Route Handler templates
    |   |   +-- upload-handler.ts.ts
    |   |   +-- data-handler.ts.ts
    |   +-- supabase/                # database templates
    |       +-- migration.sql.ts
    |       +-- rls-policy.sql.ts
    +-- output/                      # output structure definition
        +-- project-structure.ts     # defines the file tree to generate
```

### Generated Output (client repo -- Next.js 16 App Router)

```
[client-slug]-dashboard/
+-- CLAUDE.md                        # generated, references FXL Core docs
+-- README.md                        # generated project documentation
+-- .env.example                     # generated from TechnicalConfig
+-- package.json                     # Next.js 16 + exact pinned dependencies
+-- next.config.ts                   # Next.js configuration
+-- tsconfig.json                    # strict: true, path aliases
+-- tailwind.config.ts               # Tailwind 3.x with branding extend
+-- postcss.config.mjs
+-- public/
|   +-- favicon.ico
|   +-- logo.svg                     # from branding
+-- src/
|   +-- app/                         # Next.js App Router
|   |   +-- layout.tsx               # root layout (providers, sidebar)
|   |   +-- page.tsx                 # redirect to first screen
|   |   +-- (dashboard)/             # route group for authenticated pages
|   |   |   +-- layout.tsx           # dashboard layout (sidebar + header)
|   |   |   +-- resultado-mensal/
|   |   |   |   +-- page.tsx         # one per BlueprintScreen
|   |   |   +-- visao-receita/
|   |   |   |   +-- page.tsx
|   |   |   +-- upload/
|   |   |   |   +-- page.tsx
|   |   |   +-- configuracoes/
|   |   |       +-- page.tsx
|   |   +-- api/                     # Route Handlers
|   |   |   +-- upload/
|   |   |   |   +-- route.ts         # CSV/XLSX parsing endpoint
|   |   |   +-- data/
|   |   |       +-- [screen]/
|   |   |           +-- route.ts     # data aggregation per screen
|   |   +-- login/
|   |       +-- page.tsx             # auth page (outside dashboard layout)
|   +-- components/
|   |   +-- ui/                      # shadcn/ui (generated via CLI)
|   |   +-- layout/
|   |   |   +-- Sidebar.tsx          # generated from screen list
|   |   |   +-- Header.tsx           # generated with period selector + filters
|   |   +-- dashboard/               # generated from BlueprintConfig sections
|   |   |   +-- KpiGrid.tsx
|   |   |   +-- ChartSection.tsx
|   |   |   +-- DataTable.tsx
|   |   |   +-- DrillDownTable.tsx
|   |   |   +-- CompareSwitch.tsx
|   |   |   +-- ...
|   |   +-- shared/
|   |       +-- FilterBar.tsx
|   |       +-- SkeletonLoader.tsx
|   |       +-- EmptyState.tsx       # "upload your first report" CTA
|   +-- hooks/
|   |   +-- use-auth.ts              # Supabase Auth with cookie sessions
|   |   +-- use-filters.ts           # URL-based filter state via nuqs
|   |   +-- use-app-config.ts        # shared config from Tela 10 data
|   |   +-- queries/                 # one hook per data concern
|   |       +-- use-resultado-mensal.ts
|   |       +-- use-receita.ts
|   |       +-- use-compare-data.ts  # shared compare-mode data fetching
|   |       +-- ...
|   +-- lib/
|   |   +-- supabase/
|   |   |   +-- client.ts            # browser Supabase client
|   |   |   +-- server.ts            # server-side Supabase client
|   |   |   +-- middleware.ts        # auth middleware for Next.js
|   |   +-- utils.ts
|   |   +-- format.ts                # Brazilian number/date formatting
|   +-- types/
|   |   +-- database.ts              # generated from Supabase schema
|   |   +-- index.ts
|   +-- styles/
|       +-- globals.css              # generated from Branding tokens
+-- supabase/
|   +-- migrations/
|       +-- 001_create_tables.sql    # generated from TechnicalConfig.dataSources
|       +-- 002_create_rls.sql       # generated RLS policies (MANDATORY)
|       +-- 003_create_config.sql    # configuration tables
+-- docs/
    +-- CHANGELOG.md
    +-- ARCHITECTURE.md              # generated: screen->component->data mapping
    +-- DEPLOY.md                    # generated: env vars and Vercel setup
```

### Structure Rationale

- **Next.js 16 App Router** over Vite+React: Generated dashboards need API Route Handlers for server-side CSV/XLSX parsing, data aggregation, and secure cookie-based auth. This is the documented "exception" case in FXL's Tech Radar. Next.js on Vercel gets serverless functions, edge caching, and auto-deployment -- a pure SPA wastes the platform.
- **`src/app/` directory with route groups**: `(dashboard)/` groups authenticated pages under a shared layout with sidebar and header. `login/` sits outside the dashboard layout. `api/` contains Route Handlers for upload and data processing.
- **`tools/project-generator/`**: Follows the existing `tools/wireframe-builder/` pattern -- each tool has its own SKILL.md, types, and implementation. The generator is a tool within FXL Core, not a standalone CLI.
- **resolver/ separate from engine/**: Validation and normalization happen before generation. If the config is invalid, fail fast with clear errors rather than generating broken code.
- **TypeScript string templates over EJS**: The generator is TypeScript-native. Using tagged template literals keeps templates type-checkable and avoids a runtime dependency on a template engine. Templates are `.ts` files that export string-generating functions.
- **Generated output follows premissas-gerais.md**: The output project structure matches the FXL standard conventions (path aliases, component naming, hook patterns, TypeScript strict mode).

## Architectural Patterns

### Pattern 1: Three-Config Merge (Blueprint + Technical + Branding)

**What:** The generation system reads three independent configs, each owned by a different stage of the FXL process, and merges them into a single `GenerationManifest` that the engine consumes.

**Why this way:** BlueprintConfig defines structure (authored during wireframing). TechnicalConfig defines behavior (authored during the new "Configuracao Tecnica" step). Branding defines appearance (authored during branding session). Forcing them into one file would block one concern from being completed independently.

**Example:**
```typescript
// types/generation-manifest.ts
type GenerationManifest = {
  project: {
    slug: string
    label: string
    framework: 'nextjs'         // Next.js 16 App Router
    deploy: 'vercel'
  }
  auth: {
    method: 'email-password' | 'magic-link'
    roles: RoleConfig[]
    productionDomain: string    // for Supabase redirect URLs
  }
  design: {
    colors: ColorPalette
    typography: TypographyConfig
    logo: string
  }
  screens: ResolvedScreen[]     // BlueprintScreen + data bindings
  dataSources: ResolvedDataSource[]
  supabase: {
    tables: TableDefinition[]
    rlsPolicies: RlsPolicy[]
    views: ViewDefinition[]     // for KPI aggregations
  }
  routeHandlers: RouteHandlerDef[]  // API endpoints for upload + data
}

// resolver/config-resolver.ts
function resolveManifest(
  blueprint: BlueprintConfig,
  technical: TechnicalConfig,
  branding: BrandingConfig
): GenerationManifest {
  // 1. Validate each config independently (Zod schemas)
  // 2. Cross-validate: every section references a valid data source
  // 3. Merge into unified manifest
  // 4. Resolve defaults for optional fields
  // 5. Generate derived structures (Route Handler defs, view defs)
}
```

### Pattern 2: Section-to-Component Mapping (Discriminated Union Dispatch)

**What:** The existing wireframe system uses discriminated unions (`BlueprintSection.type`) to dispatch to the correct renderer. The code generation system reuses this exact pattern -- each section type maps to a component template and a data-layer template.

**Why this way:** The pattern is already proven in `SectionRenderer.tsx`. Adding a new section type means adding to three places: BlueprintSection union, wireframe renderer, and generator template. This is manageable and keeps each concern independent.

**Example:**
```typescript
// engine/components.ts
const SECTION_TEMPLATES: Record<BlueprintSection['type'], TemplateGenerator> = {
  'kpi-grid': generateKpiGrid,
  'bar-line-chart': generateChartSection,
  'donut-chart': generateChartSection,
  'waterfall-chart': generateChartSection,
  'pareto-chart': generateChartSection,
  'calculo-card': generateCalculoCard,
  'data-table': generateDataTable,
  'drill-down-table': generateDrillTable,
  'clickable-table': generateClickTable,
  'saldo-banco': generateInputSection,
  'manual-input': generateInputSection,
  'upload-section': generateUploadSection,
  'config-table': generateConfigTable,
  'info-block': generateInfoBlock,
  'chart-grid': generateChartGrid,
}
```

### Pattern 3: Data-Layer Abstraction (Query Hooks from Config)

**What:** The TechnicalConfig defines data sources. The generator produces typed query hooks that pages consume. Pages never call Supabase directly -- they use generated hooks like `useResultadoMensal()`.

**Why this way:** Generates more files, but each file is simple and testable. The alternative (inline Supabase queries in pages) creates coupling and violates the FXL "components under 150 lines" rule.

**Example:**
```typescript
// Generated: src/hooks/queries/use-resultado-mensal.ts
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

type ResultadoMensalFilters = {
  periodo: { start: string; end: string }
  centroCusto?: string
}

export function useResultadoMensal(filters: ResultadoMensalFilters) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['resultado-mensal', filters],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select('*')
        .gte('data', filters.periodo.start)
        .lte('data', filters.periodo.end)
      if (filters.centroCusto) {
        query = query.eq('centro_custo', filters.centroCusto)
      }
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}
```

### Pattern 4: Server-Side Data Processing via Route Handlers

**What:** Heavy operations (CSV/XLSX parsing, data aggregation, KPI computation) run in Next.js Route Handlers, not in the browser. The generated project uses the App Router's `route.ts` convention.

**Why this way:** CSV files can be thousands of rows. SheetJS parsing in the browser is slow and increases client bundle size. Route Handlers run server-side on Vercel's serverless functions, with direct database access and no CORS issues.

**Example:**
```typescript
// Generated: src/app/api/upload/route.ts
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const formData = await request.formData()
  const file = formData.get('file') as File
  const type = formData.get('type') as 'contas-receber' | 'contas-pagar'

  // Parse spreadsheet server-side
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet)

  // Validate column structure (Zod schema from TechnicalConfig)
  // Normalize Brazilian formats
  // Insert into Supabase
  // Return validation results

  return Response.json({ imported: rows.length, errors: [] })
}
```

### Pattern 5: Concrete Code Generation (Not Runtime Config)

**What:** The generator produces concrete, page-specific code. Each generated page looks like a developer wrote it by hand. The config is consumed at generation time, not at runtime.

**Why this way:** The generated project must be fully standalone. Claude Code must be able to maintain and modify it without understanding the generator. If the output is an opaque runtime engine that reads config, it becomes a black box.

**What to avoid:** Generating a generic "DashboardEngine" component that reads config at runtime. This hides complexity and makes the generated project unmaintainable.

## Data Flow

### Primary Flow: Blueprint to Running Code

```
[BlueprintConfig]     [TechnicalConfig]     [Branding]
  (screens,             (data sources,        (colors,
   sections,             business logic,       typography,
   filters)              auth, deploy)         logo)
       |                      |                    |
       +----------+-----------+--------------------+
                  v
         [Config Resolver]
         - Validate each config (Zod)
         - Cross-reference sections <-> data sources
         - Resolve defaults
         - Produce GenerationManifest
                  |
                  v
         [Generation Engine]
                  |
    +-------------+------------------+--------------+
    v             v                  v              v
[Scaffold    [Page              [Route         [Supabase
 Generator]   Generator]        Handlers]       Schema]
    |             |                  |              |
    |        +----+----+       +----+----+         |
    |        v         v       v         v         |
    |    [Pages]  [Components] [Upload]  [Data]    |
    |                                              |
    +------+---------------------------------------+
           v
    [File Writer]
    - Write all generated files to target directory
    - Run prettier/eslint fix
    - Run tsc --noEmit to validate
           |
           v
    [Client Repo]
    - npx create-next-app@latest already ran
    - Files written into project
    - npm install && npm run dev
```

### Data Flow in Running Dashboard

```
[User uploads CSV]
    |
    v
[Route Handler: /api/upload]  (server-side)
    |-- Parse with xlsx
    |-- Validate with Zod schema
    |-- Normalize Brazilian formats
    |-- Insert into Supabase
    v
[Supabase PostgreSQL]
    |-- Raw transacoes table
    |-- Views for KPI aggregations
    |-- Config tables (groups, banks, thresholds)
    v
[Query Hooks] (@tanstack/react-query)
    |-- useResultadoMensal(filters)
    |-- useReceita(filters)
    |-- useCompareData(screenId, periodA, periodB)
    |-- useAppConfig()
    v
[Page Components] (Next.js App Router pages)
    |-- Compose hooks + section components
    |-- Manage filter state via nuqs (URL params)
    |-- Pass data to presentation components
    v
[Section Components] (recharts, TanStack Table, KPI cards)
    |-- Render visualizations
    |-- Handle compare mode display
    |-- Apply semaphore colors from config
```

## TechnicalConfig Schema (New -- Core Innovation)

The most significant new type in the system. This bridges wireframe and functional system.

```typescript
type TechnicalConfig = {
  slug: string                          // must match BlueprintConfig.slug
  project: {
    framework: 'nextjs'                 // Next.js 16 App Router
    deploy: 'vercel'
    name: string
    productionDomain: string            // for Supabase redirect URLs
  }
  auth: {
    method: 'email-password' | 'magic-link'
    roles: {
      id: string
      label: string
      permissions: ('view' | 'upload' | 'configure' | 'admin')[]
    }[]
  }
  dataSources: DataSourceConfig[]
  dataIngestion: {
    uploadTypes: {
      id: string                        // e.g., 'contas-receber'
      label: string
      expectedColumns: {
        name: string
        type: 'text' | 'numeric' | 'date' | 'enum'
        required: boolean
        format?: string                 // e.g., 'DD/MM/YYYY', 'BRL'
      }[]
      targetTable: string               // Supabase table
      normalizationRules: {
        column: string
        rule: 'trim' | 'uppercase' | 'parse-brl' | 'parse-date-br'
      }[]
    }[]
  }
  businessLogic: {
    kpiCalculations: {
      screenId: string
      kpiLabel: string
      formula: string                   // e.g., "SUM(valor) WHERE tipo='receita'"
      dataSourceId: string
      formatSpec: { type: 'currency-brl' | 'percentage' | 'number'; precision?: number }
    }[]
    comparisons: {
      screenId: string
      periodType: 'mensal' | 'anual'
      defaultComparison: 'previous-period' | 'same-period-last-year'
      invertedCostLines?: string[]      // lines where cost decrease = green
    }[]
    crossScreenDeps: {
      sourceScreen: string              // e.g., 'configuracoes'
      sourceTable: string
      consumingScreens: string[]
      description: string
    }[]
  }
  design: {
    brandingRef: string                 // path to branding.md
    sidebarStyle: 'dark'
    accentColor: string
  }
}

type DataSourceConfig = {
  id: string
  table: string
  description: string
  columns: {
    name: string
    type: 'text' | 'numeric' | 'date' | 'boolean' | 'enum'
    nullable: boolean
    description: string
    enumValues?: string[]
  }[]
  primaryKey: string
  userScoped: boolean                   // if true, add RLS per user/org
  filters: {
    uiFilterKey: string                 // matches BlueprintScreen.filters[].key
    column: string
    operator: 'eq' | 'gte' | 'lte' | 'in' | 'ilike'
  }[]
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic Config
**What:** Put everything (screens, data sources, auth, branding, deploy) in one file.
**Why bad:** The blueprint.config.ts for financeiro-conta-azul is already 1400+ lines. Adding data sources, auth, and branding would make it unmanageable. Each config is authored at a different time.
**Instead:** Three separate configs merged by the Config Resolver.

### Anti-Pattern 2: Runtime Config Engine
**What:** Generate a "framework" that reads config at runtime.
**Why bad:** Claude Code cannot reason about or modify a black-box engine. The client project becomes opaque. Post-generation customization is impossible.
**Instead:** Generate concrete, readable, page-specific code. The config is consumed at generation time only.

### Anti-Pattern 3: Logic in Templates
**What:** Put complex business logic inside template strings.
**Why bad:** Templates become untestable. A bug produces broken TypeScript that fails silently.
**Instead:** Keep templates simple. Complex logic goes into helper functions in the engine layer that are unit-testable.

### Anti-Pattern 4: Generated Code Depends on FXL Core
**What:** The output project imports from `tools/project-generator/`.
**Why bad:** The output must be fully standalone with its own repo, Vercel, and package.json.
**Instead:** All shared patterns are generated as local files. Zero runtime dependency on FXL Core.

### Anti-Pattern 5: Generating Untypeable Code
**What:** Components with props typed as `Record<string, unknown>` or dynamic access.
**Why bad:** FXL mandates `strict: true` and zero `any`. Generated code must pass `tsc --noEmit`.
**Instead:** Generate explicit types for every prop, return type, and query result.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-5 clients | Run generator manually via Claude Code. Templates in FXL Core, output repos created by hand. |
| 5-20 clients | Add a CLI wrapper that scaffolds the client repo, runs the generator, and initializes git. Templates stabilize from real usage. |
| 20+ clients | Consider a web UI in FXL Core that previews generated output. Template versioning becomes important. |

## Suggested Build Order

```
Phase 1: TechnicalConfig Schema + Config Resolver
   |      Define the new type system. Validate against pilot client.
   |      No dependency on templates or engine.
   v
Phase 2: Scaffold Generator + Template Registry
   |      Generate a runnable (empty) Next.js 16 project from config.
   |      Depends on: resolved manifest types from Phase 1.
   v
Phase 3: Component Generator + Route Handlers + Data Layer
   |      The core generation: pages, components, hooks, API routes, schema.
   |      Depends on: templates from Phase 2, manifest from Phase 1.
   v
Phase 4: End-to-End Pipeline + Pilot Validation
          Wire everything together, run on financeiro-conta-azul.
          Depends on: all previous phases.
```

## Sources

- FXL Core codebase: `tools/wireframe-builder/types/blueprint.ts` (15-type discriminated union)
- FXL Core codebase: `tools/wireframe-builder/components/BlueprintRenderer.tsx` (rendering pipeline)
- FXL Core codebase: `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` (1400+ lines, 10 screens)
- FXL Core codebase: `docs/build/premissas-gerais.md` (output project structure standard)
- FXL Core codebase: `docs/build/techs/supabase.md` (data layer standard + RLS patterns)
- FXL Core codebase: `docs/build/techs/nextjs.md` (exception case documentation)
- FXL Core codebase: `docs/processo/fases/fase3.md` (development phase documentation)
- Next.js 16.1.6 official docs -- verified 2026-03-07: App Router, Route Handlers, Turbopack default
- npm registry -- all versions verified 2026-03-07

---
*Architecture research for: Automated BI dashboard code generation from declarative blueprints*
*Researched: 2026-03-07*
