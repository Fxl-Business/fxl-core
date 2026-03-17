# Phase 85: Auth Fix & Custom Login - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning
**Mode:** auto (all decisions use recommended defaults)

<domain>
## Phase Boundary

Fix the ProtectedRoute infinite loading bug (unauthenticated users stuck on "Carregando..." forever) and replace Clerk's `<SignIn>` component with a custom-designed login page featuring Nexo branding, Google OAuth button, and email/password form -- all following the Nexo design system (Inter, indigo/slate).

Signup page redesign, password reset custom UI, and MFA setup are explicitly out of scope.

</domain>

<decisions>
## Implementation Decisions

### Login Page Visual Design
- Card container on centered full-screen background (bg-slate-50 light / dark:bg-background dark)
- Text-only "Nexo" branding with subtitle "Acesse a plataforma operacional" above the card
- Card contains: Google OAuth button at top, "ou" divider, email input, password input, "Entrar" submit button, "Nao tem conta? Criar conta" link at bottom
- Full dark mode support using existing Nexo design tokens (dark:bg-background, dark:text-foreground, etc.)
- Layout matches the design spec wireframe in `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` section 4
- Use shadcn/ui components (Button, Input, Label, Card) from `src/shared/ui/` for consistency

### Auth Error Handling
- Invalid credentials: inline error message below the form (red text, clear description)
- OAuth failure (Google): toast notification via sonner with retry guidance
- Network errors: inline error with generic "Tente novamente" message
- No custom error pages -- all errors displayed within the login card

### Loading States
- During form submission: "Entrar" button shows loading spinner + disabled state
- During OAuth redirect: full-page centered spinner (user is navigating away)
- ProtectedRoute: show "Carregando..." only while Clerk SDK loads (`isLoaded`), redirect immediately once loaded and not signed in

### Post-Login Redirect
- After successful login: redirect to originally requested route (if available), fallback to "/"
- Use `setActive({ session })` after successful `signIn.create()` or OAuth return
- ClerkProvider already configured with `afterSignOutUrl="/login"` in main.tsx

### ProtectedRoute Fix
- Reorder guards: check `isLoaded` first, then `isSignedIn`, then `orgsLoaded`
- The `useOrganizationList` hook must NOT block the auth check when user is signed out
- Exact fix pattern from design spec: `if (!isLoaded) return loading` -> `if (!isSignedIn) return redirect` -> `if (!orgsLoaded) return loading`

### Auth Implementation Approach
- Use Clerk `useSignIn` hook for custom form (NOT Clerk Appearance API, NOT `<SignIn>` component)
- Google OAuth via `signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/sso-callback', redirectUrlComplete: '/' })`
- Email/password via `signIn.create({ identifier: email, password })` then handle result status
- Handle `needs_first_factor`, `needs_second_factor`, and `complete` statuses from signIn response

### Claude's Discretion
- Exact spacing, padding, and font sizes within the card (follow Nexo visual language)
- Input placeholder text wording
- Google OAuth button icon choice (Google logo or lucide icon)
- SSO callback route handling pattern
- Whether to add subtle animations/transitions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Spec (primary)
- `docs/superpowers/specs/2026-03-17-admin-polish-custom-auth-design.md` -- Full design spec with root cause analysis, architecture decisions, wireframe layout, and acceptance criteria for all v4.3 phases. Sections 3-4 are critical for Phase 85.

### Requirements
- `.planning/REQUIREMENTS.md` -- AUTH-01 through AUTH-06 define the acceptance criteria for this phase

### Existing Auth Code
- `src/platform/auth/ProtectedRoute.tsx` -- Contains the infinite loading bug (lines 20-31). Fix pattern documented in design spec section 3.
- `src/platform/auth/Login.tsx` -- Current login page using Clerk `<SignIn>` component. Will be rewritten with custom UI.
- `src/platform/auth/SuperAdminRoute.tsx` -- Reference pattern for auth guards (same loading/redirect structure)
- `src/platform/router/AppRouter.tsx` -- Route definitions, auth page routes at lines 89-101, AuthOnlyRoute pattern at lines 38-49
- `src/main.tsx` -- ClerkProvider configuration with signInUrl, signUpUrl, afterSignOutUrl

### Clerk Skills
- `.agents/skills/clerk/SKILL.md` -- Core Clerk auth skill for implementation reference
- `.agents/skills/clerk-custom-ui/SKILL.md` -- Custom UI patterns with useSignIn/useSignUp hooks

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/shared/ui/button.tsx` -- Button component with loading/disabled variants
- `src/shared/ui/input.tsx` -- Input component for email/password fields
- `src/shared/ui/label.tsx` -- Label component for form fields
- `src/shared/ui/card.tsx` -- Card component for the login container
- `src/shared/ui/separator.tsx` -- Separator for "ou" divider
- `src/shared/ui/sonner.tsx` -- Toast notifications for OAuth error handling

### Established Patterns
- Auth pages use full-screen centered layout (min-h-screen, flex, items-center, justify-center)
- Dark mode uses `dark:bg-background` / `dark:text-foreground` tokens
- Font: Inter (already loaded via @fontsource-variable/inter in main.tsx)
- Color palette: indigo for interactive elements, slate for neutrals
- AuthOnlyRoute in AppRouter.tsx shows the thin auth-guard pattern (no org check)

### Integration Points
- `src/platform/router/AppRouter.tsx` line 90: `/login/*` route renders Login component
- `src/main.tsx` line 18-19: ClerkProvider signInUrl/signUpUrl configuration
- The `/signup` route is inline in AppRouter.tsx (not a separate component) -- login should link to `/signup`
- `RedirectToSignIn` from @clerk/react is used in ProtectedRoute and SuperAdminRoute -- after fix, ProtectedRoute will redirect to `/login` instead of using RedirectToSignIn (or keep RedirectToSignIn which respects ClerkProvider signInUrl)

</code_context>

<specifics>
## Specific Ideas

- Login page wireframe is provided in the design spec (section 4) -- follow that layout exactly
- The ProtectedRoute fix is a simple guard reorder, documented with before/after code in design spec section 3
- Portuguese UI copy: "Entrar com Google", "ou", "Email", "Senha", "Entrar", "Nao tem conta? Criar conta"
- The existing Login.tsx is only 13 lines wrapping `<SignIn>` -- complete rewrite is cleaner than partial modification

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope. The design spec already separates signup redesign and password reset as out of scope for v4.3.

</deferred>

---

*Phase: 85-auth-fix-custom-login*
*Context gathered: 2026-03-17*
