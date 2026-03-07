# External Integrations

**Analysis Date:** 2026-03-06

## Summary

FXL Core is a fully static, client-side SPA with **zero external runtime integrations**. There are no API calls, no database connections, no authentication providers, and no server-side logic. All content is bundled at build time from Markdown files in `docs/`.

## APIs & External Services

**None.** The codebase makes no `fetch()`, `XMLHttpRequest`, or SDK calls. There are no API clients, no REST endpoints consumed, and no GraphQL queries.

The `docs/build/techs/` directory contains documentation about technologies (Supabase, Next.js, Kafka, etc.) that the FXL company uses for client projects, but these are **reference docs only** -- not integrated into this codebase.

## Data Storage

**Databases:**
- None. No database is used.

**File Storage:**
- Local filesystem only (Markdown files in `docs/`, `clients/`, `tools/`)
- All content is loaded at build time via Vite's `import.meta.glob` in `src/lib/docs-parser.ts`
- Client docs loaded via raw `?raw` imports in page components

**Caching:**
- None. Browser-native caching only (whatever Vercel CDN provides).

## Authentication & Identity

**Auth Provider:**
- None. The app has no authentication. It is an open internal tool.

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, LogRocket, or similar service.

**Logs:**
- None. No logging framework or service.

**Analytics:**
- None. No Google Analytics, Plausible, or similar.

## CI/CD & Deployment

**Hosting:**
- Vercel (static SPA deployment)
- Configuration: `vercel.json` with SPA rewrite rule (`/(.*) -> /index.html`)
- No serverless functions, no edge functions, no API routes

**CI Pipeline:**
- None detected. No `.github/workflows/`, no CI configuration files.
- Build validation is manual: `npm run build` (runs `tsc --noEmit && vite build`)

**Build Process:**
- Vite bundles all TypeScript/React code and Markdown content into static assets
- Markdown files are eagerly imported at build time (not fetched at runtime)
- Output: `dist/` directory deployed to Vercel

## Environment Configuration

**Required env vars:**
- None. The application has zero environment variable dependencies.

**Secrets location:**
- Not applicable. No secrets are needed.
- `.env` and `.env.local` are gitignored but do not exist and are not referenced in code.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

## Content Pipeline (Build-Time Integration)

While there are no runtime integrations, the build-time content pipeline is the closest thing to an integration:

**Markdown-to-UI Pipeline:**
1. Markdown files live in `docs/` with YAML frontmatter
2. Vite's `import.meta.glob('/docs/**/*.md', { query: '?raw', eager: true })` loads all files at build time
3. `src/lib/docs-parser.ts` parses frontmatter (via `yaml` package) and custom tags (`{% prompt %}`, `{% callout %}`, `{% operational %}`, `{% phase-card %}`)
4. `src/components/docs/MarkdownRenderer.tsx` renders content via `react-markdown` + `remark-gfm`

**Client Doc Pipeline:**
- Client markdown files in `clients/[slug]/docs/` are loaded via raw imports in page components
- Client wireframe configs in `clients/[slug]/wireframe/blueprint.config.ts` are TypeScript modules imported directly

**Key files:**
- `src/lib/docs-parser.ts` - Core parsing logic for docs pipeline
- `src/lib/search-index.ts` - Builds search index from all parsed docs
- `src/pages/DocRenderer.tsx` - Generic doc page renderer
- `vite-env.d.ts` - Type declaration for `*.md` raw imports

## Future Integration Notes

The `docs/build/techs/` directory documents the FXL tech stack for client projects, which includes Supabase, Next.js, Docker, Kubernetes, and others. Per `CLAUDE.md`: "SEM Supabase neste repositorio" (no Supabase in this repository). These technologies are used in separate client project repositories, not in fxl-core.

---

*Integration audit: 2026-03-06*
