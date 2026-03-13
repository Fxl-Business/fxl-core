# Phase 29: Module Foundation & Registry - Research

**Researched:** 2026-03-12
**Domain:** TypeScript module registry pattern, ESLint architectural boundaries, React Router v6 data-driven routing
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOD-01 | Module registry com ModuleManifest tipado (id, label, route, icon, status) em src/modules/registry.ts | TypeScript interface + typed constant array; `LucideIcon` type already installed |
| MOD-02 | Folder structure por modulo: src/modules/[name]/ com pages/, components/, hooks/, types/ | Standard React feature-slice folder convention; scaffold folders with index.ts per module |
| MOD-03 | Sidebar e App.tsx consomem MODULE_REGISTRY para rotas e navegacao | Array.map/flatMap over registry replaces hardcoded `navigation` const in Sidebar.tsx and inline `<Route>` list in App.tsx |
| MOD-04 | Wrapper manifests para docs e wireframe-builder (registrados no registry sem mover codigo) | Manifest file per existing area imports existing page components; zero file movement |
</phase_requirements>

---

## Summary

Phase 29 introduces typed module boundaries and a single `MODULE_REGISTRY` constant that becomes the authoritative source for sidebar navigation, App.tsx routes, and (in Phase 33) the Home page. The change is **purely additive and structural in Phase 29**: no pages are moved, no new features are added. Existing `docs` and `wireframe-builder` areas get thin wrapper manifests so they participate in the registry without any code displacement.

The primary technical challenge is ESLint boundary enforcement. The project currently has **no ESLint installed** — only `tsc --noEmit` acts as the lint gate (confirmed in `package.json`). Installing `eslint` + `eslint-plugin-boundaries` v5 and updating `npm run lint` to run both TypeScript checking and ESLint boundary checks is the highest-risk step. The plugin is at v5.4.0 (Feb 2026), supports ESLint v9 flat config (`eslint.config.js`), and uses glob patterns to define element types.

The second challenge is making `Sidebar.tsx` consume the registry without breaking its existing recursive `NavSection` rendering logic. The current local `NavItem` type in Sidebar is already a recursive tree — the registry simply provides the same data shape from a centralized source.

**Primary recommendation:** Define `ModuleManifest` as a TypeScript interface in `src/modules/registry.ts`, define `NavItem` there as the shared navigation tree type (deleting the local copy in Sidebar), populate `MODULE_REGISTRY` as a typed constant array, then thread it into `Sidebar.tsx` and `App.tsx` via map/flatMap. Add `eslint.config.js` with flat config and `boundaries/element-types` rule. Use `.tsx` extension for manifest files that include JSX route elements.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript (existing) | ^5.6.3 | ModuleManifest type + registry constant | Already strict mode; `satisfies` available since TS 4.9 |
| react-router-dom (existing) | ^6.27.0 | Route generation from manifests | `RouteObject` type accepts `element?: React.ReactNode`; `<Route>` accepts mapped routes |
| eslint | ^9.x | Lint runner for boundary rules | v9 required for flat config; project has no eslint today |
| eslint-plugin-boundaries | ^5.4.0 | Cross-module import violation detection | Latest stable (Feb 2026); supports ESLint v9 flat config natively |
| @typescript-eslint/parser | ^8.x | Allow ESLint to parse .tsx files | Required for ESLint to understand TypeScript imports |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react (existing) | ^0.460.0 | `LucideIcon` type for icon field in ModuleManifest | Already installed; all lucide components satisfy `LucideIcon` type |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| eslint-plugin-boundaries | eslint `no-restricted-imports` | `no-restricted-imports` is per-file manual config; boundaries is declarative glob-based and scales |
| eslint-plugin-boundaries | NX `enforce-module-boundaries` | NX requires full monorepo tooling; overkill for a single-repo Vite app |
| Static typed registry | `import.meta.glob` dynamic discovery | Dynamic scan adds build complexity; STATE.md explicitly locks "static typed constant, not dynamic" |

**Installation:**

```bash
npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser
```

**Critical:** After installation, update `package.json` `lint` script:

```json
{
  "scripts": {
    "lint": "eslint src/ && tsc --noEmit"
  }
}
```

The current `"lint": "tsc --noEmit"` will not run ESLint boundary checks. The success criterion for MOD-03 explicitly requires `npm run lint` to pass with violations reported as errors.

---

## Architecture Patterns

### Recommended Project Structure

The registry introduces a `src/modules/` folder. Existing code in `src/pages/` and `src/components/` stays untouched. Phase 29 only creates the registry, wrapper manifests, and scaffold module folders.

```
src/
├── modules/
│   ├── registry.ts              # MODULE_REGISTRY + ModuleManifest + NavItem types (MOD-01)
│   ├── docs/                    # Wrapper manifest for existing docs area (MOD-04)
│   │   └── manifest.tsx         # JSX present -> .tsx extension required
│   ├── wireframe-builder/       # Wrapper manifest for existing WF builder (MOD-04)
│   │   └── manifest.tsx
│   ├── clients/                 # Wrapper manifest for clients area (MOD-04)
│   │   └── manifest.tsx
│   ├── knowledge-base/          # Scaffold only — built in Phase 31
│   │   └── manifest.ts
│   └── tasks/                   # Scaffold only — built in Phase 32
│       └── manifest.ts
├── components/layout/
│   └── Sidebar.tsx              # Updated to map MODULE_REGISTRY (MOD-03)
├── App.tsx                      # Updated to flatMap routeConfig from registry (MOD-03)
└── (everything else unchanged)
eslint.config.js                 # NEW at project root (MOD-03 lint criterion)
```

### Pattern 1: ModuleManifest Type and Registry Constant (MOD-01)

**What:** A typed interface with all module fields, plus a typed constant array as the single source of truth.
**When to use:** All top-level platform areas register here and nowhere else.

```typescript
// src/modules/registry.ts
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'

export type ModuleStatus = 'active' | 'beta' | 'coming-soon'

// Shared nav tree type — replaces the local NavItem in Sidebar.tsx
export interface NavItem {
  label: string
  href?: string
  external?: boolean
  children?: NavItem[]
}

export interface ModuleManifest {
  id: string
  label: string
  /** Primary route — used in sidebar top-level link and Home page cards */
  route: string
  icon: LucideIcon
  status: ModuleStatus
  /** Sidebar navigation subtree for this module */
  navChildren?: NavItem[]
  /** React Router routes this module contributes */
  routeConfig?: RouteObject[]
}

// Populated by importing each manifest — see wrapper manifests
export const MODULE_REGISTRY: ModuleManifest[] = []
```

The registry file is the import hub. Each module exports a manifest that is added to the array.

### Pattern 2: Wrapper Manifest (MOD-04)

**What:** A manifest file that registers an existing code area without moving any files.
**When to use:** Docs and wireframe-builder exist in `src/pages/` — they need registry participation from day one.

```tsx
// src/modules/docs/manifest.tsx
// .tsx extension required — file contains JSX for routeConfig elements
import { BookOpen } from 'lucide-react'
import type { ModuleManifest } from '../registry'
import DocRenderer from '@/pages/DocRenderer'
import ComponentGallery from '@/pages/tools/ComponentGallery'

export const docsManifest: ModuleManifest = {
  id: 'docs',
  label: 'Processo',
  route: '/processo/index',
  icon: BookOpen,
  status: 'active',
  navChildren: [
    // Copy of Processo/Padroes/Ferramentas subtrees from current Sidebar.tsx
    {
      label: 'Processo',
      href: '/processo/index',
      children: [ /* ... */ ],
    },
    {
      label: 'Padroes',
      href: '/padroes/index',
      children: [ /* ... */ ],
    },
    {
      label: 'Ferramentas',
      href: '/ferramentas/index',
      children: [ /* ... */ ],
    },
  ],
  routeConfig: [
    { path: '/processo/*', element: <DocRenderer /> },
    { path: '/referencias/*', element: <DocRenderer /> },
    { path: '/padroes/*', element: <DocRenderer /> },
    { path: '/ferramentas/wireframe-builder/galeria', element: <ComponentGallery /> },
    { path: '/ferramentas/*', element: <DocRenderer /> },
  ],
}
```

Then in registry.ts, import and register:

```typescript
// src/modules/registry.ts (with manifests registered)
import { docsManifest } from './docs/manifest'
import { wireframeManifest } from './wireframe-builder/manifest'
import { clientsManifest } from './clients/manifest'
import { knowledgeBaseManifest } from './knowledge-base/manifest'
import { tasksManifest } from './tasks/manifest'

export const MODULE_REGISTRY: ModuleManifest[] = [
  docsManifest,
  wireframeManifest,
  clientsManifest,
  knowledgeBaseManifest,
  tasksManifest,
]
```

### Pattern 3: Sidebar Consuming Registry (MOD-03)

**What:** Replace the hardcoded `navigation: NavItem[]` const in Sidebar.tsx with a flatMap over `MODULE_REGISTRY`.
**When to use:** The core data-source change. Existing `NavSection` recursive renderer is untouched.

```typescript
// src/components/layout/Sidebar.tsx
import { MODULE_REGISTRY, type NavItem } from '@/modules/registry'
// Delete local NavItem type definition — now imported from registry

// Replace:
//   const navigation: NavItem[] = [ { label: 'Home', ... }, ... ]
//
// With:
const navigationFromRegistry: NavItem[] = MODULE_REGISTRY
  .filter(m => m.status !== 'coming-soon')
  .flatMap(m => m.navChildren ?? [])

// Home item stays hardcoded (it is not a module)
export default function Sidebar() {
  const navItems = navigationFromRegistry
  // ... rest of component identical to today
}
```

The `NavSection` component, `hasActiveChild`, `open/setOpen` logic — all unchanged.

### Pattern 4: App.tsx Route Composition (MOD-03)

**What:** App.tsx composes routes from `MODULE_REGISTRY` instead of listing them inline.
**Constraint:** Success criterion requires under 60 lines of route definitions (the `<Routes>` block, not the entire file).

```tsx
// src/App.tsx
import { MODULE_REGISTRY } from '@/modules/registry'

// Derive routes once outside the component (stable reference)
const moduleRoutes = MODULE_REGISTRY.flatMap(m => m.routeConfig ?? [])

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes inside Layout shell */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          {moduleRoutes.map(cfg => (
            <Route
              key={String(cfg.path)}
              path={cfg.path as string}
              element={cfg.element}
            />
          ))}
        </Route>

        {/* Auth — public, full screen (not module-driven, stay hardcoded) */}
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<SignUp ... />} />

        {/* Profile — protected, full screen */}
        <Route path="/perfil/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Wireframe viewer — full screen, client-specific static route first */}
        <Route
          path="/clients/financeiro-conta-azul/wireframe"
          element={<ProtectedRoute><WireframeViewer clientSlug="financeiro-conta-azul" /></ProtectedRoute>}
        />
        <Route
          path="/clients/:clientSlug/wireframe"
          element={<ProtectedRoute><WireframeViewer /></ProtectedRoute>}
        />

        {/* Legacy redirect + public share link — stay hardcoded */}
        <Route path="/clients/financeiro-conta-azul/wireframe-view" element={<Navigate to="..." replace />} />
        <Route path="/wireframe-view" element={<Suspense ...><SharedWireframeView /></Suspense>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
```

The wireframe viewer routes stay hardcoded because the static route for `financeiro-conta-azul` must score higher than the parametric `:clientSlug` route — this specificity depends on route declaration order and is fragile to automate. This is the correct and safe approach.

### Pattern 5: ESLint Flat Config with Boundaries (MOD-03 success criterion 3)

**What:** `eslint.config.js` at project root using eslint-plugin-boundaries v5 to flag cross-module imports as errors.
**When to use:** This is new infrastructure — no existing ESLint config in the project.

```javascript
// eslint.config.js (project root)
// Source: eslint-plugin-boundaries v5.4.0 (Feb 2026) flat config
import boundaries from 'eslint-plugin-boundaries'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: { boundaries },
    settings: {
      // Patterns are relative to project root (not @/ aliases)
      'boundaries/elements': [
        { type: 'module',    pattern: 'src/modules/!(registry)*' },
        { type: 'component', pattern: 'src/components/*' },
        { type: 'page',      pattern: 'src/pages/*' },
        { type: 'lib',       pattern: 'src/lib/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          // Start with default allow — safer for existing codebase
          default: 'allow',
          rules: [
            // Modules must NOT import from other modules' internals directly
            // (they communicate through registry or shared lib)
            {
              from: 'module',
              disallow: ['module'],
            },
          ],
        },
      ],
    },
  },
]
```

Note on `default: 'allow'` vs `default: 'disallow'`: The success criterion says "cross-module import violations reported as errors" — this is satisfied with `default: 'allow'` + an explicit `disallow` rule for module-to-module imports. A `default: 'disallow'` posture would require whitelisting every existing import pattern in the codebase, which is premature for Phase 29.

### Anti-Patterns to Avoid

- **Moving existing page files into `src/modules/`:** MOD-04 explicitly says wrapper manifests, not code movement. Moving code breaks imports, routes, and TypeScript path alias resolution.
- **Dynamic registry via `import.meta.glob`:** STATE.md decision locks this as "static typed constant, not dynamic". Also flagged as a research risk in STATE.md blockers.
- **Keeping `NavItem` defined locally in Sidebar.tsx:** With registry as data source, `NavItem` belongs in `registry.ts` as the shared type. Two separate `NavItem`-compatible types will diverge.
- **Using `React.ComponentType<any>` for icon:** Use `import type { LucideIcon } from 'lucide-react'` — avoids `any` and matches the actual type lucide exports.
- **Making MODULE_REGISTRY a Map or class:** A plain typed array is deterministic, tree-shakable, and TypeScript-inferrable. Maps add complexity for 5-6 entries.
- **Adding JSX in `.ts` files:** Manifest files that include `element: <DocRenderer />` must use `.tsx` extension, or tsc will error on JSX syntax.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Import boundary enforcement | Custom ESLint rule | eslint-plugin-boundaries v5 | Plugin handles glob pattern matching, transitive imports, and generates actionable error messages |
| Icon type for manifest | `React.FC<unknown>` or `any` | `LucideIcon` from lucide-react | Already installed; all lucide icons satisfy this type exactly |
| Route type-safety | Custom `RouteConfig` interface | `RouteObject` from react-router-dom | Already exported; `path` and `element` fields match `<Route>` props directly |

**Key insight:** The registry is a plain typed constant. Do not reach for a library or factory abstraction — TypeScript's type system provides compile-time validation with zero runtime overhead.

---

## Common Pitfalls

### Pitfall 1: ESLint Not Installed — Lint Script Silently Passes

**What goes wrong:** `npm run lint` currently runs only `tsc --noEmit`. ESLint is not in `devDependencies` at all (confirmed via package.json inspection). If it is not installed and the script is not updated, boundary rules never run and the lint gate appears to pass.
**Why it happens:** ESLint was never added to this project.
**How to avoid:** Install ESLint + plugins first, update the `lint` script in package.json, then verify `npm run lint` actually shows ESLint output before declaring success.
**Warning signs:** `npm run lint` exits 0 without any ESLint version/file output line.

### Pitfall 2: ESLint Flat Config vs Legacy Config

**What goes wrong:** Creating `.eslintrc.js` or `.eslintrc.json` instead of `eslint.config.js`. ESLint v9 uses flat config by default — legacy `eslintrc` files are silently ignored.
**Why it happens:** Most online examples still show legacy `.eslintrc` format (it remained dominant until late 2024).
**How to avoid:** Use `eslint.config.js` exclusively. The project uses `"type": "module"` in `package.json`, so `eslint.config.js` is an ES module with `export default [...]`.
**Warning signs:** Running `eslint .` produces no errors for imports that should be blocked.

### Pitfall 3: eslint-plugin-boundaries Pattern Resolution With Vite `@/` Aliases

**What goes wrong:** The plugin uses file system glob patterns relative to `process.cwd()`. An import written as `import X from '@/modules/docs/manifest'` resolves to `src/modules/docs/manifest` on disk — the plugin may or may not trace through the alias.
**Why it happens:** `@/` is a Vite/TS build-time alias; ESLint runs independently of Vite.
**How to avoid:** Patterns in `boundaries/elements` must use physical paths (`src/modules/*`, not `@/modules/*`). If the plugin still fails to detect violations via `@/` imports, add `'boundaries/alias': { '@/': './src/' }` to settings (check v5 docs for exact syntax) or verify with a trivial test violation during Wave 1.
**Warning signs:** Adding a known cross-module import produces no lint error.

### Pitfall 4: JSX in `.ts` Manifest Files

**What goes wrong:** A manifest file contains `routeConfig: [{ path: '/x', element: <DocRenderer /> }]` but has a `.ts` extension. TypeScript (`tsc --noEmit`) will error: "Cannot use JSX unless the '--jsx' flag is provided" or "JSX element implicitly has type 'any'".
**Why it happens:** TypeScript only processes JSX in `.tsx` files.
**How to avoid:** All manifest files that include JSX route elements must use the `.tsx` extension. Files with no JSX (e.g., scaffold `manifest.ts` for knowledge-base) can stay `.ts`.
**Warning signs:** `tsc --noEmit` errors on manifest files immediately after creation.

### Pitfall 5: Sidebar NavItem Type Divergence

**What goes wrong:** `ModuleManifest.navChildren` is typed as `NavItem[]` from `registry.ts`, but Sidebar.tsx still has its own local `NavItem` type. They are structurally compatible today, but any future field addition to one breaks the other silently.
**Why it happens:** Two separate type declarations for the same logical concept.
**How to avoid:** Delete the local `NavItem` type in `Sidebar.tsx` and import `NavItem` from `@/modules/registry`. This makes the registry the single type source and prevents divergence.
**Warning signs:** TypeScript errors about incompatible `children?` field types when assigning manifests to nav arrays.

### Pitfall 6: WireframeViewer Static Route Must Precede Parametric Route

**What goes wrong:** If the `financeiro-conta-azul/wireframe` static route is removed from App.tsx or placed after the parametric `:clientSlug/wireframe` route inside `MODULE_REGISTRY.flatMap(routes)`, React Router may route it incorrectly.
**Why it happens:** React Router v6 ranks routes by specificity, but declaration order matters when routes have equal specificity score. The existing App.tsx comment explicitly documents this.
**How to avoid:** Keep the full-screen wireframe viewer routes **hardcoded in App.tsx** (outside the registry flatMap) in the correct order: static client route before parametric route. These routes are client-specific infrastructure, not module features.
**Warning signs:** Navigating to `/clients/financeiro-conta-azul/wireframe` loads a blank page or wrong component.

### Pitfall 7: `noUnusedLocals` on Empty Scaffold Module Files

**What goes wrong:** Creating `src/modules/knowledge-base/manifest.ts` as a near-empty scaffold with no exports causes TypeScript `noUnusedLocals` errors if any imports are present.
**Why it happens:** `tsconfig.json` has `"noUnusedLocals": true`.
**How to avoid:** Scaffold manifests must export at minimum a `ModuleManifest` object (with `routeConfig: []` and `navChildren: []`) that IS imported and used by `MODULE_REGISTRY`. No orphaned imports.
**Warning signs:** `tsc --noEmit` errors on newly created manifest files with "X is declared but never used."

---

## Code Examples

### ModuleManifest Type (complete, verified against codebase)

```typescript
// src/modules/registry.ts
// Source: direct derivation from src/components/layout/Sidebar.tsx NavItem type
// + src/App.tsx route patterns + react-router-dom RouteObject
import type { LucideIcon } from 'lucide-react'
import type { RouteObject } from 'react-router-dom'

export type ModuleStatus = 'active' | 'beta' | 'coming-soon'

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

// Import manifests here after creating them
export const MODULE_REGISTRY: ModuleManifest[] = []
```

### App.tsx Route Composition (target form)

```tsx
// src/App.tsx (simplified target — under 60 lines of <Routes> block)
import { MODULE_REGISTRY } from '@/modules/registry'

// Outside component for stable reference
const moduleRoutes = MODULE_REGISTRY.flatMap(m => m.routeConfig ?? [])

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          {moduleRoutes.map(cfg => (
            <Route key={String(cfg.path)} path={cfg.path as string} element={cfg.element} />
          ))}
        </Route>
        {/* Auth, full-screen, and public routes stay hardcoded */}
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
```

### eslint.config.js (verified flat config syntax for v5.4.0)

```javascript
// eslint.config.js (project root)
// Source: jsboundaries.dev quick-start + eslint-plugin-boundaries v5 GitHub
import boundaries from 'eslint-plugin-boundaries'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        // Exclude registry.ts itself from being classified as a module element
        { type: 'module',    pattern: 'src/modules/!(registry)*' },
        { type: 'component', pattern: 'src/components/*' },
        { type: 'page',      pattern: 'src/pages/*' },
        { type: 'lib',       pattern: 'src/lib/*' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            // Modules must not import from sibling module internals
            { from: 'module', disallow: ['module'] },
          ],
        },
      ],
    },
  },
]
```

### Sidebar.tsx Data Source Change (minimal diff)

```typescript
// src/components/layout/Sidebar.tsx — the only meaningful change

// BEFORE (lines 7-126):
// type NavItem = { label: string; href?: string; children?: NavItem[]; external?: boolean }
// const navigation: NavItem[] = [ { label: 'Home', ... }, ... 120 lines ... ]

// AFTER:
import { MODULE_REGISTRY, type NavItem } from '@/modules/registry'
// NavItem type comes from registry now; local definition deleted

const navigationFromRegistry: NavItem[] = MODULE_REGISTRY
  .filter(m => m.status !== 'coming-soon')
  .flatMap(m => m.navChildren ?? [])

// In the component body — replace `navigation.slice(1)` with:
// rest = navigationFromRegistry
```

Everything else in `Sidebar.tsx` (NavSection, hasActiveChild, open/setOpen, styling) is unchanged.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `navigation: NavItem[]` in Sidebar.tsx | MODULE_REGISTRY as single source of truth | Phase 29 | Sidebar, Home (Phase 33), and App.tsx sync automatically |
| 35+ explicit `<Route>` elements in App.tsx | Routes flatMapped from module manifests | Phase 29 | New module = add manifest, no App.tsx edit |
| No ESLint (only `tsc --noEmit`) | ESLint v9 + eslint-plugin-boundaries v5 | Phase 29 | Cross-module import violations become lint errors |
| `.eslintrc.js` style | `eslint.config.js` flat config | ESLint v9 (2024) | Legacy config deprecated in v9, removed in v10 |

**Deprecated/outdated:**

- `.eslintrc.js` / `.eslintrc.json`: Deprecated in ESLint v9; use `eslint.config.js` only
- eslint-plugin-boundaries v4.x: Required legacy config; v5 (Feb 2026) is the current version with flat config support

---

## Open Questions

1. **eslint-plugin-boundaries resolution of `@/` path aliases**
   - What we know: The plugin resolves file system paths relative to `process.cwd()`; `@/` is a Vite/TS build-time alias not visible to ESLint
   - What's unclear: Whether the plugin traces `@/modules/*` imports to `src/modules/*` on disk without additional resolver config
   - Recommendation: During Wave 1, add a trivial intentional cross-module import and verify ESLint flags it. If not, add `'boundaries/alias': { '@/': './src/' }` to settings. This is the primary low-confidence item.

2. **`RouteObject.path` cast — is `cfg.path as string` safe?**
   - What we know: `RouteObject.path` is `string | undefined`; we only add routes with defined paths in manifests
   - What's unclear: Whether a runtime check or TypeScript assertion is cleaner
   - Recommendation: Filter routes in App.tsx: `.filter(cfg => cfg.path !== undefined)`. TypeScript then narrows the type. Avoids the cast.

3. **Should scaffold manifests (knowledge-base, tasks) have empty `routeConfig: []` or be omitted until Phases 31-32?**
   - What we know: Scaffold modules with `status: 'coming-soon'` and no routes are filtered out in both Sidebar and App.tsx consumers
   - What's unclear: Whether having `MODULE_REGISTRY` reference a manifest file that has no routes is confusing or useful for Phase 33 Home page cards
   - Recommendation: Include scaffold manifests with `status: 'coming-soon'`; the Home page in Phase 33 will render all manifests including disabled ones as "coming soon" cards. Filter in Sidebar/App.tsx with `status !== 'coming-soon'` only.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | none detected — vitest uses vite.config.ts by default |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOD-01 | MODULE_REGISTRY is a non-empty typed array with all required manifest fields | unit | `npx vitest run src/modules/registry.test.ts` | Wave 0 |
| MOD-01 | Each manifest has id, label, route, icon, status fields | unit | `npx vitest run src/modules/registry.test.ts` | Wave 0 |
| MOD-02 | Module folder structure exists with manifest files | structural | `npx tsc --noEmit` (import resolution) | Wave 0 |
| MOD-03 | Sidebar renders nav from MODULE_REGISTRY (no hardcoded array) | unit | `npx vitest run src/components/layout/Sidebar.test.tsx` | Wave 0 |
| MOD-03 | `npm run lint` passes with boundary violations reported | integration | `npm run lint` | Wave 0 config |
| MOD-04 | Docs routes resolve correctly (DocRenderer reachable) | smoke | manual browser + `npx tsc --noEmit` | existing TS |
| MOD-04 | WF builder gallery route still works | smoke | manual browser check | existing |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npm run lint` (runs ESLint + tsc after package.json update)
- **Phase gate:** `npm run lint` exits 0 before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/modules/registry.test.ts` — validates MODULE_REGISTRY shape (MOD-01)
- [ ] `src/components/layout/Sidebar.test.tsx` — validates nav consumed from registry (MOD-03)
- [ ] `eslint.config.js` at project root — boundary rules config (MOD-03 lint criterion)
- [ ] Install: `npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser`
- [ ] Update `package.json` lint script: `"lint": "eslint src/ && tsc --noEmit"`

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `package.json`, `tsconfig.json`, `vite.config.ts` — complete understanding of current codebase patterns and gaps
- `.planning/REQUIREMENTS.md` — MOD-01 through MOD-04 requirement text
- `.planning/STATE.md` — locked decision "static typed constant in src/modules/registry.ts (not dynamic)"
- `.planning/ROADMAP.md` — Phase 29 success criteria

### Secondary (MEDIUM confidence)

- [eslint-plugin-boundaries GitHub](https://github.com/javierbrea/eslint-plugin-boundaries) — v5.4.0 confirmed (Feb 2026 release), flat config support verified
- [jsboundaries.dev quick-start](https://www.jsboundaries.dev/docs/quick-start/) — flat config setup steps and element-types rule `default/rules` syntax verified
- ESLint v9 flat config format — project has `"type": "module"` in package.json, `eslint.config.js` with ES module exports is correct

### Tertiary (LOW confidence — needs verification during implementation)

- eslint-plugin-boundaries `@/` alias resolution behavior — not directly tested; flagged as open question requiring Wave 1 validation
- `@typescript-eslint/parser` exact version compatibility with ESLint v9 + eslint-plugin-boundaries v5 — likely ^8.x based on TS-ESLint release timeline, needs verification at install time

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed or available; eslint-plugin-boundaries v5.4.0 current version verified
- Architecture: HIGH — patterns derived directly from reading existing Sidebar.tsx and App.tsx; ModuleManifest extends current NavItem type cleanly
- ESLint config syntax: MEDIUM — v5 flat config structure confirmed from official docs; `@/` alias resolution with boundaries plugin needs runtime verification
- Pitfalls: HIGH — pitfalls 1, 2, 4, 5, 6, 7 derived from direct code inspection; pitfall 3 from known ESLint behavior

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (eslint-plugin-boundaries v5 is recent; re-verify if > 30 days before execution)
