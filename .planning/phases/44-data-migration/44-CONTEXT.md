# Phase 44: Data Migration - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning
**Source:** Autonomous (all decisions made by Claude based on codebase analysis)

<domain>
## Phase Boundary

Criar seed script que migra todos os 62 arquivos .md de docs/ para a tabela `documents` no Supabase. O script deve extrair frontmatter (title, badge, description), preservar custom tags literalmente no body, derivar parent_path e sort_order da estrutura de diretorio, e inserir tudo via upsert. A aplicacao continua funcionando exatamente como hoje apos a migracao — esta fase so popula o banco, nao altera o app.

</domain>

<decisions>
## Implementation Decisions

### Script location and pattern
- Arquivo: `scripts/seed-documents.ts` — pasta `scripts/` na raiz (nao em tools/)
- Padrao CLI identico ao existente: `npx tsx --env-file .env.local scripts/seed-documents.ts [--force]`
- NOT a Vite module — usa `process.env`, nao `import.meta.env`
- Supabase client standalone com `createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)`

### Frontmatter extraction
- Usa pacote `yaml` (ja instalado no projeto) para parsear frontmatter YAML
- Regex identico ao docs-parser: `/^---\n([\s\S]*?)\n---\n([\s\S]*)$/`
- Extrai title, badge, description do frontmatter
- Se description ausente, usa string vazia (DEFAULT '' na tabela)

### Custom tags preservation
- Body e inserido literalmente apos o frontmatter — nenhum processamento de custom tags
- Tags `{% operational %}`, `{% callout %}`, `{% prompt %}`, `{% phase-card %}` permanecem como texto cru
- O parser da app (docs-parser.ts) ja sabe processar esses tags — nao e papel do seed script

### Slug derivation
- slug = caminho relativo do arquivo sem extensao .md e sem prefixo docs/
- Exemplo: `docs/processo/fases/fase1.md` → slug = `processo/fases/fase1`
- Exemplo: `docs/ferramentas/blocos/kpi-card.md` → slug = `ferramentas/blocos/kpi-card`

### Parent path derivation
- parent_path = diretorio do arquivo relativo a docs/
- Exemplo: `docs/processo/fases/fase1.md` → parent_path = `processo/fases`
- Exemplo: `docs/ferramentas/index.md` → parent_path = `ferramentas`
- Para docs na raiz de uma secao, parent_path e o nome da secao

### Sort order
- Dentro de cada parent_path, arquivos ordenados alfabeticamente
- `index.md` sempre recebe sort_order = 0 (primeiro da secao)
- Demais arquivos numerados sequencialmente (1, 2, 3...)
- Fases (fase1, fase2, ...) naturalmente ordenam correto por nome

### Upsert strategy
- Upsert via `supabase.from('documents').upsert(rows, { onConflict: 'slug' })`
- slug como chave de conflito (UNIQUE constraint da Phase 43)
- Permite re-execucao sem duplicar — padrao identico ao seed-briefing
- Flag `--force` limpa tabela inteira antes de inserir (DELETE + INSERT) para reset completo
- Sem `--force`, faz upsert incremental

### Validation
- Script conta arquivos lidos vs inseridos e reporta no console
- Verifica que todos os 62 arquivos foram processados
- Reporta erros individuais sem abortar (tenta inserir todos, lista falhas ao final)
- Verifica que custom tags aparecem no body apos insercao (query de verificacao)

### Makefile target
- Adicionar `make seed-docs` ao Makefile para execucao rapida
- Comando: `npx tsx --env-file .env.local scripts/seed-documents.ts`

### Claude's Discretion
- Batch size para insercao (1 por 1 vs batch de 10 vs todos de uma vez) — depende de tamanho
- Error handling granularity (continue-on-error vs fail-fast)
- Console output format (verbose vs summary)
- Exact test queries para verificacao pos-insercao

</decisions>

<specifics>
## Specific Ideas

- "a aplicacao fique exatamente do jeito que esta hoje, porem vindo do banco de dados e nao hardcoded"
- 62 arquivos .md confirmados no docs/ (contagem verificada)
- 14 arquivos usam custom tags ({% operational %}, {% callout %}, {% prompt %}, {% phase-card %})
- Estrutura de diretorios: processo/ (11 arquivos), ferramentas/ (46 arquivos incluindo blocos/ e techs/), padroes/ (1 arquivo), referencias/ (0 arquivos)
- Phase 43 cria tabela com: id, title, badge, description, slug, parent_path, body, sort_order, created_at, updated_at
- Frontmatter padrao: title (required), badge (required), description (optional)

</specifics>

<deferred>
## Deferred Ideas

- Verificacao automatizada pos-seed comparando contagem e conteudo DB vs filesystem (pode ser parte de Phase 46 sync tools)
- Incremental sync baseado em updated_at (escopo de Phase 46 SYNC-02)

</deferred>

---

*Phase: 44-data-migration*
*Context gathered: 2026-03-13 via autonomous decision-making*
