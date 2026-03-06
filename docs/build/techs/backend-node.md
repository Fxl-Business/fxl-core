---
title: Backend — Node.js
badge: Build
description: Backend customizado quando Supabase nao for suficiente
status: Em avaliacao
---

# Backend — Node.js

## Status no Tech Radar

🔵 **Em avaliacao** — Para backends customizados quando Supabase nao atende.

## O que e

Runtime JavaScript server-side. Stack candidata: Node.js + TypeScript + Fastify ou Express para APIs customizadas.

## Quando usar

- Logica de negocio complexa que nao cabe em Edge Functions do Supabase
- Integracoes pesadas com APIs externas
- Servicos que precisam de processamento em background

## Quando NAO usar

- CRUD simples — Supabase resolve direto
- Quando Edge Functions do Supabase atendem
- Workloads de dados ou ML — considerar Python

## Premissas e configuracao

> ⚠️ Esta pagina esta em construcao. As premissas serao documentadas quando a tech entrar em avaliacao ativa ou for adotada.

## Referencias

- [Node.js Docs](https://nodejs.org/docs)
- [Fastify](https://fastify.dev)
