# Phase 43: Database Schema - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Criar tabela `documents` no Supabase com indexes e RLS para armazenar todo o conteudo de docs/. A aplicacao deve continuar funcionando exatamente como hoje — mesma estrutura, mesma navegacao, mesma renderizacao — apenas a fonte de dados muda de arquivos estaticos para banco.

</domain>

<decisions>
## Implementation Decisions

### Schema design
- Tabela `documents` com colunas: id (uuid PK), title (text NOT NULL), badge (text NOT NULL), description (text NOT NULL DEFAULT ''), slug (text NOT NULL UNIQUE), parent_path (text NOT NULL), body (text NOT NULL), sort_order (integer NOT NULL DEFAULT 0), created_at (timestamptz), updated_at (timestamptz)
- slug UNIQUE constraint — cada documento tem slug unico, e assim que o app resolve rotas hoje
- badge sem CHECK constraint — manter flexivel para novas categorias sem migration (valores atuais: Processo, Ferramentas, Padroes)
- NOT NULL em title, badge, slug, parent_path, body — todo doc valido tem esses campos
- description DEFAULT '' — alguns docs podem nao ter description no frontmatter

### Indexes
- UNIQUE index em slug (ja implicito pelo constraint) — queries por slug sao o caso principal
- B-tree index em parent_path — sidebar e navegacao agrupam por parent_path
- Composite index (parent_path, sort_order) — para ordenacao dentro de cada secao

### RLS
- Anon-permissive: SELECT, INSERT, UPDATE, DELETE para anon role (consistente com knowledge_entries e tasks)
- Clerk handles auth at app layer — mesmo padrao de todas as tabelas existentes

### Order column
- Integer (sort_order) — simplicidade, nao ha necessidade de reordenacao frequente
- Seed script em Phase 44 derivara ordem da posicao do arquivo no filesystem (ordem alfabetica/numerica dos .md)
- Se precisar reordenar no futuro, UPDATE simples nos inteiros

### Migration
- Arquivo: `007_documents.sql` — sequencial apos 006_tasks.sql
- Padrao identico as migrations existentes: CREATE TABLE, ENABLE RLS, CREATE POLICY, CREATE INDEX
- Re-aplicavel via `make migrate` (precisa confirmar que Makefile tem target migrate funcional)

### Colunas extras
- Nenhuma coluna extra — schema minimo que espelha exatamente o frontmatter atual (title, badge, description) + estrutura (slug, parent_path, body, sort_order)
- Sem metadata JSONB, sem is_published, sem search_vec — o objetivo e replicar o que existe, nao adicionar capacidades
- Se no futuro precisar de campos extras, nova migration adiciona colunas

### Claude's Discretion
- Exact CHECK constraints vs text livre para badge
- Comment style na migration SQL
- Nomes exatos dos indexes e policies

</decisions>

<specifics>
## Specific Ideas

- "O objetivo e que a aplicacao fique exatamente do jeito que esta hoje, porem vindo do banco de dados e nao hardcoded"
- Manter schema minimo — nao over-engineer com campos que nao existem hoje
- Considerar fazer backup da aplicacao atual antes de qualquer alteracao (snapshot dos arquivos .md e estado atual)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Migration pattern de 005_knowledge_entries.sql e 006_tasks.sql — uuid PK, gen_random_uuid(), timestamptz, anon RLS com 4 policies (SELECT/INSERT/UPDATE/DELETE)
- Frontmatter YAML nos docs: title, badge, description — mapeamento direto para colunas

### Established Patterns
- Todas as tabelas usam uuid PK, nao serial/bigint
- RLS sempre habilitado com policies anon-permissive (Clerk auth na camada app)
- Indexes nomeados com prefixo `idx_tablename_column`
- Migrations numeradas sequencialmente (001-006)
- CHECK constraints usados para enums (tasks.status, tasks.priority, knowledge_entries.entry_type)

### Integration Points
- `make migrate` — target do Makefile que aplica migrations no Supabase
- Supabase client em src/lib/supabase.ts — sera usado em Phase 45 para queries
- docs-parser em src/lib/ — Phase 45 adaptara para consumir dados do banco
- Estrutura de diretorio docs/ (processo/, ferramentas/, padroes/, referencias/) mapeia para parent_path

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 43-database-schema*
*Context gathered: 2026-03-13*
