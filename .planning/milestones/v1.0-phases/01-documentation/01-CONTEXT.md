# Phase 1: Documentation - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Reorganize docs navigation and content so operators find information naturally and onboard without hand-holding. This includes restructuring the sidebar, updating content to reflect the Claude Code + GSD workflow (replacing old Claude Project-centric docs), and creating a step-by-step onboarding guide.

</domain>

<decisions>
## Implementation Decisions

### Sidebar structure
- 4 top-level items: Home, Processo/Operacao, Ferramentas, Clientes
- "Build" section absorbed into Ferramentas (tech docs are reference material for tools)
- "Operacao" merged into "Processo" — one unified section covering both what the process is and how to operate it

### Processo/Operacao sub-items
- **Visao Geral** — replaces old "Master" page. Updated overview of the full process
- **Prompts** — new page with reusable prompts organized by context:
  - Prompts para Claude Code (com GSD)
  - Prompts para Claude Project
  - Prompts para melhorias de processo
  - Prompts para resolver bugs
- **Cliente vs Produto** — replaces old "BI Personalizado" and "Produto" pages. One page explaining the two project types:
  - Cliente: existing client, BI dashboard improvement
  - Produto: SaaS or fully custom system
- **Identidade FXL** — stays, covers FXL company brand identity
- **Fases 1-6** — each phase page restructured with: Resumo (2 linhas) → Operacao (o que fazer) → Detalhes
- **Remove:** "Pacote Cliente" (redundant with BI Personalizado/Cliente), old separate prompt docs

### Content updates
- Main change: process migrated from Claude Project → Claude Code + GSD. Docs referencing "cola no Claude Project" need updating
- Claude should review all 45 docs and identify what is outdated vs current
- Build/techs docs (tech-radar, premissas, seguranca, etc.) — Claude reviews each for accuracy, moves to Ferramentas section

### Page format inside each fase
- Structure: Resumo (2 linhas) → Operacao (o que voce precisa fazer) → Detalhes (como funciona, contexto tecnico)
- Keep concise — remove redundancy and filler content while preserving all technical and process information

### Onboarding page
- Step-by-step guide: "primeiro faca X, depois Y, depois Z"
- Primary audience: the founder himself (quick reference when forgetting process steps)
- Not a tutorial for beginners — a practical walkthrough for someone who knows the domain but needs process reminders

### Claude's Discretion
- Whether sidebar should be hardcoded or auto-generated from frontmatter (user said "you decide")
- Exact navigation labels and ordering within subsections
- How to handle docs that are partially outdated (rewrite vs delete)
- Format and depth of the onboarding page

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Sidebar.tsx`: NavItem tree with recursive NavSection component — already supports nested navigation, collapsible sections, active state tracking
- `docs-parser.ts`: Custom markdown parser with `{% tag %}` syntax, frontmatter extraction, `import.meta.glob` auto-discovery of all `docs/**/*.md`
- `DocRenderer.tsx`: Generic page renderer — any `.md` in `docs/` is already routable
- `SearchCommand.tsx`: Cmd+K search built from `search-index.ts` — auto-indexes all docs by frontmatter

### Established Patterns
- Navigation is hardcoded in `Sidebar.tsx` `navigation` array (tree of `NavItem`)
- Adding a new doc page requires: create `.md` in `docs/`, add entry to sidebar `navigation` array
- Frontmatter has `badge` field (Processo | Build | Referencias | Operacao) — could be used for auto-grouping
- Custom tags: `{% operational %}` for Claude-only sections, `{% callout %}` for highlights, `{% prompt %}` for copyable prompts

### Integration Points
- Route definitions in `App.tsx` — catch-all routes for `/processo/*`, `/build/*`, etc. may need updating
- `search-index.ts` groups by `badge` — needs to reflect new section names
- 45 markdown files across `docs/processo/`, `docs/build/`, `docs/referencias/`, `docs/operacao/`, `docs/ferramentas/`

</code_context>

<specifics>
## Specific Ideas

- Each fase page should start with operation (what to do), then explain details — "resumo + operacao" format
- Prompts page should account for GSD usage — prompts are now more about Claude Code workflows than Claude Project copy-paste
- The distinction between "Cliente" (existing BI client) and "Produto" (SaaS/custom system) is important to preserve but should be one page, not two separate doc trees
- Content should be objective and concise — current docs "enchem linguica" (too verbose, redundant)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-documentation*
*Context gathered: 2026-03-07*
