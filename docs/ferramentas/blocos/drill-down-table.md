---
title: DrillDownTable
badge: Ferramentas
description: Tabela com linhas pai expansiveis e filhos ocultos por padrao
---

# DrillDownTable

Tabela hierarquica com linhas pai que podem ser expandidas para revelar linhas filhas. Cada linha pai exibe um indicador de expansao (triangulo) que, ao ser clicado, mostra ou oculta seus filhos. Suporta linhas de total com estilo diferenciado e niveis de profundidade com indentacao progressiva. Usada para DRE, agrupamentos hierarquicos e qualquer tabela que necessite de drill-down.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | - | Titulo exibido no header do card |
| subtitle | string | No | - | Subtitulo exibido abaixo do titulo em 12px (xs) cinza-400 |
| columns | DrilColumn[] | Yes | - | Array de configuracao de colunas |
| rows | DrilRow[] | Yes | - | Array hierarquico de linhas (pai com children) |

### Tipo DrilColumn

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| key | string | Yes | - | Identificador unico da coluna |
| label | string | Yes | - | Texto exibido no cabecalho |
| align | 'left' \| 'right' \| 'center' | No | 'left' | Alinhamento do texto na coluna |

### Tipo DrilRow

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | string | Yes | - | Identificador unico da linha |
| data | Record<string, ReactNode> | Yes | - | Dados da linha indexados por column key |
| children | DrilRow[] | No | - | Linhas filhas (quando presente, a linha e expansivel) |
| isTotal | boolean | No | false | Linha de total com fundo cinza-50 e font-semibold |
| className | string | No | - | Classes CSS adicionais para a linha |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Overflow hidden no container.

**Header** (quando title presente): borda inferior cinza-200, padding 16px horizontal e 12px vertical. Titulo em 14px (sm) font-semibold cinza-700. Subtitulo em 12px (xs) cinza-400 com margin-top 2px.

**Tabela**: texto em 12px (xs), largura total. Overflow horizontal com scroll.

**Cabecalho**: fundo cinza-100 (bg-gray-100). Cada celula com padding 16px horizontal e 10px vertical. Labels em font-medium cinza-500 whitespace-nowrap. Alinhamento controlado pela prop `align`.

**Linhas pai** (com children): borda superior cinza-100 claro. Cursor pointer com hover em cinza-50. Primeira coluna exibe um indicador de expansao:
- Fechado: triangulo direito (caracter unicode) em 11px cinza-400 com largura fixa 16px
- Aberto: triangulo baixo (caracter unicode) em 11px cinza-400 com largura fixa 16px
- Indentacao progressiva: padding-left de (depth * 16px) na primeira coluna

**Linhas filhas**: mesma estrutura das linhas pai, com indentacao incrementada (depth + 1). Ocultas por padrao, reveladas ao clicar na linha pai. Podem ter seus proprios filhos (recursao ilimitada).

**Linhas sem children**: sem indicador de expansao, sem cursor pointer. Texto em cinza-600.

**Linhas de total** (isTotal=true): fundo cinza-50 (bg-gray-50), font-semibold, texto cinza-800.

**Celulas de dados**: padding 16px horizontal e 10px vertical. Texto em cinza-600 (normal) ou cinza-800 font-semibold (total). Valores ausentes exibem em-dash.

## Conditional States

### Expansao de linhas

Estado interno controlado por useState. Cada linha pai com `children` gerencia seu proprio estado de aberto/fechado independentemente. Clicar em uma linha pai:
- Se fechada: abre e revela os filhos diretos
- Se aberta: fecha e oculta todos os descendentes

### isTotal

Linhas com `isTotal=true` recebem fundo cinza-50 e font-semibold. Podem ou nao ter filhos.

### Modo comparacao via viewSwitcher

No Blueprint, o DrillDownTable suporta um `viewSwitcher` que alterna entre diferentes conjuntos de `rows` sem alterar as colunas. O viewSwitcher e renderizado como um DetailViewSwitcher posicionado acima da tabela. Este nao e um prop direto do componente -- e tratado no nivel do Blueprint section type.

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 100% full width)
- Altura: auto, determinada pelo numero de linhas visiveis
- Overflow horizontal com scroll para muitas colunas
- Indentacao: 16px por nivel de profundidade
- Sem altura maxima ou scroll vertical

## Blueprint Section Type

Tipo de secao: `drill-down-table`

```ts
{
  type: 'drill-down-table',
  title: 'DRE por Grupo',
  subtitle?: string,
  columns: ColumnConfig[],
  rows: DrilRow[],
  viewSwitcher?: {
    options: string[],
    default: string,
    rowsByView: Record<string, DrilRow[]>,
  },
}
```

O `viewSwitcher` renderiza um DetailViewSwitcher acima da tabela. Quando o usuario seleciona uma opcao, os `rows` sao substituidos pelos dados de `rowsByView[selectedOption]`.

## Usage Example

```ts
{
  type: 'drill-down-table',
  title: 'Resultado por Grupo',
  subtitle: 'Clique para expandir',
  columns: [
    { key: 'grupo', label: 'Grupo', align: 'left' },
    { key: 'valor', label: 'Valor (R$)', align: 'right' },
    { key: 'pct', label: '% Total', align: 'right' },
  ],
  rows: [
    {
      id: 'receita',
      data: { grupo: 'Receita', valor: 'R$ 245.000', pct: '100%' },
      children: [
        { id: 'vendas', data: { grupo: 'Vendas', valor: 'R$ 200.000', pct: '81,6%' } },
        { id: 'servicos', data: { grupo: 'Servicos', valor: 'R$ 45.000', pct: '18,4%' } },
      ],
    },
    {
      id: 'total',
      data: { grupo: 'Total Geral', valor: 'R$ 245.000', pct: '100%' },
      isTotal: true,
    },
  ],
  viewSwitcher: {
    options: ['Por Grupo', 'Por Categoria'],
    default: 'Por Grupo',
    rowsByView: { /* ... */ },
  },
}
```
