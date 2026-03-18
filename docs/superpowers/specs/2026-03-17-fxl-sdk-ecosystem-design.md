# FXL SDK Ecosystem — Design Spec

**Data:** 2026-03-17
**Autor:** Cauet + Claude
**Status:** Draft
**Escopo:** 3 milestones (v5.0, v5.1, v5.2)

---

## 1. Contexto e Motivacao

A FXL constroi sistemas para multiplos clientes. Cada cliente tem seu proprio repositorio e aplicacao. O FXL SDK e o playbook de engenharia que toda aplicacao deve seguir — stack, banco, infra, analytics, seguranca, documentacao e integracao com o Nexo Hub.

### Problema atual

- O SDK existe apenas como skill do Claude Code (`.agents/skills/fxl-sdk/`), invisivel para humanos
- Conhecimento adquirido em um repo de cliente nao se propaga para outros repos
- Nao existe um mecanismo de feedback loop cross-repo
- Padroes que vao alem de "web React" (mobile, infra, analytics) ainda nao estao definidos

### Visao

O FXL SDK se torna um ecossistema com 3 pilares:

```
1. SDK DOCS (docs/sdk/)     — Referencia visual no Nexo para humanos
2. MCP SERVER               — Cerebro central que persiste e distribui conhecimento cross-repo
3. NEXO SKILL               — Engine unificada do Claude Code (SDK + orchestration + metodologia)
```

---

## 2. Decisoes de Design

| Decisao | Escolha | Alternativas consideradas |
|---------|---------|--------------------------|
| Estrutura dos docs | Flat (`docs/sdk/*.md`) | Hierarquico (sub-pastas), pagina unica |
| Audiencia dos docs | Cauet (referencia propria) | Devs externos, clientes |
| Relacao docs↔skill | Docs sao vitrine legivel, skill e a engine | Docs como fonte de verdade, substituir skill |
| Escopo inicial dos docs | Documentar existente + esqueleto do planejado | Tudo de uma vez, so existente |
| Mecanismo cross-repo | MCP Server HTTP remoto + Supabase | Git-based sync, global CLAUDE.md, monorepo |
| Persistencia | Supabase (tabelas simples) | Vector database |
| Onde vive o MCP Server | Codigo dentro do FXL Core, deploy remoto | Repo separado |
| Organizacao em milestones | 3 sequenciais (v5.0 → v5.1 → v5.2) | Mega-milestone unica |
| Scope dos docs no Nexo | Product docs (scope='product', visivel a todos) | Tenant docs (isolados por org) |
| Skill consolidada | Nexo Skill unifica SDK + orchestrator + GSD custom | Manter skills separadas |

---

## 3. Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      FXL SDK Ecosystem                       │
│                                                              │
│  PILAR 1: DOCS          PILAR 2: MCP SERVER    PILAR 3: SKILL│
│  docs/sdk/ no Nexo      HTTP remoto +          Nexo Skill    │
│  Product Docs            Supabase              unificada     │
│  (scope='product')                                           │
│                                                              │
│  Humano consulta         Claude Code           Claude Code   │
│  no browser              consulta em           executa em    │
│                          qualquer repo         qualquer repo │
└─────────────────────────────────────────────────────────────┘
```

### O que vive em cada pilar

| Conteudo | Docs | MCP | Skill |
|----------|------|-----|-------|
| Stack aprovada | Sim | Sim | Sim |
| Contract API | Sim | Sim | Sim |
| Templates de config | Sim (visualizacao) | — | Sim (geracao) |
| Checklists | Sim | Sim | Sim |
| Learnings/Pitfalls | Sim (resumo) | Sim (fonte de verdade) | Le do MCP |
| Como subir o MCP | Sim | — | — |
| Como criar spoke | Sim | — | Sim (execucao) |

---

## 4. v5.0 — SDK Docs

### Objetivo

Criar secao dedicada "FXL SDK" nos docs do Nexo com todas as paginas fundamentais populadas e paginas futuras como esqueleto.

### Estrutura de paginas

```
docs/sdk/
├── index.md                 ← Hub do SDK: mapa visual com status de cada secao
│
│── Fundamentais (conteudo extraido do skill existente)
├── visao-geral.md           ← O que e o SDK, arquitetura Hub↔Spoke, pilares
├── stack.md                 ← Stack aprovada, versoes, decisoes tecnicas
├── contract.md              ← API contract (6 endpoints, types, exemplos)
├── estrutura-projeto.md     ← Estrutura de diretorios padrao de um spoke
├── templates.md             ← Configs geradas (tsconfig, eslint, tailwind, etc.)
├── checklists.md            ← 5 checklists (security, structure, TS, RLS, contract)
├── ci-cd.md                 ← GitHub Actions, fxl-doctor.sh, deploy Vercel
│
│── Em construcao (esqueleto + visao do que sera)
├── code-standards.md        ← Convencoes de codigo, naming, lint, patterns
├── database.md              ← Padroes de banco, migrations, RLS, modelagem
├── security.md              ← Auth, headers, env vars, RLS, API keys
├── analytics.md             ← Metricas, extracao de dados, dashboards
├── infrastructure.md        ← Docker, K8s, ambientes, scaling
├── mobile.md                ← React Native/Expo, padroes mobile
├── documentation.md         ← Processos de documentacao obrigatorios
├── mcp-server.md            ← Como subir, configurar e usar o MCP Knowledge
├── nexo-skill.md            ← A skill unificada e como funciona
```

### Frontmatter padrao

```yaml
---
title: Nome da Pagina
badge: SDK
description: Uma frase descrevendo o conteudo
scope: product
sort_order: 10
---
```

Nota: o campo `scope` garante que o sync-up sete `scope = 'product'` no Supabase (o default e 'tenant'). O `sort_order` controla a ordem no sidebar. Requer atualizacao do `tools/sync/sync-up.ts` para ler esses campos do frontmatter.

### Paginas "em construcao"

Cada pagina futura contem:
- Titulo e descricao do que sera coberto
- Lista de topicos planejados
- Callout informativo: `{% callout type="info" %}Secao em construcao — prevista para v5.X{% /callout %}`

### Paginas fundamentais — fonte do conteudo

| Pagina | Fonte no skill atual |
|--------|---------------------|
| visao-geral.md | SKILL.md + README conceitual |
| stack.md | rules/standards.md (secao stack) |
| contract.md | contract/types.ts + rules/connect.md |
| estrutura-projeto.md | rules/new-project.md (secao estrutura) |
| templates.md | templates/*.template (descricao de cada um) |
| checklists.md | checklists/*.md (consolidado) |
| ci-cd.md | rules/ci-cd.md + rules/deploy.md |

### Integracao com Nexo

1. **Rota** (prerequisito — sem isso paginas dao 404): adicionar `{ path: '/sdk/*', element: <DocRenderer /> }` em `src/modules/docs/manifest.tsx`
2. **Scope**: todas as paginas com `scope = 'product'` (visiveis a todos os tenants). Requer: (a) adicionar `scope` ao frontmatter spec, (b) atualizar `sync-up.ts` para ler `scope` do frontmatter, (c) migration de safety net setando `scope = 'product'` para slugs `sdk/%`
3. **Badge**: "SDK" (novo badge, distinto de Processo/Padroes/Ferramentas)
4. **Sync**: `make sync-up` para popular Supabase com os .md criados
5. **Sidebar**: product docs atualmente renderizam como lista flat via `useDocsNav()`. Para o SDK (15+ paginas), estender `useDocsNav` para agrupar product docs por badge sob um no pai "FXL SDK" no sidebar. Alternativa: o `docs/sdk/index.md` funciona como hub visual e a lista flat e aceitavel no sidebar

### Fases da v5.0

| Fase | Descricao |
|------|-----------|
| 1 | Integracao Nexo (rota /sdk/*, atualizar sync-up.ts para scope/sort_order, migration de scope, badge SDK) — prerequisito para tudo |
| 2 | Index + visao geral (hub de navegacao com mapa de status) |
| 3 | Paginas fundamentais (stack, contract, estrutura, templates, checklists, ci-cd) |
| 4 | Paginas esqueleto (security, database, analytics, mobile, infra, code-standards, documentation, mcp-server, nexo-skill) |
| 5 | Sidebar grouping (estender useDocsNav para agrupar SDK docs sob no pai) |

---

## 5. v5.1 — MCP Server

### Objetivo

Construir um MCP Server HTTP remoto que serve como cerebro central de conhecimento, persistindo em Supabase e acessivel de qualquer repositorio via configuracao global do Claude Code.

### Arquitetura

```
┌──────────────────────────────────────────────────┐
│  MCP Server "fxl-sdk"  (HTTP remoto)             │
│                                                   │
│  Tools expostas ao Claude Code:                   │
│                                                   │
│  READ                                             │
│  ├─ get_standards(category?)  → regras do SDK     │
│  ├─ get_learnings(category?)  → padroes aprendidos│
│  ├─ get_pitfalls(category?)   → erros a evitar    │
│  ├─ get_checklist(name)       → checklist completo│
│  └─ search_knowledge(query)   → busca por texto   │
│                                                   │
│  WRITE                                            │
│  ├─ add_learning(rule, context, category,         │
│  │              source_repo)                      │
│  ├─ add_pitfall(rule, context, category,          │
│  │             source_repo)                       │
│  └─ promote_to_standard(learning_id)              │
│                                                   │
│  META                                             │
│  ├─ get_sdk_status()          → versao, stats     │
│  └─ get_project_config(slug)  → config do projeto │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │  Supabase       │
    │                 │
    │  sdk_standards  │  category, rule, details, examples, version
    │  sdk_learnings  │  category, rule, context, source_repo, created_at
    │  sdk_pitfalls   │  category, rule, context, source_repo, severity
    │  sdk_projects   │  slug, name, stack_choices, created_at
    └─────────────────┘
```

### Schema Supabase

#### sdk_standards

```sql
CREATE TABLE sdk_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,        -- 'stack', 'security', 'database', etc.
  rule text NOT NULL,             -- regra curta
  details text NOT NULL,          -- explicacao detalhada
  examples text,                  -- exemplos de codigo/uso
  version text NOT NULL DEFAULT 'v1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### sdk_learnings

```sql
CREATE TABLE sdk_learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rule text NOT NULL,
  context text NOT NULL,          -- quando/por que isso foi aprendido
  source_repo text,               -- repo de origem (ex: 'beachhouse-app')
  tags jsonb DEFAULT '[]',        -- tags cross-cutting (ex: ["api", "error-handling"])
  promoted_to uuid REFERENCES sdk_standards(id),  -- null ate ser promovido
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### sdk_pitfalls

```sql
CREATE TABLE sdk_pitfalls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  rule text NOT NULL,              -- o que NAO fazer
  context text NOT NULL,           -- por que isso e um problema
  source_repo text,
  tags jsonb DEFAULT '[]',        -- tags cross-cutting
  severity text NOT NULL DEFAULT 'medium',  -- 'low', 'medium', 'high'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### sdk_projects

```sql
CREATE TABLE sdk_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,       -- ex: 'beachhouse'
  name text NOT NULL,              -- ex: 'Beach House Reservas'
  stack_choices jsonb NOT NULL DEFAULT '{}',  -- ex: {"platform":"web","framework":"vite","auth":"clerk"}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Ciclo de vida de um aprendizado

```
LEARNING (novo)  ──→  validado em 2+ projetos  ──→  STANDARD (permanente)
     │                                                     │
sdk_learnings                                        sdk_standards
(promoted_to = null)                                 (promote_to_standard)
```

### Configuracao em projetos spoke

```json
// .mcp.json (no repo do spoke)
{
  "mcpServers": {
    "fxl-sdk": {
      "type": "http",
      "url": "https://<endpoint>/mcp"
    }
  }
}
```

Tambem pode ser configurado globalmente em `~/.claude/settings.json` para estar disponivel em todos os repos sem configuracao individual.

### Busca de conhecimento

A tool `search_knowledge(query)` usa PostgreSQL full-text search (`to_tsvector`/`to_tsquery`) com indice GIN nas colunas `rule` e `details`/`context`. Nao requer extensoes adicionais alem do que o Supabase ja fornece.

```sql
CREATE INDEX idx_sdk_standards_search ON sdk_standards USING gin(to_tsvector('portuguese', rule || ' ' || details));
CREATE INDEX idx_sdk_learnings_search ON sdk_learnings USING gin(to_tsvector('portuguese', rule || ' ' || context));
CREATE INDEX idx_sdk_pitfalls_search ON sdk_pitfalls USING gin(to_tsvector('portuguese', rule || ' ' || context));
```

### Autenticacao do MCP Server

O MCP Server protege operacoes de escrita com API key via header `Authorization: Bearer <token>`. O token e uma chave gerada e armazenada como variavel de ambiente no deploy. A mesma chave e configurada no `.mcp.json` dos spokes.

Operacoes de leitura podem ser abertas (o conteudo do SDK nao e sensivel) ou protegidas com a mesma chave, a decidir na implementacao.

### RLS nas tabelas SDK

As tabelas SDK sao acessadas exclusivamente pelo MCP Server usando a **service role key** do Supabase, que bypassa RLS. RLS fica habilitado mas sem policies permissivas — garantindo que acesso direto via anon key e bloqueado.

```sql
ALTER TABLE sdk_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_pitfalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_projects ENABLE ROW LEVEL SECURITY;
-- Sem policies = acesso apenas via service role key
```

### Onde vive o codigo

Dentro do FXL Core em pasta dedicada (ex: `mcp/fxl-sdk/`).

**Deploy recomendado:** Cloudflare Worker. Justificativa:
- Suporte nativo a SSE (necessario para MCP HTTP transport)
- Sem limite de timeout para streaming (Edge Functions do Supabase tem 60s)
- Free tier generoso para uso interno
- Alternativa se necessario: Vercel Serverless (Pro plan, 60s timeout)

O protocolo MCP HTTP usa request-response para tool calls e SSE para streaming. Cloudflare Workers suportam ambos nativamente.

### Fases da v5.1

| Fase | Descricao |
|------|-----------|
| 1 | Schema Supabase (migrations para sdk_standards, sdk_learnings, sdk_pitfalls, sdk_projects) |
| 2 | MCP Server (implementar tools read/write, protocolo HTTP MCP) |
| 3 | Deploy + config (deploy como servico, configurar .mcp.json) |
| 4 | Seed data (popular sdk_standards e sdk_pitfalls com conteudo existente do skill) |
| 5 | Docs update (preencher docs/sdk/mcp-server.md com guia completo) |

---

## 6. v5.2 — Nexo Skill

### Objetivo

Consolidar as skills existentes (FXL SDK skill + agent orchestrator) em uma Nexo Skill unificada que integra com o MCP Server e customiza a metodologia GSD para projetos FXL.

### Estrutura

```
.agents/skills/nexo/
├── SKILL.md                  ← Entry point (router de capacidades)
├── sdk/
│   ├── standards.md          ← Regras de stack e codigo (atual rules/standards.md)
│   ├── new-project.md        ← Scaffold de novo spoke (atual rules/new-project.md)
│   ├── new-project-from-blueprint.md
│   ├── audit.md              ← Auditoria de spoke
│   ├── connect.md            ← Adicionar contract API
│   ├── refactor.md           ← Refactoring patterns
│   ├── ci-cd.md              ← CI/CD setup
│   └── deploy.md             ← Deploy Vercel
├── orchestrator/
│   ├── parallel-agents.md    ← Multi-agent em waves
│   └── coordination.md       ← Coordenacao entre agentes
├── methodology/
│   ├── workflow.md           ← Fluxo discuss→plan→execute (GSD bridge)
│   └── post-execution.md     ← Captura automatica de learnings
├── mcp-bridge/
│   └── integration.md        ← Como a skill consulta e alimenta o MCP
├── contract/
│   └── types.ts              ← Types do contract Hub↔Spoke
├── templates/                ← Templates de config (existentes)
└── checklists/               ← Checklists de qualidade (existentes)
```

### Capacidades

| Capacidade | Descricao | Fonte |
|------------|-----------|-------|
| Scaffold | Criar novo spoke com stack correta, configs, CLAUDE.md | SDK skill atual |
| Audit | Verificar spoke contra checklists do SDK | SDK skill atual |
| Connect | Adicionar contract API a projeto existente | SDK skill atual |
| Orchestrate | Gerenciar multiplos agentes em paralelo | Agent orchestrator |
| Methodology | Seguir fluxo discuss→plan→execute | GSD bridge customizado |
| Learn | Consultar e alimentar o MCP Server | Novo (mcp-bridge) |

### Relacao com o GSD

- GSD continua como plugin externo (open source, generico)
- Nexo Skill **usa** o GSD como base mas adiciona camadas FXL:
  - Consulta MCP antes de planejar (padroes e pitfalls existentes)
  - Pos-execucao: captura learnings automaticamente via MCP
  - Orchestration de agentes integrada ao fluxo GSD

### Fluxo de novo projeto spoke

```
Input: "Criar spoke para cliente BeachHouse — sistema de reservas web"
                    │
          ┌────────▼────────┐
          │  Nexo Skill     │
          │                 │
          │  1. Consulta MCP:
          │     - get_standards() → regras atuais
          │     - get_learnings() → padroes de projetos anteriores
          │     - get_pitfalls() → erros a evitar
          │                 │
          │  2. Faz perguntas:
          │     - Web ou mobile?
          │     - Vite ou Next.js?
          │     - Quais modulos?
          │     - Quais entidades?
          │                 │
          │  3. Registra projeto no MCP:
          │     - sdk_projects { slug, name, stack_choices }
          │                 │
          │  4. Gera scaffold:
          │     - Estrutura de pastas
          │     - Configs do SDK (templates)
          │     - CLAUDE.md do spoke (com regras + MCP config)
          │     - .mcp.json (apontando para o MCP Server)
          │                 │
          │  5. Segue metodologia GSD para implementar
          └─────────────────┘
```

### Fases da v5.2

| Fase | Descricao |
|------|-----------|
| 1 | Consolidar SDK skill + orchestrator na estrutura Nexo Skill |
| 2 | Methodology layer (GSD bridge, fluxo customizado FXL) |
| 3 | MCP bridge (skill consulta e alimenta MCP automaticamente) |
| 4 | Scaffold flow (criar spoke completo via skill + MCP) |
| 5 | Docs update (preencher docs/sdk/nexo-skill.md) |
| 6 | Deprecar skills antigas (remover .agents/skills/fxl-sdk/ e agent-orchestrator, atualizar referencias) |

---

## 7. Dependencias entre Milestones

```
v5.0 SDK Docs ──→ v5.1 MCP Server ──→ v5.2 Nexo Skill
(independente)    (precisa dos docs    (precisa do MCP
                   para saber o que     para consultar
                   popular no MCP)      e alimentar)
```

---

## 8. Restricoes e Regras

- Docs seguem o padrao de frontmatter do Nexo (title, badge, description)
- Badge "SDK" para todas as paginas do SDK
- Scope "product" para visibilidade global
- MCP Server nao usa vector database — tabelas simples com busca por texto
- O skill existente (`.agents/skills/fxl-sdk/`) permanece funcional durante toda a transicao. Deprecacao e remocao das skills antigas (fxl-sdk + agent-orchestrator) acontece na fase final da v5.2, apos validacao da Nexo Skill
- Nenhuma pagina "em construcao" finge ter conteudo — transparencia sobre o que existe e o que nao
- CLAUDE.md do spoke sempre inclui configuracao do MCP Server
- Learnings so sao promovidos a standards quando validados em 2+ projetos (promote_to_standard aceita `validation_repos: string[]` como evidencia)
- Docs SDK sao "vitrine" — quando um standard evolui no MCP, a pagina de docs correspondente deve ser atualizada manualmente. Processo de sync docs↔MCP sera definido na v5.1 fase 5

---

## 9. Criterios de Sucesso

### v5.0
- Todas as paginas fundamentais acessiveis no Nexo via /sdk/*
- Conteudo extraido do skill sem perda de informacao
- Paginas esqueleto com estrutura clara do que sera coberto
- Badge "SDK" visivel na navegacao

### v5.1
- MCP Server respondendo via HTTP com todas as tools definidas
- Tabelas Supabase populadas com standards e pitfalls existentes
- Configuravel via .mcp.json em qualquer repo
- Claude Code consegue chamar get_standards() e receber dados

### v5.2
- Nexo Skill funcional com todas as capacidades listadas
- Scaffold de novo spoke gera projeto completo com CLAUDE.md + .mcp.json
- Learnings capturados em spoke chegam ao MCP automaticamente
- Agent orchestration integrada ao fluxo GSD
