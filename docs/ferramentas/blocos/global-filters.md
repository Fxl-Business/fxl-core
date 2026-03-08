---
title: GlobalFilters
badge: Ferramentas
description: Barra de filtros com selects de periodo, segmento e outros (LEGACY -- substituido por WireframeFilterBar)
---

# GlobalFilters

> **LEGACY** -- este componente foi substituido pelo [WireframeFilterBar](/ferramentas/blocos/wireframe-filter-bar) para novos wireframes. Permanece no codebase para compatibilidade com wireframes existentes. Novos blueprints devem usar WireframeFilterBar.

Barra de filtros horizontal com selects agrupados por tipo. Cada filtro exibe um label uppercase acima de um select desabilitado (wireframe). Suporta tipos pre-definidos: periodo, ano, segmento, vendedor, unidade, categoria e status.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| filters | FilterType[] | Yes | - | Lista de tipos de filtro a exibir |

### FilterType (union de strings)

Valores aceitos: `"periodo"` | `"ano"` | `"segmento"` | `"vendedor"` | `"unidade"` | `"categoria"` | `"status"`

Cada tipo e mapeado para um label localizado:

| FilterType | Label exibido |
|-----------|---------------|
| periodo | Periodo |
| ano | Ano |
| segmento | Segmento |
| vendedor | Vendedor |
| unidade | Unidade |
| categoria | Categoria |
| status | Status |

## Visual Description

Container horizontal com flex-wrap, fundo cinza claro (bg-gray-50), borda cinza (border-gray-200), cantos arredondados. Padding de 16px horizontal e 12px vertical.

Cada filtro e um bloco vertical: label acima em texto 10px, uppercase, tracking largo, cor cinza claro (text-gray-400), peso medium. Abaixo, um select desabilitado com fundo branco, borda cinza, sombra sutil, texto cinza (text-gray-400), padding 10px horizontal e 6px vertical, mostrando "Todos" como valor padrao.

Os filtros sao distribuidos horizontalmente com gap de 12px e quebram para nova linha quando necessario (flex-wrap).

## Sizing Rules

Largura total do container pai. Altura definida pelo conteudo. Os selects individuais tem largura definida pelo conteudo do texto.

## Blueprint Section Type

N/A -- componente de infraestrutura legado. Em wireframes antigos, era adicionado manualmente no JSX das telas. Nos novos blueprints, a funcionalidade de filtros e fornecida pela propriedade `filters` de `BlueprintScreen`, renderizada como WireframeFilterBar.

## Usage Example

```tsx
import GlobalFilters from '@tools/wireframe-builder/components/GlobalFilters'

{/* Uso legado -- para novos wireframes, use WireframeFilterBar */}
<GlobalFilters
  filters={['periodo', 'segmento', 'vendedor']}
/>
```
