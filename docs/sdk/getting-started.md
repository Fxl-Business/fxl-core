---
title: Getting Started
badge: SDK
description: Passo a passo completo para configurar o Nexo SDK e criar seu primeiro projeto spoke
scope: product
sort_order: 5
---

# Getting Started — Nexo SDK

Este guia cobre tudo que voce precisa para sair do zero ate ter um projeto spoke
rodando com o Nexo SDK completo: Nexo Skill, MCP Server, backend Hono e frontend React.

{% callout type="warning" %}
O Nexo SDK **nao e um pacote npm**. Ele e composto por tres pilares: Docs (esta pagina),
MCP Server (banco de conhecimento) e Nexo Skill (execucao via Claude Code).
Nao existe `npm install fxl-sdk`.
{% /callout %}

---

## Pre-requisitos

Antes de comecar, confirme que voce tem tudo instalado:

| Ferramenta | Versao minima | Verificar |
|-----------|--------------|-----------|
| **Claude Code** | Latest | `claude --version` |
| **Bun** | 1.x | `bun --version` |
| **Git** | 2.x | `git --version` |
| **Node.js** | 18.x | `node --version` |
| Acesso ao repo `fxl-core` | — | Clonar e ter acesso de leitura |

---

## Passo 1 — Configurar o MCP Server

O MCP Server e o cerebro do SDK. Ele armazena standards, pitfalls e learnings
que o Claude Code consulta automaticamente durante qualquer operacao.

### 1.1 Adicionar ao `.mcp.json` do projeto

Em qualquer projeto spoke, crie ou edite `.mcp.json` na raiz:

```json
{
  "mcpServers": {
    "fxl-sdk": {
      "type": "http",
      "url": "https://fxl-sdk-mcp.cauetpinciara.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer {{FXL_MCP_TOKEN}}"
      }
    }
  }
}
```

{% callout type="info" %}
O template `.mcp.json` esta em `.agents/skills/nexo/templates/mcp.json.template`
no repo `fxl-core`. Copie e substitua `{{FXL_MCP_TOKEN}}` pelo token fornecido pelo time FXL.
O MCP Server e um Cloudflare Worker — nao e necessario instalar nada localmente.
{% /callout %}

### 1.2 Verificar conexao

Abra Claude Code no projeto e execute:

{% prompt label="Verificar MCP Server" %}
Use a tool get_sdk_status do MCP server fxl-sdk para verificar se a conexao esta funcionando.
{% /prompt %}

Resposta esperada: versao atual, contagem de standards, pitfalls e learnings.

---

## Passo 2 — Instalar a Nexo Skill

A Nexo Skill e a skill do Claude Code que orquestra todas as operacoes FXL.
Ela vive no repo `fxl-core` e e carregada via Superpowers.

### 2.1 Pre-requisito: Superpowers instalado

Confirme que o Superpowers esta instalado no Claude Code. Ele gerencia as skills.

### 2.2 A Nexo Skill ja esta disponivel

Se voce tem acesso ao repo `fxl-core`, a Nexo Skill esta em:

```
fxl-core/.agents/skills/nexo/
```

O Claude Code a carrega automaticamente quando invocada. Para verificar:

{% prompt label="Verificar Nexo Skill" %}
/nexo me mostra o que voce consegue fazer
{% /prompt %}

---

## Passo 3 — Iniciar um Projeto Spoke

Existem dois caminhos: **novo projeto do zero** ou **projeto existente** (ex: exportado do Lovable).

### Caminho A — Novo projeto do zero

Use o `scaffold-flow` para criar toda a estrutura monorepo automaticamente.

#### Estrutura gerada

```
{slug}/
├── frontend/          ← React 18 + Vite + Tailwind + shadcn/ui
├── backend/           ← Hono 4.x (Node.js) — API server
├── shared/            ← Tipos TypeScript compartilhados
└── supabase/          ← SQL migrations com RLS
```

#### Como executar

Abra Claude Code dentro do repo `fxl-core` e execute:

{% prompt label="Scaffold novo spoke" %}
/nexo cria um novo projeto spoke chamado "{nome do projeto}" para {descricao em uma linha}.
{% /prompt %}

O fluxo vai:
1. Perguntar nome, slug, descricao e entidades do dominio
2. Buscar standards e pitfalls no MCP Server
3. Gerar o monorepo completo em `../{slug}/`
4. Registrar o projeto no MCP Server

#### Proximos passos apos scaffold

1. Criar projeto no **Supabase** e copiar URL + service role key
2. Criar aplicacao no **Clerk** e copiar publishable key + secret key
3. Criar `.env.local` em `backend/` e `frontend/` com as credenciais
4. Criar repositorio no GitHub e fazer o primeiro push
5. Conectar ao **Vercel** (frontend) e **Railway** (backend)
6. Aplicar migrations no Supabase: `supabase db push`

---

### Caminho B — Projeto existente (Lovable ou outro)

Use o `refactor-flow` para auditar o projeto e migra-lo para conformidade FXL.

#### Preparar o projeto

```bash
# Clone o projeto existente
git clone {url-do-projeto} {slug}
cd {slug}

# Remova o .git original
rm -rf .git

# Inicie um novo repositorio
git init
```

#### Como executar

Abra Claude Code dentro do `fxl-core` e execute:

{% prompt label="Refatorar projeto existente" %}
/nexo quero migrar o projeto existente em {caminho/para/projeto} para o padrao FXL spoke.
{% /prompt %}

O fluxo vai:

| Estagio | O que acontece |
|---------|---------------|
| **Gather** | Coleta informacoes do projeto, origem, modo de preservacao |
| **Context** | Busca standards, pitfalls e checklists no MCP Server |
| **Audit** | Gera `FXL-AUDIT.md` com score de conformidade e gaps identificados |
| **Roadmap** | Converte o audit em fases GSD ordenadas |
| **Execute** | Guia o refactor passo a passo com verificacao entre fases |
| **Register** | Registra o projeto no MCP Server |

{% callout type="info" %}
Para projetos gerados pelo Lovable, o refactor-flow detecta automaticamente os
problemas mais comuns: TypeScript sem strict, Supabase Auth ao inves de Clerk,
`user_id` ao inves de `org_id`, SELECT publico sem RLS, e ausencia de backend.
{% /callout %}

---

## Passo 4 — Primeira Sessao no Projeto

Toda vez que voce abrir Claude Code em um projeto spoke, comece com o onboarding.
Isso orienta o Claude sobre o estado atual do projeto.

{% prompt label="Iniciar sessao — copie e use sempre" %}
Voce esta num projeto FXL spoke. Leia o CLAUDE.md, carregue o contexto MCP,
e me oriente sobre o estado atual do projeto antes de comecarmos a trabalhar.
{% /prompt %}

O Claude vai:
1. Ler o `CLAUDE.md` do projeto
2. Verificar a conexao com o MCP Server
3. Carregar standards e pitfalls relevantes
4. Identificar o estado atual (scaffold recente / refactor em andamento / desenvolvimento ativo)
5. Apresentar um resumo e aguardar instrucoes

---

## Passo 5 — Trabalhar com o Workflow FXL

Todo trabalho no projeto segue o ciclo **Discuss → Plan → Execute** via comandos GSD.

```
/gsd:discuss-phase N    ← define decisoes tecnicas antes de planejar
/gsd:plan-phase N       ← gera PLAN.md com tasks baseadas no MCP
/gsd:execute-phase N    ← executa o plano com TDD e commits atomicos
```

### Quando o Claude ativa spikes automaticamente

Antes de planejar, o Claude avalia se ha incerteza tecnica bloqueante.
Se sim, ele propoe um spike (exploracao time-boxed de 30min) antes de continuar.

Exemplos de situacoes que geram spike automatico:
- Integracao com lib nunca usada no projeto
- Dois sistemas se conectando sem contrato conhecido
- MCP nao tem nenhum learning cobrindo o padrao

---

## Estrutura do Projeto Spoke

Referencia rapida da estrutura padrao de um spoke FXL:

```
{slug}/                          ← monorepo root
├── CLAUDE.md                    ← regras do projeto para o Claude Code
├── package.json                 ← workspace root (bun workspaces)
├── fxl-doctor.sh                ← health check completo
├── .github/workflows/ci.yml     ← CI: type-check + lint + build + fxl-doctor
├── .env.example                 ← documenta todas as variaveis necessarias
│
├── frontend/                    ← React + Vite → deploy Vercel
│   ├── src/
│   │   ├── lib/api-client.ts    ← cliente HTTP tipado (nunca Supabase direto)
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   └── vercel.json              ← security headers + SPA rewrite
│
├── backend/                     ← Hono + Node.js → deploy Railway/Fly.io
│   └── src/
│       ├── index.ts             ← Hono app
│       ├── routes/fxl/          ← 6 endpoints do Contract API
│       ├── middleware/
│       │   ├── auth.ts          ← validacao Clerk JWT
│       │   └── fxl-api-key.ts   ← autenticacao do Hub
│       ├── services/            ← logica de negocio + queries Supabase
│       └── lib/supabase.ts      ← client com service role key
│
├── shared/
│   └── types/                   ← interfaces compartilhadas frontend ↔ backend
│
└── supabase/
    └── migrations/              ← SQL com RLS e org_id em todas as tabelas
```

---

## Variaveis de Ambiente

Cada package tem seu proprio `.env.local`:

### `backend/.env.local`

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLERK_SECRET_KEY=sk_live_...
FXL_API_KEY=<gere com: openssl rand -base64 32>
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### `frontend/.env.local`

```
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

{% callout type="warning" %}
`SUPABASE_SERVICE_ROLE_KEY` e `CLERK_SECRET_KEY` vivem **somente no backend**.
Nunca use prefixo `VITE_` nessas variaveis — isso as expoe ao browser.
{% /callout %}

---

## Quality Gates

Antes de considerar qualquer task concluida:

```bash
bunx tsc --noEmit          # zero erros TypeScript
bunx eslint .              # zero erros de lint
bunx prettier --check .    # zero problemas de formatacao
bash fxl-doctor.sh         # todos os checks passam
```

---

## Proximas Paginas

| Pagina | O que cobre |
|--------|-------------|
| [Visao Geral](/sdk/visao-geral) | Arquitetura Hub-Spoke e os 3 pilares do SDK |
| [Stack](/sdk/stack) | Stack completo aprovado e criterios de selecao |
| [Estrutura do Projeto](/sdk/estrutura-projeto) | Estrutura monorepo detalhada |
| [Nexo Skill](/sdk/nexo-skill) | Capacidades da skill e como invocar |
| [MCP Server](/sdk/mcp-server) | Setup, autenticacao e tools disponiveis |
| [Contract API](/sdk/contract) | Os 6 endpoints obrigatorios e formatos |
| [Seguranca](/sdk/security) | RLS, auth, secrets e headers |
| [CI/CD](/sdk/ci-cd) | GitHub Actions e fxl-doctor.sh |
