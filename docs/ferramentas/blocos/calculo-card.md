---
title: CalculoCard
badge: Ferramentas
description: Cascata de calculo financeiro vertical com modo comparacao e logica de cor invertida
---

# CalculoCard

Cascata de calculo financeiro em formato tabular vertical. Cada linha apresenta operador opcional (-, =, +), label, valor em R$, percentual sobre faturamento e, em modo comparacao, coluna de periodo anterior com variacao percentual. Linhas de resultado recebem fundo diferenciado. Usado para resumos financeiros tipo DRE onde a progressao de calculo e visivel (Receita - Custos = Resultado).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | - | Titulo exibido no header do card |
| rows | CalculoRow[] | Yes | - | Array de linhas do calculo financeiro |
| compareMode | boolean | No | false | Ativa colunas de periodo anterior e variacao % |
| comparePeriodLabel | string | No | "Periodo Anterior" | Label do header da coluna de comparacao |

### Tipo CalculoRow

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| operator | '(-)' \| '(=)' \| '(+)' | No | - | Operador exibido antes do label em mono 10px cinza-400 |
| label | string | Yes | - | Nome da linha (ex: "Receita Bruta", "CMV") |
| value | string | Yes | - | Valor formatado (ex: "R$ 125.000" ou "(R$ 45.000)") |
| pct | string | No | - | Percentual sobre faturamento (ex: "100%", "36%"). Exibe em-dash quando ausente |
| highlight | boolean | No | false | Linha de resultado com fundo verde-50 e borda verde-200 |
| valueCompare | string | No | - | Valor do periodo anterior (exibido quando compareMode=true) |
| variation | string | No | - | Texto de variacao (ex: "+12,3%"). Badge verde ou vermelho |
| variationPositive | boolean | No | - | Cor do badge de variacao: verde se true, vermelho se false |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Sem padding externo -- a tabela ocupa a largura total.

**Header** (quando title presente): borda inferior cinza-200, padding 16px horizontal e 8px vertical. Titulo em 14px (sm) font-semibold cinza-700.

**Tabela**: texto em 12px (xs), largura total.

**Cabecalho da tabela**: fundo slate-800 com texto branco. Colunas fixas: "Resumo" (left), "Valores" (right), "% s/ Faturamento" (right). Em compareMode, duas colunas adicionais: periodo anterior label (right) e "Var. %" (right).

**Linhas normais**: padding 12px horizontal e 8px vertical. Alternancia de fundo: linhas pares branco, linhas impares cinza-50.
- Coluna "Resumo": operador em mono 10px cinza-400 seguido de label em cinza-800
- Coluna "Valores": alinhado a direita, tabular-nums. Cor azul-700 para valores positivos. Cor vermelho-600 para valores negativos (valores que comecam com "(" ou "-")
- Coluna "%": alinhado a direita, cinza-500. Em-dash quando ausente

**Linhas highlight** (resultado): fundo verde-50, font-semibold, borda superior verde-200. Mesma estrutura de colunas.

**Colunas de comparacao** (quando compareMode=true):
- Coluna periodo anterior: alinhado a direita, tabular-nums, cinza-600. Em-dash quando ausente
- Coluna variacao: badge inline com rounded, padding 6px/2px, texto 10px font-medium. Verde-100/verde-700 quando variationPositive=true. Vermelho-100/vermelho-700 quando variationPositive=false. Em-dash quando ausente

## Conditional States

### compareMode

Quando `compareMode=true`:
- Cabecalho ganha 2 colunas adicionais: label do periodo anterior (ou "Periodo Anterior") e "Var. %"
- Cada linha exibe `valueCompare` e `variation` nas colunas extras
- Todas as linhas exibem comparacao, nao apenas as linhas highlight

Quando `compareMode=false`:
- Tabela tem apenas 3 colunas: Resumo, Valores, % s/ Faturamento
- Props `valueCompare`, `variation` e `variationPositive` sao ignoradas

### Logica de cor invertida para operador (-)

Linhas com operador `(-)` representam custos/deducoes. Nessas linhas, a logica de cor da variacao deve ser interpretada de forma invertida pelo configurador do Blueprint:
- Custo que sobe = ruim = `variationPositive: false` (vermelho)
- Custo que desce = bom = `variationPositive: true` (verde)

Esta inversao nao e automatica no componente -- e responsabilidade de quem configura os dados no Blueprint definir `variationPositive` corretamente para cada linha.

### Linhas highlight

Linhas com `highlight: true` recebem:
- Fundo verde-50
- Font-semibold em todo o texto
- Borda superior verde-200

Usadas para linhas de resultado parcial ou final (ex: "Lucro Bruto", "EBITDA", "Lucro Liquido").

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 50% em grid 2 col)
- Altura: auto, determinada pelo numero de linhas
- Tabela ocupa 100% da largura do card
- Overflow horizontal com scroll quando necessario

## Blueprint Section Type

Tipo de secao: `calculo-card`

```ts
{
  type: 'calculo-card',
  title: 'Resumo do Resultado',
  rows: [
    { label: 'Receita Bruta', value: 'R$ 245.000', pct: '100%' },
    { operator: '(-)', label: 'Deducoes', value: '(R$ 12.000)', pct: '4,9%' },
    // ... mais linhas
  ],
}
```

## Usage Example

```ts
{
  type: 'calculo-card',
  title: 'Resumo do Resultado',
  rows: [
    {
      label: 'Receita Bruta',
      value: 'R$ 245.000',
      pct: '100%',
      valueCompare: 'R$ 220.000',
      variation: '+11,4%',
      variationPositive: true,
    },
    {
      operator: '(-)',
      label: 'Deducoes s/ Vendas',
      value: '(R$ 12.250)',
      pct: '5,0%',
      valueCompare: '(R$ 11.000)',
      variation: '+11,4%',
      variationPositive: false,
    },
    {
      operator: '(=)',
      label: 'Receita Liquida',
      value: 'R$ 232.750',
      pct: '95,0%',
      highlight: true,
      valueCompare: 'R$ 209.000',
      variation: '+11,4%',
      variationPositive: true,
    },
  ],
}
```
