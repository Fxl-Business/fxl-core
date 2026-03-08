---
title: KpiCard
badge: Ferramentas
description: Card de indicador simples com valor principal, label e variacao opcional
---

# KpiCard

Card de indicador financeiro compacto que exibe um valor principal com label, variacao opcional (positiva/negativa) e descricao auxiliar. Usado para metricas simples que nao precisam de sparkline, semaforo ou modo comparacao.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | string | Yes | - | Titulo do KPI em uppercase tracking-wide |
| value | string | Yes | - | Valor principal formatado (ex: "R$ 125.000") |
| variation | string | No | - | Texto de variacao (ex: "+12,3% vs Mar/26") |
| description | string | No | - | Texto descritivo abaixo do valor |
| variationPositive | boolean | No | true | Cor da variacao: verde se true, vermelho se false |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px. Layout vertical com os seguintes elementos empilhados:

1. **Label** -- texto uppercase em 12px (xs) font-medium tracking-wide cor cinza-400
2. **Valor** -- texto em 24px (2xl) font-bold cor cinza-800, com margin-top de 4px
3. **Variacao** (quando presente) -- badge inline com rounded, padding horizontal 6px e vertical 2px, texto em 12px (xs) font-medium. Fundo verde-50 com texto verde-700 quando `variationPositive=true`. Fundo vermelho-50 com texto vermelho-700 quando `variationPositive=false`. Margin-top de 6px
4. **Descricao** (quando presente) -- texto em 12px (xs) cor cinza-400, margin-top de 6px

## Conditional States

Este componente nao possui estados condicionais complexos. A variacao aparece somente quando a prop `variation` e fornecida. A descricao aparece somente quando a prop `description` e fornecida.

## Sizing Rules

- Largura: controlada pelo grid pai (tipicamente `grid-cols-4`)
- Altura: auto, determinada pelo conteudo
- Sem suporte a `wide` (col-span-2) -- para isso usar KpiCardFull
- Sem suporte a sparkline ou semaforo -- para isso usar KpiCardFull

## Blueprint Section Type

Usado dentro de `kpi-grid` section. KpiCard e KpiCardFull compartilham o mesmo tipo `kpi-grid` -- a diferenca e no nivel de detalhe das props configuradas. Quando o item no kpi-grid tem apenas `label`, `value`, `variation` e `description`, o renderer usa KpiCard.

```ts
{ type: 'kpi-grid', columns: 4, items: [{ label, value, variation?, description? }] }
```

## Usage Example

```ts
{
  type: 'kpi-grid',
  columns: 4,
  items: [
    {
      label: 'Receita Bruta',
      value: 'R$ 245.000',
      variation: '+8,5%',
      variationPositive: true,
      description: 'Acumulado do mes',
    },
    {
      label: 'Custos',
      value: 'R$ 98.000',
      variation: '+3,2%',
      variationPositive: false,
    },
  ],
}
```
