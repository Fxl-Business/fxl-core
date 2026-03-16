# Module: Clients (Clientes)

## Scope

Client workspaces — each client has briefing, blueprint, wireframe access.
Currently one client: Financeiro Conta Azul.

## Structure

- `manifest.tsx` — Module registration (routes, nav)
- `components/` — (currently empty, client-specific components here)
- `pages/` — ClientsIndex, BriefingForm, BlueprintTextView, WireframeViewer
- `pages/FinanceiroContaAzul/` — Index, DocViewer, Wireframe, WireframeViewer (client-specific pages)
- `services/` — (currently empty, future: client data service)
- `hooks/` — (currently empty)
- `types/` — (currently empty)

## Rules

- Never import from other modules directly
- Client content (briefing .md, blueprint configs) lives in clients/[slug]/ (not here)
- This module provides the pages that render client content
- UI components from @shared/ui/, utilities from @shared/utils/
- Platform imports from @platform/ (supabase, module-loader)
- Wireframe viewer is a full-screen protected route (not inside Layout)

## Key Patterns

- WireframeViewer accepts clientSlug prop or reads from URL params
- BriefingForm is a Supabase-backed form with field validation
- FinanceiroContaAzul pages are hardcoded for the pilot client
