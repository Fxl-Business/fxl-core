# Module: clients

## Purpose
Simple CRUD for client registration (name, slug, description, status).
This is NOT the project workspace module -- that lives at src/modules/projects/.

## Ownership
- src/modules/clients/**

## Public API

### Pages
- ClientsListPage: Table listing all clients for the organization (pages/ClientsListPage.tsx)

## Dependencies

### From platform/
- @platform/module-loader/registry — ModuleDefinition type (used in manifest)
- @platform/module-loader/module-ids — MODULE_IDS.CLIENTS (used in manifest)
- @platform/supabase — supabase client for DB access

## Agent Rules
- **Write:** Only files under `src/modules/clients/`
- **Read:** Entire codebase
- **Do NOT** confuse with src/modules/projects/ (formerly clients)
