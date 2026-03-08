---
title: SaldoBancoInput
badge: Ferramentas
description: Grid de campos de saldo por banco com total consolidado automatico
---

# SaldoBancoInput

Grid de campos de entrada para saldo atual de cada banco/conta, com totalizacao consolidada automatica no rodape. Utilizado na tela de Fluxo de Caixa Mensal para que o operador informe os saldos reais como ponto de partida da projecao.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | No | "Saldo Atual por Banco" | Titulo exibido acima da lista de bancos |
| note | string | No | "Informe o saldo atual de cada banco para calcular a projecao do mes." | Nota explicativa abaixo do titulo |
| banks | BankEntry[] | Yes | - | Lista de bancos com seus respectivos saldos |
| total | string | Yes | - | Valor total consolidado exibido no rodape |

### BankEntry Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | Yes | Nome do banco/conta (ex: "Banco do Brasil", "Itau Conta Corrente") |
| value | string | Yes | Saldo atual formatado (ex: "R$ 45.230,00") |

## Visual Description

Card com fundo cinza claro (bg-gray-50), borda cinza (border-gray-200), cantos arredondados, padding 20px.

**Titulo:** Texto 14px, peso 600, cor cinza escuro (text-gray-700), margem inferior 4px.

**Nota:** Texto 12px, cor cinza claro (text-gray-400), margem inferior 16px. Omitida se `note` for vazio.

**Lista de bancos:** Campos empilhados verticalmente com espacamento de 8px. Cada banco e um layout horizontal:
- Label a esquerda com largura fixa de 208px (w-52), texto 12px, cor cinza (text-gray-500), flex-shrink 0
- Campo somente-leitura a direita (flex-1) com fundo branco, borda cinza (border-gray-200), cantos arredondados (rounded-md), padding 12px horizontal e 6px vertical, texto 12px cinza (text-gray-500), cursor default, selecao desabilitada

**Total consolidado:** Separado por borda superior cinza com margem e padding superiores de 12px. Layout horizontal:
- Label "Saldo Consolidado Total" a esquerda com largura fixa de 208px, texto 12px, peso 600, cor cinza escuro (text-gray-700)
- Valor total a direita em texto 14px, peso bold, cor cinza muito escuro (text-gray-800)

## Sizing Rules

Largura total do container pai. Altura definida pelo conteudo (quantidade de bancos). Labels tem largura fixa de 208px. Campos de valor ocupam o espaco restante (flex-1).

## Blueprint Section Type

`saldo-banco` -- declarado no blueprint.config.ts como `SaldoBancoSection`:

```typescript
type SaldoBancoSection = {
  type: 'saldo-banco'
  title?: string
  note?: string
  banks: BankEntry[]
  total: string
}
```

## Usage Example

```typescript
// blueprint.config.ts
{
  type: 'saldo-banco',
  title: 'Saldo Atual por Banco',
  note: 'Informe o saldo atual de cada banco para calcular a projecao do mes.',
  banks: [
    { label: 'Banco do Brasil', value: 'R$ 45.230,00' },
    { label: 'Itau Conta Corrente', value: 'R$ 82.150,00' },
    { label: 'Bradesco Aplicacao', value: 'R$ 120.000,00' },
    { label: 'Caixa Economica', value: 'R$ 15.890,00' },
  ],
  total: 'R$ 263.270,00',
}
```
