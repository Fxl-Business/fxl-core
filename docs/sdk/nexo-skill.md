---
title: Nexo Skill
badge: SDK
description: A skill unificada do Claude Code para projetos FXL
scope: product
sort_order: 90
---

# Nexo Skill

A Nexo Skill e a skill unificada do Claude Code que consolida todas as capacidades
operacionais da FXL em um unico ponto de entrada. Ela orquestra scaffold, audit,
connect, deploy e mais — usando os padroes definidos no SDK e o MCP Server como
cerebro de conhecimento persistente.

{% callout type="warning" %}
A Nexo Skill **nao e um pacote npm**. Configs sao geradas como arquivos no projeto.
Types sao copiados, nao importados. CI roda um script bash gerado (`fxl-doctor.sh`).
{% /callout %}

## Visao Geral

A Nexo Skill vive em `.agents/skills/nexo/` no monorepo fxl-core e e carregada
automaticamente pelo Claude Code quando invocada via `/nexo`. Ela roteia para
6 capacidades distintas, cada uma com suas regras e integracoes.

```
┌──────────────────────────────────────────────────────┐
│                    Nexo Skill                        │
│                                                      │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐              │
│  │ Scaffold │ │  Audit  │ │ Connect  │  SDK Rules    │
│  └──────────┘ └─────────┘ └──────────┘              │
│                                                      │
│  ┌──────────────┐ ┌─────────────┐ ┌───────┐         │
│  │ Orchestrate  │ │ Methodology │ │ Learn │  Core    │
│  └──────────────┘ └─────────────┘ └───────┘         │
│                                                      │
│  ┌────────────────────────────────────────┐          │
│  │          MCP Bridge (automatico)       │          │
│  │  pre-operation → operacao → post-op    │          │
│  └────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────┘
```

## Estrutura de Arquivos

A skill segue uma organizacao modular onde cada capacidade tem seu proprio diretorio:

```
.agents/skills/nexo/
├── SKILL.md                    # Ponto de entrada — roteamento
├── sdk/                        # Regras de projetos spoke
│   ├── scaffold-flow.md        # Scaffold automatizado (recomendado)
│   ├── new-project.md          # Scaffold manual (referencia)
│   ├── new-project-from-blueprint.md  # Scaffold via Wireframe Builder
│   ├── audit.md                # Auditoria de conformidade
│   ├── connect.md              # Adicionar contract API
│   ├── refactor.md             # Migrar para padroes FXL
│   ├── ci-cd.md                # Configurar GitHub Actions
│   ├── deploy.md               # Deploy Vercel
│   └── standards.md            # Padroes de codigo FXL
├── orchestrator/               # Orquestracao multi-agente
│   ├── README.md               # Guia operacional
│   └── rules/
│       ├── boundary-detection.md   # Detectar limites do projeto
│       ├── task-analysis.md        # Avaliar paralelizacao
│       ├── orchestration.md        # Execucao em waves
│       ├── scoped-agent.md         # Regras por agente
│       └── integration-check.md    # Verificacao pos-execucao
├── methodology/                # Workflow FXL
│   ├── workflow.md             # Discuss / Plan / Execute
│   ├── pre-planning.md         # Contexto MCP antes de planejar
│   └── post-execution.md       # Captura de learnings apos executar
├── mcp-bridge/                 # Integracao com MCP Server
│   ├── pre-operation.md        # Enriquecimento de contexto
│   ├── spoke-planning.md       # Contexto estendido para scaffold
│   └── post-operation.md       # Captura de conhecimento
├── contract/                   # Contract API types
│   └── types.ts                # FxlAppManifest, endpoints, etc.
├── checklists/                 # Verificacao por area
│   ├── security-checklist.md
│   ├── structure-checklist.md
│   ├── typescript-checklist.md
│   ├── rls-checklist.md
│   └── contract-checklist.md
└── templates/                  # Templates de config
    ├── CLAUDE.md.template
    ├── mcp.json.template
    ├── tsconfig.json.template
    ├── eslint.config.js.template
    ├── prettier.config.js.template
    ├── tailwind.preset.js.template
    ├── vercel.json.template
    ├── ci.yml.template
    └── fxl-doctor.sh.template
```

## As 6 Capacidades

### 1. Scaffold

Cria projetos spoke completos do zero. O fluxo recomendado (`scaffold-flow.md`)
integra MCP, prompts de selecao e geracao automatica.

**Quando usar:** "Criar novo projeto spoke", "Scaffold um projeto FXL".

**O que faz:**

1. **Gather** — Coleta nome, slug, plataforma, framework e entidades do dominio
2. **Context** — Busca standards, pitfalls e learnings via MCP Server
3. **Generate** — Cria o diretorio completo do projeto com todos os arquivos
4. **Register** — Registra o projeto na base de conhecimento via MCP

**Arquivos gerados:**

| Arquivo | Descricao |
|---------|-----------|
| `CLAUDE.md` | Regras do projeto para o Claude Code |
| `.mcp.json` | Conexao com Nexo SDK MCP Server |
| `tsconfig.json` | TypeScript strict |
| `eslint.config.js` + `prettier.config.js` | Linting e formatacao |
| `vercel.json` | Security headers para deploy |
| `fxl-doctor.sh` | Health check para CI |
| `.github/workflows/ci.yml` | GitHub Actions |
| `src/` | App shell, contract stubs, types |
| `supabase/migrations/` | Schemas de entidades com RLS |

**Stack do projeto gerado:**

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- Supabase (database + auth RLS)
- Clerk (autenticacao independente do Hub)
- Vercel (deploy)
- GitHub Actions (CI)

{% callout type="info" %}
Para scaffold a partir de um export do Wireframe Builder, use o fluxo
`new-project-from-blueprint.md` que estende o scaffold padrao com dados do wireframe.
{% /callout %}

### 2. Audit

Avalia projetos existentes contra os padroes FXL e gera um relatorio de conformidade.

**Quando usar:** "Auditar este projeto", "Verificar conformidade FXL".

**O que faz:**

- Verifica estrutura de diretorios, TypeScript strict, security headers
- Verifica implementacao dos 6 endpoints do contract
- Verifica RLS policies no Supabase
- Gera `FXL-AUDIT.md` com score por categoria e plano de refactoring

**Categorias avaliadas:** stack, security, database, frontend, api, infrastructure

### 3. Connect

Adiciona os endpoints do FXL Contract API a um projeto existente.

**Quando usar:** "Adicionar contract FXL", "Conectar projeto ao Hub".

**O que faz:**

- Copia os types do contract (`types.ts`) para o projeto
- Implementa os 6 endpoints GET obrigatorios
- Configura middleware de validacao de API key (`X-FXL-API-Key`)

**Endpoints implementados:**

| Endpoint | Descricao |
|----------|-----------|
| `GET /api/fxl/manifest` | Metadata e definicoes de entidades |
| `GET /api/fxl/entities/:type` | Lista paginada de entidades |
| `GET /api/fxl/entities/:type/:id` | Entidade individual |
| `GET /api/fxl/widgets/:id/data` | Dados de widget (KPI, chart, table, list) |
| `GET /api/fxl/search?q=` | Busca cross-entity |
| `GET /api/fxl/health` | Health check com versao do contract |

### 4. Orchestrate

Orquestra execucao paralela com multiplos agentes Claude Code via tmux.

**Quando usar:** Ativado automaticamente quando o projeto tem 2+ boundaries
(modulos, packages, workspaces) e as tasks podem ser paralelizadas.

**Como funciona:**

1. **Boundary Detection** — Detecta limites do projeto (5 sinais em ordem de prioridade)
2. **Task Analysis** — Mapeia tasks para boundaries e calcula ratio de paralelizacao
3. **Orchestration** — Spawna agentes com escopo definido, organizados em waves
4. **Integration Check** — Verifica integracao apos todos os agentes completarem

**Thresholds de ativacao:**

| Ratio | Acao |
|-------|------|
| < 30% | Silencioso — execucao single-agent |
| 30-50% | Pergunta confirmacao ao usuario |
| > 50% | Ativa automaticamente |

**Pre-requisito:** `tmux` instalado e `teammateMode: "tmux"` no settings do Claude Code.
Sem tmux, roda em modo sequencial (mesma logica, sem paralelismo).

### 5. Methodology

Workflow FXL de 3 estagios (Discuss / Plan / Execute) com integracao MCP
em cada ponto.

**Quando usar:** Sempre que trabalhar em um projeto FXL. O workflow e usado
automaticamente pelo sistema GSD.

**Os 3 estagios:**

| Estagio | GSD Command | MCP Integration |
|---------|-------------|-----------------|
| **Discuss** | `/gsd:discuss-phase N` | Busca standards e pitfalls para informar gray areas |
| **Plan** | `/gsd:plan-phase N` | Pre-planning hook carrega contexto completo do MCP |
| **Execute** | `/gsd:execute-phase N` | Post-execution hook captura learnings e pitfalls |

**Regras do Discuss para projetos FXL:**

- Nunca perguntar sobre stack (stack e fixa)
- Nunca perguntar sobre estrutura de diretorios (estrutura e fixa)
- Nunca sugerir adicionar dependencias sem documentar
- Apresentar standards do MCP como defaults
- Sinalizar desvios de pitfalls conhecidos

**Regras do Execute para projetos FXL:**

- Rodar `npx tsc --noEmit` antes de considerar qualquer task feita
- Nunca usar `any` em TypeScript
- Deployar edge functions imediatamente apos criacao
- Verificar alteracoes visuais no browser (light + dark mode)

### 6. Learn

Conhecimento persistente via integracao com o MCP Server. A capacidade Learn
nao e invocada diretamente — ela se ativa automaticamente como parte das
outras capacidades atraves do MCP Bridge.

**Ciclo de vida do conhecimento:**

```
Projeto Spoke executa uma fase
  → descobre um padrao ou erro
  → add_learning() ou add_pitfall()
  → MCP armazena

Proximo projeto inicia uma fase
  → pre-planning busca get_pitfalls()
  → planner ja sabe evitar o erro
  → zero tempo perdido redescobrir o bug
```

**Quando o MCP Bridge ativa:**

| Operacao | Pre-Operacao | Pos-Operacao |
|----------|-------------|--------------|
| Scaffold | `spoke-planning.md` (estendido) | `post-operation.md` + `register_project` |
| Audit | `pre-operation.md` | `post-operation.md` |
| Connect | `pre-operation.md` | `post-operation.md` |
| Refactor | `pre-operation.md` | `post-operation.md` |
| CI/CD | `pre-operation.md` | `post-operation.md` |
| Deploy | `pre-operation.md` | `post-operation.md` |

**Criterios para registrar um learning:**

- Padrao que funcionou bem e beneficiaria projetos futuros
- Workaround para quirk de biblioteca ou API
- Sequencia de passos que deve ser seguida em ordem especifica
- Issue de configuracao nao-obvio resolvido

**Criterios para registrar um pitfall:**

- Erro nao-obvio a partir da documentacao
- Configuracao que falha silenciosamente
- Combinacao de libs que conflita
- Problema de seguranca que nunca deve se repetir

**Promocao a standard:** Um learning e promovido via `promote_to_standard()` quando
validado em 2+ projetos. Standards sao permanentes e aparecem em `get_standards()`.

## Integracao com MCP Server

A Nexo Skill e o MCP Server trabalham juntos. A skill define **como** executar
operacoes; o MCP Server fornece **contexto** (standards, pitfalls, learnings)
e **persiste** conhecimento novo.

```
┌─────────────────┐                    ┌──────────────────┐
│   Nexo Skill    │ ── consulta ──►    │   MCP Server     │
│  (execucao)     │                    │  (conhecimento)  │
│                 │ ◄── contexto ──    │                  │
│  scaffold       │                    │  get_standards   │
│  audit          │ ── registra ──►    │  get_pitfalls    │
│  connect        │                    │  get_learnings   │
│  orchestrate    │                    │  add_learning    │
│  methodology    │                    │  add_pitfall     │
│  learn          │                    │  search_knowledge│
└─────────────────┘                    └──────────────────┘
```

**Fluxo tipico de uma operacao:**

1. Pre-operation: buscar learnings e pitfalls relevantes via MCP
2. Executar a operacao seguindo as regras da skill
3. Post-operation: avaliar se novos learnings ou pitfalls surgiram
4. Se sim, registrar no MCP para beneficiar projetos futuros

Para detalhes completos do MCP Server (setup, tools, autenticacao),
veja a pagina [MCP Server](/sdk/mcp-server).

## Exemplo: Scaffold de Projeto Spoke

O fluxo completo de scaffold demonstra como as capacidades se integram.

### Passo 1 — Invocar a skill

{% prompt label="Scaffold novo projeto" %}
/nexo scaffold um novo projeto spoke chamado "Beach House" para gerenciamento de reservas de casas de praia.
{% /prompt %}

### Passo 2 — Gather (coleta de inputs)

A skill pergunta nome, slug, descricao, e entidades do dominio.
Com os dados coletados:

```
project_name: Beach House
project_slug: beachhouse
entities: reservation, property, guest
platform: web
framework: vite
```

### Passo 3 — Context (MCP)

A skill consulta o MCP Server automaticamente:

```
get_standards()             → carrega 101 padroes FXL
get_pitfalls()              → carrega 30 pitfalls conhecidos
get_learnings()             → carrega learnings de projetos anteriores
get_project_config("beachhouse") → verifica se ja existe
get_checklist("structure")  → checklist de estrutura
get_checklist("security")   → checklist de seguranca
```

### Passo 4 — Generate

Cria o diretorio `../beachhouse/` com todos os arquivos:
configs, app shell, contract stubs, migrations com RLS, CI/CD.

### Passo 5 — Register

```
register_project(slug: "beachhouse", name: "Beach House", ...)
```

O projeto agora aparece em consultas `get_project_config("beachhouse")`.

### Passo 6 — Verificacao

```bash
npx tsc --noEmit    # zero erros
npm run build        # build bem-sucedido
bash fxl-doctor.sh   # todos os checks passam
```

## Checklists

A skill inclui 5 checklists para verificacao por area. Eles sao usados
automaticamente durante scaffold e audit, e podem ser consultados via MCP.

| Checklist | Verifica |
|-----------|----------|
| `security-checklist.md` | Auth, headers, env vars, RLS |
| `structure-checklist.md` | Layout de diretorios, naming, imports |
| `typescript-checklist.md` | Strict mode, no any, tipagem correta |
| `rls-checklist.md` | Policies RLS por tabela no Supabase |
| `contract-checklist.md` | Todos os endpoints, formatos de response |

{% prompt label="Consultar checklist via MCP" %}
Use a tool get_checklist do MCP server fxl-sdk com name "security" para ver o checklist de seguranca.
{% /prompt %}

## Templates

Config templates sao copiados para o projeto spoke (nao importados/estendidos):

| Template | Destino no Spoke | Descricao |
|----------|------------------|-----------|
| `CLAUDE.md.template` | `CLAUDE.md` | Regras do projeto para Claude Code |
| `mcp.json.template` | `.mcp.json` | Conexao com MCP Server |
| `tsconfig.json.template` | `tsconfig.json` | TypeScript strict config |
| `eslint.config.js.template` | `eslint.config.js` | ESLint flat config |
| `prettier.config.js.template` | `prettier.config.js` | Prettier config |
| `tailwind.preset.js.template` | `tailwind.preset.js` | Tailwind preset FXL |
| `vercel.json.template` | `vercel.json` | Deploy config com security headers |
| `ci.yml.template` | `.github/workflows/ci.yml` | GitHub Actions CI |
| `fxl-doctor.sh.template` | `fxl-doctor.sh` | Script de health check |

## Navegacao Rapida

**SDK Rules:**

| Comando | Descricao |
|---------|-----------|
| `/nexo/sdk/scaffold-flow` | Scaffold novo projeto (recomendado) |
| `/nexo/sdk/standards` | Padroes de codigo |
| `/nexo/sdk/audit` | Auditar projeto existente |
| `/nexo/sdk/connect` | Adicionar contract API |
| `/nexo/sdk/refactor` | Migrar para padroes FXL |
| `/nexo/sdk/ci-cd` | Configurar GitHub Actions |
| `/nexo/sdk/deploy` | Configurar Vercel |

**Orchestrator:**

| Comando | Descricao |
|---------|-----------|
| `/nexo/orchestrator/rules/boundary-detection` | Detectar boundaries |
| `/nexo/orchestrator/rules/task-analysis` | Avaliar paralelizacao |
| `/nexo/orchestrator/rules/orchestration` | Execucao em waves |
| `/nexo/orchestrator/rules/scoped-agent` | Regras por agente |
| `/nexo/orchestrator/rules/integration-check` | Verificacao pos-execucao |

**Methodology:**

| Comando | Descricao |
|---------|-----------|
| `/nexo/methodology/workflow` | Workflow discuss/plan/execute |
| `/nexo/methodology/pre-planning` | Contexto MCP antes de planejar |
| `/nexo/methodology/post-execution` | Captura de learnings |

**MCP Bridge:**

| Comando | Descricao |
|---------|-----------|
| `/nexo/mcp-bridge/pre-operation` | Enriquecimento de contexto |
| `/nexo/mcp-bridge/spoke-planning` | Contexto estendido para scaffold |
| `/nexo/mcp-bridge/post-operation` | Captura de conhecimento |

{% operational %}
## Notas Operacionais

### Relacao entre os 3 pilares do SDK

A Nexo Skill e um dos 3 pilares do SDK (veja [Visao Geral](/sdk/visao-geral)):

- **Docs** (esta secao) — referencia canonica para humanos e Claude
- **MCP Server** — cerebro de conhecimento acessivel por Claude Code em qualquer repo
- **Nexo Skill** — skill de execucao no Claude Code dentro do Hub fxl-core

### Quando usar Nexo Skill vs MCP Server diretamente

| Cenario | Usar |
|---------|------|
| Dentro do monorepo fxl-core | Nexo Skill (tem acesso a tudo) |
| Em um projeto spoke | MCP Server (via `.mcp.json`) |
| Scaffold novo projeto | Nexo Skill (gera o projeto + configura MCP) |
| Consultar standards em qualquer lugar | MCP Server |

### Fallbacks

| Falha | Comportamento |
|-------|---------------|
| MCP Server indisponivel | Skill continua com templates locais. Warning logado. |
| tmux indisponivel | Orchestrator roda em modo sequencial. |
| Template ausente | Skill gera o arquivo diretamente (sem template). |
{% /operational %}
