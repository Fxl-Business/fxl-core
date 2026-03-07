---
title: Cliente vs Produto
badge: Processo
description: Os dois tipos de projeto FXL — BI Personalizado (cliente) e Produto FXL (SaaS/sistema)
---

# Cliente vs Produto

A FXL opera dois tipos de projeto com o mesmo processo de 6 fases.
A diferenca principal esta na origem do escopo e no fluxo de aprovacao.

---

## BI Personalizado

**Quando usar:** projeto para um cliente especifico, com dados proprios e escopo sob demanda.

*Exemplos: BI Tatu do Bem, BI Mercadao, BI de qualquer empresa com operacao propria.*

### Modulos

| Modulo | Descricao |
|--------|-----------|
| Financeiro | Normalmente resolvido com software White Label (ex: Conta Azul). FXL raramente constroi dashboard financeiro customizado. |
| Comercial | Dashboard exclusivo. KPIs de vendas, funil, ticket medio, performance por vendedor, produto e regiao. |
| Operacional | Dashboard exclusivo. Alta variacao entre clientes — requer diagnostico mais profundo na Fase 1. |

### Fluxo por fase

| Fase | Especificidades |
|------|-----------------|
| 1 — Diagnostico | Reuniao com cliente. Formulario Comercial + Documento de Briefing. Cliente valida o briefing. |
| 2 — Wireframe | Blueprint gerado a partir do Briefing. **Cliente deve dar aprovacao formal escrita** antes do desenvolvimento. |
| 3 — Desenvolvimento | Segue o Blueprint aprovado pelo cliente. Dados reais ou amostra do cliente. |
| 4 — Auditoria | Checklist base + itens especificos dos KPIs do cliente e segmento. |
| 5 — Entrega | Sistema entregue com status "Em fase de checkagem assistida". Cliente tem 15 dias para validar. |
| 6 — Tutorial | Tutorial personalizado (video 10-15min + documento escrito) adaptado a maturidade analitica do cliente. |

---

## Produto FXL

**Quando usar:** escopo definido internamente pela FXL, produto que pode atender multiplos usuarios ou empresas.

### Subtipos

| Subtipo | Descricao | Exemplos |
|---------|-----------|----------|
| BI de Plataforma | Atrelado aos dados de um software de mercado | BI Conta Azul, BI Mobills, BI Otimiza |
| BI de Segmento | Agnostico de software, construido para um vertical de mercado | BI de Locacao (planilha generica) |
| Sistema | Produto com logica propria alem de visualizacao | Locacao de Imoveis |
| SaaS | Estagio de maturidade de qualquer produto acima | Qualquer produto multi-tenant com assinatura |

### Fluxo por fase

| Fase | Especificidades |
|------|-----------------|
| 1 — Definicao | Sessao interna. Equipe define objetivo, publico-alvo, fonte de dados e MVP. Decisoes de produto devem ser resolvidas antes de avancar. |
| 2 — Wireframe | Fluxo identico ao BI Personalizado. Diferenca: **aprovacao e interna** (equipe FXL decide). |
| 3 — Desenvolvimento | Mesmo fluxo. Atencao: testar com multiplos perfis, sem dados hardcoded, UI autoexplicativa. Para SaaS: isolamento de dados entre tenants. |
| 4 — Auditoria | Checklist base + itens de Produto: multiplos perfis sem cruzamento, sem hardcode, UI autoexplicativa, isolamento de tenants (se SaaS). |
| 5 — Lancamento | Sem periodo de checkagem com cliente. Produto disponibilizado apos auditoria. Foco: onboarding, documentacao e versao. |
| 6 — Documentacao | Documentacao generica para qualquer usuario. Autoexplicativa, sem onboarding personalizado. |

---

## Comparativo rapido

| Aspecto | BI Personalizado | Produto FXL |
|---------|------------------|-------------|
| Origem do escopo | Cliente externo | Equipe FXL |
| Aprovacao do wireframe | Cliente (formal, escrita) | Equipe FXL (interna) |
| Dados | Do cliente especifico | Multiplos perfis/tenants |
| Entrega | Checkagem assistida (15 dias) | Lancamento direto |
| Tutorial | Personalizado por cliente | Documentacao generica |
| Evolucao | Sob demanda do cliente | Roadmap interno |
