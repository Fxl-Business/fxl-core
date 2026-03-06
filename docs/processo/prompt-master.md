---
title: Prompt Master
badge: Processo
description: Prompt padrao de abertura para Claude Projects de cliente
---

# Prompt Master — Claude Project FXL

> Este documento vive em `docs/processo/`.
> É o prompt padrão de abertura para qualquer conversa em um Claude Project de cliente FXL.
> Cole este prompt no início de cada nova conversa, adaptando os campos entre colchetes.

---

## Como usar

1. Abra o Claude Project do cliente
2. Cole este prompt como primeira mensagem da conversa (adapte os campos)
3. Aguarde o Claude confirmar o contexto antes de descrever a tarefa
4. Descreva a tarefa — Claude irá discutir, evoluir e refinar com você
5. Ao finalizar, peça: "Gere o prompt para o Claude Code"
6. Cole o prompt gerado diretamente no Claude Code do repositório `fxl`

---

## Prompt Master (copie e adapte)

---

Olá. Vamos trabalhar no projeto **[NOME DO CLIENTE / PRODUTO]**.

Antes de começar qualquer tarefa, leia todos os arquivos disponíveis no knowledge deste Project.

**Slug do cliente:** `[client-slug]`
**Repositório alvo:** `fxl`
**Subpasta do cliente:** `clients/[client-slug]/`

---

### Contexto de processo

Siga estritamente o processo FXL:

1. **Prompt Master** → início de conversa (este prompt)
2. **Discussão e evolução** → você e eu refinamos a solicitação juntos
3. **Geração do prompt para Claude Code** → ao final, você gera um único arquivo `.md`
   com o prompt completo e estruturado para eu colar no Claude Code do repositório

⚠️ O Claude Code só executa o que estiver no prompt gerado ao final.
Nada é alterado no repositório durante esta conversa — apenas o prompt final faz isso.

---

### Regras obrigatórias

- Usar nomenclatura FXL: Dashboard, KPI, Briefing, Blueprint, Auditoria, Inputs
- Nunca inventar KPIs ou dados — trabalhar apenas com o que eu fornecer
- Nunca sugerir alterações fora de `clients/[client-slug]/`
- Confirmar Blueprint antes de qualquer geração de wireframe
- Ao gerar wireframe, usar apenas componentes de `skills/wireframe-builder/components/`

---

### Estrutura do prompt final (Claude Code)

Ao final da conversa, gere obrigatoriamente um arquivo `.md` com:

1. **Cabeçalho:** cliente, slug, objetivo da tarefa
2. **Arquivos a criar ou atualizar** — listados com caminho completo e conteúdo final
3. **Arquivos a NÃO tocar** — listados explicitamente
4. **Mensagem de commit:** `[client-slug]: [o que mudou]`

---

### Meu objetivo nesta conversa

[DESCREVA AQUI A TAREFA: gerar Blueprint, criar tela de wireframe, atualizar briefing, etc.]

---
