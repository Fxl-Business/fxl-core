---
title: UploadSection
badge: Ferramentas
description: Area de upload drag-and-drop com feedback de sucesso/erro e historico de importacoes
---

# UploadSection

Area de upload completa com zona de drag-and-drop, badges de formatos aceitos, mensagens de feedback (sucesso e erro) e tabela de historico de importacoes anteriores. Substitui o componente legado InputsScreen com funcionalidades adicionais de validacao e rastreamento.

[Ver na galeria](/ferramentas/wireframe-builder/galeria)

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | string | Yes | - | Titulo exibido acima da zona de upload |
| acceptedFormats | string[] | No | ["XLS", "XLSX", "CSV"] | Lista de formatos aceitos exibidos na zona de upload |
| successMessage | string | No | - | Mensagem de sucesso exibida apos upload valido |
| errorMessages | string[] | No | - | Lista de erros encontrados no arquivo enviado |
| history | HistoryEntry[] | No | - | Historico de importacoes anteriores |

### HistoryEntry Type

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Identificador unico da importacao |
| date | string | Yes | Data da importacao (formato livre, ex: "15/01/2026") |
| type | string | Yes | Tipo do arquivo importado (ex: "Extrato", "DRE") |
| period | string | Yes | Periodo coberto pela importacao (ex: "Jan/2026") |
| records | number | Yes | Quantidade de registros importados |
| status | "success" \| "warning" \| "error" | Yes | Status da importacao |

## Visual Description

Card com fundo branco, borda cinza (border-gray-200), cantos arredondados, padding 20px e sombra sutil.

**Label:** Texto 14px, peso 600, cor cinza escuro (text-gray-700), margem inferior 12px.

**Zona de upload:** Container com borda tracejada dupla cinza (border-2 border-dashed border-gray-300), fundo cinza claro (bg-gray-50), cantos arredondados, padding 40px vertical e 32px horizontal, cursor default. Conteudo centralizado:

1. Icone Upload cinza claro (32x32px), margem inferior 12px
2. Texto "Arraste o arquivo aqui ou clique para selecionar" em 14px, peso medium. "clique para selecionar" sublinhado em cinza mais escuro
3. Texto "Formatos aceitos: XLS, XLSX, CSV" em 12px, cinza claro, margem superior 6px

**Feedback de sucesso (condicional):** Box com fundo verde claro (bg-green-50), borda verde (border-green-200), cantos arredondados, margem superior 12px. Layout horizontal: icone CheckCircle verde (16x16px), texto da mensagem em 12px verde escuro (text-green-700), botao "Confirmar Import" a direita em fundo verde escuro com texto branco.

**Feedback de erro (condicional):** Box com fundo vermelho claro (bg-red-50), borda vermelha (border-red-200), cantos arredondados, margem superior 12px. Cabecalho com icone XCircle vermelho e contagem "N erro(s) encontrado(s):" em 12px vermelho peso 600. Lista de erros abaixo com bullet points em 12px vermelho.

**Historico de importacoes (condicional):** Margem superior 20px. Label "HISTORICO DE IMPORTACOES" em 10px, uppercase, tracking largo, cinza claro. Tabela com borda cinza e cantos arredondados:
- Cabecalho (bg-gray-50): colunas Data, Tipo, Periodo, Registros, Status, Acao em 12px cinza peso medium
- Linhas com borda superior sutil. Registros alinhados a direita com tabular-nums
- Status exibido como badge colorido: sucesso (verde), com alertas (amarelo), com erros (vermelho)
- Botao "Ver detalhes" desabilitado na coluna Acao

## Conditional States

### Sem feedback (padrao)

Apenas a zona de upload e exibida. Nenhuma mensagem de sucesso ou erro.

### Com successMessage

Box verde aparece abaixo da zona de upload com a mensagem e botao de confirmacao.

### Com errorMessages

Box vermelha aparece abaixo da zona de upload com lista de erros numerada.

### Com history

Tabela de historico aparece abaixo do feedback (ou da zona de upload se sem feedback).

## Sizing Rules

Largura total do container pai. Altura definida pelo conteudo. A tabela de historico tem overflow-x auto para scroll horizontal em telas estreitas.

## Blueprint Section Type

`upload-section` -- declarado no blueprint.config.ts como `UploadSectionConfig`:

```typescript
type UploadSectionConfig = {
  type: 'upload-section'
  label: string
  acceptedFormats?: string[]
  successMessage?: string
  errorMessages?: string[]
  history?: HistoryEntry[]
}
```

## Usage Example

```typescript
// blueprint.config.ts
{
  type: 'upload-section',
  label: 'Importar Extrato Bancario',
  acceptedFormats: ['XLS', 'XLSX', 'CSV', 'OFX'],
  successMessage: '42 registros importados com sucesso para Jan/2026.',
  history: [
    {
      id: '1',
      date: '10/01/2026',
      type: 'Extrato',
      period: 'Dez/2025',
      records: 38,
      status: 'success',
    },
    {
      id: '2',
      date: '05/01/2026',
      type: 'Extrato',
      period: 'Dez/2025',
      records: 0,
      status: 'error',
    },
  ],
}
```
