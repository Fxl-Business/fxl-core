---
title: Contract API
badge: SDK
description: API contract Hub-Spoke — endpoints, types e exemplos
scope: product
sort_order: 30
---

# Contract API

O FXL Contract define a interface de comunicacao entre o Hub (Nexo) e cada spoke (sistema de cliente). A versao atual e a **v1 (read-only)** — apenas endpoints GET.

## Visao Geral

O contract v1 estabelece 6 endpoints que todo spoke deve implementar. O Hub usa esses endpoints para:

- Descobrir quais entidades o spoke expoe (manifest)
- Listar e consultar dados de entidades
- Alimentar widgets no dashboard do Hub
- Buscar dados entre entidades
- Verificar saude da conexao

{% callout type="info" %}
O contract v1 e somente leitura (GET). Operacoes de escrita (POST, PUT, DELETE) estao planejadas para o contract v2.
{% /callout %}

## Autenticacao

Hub e spoke tem autenticacao **independente**. O Hub se autentica no spoke via API key no header `X-FXL-API-Key`.

| Aspecto | Detalhe |
|---------|---------|
| Header | `X-FXL-API-Key: <chave>` |
| Geracao da chave | `openssl rand -base64 32` |
| Armazenamento no spoke | Variavel `FXL_API_KEY` (server-side, SEM prefixo `VITE_`) |
| Armazenamento no Hub | Tabela `tenant_modules`, campo `config->api_key` |
| `org_id` | Enviado como query parameter pelo Hub, validado apenas apos checar a API key |

**Endpoints publicos (sem API key):** `/api/fxl/manifest` e `/api/fxl/health`

**Endpoints protegidos (com API key):** Todos os demais

## Endpoints

### GET /api/fxl/manifest

Retorna metadados do spoke — entidades, widgets e informacoes da aplicacao.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/manifest` |
| Autenticacao | Publica (sem API key) |
| Parametros | Nenhum |
| Response | `FxlAppManifest` |

**Exemplo de resposta:**

```json
{
  "appId": "beach-houses",
  "appName": "Gestao Casas de Praia",
  "version": "1.0.0",
  "entities": [
    {
      "type": "reservation",
      "label": "Reserva",
      "labelPlural": "Reservas",
      "icon": "calendar",
      "fields": [
        { "key": "id", "label": "ID", "type": "string", "required": true },
        { "key": "guestName", "label": "Hospede", "type": "string", "required": true },
        { "key": "checkIn", "label": "Check-in", "type": "date", "required": true },
        { "key": "checkOut", "label": "Check-out", "type": "date", "required": true },
        { "key": "totalAmount", "label": "Valor Total", "type": "number" }
      ],
      "defaultSort": { "field": "checkIn", "order": "desc" }
    }
  ],
  "dashboardWidgets": [
    {
      "id": "total-reservations",
      "label": "Total Reservas",
      "type": "kpi",
      "endpoint": "/api/fxl/widgets/total-reservations/data"
    }
  ]
}
```

### GET /api/fxl/entities/:type

Retorna lista paginada de entidades filtrada por `org_id`.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/entities/:type?org_id=xxx&page=1&pageSize=20` |
| Autenticacao | API key obrigatoria |
| Parametros | `type` (path), `org_id` (query), `page` (query, default 1), `pageSize` (query, default 20, max 100) |
| Response | `FxlPaginatedResponse<Record<string, unknown>>` |

**Exemplo de resposta:**

```json
{
  "data": [
    {
      "id": "res-001",
      "guestName": "Maria Silva",
      "checkIn": "2026-03-20",
      "checkOut": "2026-03-25",
      "totalAmount": 3500.00,
      "org_id": "org_abc"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

### GET /api/fxl/entities/:type/:id

Retorna uma entidade unica por ID, validada contra `org_id`.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/entities/:type/:id?org_id=xxx` |
| Autenticacao | API key obrigatoria |
| Parametros | `type` (path), `id` (path), `org_id` (query) |
| Response | `Record<string, unknown>` (entidade unica) |
| Erros | 404 se entidade nao existe ou pertence a outro org |

### GET /api/fxl/widgets/:id/data

Retorna dados de um widget para exibicao no dashboard do Hub.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/widgets/:id/data?org_id=xxx` |
| Autenticacao | API key obrigatoria |
| Parametros | `id` (path), `org_id` (query) |
| Response | `FxlKpiData`, `FxlChartData`, `FxlTableData` ou `FxlListData` (conforme `type` do widget no manifest) |
| Erros | 404 se widget nao existe |

**Exemplo KPI:**

```json
{
  "value": 42,
  "label": "Total Reservas",
  "trend": 12.5,
  "prefix": "",
  "suffix": ""
}
```

**Exemplo Chart:**

```json
{
  "labels": ["Jan", "Fev", "Mar", "Abr"],
  "datasets": [
    {
      "label": "Receita 2026",
      "data": [15000, 22000, 18000, 25000]
    }
  ]
}
```

**Exemplo Table:**

```json
{
  "columns": [
    { "key": "guestName", "label": "Hospede" },
    { "key": "checkIn", "label": "Check-in" },
    { "key": "totalAmount", "label": "Valor" }
  ],
  "rows": [
    { "guestName": "Maria Silva", "checkIn": "2026-03-20", "totalAmount": 3500 }
  ]
}
```

**Exemplo List:**

```json
{
  "items": [
    {
      "id": "res-001",
      "title": "Maria Silva",
      "subtitle": "20/03 - 25/03",
      "badge": "Confirmada"
    }
  ]
}
```

### GET /api/fxl/search?q=

Busca cross-entity — pesquisa em todos os tipos de entidade com campos string.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/search?q=termo&org_id=xxx` |
| Autenticacao | API key obrigatoria |
| Parametros | `q` (query, termo de busca), `org_id` (query) |
| Response | `FxlSearchResponse` |
| Limite | Maximo 20 resultados |

**Exemplo de resposta:**

```json
{
  "results": [
    {
      "entityType": "reservation",
      "entityId": "res-001",
      "title": "Maria Silva",
      "matchField": "guestName"
    }
  ]
}
```

### GET /api/fxl/health

Health check com versao do contract. Endpoint publico.

| Campo | Detalhe |
|-------|---------|
| URL | `/api/fxl/health` |
| Autenticacao | Publica (sem API key) |
| Parametros | Nenhum |
| Response | `FxlHealthResponse` |

**Exemplo de resposta:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "contractVersion": "1.0",
  "timestamp": "2026-03-17T14:30:00.000Z"
}
```

## Types Completos

O arquivo `contract/types.ts` deve ser copiado para `src/types/fxl-contract.ts` em cada spoke.

### App Manifest

```typescript
interface FxlAppManifest {
  appId: string          // Identificador unico do app (ex: "beach-houses")
  appName: string        // Nome legivel (ex: "Gestao Casas de Praia")
  version: string        // Versao semantica do spoke
  entities: FxlEntityDefinition[]
  dashboardWidgets: FxlWidgetDefinition[]
}
```

### Entity Definitions

```typescript
interface FxlEntityDefinition {
  type: string           // Identificador da entidade (ex: "reservation")
  label: string          // Label singular (ex: "Reserva")
  labelPlural: string    // Label plural (ex: "Reservas")
  icon: string           // Nome do icone lucide (ex: "calendar")
  fields: FxlFieldDefinition[]
  defaultSort: FxlSortConfig
}

interface FxlFieldDefinition {
  key: string            // Chave do campo (ex: "checkIn")
  label: string          // Label legivel (ex: "Check-in")
  type: 'string' | 'number' | 'date' | 'boolean'
  required?: boolean     // Default: false
}

interface FxlSortConfig {
  field: string          // Campo para ordenacao
  order: 'asc' | 'desc'
}
```

{% callout type="info" %}
Tipos `enum` e `relation` estao planejados para o contract v2. No v1, use `string` para campos enumerados.
{% /callout %}

### Widget Definitions

```typescript
interface FxlWidgetDefinition {
  id: string             // Identificador do widget (ex: "total-reservations")
  label: string          // Label legivel (ex: "Total Reservas")
  type: 'kpi' | 'chart' | 'table' | 'list'
  endpoint: string       // Path do endpoint de dados
}
```

### Widget Data Formats

```typescript
// KPI — metrica unica
interface FxlKpiData {
  value: number | string
  label: string
  trend?: number         // Percentual vs periodo anterior (ex: 12.5 = +12.5%)
  prefix?: string        // Ex: "R$"
  suffix?: string        // Ex: "%"
}

// Chart — labels + datasets
interface FxlChartData {
  labels: string[]       // Eixo X (ex: ["Jan", "Fev", "Mar"])
  datasets: FxlChartDataset[]
}

interface FxlChartDataset {
  label: string          // Nome da serie (ex: "Receita 2026")
  data: number[]         // Valores correspondentes aos labels
}

// Table — colunas + linhas
interface FxlTableData {
  columns: FxlTableColumn[]
  rows: Record<string, unknown>[]
}

interface FxlTableColumn {
  key: string            // Chave correspondente aos dados da linha
  label: string          // Header da coluna
}

// List — itens simples
interface FxlListData {
  items: FxlListItem[]
}

interface FxlListItem {
  id: string
  title: string
  subtitle?: string
  badge?: string
}
```

### Response Types

```typescript
// Resposta paginada para listas de entidades
interface FxlPaginatedResponse<T> {
  data: T[]
  total: number          // Total de registros (para paginacao)
  page: number           // Pagina atual (1-based)
  pageSize: number       // Itens por pagina
}

// Resultado de busca
interface FxlSearchResult {
  entityType: string     // Tipo da entidade (ex: "reservation")
  entityId: string
  title: string          // Valor do campo que deu match
  matchField: string     // Nome do campo que deu match
}

interface FxlSearchResponse {
  results: FxlSearchResult[]
}

// Health check
interface FxlHealthResponse {
  status: 'ok'
  version: string
  contractVersion: string
  timestamp: string      // ISO 8601
}

// Erro padrao
interface FxlErrorResponse {
  error: string
  statusCode: number
  details?: string       // Apenas em dev, nunca em producao
}
```

## Constantes

```typescript
const FXL_CONTRACT_VERSION = '1.0'
const FXL_MAX_PAGE_SIZE = 100
const FXL_DEFAULT_PAGE_SIZE = 20
const FXL_MAX_SEARCH_RESULTS = 20
```

## Endpoints Obrigatorios

Todo spoke deve implementar todos os 6 endpoints:

```typescript
const FXL_REQUIRED_ENDPOINTS = [
  'GET /api/fxl/manifest',
  'GET /api/fxl/entities/:type',
  'GET /api/fxl/entities/:type/:id',
  'GET /api/fxl/widgets/:id/data',
  'GET /api/fxl/search',
  'GET /api/fxl/health',
]
```

## Tratamento de Erros

Todos os erros devem seguir o formato `FxlErrorResponse`:

| Codigo | Quando |
|--------|--------|
| 400 | Parametros invalidos (page negativo, pageSize > 100) |
| 401 | API key invalida ou ausente |
| 403 | `org_id` ausente no request |
| 404 | Entidade, widget ou tipo desconhecido |
| 500 | Erro interno (sem expor stack trace em producao) |

## Testando Localmente

```bash
# Iniciar o spoke
npm run dev

# Testar endpoints publicos
curl http://localhost:5173/api/fxl/health
curl http://localhost:5173/api/fxl/manifest

# Testar endpoints protegidos
curl -H "X-FXL-API-Key: $FXL_API_KEY" \
  "http://localhost:5173/api/fxl/entities/reservation?org_id=test-org"
```
