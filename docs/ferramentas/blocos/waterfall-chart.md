---
title: WaterfallChart
badge: Ferramentas
description: Grafico waterfall/cascata com barras flutuantes coloridas e modo comparacao
---

# WaterfallChart

Grafico waterfall (cascata) que visualiza a progressao de valores financeiros com barras flutuantes. Cada barra comeca onde a anterior terminou, mostrando contribuicoes positivas, negativas e subtotais. Suporta modo comparacao que exibe barras agrupadas lado a lado para dois periodos. Usado em DRE e analises de composicao de resultado.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido acima do grafico em 14px (sm) font-semibold cinza-700 |
| bars | WaterfallBar[] | Yes | - | Array de barras do periodo atual |
| height | number | No | 260 | Altura do grafico em pixels |
| compareMode | boolean | No | false | Ativa exibicao de barras agrupadas com periodo anterior |
| compareBars | WaterfallBar[] | No | - | Array de barras do periodo anterior (usado quando compareMode=true) |
| comparePeriodLabel | string | No | "Periodo Anterior" | Label para a legenda e tooltip do periodo anterior |

### Tipo WaterfallBar

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Label exibida no eixo X abaixo da barra |
| value | number | Yes | Valor numerico (positivo ou negativo) |
| type | 'positive' \| 'negative' \| 'subtotal' | Yes | Determina a cor da barra e o comportamento de empilhamento |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px.

### Modo Normal (compareMode=false)

**Titulo**: texto em 14px (sm) font-semibold cinza-700, margin-bottom 12px.

**Area do grafico**: ResponsiveContainer com largura 100% e altura configuravel (default 260px). Grid cartesiano com linhas tracejadas horizontais em cinza claro (#f0f0f0), sem linhas verticais. Eixo X com labels em 10px. Eixo Y com labels em 10px, valores formatados como "Xk" (milhares).

**Barras flutuantes**: cada barra e renderizada como um empilhamento de duas barras -- uma transparente (spacer) que posiciona a barra na altura correta, e a barra visivel com a cor apropriada:
- **positive** (verde #22c55e): barra comeca no valor acumulado anterior e sobe
- **negative** (vermelho #ef4444): barra comeca no novo valor acumulado e sobe ate o anterior
- **subtotal** (azul #3b82f6): barra comeca de zero e vai ate o valor total

Todas as barras tem bordas superiores arredondadas (radius [3,3,0,0]). Labels de valor em BRL formatado acima de cada barra (fontSize 9, cinza-700).

**Tooltip**: card branco com borda cinza-200 e sombra. Mostra label em font-semibold e valor formatado em BRL.

### Modo Comparacao (compareMode=true com compareBars)

**Header**: flex horizontal com titulo a esquerda e legenda a direita. Legenda com dois dots coloridos: "Mes Atual" (azul-500) e periodo anterior label (azul-200).

**Barras agrupadas**: cada posicao no eixo X tem duas barras lado a lado (barCategoryGap 20%, barGap 2):
- Barra "current" com cores cheias: positive=#22c55e, negative=#ef4444, subtotal=#3b82f6
- Barra "compare" com cores suaves: positive=#a8d5b5, negative=#f5a9a9, subtotal=#a9c4f5

Labels de valor em BRL formatado acima das barras do periodo atual.

**Tooltip comparativo**: mostra label, "Mes Atual" com valor BRL, e periodo anterior label com valor BRL.

## Conditional States

### compareMode

Quando `compareMode=true` E `compareBars` fornecido com dados:
- Layout muda para barras agrupadas lado a lado (sem waterfall flutuante)
- Header ganha legenda com dots coloridos
- Tooltip mostra valores dos dois periodos
- Cores do periodo anterior sao versoes suaves das cores do periodo atual

Quando `compareMode=false`:
- Layout waterfall classico com barras flutuantes empilhadas
- Cada barra comeca onde a anterior terminou
- Apenas valores do periodo atual

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 50% em grid 2 col)
- Altura: configuravel via prop `height`, default 260px
- Margens: top 24px, right/left 8px, bottom 4px
- Labels de valor posicionados 4px acima de cada barra

## Blueprint Section Type

Tipo de secao: `waterfall-chart`

```ts
{
  type: 'waterfall-chart',
  title: 'Composicao do Resultado',
  bars: WaterfallBar[],
  compareBars?: WaterfallBar[],
  height?: number,
}
```

Nota: no Blueprint, `compareMode` e `comparePeriodLabel` sao controlados pelo BlueprintRenderer baseado no estado global de comparacao da tela.

## Usage Example

```ts
{
  type: 'waterfall-chart',
  title: 'Composicao do Resultado',
  bars: [
    { label: 'Receita', value: 245000, type: 'positive' },
    { label: 'Deducoes', value: -12000, type: 'negative' },
    { label: 'Rec. Liquida', value: 233000, type: 'subtotal' },
    { label: 'CMV', value: -98000, type: 'negative' },
    { label: 'Lucro Bruto', value: 135000, type: 'subtotal' },
  ],
  compareBars: [
    { label: 'Receita', value: 220000, type: 'positive' },
    { label: 'Deducoes', value: -11000, type: 'negative' },
    { label: 'Rec. Liquida', value: 209000, type: 'subtotal' },
    { label: 'CMV', value: -90000, type: 'negative' },
    { label: 'Lucro Bruto', value: 119000, type: 'subtotal' },
  ],
}
```
