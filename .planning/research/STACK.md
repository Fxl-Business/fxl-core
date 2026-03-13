# Stack Research

**Domain:** Modular Framework Shell — Module Registry, Slot Injection, Contract Architecture, Admin Panel (v2.0)
**Researched:** 2026-03-13
**Confidence:** HIGH

> This is an additive research document for v2.0. The base stack (React 18, TypeScript strict,
> Tailwind CSS 3, Vite 5, Supabase, Clerk, Recharts 2.x, lucide-react) is validated and unchanged.
> This document covers ONLY what is new or changed for the modular framework shell features.

---

## Executive Decision: Zero New Dependencies

All four v2.0 features — dynamic Module Registry, slot-based UI injection, contract architecture,
and admin panel — can be implemented using **only what is already installed**.

No new npm packages are required. The rationale for each is below.

---

## Feature-by-Feature Analysis

### 1. Dynamic Module Registry with Extensions

**Current state (v1.5):** `MODULE_REGISTRY` is a static `ModuleManifest[]` constant in
`src/modules/registry.ts`. Manifests are imported at compile time. Extensions and runtime
toggling are not possible.

**v2.0 requirement:** Registry must support `ModuleExtension` types, inter-module contracts
(module A declares it can extend module B's slots when both are active), and enable/disable
state visible to the admin panel.

**Decision: Pure TypeScript type augmentation + React Context.**

The registry can evolve to a richer type system (`ModuleDefinition` replacing `ModuleManifest`,
`ModuleExtension` as a sibling type) while the runtime state (which modules are enabled) lives
in a React Context provider wrapping the app. No state management library is needed because:

- The registry itself is still a static constant (no async loading of module code)
- "Enable/disable" state is a flat `Record<moduleId, boolean>` — minimal state, no derived
  computations across many subscribers
- React Context re-render scope is controlled: the provider sits high, but consumers that
  call `useModuleRegistry()` only re-render when registry state changes (infrequent, operator
  admin action)
- The existing `MODULE_REGISTRY` → sidebar → routing pattern already works via Context
  (Sidebar reads the manifest array, no fine-grained per-field subscriptions)

**Zustand 5.x considered and rejected for this feature.** Zustand 5.0.11 (current stable,
released ~2024, now on 5.0.11 as of early 2026) dropped React < 18 support, uses
`useSyncExternalStore` natively, and would be a clean fit technically. However, adding a new
state management library to solve a problem that React Context handles correctly at this scale
is unjustified. The registry state is: (a) rarely mutated, (b) consumed by ~3 components
(Sidebar, App router, Home), (c) not shared across module boundaries in a way that creates
re-render cascades. Context is the correct tool. If registry state grows to 10+ derived
computations with hot subscription paths, Zustand becomes the right choice.

**Confidence:** HIGH — React Context for module enable/disable is a well-validated pattern at
this scale.

---

### 2. Slot-Based UI Injection System

**Requirement:** A module must be able to declare "I inject UI into slot X of module Y" without
module Y importing from module X (the ESLint boundaries rule `module → module: disallow` must
be preserved).

**Decision: Pure React Context slot registry, no external library.**

The pattern is: a `SlotRegistry` context holds `Record<slotId, React.ReactNode[]>`. A `<SlotFill>` component (or `useSlotFill` hook) lets a module register a `ReactNode` into a named slot. A `<Slot id="slot-id">` component renders whatever is registered for that slot.

This is the same pattern WordPress Gutenberg uses (`SlotFillProvider`, `Slot`, `Fill`), but
reimplemented in ~80 lines of pure TypeScript/React without the Gutenberg dependency.

The `@grlt-hub/react-slots` library (Effector-powered) and `react-slot-fill` (abandoned 2018)
were evaluated. Neither adds value over a hand-rolled implementation:

- `@grlt-hub/react-slots` introduces `Effector` as a peer dependency — a reactive state library
  adding ~10kb. Not justified for a fixed set of ~5 slots.
- `react-slot-fill` is unmaintained.
- `@radix-ui/react-slot` solves a different problem (asChild prop polymorphism, already installed).

The hand-rolled Context + `Record<string, React.ReactNode[]>` approach is 80 lines, fully
typed, and requires zero new dependencies.

**Confidence:** HIGH — standard React pattern, widely documented, matches existing codebase style.

---

### 3. Contract Architecture Between Modules

**Requirement:** Type-safe contracts — a module declares "I provide slot `'tasks.sidebar-widget'`"
and another declares "I inject into `'tasks.sidebar-widget'`". TypeScript must catch a module
referencing a slot that doesn't exist.

**Decision: TypeScript discriminated union + string literal types, no library.**

The contract is expressed entirely in types:

```typescript
// In src/modules/registry.ts (central contracts)
export type SlotId =
  | 'home.activity-feed'
  | 'home.quick-actions'
  | 'sidebar.module-actions'
  | 'tasks.sidebar-widget'

export interface ModuleDefinition {
  id: string
  label: string
  // ...existing fields...
  slots?: SlotId[]           // slots this module provides
  extensions?: ModuleExtension[]  // slots this module fills
}

export interface ModuleExtension {
  targetSlot: SlotId         // must be a declared slot
  targetModule: string       // id of the module that owns the slot
  component: React.ComponentType // the UI to inject
  condition?: (registry: ModuleDefinition[]) => boolean // auto-activate when condition met
}
```

`SlotId` as a string literal union means TypeScript catches any reference to an undeclared slot
at compile time. No runtime validation library needed — `tsc --noEmit` is the gate.

**Confidence:** HIGH — this is idiomatic TypeScript. The existing `ModuleManifest` type uses the
same pattern (string literal `ModuleStatus`), so the team is already familiar.

---

### 4. Admin Panel for Module Management (/admin/modules)

**Requirement:** An internal UI page for visualizing modules, their status, slots they provide,
extensions they declare, and toggle enable/disable.

**Decision: shadcn/ui components already installed, zero new dependencies.**

The admin panel is a data display page with toggles. Everything needed is already present:

- `@radix-ui/react-switch` (installed `^1.2.6`) — enable/disable toggle per module
- `@radix-ui/react-tooltip` (installed `^1.1.0`) — slot documentation on hover
- `@radix-ui/react-dialog` (installed `^1.1.15`) — module detail drawer
- `lucide-react` — status icons, module icons
- Tailwind CSS — layout, status badges (using existing design tokens)
- `sonner` (installed) — toast confirmation for enable/disable actions

The admin panel reads from the `useModuleRegistry()` hook and dispatches enable/disable actions
to the registry context. No table library, no form library, no new UI primitives.

**Confidence:** HIGH — all UI primitives confirmed installed in package.json.

---

## Recommended Stack (Additions Only)

### Core Technologies

No changes to core framework.

### Supporting Libraries

No new packages required.

### Development Tools

No changes to dev tooling.

---

## Installation

```bash
# No new packages needed.
# All v2.0 features are implementable with the existing dependency set.
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| React Context for registry state | Zustand 5.0.11 | Registry state is flat, rarely mutated, consumed by ~3 components. Context is correct at this scale. Zustand adds a new dependency without solving a real problem here. If hot subscription paths emerge in v2.1+, Zustand becomes justified. |
| Hand-rolled SlotRegistry (~80 LOC) | `@grlt-hub/react-slots` | Introduces Effector as peer dep (~10kb). Overkill for a fixed slot set. The pattern is simple enough to own. |
| Hand-rolled SlotRegistry (~80 LOC) | `react-slot-fill` | Abandoned since 2018. Last commit is 7 years old. |
| TypeScript string literal `SlotId` union | JSON schema + Zod validation | Slots are declared at compile time, not runtime. TypeScript catches violations at `tsc` time, which is already the project's acceptance gate. Adding Zod validation would add runtime overhead for a compile-time concern. |
| `@radix-ui/react-switch` (installed) | Custom toggle implementation | Radix Switch is already installed, accessible, and used elsewhere in the app. No reason to reimplement. |
| shadcn/ui + Tailwind for admin panel | `react-admin`, `refine`, or similar | These are full frameworks requiring complete adoption. For one internal page, they are massive overkill. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `zustand` | Overkill for registry state at this scale. Re-evaluate only if the registry develops hot subscription paths across many component trees. | React Context with `useModuleRegistry()` hook |
| `@grlt-hub/react-slots` | Pulls Effector as peer dep. The slot pattern is 80 lines of plain React/TypeScript. | Hand-rolled `SlotRegistry` context |
| `immer` | Module registry mutations (enable/disable) are simple object spreads. Immer's immutable update DX is not needed for flat `Record<string, boolean>` state. | `useState` with object spread in context reducer |
| `jotai` or `recoil` | Atomic state models add conceptual overhead for what is single-store registry state. | React Context |
| Any feature-flag SaaS (LaunchDarkly, PostHog, etc.) | These are external services for customer-facing rollout management. The admin panel is an internal operator tool with no need for remote flag servers. | `Record<moduleId, boolean>` in Context |
| `react-admin` / `refine` | Admin framework libraries designed for CRUD over REST/GraphQL. The module admin panel is a single page reading from a local Context, not an API. | shadcn/ui components already installed |
| Recharts 3.x | Breaking API changes. PROJECT.md explicitly defers this upgrade. | Stay on 2.13.3 |
| React 19 | PROJECT.md explicitly defers this upgrade (stability constraint). | Stay on React 18.3.1 |
| Tailwind v4 | PROJECT.md explicitly defers this upgrade. | Stay on Tailwind CSS 3.4.x |

---

## Stack Patterns by Feature

**For Module Registry evolution (static → dynamic with extensions):**
- Keep `MODULE_REGISTRY` as the static array of `ModuleDefinition` objects (compile-time source of truth)
- Add a `ModuleRegistryContext` that holds `{ modules: ModuleDefinition[], enabled: Record<string, boolean>, toggleModule: (id: string) => void }`
- Wrap `<App>` with `<ModuleRegistryProvider>` — single provider, no nesting complexity
- All consumers (`Sidebar`, `Home`, `App` router) switch from direct import of `MODULE_REGISTRY` to `useModuleRegistry()`

**For Slot injection:**
- `SlotRegistry` is a separate context from `ModuleRegistry` — different concerns, different mutation rates
- `SlotRegistry` stores `Record<SlotId, { component: React.ComponentType, sourceModule: string }[]>`
- On app boot, each `ModuleDefinition.extensions` array is iterated and fills slots automatically
- `<Slot id="home.activity-feed" />` in a module's JSX renders all registered fills for that slot
- Module that provides a slot does NOT need to know which other modules will fill it — this preserves the ESLint `module → module: disallow` boundary

**For Contract architecture:**
- All `SlotId` values live in `src/modules/registry.ts` as the central contract file
- ESLint boundaries rule already enforces that modules cannot import each other
- The contract is enforced by TypeScript: `ModuleExtension.targetSlot` must be a valid `SlotId`
- Adding a new slot = adding one string literal to `SlotId` in `registry.ts`

**For Admin panel (/admin/modules):**
- New module `src/modules/admin/` following existing module structure (manifest + pages + components + types)
- Route `/admin/modules` added to `AdminManifest.routeConfig`
- Page reads from `useModuleRegistry()`, renders module cards with `Switch` toggles and slot diagrams
- Module is `status: 'active'` but only visually accessible to operators (Clerk auth already gates the whole app)

---

## ESLint Boundaries Compatibility

The existing ESLint flat config enforces `module → module: disallow`. The slot injection
architecture is designed to remain compatible:

- Module A's `ModuleDefinition` declares `extensions: [{ targetSlot: 'home.activity-feed', component: ActivityWidget }]`
- Module A imports its own component (`ActivityWidget`) — intra-module import, allowed
- The `SlotRegistryProvider` reads `extensions` from all `ModuleDefinition` objects and registers them — this happens in `src/modules/registry.ts` (type `lib`) or the provider, NOT inside module A's code
- Module B (home) renders `<Slot id="home.activity-feed" />` — reads from `SlotRegistry` context, no direct import from module A

Result: no cross-module imports are introduced. The boundary rule is preserved.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| `react` | 18.3.1 | React Context (built-in) | SlotRegistry and ModuleRegistry use standard `createContext`/`useContext` |
| `react-router-dom` | 6.27.0 | Dynamic route registration from manifests | Existing `m.routeConfig` flat-map pattern continues to work |
| `@radix-ui/react-switch` | 1.2.6 | React 18 | Admin panel module toggles |
| `@radix-ui/react-tooltip` | 1.1.0 | React 18 | Slot documentation on hover |
| `@radix-ui/react-dialog` | 1.1.15 | React 18 | Module detail drawer |
| `eslint-plugin-boundaries` | 5.4.0 | ESLint v9 flat config | Slot architecture designed to preserve existing `module → module: disallow` rule |
| `typescript` | 5.6.3 | String literal union `SlotId` | Full discriminant narrowing and type safety on contract architecture |
| `zod` | 4.3.6 | Not needed for slot/registry types | Slot contracts are compile-time TypeScript, not runtime-validated data |

---

## Sources

- [Zustand v5 announcement — pmnd.rs](https://pmnd.rs/blog/announcing-zustand-v5) — Confirmed v5 stable, React 18 `useSyncExternalStore` native. Rejected for this milestone because React Context sufficient.
- [Zustand npm](https://www.npmjs.com/package/zustand) — Current version 5.0.11 (MEDIUM — WebSearch confirmed)
- [WordPress SlotFill pattern](https://developer.wordpress.org/block-editor/reference-guides/components/slot-fill/) — Slot/Fill as Publish-Subscribe UI pattern. Hand-rolled equivalent used here (HIGH — official docs)
- [React Context for module management — kentcdodds.com](https://kentcdodds.com/blog/how-to-use-react-context-effectively) — Context is correct tool for shared state with infrequent mutations (HIGH — authoritative React patterns source)
- [State Management comparison 2025 — DEV Community](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) — Context best for small-medium apps, Zustand for medium-large with hot paths (MEDIUM — WebSearch verified)
- [Slot-Based Component Architecture — rishandigital.com](https://rishandigital.com/reactjs/slot-based-component-architecture/) — `Record<string, React.ReactNode>` Context pattern for named slots (MEDIUM — WebSearch)
- ESLint boundaries plugin config at `/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/eslint.config.js` — Confirmed `module → module: disallow` rule in place (HIGH — direct code read)
- `package.json` at project root — All Radix UI primitives confirmed installed for admin panel (HIGH — direct code read)
- `src/modules/registry.ts` — Current `ModuleManifest` type and `MODULE_REGISTRY` constant (HIGH — direct code read)

---

*Stack research for: FXL Core v2.0 — Framework Shell + Modular Architecture*
*Researched: 2026-03-13*
