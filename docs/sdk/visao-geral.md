---
title: Visao Geral
badge: SDK
description: O que e o Nexo SDK, seus pilares e a arquitetura Hub-Spoke
scope: product
sort_order: 10
---

# Visao Geral do Nexo SDK

O Nexo SDK e o playbook de engenharia da FXL. Ele define como todo sistema
construido pela empresa deve ser estruturado, codificado, testado e deployado.

{% callout type="warning" %}
O SDK **nao e um pacote npm**. Configs sao geradas como arquivos no projeto.
Types sao copiados, nao importados. CI roda um script bash gerado (`fxl-doctor.sh`).
{% /callout %}

## Os 3 Pilares

O SDK e distribuido atraves de 3 canais complementares:

```
┌───────────────────────────────────────────────┐
│               Nexo SDK Ecosystem               │
│                                               │
│  ┌───────────┐ ┌────────────┐ ┌────────────┐  │
│  │   Docs    │ │ MCP Server │ │ Nexo Skill │  │
│  │           │ │            │ │            │  │
│  │ Leitura   │ │ Read/Write │ │  Execucao  │  │
│  │ humana    │ │ por agents │ │  assistida │  │
│  └───────────┘ └────────────┘ └────────────┘  │
└───────────────────────────────────────────────┘
```

| Pilar | O que e | Quem consome |
|-------|---------|-------------|
| **Docs** | Paginas de documentacao no Nexo (esta secao) | Humanos + Claude |
| **MCP Server** | Servidor MCP que expoe conhecimento do SDK como tools | Claude Code em projetos spoke |
| **Nexo Skill** | Skill do Claude Code com regras, templates e checklists | Claude Code no Nexo Hub |

### Docs (este canal)

As paginas de documentacao em `/sdk/` sao a referencia canonica do SDK.
Toda regra, padrao e decisao tecnica esta documentada aqui para consulta
humana e para o Claude usar como contexto.

### MCP Server

O MCP Server e um servidor que expoe o conhecimento do SDK como tools
acessiveis pelo Claude Code em qualquer projeto spoke. Isso permite que
o Claude consulte padroes FXL sem precisar ter a skill instalada localmente.
Veja detalhes completos na pagina [MCP Server](/sdk/mcp-server).

### Nexo Skill

A Nexo Skill e a unificacao de todas as skills do Claude Code em uma unica
skill contextual. Ela orquestra scaffold, audit, connect e deploy usando
os padroes definidos no SDK. Veja detalhes completos na pagina [Nexo Skill](/sdk/nexo-skill).

## Arquitetura Hub ↔ Spoke

### O Hub (Nexo)

O Nexo e a plataforma central da FXL. Ele contem:

- Documentacao do processo e do SDK
- Gerenciamento de clientes e tenants
- Wireframe Builder para prototipacao
- Admin panel para operacoes internas

### Os Spokes

Cada sistema de cliente e um Spoke — uma aplicacao independente que:

- Usa a stack aprovada (React 18, TypeScript 5, Tailwind, Supabase, Clerk, Vite)
- Segue a estrutura de projeto padrao definida pelo SDK
- Implementa os 6 endpoints do Contract API v1
- Roda CI com GitHub Actions e `fxl-doctor.sh`
- Faz deploy via Vercel com headers de seguranca

Os spokes sao independentes entre si e do Hub. A unica conexao e via
Contract API — o Hub consome dados do spoke atraves de endpoints padronizados.

## Como o SDK e Usado

O SDK e aplicado via Claude Code skill. O fluxo tipico:

1. **Scaffold** — Criar projeto spoke do zero com `rules/new-project.md`
2. **Audit** — Verificar conformidade de projeto existente com `rules/audit.md`
3. **Connect** — Adicionar os endpoints do contract ao spoke com `rules/connect.md`
4. **Refactor** — Migrar projeto existente para padroes FXL com `rules/refactor.md`
5. **CI/CD** — Configurar GitHub Actions e fxl-doctor com `rules/ci-cd.md`
6. **Deploy** — Configurar Vercel com security headers com `rules/deploy.md`

Cada capacidade tem sua regra dedicada com instrucoes passo a passo
que o Claude Code segue ao executar a tarefa.

## Capacidades

### scaffold

Cria um projeto spoke completo do zero:
- Estrutura de diretorios padrao
- Configs geradas (tsconfig, eslint, prettier, tailwind, vercel)
- CLAUDE.md do projeto com regras especificas
- Endpoints do contract implementados
- CI/CD configurado

### audit

Gera um relatorio `FXL-AUDIT.md` com:
- Score de conformidade por categoria
- Itens criticos, importantes e normais
- Plano de refactoring sugerido

### connect

Adiciona a API contract a um projeto existente:
- Copia os types do contract (`types.ts`)
- Implementa os 6 endpoints GET
- Configura middleware de validacao de API key

### refactor

Migra projetos existentes (ex: gerados pelo Lovable) para padroes FXL:
- Abordagem incremental (sem rewrite total)
- Ajuste de estrutura, types, seguranca e RLS

### ci-cd

Configura integracao continua:
- GitHub Actions workflow
- Script `fxl-doctor.sh` para health check
- Branch protection rules

### deploy

Configura deploy em producao:
- `vercel.json` com security headers
- Environment variables obrigatorias
- Preview deploys para PRs

## Contract v1

O Contract API v1 e read-only (apenas GET) e define 6 endpoints obrigatorios
que todo spoke deve implementar:

| Endpoint | Descricao |
|----------|-----------|
| `GET /api/fxl/manifest` | Metadata da aplicacao e definicoes de entidades |
| `GET /api/fxl/entities/:type` | Lista paginada de entidades |
| `GET /api/fxl/entities/:type/:id` | Entidade individual |
| `GET /api/fxl/widgets/:id/data` | Dados de widget (KPI, chart, table, list) |
| `GET /api/fxl/search?q=` | Busca cross-entity |
| `GET /api/fxl/health` | Health check com versao do contract |

A autenticacao e feita via header `X-FXL-API-Key`. Cada spoke tem
sua propria API key configurada como environment variable.

{% callout type="info" %}
Para detalhes completos dos endpoints, types e exemplos de response,
veja a pagina [Contract API](/sdk/contract).
{% /callout %}
