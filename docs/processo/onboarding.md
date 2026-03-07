---
title: Onboarding
badge: Processo
description: Guia passo a passo para operar o processo FXL
---

# Onboarding — Guia Rapido do Processo FXL

Este guia resume o fluxo operacional da FXL. Siga os passos abaixo
para qualquer novo projeto ou quando precisar relembrar o processo.

---

## 1. Entenda os tipos de projeto

Antes de tudo, identifique se o projeto e [Cliente (BI Personalizado)
ou Produto FXL](/processo/cliente-vs-produto). Isso define o fluxo
de aprovacao e o escopo de cada fase.

## 2. Configure o ambiente

- Repositorio do projeto no GitHub
- `CLAUDE.md` do projeto usando o [template](/ferramentas/claude-md-template)
- Pasta do cliente em `clients/[slug]/` com CLAUDE.md, docs/ e wireframe/
- Claude Code aberto na raiz do repositorio `fxl`

## 3. Fase 1 — Diagnostico

Colete todas as informacoes do projeto. Para cliente: reuniao, Formulario Comercial
e Documento de Briefing. Para produto: sessao interna de definicao.
Nao avance sem briefing validado. [Detalhes da Fase 1](/processo/fases/fase1)

## 4. Fase 2 — Wireframe

Gere o Blueprint tela a tela a partir do briefing. Use o Claude Code com o
[Wireframe Builder](/ferramentas/wireframe-builder) para gerar os `.tsx`.
Publique via Vercel e obtenha aprovacao formal. [Detalhes da Fase 2](/processo/fases/fase2)

## 5. Fase 3 — Desenvolvimento

Execute sprints seguindo o Blueprint aprovado. Leia as
[Premissas Gerais](/ferramentas/premissas-gerais) e o
[Checklist de Seguranca](/ferramentas/seguranca) antes de comecar.
Use o [Template de Sprint](/ferramentas/master-prompt). [Detalhes da Fase 3](/processo/fases/fase3)

## 6. Fase 4 — Auditoria

Auditor diferente do desenvolvedor aplica o checklist base + itens especificos.
Zero itens bloqueantes para avancar. [Detalhes da Fase 4](/processo/fases/fase4)

## 7. Fase 5 — Entrega

Para cliente: entrega com checkagem assistida de 15 dias.
Para produto: lancamento direto apos auditoria. [Detalhes da Fase 5](/processo/fases/fase5)

## 8. Fase 6 — Tutorial

Para cliente: video tutorial personalizado + documento escrito.
Para produto: documentacao generica autoexplicativa. [Detalhes da Fase 6](/processo/fases/fase6)

---

{% callout type="info" %}
Sempre rode `npx tsc --noEmit` antes de fazer commit.
Zero erros TypeScript e condicao de aceite em qualquer alteracao de codigo.
{% /callout %}

---

## Referencia rapida

| Precisa de... | Va para |
|---|---|
| Entender o processo completo | [Visao Geral](/processo/visao-geral) |
| Prompts prontos | [Prompts](/processo/prompts) |
| Stack e premissas tecnicas | [Ferramentas](/ferramentas/index) |
| KPIs de referencia | [Biblioteca de KPIs](/referencias/biblioteca-kpis) |
| Blocos de wireframe | [Blocos Disponiveis](/referencias/blocos-disponiveis) |
