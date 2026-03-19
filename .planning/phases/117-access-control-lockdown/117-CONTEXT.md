# Phase 117: Access Control Lockdown - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove self-service organization creation and replace with a "request access" screen for unaffiliated users. After this phase, only super admin can create organizations via the admin panel.

</domain>

<decisions>
## Implementation Decisions

### Self-Service Removal
- Delete `CriarEmpresa.tsx` entirely — no feature flag, no conditional rendering
- Remove `/criar-empresa` route from `AppRouter.tsx`
- Remove `AuthOnlyRoute` wrapper if it becomes unused after route removal
- No client-side `createOrganization()` calls should remain anywhere in the app

### Request Access Screen
- New page `SolicitarAcesso.tsx` at `/solicitar-acesso`
- Minimal branded screen: Nexo logo, explanation message in Portuguese, sign out button
- No form submission — admin manually checks unaffiliated users in admin panel
- Message tone: welcoming, not blocking — "Sua conta foi criada. Solicite acesso a uma organização."
- Use existing Nexo design language (slate + indigo palette, Inter font)

### ProtectedRoute Changes
- Modify the "no org" redirect from `/criar-empresa` to `/solicitar-acesso`
- Keep all other auth logic intact (token exchange, org switching, etc.)
- The `/solicitar-acesso` route uses `AuthOnlyRoute` (signed in but no org required)

### Claude's Discretion
- Exact layout and spacing of the request access screen
- Whether to include an icon/illustration on the screen
- Error state handling details

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CriarEmpresa.tsx` — reference for Clerk hooks usage (will be deleted)
- `ProtectedRoute.tsx` — redirect logic at line ~70 (change target from `/criar-empresa` to `/solicitar-acesso`)
- `AuthOnlyRoute` in `AppRouter.tsx` (lines 39-50) — thin guard for signed-in-only routes
- Login.tsx — reference for Nexo branding on auth pages (logo, styling)

### Established Patterns
- Auth pages use centered card layout with Nexo branding
- `useAuth()` and `useClerk()` from `@clerk/react` for sign out
- Route guards in AppRouter.tsx with lazy loading

### Integration Points
- `AppRouter.tsx` — remove `/criar-empresa` route, add `/solicitar-acesso` route
- `ProtectedRoute.tsx` — change redirect target
- Admin panel already has org creation via `tenant-service.ts` → `admin-tenants` edge function

</code_context>

<specifics>
## Specific Ideas

- The request access screen should be clean and minimal — not a form, just information
- Sign out button is important so users aren't stuck
- Portuguese language for all user-facing text

</specifics>

<deferred>
## Deferred Ideas

- Access request form with submission (future milestone — INV/REQ requirements)
- Email notification to admin when new user signs up (future)

</deferred>
