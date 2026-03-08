---
title: ParetoChart
badge: Ferramentas
description: Barras decrescentes com linha de percentual acumulado e eixo Y duplo
---

# ParetoChart

Grafico de Pareto com barras em ordem decrescente de valor e linha de percentual acumulado sobreposta. Utiliza eixo Y duplo: esquerdo para valores absolutos (barras) e direito para percentual acumulado 0-100% (linha). Dados sao automaticamente ordenados do maior para o menor. Usado para analise de concentracao (despesas por categoria, receita por cliente).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido acima do grafico em 14px (sm) font-semibold cinza-700 |
| data | Entry[] | Yes | - | Array de entradas com label e valor numerico |
| height | number | No | 250 | Altura do grafico em pixels |
| valueLabel | string | No | "Valor" | Label da serie de barras exibida no tooltip |

### Tipo Entry

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Label da categoria exibida no eixo X |
| value | number | Yes | Valor numerico absoluto |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px.

**Titulo**: texto em 14px (sm) font-semibold cinza-700, margin-bottom 12px.

**Area do grafico**: ComposedChart (recharts) com ResponsiveContainer largura 100% e altura configuravel. Margens: top 4px, right 32px, bottom 4px, left 4px. Grid cartesiano com linhas tracejadas (strokeDasharray 3 3) em cinza claro (#F0F0F0).

**Eixo X**: labels em 10px, sem linha de eixo, sem ticks. Exibe os labels das entradas em ordem decrescente de valor.

**Eixo Y esquerdo**: valores absolutos em 10px, sem linha de eixo, sem ticks. Formatacao "Xk" para valores acima de 1000.

**Eixo Y direito**: percentual acumulado 0-100% em 10px, sem linha de eixo, sem ticks. Formatacao "X%".

**Barras**: preenchimento cinza escuro (#374151) com bordas superiores arredondadas (radius [3,3,0,0]). Cada barra representa o valor absoluto de uma categoria, vinculada ao eixo Y esquerdo.

**Linha acumulada**: tipo monotone em vermelho (#DC2626), strokeWidth 1.5, com pontos visiveis (dots) de raio 3 preenchidos em vermelho. Vinculada ao eixo Y direito. Comeca no percentual da primeira categoria e termina em 100%.

**Tooltip**: exibe o label da entrada, o valor absoluto formatado em pt-BR (serie de barras com nome customizavel via `valueLabel`), e o percentual acumulado.

## Conditional States

Este componente nao possui estados condicionais. Os dados sao automaticamente ordenados do maior para o menor valor, e o percentual acumulado e calculado internamente.

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 50% em grid 2 col)
- Altura: configuravel via prop `height`, default 250px
- Margem direita extra (32px) para acomodar labels do eixo Y direito
- ResponsiveContainer garante adaptacao a largura

## Blueprint Section Type

Tipo de secao: `pareto-chart`

```ts
{
  type: 'pareto-chart',
  title: 'Despesas por Categoria',
}
```

Nota: no Blueprint, `data` e `valueLabel` sao populados pelo renderer com dados mock. A secao do Blueprint apenas declara o titulo.

## Usage Example

```ts
{
  type: 'pareto-chart',
  title: 'Concentracao de Despesas',
}
```

O componente recebe os dados diretamente quando usado fora do Blueprint:

```tsx
<ParetoChart
  title="Concentracao de Despesas"
  data={[
    { label: 'Pessoal', value: 45000 },
    { label: 'Aluguel', value: 25000 },
    { label: 'Marketing', value: 18000 },
    { label: 'Tecnologia', value: 15000 },
    { label: 'Impostos', value: 12000 },
    { label: 'Outros', value: 10000 },
  ]}
  valueLabel="Despesa"
  height={300}
/>
```
