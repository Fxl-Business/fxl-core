# Module: Docs (Processo + Padroes)

## Scope

This module renders FXL documentation pages (processo, padroes, ferramentas, referencias).
Every .md file under docs/ is rendered as a page via the DocRenderer.

## Structure

- `manifest.tsx` — Module registration (routes, nav, icon)
- `components/` — MarkdownRenderer, Callout, Operational, PhaseCard, DocBreadcrumb, DocPageHeader, DocTableOfContents, InfoBlock, PageHeader, PromptBlock
- `pages/DocRenderer.tsx` — Main page that renders docs by slug
- `services/` — docs-service.ts (Supabase CRUD), docs-parser.ts (markdown parsing), search-index.ts (Cmd+K search index)
- `hooks/` — useDoc.ts (single doc loader), useDocsNav.ts (navigation tree)
- `types/` — (currently empty, types co-located in services)

## Rules

- Never import from other modules (tasks, clients, wireframe) directly
- Cross-module communication only via registry extensions
- UI components from @shared/ui/, utilities from @shared/utils/
- Platform imports from @platform/ (supabase, module-loader)
- Doc content lives in docs/ (not in this module) — this module only renders it

## Key Patterns

- DocRenderer resolves slug from URL params and uses useDoc hook
- MarkdownRenderer supports custom tags: callout, prompt, operational, phase-card
- search-index.ts builds a flat list from docs-service for Cmd+K
