---
title: WireframeFilterBar
badge: Ferramentas
description: Barra de filtros sticky com busca, filtros inline e switch de comparacao temporal
---

# WireframeFilterBar

Barra de filtros horizontal fixada no topo da area de conteudo (sticky). Exibe filtros inline com labels, campo de busca opcional e um switch "Comparar" que, ao ser ativado, revela um seletor de periodo para comparacao temporal. Este componente CONTROLA o compareMode da tela -- ele nao recebe compareMode como exibicao, ele o gerencia.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| filters | FilterOption[] | Yes | - | Lista de filtros a exibir. Cada FilterOption tem `key`, `label` e `options?: string[]` |
| showSearch | boolean | No | false | Exibe campo de busca a esquerda dos filtros |
| searchPlaceholder | string | No | "Buscar..." | Texto placeholder do campo de busca |
| showCompareSwitch | boolean | No | true | Exibe o switch "Comparar" e controles de periodo no lado direito |
| compareMode | boolean | No | undefined | Controle externo do estado de comparacao. Se undefined, usa estado interno |
| onCompareModeChange | (on: boolean) => void | No | - | Callback quando o switch de comparacao e alternado |
| comparePeriodType | "mensal" \| "anual" | No | "mensal" | Define se o seletor de periodo mostra meses ou anos |
| comparePeriod | string | No | undefined | Controle externo do periodo selecionado. Se undefined, usa estado interno |
| onComparePeriodChange | (period: string) => void | No | - | Callback quando o periodo de comparacao e alterado |

### FilterOption Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | string | Yes | Identificador unico do filtro |
| label | string | Yes | Label exibida antes do select |
| options | string[] | No | Opcoes do dropdown. Se omitido, exibe "Todos" |

## Visual Description

Container horizontal com fundo branco (#FFFFFF), borda cinza (#E0E0E0), cantos arredondados (12px) e sombra sutil. Posicionamento sticky no topo (z-index 9). Conteudo distribui-se horizontalmente com gap de 8px e flex-wrap habilitado.

**Lado esquerdo:** Campo de busca (se habilitado) com icone de lupa cinza e input desabilitado, seguido de divisor vertical. Depois, filtros inline -- cada filtro exibe um label em cinza (#757575, 11px, peso 500) seguido de um select desabilitado mostrando a primeira opcao ou "Todos".

**Lado direito:** Separado por flex spacer. Exibe o seletor de periodo (visivel apenas quando compare esta ON), seguido de divisor vertical, label "Comparar" em cinza, e toggle switch. O toggle switch tem 36x20px, fundo cinza (#D1D5DB) quando OFF, azul (#2563EB) quando ON, com circulo branco de 16px que desliza com transicao.

## Conditional States

### compareMode OFF (padrao)

O toggle switch fica cinza. O seletor de periodo fica oculto. Apenas os filtros, busca (se habilitada) e o switch "Comparar" sao visiveis.

### compareMode ON

O toggle switch fica azul (#2563EB). Um select de periodo aparece a ESQUERDA do label "Comparar", com fundo azul claro (#EFF6FF), borda azul (#BFDBFE), texto azul (#2563EB, peso 600). Opcoes do select: meses (Fev/2026, Jan/2026, etc.) quando `comparePeriodType="mensal"`, ou anos (2025, 2024, 2023) quando `comparePeriodType="anual"`.

## Sizing Rules

Largura total do container pai. Padding interno 8px vertical, 16px horizontal. Flex-wrap permite quebra de linha quando os filtros nao cabem em uma unica linha. Campo de busca tem min-width de 180px.

## Blueprint Section Type

N/A -- componente de infraestrutura. Nao e declarado como section no blueprint.config.ts. E renderizado automaticamente pelo WireframeViewer com base nas propriedades `hasCompareSwitch` e `filters` definidas em `BlueprintScreen`. O WireframeViewer passa o estado de compareMode para os componentes de section que suportam comparacao.

## Usage Example

```tsx
import WireframeFilterBar from '@tools/wireframe-builder/components/WireframeFilterBar'

<WireframeFilterBar
  filters={[
    { key: 'segmento', label: 'Segmento', options: ['Todos', 'Varejo', 'Atacado'] },
    { key: 'unidade', label: 'Unidade', options: ['Todas', 'SP', 'RJ'] },
  ]}
  showSearch={true}
  showCompareSwitch={true}
  compareMode={compareMode}
  onCompareModeChange={setCompareMode}
  comparePeriodType="mensal"
  comparePeriod={comparePeriod}
  onComparePeriodChange={setComparePeriod}
/>
```
