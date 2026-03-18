---
title: Estrutura de Projeto
badge: SDK
description: Diretorios, organizacao e convencoes de naming para projetos spoke
scope: product
sort_order: 40
---

# Estrutura de Projeto

Todo spoke FXL segue a mesma estrutura de diretorios. Isso garante que ferramentas automatizadas (fxl-doctor, audits, CI) funcionem em qualquer projeto.

## Arvore de Diretorios

```
spoke-project/
  CLAUDE.md                    <- regras do projeto (gerado do template)
  package.json                 <- inclui fxlContractVersion e fxlAppId
  tsconfig.json                <- strict: true, path aliases
  eslint.config.js             <- flat config
  prettier.config.js
  tailwind.config.ts
  vercel.json                  <- security headers + SPA rewrite
  fxl-doctor.sh                <- script de health check (CI)
  .env.local                   <- NUNCA commitado
  .env.example                 <- commitado, documenta vars obrigatorias
  .gitignore
  .github/
    workflows/
      ci.yml                   <- roda fxl-doctor.sh em push/PR
  src/
    main.tsx                   <- entry point da aplicacao
    App.tsx                    <- router + providers (ClerkProvider, etc.)
    api/
      fxl/
        manifest.ts            <- GET /api/fxl/manifest
        entities.ts            <- GET /api/fxl/entities/:type
        widgets.ts             <- GET /api/fxl/widgets/:id/data
        search.ts              <- GET /api/fxl/search?q=
        health.ts              <- GET /api/fxl/health
        middleware.ts          <- validacao de API key
    components/
      ui/                      <- componentes shadcn/ui
      layout/                  <- shell: header, sidebar, footer
      [dominio]/               <- componentes especificos do dominio
    pages/                     <- paginas de rota
    hooks/                     <- hooks customizados compartilhados
    lib/                       <- utilitarios, supabase client, auth
      services/                <- servicos de acesso a dados
    types/
      fxl-contract.ts          <- types do contract (copiado do SDK)
      [dominio].ts             <- types do dominio do projeto
    styles/
      globals.css              <- Tailwind directives + estilos customizados
  supabase/
    migrations/                <- SQL migrations versionadas
```

## Responsabilidade de Cada Pasta

### `src/api/fxl/`

Implementacao dos 6 endpoints do FXL Contract. O Hub consome esses endpoints para integrar dados do spoke no dashboard central.

### `src/components/ui/`

Componentes do shadcn/ui. Esses componentes sao **copiados** para o projeto (nao importados de npm). Customizacoes sao permitidas.

### `src/components/layout/`

Componentes de shell da aplicacao — header, sidebar, footer, breadcrumbs. Definem a estrutura visual que envolve as paginas.

### `src/components/[dominio]/`

Componentes especificos do dominio do projeto. Exemplo: `src/components/reservations/ReservationCard.tsx`.

### `src/pages/`

Paginas de rota. Cada arquivo corresponde a uma rota no router. Paginas sao compostas por componentes de `components/`.

### `src/hooks/`

Hooks customizados compartilhados entre multiplos componentes. Hooks de uso unico ficam colocados com o componente.

### `src/lib/`

Utilitarios gerais: client do Supabase, helpers de autenticacao, funcoes de formatacao.

### `src/lib/services/`

Servicos de acesso a dados. Encapsulam queries ao Supabase com tipagem forte.

### `src/types/`

Definicoes de tipos TypeScript compartilhados. Inclui o `fxl-contract.ts` (copiado do SDK) e types do dominio.

### `src/styles/`

Arquivo `globals.css` com directives do Tailwind (`@tailwind base/components/utilities`) e estilos customizados.

### `supabase/migrations/`

Migrations SQL versionadas. Convencionam nomenclatura sequencial: `001_initial_schema.sql`, `002_add_index.sql`, etc.

## Arquivos de Config na Raiz

| Arquivo | Proposito | Template SDK |
|---------|----------|-------------|
| `CLAUDE.md` | Regras e contexto do projeto para o Claude Code | `CLAUDE.md.template` |
| `tsconfig.json` | TypeScript strict mode + path aliases | `tsconfig.json.template` |
| `eslint.config.js` | ESLint flat config com regras FXL | `eslint.config.js.template` |
| `prettier.config.js` | Formatacao automatica | `prettier.config.js.template` |
| `tailwind.config.ts` | Tailwind com preset FXL | `tailwind.preset.js.template` |
| `vercel.json` | Deploy config + security headers | `vercel.json.template` |
| `fxl-doctor.sh` | Script de health check para CI | `fxl-doctor.sh.template` |
| `.github/workflows/ci.yml` | Pipeline de CI com GitHub Actions | `ci.yml.template` |

## CLAUDE.md do Spoke

O `CLAUDE.md` e o arquivo mais importante para operacao com IA. Ele contem:

- **Natureza do projeto** — o que e, qual o App ID, versao do contract
- **Stack** — tecnologias usadas (identica a stack padrao + extras)
- **Estrutura do projeto** — arvore de diretorios atualizada
- **Entidades** — lista de entidades do dominio com campos
- **Convencoes de codigo** — regras de naming, imports, commits
- **Regras de seguranca** — env vars, RLS, auth
- **Contract endpoints** — tabela dos 6 endpoints
- **Quality gates** — comandos de validacao obrigatorios
- **O que nunca fazer** — lista de anti-patterns

{% callout type="info" %}
O CLAUDE.md e gerado a partir do template `CLAUDE.md.template` do SDK, com placeholders substituidos por dados do projeto. Ele e customizado por projeto e deve ser mantido atualizado.
{% /callout %}

## package.json

Alem dos campos padrao, todo spoke deve ter:

```json
{
  "fxlContractVersion": "1.0",
  "fxlAppId": "nome-do-spoke"
}
```

O `fxl-doctor.sh` valida a presenca desses campos.

## Convencoes de Naming

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ReservationCard.tsx` |
| Hooks | camelCase com prefixo `use` | `useReservations.ts` |
| Servicos | camelCase com sufixo `-service` | `reservation-service.ts` |
| Utilitarios | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Reservation.ts` |
| Constantes | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Classes CSS | Tailwind utilities | `className="flex items-center"` |
| Rotas de API | kebab-case | `/api/fxl/entities` |
| Tabelas do banco | snake_case | `reservations` |
| Colunas do banco | snake_case | `check_in_date` |

### Regras de Import

- Path aliases: `@/components/`, `@/lib/`, `@/types/`
- Agrupar imports: React -> libs externas -> modulos internos -> types
- Usar `import type` para importacoes apenas de tipo
- Sem circular imports
- Sem barrel exports (re-exports via `index.ts`) a menos que intencional

### Regras de Exports

- **Sempre** named exports (nunca default exports)
- Props interfaces nomeadas como `{Component}Props`
- Componentes funcionais apenas (sem class components)
