---
title: Infraestrutura
badge: SDK
description: Ambientes, monitoring, deploy e observabilidade para projetos spoke
scope: product
sort_order: 120
---

# Infraestrutura

Configuracao de ambientes, monitoring e deploy para projetos spoke FXL.

## Ambientes

| Ambiente | URL | Proposito | Variaveis |
|----------|-----|-----------|-----------|
| dev | `localhost:5173` | Desenvolvimento local | `.env.local` |
| staging | Vercel Preview (branch do PR) | Testes pre-producao | Vercel Preview env |
| prod | `{slug}.fxl.app` (Vercel Production) | Producao | Vercel Production env |

{% callout type="warning" %}
Nunca usar dados de producao em dev/staging. Usar seeds ou dados sinteticos.
{% /callout %}

## Monitoring com Sentry

### Setup

Instalar o SDK do Sentry para React:

```bash
npm install @sentry/react
```

Adicionar as variaveis de ambiente:

| Variavel | Proposito |
|----------|-----------|
| `VITE_SENTRY_DSN` | DSN do projeto Sentry (obrigatoria para monitoring) |
| `VITE_SENTRY_ENVIRONMENT` | Identificador do ambiente (`production`, `staging`) |

### Inicializacao

Adicionar no `main.tsx`, antes do `ReactDOM.createRoot`:

```typescript
import * as Sentry from '@sentry/react'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  })
}
```

{% callout type="info" %}
Sentry so inicializa se `VITE_SENTRY_DSN` estiver definida. Em dev, omitir a variavel para evitar envio de eventos.
{% /callout %}

### Source Maps

Para upload automatico de source maps em producao, adicionar o plugin do Sentry ao `vite.config.ts`:

```bash
npm install -D @sentry/vite-plugin
```

```typescript
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      org: 'fxl',
      project: '<spoke-slug>',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

### Error Boundary

Para capturar erros de renderizacao por modulo, usar o padrao de class component com `getDerivedStateFromError`. O padrao completo — com envio ao Sentry e fallback UI — esta documentado na pagina dedicada:

Ver: [Error Boundaries](/sdk/error-boundaries)

{% callout type="warning" %}
Nao usar `Sentry.ErrorBoundary` diretamente. O padrao aprovado e o class component `ModuleErrorBoundary` que integra Sentry via `componentDidCatch`. Detalhes em [Error Boundaries](/sdk/error-boundaries).
{% /callout %}

## Deploy Frontend (Vercel)

Para configuracao detalhada de Vercel, ver a pagina [CI/CD e Deploy](/sdk/ci-cd).

### Resumo

| Configuracao | Valor |
|-------------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

### vercel.json Essenciais

O arquivo `vercel.json` deve incluir:

- **Security headers** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- **SPA rewrite** — Redireciona todas as rotas (exceto `/api/*`) para `index.html`
- **Cache control** — Assets em `/assets/*` com `max-age=31536000, immutable`

## Deploy Backend (NestJS)

{% callout type="info" %}
A maioria dos spokes FXL nao precisa de backend proprio. Supabase + RLS + Edge Functions cobrem a maioria dos casos.
{% /callout %}

### Quando Usar

- Processamento pesado de dados (ETL, agregacoes complexas)
- Secrets server-only que nao podem ficar no browser
- Tarefas agendadas (cron jobs, webhooks)
- Integracao com APIs externas que exigem autenticacao server-side

### Stack Recomendada

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Framework | NestJS | TypeScript nativo, modular |
| Banco | PostgreSQL (Supabase) | Mesmo banco do frontend |
| Deploy | Railway ou Render | Alternativa: Vercel Serverless Functions |
| Auth | Clerk JWT verification | Validar token do frontend |

### Estrutura Basica

```
server/
  src/
    app.module.ts
    main.ts
    modules/
      fxl-contract/          # Endpoints do FXL Contract
        contract.controller.ts
        contract.service.ts
      data/                   # Logica de dados
        data.module.ts
        data.service.ts
```

## Checklist de Deploy

Antes de liberar um spoke para producao:

- [ ] Env vars configuradas no Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`)
- [ ] `VITE_SENTRY_DSN` configurada para producao
- [ ] `vercel.json` com security headers
- [ ] `fxl-doctor.sh` passando localmente
- [ ] Branch protection ativa no GitHub
- [ ] DNS configurado para `{slug}.fxl.app`
- [ ] Teste manual no Preview Deploy antes de merge
