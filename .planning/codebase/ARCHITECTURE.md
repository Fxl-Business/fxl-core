# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Content-driven SPA with docs-as-code rendering and a declarative wireframe toolkit

**Key Characteristics:**
- Markdown files in `docs/` are the single source of truth; every `.md` is a routable page parsed at build time via Vite's `import.meta.glob`
- The React app is a thin "shell" -- routing, layout, and rendering infrastructure -- not a feature-rich application
- Wireframes are config-driven: a typed JSON-like `BlueprintConfig` object declares screens and sections, rendered by a generic `BlueprintRenderer` pipeline
- No backend, no database, no API calls -- entirely static, deployed to Vercel as a SPA

## Layers

**Content Layer (docs/):**
- Purpose: Single source of truth for all process documentation, tech references, and operational guides
- Location: `docs/`
- Contains: Markdown files with YAML frontmatter and custom `{% tag %}` syntax
- Depends on: Nothing (raw files)
- Used by: `src/lib/docs-parser.ts` which bulk-imports all `.md` at build time

**Client Knowledge Layer (clients/):**
- Purpose: Per-client documentation, wireframe configs, and client-scoped CLAUDE.md
- Location: `clients/[client-slug]/`
- Contains: `docs/*.md` (briefing, blueprint, branding, changelog), `wireframe/blueprint.config.ts`, per-client `CLAUDE.md`
- Depends on: `tools/wireframe-builder/types/blueprint.ts` for type definitions
- Used by: Client page components in `src/pages/clients/`

**Tools Layer (tools/):**
- Purpose: Reusable AI-first toolkits -- currently the wireframe-builder
- Location: `tools/wireframe-builder/`
- Contains: Shared React components (cards, charts, tables, layout), type definitions, section renderers
- Depends on: `recharts` for charting, own type system in `types/blueprint.ts`
- Used by: Client wireframe viewers and the component gallery page

**App Shell Layer (src/):**
- Purpose: React application infrastructure -- routing, layout, markdown rendering, search
- Location: `src/`
- Contains: Entry point, router config, layout components, doc rendering pipeline, utility libs
- Depends on: Content layer (docs/), tools layer, client layer
- Used by: Browser (end-user)

## Data Flow

**Documentation Rendering (primary flow):**

1. Vite `import.meta.glob('/docs/**/*.md', { query: '?raw', eager: true })` in `src/lib/docs-parser.ts` bulk-loads all markdown at build time into a `docFiles` map
2. User navigates to e.g. `/processo/master`; `DocRenderer` calls `getDoc(location.pathname)` which maps URL path to `/docs/processo/master.md`
3. `getDoc` extracts YAML frontmatter via `extractFrontmatter()`, parses custom tags (`{% prompt %}`, `{% callout %}`, `{% operational %}`, `{% phase-card %}`) via `parseBody()`, and extracts headings via `extractHeadings()`
4. Returns a `ParsedDoc` object with `frontmatter`, `sections[]`, `headings[]`, `rawBody`
5. `DocRenderer` maps each `DocSection` to its component: `MarkdownRenderer`, `PromptBlock`, `Callout`, `Operational`, or `PhaseCard`
6. `MarkdownRenderer` renders standard markdown via `react-markdown` + `remark-gfm` with custom heading slug generation

**Client Doc Rendering:**

1. Client markdown files are imported statically with `?raw` suffix in `src/pages/clients/FinanceiroContaAzul/DocViewer.tsx`
2. URL param `:doc` selects from a hardcoded `docMap` (briefing, blueprint, branding, changelog)
3. Content rendered via shared `MarkdownRenderer` component (no custom tag parsing for client docs)

**Wireframe Rendering (config-driven):**

1. `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` exports a `BlueprintConfig` typed object with `screens[]`, each containing `sections[]` (discriminated union of 15+ section types)
2. `WireframeViewer` page loads the config, renders a dark sidebar for screen navigation, passes active screen to `BlueprintRenderer`
3. `BlueprintRenderer` renders `WireframeFilterBar` (if filters/compare switch present) and iterates `screen.sections` through `SectionRenderer`
4. `SectionRenderer` dispatches each section type to the appropriate renderer: `KpiGridRenderer`, `ChartRenderer`, `TableRenderer`, `InputRenderer`, `ConfigTableRenderer`, `ChartGridRenderer`, `InfoBlockRenderer`, `CalculoCardRenderer`
5. Each renderer maps the config to the corresponding shared component from `tools/wireframe-builder/components/`

**Search:**

1. `buildSearchIndex()` in `src/lib/search-index.ts` iterates all doc paths from `getAllDocPaths()`, fetches frontmatter, builds an array of `SearchEntry` objects
2. `SearchCommand` component (Cmd+K) groups entries by `badge` and uses `cmdk` for fuzzy search
3. Selection navigates via `react-router-dom`'s `useNavigate`

**State Management:**
- No global state management library
- All state is local React `useState` within components
- `compareMode` state flows from `BlueprintRenderer` down to section renderers as props
- Navigation state managed by `react-router-dom` via `BrowserRouter`

## Key Abstractions

**ParsedDoc / DocSection:**
- Purpose: Represents a parsed markdown document with typed sections
- Defined in: `src/lib/docs-parser.ts`
- Pattern: Discriminated union on `section.type` ('markdown' | 'prompt' | 'callout' | 'operational' | 'phase-card')

**BlueprintConfig / BlueprintSection:**
- Purpose: Declarative wireframe specification -- screens, sections, KPIs, charts, tables
- Defined in: `tools/wireframe-builder/types/blueprint.ts`
- Pattern: Discriminated union on `section.type` with 15 variants (kpi-grid, bar-line-chart, donut-chart, waterfall-chart, pareto-chart, calculo-card, data-table, drill-down-table, clickable-table, saldo-banco, manual-input, upload-section, config-table, info-block, chart-grid)
- Usage: Client writes a single `.config.ts` file; the renderer pipeline handles all visual output

**Section Renderers:**
- Purpose: Map each `BlueprintSection` variant to the correct component tree
- Location: `tools/wireframe-builder/components/sections/`
- Pattern: Switch dispatch in `SectionRenderer.tsx` routing to specialized renderers
- Files: `KpiGridRenderer.tsx`, `ChartRenderer.tsx`, `CalculoCardRenderer.tsx`, `TableRenderer.tsx`, `InputRenderer.tsx`, `ConfigTableRenderer.tsx`, `ChartGridRenderer.tsx`, `InfoBlockRenderer.tsx`

**NavItem tree:**
- Purpose: Defines the full sidebar navigation structure
- Location: Hardcoded in `src/components/layout/Sidebar.tsx`
- Pattern: Recursive tree of `{ label, href?, children? }` nodes rendered by `NavSection` component

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html` which includes `<script type="module" src="/src/main.tsx">`
- Responsibilities: Mounts `<App />` inside `<StrictMode>` on `#root`

**Router / App:**
- Location: `src/App.tsx`
- Triggers: `main.tsx` renders it
- Responsibilities: Defines all routes via `react-router-dom`. Layout wrapper (`<Layout />`) with `<Outlet />` for most routes; wireframe-view is outside Layout (full-screen)

**Doc Parser:**
- Location: `src/lib/docs-parser.ts`
- Triggers: Called by `DocRenderer` and `SearchCommand` at render time
- Responsibilities: Transforms raw markdown strings into structured `ParsedDoc` objects. All docs are pre-loaded at build time via `import.meta.glob`

**Blueprint Config (per client):**
- Location: `clients/[slug]/wireframe/blueprint.config.ts`
- Triggers: Imported by client wireframe viewer pages
- Responsibilities: Declares the complete wireframe specification for a client project

## Error Handling

**Strategy:** Minimal -- graceful fallback rendering with "not found" messages

**Patterns:**
- `getDoc()` returns `null` when no matching markdown file exists; `DocRenderer` renders a "Pagina nao encontrada" message
- `DocViewer` (client docs) shows "Documento nao encontrado" when URL param doesn't match `docMap`
- No try/catch blocks in the codebase; no error boundaries
- No runtime errors expected since all content is statically imported at build time

## Cross-Cutting Concerns

**Logging:** None -- no logging framework or console.log patterns in production code

**Validation:** TypeScript `strict: true` with `noUnusedLocals` and `noUnusedParameters` enforced at build time (`tsc --noEmit` runs before `vite build`). No runtime validation.

**Authentication:** None -- the app is a public static site

**Routing:** `react-router-dom` v6 with `BrowserRouter`. Catch-all routes for doc sections (`/processo/*`, `/build/*`, etc.) delegate to `DocRenderer`. Vercel rewrite rule (`vercel.json`) sends all paths to `index.html` for SPA routing.

**Path Aliases:** Three aliases configured in both `vite.config.ts` and `tsconfig.json`:
- `@/` -> `src/`
- `@tools/` -> `tools/`
- `@clients/` -> `clients/`

---

*Architecture analysis: 2026-03-06*
