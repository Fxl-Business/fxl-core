---
phase: 85-auth-fix-custom-login
plan: 02
status: done
commit: 283e098
---

# Plan 02 Summary: Custom Login Page

## What was done

Fully rewrote `src/platform/auth/Login.tsx`, replacing the default Clerk `<SignIn>`
component with a custom-designed login page using the `useSignIn` hook from
`@clerk/react/legacy` (the correct sub-path for Clerk v6 Core 2's classic API
with `isLoaded` + `setActive`).

## Changes

**File modified:** `src/platform/auth/Login.tsx` (4 lines -> 171 lines)

The new implementation includes:

- **Nexo branding** — "Nexo" title + "Acesse a plataforma operacional" subtitle
- **Google OAuth** — "Entrar com Google" button with colored Google SVG icon,
  calls `signIn.authenticateWithRedirect({ strategy: 'oauth_google' })`,
  redirects through `/sso-callback` (set up in Plan 01)
- **Email/password form** — Email + Senha fields with `signIn.create({ identifier, password })`,
  on success calls `setActive({ session })` and navigates to `/`
- **Error handling** — Inline error display using `isClerkAPIResponseError` from
  `@clerk/react/errors`, with user-friendly Portuguese messages
- **Loading states** — Separate `loading` (email/password) and `oauthLoading` (Google)
  states with disabled buttons and "Entrando..."/"Conectando..." text
- **Signup link** — "Nao tem conta? Criar conta" with `<Link to="/signup">`
- **Dark mode** — Full dark mode support via `dark:` Tailwind variants
- **Loading screen** — "Carregando..." while Clerk initializes (`!isLoaded`)

## Design system compliance

- All UI from shadcn/ui: Button, Input, Label, Card, CardContent, CardFooter, Separator
- Colors: indigo for interactive elements, slate for text/backgrounds
- Font: Inter (inherited from body)
- "ou" divider with absolute-positioned text over Separator

## Acceptance criteria met

- [x] No `SignIn` component import
- [x] Uses `useSignIn` hook (from `@clerk/react/legacy` for v6 compatibility)
- [x] Uses `isClerkAPIResponseError` from `@clerk/react/errors`
- [x] Uses shadcn/ui components (Button, Input, Label, Card, Separator)
- [x] Google OAuth via `authenticateWithRedirect` with `strategy: 'oauth_google'`
- [x] Email/password via `signIn.create` + `setActive`
- [x] "Entrar com Google" button text
- [x] "Entrar" submit button text
- [x] "Nao tem conta?" link to `/signup`
- [x] "Nexo" title + "Acesse a plataforma operacional" subtitle
- [x] Dark mode (`dark:bg-background`)
- [x] Error state display (`text-red-600`)
- [x] `npx tsc --noEmit` — zero errors

## Requirements fulfilled

- AUTH-02: Login page with Nexo branding, Google OAuth, email/password form
- AUTH-03: Google OAuth flow (click -> Google -> /sso-callback -> authenticated)
- AUTH-04: Email/password login end-to-end
- AUTH-05: Nexo design system (Inter, indigo/slate, dark mode, shadcn/ui)
- AUTH-06: "Nao tem conta?" link to /signup
