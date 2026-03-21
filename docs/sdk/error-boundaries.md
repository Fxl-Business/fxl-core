---
title: Error Boundaries
badge: SDK
description: Padrao v9.0 — isolamento de erros por modulo com fallback UI
scope: product
sort_order: 80
---

# Error Boundaries

{% callout type="info" %}Este padrao foi introduzido no Nexo v9.0 (Resiliencia de Plataforma).{% /callout %}

Um crash em um modulo (Docs, Tarefas, Wireframe) **nao pode** derrubar todo o app shell — header, sidebar e outros modulos devem continuar funcionando. Error Boundaries isolam erros por modulo: o modulo que falhou mostra um fallback, enquanto o resto do app permanece navegavel.

## O Padrao

React error boundaries usam dois metodos de classe:

- `getDerivedStateFromError(error)` — atualiza o state para renderizar o fallback
- `componentDidCatch(error, errorInfo)` — recebe o erro com stack trace, ideal para enviar ao Sentry

{% callout type="warning" %}Error boundaries precisam ser class components. Functional components nao podem implementar `getDerivedStateFromError` ou `componentDidCatch`.{% /callout %}

O fluxo quando um modulo crasheia:

1. O erro e capturado pelo boundary do modulo
2. O Sentry recebe o erro com a tag `module` (ex: `module: "Tarefas"`)
3. O fallback UI renderiza com um botao de retry
4. O resto do app (sidebar, header, outros modulos) continua funcionando normalmente

## Referencia: Nexo

O Nexo usa o `ModuleErrorBoundary` em `src/platform/layout/ModuleErrorBoundary.tsx`:

```typescript
import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ModuleErrorBoundaryProps {
  moduleName: string
  children: ReactNode
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary que isola crashes por modulo.
 * Quando um modulo falha:
 * 1. Captura o erro e impede propagacao para o Layout shell
 * 2. Envia o erro ao Sentry com tag do modulo
 * 3. Renderiza um card de fallback com botao de retry
 */
export class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  state: ModuleErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Envia ao Sentry com tag do modulo para filtragem no dashboard
    Sentry.captureException(error, {
      tags: {
        module: this.props.moduleName,
      },
      contexts: {
        react: { componentStack: errorInfo.componentStack ?? '' },
      },
    })
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Erro no modulo {this.props.moduleName}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

No `AppRouter.tsx`, cada rota de modulo e envolvida pelo boundary:

```tsx
{/* Cada modulo recebe seu proprio boundary */}
<Route path="/" element={
  <ModuleErrorBoundary moduleName="Home">
    <Home />
  </ModuleErrorBoundary>
} />

<Route path="/tarefas" element={
  <ModuleErrorBoundary moduleName="Tarefas">
    <TaskList />
  </ModuleErrorBoundary>
} />

{/* Modulos dinamicos do MODULE_REGISTRY tambem sao envolvidos */}
{MODULE_REGISTRY.map(m => {
  const routes = (m.routeConfig ?? []).filter(
    (cfg): cfg is RouteObject & { path: string } => cfg.path !== undefined,
  )
  return routes.map(cfg => (
    <Route
      key={cfg.path}
      path={cfg.path}
      element={
        <ModuleErrorBoundary moduleName={m.label}>
          {cfg.element}
        </ModuleErrorBoundary>
      }
    />
  ))
})}
```

## Setup para Spoke

### Passo 1: Instalar Sentry

```bash
npm install @sentry/react
```

### Passo 2: Criar o componente

Crie `src/components/ModuleErrorBoundary.tsx` no seu spoke. O componente e o mesmo do Nexo — adapte os nomes de modulo para os do seu projeto:

```typescript
import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ModuleErrorBoundaryProps {
  moduleName: string
  children: ReactNode
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  state: ModuleErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Sentry.captureException(error, {
      tags: { module: this.props.moduleName },
      contexts: { react: { componentStack: errorInfo.componentStack ?? '' } },
    })
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Erro no modulo {this.props.moduleName}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {this.state.error?.message ?? 'Ocorreu um erro inesperado.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Passo 3: Envolver cada rota

No seu router, envolva cada rota de modulo com o boundary:

```tsx
import { ModuleErrorBoundary } from '@/components/ModuleErrorBoundary'

<Route path="/dashboard" element={
  <ModuleErrorBoundary moduleName="Dashboard">
    <Dashboard />
  </ModuleErrorBoundary>
} />

<Route path="/relatorios" element={
  <ModuleErrorBoundary moduleName="Relatorios">
    <Relatorios />
  </ModuleErrorBoundary>
} />

<Route path="/configuracoes" element={
  <ModuleErrorBoundary moduleName="Configuracoes">
    <Configuracoes />
  </ModuleErrorBoundary>
} />
```

## Fallback UI

O fallback deve seguir estas diretrizes:

- **Visualmente claro:** icone de erro + mensagem + botao de retry
- **Simples:** use apenas HTML/Tailwind basico — nao dependa de componentes que possam estar quebrados
- **Identifique o modulo:** o usuario precisa saber qual modulo falhou
- **Retry funcional:** o botao deve resetar o state do boundary para tentar re-renderizar o modulo

O fallback do Nexo usa `AlertTriangle` e `RefreshCw` do lucide-react, classes Tailwind para estilizacao, e exibe o nome do modulo e a mensagem de erro.

{% callout type="warning" %}Nunca use componentes complexos (modais, toasts, queries) no fallback. Se o modulo crasheou, esses componentes podem estar quebrados tambem. Mantenha o fallback o mais simples possivel.{% /callout %}

## Erros Comuns

### Error boundaries so capturam erros de render

Error boundaries capturam erros em:
- Render methods
- Lifecycle methods
- Construtores de componentes filhos

Error boundaries **nao** capturam erros em:
- Event handlers (onClick, onChange, etc.)
- Codigo async (fetch, setTimeout, Promises)
- Server-side rendering
- Erros no proprio boundary

Para erros em event handlers e codigo async, use `try/catch` com `Sentry.captureException`:

```typescript
async function handleSave() {
  try {
    await saveData(formData)
  } catch (err) {
    Sentry.captureException(err, {
      tags: { context: 'form-save', module: 'Configuracoes' },
    })
    // Mostrar feedback ao usuario
  }
}
```

### Nao envolva o app inteiro em um unico boundary

Um boundary no topo da arvore captura tudo, mas derruba o app inteiro quando algo falha. O padrao correto e um boundary **por modulo**, isolando falhas:

```
- App (sem boundary)
  - Layout (sem boundary)
    - ModuleErrorBoundary moduleName="Dashboard"
      - Dashboard
    - ModuleErrorBoundary moduleName="Tarefas"
      - TaskList
    - ModuleErrorBoundary moduleName="Docs"
      - DocsViewer
```

### Functional components nao podem ser error boundaries

React requer `getDerivedStateFromError` e/ou `componentDidCatch`, que so existem em class components. Nao existe hook equivalente (`useErrorBoundary` nao existe no React core).

## Leitura Complementar

- [Observabilidade](/sdk/observabilidade) — Setup completo do Sentry para frontend: DSN, source maps, alertas e captura de erros com contexto de modulo
- [Retry com Backoff](/sdk/retry-backoff) — Para erros em chamadas async, combinar error boundaries com retry automatico
