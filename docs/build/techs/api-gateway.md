---
title: API Gateway
badge: Build
description: Gateway de API para projetos com multiplos servicos — decisao pendente
status: TBD
---

# API Gateway

## Status no Tech Radar

⬜ **TBD** — Gateway de API para projetos com multiplos servicos. Decisao pendente.

## O que e

Camada intermediaria que gerencia, roteia e protege chamadas de API entre clientes e servicos backend.

## Quando usar

- Projetos com multiplos microservicos que precisam de roteamento centralizado
- Rate limiting, autenticacao e logging centralizados
- Versionamento de APIs

## Quando NAO usar

- Projetos com um unico backend ou apenas Supabase
- Quando o Supabase + Vercel resolvem o roteamento

## Premissas e configuracao

> ⚠️ Esta pagina esta em construcao. As premissas serao documentadas quando a tech entrar em avaliacao ativa ou for adotada.

## Referencias

- [AWS API Gateway](https://aws.amazon.com/api-gateway/)
- [Kong](https://konghq.com)
