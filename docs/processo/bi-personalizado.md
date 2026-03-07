---
title: POP — BI Personalizado
badge: Processo
description: Referencia de execucao detalhada para projetos de BI Personalizado
---

# POP — BI Personalizado

> Este documento vive em `docs/processo/`.
> É a referência de execução detalhada para projetos de BI Personalizado.
> A visão superior do processo está em `docs/processo/master/POP_MASTER.md`.

---

## Quando usar este POP

- É para um cliente específico com dados únicos
- Não será reutilizado diretamente para outros clientes
- Parte de uma reunião de diagnóstico com o cliente

*Exemplos: BI Tatu do Bem, BI Mercadão, BI [qualquer empresa com operação própria]*

> ⚠️ Se for um produto FXL com vida própria, usar **POP_PRODUTO.md**.

| Módulo | Descrição |
|---|---|
| Financeiro | Normalmente resolvido com software White Label (ex: Conta Azul). FXL raramente constrói dashboard financeiro customizado. |
| Comercial | Dashboard exclusivo. KPIs de vendas, funil, ticket médio, performance por vendedor, produto e região. |
| Operacional | Dashboard exclusivo. Alta variação entre clientes — requer diagnóstico mais profundo na Fase 1. |

---

## Fase 1 — Diagnóstico Estratégico

O diagnóstico parte de uma reunião presencial ou remota com o cliente. O operador
preenche o Briefing com dados do negócio, sistemas utilizados e KPIs declarados.
Todo o contexto vem do cliente — não há conhecimento prévio da FXL sobre aquele
negócio específico.

**Critério de Avanço:** Operador valida o Documento de Briefing.
Nenhuma fase subsequente começa sem briefing validado.

---

## Fase 2 — Wireframe Estratégico

O Blueprint é gerado diretamente no Claude Project do cliente, a partir do Documento
de Briefing. O Claude Code gera os arquivos `.tsx` do wireframe no repositório
`fxl`, usando o módulo oficial de componentes React em
`tools/wireframe-builder/components/`. O wireframe é publicado via Vercel.

O diferencial do BI Personalizado: o cliente precisa dar **aprovação formal escrita**
antes do desenvolvimento iniciar — sem essa aprovação, a Fase 3 não começa.

**Critério de Avanço:** Cliente visualiza o wireframe publicado e dá aprovação formal escrita.

---

## Fase 3 — Desenvolvimento

O desenvolvimento segue o Blueprint aprovado pelo cliente.
Caminho padrão: Claude Code.

**Critério de Avanço:** Sistema funcional com todas as telas do Blueprint implementadas.
Checklist de segurança aprovado. Pronto para auditoria.

---

## Fase 4 — Auditoria e Validação

A auditoria usa o checklist base + itens específicos dos KPIs do cliente e do segmento.
O checklist personalizado é gerado pelo Claude a partir do briefing do projeto.

**Critério de Avanço:** Zero itens bloqueantes.

---

## Fase 5 — Entrega + Validação Assistida

O sistema é entregue com status "Em fase de checkagem assistida".
O cliente tem 15 dias para validar, testar e solicitar ajustes dentro do escopo contratado.

**Critério de Avanço:** Cliente valida formalmente OU período de 15 dias encerrado sem pendências bloqueantes.

---

## Fase 6 — Tutorial e Mentoria

Tutorial personalizado com base no briefing e na maturidade analítica declarada pelo cliente.
Inclui vídeo tutorial de 10–15 minutos e documento de orientação escrita.

**Critério de Avanço:** Vídeo tutorial gravado e enviado. Documento de orientação entregue.
