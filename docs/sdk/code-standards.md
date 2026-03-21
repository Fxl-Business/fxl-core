---
title: Padroes de Codigo
badge: SDK
description: Convencoes de naming, lint e patterns obrigatorios para projetos spoke
scope: product
sort_order: 80
---

# Padroes de Codigo

Estas sao as regras obrigatorias de codigo para todo projeto spoke FXL. Seguir esses padroes garante consistencia entre projetos, compatibilidade com ferramentas automatizadas (fxl-doctor, audits, CI) e operacao eficiente com Claude Code.

{% callout type="warning" %}
`npx tsc --noEmit` com zero erros e condicao de aceite para qualquer tarefa. Nunca usar `any` como solucao para erros de tipo.
{% /callout %}

---

## Naming Conventions

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ReservationCard.tsx` |
| Hooks | camelCase com prefixo `use` | `useReservations.ts` |
| Services | kebab-case com sufixo `-service` | `reservation-service.ts` |
| Utilitarios | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase | `Reservation`, `ReservationCardProps` |
| Constantes | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `TIMEOUT_MS` |
| Tabelas do banco | snake_case | `reservations` |
| Colunas do banco | snake_case | `check_in_date` |
| Rotas de API | kebab-case | `/api/fxl/entities` |
| Arquivos de config | kebab-case | `eslint.config.js` |

### Regras adicionais de naming

- **Props interfaces** devem ser nomeadas como `{Component}Props` — nunca `Props` generico
- **Event handlers** usam prefixo `handle` no componente e `on` na prop: `onClick` (prop) / `handleClick` (handler)
- **Boolean props** usam prefixo `is`, `has`, ou `should`: `isLoading`, `hasError`, `shouldRefetch`
- **Listas** usam plural: `reservations`, `items`, `entries`
- **Item unico** usa singular: `reservation`, `item`, `entry`

{% callout type="info" %}
Para convencoes de estrutura de diretorios e organizacao de pastas, consulte a pagina [Estrutura de Projeto](/sdk/estrutura-projeto).
{% /callout %}

---

## TypeScript Strict Patterns

Todo spoke FXL usa TypeScript com `strict: true` no `tsconfig.json`. Isso ativa todas as verificacoes estritas, incluindo `noImplicitAny`, `strictNullChecks`, e `strictFunctionTypes`.

### Zero `any`

Nunca usar `any`. Para cada situacao, existe uma alternativa tipada:

```typescript
// ERRADO — any esconde bugs
function processData(data: any) {
  return data.items.map((item: any) => item.name)
}

// CORRETO — tipo explicito
interface DataResponse {
  items: Array<{ name: string; id: number }>
}

function processData(data: DataResponse): string[] {
  return data.items.map((item) => item.name)
}
```

Para valores de tipo desconhecido (ex: respostas de API), usar `unknown` com type guard:

```typescript
// CORRETO — unknown com validacao
function parseApiResponse(data: unknown): Reservation[] {
  if (!Array.isArray(data)) {
    throw new Error('Expected array response')
  }
  return data as Reservation[]
}
```

### `import type` para tipos

Separar imports de valor e de tipo. Isso melhora tree-shaking e deixa claro o que e runtime vs compile-time:

```typescript
// Imports de valor (runtime)
import { useState, useEffect } from 'react'
import { supabase } from '@platform/supabase'

// Imports de tipo (compile-time only)
import type { Reservation, ReservationStatus } from '@/types/reservation'
```

### Discriminated Unions

Usar discriminated unions para tipos que representam estados mutuamente exclusivos:

```typescript
// Tipo de resultado com discriminador 'ok'
type ConnectorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ConnectorError }

// Tipo de erro com discriminador 'type'
type ConnectorError =
  | { type: 'offline'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'server-error'; message: string; statusCode: number }

// Uso com narrowing automatico
function handleResult(result: ConnectorResult<Reservation[]>) {
  if (result.ok) {
    // TypeScript sabe que result.data existe aqui
    console.log(result.data.length)
  } else {
    // TypeScript sabe que result.error existe aqui
    console.error(result.error.message)
  }
}
```

### Zod Validation

Usar Zod para validacao de dados em runtime, especialmente para dados externos (APIs, formularios, configs):

```typescript
import { z } from 'zod'

// Schema define a forma dos dados
const ReservationSchema = z.object({
  id: z.string().uuid(),
  guestName: z.string().min(1),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  totalAmount: z.number().positive(),
})

// Tipo inferido do schema (nao duplicar manualmente)
type Reservation = z.infer<typeof ReservationSchema>

// Validacao de dados externos
function parseReservation(data: unknown): Reservation {
  return ReservationSchema.parse(data)
}
```

### Retorno tipado explicitamente

Funcoes exportadas devem ter tipo de retorno explicito. Isso previne regressoes e melhora a documentacao:

```typescript
// ERRADO — retorno inferido pode mudar silenciosamente
export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// CORRETO — retorno explicito
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
```

{% callout type="warning" %}
Nunca usar `as` para silenciar erros de tipo. Se o TypeScript reclama, o tipo esta errado — corrija o tipo, nao force o cast.
{% /callout %}

---

## ESLint Configuration

Todo spoke usa ESLint v9 com flat config (`eslint.config.js`). A configuracao base inclui regras obrigatorias para TypeScript e organizacao de imports.

### Regras obrigatorias

| Regra | Severidade | Descricao |
|-------|-----------|-----------|
| `@typescript-eslint/no-explicit-any` | error | Proibe `any` explicito |
| `@typescript-eslint/no-unused-vars` | error | Variaveis declaradas devem ser usadas |
| `@typescript-eslint/consistent-type-imports` | warn | Prefer `import type` para tipos |
| `import/order` | warn | Imports agrupados e ordenados |
| `no-console` | warn | Console logs removidos em producao |
| `react/jsx-no-target-blank` | error | Links externos precisam de `rel="noopener"` |
| `react-hooks/rules-of-hooks` | error | Hooks so no top-level de componentes |
| `react-hooks/exhaustive-deps` | warn | Dependencias de useEffect completas |

### Flat Config base

```javascript
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
)
```

### Boundaries plugin (modulos)

Para projetos com arquitetura modular (como o Nexo), usar o plugin `eslint-plugin-boundaries` para impedir imports entre modulos:

```javascript
// Regra de boundaries — cada modulo so importa de shared/ e platform/
{
  plugins: { boundaries },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'modules', allow: ['shared', 'platform'] },
        { from: 'platform', allow: ['shared'] },
        { from: 'shared', allow: ['shared'] },
      ],
    }],
  },
}
```

### Como rodar

```bash
# Verificar erros
npx eslint .

# Corrigir automaticamente o que for possivel
npx eslint . --fix
```

---

## Import Ordering

Imports devem ser agrupados em 5 niveis, separados por linha em branco:

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. Libs externas
import { useAuth } from '@clerk/react'
import { z } from 'zod'

// 3. Path aliases internos (platform, shared, modules)
import { supabase } from '@platform/supabase'
import { Button } from '@shared/ui/button'
import { cn } from '@shared/utils'

// 4. Imports relativos
import { ReservationCard } from './ReservationCard'
import { useReservationFilters } from './useReservationFilters'

// 5. Type imports (sempre por ultimo)
import type { Reservation, ReservationStatus } from '@/types/reservation'
import type { ReservationCardProps } from './ReservationCard'
```

### Path aliases padrao

| Alias | Caminho | Uso |
|-------|---------|-----|
| `@/` | `src/` | Generico (components, pages, hooks, lib, types) |
| `@platform/` | `src/platform/` | Shell, auth, router, services de plataforma |
| `@shared/` | `src/shared/` | UI components, hooks e utils compartilhados |
| `@modules/` | `src/modules/` | Modulos autocontidos |

### Regras adicionais

- **Sem circular imports** — se A importa B e B importa A, extrair para um terceiro modulo
- **Sem barrel exports** (`index.ts` re-exportando tudo) — exceto quando intencional e documentado
- **`import type`** sempre separado dos imports de valor

---

## Component Patterns

Todo componente React em projetos spoke segue o mesmo padrao estrutural:

### Padrao basico de componente

```tsx
import { useState } from 'react'

import { Button } from '@shared/ui/button'
import { cn } from '@shared/utils'

import type { Reservation } from '@/types/reservation'

interface ReservationCardProps {
  reservation: Reservation
  isHighlighted?: boolean
  onSelect?: (id: string) => void
}

export function ReservationCard({
  reservation,
  isHighlighted = false,
  onSelect,
}: ReservationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Early return para estados especiais
  if (!reservation) return null

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        isHighlighted && 'border-indigo-500 bg-indigo-50',
      )}
    >
      <h3 className="font-semibold">{reservation.guestName}</h3>
      <p className="text-sm text-muted-foreground">
        {reservation.checkIn} — {reservation.checkOut}
      </p>
      {isExpanded && (
        <div className="mt-2 text-sm">
          Total: R$ {reservation.totalAmount.toFixed(2)}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Menos' : 'Mais'}
        </Button>
        {onSelect && (
          <Button size="sm" onClick={() => onSelect(reservation.id)}>
            Selecionar
          </Button>
        )}
      </div>
    </div>
  )
}
```

### Regras de componentes

| Regra | Descricao |
|-------|-----------|
| Functional only | Sem class components |
| Named exports | Nunca `export default` |
| Props interface | Nomeada como `{Component}Props` |
| Destructuring | Props desestruturadas no argumento da funcao |
| Early returns | Para null/loading/error states antes do JSX principal |
| Composicao | Usar `children` para composicao simples, render props para composicao complexa |
| Hooks locais | Hooks de uso unico ficam no mesmo arquivo do componente |
| Estilos | Tailwind utilities via `className`, `cn()` para condicionais |

### Composicao via children

```tsx
interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

// Uso
<Card title="Reserva #123">
  <ReservationDetails reservation={reservation} />
</Card>
```

---

## Hook Patterns

Hooks customizados seguem convencoes de naming, retorno tipado, e separacao de responsabilidades.

### Hook de data fetching

```typescript
import { useState, useEffect } from 'react'

import { getReservations } from '../services/reservation-service'

import type { Reservation } from '@/types/reservation'

interface UseReservationsResult {
  reservations: Reservation[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useReservations(status?: string): UseReservationsResult {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = () => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getReservations(status)
      .then((data) => {
        if (!cancelled) {
          setReservations(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }

  useEffect(() => {
    return fetchData()
  }, [status])

  return { reservations, loading, error, refetch: fetchData }
}
```

### Hook de UI state

```typescript
import { useState, useCallback } from 'react'

interface UseToggleResult {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useToggle(initial = false): UseToggleResult {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
```

### Regras de hooks

| Regra | Descricao |
|-------|-----------|
| Prefixo `use` | Obrigatorio para todos os hooks |
| Retorno tipado | Interface ou type nomeado para o retorno |
| Separacao | Data fetching separado de UI state |
| Localizacao | Hooks compartilhados em `src/hooks/`, hooks locais junto ao componente |
| Cleanup | Sempre cancelar side effects no return do useEffect |
| Dependencias | Array de dependencias completo (ESLint `exhaustive-deps` enforces) |

---

## Service Patterns

Services encapsulam logica de acesso a dados e integracao com APIs. Todo service segue o padrao de funcoes puras exportadas com tipagem forte.

### Padrao basico de service

```typescript
// reservation-service.ts

import { supabase } from '@platform/supabase'
import { withRetry } from '@platform/lib/retry'

import type { Reservation } from '@/types/reservation'

/**
 * Busca todas as reservas, filtradas por status.
 * Usa retry com backoff exponencial para resiliencia.
 */
export async function getReservations(
  status?: string,
): Promise<Reservation[]> {
  return withRetry(async () => {
    let query = supabase
      .from('reservations')
      .select('*')
      .order('check_in', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch reservations: ${error.message}`)

    return data ?? []
  })
}

/**
 * Busca uma reserva por ID.
 */
export async function getReservationById(
  id: string,
): Promise<Reservation | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch reservation: ${error.message}`)

  return data
}
```

### Pattern ConnectorResult para APIs externas

Quando o service chama APIs externas (nao Supabase), usar o pattern `ConnectorResult<T>` para tratamento explicito de sucesso e erro:

```typescript
type ConnectorResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { type: string; message: string } }

export async function fetchExternalData(
  url: string,
  apiKey: string,
): Promise<ConnectorResult<ExternalData[]>> {
  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
    })

    if (!response.ok) {
      return {
        ok: false,
        error: { type: 'server-error', message: `HTTP ${response.status}` },
      }
    }

    const data = await response.json()
    return { ok: true, data: data ?? [] }
  } catch {
    return {
      ok: false,
      error: { type: 'offline', message: 'Network error' },
    }
  }
}
```

### withRetry para chamadas criticas

Usar `withRetry` em chamadas que podem falhar por problemas de rede ou servidor:

```typescript
import { withRetry } from '@platform/lib/retry'

// Retry padrao: 3 tentativas, backoff exponencial (1s, 2s, 4s)
const data = await withRetry(() => fetchFromApi(url))

// Retry customizado
const data = await withRetry(
  () => fetchFromApi(url),
  { maxRetries: 5, baseDelay: 500, backoffFactor: 2 },
)

// Com AbortSignal para cancelamento
const controller = new AbortController()
const data = await withRetry(
  () => fetchFromApi(url),
  { signal: controller.signal },
)
```

### Regras de services

| Regra | Descricao |
|-------|-----------|
| Sufixo `-service` | Nome do arquivo sempre termina com `-service.ts` |
| Funcoes puras | Sem classes — funcoes exportadas diretamente |
| Retorno tipado | Tipo de retorno explicito em toda funcao exportada |
| Fallbacks | Sempre usar fallback em dados de API: `data ?? []`, `count ?? 0` |
| ConnectorResult | Pattern obrigatorio para APIs externas |
| withRetry | Obrigatorio em chamadas criticas (auth, token exchange, dados essenciais) |

Para detalhes completos sobre configuracao de tentativas, backoff exponencial e call sites criticos, ver [Retry com Backoff](/sdk/retry-backoff).

{% callout type="warning" %}
Nunca acessar campos de resposta de API sem fallback. Sempre usar `?? []`, `?? 0`, `?? null` para evitar crashes em respostas inesperadas.
{% /callout %}

---

## Commit Conventions

Todo commit segue o formato `tipo(escopo): mensagem` com tipos padronizados:

| Tipo | Quando usar | Exemplo |
|------|------------|---------|
| `docs` | Alteracoes em documentacao | `docs: update getting-started page` |
| `app` | Alteracoes no codigo da aplicacao | `app: add reservation list page` |
| `infra` | Infraestrutura, CI, configs | `infra: add vitest to CI workflow` |
| `tool(nome)` | Alteracoes em tools | `tool(wireframe): add filter bar component` |
| `[client-slug]` | Alteracoes de cliente | `beach-houses: update branding colors` |
| `fix` | Correcao de bugs | `fix: resolve token refresh on org switch` |
| `test` | Adicao/alteracao de testes | `test: add auth service unit tests` |

### Regras de commit

- Mensagem em ingles, minuscula, sem ponto final
- Primeira linha com maximo 72 caracteres
- Commits atomicos — cada commit faz uma coisa
- Nunca commitar `.env.local`, credenciais, ou secrets

---

## Quality Gates

Todo spoke FXL deve passar nesses gates antes de merge:

```bash
# 1. TypeScript — zero erros e condicao de aceite
npx tsc --noEmit

# 2. ESLint — zero erros
npx eslint .

# 3. Health check completo (inclui 1 e 2 + validacoes extras)
./fxl-doctor.sh

# 4. Testes (se configurados)
npx vitest run
```

{% callout type="warning" %}
Nunca assumir que "compila = funciona". TypeScript garante tipos, nao comportamento. Verificacao visual no browser e obrigatoria para qualquer alteracao em componentes visuais.
{% /callout %}

### Pipeline CI

O GitHub Actions roda automaticamente em push para `main` e em PRs. O pipeline inclui:

1. `npm install` (nao `npm ci` — para evitar problemas com lockfile)
2. `npx tsc --noEmit`
3. `npx vitest run` (se configurado)
4. Branch protection bloqueia merge se qualquer step falhar
