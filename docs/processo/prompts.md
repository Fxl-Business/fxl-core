---
title: Prompts Operacionais
badge: Processo
description: Prompts reutilizaveis para operar o processo FXL via Claude Code
---

# Prompts Operacionais

Prompts padronizados para operar o processo FXL via Claude Code.
Use esses prompts como ponto de partida — o Claude Code le o contexto do projeto
automaticamente via `CLAUDE.md` e Skills.

---

## Iniciar novo projeto de cliente

Quando um novo cliente entra no processo. Cria a estrutura de pastas e inicia a Fase 1.

{% prompt label="Iniciar novo projeto de cliente" %}
Vamos iniciar o projeto para o cliente [NOME].

Antes de comecar:
- Leia CLAUDE.md
- Crie a pasta clients/[slug]/ com a estrutura padrao (CLAUDE.md, docs/, wireframe/)

O cliente e do segmento [SEGMENTO].
Os dados vem de [SISTEMA/FORMATO].

Estamos iniciando a Fase 1 — Diagnostico.
Siga o processo FXL descrito em docs/processo/fases/fase1.md.
{% /prompt %}

---

## Executar sprint de desenvolvimento com GSD

Para sprints de codigo na Fase 3. O GSD organiza o trabalho em fases e planos.

{% prompt label="Sprint de desenvolvimento com GSD" %}
Vamos executar um sprint de desenvolvimento para o projeto [NOME].

Antes de comecar:
- Leia CLAUDE.md do projeto
- Leia o Blueprint aprovado em clients/[slug]/docs/blueprint.md
- Consulte os padroes em docs/ferramentas/premissas-gerais.md e docs/ferramentas/seguranca.md

Escopo deste sprint:
[LISTE AS TELAS/FUNCIONALIDADES]

Use /gsd:plan-phase para planejar o sprint.
Depois use /gsd:execute-phase para executar.

Criterio de aceite:
[LISTE OS CRITERIOS]
{% /prompt %}

---

## Resolver bug ou hotfix

Para correcoes pontuais fora do fluxo de sprint.

{% prompt label="Resolver bug" %}
Ha um bug no projeto [NOME].

Contexto:
- Comportamento esperado: [DESCREVA]
- Comportamento atual: [DESCREVA]
- Passos para reproduzir: [LISTE]

Antes de corrigir:
- Leia CLAUDE.md do projeto
- Identifique a causa raiz antes de propor solucao

Nao altere escopo alem do bug reportado.
Documente a correcao no changelog do projeto.
{% /prompt %}

---

## Evoluir o processo FXL

Para mudancas no proprio processo (docs, fases, regras).

{% prompt label="Evoluir processo FXL" %}
Vamos evoluir o processo FXL.

Antes de comecar:
- Leia CLAUDE.md
- Leia docs/processo/visao-geral.md

Objetivo: [DESCREVA A MUDANCA — atualizar fase, ajustar fluxo, etc.]

Verifique impacto em cascata nos docs de processo e fases.
Use /gsd:plan-phase se a mudanca for estrutural.
{% /prompt %}

---

## Gerar wireframe de cliente

Para a Fase 2, quando o Blueprint ja esta pronto e precisa virar wireframe navegavel.

{% prompt label="Gerar wireframe de cliente" %}
Vamos gerar o wireframe para o cliente [NOME].

Antes de comecar:
- Leia CLAUDE.md
- Leia clients/[slug]/CLAUDE.md
- Leia o Blueprint em clients/[slug]/docs/blueprint.md
- Consulte os Blocos Disponiveis em docs/ferramentas/blocos/index.md

Gere os arquivos .tsx em clients/[slug]/wireframe/screens/
usando componentes de tools/wireframe-builder/components/.

Siga o skill do Wireframe Builder em tools/wireframe-builder/SKILL.md.
{% /prompt %}

---

## Estrutura obrigatoria de prompts

Todo prompt para o Claude Code deve conter:

1. **Contexto** — quais arquivos ler antes de agir
2. **Objetivo** — o que sera feito nesta sessao
3. **Escopo** — limites claros do que alterar
4. **Verificacao** — como confirmar que esta correto

Conteudo deve ser completo (nunca "adicione X aqui").
Mensagem de commit deve seguir a convencao: `docs:`, `[slug]:`, `tool():`, `app:`, `infra:`.
