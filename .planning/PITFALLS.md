# Pitfalls — Erros Recorrentes e Regras Derivadas

*Documento vivo. Atualizar sempre que um bug revelar um padrao que pode se repetir.*

---

## 1. Promise.all mascara falhas independentes

**Bug:** AdminDashboard usava `Promise.all([listTenants(), listUsers()])`. Quando `admin-users` falhou (edge function nao deployada), ambos os contadores ficaram em 0 — o usuario viu 0 tenants mesmo existindo 3.

**Regra:** Quando duas ou mais chamadas sao independentes (a falha de uma nao invalida a outra), usar `Promise.allSettled` e tratar cada resultado individualmente.

```ts
// ERRADO
const [tenants, users] = await Promise.all([listTenants(), listUsers()])

// CERTO
const [tenantsResult, usersResult] = await Promise.allSettled([listTenants(), listUsers()])
if (tenantsResult.status === 'fulfilled') setTenantCount(tenantsResult.value.totalCount)
if (usersResult.status === 'fulfilled') setUserCount(usersResult.value.totalCount)
```

---

## 2. Edge function criada mas nao deployada

**Bug:** `admin-users/index.ts` existia no repositorio mas nunca foi deployado no Supabase. O frontend recebia CORS error (a resposta do gateway Supabase sem a function nao inclui headers CORS).

**Regra:** Toda edge function nova deve ser deployada imediatamente apos criacao. Adicionar ao checklist de criacao de edge functions:
1. Criar `supabase/functions/{nome}/index.ts`
2. Deployar via `mcp__supabase__deploy_edge_function` ou `supabase functions deploy {nome}`
3. Verificar deploy via `mcp__supabase__list_edge_functions`
4. Testar chamada real (curl ou frontend) para confirmar CORS e resposta

**Sinal de alerta:** Erro de CORS em chamada a edge function quase sempre significa que a function nao esta deployada (o gateway retorna erro sem os headers CORS configurados na function).

---

## 3. Formato de resposta da Clerk API nao e consistente

**Bug:** O codigo assumia que `/v1/users` retornava `{ data: [...], total_count: N }` (igual a `/v1/organizations`). Na verdade, `/v1/users` retorna um array plano `[...]`. Resultado: `rawData.data ?? []` devolvia `[]` mesmo com usuarios existentes.

**Regra:** Sempre verificar o formato real de cada endpoint da Clerk API antes de implementar. Nunca assumir que endpoints diferentes seguem o mesmo formato de resposta.

```ts
// Pattern seguro para lidar com ambos os formatos
const userList = Array.isArray(rawData) ? rawData : (rawData.data ?? [])
```

**Endpoints conhecidos:**
| Endpoint | Formato de resposta |
|----------|-------------------|
| `/v1/users` | Array plano `User[]` |
| `/v1/organizations` | `{ data: Org[], total_count: number }` |
| `/v1/organizations/{id}/memberships` | `{ data: Membership[], total_count: number }` |

---

## 4. Clerk /v1/users nao inclui organization_memberships

**Bug:** O frontend esperava que cada usuario retornado pela Clerk API tivesse um campo `organization_memberships`. Esse campo nao vem no `/v1/users` por padrao. Todos os usuarios apareciam sem organizacao.

**Regra:** Quando precisar de dados de memberships junto com usuarios, fazer fetch separado:
1. Buscar todos os usuarios (`/v1/users`)
2. Buscar todas as organizacoes (`/v1/organizations`)
3. Para cada org, buscar memberships (`/v1/organizations/{id}/memberships`)
4. Construir mapa `userId → orgs[]` no servidor

**Nota:** Fazer isso na edge function (server-side), nunca no frontend, para nao expor a CLERK_SECRET_KEY e para consolidar N+1 requests em uma unica chamada.

---

## 5. Supabase edge functions: sub-paths sao removidos pelo gateway

**Bug:** O frontend chamava `/admin-tenants/{orgId}/members`. O Supabase gateway removeu o sub-path `/members`, fazendo a edge function rotear para `handleGetOrg` em vez de `handleListMembers`. A resposta era o detalhe da org (sem campo `members`), e o frontend mostrava "Nenhum membro encontrado" sem erro.

**Regra:** Em edge functions do Supabase, usar query parameters para sub-recursos em vez de sub-paths.

```ts
// ERRADO — sub-path pode ser removido pelo gateway
fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}/members`)

// CERTO — query param e preservado
fetch(`${FUNCTIONS_URL}/admin-tenants/${orgId}?include=members`)
```

**Na edge function:** suportar ambos os formatos para robustez:
```ts
const isMembers = orgId !== null && (
  pathParts.includes('members') ||
  url.searchParams.get('include') === 'members'
)
```

---

## 6. Null safety em respostas de API

**Bug:** `setMembers(data.members)` crashava com tela branca quando `data.members` era `undefined` (a resposta era detalhe da org, nao lista de membros). O React tentava iterar `undefined.map()`.

**Regra:** Sempre adicionar fallback (`?? []`, `?? {}`, `?? 0`) ao acessar campos de respostas de API. Nunca confiar que o campo existe.

```ts
// ERRADO
setMembers(data.members)

// CERTO
setMembers(data.members ?? [])
```

**Extensao:** Se a resposta pode ser um tipo completamente diferente do esperado (como receber org detail em vez de members list), adicionar validacao do shape:
```ts
if (!data.members || !Array.isArray(data.members)) {
  console.error('Unexpected response shape:', data)
  setMembers([])
  return
}
```

---

## 7. Card de contagem desatualizado em relacao aos dados carregados

**Bug:** O InfoCard "Membros" mostrava `tenant.membersCount` (vindo da Clerk API single-org que retorna 0 sem `include_members_count=true`), enquanto a lista de membros logo abaixo mostrava os membros corretos buscados separadamente.

**Regra:** Quando uma pagina exibe tanto um card de contagem quanto uma lista dos mesmos dados, o card deve preferir o `.length` dos dados carregados, com fallback para o valor da API.

```tsx
// ERRADO — usa valor da API que pode estar desatualizado ou incompleto
<InfoCard label="Membros" value={tenant.membersCount} />

// CERTO — usa dados reais quando disponiveis
<InfoCard
  label="Membros"
  value={!membersLoading && members.length > 0 ? members.length : tenant.membersCount}
/>
```

**Principio geral:** Nunca exibir dois numeros derivados da mesma informacao que possam divergir. Se a lista mostra 3 itens, o card deve mostrar 3.

---

## 8. Clerk API: include_members_count nao e padrao

**Bug:** A chamada `/v1/organizations/{id}` retorna `members_count: 0` a menos que o parametro `include_members_count=true` seja passado. A chamada de listagem (`/v1/organizations?include_members_count=true`) funciona corretamente.

**Regra:** Ao buscar organizacoes da Clerk API, sempre incluir `include_members_count=true` se o count for necessario.

```ts
// Listagem — ja usa o parametro
fetch(`${CLERK_API_BASE}/organizations?limit=100&include_members_count=true`)

// Detalhe — tambem precisa do parametro
fetch(`${CLERK_API_BASE}/organizations/${orgId}?include_members_count=true`)
```

---

## Checklist para novas edge functions

Antes de considerar uma edge function pronta:

- [ ] Arquivo criado em `supabase/functions/{nome}/index.ts`
- [ ] CORS headers configurados (OPTIONS + headers em todas as respostas)
- [ ] Auth validada (Bearer token + super_admin claim)
- [ ] Formato de resposta da API externa verificado (nao assumir)
- [ ] Null safety em todos os campos de resposta
- [ ] Query params usados para sub-recursos (nao sub-paths)
- [ ] Function deployada no Supabase
- [ ] Chamada testada end-to-end (frontend → edge function → API externa)

## Checklist para paginas com dados de API

Antes de considerar uma pagina com dados de API pronta:

- [ ] `Promise.allSettled` para fetches independentes
- [ ] Fallbacks (`?? []`, `?? 0`) em todos os campos de resposta
- [ ] Cards de contagem sincronizados com listas carregadas
- [ ] Estado de loading, erro e vazio tratados
- [ ] Console.log de debug removidos apos resolucao
