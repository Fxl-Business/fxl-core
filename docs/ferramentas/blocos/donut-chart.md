---
title: DonutChart
badge: Ferramentas
description: Grafico donut com legenda lateral e valor central opcional
---

# DonutChart

Grafico de rosca (donut) com legenda lateral e texto central opcional. Exibe distribuicao percentual de categorias usando fatias coloridas. Usado para composicao de receita, despesas por categoria, ou qualquer distribuicao proporcional.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido acima do grafico em 14px (sm) font-semibold cinza-700 |
| data | Slice[] | Yes | - | Array de fatias do donut |
| centerValue | string | No | - | Valor exibido no centro do donut em 16px (base) font-bold cinza-800 |
| centerLabel | string | No | - | Label exibida abaixo do valor central em 10px cinza-400 |
| height | number | No | 200 | Altura e largura do donut em pixels |

### Tipo Slice

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Nome da categoria exibido na legenda |
| value | number | Yes | Valor numerico que determina o tamanho da fatia |
| pct | string | No | Texto de percentual exibido na legenda (ex: "35%"). Se ausente, exibe o value formatado |
| color | string | No | Cor hex da fatia. Se ausente, usa a paleta padrao |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Padding interno de 16px.

**Titulo**: texto em 14px (sm) font-semibold cinza-700, margin-bottom 12px.

**Layout**: flex horizontal com gap 16px. Donut a esquerda (flex-shrink-0), legenda a direita (flex-1).

**Donut**: PieChart com Pie central usando innerRadius 28% e outerRadius 42% da altura, criando a forma de rosca. Angulo inicial 90 graus (topo), sentido horario. Fatias coloridas com a paleta padrao monocromatica: #212121, #757575, #BDBDBD, #424242, #9E9E9E (5 tons de cinza). Cores customizaveis via prop `color` de cada Slice.

**Texto central** (quando centerValue ou centerLabel presente): overlay absolutamente posicionado no centro do donut, flex column centralizado. centerValue em 16px font-bold cinza-800, centerLabel em 10px cinza-400 com margin-top 2px.

**Legenda lateral**: lista vertical com space-y 8px. Cada item em flex horizontal com gap 8px: quadrado colorido 12x12 (rounded-sm) com a cor da fatia, label truncado em 12px (xs) cinza-600, e valor/pct alinhado a direita em 12px (xs) font-medium cinza-700 tabular-nums.

**Tooltip**: valor formatado em pt-BR ao hover sobre as fatias.

## Conditional States

Este componente nao possui estados condicionais complexos. O texto central aparece somente quando `centerValue` e/ou `centerLabel` sao fornecidos.

## Sizing Rules

- Largura do donut: igual a prop `height` (quadrado)
- Largura total: controlada pelo container pai (tipicamente 50% em grid 2 col)
- Altura: controlada pela prop `height`, default 200px
- innerRadius: 28% da altura (buraco central)
- outerRadius: 42% da altura (borda externa)
- Legenda ocupa o espaco restante (flex-1) com truncamento de labels longos

## Blueprint Section Type

Tipo de secao: `donut-chart`

```ts
{
  type: 'donut-chart',
  title: 'Composicao por Categoria',
}
```

Nota: no Blueprint, `data`, `centerValue` e `centerLabel` sao populados pelo renderer com dados mock. A secao do Blueprint apenas declara o titulo.

## Usage Example

```ts
{
  type: 'donut-chart',
  title: 'Despesas por Categoria',
}
```

O componente recebe os dados diretamente quando usado fora do Blueprint:

```tsx
<DonutChart
  title="Despesas por Categoria"
  data={[
    { label: 'Pessoal', value: 45000, pct: '36%' },
    { label: 'Aluguel', value: 25000, pct: '20%' },
    { label: 'Marketing', value: 18000, pct: '14%' },
    { label: 'Tecnologia', value: 15000, pct: '12%' },
    { label: 'Outros', value: 22000, pct: '18%' },
  ]}
  centerValue="R$ 125.000"
  centerLabel="Total"
  height={220}
/>
```
