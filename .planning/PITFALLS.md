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

## 9. Edge function redeployada sem --no-verify-jwt

**Bug:** `admin-tenants` foi atualizada (phase 108) e redeployada via MCP sem `verify_jwt: false`. O gateway do Supabase voltou a verificar o JWT, rejeitando tokens Clerk com `{"code":401,"message":"Invalid JWT"}`. O erro voltou a acontecer apesar de ter sido corrigido antes.

**Sinal de alerta:** Resposta `{"code": 401, "message": "Invalid JWT"}` com os campos `code` e `message` (em vez de `error`) vem do **gateway do Supabase**, não do código da função. Isso significa que a função nunca foi executada — o JWT foi rejeitado antes.

**Regra:** Funções que validam auth internamente (decodificando JWT manualmente) DEVEM ser deployadas com `verify_jwt: false`. O gateway do Supabase usa HS256 (JWT secret), mas os tokens Clerk usam RS256 (chaves do Clerk). Eles são incompatíveis.

```bash
# Verificar configuração atual das funções
make check-functions

# Redeploy correto (via MCP)
mcp__supabase__deploy_edge_function com verify_jwt: false
```

**Funções que PRECISAM de verify_jwt: false:**
- `admin-tenants` — valida super_admin claim internamente
- `admin-users` — valida super_admin claim internamente

**Prevenção:** Antes de fazer redeploy de qualquer edge function, rodar `make check-functions` antes e depois para confirmar o estado.

---

## 10. Edge function existente no repo mas nao deployada (auth-token-exchange)

**Bug:** `auth-token-exchange/index.ts` existia no repositorio desde a implementacao multi-tenant, mas nunca foi deployado no Supabase. O frontend recebia CORS error ao tentar trocar o Clerk token por um JWT do Supabase, bloqueando o acesso a qualquer organizacao.

**Regra:** Reforco da regra #2. Apos criar qualquer edge function, verificar imediatamente com `mcp__supabase__list_edge_functions` se ela aparece como ACTIVE. CORS error = function nao deployada ate prova em contrario.

---

## 11. Supabase Edge Functions nao aceitam secrets com prefixo SUPABASE_

**Bug:** Ao tentar salvar `SUPABASE_JWT_SECRET` nos Edge Function Secrets do Supabase, a UI rejeitou com "Name must not start with the SUPABASE_ prefix". O Supabase reserva esse namespace para variaveis internas injetadas automaticamente.

**Regra:** Nomear secrets customizados sem o prefixo `SUPABASE_`. Usar nomes como `JWT_SIGNING_SECRET` em vez de `SUPABASE_JWT_SECRET`.

**Funcoes afetadas:** `auth-token-exchange`, `admin-tenants` — ambas usam `Deno.env.get('JWT_SIGNING_SECRET')`.

---

## 12. Clerk session token default nao inclui org_id

**Bug:** `session.getToken()` sem parametros retorna o token pessoal do usuario, sem claims de organizacao (`org_id`, `org_role`). A edge function recebia o token sem `org_id` e rejeitava com 400.

**Regra:** O Clerk default session token NAO inclui org claims. Para obter `org_id` no backend:
1. Passar `org_id` no body da request (a assinatura JWKS garante que o usuario e autentico)
2. Ou usar um JWT template customizado no Clerk Dashboard que inclua `{{org.id}}`

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

---

## 13. useRef para estado de UI causa race conditions em ProtectedRoute

**Bug:** `useOrgTokenExchange` usava `useRef` para `isReady` e `error`. Como refs nao disparam re-renders, o ProtectedRoute renderizava os children antes do token exchange completar. Queries ao Supabase eram feitas com anon key (sem org_id), e RLS bloqueava os dados — tudo aparecia vazio.

**Regra:** Estado que controla renderizacao condicional (gates, loading states, error states) DEVE usar `useState`, nunca `useRef`. Refs sao para valores que nao afetam a UI diretamente.

```ts
// ERRADO — nao dispara re-render
const isReadyRef = useRef(false)
isReadyRef.current = true // UI nao atualiza

// CERTO — dispara re-render
const [isReady, setIsReady] = useState(false)
setIsReady(true) // UI atualiza
```

---

## 14. ProtectedRoute deve esperar token exchange completar

**Bug:** ProtectedRoute verificava apenas `tokenError` para bloquear renderizacao. Quando `error=null` e `isReady=false` (exchange em andamento), os children renderizavam prematuramente. Componentes faziam queries ao Supabase sem org token — dados apareciam vazios, wireframe nao carregava.

**Regra:** O gate de autenticacao deve verificar AMBOS os estados negativos:
1. `tokenError` — mostra erro
2. `!tokenReady` — mostra "Autenticando..."

Soh renderizar children quando `tokenReady === true` e `tokenError === null`.

**Otimizacao:** Quando navegando dentro do SPA (mesmo tab), o token jah existe em memoria. Inicializar `isReady` com `getOrgAccessToken() !== null` para evitar flash de "Autenticando..." desnecessario.

---

## 15. Sidebar fallback com conteudo FXL-especifico para todas as orgs

**Bug:** Quando `useDocsNav()` retornava vazio (org sem docs ou query falhava), o Sidebar fazia fallback para `m.navChildren` do manifest — que continha a arvore de navegacao completa da FXL (Fase 1-6, Padroes, etc). Todas as organizacoes viam docs internos da FXL.

**Regra:** Fallbacks de navegacao NUNCA devem conter conteudo especifico de uma organizacao. Se nao ha dados para mostrar, mostrar vazio (nao conteudo hardcoded).

```ts
// ERRADO — fallback vaza dados da FXL para outras orgs
return m.navChildren ?? []

// CERTO — sem dados = vazio
return []
```

---

## 16. React Router: Outlet obrigatorio em layout routes

**Bug:** Rota layout do wireframe usava `<ProtectedRoute><>{/* vazio */}</></ProtectedRoute>` como element. Sem `<Outlet />`, os child routes nunca renderizavam — tela branca sem erros no console.

**Regra:** Toda layout route (Route sem path, usada para wrapping) DEVE incluir `<Outlet />` no seu element para que as child routes aparecam.

```tsx
// ERRADO — children nunca renderizam
<Route element={<ProtectedRoute><></></ProtectedRoute>}>
  <Route path="/foo" element={<Foo />} />
</Route>

// CERTO
<Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
  <Route path="/foo" element={<Foo />} />
</Route>
```

---

## 17. Clerk useOrganizationList pode retornar data=[] antes de hidratar

**Bug:** Apos F5 (full page reload), `useOrganizationList` retornava `isLoaded: true` com `data: []` brevemente antes de popular os memberships reais. O ProtectedRoute via `length === 0`, redirecionava para `/criar-empresa`, que via que o user tinha orgs e redirecionava para `/`. Resultado: F5 em qualquer pagina mandava o usuario para a home.

**Regra:** O check de "usuario sem organizacao" deve combinar multiplos sinais antes de redirecionar. Nao confiar apenas em `userMemberships.data.length === 0`.

```ts
// ERRADO — pode ser estado transitorio
if (userMemberships?.data?.length === 0) {
  return <Navigate to="/criar-empresa" />
}

// CERTO — confirma com activeOrg tambem
if (userMemberships?.data?.length === 0 && !activeOrg) {
  return <Navigate to="/criar-empresa" />
}
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
- [ ] Function deployada com `verify_jwt: false` se faz auth interna (não usa gateway Supabase para verificar JWT)
- [ ] Secrets nomeados sem prefixo `SUPABASE_` (usar `JWT_SIGNING_SECRET`, nao `SUPABASE_JWT_SECRET`)
- [ ] Verificar configuração após deploy: `make check-functions`
- [ ] Chamada testada end-to-end (frontend → edge function → API externa)

## Checklist para paginas com dados de API

Antes de considerar uma pagina com dados de API pronta:

- [ ] `Promise.allSettled` para fetches independentes
- [ ] Fallbacks (`?? []`, `?? 0`) em todos os campos de resposta
- [ ] Cards de contagem sincronizados com listas carregadas
- [ ] Estado de loading, erro e vazio tratados
- [ ] Console.log de debug removidos apos resolucao
