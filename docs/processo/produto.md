---
title: POP — Produto FXL
badge: Processo
description: Referencia de execucao para projetos de Produto FXL
---

# POP — Produto FXL

> Este documento vive em `docs/processo/`.
> É a referência de execução detalhada para projetos de Produto FXL.
> A visão superior do processo está em `docs/processo/master/POP_MASTER.md`.

---

## Quando usar este POP

- É um produto com vida própria, não atrelado a um cliente específico
- Pode atender múltiplos usuários ou empresas
- A definição do escopo parte da FXL

| Subtipo | Descrição | Exemplos |
|---|---|---|
| BI de Plataforma | Atrelado aos dados de um software específico de mercado | BI Conta Azul, BI Mobills, BI Otimiza |
| BI de Segmento | Agnóstico de software, construído para um vertical de mercado | BI de Locação (planilha genérica) |
| Sistema | Produto com lógica própria além de visualização | Locação de Imóveis |
| SaaS | Estágio de maturidade de qualquer produto acima | Qualquer produto multi-tenant com assinatura |

---

## Fase 1 — Definição do Produto

A definição parte do conhecimento interno da FXL — não há reunião com cliente externo.
A equipe mapeia o produto, público-alvo, fonte de dados e módulos do MVP.
Todas as decisões de produto em aberto devem ser sinalizadas como [DECISÃO DE PRODUTO]
e resolvidas antes de avançar.

**Critério de Avanço:** Todas as [DECISÃO DE PRODUTO] resolvidas.
Documento de Definição validado internamente.

---

## Fase 2 — Wireframe Estratégico

Fluxo idêntico ao BI Personalizado. Diferença central: a aprovação é **interna**.
A equipe FXL decide quando o wireframe está aprovado — não depende de cliente externo.

**Critério de Avanço:** Aprovação interna da equipe FXL.

---

## Fase 3 — Desenvolvimento

Mesmo fluxo do BI Personalizado. Atenção especial:
- Testar com dados de múltiplos perfis fictícios
- Garantir que não há dados hardcoded
- UI autoexplicativa (sem onboarding personalizado)
- Para SaaS: considerar isolamento de dados entre tenants desde o início

**Critério de Avanço:** Sistema funcional. Testado com múltiplos perfis de dados. Pronto para auditoria.

---

## Fase 4 — Auditoria e Validação

Checklist base + itens específicos de Produto:
- Sistema funciona com dados de múltiplos perfis sem cruzamento
- Nenhum dado hardcoded
- UI autoexplicativa
- Para SaaS: isolamento de dados entre tenants verificado

**Critério de Avanço:** Zero itens bloqueantes. Validação interna pela equipe FXL.

---

## Fase 5 — Lançamento e Disponibilização

Não há período de checkagem com cliente. O produto é disponibilizado diretamente
após auditoria aprovada. Foco: onboarding, documentação e registro de versão.

**Critério de Avanço:** Produto disponível para uso. Documentação publicada. Versão registrada.
