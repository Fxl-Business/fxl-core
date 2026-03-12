# Phase 29: Module Foundation & Registry - Research

**Researched:** 2026-03-12
**Domain:** TypeScript module registry pattern, ESLint boundary enforcement, React Router v6 data-driven routing
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOD-01 | Module registry com ModuleManifest tipado (id, label, route, icon, status) em src/modules/registry.ts | TypeScript `as const` + interface pattern; no library needed |
| MOD-02 | Folder structure por modulo: src/modules/[name]/ com pages/, components/, hooks/, types/ | Standard React feature-slice folder convention |
| MOD-03 | Sidebar e App.tsx consomem MODULE_REGISTRY para rotas e navegacao | Array.map() over registry — existing Sidebar NavItem type extends cleanly |
| MOD-04 | Wrapper manifests para docs e wireframe-builder (registrados no registry sem mover codigo) | Wrapper manifest object pointing to existing routes; zero file movement |
</phase_requirements>

---

## Summary

Phase 29 introduces typed module boundaries and a single `MODULE_REGISTRY` constant that becomes the authoritative source for sidebar navigation, App.tsx routes, and the Home page (Phase 33). The change is structural, not visual: no pages are moved, no new features are added. Existing `docs` and `wireframe-builder` areas get thin wrapper manifests so they participate in the registry without any code displacement.

The primary technical challenge is ESLint boundary enforcement. The project currently has no ESLint installed — only `tsc --noEmit` acts as the lint gate. Installing `eslint` + `eslint-plugin-boundaries` and wiring `npm run lint` to run both TypeScript checking and ESLint boundary checks is the highest-risk step. The plugin is at v5.4.0 (Feb 2026), supports ESLint v9 flat config (`eslint.config.js`), and uses glob patterns to define element types.

The second challenge is making Sidebar.tsx consume the registry without breaking its existing recursive `NavSection` rendering logic. The current `NavItem` type in Sidebar is already a local recursive tree — the registry needs only to provide the top-level module entries; sub-navigation within modules (e.g., Processo's nested child pages) stays as-is per module manifest or supplementary nav config.

**Primary recommendation:** Implement ModuleManifest as a `const` array with `as const satisfies` for full type inference. Install ESLint v9 + eslint-plugin-boundaries v5 with flat config. Keep the Sidebar's recursive NavSection renderer and adapt only the top-level modules to come from the registry.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript (existing) | 5.6.3 | ModuleManifest type + registry constant | Already strict mode, `satisfies` available since TS 4.9 |
| eslint | ^9.x | Lint runner for boundary rules | v9 required for flat config; project has no eslint yet |
| eslint-plugin-boundaries | ^5.4.0 | Cross-module import violation detection | Only plugin that enforces folder-level boundaries without monorepo tooling |
| react-router-dom (existing) | ^6.27.0 | Route generation from manifests | Data-driven routes via `routes` array |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @typescript-eslint/parser | ^8.x | Allow eslint to parse .tsx files | Required if boundary rules need to analyze TypeScript imports |
| lucide-react (existing) | ^0.460.0 | Icon field in ModuleManifest | Already installed; use `LucideIcon` type for the icon field |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| eslint-plugin-boundaries | eslint-plugin-import (no-restricted-imports) | `no-restricted-imports` is per-file manual config; boundaries is declarative and scales |
| eslint-plugin-boundaries | NX enforce-module-boundaries | NX requires full monorepo tooling; overkill for a single-repo app |
| `as const satisfies` registry | Dynamic registry from file system scan | Dynamic scan requires build step; static const is zero-overhead and fully typed |

**Installation:**
```bash
npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser
```

Note: `npm run lint` currently runs `tsc --noEmit` only (per package.json). After this phase, it must ALSO run `eslint .` — update the `lint` script in package.json.

---

## Architecture Patterns

### Recommended Project Structure

The registry introduces a `src/modules/` folder. Existing code in `src/pages/` and `src/components/` stays untouched. Phase 29 only creates the registry and thin wrapper manifests; actual module subfolders are populated in Phases 31-32.

```
src/
├── modules/
│   ├── registry.ts          # MODULE_REGISTRY + ModuleManifest type (MOD-01)
│   ├── docs/                # Wrapper manifest for existing docs area (MOD-04)
│   │   └── manifest.ts      # Points to existing /processo/*, /ferramentas/*, etc.
│   └── wireframe-builder/   # Wrapper manifest for existing WF builder (MOD-04)
│       └── manifest.ts      # Points to /ferramentas/wireframe-builder/galeria
├── components/layout/
│   └── Sidebar.tsx          # Updated to map MODULE_REGISTRY for top-level nav (MOD-03)
├── App.tsx                  # Updated to compose routes from manifests (MOD-03)
└── (everything else unchanged)
```

### Pattern 1: ModuleManifest Type + Registry Constant (MOD-01)

**What:** A typed interface describing a module, plus an `as const` array as the single source of truth.
**When to use:** Static module list known at compile time — no dynamic loading needed in v1.5.

```typescript
// src/modules/registry.ts
import type { LucideIcon } from 'lucide-react'

export type ModuleStatus = 'active' | 'beta' | 'coming-soon'

export interface ModuleManifest {
  id: string
  label: string
  route: string                // primary route (used in sidebar link + home card)
  icon: LucideIcon
  status: ModuleStatus
  navChildren?: ModuleNavItem[] // optional sub-navigation within module
}

export interface ModuleNavItem {
  label: string
  href: string
  children?: ModuleNavItem[]
}

// Registry — add new modules here only
export const MODULE_REGISTRY: ModuleManifest[] = [
  {
    id: 'docs',
    label: 'Processo',
    route: '/processo/index',
    icon: BookOpen,
    status: 'active',
    navChildren: [/* existing Processo sub-items */],
  },
  // ... other modules
]
```

Note: `as const satisfies ModuleManifest[]` can be used if tuple-level inference is desired, but a plain typed array is sufficient and simpler.

### Pattern 2: Wrapper Manifest for Existing Modules (MOD-04)

**What:** A manifest file that registers an existing code area in the registry without moving any files.
**When to use:** Docs and wireframe-builder exist in `src/pages/` — they need to participate in the registry from day one.

```typescript
// src/modules/docs/manifest.ts
import { BookOpen } from 'lucide-react'
import type { ModuleManifest } from '../registry'

export const docsManifest: ModuleManifest = {
  id: 'docs',
  label: 'Processo',
  route: '/processo/index',
  icon: BookOpen,
  status: 'active',
  navChildren: [
    { label: 'Visao Geral', href: '/processo/visao-geral' },
    // ... replaces the hardcoded Sidebar navItem for Processo
  ],
}
```

The wrapper manifest is simply imported into `registry.ts`. No page files are moved.

### Pattern 3: Sidebar Consuming Registry (MOD-03)

**What:** Replace the hardcoded `navigation` array in `Sidebar.tsx` with a map over `MODULE_REGISTRY`.
**When to use:** This is the primary consumer change in Phase 29.

The existing `NavItem` recursive type in Sidebar stays. Adapt the top-level section to source from the registry:

```typescript
// Sidebar.tsx — replace hardcoded navigation const
import { MODULE_REGISTRY } from '@/modules/registry'

// Convert ModuleManifest → NavItem (existing type)
function manifestToNavItem(m: ModuleManifest): NavItem {
  return {
    label: m.label,
    href: m.route,
    children: m.navChildren, // ModuleNavItem is structurally compatible with NavItem
  }
}

const navigationFromRegistry: NavItem[] = MODULE_REGISTRY.map(manifestToNavItem)
```

The existing `NavSection` recursive renderer is unchanged — it continues to handle nested children.

### Pattern 4: App.tsx Route Composition (MOD-03)

**What:** App.tsx currently has ~95 lines with inline route definitions. After Phase 29, route definitions come from module manifests.
**Constraint:** Success criterion says "under 60 lines of route definitions" — not 60 total lines in App.tsx, but the route block itself.

Each module manifest can expose a `routes` array or each module folder can export a `<Routes />` component. The simplest approach that reaches the 60-line goal without over-engineering:

```typescript
// Each manifest exports its route config
export interface ModuleManifest {
  // ... existing fields
  routeConfig?: RouteConfig[]  // optional — complex modules define their routes here
}

// App.tsx reduces to:
MODULE_REGISTRY.flatMap(m => m.routeConfig ?? []).map(cfg => (
  <Route key={cfg.path} path={cfg.path} element={cfg.element} />
))
```

For Phase 29, existing routes stay as-is but are refactored to be defined inside each manifest or a routes file per module.

### Pattern 5: ESLint Boundary Configuration (MOD-02, MOD-03)

**What:** `eslint.config.js` using eslint-plugin-boundaries v5 flat config to forbid cross-module imports.
**When to use:** After defining the `src/modules/` folder structure.

```javascript
// eslint.config.js (project root)
import boundaries from 'eslint-plugin-boundaries'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'modules',    pattern: 'src/modules/*' },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'pages',      pattern: 'src/pages/*' },
        { type: 'lib',        pattern: 'src/lib/*' },
      ],
    },
    rules: {
      // Error when module A imports directly from module B's internals
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            // Modules may NOT import from each other's internal pages/components
            {
              from: 'modules',
              disallow: ['modules'],
              // Exception: registry.ts is allowed everywhere
            },
          ],
        },
      ],
    },
  },
]
```

Note: The `default: 'allow'` approach is safer for an existing codebase (recommended config). Switching to `default: 'disallow'` with explicit allow lists would be the strict config for new projects.

### Pattern 6: package.json lint script update

```json
{
  "scripts": {
    "lint": "tsc --noEmit && eslint src --ext .ts,.tsx"
  }
}
```

For ESLint v9 flat config, the `--ext` flag is deprecated — just `eslint src/` works.

### Anti-Patterns to Avoid

- **Moving existing page files into modules/**: MOD-04 explicitly says wrapper manifests, not code movement. Moving code risks breaking routes, breaking imports, and TypeScript path alias resolution.
- **Dynamic registry from file system**: `import.meta.glob` for auto-discovery is powerful but adds complexity; the project already flags `import.meta.glob` as needing verification (STATE.md blocker note).
- **Removing NavSection recursion**: The existing recursive Sidebar renderer is correct — don't flatten it. Only the top-level data source changes.
- **Using `any` for LucideIcon type**: Use `import type { LucideIcon } from 'lucide-react'` — the actual icon components conform to `LucideIcon` (which is `React.FC<LucideProps>`).
- **Making MODULE_REGISTRY a Map**: Using a plain array + `.find()` is simpler and sufficient. Maps add complexity for a registry with ~6 entries.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Import boundary enforcement | Custom ESLint rule | eslint-plugin-boundaries v5 | Custom rules require deep ESLint API knowledge; the plugin handles glob pattern matching correctly |
| Icon type in manifest | `React.ComponentType<any>` | `LucideIcon` from lucide-react | Already installed; correct type for all lucide icons |
| Route type-safety | Custom RouteConfig generic | `react-router-dom` `RouteObject` type | Already exported; maps directly to `<Route>` props |

**Key insight:** The registry is just a typed constant array. Do not reach for a library or abstraction; TypeScript's `satisfies` operator provides compile-time validation with zero runtime cost.

---

## Common Pitfalls

### Pitfall 1: ESLint Not Installed — Lint Script Silently Passes

**What goes wrong:** `npm run lint` currently runs only `tsc --noEmit`. If ESLint is not installed and the lint script is not updated, the boundary rules never run.
**Why it happens:** ESLint is not in the project's devDependencies at all (confirmed by reading package.json).
**How to avoid:** Install ESLint + eslint-plugin-boundaries before writing the config. Verify `npm run lint` actually invokes both commands.
**Warning signs:** `npm run lint` exits 0 without any ESLint output line.

### Pitfall 2: ESLint Flat Config vs Legacy Config

**What goes wrong:** Creating `.eslintrc.js` instead of `eslint.config.js` with ESLint v9. ESLint v9 defaults to flat config — legacy `eslintrc` files are ignored unless `ESLINT_USE_FLAT_CONFIG=false` is set.
**Why it happens:** Most online examples are pre-v9 legacy format.
**How to avoid:** Use `eslint.config.js` (flat config) exclusively. The project uses Vite + ES modules, so flat config is the natural fit.
**Warning signs:** ESLint runs without errors on clearly-bad imports.

### Pitfall 3: LucideIcon Type Import Breaking TypeScript

**What goes wrong:** Importing `LucideIcon` as a value instead of a type causes `noEmit` warnings; using `React.FC<LucideProps>` directly requires importing internal lucide types.
**Why it happens:** Lucide exports `LucideIcon` as a type alias, not a class.
**How to avoid:** Use `import type { LucideIcon } from 'lucide-react'` in the manifest type definition.
**Warning signs:** `tsc --noEmit` reports "Re-exporting a type when the '--isolatedModules' flag is provided".

### Pitfall 4: Sidebar NavItem Structural Mismatch

**What goes wrong:** `ModuleNavItem` and the existing `NavItem` type in Sidebar.tsx share the same shape (`label`, `href?`, `children?`) but are separate types. TypeScript won't error, but if one is changed without updating the other, runtime behavior diverges.
**Why it happens:** Two separate type declarations for the same logical concept.
**How to avoid:** Either re-export `NavItem` from a shared location and use it in ModuleManifest, or make `ModuleNavItem` extend the shared type. Preferred: define `NavItem` once in `src/modules/registry.ts` and import it into Sidebar.tsx.
**Warning signs:** Sidebar renders empty sub-sections for modules that have `navChildren`.

### Pitfall 5: Route Count Blowing the 60-Line Budget

**What goes wrong:** Refactoring App.tsx to use the registry but keeping all routes defined inline — App.tsx stays at 95+ lines.
**Why it happens:** Moving route definitions into manifests is easy to defer.
**How to avoid:** Each module wrapper manifest (docs, wireframe-builder, clients) must include a `routeConfig` field that App.tsx maps over. Shared/public routes (login, signup, perfil, wireframe-view) stay in App.tsx directly as they are not module-driven.
**Warning signs:** App.tsx stays above 70 lines after the refactor.

### Pitfall 6: eslint-plugin-boundaries Pattern Resolution with Vite Aliases

**What goes wrong:** The plugin uses file system glob patterns, not TypeScript path aliases. `@/modules/*` in boundaries settings won't work — must use `src/modules/*`.
**Why it happens:** The plugin resolves patterns relative to `process.cwd()` or a configured `baseDir`.
**How to avoid:** Use physical path patterns (`src/modules/*`, not `@/modules/*`) in `boundaries/elements`. The plugin also needs the `baseDir` setting if patterns don't resolve from the project root.
**Warning signs:** Boundaries rule reports no violations for imports that should be blocked.

---

## Code Examples

### ModuleManifest Type (complete)

```typescript
// src/modules/registry.ts
// Source: Project pattern (no external library)
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
```

### Wrapper Manifest (docs example)

```typescript
// src/modules/docs/manifest.ts
import { BookOpen } from 'lucide-react'
import type { ModuleManifest } from '../registry'
import DocRenderer from '@/pages/DocRenderer'

export const docsManifest: ModuleManifest = {
  id: 'docs',
  label: 'Processo',
  route: '/processo/index',
  icon: BookOpen,
  status: 'active',
  navChildren: [
    // Copy of the Processo section from current Sidebar.tsx navigation const
  ],
  routeConfig: [
    { path: '/processo/*', element: <DocRenderer /> },
    { path: '/referencias/*', element: <DocRenderer /> },
    { path: '/padroes/*', element: <DocRenderer /> },
    { path: '/ferramentas/*', element: <DocRenderer /> },
  ],
}
```

### App.tsx Route Composition

```typescript
// App.tsx (simplified)
import { MODULE_REGISTRY } from '@/modules/registry'
// ...

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
        {/* Public routes: login, signup, perfil, wireframe-view, shared-wireframe */}
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
```

### eslint.config.js (flat config, boundaries)

```javascript
// eslint.config.js (project root)
// Source: eslint-plugin-boundaries v5 docs (jsboundaries.dev)
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
      'boundaries/elements': [
        { type: 'module',    pattern: 'src/modules/*' },
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
            // Prevent module-to-module direct imports (must go through registry)
            { from: 'module', disallow: [['module', { type: '!${from.type}' }]] },
          ],
        },
      ],
    },
  },
]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `navigation` array in Sidebar.tsx | MODULE_REGISTRY as single source of truth | Phase 29 | Sidebar, Home, and App.tsx all stay in sync automatically |
| Routes defined inline in App.tsx | Routes defined in module manifests, composed in App.tsx | Phase 29 | Adding a new module is a 1-file change |
| No ESLint (only tsc --noEmit) | ESLint v9 + eslint-plugin-boundaries | Phase 29 | Cross-module import violations become compile-time errors |
| ESLint legacy config (.eslintrc) | Flat config (eslint.config.js) | ESLint v9 (2024) | Legacy config deprecated in v9, removed in v10 |

**Deprecated/outdated:**
- `.eslintrc.js` / `.eslintrc.json`: Deprecated in ESLint v9, use `eslint.config.js` instead
- `eslint-plugin-boundaries` v4.x: Required legacy config format; v5 supports flat config natively

---

## Open Questions

1. **eslint-plugin-boundaries pattern resolution with tsconfig path aliases**
   - What we know: The plugin uses file system paths, not TypeScript aliases
   - What's unclear: Whether `baseDir` config option is needed when running from project root in a Vite project
   - Recommendation: Test with a simple `src/modules/test` import violation during implementation; if not detected, add `'boundaries/ignore': ['@/*']` to settings

2. **RouteObject type with JSX elements**
   - What we know: `RouteObject` from react-router-dom accepts `element?: React.ReactNode`
   - What's unclear: Whether defining JSX in a manifest file (not .tsx, but .ts) requires tsconfig changes
   - Recommendation: Use `.tsx` extension for all manifest files that include JSX elements

3. **NavItem type consolidation — which file owns the type?**
   - What we know: Sidebar.tsx defines `NavItem` locally; ModuleManifest needs a compatible type
   - What's unclear: Whether moving `NavItem` to `registry.ts` causes circular imports (Sidebar imports registry, registry defines NavItem)
   - Recommendation: Define `NavItem` in `registry.ts` and update Sidebar.tsx to import it — no circular dependency since registry.ts has no imports from Sidebar

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | none detected (vitest uses vite.config.ts by default or inline config) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOD-01 | MODULE_REGISTRY is a non-empty array of ModuleManifest | unit | `npx vitest run src/modules/registry.test.ts` | Wave 0 |
| MOD-01 | Each manifest has id, label, route, icon, status fields | unit | `npx vitest run src/modules/registry.test.ts` | Wave 0 |
| MOD-02 | Module folder structure exists | structural | `tsc --noEmit` (file existence + type check) | Wave 0 |
| MOD-03 | Sidebar renders nav items from MODULE_REGISTRY | unit | `npx vitest run src/components/layout/Sidebar.test.tsx` | Wave 0 |
| MOD-03 | App.tsx route count within 60 lines | manual | visual inspection + line count | N/A |
| MOD-04 | Docs routes still work (DocRenderer reachable) | smoke | manual browser check | N/A |
| MOD-04 | WF builder gallery route still works | smoke | manual browser check | N/A |
| ESLint | npm run lint passes with boundaries rules | integration | `npm run lint` | Wave 0 config |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit && npm run lint`
- **Phase gate:** `npx tsc --noEmit && npm run lint` green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/modules/registry.test.ts` — covers MOD-01 (registry shape validation)
- [ ] `src/components/layout/Sidebar.test.tsx` — covers MOD-03 (nav items from registry)
- [ ] `eslint.config.js` — boundary rules config (created in Wave 0 of Phase 29)
- [ ] ESLint install: `npm install --save-dev eslint eslint-plugin-boundaries @typescript-eslint/parser`

---

## Sources

### Primary (HIGH confidence)

- Direct file reads: `src/App.tsx`, `src/components/layout/Sidebar.tsx`, `src/pages/Home.tsx`, `package.json`, `tsconfig.json`, `vite.config.ts` — full codebase understanding
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md` — requirements and constraints

### Secondary (MEDIUM confidence)

- [eslint-plugin-boundaries GitHub](https://github.com/javierbrea/eslint-plugin-boundaries) — v5.4.0, flat config support confirmed, element type + rule syntax verified
- [jsboundaries.dev quick start](https://www.jsboundaries.dev/docs/quick-start/) — flat config setup steps verified
- ESLint v9 flat config format — confirmed via official ESLint docs pattern

### Tertiary (LOW confidence — needs verification during implementation)

- [eslint-plugin-boundaries ESLint 9 support issue #329](https://github.com/javierbrea/eslint-plugin-boundaries/issues/329) — ESLint 9 compatibility noted but peer dependency matrix not fully verified via package.json
- eslint-plugin-boundaries `baseDir` behavior with Vite alias paths — not directly tested; flagged as open question

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed or confirmed available at stated versions
- Architecture: HIGH — based on direct reading of existing Sidebar.tsx and App.tsx; patterns are straightforward extensions
- ESLint config syntax: MEDIUM — v5 flat config structure confirmed from docs; exact pattern resolution with Vite aliases needs implementation verification
- Pitfalls: HIGH — derived from direct code reading (NavItem type, route count, missing ESLint)

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (eslint-plugin-boundaries releases frequently; re-verify if > 30 days)
