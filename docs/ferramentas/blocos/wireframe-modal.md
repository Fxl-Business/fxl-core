---
title: WireframeModal
badge: Ferramentas
description: Modal centralizado com overlay, area de conteudo scrollavel e footer opcional
---

# WireframeModal

Modal centralizado sobre overlay escuro com area de conteudo scrollavel e slot de footer opcional. Suporta tres tamanhos (md, lg, xl) e fecha via botao X, tecla Escape ou clique no overlay. Utilizado para exibir detalhes expandidos quando o usuario clica em linhas de tabelas (ClickableTable).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| title | string | Yes | - | Titulo exibido na barra superior do modal |
| open | boolean | Yes | - | Controla a visibilidade do modal |
| onClose | () => void | Yes | - | Callback disparado quando o modal deve fechar |
| children | React.ReactNode | Yes | - | Conteudo renderizado na area central scrollavel |
| footer | React.ReactNode | No | - | Conteudo renderizado no rodape fixo do modal |
| size | "md" \| "lg" \| "xl" | No | "lg" | Tamanho do modal (largura maxima) |

## Visual Description

**Overlay:** Cobertura fixa sobre toda a viewport (fixed inset-0, z-index 50) com fundo preto translucido (bg-black/40) e blur sutil (backdrop-blur 1px). Clique no overlay fecha o modal.

**Container do modal:** Centralizado vertical e horizontalmente com padding de 16px da borda da tela. Fundo branco, cantos arredondados (rounded-xl), sombra forte (shadow-2xl). Altura maxima de 88vh. Layout em coluna flexbox.

**Barra de titulo:** Faixa superior com borda inferior cinza, padding 24px horizontal e 16px vertical. Titulo em texto 14px, peso 600, cor cinza escuro (text-gray-800). Botao X no canto direito com icone 16x16px, cor cinza (text-gray-400), hover com fundo cinza claro.

**Area de conteudo:** Flex-1 com overflow-y auto (scroll quando necessario). Padding de 24px, espacamento vertical de 20px entre filhos.

**Footer (opcional):** Faixa inferior com fundo cinza claro (bg-gray-50), borda superior cinza, cantos arredondados inferiores. Padding 24px horizontal e 12px vertical. Layout flex com gap de 16px e flex-wrap.

## Conditional States

### size = "md"

Largura maxima de 576px (max-w-xl).

### size = "lg" (padrao)

Largura maxima de 672px (max-w-2xl).

### size = "xl"

Largura maxima de 896px (max-w-4xl).

### open = false

Modal nao e renderizado (retorna null). Nenhum overlay ou conteudo visivel.

## Sizing Rules

Largura: 100% ate o max-width definido pelo size. Altura maxima: 88vh. A area de conteudo faz scroll vertical quando o conteudo excede a altura disponivel. A barra de titulo e o footer sao fixos (flex-shrink 0).

## Blueprint Section Type

N/A -- componente de infraestrutura. Nao e declarado como section no blueprint.config.ts. E ativado automaticamente por interacoes com ClickableTable -- quando o usuario clica em uma linha, o WireframeViewer/SectionWrapper abre o modal com o conteudo de detalhe correspondente. O `modalTitleKey` em ClickableTableSection define qual campo da linha vira o titulo do modal.

## Usage Example

```tsx
import WireframeModal from '@tools/wireframe-builder/components/WireframeModal'

<WireframeModal
  title="Detalhes - 15/Jan/2026"
  open={isModalOpen}
  onClose={() => setModalOpen(false)}
  size="lg"
  footer={
    <div className="flex justify-between w-full">
      <span className="font-semibold">Total: R$ 45.230,00</span>
    </div>
  }
>
  <DataTable columns={detailColumns} title="Movimentacoes do dia" />
</WireframeModal>
```
