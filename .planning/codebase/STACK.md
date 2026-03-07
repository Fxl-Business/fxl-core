# Technology Stack

**Analysis Date:** 2026-03-06

## Languages

**Primary:**
- TypeScript 5.6+ (`strict: true`) - All application code, components, configuration files
- CSS (via Tailwind utility classes) - Styling in `src/styles/globals.css`

**Secondary:**
- JavaScript (ESM) - PostCSS config only (`postcss.config.js`)
- YAML - Frontmatter in all `docs/**/*.md` files, parsed at runtime by `yaml` package
- Markdown - Primary content format; every `.md` in `docs/` renders as a page

## Runtime

**Environment:**
- Browser (SPA) - No server-side runtime. Fully client-side React app.
- Vite dev server for development (port 5173 default)
- ES2020 target (`tsconfig.json` `target: "ES2020"`)

**Package Manager:**
- npm (inferred from `package-lock.json` in `.gitignore`)
- Lockfile: excluded from git (listed in `.gitignore`)

## Frameworks

**Core:**
- React 18.3 - UI framework (`react`, `react-dom`)
- React Router DOM 6.27 - Client-side routing (`react-router-dom`)

**Styling:**
- Tailwind CSS 3.4 - Utility-first CSS framework
- tailwindcss-animate 1.0.7 - Animation plugin for Tailwind
- shadcn/ui - Component primitives (Radix-based, in `src/components/ui/`)

**Build/Dev:**
- Vite 5.4 - Build tool and dev server (`vite.config.ts`)
- @vitejs/plugin-react 4.3 - React Fast Refresh and JSX transform
- PostCSS 8.4 + Autoprefixer 10.4 - CSS processing pipeline (`postcss.config.js`)

**Testing:**
- Not configured. No test framework, no test files in source.

## Key Dependencies

**Critical (core app functionality):**
- `react-markdown` 9.0 - Renders all documentation content from `.md` files
- `remark-gfm` 4.0 - GitHub Flavored Markdown support (tables, strikethrough, etc.)
- `yaml` 2.4 - Parses YAML frontmatter from doc files in `src/lib/docs-parser.ts`
- `react-router-dom` 6.27 - All routing; SPA catch-all defined in `vercel.json`

**UI Primitives (shadcn/ui pattern):**
- `@radix-ui/react-dialog` 1.1 - Modal dialogs (`src/components/ui/dialog.tsx`)
- `@radix-ui/react-scroll-area` 1.2 - Scrollable containers (`src/components/ui/scroll-area.tsx`)
- `@radix-ui/react-separator` 1.1 - Visual separators (`src/components/ui/separator.tsx`)
- `@radix-ui/react-slot` 1.2 - Polymorphic component composition
- `@radix-ui/react-tooltip` 1.1 - Tooltips
- `cmdk` 1.1 - Command palette / search (`src/components/layout/SearchCommand.tsx`)
- `class-variance-authority` 0.7 - Variant-based component styling (`src/components/ui/badge.tsx`)
- `clsx` 2.1 + `tailwind-merge` 2.6 - Conditional class merging (`src/lib/utils.ts` `cn()` helper)

**Data Visualization (wireframe tool):**
- `recharts` 2.13 - Charts in wireframe components (bar, line, donut, waterfall, pareto)
- `lucide-react` 0.460 - Icon library used across all components

## Configuration

**TypeScript:**
- Config: `tsconfig.json` (app) + `tsconfig.node.json` (Vite config)
- `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- Module: ESNext with bundler resolution
- JSX: react-jsx (automatic runtime)
- Path aliases: `@/*` -> `src/*`, `@tools/*` -> `tools/*`, `@clients/*` -> `clients/*`

**Vite:**
- Config: `vite.config.ts`
- Plugin: `@vitejs/plugin-react`
- Path aliases mirror `tsconfig.json` paths
- Uses `import.meta.glob` for eager loading of all `docs/**/*.md` files

**Tailwind:**
- Config: `tailwind.config.ts`
- Dark mode: class-based (configured but light-only theme in practice)
- Content scan: `index.html`, `src/**`, `skills/**`, `clients/**`
- Custom colors: `fxl.navy`, `fxl.blue`, `fxl.navy-light`, `fxl.navy-dark`, `fxl.blue-muted`
- Custom fonts: Inter Variable (sans), JetBrains Mono (mono)
- CSS variables for shadcn/ui theming defined in `src/styles/globals.css`

**PostCSS:**
- Config: `postcss.config.js`
- Plugins: tailwindcss, autoprefixer

**Vite Env Types:**
- `vite-env.d.ts` - Declares `*.md` module type for raw markdown imports

**Environment Variables:**
- None used. No `import.meta.env` or `process.env` references in source code.
- `.env` and `.env.local` listed in `.gitignore` (for future use)

## Build Pipeline

**Scripts (from `package.json`):**
```bash
npm run dev       # vite (dev server with HMR)
npm run build     # tsc --noEmit && vite build (type-check then bundle)
npm run preview   # vite preview (preview production build)
npm run lint      # tsc --noEmit (type-checking only, no ESLint)
```

**Build output:** `dist/` directory (gitignored)

**Type checking is the acceptance gate.** `tsc --noEmit` must pass with zero errors before any task is considered complete. The `any` type is explicitly forbidden per project rules.

## Platform Requirements

**Development:**
- Node.js (version not pinned; no `.nvmrc`)
- npm for package management
- Modern browser for dev server

**Production:**
- Vercel (static SPA deployment)
- `vercel.json` rewrites all routes to `index.html` for SPA routing
- No server-side code, no API routes, no serverless functions

---

*Stack analysis: 2026-03-06*
