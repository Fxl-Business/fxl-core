---
title: Tailwind CSS + shadcn/ui
badge: Build
description: Camada de estilos e componentes padrao FXL
status: Ativo
---

# Tailwind CSS + shadcn/ui

## Status no Tech Radar

✅ **Ativo** — Padrao FXL de estilizacao. Sem CSS-in-JS, sem modulos CSS.

## Versoes minimas

| Camada | Versao minima |
|---|---|
| Tailwind CSS | 3+ |
| shadcn/ui | ultima estavel |

## Regras obrigatorias

- Sem CSS-in-JS (styled-components, emotion etc.)
- Sem modulos CSS — todo estilo via classes Tailwind
- Componentes shadcn/ui adicionados via CLI (`npx shadcn@latest add [componente]`)
- Nao modificar arquivos gerados pelo shadcn dentro de `components/ui/` diretamente —
  criar wrappers em `components/[feature]/`
- Paleta e tokens de cor definidos no design system FXL
