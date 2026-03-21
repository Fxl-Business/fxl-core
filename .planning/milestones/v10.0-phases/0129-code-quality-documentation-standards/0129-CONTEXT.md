# Phase 129: Code Quality + Documentation Standards - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Preencher duas paginas placeholder do SDK: `code-standards.md` (SDKP-01) e `documentation.md` (SDKP-06). Cada pagina deve ser escrita como .md em docs/sdk/ E sincronizada na tabela `documents` do Supabase. O objetivo e que desenvolvedores spoke tenham referencia completa de como escrever e documentar codigo FXL.

</domain>

<decisions>
## Implementation Decisions

### Content depth (code-standards)
- Cada secao (naming, ESLint, TypeScript strict, imports, component/hook/service patterns) recebe subsecao propria com exemplos de codigo reais extraidos do Nexo
- Naming conventions ja documentadas parcialmente em `estrutura-projeto.md` — code-standards expande com mais detalhes e exemplos (nao duplica, referencia)
- ESLint rules devem cobrir flat config (v9), boundaries plugin para modulos, e regras FXL especificas
- TypeScript strict patterns: zero `any`, `import type`, discriminated unions, Zod validation
- Import ordering: React > libs externas > modulos internos > types (ja documentado em estrutura-projeto, code-standards expande com ESLint rule config)
- Component patterns: functional only, named exports, Props interface nomeada `{Component}Props`, composicao via children/render props
- Hook patterns: prefixo `use`, retorno tipado, separacao de concerns (data fetching vs UI state)
- Service patterns: sufixo `-service`, funcoes puras com tipagem de retorno explicita, `ConnectorResult<T>` para APIs externas

### Content depth (documentation)
- README obrigatorio: estrutura minima esperada, campos obrigatorios (natureza, stack, setup, env vars, scripts)
- CLAUDE.md por projeto: template com sections obrigatorias (natureza, stack, estrutura, convencoes, quality gates, o que nunca fazer)
- Changelog: formato e convencao (pode referenciar commit convention do CLAUDE.md do Nexo)
- Docs de API: como documentar endpoints do FXL Contract (formato, exemplos de request/response)

### Code examples sourcing
- Usar codigo real do Nexo como referencia: src/modules/ para component patterns, src/platform/services/ para service patterns, src/shared/hooks/ para hook patterns
- Exemplos anotados com comentarios explicando o padrao
- Nao copiar codigo verbatim do Nexo — criar exemplos representativos baseados nos padroes reais

### Supabase sync
- Escrever .md em docs/sdk/ primeiro
- Sincronizar via `make sync-up` ou `mcp__supabase__execute_sql` com UPDATE na tabela `documents`
- Verificar que as paginas aparecem na sidebar do SDK no Nexo
- O campo `body` no Supabase contem apenas markdown (sem frontmatter YAML)

### Claude's Discretion
- Organizacao interna das subsecoes dentro de cada pagina
- Escolha de quais exemplos de codigo sao mais ilustrativos
- Nivel de detalhe em cada regra ESLint (listar todas vs apenas as criticas)
- Formatacao e uso de callouts/tabelas para melhor legibilidade

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### SDK pages (existing, for consistency)
- `docs/sdk/estrutura-projeto.md` — Estrutura de diretorios, naming conventions, import rules (code-standards deve expandir, nao duplicar)
- `docs/sdk/stack.md` — Stack aprovada, decisoes tecnicas, dependencias (referencia para TypeScript strict e tooling)
- `docs/sdk/getting-started.md` — Formato e tom das paginas SDK ja preenchidas
- `docs/sdk/ci-cd.md` — CI/CD existente (referencia para documentar ESLint/tsc no pipeline)

### SDK pages (placeholders a preencher)
- `docs/sdk/code-standards.md` — Placeholder atual com outline do que cobrir
- `docs/sdk/documentation.md` — Placeholder atual com outline do que cobrir

### Codebase patterns (exemplos reais)
- `src/modules/` — Estrutura modular: cada modulo com components/, hooks/, services/, types/, CLAUDE.md
- `src/platform/services/` — Service pattern com tipagem forte
- `src/shared/` — Hooks, types, utils compartilhados entre modulos
- `CLAUDE.md` (raiz) — Template de referencia para CLAUDE.md de spokes

### Project rules
- `.planning/REQUIREMENTS.md` — SDKP-01 e SDKP-06 definem os requisitos das duas paginas
- `.planning/milestones/v10.0-ROADMAP.md` — Success criteria detalhados para Phase 129

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/sdk/estrutura-projeto.md`: Ja contem naming conventions e import rules — code-standards deve expandir sem duplicar
- `docs/sdk/stack.md`: Stack decisions e tooling choices que informam as regras de codigo
- `docs/sdk/templates.md`: Templates de arquivos que podem ser referenciados na pagina documentation
- Existing SDK pages (getting-started, contract, checklists): Definem o tom e profundidade esperados

### Established Patterns
- **Frontmatter padrao**: title, badge (SDK), description, scope (product), sort_order
- **Custom tags**: `{% callout %}`, `{% prompt %}`, `{% operational %}` parseados pelo docs-parser
- **Sync flow**: .md -> Supabase `documents` table via `make sync-up` ou SQL direto
- **Sort order**: code-standards tem sort_order 80, documentation tem sort_order 140

### Integration Points
- Tabela `documents` no Supabase: slug `sdk/code-standards` e `sdk/documentation`
- Sidebar do SDK: navega pela hierarquia parent_path dos documentos
- DocRenderer: renderiza markdown com syntax highlighting via rehype-highlight

</code_context>

<specifics>
## Specific Ideas

- code-standards deve ter exemplos de codigo com syntax highlighting que funcionem no DocRenderer do Nexo (rehype-highlight)
- A pagina documentation deve incluir o template CLAUDE.md que a Nexo Skill gera no scaffold de spokes
- Referenciar padroes reais do Nexo (como a arquitetura modular em src/modules/) como exemplos concretos
- Manter o mesmo tom das paginas SDK ja preenchidas (direto, pratico, com tabelas e code blocks)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 0129-code-quality-documentation-standards*
*Context gathered: 2026-03-19*
