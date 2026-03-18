---
title: MCP Server
badge: SDK
description: Cerebro central de conhecimento cross-repo via MCP HTTP
scope: product
sort_order: 80
---

# MCP Server

O MCP Server e o cerebro de conhecimento do Nexo SDK. Ele expoe standards, learnings
e pitfalls como tools MCP (Model Context Protocol), permitindo que o Claude Code em
qualquer projeto spoke consulte e alimente a base de conhecimento da FXL sem precisar
de skill local ou acesso ao monorepo.

```
┌─────────────────────────────────────────────────┐
│              Spoke A (Beach House)               │
│  Claude Code ──► .mcp.json ──► fxl-sdk server   │
└─────────────────────────────────┬───────────────┘
                                  │ MCP HTTP
┌─────────────────────────────────▼───────────────┐
│              Nexo SDK MCP Server                  │
│        Cloudflare Worker (stateless)             │
│                                                  │
│  READ   get_standards, get_learnings, ...        │
│  WRITE  add_learning, add_pitfall, ...           │
│  META   get_sdk_status, get_project_config       │
│                                                  │
│  ┌────────────────────────────┐                  │
│  │   Supabase (PostgreSQL)   │                  │
│  │  sdk_standards (101)      │                  │
│  │  sdk_learnings            │                  │
│  │  sdk_pitfalls (30)        │                  │
│  │  sdk_projects             │                  │
│  └────────────────────────────┘                  │
└──────────────────────────────────────────────────┘
```

## Setup Rapido

### 1. Adicionar ao projeto spoke

Crie ou edite o arquivo `.mcp.json` na raiz do repositorio:

```json
{
  "mcpServers": {
    "fxl-sdk": {
      "type": "http",
      "url": "https://fxl-sdk-mcp.cauetpinciara.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer <API_KEY>"
      }
    }
  }
}
```

{% callout type="warning" %}
O `API_KEY` e necessario apenas para operacoes de **escrita** (add_learning, add_pitfall, promote_to_standard). Tools de leitura funcionam sem autenticacao.
{% /callout %}

### 2. Configuracao global (opcional)

Para disponibilizar o MCP Server em todos os projetos, configure em `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "fxl-sdk": {
      "type": "http",
      "url": "https://fxl-sdk-mcp.cauetpinciara.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer <API_KEY>"
      }
    }
  }
}
```

### 3. Verificar conexao

Apos configurar, use a tool `get_sdk_status` para confirmar que o servidor esta acessivel:

{% prompt label="Verificar status do SDK" %}
Use a tool get_sdk_status do MCP server fxl-sdk para verificar se esta conectado.
{% /prompt %}

O retorno esperado:

```json
{
  "version": "v1.0.0",
  "tables": {
    "standards": 101,
    "learnings": 0,
    "pitfalls": 30,
    "projects": 0
  },
  "last_updated": "2026-03-18T..."
}
```

## Endpoints HTTP

| Endpoint | Descricao |
|----------|-----------|
| `POST /mcp` | Endpoint MCP (Streamable HTTP transport) |
| `GET /health` | Health check — retorna `{ status, server, version }` |

O servidor roda como Cloudflare Worker em modo stateless (sem session).

## Autenticacao

O servidor usa Bearer token no header `Authorization`.

| Aspecto | Detalhe |
|---------|---------|
| Header | `Authorization: Bearer <API_KEY>` |
| Tools de leitura | Abertas (sem token) |
| Tools de escrita | Token obrigatorio |
| Resposta sem token em write | `401 Unauthorized` |

Tools de **escrita** que exigem autenticacao: `add_learning`, `add_pitfall`, `promote_to_standard`.

## Referencia de Tools

O servidor expoe 10 tools divididas em 3 categorias.

### READ (5 tools)

#### get_standards

Retorna padroes do SDK (regras de stack, convencoes de codigo, etc).

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `category` | string | nao | Filtrar por categoria (ex: `"stack"`, `"security"`, `"database"`) |

```json
// Exemplo: buscar standards de seguranca
{ "category": "security" }

// Retorno (array de SdkStandard)
[
  {
    "id": "uuid",
    "category": "security",
    "rule": "Nunca expor stack trace em producao",
    "details": "Erros 500 devem retornar mensagem generica...",
    "examples": null,
    "version": "1.0.0",
    "created_at": "2026-03-17T...",
    "updated_at": "2026-03-17T..."
  }
]
```

#### get_learnings

Retorna learnings capturados de projetos spoke. Learnings sao conhecimento novo que ainda nao foi promovido a standard.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `category` | string | nao | Filtrar por categoria |

```json
// Exemplo: listar todos os learnings
{}

// Retorno (array de SdkLearning)
[
  {
    "id": "uuid",
    "category": "api",
    "rule": "Usar timeout de 5s em chamadas externas",
    "context": "Descoberto no Beach House ao chamar API de pagamento...",
    "source_repo": "beachhouse-app",
    "tags": ["api", "timeout"],
    "promoted_to": null,
    "created_at": "2026-03-18T...",
    "updated_at": "2026-03-18T..."
  }
]
```

#### get_pitfalls

Retorna pitfalls conhecidos — erros a evitar. Ordenados por severidade.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `category` | string | nao | Filtrar por categoria |

```json
// Exemplo: buscar pitfalls de banco de dados
{ "category": "database" }

// Retorno (array de SdkPitfall)
[
  {
    "id": "uuid",
    "category": "database",
    "rule": "Nunca usar sub-paths em edge functions do Supabase",
    "context": "Edge functions nao suportam routing por path...",
    "source_repo": null,
    "tags": ["supabase", "edge-functions"],
    "severity": "high",
    "created_at": "2026-03-17T...",
    "updated_at": "2026-03-17T..."
  }
]
```

#### get_checklist

Busca checklists por nome. Primeiro procura em standards com `category = "checklist"`, depois faz fallback para busca geral.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `name` | string | sim | Nome ou keyword do checklist (ex: `"security"`, `"rls"`, `"typescript"`) |

```json
// Exemplo: buscar checklist de seguranca
{ "name": "security" }
```

#### search_knowledge

Busca textual em toda a base de conhecimento (standards, learnings, pitfalls). Usa `ILIKE` no PostgreSQL.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `query` | string | sim | Texto de busca |

```json
// Exemplo: buscar tudo sobre RLS
{ "query": "RLS" }

// Retorno (array de SearchResult)
[
  {
    "table": "sdk_standards",
    "id": "uuid",
    "category": "database",
    "rule": "Toda tabela com dados de tenant deve ter RLS",
    "excerpt": "Row Level Security e obrigatorio para isolamento...",
    "rank": 0
  },
  {
    "table": "sdk_pitfalls",
    "id": "uuid",
    "category": "database",
    "rule": "Nunca desabilitar RLS temporariamente em producao",
    "excerpt": "Mesmo 'por 5 minutos' pode causar vazamento...",
    "rank": 0
  }
]
```

### WRITE (3 tools)

{% callout type="warning" %}
Tools de escrita requerem autenticacao via Bearer token. Sem token, o servidor retorna `401 Unauthorized`.
{% /callout %}

#### add_learning

Registra um novo learning a partir de um projeto. Learnings sao candidatos a se tornarem standards apos validacao em 2+ projetos.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `rule` | string | sim | Descricao curta do learning |
| `context` | string | sim | Contexto detalhado: quando/por que foi aprendido |
| `category` | string | sim | Categoria (ex: `"api"`, `"database"`, `"security"`, `"frontend"`) |
| `source_repo` | string | nao | Repositorio onde foi descoberto (ex: `"beachhouse-app"`) |
| `tags` | string[] | nao | Tags transversais (ex: `["error-handling", "api"]`) |

```json
// Exemplo
{
  "rule": "Usar fallback em todos os campos de API externa",
  "context": "API do provedor de pagamento mudou o formato de resposta sem aviso. Campos como 'status' que eram string passaram a ser number. Usar ?? com valor default em toda leitura.",
  "category": "api",
  "source_repo": "beachhouse-app",
  "tags": ["api", "defensive-coding"]
}
```

#### add_pitfall

Registra um novo pitfall — algo a evitar. Ajuda a prevenir que erros se repitam em projetos futuros.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `rule` | string | sim | O que NAO fazer |
| `context` | string | sim | Por que e um problema, com detalhes |
| `category` | string | sim | Categoria |
| `source_repo` | string | nao | Repositorio onde foi descoberto |
| `tags` | string[] | nao | Tags transversais |
| `severity` | `"low"` \| `"medium"` \| `"high"` | nao | Severidade (default: `"medium"`) |

```json
// Exemplo
{
  "rule": "Nunca usar Promise.all para fetches independentes",
  "context": "Se um fetch falha, Promise.all rejeita tudo. Usar Promise.allSettled para que falhas parciais nao derrubem operacoes independentes.",
  "category": "frontend",
  "severity": "high",
  "tags": ["async", "error-handling"]
}
```

#### promote_to_standard

Promove um learning validado a standard permanente. Usar quando o learning foi confirmado em 2+ projetos.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `learning_id` | string | sim | UUID do learning a promover |
| `details` | string | nao | Override do texto de detalhes (default: usa o context do learning) |
| `examples` | string | nao | Exemplos de codigo ou padroes de uso |

```json
// Exemplo
{
  "learning_id": "550e8400-e29b-41d4-a716-446655440000",
  "details": "Sempre usar Promise.allSettled em vez de Promise.all para operacoes independentes.",
  "examples": "const [a, b] = await Promise.allSettled([fetchA(), fetchB()]);\nif (a.status === 'fulfilled') { ... }"
}
```

{% callout type="info" %}
Ao promover, o learning recebe o campo `promoted_to` com o UUID do novo standard. Um learning ja promovido nao pode ser promovido novamente.
{% /callout %}

### META (2 tools)

#### get_sdk_status

Retorna status do servidor: versao, contagem de registros por tabela, ultimo update.

Nenhum parametro.

```json
// Retorno
{
  "version": "v1.0.0",
  "tables": {
    "standards": 101,
    "learnings": 5,
    "pitfalls": 30,
    "projects": 2
  },
  "last_updated": "2026-03-18T14:30:00.000Z"
}
```

#### get_project_config

Retorna configuracao de um projeto spoke pelo slug. Util para descobrir stack choices e metadata.

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `slug` | string | sim | Slug do projeto (ex: `"beachhouse"`) |

```json
// Exemplo
{ "slug": "beachhouse" }

// Retorno
{
  "id": "uuid",
  "slug": "beachhouse",
  "name": "Beach House App",
  "stack_choices": {
    "auth": "clerk",
    "database": "supabase",
    "deploy": "vercel"
  },
  "created_at": "2026-03-17T...",
  "updated_at": "2026-03-17T..."
}
```

Se o projeto nao existir, retorna erro com `isError: true`.

## Banco de Dados

O MCP Server usa 4 tabelas no Supabase:

| Tabela | Descricao | Seed |
|--------|-----------|------|
| `sdk_standards` | Padroes permanentes do SDK | 101 registros |
| `sdk_learnings` | Learnings capturados de projetos | vazio (populado em uso) |
| `sdk_pitfalls` | Pitfalls conhecidos | 30 registros |
| `sdk_projects` | Configuracao de projetos spoke | vazio (populado em uso) |

### Categorias

As categorias sao compartilhadas entre as tabelas:

`stack`, `security`, `database`, `frontend`, `api`, `infrastructure`, `documentation`, `testing`, `checklist`

### Tipos de dados

```typescript
interface SdkStandard {
  id: string
  category: string
  rule: string          // Descricao curta da regra
  details: string       // Explicacao detalhada
  examples: string | null
  version: string
  created_at: string
  updated_at: string
}

interface SdkLearning {
  id: string
  category: string
  rule: string          // Descricao curta
  context: string       // Quando/por que foi aprendido
  source_repo: string | null
  tags: string[]
  promoted_to: string | null  // FK para sdk_standards.id
  created_at: string
  updated_at: string
}

interface SdkPitfall {
  id: string
  category: string
  rule: string          // O que NAO fazer
  context: string       // Por que e um problema
  source_repo: string | null
  tags: string[]
  severity: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
}

interface SdkProject {
  id: string
  slug: string
  name: string
  stack_choices: Record<string, string>
  created_at: string
  updated_at: string
}
```

## Ciclo de Vida do Conhecimento

O conhecimento do SDK segue um ciclo progressivo:

```
┌──────────┐     validado em      ┌───────────┐
│ LEARNING │ ──── 2+ projetos ──► │ STANDARD  │
│ (novo)   │                      │ (permanente)│
└──────────┘                      └───────────┘
      ▲
      │ add_learning()
      │
┌──────────┐
│ Projeto  │
│  Spoke   │
└──────────┘
```

1. **Captura** — O Claude Code em um spoke registra um learning via `add_learning`
2. **Validacao** — O learning aparece em consultas e e observado em outros projetos
3. **Promocao** — Apos confirmacao em 2+ projetos, usa `promote_to_standard`
4. **Standard** — A regra se torna permanente e aparece em `get_standards`

Pitfalls seguem ciclo similar, mas sem promocao — sao registros permanentes de "o que nao fazer".

## Exemplos de Uso

### Consultar padroes antes de implementar

{% prompt label="Verificar padroes de seguranca" %}
Antes de implementar autenticacao, consulte os standards de seguranca do SDK usando get_standards com category "security".
{% /prompt %}

### Verificar pitfalls antes de usar uma tecnologia

{% prompt label="Checar pitfalls de banco" %}
Antes de criar uma nova migration, consulte os pitfalls de database usando get_pitfalls com category "database".
{% /prompt %}

### Registrar um aprendizado

{% prompt label="Registrar learning" %}
Registre esse aprendizado no SDK usando add_learning:
- rule: [descricao curta]
- context: [o que aconteceu e por que e importante]
- category: [categoria]
- source_repo: [nome do repo atual]
{% /prompt %}

### Busca transversal

{% prompt label="Buscar no SDK" %}
Busque no SDK todo conhecimento relacionado a "RLS" usando search_knowledge.
{% /prompt %}

## Infraestrutura

| Aspecto | Detalhe |
|---------|---------|
| Runtime | Cloudflare Worker |
| Transporte | MCP Streamable HTTP (stateless) |
| Banco | Supabase PostgreSQL |
| Endpoint | `https://fxl-sdk-mcp.cauetpinciara.workers.dev/mcp` |
| Health | `https://fxl-sdk-mcp.cauetpinciara.workers.dev/health` |
| Codigo | `mcp/fxl-sdk/` no monorepo fxl-core |
| Deploy | `npx wrangler deploy` (via Cloudflare) |

### Variaveis de ambiente (Worker)

| Variavel | Descricao |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (acesso total) |
| `API_KEY` | Token para autenticacao de writes |

Configuradas via `wrangler secret put <NOME>`.

{% operational %}
## Notas Operacionais

### Deploy

O MCP Server e deployado como Cloudflare Worker:

```bash
cd mcp/fxl-sdk
npx wrangler deploy
```

### Secrets

Secrets sao configurados via CLI do Wrangler:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put API_KEY
```

### Testes manuais

Health check via curl:

```bash
curl https://fxl-sdk-mcp.cauetpinciara.workers.dev/health
```

### Adicionar novas tools

1. Criar a funcao em `mcp/fxl-sdk/src/tools/` (read, write ou meta)
2. Registrar com `server.tool()` em `mcp/fxl-sdk/src/index.ts`
3. Se for write tool, adicionar o nome no array `writeTools` em `isWriteRequest()`
4. Deploy com `npx wrangler deploy`
5. Atualizar esta pagina de docs
{% /operational %}
