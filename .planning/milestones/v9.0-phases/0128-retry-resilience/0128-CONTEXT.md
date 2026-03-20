# Phase 128: Retry & Resilience - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Retry automatico com backoff exponencial para token exchange e wrapper reutilizavel para chamadas criticas (admin-service, tenant-service). Falhas transitorias de rede sao absorvidas transparentemente antes de propagar erro ao usuario. Nao inclui: retry no connector-service (ja tem timeout proprio), UI de retry manual, circuit breaker, ou rate limiting.

</domain>

<decisions>
## Implementation Decisions

### Retry wrapper API design
- Generic async wrapper `withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>` — composable com qualquer funcao async
- Options object com defaults: `{ maxRetries: 3, baseDelay: 1000, backoffFactor: 2 }` — configuravel por chamada
- Aceita `AbortSignal` opcional para suporte a cancelamento (alinha com Phase 126 AbortController)
- Localizado em `src/platform/lib/retry.ts` — utilitario de plataforma, nao especifico de modulo

### Retryable error classification
- Retry apenas para erros de rede (TypeError do fetch) e erros 5xx do servidor
- Nunca retry em 4xx (auth/validation) — propagar imediatamente
- Aceita `isRetryable?: (error: Error) => boolean` opcional nas options para logica custom do caller

### Token exchange integration
- Retry wraps a chamada `exchangeToken()` dentro de `useOrgTokenExchange.ts` (no doExchange), nao dentro de `token-exchange.ts`
- `token-exchange.ts` permanece puro (single fetch, no retry) — o hook controla a policy de retry
- 3 retries com backoff exponencial (1s, 2s, 4s), apenas para network errors, 4xx propaga imediatamente

### Service integration (admin-service, tenant-service)
- Ambos os services usam o mesmo `withRetry` wrapper — zero duplicacao de logica
- Wrapper aplicado nas funcoes de fetch individuais (listUsers, listTenants, etc.)
- Mesma configuracao default (3 retries, backoff exponencial) para todas as chamadas criticas

### Observability & user feedback
- `console.warn` em cada retry attempt com numero da tentativa e delay
- `console.error` apos falha final (todas as tentativas esgotadas)
- Nenhuma mudanca de UI durante retries — `isReady=false` (loading state existente) cobre o periodo
- Erro mostrado ao usuario apenas apos todas as tentativas esgotadas

### Claude's Discretion
- Jitter (randomizacao) no delay de backoff — pode adicionar se beneficiar, nao obrigatorio
- Naming exato de tipos/interfaces (RetryOptions, RetryConfig, etc.)
- Nivel de detalhe no log de retry (incluir URL, incluir error message, etc.)
- Se o wrapper deve retornar metadata de tentativas (attempt count) ou apenas o resultado

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Token exchange pipeline
- `src/platform/tenants/token-exchange.ts` — Funcao `exchangeToken()` que sera wrapped pelo retry no hook
- `src/platform/tenants/useOrgTokenExchange.ts` — Hook que chama exchangeToken() e onde o retry sera integrado
- `src/platform/tenants/token-exchange.test.ts` — Testes existentes do token exchange
- `src/platform/tenants/useOrgTokenExchange.test.ts` — Testes existentes do hook

### Services que receberao retry
- `src/platform/services/admin-service.ts` — 5 funcoes de fetch para admin (users, members, impersonation)
- `src/platform/services/tenant-service.ts` — 5 funcoes de fetch para tenants (CRUD + archive/restore)
- `src/platform/services/admin-service.test.ts` — Testes existentes do admin service

### Pitfalls & patterns
- `.planning/PITFALLS.md` — Regras sobre Promise.allSettled, edge function deploy, API response format

### Phase 126 (dependency awareness)
- `.planning/milestones/v9.0-ROADMAP.md` — Phase 126 introduz AbortController; retry wrapper deve aceitar AbortSignal para compatibilidade futura

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum retry utility existente no codebase — este sera o primeiro
- `connector-service.ts` tem timeout via AbortController (5s) — pattern de referencia para AbortSignal
- `token-exchange.ts` ja tem tipos `TokenExchangeResult` e `TokenExchangeError` bem definidos

### Established Patterns
- Services usam `fetch()` direto com `throw new Error()` em `!response.ok` — retry wrapper deve preservar este error shape
- `getAuthHeaders()` pattern em admin-service e tenant-service — headers sao resolvidos antes do fetch
- `useOrgTokenExchange` usa `setError(message)` no catch — retry deve esgotar tentativas antes de chegar ao catch

### Integration Points
- `useOrgTokenExchange.ts` doExchange() — ponto de integracao para retry no token exchange
- Cada funcao em `admin-service.ts` e `tenant-service.ts` — ponto de integracao para retry nos services
- `src/platform/lib/` — diretorio para o novo retry utility (criar se nao existir)

</code_context>

<specifics>
## Specific Ideas

- STATE.md nota: "RES-01 (token exchange retry) and RES-02 (retry wrapper) should be implemented as wrapper-first so token exchange uses the same utility" — implementar o wrapper generico primeiro, depois integrar no token exchange e services
- PITFALLS.md regra sobre Promise.allSettled — se retry falhar em uma chamada dentro de Promise.allSettled, cada resultado deve ser tratado individualmente (nao quebrar o pattern existente)

</specifics>

<deferred>
## Deferred Ideas

- Retry no connector-service — ja tem timeout proprio, retry seria escopo diferente
- Circuit breaker pattern — complexidade adicional, avaliar em milestone futuro
- UI de retry manual (botao "tentar novamente") — UX improvement, nao e escopo de resiliencia automatica
- Retry em Edge Functions (server-side) — este phase foca no client-side

</deferred>

---

*Phase: 0128-retry-resilience*
*Context gathered: 2026-03-19*
