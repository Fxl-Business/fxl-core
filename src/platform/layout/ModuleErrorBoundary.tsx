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
 * Error boundary that isolates module crashes.
 * When a module throws, this component:
 * 1. Catches the error and prevents it from propagating to the Layout shell
 * 2. Reports the error to Sentry with module name tag
 * 3. Renders a fallback card with retry button
 *
 * Must be a class component — React error boundaries require componentDidCatch/getDerivedStateFromError.
 */
export class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  state: ModuleErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
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
