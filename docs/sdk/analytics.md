---
title: Analytics
badge: SDK
description: Metricas obrigatorias, extracao de dados e dashboards padrao
scope: product
sort_order: 110
---

# Analytics

Metricas obrigatorias, extracao de dados via Connector e padroes de dashboard para spokes BI.

## Metricas Obrigatorias por Tipo de Dashboard

Todo spoke BI deve expor ao menos as metricas obrigatorias do seu tipo principal:

| Tipo | Metricas Obrigatorias | Metricas Recomendadas |
|------|----------------------|----------------------|
| Financeiro | Receita total, Despesas, Lucro liquido, Margem | DRE mensal, Fluxo de caixa, Contas a pagar/receber |
| Vendas | Faturamento, Ticket medio, Taxa de conversao, Pipeline | Vendas por canal, Ranking de vendedores, Forecast |
| Operacional | SLA, Tempo medio de atendimento, Backlog, Throughput | Capacity utilization, Incidentes, Disponibilidade |

{% callout type="info" %}
Essas metricas sao o minimo esperado. O spoke pode expor metricas adicionais especificas do dominio do cliente.
{% /callout %}

## Extracao de Dados via Connector Module

O Hub consome dados dos spokes atraves do Connector module. O fluxo e:

1. **Spoke** expoe endpoints do FXL Contract API (`/api/fxl/manifest`, `/api/fxl/widgets/:id/data`)
2. **Hub** descobre os widgets disponveis via manifest
3. **Hub** faz fetch dos dados de cada widget e renderiza no dashboard

### Tipos de Dados do Contract

Os widgets retornam dados tipados conforme a interface correspondente:

```typescript
// Spoke expoe widgets via GET /api/fxl/widgets/:id/data
// Response segue o tipo declarado no manifest (kpi | chart | table | list)

interface FxlKpiData {
  value: number | string
  label: string
  trend?: number       // Variacao percentual (ex: 12.5 = +12.5%)
  prefix?: string      // Ex: "R$"
  suffix?: string      // Ex: "%"
}

interface FxlChartData {
  labels: string[]                              // Eixo X
  datasets: { label: string; data: number[] }[] // Series de dados
}

interface FxlTableData {
  columns: { key: string; label: string }[]
  rows: Record<string, unknown>[]
}

interface FxlListData {
  items: {
    id: string
    title: string
    subtitle?: string
    badge?: string
  }[]
}
```

{% callout type="info" %}
O Connector module do Hub faz fetch com timeout de 5s e retry automatico. O spoke so precisa expor os endpoints corretamente.
{% /callout %}

### Exemplo de Widget KPI

Um spoke financeiro expondo receita total:

```typescript
// GET /api/fxl/widgets/receita-total/data
{
  "value": 125430.50,
  "label": "Receita Total",
  "trend": 8.3,
  "prefix": "R$"
}
```

No manifest, o widget e declarado como:

```typescript
{
  id: 'receita-total',
  label: 'Receita Total',
  type: 'kpi',
  endpoint: '/api/fxl/widgets/receita-total/data'
}
```

## Dashboards Padrao para Spoke BI

Todo spoke BI deve ter um dashboard padrao com os seguintes elementos:

| Elemento | Quantidade | Posicao | Descricao |
|----------|-----------|---------|-----------|
| KPI cards | 4-6 | Topo | Metricas principais com trend |
| Trend chart | 1-2 | Centro | Evolucao temporal da metrica principal |
| Breakdown table | 1 | Centro-inferior | Detalhamento por dimensao (cliente, produto, regiao) |
| Distribution chart | 1 | Lateral | Composicao por categoria (pie ou bar chart) |

O layout segue o padrao de dashboard BI: metricas no topo para visao rapida, graficos no centro para analise temporal, tabela na parte inferior para drill-down.

{% callout type="info" %}
Ver secao Wireframe Builder para templates de dashboard BI.
{% /callout %}

## Widgets do Contract

Os 4 tipos de widget disponveis no FXL Contract:

| Tipo | Interface | Uso | Componente no Hub |
|------|-----------|-----|------------------|
| `kpi` | `FxlKpiData` | Metrica numerica com trend | `KpiWidget` |
| `chart` | `FxlChartData` | Grafico de barras/linhas (recharts) | `ChartWidget` |
| `table` | `FxlTableData` | Tabela com colunas dinamicas | `TableWidget` |
| `list` | `FxlListData` | Lista de itens com titulo/subtitulo | `ListWidget` |

Cada widget e declarado no manifest com `id`, `label`, `type` e `endpoint`. O Hub renderiza automaticamente o componente correto baseado no `type`.

## Event Tracking

### Vercel Analytics (Recomendado)

Para page views e metricas de performance, usar Vercel Analytics — ja integrado no deploy Vercel, sem configuracao adicional:

```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
    </>
  )
}
```

### Custom Events

Para eventos customizados (cliques, acoes do usuario), usar opcoes leves:

| Opcao | Quando usar | Exemplo |
|-------|------------|---------|
| Sentry breadcrumbs | Debug de fluxos com erro | `Sentry.addBreadcrumb({ message: 'user clicked export' })` |
| Supabase table | Metricas de negocio | INSERT em tabela `analytics_events` |
| Vercel Analytics | Eventos simples | `track('export_clicked', { format: 'csv' })` |

{% callout type="warning" %}
Nao instalar SDKs pesados de analytics (Amplitude, Mixpanel) sem aprovacao. Vercel Analytics + Sentry cobrem a maioria dos casos para spokes FXL.
{% /callout %}

## Leitura Complementar

- [Seguranca](/sdk/security) — Autenticacao Clerk, JWT bridge para Supabase e protecao de dados por tenant (RLS)
- [Infraestrutura](/sdk/infrastructure) — Ambientes, monitoring Sentry e deploy Vercel
