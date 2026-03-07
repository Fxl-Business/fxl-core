---
title: GitHub
badge: Padroes
description: Versionamento padrao FXL — repositorios, branches e commits
status: Ativo
---

# GitHub

## Status no Tech Radar

✅ **Ativo** — Plataforma padrao de versionamento FXL. Todo codigo vive no GitHub.

## O que e

Plataforma de hospedagem de repositorios Git. Toda a base de codigo FXL e versionada aqui.

## Quando usar

Sempre. Todo projeto FXL tem um repositorio GitHub.

## Quando NAO usar

Nao ha excecoes — GitHub e obrigatorio.

## Premissas e configuracao

- Toda branch parte de `main`
- Commits seguem Conventional Commits (ver CLAUDE.md)
- PRs obrigatorios para merge em `main`
- `.gitignore` deve incluir `.env.local`, `node_modules/`, `dist/`

## Referencias

- [GitHub Docs](https://docs.github.com)
