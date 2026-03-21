---
title: Nexo SDK
badge: SDK
description: Playbook de engenharia da FXL — stack, padroes, contract e ferramentas para projetos spoke
scope: product
sort_order: 0
---

# Nexo SDK

O Nexo SDK e o playbook de engenharia que todo sistema construido pela FXL deve seguir.
Ele define stack, padroes de codigo, seguranca, infraestrutura e integracao com o Nexo Hub.

{% callout type="info" %}
O SDK nao e um pacote npm. E um conjunto de regras, templates e checklists
aplicados via Claude Code skill ao criar ou auditar projetos.
{% /callout %}

## Arquitetura Hub ↔ Spoke

O Nexo (Hub) e a plataforma central da FXL. Cada sistema de cliente e um **Spoke** — uma
aplicacao independente que segue os padroes do SDK e se conecta ao Hub via API contract.

```
┌─────────────────────────────────────────────┐
│                 Nexo (Hub)                  │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │  Docs   │  │  Clients │  │  Platform  │  │
│  │  SDK    │  │  Mgmt    │  │  Admin     │  │
│  └─────────┘  └──────────┘  └───────────┘  │
│                                             │
│          Contract API (v1, GET)              │
└──────┬──────────┬──────────┬────────────────┘
       │          │          │
  ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
  │ Spoke  │ │ Spoke  │ │ Spoke  │
  │ App A  │ │ App B  │ │ App C  │
  └────────┘ └────────┘ └────────┘
```

Cada spoke:
- Usa a stack aprovada (React 18 + TypeScript 5 + Supabase)
- Implementa os 6 endpoints do contract v1
- Roda CI com `fxl-doctor.sh` e deploy via Vercel
- Tem seu proprio banco, auth e dominio

## Secoes

### Fundamentais

| Secao | Descricao | Status |
|-------|-----------|--------|
| [Visao Geral](/sdk/visao-geral) | O que e o SDK, pilares, arquitetura | Completo |
| [Stack](/sdk/stack) | Stack aprovada, versoes, decisoes tecnicas | Completo |
| [Contract API](/sdk/contract) | Endpoints, types, exemplos | Completo |
| [Estrutura de Projeto](/sdk/estrutura-projeto) | Diretorios e organizacao padrao | Completo |
| [Templates](/sdk/templates) | Configs geradas (tsconfig, eslint, etc.) | Completo |
| [Checklists](/sdk/checklists) | 5 checklists de qualidade | Completo |
| [CI/CD e Deploy](/sdk/ci-cd) | GitHub Actions, Vercel, fxl-doctor | Completo |

### Padroes e Seguranca

| Secao | Descricao | Status |
|-------|-----------|--------|
| [Padroes de Codigo](/sdk/code-standards) | Convencoes, naming, lint, TypeScript strict | Completo |
| [Banco de Dados](/sdk/database) | Migrations, RLS, modelagem Supabase | Completo |
| [Seguranca](/sdk/security) | Auth Clerk, JWT bridge, RLS, env vars | Completo |
| [Documentacao](/sdk/documentation) | README obrigatorio, CLAUDE.md, changelog | Completo |

### Operacional

| Secao | Descricao | Status |
|-------|-----------|--------|
| [Analytics](/sdk/analytics) | Metricas, extracao de dados, dashboards | Completo |
| [Infraestrutura](/sdk/infrastructure) | Ambientes, Sentry, Vercel deploy | Completo |
| [Mobile](/sdk/mobile) | React Native/Expo, push notifications | Completo |

### Ferramentas

| Secao | Descricao | Status |
|-------|-----------|--------|
| [MCP Server](/sdk/mcp-server) | Cerebro central de conhecimento | Completo |
| [Nexo Skill](/sdk/nexo-skill) | Skill unificada do Claude Code | Completo |

### Resiliencia (v9.0)

| Secao | Descricao | Status |
|-------|-----------|--------|
| [Error Boundaries](/sdk/error-boundaries) | Isolamento de erros por modulo com fallback UI | Completo |
| [Observabilidade](/sdk/observabilidade) | Setup Sentry para frontend com contexto de modulo e org | Completo |
| [Retry com Backoff](/sdk/retry-backoff) | Utility withRetry para retry com backoff exponencial | Completo |
