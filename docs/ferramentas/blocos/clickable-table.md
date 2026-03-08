---
title: ClickableTable
badge: Ferramentas
description: Tabela com onRowClick, hover destacado e cursor pointer
---

# ClickableTable

Tabela interativa onde cada linha pode ser clicada para disparar uma acao (tipicamente abrir um modal de detalhe). Linhas com hover destacado em azul e cursor pointer. Suporta variantes visuais por linha: default, total e highlight. Usada para fluxo de caixa diario/mensal onde clicar em uma linha abre o detalhamento do dia/mes.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | - | Titulo exibido no header do card |
| subtitle | string | No | - | Subtitulo exibido abaixo do titulo em 12px (xs) cinza-400 |
| columns | ClickColumn[] | Yes | - | Array de configuracao de colunas |
| rows | ClickRow[] | Yes | - | Array de linhas com dados e variante opcional |
| onRowClick | (row: ClickRow) => void | No | - | Callback disparado ao clicar em uma linha |

### Tipo ClickColumn

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| key | string | Yes | - | Identificador unico da coluna |
| label | string | Yes | - | Texto exibido no cabecalho |
| align | 'left' \| 'right' \| 'center' | No | 'left' | Alinhamento do texto na coluna |

### Tipo ClickRow

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | string | Yes | - | Identificador unico da linha |
| data | Record<string, ReactNode> | Yes | - | Dados da linha indexados por column key |
| variant | 'default' \| 'total' \| 'highlight' | No | 'default' | Variante visual da linha |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Overflow hidden no container.

**Header** (quando title presente): borda inferior cinza-200, padding 16px horizontal e 12px vertical. Titulo em 14px (sm) font-semibold cinza-700. Subtitulo em 12px (xs) cinza-400 com margin-top 2px.

**Tabela**: texto em 12px (xs), largura total. Overflow horizontal com scroll.

**Cabecalho**: fundo cinza-100 (bg-gray-100). Cada celula com padding 16px horizontal e 10px vertical. Labels em font-medium cinza-500 whitespace-nowrap. Alinhamento controlado pela prop `align`.

**Linhas** (quando onRowClick presente): cursor pointer com transicao de cor. Hover em azul-50 suave (bg-blue-50/40). Borda superior cinza-100.

**Celulas de dados**: padding 16px horizontal e 10px vertical. Texto em cinza-600. Colunas com `align: 'right'` recebem tabular-nums para alinhamento numerico. Valores ausentes exibem em-dash.

### Variantes de linha

- **default**: fundo branco, texto cinza-600
- **total**: fundo cinza-50, font-semibold, texto cinza-800. Usada para linhas de totalizacao
- **highlight**: fundo vermelho-50 suave (bg-red-50/60). Usada para linhas que merecem destaque visual (ex: saldo negativo)

## Conditional States

### onRowClick presente

Quando `onRowClick` e fornecido:
- Cursor pointer em todas as linhas
- Hover em azul-50/40 com transicao

Quando `onRowClick` nao e fornecido:
- Sem cursor pointer
- Sem hover colorido
- Tabela funciona como DataTable visual

### Variantes de linha

Cada linha pode ter uma variante independente. As variantes sao puramente visuais e nao afetam a interatividade (todas as linhas sao clicaveis, inclusive total e highlight).

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 100% full width)
- Altura: auto, determinada pelo numero de linhas
- Overflow horizontal com scroll para muitas colunas
- Sem altura maxima ou scroll vertical

## Blueprint Section Type

Tipo de secao: `clickable-table`

```ts
{
  type: 'clickable-table',
  title: 'Fluxo de Caixa Diario',
  subtitle?: string,
  columns: ColumnConfig[],
  rows: ClickRow[],
  modalTitleKey?: string,
  modalFooter?: ReactNode,
}
```

O `modalTitleKey` indica qual key dos dados da linha usar como titulo do modal quando a linha for clicada. O `modalFooter` permite definir conteudo no rodape do modal (tipicamente totalizadores).

## Usage Example

```ts
{
  type: 'clickable-table',
  title: 'Fluxo de Caixa Diario',
  subtitle: 'Clique em um dia para ver detalhes',
  columns: [
    { key: 'dia', label: 'Dia', align: 'left' },
    { key: 'entradas', label: 'Entradas (R$)', align: 'right' },
    { key: 'saidas', label: 'Saidas (R$)', align: 'right' },
    { key: 'saldo', label: 'Saldo (R$)', align: 'right' },
  ],
  rows: [
    {
      id: 'd01',
      data: { dia: '01/Mar', entradas: 'R$ 15.000', saidas: 'R$ 8.000', saldo: 'R$ 7.000' },
    },
    {
      id: 'd02',
      data: { dia: '02/Mar', entradas: 'R$ 3.000', saidas: 'R$ 12.000', saldo: '(R$ 9.000)' },
      variant: 'highlight',
    },
    {
      id: 'total',
      data: { dia: 'Total', entradas: 'R$ 18.000', saidas: 'R$ 20.000', saldo: '(R$ 2.000)' },
      variant: 'total',
    },
  ],
}
```
