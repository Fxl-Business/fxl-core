---
title: ManualInputSection
badge: Ferramentas
description: Formulario de ajustes manuais com entrada de receita/despesa e tabela CRUD inline
---

# ManualInputSection

Formulario para entrada manual de ajustes financeiros (receitas e despesas) com saldo inicial opcional, formularios de adicao por tipo e tabela CRUD inline mostrando entradas cadastradas com acoes de Editar e Remover. Utilizado em telas de projecao financeira como Fluxo de Caixa Anual.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | "Simulacao de Ajustes Manuais" | Titulo exibido no topo da section |
| initialBalance | string | No | - | Saldo inicial do periodo exibido como campo somente-leitura |
| entries | AdjustEntry[] | No | [] | Lista de ajustes ja cadastrados exibidos na tabela CRUD |

### AdjustEntry Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Identificador unico da entrada |
| type | "receita" \| "despesa" | Yes | Tipo do ajuste (determina cor do badge e campos do formulario) |
| month | string | Yes | Mes do ajuste (ex: "Jan/2026") |
| value | string | Yes | Valor monetario do ajuste (ex: "R$ 5.000,00") |
| description | string | Yes | Descricao do ajuste |

## Visual Description

Card com fundo cinza claro (bg-gray-50), borda cinza (border-gray-200), cantos arredondados, padding 20px. Espacamento vertical de 20px entre secoes.

**Titulo:** Texto 14px, peso 600, cor cinza escuro (text-gray-700).

**Saldo Inicial (condicional):** Exibido quando `initialBalance` e fornecido. Label "SALDO INICIAL DO PERIODO" em 10px, uppercase, tracking largo, cinza claro. Abaixo, layout horizontal com label "Saldo inicial (R$)" em 12px cinza a esquerda (largura fixa 208px) e campo somente-leitura com fundo branco, borda cinza, mostrando o valor. Nota explicativa abaixo: "Ponto de partida da projecao mensal." em 12px cinza claro.

**Formulario de Receita:** Label "ADICIONAR RECEITA MANUAL" em 10px, uppercase, tracking largo. Grid responsivo (2 colunas mobile, 3 tablet, 5 desktop) com campos: Valor (R$), Mes, Categoria, Centro de Custo, Descricao. Cada campo tem label 10px cinza claro acima e input placeholder em cinza claro com fundo branco e borda cinza. Botao "+ Adicionar Receita" desabilitado abaixo em fundo cinza, 12px peso medium.

**Formulario de Despesa:** Estrutura identica ao de receita, com label "ADICIONAR DESPESA MANUAL". Campos: Valor (R$), Mes, Grupo, Categoria, Descricao. Botao "+ Adicionar Despesa" desabilitado.

**Tabela de Ajustes Cadastrados (condicional):** Exibida quando `entries` tem itens. Label "AJUSTES CADASTRADOS" em 10px, uppercase, tracking largo. Tabela com fundo branco, borda cinza, cantos arredondados:
- Cabecalho (bg-gray-100): colunas Tipo, Mes, Valor (R$), Descricao, Acoes em 12px cinza peso medium
- Coluna Tipo: badge colorido -- "Receita" com fundo verde claro e texto verde, "Despesa" com fundo vermelho claro e texto vermelho
- Coluna Valor: alinhado a direita com tabular-nums
- Coluna Acoes: botoes "Editar" (borda cinza, texto cinza) e "Remover" (borda vermelha clara, texto vermelho claro) desabilitados

## Conditional States

### Sem initialBalance

A secao de saldo inicial nao e renderizada. Formularios de receita e despesa aparecem diretamente apos o titulo.

### Sem entries (padrao)

A tabela de ajustes cadastrados nao e renderizada. Apenas formularios de adicao sao exibidos.

### Com entries

A tabela CRUD aparece abaixo dos formularios mostrando todas as entradas com acoes inline.

## Sizing Rules

Largura total do container pai. Altura definida pelo conteudo. Grids de formulario sao responsivos: 2 colunas em mobile, 3 em tablet, 5 em desktop. A tabela tem overflow-x auto para scroll horizontal em telas estreitas. Labels de formulario tem largura fixa de 208px no layout de saldo inicial.

## Blueprint Section Type

`manual-input` -- declarado no blueprint.config.ts como `ManualInputSectionConfig`:

```typescript
type ManualInputSectionConfig = {
  type: 'manual-input'
  title?: string
  initialBalance?: string
  entries?: AdjustEntry[]
}
```

## Usage Example

```typescript
// blueprint.config.ts
{
  type: 'manual-input',
  title: 'Simulacao de Ajustes Manuais',
  initialBalance: 'R$ 150.000,00',
  entries: [
    {
      id: '1',
      type: 'receita',
      month: 'Fev/2026',
      value: 'R$ 25.000,00',
      description: 'Receita extra de consultoria',
    },
    {
      id: '2',
      type: 'despesa',
      month: 'Mar/2026',
      value: 'R$ 8.500,00',
      description: 'Compra de equipamento',
    },
  ],
}
```
