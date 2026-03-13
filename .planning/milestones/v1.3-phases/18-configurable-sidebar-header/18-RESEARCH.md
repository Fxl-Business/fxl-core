# Phase 18: Configurable Sidebar & Header - Research

**Researched:** 2026-03-11
**Domain:** React component architecture, Wireframe shell chrome (sidebar + header), blueprint config-driven rendering
**Confidence:** HIGH (all findings verified from direct codebase inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIDE-02 | Sidebar renderiza icones por item de menu via BlueprintScreen.icon | `BlueprintScreen.icon?: string` already exists; `getIconComponent()` from `IconPicker.tsx` already resolves string to LucideIcon; `ScreenManager` (non-edit branch) already renders `{Icon && <Icon className="h-4 w-4 shrink-0" />}`. This is already partially implemented — sidebar in WireframeViewer uses ScreenManager which handles icons. Verify rendering is wired correctly end-to-end. |
| SIDE-03 | Sidebar suporta groups/secoes com headings rotulados | `SidebarConfig` currently has only `footer?: string`. Must extend with `groups?: SidebarGroup[]` where `SidebarGroup = { label: string; screenIds: string[] }`. The sidebar rendering logic must partition screens by group and render a heading above each group. |
| SIDE-04 | Sidebar colapsa para icon-only rail mode | Collapse toggle adds `collapsed` boolean to sidebar state; in collapsed mode the `<aside>` shrinks from 240px to 56px, hiding text labels, showing only icons centered. The main `<main>` marginLeft adjusts from 240 to 56. |
| SIDE-05 | Sidebar items mostram badge/notification counts | `BlueprintScreen` needs optional `badge?: number \| string` field. SidebarConfig may define badge source. The ScreenManager renders a badge pill next to the label when value is truthy. |
| SIDE-06 | Sidebar renderiza footer text (versao/ambiente) | `SidebarConfig.footer?: string` is already defined in Phase 17. WireframeViewer already renders a footer div in the sidebar — it currently shows "Desenvolvido por FXL" hardcoded. Phase 18 replaces this with `config.sidebar?.footer ?? 'Desenvolvido por FXL'`. |
| SIDE-07 | Active screen highlighted na sidebar (preservado do existente) | Already implemented: `ScreenManager` uses `isActive={index === activeIndex}` with `bg-wf-sidebar-active text-wf-sidebar-fg` styling. No changes needed — must not regress. |
| HEAD-02 | Header exibe logo/brand do cliente | `branding.logoUrl` is available in WireframeViewer. `HeaderConfig` needs `showLogo?: boolean` (defaults true). Logo rendering currently lives in the sidebar header area (the 56px branding slot above the nav). Must move or duplicate to WireframeHeader. |
| HEAD-03 | Header mostra period selector (config-driven) | WireframeHeader already renders a period selector driven by `periodType` from `BlueprintScreen`. `HeaderConfig` needs `showPeriodSelector?: boolean` (defaults true). When false, the centered period selector is hidden. |
| HEAD-04 | Header mostra user/role indicator | `HeaderConfig` needs `showUserIndicator?: boolean`. WireframeViewer has access to Clerk `user` object. The indicator renders the user's name/role in a subtle chip on the right side of the header. |
| HEAD-05 | Header renderiza action buttons (manage, share, export) | WireframeHeader currently has `onGerenciar` prop that renders a single "Gerenciar" button. Must extend with `onShare?: () => void` and `onExport?: () => void` props, plus `HeaderConfig.actions?: { manage?: boolean; share?: boolean; export?: boolean }` to control which buttons appear. |
</phase_requirements>

---

## Summary

Phase 18 is a component evolution phase — it expands the schema types established in Phase 17 and wires new visual behaviors into the existing sidebar and header rendering infrastructure.

The most important discovery: **icons are already rendered in the sidebar** (via `ScreenManager` using `getIconComponent` from `IconPicker.tsx`). SIDE-02 is partially implemented — the planner must verify the full end-to-end path and ensure any regression from the existing implementation doesn't happen, but there is no new icon rendering logic to write.

The sidebar collapse (SIDE-04) is a pure UX pattern with no dependencies on new types: add `collapsed` state to `WireframeViewer`, pass it to the sidebar `<aside>`, narrow the width when true, and adjust `<main>` marginLeft. The collapse toggle button lives in the sidebar at the top (common SaaS pattern: a small chevron or hamburger icon).

The header logo (HEAD-02) requires a decision: the client logo currently lives in the sidebar's branding slot (56px div above the nav, lines 705-726 of WireframeViewer.tsx). For HEAD-02, the logo should move to the WireframeHeader left area and the sidebar branding slot can be removed or simplified. This is the biggest architectural decision in Phase 18.

Schema extensions are straightforward additive changes following the established Phase 17 pattern. The `SidebarConfig` and `HeaderConfig` types expand but stay backward-compatible (all new fields optional).

**Primary recommendation:** Decompose into 4 tasks — (1) extend SidebarConfig + HeaderConfig types/schemas + add BlueprintScreen.badge, (2) sidebar groups + footer text + icon verification, (3) sidebar collapse, (4) header logo/user/action buttons.

---

## Standard Stack

### Core (all already installed — zero new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x strict | Extend SidebarConfig, HeaderConfig, add badge to BlueprintScreen | Project-wide constraint |
| Zod | 3.x | Mirror new fields in SidebarConfigSchema, HeaderConfigSchema | Already used in blueprint-schema.ts |
| lucide-react | already installed | Icons in sidebar (already via getIconComponent) | 20 icons already mapped in IconPicker |
| React 18 | already installed | useState for collapse state, conditional rendering | Project stack |
| Tailwind CSS + wf tokens | already installed | Sidebar width transitions, active states | `wf-*` tokens cover all sidebar colors |

**Installation:** No new packages needed. Zero new npm dependencies (STATE.md decision confirmed).

---

## Architecture Patterns

### Recommended File Changes

```
tools/wireframe-builder/
├── types/blueprint.ts           <- Extend SidebarConfig, HeaderConfig, add badge to BlueprintScreen
├── lib/blueprint-schema.ts      <- Mirror type extensions in Zod schemas
└── components/
    ├── WireframeHeader.tsx       <- Add logo, user indicator, share/export action props
    └── (no new component files needed — changes are in-place)

src/pages/clients/
└── WireframeViewer.tsx          <- Collapse state, sidebar groups rendering, footer text,
                                    wire new header props
```

The `ScreenManager` component already handles icon rendering — it does NOT need changes for SIDE-02. The `ScreenManager` is for edit mode. In view mode (non-edit branch of ScreenManager), icons are rendered via `getIconComponent`. Groups are a WireframeViewer-level concern (the sidebar `<aside>` partitions screens into groups with headings above each group, passing group items to ScreenManager or rendering inline).

### Pattern 1: Type Extension (SIDE-02, SIDE-03, SIDE-05, HEAD-02 through HEAD-05)

**What:** Add optional fields to existing TypeScript types and Zod schemas.
**When to use:** Every Phase 18 schema change.

**SidebarConfig extension:**
```typescript
// types/blueprint.ts
export type SidebarGroup = {
  label: string       // heading text ("Financeiro", "Operacional", etc.)
  screenIds: string[] // which screens belong to this group (matched by BlueprintScreen.id)
}

export type SidebarConfig = {
  footer?: string        // already defined in Phase 17
  groups?: SidebarGroup[] // NEW — optional grouping of screens
}
```

**BlueprintScreen badge field:**
```typescript
// types/blueprint.ts
export type BlueprintScreen = {
  id: string
  title: string
  icon?: string
  badge?: number | string  // NEW — optional badge count/label
  periodType: PeriodType
  filters: FilterOption[]
  hasCompareSwitch: boolean
  sections: BlueprintSection[]
  rows?: ScreenRow[]
}
```

**HeaderConfig evolution:**
```typescript
// types/blueprint.ts
// HeaderConfig was Record<string, unknown> in Phase 17 — now defined explicitly
export type HeaderConfig = {
  showLogo?: boolean          // defaults true — shows branding.logoUrl in header left
  showPeriodSelector?: boolean // defaults true — shows period navigation in center
  showUserIndicator?: boolean  // defaults true — shows user name/role chip on right
  actions?: {
    manage?: boolean   // defaults true — shows Gerenciar button
    share?: boolean    // defaults true — shows Share button
    export?: boolean   // defaults false — shows Export button (future)
  }
}
```

**Zod schema mirrors:**
```typescript
// lib/blueprint-schema.ts
const SidebarGroupSchema = z.object({
  label: z.string(),
  screenIds: z.array(z.string()),
})

const SidebarConfigSchema = z.object({
  footer: z.string().optional(),
  groups: z.array(SidebarGroupSchema).optional(),  // NEW
})

// HeaderConfig: replace passthrough() with explicit shape
// Keep passthrough() for forward-compat until all Phase 18 fields confirmed stable
// OR: replace with explicit schema now that fields are known
const HeaderConfigSchema = z.object({
  showLogo: z.boolean().optional(),
  showPeriodSelector: z.boolean().optional(),
  showUserIndicator: z.boolean().optional(),
  actions: z.object({
    manage: z.boolean().optional(),
    share: z.boolean().optional(),
    export: z.boolean().optional(),
  }).optional(),
}).passthrough() // still passthrough for Phase 19/20 forward-compat
```

### Pattern 2: Sidebar Groups Rendering (SIDE-03)

**What:** WireframeViewer partitions `screens` array by `config.sidebar?.groups` and renders group headings in the sidebar.
**When to use:** When `sidebar.groups` is defined and non-empty.

**Partition logic (in WireframeViewer sidebar area):**
```typescript
// Derive grouped screens from config.sidebar?.groups
// If no groups defined, render all screens in a flat list (backward compat)
type ScreenGroup = {
  label: string | null  // null = ungrouped
  screens: { screen: BlueprintScreen; originalIndex: number }[]
}

function partitionScreensByGroups(
  screens: BlueprintScreen[],
  groups?: SidebarGroup[],
): ScreenGroup[] {
  if (!groups || groups.length === 0) {
    // No groups: single flat list with null label
    return [{ label: null, screens: screens.map((s, i) => ({ screen: s, originalIndex: i })) }]
  }

  const grouped: ScreenGroup[] = groups.map((g) => ({
    label: g.label,
    screens: g.screenIds
      .map((id) => {
        const idx = screens.findIndex((s) => s.id === id)
        return idx !== -1 ? { screen: screens[idx], originalIndex: idx } : null
      })
      .filter(Boolean) as { screen: BlueprintScreen; originalIndex: number }[],
  }))

  // Ungrouped screens (not in any group)
  const groupedIds = new Set(groups.flatMap((g) => g.screenIds))
  const ungrouped = screens
    .map((s, i) => ({ screen: s, originalIndex: i }))
    .filter(({ screen }) => !groupedIds.has(screen.id))

  if (ungrouped.length > 0) {
    grouped.push({ label: null, screens: ungrouped })
  }

  return grouped.filter((g) => g.screens.length > 0)
}
```

**Sidebar rendering with groups:**
```tsx
{partitionScreensByGroups(screens, activeConfig?.sidebar?.groups).map((group, gi) => (
  <div key={gi}>
    {group.label && (
      <div style={{
        padding: '8px 24px 4px',
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--wf-sidebar-muted)',
      }}>
        {group.label}
      </div>
    )}
    <ScreenManager
      screens={group.screens.map((s) => s.screen)}
      activeIndex={/* adjust for local group index */ group.screens.findIndex((s) => s.originalIndex === safeActiveIndex)}
      editMode={editMode.active}
      onSelectScreen={(localIdx) => handleScreenSelect(group.screens[localIdx].originalIndex)}
      // ...other handlers with originalIndex adjustment
    />
  </div>
))}
```

**WARNING:** Using ScreenManager per-group complicates the `onDeleteScreen`/`onRenameScreen`/`onReorderScreens` handlers since they work on the global screens array by index. The local index from ScreenManager must be mapped back to originalIndex. Consider rendering group headings inline within WireframeViewer and letting ScreenManager render items without being called per-group, or inline the screen items list when groups are defined.

### Pattern 3: Sidebar Collapse (SIDE-04)

**What:** Add `collapsed` boolean state to WireframeViewer, animate `<aside>` width, hide text labels.
**When to use:** When the user clicks a collapse toggle button in the sidebar.

```typescript
// In WireframeViewerInner
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 56

// Aside width
const asideWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

// Main marginLeft
<main style={{ flex: 1, marginLeft: asideWidth, ... }}>

// Aside
<aside style={{
  width: asideWidth,
  minWidth: asideWidth,
  transition: 'width 150ms ease',
  overflow: 'hidden',
  // ...rest unchanged
}}>
```

**Collapse button (top of sidebar nav, below branding div):**
```tsx
<button
  type="button"
  onClick={() => setSidebarCollapsed((c) => !c)}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
    padding: '8px 12px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: 'var(--wf-sidebar-muted)',
    cursor: 'pointer',
  }}
>
  {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
</button>
```

**In collapsed mode — ScreenManager items:** The `ScreenManager` renders icon + text. In collapsed mode, the text must be hidden. Options:
1. Pass `collapsed` prop to ScreenManager and conditionally render text
2. Use CSS overflow hidden on the sidebar (simpler — `overflow: hidden` + fixed width already clips text)

Option 2 (CSS clipping) is simpler and reliable: `overflow: hidden` on `<aside>` + icon-only layout falls naturally out of the width constraint. Icons at 16px + 24px padding = 40px minimum, fits within 56px collapsed rail.

**Issue with groups in collapsed mode:** Group headings (text labels) must also hide when collapsed. Apply `display: none` to heading labels when `sidebarCollapsed` is true.

### Pattern 4: Header Logo (HEAD-02)

**What:** WireframeHeader receives logo URL and renders it in the left area.
**When to use:** Always, unless `header.showLogo === false`.

**Current state:** The client logo lives in the sidebar branding slot (56px div at top of `<aside>`, lines 705-726 of WireframeViewer.tsx). It shows `branding.logoUrl` or "FXL" text fallback.

**Decision for Phase 18:** Move the logo from the sidebar branding slot to the WireframeHeader left area. The sidebar can display only the company name text (or nothing) after the logo moves.

**WireframeHeader props extension:**
```typescript
type Props = {
  title: string
  periodType?: PeriodType
  onGerenciar?: () => void
  // NEW
  logoUrl?: string                    // from branding.logoUrl
  brandLabel?: string                 // from config.label — fallback when no logo
  showLogo?: boolean                  // from config.header?.showLogo ?? true
  showPeriodSelector?: boolean        // from config.header?.showPeriodSelector ?? true
  showUserIndicator?: boolean         // from config.header?.showUserIndicator ?? true
  userDisplayName?: string            // from Clerk user
  userRole?: string                   // "Operador" default
  onShare?: () => void                // from config.header?.actions?.share ?? true
  onExport?: () => void               // from config.header?.actions?.export (optional)
}
```

**Header layout (left / center / right):**
```
[logo or brandLabel] ← flex:0     [period selector] ← absolute centered     [user chip + buttons] ← flex:1 justify-end
```

### Pattern 5: Badge Rendering (SIDE-05)

**What:** Screen items show a small pill badge with count when `screen.badge` is truthy.
**When to use:** Inline in ScreenManager's screen item rendering.

```tsx
{screen.badge !== undefined && (
  <span style={{
    marginLeft: 'auto',
    background: 'var(--wf-accent)',
    color: 'var(--wf-accent-fg)',
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 10,
    padding: '1px 6px',
    minWidth: 18,
    textAlign: 'center',
    lineHeight: '16px',
  }}>
    {screen.badge}
  </span>
)}
```

In collapsed mode: badge is hidden (text area clipped by overflow hidden).

### Anti-Patterns to Avoid

- **Creating a separate ScreenManagerWithGroups component:** The groups logic lives in WireframeViewer (the orchestrator). ScreenManager stays generic.
- **Duplicating logo rendering in both header and sidebar:** Pick one slot. Header is the correct place after Phase 17's layout restructure.
- **Using Tailwind transition classes for collapse animation:** WireframeViewer uses inline styles throughout. Use `transition: 'width 150ms ease'` in inline style, not Tailwind.
- **Changing ScreenManager to accept `collapsed` prop for text hiding:** The CSS overflow approach is simpler and sufficient for a 56px rail.
- **Making `badge` required in BlueprintScreen:** Must be optional — all existing blueprints in Supabase lack this field.
- **Removing the sidebar branding div entirely:** The 56px branding area at the top of the sidebar can remain but simplified (no logo, just config.label text or empty when logo is in header).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon resolution from string | Custom icon registry | `getIconComponent(screen.icon)` from `IconPicker.tsx` | Already implemented, 20 icons mapped |
| Sidebar width animation | JS-based animation loop | `transition: 'width 150ms ease'` on inline style | Browser CSS transition is sufficient |
| Badge pill styling | shadcn Badge component | Inline style with `--wf-accent` tokens | Must use wf tokens, not app theme |
| Logo fallback logic | Complex conditional | `branding.logoUrl ? <img> : <span>{config.label}</span>` | Already pattern in sidebar (lines 715-724) |
| Group partition logic | External library | Inline `Array.filter` + `findIndex` | Simple enough to write inline |

---

## Common Pitfalls

### Pitfall 1: ScreenManager index mismatch when groups are defined
**What goes wrong:** When screens are partitioned into groups and ScreenManager is called with a subset of screens, the `activeIndex` and `onSelectScreen` indices are local to the group, not global. Passing the wrong index causes the wrong screen to be highlighted or the wrong screen to activate on click.
**Why it happens:** `safeActiveIndex` is a global index into `screens[]`, but each group slice has its own local indices.
**How to avoid:** Map local group index to global original index explicitly. Use the `originalIndex` approach from Pattern 2 above.
**Warning signs:** Clicking a screen in group 2 activates the wrong screen, or the active highlight appears on the wrong item.

### Pitfall 2: Sidebar branding div height after logo move
**What goes wrong:** After moving logo to header, the 56px branding div at the top of the sidebar (with logo/FXL text) creates a dead zone. The sidebar content starts 56px lower than it should, wasting space.
**Why it happens:** The branding div was sized to align with the old header (before Phase 17). After Phase 17, the header is full-width above the sidebar, so the branding div inside the sidebar serves no alignment purpose.
**How to avoid:** After moving the logo to WireframeHeader, simplify or remove the sidebar branding div. The sidebar can start with the nav directly, or keep a smaller 36px branding strip with just text.
**Warning signs:** Large dead gap at the top of the sidebar below the header.

### Pitfall 3: Header center alignment breaks with logo + user chip
**What goes wrong:** The period selector is positioned with `position: absolute; left: 50%; transform: translateX(-50%)` in WireframeHeader. When a logo is added on the left and a user chip on the right, the centered selector can overlap these elements on narrow viewports.
**Why it happens:** Absolute positioning doesn't respect flex siblings.
**How to avoid:** Use a flex approach: `<div style={{ flex: 1 }}>{logo}</div>`, `<div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{periodSelector}</div>`, `<div style={{ flex: 1, justifyContent: 'flex-end' }}>{user + buttons}</div>`. The absolute centering is fine as long as left/right flex items are roughly equal width. If they diverge significantly, switch to `justify-content: center` on the header flex row and nest logo + center + actions in sub-divs.
**Warning signs:** Period selector overlapping logo or action buttons.

### Pitfall 4: Collapsed sidebar + edit mode conflict
**What goes wrong:** When sidebar is collapsed and user enters edit mode, the DnD reorder handles and rename inputs are hidden but still interactive, making edit mode UX broken.
**Why it happens:** Collapsed mode hides content via `overflow: hidden` + width constraint. The DnD sortable items still exist in the DOM.
**How to avoid:** Force sidebar to expand when `editMode.active === true`. Add `const effectiveSidebarCollapsed = sidebarCollapsed && !editMode.active` and use this derived value for rendering.
**Warning signs:** Edit mode toolbar appears but sidebar items are invisible, reorder handles can't be grabbed.

### Pitfall 5: HeaderConfig passthrough() striping fields after Phase 18
**What goes wrong:** If `HeaderConfigSchema` is changed from `passthrough()` to a strict object schema, existing blueprints stored in Supabase that have `header: { anyFutureField: 'x' }` would have those fields stripped on parse.
**Why it happens:** Zod strict() or default object() strips unknown keys.
**How to avoid:** Keep `.passthrough()` on `HeaderConfigSchema` even after adding explicit optional fields. The passthrough guard established in Phase 17 (and covered by the forward-compat test) must remain green.
**Warning signs:** Phase 17 test `accepts header: { anyFutureField: "x" }` failing after schema update.

### Pitfall 6: WireframeHeader receives branding but it's a Tailwind-free component
**What goes wrong:** WireframeHeader currently uses only inline styles + `var(--wf-*)` tokens. If `<img src={logoUrl}>` is added and its sizing uses Tailwind classes, there's a mixin of styling approaches that can cause inconsistency.
**Why it happens:** WireframeHeader is a wireframe component, not an app component — it deliberately avoids app-level Tailwind classes to stay self-contained.
**How to avoid:** Use inline styles for logo img: `style={{ maxHeight: 28, maxWidth: 100, objectFit: 'contain' }}`. Same pattern as the existing logo in the sidebar branding div (lines 716-720 of WireframeViewer.tsx).
**Warning signs:** Logo renders inconsistently between light/dark wireframe themes.

---

## Code Examples

Verified from direct codebase inspection:

### Current sidebar area in WireframeViewer.tsx (lines 690-749)
The sidebar is `position: fixed; left: 0; top: 56; height: calc(100vh - 56px); width: 240`.

```tsx
// Sidebar branding slot (lines 705-726) — logo lives here currently
<div style={{
  height: 56,
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  borderBottom: '1px solid var(--wf-sidebar-border)',
  flexShrink: 0,
}}>
  {branding.logoUrl ? (
    <img src={branding.logoUrl} alt={config.label}
      style={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' }} />
  ) : (
    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>FXL</span>
  )}
</div>

// Sidebar footer (lines 739-748) — hardcoded text, Phase 18 replaces with config.sidebar?.footer
<div style={{ padding: '16px 24px', borderTop: '1px solid var(--wf-sidebar-border)' }}>
  <span style={{ fontSize: 11, color: 'var(--wf-sidebar-muted)' }}>
    Desenvolvido por FXL   {/* Phase 18: replace with config.sidebar?.footer ?? 'Desenvolvido por FXL' */}
  </span>
</div>
```

### Current WireframeHeader.tsx signature
```typescript
type Props = {
  title: string
  periodType?: PeriodType
  onGerenciar?: () => void
}
// Renders: left (title) | center (period selector) | right (Gerenciar button if onGerenciar provided)
// Height: 56px, position: sticky, top: 0, zIndex: 10
```

### ScreenManager icon rendering (non-edit branch, lines 380-398)
```tsx
// Already renders icons from screen.icon:
const Icon = getIconComponent(screen.icon ?? 'layout-dashboard')
// ...
{Icon && <Icon className="h-4 w-4 shrink-0" />}
<span className="truncate">{screen.title}</span>
```
SIDE-02 is already implemented here. Verification task: ensure all screens in blueprints have the `icon` field set to a valid key, and confirm the existing rendering is visible in the live viewer.

### getIconComponent (IconPicker.tsx line 84-86)
```typescript
export function getIconComponent(name: string): LucideIcon | undefined {
  return ICON_MAP[name]
}
// Returns undefined for unrecognized names — safe, caller guards with {Icon && <Icon />}
```

### SidebarConfig current state (Phase 17 output)
```typescript
// types/blueprint.ts
export type SidebarConfig = {
  footer?: string  // version/environment text (Phase 18 extends further)
}

// blueprint-schema.ts
const SidebarConfigSchema = z.object({
  footer: z.string().optional(),
})
```

### HeaderConfig current state (Phase 17 output)
```typescript
// types/blueprint.ts
export type HeaderConfig = Record<string, unknown>

// blueprint-schema.ts
const HeaderConfigSchema = z.object({}).passthrough()
// Forward-compat test in blueprint-schema.test.ts (line 321):
// 'accepts header: { anyFutureField: "x" }' -- MUST REMAIN GREEN after Phase 18 changes
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Logo in sidebar branding slot | Logo moves to WireframeHeader left area | Phase 18 | Header is now the canonical brand anchor |
| Sidebar footer hardcoded "Desenvolvido por FXL" | Sidebar footer from `config.sidebar?.footer` | Phase 18 | SIDE-06 satisfied without new schema fields |
| Single flat screen list in sidebar | Grouped sections with labeled headings | Phase 18 | SIDE-03 satisfied with new SidebarGroup type |
| HeaderConfig = Record<string, unknown> | HeaderConfig with explicit optional fields | Phase 18 | HEAD-02 through HEAD-05 fully typed |
| Sidebar always expanded (240px) | Collapsible rail (56px collapsed, 240px expanded) | Phase 18 | SIDE-04 satisfied with state + CSS transition |

---

## Open Questions

1. **Logo placement: header left vs sidebar branding slot (HEAD-02)**
   - What we know: Logo currently renders in the sidebar branding div (56px slot above nav). WireframeHeader has `title` on the left. Phase 17 moved the header to full-width above the sidebar.
   - What's unclear: Should the logo move to WireframeHeader entirely, or should both header and sidebar branding area show the logo?
   - Recommendation: Move the logo to WireframeHeader left area (replacing the `h1 title` with logo+title combo). The sidebar branding div can be simplified (just show `config.label` text at small size, or removed entirely). This matches the standard SaaS pattern where the brand anchor is the top-left of the full-width header.

2. **Groups + ScreenManager interaction (SIDE-03)**
   - What we know: ScreenManager handles `onSelectScreen`, `onDeleteScreen`, `onRenameScreen`, `onReorderScreens` using global indices. Groups require local-to-global index mapping.
   - What's unclear: Whether to use ScreenManager per-group (with index mapping), or inline the screen button rendering in WireframeViewer when groups are defined (bypassing ScreenManager for non-edit mode).
   - Recommendation: In non-edit mode, inline the screen buttons with group headings in WireframeViewer directly. Only use ScreenManager in edit mode (which doesn't use groups — edit mode shows all screens in one flat sortable list). This avoids the index mapping complexity.

3. **Collapse + edit mode interaction (SIDE-04)**
   - What we know: Edit mode uses DnD sortable, which requires visible items.
   - Recommendation: `const effectiveSidebarCollapsed = sidebarCollapsed && !editMode.active` — auto-expand in edit mode.

4. **Collapsed sidebar badge rendering (SIDE-05)**
   - What we know: Badges are inline in the screen item row.
   - Recommendation: In collapsed mode, badges are not visible (overflow hidden clips them). This is acceptable — the collapsed rail is for navigation, not notifications. No special collapsed-badge treatment needed.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` |
| Full suite command | `npx vitest run` |

Current baseline: **244 tests passing** across 12 test files (verified 2026-03-11).

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIDE-02 | Icon renders for screen.icon field | manual-only | N/A — visual, ScreenManager already has code | N/A |
| SIDE-03 | SidebarConfigSchema accepts groups array | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Extend existing |
| SIDE-03 | groups: [] parses without error | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Extend existing |
| SIDE-04 | Sidebar collapse/expand | manual-only | N/A — visual state interaction | N/A |
| SIDE-05 | BlueprintScreenSchema accepts badge field | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Extend existing |
| SIDE-05 | badge renders as pill in sidebar | manual-only | N/A — visual | N/A |
| SIDE-06 | Sidebar footer shows config.sidebar?.footer | manual-only | N/A — visual | N/A |
| SIDE-07 | Active screen is highlighted | manual-only | N/A — existing behavior, regression guard | N/A |
| HEAD-02 | Logo renders in header from branding.logoUrl | manual-only | N/A — visual | N/A |
| HEAD-03 | Period selector hidden when showPeriodSelector: false | manual-only | N/A — visual | N/A |
| HEAD-04 | User indicator renders Clerk user name | manual-only | N/A — visual | N/A |
| HEAD-05 | HeaderConfigSchema accepts actions object | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Extend existing |
| HEAD-05 | Header forward-compat test remains green | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Existing test line 321 |

**Key automated tests to add to `blueprint-schema.test.ts`:**
1. `SidebarConfigSchema` accepts `{ footer: 'v1.0', groups: [{ label: 'Financeiro', screenIds: ['screen-1'] }] }` — SIDE-03
2. `SidebarConfigSchema` accepts `{ groups: [] }` — backward compat empty groups
3. `BlueprintScreenSchema` accepts `{ ...validScreen, badge: 3 }` — SIDE-05 number badge
4. `BlueprintScreenSchema` accepts `{ ...validScreen, badge: 'NEW' }` — SIDE-05 string badge
5. `BlueprintScreenSchema` accepts `{ ...validScreen }` (no badge, backward compat) — regression guard
6. `HeaderConfigSchema` accepts `{ showLogo: true, actions: { manage: true, share: false } }` — HEAD-02/05
7. Existing forward-compat test (line 321) still green — passthrough guard

### Sampling Rate
- **Per task commit:** `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green (244+) + `npx tsc --noEmit` before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all automated requirements. No new test files needed; extend `blueprint-schema.test.ts` with 7 new test cases as part of the schema task.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `tools/wireframe-builder/types/blueprint.ts` — SidebarConfig, HeaderConfig, BlueprintScreen current state after Phase 17
- Direct inspection of `tools/wireframe-builder/lib/blueprint-schema.ts` — Zod schemas current state, HeaderConfigSchema passthrough() confirmed
- Direct inspection of `src/pages/clients/WireframeViewer.tsx` — sidebar branding slot location, sidebar footer, collapse state absence, WireframeHeader wiring
- Direct inspection of `tools/wireframe-builder/components/WireframeHeader.tsx` — current Props type, layout structure (left title / center period / right buttons)
- Direct inspection of `tools/wireframe-builder/components/editor/ScreenManager.tsx` — icon rendering already implemented (line 94, 128, 381, 394)
- Direct inspection of `tools/wireframe-builder/components/editor/IconPicker.tsx` — getIconComponent function, 20 icon options
- Direct inspection of `tools/wireframe-builder/styles/wireframe-tokens.css` — sidebar/header tokens available
- Direct inspection of `tools/wireframe-builder/types/branding.ts` — logoUrl field confirmed
- Vitest run: **244 tests passing** (baseline confirmed 2026-03-11)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — v1.3 architectural decisions (zero new packages, dashboard-level config)
- `.planning/REQUIREMENTS.md` — requirement definitions for SIDE-02 through HEAD-05
- `.planning/ROADMAP.md` — phase dependencies and success criteria

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, all existing libraries
- Architecture: HIGH — verified by reading every relevant file; SidebarConfig/HeaderConfig current state confirmed, icon rendering already in ScreenManager confirmed
- Pitfalls: HIGH — group index mapping, logo placement, collapse+edit conflict are all directly derivable from the code
- Schema patterns: HIGH — Zod + TypeScript patterns verified from existing test suite and Phase 17 output

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable codebase, no fast-moving dependencies)
