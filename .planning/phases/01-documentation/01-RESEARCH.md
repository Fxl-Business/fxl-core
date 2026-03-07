# Phase 1: Documentation - Research

**Researched:** 2026-03-07
**Domain:** Documentation reorganization, navigation, content migration
**Confidence:** HIGH

## Summary

Phase 1 restructures the FXL Core documentation: a new sidebar with 4 top-level sections (Home, Processo/Operacao, Ferramentas, Clientes), content updates to reflect the Claude Code + GSD workflow (replacing Claude Project references), and a new onboarding page. The codebase has 45 markdown files across 5 directories, a hardcoded sidebar navigation in `Sidebar.tsx`, catch-all route handlers in `App.tsx`, and a search index that groups docs by the `badge` frontmatter field.

The work is entirely within existing infrastructure. No new libraries needed. The docs-parser auto-discovers files via `import.meta.glob('/docs/**/*.md')`, DocRenderer renders any `.md` in docs/, and routes use catch-all patterns. The main engineering tasks are: rewriting the `navigation` array in Sidebar.tsx, moving/renaming files between directories, updating frontmatter `badge` values for search grouping, fixing broken internal references, and rewriting content that references Claude Project workflows.

**Primary recommendation:** Work in three waves -- (1) restructure sidebar + move files + update badges, (2) rewrite/update content for all docs, (3) create onboarding page. Each wave should end with `npx tsc --noEmit` passing.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 4 top-level sidebar items: Home, Processo/Operacao, Ferramentas, Clientes
- "Build" section absorbed into Ferramentas
- "Operacao" merged into "Processo" -- one unified section
- Processo sub-items: Visao Geral, Prompts (new), Cliente vs Produto (new), Identidade FXL, Fases 1-6
- Remove: "Pacote Cliente", old separate prompt docs
- Each fase page restructured: Resumo (2 linhas) -> Operacao (o que fazer) -> Detalhes
- Content migrated from Claude Project -> Claude Code + GSD workflow
- Build/tech docs move to Ferramentas section
- Onboarding page: step-by-step for the founder, not a beginner tutorial

### Claude's Discretion
- Whether sidebar should be hardcoded or auto-generated from frontmatter
- Exact navigation labels and ordering within subsections
- How to handle docs that are partially outdated (rewrite vs delete)
- Format and depth of the onboarding page

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOCS-01 | Sidebar reorganizada com navegacao que reflete a estrutura do processo | Full sidebar structure analysis (current nav tree, new nav tree, route changes needed) |
| DOCS-02 | Conteudo dos docs revisado e atualizado para refletir processo atual | Complete doc inventory with status (keep/rewrite/move/delete), broken references catalog, Claude Project patterns identified |
| DOCS-03 | Pagina de onboarding que guia novos operadores pelo processo | Onboarding content requirements, recommended format, integration points |
</phase_requirements>

## Doc Inventory

### Complete File List with Status

Total files found: 45 markdown files across `docs/`.

#### docs/processo/ (10 files)

| File | Current Badge | Status | Action | Reason |
|------|--------------|--------|--------|--------|
| `processo/index.md` | Processo | Outdated | **Rewrite** | Must become "Processo/Operacao" landing page with new sub-items |
| `processo/master.md` | Processo | Outdated | **Rewrite -> visao-geral.md** | Rename to visao-geral.md. Content references `POP_BI_PERSONALIZADO.md` and `POP_PRODUTO.md` (wrong paths). Rewrite as process overview |
| `processo/bi-personalizado.md` | Processo | Partially outdated | **Merge -> cliente-vs-produto.md** | Merge with produto.md into single page. References `docs/processo/master/POP_MASTER.md` (wrong path) |
| `processo/produto.md` | Processo | Partially outdated | **Merge -> cliente-vs-produto.md** | Merge with bi-personalizado.md. References `docs/processo/master/POP_MASTER.md` (wrong path) |
| `processo/identidade.md` | Processo | Current | **Keep** | Content is fine. Badge stays Processo |
| `processo/pacote-cliente.md` | Processo | Outdated | **Delete** | Heavily Claude Project-centric. References wrong paths (`docs/suporte/`, `docs/process/`). Decided to remove |
| `processo/prompt-master.md` | Processo | Outdated | **Delete or merge into Prompts page** | Claude Project prompt. Content can be absorbed into new Prompts page if still relevant |
| `processo/fases/fase1.md` | Processo | Partially outdated | **Rewrite** | Solid content but needs Resumo->Operacao->Detalhes restructure. References `docs/suporte/biblioteca_kpis.md` (wrong path) |
| `processo/fases/fase2.md` | Processo | Partially outdated | **Rewrite** | References Claude Project workflow heavily. References `docs/suporte/biblioteca_kpis.md` and `docs/build/wireframe/blocos_disponiveis.md` (wrong paths) |
| `processo/fases/fase3.md` | Processo | Outdated | **Rewrite** | References Lovable (deprecated), `docs/build/arquitetura/` paths (wrong), `docs/build/design/design_system.md` (nonexistent). Needs major cleanup |
| `processo/fases/fase4.md` | Processo | Current | **Rewrite (minor)** | Content is solid. Needs Resumo->Operacao->Detalhes restructure |
| `processo/fases/fase5.md` | Processo | Current | **Rewrite (minor)** | Same -- restructure format only |
| `processo/fases/fase6.md` | Processo | Current | **Rewrite (minor)** | Same -- restructure format only |

#### docs/operacao/ (5 files)

| File | Current Badge | Status | Action | Reason |
|------|--------------|--------|--------|--------|
| `operacao/index.md` | Operacao | Outdated | **Delete** | Section is being merged into Processo. Index page no longer needed |
| `operacao/fluxo-trabalho.md` | Operacao | Outdated | **Merge into Visao Geral or Prompts** | Describes Claude Project workflow. Core flow info should go into visao-geral or onboarding. References `skills/` (should be `tools/`) |
| `operacao/padrao-prompt-code.md` | Operacao | Partially outdated | **Merge into Prompts page** | Prompt structure is useful but framed for Claude Project -> Claude Code workflow |
| `operacao/padrao-conversa-project.md` | Operacao | Outdated | **Merge into Prompts page or delete** | Entirely Claude Project focused. May have useful patterns to extract for Prompts page |
| `operacao/prompt-abertura.md` | Operacao | Outdated | **Merge into Prompts page** | Claude Project opening prompt. Adapt for Claude Code + GSD context |

#### docs/build/ (8 files + 15 tech files = 23 files)

| File | Current Badge | Status | Action | Reason |
|------|--------------|--------|--------|--------|
| `build/index.md` | Build | Outdated | **Delete** | Build section absorbed into Ferramentas. References wrong paths (`docs/build/arquitetura/`) |
| `build/tech-radar.md` | Build | Current | **Move to ferramentas/** | Content is accurate. Change badge to Ferramentas, update internal links |
| `build/premissas-gerais.md` | Build | Current | **Move to ferramentas/** | Content is accurate. Change badge |
| `build/seguranca.md` | Build | Current | **Move to ferramentas/** | Content is accurate. Change badge |
| `build/testes.md` | Build | Current | **Move to ferramentas/** | Content is accurate. Change badge |
| `build/master-prompt.md` | Build | Current | **Move to ferramentas/** | Sprint template, content is good. Change badge |
| `build/claude-md-template.md` | Build | Current | **Move to ferramentas/** | CLAUDE.md template, content is good. Change badge |
| `build/techs/*.md` (15 files) | Build | Current | **Move to ferramentas/techs/** | All 15 tech pages have accurate content. Change badges |

#### docs/ferramentas/ (2 files)

| File | Current Badge | Status | Action | Reason |
|------|--------------|--------|--------|--------|
| `ferramentas/index.md` | Ferramentas | Outdated | **Rewrite** | Must become landing page for Ferramentas + Build content (absorbs Build) |
| `ferramentas/wireframe-builder.md` | Ferramentas | Current | **Keep** | Content is fine |

#### docs/referencias/ (3 files)

| File | Current Badge | Status | Action | Reason |
|------|--------------|--------|--------|--------|
| `referencias/index.md` | Referencias | Current | **Keep or delete** | References section becomes sub-section of Ferramentas/Wireframe Builder. May not need its own index |
| `referencias/biblioteca-kpis.md` | Referencias | Current | **Keep** | Content is accurate. Stays under Wireframe Builder references |
| `referencias/blocos-disponiveis.md` | Referencias | Current | **Keep** | Content is accurate. Stays under Wireframe Builder references |

### New Files to Create

| File | Badge | Purpose |
|------|-------|---------|
| `processo/visao-geral.md` | Processo | Replaces master.md. Updated process overview |
| `processo/prompts.md` | Processo | New page. GSD-focused prompts consolidated from operacao/* |
| `processo/cliente-vs-produto.md` | Processo | Merges bi-personalizado.md + produto.md |
| `processo/onboarding.md` | Processo | New onboarding page for DOCS-03 |

### Summary by Action

| Action | Count | Files |
|--------|-------|-------|
| Keep as-is | 5 | identidade, wireframe-builder, biblioteca-kpis, blocos-disponiveis, referencias/index |
| Rewrite | 8 | processo/index, visao-geral (from master), fases 1-6, ferramentas/index |
| Move (badge change) | 22 | All build/* files (7 non-tech + 15 techs) |
| Merge | 6 | bi-personalizado + produto -> cliente-vs-produto; operacao/* -> prompts page |
| Delete | 4 | operacao/index, build/index, pacote-cliente, (obsolete files after merge) |
| Create new | 2 | prompts.md, onboarding.md |

## Route Analysis

### Current Route Structure (App.tsx)

```typescript
<Route path="/processo/*" element={<DocRenderer />} />
<Route path="/build/*" element={<DocRenderer />} />
<Route path="/referencias/*" element={<DocRenderer />} />
<Route path="/operacao/*" element={<DocRenderer />} />
<Route path="/ferramentas/wireframe-builder/galeria" element={<ComponentGallery />} />
<Route path="/ferramentas/*" element={<DocRenderer />} />
```

### Routing Mechanism

The `docs-parser.ts` uses `import.meta.glob('/docs/**/*.md')` to auto-discover ALL markdown files. The `getDoc()` function maps URL paths to files by convention: URL `/processo/master` -> file `/docs/processo/master.md`.

This means **moving a file automatically changes its URL** -- no route configuration change needed for most operations. The catch-all `<Route path="/ferramentas/*">` already handles any new files under `docs/ferramentas/`.

### Required Route Changes

| Change | Reason | Impact |
|--------|--------|--------|
| Remove `<Route path="/build/*">` | Build section deleted (absorbed into Ferramentas) | Any bookmarks to /build/* break. Internal links need updating |
| Remove `<Route path="/operacao/*">` | Operacao section deleted (merged into Processo) | Same -- bookmarks break |
| Keep `/referencias/*` | Referencias docs stay at their current paths (nested under Ferramentas in sidebar only) | No URL change for KPI/blocos pages |
| Keep `/processo/*` | All new processo docs live here | New URLs: /processo/visao-geral, /processo/prompts, /processo/cliente-vs-produto, /processo/onboarding |
| Keep `/ferramentas/*` | Build docs move here physically | New URLs: /ferramentas/tech-radar, /ferramentas/premissas-gerais, etc. |

### Key Insight: Routes vs Sidebar

Routes and sidebar navigation are independent systems. A doc can live at `/referencias/biblioteca-kpis` but appear nested under Ferramentas > Wireframe Builder in the sidebar. The sidebar `href` values just need to match the actual file paths. The catch-all routes already handle everything.

**Decision needed (Claude's discretion):** Whether to also remove the `/build/*` and `/operacao/*` catch-all routes from App.tsx. Recommendation: remove them to keep routes clean, but this means old bookmarks 404. Alternatively, keep them temporarily.

## Search Index Analysis

### Current Mechanism

`search-index.ts` calls `buildSearchIndex()` which iterates all docs via `getAllDocPaths()` and reads `badge` from frontmatter. `SearchCommand.tsx` groups results by `badge` value.

### Current Badge Values in Use

| Badge | File Count | Notes |
|-------|-----------|-------|
| `Processo` | 12 | processo/* and fases/* |
| `Operacao` | 5 | operacao/* |
| `Build` | 23 | build/* and build/techs/* |
| `Ferramentas` | 2 | ferramentas/* |
| `Referencias` | 3 | referencias/* |

### Required Badge Changes

After restructuring, the search groups should be:

| Badge | File Count | Notes |
|-------|-----------|-------|
| `Processo` | ~15 | All processo/* including merged operacao content |
| `Ferramentas` | ~25 | All former build/* docs + existing ferramentas/* |
| `Referencias` | 3 | Unchanged |

**Action items:**
1. Every file moved from `build/` to `ferramentas/` needs its frontmatter `badge` changed from `Build` to `Ferramentas`
2. Files merged from `operacao/` into `processo/` already have the right badge (or will be new files with `Processo` badge)
3. The `Operacao` and `Build` badge values should disappear entirely from the codebase after migration

### No Code Changes Needed in search-index.ts

The search index is purely dynamic -- it reads badges from whatever files exist. Moving files and changing badges is sufficient. No code changes to `search-index.ts` or `SearchCommand.tsx`.

## Content Migration Patterns

### Pattern 1: Claude Project References

Found in 14 files across docs/. These fall into categories:

**A. "Open Claude Project, paste prompt" workflow** (most common)
- Files: fluxo-trabalho.md, padrao-conversa-project.md, prompt-abertura.md, pacote-cliente.md, prompt-master.md, fase2.md
- Current pattern: "1. Abrir o Claude Project do cliente -> 2. Discutir -> 3. Gerar prompt -> 4. Colar no Claude Code"
- New pattern: With GSD, the operator works directly in Claude Code. The "discuss in Project, generate prompt, paste in Code" workflow is replaced by direct Claude Code interaction with GSD commands
- Action: Replace with Claude Code + GSD workflow descriptions

**B. "Claude Project knowledge" references**
- Files: pacote-cliente.md, padrao-conversa-project.md
- Current: "Suba este arquivo no knowledge do Claude Project do cliente"
- New: This concept mostly goes away. Client context is in `clients/[slug]/CLAUDE.md` read directly by Claude Code
- Action: Remove or replace with CLAUDE.md-based context loading

**C. "Claude Project do cliente" as distinct environment**
- Files: fase2.md, bi-personalizado.md
- Current: "O Blueprint e gerado diretamente no Claude Project do cliente"
- New: Blueprint generation happens via Claude Code directly, using GSD
- Action: Update workflow descriptions

### Pattern 2: Broken Internal References

Found across multiple files. These are paths that don't match actual file locations:

| Wrong Path | Correct Path | Files Affected |
|-----------|-------------|----------------|
| `docs/processo/master/POP_MASTER.md` | `docs/processo/master.md` (will be visao-geral.md) | bi-personalizado.md, produto.md |
| `docs/processo/POP_BI_PERSONALIZADO.md` | `docs/processo/bi-personalizado.md` | master.md |
| `docs/processo/POP_PRODUTO.md` | `docs/processo/produto.md` | master.md |
| `docs/suporte/biblioteca_kpis.md` | `docs/referencias/biblioteca-kpis.md` | pacote-cliente.md, fase1.md, fase2.md, master.md |
| `docs/build/wireframe/blocos_disponiveis.md` | `docs/referencias/blocos-disponiveis.md` | fase2.md |
| `docs/build/arquitetura/*.md` | `docs/build/*.md` (will be ferramentas/*.md) | fase3.md (7 references), build/index.md |
| `docs/build/design/design_system.md` | Does not exist | fase3.md (3 references) |
| `docs/process/prompt_master.md` | `docs/processo/prompt-master.md` | pacote-cliente.md (2 references) |
| `skills/` | `tools/` | fluxo-trabalho.md |

### Pattern 3: Lovable References (to remove)

Found in `fase3.md`: An entire "Caminho 2: Lovable (Temporario)" section that should be deleted per the decision to update content.

### Pattern 4: "Checklist de validacao MD <-> React/HTML"

Found at the bottom of fase1-6.md and some processo docs. These were checklists for when docs were rendered differently. They reference "InfoBlocks", "PageHeader" with version/date props, etc. These should be removed -- the current DocRenderer handles everything via frontmatter and custom tags.

## Architecture Patterns

### Sidebar: Hardcoded vs Auto-Generated (Claude's Discretion)

**Recommendation: Keep hardcoded, with improved structure.**

Reasons:
1. The current NavItem tree in Sidebar.tsx already works well -- supports nesting, collapsible sections, active state tracking
2. Auto-generation from frontmatter would require a new field (e.g., `nav_order`, `nav_parent`) in every markdown file plus sorting logic
3. With only ~40 docs, the manual array is manageable and gives precise control over ordering
4. The sidebar structure changes infrequently -- this is a one-time reorganization

The new `navigation` array structure should be:

```typescript
const navigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Processo',
    href: '/processo/index',
    children: [
      { label: 'Visao Geral', href: '/processo/visao-geral' },
      { label: 'Prompts', href: '/processo/prompts' },
      { label: 'Cliente vs Produto', href: '/processo/cliente-vs-produto' },
      { label: 'Identidade FXL', href: '/processo/identidade' },
      {
        label: 'Fases',
        children: [
          { label: 'Fase 1 — Diagnostico', href: '/processo/fases/fase1' },
          { label: 'Fase 2 — Wireframe', href: '/processo/fases/fase2' },
          { label: 'Fase 3 — Desenvolvimento', href: '/processo/fases/fase3' },
          { label: 'Fase 4 — Auditoria', href: '/processo/fases/fase4' },
          { label: 'Fase 5 — Entrega', href: '/processo/fases/fase5' },
          { label: 'Fase 6 — Tutorial', href: '/processo/fases/fase6' },
        ],
      },
      { label: 'Onboarding', href: '/processo/onboarding' },
    ],
  },
  {
    label: 'Ferramentas',
    href: '/ferramentas/index',
    children: [
      {
        label: 'Wireframe Builder',
        href: '/ferramentas/wireframe-builder',
        children: [
          { label: 'Biblioteca de KPIs', href: '/referencias/biblioteca-kpis' },
          { label: 'Blocos Disponiveis', href: '/referencias/blocos-disponiveis' },
          { label: 'Galeria de Componentes', href: '/ferramentas/wireframe-builder/galeria' },
        ],
      },
      { label: 'Tech Radar', href: '/ferramentas/tech-radar' },
      {
        label: 'Techs',
        children: [
          // ... all 15 tech pages with /ferramentas/techs/* paths
        ],
      },
      { label: 'Premissas Gerais', href: '/ferramentas/premissas-gerais' },
      { label: 'Seguranca', href: '/ferramentas/seguranca' },
      { label: 'Testes', href: '/ferramentas/testes' },
      { label: 'Template de Sprint', href: '/ferramentas/master-prompt' },
      { label: 'CLAUDE.md — Template', href: '/ferramentas/claude-md-template' },
    ],
  },
  {
    label: 'Clientes',
    children: [
      // ... client entries (unchanged)
    ],
  },
]
```

### Page Format: Resumo -> Operacao -> Detalhes

Each fase page should follow this structure:

```markdown
---
title: Fase N — Nome
badge: Processo
description: Uma frase
---

# Fase N — Nome

Resumo em 2 linhas explicando o que esta fase faz e por que importa.

---

## Operacao

O que o operador precisa fazer nesta fase, passo a passo.
Objective, actionable, no filler.

---

## Detalhes

### Por tipo de projeto
#### BI Personalizado
...
#### Produto FXL
...

### Criterio de avanco
...
```

### Home Page Impact

`Home.tsx` has hardcoded links that need updating:

| Current | New |
|---------|-----|
| `href: '/operacao/prompt-abertura'` | `href: '/processo/prompts'` |
| `href: '/build/tech-radar'` | `href: '/ferramentas/tech-radar'` |
| `href: '/processo/master'` | `href: '/processo/visao-geral'` |
| `href: '/build/index'` | `href: '/ferramentas/index'` |

The `sections` array in Home.tsx references "Build" as a separate section -- this should be updated to reference "Ferramentas" or removed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route handling for moved docs | Custom redirect logic | Just move files, update sidebar hrefs | docs-parser auto-discovers via import.meta.glob |
| Search index updates | Manual index entries | Change `badge` in frontmatter | search-index.ts reads badges dynamically |
| Doc rendering for new pages | New page components | Create .md files in docs/ | DocRenderer handles everything |
| Navigation state | Custom state management | Existing NavSection component | Already supports nesting, collapsing, active state |

## Common Pitfalls

### Pitfall 1: Forgetting to Update Internal Cross-References
**What goes wrong:** Moving files without updating all docs that reference them by path. Results in broken links shown in the markdown content (not in the sidebar).
**Why it happens:** Internal references use filesystem paths (`docs/suporte/biblioteca_kpis.md`) inside markdown content, not URL paths.
**How to avoid:** After all moves, grep for old paths (`docs/build/`, `docs/operacao/`, `docs/suporte/`, `docs/process/`) across all remaining docs. Zero matches = done.
**Warning signs:** Any reference containing `docs/build/arquitetura/`, `docs/suporte/`, `docs/process/` (note: `process` not `processo`).

### Pitfall 2: Badge Mismatch After File Move
**What goes wrong:** File moves to `ferramentas/` but frontmatter still says `badge: Build`. Search groups it wrong.
**Why it happens:** Move the file, forget the frontmatter.
**How to avoid:** Always update frontmatter `badge` in the same operation as the file move.
**Warning signs:** Search results showing "Build" group after migration.

### Pitfall 3: Sidebar href Not Matching File Path
**What goes wrong:** Sidebar entry points to `/ferramentas/tech-radar` but file is still at `/docs/build/tech-radar.md`. Page shows 404.
**Why it happens:** Sidebar updated before files moved, or vice versa.
**How to avoid:** Move files and update sidebar in the same plan/wave. Verify by clicking every sidebar link after changes.
**Warning signs:** "Pagina nao encontrada" displayed by DocRenderer.

### Pitfall 4: TypeScript Errors from Import Changes
**What goes wrong:** Renaming imports or removing components causes `tsc --noEmit` failures.
**Why it happens:** For this phase, the risk is low -- we're changing markdown files and one TypeScript file (Sidebar.tsx). But changing route paths in App.tsx or Home.tsx could introduce errors.
**How to avoid:** Run `npx tsc --noEmit` after each wave of changes.

### Pitfall 5: Losing Valuable Content During Merges
**What goes wrong:** When merging bi-personalizado.md + produto.md, or operacao/* into prompts page, useful information gets lost.
**Why it happens:** Merge = delete old + create new. Easy to drop sections.
**How to avoid:** Read both source files completely before writing the merged output. Use a checklist of sections from both.

## Code Examples

### docs-parser auto-discovery (how routing works)

```typescript
// Source: src/lib/docs-parser.ts
const docFiles = import.meta.glob('/docs/**/*.md', { query: '?raw', import: 'default', eager: true })

export function getDoc(urlPath: string): ParsedDoc | null {
  const cleanPath = urlPath.replace(/^\//, '').replace(/\/$/, '')
  const filePath = `/docs/${cleanPath}.md`
  const raw = docFiles[filePath] as string | undefined
  if (!raw) return null
  // ...
}
```

Key insight: URL `/ferramentas/tech-radar` maps to file `/docs/ferramentas/tech-radar.md`. Moving the file is all that's needed.

### Sidebar NavItem type (what the navigation array expects)

```typescript
// Source: src/components/layout/Sidebar.tsx
type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
}
```

No other fields needed. The recursive `NavSection` component handles nesting to any depth.

### Search index grouping (how badge values become search groups)

```typescript
// Source: src/components/layout/SearchCommand.tsx
const grouped = useMemo(() => {
  const groups: Record<string, SearchEntry[]> = {}
  for (const entry of index) {
    const key = entry.badge || 'Outros'
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return groups
}, [index])
```

Badge value in frontmatter directly becomes the group heading in Cmd+K search.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed (no vitest, jest, or other test runner) |
| Config file | None |
| Quick run command | `npx tsc --noEmit` (type checking only) |
| Full suite command | `npx tsc --noEmit && npm run build` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOCS-01 | Sidebar reflects process structure | manual + type-check | `npx tsc --noEmit` (validates Sidebar.tsx compiles) | N/A |
| DOCS-01 | All sidebar links resolve to existing docs | manual | Grep: no href in navigation array pointing to nonexistent docs | N/A |
| DOCS-02 | No outdated references in docs | automated grep | `grep -r "docs/build/arquitetura\|docs/suporte/\|docs/process/\|Lovable\|POP_BI_PERSONALIZADO\|POP_PRODUTO" docs/` should return 0 matches | N/A |
| DOCS-02 | All badges updated (no "Build" or "Operacao" badges remaining) | automated grep | `grep -r 'badge: Build\|badge: Operacao' docs/` should return 0 matches | N/A |
| DOCS-02 | No broken internal links | manual | Click each sidebar link in browser | N/A |
| DOCS-03 | Onboarding page exists and renders | manual + type-check | File exists at `docs/processo/onboarding.md` with valid frontmatter | N/A |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npm run build`
- **Phase gate:** Full build green + manual sidebar link verification + grep validation

### Wave 0 Gaps

No test framework gaps -- this phase is documentation-focused. The existing TypeScript type checker (`npx tsc --noEmit`) is the primary automated validation. Manual verification (clicking links, reading content) is the appropriate test strategy for documentation reorganization.

## Recommendations for Planning

### Wave Structure

**Wave 1: Structure (DOCS-01)**
- Create new directory structure (move files physically)
- Update all frontmatter badges
- Rewrite Sidebar.tsx navigation array
- Update App.tsx routes (remove /build/*, /operacao/*)
- Update Home.tsx links
- Verify: `npx tsc --noEmit`, all sidebar links resolve

**Wave 2: Content (DOCS-02)**
- Rewrite processo/index.md (new landing page)
- Create processo/visao-geral.md (from master.md)
- Create processo/cliente-vs-produto.md (merge bi-personalizado + produto)
- Create processo/prompts.md (consolidate operacao/* content)
- Rewrite ferramentas/index.md (absorbs Build index)
- Rewrite all 6 fase pages (Resumo -> Operacao -> Detalhes format)
- Fix all broken internal references across all docs
- Remove Lovable sections from fase3.md
- Remove "Checklist de validacao MD <-> React/HTML" from all fase pages
- Delete obsolete files (operacao/index, build/index, pacote-cliente, etc.)
- Verify: grep for old paths returns 0, grep for old badges returns 0

**Wave 3: Onboarding (DOCS-03)**
- Create processo/onboarding.md
- Content: step-by-step practical walkthrough for the founder
- Structure: "Voce e novo aqui? Comece por aqui" -> numbered steps linking to relevant docs
- Verify: page renders correctly in sidebar and via direct URL

### Sidebar Decision (Claude's Discretion Resolution)

**Recommendation: Keep hardcoded.** The nav array is ~50 lines, changes infrequently, and gives full control over ordering and nesting. Auto-generation would require frontmatter fields on every file and complex sorting logic -- not worth the overhead for 40 docs.

### Partially Outdated Docs Decision (Claude's Discretion Resolution)

**Recommendation: Rewrite, don't delete.** Every partially outdated doc (fase1-6, bi-personalizado, produto) has valuable process content. The outdated parts are specific (wrong paths, Claude Project workflow descriptions, Lovable references). These are surgical rewrites, not wholesale deletions.

## Open Questions

1. **What happens to /build/* and /operacao/* bookmarks?**
   - What we know: Routes will be removed from App.tsx
   - What's unclear: Whether any external systems (Vercel previews, saved links) depend on these URLs
   - Recommendation: Remove routes. Low risk -- this is an internal tool with one primary user (the founder)

2. **Should the Component Gallery route change?**
   - What we know: Currently at `/ferramentas/wireframe-builder/galeria` with a dedicated `ComponentGallery` component
   - What's unclear: Whether this path still makes sense in the new structure
   - Recommendation: Keep as-is. It's a React component page, not a doc. Path is already under /ferramentas/

## Sources

### Primary (HIGH confidence)
- Direct file reads of all 45 markdown files in docs/
- Direct file reads of Sidebar.tsx, App.tsx, docs-parser.ts, search-index.ts, SearchCommand.tsx, DocRenderer.tsx, Home.tsx
- Grep analysis across all docs for migration patterns

### Confidence Breakdown

| Area | Level | Reason |
|------|-------|--------|
| Doc inventory | HIGH | Read every file, verified every path |
| Route analysis | HIGH | Read App.tsx and docs-parser.ts source code |
| Search index | HIGH | Read search-index.ts and SearchCommand.tsx source code |
| Content patterns | HIGH | Grep analysis with specific pattern matching across all docs |
| Sidebar recommendation | HIGH | Based on reading actual NavItem implementation |

## Metadata

**Research date:** 2026-03-07
**Valid until:** No expiry -- this is codebase-specific research, not library/ecosystem research
