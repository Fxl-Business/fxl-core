---
title: BarLineChart
badge: Ferramentas
description: Grafico de barras, linha ou barras+linha via recharts
---

# BarLineChart

Grafico flexivel que renderiza barras, linha ou ambos simultaneamente usando recharts. Suporta tres variantes de visualizacao controladas pela prop `type`. Usado para evolucao temporal de metricas financeiras (faturamento mensal, despesas, etc).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido acima do grafico em 14px (sm) font-semibold cinza-700 |
| type | 'bar' \| 'line' \| 'bar-line' | Yes | - | Tipo de visualizacao: barras, linha ou ambos |
| height | number | No | 250 | Altura do grafico em pixels |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px.

**Titulo**: texto em 14px (sm) font-semibold cinza-700, margin-bottom 12px.

**Area do grafico**: ResponsiveContainer com largura 100% e altura configuravel (default 250px). Grid cartesiano com linhas tracejadas (strokeDasharray 3 3) em cinza claro (#f0f0f0). Eixo X sem linha de eixo e sem ticks, labels em 11px. Eixo Y sem linha de eixo e sem ticks, labels em 11px. Tooltip integrado.

### Variante `bar`

Barras verticais com preenchimento cinza (#d1d5db) e bordas superiores arredondadas (radius [3,3,0,0]). Cada barra representa um ponto de dados no eixo X (tipicamente meses).

### Variante `line`

Linha suave (monotone) sem pontos visveis (dot=false), cor cinza (#9ca3af), strokeWidth 2. Renderiza a evolucao dos dados como curva continua.

### Variante `bar-line`

Combinacao de barras e linha no mesmo grafico usando ComposedChart. Dois eixos Y: esquerdo para barras, direito para linha. Barras em cinza (#d1d5db) com radius arredondado. Linha em cinza escuro (#6b7280) com strokeWidth 2 sem pontos.

## Conditional States

### type='bar'

Renderiza BarChart com uma unica serie de barras. Um eixo Y. Barras preenchidas em cinza claro.

### type='line'

Renderiza LineChart com uma unica linha monotone. Um eixo Y. Sem pontos nos vertices.

### type='bar-line'

Renderiza ComposedChart com barras no eixo Y esquerdo e linha no eixo Y direito. Dois eixos Y independentes permitem escalas diferentes para cada serie.

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 50% em grid 2 col ou 100% full width)
- Altura: configuravel via prop `height`, default 250px
- ResponsiveContainer garante adaptacao a largura do container
- Margens internas do grafico: default do recharts

## Blueprint Section Type

Tipo de secao: `bar-line-chart`

```ts
{
  type: 'bar-line-chart',
  title: 'Evolucao Mensal',
  chartType: 'bar' | 'line' | 'bar-line',
  height?: number,
  compareOnly?: boolean,
}
```

Nota: no Blueprint, a prop se chama `chartType` (nao `type`) para evitar conflito com o discriminador `type` da union.

## Usage Example

```ts
{
  type: 'bar-line-chart',
  title: 'Faturamento Mensal',
  chartType: 'bar',
  height: 300,
}
```

```ts
{
  type: 'bar-line-chart',
  title: 'Receita vs Meta',
  chartType: 'bar-line',
}
```
