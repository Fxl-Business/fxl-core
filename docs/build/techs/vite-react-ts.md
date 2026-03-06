---
title: Vite + React + TypeScript
badge: Build
description: Stack frontend padrao FXL para SPAs sem requisito de SSR
status: Ativo
---

# Vite + React + TypeScript

## Status no Tech Radar

✅ **Ativo** — Stack padrao para todos os novos projetos FXL que nao exijam SSR.

## Versoes minimas

| Camada | Versao minima |
|---|---|
| React | 18+ |
| TypeScript | 5+ |
| Vite | 5+ |

## Regras obrigatorias

- TypeScript strict mode sempre ativo (`"strict": true` no tsconfig)
- Nunca usar `any` — se necessario, usar `unknown` com type guard
- Aliases obrigatorios: `@/` apontando para `src/`
- Componentes em PascalCase; hooks em camelCase com prefixo `use`
- Skeleton loading em toda tela que carrega dados assincronos
- Responsivo: desktop prioritario, mobile funcional (breakpoint minimo 375px)

## Estrutura padrao de `src/`

```
src/
├── components/
│   ├── ui/          ← shadcn/ui
│   └── [feature]/   ← componentes de feature
├── pages/
├── hooks/
├── lib/
│   └── utils.ts
└── main.tsx
```

## Quando NAO usar

Quando o projeto exigir SSR, SEO estrutural ou API routes no mesmo repositorio.
Nesses casos, ver [Next.js](/build/techs/nextjs).
