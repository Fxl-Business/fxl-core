---
title: Retry com Backoff
badge: SDK
description: Padrao v9.0 — utility withRetry para retry com backoff exponencial em chamadas criticas
scope: product
sort_order: 82
---

# Retry com Backoff

{% callout type="info" %}Este padrao foi introduzido no Nexo v9.0 (Resiliencia de Plataforma).{% /callout %}

Chamadas de rede falham de forma transiente — DNS instavel, servidor sobrecarregado, cold starts de edge functions. Sem retry, uma unica falha quebra o fluxo do usuario. Com retry e backoff exponencial, falhas transientes sao absorvidas de forma transparente.

## A Utility `withRetry`

O Nexo usa a utility `withRetry` em `src/platform/lib/retry.ts`. Este codigo pode ser copiado diretamente para `src/lib/retry.ts` no spoke.

```typescript
/**
 * Generic async retry wrapper with exponential backoff.
 *
 * Retries transient failures (network errors, 5xx) while immediately
 * propagating client errors (4xx) and supporting cancellation via AbortSignal.
 */

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in ms before first retry (default: 1000) */
  baseDelay?: number
  /** Multiplier applied to delay after each attempt (default: 2) */
  backoffFactor?: number
  /** Optional AbortSignal to cancel retries */
  signal?: AbortSignal
  /** Custom function to determine if an error is retryable. Default: network errors + 5xx */
  isRetryable?: (error: Error) => boolean
}

const DEFAULT_RETRY_OPTIONS: Required<
  Pick<RetryOptions, 'maxRetries' | 'baseDelay' | 'backoffFactor'>
> = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffFactor: 2,
}

/**
 * Default retryable check: network errors (TypeError from fetch) and 5xx server errors.
 * Never retries 4xx client errors.
 */
export function isNetworkOrServerError(error: Error): boolean {
  // Network errors: fetch throws TypeError on network failure
  if (error instanceof TypeError) return true
  // Server errors: check for 5xx status in error message pattern "(5XX)"
  const statusMatch = error.message.match(/\((\d{3})\)/)
  if (statusMatch) {
    const status = parseInt(statusMatch[1], 10)
    return status >= 500 && status < 600
  }
  return false
}

/**
 * Retry an async operation with exponential backoff.
 *
 * The function is called once initially, then up to `maxRetries` additional times
 * if it fails with a retryable error. Delay between attempts grows exponentially:
 * `baseDelay * backoffFactor^attempt`.
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns The resolved value of `fn`
 * @throws The last error after all attempts are exhausted, or immediately for non-retryable errors
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const { maxRetries, baseDelay, backoffFactor } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  }
  const isRetryable = options?.isRetryable ?? isNetworkOrServerError
  const signal = options?.signal

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Check abort before each attempt
    if (signal?.aborted) {
      throw new DOMException('Retry aborted', 'AbortError')
    }

    try {
      return await fn()
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      lastError = error

      // Don't retry if not retryable or last attempt
      if (!isRetryable(error) || attempt === maxRetries) {
        throw err
      }

      const delay = baseDelay * Math.pow(backoffFactor, attempt)
      console.warn(
        `[withRetry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms:`,
        error.message,
      )

      // Wait with abort support
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delay)
        if (signal) {
          const onAbort = () => {
            clearTimeout(timer)
            reject(new DOMException('Retry aborted', 'AbortError'))
          }
          signal.addEventListener('abort', onAbort, { once: true })
        }
      })
    }
  }

  // Should not reach here, but TypeScript needs it
  throw lastError ?? new Error('withRetry exhausted all attempts')
}
```

## Configuracao

Cada opcao do `RetryOptions`:

| Opcao | Default | Descricao |
|-------|---------|-----------|
| `maxRetries` | `3` | Numero de tentativas apos a falha inicial. Total de chamadas = maxRetries + 1 |
| `baseDelay` | `1000` (ms) | Delay antes do primeiro retry |
| `backoffFactor` | `2` | Multiplicador: delay = baseDelay * backoffFactor^attempt |
| `signal` | `undefined` | AbortSignal para cancelar o retry chain imediatamente |
| `isRetryable` | `isNetworkOrServerError` | Funcao custom que decide se o erro deve ser retentado |

### Progressao de delay (config padrao)

| Tentativa | Delay |
|-----------|-------|
| 1 (inicial) | 0ms (imediata) |
| 2 (retry 1) | 1000ms |
| 3 (retry 2) | 2000ms |
| 4 (retry 3) | 4000ms |

O tempo total maximo ate desistir e ~7 segundos com a configuracao padrao.

### O predicate `isNetworkOrServerError`

O predicate default retenta:
- **TypeError** — erro de rede (fetch falhou ao conectar)
- **5xx** — server error (extraido do padrao `(5XX)` na mensagem de erro)

O predicate default **nao** retenta:
- **4xx** — client error (401, 403, 404, 422 — nao vao resolver com retry)
- **Erros sem status** — erros de logica de aplicacao

{% callout type="warning" %}Para que o `isNetworkOrServerError` funcione, o throw deve incluir o status code no formato `(STATUS)`. Exemplo: `throw new Error(\`Fetch failed (${res.status})\`)`.{% /callout %}

## Quando Usar

**Usar `withRetry` em:**
- Token exchange (critico — usuario nao usa o app sem token)
- Chamadas a edge functions do Supabase (rede pode falhar)
- Fetch para APIs externas (terceiros podem ter instabilidade)
- Qualquer operacao de rede em fluxos criticos

**NAO usar `withRetry` em:**
- Validacao de input do usuario (erro 400 nao resolve com retry)
- Operacoes de state local (nao envolvem rede)
- Leitura de arquivos locais
- Operacoes que nao sao idempotentes (a menos que haja deduplicacao server-side)

## Exemplos de Uso

### Exemplo 1: Token Exchange (com AbortSignal)

O caso mais critico no Nexo — sem token, o RLS nao consegue filtrar dados. O `OrgTokenContext.tsx` usa `withRetry` com AbortSignal para cancelar retries quando o usuario troca de org:

```typescript
const result = await withRetry(
  () => exchangeToken(clerkToken, activeOrg.id, abortControllerRef.current.signal),
  { maxRetries: 3, baseDelay: 1000, backoffFactor: 2 },
)
```

O AbortSignal e abortado quando o usuario troca de org — isso cancela a cadeia de retry imediatamente, evitando que um token de org antiga seja aplicado.

### Exemplo 2: Service Layer (admin-service.ts)

O padrao no service layer do Nexo envolve toda a operacao fetch-parse no `withRetry`:

```typescript
export async function listUsers(): Promise<AdminUserListResponse> {
  return withRetry(async () => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-users`, {
      headers: await getAuthHeaders(),
    })
    if (!res.ok) throw new Error(`Failed to list users: ${res.status}`)
    return res.json() as Promise<AdminUserListResponse>
  })
}
```

A mensagem de erro inclui `(STATUS)` para que `isNetworkOrServerError` extraia o status code e decida se o retry faz sentido (5xx sim, 4xx nao).

### Exemplo 3: Custom `isRetryable`

Para APIs que retornam 429 (rate limit), adicione 429 ao predicate:

```typescript
await withRetry(fetchExternalData, {
  isRetryable: (error) => {
    // Retenta rate limits (429) alem dos defaults
    if (error.message.includes('(429)')) return true
    return isNetworkOrServerError(error)
  },
})
```

## Integracao com AbortController

Use AbortController para cancelar retries em andamento. Cenarios comuns:
- **Troca de org:** o token antigo nao e mais necessario
- **Unmount de componente:** evita set state em componente desmontado
- **Cancelamento pelo usuario:** botao "Cancelar" em operacoes longas

O padrao completo:

```typescript
import { useEffect, useRef } from 'react'
import { withRetry } from '@/lib/retry'

function useTokenExchange(orgId: string) {
  const abortRef = useRef<AbortController>(new AbortController())

  useEffect(() => {
    // Aborta retry chain anterior
    abortRef.current.abort()
    abortRef.current = new AbortController()

    async function exchange() {
      try {
        const result = await withRetry(
          () => exchangeToken(clerkToken, orgId, abortRef.current.signal),
          { maxRetries: 3, baseDelay: 1000, backoffFactor: 2 },
        )
        setToken(result.access_token)
      } catch (err) {
        // Ignora AbortError — esperado na troca de org
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError('Falha no token exchange')
      }
    }

    exchange()

    return () => abortRef.current.abort()
  }, [orgId])
}
```

{% callout type="info" %}Quando `withRetry` recebe um signal ja abortado, ele lanca `DOMException` com name `'AbortError'` imediatamente, sem executar a funcao.{% /callout %}

## Anti-Patterns

### Nao retente erros de autenticacao (401/403)

Se o token e invalido ou o usuario nao tem permissao, retentar nao vai resolver. Redirecione para login ou mostre erro de permissao.

### Nao retente erros de validacao (400)

Se o payload esta errado, enviar de novo com os mesmos dados vai falhar de novo. Corrija o input.

### Nao configure maxRetries > 5

Com backoff exponencial e maxRetries = 5, o usuario espera ate ~31 segundos. Isso e inaceitavel para a maioria das operacoes. O default de 3 (total ~7s) e um bom equilibrio.

### Use o padrao de status no throw

O `isNetworkOrServerError` extrai o status code do formato `(STATUS)` na mensagem de erro. Se o throw nao segue esse padrao, o predicate nao consegue diferenciar 4xx de 5xx:

```typescript
// Correto — isNetworkOrServerError extrai o status
if (!res.ok) throw new Error(`Fetch failed (${res.status})`)

// Errado — nao ha status para extrair, o erro nao sera retentado
if (!res.ok) throw new Error('Fetch failed')
```

## Testes

A utility `withRetry` deve ser testada com fake timers para evitar delays reais nos testes. O Nexo usa Vitest:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry, isNetworkOrServerError } from './retry'

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on network error and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('recovered')

    const promise = withRetry(fn, { baseDelay: 100 })
    await vi.advanceTimersByTimeAsync(100)

    const result = await promise
    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 4xx error', async () => {
    const fn = vi.fn()
      .mockRejectedValue(new Error('Token exchange failed (401): Unauthorized'))

    await expect(withRetry(fn)).rejects.toThrow('(401)')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('aborts on AbortSignal', async () => {
    const controller = new AbortController()
    controller.abort()

    const fn = vi.fn().mockResolvedValue('ok')
    const rejection = await withRetry(fn, {
      signal: controller.signal,
    }).catch((e: Error) => e)

    expect(rejection).toBeInstanceOf(DOMException)
    expect((rejection as DOMException).name).toBe('AbortError')
    expect(fn).not.toHaveBeenCalled()
  })
})
```

**Casos de teste essenciais:**
- Sucesso na primeira tentativa
- Retry apos erro de rede (TypeError)
- Retry apos 5xx, sem retry apos 4xx
- Esgotamento de tentativas (maxRetries excedido)
- Abort durante retry
- Custom `isRetryable`
