---
title: WireframeHeader
badge: Ferramentas
description: Header fixo com titulo, navegador de periodo central e tres variantes de periodType
---

# WireframeHeader

Header horizontal fixo no topo do wireframe com tres zonas: titulo a esquerda, navegador de periodo centralizado e espaco vazio a direita. Suporta tres modos de periodo (mensal, anual, none) que controlam o tipo de navegacao temporal exibida no centro.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido a esquerda do header |
| periodType | "mensal" \| "anual" \| "none" | No | "mensal" | Tipo de navegador de periodo exibido no centro |

## Visual Description

Barra horizontal com altura fixa de 56px, fundo branco (#FFFFFF) e borda inferior cinza (#E0E0E0). Posicionamento sticky no topo (z-index 10). Padding horizontal de 32px. Layout em tres colunas via flexbox.

**Coluna esquerda (flex: 1):** Titulo em texto 15px, peso 600, cor #212121.

**Coluna central (posicao absoluta centralizada):** Navegador de periodo com botoes de seta (anterior/proximo) e label do periodo entre eles. Botoes de seta tem 24x24px, borda cinza (#E0E0E0), cantos arredondados 4px, fonte 16px. Label do periodo em 13px, peso 600, cor #212121, centralizado com min-width garantindo alinhamento fixo.

**Coluna direita (flex: 1):** Espaco vazio reservado para futuras acoes.

## Conditional States

### periodType = "mensal" (padrao)

Exibe navegador mensal no centro: seta esquerda, label no formato "Mes / AA" (ex: "Janeiro / 26"), seta direita. O min-width do label e 130px. Navegacao ciclica -- ao retroceder de Janeiro vai para Dezembro do ano anterior.

### periodType = "anual"

Exibe navegador anual no centro: seta esquerda, label no formato "AAAA" (ex: "2025"), seta direita. O min-width do label e 60px. Navegacao incrementa/decrementa o ano em 1.

### periodType = "none"

Nenhum navegador de periodo e exibido no centro. Apenas o titulo a esquerda aparece.

## Sizing Rules

Largura total do container pai. Altura fixa de 56px. Flex-shrink 0 (nao encolhe). O navegador de periodo usa posicionamento absoluto com left 50% e translateX(-50%) para centralizacao precisa independente do tamanho do titulo.

## Blueprint Section Type

N/A -- componente de infraestrutura. Nao e declarado como section no blueprint.config.ts. E renderizado automaticamente pelo WireframeViewer usando a propriedade `periodType` definida em `BlueprintScreen`. Cada tela define seu proprio periodType e o WireframeViewer renderiza o header correspondente.

## Usage Example

```tsx
import WireframeHeader from '@tools/wireframe-builder/components/WireframeHeader'

<WireframeHeader
  title="Resultado Mensal"
  periodType="mensal"
/>
```
