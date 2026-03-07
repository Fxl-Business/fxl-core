---
title: Prompts
badge: Processo
description: Prompts reutilizaveis organizados por contexto — Claude Code, Claude Project, melhorias de processo
---

# Prompts

Prompts padronizados para operar o processo FXL.
O fluxo principal e via Claude Code com GSD. Claude Project e secundario, para discussoes exploratorias.

---

## Prompts para Claude Code (com GSD)

Com GSD, o operador trabalha diretamente no Claude Code. Nao e necessario
gerar prompts em outro lugar e colar — o Claude Code le o contexto do projeto
e executa as tarefas com comandos GSD.

### Iniciar novo projeto

{% prompt label="Iniciar novo projeto de cliente" %}
Vamos iniciar o projeto para o cliente [NOME].

Antes de comecar:
- Leia CLAUDE.md
- Leia clients/[slug]/CLAUDE.md
- Leia clients/[slug]/docs/briefing.md

Objetivo: [DESCREVA A TAREFA — gerar Blueprint, criar wireframe, iniciar sprint, etc.]

Siga o processo FXL. Estamos na Fase [N].
{% /prompt %}

### Evoluir o processo

{% prompt label="Evoluir processo FXL" %}
Vamos evoluir o processo FXL.

Antes de comecar:
- Leia CLAUDE.md
- Leia docs/processo/visao-geral.md

Objetivo: [DESCREVA A MUDANCA — atualizar fase, adicionar KPI, ajustar fluxo, etc.]

Verifique impacto em cascata nos docs de processo e fases.
{% /prompt %}

### Executar sprint de desenvolvimento

{% prompt label="Sprint de desenvolvimento" %}
Vamos executar o sprint [N] do projeto [NOME].

Antes de comecar:
- Leia CLAUDE.md do projeto
- Leia o Blueprint aprovado
- Leia docs de referencia tecnica em /ferramentas/

Escopo deste sprint:
[LISTE AS TELAS/FUNCIONALIDADES]

Criterio de aceite:
[LISTE OS CRITERIOS]
{% /prompt %}

### Resolver bug

{% prompt label="Resolver bug" %}
Ha um bug no projeto [NOME].

Contexto:
- [DESCREVA O COMPORTAMENTO ESPERADO]
- [DESCREVA O COMPORTAMENTO ATUAL]
- [PASSOS PARA REPRODUZIR]

Antes de corrigir:
- Leia CLAUDE.md do projeto
- Identifique a causa raiz antes de propor solucao

Nao altere escopo alem do bug reportado.
{% /prompt %}

---

## Prompts para Claude Project

{% callout type="info" %}
O fluxo principal agora e via Claude Code. Use Claude Project apenas para
discussoes exploratorias longas onde voce precisa iterar sobre ideias antes de executar.
{% /callout %}

### Abertura de conversa — Processo FXL

{% prompt label="Prompt de abertura — Project FXL" %}
Ola. Vamos trabalhar na evolucao do processo FXL.

Antes de comecar, leia os arquivos de contexto do repositorio:
- CLAUDE.md
- docs/processo/visao-geral.md

Os arquivos em /docs/ sao a fonte da verdade operacional.
Eles so devem ser alterados quando o objetivo for atualizar o processo.

Meu objetivo nesta conversa e: [DESCREVA AQUI]

Ao final, quero um plano claro do que fazer no Claude Code.
{% /prompt %}

### Abertura de conversa — Projeto de cliente

{% prompt label="Prompt de abertura — Project de cliente" %}
Ola. Vamos trabalhar no projeto **[NOME DO CLIENTE]**.

Leia todos os arquivos de knowledge deste Project.

**Slug:** [client-slug]
**Repositorio:** fxl
**Subpasta:** clients/[client-slug]/

Siga o processo FXL. Estamos na Fase [N].

Meu objetivo nesta conversa e: [DESCREVA AQUI]
{% /prompt %}

### Regras de conducao no Project

- Manter bloco de **Estado da Conversa** ao final de cada resposta (decisoes, premissas, pendencias)
- Nao avancar sem confirmar decisoes estruturais
- Referenciar decisoes anteriores ao retomar pontos
- Sinalizar explicitamente mudancas de direcao
- O output final e sempre um plano ou prompt para execucao no Claude Code

---

## Prompts para melhorias de processo

### Propor mudanca no processo

{% prompt label="Propor mudanca no processo" %}
Quero propor uma mudanca no processo FXL.

Mudanca: [DESCREVA]

Antes de implementar, analise:
1. Quais fases sao afetadas?
2. Quais docs precisam ser atualizados?
3. Ha impacto em cascata em outros documentos?
4. A mudanca simplifica ou complica o processo?

Apresente a proposta antes de executar.
{% /prompt %}

---

## Prompts para resolver bugs

### Bug em sistema de cliente

{% prompt label="Bug em sistema de cliente" %}
Ha um bug no sistema do cliente [NOME].

**Slug:** [client-slug]
**Ambiente:** [URL ou local do bug]

Comportamento esperado: [DESCREVA]
Comportamento atual: [DESCREVA]
Passos para reproduzir: [LISTE]

Antes de corrigir, leia:
- CLAUDE.md do projeto
- clients/[client-slug]/docs/changelog.md

Corrija o bug sem alterar escopo. Documente a correcao no changelog.
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
