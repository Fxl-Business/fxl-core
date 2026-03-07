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

## 2. Conheca a estrutura do processo

O processo FXL tem 6 fases sequenciais. Cada fase tem criterio de
avanco que deve ser cumprido antes de iniciar a proxima.

| Fase | Nome | Resumo |
|------|------|--------|
| 1 | [Diagnostico](/processo/fases/fase1) | Briefing e definicao de escopo |
| 2 | [Wireframe](/processo/fases/fase2) | Blueprint tela a tela e wireframe navegavel |
| 3 | [Desenvolvimento](/processo/fases/fase3) | Sprints de codigo com GSD |
| 4 | [Auditoria](/processo/fases/fase4) | Revisao de dados, seguranca e aderencia |
| 5 | [Entrega](/processo/fases/fase5) | Handoff ou lancamento |
| 6 | [Tutorial](/processo/fases/fase6) | Material de adocao |

Para a visao completa, leia a [Visao Geral do Processo](/processo/visao-geral).

## 3. Consulte os padroes tecnicos

Antes de iniciar qualquer desenvolvimento, leia os padroes que todo projeto FXL deve seguir:

- [Premissas Gerais](/ferramentas/premissas-gerais) — stack padrao, estrutura de pastas, convencoes
- [Seguranca](/ferramentas/seguranca) — checklist anti AI-slop, rate-limit, validacao
- [Testes](/ferramentas/testes) — o que testar, quando testar, criterios
- [Tech Radar](/ferramentas/tech-radar) — tecnologias aprovadas, em avaliacao e descartadas

Esses padroes vivem na secao [Padroes](/padroes/index) da plataforma.

## 4. Configure o ambiente de trabalho

- Repositorio do projeto no GitHub
- `CLAUDE.md` configurado na raiz do projeto (define identidade, stack e regras do projeto)
- Pasta do cliente em `clients/[slug]/` com CLAUDE.md, docs/ e wireframe/
- Claude Code aberto na raiz do repositorio `fxl`

O Claude Code carrega o `CLAUDE.md` automaticamente ao abrir o repositorio.
Nao e necessario copiar ou colar prompts — o contexto e injetado diretamente.

## 5. Use os comandos GSD para desenvolvimento

O framework GSD (Get Shit Done) organiza o trabalho em fases e planos:

- `/gsd:plan-phase` — planejar uma fase de trabalho (define pesquisa, planos e tarefas)
- `/gsd:execute-phase` — executar os planos da fase (cria commits atomicos por tarefa)

Para prompts prontos de uso comum, veja [Prompts Operacionais](/processo/prompts).

## 6. Fase 1 — Diagnostico

Colete todas as informacoes do projeto. Para cliente: reuniao, Formulario Comercial
e Documento de Briefing. Para produto: sessao interna de definicao.
Nao avance sem briefing validado. [Detalhes da Fase 1](/processo/fases/fase1)

## 7. Fase 2 — Wireframe

Gere o Blueprint tela a tela a partir do briefing. Use o Claude Code com o
[Wireframe Builder](/ferramentas/wireframe-builder) para gerar os `.tsx`.
Publique via Vercel e obtenha aprovacao formal. [Detalhes da Fase 2](/processo/fases/fase2)

## 8. Fase 3 — Desenvolvimento

Execute sprints de codigo seguindo o Blueprint aprovado. Use comandos GSD
para planejar e executar cada sprint. Consulte os padroes tecnicos antes de
comecar. [Detalhes da Fase 3](/processo/fases/fase3)

## 9. Fase 4 — Auditoria

Auditor diferente do desenvolvedor aplica o checklist base + itens especificos.
Zero itens bloqueantes para avancar. [Detalhes da Fase 4](/processo/fases/fase4)

## 10. Fase 5 — Entrega

Para cliente: entrega com checkagem assistida de 15 dias.
Para produto: lancamento direto apos auditoria. [Detalhes da Fase 5](/processo/fases/fase5)

## 11. Fase 6 — Tutorial

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
| Prompts prontos | [Prompts Operacionais](/processo/prompts) |
| Padroes tecnicos (stack, seguranca, testes) | [Padroes](/padroes/index) |
| Blocos de wireframe | [Blocos Disponiveis](/referencias/blocos-disponiveis) |
| Wireframe Builder | [Wireframe Builder](/ferramentas/wireframe-builder) |
