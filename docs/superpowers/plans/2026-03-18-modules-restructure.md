# Modules Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current "Clientes" module into a minimal Clients CRUD module and a Projects delivery module, refactor the sidebar into a workspace pattern with per-module navigation, and migrate all stores from `client_slug` to `project_slug`.

**Architecture:** Incremental refactor — database migration first, then module infrastructure changes, then new module + rename, then sidebar refactor. Existing wireframe builder tools are untouched except for store key migration. Auth, tenants, admin, and other modules remain unchanged.

**Tech Stack:** React 18, TypeScript 5, Supabase (migrations + RLS), Tailwind + shadcn/ui, Vite

**Spec:** `docs/superpowers/specs/2026-03-18-modules-restructure-design.md`

---

## Task 1: Database Migration — Projects Table + Schema Changes

**Files:**
- Create: `supabase/migrations/018_projects_and_schema_updates.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 1. New projects table
CREATE TABLE public.projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL,
  name        text NOT NULL,
  client_id   uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  org_id      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, org_id)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access" ON public.projects
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id') = org_id
  );

-- 2. Add columns to clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- 3. Add project_id to briefing_configs
ALTER TABLE public.briefing_configs
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- 4. Add project_id to blueprint_configs
ALTER TABLE public.blueprint_configs
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- 5. Add project_id to comments
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- 6. Add project_id to share_tokens
ALTER TABLE public.share_tokens
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- 7. Seed: create project for existing "financeiro-conta-azul" client
INSERT INTO public.projects (slug, name, client_id, org_id)
SELECT
  c.slug,
  c.name,
  c.id,
  c.org_id
FROM public.clients c
WHERE c.slug = 'financeiro-conta-azul'
ON CONFLICT (slug, org_id) DO NOTHING;

-- 8. Backfill project_id on existing data
UPDATE public.briefing_configs bc
SET project_id = p.id
FROM public.projects p
WHERE bc.client_slug = p.slug AND bc.project_id IS NULL;

UPDATE public.blueprint_configs bc
SET project_id = p.id
FROM public.projects p
WHERE bc.client_slug = p.slug AND bc.project_id IS NULL;

UPDATE public.comments c
SET project_id = p.id
FROM public.projects p
WHERE c.client_slug = p.slug AND c.project_id IS NULL;

UPDATE public.share_tokens st
SET project_id = p.id
FROM public.projects p
WHERE st.client_slug = p.slug AND st.project_id IS NULL;
```

- [ ] **Step 2: Apply the migration**

Run: `npx supabase migration up` or deploy via MCP tool `mcp__supabase__apply_migration`.

- [ ] **Step 3: Verify migration**

Check tables exist with correct columns via `mcp__supabase__execute_sql`:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'projects';
SELECT column_name FROM information_schema.columns WHERE table_name = 'briefing_configs' AND column_name = 'project_id';
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/018_projects_and_schema_updates.sql
git commit -m "infra: add projects table and project_id to stores"
```

---

## Task 2: Module Infrastructure — Extend ModuleDefinition with useNavItems

**Files:**
- Modify: `/src/platform/module-loader/registry.ts` (lines 15-20 NavItem, lines 40-65 ModuleManifest/ModuleDefinition)
- Modify: `/src/platform/module-loader/module-ids.ts` (add PROJECTS)

- [ ] **Step 1: Add PROJECTS to module-ids.ts**

In `/src/platform/module-loader/module-ids.ts`, add `PROJECTS: 'projects'` to the `MODULE_IDS` constant:

```typescript
export const MODULE_IDS = {
  DOCS: 'docs',
  FERRAMENTAS: 'ferramentas',
  CLIENTS: 'clients',
  PROJECTS: 'projects',  // ← NEW
  TASKS: 'tasks',
  CONNECTOR: 'connector',
} as const
```

- [ ] **Step 2: Extend ModuleManifest with useNavItems hook**

In `/src/platform/module-loader/registry.ts`, add optional `useNavItems` to the `ModuleManifest` interface:

```typescript
export interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus
  navChildren?: NavItem[]
  useNavItems?: () => { items: NavItem[]; isLoading: boolean }  // ← NEW
  routeConfig?: RouteObject[]
}
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS (new field is optional, no breaking changes)

- [ ] **Step 4: Commit**

```bash
git add src/platform/module-loader/module-ids.ts src/platform/module-loader/registry.ts
git commit -m "infra: add PROJECTS module id and useNavItems hook to ModuleManifest"
```

---

## Task 3: Projects Service — New Service Layer

**Files:**
- Create: `/src/modules/projects/services/projects-service.ts`
- Create: `/src/modules/projects/types/index.ts`

- [ ] **Step 1: Create project types**

Create `/src/modules/projects/types/index.ts`:

```typescript
export interface Project {
  id: string
  slug: string
  name: string
  client_id: string | null
  org_id: string
  created_at: string
}
```

- [ ] **Step 2: Create projects service**

Create `/src/modules/projects/services/projects-service.ts`:

```typescript
import { supabase } from '@platform/supabase'
import type { Project } from '../types'

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProject(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createProject(project: {
  slug: string
  name: string
  client_id?: string | null
  org_id: string
}): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: project.slug,
      name: project.name,
      client_id: project.client_id ?? null,
      org_id: project.org_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/modules/projects/types/index.ts src/modules/projects/services/projects-service.ts
git commit -m "app: add projects service layer and types"
```

---

## Task 4: Migrate Stores from client_slug to project_slug

**Files:**
- Modify: `/tools/wireframe-builder/lib/briefing-store.ts`
- Modify: `/tools/wireframe-builder/lib/blueprint-store.ts`
- Modify: `/tools/wireframe-builder/lib/comments.ts`
- Modify: `/tools/wireframe-builder/lib/tokens.ts`
- Modify: `/tools/wireframe-builder/types/comments.ts`
- Modify: `/tools/wireframe-builder/components/editor/ShareModal.tsx`
- Modify: `/tools/wireframe-builder/components/BlueprintRenderer.tsx`
- Modify: `/tools/wireframe-builder/components/CommentManager.tsx`
- Modify: `/tools/wireframe-builder/components/CommentOverlay.tsx`
- Modify: `/tools/wireframe-builder/components/SectionWrapper.tsx`
- Modify: `/tools/wireframe-builder/lib/generation-engine.ts` (if uses clientSlug)
- Modify: `/tools/wireframe-builder/lib/spec-generator.ts` (if uses clientSlug)
- Modify: `/tools/wireframe-builder/lib/skill-renderer.ts` (if uses clientSlug)
- Modify: `/tools/wireframe-builder/lib/config-resolver.ts` (if uses clientSlug)
- Modify: `/tools/wireframe-builder/types/generation.ts` (if uses clientSlug)
- Modify: `/src/modules/wireframe/pages/SharedWireframeView.tsx` (uses validateToken which returns clientSlug)

This task renames the `clientSlug`/`client_slug` parameter to `projectSlug`/`project_slug` throughout **all** store functions, component props, and lib files in the wireframe builder. The column `client_slug` still exists in the DB (kept for backward compat), so the Supabase queries continue using `client_slug` column name — only the function parameter names, component props, and TypeScript types change to reflect the new mental model. In a future migration, the DB column will be renamed.

**Alternative approach:** If `project_id` is already backfilled (Task 1), queries can switch to `project_id` lookups instead. However, this requires loading the project first to get the UUID. For simplicity, keep querying by slug via the `client_slug` column for now — the column name is a DB detail, not a public API.

**Scope note:** Run `grep -r "clientSlug\|client_slug" tools/wireframe-builder/ src/modules/wireframe/ --include="*.ts" --include="*.tsx" -l` before starting to get the full list of files to update. The list above covers known files but there may be additional references.

- [ ] **Step 1: Update briefing-store.ts**

In `/tools/wireframe-builder/lib/briefing-store.ts`, rename all `clientSlug` parameters to `projectSlug`. The `.eq('client_slug', projectSlug)` stays as-is (DB column name unchanged):

```typescript
// Before: export async function loadBriefing(clientSlug: string)
// After:
export async function loadBriefing(projectSlug: string) {
  // ... .eq('client_slug', projectSlug)
}

// Before: export async function saveBriefing(clientSlug: string, config, updatedBy)
// After:
export async function saveBriefing(projectSlug: string, config: BriefingConfig, updatedBy: string) {
  // ... .eq('client_slug', projectSlug)
}
```

- [ ] **Step 2: Update blueprint-store.ts**

In `/tools/wireframe-builder/lib/blueprint-store.ts`, rename all `clientSlug` parameters to `projectSlug` in `loadBlueprint`, `saveBlueprint`, `checkForUpdates`, `seedFromFile`. Keep `.eq('client_slug', projectSlug)`.

- [ ] **Step 3: Update comments.ts**

In `/tools/wireframe-builder/lib/comments.ts`, rename `clientSlug` to `projectSlug` in all functions: `addComment`, `getCommentsByScreen`, `getCommentsForClient` → `getCommentsForProject`, `resolveComment`, `createShareToken`. Keep `.eq('client_slug', projectSlug)`.

- [ ] **Step 4: Update tokens.ts**

In `/tools/wireframe-builder/lib/tokens.ts`, rename `clientSlug` to `projectSlug`. Keep `.eq('client_slug', projectSlug)`.

- [ ] **Step 5: Update types/comments.ts**

In `/tools/wireframe-builder/types/comments.ts`, keep `client_slug` field name in types (matches DB column), but add a comment noting it maps to project slug:

```typescript
export type Comment = {
  id: string
  client_slug: string  // maps to project slug (legacy column name)
  // ...rest unchanged
}
```

- [ ] **Step 6: Update wireframe builder components**

Update all components in `tools/wireframe-builder/components/` that accept `clientSlug` as a prop — rename prop to `projectSlug`:
- `ShareModal.tsx` — prop rename + pass to store functions
- `BlueprintRenderer.tsx` — prop rename
- `CommentManager.tsx` — prop rename + pass to comment store functions
- `CommentOverlay.tsx` — prop rename
- `SectionWrapper.tsx` — prop rename

Also update any lib files (`generation-engine.ts`, `spec-generator.ts`, `skill-renderer.ts`, `config-resolver.ts`) and type files (`types/generation.ts`) that reference `clientSlug`.

- [ ] **Step 7: Update SharedWireframeView**

In `/src/modules/wireframe/pages/SharedWireframeView.tsx`, the `validateToken()` call returns `{ valid, clientSlug }`. Update variable name to `projectSlug` after destructuring. The DB column `client_slug` still returns the same value — this is only a variable rename.

- [ ] **Step 8: Do NOT update module page call sites yet**

The page files in `src/modules/clients/pages/` (BriefingForm, BlueprintTextView, WireframeViewer) will be updated in Task 6 when the entire module is renamed. Updating them here would create duplicate work. The `tsc --noEmit` may show warnings about variable names, but the code will still compile since the store functions accept the same type (string).

- [ ] **Step 9: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add tools/wireframe-builder/ src/modules/wireframe/
git commit -m "app: migrate stores and components from clientSlug to projectSlug"
```

---

## Task 5: New Clients Module — CRUD Pages

**Files:**
- Create: `/src/modules/clients-crud/manifest.tsx`
- Create: `/src/modules/clients-crud/pages/ClientsListPage.tsx`
- Create: `/src/modules/clients-crud/pages/ClientDetailPage.tsx`
- Create: `/src/modules/clients-crud/hooks/useClientsNav.ts`
- Modify: `/src/modules/clients/services/clients-service.ts` (add createClient, updateClient, deleteClient)

The folder is named `clients-crud` temporarily to avoid conflict with the existing `clients` folder which will be renamed in Task 6. The `clients-service.ts` currently lives at `/src/modules/clients/services/clients-service.ts` — imports in this task use that path. After Task 6 renames the directory, the service file moves with it and is then relocated back to the new `clients` module.

- [ ] **Step 1: Extend clients-service with full CRUD**

Add to `/src/modules/clients/services/clients-service.ts`:

```typescript
export async function createClient(client: {
  slug: string
  name: string
  description?: string
  logo_url?: string
  org_id: string
}): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      slug: client.slug,
      name: client.name,
      description: client.description ?? '',
      logo_url: client.logo_url ?? null,
      org_id: client.org_id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateClient(
  id: string,
  updates: { name?: string; description?: string; logo_url?: string; status?: string }
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

Also update the `Client` type to include new columns:

```typescript
export type Client = {
  id: string
  slug: string
  name: string
  description: string
  logo_url: string | null
  status: string
  org_id: string
  created_at: string
  updated_at?: string
}
```

- [ ] **Step 2: Create useClientsNav hook**

Create `/src/modules/clients-crud/hooks/useClientsNav.ts`:

```typescript
import { useEffect, useState } from 'react'
import { listClients } from '@modules/clients/services/clients-service'
import type { NavItem } from '@platform/module-loader/registry'

export function useClientsNav(): { items: NavItem[]; isLoading: boolean } {
  const [items, setItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listClients()
      .then(clients => {
        setItems(
          clients.map(c => ({
            label: c.name,
            href: `/clientes/${c.slug}`,
          }))
        )
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [])

  return { items, isLoading }
}
```

- [ ] **Step 3: Create ClientsListPage**

Create `/src/modules/clients-crud/pages/ClientsListPage.tsx`:

A page that lists all clients for the current org with:
- Cards or table layout showing name, status badge, description
- "Novo Cliente" button that opens a Dialog with name + slug fields
- Click on client navigates to `/clientes/:slug`
- Use shadcn/ui components (Card, Button, Dialog, Input, Badge)
- Call `listClients()` on mount, `createClient()` on submit

- [ ] **Step 4: Create ClientDetailPage**

Create `/src/modules/clients-crud/pages/ClientDetailPage.tsx`:

A page showing client profile at `/clientes/:slug`:
- Client name (inline-editable), logo, status toggle, description
- Section showing projects linked to this client (query `projects` where `client_id` = this client's id)
- Edit and delete actions
- Use `getClient(slug)` on mount, `updateClient()` / `deleteClient()` on actions

- [ ] **Step 5: Create clients-crud manifest**

Create `/src/modules/clients-crud/manifest.tsx`:

```typescript
import { Users } from 'lucide-react'
import { lazy } from 'react'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { useClientsNav } from './hooks/useClientsNav'

const ClientsListPage = lazy(() => import('./pages/ClientsListPage'))
const ClientDetailPage = lazy(() => import('./pages/ClientDetailPage'))

export const clientsCrudManifest: ModuleDefinition = {
  id: MODULE_IDS.CLIENTS,
  description: 'Cadastro e gestão de clientes da organização.',
  tenantScoped: true,
  label: 'Clientes',
  route: '/clientes',
  icon: Users,
  status: 'active',
  useNavItems: useClientsNav,
  routeConfig: [
    { path: '/clientes', element: <ClientsListPage /> },
    { path: '/clientes/:slug', element: <ClientDetailPage /> },
  ],
}
```

- [ ] **Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/modules/clients-crud/ src/modules/clients/services/clients-service.ts
git commit -m "app: add new clients CRUD module with dynamic nav"
```

---

## Task 6: Rename Current Clients Module → Projects

**Files:**
- Rename: `/src/modules/clients/` → `/src/modules/projects/` (except `services/clients-service.ts` which stays as shared service)
- Modify: renamed `/src/modules/projects/manifest.tsx`
- Modify: all page files in renamed module (update imports, route params)
- Create: `/src/modules/projects/hooks/useProjectsNav.ts`

- [ ] **Step 1: Move the directory**

```bash
# Move clients module to projects
mv src/modules/clients src/modules/projects
# Move clients-crud to clients (the new module takes the original name)
mv src/modules/clients-crud src/modules/clients
```

- [ ] **Step 2: Move clients-service to shared location**

The `clients-service.ts` is used by both modules. Move it so both can import:

```bash
# Keep clients-service in the clients module (it owns client data)
mv src/modules/projects/services/clients-service.ts src/modules/clients/services/clients-service.ts
```

Update import paths in `src/modules/clients/hooks/useClientsNav.ts` and `src/modules/clients/manifest.tsx` to use relative imports since the service is now in the same module.

- [ ] **Step 3: Create useProjectsNav hook**

Create `/src/modules/projects/hooks/useProjectsNav.ts`:

```typescript
import { useEffect, useState } from 'react'
import { listProjects } from '../services/projects-service'
import type { NavItem } from '@platform/module-loader/registry'

export function useProjectsNav(): { items: NavItem[]; isLoading: boolean } {
  const [items, setItems] = useState<NavItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listProjects()
      .then(projects => {
        setItems(
          projects.map(p => ({
            label: p.name,
            href: `/projetos/${p.slug}`,
            children: [
              { label: 'Briefing', href: `/projetos/${p.slug}/briefing` },
              { label: 'Blueprint', href: `/projetos/${p.slug}/blueprint` },
              { label: 'Wireframe', href: `/projetos/${p.slug}/wireframe` },
              { label: 'Branding', href: `/projetos/${p.slug}/branding` },
            ],
          }))
        )
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false))
  }, [])

  return { items, isLoading }
}
```

- [ ] **Step 4: Rewrite projects manifest**

Rewrite `/src/modules/projects/manifest.tsx`:

```typescript
import { FolderKanban } from 'lucide-react'
import { lazy } from 'react'
import { MODULE_IDS } from '@platform/module-loader/module-ids'
import type { ModuleDefinition } from '@platform/module-loader/registry'
import { useProjectsNav } from './hooks/useProjectsNav'

const ProjectsIndex = lazy(() => import('./pages/ClientsIndex'))  // rename file in Step 5
const BriefingForm = lazy(() => import('./pages/BriefingForm'))
const BlueprintTextView = lazy(() => import('./pages/BlueprintTextView'))
const WireframeViewer = lazy(() => import('./pages/WireframeViewer'))

export const projectsManifest: ModuleDefinition = {
  id: MODULE_IDS.PROJECTS,
  description: 'Criação e gestão de projetos — briefing, blueprint e wireframe.',
  tenantScoped: true,
  label: 'Projetos',
  route: '/projetos',
  icon: FolderKanban,
  status: 'active',
  useNavItems: useProjectsNav,
  routeConfig: [
    { path: '/projetos', element: <ProjectsIndex /> },
    { path: '/projetos/:projectSlug/briefing', element: <BriefingForm /> },
    { path: '/projetos/:projectSlug/blueprint', element: <BlueprintTextView /> },
    { path: '/projetos/:projectSlug/wireframe', element: <WireframeViewer /> },
    { path: '/projetos/:projectSlug/branding', element: <BriefingForm /> },
  ],
}
```

- [ ] **Step 5: Rename and update page files**

In `/src/modules/projects/pages/`:

1. Rename `ClientsIndex.tsx` → `ProjectsIndex.tsx` — update to list projects (use `listProjects()` instead of `listClients()`), change heading to "Projetos", add "Novo Projeto" button with dialog (name field + optional client dropdown if clients module is enabled)
2. Update `BriefingForm.tsx` — change `useParams` to extract `projectSlug` instead of `clientSlug`, update all store calls to use `projectSlug` (stores already renamed in Task 4)
3. Update `BlueprintTextView.tsx` — change `useParams` to extract `projectSlug`, update store calls
4. Update `WireframeViewer.tsx` — change `useParams` to extract `projectSlug`, update store calls, remove hardcoded `brandingMap` for `financeiro-conta-azul`
5. Delete `/src/modules/projects/pages/FinanceiroContaAzul/` directory entirely (hardcoded pilot pages no longer needed — verify no external imports of these 4 files: `Index.tsx`, `DocViewer.tsx`, `Wireframe.tsx`, `WireframeViewer.tsx`)
6. Update all internal imports to use relative paths (not `@modules/clients/`) since the module directory has been renamed

- [ ] **Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/modules/projects/ src/modules/clients/
git commit -m "app: rename clients module to projects, create new clients module"
```

---

## Task 7: Update Module Registry and Router

**Files:**
- Modify: `/src/platform/module-loader/registry.ts` (update imports, registry array)
- Modify: `/src/platform/router/AppRouter.tsx` (remove hardcoded client routes)

- [ ] **Step 1: Update registry.ts**

Replace `clientsManifest` import with both new manifests:

```typescript
import { clientsCrudManifest } from '@modules/clients/manifest'
import { projectsManifest } from '@modules/projects/manifest'

export const MODULE_REGISTRY: ModuleDefinition[] = [
  docsManifest,
  ferramentasManifest,
  clientsCrudManifest,   // ← NEW: clients CRUD
  projectsManifest,      // ← RENAMED: was clientsManifest
  tasksManifest,
  connectorManifest,
]
```

- [ ] **Step 2: Update hardcoded routes in AppRouter.tsx**

In `/src/platform/router/AppRouter.tsx`:

1. Remove the hardcoded `<Route path="/clients/financeiro-conta-azul/wireframe" ...>` route
2. Remove the generic `<Route path="/clients/:clientSlug/wireframe" ...>` route
3. Remove any other hardcoded `/clients/` routes and their imports

**Important — full-screen wireframe route:** The current wireframe routes render OUTSIDE of `<Layout>` (full-screen, no sidebar). The projects module `routeConfig` renders INSIDE `<Layout>`. To preserve full-screen wireframe behavior, keep a manual route for wireframe outside the layout:

```typescript
{/* Full-screen wireframe — outside Layout */}
<Route path="/projetos/:projectSlug/wireframe" element={<WireframeViewer />} />
```

And remove `/projetos/:projectSlug/wireframe` from the projects manifest `routeConfig` (it's handled here instead). Update the import path from `@modules/projects/pages/WireframeViewer`.

4. Update the `WireframeViewer` import path from `@modules/clients/pages/WireframeViewer` to `@modules/projects/pages/WireframeViewer`

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Verify dev server**

Run: `make dev` and verify:
- `/clientes` shows the new clients list page
- `/projetos` shows the projects list page
- `/projetos/financeiro-conta-azul/briefing` loads the briefing form
- No console errors

- [ ] **Step 5: Commit**

```bash
git add src/platform/module-loader/registry.ts src/platform/router/AppRouter.tsx
git commit -m "app: update module registry with clients + projects, remove hardcoded routes"
```

---

## Task 8: Sidebar Workspace Refactor

**Files:**
- Modify: `/src/platform/layout/Sidebar.tsx`

- [ ] **Step 1: Add workspace state**

Add state to track active module. Derive initial value from current URL path:

```typescript
const [activeModuleId, setActiveModuleId] = useState<string>(() => {
  const path = location.pathname
  const match = enabledModules.find(m => path.startsWith(m.route))
  return match?.id ?? enabledModules[0]?.id ?? ''
})
```

- [ ] **Step 2: Build module switcher dropdown**

Replace the current flat nav with a two-layer structure:

1. **Top section** — Logo + dropdown (shadcn `Select` or custom dropdown):
   - Lists enabled modules by label + icon
   - Selecting a module sets `activeModuleId` and navigates to `module.route`

2. **Nav section** — Renders nav for active module only:
   - If active module has `useNavItems` hook → call it, render dynamic items with loading state
   - If active module has static `navChildren` → render those
   - If neither → show empty state

```typescript
const activeModule = enabledModules.find(m => m.id === activeModuleId)

// In render:
<div className="flex flex-col h-full">
  {/* Logo */}
  <div className="p-4">
    <Logo />
  </div>

  {/* Module Switcher */}
  <div className="px-3 pb-3">
    <Select value={activeModuleId} onValueChange={handleModuleSwitch}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {enabledModules.map(m => (
          <SelectItem key={m.id} value={m.id}>
            <m.icon className="h-4 w-4 mr-2 inline" />
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Module Nav */}
  <nav className="flex-1 overflow-y-auto px-3">
    {activeModule && <ModuleNav module={activeModule} />}
  </nav>

  {/* Footer */}
  <SidebarFooter />
</div>
```

- [ ] **Step 3: Create ModuleNav component**

Inside Sidebar.tsx (or as a separate component), handle both static and dynamic nav:

```typescript
function ModuleNav({ module }: { module: ModuleDefinition }) {
  // Dynamic nav via hook
  if (module.useNavItems) {
    return <DynamicNav useNavItems={module.useNavItems} />
  }
  // Static nav from manifest
  if (module.navChildren) {
    return <StaticNav items={module.navChildren} />
  }
  return null
}

function DynamicNav({ useNavItems }: { useNavItems: () => { items: NavItem[]; isLoading: boolean } }) {
  const { items, isLoading } = useNavItems()
  if (isLoading) return <NavSkeleton />
  return <StaticNav items={items} />
}
```

- [ ] **Step 4: Sync dropdown with URL navigation**

Add a `useEffect` to update `activeModuleId` when the user navigates via browser back/forward or direct URL:

```typescript
useEffect(() => {
  const match = enabledModules.find(m => location.pathname.startsWith(m.route))
  if (match && match.id !== activeModuleId) {
    setActiveModuleId(match.id)
  }
}, [location.pathname, enabledModules])
```

- [ ] **Step 5: Remove old flat nav logic**

Remove the `navigationFromRegistry` useMemo that flattened all modules' navChildren into one list. Remove the special-case for `MODULE_IDS.DOCS` tenant items — the docs module should handle its own nav via `navChildren` or `useNavItems`.

- [ ] **Step 6: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Visual verification**

Run: `make dev` and verify:
- Dropdown at top of sidebar shows enabled modules
- Switching modules changes sidebar nav and navigates to module home
- Clicking nav items within a module works correctly
- Browser back/forward keeps dropdown in sync
- Works in both light and dark mode

- [ ] **Step 8: Commit**

```bash
git add src/platform/layout/Sidebar.tsx
git commit -m "app: refactor sidebar to workspace pattern with module switcher"
```

---

## Task 9: Cleanup — Remove Hardcoded References

**Files:**
- Modify: `/src/modules/projects/pages/WireframeViewer.tsx` (remove brandingMap hardcoding, if not already done in Task 6)
- Modify: `/src/modules/tasks/pages/TaskForm.tsx` (has hardcoded `financeiro-conta-azul` reference)
- Delete: `/src/modules/projects/pages/FinanceiroContaAzul/` (if not deleted in Task 6)
- Verify: no remaining references to hardcoded `financeiro-conta-azul` in module code

- [ ] **Step 1: Search for remaining hardcoded references**

Run: `grep -r "financeiro-conta-azul" src/ --include="*.tsx" --include="*.ts" -l`
Run: `grep -r "FinanceiroContaAzul" src/ --include="*.tsx" --include="*.ts" -l`

Known files to fix:
- `src/modules/tasks/pages/TaskForm.tsx` — remove or make dynamic any `financeiro-conta-azul` reference

Fix any remaining references. The `clients/financeiro-conta-azul/` filesystem directory (under project root `clients/`) stays — it contains docs and wireframe configs that are loaded dynamically.

- [ ] **Step 2: Verify no hardcoded client slugs in manifests**

Check all manifest files to ensure no static `navChildren` contain client-specific slugs.

- [ ] **Step 3: Run full verification**

```bash
npx tsc --noEmit
make dev
```

Navigate through all routes, verify no broken links or console errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "app: remove hardcoded client references, complete modules restructure"
```

---

## Deferred Items (Out of Scope)

These items are noted in the spec but deferred to future work:

1. **RLS tightening** — `briefing_configs` and `blueprint_configs` currently have `USING (true)` RLS. Consider restricting via `org_id` JOIN with `projects` table in a future migration.
2. **Connector module dynamic nav** — The spec mentions Connector should show "Lista dinâmica de apps conectados" in sidebar. This will be done when the Connector module matures.
3. **DB column rename** — `client_slug` column in `briefing_configs`, `blueprint_configs`, `comments`, `share_tokens` kept for backward compat. Rename to `project_slug` in a future migration after all code references are updated.
4. **`client_slug` column removal** — After `project_id` is fully adopted as the lookup key, remove `client_slug` column from all tables.

---

## Execution Order & Dependencies

```
Task 1 (DB migration)
  ↓
Task 2 (module infrastructure)
  ↓
Task 3 (projects service)
  ↓
Task 4 (store migration — all wireframe builder files)
  ↓
Task 5 (new clients CRUD module)
  ↓
Task 6 (rename clients → projects + page updates)
  ↓
Task 7 (registry + router + full-screen wireframe route)
  ↓
Task 8 (sidebar workspace)
  ↓
Task 9 (cleanup + verify)
```

All tasks are sequential — they touch overlapping surfaces and must be executed in order.
