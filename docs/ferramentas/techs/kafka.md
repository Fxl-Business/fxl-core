---
title: Kafka
badge: Padroes
description: Mensageria para arquiteturas event-driven — decisao pendente
status: TBD
---

# Kafka

## Status no Tech Radar

⬜ **TBD** — Mensageria para arquiteturas event-driven. Decisao pendente.

## O que e

Plataforma distribuida de streaming de eventos. Permite comunicacao assincrona entre servicos via topicos de mensagens.

## Quando usar

- Arquiteturas event-driven com multiplos produtores e consumidores
- Processamento de grandes volumes de eventos em tempo real
- Desacoplamento de servicos que precisam se comunicar de forma assincrona

## Quando NAO usar

- Comunicacao simples request/response entre dois servicos
- Projetos pequenos ou medios sem requisitos de streaming

## Premissas e configuracao

> ⚠️ Esta pagina esta em construcao. As premissas serao documentadas quando a tech entrar em avaliacao ativa ou for adotada.

## Referencias

- [Apache Kafka Docs](https://kafka.apache.org/documentation/)
