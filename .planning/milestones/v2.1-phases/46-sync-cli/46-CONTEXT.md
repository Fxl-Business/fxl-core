# Phase 46: Sync CLI - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning
**Source:** Autonomous decision (user delegated all decisions to Claude)

<domain>
## Phase Boundary

Criar scripts CLI (`sync-down` e `sync-up`) que sincronizam conteudo entre a tabela `documents` no Supabase e os arquivos .md no diretorio docs/. O Claude Code usa esses scripts para trabalhar localmente com os documentos e depois sincronizar as mudancas de volta ao banco. A aplicacao deve continuar funcionando exatamente como hoje — mesma estrutura de diretorio, mesmos arquivos .md com frontmatter YAML correto.

</domain>

<decisions>
## Implementation Decisions

### Script location and structure
- Scripts vivem em `tools/sync/` (novo diretorio) — seguindo o padrao de tools separadas por funcionalidade
- `tools/sync/sync-down.ts` — exporta do Supabase para docs/
- `tools/sync/sync-up.ts` — importa dos docs/ para Supabase
- Padrao identico ao `generate-blueprint.ts`: `process.env` + `createClient` standalone, NÃO importa `@/lib/supabase`

### sync-down (DB -> filesystem)
- Busca todos os registros da tabela `documents` via Supabase client
- Para cada documento: reconstroi o caminho do arquivo usando `parent_path` + `slug` + `.md`
- Cria diretorios intermediarios com `mkdirSync({ recursive: true })`
- Escreve arquivo .md com frontmatter YAML (title, badge, description) + body
- Frontmatter reconstruido usando a lib `yaml` (ja e dependencia do projeto)
- NAO deleta arquivos que nao existem no banco — sync-down apenas cria/atualiza
- Ordenacao (sort_order) nao precisa ser refletida no filesystem (apenas no banco)

### sync-up (filesystem -> DB)
- Le todos os .md de `docs/` recursivamente via `fs.readdirSync` + `path`
- Para cada arquivo: extrai frontmatter YAML (title, badge, description) e body
- Deriva slug do caminho do arquivo (ex: `docs/processo/fases/fase1.md` -> `processo/fases/fase1`)
- Deriva parent_path do diretorio do arquivo (ex: `docs/processo/fases/`)
- Faz upsert na tabela `documents` usando `slug` como chave de conflito (ON CONFLICT)
- Preserva sort_order existente se o registro ja existe — nao sobrescreve ordenacao
- Calcula sort_order para novos registros baseado na posicao dentro do diretorio

### Makefile targets
- `make sync-down` — `npx tsx --env-file .env.local tools/sync/sync-down.ts`
- `make sync-up` — `npx tsx --env-file .env.local tools/sync/sync-up.ts`
- Adicionados ao .PHONY

### Frontmatter reconstruction (sync-down)
- Formato identico ao existente nos .md atuais:
```yaml
---
title: Nome da Pagina
badge: Processo
description: Uma frase
---
```
- Se description for vazio/null, omitir do frontmatter
- Body escrito apos frontmatter com uma linha em branco

### Custom tags preservation
- Custom tags ({% operational %}, {% callout %}, {% prompt %}, {% phase-card %}) sao armazenados literalmente no campo body
- sync-down escreve body as-is (tags preservadas)
- sync-up envia body as-is para o banco (tags preservadas)
- Nenhum parsing especial necessario — sao apenas texto no body

### Error handling
- Se Supabase retornar erro, script exibe mensagem e `process.exit(1)`
- Contagem de arquivos processados exibida ao final (ex: "Synced 62 documents from Supabase to docs/")
- Progresso individual nao e necessario (62 docs e rapido)

### Claude's Discretion
- Log format exato (console.log messages)
- Ordering algorithm para sort_order de novos arquivos em sync-up
- Whether to add `--force` or `--dry-run` flags (not required by specs but useful)

</decisions>

<specifics>
## Specific Ideas

- "O objetivo e que a aplicacao fique exatamente do jeito que esta hoje, porem vindo do banco de dados e nao hardcoded"
- Manter scripts minimos — sem over-engineering com watch mode, incremental sync, ou conflict detection
- Usar exatamente o mesmo padrao CLI do `generate-blueprint.ts` e `seed-briefing-conta-azul.ts`
- `yaml` package ja e dependencia do projeto — usar para stringify/parse frontmatter

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- CLI pattern de `tools/wireframe-builder/scripts/generate-blueprint.ts` — process.env, standalone createClient, argument parsing
- `yaml` package para parse/stringify frontmatter (ja em dependencies)
- `extractFrontmatter()` em `src/lib/docs-parser.ts` — logica de parse de frontmatter (referencia, nao importar)

### Established Patterns
- CLI scripts: `npx tsx --env-file .env.local tools/path/script.ts [args]`
- Supabase client standalone: `createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)`
- Makefile targets: `.PHONY: target` + `target:\n\tcommand`
- Error handling: `if (!supabaseUrl || !supabaseKey) { console.error(); process.exit(1) }`

### Integration Points
- Tabela `documents` (Phase 43) com colunas: id, title, badge, description, slug, parent_path, body, sort_order, created_at, updated_at
- `slug` e UNIQUE — usado como chave de conflito para upsert
- `docs/` directory com 62 .md files — fonte de verdade local para sync-up
- Makefile existente com targets: dev, build, lint, preview, install, migrate

</code_context>

<deferred>
## Deferred Ideas

- Incremental sync via updated_at comparison (ASYN-02 — future requirement)
- Conflict detection when local and DB versions diverge (ASYN-01 — future requirement)
- Watch mode para sync automatico
- --dry-run flag para preview de mudancas

</deferred>

---

*Phase: 46-sync-cli*
*Context gathered: 2026-03-13 — Autonomous decision*
