---
title: Fluxo de Trabalho
badge: Operacao
description: Como operar o monorepo FXL com Claude Code e Claude Projects.
---

# Fluxo de Trabalho — FXL Monorepo

## Estrutura

O ecossistema FXL vive em um unico repositorio:

```
fxl/
├── CLAUDE.md           ← regras operacionais (lido pelo Claude Code)
├── docs/               ← documentacao (renderizada via Markdoc)
├── clients/            ← knowledge e wireframes por cliente
├── skills/             ← ferramentas AI-first
└── src/                ← app shell React
```

## Como abrir o Claude Code

Sempre abrir o Claude Code a partir da raiz `fxl/`.

```bash
cd ~/projetos/fxl
claude
```

O Claude Code carrega o `CLAUDE.md` da raiz automaticamente.

## Fluxo padrao

### Sessao de evolucao do processo

1. Abrir o Claude Project "FXL — Processo Padrao"
2. Discutir e gerar o prompt estruturado
3. Abrir Claude Code a partir de `fxl/`
4. Colar o prompt — ele altera `docs/` e/ou `src/`
5. Commit: `docs: [o que mudou]`
6. Push

### Sessao de cliente

1. Abrir o Claude Project do cliente
2. Discutir e gerar o prompt estruturado
3. Abrir Claude Code a partir de `fxl/`
4. Colar o prompt — ele altera apenas `clients/[client-slug]/`
5. Commit: `[client-slug]: [o que mudou]`
6. Push

### Sessao de skill

1. Abrir o Claude Project relevante
2. Discutir e gerar o prompt
3. Colar no Claude Code
4. Commit: `skill(wireframe-builder): [o que mudou]`
5. Push

## Convencao de commit

- `docs: [o que mudou]` — alteracoes em docs/
- `[client-slug]: [o que mudou]` — alteracoes de cliente
- `skill([nome]): [o que mudou]` — alteracoes de skill
- `app: [o que mudou]` — alteracoes em src/
- `infra: [o que mudou]` — alteracoes estruturais
