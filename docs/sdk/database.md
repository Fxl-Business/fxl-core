---
title: Banco de Dados
badge: SDK
description: Modelagem, migrations e seguranca de dados com Supabase
scope: product
sort_order: 90
---

# Banco de Dados

Supabase (PostgreSQL) e o banco de dados padrao para todos os projetos spoke da FXL. Esta pagina cobre modelagem de tabelas, convencao de migrations, Row Level Security (RLS), indices e patterns multi-tenant.

## Modelagem Supabase

Toda tabela segue as convencoes abaixo:

| Convencao | Regra |
|-----------|-------|
| Primary key | `id uuid DEFAULT gen_random_uuid() PRIMARY KEY` |
| Timestamps | `created_at timestamptz NOT NULL DEFAULT now()` e `updated_at timestamptz NOT NULL DEFAULT now()` |
| Texto | Usar `text` (nunca `varchar`) — best practice do Postgres/Supabase |
| Tenant | `org_id text NOT NULL` em toda tabela com escopo de organizacao |
| Foreign key | `REFERENCES public.{tabela}(id)` com schema explicito |
| Schema | Todas as tabelas vivem em `public` |

### Exemplo real — tabela `documents` (migration 007)

```sql
CREATE TABLE public.documents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  badge       text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  slug        text        NOT NULL UNIQUE,
  parent_path text        NOT NULL,
  body        text        NOT NULL,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_documents_parent_path       ON documents (parent_path);
CREATE INDEX idx_documents_parent_path_order ON documents (parent_path, sort_order);
```

Note que `org_id` foi adicionado posteriormente na migration 008 (multi-tenant). A tabela foi criada sem ele porque o sistema comecou single-tenant.

## Migrations Numeradas

As migrations ficam em `supabase/migrations/` e seguem numeracao sequencial com nomes descritivos.

### Convencao de nomes

```
NNN_descriptive_name.sql
```

- `NNN` — numero de 3 digitos com zero-padding (001, 002, ..., 024)
- `descriptive_name` — snake_case descrevendo o que a migration faz

{% callout type="warning" %}
Cada migration e um arquivo SQL executado uma unica vez em ordem numerica. Nunca edite uma migration existente — crie uma nova.
{% /callout %}

### Lista de migrations do Nexo (referencia)

```
001_comments_schema.sql
002_clerk_migration.sql
003_blueprint_configs.sql
004_briefing_configs.sql
005_knowledge_entries.sql
006_tasks.sql
007_documents.sql
008_multi_tenant_schema.sql
009_super_admin_rls.sql
010_platform_settings.sql
011_documents_scope.sql
012_scope_data_migration.sql
013_remove_anon_fallback.sql
014_sdk_docs_scope.sql
015_sdk_knowledge_tables.sql
016_clients_table.sql
017_data_recovery.sql
018_projects_table.sql
019_tenant_archival.sql
020_documents_rls_fix.sql
021_rls_test_helper.sql
022_share_tokens_anon_select.sql
023_shared_view_anon_select.sql
024_comments_anon_insert.sql
```

### DDL idempotente

Todo DDL deve ser idempotente para evitar falhas em re-execucao:

```sql
-- Tabela
CREATE TABLE IF NOT EXISTS public.minha_tabela (...);

-- Coluna
ALTER TABLE public.minha_tabela ADD COLUMN IF NOT EXISTS nova_coluna text;

-- Index
CREATE INDEX IF NOT EXISTS idx_minha_tabela_coluna ON public.minha_tabela (coluna);
```

## Row Level Security (RLS)

O RLS do Nexo evoluiu em tres niveis ao longo das migrations. Cada nivel adiciona uma camada de controle sobre o anterior.

### Tier 1 — Filtragem basica por org_id (migration 008)

O pattern mais simples: filtra linhas pelo `org_id` presente no JWT. Quando nao ha JWT (acesso anon), permite tudo como fallback de compatibilidade.

```sql
CREATE POLICY "tabela_org_access" ON public.tabela
  FOR ALL TO anon, authenticated
  USING (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id  -- fallback: sem JWT, permite tudo (org_id = org_id = true)
    )
  )
  WITH CHECK (
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );
```

**Como funciona:**
- `current_setting('request.jwt.claims', true)` retorna as claims do JWT como string
- `nullif(..., '')` converte string vazia (sem JWT) em NULL
- `::jsonb->>'org_id'` extrai o claim `org_id`
- `COALESCE(..., org_id)` — se NULL (sem JWT), compara `org_id = org_id` (sempre true)

### Tier 2 — Bypass de super_admin (migration 009)

Adiciona verificacao de `super_admin` antes do filtro por org_id. Super admins veem todas as linhas de todas as organizacoes.

```sql
CREATE POLICY "tabela_org_access" ON public.tabela
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  )
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );
```

**Como funciona:**
- Primeiro verifica se `super_admin = 'true'` no JWT — se sim, acesso total
- Se nao, cai no filtro por `org_id` (Tier 1)

### Tier 3 — Acesso por escopo (migration 020)

Para tabelas com dados compartilhados e privados (como `documents`), o escopo determina a visibilidade. Docs `product` sao legiveis por qualquer usuario autenticado; docs `tenant` so sao visiveis para a organizacao dona.

```sql
-- SELECT — regra mais permissiva (product docs sao publicos para autenticados)
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR scope = 'product'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );

-- INSERT/UPDATE/DELETE — apenas super_admin ou dono do tenant
CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR (
      scope = 'tenant'
      AND org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
    )
  );
```

Para detalhes do fluxo de autenticacao e como o JWT chega ao Supabase, veja [Seguranca](/sdk/security).

{% callout type="warning" %}
Toda tabela nova DEVE ter `ALTER TABLE public.nome ENABLE ROW LEVEL SECURITY;`. Sem isso, as policies sao ignoradas e todos os dados ficam acessiveis.
{% /callout %}

## Indices

### Convencao de nomes

```
idx_{tabela}_{coluna}           -- indice simples
idx_{tabela}_{coluna1}_{coluna2} -- indice composto
```

### Regras

- Sempre idempotente: `CREATE INDEX IF NOT EXISTS`
- Toda coluna `org_id` recebe um indice (necessario para performance do RLS)
- Indices compostos para queries frequentes (ex: `(org_id, slug)` para documents)

### Exemplo real — indices de org_id (migration 008)

```sql
CREATE INDEX IF NOT EXISTS idx_tenant_modules_org_id      ON public.tenant_modules (org_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id            ON public.comments (org_id);
CREATE INDEX IF NOT EXISTS idx_share_tokens_org_id        ON public.share_tokens (org_id);
CREATE INDEX IF NOT EXISTS idx_blueprint_configs_org_id   ON public.blueprint_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_briefing_configs_org_id    ON public.briefing_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_org_id   ON public.knowledge_entries (org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id               ON public.tasks (org_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id           ON public.documents (org_id);
```

### Indices parciais para soft-delete

Quando a tabela usa `archived_at` para soft-delete, indices parciais filtram apenas linhas ativas:

```sql
CREATE INDEX IF NOT EXISTS idx_clients_archived   ON public.clients (org_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_archived  ON public.projects (org_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_archived ON public.documents (org_id) WHERE archived_at IS NULL;
```

## Patterns Multi-Tenant

### Adicionando org_id a tabelas existentes

Quando o sistema evolui de single-tenant para multi-tenant, adicionar `org_id` com default e backfill:

```sql
-- 1. Adicionar coluna com default (nao quebra rows existentes)
ALTER TABLE public.tabela ADD COLUMN IF NOT EXISTS org_id text NOT NULL DEFAULT 'org_fxl_default';

-- 2. Backfill rows existentes (safety net)
UPDATE public.tabela SET org_id = 'org_fxl_default' WHERE org_id IS NULL;

-- 3. Criar indice
CREATE INDEX IF NOT EXISTS idx_tabela_org_id ON public.tabela (org_id);
```

### Tabela tenant_modules — composite primary key

Para configuracoes por modulo por organizacao, usar PK composta `(org_id, module_id)`:

```sql
CREATE TABLE IF NOT EXISTS public.tenant_modules (
  org_id     text        NOT NULL,     -- Clerk organization ID
  module_id  text        NOT NULL,     -- MODULE_IDS value
  enabled    boolean     NOT NULL DEFAULT true,
  config     jsonb       NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, module_id)
);

ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;
```

### Soft-delete com archived_at

Nunca deletar dados de tenant — usar soft-delete com coluna `archived_at`:

```sql
ALTER TABLE public.tabela ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;
```

Nas RLS policies, excluir dados arquivados para usuarios normais (super_admin ainda ve tudo):

```sql
CREATE POLICY "tabela_org_access" ON public.tabela
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
      AND archived_at IS NULL
    )
  );
```

### Dados platform vs tenant — coluna scope

Para dados que podem ser compartilhados (plataforma) ou privados (tenant), usar coluna `scope`:

```sql
ALTER TABLE public.tabela ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'tenant';
-- Valores: 'product' (visivel para todos autenticados) | 'tenant' (isolado por org_id)
```

### Template: nova tabela multi-tenant

```sql
-- Template: Nova tabela multi-tenant
CREATE TABLE IF NOT EXISTS public.{nome} (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     text        NOT NULL,
  -- colunas aqui
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.{nome} ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_{nome}_org_id ON public.{nome} (org_id);

-- RLS policy (Tier 2 como padrao — com super_admin bypass)
CREATE POLICY "{nome}_org_access" ON public.{nome}
  FOR ALL TO authenticated
  USING (
    COALESCE(nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin', 'false') = 'true'
    OR org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
  )
  WITH CHECK (
    COALESCE(nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin', 'false') = 'true'
    OR org_id = (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id')
  );
```

## Checklist de Nova Tabela

Antes de considerar uma nova tabela pronta:

- [ ] Migration file com numero sequencial (`NNN_descriptive_name.sql`)
- [ ] `org_id text NOT NULL` em toda tabela tenant-scoped
- [ ] `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- [ ] RLS policy com super_admin bypass (Tier 2 como minimo)
- [ ] `CREATE INDEX IF NOT EXISTS` no `org_id`
- [ ] DDL idempotente (`IF NOT EXISTS` em CREATE TABLE, ADD COLUMN, CREATE INDEX)
- [ ] `created_at timestamptz NOT NULL DEFAULT now()`
- [ ] `updated_at timestamptz NOT NULL DEFAULT now()`
- [ ] Primary key `uuid DEFAULT gen_random_uuid()`
