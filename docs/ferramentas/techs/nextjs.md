---
title: Next.js
badge: Ferramentas
description: Framework React com SSR — uso apenas em excecoes justificadas
status: Excecao
---

# Next.js

## Status no Tech Radar

⚠️ **Excecao** — Permitido apenas quando SSR, SEO estrutural ou API routes no mesmo repo sao requisitos reais do projeto.

## O que e

Framework React full-stack com SSR, SSG e API routes integradas. Alternativa ao Vite + React para cenarios que exigem renderizacao server-side.

## Quando usar

- Projeto precisa de SEO (landing page, blog, marketing)
- SSR e requisito do negocio
- Precisa de API routes complexas no mesmo repositorio

## Quando NAO usar

- Dashboards internos ou SPAs sem requisito de SEO
- Quando Vite + React resolve — que e o caso padrao FXL
- **Nunca usar "por padrao" ou "porque e mais moderno"**

Justificativa obrigatoria no README do projeto.

## Premissas e configuracao

> ⚠️ Esta pagina sera detalhada quando houver um projeto FXL ativo usando Next.js.

## Referencias

- [Next.js Docs](https://nextjs.org/docs)
