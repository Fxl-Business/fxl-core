# Pitfalls Research

**Domain:** Adding modular extension architecture to an existing React 18 SPA (FXL Core v2.0)
**Researched:** 2026-03-13
**Confidence:** HIGH (based on direct codebase inspection of App.tsx, registry.ts, Sidebar.tsx, all 5 module manifests, eslint.config.js, vercel.json + verified patterns from react-router-dom v6 official docs and community post-mortems)

---

## Critical Pitfalls

### Pitfall 1: Route / to /docs Migration Breaks Vercel Direct-Link Visits

**What goes wrong:**
The current `vercel.json` rewrites all traffic to `index.html` via `"source": "/(.*)"`. When the route `/` is redirected to `/docs` client-side (via `<Navigate to="/docs" replace />`), users who have bookmarked `/` will land correctly. But any server-level tool (Slack unfurl, Notion embed, health-check bots) that hits `/` gets `index.html` which delivers a redirect, not a page — the Open Graph metadata, canonical URL, and any crawlers that don't execute JavaScript receive no useful content. More critically, if the Home component is moved to `/` and the docs moved to `/docs`, there is an ordering risk: if the `<Route path="/" ...>` entry renders `<Navigate>` instead of a component, any route that previously relied on `/` as the catch-all (e.g., stale bookmarks, old Cmd+K results pointing to the docs root) will silently redirect to the new location with no 301 equivalent at the server level.

**Why it happens:**
Developers treat `<Navigate replace>` as equivalent to an HTTP 301. It is not — it is a client-side JS push that only fires after React mounts. If the user refreshes at `/docs` and the Vercel rewrite config has not been updated to ensure `/docs/*` rewrites correctly (currently it catches everything via `/(.*)`), there is no breakage, but any hardcoded reference to `/` as the docs entry point (Cmd+K search index, Sidebar hard-coded Home link, shared links users may have sent) will silently redirect instead of rendering the expected content.

**How to avoid:**
1. Before changing any route, audit all places that link to `/` or assume `/` is the docs entry point: `Sidebar.tsx` Home link (currently hardcoded `to="/"`), `SearchCommand` result hrefs, any `href="/"` in client docs markdown files.
2. Implement the routing change as a two-step: first add `<Route path="/docs" element={<Navigate to="/processo/index" replace />} />` so the new path works before removing the old binding; then move the docs module's `route` field to `/processo/index` in `docsManifest`.
3. Add a `<Navigate from="/" to="/docs" replace />` only as a temporary bridge if needed — remove it once all links are updated. Never leave it permanently, because it means `Home` at `/` is unreachable.
4. Test by opening an incognito tab and typing `yourdomain.com/docs` directly — Vercel will serve `index.html`, React Router will match `/docs` and render correctly since the rewrite covers it.

**Warning signs:**
- Sidebar "Home" link still points to `/` after the docs module route has moved to `/docs`
- Cmd+K search results for doc pages return hrefs starting with `/` instead of `/docs/`
- `docsManifest.route` still reads `/processo/index` but sidebar navigation shows "Home" as active when on the docs page
- The `moduleRoutes` derivation in `App.tsx` produces a route for `/processo/*` but not for `/docs/*` — docs are unreachable from direct URL

**Phase to address:**
Phase: Routing Refactor (the dedicated phase for moving `/` to Home 2.0 and docs to `/docs`). This phase must begin with a link audit, not code changes.

---

### Pitfall 2: ESLint Module Boundary Rule Will Block Cross-Module Extension Imports

**What goes wrong:**
The existing `eslint.config.js` enforces `{ from: 'module', disallow: ['module'] }` — modules cannot import each other. The new extension architecture requires Module A to declare `requires: ['knowledge-base']` and inject components into Module B's slots. If that injection is implemented as a direct import (`import { SomeComponent } from '@/modules/knowledge-base/...'`), ESLint will flag it as an error at the boundary. The natural fix developers reach for is adding an ESLint disable comment or weakening the boundary rule — both destroy the isolation that v1.5 carefully established.

**Why it happens:**
The extension system is designed exactly to enable cross-module data flow. The ESLint boundary rule was designed to prevent exactly that. They are in direct conflict if the extension wires up at the import level rather than through a runtime registry.

**How to avoid:**
All cross-module extensions must be mediated through the `MODULE_REGISTRY` at runtime, not via static imports. The pattern is:
1. Module A registers an extension object in its own manifest: `extensions: [{ slotId: 'kb-sidebar-widget', component: MyWidget }]`
2. `MODULE_REGISTRY` (or a new `ExtensionRegistry`) aggregates all extensions at the registry level — this is the one place allowed to import across modules
3. `<ModuleSlot id="kb-sidebar-widget" />` renders whatever is registered for that slot ID — it never imports from the providing module directly
4. The ESLint rule remains unchanged: modules still cannot import each other. Only `registry.ts` (type: `lib`) can aggregate from all modules.

If the `boundaries/element-types` rule needs to be updated, the only acceptable change is making `registry.ts` an exception: `{ from: 'lib', allow: ['module'] }` scoped specifically to `src/modules/registry.ts`.

**Warning signs:**
- An `// eslint-disable` comment appears in any file inside `src/modules/[name]/`
- A module manifest file imports from another module's directory: `import X from '@/modules/other-module/...'`
- The ESLint boundary rule is weakened from `'error'` to `'warn'` as a "temporary" measure
- `eslint.config.js` has a new `files` override that exempts a specific module from the boundary check

**Phase to address:**
Phase: Module Registry Enhancement (where `ModuleDefinition` type and extension declaration are introduced). Lock down the approved cross-module communication pattern before any slot implementations start.

---

### Pitfall 3: Circular Dependency Through Extension Declarations in Manifests

**What goes wrong:**
When Module A's manifest declares `requires: ['tasks']` and imports the tasks manifest to validate the dependency ID at compile time, and the tasks manifest imports from `MODULE_REGISTRY` to derive nav items — a circular import chain can form: `registry.ts` → `tasks/manifest.ts` → `registry.ts`. This does not always throw an error. JavaScript module loading handles many circular imports silently by substituting `undefined` for the unresolved export at the point of the cycle. The result is that `MODULE_REGISTRY` is `undefined` in the tasks manifest during initialization, causing `navigationFromRegistry` in `Sidebar.tsx` to throw or produce an empty sidebar.

**Why it happens:**
Manifest files currently import `ModuleManifest` type from `registry.ts` (type-only import, safe). The risk appears when manifests start importing _values_ from `registry.ts` — for example, to look up another module's ID string for type-safe `requires` declarations, or when a manifest computes its `navChildren` based on other registered modules.

The existing codebase is currently safe: manifests only import the `ModuleManifest` type (erased at compile time). The danger is introduced the moment any manifest imports a runtime value from `registry.ts`.

**How to avoid:**
Module IDs used in `requires: []` declarations must be string literals defined in a separate constants file, not looked up from `MODULE_REGISTRY`. Create `src/modules/module-ids.ts` with `export const MODULE_IDS = { docs: 'docs', tasks: 'tasks', ... } as const`. Manifests import from `module-ids.ts` (which has no imports) — never from `registry.ts`.

`registry.ts` imports from manifests (one-directional). Manifests import from `module-ids.ts` (one-directional). No cycle.

**Warning signs:**
- Any manifest file has `import { ... } from '@/modules/registry'` importing a non-type value
- `MODULE_REGISTRY` is `undefined` at runtime despite being a valid `const` — symptom of circular import resolution
- Sidebar renders with zero items despite the registry being non-empty in the source
- Vite build prints a "circular dependency" warning in the console

**Phase to address:**
Phase: Module Registry Enhancement. The `module-ids.ts` constants file should be created at the start of this phase, before any `requires[]` declarations are written.

---

### Pitfall 4: Type Safety Lost When Injecting Components Through Slots

**What goes wrong:**
`<ModuleSlot id="some-slot" />` needs to render a component registered by another module. The registered component has its own prop types. At the slot render site, those prop types are unknown — the slot system must accept either `React.ComponentType<unknown>` or `React.ComponentType<Record<string, unknown>>`, both of which allow passing any props and accepting any props, defeating TypeScript's strict mode. Teams commonly resolve this by using `any` in the slot renderer, which propagates through the system and silently breaks type checking for cross-module components.

**Why it happens:**
TypeScript cannot express "a component whose props are determined at registration time and must be satisfied at render time" without generic parameters that propagate through the registry. The straightforward implementation reaches for `ComponentType<any>` or `React.FC<any>` as the registry value type.

**How to avoid:**
Define a constrained `SlotComponentProps` interface that all slot-registered components must satisfy:
```typescript
// All components registered into slots must accept at minimum these props
export interface SlotComponentProps {
  context?: Record<string, string | number | boolean>
  className?: string
}
```
Register components as `React.ComponentType<SlotComponentProps>` (not `any`). Slot-rendering code passes only the props defined in `SlotComponentProps`. If a slot component needs module-specific data, it fetches it internally using its own hooks — the slot only provides the context surface (e.g., `clientSlug`, `moduleId`).

This is the correct trade-off: you lose per-component prop inference at slot boundaries, but you maintain `no any` compliance and a documented contract for what a slot component receives.

**Warning signs:**
- `ComponentType<any>` or `React.FC<any>` appears in `registry.ts` or any slot-related type
- `npx tsc --noEmit` passes but a slot-registered component silently receives zero props at runtime
- A slot component file has `props: any` in its function signature
- ESLint `@typescript-eslint/no-explicit-any` is disabled in a module's component file

**Phase to address:**
Phase: Slot Architecture. The `SlotComponentProps` interface and the `ModuleSlot` component implementation must be written before any module registers a component into a slot.

---

### Pitfall 5: Over-Engineering the Extension System for a 5-Module App

**What goes wrong:**
Building a full extension system with `requires[]` dependency resolution, version checks, activation order, slot lifecycle hooks, and a runtime dependency graph is appropriate for a public plugin marketplace. For 5 in-house modules where all code is in the same repo and all modules are always active, this machinery adds complexity without benefit. The maintenance cost is real: every new module must understand the extension contract, circular dependency analysis becomes a required step, and the admin panel must accurately reflect activation state when there is no meaningful activation to control.

**Why it happens:**
The v2.0 goal is described as a "modular framework shell" — a description that invites patterns from extension-heavy frameworks (VS Code, Backstage, Webpack). Those frameworks solve the problem of untrusted third-party plugins loading at runtime. FXL Core does not have that problem.

**How to avoid:**
Implement the minimum viable extension system for the actual use case:
- `requires[]`: static string array on `ModuleDefinition` — declares intent, no runtime resolution needed
- Slots: a simple registry (`Map<slotId, ComponentType<SlotComponentProps>[]>`) initialized once at app boot from the static `MODULE_REGISTRY` — no lazy loading, no activation callbacks
- Admin panel: displays `MODULE_REGISTRY` as a read-only list with status badges — no enable/disable toggles that change application behavior (since all modules are always compiled in)
- Contracts: enforced by TypeScript type checks at build time, not runtime validation

Add runtime complexity only if the use case actually appears: if a module needs to be toggled by a feature flag, introduce that mechanism for that specific module only.

**Warning signs:**
- The extension system requires more than 3 new files in `src/` to implement
- Any slot/extension logic contains `async` resolution, `Promise`, or conditional `await`
- A `ModuleActivationService` or `DependencyResolver` class is being designed
- The implementation requires reading from Supabase to determine which modules are "active"

**Phase to address:**
Phase: Module Registry Enhancement. The type definitions for `ModuleDefinition` and `ModuleExtension` should be reviewed for complexity before any implementation starts. Use the rule: if the type cannot be explained in 5 lines, it is over-engineered for this codebase.

---

### Pitfall 6: Home 2.0 Component Hardcodes Module State That Belongs in the Registry

**What goes wrong:**
The current `Home.tsx` already has two hardcoded structures: `MODULE_DESCRIPTIONS` (a `Record<string, string>` mapping module IDs to descriptions not present in `ModuleManifest`) and `clients` (a hardcoded array of client data that belongs in the clients module). The v2.0 Home 2.0 will expand this pattern — adding more hardcoded statistics, quick-action lists, or module-specific widgets directly in `Home.tsx` — because it is simpler than defining a formal contract.

The result is a `Home.tsx` that grows into a 500+ line file with knowledge of every module's internals, contradicting the modular architecture it is supposed to demonstrate.

**Why it happens:**
Cross-cutting concerns (like "what are this module's key metrics?") do not have a clean home until the registry provides a formal contract for it. The easiest path is to add it directly to the file that needs it.

**How to avoid:**
Extend `ModuleManifest` (or the new `ModuleDefinition` type) with optional metadata fields that modules can populate:
```typescript
interface ModuleDefinition {
  // ... existing fields
  description?: string          // moves MODULE_DESCRIPTIONS into manifests
  homeWidget?: React.ComponentType<SlotComponentProps>  // module-contributed home widget
  quickActions?: QuickAction[]  // module-contributed action buttons for home
}
```
`Home.tsx` reads only from `MODULE_REGISTRY` — it knows nothing about individual modules. Each module's manifest declares what it contributes to the home page.

If a module (like `clients`) needs to show dynamic data (active client count), it contributes a `homeWidget` component that fetches its own data — `Home.tsx` renders the slot but does not own the data fetching.

**Warning signs:**
- `Home.tsx` imports from any specific module directory: `import { ... } from '@/modules/clients/...'`
- `Home.tsx` grows beyond 150 lines of JSX
- A new `const MODULE_X_DATA: Record<string, Y>` constant appears at the top of `Home.tsx`
- The ESLint boundary rule fires during a Home 2.0 PR because `Home.tsx` is a `page` type importing from `module` type

**Phase to address:**
Phase: Home 2.0. The `description` and `homeWidget` fields in `ModuleManifest` must be defined before the Home component is rebuilt, not after.

---

### Pitfall 7: Admin Panel Routing Collides With Module Registry Derived Routes

**What goes wrong:**
`App.tsx` currently derives routes from `MODULE_REGISTRY` via `moduleRoutes = MODULE_REGISTRY.flatMap(m => m.routeConfig ?? [])`. The admin panel at `/admin/modules` could be registered as a route in a future `adminManifest`, or hardcoded directly in `App.tsx` as a static route. If it is added to the registry, it appears in the sidebar navigation (undesirable for an admin tool). If it is hardcoded in `App.tsx`, it breaks the invariant that all routes come from the registry, creating two competing sources of truth for routing.

Additionally, `/admin/*` routes must not be accessible to unauthenticated users — they need the `<ProtectedRoute>` wrapper. If the admin routes are derived from the registry and the registry does not carry auth metadata, all module-derived routes have the same auth level (which is currently `<ProtectedRoute>` for all).

**Why it happens:**
The registry-driven routing pattern in `App.tsx` is clean for the 5 existing modules. The admin panel is a new kind of route: it requires auth, should not appear in sidebar nav, and is "meta" to the module system itself. There is no precedent in the current codebase for a route that is protected but hidden.

**How to avoid:**
Add an `adminOnly?: boolean` flag to `ModuleManifest` (or create a separate `ADMIN_REGISTRY` constant for admin routes). In `Sidebar.tsx`, filter out `adminOnly` manifests from navigation. In `App.tsx`, render admin routes inside `<ProtectedRoute>` like all other module routes (they already are), but ensure the `AdminModulesPanel` page is gated to operator accounts only if non-operator access ever becomes a concern.

For v2.0 specifically: hardcode the `/admin/modules` route as a static `<Route>` in `App.tsx` under a comment `{/* Admin routes — not registry-derived */}`. Do not add it to MODULE_REGISTRY. If more admin routes appear in future milestones, introduce the `ADMIN_REGISTRY` pattern then.

**Warning signs:**
- The admin module panel appears in the Sidebar navigation under "Modulos" or any section
- `App.tsx` contains a `<Route path="/admin/*" ...>` that is NOT wrapped in `<ProtectedRoute>`
- A new `adminManifest` is created and added to `MODULE_REGISTRY` — the admin panel is not a module, it is a system tool

**Phase to address:**
Phase: Admin Panel. The routing strategy for `/admin/modules` must be decided before the component is built.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `any` for slot component props | Avoids designing `SlotComponentProps` interface | Every slot-registered component loses type checking; `tsc --noEmit` cannot catch prop mismatches at slot boundaries | Never — use `SlotComponentProps` with explicit fields |
| Leaving `MODULE_DESCRIPTIONS` in `Home.tsx` instead of moving it to manifests | Home 2.0 ships faster | Home.tsx has module-specific knowledge that must be updated every time a manifest changes, in a different file | Acceptable only if `description` field is added to manifests within the same milestone |
| Adding the `/admin/modules` route to `MODULE_REGISTRY` | Single source for all routes | Admin panel appears in sidebar; no precedent for "hidden module" pattern creates confusion | Never — hardcode admin routes as static `<Route>` entries in `App.tsx` |
| Weakening the ESLint boundary rule from `error` to `warn` | Stops CI failures from blocking the PR | Module isolation is advisory, not enforced; developers ignore warnings; cross-module imports accumulate | Never — if a legitimate cross-module communication need exists, solve it via the registry |
| Implementing `requires[]` as runtime resolution (dynamically loading module code on demand) | Theoretically enables tree-shaking inactive modules | All 5 modules are always compiled in and always active; lazy-loading them adds Suspense complexity and ChunkLoadError risk with zero bundle-size benefit | Never for this codebase — `requires[]` is metadata only |
| Building the Home 2.0 as a full-page component with Supabase fetches for all module data | Simpler than the slot system | Home.tsx becomes the god-component for all module state; every new module adds fetches to Home | Acceptable for initial Home 2.0 if homeWidget slots are added in the next milestone |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `react-router-dom v6` + route migration | Using `<Navigate>` without `replace` — adds a history entry so the browser back button returns to `/` and immediately redirects again (redirect loop) | Always use `<Navigate to="/docs" replace />` when moving a canonical route |
| `react-router-dom v6` + `moduleRoutes` flatMap | Adding a `/admin/modules` route to a manifest's `routeConfig` — it gets added to the sidebar navigation automatically via `navigationFromRegistry` | Admin routes must NOT be in `MODULE_REGISTRY`; hardcode them as static `<Route>` entries |
| ESLint `boundaries` plugin + extension imports | Module A importing Module B's component directly to register it as a slot extension | Slot-registered components must be in the _providing_ module's own manifest; the registry aggregates them — never direct cross-module imports |
| Vercel SPA rewrite + new `/docs` base path | The existing `vercel.json` `/(.*) → /index.html` rewrite already handles `/docs/*` correctly — no change needed | Verify by direct URL access: `yourdomain.com/docs/processo/index` should load React then route to docs |
| `Sidebar.tsx` hardcoded Home link | The `<NavLink to="/">` in Sidebar will still be "active" when on any route if `end` prop is missing | Add `end` prop to the Home NavLink: `<NavLink to="/" end ...>` — this is already present in current code; ensure it remains after the Home 2.0 migration |
| `MODULE_REGISTRY` static evaluation + circular manifest imports | A manifest that imports a value from `registry.ts` creates a cycle; Vite resolves it but `MODULE_REGISTRY` may be `undefined` at the import point | Manifests import only types from `registry.ts` (erased at build time); runtime values (module IDs for `requires[]`) come from a separate constants file |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `ModuleSlot` re-resolving registered components on every render | Slot renders cause micro-stutters; React DevTools shows excessive re-renders in slot tree | Build the slot registry as a module-level `Map` initialized once at app boot — no `useState`, no `useEffect`, no dynamic `import()` inside slot rendering | Visible immediately if slot registry is rebuilt on every render cycle |
| Lazy-loading slot-registered components with `React.lazy` | Components registered into slots have a loading state on first render; ChunkLoadError if network drops mid-load | For internal module slots (always-available modules), register the component directly — no `React.lazy` needed since the code is always bundled | Visible on first slot render in production with a slow network |
| Home 2.0 firing parallel Supabase queries for every active module's activity data | Home page loads slowly; multiple waterfall fetches visible in network tab | Use `Promise.all` for parallel fetches (already done in current Home.tsx); if home widgets fetch independently, each should have its own Suspense boundary | With 5 modules each fetching 10 rows, load time doubles from current baseline |
| Admin panel re-fetching full `MODULE_REGISTRY` on every visit | Unnecessary re-computation since registry is static | Admin panel reads `MODULE_REGISTRY` directly as a constant — no async fetching, no state | Not a scaling issue since registry is static; main risk is incorrect implementation using `useState` + `useEffect` for static data |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering slot-registered component output without React's XSS protection | A malicious module (impossible in this closed codebase but poor pattern) injects `dangerouslySetInnerHTML` | Slot components render as normal React elements — React's escaping applies automatically. Never use `dangerouslySetInnerHTML` in slot-registered components |
| Admin panel at `/admin/modules` accessible without auth | Any unauthenticated visitor can view module configuration and status | Admin routes must be inside `<ProtectedRoute>` — this is already the case for all routes in the Layout wrapper; verify explicitly for admin routes if they are added outside the main protected route tree |
| Extension `context` prop passing sensitive data to slot components | A slot provides `{ userId, orgSecret }` and the component inadvertently logs it | Define `SlotComponentProps.context` as `Record<string, string | number | boolean>` — no object nesting, no callback functions, no sensitive tokens |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Sidebar active state broken after `/` moves to Home 2.0 | Operator sees no active item in sidebar when on the home page, or the wrong item is highlighted | The Home NavLink in Sidebar uses `end` prop — verify this after routing migration; the docs module's sidebar section should not be active when on `/` |
| Admin panel in sidebar navigation | Operators are confused by an "Admin" item in the main nav alongside Processo, Clientes, etc. | Admin panel is accessed via a URL or a link from the Home 2.0 control center — not a primary sidebar nav item |
| Home 2.0 duplicates module information already visible in sidebar | Home feels redundant — operators skip it and go directly to sidebar links | Home 2.0 must show _actionable_ information not available in the sidebar: recent activity, quick actions, module health status — not just a list of links to modules |
| Module slot content has different visual style from host page | Injected widgets feel like foreign elements — different border radius, font size, spacing | `SlotComponentProps` must include `className?: string`; slot components use the app's existing Tailwind utility classes and design tokens, not their own isolated styles |

---

## "Looks Done But Isn't" Checklist

For the v2.0 routing refactor and extension architecture, verify all of the following before considering each phase complete:

- [ ] **Route `/` renders Home 2.0:** Direct URL `yourdomain.com/` loads the new Home component, not the docs module
- [ ] **Route `/docs` renders docs:** Direct URL `yourdomain.com/docs` routes to the documentation module entry point; no 404, no infinite redirect
- [ ] **Old doc links work:** URLs like `yourdomain.com/processo/visao-geral` still resolve correctly — the docs module's wildcard routes (`/processo/*`) are unchanged
- [ ] **Sidebar Home link is active only on `/`:** Navigating to `/docs` does not mark the Home sidebar link as active; `end` prop is present on the Home NavLink
- [ ] **No ESLint boundary violations:** `npx eslint src/ --max-warnings 0` passes with zero boundary errors after any cross-module slot registration is added
- [ ] **No circular import warnings in Vite build:** `npm run build` produces no "circular dependency" warnings in the console
- [ ] **Admin panel not in sidebar:** `/admin/modules` is accessible by URL but does not appear in the sidebar navigation under any section
- [ ] **Admin panel protected:** Navigating to `/admin/modules` without being logged in redirects to `/login`
- [ ] **`tsc --noEmit` passes:** Zero TypeScript errors, zero uses of `any` in any new registry, slot, or extension type
- [ ] **Slot components satisfy `SlotComponentProps`:** Every component registered into a slot passes TypeScript type checking without `@ts-ignore` or type casts to `any`
- [ ] **Vercel deploy:** After routing migration, manually test direct URL access in the deployed Vercel environment (not just local dev) — Vite dev server handles all routes; Vercel rewrite behavior may differ

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Route `/` broken — Home 2.0 redirect loops | LOW | Add `replace` to `<Navigate>` component; clear browser history in dev tools; verify in incognito |
| `/docs` route missing — docs module unreachable | LOW | Add explicit `<Route path="/docs" element={<Navigate to="/processo/index" replace />} />` in App.tsx as a bridge route |
| ESLint boundary violation from cross-module slot import | LOW | Move the registered component reference into `registry.ts`; remove the direct cross-module import from the manifest |
| Circular manifest import — `MODULE_REGISTRY` is `undefined` at runtime | MEDIUM | Create `src/modules/module-ids.ts` constants file; replace all value imports from `registry.ts` in manifests with imports from the constants file |
| `ComponentType<any>` in slot registry — TypeScript silent failures | MEDIUM | Define `SlotComponentProps`; replace `any` with it; fix any component files that do not satisfy the interface — likely requires adding `context?: Record<string, string \| number \| boolean>` to slot component props |
| Home 2.0 is a god-component importing from all modules | HIGH | Introduce `homeWidget` slot field in `ModuleManifest`; each module moves its home content into its own widget component; Home.tsx renders slots only — requires refactoring each module's home contribution |
| Admin panel accessible without auth | LOW | Wrap admin route in `<ProtectedRoute>`; verify in incognito |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Route migration breaks bookmarks and Cmd+K links | Routing Refactor phase — link audit before first commit | Direct URL access to `/`, `/docs`, `/processo/visao-geral` in deployed Vercel environment |
| ESLint boundary violation from extension imports | Module Registry Enhancement — approve cross-module communication pattern before slot code | `npx eslint src/ --max-warnings 0` in CI |
| Circular manifest import via registry.ts | Module Registry Enhancement — create `module-ids.ts` at phase start | `npm run build` with no circular dependency warnings |
| Type safety lost in slot system | Slot Architecture phase — define `SlotComponentProps` before any slot is implemented | `npx tsc --noEmit` passes; grep for `ComponentType<any>` returns zero results |
| Over-engineering extension system | Module Registry Enhancement — complexity review of `ModuleDefinition` type | Type definition fits in 20 lines; no async resolution logic |
| Home 2.0 god-component | Home 2.0 phase — require `description` field in manifests before rebuilding Home | Home.tsx imports only from `@/modules/registry`; ESLint boundary rule does not fire |
| Admin panel in sidebar navigation | Admin Panel phase — routing strategy decided before component is built | Admin URL accessible by direct navigation; absent from sidebar in all states |
| Vercel routing regression | End of Routing Refactor phase | Manual test in deployed Vercel preview: direct URL access for 5 distinct routes |

---

## Sources

- Direct codebase inspection: `src/App.tsx` — current routing structure, `moduleRoutes` derivation pattern, static vs. registry-derived routes
- Direct codebase inspection: `src/modules/registry.ts` — `ModuleManifest` type, `MODULE_REGISTRY` static constant
- Direct codebase inspection: `src/components/layout/Sidebar.tsx` — `navigationFromRegistry` derivation, hardcoded Home NavLink
- Direct codebase inspection: `src/pages/Home.tsx` — `MODULE_DESCRIPTIONS` hardcoding pattern, `useActivityFeed` cross-module Supabase fetch
- Direct codebase inspection: `src/modules/docs/manifest.tsx`, `src/modules/clients/manifest.tsx` — current route config and nav structure
- Direct codebase inspection: `eslint.config.js` — `boundaries/element-types` rule with `{ from: 'module', disallow: ['module'] }` enforcement
- Direct codebase inspection: `vercel.json` — `/(.*) → /index.html` rewrite confirms all routes already handled
- [React Router v6 Navigate component — official docs](https://reactrouter.com/en/main/components/navigate)
- [React Router v6 redirect handling — Michael Jackson gist](https://gist.github.com/mjackson/b5748add2795ce7448a366ae8f8ae3bb)
- [Vercel SPA routing 404 fix — Vercel Knowledge Base](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404)
- [Vercel Vite SPA rewrite issue — community thread](https://community.vercel.com/t/rewrite-to-index-html-ignored-for-react-vite-spa-404-on-routes/8412)
- [Slot-Based APIs in React — DEV Community](https://dev.to/talissoncosta/slot-based-apis-in-react-designing-flexible-and-composable-components-7pj)
- [Martin Fowler — Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html)
- [Circular dependencies in JavaScript/TypeScript — Michel Weststrate](https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de)
- [ESLint boundaries plugin + Nx module enforcement — Nx docs](https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries)
- [React TypeScript generic component type safety — Total TypeScript](https://www.totaltypescript.com/tips/use-generics-in-react-to-make-dynamic-and-flexible-components)
- `.planning/PROJECT.md` — v2.0 milestone target features, key decisions, constraints

---
*Pitfalls research for: v2.0 — modular extension architecture added to existing React 18 SPA*
*Researched: 2026-03-13*
