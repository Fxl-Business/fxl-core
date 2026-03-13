# Project Research Summary

**Project:** FXL Core v2.0 — Framework Shell + Modular Architecture
**Domain:** Modular React SPA extension system — slot-based UI injection, contract architecture, admin panel
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

FXL Core v2.0 evolves the platform from a docs-viewer SPA into a modular framework shell. The existing v1.5 infrastructure — `MODULE_REGISTRY`, `ModuleManifest`, ESLint boundary enforcement, sidebar-derived navigation, and Clerk-gated routing — is a solid foundation that needs extension, not replacement. The recommended approach is additive and purely TypeScript/React: extend `ModuleManifest` to `ModuleDefinition` with optional fields (`description`, `badge`, `enabled`, `extensions[]`), implement a pure-function extension resolver, add a React Context slot system (~80 LOC), rebuild the Home page as a control center, and create an admin panel at `/admin/modules`. Zero new npm dependencies are required — all Radix UI primitives, Tailwind, shadcn/ui, and Supabase are already installed and sufficient.

The critical implementation constraint is preserving ESLint module boundary isolation. The slot architecture is specifically designed so Module A never imports from Module B: extensions are declared in each module's own manifest and wired at the registry layer. This keeps the `module → module: disallow` rule intact. The build order must start with types (registry types), then the pure resolver function, then the React context slot system, before any page or admin work begins — because Home 2.0 and the admin panel both consume the slot context. Skipping ahead violates this dependency chain.

The two highest-risk areas are: (1) type safety at slot boundaries — without a defined `SlotComponentProps` interface, teams reach for `ComponentType<any>`, silently breaking TypeScript strict mode; and (2) circular manifest imports — the moment any manifest imports a runtime value from `registry.ts`, Vite resolves the cycle silently but `MODULE_REGISTRY` may be `undefined` at boot. Both risks are preventable with upfront decisions: define `SlotComponentProps` before writing any slot component, and create `src/modules/module-ids.ts` as a constants-only file before any `requires[]` declaration is written.

---

## Key Findings

### Recommended Stack

No new dependencies are needed for any v2.0 feature. The base stack (React 18.3.1, TypeScript 5.6.3 strict, Tailwind CSS 3.4.x, Vite 5, Radix UI, shadcn/ui, Supabase, Clerk, Recharts 2.13.3, lucide-react) fully covers all four milestone areas. Zustand 5.x was evaluated for registry state management and rejected — registry state is flat, rarely mutated, and consumed by only ~3 components, making React Context the correct tool. A hand-rolled `SlotRegistry` (~80 LOC) replaces candidate libraries (`@grlt-hub/react-slots` brings Effector as peer dep; `react-slot-fill` is abandoned). React 19, Tailwind v4, and Recharts 3.x upgrades are explicitly deferred per `PROJECT.md` constraints.

**Core technologies:**
- React Context: module enable/disable state + slot registry — sufficient at 5-module scale, re-evaluate with Zustand only if hot subscription paths emerge in v2.1+
- TypeScript string literal union (`SlotId`): contract enforcement between modules — compile-time safety via `tsc --noEmit`, no runtime validation library needed
- `@radix-ui/react-switch` (already installed v1.2.6): enable/disable toggles in admin panel
- `sonner` (already installed): toast confirmation for module toggle actions
- `localStorage('fxl-enabled-modules')`: enabled state persistence — per-browser, synchronous read, no loading states

**Explicitly rejected additions:**
- Zustand, Jotai, Recoil: overkill for flat registry state at 5-module scale
- `@grlt-hub/react-slots`: Effector peer dep, 80 LOC hand-rolled is sufficient
- Any feature-flag SaaS (LaunchDarkly, PostHog): admin panel is internal operator tool, not remote rollout infrastructure
- `react-admin` / `refine`: full frameworks for one internal page

### Expected Features

The six feature areas break into a clear P1/P2/P3 priority structure. The Enhanced Module Registry is the undisputed foundation — all five other features read from it and it must be implemented first.

**Must have (P1 — v2.0 required):**
- Enhanced Module Registry: `description`, `badge`, `enabled`, `extensions[]` fields on `ModuleDefinition`; `module-ids.ts` constants file; optional Zod validation at app init
- Routing Refactor: audit all hardcoded hrefs before touching routes; add `/admin/*` namespace; sidebar filters by `enabled`; `/` remains Home, doc routes unchanged
- Home 2.0 Control Center: per-module status + aggregate summary + quick actions + activity feed preserved; `description` from manifest, not hardcoded in Home.tsx
- Contract Architecture types: `ModuleExtension` type, `SLOT_IDS` const object, `extensions[]` populated in all 5 manifests
- Slot-Based UI Injection: `<ModuleSlot>` runtime component; `ExtensionProvider` wrapping App; 2-3 real cross-module extensions validating the pattern end-to-end
- Admin Panel `/admin/modules`: module list, enable/disable toggle (localStorage), extension map visualization; NOT in sidebar nav; hardcoded static route in App.tsx

**Should have (P2 — add when P1 ships):**
- Extension error boundaries: prevents one broken extension from crashing its host slot
- Slot inspector dev mode: `?debug=slots` URL param outlines all active slots during development
- Breadcrumb module identity: shows module context in DocBreadcrumb

**Defer (v2.x / v3+):**
- Dynamic module loading / lazy manifests: all 5 modules always compiled; lazy-loading adds Suspense complexity with zero bundle benefit at current scale
- Per-user module access control (Clerk roles + module intersection): requires Clerk org setup
- Supabase-persisted module toggle: localStorage sufficient for single-operator context
- Visual dependency graph: requires graph rendering library, disproportionate complexity for v2.0

### Architecture Approach

The architecture is a 4-layer composition: App.tsx (router) wraps `<ExtensionProvider>` which wraps `<Layout>` which renders `<Outlet>` with `<ModuleSlot>` injection points. The extension system is deliberately decoupled: `extension-registry.ts` is a pure function (no React) that takes the static registry and a set of enabled IDs and returns `Map<slotId, ComponentType[]>`; `slots.tsx` wraps that result in a React context; pages render `<ModuleSlot id={SLOT_IDS.X} />` without knowing which module fills it. This preserves the ESLint `module → module: disallow` boundary at every layer.

**Major components and responsibilities:**

| Component | Responsibility | Status |
|-----------|----------------|--------|
| `ModuleDefinition` + `ModuleExtension` types + `SLOT_IDS` | Contract types; single source of truth | New additions to `src/modules/registry.ts` |
| `module-ids.ts` | Module ID string constants, zero imports — prevents circular dependency | New file |
| `resolveExtensions()` | Pure function: registry + enabled set → ExtensionMap; fully unit-testable | New `src/modules/extension-registry.ts` |
| `ExtensionProvider` + `ModuleSlot` | Context provider + slot render primitive; ~80 LOC total | New `src/modules/slots.tsx` |
| `useActiveExtensions` hook | Per-module hook for programmatic extension access | New `src/modules/hooks/useActiveExtensions.ts` |
| `Home.tsx` (v2) | Control center: reads registry only; no per-module hardcoding; renders slots | Replace `src/pages/Home.tsx` |
| `ModulesPanel` | `/admin/modules` UI: module grid + toggles; reads MODULE_REGISTRY directly | New `src/pages/admin/ModulesPanel.tsx` |
| `Sidebar.tsx` | Add `enabled !== false` filter + badge pill rendering | Modify existing |
| `App.tsx` | Add `<ExtensionProvider>` wrap + static `/admin/modules` route | Modify existing |
| `eslint.config.js` | Expand exclusion pattern for `extension-registry`, `slots`, `hooks` | Modify existing |

### Critical Pitfalls

1. **Circular manifest imports** — The moment any manifest imports a runtime value from `registry.ts`, Vite resolves the cycle silently but `MODULE_REGISTRY` may be `undefined` at boot. Prevention: create `src/modules/module-ids.ts` as a constants-only file (no imports) before any `requires[]` declaration is written. Manifests import only types from `registry.ts` (erased at compile time); runtime module IDs come from `module-ids.ts` exclusively. Warning sign: Vite build prints a "circular dependency" warning.

2. **Type safety lost at slot boundaries** — `ComponentType<any>` in the slot registry silently breaks TypeScript strict mode; prop mismatches become invisible at slot render sites. Prevention: define `SlotComponentProps { context?: Record<string, string | number | boolean>; className?: string }` before any slot component is written. Every registered component must satisfy this interface. `npx tsc --noEmit` is the gate. Warning sign: `grep -r "ComponentType<any>"` returns results.

3. **ESLint boundary violations from extension imports** — Module A's manifest importing Module B's component directly triggers the `module → module: disallow` rule. Prevention: slot-registered components live in the providing module's own component directory; the registry layer aggregates. Never add `eslint-disable` comments or weaken the rule from `error` to `warn`. Warning sign: `// eslint-disable` appears inside `src/modules/[name]/`.

4. **Admin panel appearing in sidebar navigation** — Adding the `/admin/modules` route to `MODULE_REGISTRY` causes it to render in the sidebar automatically via `navigationFromRegistry`. Prevention: hardcode the admin route as a static `<Route>` in `App.tsx` under a clearly labeled comment; never add it to `MODULE_REGISTRY`. Warning sign: "Admin" or any admin label appears as a primary sidebar nav item.

5. **Home 2.0 becomes a god-component** — The existing `Home.tsx` already hardcodes `MODULE_DESCRIPTIONS`. Without discipline, Home 2.0 accumulates per-module knowledge (metrics, quick actions, client lists) and grows to 500+ lines importing from every module directory. Prevention: `description` field must be on `ModuleDefinition` before Home is rebuilt; modules contribute widgets via slots; `Home.tsx` imports only from `@/modules/registry`. Warning sign: ESLint boundary rule fires on a Home 2.0 PR.

---

## Implications for Roadmap

### Phase 1: Module Registry Foundation

**Rationale:** Every other feature depends on the enhanced `ModuleDefinition` type, `SLOT_IDS` const, and the `module-ids.ts` constants file. This is infrastructure that must exist before any slot, admin panel, or Home 2.0 code is written. It is also the safest starting point — purely additive to `registry.ts`, backward-compatible (all new fields are optional), and immediately verifiable with `tsc --noEmit` after each change.
**Delivers:** `ModuleDefinition` interface extending `ModuleManifest`; `ModuleExtension` type; `SLOT_IDS` const object; `module-ids.ts` constants file; `MODULE_REGISTRY` typed as `ModuleDefinition[]`; optional Zod validation schema on app init; all 5 module manifests updated with `description`, `badge`, and empty `extensions: []`.
**Features addressed:** Enhanced Module Registry (all table stakes); Contract Architecture types (partial — type declarations without runtime).
**Pitfalls avoided:** Circular manifest import (prevented by `module-ids.ts` at phase start); god-component Home.tsx (descriptions in manifests from day one).

### Phase 2: Slot Architecture

**Rationale:** The slot system is the runtime backbone for the contract architecture. It must exist before any module can register extensions and before Home 2.0 or the admin panel can render slot content. This phase produces no user-visible changes — it is pure infrastructure with high internal leverage.
**Delivers:** `extension-registry.ts` with `resolveExtensions()` pure function; `slots.tsx` with `ExtensionProvider` and `ModuleSlot`; `SlotComponentProps` interface; `useActiveExtensions` hook; `ExtensionProvider` wired into `App.tsx`; `eslint.config.js` updated to exclude new module-layer files from boundary rule.
**Features addressed:** Slot-Based UI Injection (all table stakes); Contract Architecture (runtime enforcement layer).
**Pitfalls avoided:** `ComponentType<any>` in slot registry (prevented by `SlotComponentProps` definition first); ESLint boundary violations (registry-layer aggregation pattern established before any extension is written); `ExtensionProvider` inside Layout anti-pattern (placed in `App.tsx` above all routes including admin).

### Phase 3: Routing Refactor

**Rationale:** Clean routing must precede Home 2.0 and admin panel work. The `/admin/*` namespace, `enabled` filtering in the sidebar, and route audit are low-complexity changes with outsized structural payoff. This phase starts with a link audit, not code — explicitly preventing the Vercel direct-link regression pitfall.
**Delivers:** Link audit of all hrefs pointing to `/` and doc paths; `enabled !== false` filter in `Sidebar.tsx`; badge pill rendering in sidebar; `/admin/modules` route stub (static `<Route>`, not registry-derived); Sidebar Home NavLink verified with `end` prop; existing doc routes (`/processo/*`, `/ferramentas/*`) unchanged.
**Features addressed:** Routing Refactor (all table stakes + admin namespace differentiator).
**Pitfalls avoided:** Route migration breaking Vercel direct-link visits (link audit first); admin panel appearing in sidebar (static hardcoded route, not registry-derived); broken Sidebar active state after routing changes.

### Phase 4: Home 2.0 — Control Center

**Rationale:** Home 2.0 replaces the current generic card grid. It requires Phase 1 (module descriptions in manifests) and Phase 2 (slot infrastructure) to be complete. This phase can include `<ModuleSlot id={SLOT_IDS.HOME_DASHBOARD} />` injection points even before any module fills them — graceful empty-slot behavior is built into the `ModuleSlot` component (returns null when empty).
**Delivers:** Rebuilt `src/pages/Home.tsx` reading exclusively from `MODULE_REGISTRY`; per-module status + badge rendering; preserved and enhanced activity feed (`useActivityFeed`); quick action shortcuts; pinned/recent clients section (localStorage or last-visited pattern); `<ModuleSlot>` injection points for future module contributions; no hardcoded `MODULE_DESCRIPTIONS` constant.
**Features addressed:** Home 2.0 Control Center (all table stakes + pinned clients differentiator).
**Pitfalls avoided:** God-component anti-pattern (descriptions from manifests; per-module data via slots); ESLint boundary violations from Home importing module internals.

### Phase 5: Contract Population — Module Extensions

**Rationale:** With the type system (Phase 1) and slot runtime (Phase 2) in place, this phase populates real cross-module extensions across the 5 existing modules. At least 2-3 genuine extensions must be registered and rendered to validate the architecture end-to-end before the admin panel visualizes them.
**Delivers:** `extensions[]` array populated in all relevant module manifests; `requires[]` dependencies declared using `MODULE_IDS` constants from `module-ids.ts`; 2-3 real cross-module extensions rendering via `<ModuleSlot>`; zero ESLint boundary violations; TypeScript confirming all extension components satisfy `SlotComponentProps`.
**Features addressed:** Contract Architecture (all table stakes + extension priority differentiator); Slot-Based UI Injection (real-world validation with actual cross-module extensions).
**Pitfalls avoided:** ESLint boundary violations (slot-registered components in providing module's directory only); circular imports (all `requires[]` values from `module-ids.ts`); over-engineering the extension system (flat `requires[]` array, no async resolution, no activation callbacks).

### Phase 6: Admin Panel `/admin/modules`

**Rationale:** The admin panel is the last feature because it visualizes what the previous phases built. Its extension map view only has content to display once modules have populated `extensions[]` (Phase 5). The enable/disable toggle writes to `localStorage` and triggers `ExtensionProvider` re-resolution, so the slot runtime (Phase 2) must be functional. Routing for the admin namespace was already established in Phase 3.
**Delivers:** `src/pages/admin/ModulesPanel.tsx` with module grid, status badges, enable/disable toggles (localStorage), extension map per module, active module count summary; route `/admin/modules` protected via `<ProtectedRoute>`; panel accessible by direct URL but absent from sidebar navigation in all states.
**Features addressed:** Admin Panel (all table stakes + extension slot coverage audit differentiator).
**Pitfalls avoided:** Admin panel in sidebar navigation (static route, not in `MODULE_REGISTRY`); admin routing collision with registry-derived routes; unauthenticated admin access.

### Phase Ordering Rationale

- **Foundation before consumers:** Phase 1 (types) must precede every other phase. Phase 2 (slot runtime) must precede any phase that renders slots. This is a hard dependency chain, not a soft preference.
- **Infrastructure before UX:** Phases 1-2 produce no visible UI changes — they are the stable base that Phases 3-6 build on. Skipping them to get visible results faster creates the god-component and type safety pitfalls.
- **Routing before new pages:** Phase 3 creates the `/admin/*` namespace and enables sidebar filtering before Phase 6 tries to use those routes.
- **Home before contract population:** Phase 4 builds the slot injection points. Phase 5 fills them with real extensions. This means Home 2.0 ships with functional but empty slots — a graceful incremental delivery state.
- **Contract population before admin visualization:** The admin panel's extension map (Phase 6) only has content to display once Phase 5 has populated `extensions[]` across modules.

### Research Flags

Phases requiring deeper investigation during planning:
- **Phase 5 (Contract Population):** Identifying which cross-module extension slots are operationally valuable requires domain knowledge about FXL Core's actual workflows. The types and runtime are clear (HIGH confidence) but the business use cases for specific slot placements (e.g., Tasks widget in Clients detail, KB shortcut in Tasks) are not fully mapped. Recommend a quick planning session to enumerate 3-5 high-value cross-module touchpoints before writing `extensions[]` in any manifest.
- **Phase 4 (Home 2.0):** Per-module aggregate counts (tasks pending, KB entries this week, active clients) need scoping against the actual Supabase schema before building queries. `useActivityFeed` is a proven pattern but new per-module KPI queries are not yet specified.

Phases with well-documented patterns (skip research-phase):
- **Phase 1 (Registry Foundation):** Pure TypeScript interface extension. HIGH confidence from direct codebase analysis. Implementation is mechanical — add optional fields to an existing interface.
- **Phase 2 (Slot Architecture):** Standard React Context pattern, ~80 LOC total. The implementation is fully specified in ARCHITECTURE.md with working code examples. No unknowns.
- **Phase 3 (Routing Refactor):** Primarily cleanup + 1 new route stub. All patterns are v1.5 precedents. The link audit is the only non-trivial step.
- **Phase 6 (Admin Panel):** Data display page reading from a Context. All UI primitives (Radix Switch, Tooltip, Dialog, Tailwind, lucide-react, sonner) are already installed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All stack decisions based on direct `package.json` inspection + confirmed installed packages. Zero new dependencies required — all alternatives evaluated against real constraints and rejected with specific rationale. |
| Features | HIGH for table stakes; MEDIUM for differentiators | Table stakes derived from direct codebase analysis and well-established React module patterns. Differentiators (extension priority, conditional rendering, slot inspector) synthesized from multiple community sources — validated patterns, not speculative. Admin panel visual UX rated LOW by the feature researcher (no direct analogue found); low risk given shadcn/ui covers all needed primitives. |
| Architecture | HIGH | Entirely based on direct codebase file reads (App.tsx, registry.ts, Sidebar.tsx, all 5 manifests, eslint.config.js). Implementation patterns are established React idioms. Build order (8 steps) is dependency-verified with working code examples provided for each new file. |
| Pitfalls | HIGH | 7 critical pitfalls identified from direct codebase inspection with specific file/line references. Warning signs and recovery steps are concrete. The circular import and ESLint boundary pitfalls are especially well-grounded in the actual current codebase state. |

**Overall confidence:** HIGH

### Gaps to Address

- **Cross-module extension business cases (Phase 5):** The architecture supports any extension, but which specific slot placements are operationally valuable has not been enumerated. Address during Phase 5 planning by reviewing FXL's active modules (Clients, Tasks, KB, Ferramentas, Docs) and identifying the 2-3 highest-value cross-module touchpoints before writing `extensions[]`.

- **Supabase schema for Home 2.0 KPIs (Phase 4):** Per-module aggregate counts require verified Supabase table structure. Current `useActivityFeed` fetches KB entries and tasks; new per-module KPI queries (counts, last action timestamp) need scoping against the actual schema. Not a blocker for Phase 4 planning but must be resolved before Home 2.0 implementation starts.

- **`homeWidget` slot vs. static per-module card (Phase 4):** PITFALLS.md warns that Home.tsx can grow into a god-component and recommends adding a `homeWidget` field to `ModuleDefinition`. FEATURES.md defers `homeWidget` to v2.x. This tension needs a final decision at Phase 1 plan time: either add `homeWidget?: React.ComponentType<SlotComponentProps>` to `ModuleDefinition` in Phase 1 (enabling clean slot-driven Home 2.0), or accept static per-module cards in Home 2.0 with a documented plan to migrate to slots in v2.1.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `src/modules/registry.ts` — current `ModuleManifest` type, `MODULE_REGISTRY` constant
- `src/App.tsx` — current routing structure, `moduleRoutes` flatMap derivation
- `src/pages/Home.tsx` — `MODULE_DESCRIPTIONS` hardcoding, `useActivityFeed` cross-module fetch
- `src/components/layout/Sidebar.tsx` — `navigationFromRegistry`, hardcoded Home NavLink
- `src/components/layout/Layout.tsx` — shell structure
- All 5 module manifests — current route config, nav structure
- `eslint.config.js` — `boundaries/element-types` rule: `{ from: 'module', disallow: ['module'] }`
- `vercel.json` — `/(.*) → /index.html` SPA rewrite confirmed
- `package.json` — all Radix UI primitives confirmed installed

### Secondary (MEDIUM confidence — multiple community sources)
- [WordPress Gutenberg SlotFill pattern](https://developer.wordpress.org/block-editor/reference-guides/components/slot-fill/) — Slot/Fill as Publish-Subscribe UI pattern; basis for hand-rolled implementation
- [Martin Fowler — Modularizing React Applications](https://martinfowler.com/articles/modularizing-react-apps.html) — authoritative reference for module boundary patterns
- [OpenMRS O3 Extension System](https://o3-docs.openmrs.org/docs/extension-system) — named slot + module registration pattern at production scale
- [React Router v6 Navigate component — official docs](https://reactrouter.com/en/main/components/navigate) — `replace` prop behavior for SPA route migration
- [State Management comparison 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) — Context vs. Zustand decision basis
- [Circular dependencies in TypeScript — Michel Weststrate](https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de) — circular import resolution strategies
- [ESLint boundaries + Nx module enforcement](https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries) — boundary rule patterns

### Tertiary (LOW confidence — single source or pattern inference)
- `@grlt-hub/react-slots` GitHub — evaluated and rejected; useful only as pattern reference
- [Building a Plugin System in React](https://dev.to/hexshift/building-a-plugin-system-in-react-using-dynamic-imports-and-context-api-3j6e) — plugin contract pattern, partial reference

---

*Research completed: 2026-03-13*
*Ready for roadmap: yes*
