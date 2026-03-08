---
title: DetailViewSwitcher
badge: Ferramentas
description: Seletor pill/aba para alternar dimensao de detalhe em tabelas drill-down
---

# DetailViewSwitcher

Seletor horizontal de opcoes em formato pill/aba que permite alternar a dimensao de detalhe de uma DrillDownTable. Nao afeta os totais da tabela -- apenas altera quais linhas-filho sao exibidas ao expandir uma linha-pai. Posiciona-se tipicamente acima da tabela associada.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| options | string[] | Yes | - | Lista de opcoes disponiveis (ex: ["Por Grupo", "Por Categoria"]) |
| activeOption | string | Yes | - | Opcao atualmente selecionada |
| onChange | (option: string) => void | Yes | - | Callback disparado quando uma opcao e selecionada |

## Visual Description

Container horizontal inline com alinhamento centralizado.

**Prefixo:** Label "Visualizar por:" em texto 12px, cor cinza claro (text-gray-400), com margem direita de 8px.

**Botoes pill:** Sequencia de botoes horizontais com gap de 4px. Cada botao tem padding 12px horizontal e 4px vertical, cantos totalmente arredondados (rounded-full), texto 12px com peso medium, transicao suave de cores.

**Opcao ativa:** Fundo azul (bg-blue-600), texto branco.

**Opcao inativa:** Fundo cinza claro (bg-gray-100), texto cinza (text-gray-600). No hover: fundo cinza medio (bg-gray-200).

## Sizing Rules

Largura definida pelo conteudo (inline). Os botoes pill ajustam sua largura ao texto de cada opcao.

## Blueprint Section Type

Nao e uma section diretamente. E utilizado via o campo `viewSwitcher` em `DrillDownTableSection`:

```typescript
type DrillDownTableSection = {
  type: 'drill-down-table'
  // ...
  viewSwitcher?: {
    options: string[]
    default: string
    rowsByView: Record<string, DrilRow[]>
  }
}
```

Quando `viewSwitcher` esta definido, o BlueprintRenderer renderiza o DetailViewSwitcher acima da DrillDownTable e troca as rows exibidas conforme a opcao selecionada.

## Usage Example

```tsx
import DetailViewSwitcher from '@tools/wireframe-builder/components/DetailViewSwitcher'

<DetailViewSwitcher
  options={['Por Grupo', 'Por Categoria']}
  activeOption={activeView}
  onChange={(opt) => setActiveView(opt)}
/>
```

No blueprint.config.ts:

```typescript
{
  type: 'drill-down-table',
  title: 'Detalhamento DRE',
  columns: [...],
  rows: rowsPorGrupo,
  viewSwitcher: {
    options: ['Por Grupo', 'Por Categoria'],
    default: 'Por Grupo',
    rowsByView: {
      'Por Grupo': rowsPorGrupo,
      'Por Categoria': rowsPorCategoria,
    }
  }
}
```
