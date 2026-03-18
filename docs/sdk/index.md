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

### Em Construcao

| Secao | Descricao | Previsao |
|-------|-----------|----------|
| [Padroes de Codigo](/sdk/code-standards) | Convencoes, naming, lint | v5.1+ |
| [Banco de Dados](/sdk/database) | Migrations, RLS, modelagem | v5.1+ |
| [Seguranca](/sdk/security) | Auth, headers, env vars, API keys | v5.1+ |
| [Analytics](/sdk/analytics) | Metricas, extracao, dashboards | v5.1+ |
| [Infraestrutura](/sdk/infrastructure) | Docker, K8s, ambientes | v5.1+ |
| [Mobile](/sdk/mobile) | React Native, padroes mobile | v5.2+ |
| [Documentacao](/sdk/documentation) | Processos obrigatorios | v5.1+ |
| [MCP Server](/sdk/mcp-server) | Cerebro central de conhecimento | v5.1 |
| [Nexo Skill](/sdk/nexo-skill) | Skill unificada do Claude Code | v5.2 |
