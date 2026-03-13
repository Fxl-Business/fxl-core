# Feature Research: v2.0 — Framework Shell + Modular Architecture

**Domain:** Modular React SPA framework shell — extension system, slot-based UI injection, admin panel
**Researched:** 2026-03-13
**Confidence:** HIGH for patterns backed by both existing codebase inspection and verified community references. MEDIUM for contract/extension architecture (no single authoritative React source — synthesized from OpenMRS O3, UI Composition Architecture, and Plugin Registry patterns). LOW for admin panel visual UX (no directly analogous internal tool found).

---

## Scope

This research covers ONLY the new features for v2.0. It answers:

- What are **table stakes** for each of the six feature areas?
- What are **differentiators** — enhancements worth having but not blocking?
- What are **anti-features** — things that seem good but create disproportionate complexity?
- What are the **feature dependencies** — what must exist before what?
- What is the **complexity** given the existing MODULE_REGISTRY + ModuleManifest infrastructure?

The existing MODULE_REGISTRY, ModuleManifest type, ESLint boundary enforcement, and module-driven sidebar/routing are treated as **fixed infrastructure** (already built in v1.5).

---

## Architecture Context

The existing module registry in `src/modules/registry.ts` has:

```typescript
interface ModuleManifest {
  id: string
  label: string
  route: string
  icon: LucideIcon
  status: ModuleStatus      // 'active' | 'beta' | 'coming-soon'
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
}
```

The v2.0 milestone needs to extend this with: extensions, slots, badges, contracts, and admin visualization. The research maps the new features against this existing foundation.

---

## Feature Landscape

### Feature Area 1: Home 2.0 — Control Center

**What it is:** Replace the current generic card grid (module tiles + activity feed + clients list) with a purpose-built operational control center. The Home page becomes the primary navigation surface and situational awareness panel for operators.

#### Table Stakes

Features users expect from an operational home page. Missing these = the page is just a fancier menu.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Status summary of all active modules | Operators need at-a-glance health of what's active | LOW | Read from enhanced MODULE_REGISTRY; render per-module status badges |
| Quick action shortcuts to most-used flows | Home should reduce clicks to critical tasks | LOW | Static configured per-module in manifest or derived from usage patterns |
| Recent activity feed cross-module | Already exists in v1.5; must be preserved and enhanced | LOW | Existing `useActivityFeed` hook fetches KB + Tasks; extend to include new event types |
| Per-module state summary (count of items, last action) | Context before navigating | MEDIUM | Requires Supabase queries per module at page load; aggregate KPIs |
| Navigation that reflects module status (disabled = grayed, beta = badged) | Visual affordance for module state | LOW | Extend existing module card with badge rendering from `ModuleManifest.status` |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pinned/recent clients section | Operators work with one or two active clients; fast return | LOW | Read from last-visited localStorage or from Supabase recent sessions |
| In-context system health indicators | Know at a glance if Supabase is reachable, auth is OK | MEDIUM | Lightweight heartbeat check on mount; show indicator per service |
| Cross-module quick task creation | Create a task or KB entry from Home without navigating | MEDIUM | Modal/command palette integration; already have cmdk infrastructure |
| Priority notifications or alerts | Outstanding tasks, unresolved comments, pending actions | HIGH | Requires a notifications system; deferred — not in v2.0 scope |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Fully customizable dashboard (drag layout) | "Make it my own" | Heavy complexity for one internal user; layout drift creates maintenance burden | Fixed purposeful layout; use priority and recent sections instead |
| Real-time data feeds (live updates) | Fresh data = better decisions | Adds WebSocket/polling infrastructure for minimal gain in single-user context | On-demand refresh button; accept ~5min staleness |
| Module usage analytics charts | Meta-insight into tool adoption | Premature optimization before product is stable; adds instrumentation complexity | Note usage manually in retrospectives |

---

### Feature Area 2: Module Registry Enhancement

**What it is:** Extend `ModuleManifest` type with new fields: `description`, `badge` (visual tag like "NEW" or "BETA"), `extensions` (contributions to other modules' slots), and `enabled` (runtime toggle). This makes the registry the single source of truth for everything about a module.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `description` field on ModuleManifest | Home 2.0 needs module descriptions; currently a separate `MODULE_DESCRIPTIONS` constant in Home.tsx | LOW | Add field to interface, migrate Home.tsx constant to manifest |
| `badge` field (`'new' \| 'beta' \| 'alpha' \| null`) | Visual badge in sidebar and Home cards | LOW | Replace current `status` field semantics or augment it; render in Sidebar and Home |
| `enabled` boolean field | Foundation for module toggle in admin panel | LOW | Already implicit via `status !== 'coming-soon'`; make explicit for admin control |
| `extensions` field (array of extension definitions) | Contract architecture requires modules to declare their contributions | MEDIUM | New `ModuleExtension` type; modules declare what they inject and where |
| Typed `ModuleExtension` shape | TypeScript enforcement of extension contracts | MEDIUM | Define interface with `slotId`, `component`, `priority`, optional `condition` |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `requiredModules` field (dependency declaration) | Auto-disable extension if required module is not active | MEDIUM | Array of module IDs; admin panel shows dependency graph |
| `version` field | Versioning for future migration tooling | LOW | Cosmetic for now; enables future upgrade paths |
| Module metadata validation at startup | Catch misconfigured manifests early | LOW | Zod schema over `MODULE_REGISTRY` entries; validated on app init |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Dynamic/lazy module loading (code splitting by module) | Faster initial load | Requires complex async registry resolution at runtime; breaks static type safety | Keep all modules eager; bundle is small enough at current scale |
| Remote module configuration (fetch from Supabase) | Operator-configurable without code deploy | Introduces async bootstrapping, race conditions, potential unavailability | Static registry in code; admin panel toggles are persisted in localStorage or Supabase for UX only |
| Plugin marketplace / third-party modules | Extensibility for external teams | Far beyond scope; no authentication, no sandboxing | Internal modules only in v2.0 |

---

### Feature Area 3: Contract Architecture — Module Extensions

**What it is:** A typed system where modules declare extensions — UI contributions to named slots owned by other modules. When both the contributing module and the slot-owning module are active, the contribution appears automatically. Example: the Tasks module declares an extension for the `client-detail-actions` slot owned by the Clients module; when both are enabled, a "Create Task" button appears in client detail pages.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Named slot concept (`slotId: string`) | A slot must have a stable identity for extensions to target | LOW | String enum or literal type; defined by the slot-owning module |
| Extension declaration in manifest | Modules declare contributions at registration time, not at render time | MEDIUM | `extensions: ModuleExtension[]` field added to `ModuleManifest` |
| Automatic activation when both modules are active | The "contract" — no wiring code needed when both enabled | MEDIUM | `SlotRenderer` checks registry for extensions targeting its `slotId` from active modules |
| TypeScript-typed extension component signature | Extensions must match the slot's expected props | MEDIUM | Each slot defines a `SlotProps` type; extension components must conform |
| No direct cross-module imports | Extensions are wired through the registry, not via import | MEDIUM | ESLint boundary rules already exist; reinforce via registry-only access |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Extension priority ordering | Multiple extensions in same slot appear in predictable order | LOW | `priority?: number` field on `ModuleExtension`; `SlotRenderer` sorts by priority |
| Conditional extension rendering | Extension only appears when data conditions are met | MEDIUM | `condition?: (context: SlotContext) => boolean` on `ModuleExtension` |
| Slot fallback content | When no extensions are registered for a slot, show a default | LOW | `<ExtensionSlot slotId="x" fallback={<DefaultContent />}>` |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Event bus / pub-sub between modules | "Loose coupling" | Harder to trace than registry-declared contracts; TypeScript loses track of event shapes | Use direct slot injection for UI, Supabase for shared data; no event bus |
| Async extension loading (import()) | Code splitting | Introduces loading states in every slot; over-engineering for 5 modules | All extensions are synchronous components; lazy loading at route level is sufficient |
| Extension override (one module replaces another's extension) | Maximum flexibility | Complex precedence rules, hard to debug | Use priority ordering; if conflict arises, treat as architecture smell |
| Context/state sharing between extensions in the same slot | Rich interactions between injected components | Creates tight coupling through shared context; defeats isolation | Extensions communicate through shared Supabase data or URL state |

---

### Feature Area 4: Slot-Based UI Injection System

**What it is:** The runtime mechanism that powers contracts. A `<ExtensionSlot slotId="x" context={...}>` component that looks up registered extensions for `slotId` from currently active modules and renders them. The complement to extension declarations in manifests.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `<ExtensionSlot slotId="..." context={...}>` component | The rendering primitive for all slot-based injection | MEDIUM | Reads `MODULE_REGISTRY`, filters active modules, collects their extensions for `slotId`, renders components |
| Context passing to extensions | Extensions need data from the host page/module | LOW | `context` prop passed through to each extension component |
| Renders nothing (not even a wrapper div) when no extensions | Slots must be zero-cost when unused | LOW | Return `null` or a Fragment when extension array is empty |
| Type-safe context per slot | Each slot's context type is defined by the owning module | MEDIUM | Generic `ExtensionSlot<TContext>` or typed slot registry |
| Active module filtering | Extensions from disabled/coming-soon modules are silently ignored | LOW | Filter `MODULE_REGISTRY` by `enabled === true` before collecting extensions |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| `useExtensions(slotId)` hook variant | For programmatic extension access (non-UI slots like data transforms) | LOW | Simple hook wrapping the same registry lookup |
| Error boundary per extension | One broken extension does not crash the slot | LOW | Wrap each extension render in a React error boundary |
| Dev-mode slot inspector (outline + label when `?debug=slots`) | Debugging tool for slot layout during development | LOW | CSS outline + label on each ExtensionSlot when URL param present |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| CSS-in-JS slot styling from extension component | Extension controls its own layout within the slot | Creates visual inconsistency; extensions should adapt to host context | Extensions receive layout classes via context; host defines the container |
| Slot registry separate from module registry | "Cleaner separation" | Adds a second registry to keep in sync with the module registry | Slots are implicitly defined by `slotId` strings used in `<ExtensionSlot>`; no explicit slot registry needed |
| Lazy-loaded extension components | Performance optimization | Adds loading spinners inside slots; disruptive for small UI contributions | All extension components are eagerly loaded with their module |

---

### Feature Area 5: Admin Panel — Module Visualization and Control

**What it is:** An internal page at `/admin/modules` that provides a visual overview of the module registry: what modules exist, their status, their extensions, their slot contributions, and the ability to toggle modules on/off for the current session.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| List/grid of all modules with status indicators | Operators need an overview of what's installed | LOW | Read `MODULE_REGISTRY`; render per-module card with status badge |
| Enable/disable toggle per module | Control which modules are active | MEDIUM | Toggle state persisted in localStorage or Supabase; `enabled` field in manifest is the static default |
| Extension map per module (what it contributes, where) | Debugging and understanding cross-module wiring | MEDIUM | Read `extensions` array from manifest; render as expandable section |
| Which slots each module owns | Complement to extensions — shows both sides of the contract | MEDIUM | Derive from `<ExtensionSlot>` usage (static analysis at build time or documentation in manifest) |
| Active module count summary | At-a-glance system state | LOW | Count `MODULE_REGISTRY.filter(m => m.enabled)` |
| Navigation to `/admin/modules` protected (operator-only) | Internal tool should not be accessible to external clients | LOW | Wrap in `<ProtectedRoute>` like other operator routes |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Visual extension dependency graph | See which modules depend on each other | HIGH | Requires graph rendering (force-directed or tree); disproportionate complexity for v2.0 |
| Extension slot coverage audit (slots with/without extensions) | Identify unregistered slots | MEDIUM | Cross-reference defined `<ExtensionSlot>` usages with registered extensions |
| Module configuration viewer | Show full manifest for each module | LOW | Pretty-print manifest as JSON in expandable section |
| Module health check (route resolves, component renders) | Smoke test each module | HIGH | Would require rendering each module in a test harness; out of scope |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Persistent module toggle (Supabase storage) | Survive page reloads | Creates split between static manifest (`enabled: true`) and runtime override (Supabase); source of truth confusion | Use localStorage for session-level toggle; treat static manifest as the authoritative default |
| Per-user module access control | Role-based feature access | Requires auth-level feature flags (Clerk roles + module intersection); too complex for v2.0 | All authenticated operators see all modules; access control is future work |
| Module install/uninstall UI | Dynamic module lifecycle | Modules are code, not packages; install = deploy | Admin panel is read/control only, not package management |
| Drag-to-reorder modules | Customize sidebar order | Sidebar order follows MODULE_REGISTRY array order; change in code | Accept static order; document it as intentional |

---

### Feature Area 6: Routing Refactoring

**What it is:** Change the top-level routes so that `/` maps to the new Home 2.0 page and `/docs` (or `/processo`) maps to the docs module entry point. The Sidebar also reflects the new structure. This is a prerequisite for Home 2.0 being a true first-class destination.

#### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `/` → Home 2.0 (already true in v1.5; must remain) | Home is the entry point | LOW | Already implemented; ensure it survives the refactoring |
| `/docs` or `/processo/index` as docs module entry | Docs should have a clean entry URL | LOW | `docsManifest.route` currently points to `/processo/index`; evaluate if `/docs` is cleaner |
| Sidebar Home link always visible | Home is always reachable | LOW | Already implemented; preserve across refactoring |
| Module routes derived entirely from `ModuleManifest.routeConfig` | No hardcoded routes in App.tsx outside of auth/wireframe exceptions | LOW | Already mostly true in v1.5; audit for any remaining hardcoded module routes |
| Sidebar module section reflects `enabled` state | Disabled modules disappear from nav | LOW | Extend the `filter(m => m.status !== 'coming-soon')` logic to also check `enabled` |
| Clean redirect for any legacy `/` routes | No broken links after refactoring | LOW | Add `<Navigate>` redirect where needed |

#### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Route-level breadcrumb reflecting module → section → page | Better orientation in nested navigation | MEDIUM | Requires `DocBreadcrumb` integration with module identity; currently only shows doc path |
| Sidebar active-module section auto-expand | The active module's nav tree opens on page load | LOW | Already implemented via `hasActiveChild`; verify it works with new routing |
| Admin routes group (`/admin/*`) | Clean namespace for internal tooling | LOW | Add `/admin/modules` route; protect with `<ProtectedRoute>` |

#### Anti-Features

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Hash-based routing (`/#/modules`) | Simpler SPA routing | Already using `BrowserRouter` with Vercel rewrite; hash routing would be a regression | Keep `BrowserRouter` |
| Module-specific route prefixes (`/tasks/*`, `/kb/*`) | Namespace clarity | Routes are already structured this way in v1.5; further abstraction not needed | Accept current pattern |
| Client-facing public routes for modules | External access to internal modules | Out of scope; external clients access only wireframe share links | Keep all module routes operator-only |

---

## Feature Dependencies

```
Home 2.0 (Feature Area 1)
    └──requires──> Enhanced Module Registry (Feature Area 2)
                       [description, badge, enabled fields]

Contract Architecture (Feature Area 3)
    └──requires──> Enhanced Module Registry (Feature Area 2)
                       [extensions field on ModuleManifest]
    └──enables──>  Slot-Based UI Injection (Feature Area 4)

Slot-Based UI Injection (Feature Area 4)
    └──requires──> Contract Architecture (Feature Area 3)
                       [ExtensionSlot reads from extensions registry]
    └──enhances──> Home 2.0 (Feature Area 1)
                       [slots on Home page accept cross-module contributions]

Admin Panel (Feature Area 5)
    └──requires──> Enhanced Module Registry (Feature Area 2)
                       [must read description, badge, extensions, enabled]
    └──requires──> Contract Architecture (Feature Area 3)
                       [must display extension → slot mapping]
    └──enhances──> Slot-Based UI Injection (Feature Area 4)
                       [admin toggle reflects in slot rendering]

Routing Refactoring (Feature Area 6)
    └──requires──> Enhanced Module Registry (Feature Area 2)
                       [enabled field drives sidebar filtering]
    └──enhances──> Home 2.0 (Feature Area 1)
                       [clean `/` route is prerequisite for Home as control center]
    └──enhances──> Admin Panel (Feature Area 5)
                       [admin routes under `/admin/*` namespace]
```

### Dependency Notes

- **Enhanced Module Registry is the foundation:** Features 1, 3, 4, 5, and 6 all read from the registry. It must be implemented first in any phase plan.
- **Contract Architecture enables but does not require Slot Injection:** The types and manifest declarations (Feature 3) can be defined and populated before the `<ExtensionSlot>` runtime component (Feature 4) exists. This allows parallel development.
- **Admin Panel depends on contracts being defined:** The panel's extension map visualization only has content once modules have declared their extensions. Build the panel UI before extensions are populated, then populate.
- **Routing Refactoring is mostly already done:** The `/ → Home` and `routeConfig → App.tsx` patterns are in place from v1.5. This feature area is primarily cleanup + adding `/admin/*` namespace.
- **Home 2.0 does not require slots:** The control center layout can be built with a static structure. Slots are an enhancement layer that can be added after the core layout ships.

---

## Complexity Assessment per Feature Area

| Feature Area | Complexity | Why | Depends On |
|-------------|------------|-----|------------|
| Home 2.0 | MEDIUM | New UI layout + per-module aggregate Supabase queries | Enhanced Registry |
| Module Registry Enhancement | LOW-MEDIUM | TypeScript interface extension + migration of existing fields | None (foundation) |
| Contract Architecture | MEDIUM | New types + manifest population across 5 modules | Enhanced Registry |
| Slot-Based UI Injection | MEDIUM | New `ExtensionSlot` component + registry lookup + TypeScript generics | Contracts |
| Admin Panel | MEDIUM | New page + manifest visualization; no heavy data fetching | Registry + Contracts |
| Routing Refactoring | LOW | Mostly already done; add `/admin/*` + audit leftover hardcoded routes | Enhanced Registry |

---

## MVP Definition

### Launch With (v2.0)

Minimum viable feature set to deliver the milestone goal: "transform FXL Core from a docs app into a modular framework shell."

- [ ] **Enhanced Module Registry** — `description`, `badge`, `enabled`, `extensions` fields; Zod validation. Foundation everything else builds on.
- [ ] **Routing Refactoring** — Audit and clean routes; add `/admin/*` namespace; sidebar filters by `enabled`. Low effort, high payoff.
- [ ] **Home 2.0** — Per-module status + aggregate summary + quick actions. Makes the platform feel like an operational control center rather than a nav page.
- [ ] **Contract Architecture types** — `ModuleExtension` type, `slotId` definitions per module, `extensions` populated in manifests. Declares the contracts even before runtime enforcement.
- [ ] **Slot-Based UI Injection** — `<ExtensionSlot>` runtime component; at least 2-3 real cross-module extensions to validate the pattern works.
- [ ] **Admin Panel `/admin/modules`** — Module list, enable/disable toggle (localStorage), extension map. Operator debugging surface.

### Add After Validation (v2.x)

Features to add once the core framework shell is working and operators are using it.

- [ ] **Extension error boundaries** — Wrap each extension render; prevents slot crashes from taking down host pages.
- [ ] **Slot inspector dev mode** — `?debug=slots` URL param outlines all active slots; aids development of new extensions.
- [ ] **Breadcrumb module identity** — Breadcrumb shows "Tasks > [client] > Create Task" instead of just the URL path.
- [ ] **Supabase-persisted module toggle** — Move from localStorage to Supabase for cross-device consistency.

### Future Consideration (v3+)

Features to defer until the framework shell pattern is proven across multiple milestones.

- [ ] **Dynamic module loading** — Lazy-load module code bundles; requires async registry and Suspense boundaries everywhere.
- [ ] **Per-user module access control** — Clerk roles + module `requiredRole` field; requires Clerk organization setup.
- [ ] **Visual dependency graph** — Force-directed graph of module relationships; requires a graph library.
- [ ] **Extension registry UI** — Visual editor for declaring new extensions; meta-tooling.

---

## Feature Prioritization Matrix

| Feature | Operator Value | Implementation Cost | Priority |
|---------|---------------|---------------------|----------|
| Enhanced Module Registry | HIGH — enables everything else | LOW-MEDIUM | P1 |
| Routing Refactoring | HIGH — /admin namespace + clean routes | LOW | P1 |
| Home 2.0 | HIGH — control center replaces generic card grid | MEDIUM | P1 |
| Contract Architecture types | HIGH — typed cross-module wiring | MEDIUM | P1 |
| Admin Panel `/admin/modules` | HIGH — debugging + control surface | MEDIUM | P1 |
| Slot-Based UI Injection | MEDIUM — runtime for contracts; few real extensions at v2.0 | MEDIUM | P1 |
| Home 2.0 slots | LOW — extensions on Home are nice-to-have | MEDIUM | P2 |
| Extension error boundaries | MEDIUM — resilience; needed before heavy extension usage | LOW | P2 |
| Slot inspector dev mode | LOW — developer experience; not user-facing | LOW | P3 |

**Priority key:**
- P1: Must have for v2.0 to deliver the milestone goal
- P2: Should have; add when P1 is complete and time permits
- P3: Nice to have; future milestone

---

## Existing Infrastructure Inventory (What v2.0 Can Reuse)

| Existing Asset | How v2.0 Uses It | Notes |
|---------------|-----------------|-------|
| `ModuleManifest` type in `registry.ts` | Extend with new fields | Non-breaking if new fields are optional |
| `MODULE_REGISTRY` array | Core registry; enhanced in-place | No structural change |
| `Sidebar.tsx` active module filter | Extend to also filter by `enabled` field | Minor change |
| ESLint boundary enforcement | Already prevents cross-module imports | Reinforce the rule: extensions registered via registry, not imported |
| `src/modules/*/manifest.tsx` per-module files | Add `extensions: []` array | 5 files to update |
| Clerk `<ProtectedRoute>` | Protect `/admin/modules` route | Reuse existing pattern |
| `useActivityFeed` hook in Home.tsx | Enhance with new event types | Small extension |
| `cmdk` command palette | Potential surface for cross-module quick actions on Home | Reuse existing infrastructure |
| Supabase client | Activity aggregation queries for Home 2.0 | Existing Supabase integration |

---

## Sources

- Existing codebase analysis: `src/modules/registry.ts`, `src/pages/Home.tsx`, `src/App.tsx`, `src/components/layout/Sidebar.tsx`
- [OpenMRS O3 Extension System — extension + slot pattern with named slots and module registration](https://o3-docs.openmrs.org/docs/extension-system) — MEDIUM confidence (different scale/context but well-documented slot + extension pattern)
- [UI Composition Architecture for React — slot registry, widget registration pattern](https://dev.to/riturathin/rethinking-frontend-scalability-the-ui-composition-architecture-pattern-for-large-react-3mpn) — MEDIUM confidence
- [Building a Plugin System in React Using Dynamic Imports and Context API](https://dev.to/hexshift/building-a-plugin-system-in-react-using-dynamic-imports-and-context-api-3j6e) — MEDIUM confidence (plugin contract pattern)
- [Building a Component Registry in React](https://medium.com/front-end-weekly/building-a-component-registry-in-react-4504ca271e56) — MEDIUM confidence
- [Modularizing React Applications — Martin Fowler](https://martinfowler.com/articles/modularizing-react-apps.html) — HIGH confidence (authoritative reference for module boundary patterns)
- [@grlt-hub/react-slots — declarative slot system for React](https://github.com/grlt-hub/react-slots) — LOW confidence for direct adoption (Effector dependency); useful as pattern reference
- `.planning/codebase/ARCHITECTURE.md` — analysis of existing data flow and module boundaries

---

*Feature research for: v2.0 Framework Shell + Modular Architecture*
*Researched: 2026-03-13*
