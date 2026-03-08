---
title: ConfigTable
badge: Ferramentas
description: Tabela com selects inline, badges e acoes Editar/Excluir por linha
---

# ConfigTable

Tabela de configuracao com celulas interativas: selects inline (dropdowns), badges coloridos por tipo/status, e acoes por linha (Editar/Excluir). Inclui botao de adicionar nova linha no header. Usada para telas de configuracoes onde o usuario define categorias, contas, mapeamentos e parametros do sistema.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido no header do card |
| addLabel | string | No | - | Label do botao de adicionar (ex: "+ Nova Categoria"). Exibido no header a direita |
| columns | ConfigColumn[] | Yes | - | Array de configuracao de colunas com tipos de celula |
| rows | ConfigRow[] | Yes | - | Array de linhas de dados |

### Tipo ConfigColumn

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| key | string | Yes | - | Identificador unico da coluna |
| label | string | Yes | - | Texto exibido no cabecalho |
| type | 'text' \| 'select' \| 'badge' \| 'actions' \| 'status' | No | 'text' | Tipo de renderizacao da celula |
| options | string[] | No | - | Opcoes disponiveis para colunas do tipo 'select' |
| width | string | No | - | Largura fixa da coluna (ex: "120px", "20%") |

### Tipo ConfigRow

```ts
type ConfigRow = Record<string, string>
```

Mapa simples de key para valor. Cada key corresponde ao `key` de uma ConfigColumn.

## Visual Description

Card branco arredondado (rounded-lg) com borda cinza-200 e sombra sutil (shadow-sm). Overflow hidden no container.

**Header**: flex horizontal com titulo a esquerda e botao a direita. Borda inferior cinza-200, padding 16px horizontal e 12px vertical. Titulo em 14px (sm) font-semibold cinza-700. Botao de adicionar (quando addLabel presente): fundo cinza-100, borda cinza-200, texto cinza-500 em 12px (xs) font-medium, rounded-md, padding 12px/6px. Botao desabilitado (cursor default) no wireframe.

**Tabela**: texto em 12px (xs), largura total. Overflow horizontal com scroll.

**Cabecalho**: fundo cinza-50 (bg-gray-50). Cada celula com padding 16px horizontal e 10px vertical. Labels em font-medium cinza-500 whitespace-nowrap, alinhamento a esquerda. Largura customizavel via prop `width`.

**Linhas**: borda superior cinza-100. Hover em cinza-50 suave (bg-gray-50/50). Cada celula com padding 16px horizontal e 10px vertical.

### Tipos de celula

- **text**: texto simples em cinza-600
- **select**: container com borda cinza-200, fundo branco, texto cinza-500 em 12px com indicador dropdown (caracter triangulo) em cinza-300. Largura minima 120px. Exibe o valor atual. Desabilitado no wireframe
- **badge**: badge colorido com rounded, padding 8px/2px, texto 10px font-medium. Cores mapeadas por valor: Variavel=azul, Fixo=roxo, Financeiro=laranja, Corrente=verde, Aplicacao=teal, Caixa=cinza, Sim=verde, Nao=vermelho. Valores nao mapeados: cinza-100/cinza-500
- **status**: identico ao badge (mesmo mapeamento de cores)
- **actions**: flex horizontal com gap 4px. Dois botoes desabilitados: "Editar" (borda cinza-200, texto cinza-400, 11px) e "Excluir" (borda vermelho-100, texto vermelho-300, 11px)

## Conditional States

### addLabel presente

Quando `addLabel` e fornecido, o botao de adicionar aparece no header a direita do titulo. No wireframe, o botao e desabilitado (apenas visual).

### Tipos de coluna

O tipo de renderizacao de cada celula e determinado pela prop `type` da ConfigColumn. Uma mesma tabela pode misturar diferentes tipos de celula.

## Sizing Rules

- Largura: controlada pelo container pai (tipicamente 100% full width)
- Altura: auto, determinada pelo numero de linhas
- Colunas com `width` definida tem largura fixa
- Selects tem largura minima de 120px
- Overflow horizontal com scroll para muitas colunas

## Blueprint Section Type

Tipo de secao: `config-table`

```ts
{
  type: 'config-table',
  title: 'Categorias de Despesa',
  addLabel?: string,
  columns: ConfigColumn[],
  rows: ConfigRow[],
}
```

## Usage Example

```ts
{
  type: 'config-table',
  title: 'Categorias de Despesa',
  addLabel: '+ Nova Categoria',
  columns: [
    { key: 'nome', label: 'Nome', type: 'text' },
    { key: 'tipo', label: 'Tipo', type: 'badge' },
    { key: 'grupo', label: 'Grupo DRE', type: 'select', options: ['CMV', 'Despesas Operacionais', 'Financeiro'] },
    { key: 'ativo', label: 'Ativo', type: 'status' },
    { key: 'acoes', label: 'Acoes', type: 'actions', width: '140px' },
  ],
  rows: [
    { nome: 'Salarios', tipo: 'Fixo', grupo: 'Despesas Operacionais', ativo: 'Sim' },
    { nome: 'Comissoes', tipo: 'Variavel', grupo: 'CMV', ativo: 'Sim' },
    { nome: 'Juros', tipo: 'Financeiro', grupo: 'Financeiro', ativo: 'Nao' },
  ],
}
```
