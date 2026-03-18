# Module: clients

## Purpose
Client registration and management (CRUD). Lists, creates, edits, and displays client profiles for the org.

## Ownership
- src/modules/clients/**

## Public API

### Types
- Client, ClientStatus, CreateClientParams, UpdateClientParams (types.ts)

### Hooks
- useClients() — list all clients with loading/error/refetch
- useClient(slug) — fetch single client by slug

### Services
- clients-service.ts — listClients, getClientBySlug, createClient, updateClient, deleteClient

### Pages
- ClientList — /clientes — card grid with create dialog
- ClientProfile — /clientes/:slug — profile with edit dialog, link to projects

### Components
- ClientCard — card for list display
- ClientForm — create/edit form used inside Dialog

## Dependencies

### From shared/
- @/components/ui/button, card, badge, dialog, input, label, textarea, select

### From platform/
- @/modules/registry — ModuleDefinition type
- @/modules/module-ids — MODULE_IDS.CLIENTS

### From external/
- @/lib/supabase — Supabase client
- react-router-dom — Link, useParams
- lucide-react — icons

## DB Table
- `clients` (migrations 016 + 018): id, slug, name, description, org_id, logo_url, status, created_at
- RLS: org_id match from JWT + super_admin bypass

## Agent Rules
- **Write:** Only files under `src/modules/clients/`
- **Read:** Entire codebase
- This module is SIMPLE CRUD — does NOT contain briefing/blueprint/wireframe (that's Projetos)
