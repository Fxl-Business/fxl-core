---
phase: 107
wave: 1
depends_on: []
files_modified:
  - src/platform/layout/TopNav.tsx
  - src/platform/layout/UserMenu.tsx
  - src/platform/pages/Home.tsx
autonomous: true
requirements:
  - HEAD-01
  - HEAD-02
  - HEAD-03
---

# Phase 107: Header UX — Plan

## Goal

O header da aplicacao oferece identidade visual clara ("Nexo"), distingue admin de operator, e permite logout com um clique.

## Must Haves

- [ ] Header exibe "Nexo" como nome — sem subtitulo "FXL-CORE" como texto de produto
- [ ] Avatar/initials do usuario logado visivel no canto direito do header
- [ ] Dropdown ao clicar no avatar: nome, email, divider, botao "Sair"
- [ ] Clicar "Sair" chama `clerk.signOut({ redirectUrl: '/login' })` e redireciona para login
- [ ] Super admin em rota `/admin/*` ve badge amber "ADMIN" ao lado do nome "Nexo"
- [ ] `npx tsc --noEmit` retorna zero erros

---

## Wave 1 (single agent)

### Task 1: Create UserMenu component

**Requirement:** HEAD-01

<read_first>
- `src/platform/tenants/OrgPicker.tsx` — copiar exatamente o padrao de dropdown custom (useState open, useRef, click-outside listener)
- `src/platform/pages/admin/UsersPage.tsx` lines 104-130 — ver como avatar/initials sao renderizados com `user.imageUrl` fallback
- `node_modules/@clerk/shared/dist/types/index.d.ts` lines 7686-7701 — confirmar assinatura `signOut({ redirectUrl })`
</read_first>

<action>
Criar novo arquivo `src/platform/layout/UserMenu.tsx` com o seguinte conteudo:

```tsx
import { useState, useRef, useEffect } from 'react'
import { LogOut } from 'lucide-react'
import { useUser, useClerk } from '@clerk/react'

/**
 * User avatar + logout dropdown for TopNav.
 *
 * - Shows user avatar (imageUrl) or initials fallback
 * - Dropdown: name, email, divider, logout
 * - signOut redirects to /login
 */
export function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click — identical pattern to OrgPicker
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  if (!user) return null

  // Build display name and initials
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuário'
  const email = user.primaryEmailAddress?.emailAddress ?? ''
  const initials = (() => {
    const parts = fullName.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  })()

  function handleSignOut() {
    void signOut({ redirectUrl: '/login' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-slate-200 dark:hover:ring-slate-700"
        title={fullName}
        aria-label="Menu do usuário"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-border dark:bg-popover">
          {/* User info header — not clickable */}
          <div className="px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-foreground">
              {fullName}
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-muted-foreground">
              {email}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-border" />

          {/* Logout */}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50 dark:text-foreground dark:hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400 dark:text-muted-foreground" />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
```
</action>

<acceptance_criteria>
- `src/platform/layout/UserMenu.tsx` existe e e um arquivo novo
- O arquivo contém `export function UserMenu()`
- O arquivo contém `useClerk` importado de `@clerk/react`
- O arquivo contém `signOut({ redirectUrl: '/login' })`
- O arquivo contém `useUser` importado de `@clerk/react`
- O arquivo contém `document.addEventListener('mousedown', handleClick)` (padrao click-outside)
- O arquivo contém `user.imageUrl` para avatar
- O arquivo contém fallback com initials em `bg-indigo-600`
- O arquivo contém `<LogOut` importado de `lucide-react`
- O arquivo NAO contém `any` em nenhum tipo TypeScript
</acceptance_criteria>

---

### Task 2: Update TopNav — brand, admin badge, user menu

**Requirements:** HEAD-01, HEAD-02, HEAD-03

<read_first>
- `src/platform/layout/TopNav.tsx` — arquivo a ser modificado; ver estado atual completo
- `src/platform/hooks/useAdminMode.ts` — `isSuperAdmin` e `isAdminRoute` ja expostos, reusar para badge ADMIN
- `src/platform/layout/UserMenu.tsx` — componente recem criado na Task 1
</read_first>

<action>
Substituir completamente o conteudo de `src/platform/layout/TopNav.tsx` pelo seguinte:

```tsx
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import SearchCommand from './SearchCommand'
import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from './UserMenu'
import { OrgPicker } from '@platform/tenants/OrgPicker'
import { useAdminMode } from '@platform/hooks/useAdminMode'
import { cn } from '@shared/utils'

export default function TopNav() {
  const { isSuperAdmin, isAdminRoute, toggleMode } = useAdminMode()

  return (
    <header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-border dark:bg-background/80">
      {/* Left: brand + admin badge + org picker */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-xs font-bold leading-none text-primary-foreground">FXL</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground">
            Nexo
          </span>
        </Link>

        {/* Admin mode badge — only visible for super_admin on /admin/* routes */}
        {isSuperAdmin && isAdminRoute && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            ADMIN
          </span>
        )}

        <OrgPicker />
      </div>

      {/* Right: admin toggle, search, theme, user */}
      <div className="flex items-center gap-4">
        {isSuperAdmin && (
          <button
            type="button"
            onClick={toggleMode}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              isAdminRoute
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/70'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
            )}
            title={isAdminRoute ? 'Voltar ao modo Operador' : 'Modo Admin'}
          >
            <Shield className="h-3.5 w-3.5" />
            {isAdminRoute ? 'Operator' : 'Admin'}
          </button>
        )}
        <SearchCommand />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
```

Mudancas em relacao ao original:
1. **HEAD-03**: Removido `<div className="flex flex-col">` com o `<span>` de subtitulo "FXL-CORE". Agora e apenas `<span>Nexo</span>` direto.
2. **HEAD-02**: Adicionado badge amber `{isSuperAdmin && isAdminRoute && (<span>ADMIN</span>)}` apos o Link de brand.
3. **HEAD-01**: `<UserMenu />` importado e adicionado como ultimo elemento no lado direito. Removido `flex-1` da div direita (era desnecessario com o alinhamento correto).
</action>

<acceptance_criteria>
- `src/platform/layout/TopNav.tsx` importa `UserMenu` de `./UserMenu`
- `src/platform/layout/TopNav.tsx` contém `<UserMenu />` no JSX
- `src/platform/layout/TopNav.tsx` NAO contém `FXL-CORE` como texto (o subtitulo foi removido)
- `src/platform/layout/TopNav.tsx` contém `isSuperAdmin && isAdminRoute` para o badge ADMIN
- `src/platform/layout/TopNav.tsx` contém `bg-amber-100` (estilo do badge)
- `src/platform/layout/TopNav.tsx` contém texto `ADMIN` no badge
- `src/platform/layout/TopNav.tsx` NAO contém `flex-1` desnecessario na div direita
- O logo mark FXL (quadrado com "FXL") ainda esta presente no arquivo
- O botao Shield de toggle admin/operator ainda esta presente
</acceptance_criteria>

---

### Task 3: Verify brand consistency in Home.tsx

**Requirement:** HEAD-03

<read_first>
- `src/platform/pages/Home.tsx` lines 140-147 — ver contexto exato da label "FXL-CORE" na pagina Home
</read_first>

<action>
Verificar o contexto da label "FXL-CORE" em Home.tsx (linha ~144).

Se estiver em um contexto de "Build" tecnico (ex: uma linha que mostra "Build | FXL-CORE" como metadado tecnico interno), manter como esta — nao e brand, e referencia de build.

Se estiver sendo exibida de forma proeminente como nome de produto ou brand da plataforma, substituir por "Nexo".

Verificacao atual: a linha esta em um bloco como:
```tsx
<div className="flex items-center justify-between text-xs">
  <span className="text-slate-500 dark:text-slate-400">Build</span>
  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
    FXL-CORE
  </span>
</div>
```

Este e um label tecnico interno em fonte mono, cor muted, com label "Build" ao lado — NAO e brand. Manter como esta, pois e referencia tecnica de build, nao nome de produto.

Se encontrar outros locais em `src/` onde "FXL-CORE" aparece visualmente como nome de produto (nao como label tecnica muted), corrigir para "Nexo".

Executar busca: `grep -rn "FXL-CORE" src/ --include="*.tsx" --include="*.ts"` e verificar cada ocorrencia. A unica modificacao necessaria foi em TopNav.tsx (Task 2). Home.tsx nao precisa alteracao.
</action>

<acceptance_criteria>
- `grep -rn "FXL-CORE" src/platform/layout/TopNav.tsx` retorna zero resultados (removido na Task 2)
- `grep -rn "FXL-CORE" src/` lista apenas ocorrencias em contextos tecnicos (font-mono, color muted, label "Build") — nao em contextos de brand proeminente
- Se houver alteracoes em Home.tsx, o arquivo continua compilando sem erros TypeScript
</acceptance_criteria>

---

### Task 4: TypeScript validation

**Requirements:** HEAD-01, HEAD-02, HEAD-03

<read_first>
- `src/platform/layout/UserMenu.tsx` — arquivo criado na Task 1
- `src/platform/layout/TopNav.tsx` — arquivo modificado na Task 2
</read_first>

<action>
Executar validacao TypeScript completa:

```bash
npx tsc --noEmit
```

Se houver erros:
- Erros de importacao em `UserMenu.tsx`: verificar que `@clerk/react` exporta `useClerk` — se nao exportar, usar `import { useClerk } from '@clerk/react/legacy'` (o projeto usa o hook legacy, ver `useAdminMode.ts` que importa `useUser` de `@clerk/react` sem `/legacy`)
- Erros de tipo em `signOut`: a assinatura e `signOut(options?: SignOutOptions): Promise<void>` — usar `void signOut({ redirectUrl: '/login' })` para ignorar a Promise corretamente
- Erros de tipo em `user.primaryEmailAddress?.emailAddress`: o tipo e `string | undefined`, ja tratado com `?? ''`

Zero erros e condicao de aceite obrigatoria.
</action>

<acceptance_criteria>
- `npx tsc --noEmit` retorna exit code 0
- Output do comando esta vazio (zero erros, zero warnings que bloqueiem)
- Nenhum arquivo do projeto usa `any` como solucao para erros de tipo (verificar com `grep -rn ": any" src/platform/layout/UserMenu.tsx src/platform/layout/TopNav.tsx`)
</acceptance_criteria>

---

## Verification Criteria

Success criteria from ROADMAP.md — all must be TRUE after execution:

1. **HEAD-03**: O header exibe "Nexo" como nome da plataforma — `grep "FXL-CORE" src/platform/layout/TopNav.tsx` retorna vazio
2. **HEAD-01**: Um operator logado ve avatar no header; ao clicar aparece dropdown com opcao de logout — `UserMenu.tsx` existe com `signOut({ redirectUrl: '/login' })`
3. **HEAD-01**: Ao executar logout, usuario e redirecionado para `/login` — confirmado pela chamada `signOut({ redirectUrl: '/login' })`
4. **HEAD-02**: Usuario admin em `/admin/*` ve badge amber "ADMIN" — `grep "bg-amber-100" src/platform/layout/TopNav.tsx` retorna resultado

## Post-Execution

- Visual check: abrir `localhost:5173` e verificar header no light/dark mode
- Testar logout: clicar avatar, clicar "Sair", confirmar redirect para `/login`
- Testar badge admin: se for super_admin, navegar para `/admin` e confirmar badge amber aparece; navegar de volta para `/` e confirmar badge desaparece
