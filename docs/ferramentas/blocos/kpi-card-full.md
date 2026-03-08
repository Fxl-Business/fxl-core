---
title: KpiCardFull
badge: Ferramentas
description: Card de KPI expandido com sparkline, semaforo e modo comparacao
---

# KpiCardFull

Card de indicador financeiro completo com valor principal, subtitulo, sparkline SVG embutido e semaforo opcional (verde/amarelo/vermelho). Suporta modo comparacao que revela variacao temporal e semaforo simultaneamente. Versao expandida do KpiCard, usada quando o KPI precisa de tendencia visual (sparkline) ou avaliacao de meta (semaforo).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | string | Yes | - | Titulo do KPI em uppercase 10px tracking-wider cinza-400 |
| value | string | Yes | - | Valor principal formatado (ex: "R$ 125.000") |
| sub | string | No | - | Subtitulo abaixo do valor (ex: "% s/ faturamento") |
| variation | string | No | - | Texto de variacao (ex: "+12,3% vs Mar/26") |
| variationPositive | boolean | No | true | Cor da variacao: verde se true, vermelho se false |
| semaforo | 'verde' \| 'amarelo' \| 'vermelho' | No | - | Status visual com dot colorido indicando atingimento de meta |
| semaforoLabel | string | No | Nome da cor | Label ao lado do dot (ex: "Acima da meta"). Se nao fornecido, exibe o nome da cor capitalizado |
| sparkline | number[] | No | - | Array de valores numericos para mini grafico SVG de tendencia |
| wide | boolean | No | false | Se true, ocupa 2 colunas no grid (col-span-2) |
| compareMode | boolean | No | false | Ativa exibicao simultanea de variacao e semaforo |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px. Layout vertical com os seguintes elementos empilhados:

1. **Label** -- texto uppercase em 10px font-medium tracking-wider cor cinza-400
2. **Valor** -- texto em 24px (2xl) font-bold cor cinza-800, margin-top 4px
3. **Sub** (quando presente) -- texto em 12px (xs) cor cinza-400, margin-top 2px
4. **Semaforo** (quando compareMode=true E semaforo presente) -- flex horizontal com gap 6px: dot circular 8x8 colorido (verde=green-500, amarelo=yellow-400, vermelho=red-500) + label em 12px (xs) font-medium na cor correspondente (verde=green-700, amarelo=yellow-700, vermelho=red-700). Margin-top 6px
5. **Variacao** (quando compareMode=true E variation presente) -- badge inline com rounded, padding horizontal 6px e vertical 2px, texto em 11px font-medium. Fundo verde-50/texto verde-700 quando variationPositive=true. Fundo vermelho-50/texto vermelho-700 quando variationPositive=false. Margin-top 6px
6. **Sparkline** (quando sparkline presente) -- SVG com viewBox 200x40, polyline de pontos normalizados (min/max) sem preenchimento, stroke cinza-400 (gray-400) com strokeWidth 1.5. Altura visual de 32px (h-8), largura 100% do card. Margin-top 8px. Sempre visivel independente do compareMode

## Conditional States

### compareMode

Quando `compareMode=true`:
- Semaforo aparece (dot colorido + label de status)
- Variacao aparece (badge com cor positiva/negativa)

Quando `compareMode=false`:
- Semaforo oculto mesmo que a prop `semaforo` esteja definida
- Variacao oculta mesmo que a prop `variation` esteja definida

A sparkline e sempre visivel independente do compareMode.

### wide

Quando `wide=true`: card recebe `col-span-2` e ocupa largura dobrada no grid pai.
Quando `wide=false`: card ocupa 1 coluna no grid.

## Sizing Rules

- Largura: controlada pelo grid pai (tipicamente `grid-cols-4`)
- Altura: auto, determinada pelo conteudo
- Sparkline: h-8 (32px), largura 100% do card
- wide=true: col-span-2 (ocupa 2 colunas)
- Dot do semaforo: 8x8 pixels (h-2 w-2)

## Blueprint Section Type

Usado dentro de `kpi-grid` section. Diferente do KpiCard, o KpiCardFull utiliza props adicionais como `sparkline`, `semaforo`, `semaforoLabel`, `wide` e `sub`. O Blueprint nao distingue entre KpiCard e KpiCardFull explicitamente -- o renderer escolhe baseado nas props presentes.

```ts
{ type: 'kpi-grid', columns: 4, items: [{ label, value, sub?, sparkline?, semaforo?, wide? }] }
```

## Usage Example

```ts
{
  type: 'kpi-grid',
  columns: 4,
  items: [
    {
      label: 'Faturamento',
      value: 'R$ 125.000',
      sub: '100% s/ faturamento',
      sparkline: [42, 55, 61, 48, 70, 65, 74, 80],
      semaforo: 'verde',
      semaforoLabel: 'Acima da meta',
      variation: '+12,3% vs Fev/26',
      variationPositive: true,
    },
    {
      label: 'Margem EBITDA',
      value: '32,4%',
      sub: 'Meta: 30%',
      sparkline: [28, 30, 31, 29, 32, 33, 31, 32],
      semaforo: 'verde',
      wide: true,
    },
  ],
}
```
