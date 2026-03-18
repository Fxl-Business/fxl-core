# Phase 108: Admin Enhancements - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin pode gerenciar o ciclo de vida de membros em qualquer org (add/remove via Clerk API) e
inspecionar qualquer org como se fosse um de seus membros (impersonation via Supabase JWT override).

Scope fixo:
- TenantDetailPage: add member, remove member, "Entrar como esta org" button
- ImpersonationContext: global state para modo impersonation
- Impersonation banner: indicador visual abaixo do TopNav enquanto admin está em org impersonada
- admin-tenants edge function: novos handlers para add/remove member
- auth-token-exchange edge function: suporte a admin override de org_id

Fora de escopo: criar novo tenant, editar metadados de tenant, módulos, conectores.

</domain>

<decisions>
## Implementation Decisions

### Member Management — Add Member

[auto] Q: "Como admin adiciona membro?" → Selected: "Input field para userId + botão Add, inline na seção Membros do TenantDetailPage"

- Input de texto para Clerk userId (`user_xxx`) acima da lista de membros existente
- Botão "Adicionar" ao lado do input
- Após submit: POST para admin-tenants?action=add-member com { orgId, userId, role: 'org:member' }
- Role padrão ao adicionar: `org:member` (não expor role picker nesta fase)
- Sucesso: re-fetch listOrgMembers, limpar input
- Erro: exibir mensagem de erro inline abaixo do input (sem toast, sem modal)
- Validação: userId deve começar com "user_" (client-side check antes do fetch)

### Member Management — Remove Member

[auto] Q: "Como admin remove membro?" → Selected: "Botão trash por linha de membro, com confirmação inline (dois cliques)"

- Ícone `Trash2` da lucide-react em cada linha de membro, à direita do role badge
- Primeiro clique: botão muda para estado "Confirmar? [X]" com texto vermelho
- Segundo clique (confirmar): DELETE para admin-tenants?action=remove-member com { orgId, userId }
- Cancelar: clicar em X ou fora da linha reseta o estado de confirmação
- Sucesso: remove membro da lista local (optimistic update + re-fetch)
- Estado de confirmação: local ao componente por userId (Map<userId, boolean>)

### Member Management — State After Actions

[auto] Q: "O que acontece após add/remove?" → Selected: "Re-fetch listOrgMembers in-place sem recarregar página"

- Após add ou remove bem-sucedido: chamar `fetchMembers()` novamente
- Atualizar o InfoCard de "Membros" com o novo count
- Não redirecionar

### Impersonation Mechanism — Technical Approach

[auto] Q: "Como impersonation funciona tecnicamente?" → Selected: "Admin chama auth-token-exchange com override de org_id, sem alterar sessão Clerk"

A impersonation NÃO usa `setActive` do Clerk (isso mudaria a org ativa do admin).
Em vez disso:
1. Admin clica "Entrar como esta org" em TenantDetailPage
2. Frontend chama endpoint admin-tenants?action=impersonate-token&orgId=X (novo)
3. Edge function verifica super_admin claim, minta um Supabase JWT com org_id=X (sem validar Clerk org membership)
4. Frontend chama `setOrgAccessToken(impersonatedToken)` — Supabase passa a ver org X
5. Frontend navega para '/'
6. ImpersonationContext armazena: `{ isImpersonating: true, impersonatedOrgId, impersonatedOrgName, originalToken }`

Ao **sair da impersonation**:
1. Chamar `setOrgAccessToken(originalToken)` para restaurar token original
2. Limpar ImpersonationContext
3. Navegar para '/admin/tenants'

### Impersonation — Context Storage

[auto] Q: "Onde armazenar estado de impersonation?" → Selected: "React Context (ImpersonationContext) wrapping o app"

- Novo arquivo: `src/platform/auth/ImpersonationContext.tsx`
- Expõe: `useImpersonation()` hook com { isImpersonating, impersonatedOrgId, impersonatedOrgName, enterImpersonation, exitImpersonation }
- `originalToken`: armazenado em ref (não reativa) dentro do context — não precisa re-render
- O Provider envolve `<App>` ou é montado dentro de `ProtectedRoute`

### Impersonation — Visual Indicator

[auto] Q: "Como header/app sinaliza impersonation?" → Selected: "Banner fixo abaixo do TopNav, fundo amber, com nome da org + botão Sair"

- Componente `ImpersonationBanner` em `src/platform/layout/`
- Aparece entre TopNav e o conteúdo principal quando `isImpersonating === true`
- Layout: `bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between`
- Left: ícone Eye + texto "Visualizando como: [OrgName]"
- Right: botão "Sair da impersonação" → chama `exitImpersonation()`
- Dark mode: `dark:bg-amber-950/20 dark:border-amber-800`
- Não altera TopNav — o TopNav já tem o badge ADMIN; o banner é separado

### Impersonation — Button Location

[auto] Q: "Onde fica o botão 'Entrar como esta org'?" → Selected: "No header do TenantDetailPage, ao lado do nome da org"

- Botão na seção de header da página (próximo ao nome/slug da org)
- Ícone `Eye` da lucide-react + texto "Entrar como esta org"
- Estilo: `variant="outline" size="sm"` com classes indigo
- Não aparece se `isImpersonating === true` e já está nessa org (evitar re-impersonation)

### Edge Function Changes — admin-tenants

[auto] Q: "Que novas rotas são necessárias?" → Selected: "Query params action=add-member, action=remove-member, action=impersonate-token (no sub-paths)"

Novos handlers em admin-tenants/index.ts:

```
POST /admin-tenants?action=add-member
  body: { orgId: string, userId: string, role?: string }
  → Clerk POST /organizations/:orgId/memberships

DELETE /admin-tenants?action=remove-member
  body: { orgId: string, userId: string }
  → Clerk DELETE /organizations/:orgId/memberships/:userId

POST /admin-tenants?action=impersonate-token
  body: { orgId: string }
  → Minta Supabase JWT com org_id=orgId (sem validar Clerk membership, super_admin required)
```

Nota: o handler de impersonate-token replica a lógica de mint do auth-token-exchange mas sem
verificar Clerk JWKS — apenas extrai user_id do token admin e minta JWT com org_id arbitrário.
Isso exige acesso ao SUPABASE_JWT_SECRET no admin-tenants function (adicionar ao env).

### Edge Function Changes — CORS

- admin-tenants já expõe `'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'`
- Adicionar `DELETE` ao header CORS para suportar remove-member
- Updated: `'GET, POST, DELETE, OPTIONS'`

### Claude's Discretion

- Animação de loading durante add/remove (spinner no botão ou skeleton)
- Tamanho exato do input de userId (placeholder text: "user_...")
- Tratamento de erro específico da Clerk API (ex: "User already member" → mensagem amigável)
- Se `impersonate-token` deve ser um handler separado no admin-tenants ou um novo edge function
  (recomendação: manter no admin-tenants para simplificar; só precisa de SUPABASE_JWT_SECRET)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin Edge Functions (modificar)
- `supabase/functions/admin-tenants/index.ts` — handlers existentes: list orgs, get org, create org, list members; adicionar: add-member, remove-member, impersonate-token
- `supabase/functions/auth-token-exchange/index.ts` — lógica de mint JWT (referência para replicar no impersonate-token handler)

### Admin Service (modificar)
- `src/platform/services/admin-service.ts` — addOrgMember, removeOrgMember, getImpersonationToken funções a adicionar

### Admin UI (modificar)
- `src/platform/pages/admin/TenantDetailPage.tsx` — adicionar add/remove member UI + botão impersonation
- `src/platform/pages/admin/AdminDashboard.tsx` — referência para padrões de componentes admin (MetricCard, Promise.allSettled)

### Tipos (modificar)
- `src/platform/types/admin.ts` — adicionar ImpersonationTokenResponse type

### Auth / Contexto (criar)
- `src/platform/auth/ImpersonationContext.tsx` — novo context provider (criar)
- `src/platform/layout/` — ImpersonationBanner component (criar)

### Token / Supabase
- `src/platform/tenants/useOrgTokenExchange.ts` — pattern de setOrgAccessToken (referência)
- `src/platform/tenants/token-exchange.ts` — exchangeToken pattern (referência)
- `src/platform/supabase.ts` — setOrgAccessToken (a chamar para impersonation)

### Requirements
- `.planning/REQUIREMENTS.md` §Admin — ADMN-01, ADMN-02
- `.planning/ROADMAP.md` §Phase 108 — 4 success criteria

### Prior Phases (context)
- `.planning/phases/105-data-isolation/105-CONTEXT.md` — Token exchange, setOrgAccessToken pattern, RLS isolation que torna impersonation significativa
- `.planning/phases/107-header-ux/107-CONTEXT.md` — TopNav patterns, admin badge, OrgPicker dropdown pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `setOrgAccessToken(token)` in `src/platform/supabase.ts` — already overrides the Supabase JWT; calling it with an impersonated token is the impersonation mechanism
- `useAdminMode()` hook — `isSuperAdmin` check to conditionally render impersonation UI
- `getAuthHeaders()` pattern in `admin-service.ts` — reuse for new add/remove/impersonate functions
- `OrgPicker.tsx` dropdown pattern — custom useState + useRef + click-outside; reuse for any new admin dropdowns
- Existing `Promise.allSettled` pattern in AdminDashboard — use for parallel fetches
- `Trash2`, `Eye`, `UserPlus` icons available from lucide-react

### Established Patterns

- Query params (never sub-paths) for edge function routing: `?action=X&orgId=Y`
- All API response fields accessed with fallbacks: `data ?? []`, `totalCount ?? 0`
- Admin super_admin guard: JWT decode + `payload.super_admin !== true && payload.super_admin !== 'true'`
- Clerk member management API: `POST /organizations/:orgId/memberships` (add), `DELETE /organizations/:orgId/memberships/:userId` (remove) — Clerk REST API v1
- Re-fetch pattern after mutations: cancelled flag + async function inside useEffect

### Integration Points

- `TenantDetailPage` — single page to modify for add/remove/impersonation button; already has `listOrgMembers`, `useSession`, `setAdminClerkTokenGetter`
- `ImpersonationContext` wraps app shell — mount point: inside `ProtectedRoute` children or wrapping `<App />`
- `TopNav` does NOT need changes — `ImpersonationBanner` sits below it in the layout component
- Layout wrapper (AppLayout or similar) needs to render `<ImpersonationBanner />` — check `src/platform/layout/`

### What Needs to Be Created

- `src/platform/auth/ImpersonationContext.tsx` — new file
- `src/platform/layout/ImpersonationBanner.tsx` — new file
- New handler functions in `supabase/functions/admin-tenants/index.ts`: `handleAddMember`, `handleRemoveMember`, `handleImpersonateToken`
- New exported functions in `src/platform/services/admin-service.ts`: `addOrgMember`, `removeOrgMember`, `getImpersonationToken`
- New type in `src/platform/types/admin.ts`: `ImpersonationTokenResponse`

### CORS Update Required
- `admin-tenants` CORS header must include `DELETE` method

</code_context>

<specifics>
## Specific Ideas

- Impersonation NÃO usa Clerk `setActive` — isso mudaria a org real do admin no Clerk. A impersonation é 100% via Supabase JWT override (setOrgAccessToken), invisível para Clerk.
- O `ImpersonationContext` deve armazenar o `originalToken` (string) em uma ref, não em state, para evitar re-renders desnecessários ao guardar o token.
- O banner de impersonation usa âmbar para manter consistência com o badge ADMIN no TopNav — mesma linguagem de cor para "modo elevado/especial".
- Ao sair da impersonation, restaurar o token original significa guardar o resultado do último `exchangeToken()` bem-sucedido antes de entrar em impersonation.
- O `impersonate-token` handler no admin-tenants precisa do `SUPABASE_JWT_SECRET` env var — verificar se já está configurado no projeto Supabase ou se precisa ser adicionado.

</specifics>

<deferred>
## Deferred Ideas

- Edição de role de membro (admin ↔ member) — nova feature, fora do escopo ADMN-01
- Audit log de ações admin (quem impersonou qual org, quando) — futura fase
- Impersonation de usuário específico (não só org) — fora do escopo
- Buscar usuário por email na tela de add member (requereria lookup Clerk extra) — possível enhancement futuro

</deferred>

---

*Phase: 108-admin-enhancements*
*Context gathered: 2026-03-18*
