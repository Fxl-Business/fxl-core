---
title: DataTable
badge: Ferramentas
description: Tabela com colunas configuraveis e linhas placeholder
---

# DataTable

Tabela generica com colunas configuraveis e linhas placeholder. Exibe um cabecalho com labels e linhas de dados com em-dash como placeholder. Usada para exibicao tabular simples sem interatividade (sem drill-down, sem click, sem edicao). Ideal para tabelas de resumo ou listagens.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | - | Titulo exibido no header do card |
| columns | Column[] | Yes | - | Array de configuracao de colunas |
| rowCount | number | No | 5 | Numero de linhas placeholder geradas |

### Tipo Column

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| key | string | Yes | - | Identificador unico da coluna |
| label | string | Yes | - | Texto exibido no cabecalho |
| align | 'left' \| 'right' \| 'center' | No | 'left' | Alinhamento do texto na coluna |

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Sem padding externo -- a tabela ocupa a largura total.

**Header** (quando title presente): borda inferior cinza-200, padding 16px horizontal e 12px vertical. Titulo em 14px (sm) font-semibold cinza-700.

**Tabela**: texto em 12px (xs), largura total. Overflow horizontal com scroll quando necessario.

**Cabecalho**: fundo cinza-100 (bg-gray-100). Cada celula com padding 16px horizontal e 10px vertical. Labels em font-medium cinza-500. Alinhamento controlado pela prop `align`.

**Linhas de dados**: separadas por borda superior cinza-200. Cada celula com padding 16px horizontal e 10px vertical. Conteudo exibe em-dash (--) como placeholder em cinza-400. Alinhamento herda da configuracao da coluna.

Nota: as linhas nao possuem alternancia de cor de fundo -- todas tem fundo branco.

## Conditional States

Este componente nao possui estados condicionais. O numero de linhas e controlado por `rowCount` e todas exibem placeholders.

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 100% full width)
- Altura: auto, determinada por rowCount (cada linha ~41px)
- Overflow horizontal com scroll para muitas colunas
- Sem altura maxima ou scroll vertical

## Blueprint Section Type

Tipo de secao: `data-table`

```ts
{
  type: 'data-table',
  title: 'Detalhamento',
  columns: ColumnConfig[],
  rowCount?: number,
}
```

O tipo `ColumnConfig` do Blueprint estende o tipo `Column` com uma prop adicional `compareOnly?: boolean` que indica colunas visiveis apenas em modo comparacao.

## Usage Example

```ts
{
  type: 'data-table',
  title: 'Receitas por Categoria',
  columns: [
    { key: 'categoria', label: 'Categoria', align: 'left' },
    { key: 'valor', label: 'Valor (R$)', align: 'right' },
    { key: 'pct', label: '% Total', align: 'right' },
    { key: 'variacao', label: 'Var. %', align: 'right', compareOnly: true },
  ],
  rowCount: 8,
}
```
