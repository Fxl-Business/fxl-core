---
title: CommentOverlay
badge: Ferramentas
description: Drawer lateral de comentarios com integracao Supabase e Clerk para threads por section
---

# CommentOverlay

Drawer lateral que desliza da direita para exibir uma thread de comentarios associada a um componente especifico da tela do wireframe. Integra-se com Supabase (armazenamento de comentarios) e Clerk (autenticacao de operadores). Exibe lista de comentarios com badge de role (Operador/Cliente), data formatada, status de resolucao e formulario para novos comentarios.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| clientSlug | string | Yes | - | Slug do cliente para isolamento dos comentarios |
| screenId | string | Yes | - | ID da tela do wireframe (para buscar comentarios da tela) |
| targetId | string | Yes | - | ID do componente-alvo (filtra comentarios para a section especifica) |
| targetLabel | string | No | "Comentarios" | Label exibida no cabecalho do drawer |
| authorId | string | Yes | - | ID do autor do comentario (Clerk userId ou UUID anonimo) |
| authorName | string | Yes | - | Nome exibido no comentario |
| authorRole | "operador" \| "cliente" | Yes | - | Role determina badge visual e permissoes |
| open | boolean | Yes | - | Controla a visibilidade do drawer |
| onClose | () => void | Yes | - | Callback disparado ao fechar o drawer |

## Visual Description

**Drawer:** Painel fixo no lado direito da viewport (fixed inset-y-0 right-0, z-index 50), largura de 320px (w-80), fundo branco, borda esquerda cinza, sombra forte (shadow-xl). Layout em coluna flexbox ocupando toda a altura da tela.

**Cabecalho:** Faixa superior com borda inferior cinza, padding 16px horizontal e 12px vertical. Exibe icone de balao de mensagem (MessageSquare, 16x16px, cinza) e label truncada em texto 14px, peso 600, cor cinza escuro. Botao X no canto direito para fechar.

**Lista de comentarios (area central scrollavel):** Flex-1 com overflow-y auto, padding 16px, espacamento 16px entre comentarios. Quando vazia, exibe "Nenhum comentario ainda." em texto cinza claro.

Cada comentario e um card com borda cinza, cantos arredondados, padding 16px. Cabecalho do card: nome do autor (texto 14px, peso medium, truncado) ao lado de badge de role. Badge "Operador": fundo azul claro (bg-blue-100), texto azul escuro (text-blue-800). Badge "Cliente": fundo ambar claro (bg-amber-100), texto ambar escuro (text-amber-800). Data formatada (dd/mm/aa hh:mm) a direita em texto cinza claro.

Corpo do comentario: texto 14px, cor cinza (text-gray-600), preservando whitespace e quebras de linha (whitespace-pre-wrap).

Comentarios resolvidos: borda cinza mais clara, fundo cinza (bg-gray-50), opacidade 50%, com badge "Resolvido" verde abaixo do texto.

**Area de input (rodape fixo):** Faixa inferior com borda superior cinza, padding 16px. Textarea de 3 linhas com placeholder "Adicionar comentario...", borda cinza, cantos arredondados, texto 14px. Abaixo, botao "Comentar" com icone Send, largura total, fundo navy (bg-fxl-navy), texto branco, padding 10px vertical. Suporta envio via Ctrl/Cmd+Enter. Botao desabilitado quando texto vazio ou durante envio (exibe "Enviando...").

## Dependencies

- **Supabase:** Armazena comentarios na tabela `comments`. Busca via `getCommentsByScreen`, insere via `addComment`.
- **Clerk:** Fornece `authorId` e `authorName` para operadores autenticados. Clientes anonimos usam UUID do localStorage.

## Sizing Rules

Largura fixa de 320px. Altura total da viewport. A lista de comentarios faz scroll vertical. A textarea e o botao de submit tem largura total do drawer.

## Blueprint Section Type

N/A -- componente de infraestrutura. Nao e declarado como section no blueprint.config.ts. E renderizado pelo SectionWrapper quando o usuario clica no icone de comentarios (CommentBadge) de qualquer section. O SectionWrapper gerencia o estado open/onClose e passa as props de autorizacao e targeting.

## Usage Example

```tsx
import CommentOverlay from '@tools/wireframe-builder/components/CommentOverlay'

<CommentOverlay
  clientSlug="empresa-abc"
  screenId="resultado-mensal"
  targetId="resultado-mensal:2"
  targetLabel="Grafico de Receita"
  authorId={user.id}
  authorName={user.name}
  authorRole="operador"
  open={isDrawerOpen}
  onClose={() => setDrawerOpen(false)}
/>
```
