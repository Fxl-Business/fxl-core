---
title: POP Master — Roteamento do Processo FXL
badge: Processo
description: Define qual POP aplicar e garante mudancas em cascata
---

# POP MASTER — Roteamento do Processo FXL

## Objetivo

Definir qual POP deve ser aplicado em cada novo projeto e garantir que toda mudança
estrutural no processo seja refletida em cascata nos documentos dependentes.

---

## Tipos oficiais de projeto

### BI Personalizado

Usar quando:
- O projeto é para um cliente específico
- Os dados são próprios daquele cliente
- A aprovação formal do wireframe e da entrega depende do cliente

Referência de execução: `docs/processo/POP_BI_PERSONALIZADO.md`

### Produto FXL

Usar quando:
- O escopo é definido internamente pela FXL
- O produto pode atender múltiplos usuários ou empresas
- A aprovação das fases é interna

Referência de execução: `docs/processo/POP_PRODUTO.md`

---

## Regra de roteamento

1. Classificar o projeto como BI Personalizado ou Produto FXL
2. Validar a fase atual e o critério de avanço da fase anterior
3. Confirmar quais documentos em `docs/` e quais rotas em `src/pages/` precisam ser atualizados
4. Só então executar a alteração solicitada

---

## Regra de evolução do processo

Toda alteração estrutural deve verificar:
- `docs/processo/fases/` (fases resumidas neste repositório)
- `docs/processo/` (POPs detalhados de execução)
- `docs/referencias/` e `docs/suporte/` (se a mudança afeta wireframe ou KPIs)

---

## Critério de conclusão

O roteamento está correto quando:
- O tipo de projeto foi classificado sem ambiguidade
- A próxima fase está clara
- Os pares MD ↔ rota React afetados foram identificados
- Nenhuma mudança estrutural ficou sem revisão em cascata
