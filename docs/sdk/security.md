---
title: Seguranca
badge: SDK
description: Autenticacao, autorizacao, headers e gestao de secrets
scope: product
sort_order: 100
---

# Seguranca

Esta pagina documenta o pipeline completo de seguranca para projetos spoke da FXL — da autenticacao com Clerk, passando pelo JWT bridge para o Supabase, ate RLS por tenant. Tambem cobre o pattern `ConnectorResult<T>` para validacao de APIs externas, protecao de variaveis de ambiente e regras de seguranca derivadas de bugs reais.

## Autenticacao com Clerk

O Clerk e o provider de autenticacao compartilhado entre Hub e spokes. Cada spoke tem sua instancia Clerk independente.

### Setup basico

O `ClerkProvider` envolve a aplicacao com a publishable key:

```tsx
import { ClerkProvider } from '@clerk/react'

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {/* rotas */}
    </ClerkProvider>
  )
}
```

### Hooks principais

| Hook | Uso |
|------|-----|
| `useAuth()` | `isLoaded`, `isSignedIn` — estado de autenticacao |
| `useSession()` | `session.getToken()` — obter token para requests |
| `useUser()` | Dados do usuario logado |
| `useOrganizationList()` | Lista de organizacoes do usuario |
| `useOrganization()` | Organizacao ativa |

### ProtectedRoute — pattern de protecao de rotas

O ProtectedRoute e o gate que bloqueia renderizacao ate a autenticacao e o token exchange estarem completos:

```tsx
import { useAuth, RedirectToSignIn, useOrganizationList } from '@clerk/react'
import { useOrgToken } from '@platform/tenants/OrgTokenContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const { userMemberships, isLoaded: orgsLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const { isReady: tokenReady, error: tokenError } = useOrgToken()

  // 1. Clerk nao carregou — loading
  if (!isLoaded) return <Loading />

  // 2. Nao autenticado — redireciona
  if (!isSignedIn) return <RedirectToSignIn />

  // 3. Orgs nao carregaram — loading
  if (!orgsLoaded) return <Loading />

  // 4. Sem organizacao — redireciona
  if (userMemberships?.data?.length === 0 && !activeOrg) {
    return <Navigate to="/solicitar-acesso" replace />
  }

  // 5. Erro no token exchange — mostra erro
  if (tokenError) return <Error message={tokenError} />

  // 6. Token exchange em andamento — aguarda
  if (!tokenReady) return <Loading text="Autenticando..." />

  return <>{children}</>
}
```

{% callout type="warning" %}
O ProtectedRoute deve verificar AMBOS: `tokenError` (mostra erro) e `!tokenReady` (mostra loading). Renderizar children antes do token exchange completar resulta em queries ao Supabase sem org_id — dados aparecem vazios.
{% /callout %}

### Armadilhas conhecidas

**`useOrganizationList` pode retornar `data: []` antes de hidratar.** Apos F5 (full reload), `isLoaded: true` com `data: []` pode aparecer brevemente antes dos memberships reais carregarem. Sempre combinar com check de `activeOrg` antes de redirecionar.

```ts
// ERRADO — pode ser estado transitorio
if (userMemberships?.data?.length === 0) {
  return <Navigate to="/criar-empresa" />
}

// CERTO — confirma com activeOrg
if (userMemberships?.data?.length === 0 && !activeOrg) {
  return <Navigate to="/solicitar-acesso" replace />
}
```

**Clerk session token default NAO inclui org_id.** `session.getToken()` retorna o token pessoal do usuario, sem claims de organizacao (`org_id`, `org_role`). Para obter o org_id no backend, passar no body da request:

```ts
// Frontend — passa org_id no body
const response = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${clerkToken}` },
  body: JSON.stringify({ org_id: activeOrg.id }),
})

// Edge function — prefere JWT claim, fallback para body
const orgId = jwtPayload.org_id ?? bodyOrgId
```

## JWT Bridge: Clerk -> Supabase

### O problema

Clerk usa RS256 (JWKS — par de chaves publica/privada). Supabase usa HS256 (JWT secret compartilhado). Sao incompativeis — o gateway do Supabase rejeita tokens Clerk com `{"code": 401, "message": "Invalid JWT"}`.

### A solucao

Uma Edge Function (`auth-token-exchange`) recebe o token Clerk, valida via JWKS, e gera um novo JWT HS256 com claims `org_id` e `super_admin` que o Supabase entende.

```
Frontend (Clerk)              Edge Function                    Supabase
session.getToken() -----> POST /auth-token-exchange -----> access_token (HS256)
+ org_id no body          valida RS256 via JWKS             com claims org_id,
                          gera JWT HS256                    super_admin, sub
```

### exchangeToken — o client-side

```ts
export async function exchangeToken(
  clerkToken: string,
  orgId: string,
  signal?: AbortSignal,
): Promise<TokenExchangeResult> {
  const url = `${FUNCTIONS_URL}/auth-token-exchange`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({ org_id: orgId }),
    signal,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(`Token exchange failed (${response.status}): ${body.error ?? 'Unknown error'}`)
  }

  return (await response.json()) as TokenExchangeResult
}
```

### OrgTokenProvider — lifecycle do token

O `OrgTokenProvider` gerencia o ciclo de vida completo do token:

1. **Exchange no mount** — troca Clerk token por Supabase JWT assim que session + org estao prontos
2. **Exchange no org switch** — quando o usuario muda de organizacao, aborta requests anteriores e faz novo exchange
3. **AbortController** — cancela requests em voo quando org muda (evita race conditions)
4. **withRetry** — retenta com backoff exponencial (3 tentativas, delay inicial 1s)
5. **Token override** — suporte a impersonation (admin vendo dados de outra org)

```tsx
// Trecho do OrgTokenProvider — exchange com retry e abort
const result = await withRetry(
  () => exchangeToken(clerkToken, activeOrg!.id, abortControllerRef.current.signal),
  { maxRetries: 3, baseDelay: 1000, backoffFactor: 2 },
)
tokenRef.current = result.access_token
setOrgToken(result.access_token)
setIsReady(true)
```

**AbortController no org switch:**

```tsx
// Ao mudar de org, abortar requests anteriores
if (orgChanged) {
  abortControllerRef.current.abort()
  abortControllerRef.current = new AbortController()
}
```

### Deploy da Edge Function

{% callout type="warning" %}
A edge function de token exchange DEVE ser deployada com `verify_jwt: false`. O gateway do Supabase usa HS256 para verificar JWTs, mas tokens Clerk sao RS256 — sao incompativeis. Se `verify_jwt` estiver ativo, o gateway rejeita o token antes da funcao executar.
{% /callout %}

**Sinal de alerta:** Resposta `{"code": 401, "message": "Invalid JWT"}` com campos `code` e `message` (nao `error`) vem do **gateway do Supabase**, nao do codigo da funcao. A funcao nunca executou.

### Secrets da Edge Function

Usar `JWT_SIGNING_SECRET` (nunca `SUPABASE_JWT_SECRET`). O Supabase reserva o prefixo `SUPABASE_` para variaveis internas.

```bash
# ERRADO — rejeitado pelo Supabase
supabase secrets set SUPABASE_JWT_SECRET=xxx

# CERTO
supabase secrets set JWT_SIGNING_SECRET=xxx
```

## RLS por Tenant

O RLS (Row Level Security) e o mecanismo que isola dados entre organizacoes no nivel do banco de dados. As claims do JWT chegam ao Supabase via `current_setting('request.jwt.claims', true)`.

O Nexo usa tres niveis de RLS que evoluiram ao longo das migrations:

- **Tier 1** — Filtragem basica por `org_id` (migration 008)
- **Tier 2** — Super admin bypass + org_id (migration 009)
- **Tier 3** — Acesso por escopo: `product` (compartilhado) vs `tenant` (isolado) (migration 020)

Para o padrao completo de RLS em tres niveis com exemplos de SQL, veja [Banco de Dados](/sdk/database#row-level-security-rls).

### Regras criticas

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` e **obrigatorio** em toda tabela. Sem isso, policies sao ignoradas.
- Tier 2 (com super_admin bypass) e o minimo para tabelas novas.
- Docs `product` sao legiveis por qualquer usuario autenticado. Docs `tenant` so aparecem para a org dona.
- `archived_at IS NULL` deve ser incluido na branch de org_id para esconder dados soft-deleted (migration 019).

## Protecao de Environment Variables

### Regra do prefixo VITE_

O prefixo `VITE_` expoe a variavel ao browser — o Vite injeta no bundle JavaScript. Secrets NUNCA recebem esse prefixo.

```
# Variaveis publicas (injetadas no bundle)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...

# Secrets (server-side only, SEM prefixo VITE_)
FXL_API_KEY=<chave-gerada>
JWT_SIGNING_SECRET=<jwt-secret>
CLERK_SECRET_KEY=sk_live_...
```

### Regras

- `.env.local` nunca e commitado — `.env.example` sim, com placeholders
- Secrets de edge function: usar `supabase secrets set` ou Supabase Dashboard
- Nunca nomear secrets com prefixo `SUPABASE_` (reservado pelo Supabase)
- Nunca expor `CLERK_SECRET_KEY` ou `service_role_key` no frontend

## ConnectorResult\<T\> — Validacao de APIs Externas

O `ConnectorResult<T>` e o padrao FXL para **todas** as chamadas a APIs externas, nao apenas o modulo connector. Ele garante que erros sao tratados de forma tipada e previsivel.

### Discriminated union

```ts
type ConnectorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ConnectorError }

type ConnectorError =
  | { type: 'offline'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'server-error'; message: string; statusCode: number }
  | { type: 'invalid-manifest'; message: string }
  | { type: 'unknown'; message: string }
```

### Pattern de uso

```ts
const result = await fetchManifest(baseUrl)
if (!result.ok) {
  switch (result.error.type) {
    case 'offline':
      // Mostrar estado offline no card
      break
    case 'unauthorized':
      // Retry com token refreshed, depois mostrar "Reconectar"
      break
    case 'server-error':
      // Mostrar erro no card, nao propagar para a app
      break
  }
  return
}
// result.data e tipado como T
const manifest = result.data
```

### fetchWithTimeout — timeout em chamadas externas

Toda chamada a API externa usa timeout de 5s via AbortController:

```ts
async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}
```

### withRetry — retry com backoff exponencial

O `withRetry` e a utility generica para retry com backoff exponencial, suporte a AbortSignal e deteccao de erros retryable:

```ts
const result = await withRetry(
  () => exchangeToken(clerkToken, orgId, signal),
  { maxRetries: 3, baseDelay: 1000, backoffFactor: 2 },
)
```

Regras do retry:
- Erros de rede (`TypeError` do fetch) sao retryable
- Erros 5xx sao retryable
- Erros 4xx NAO sao retryable (falha imediata)
- Se `signal` for abortado, lanca `AbortError` imediatamente

## Regras de Seguranca em APIs

Regras derivadas de bugs reais. Todas sao **obrigatorias**, nao sugestoes.

### Promise.allSettled para fetches independentes

Quando duas ou mais chamadas sao independentes, usar `Promise.allSettled`. Com `Promise.all`, se uma falha, TODAS falham — dados validos sao perdidos.

```ts
// ERRADO — se listUsers falha, tenants tambem some
const [tenants, users] = await Promise.all([listTenants(), listUsers()])

// CERTO — cada resultado e tratado independentemente
const [tenantsResult, usersResult] = await Promise.allSettled([
  listTenants(),
  listUsers(),
])
if (tenantsResult.status === 'fulfilled') setTenantCount(tenantsResult.value.totalCount)
if (usersResult.status === 'fulfilled') setUserCount(usersResult.value.totalCount)
```

### Null safety com fallbacks

Nunca confiar que um campo de resposta de API existe. Sempre usar fallback:

```ts
// ERRADO — crash se data.members for undefined
setMembers(data.members)

// CERTO
setMembers(data.members ?? [])
```

Se a resposta pode ser um tipo completamente diferente do esperado, validar o shape:

```ts
if (!data.members || !Array.isArray(data.members)) {
  console.error('Unexpected response shape:', data)
  setMembers([])
  return
}
```

### Query params em edge functions (nao sub-paths)

O gateway do Supabase pode remover sub-paths de URLs de edge functions. Usar query params para sub-recursos:

```ts
// ERRADO — sub-path pode ser removido pelo gateway
fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}/members`)

// CERTO — query param e preservado
fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}?include=members`)
```

### Formato de resposta nao e consistente

Nunca assumir que endpoints diferentes seguem o mesmo formato. Verificar cada um:

```ts
// Pattern seguro para lidar com ambos os formatos
const userList = Array.isArray(rawData) ? rawData : (rawData.data ?? [])
```

### Timeout em chamadas externas

Toda chamada a API externa deve usar timeout de 5 segundos via AbortController. Sem timeout, uma API lenta pode travar a interface indefinidamente.

## Checklist de Edge Function

Antes de considerar uma edge function pronta:

- [ ] Arquivo criado em `supabase/functions/{nome}/index.ts`
- [ ] CORS headers configurados (OPTIONS + headers em todas as respostas)
- [ ] Auth validada internamente (Bearer token + claims)
- [ ] `verify_jwt: false` no deploy (se faz auth interna com tokens Clerk)
- [ ] Secrets sem prefixo `SUPABASE_` (usar `JWT_SIGNING_SECRET`, nao `SUPABASE_JWT_SECRET`)
- [ ] Formato de resposta da API externa verificado (nao assumir)
- [ ] Null safety em todos os campos de resposta (`?? []`, `?? 0`)
- [ ] Query params para sub-recursos (nao sub-paths)
- [ ] Teste end-to-end (frontend -> edge function -> API externa)

## Checklist de Seguranca por Pagina

Antes de considerar uma pagina com dados de API pronta:

- [ ] `Promise.allSettled` para fetches independentes
- [ ] Fallbacks (`?? []`, `?? 0`) em todos os campos de resposta
- [ ] Cards de contagem sincronizados com listas carregadas (`.length` dos dados reais)
- [ ] Estado de loading, erro e vazio tratados
