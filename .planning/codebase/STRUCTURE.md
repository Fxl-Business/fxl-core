# Codebase Structure

**Analysis Date:** 2026-03-06

## Directory Layout

```
fxl-core/
├── docs/                           # Source-of-truth markdown documentation
│   ├── processo/                   # Process docs (routing, POPs, phases, identity)
│   │   └── fases/                  # Phase docs (fase1.md through fase6.md)
│   ├── build/                      # Technical stack and deployment premisses
│   │   └── techs/                  # Individual tech reference pages (15 files)
│   ├── referencias/                # Reusable libraries (KPIs, blocks)
│   ├── operacao/                   # Operational guides (prompts, workflows)
│   └── ferramentas/                # Tool documentation
│
├── clients/                        # Client-specific data (scoped by slug)
│   └── financeiro-conta-azul/      # Only client currently
│       ├── CLAUDE.md               # Client-scoped AI instructions
│       ├── docs/                   # briefing.md, blueprint.md, branding.md, changelog.md
│       └── wireframe/              # blueprint.config.ts, index.tsx
│
├── tools/                          # AI-first shared toolkits
│   └── wireframe-builder/          # Wireframe toolkit
│       ├── components/             # 22 shared React components (KPI cards, charts, tables, layout)
│       │   └── sections/           # Section renderer pipeline (8 renderers + index)
│       └── types/                  # blueprint.ts type definitions
│
├── src/                            # React app shell
│   ├── components/
│   │   ├── layout/                 # Layout.tsx, Sidebar.tsx, TopNav.tsx, SearchCommand.tsx
│   │   ├── docs/                   # Doc rendering components (9 files)
│   │   └── ui/                     # shadcn/ui primitives (badge, button, dialog, etc.)
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── DocRenderer.tsx         # Generic markdown doc renderer
│   │   ├── docs/                   # ProcessDocsViewer.tsx (legacy/unused?)
│   │   ├── clients/
│   │   │   └── FinanceiroContaAzul/  # Index, DocViewer, Wireframe, WireframeViewer
│   │   └── tools/
│   │       └── ComponentGallery.tsx  # Wireframe component gallery + galleryMockData.ts
│   ├── lib/                        # Utility modules
│   │   ├── docs-parser.ts          # Markdown parsing + custom tag engine
│   │   ├── search-index.ts         # Search index builder
│   │   └── utils.ts                # cn() tailwind merge helper
│   └── styles/
│       └── globals.css             # Tailwind base + prose styles
│
├── public/                         # Static assets
├── dist/                           # Vite build output (committed)
│
├── CLAUDE.md                       # Root AI operational instructions
├── index.html                      # SPA entry point
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Vite config with path aliases
├── tsconfig.json                   # TypeScript config (strict mode)
├── tsconfig.node.json              # Node-specific TS config
├── tailwind.config.ts              # Tailwind + shadcn theme
├── postcss.config.js               # PostCSS for Tailwind
├── components.json                 # shadcn/ui config
├── vercel.json                     # SPA rewrite rule
├── Makefile                        # Build/dev commands
└── TODO.md                         # Task tracking
```

## Directory Purposes

**docs/:**
- Purpose: Single source of truth for all process, build, reference, and operational documentation
- Contains: `.md` files with YAML frontmatter and custom `{% tag %}` syntax
- Key files: `docs/processo/master.md` (process overview), `docs/build/tech-radar.md` (tech stack), `docs/operacao/prompt-abertura.md` (main prompt)
- Every `.md` here becomes a routable page at build time

**docs/processo/fases/:**
- Purpose: Individual phase documentation for the FXL delivery process
- Contains: `fase1.md` through `fase6.md` (Diagnostico, Wireframe, Desenvolvimento, Auditoria, Entrega, Tutorial)

**docs/build/techs/:**
- Purpose: Reference pages for individual technologies in the FXL tech radar
- Contains: 15 tech reference files (supabase.md, vercel.md, nextjs.md, docker.md, etc.)

**clients/[slug]/:**
- Purpose: All data scoped to a specific client project
- Contains: `CLAUDE.md` (client AI rules), `docs/` (client documentation), `wireframe/` (wireframe config)
- Key constraint: Never modify one client's folder when working on another

**clients/[slug]/wireframe/:**
- Purpose: Declarative wireframe specification for a client
- Contains: `blueprint.config.ts` (typed screen/section config), `index.tsx` (unused legacy?)
- Key file: `blueprint.config.ts` defines all screens, KPIs, charts, tables, filters

**tools/wireframe-builder/:**
- Purpose: Shared component library for building data-driven wireframes
- Contains: 22 reusable components, 8 section renderers, type definitions
- Key files: `types/blueprint.ts` (all type definitions), `components/BlueprintRenderer.tsx` (entry point), `components/sections/SectionRenderer.tsx` (dispatch)

**tools/wireframe-builder/components/sections/:**
- Purpose: Renderer pipeline that maps `BlueprintSection` types to component trees
- Contains: `SectionRenderer.tsx` (main dispatcher), `KpiGridRenderer.tsx`, `ChartRenderer.tsx`, `TableRenderer.tsx`, `CalculoCardRenderer.tsx`, `InputRenderer.tsx`, `ConfigTableRenderer.tsx`, `ChartGridRenderer.tsx`, `InfoBlockRenderer.tsx`

**src/components/layout/:**
- Purpose: Top-level application layout components
- Contains: `Layout.tsx` (sidebar + main content wrapper), `Sidebar.tsx` (navigation tree), `TopNav.tsx` (header bar), `SearchCommand.tsx` (Cmd+K search)

**src/components/docs/:**
- Purpose: Components for rendering parsed documentation
- Contains: `MarkdownRenderer.tsx`, `PromptBlock.tsx`, `Callout.tsx`, `Operational.tsx`, `PhaseCard.tsx`, `DocBreadcrumb.tsx`, `DocPageHeader.tsx`, `DocTableOfContents.tsx`, `InfoBlock.tsx`

**src/components/ui/:**
- Purpose: shadcn/ui primitive components (new-york style, slate base)
- Contains: `badge.tsx`, `button.tsx`, `dialog.tsx`, `separator.tsx`, `scroll-area.tsx`, `command.tsx`, `PromptBlock.tsx`
- Note: `PromptBlock.tsx` exists in BOTH `ui/` and `docs/` -- the `ui/` version is used by client pages

**src/pages/:**
- Purpose: Page-level React components (only for interactive pages, not doc content)
- Contains: `Home.tsx`, `DocRenderer.tsx`, client subpages, tool subpages

**src/lib/:**
- Purpose: Core utility modules
- Contains: `docs-parser.ts` (markdown parsing engine), `search-index.ts` (doc search index builder), `utils.ts` (Tailwind merge helper)

## Key File Locations

**Entry Points:**
- `index.html`: SPA HTML shell
- `src/main.tsx`: React root mount
- `src/App.tsx`: Router and route definitions

**Configuration:**
- `vite.config.ts`: Build tool config, path aliases (`@/`, `@tools/`, `@clients/`)
- `tsconfig.json`: TypeScript strict config, matching path aliases
- `tailwind.config.ts`: Theme (fxl brand colors, fonts), content paths
- `components.json`: shadcn/ui integration config
- `vercel.json`: SPA rewrite `/(.*) -> /index.html`

**Core Logic:**
- `src/lib/docs-parser.ts`: Markdown + custom tag parser -- the heart of the doc rendering system
- `src/lib/search-index.ts`: Builds searchable index from all doc frontmatter
- `src/pages/DocRenderer.tsx`: Generic page that renders any parsed doc
- `tools/wireframe-builder/types/blueprint.ts`: All wireframe type definitions
- `tools/wireframe-builder/components/sections/SectionRenderer.tsx`: Wireframe section dispatch

**Layout/Chrome:**
- `src/components/layout/Layout.tsx`: Main layout (TopNav + Sidebar + Outlet)
- `src/components/layout/Sidebar.tsx`: Full navigation tree (hardcoded)
- `src/components/layout/TopNav.tsx`: Top header with logo and search
- `src/components/layout/SearchCommand.tsx`: Cmd+K search dialog

**Styling:**
- `src/styles/globals.css`: Tailwind layers + custom `.prose` styles for markdown rendering

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `DocRenderer.tsx`, `KpiCard.tsx`)
- Utility modules: `kebab-case.ts` (e.g., `docs-parser.ts`, `search-index.ts`)
- Config files: `kebab-case.config.ts` (e.g., `blueprint.config.ts`)
- Markdown docs: `kebab-case.md` (e.g., `prompt-abertura.md`, `tech-radar.md`)
- shadcn/ui primitives: `lowercase.tsx` (e.g., `badge.tsx`, `button.tsx`, `dialog.tsx`)

**Directories:**
- Feature areas: `lowercase` (e.g., `docs`, `layout`, `ui`)
- Client folders: `kebab-case` matching client slug (e.g., `financeiro-conta-azul`)
- Client page folders in src: `PascalCase` (e.g., `FinanceiroContaAzul`)
- Tool folders: `kebab-case` (e.g., `wireframe-builder`)

**Exports:**
- Components: `export default function ComponentName()` (default exports)
- Types: Named exports via `export type`
- Utilities: Named exports via `export function`

## Where to Add New Code

**New Documentation Page:**
- Create: `docs/[section]/[page-name].md` with YAML frontmatter (title, badge, description)
- Add navigation entry: Hardcoded in `src/components/layout/Sidebar.tsx` `navigation` array
- No other changes needed -- `docs-parser.ts` auto-discovers via `import.meta.glob`

**New Client:**
- Create directory: `clients/[client-slug]/`
- Add `CLAUDE.md` with client identity and scope rules
- Add `docs/` with at minimum `briefing.md`
- Add `wireframe/blueprint.config.ts` when wireframe phase begins
- Create pages: `src/pages/clients/[PascalCaseName]/` with `Index.tsx`, `DocViewer.tsx`, `Wireframe.tsx`, `WireframeViewer.tsx`
- Register routes in `src/App.tsx`
- Add navigation entry in `src/components/layout/Sidebar.tsx`

**New Wireframe Component:**
- Add to: `tools/wireframe-builder/components/[ComponentName].tsx`
- Add type: In `tools/wireframe-builder/types/blueprint.ts` as new section variant in `BlueprintSection` union
- Add renderer: In `tools/wireframe-builder/components/sections/` (new file or extend existing)
- Register in: `tools/wireframe-builder/components/sections/SectionRenderer.tsx` switch statement
- Add to gallery: `src/pages/tools/ComponentGallery.tsx` categories array + `src/pages/tools/galleryMockData.ts`
- NEVER create wireframe components inside `clients/` folders

**New shadcn/ui Component:**
- Install via: `npx shadcn@latest add [component-name]`
- Location: `src/components/ui/[component].tsx`
- Config: `components.json` controls style (new-york), aliases, CSS variables

**New Doc Rendering Component (custom tag):**
- Add component: `src/components/docs/[Name].tsx`
- Add section type: Extend `DocSection` union in `src/lib/docs-parser.ts`
- Add parsing logic: In `parseBody()` switch statement in `src/lib/docs-parser.ts`
- Add rendering: In `SectionRenderer` switch in `src/pages/DocRenderer.tsx`

**New Utility:**
- Add to: `src/lib/[name].ts`
- Import via: `@/lib/[name]`

## Special Directories

**dist/:**
- Purpose: Vite production build output
- Generated: Yes (by `vite build`)
- Committed: Yes (appears in git)

**public/:**
- Purpose: Static assets served as-is (favicon, etc.)
- Generated: No
- Committed: Yes

**.claude/:**
- Purpose: Claude Code agent configs, custom commands, GSD workflow templates
- Generated: No
- Committed: Yes
- Contains: `agents/`, `commands/gsd/`, `get-shit-done/` (templates, references, workflows), `hooks/`

**.planning/:**
- Purpose: GSD planning artifacts (phases, codebase analysis)
- Generated: By GSD workflow
- Committed: Yes

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-03-06*
