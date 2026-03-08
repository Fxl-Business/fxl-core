---
title: WireframeSidebar
badge: Ferramentas
description: Menu lateral de navegacao entre telas do wireframe
---

# WireframeSidebar

Menu lateral compacto que lista todas as telas disponiveis no wireframe. Exibe os nomes das telas como botoes de navegacao, destacando a tela ativa com fundo e peso visual diferenciado. Permite alternar entre telas via callback.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| screens | Screen[] | Yes | - | Lista de telas disponiveis para navegacao |
| onSelect | (label: string) => void | No | - | Callback disparado quando uma tela e selecionada |

### Screen Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | Yes | Nome da tela exibido no menu |
| active | boolean | No | Indica se esta e a tela atualmente selecionada |

## Visual Description

Aside com largura fixa de 192px (w-48), fundo cinza claro (bg-gray-50), borda cinza (border-gray-200) e cantos arredondados. Padding interno de 8px.

**Cabecalho:** Label "TELAS" em texto 10px, uppercase, tracking extra-largo, cor cinza claro (text-gray-400), peso 600. Margem inferior de 8px.

**Lista de telas:** Botoes empilhados verticalmente com espacamento de 2px. Cada botao ocupa a largura total, com padding 8px horizontal e 6px vertical, cantos arredondados (rounded-md), texto 12px alinhado a esquerda.

**Tela ativa:** Fundo cinza (bg-gray-200), texto escuro (text-gray-800), peso medium.

**Tela inativa:** Sem fundo, texto cinza (text-gray-500). No hover: fundo cinza claro (bg-gray-100), texto mais escuro (text-gray-700). Transicao suave de cores.

## Sizing Rules

Largura fixa de 192px (w-48). Flex-shrink 0 (nao encolhe). Altura definida pelo conteudo. Nao possui scroll interno -- todas as telas sao exibidas.

## Blueprint Section Type

N/A -- componente de infraestrutura. Nao e declarado como section no blueprint.config.ts. E renderizado automaticamente pelo WireframeViewer usando a lista de `screens` definida em `BlueprintConfig`. O WireframeViewer gera a lista de Screen[] a partir das telas configuradas e gerencia o estado de navegacao.

## Usage Example

```tsx
import WireframeSidebar from '@tools/wireframe-builder/components/WireframeSidebar'

<WireframeSidebar
  screens={[
    { label: 'Resultado Mensal', active: true },
    { label: 'Receita Analitico', active: false },
    { label: 'Despesas Analitico', active: false },
    { label: 'Fluxo de Caixa', active: false },
  ]}
  onSelect={(label) => setActiveScreen(label)}
/>
```
