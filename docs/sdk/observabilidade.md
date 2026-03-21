---
title: Observabilidade
badge: SDK
description: Padrao v9.0 — setup Sentry para frontend com contexto de modulo e org
scope: product
sort_order: 81
---

# Observabilidade

{% callout type="info" %}Este padrao foi introduzido no Nexo v9.0 (Resiliencia de Plataforma).{% /callout %}

Erros em producao precisam ser capturados com contexto suficiente (modulo, usuario, org) para serem acionaveis. `console.error` nao e suficiente — erros se perdem, nao tem contexto, e ninguem e notificado. O Sentry captura erros automaticamente, enriquece com contexto e alerta a equipe.

## Setup Sentry

### Passo 1: Instalar o SDK

```bash
npm install @sentry/react
```

### Passo 2: Criar projeto no Sentry

1. Acesse [sentry.io](https://sentry.io) e crie um projeto do tipo "React"
2. Copie o DSN gerado (formato: `https://xxx@yyy.ingest.sentry.io/zzz`)

### Passo 3: Configurar variaveis de ambiente

Adicione ao `.env` e ao `.env.example`:

```
VITE_SENTRY_DSN=https://xxx@yyy.ingest.sentry.io/zzz
VITE_SENTRY_ENVIRONMENT=production
```

### Passo 4: Inicializar o Sentry

No `src/main.tsx`, adicione antes do `createRoot`:

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

**Explicacao de cada config:**

| Opcao | Valor | Significado |
|-------|-------|-------------|
| `tracesSampleRate` | `0.2` | 20% das requests sao tracadas (performance monitoring) |
| `replaysSessionSampleRate` | `0` | Nenhuma sessao aleatoria grava replay |
| `replaysOnErrorSampleRate` | `1.0` | 100% dos erros gravam replay (video do que o usuario fez) |
| `maskAllText` | `false` | Texto visivel nos replays (nao mascarado) |
| `blockAllMedia` | `false` | Imagens visiveis nos replays |

{% callout type="warning" %}O Sentry so inicializa se `VITE_SENTRY_DSN` estiver definido. Em desenvolvimento local sem DSN, nenhum erro e enviado — isso e intencional.{% /callout %}

## Contexto de Usuario e Org

O Nexo usa um componente `SentryContextSetter` que define o usuario e a org no Sentry sempre que o estado de auth muda. Esse componente nao renderiza nada — e puramente side-effect.

```typescript
import { useEffect } from 'react'
import { useAuth } from '@clerk/react'
import * as Sentry from '@sentry/react'
import { useActiveOrg } from '@platform/tenants/useActiveOrg'

/**
 * Define contexto Sentry (usuario e org) quando auth muda.
 * Renderiza null — componente de side-effect puro.
 */
function SentryContextSetter() {
  const { userId } = useAuth()
  const { activeOrg } = useActiveOrg()

  useEffect(() => {
    if (userId) {
      Sentry.setUser({ id: userId })
    } else {
      Sentry.setUser(null)
    }
  }, [userId])

  useEffect(() => {
    if (activeOrg?.id) {
      Sentry.setTag('org_id', activeOrg.id)
    } else {
      Sentry.setTag('org_id', undefined)
    }
  }, [activeOrg?.id])

  return null
}
```

Coloque o `SentryContextSetter` dentro dos providers de auth no `App.tsx`:

```tsx
export default function App() {
  return (
    <BrowserRouter>
      <OrgTokenProvider>
        <SentryContextSetter />
        <AppRouter />
      </OrgTokenProvider>
    </BrowserRouter>
  )
}
```

**Para um spoke:** adapte o hook de org para o que o spoke usa. Se o spoke tem `useOrganization` do Clerk diretamente, use esse. O importante e que `Sentry.setTag('org_id', orgId)` seja chamado para que erros possam ser filtrados por tenant no dashboard do Sentry.

## Captura de Erros por Modulo

O `ModuleErrorBoundary` (documentado em [Error Boundaries](/sdk/error-boundaries)) captura erros de render e envia ao Sentry com a tag do modulo:

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  Sentry.captureException(error, {
    tags: {
      module: this.props.moduleName,  // Ex: "Tarefas", "Dashboard"
    },
    contexts: {
      react: { componentStack: errorInfo.componentStack ?? '' },
    },
  })
}
```

Com essa tag, voce pode filtrar no Sentry:
- `module:Tarefas` — todos os erros do modulo Tarefas
- `module:Dashboard` — todos os erros do modulo Dashboard
- `org_id:org_xxx` — todos os erros de um tenant especifico

A combinacao `module` + `org_id` permite diagnosticar rapidamente: "O modulo Tarefas esta crasheando para a org X".

## Captura Manual

Error boundaries nao capturam erros em event handlers, codigo async ou fetch. Para esses casos, use `try/catch` com `Sentry.captureException`:

```typescript
async function handleTokenExchange() {
  try {
    const result = await exchangeToken(clerkToken, orgId)
    setToken(result.access_token)
  } catch (err) {
    Sentry.captureException(err, {
      tags: { context: 'token-exchange' },
    })
    setError('Falha ao trocar token')
  }
}
```

**Quando usar captura manual:**
- Chamadas fetch que podem falhar
- Operacoes async em event handlers
- Qualquer fluxo critico onde um erro silencioso seria pior que um erro reportado

**Sempre inclua uma tag descritiva** (`context`, `action`, `module`) para facilitar filtragem no Sentry.

## Source Maps

Sem source maps, o Sentry mostra stack traces de codigo minificado — ilegivel. Source maps permitem ver o codigo original com nomes de funcao e numeros de linha corretos.

### Configuracao com Vite

1. Instale o plugin:

```bash
npm install -D @sentry/vite-plugin
```

2. Configure no `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  build: {
    sourcemap: true,  // Gera source maps no build
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'sua-org-sentry',
      project: 'seu-projeto-sentry',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
})
```

3. Adicione `SENTRY_AUTH_TOKEN` as variaveis de CI (GitHub Actions secrets):

```yaml
env:
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

{% callout type="warning" %}`SENTRY_AUTH_TOKEN` e um secret de CI — nunca use prefixo `VITE_`. Ele so e usado no build, nunca exposto ao browser.{% /callout %}

## Alertas Basicos

Configure alertas no dashboard do Sentry para ser notificado de erros em producao:

### Alerta 1: Novo Issue

Crie um alerta que dispara quando um novo tipo de erro aparece pela primeira vez:
- **Trigger:** "A new issue is created"
- **Notificacao:** Email ou canal Slack/Discord da equipe

### Alerta 2: Alta Frequencia

Crie um alerta para erros que ocorrem com frequencia anormal:
- **Trigger:** "Number of events > 10 in 1 hour"
- **Notificacao:** Email + mensagem direta para o responsavel

### Alertas por Modulo

Use a tag `module` para criar alertas especificos:
- `module:Tarefas` com frequencia > 5 em 30 min — alerta para o time de Tarefas
- `module:Dashboard` com qualquer novo issue — alerta para o time de dados

**Recomendacao:** comece com alertas por email. Adicione Slack/Discord quando o volume justificar.

## Checklist de Observabilidade

Antes de considerar o spoke pronto para producao, verifique:

- [ ] `VITE_SENTRY_DSN` configurado em producao
- [ ] `SentryContextSetter` renderizando no `App.tsx`
- [ ] Error boundaries com `captureException` em todos os modulos
- [ ] Source maps configurados no CI (Vite plugin + `SENTRY_AUTH_TOKEN`)
- [ ] Alerta de "novo issue" ativo no Sentry
- [ ] `Sentry.captureException` em todos os `catch` de operacoes criticas
