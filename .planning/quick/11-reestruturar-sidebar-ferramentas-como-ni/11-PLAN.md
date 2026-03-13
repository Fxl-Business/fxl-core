---
phase: quick-11
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/modules/ferramentas/manifest.tsx
  - src/modules/docs/manifest.tsx
  - src/modules/wireframe-builder/manifest.tsx
  - src/modules/registry.ts
autonomous: false
requirements: []
must_haves:
  truths:
    - "Sidebar shows 'Ferramentas' as a top-level section (depth 0)"
    - "Wireframe Builder and its sub-pages appear nested under Ferramentas"
    - "'Ferramentas' landing page link (/ferramentas/index) remains accessible"
    - "All existing Wireframe Builder nav links still work"
    - "Docs manifest no longer contains a 'Ferramentas' leaf item"
  artifacts:
    - path: "src/modules/ferramentas/manifest.tsx"
      provides: "Ferramentas parent module manifest wrapping wireframe-builder nav"
  key_links:
    - from: "src/modules/ferramentas/manifest.tsx"
      to: "src/modules/registry.ts"
      via: "MODULE_REGISTRY array import"
      pattern: "ferramentasManifest"
---

<objective>
Restructure the sidebar so "Ferramentas" is a top-level parent section containing
"Wireframe Builder" as a child tool. Currently wireframe-builder is a peer module
and "Ferramentas" is a leaf link inside the docs manifest.

Purpose: Establish the "Ferramentas" section as the parent container for all tools,
enabling future tools to be added under it naturally.

Output: New ferramentas module manifest, updated registry, cleaned docs manifest.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/modules/registry.ts
@src/modules/wireframe-builder/manifest.tsx
@src/modules/docs/manifest.tsx
@src/components/layout/Sidebar.tsx
</context>

<interfaces>
<!-- Key types from registry.ts -->
```typescript
export interface NavItem {
  label: string
  href?: string
  external?: boolean
  children?: NavItem[]
}

export interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
}
```

<!-- Current wireframe-builder navChildren structure (will be absorbed) -->
```typescript
navChildren: [
  {
    label: 'Wireframe Builder',
    href: '/ferramentas/wireframe-builder',
    children: [
      { label: 'Blocos Disponiveis', href: '/ferramentas/blocos/index', children: [...] },
      { label: 'Galeria de Componentes', href: '/ferramentas/wireframe-builder/galeria' },
    ],
  },
]
```

<!-- Current docs manifest "Ferramentas" leaf (line 66-68, to be removed) -->
```typescript
{
  label: 'Ferramentas',
  href: '/ferramentas/index',
},
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create ferramentas manifest and restructure registry</name>
  <files>
    src/modules/ferramentas/manifest.tsx
    src/modules/wireframe-builder/manifest.tsx
    src/modules/docs/manifest.tsx
    src/modules/registry.ts
  </files>
  <action>
1. Create `src/modules/ferramentas/manifest.tsx`:
   - Import `Wrench` from lucide-react (represents tools/ferramentas)
   - Import `ComponentGallery` from `@/pages/tools/ComponentGallery`
   - Create `ferramentasManifest: ModuleManifest` with:
     - id: 'ferramentas'
     - label: 'Ferramentas'
     - route: '/ferramentas/index'
     - icon: Wrench
     - status: 'active'
     - navChildren: a single top-level NavItem with:
       - label: 'Ferramentas'
       - href: '/ferramentas/index' (landing page stays clickable)
       - children containing the FULL wireframe-builder nav tree currently in wireframe-builder manifest's navChildren[0] (the object with label 'Wireframe Builder', href '/ferramentas/wireframe-builder', and its children array with Blocos and Galeria)
     - routeConfig: copy the routeConfig from current wireframe-builder manifest:
       `[{ path: '/ferramentas/wireframe-builder/galeria', element: <ComponentGallery /> }]`

2. Update `src/modules/wireframe-builder/manifest.tsx`:
   - REMOVE navChildren entirely (set to undefined or omit the field)
   - REMOVE routeConfig entirely (moved to ferramentas manifest)
   - REMOVE the ComponentGallery import (no longer needed here)
   - Keep the manifest export (other code may reference it for id/icon/status)
   - Update route to '/ferramentas/wireframe-builder' (no longer needs /galeria as primary)

3. Update `src/modules/docs/manifest.tsx`:
   - REMOVE the `{ label: 'Ferramentas', href: '/ferramentas/index' }` leaf item from the navChildren array (lines 66-68). This link is now provided by the ferramentas manifest.

4. Update `src/modules/registry.ts`:
   - Add import: `import { ferramentasManifest } from './ferramentas/manifest'`
   - In MODULE_REGISTRY array, REPLACE `wireframeBuilderManifest` with `ferramentasManifest`
   - Keep wireframeBuilderManifest import if it's used elsewhere, or remove if only used here
   - Maintain array order: docsManifest, ferramentasManifest, clientsManifest, knowledgeBaseManifest, tasksManifest

Important: The wireframe-builder MODULE still exists as a directory and manifest for module identity. Only its nav and route responsibilities move to the ferramentas parent manifest. If no other code imports wireframeBuilderManifest, remove the import from registry.ts.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>
    - "Ferramentas" appears as a depth-0 section in the sidebar
    - "Wireframe Builder" with all its sub-pages (Blocos, Galeria) renders nested under Ferramentas
    - The docs manifest "Ferramentas" leaf is gone (no duplicate)
    - All existing routes still work (/ferramentas/wireframe-builder/galeria, /ferramentas/blocos/*)
    - TypeScript compiles with zero errors
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Visual verification of sidebar restructure</name>
  <files>n/a</files>
  <action>
    User verifies the sidebar restructure visually in the browser.
  </action>
  <what-built>Restructured sidebar: "Ferramentas" is now a top-level parent section containing "Wireframe Builder" and its sub-pages (Blocos, Galeria)</what-built>
  <how-to-verify>
    1. Run `make dev` and open http://localhost:5173
    2. Check the sidebar:
       - "Ferramentas" should appear as a top-level section header (same style as "Processo", "Clientes", etc.)
       - Clicking "Ferramentas" label should navigate to /ferramentas/index
       - Under Ferramentas, "Wireframe Builder" should appear as a collapsible sub-section
       - Under Wireframe Builder, "Blocos Disponiveis" and "Galeria de Componentes" should appear
    3. Click "Galeria de Componentes" — should navigate to /ferramentas/wireframe-builder/galeria and show the ComponentGallery page
    4. Click any Bloco link — should navigate and render the doc page
    5. Verify "Ferramentas" does NOT appear as a duplicate leaf inside the "Padroes" section
    6. Check dark mode — section should render correctly
  </how-to-verify>
  <verify>User confirms sidebar looks correct</verify>
  <done>User approves the visual result</done>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Sidebar renders Ferramentas as parent with Wireframe Builder nested
- No duplicate "Ferramentas" link in sidebar
- All /ferramentas/* routes still resolve correctly
</verification>

<success_criteria>
- Ferramentas is a top-level sidebar section (depth 0)
- Wireframe Builder is nested under Ferramentas
- Landing page /ferramentas/index is accessible via Ferramentas label
- No visual regression in other sidebar sections
- Zero TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/11-reestruturar-sidebar-ferramentas-como-ni/11-SUMMARY.md`
</output>
