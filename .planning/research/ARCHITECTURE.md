# Architecture Research

**Domain:** Modular Framework Shell — React SPA extension registry + slot injection
**Researched:** 2026-03-13
**Confidence:** HIGH (based on direct codebase analysis + established React patterns)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         App.tsx (Router)                              │
│  BrowserRouter → ExtensionProvider → ProtectedRoute → Layout          │
├──────────────────────────────────────────────────────────────────────┤
│                        Layout.tsx (Shell)                             │
│  ┌──────────────┐  ┌───────────────────────────────────────────────┐ │
│  │   Sidebar     │  │                  <Outlet />                   │ │
│  │ (ModuleDef)   │  │  ┌─────────────────────────────────────────┐ │ │
│  └──────────────┘  │  │   Page (owns max-w, content)             │ │ │
│                    │  │  ┌───────────────────────────────────┐   │ │ │
│  ┌──────────────┐  │  │  │   <ModuleSlot id="..." />         │   │ │ │
│  │   TopNav      │  │  │  └───────────────────────────────────┘   │ │ │
│  └──────────────┘  │  └─────────────────────────────────────────┘ │ │
│                    └───────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│                      Module Registry Layer                            │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────┐ ┌─────────────┐ │
│  │ MODULE_REG   │ │ ExtensionReg   │ │   Slots   │ │ useActive   │ │
│  │ (const [])   │ │ resolveExts()  │ │ Context   │ │ Extensions  │ │
│  └──────────────┘ └────────────────┘ └───────────┘ └─────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│                        Module Manifests                               │
│  ┌──────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐ ┌───────────┐ │
│  │ docs │ │ferrament.│ │ clients │ │ knowledge-  │ │   tasks   │ │
│  │      │ │          │ │         │ │    base     │ │           │ │
│  └──────┘ └──────────┘ └─────────┘ └──────────────┘ └───────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│                       Persistence Layer                               │
│  ┌──────────────────────┐        ┌──────────────────────────────┐   │
│  │   Supabase Client    │        │        Clerk Auth            │   │
│  └──────────────────────┘        └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Current State |
|-----------|----------------|---------------|
| `MODULE_REGISTRY` | Typed array of module definitions, drives sidebar + routing + home | Exists in `src/modules/registry.ts` |
| `ModuleManifest` | Per-module declaration: id, label, route, icon, status, navChildren, routeConfig | Exists in `registry.ts` |
| `ModuleDefinition` | Enhanced manifest: extends ModuleManifest with description, badge, enabled, extensions[] | NEW type — extends existing interface |
| `ModuleExtension` | Cross-module contribution: sourceModuleId, requires[], injects map of slotId→Component | NEW type |
| `ExtensionRegistry` | Pure function: resolveExtensions(registry, enabledIds) → ExtensionMap | NEW module file |
| `ExtensionProvider` | React context provider: mounts above Layout, provides ExtensionMap to tree | NEW component |
| `ModuleSlot` | Declarative injection point: reads ExtensionContext, renders injected components | NEW component |
| `useActiveExtensions` | Hook: returns active extensions for a given moduleId from context | NEW hook |
| `App.tsx` | Centralized router, wraps routes with ExtensionProvider | Modified: add provider wrap |
| `Sidebar` | Navigation tree from MODULE_REGISTRY navChildren | Modified: add enabled filter + badge |
| `Home.tsx` | Module grid + activity feed | Replaced with Home 2.0 |
| `Layout.tsx` | Shell: TopNav + Sidebar + Outlet | Unchanged |
| `ModulesPanel` | /admin/modules UI: module grid with enable/disable toggles | NEW page |

---

## Recommended Project Structure

```
src/
├── modules/
│   ├── registry.ts                   # ModuleManifest + ModuleDefinition + ModuleExtension + MODULE_REGISTRY
│   ├── extension-registry.ts         # resolveExtensions() pure function + ExtensionMap type
│   ├── slots.tsx                     # ExtensionProvider + ModuleSlot + ExtensionContext
│   ├── hooks/
│   │   └── useActiveExtensions.ts    # useActiveExtensions(moduleId) convenience hook
│   ├── docs/
│   │   └── manifest.tsx              # unchanged
│   ├── ferramentas/
│   │   └── manifest.tsx              # unchanged
│   ├── clients/
│   │   └── manifest.tsx              # unchanged
│   ├── knowledge-base/
│   │   └── manifest.ts               # optional: add description, badge, extensions[]
│   └── tasks/
│       └── manifest.ts               # optional: add description, badge, extensions[]
│
├── pages/
│   ├── Home.tsx                      # REPLACED with Home 2.0 (same route /)
│   ├── admin/
│   │   └── ModulesPanel.tsx          # NEW: /admin/modules
│   └── ...                           # existing pages unchanged
│
└── components/
    └── layout/
        ├── Sidebar.tsx               # Modified: enabled filter + badge rendering
        └── ...                       # TopNav, Layout unchanged
```

### Structure Rationale

- `extension-registry.ts` is separated from `registry.ts` to keep the registry file focused on types and the static constant. The resolver is pure business logic with no React dependency.
- `slots.tsx` is separated from both files above because it owns React context + JSX. Keeping it separate avoids circular imports with manifests that import `ModuleManifest`.
- `modules/hooks/` follows the established pattern from `modules/knowledge-base/hooks/` and `modules/tasks/hooks/`.
- `pages/admin/` is a new subdirectory under pages (not a module manifest entry) because admin routes are internal tooling, not operator-facing modules with navChildren or sidebar presence.
- ESLint boundaries pattern `src/modules/!(registry)*` must be updated to also exclude `extension-registry`, `slots`, and `hooks`.

---

## Architectural Patterns

### Pattern 1: ModuleDefinition as backward-compatible extension of ModuleManifest

**What:** `ModuleDefinition extends ModuleManifest` with optional new fields. The MODULE_REGISTRY const becomes `ModuleDefinition[]`. All existing consumers that only read `ModuleManifest` fields (Sidebar, Home, App.tsx route derivation) continue to work without modification.

**When to use:** Every new module-level capability is added to `ModuleDefinition` first. Existing consumers are untouched unless they need the new fields.

**Trade-offs:** The type grows over time. Acceptable for ~5-10 modules. At 20+ modules, split into sub-interfaces with intersection types.

**Example:**
```typescript
// src/modules/registry.ts

export interface ModuleExtension {
  id: string
  sourceModuleId: string
  requires: string[]                               // module IDs that must be active
  injects: Record<string, React.ComponentType>     // slotId → component
}

export interface ModuleDefinition extends ModuleManifest {
  description?: string
  badge?: string              // "Beta", "Novo", "Preview"
  enabled?: boolean           // undefined = enabled by default
  extensions?: ModuleExtension[]
}

// MODULE_REGISTRY type changes from ModuleManifest[] to ModuleDefinition[]
export const MODULE_REGISTRY: ModuleDefinition[] = [
  docsManifest,
  ferramentasManifest,
  clientsManifest,
  knowledgeBaseManifest,
  tasksManifest,
]
```

### Pattern 2: ExtensionRegistry as pure function (no React)

**What:** `resolveExtensions(registry, enabledIds)` takes the static registry and a Set of enabled module IDs, returns an `ExtensionMap` (Map<slotId, ComponentType[]>). Zero side effects, zero React.

**When to use:** Call once in `ExtensionProvider`, wrapped in `useMemo` with `enabledIds` as dependency.

**Trade-offs:** Requires a React context layer to distribute the result. Extremely testable — unit tests need no DOM or React renderer.

**Example:**
```typescript
// src/modules/extension-registry.ts

export type ExtensionMap = Map<string, React.ComponentType[]>

export function resolveExtensions(
  registry: ModuleDefinition[],
  enabledIds: Set<string>,
): ExtensionMap {
  const map: ExtensionMap = new Map()

  for (const mod of registry) {
    if (!enabledIds.has(mod.id)) continue
    for (const ext of mod.extensions ?? []) {
      const satisfied = ext.requires.every(id => enabledIds.has(id))
      if (!satisfied) continue
      for (const [slotId, Component] of Object.entries(ext.injects)) {
        const existing = map.get(slotId) ?? []
        map.set(slotId, [...existing, Component])
      }
    }
  }

  return map
}
```

### Pattern 3: Slot system via React context

**What:** `ExtensionProvider` wraps the app above `Layout`. `ModuleSlot` reads the context map and renders injected components in order, keyed by array index.

**When to use:** Any page or component that accepts cross-module UI without importing the contributing module.

**Trade-offs:** Context re-renders when `ExtensionMap` reference changes — memoize in provider. Currently 0 slot consumers exist so perf impact is nil until slots are used.

**Example:**
```typescript
// src/modules/slots.tsx

const ExtensionContext = React.createContext<ExtensionMap>(new Map())

function useEnabledModuleIds(): string[] {
  // Read from localStorage or MODULE_REGISTRY defaults
  const saved = localStorage.getItem('fxl-enabled-modules')
  if (saved) return JSON.parse(saved) as string[]
  return MODULE_REGISTRY
    .filter(m => m.enabled !== false)
    .map(m => m.id)
}

export function ExtensionProvider({ children }: { children: React.ReactNode }) {
  const enabledIds = useEnabledModuleIds()
  const map = React.useMemo(
    () => resolveExtensions(MODULE_REGISTRY, new Set(enabledIds)),
    [enabledIds],
  )
  return <ExtensionContext.Provider value={map}>{children}</ExtensionContext.Provider>
}

export function ModuleSlot({ id }: { id: string }) {
  const map = React.useContext(ExtensionContext)
  const components = map.get(id) ?? []
  return <>{components.map((C, i) => <C key={i} />)}</>
}
```

### Pattern 4: Slot IDs as typed constants (not magic strings)

**What:** Export a const object of known slot IDs from `registry.ts`. Manifests reference `SLOT_IDS.HOME_DASHBOARD` instead of `"home.dashboard"`.

**When to use:** Required from the first slot registration. Typos in string IDs produce silent failures (slot just renders nothing).

**Trade-offs:** Requires all slot IDs to be declared centrally before use. Minor coordination overhead, significant safety gain.

**Example:**
```typescript
// src/modules/registry.ts

export const SLOT_IDS = {
  HOME_DASHBOARD: 'home.dashboard',
  HOME_QUICK_ACTIONS: 'home.quick-actions',
  TASK_CARD_FOOTER: 'tasks.task-card.footer',
} as const

export type SlotId = typeof SLOT_IDS[keyof typeof SLOT_IDS]
```

### Pattern 5: Routing refactor — minimal change approach

**What:** Keep all existing route paths unchanged (`/processo/*`, `/ferramentas/*`, etc.). Only `/` changes: it now renders Home 2.0 instead of the current `Home.tsx`. No sidebar hrefs change, no Supabase search index needs updating.

**When to use:** This is the recommended approach for v2.0 to minimize blast radius. A full `/docs/` prefix consolidation is a separate future milestone.

**Trade-offs:** Leaves the `/docs` path unused (docs remain at `/processo`, `/ferramentas`, etc.). Slightly inconsistent naming persists. Acceptable given zero href changes required.

---

## Data Flow

### Extension Resolution Flow

```
App.tsx boot
    ↓
<ExtensionProvider> mounts
    ↓
useEnabledModuleIds() → localStorage or MODULE_REGISTRY defaults
    ↓
resolveExtensions(MODULE_REGISTRY, new Set(enabledIds))
    ↓
ExtensionMap = Map<slotId, ComponentType[]>
    ↓
ExtensionContext.Provider value={map}
    ↓
<ModuleSlot id="home.dashboard" />
    → reads map.get("home.dashboard") → ComponentType[]
    → renders each component in order
```

### Module Enable/Disable Flow

```
/admin/modules page
    ↓
User toggles module enabled state
    ↓
localStorage.setItem('fxl-enabled-modules', JSON.stringify(newIds))
    ↓
useEnabledModuleIds() re-reads → triggers ExtensionProvider re-render
    ↓
resolveExtensions() recalculates → new ExtensionMap
    ↓
All <ModuleSlot /> consumers re-render with updated injections
    ↓
Sidebar re-reads MODULE_REGISTRY with updated enabled state
    → filters out disabled modules from nav
```

### Home 2.0 Data Flow

```
Home 2.0 (route /)
    ↓
MODULE_REGISTRY.map() → module grid cards
    ↓
useActivityFeed() → Promise.all([supabase kb_entries, supabase tasks])
    ↓
mergeAndSortActivityItems() → ActivityItem[]
    ↓
renders: module grid + activity feed + client shortcuts + <ModuleSlot id="home.dashboard" />
```

### Key State Boundaries

- `ExtensionContext` — derived at render time, memoized. No Supabase needed.
- `localStorage('fxl-enabled-modules')` — persisted enabled state. Per-browser.
- Module pages own their own state (KB, Tasks hooks remain in their own modules).
- Home 2.0 activity feed is the only cross-module data fetch — continues existing pattern from current Home.tsx.

---

## Integration Points

### Existing Files: What Changes

| File | Change Type | Details |
|------|-------------|---------|
| `src/modules/registry.ts` | Modified | Add `ModuleDefinition`, `ModuleExtension`, `SLOT_IDS` types; MODULE_REGISTRY becomes `ModuleDefinition[]`; existing `ModuleManifest` interface stays |
| `src/App.tsx` | Modified | Wrap existing route tree with `<ExtensionProvider>`; add `/admin/modules` route; routing otherwise unchanged |
| `src/pages/Home.tsx` | Replaced | Home 2.0 replaces file content; route `/` stays; same module grid + activity feed + new slots |
| `src/components/layout/Sidebar.tsx` | Modified | Add `enabled !== false` filter alongside existing `status !== 'coming-soon'`; add badge pill rendering |
| `eslint.config.js` | Modified | Expand exclusion pattern to cover `extension-registry`, `slots`, `hooks` |

### New Files Required

| File | Depends On | Purpose |
|------|-----------|---------|
| `src/modules/extension-registry.ts` | `ModuleDefinition`, `ModuleExtension` types | `resolveExtensions()` pure function |
| `src/modules/slots.tsx` | `extension-registry.ts`, React context | `ExtensionProvider` + `ModuleSlot` |
| `src/modules/hooks/useActiveExtensions.ts` | `ExtensionContext` from `slots.tsx` | Per-module hook: which extensions are active for this moduleId |
| `src/pages/admin/ModulesPanel.tsx` | `MODULE_REGISTRY`, `ModuleDefinition` | `/admin/modules` admin UI |

### ESLint Boundaries: Safe Zone

The extension system respects module isolation because:
- Module A declares `injects: { [SLOT_IDS.TASK_CARD_FOOTER]: MyComponent }` — no import of Module B
- Module B has `<ModuleSlot id={SLOT_IDS.TASK_CARD_FOOTER} />` — no import of Module A
- Wiring happens only in `ExtensionProvider` which lives in the registry layer (excluded from boundaries rule)

Required `eslint.config.js` update:
```javascript
// Before
{ type: 'module', pattern: 'src/modules/!(registry)*' }

// After
{ type: 'module', pattern: 'src/modules/!(registry|extension-registry|slots|hooks)*' }
```

### Internal Boundary Map

| Boundary | Pattern | Status |
|----------|---------|--------|
| Module manifest → registry.ts | Import `ModuleDefinition` type | Allowed (one-directional) |
| Module A → Module B component | Direct import | BLOCKED by ESLint boundaries |
| Module A → Module B via slot | String key injection | Allowed (no import coupling) |
| Page → Module pages | Direct import in App.tsx | Allowed (pages layer above modules) |
| Admin panel → MODULE_REGISTRY | Direct import | Allowed (pages layer) |
| Sidebar → MODULE_REGISTRY | Direct import | Allowed (components layer) |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 5 modules (current) | Static MODULE_REGISTRY; localStorage for enabled state; works as-is |
| 10-15 modules | Same static registry; add categories to ModuleDefinition for grouping in admin panel |
| 20+ modules | Consider lazy-loaded manifests; Supabase `user_preferences` for multi-operator enabled state |

### Scaling Priorities

1. **First: Slot render performance** — if many slots render many components simultaneously, add `React.memo` to injected components at the manifest level.
2. **Second: Enabled state multi-operator consistency** — if operators need synchronized module state, replace localStorage with Supabase `user_preferences` table (already in existing Supabase pattern).

---

## Anti-Patterns

### Anti-Pattern 1: Module imports another module's components directly

**What people do:** `tasks` module imports a component from `knowledge-base`. TypeScript allows it, ESLint boundaries blocks it at lint time.

**Why it's wrong:** Creates hard coupling. Removing one module breaks the other. Module isolation is the entire point of the registry architecture.

**Do this instead:** Module A declares a `ModuleExtension` with an `injects` entry pointing to a slot ID. Module B renders `<ModuleSlot id={SLOT_IDS.RELEVANT_SLOT} />`. Zero import coupling. Note: string-based navigation (hrefs) between modules is acceptable — only component import coupling is blocked.

### Anti-Pattern 2: Slot IDs as magic strings at call sites

**What people do:** `<ModuleSlot id="task-card.footer" />` in one file, `injects: { 'tasks.task-card.footer': C }` in another. Typo, nothing renders, no error.

**Do this instead:** Always reference `SLOT_IDS.TASK_CARD_FOOTER`. TypeScript catches mismatches at compile time. The `SLOT_IDS` const object in registry.ts is the single source of truth.

### Anti-Pattern 3: ExtensionProvider inside Layout only

**What people do:** Place `<ExtensionProvider>` inside Layout.tsx to co-locate it with slot consumers.

**Why it's wrong:** The `/admin/modules` page lives outside `Layout`. If the admin panel needs to read the ExtensionMap (to show accurate state), it would be outside the context boundary.

**Do this instead:** Place `ExtensionProvider` in `App.tsx` wrapping the entire `<BrowserRouter>` subtree, above `ProtectedRoute` and `Layout`.

### Anti-Pattern 4: useEnabledModuleIds returns empty on first render

**What people do:** Hook returns `[]` initially before localStorage is read, causing a flash where all extensions disappear.

**Do this instead:** Initialize synchronously from `localStorage.getItem()` (sync API, no loading state needed). Default to `MODULE_REGISTRY.filter(m => m.enabled !== false).map(m => m.id)` when key is absent. Treat `enabled: undefined` as enabled — consistent with the existing `status !== 'coming-soon'` filter in Sidebar.

### Anti-Pattern 5: Renaming all doc routes to /docs/* in this milestone

**What people do:** Refactor all `docsManifest` routeConfig paths from `/processo/*` to `/docs/processo/*` as part of the routing milestone.

**Why it's wrong:** The Sidebar has ~40 hardcoded hrefs in `docsManifest.navChildren`. The search index uses these paths. Every existing browser bookmark and shared link breaks. This is a large blast radius for a rename with no user value.

**Do this instead:** Only change `/` to Home 2.0. Leave all existing doc paths unchanged. Consolidating under `/docs/` is a separate future milestone if ever needed.

---

## Build Order for v2.0

Based on integration dependencies between the new components:

**Step 1 — Types (registry.ts)**
Add `ModuleDefinition`, `ModuleExtension`, `SLOT_IDS` to `registry.ts`. Change `MODULE_REGISTRY` type to `ModuleDefinition[]`. Backward-compatible: all existing consumers read only `ModuleManifest` fields, which are still present.

**Step 2 — Extension registry (extension-registry.ts)**
Pure function `resolveExtensions()`. No React, no DOM. Unit-testable immediately. Depends on Step 1 types only.

**Step 3 — Slot system (slots.tsx)**
`ExtensionProvider` + `ModuleSlot` + `ExtensionContext`. Depends on Steps 1-2. Wire into `App.tsx` (one-line change: wrap existing routes with `<ExtensionProvider>`).

**Step 4 — useActiveExtensions hook**
Thin wrapper over `ExtensionContext`. Depends on Step 3. One file.

**Step 5 — Routing refactor (App.tsx)**
Add `/admin/modules` route stub. Update `path="/"` to point to new Home 2.0 file. The old Home.tsx can be renamed or replaced in this step.

**Step 6 — Home 2.0 (Home.tsx)**
Replace current `src/pages/Home.tsx`. Reuses existing module grid + activity feed logic. Adds `<ModuleSlot id={SLOT_IDS.HOME_DASHBOARD} />` for extensibility. Depends on Step 5 (route must exist) and Step 3 (slot must exist).

**Step 7 — Admin panel (pages/admin/ModulesPanel.tsx)**
`/admin/modules` UI. Reads `MODULE_REGISTRY`, renders toggles, writes to localStorage. Depends on Steps 1-3.

**Step 8 — Sidebar update**
Add `enabled !== false` filter. Add badge pill rendering for `mod.badge`. Small additive change to existing file.

Each step is independently deployable. Steps 1-4 are pure logic/infra with no visible UI change. Steps 5-8 produce user-visible changes.

---

## Sources

- Direct codebase analysis: `src/modules/registry.ts` — HIGH confidence
- Direct codebase analysis: `src/App.tsx` — HIGH confidence
- Direct codebase analysis: `src/pages/Home.tsx` — HIGH confidence
- Direct codebase analysis: `src/components/layout/Sidebar.tsx` — HIGH confidence
- Direct codebase analysis: `src/components/layout/Layout.tsx` — HIGH confidence
- Direct codebase analysis: all module manifests (docs, ferramentas, clients, knowledge-base, tasks) — HIGH confidence
- Direct codebase analysis: `eslint.config.js` — HIGH confidence
- Direct codebase analysis: `.planning/PROJECT.md` — HIGH confidence
- React context + memoized provider pattern: HIGH confidence (established React pattern, no library needed)
- Slot injection as Map<slotId, ComponentType[]>: HIGH confidence (standard micro-frontend composition pattern adapted for single-SPA scale)

---
*Architecture research for: FXL Core v2.0 — Modular Framework Shell*
*Researched: 2026-03-13*
