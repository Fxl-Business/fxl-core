---
title: InputsScreen
badge: Ferramentas
description: Area de upload drag-and-drop basica com formatos aceitos (LEGACY -- substituido por UploadSection)
---

# InputsScreen

> **LEGACY** -- este componente foi substituido pelo [UploadSection](/ferramentas/blocos/upload-section) para novos wireframes. Permanece no codebase para compatibilidade com wireframes existentes. Novos blueprints devem usar UploadSection, que oferece feedback de sucesso/erro e historico de importacoes.

Area de upload simples com drag-and-drop. Exibe um campo de nome do arquivo, zona tracejada para arrastar arquivos, lista de formatos aceitos, instrucoes opcionais e botao de selecao de arquivo. Todos os elementos interativos sao desabilitados (comportamento de wireframe).

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| acceptedFormats | string[] | Yes | - | Lista de formatos aceitos exibidos abaixo da zona de upload (ex: ["XLS", "XLSX", "CSV"]) |
| instructions | string | No | - | Texto de instrucoes adicionais exibido abaixo dos formatos |
| fieldName | string | No | "arquivo" | Label do campo exibida acima da zona de upload |

## Visual Description

Card com fundo branco, borda cinza (border-gray-200), cantos arredondados, padding 24px e sombra sutil.

**Label do campo:** Texto 14px, peso 600, cor cinza escuro (text-gray-700), margem inferior de 12px. Exibe o valor de `fieldName`.

**Zona de upload:** Container centralizado com borda tracejada dupla cinza (border-2 border-dashed border-gray-300), fundo cinza claro (bg-gray-50), cantos arredondados, padding 48px vertical e 32px horizontal. Conteudo centralizado verticalmente:

1. Icone Upload cinza claro (32x32px, text-gray-300), margem inferior 12px
2. Texto "Arraste e solte ou selecione um arquivo" em 14px, peso medium, cinza. A parte "selecione um arquivo" aparece sublinhada e em cinza mais escuro
3. Texto "Formatos aceitos: XLS, XLSX, CSV" em 12px, cinza claro (text-gray-400), margem superior 6px
4. Texto de instrucoes (se fornecido) em 12px, cinza claro, centralizado, max-width 384px, margem superior 12px
5. Botao "Selecionar arquivo" desabilitado com fundo cinza (bg-gray-200), texto cinza (text-gray-500), 12px peso medium, padding 8px horizontal e 16px vertical, margem superior 16px

## Sizing Rules

Largura total do container pai. Altura definida pelo conteudo. A zona de upload ocupa toda a largura interna do card.

## Blueprint Section Type

N/A -- componente legado. Nao possui section type no discriminated union de Blueprint. Em wireframes antigos, era usado diretamente no JSX. Substituido por `UploadSectionConfig` com `type: 'upload-section'` nos novos blueprints.

## Usage Example

```tsx
import InputsScreen from '@tools/wireframe-builder/components/InputsScreen'

{/* Uso legado -- para novos wireframes, use UploadSection */}
<InputsScreen
  acceptedFormats={['XLS', 'XLSX', 'CSV']}
  fieldName="Extrato bancario"
  instructions="Faca o download do extrato no formato OFX ou CSV e importe aqui."
/>
```
