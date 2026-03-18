---
title: Spoke Onboarding
badge: Processo
description: Como conectar um projeto externo ao Nexo como spoke
---

# Spoke Onboarding

Este documento descreve o processo de conectar qualquer projeto externo ao Nexo (hub) como spoke, usando o contrato padronizado FXL.

## Pre-requisitos

- Nexo Skill instalada no Claude Code (`.agents/skills/nexo/`)
- Projeto spoke com stack compativel (React 18, TypeScript, Supabase, Vite)
- Acesso ao Nexo como operador (para cadastrar o connector)

## Visao Geral

```
Spoke (projeto externo)          Hub (Nexo)
┌─────────────────────┐         ┌─────────────────────┐
│ App propria          │         │ Connector Module    │
│ Auth propria         │ ◄──── │ (UI generica)       │
│ Supabase proprio     │  API   │                     │
│                      │  key   │ Admin UI            │
│ Endpoints /api/fxl/* │ ────► │ (cadastro connectors)│
└─────────────────────┘         └─────────────────────┘
```

A spoke e um produto independente. Ela mantem sua propria auth, banco de dados e deploy.
A unica conexao com o hub e via API (6 endpoints padronizados) autenticada por API key.

## Passo a Passo

### 1. Auditar o projeto com Nexo SDK

Abrir o Claude Code no repo da spoke e pedir:

{% prompt label="Auditar projeto" %}
Audita esse projeto contra os padroes FXL usando a Nexo Skill
{% endprompt %}

O SDK gera um `FXL-AUDIT.md` com score de conformidade e plano de refatoracao.

### 2. Implementar o contrato FXL

Pedir ao Claude Code:

{% prompt label="Adicionar contrato" %}
Adiciona o contrato FXL a esse projeto usando a Nexo Skill (sdk/connect.md)
{% endprompt %}

Isso cria:
- Tipos do contrato (`FxlAppManifest`, `EntityDefinition`, etc.)
- 6 endpoints em `/api/fxl/*` (Supabase Edge Functions ou API routes)
- Middleware de validacao de API key (`X-FXL-API-Key`)
- `fxlContractVersion: "1.0"` no `package.json`
- Health check endpoint

### 3. Mapear entidades e widgets

O operador define quais dados da spoke serao expostos ao hub:

| Conceito | Exemplo (Sitio Santa Cruz) |
|----------|---------------------------|
| Entidade | `reserva` (reservas de imoveis) |
| Entidade | `imovel` (propriedades cadastradas) |
| Entidade | `contato` (clientes/hospedes) |
| Widget KPI | Total de reservas no periodo |
| Widget Chart | Ocupacao mensal |
| Widget Table | Proximas reservas |

Estas definicoes vao no manifest da spoke (`GET /api/fxl/manifest`).

### 4. Gerar API key

No repo da spoke, gerar uma API key para o hub:

{% prompt label="Gerar API key" %}
openssl rand -base64 32
{% endprompt %}

Configurar a key como env var na spoke (`FXL_API_KEY`) e guardar para cadastrar no hub.

### 5. Deploy da spoke

Fazer deploy da spoke (Vercel, etc.) com os endpoints FXL ativos.
Verificar que `GET <baseUrl>/api/fxl/health` retorna:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "contractVersion": "1.0",
  "timestamp": "2026-03-17T..."
}
```

### 6. Cadastrar connector no hub

No Nexo, acessar `/admin/connectors` e cadastrar:

| Campo | Valor |
|-------|-------|
| App ID | `sitio-santa-cruz` |
| Nome | `Sitio Santa Cruz` |
| Base URL | `https://sitio-santa-cruz.vercel.app` |
| API Key | (key gerada no passo 4) |

O hub faz GET `/api/fxl/manifest` para descobrir entidades e widgets automaticamente.

### 7. Verificar integracao

- Acessar `/apps/sitio-santa-cruz` no hub
- Verificar que entidades aparecem nas tabelas
- Verificar widgets no dashboard do connector
- Verificar ConnectorCard no Home

## Modelo de Autenticacao

```
Hub ──[X-FXL-API-Key: abc123]──► Spoke
                                    │
                                    ▼
                              Middleware valida key
                              Retorna dados sem saber
                              nada sobre Clerk/hub auth
```

- Cada spoke tem sua propria API key
- A key autentica a CONEXAO, nao o usuario
- Spokes podem usar qualquer auth provider (Supabase Auth, Clerk, Firebase)
- O hub armazena a key no Supabase, protegida por RLS

{% operational %}

## Para o Claude Code

Ao trabalhar em um projeto spoke:
1. Sempre usar a Nexo Skill (`.agents/skills/nexo/`) como referencia
2. Os endpoints `/api/fxl/*` sao Supabase Edge Functions
3. O middleware de API key valida o header `X-FXL-API-Key`
4. Tipos do contrato sao COPIADOS para o projeto (nao importados)
5. `fxl-doctor.sh` roda no CI para validar conformidade

Ao conectar uma spoke ao hub:
1. Admin UI em `/admin/connectors` no Nexo
2. Config salva em `tenant_modules` com `module_id = 'connector:<appId>'`
3. `useConnectorList` le configs do Supabase
4. `connector-service` envia header `X-FXL-API-Key` em cada request

{% endoperational %}
