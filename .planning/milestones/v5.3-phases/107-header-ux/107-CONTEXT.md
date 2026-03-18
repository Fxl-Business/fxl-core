# Phase 107: Header UX - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

O header da aplicacao oferece identidade visual clara ("Nexo"), distingue admin de operator, e permite logout com um clique.

Scope: Apenas `TopNav.tsx` e os locais que exibem "FXL-CORE" como identificador de build. Nenhuma mudanca no AdminLayout, Sidebar, ou logica de roteamento. Nenhuma feature nova alem das 3 requirements (HEAD-01, HEAD-02, HEAD-03).

</domain>

<decisions>
## Implementation Decisions

### Brand Identity (HEAD-03)
- O header exibe apenas "Nexo" como nome da plataforma — remover o subtitulo "FXL-CORE" do TopNav.tsx
- O logo mark quadrado com "FXL" permanece (e o identificador visual da FXL como empresa, nao do produto)
- A label "FXL-CORE" tambem aparece em `src/platform/pages/Home.tsx` (linha 144) como "Build" — manter ou remover e decisao de Claude (provavelmente manter como referencia tecnica interna, mas garantir que nao apareça com visual de brand)
- Buscar outras ocorrencias de "FXL-CORE" no src/ e normalizar: pode permanecer como label tecnica, nao como nome de produto

### Avatar + Logout Dropdown (HEAD-01)
- Mostrar avatar do usuario do Clerk (`user.imageUrl`) no canto direito do header
- Fallback quando sem imageUrl: initials extraidas de `user.fullName` ou `user.primaryEmailAddress`, renderizadas num circulo com fundo slate/indigo
- Ao clicar no avatar, abre dropdown (mesmo padrao visual do OrgPicker — botao com div absoluta, sem DropdownMenu do shadcn)
- Conteudo do dropdown:
  1. Header com nome completo + email (nao clicavel, apenas informativo)
  2. Divider
  3. Item "Sair" com icone LogOut da lucide-react
- Ao clicar "Sair": chamar `clerk.signOut()` com redirect para `/login`
- Clerk hook a usar: `useClerk()` para `signOut` + `useUser()` para dados do usuario
- NaO instalar nova dependencia: usar o padrao existente de dropdown custom (ref + click-outside listener, identico ao OrgPicker)
- Posicao: ultimo elemento no lado direito do header, apos ThemeToggle

### Admin vs Operator Distinction (HEAD-02)
- O badge admin ja existe parcialmente (botao Shield com texto "Admin"/"Operator") — mas apenas para super_admin, e e o botao de toggle
- Adicionar: quando o usuario esta em rota `/admin/*`, exibir um badge persistente "ADMIN" ao lado do nome "Nexo" no lado esquerdo do header
- Estilo do badge: pill pequeno com fundo amber (`bg-amber-100 text-amber-700` / dark: `bg-amber-950/50 text-amber-400`) e texto uppercase "ADMIN" — sinaliza modo elevado
- O botao Shield (toggle admin/operator) permanece — ele e o mecanismo de navegar entre modos. O novo badge e apenas indicador visual passivo
- Para operator comum (nao super_admin): badge ADMIN nunca aparece, header parece normal
- Para super_admin em rota operator: header normal (sem badge amber)
- Para super_admin em rota /admin/*: badge "ADMIN" amber visivel + botao Shield com estilo indigo ativo

### Claude's Discretion
- Tamanho exato e espacamento do avatar (recomendado: h-8 w-8, consistent com outros elementos do header)
- Animacao/transicao do dropdown (recomendado: sem animacao — keep it simple, mesmo padrao do OrgPicker)
- Formato exato das initials (recomendado: 2 letras, primeira letra do firstName e sobrenome)
- Tratamento de erro se signOut falhar (recomendado: silencioso — redirect mesmo assim)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Requirements v5.3
- `.planning/REQUIREMENTS.md` §Header UX — HEAD-01, HEAD-02, HEAD-03 com acceptance criteria

### Roadmap
- `.planning/ROADMAP.md` §Phase 107 — Success Criteria (4 itens obrigatorios)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/platform/layout/TopNav.tsx` — arquivo principal a modificar; ja tem useAdminMode, SearchCommand, ThemeToggle, OrgPicker
- `src/platform/hooks/useAdminMode.ts` — expoe `isSuperAdmin`, `isAdminRoute`, `toggleMode`; reusar para o badge ADMIN
- `src/platform/tenants/OrgPicker.tsx` — implementa dropdown custom com ref + click-outside listener; copiar exatamente esse padrao para o UserMenu
- `@clerk/react` — `useUser()` ja usado em useAdminMode; adicionar `useClerk()` para signOut
- `lucide-react` — LogOut, Shield, ChevronDown, Check ja importados no projeto; usar LogOut para item do dropdown

### Established Patterns
- Dropdown custom (sem shadcn DropdownMenu): `useState(open)` + `useRef` + `document.addEventListener('mousedown', handleClick)` — identico ao OrgPicker
- Fallback de imagem: padrao do AdminUsersPage usa `user.imageUrl` com fallback para initials num span com classes de estilo
- Classes do header: `h-8 w-8 rounded-full` para avatar, `text-xs` para labels de dropdown
- Dark mode: sempre incluir variantes `dark:` — ver padrao no TopNav.tsx existente

### Integration Points
- `TopNav.tsx` e o unico lugar a modificar para HEAD-01, HEAD-02, HEAD-03
- `src/platform/pages/Home.tsx` linha ~144: "FXL-CORE" como label de build — verificar e normalizar
- `src/platform/auth/SuperAdminRoute.tsx` — nao modificar (apenas verificar para entender o guard)
- Clerk signOut redirect: `clerk.signOut({ redirectUrl: '/login' })` — verificar assinatura exata da API `@clerk/react` v6

### No new shadcn components needed
- Nao instalar `@radix-ui/react-dropdown-menu` — usar padrao custom identico ao OrgPicker
- Nao instalar avatar component — usar `<img>` com fallback em `<span>` (initials)

</code_context>

<specifics>
## Specific Ideas

- "O header exibe 'Nexo' como nome da plataforma (nao 'Fxl Core Fxl' ou qualquer variante incorreta)" — requirement literal do ROADMAP
- O dropdown deve ser minimalista: nome, email, divider, logout — sem configuracoes, sem perfil, sem links extras
- Badge ADMIN em amber como sinal claro de modo elevado — cor diferente do indigo usado para acoes normais

</specifics>

<deferred>
## Deferred Ideas

- Link "Meu Perfil" no dropdown de usuario — seria nova feature, nao esta no scope de HEAD-01
- Avatar upload no Nexo (separado do Clerk profile) — fora do scope
- Notificacoes no header (bell icon) — outra fase
- Modo impersonation header indicator — fica no Phase 108 (Admin Enhancements)

</deferred>

---

*Phase: 107-header-ux*
*Context gathered: 2026-03-18*
