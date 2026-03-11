# Phase 23: Sidebar & Header Chrome — Research

**Researched:** 2026-03-11
**Domain:** Wireframe dashboard chrome — dark sidebar nav + professional header
**Confidence:** HIGH

---

## Summary

Phase 23 is a **pure visual restyle** of two existing wireframe components: `WireframeSidebar.tsx` and `WireframeHeader.tsx`. No schema changes, no new logic, no new TypeScript types — the token foundation laid in Phase 22 already provides all the CSS variables needed. The task is to update component markup and class composition to match the v1.4 financial dashboard aesthetic.

The sidebar currently uses `bg-wf-sidebar` (resolves to `--wf-sidebar-bg: var(--wf-neutral-800)` / `#1e293b`) as background. The requirements upgrade the sidebar to **slate-900/950 dark** territory. After Phase 22, `--wf-sidebar-bg` in light mode still maps to `var(--wf-neutral-800)` — this needs to be updated to `#0f172a` (slate-900) in light mode and `#080e1a` / `#0a111d` for dark. The sidebar nav items, section group labels, status footer, header search input, notification icon, dark mode toggle, and user chip are all net-new or heavily reworked UI.

The `WireframeHeader.tsx` today renders: logo/brand left, period selector centered, empty right. Requirements add: search input (with icon), notification bell, dark mode toggle, and user chip (avatar + name + role). These are **static decorative elements** since the wireframe is a visualization prototype — they do not need functional state beyond the existing dark mode toggle.

**Primary recommendation:** Restyle both components in-place using Tailwind `wf-*` color classes (already mapped in `tailwind.config.ts`) plus inline styles where Tailwind class can't reach CSS vars. Sidebar gets full dark rebuild; header gets a right-side additions pass. No new types needed; no new CSS variables needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIDE-01 | Sidebar uses dark slate-900/950 background with slate-300/400 text | `--wf-sidebar-bg` token value must change in wireframe-tokens.css; component already uses `bg-wf-sidebar` + `text-wf-sidebar-fg` Tailwind classes — token value update propagates automatically |
| SIDE-02 | Active nav item uses primary/10 background with primary text color | Currently uses `bg-wf-sidebar-active` (= `--wf-accent` = full primary blue). Must change to `bg-wf-accent-muted` + `text-wf-accent` for primary/10 effect |
| SIDE-03 | Nav items have hover:bg-slate-800 hover:text-white transitions | ScreenManager's `hover:bg-wf-sidebar-active/10` needs upgrading; WireframeViewer's inline `onMouseEnter` handlers need CSS var update |
| SIDE-04 | Section group labels use 10px uppercase tracking-wider slate-500 style | WireframeViewer has this inline but at 10px/`0.06em`. Needs exact `text-[10px] font-semibold uppercase tracking-wider text-wf-sidebar-muted` |
| SIDE-05 | Sidebar footer shows status indicator (dot + label) in bordered card | Currently plain text (`Desenvolvido por FXL`). Needs a bordered `rounded-lg` card with `flex items-center gap-2`, a colored dot `div`, and a status label |
| HEAD-01 | Header uses white/slate-900 background with bottom border, 14-unit height | `WireframeHeader` already has `background: var(--wf-header-bg)` + `borderBottom`. Height currently `56px` — 14-unit = `h-14` = `56px`, already correct |
| HEAD-02 | Header search input with icon, styled as rounded-lg with slate-100/800 background | New element in header center/right. Uses `--wf-header-search-bg` token (already defined in Phase 22: `#f1f5f9` light / `#1e293b` dark) |
| HEAD-03 | Header right side has notification icon, dark mode toggle, and user chip | New elements: `Bell` (lucide), theme toggle button (from `useWireframeTheme`), user chip. All decorative static state |
| HEAD-04 | User chip displays name and role with right-aligned text and rounded-lg avatar | New compound element: avatar circle + two-line text block (name bold, role muted small) |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.x | Utility classes for layout and color | Project standard; `wf-*` colors already in tailwind.config.ts |
| lucide-react | current | Icons (Bell, Search, Moon/Sun) | Project standard; already imported throughout wireframe components |
| React | 18 | Component state | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `useWireframeTheme` | internal | Read/toggle wireframe dark/light theme | Dark mode toggle in header needs this hook |
| `cn` from `@/lib/utils` | internal | Conditional class merging | Sidebar nav item active/hover states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind `wf-*` classes | Inline `style` CSS vars | Tailwind classes are already mapped and tree-shaken; inline styles needed only where Tailwind opacity modifiers don't work with CSS var hex values |
| Static decorative user chip | Real Clerk user data | Phase 23 is wireframe chrome — static mock data is intentional and sufficient |

**No new npm packages needed.** All icons are in lucide-react. All color tokens are in wireframe-tokens.css.

---

## Architecture Patterns

### Where the Code Lives

The work touches **three files**:

```
tools/wireframe-builder/
├── styles/
│   └── wireframe-tokens.css        ← SIDE-01: sidebar token values update
├── components/
│   ├── WireframeSidebar.tsx        ← Used in SimpleSidebar context (not primary flow)
│   └── WireframeHeader.tsx         ← HEAD-01 thru HEAD-04: full header restyle
src/pages/
├── clients/
│   └── WireframeViewer.tsx         ← SIDE-01..05: sidebar inline styles restyle
└── SharedWireframeView.tsx         ← SIDE-01..05: sidebar inline styles restyle
```

**Note on sidebar implementation split:** The dark sidebar that users actually see in the viewer is **not `WireframeSidebar.tsx`** — it is rendered inline in `WireframeViewer.tsx` (lines 742–921) and `SharedWireframeView.tsx` (lines 370–440). `WireframeSidebar.tsx` is a simpler fallback used in the editor/gallery context. Phase 23 must address all three sites.

### Pattern 1: Token-Driven Color Update (SIDE-01)

**What:** The sidebar dark slate-900/950 background is achieved by updating `--wf-sidebar-bg` in `wireframe-tokens.css`.

**Current light mode value:**
```css
--wf-sidebar-bg: var(--wf-neutral-800);  /* #1e293b — slate-800 */
```

**Target light mode value:**
```css
--wf-sidebar-bg: #0f172a;  /* slate-900 — matches financial dashboard aesthetic */
```

Dark mode currently: `#0f172a` (already correct). No change needed for dark mode sidebar bg.

**Why:** All three sidebar render sites use `background: 'var(--wf-sidebar-bg)'` / `bg-wf-sidebar`. Updating the token propagates everywhere without touching component code.

### Pattern 2: Active Item Restyle (SIDE-02)

**What:** The active nav item currently uses full primary blue fill (`bg-wf-sidebar-active` = `--wf-accent`). The requirement is `primary/10 background + primary text` — a subtle tinted highlight.

**Current pattern (ScreenManager.tsx):**
```typescript
index === activeIndex
  ? 'bg-wf-sidebar-active text-wf-sidebar-fg'
  : 'text-wf-sidebar-muted hover:bg-wf-sidebar-active/10'
```

**Target pattern:**
```typescript
index === activeIndex
  ? 'bg-wf-accent-muted text-wf-accent font-medium'
  : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white'
```

**Why:** `--wf-accent-muted` = `color-mix(in srgb, var(--wf-accent) 12%, transparent)` — exactly the "primary/10" effect. The hover state upgrade (`hover:bg-slate-800 hover:text-white`) matches SIDE-03.

**Caution:** The inline `onMouseEnter`/`onMouseLeave` handlers in `WireframeViewer.tsx` also set `var(--wf-sidebar-active)` for hover. These must be changed to hardcoded `#1e293b` (slate-800) or the Tailwind approach must be used via className instead.

### Pattern 3: Sidebar Status Footer (SIDE-05)

**What:** Replace plain text footer with a bordered card containing a colored status dot + label.

**Target structure:**
```tsx
<div className="p-3 m-3 rounded-lg border border-wf-sidebar-border">
  <div className="flex items-center gap-2">
    <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
    <div>
      <p className="text-[10px] font-semibold text-wf-sidebar-fg leading-tight">Sistema Ativo</p>
      <p className="text-[10px] text-wf-sidebar-muted leading-tight">
        {sidebar?.footer ?? 'Desenvolvido por FXL'}
      </p>
    </div>
  </div>
</div>
```

**Note:** `bg-emerald-500` is a static Tailwind green — not a `--wf-*` token. This is a decorative status indicator; the color is fixed by design.

### Pattern 4: Header Right-Side Additions (HEAD-02 thru HEAD-04)

**What:** The header's right side is currently an empty `flex: 1` spacer. Replace with:
1. Search input (center or left of right zone)
2. Bell icon button (notification, decorative)
3. Dark mode toggle (functional — uses `useWireframeTheme`)
4. User chip (avatar + name + role, static mock data)

**Current WireframeHeader structure:**
```
[Left: logo/brand] [Center: period selector (absolute)] [Right: flex:1 spacer]
```

**Target WireframeHeader structure:**
```
[Left: logo/brand] [Center: search input] [Right: bell | theme-toggle | user-chip]
```

**Search input pattern (HEAD-02):**
```tsx
<div className="relative flex-1 max-w-xs mx-8">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wf-muted" />
  <input
    type="text"
    placeholder="Pesquisar..."
    className="w-full rounded-lg bg-wf-header-search-bg pl-9 pr-3 py-1.5 text-xs text-wf-body
               border-0 outline-none placeholder:text-wf-muted"
    readOnly
  />
</div>
```

**User chip pattern (HEAD-04):**
```tsx
<div className="flex items-center gap-2">
  <div className="text-right">
    <p className="text-xs font-semibold text-wf-heading leading-tight">Operador FXL</p>
    <p className="text-[10px] text-wf-muted leading-tight">Analista</p>
  </div>
  <div className="h-8 w-8 rounded-lg bg-wf-accent flex items-center justify-center flex-shrink-0">
    <span className="text-xs font-bold text-wf-accent-fg">OF</span>
  </div>
</div>
```

**Dark mode toggle in header (HEAD-03):**
```tsx
// WireframeHeader must import useWireframeTheme and expose toggle
const { theme, toggle } = useWireframeTheme()
<button onClick={toggle} className="p-1.5 rounded-lg hover:bg-wf-accent-muted text-wf-muted hover:text-wf-accent">
  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
</button>
```

**Important:** `WireframeHeader` currently does NOT import `useWireframeTheme`. It must be added. The hook is already used in `SharedWireframeView.tsx` and `WireframeViewer.tsx`. Moving the toggle into the header itself is cleaner architecture — but the callers currently render their own floating toggle. The floating `SharedThemeToggle` in `SharedWireframeView.tsx` should be **removed** once the toggle is in the header.

### Pattern 5: WireframeSidebar.tsx Alignment (SIDE-01 thru SIDE-04)

**What:** `WireframeSidebar.tsx` is the simpler component used in the editor/gallery context. It also needs the active state restyle (SIDE-02/03) to match:

```typescript
// Current:
screen.active
  ? 'bg-wf-sidebar-active font-medium text-wf-sidebar-fg'
  : 'text-wf-sidebar-muted hover:bg-wf-sidebar-active/10 hover:text-wf-sidebar-fg'

// Target:
screen.active
  ? 'bg-wf-accent-muted font-medium text-wf-accent'
  : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white'
```

### Anti-Patterns to Avoid

- **Hardcoding colors instead of using tokens:** The sidebar background must come from `--wf-sidebar-bg` so dark mode works. Only use hardcoded Tailwind utilities (like `bg-emerald-500` for the status dot) when the color is purely decorative and not theme-sensitive.
- **Adding inline `onMouseEnter`/`onMouseLeave` for hover states:** WireframeViewer.tsx already has this pattern for the collapsed-mode buttons. In the expanded nav, switch to Tailwind classes (`hover:bg-slate-800`) which are cleaner. For the inline-style sections that cannot use Tailwind, keep the `onMouseEnter` pattern but update the values.
- **Using Tailwind opacity modifiers on CSS var hex colors:** `bg-wf-sidebar-active/10` works because `--wf-sidebar-active` is `--wf-accent` which is a hex value. But `bg-wf-sidebar/10` would fail if `--wf-sidebar-bg` is a hex — use `bg-wf-accent-muted` (which uses `color-mix`) instead.
- **Functional search/notifications:** The header search input and bell icon are **decorative** — `readOnly`, no handlers, no state. This is intentional wireframe prototype behavior.
- **Adding shadcn portal-based components inside wireframe:** Confirmed project decision: do not use shadcn Select, Dialog inside wireframe components. The user chip and notification are static elements — no popovers needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status dot color for sidebar footer | Custom CSS color system | `bg-emerald-500` (Tailwind) | Single decorative element, no theme sensitivity needed |
| Dark mode toggle state | New React state in WireframeHeader | `useWireframeTheme()` hook | Hook already exists, connected to WireframeThemeProvider |
| Icon components | SVG inline | `lucide-react` (Bell, Search, Moon, Sun) | Already in project, tree-shaken |
| Search input styling | Custom CSS | `bg-wf-header-search-bg` token | Already defined in Phase 22 (TOK-04) |

---

## Common Pitfalls

### Pitfall 1: The Sidebar Is Not in WireframeSidebar.tsx

**What goes wrong:** Developer modifies `WireframeSidebar.tsx` but the production sidebar is the inline `<aside>` in `WireframeViewer.tsx` and `SharedWireframeView.tsx`. The actual rendered sidebar has completely different markup.

**Why it happens:** The component name implies it is the single source of the sidebar. It is not — it is used in a simpler context (editor/component gallery).

**How to avoid:** Phase 23 must touch all three files: `WireframeSidebar.tsx` (for gallery/editor), `WireframeViewer.tsx` (main viewer sidebar), `SharedWireframeView.tsx` (client share view sidebar).

**Warning signs:** Making changes and seeing no visual difference in the WireframeViewer — check the inline `<aside>` block starting at line 742 in WireframeViewer.tsx.

### Pitfall 2: Active State Uses Wrong Token

**What goes wrong:** Using `bg-wf-sidebar-active` for the primary/10 active state. `--wf-sidebar-active` = `--wf-accent` = full primary blue (`#1152d4`). The requirement is a subtle tinted highlight, not a solid fill.

**Why it happens:** The existing class is named "active" so it seems correct.

**How to avoid:** Use `bg-wf-accent-muted` (= `color-mix(in srgb, var(--wf-accent) 12%, transparent)`) + `text-wf-accent` for the active state.

### Pitfall 3: Tailwind Opacity Modifier Breaks with Hex CSS Vars

**What goes wrong:** Writing `hover:bg-wf-sidebar/20` to get a semi-transparent hover. This fails if the CSS var resolves to a hex color — Tailwind's opacity modifier mechanism requires RGB channel access.

**Why it happens:** Tailwind opacity modifiers work with `hsl()` or `rgb()` vars by appending `/ opacity`. Hex CSS vars break this.

**How to avoid:** Use `color-mix()`-based tokens (already defined as `--wf-accent-muted`) or use `hover:bg-slate-800` (hardcoded Tailwind slate) for hover states where the token approach fails.

### Pitfall 4: WireframeHeader Doesn't Have useWireframeTheme

**What goes wrong:** Adding a dark mode toggle to `WireframeHeader.tsx` but forgetting to import `useWireframeTheme`. The component needs to be inside `WireframeThemeProvider` context for the hook to work.

**Why it happens:** The toggle currently lives outside the header (floating button in parent).

**How to avoid:** `WireframeHeader` is always rendered inside `WireframeThemeProvider` (both in `WireframeViewer.tsx` and `SharedWireframeView.tsx`). Import and call `useWireframeTheme()` inside `WireframeHeader`. After this, remove the floating `SharedThemeToggle` from `SharedWireframeView.tsx`.

### Pitfall 5: Sidebar Text Colors in Inline Styles vs Tailwind

**What goes wrong:** WireframeViewer.tsx renders its sidebar nav using inline `style` objects (not Tailwind classes) for the button states. Updating Tailwind classes has no effect on these.

**Why it happens:** The inline styles were written before the wf-* Tailwind aliases existed.

**How to avoid:** For the expanded sidebar nav in `WireframeViewer.tsx`, the grouped screen buttons are rendered inline (lines 840–870). Update the `background` and `color` values in both the style object and the `onMouseEnter`/`onMouseLeave` handlers. Target values: inactive = `color: 'var(--wf-sidebar-muted)'`, hover = `background: '#1e293b', color: '#fff'`, active = `background: 'var(--wf-accent-muted)', color: 'var(--wf-accent)'`.

---

## Code Examples

### Token update — wireframe-tokens.css

```css
/* Light mode: upgrade sidebar to slate-900 */
[data-wf-theme="light"] {
  /* BEFORE: --wf-sidebar-bg: var(--wf-neutral-800); */
  --wf-sidebar-bg: #0f172a;  /* slate-900 — dark financial dashboard */
  --wf-sidebar-fg: var(--wf-neutral-300);   /* slate-300 — SIDE-01 */
  --wf-sidebar-muted: var(--wf-neutral-500); /* slate-500 — SIDE-04 labels */
  /* --wf-sidebar-border, --wf-sidebar-active remain unchanged */
}

/* Dark mode sidebar already at #0f172a — no change needed */
```

### ScreenManager.tsx — nav item classes (SIDE-02, SIDE-03)

```typescript
// In SortableScreenItem and the non-edit button list:
className={cn(
  'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
  isActive
    ? 'bg-wf-accent-muted text-wf-accent font-medium'
    : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white'
)}
```

### WireframeSidebar.tsx — nav item classes (SIDE-02, SIDE-03)

```typescript
className={cn(
  'flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs transition-colors',
  screen.active
    ? 'bg-wf-accent-muted font-medium text-wf-accent'
    : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white',
)}
```

### Sidebar section group label (SIDE-04) — already nearly correct

```tsx
/* In WireframeViewer.tsx, replace the inline group label style block */
<p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-wf-sidebar-muted">
  {group.label}
</p>
```

### Sidebar footer card (SIDE-05)

```tsx
{!effectiveSidebarCollapsed && (
  <div className="p-3 m-3 rounded-lg border border-wf-sidebar-border flex-shrink-0">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-wf-sidebar-fg leading-tight truncate">
          Sistema Ativo
        </p>
        <p className="text-[10px] text-wf-sidebar-muted leading-tight truncate">
          {activeConfig?.sidebar?.footer ?? 'Desenvolvido por FXL'}
        </p>
      </div>
    </div>
  </div>
)}
```

### WireframeHeader.tsx — full right-side additions (HEAD-02 thru HEAD-04)

```tsx
import { Search, Bell, Moon, Sun } from 'lucide-react'
import { useWireframeTheme } from '@tools/wireframe-builder/lib/wireframe-theme'

// Inside WireframeHeader component:
const { theme, toggle } = useWireframeTheme()

// Replace the current right spacer <div style={{ flex: 1 }} /> with:
<>
  {/* Center: search input (HEAD-02) */}
  <div className="relative flex-1 max-w-xs mx-8">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wf-muted pointer-events-none" />
    <input
      type="text"
      placeholder="Pesquisar..."
      readOnly
      className="w-full rounded-lg pl-9 pr-3 py-1.5 text-xs text-wf-body placeholder:text-wf-muted outline-none border-0"
      style={{ background: 'var(--wf-header-search-bg)' }}
    />
  </div>

  {/* Right: actions (HEAD-03) */}
  <div className="flex items-center gap-2 flex-shrink-0">
    {/* Notification bell */}
    <button
      type="button"
      className="p-1.5 rounded-lg text-wf-muted hover:text-wf-heading hover:bg-wf-accent-muted transition-colors"
    >
      <Bell className="h-4 w-4" />
    </button>

    {/* Dark mode toggle */}
    <button
      type="button"
      onClick={toggle}
      className="p-1.5 rounded-lg text-wf-muted hover:text-wf-heading hover:bg-wf-accent-muted transition-colors"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>

    {/* Divider */}
    <div className="h-5 w-px bg-wf-border mx-1" />

    {/* User chip (HEAD-04) */}
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className="text-xs font-semibold text-wf-heading leading-tight">Operador FXL</p>
        <p className="text-[10px] text-wf-muted leading-tight">Analista</p>
      </div>
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)' }}
      >
        <span className="text-xs font-bold">OF</span>
      </div>
    </div>
  </div>
</>
```

### WireframeHeader.tsx — layout restructure needed

The current header uses `style` objects. The period selector uses `position: absolute; left: 50%`. With the new right-side additions, the header needs a proper 3-column flex layout:

```tsx
<header style={{ height: 56, background: 'var(--wf-header-bg)', borderBottom: '1px solid var(--wf-header-border)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
  {/* Left: logo/brand — flex-shrink-0, fixed width */}
  <div style={{ flexShrink: 0, width: 200 }}>...</div>

  {/* Center: search (flex: 1) */}
  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
    {/* search input */}
  </div>

  {/* Right: icons + user chip — flex-shrink-0 */}
  <div style={{ flexShrink: 0 }}>
    {/* bell, toggle, user chip */}
  </div>
</header>
```

**Note:** The period selector moves from an absolute-centered div to being integrated into the left section or removed from the chrome header (it belongs in the filter bar per v1.4 design intent). However, removing it changes behavior — keep it hidden in the header and let the filter bar (Phase 26) handle period selection. For Phase 23, replace the period selector in the header with the search input.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain sidebar footer text | Bordered status card with colored dot | Phase 23 | More professional; visual status indicator |
| Full-primary active nav item | primary/10 tinted active item | Phase 23 | Subtler highlight, matches financial SaaS conventions |
| Empty header right side | Search + notification + toggle + user chip | Phase 23 | Professional financial dashboard chrome |
| `WireframeSidebar.tsx` as main sidebar | Inline `<aside>` in WireframeViewer/SharedWireframeView | v1.3 (historical) | WireframeSidebar.tsx is secondary; real sidebar is inline |
| Floating theme toggle (fixed positioned) | Theme toggle integrated in header | Phase 23 | Cleaner — not overlapping content, expected position |

---

## Open Questions

1. **Period selector in header after Phase 23**
   - What we know: Current `WireframeHeader` renders a period navigator in the center. Phase 23 puts search in the center.
   - What's unclear: Should the period selector be completely removed from the header in Phase 23, or hidden/deferred to Phase 26 (Filter Bar)?
   - Recommendation: Remove period selector from the header chrome in Phase 23 (it overlaps with the new search input position). The period selector will live in the filter bar (Phase 26). If needed, the `periodType` prop on `BlueprintScreen` still exists and WireframeFilterBar already handles period display.

2. **SharedWireframeView floating toggle cleanup**
   - What we know: `SharedWireframeView.tsx` renders a `SharedThemeToggle` as a fixed-positioned button at `top: 16, right: 16`.
   - What's unclear: Should it be removed in Phase 23 once the toggle is in the header?
   - Recommendation: Yes — remove the floating `SharedThemeToggle` when the dark mode toggle is added to `WireframeHeader`. The toggle in the header serves both viewer contexts.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tools/` |
| Full suite command | `npx vitest run` |
| Type check command | `npx tsc --noEmit` (required gate) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIDE-01 | Sidebar bg is dark slate | manual-only | n/a — visual CSS token change | n/a |
| SIDE-02 | Active item uses primary/10 bg | manual-only | n/a — visual CSS class change | n/a |
| SIDE-03 | Hover transitions on nav items | manual-only | n/a — interactive CSS | n/a |
| SIDE-04 | Group labels at 10px uppercase | manual-only | n/a — visual typography | n/a |
| SIDE-05 | Status footer card renders | manual-only | n/a — visual structure | n/a |
| HEAD-01 | Header has correct height and border | manual-only | n/a — visual CSS | n/a |
| HEAD-02 | Search input renders with icon | manual-only | n/a — visual structure | n/a |
| HEAD-03 | Bell, toggle, user chip render | manual-only | n/a — visual structure | n/a |
| HEAD-04 | User chip has avatar + name + role | manual-only | n/a — visual structure | n/a |

**Note:** Phase 23 is a pure visual restyle of React components. All requirements are verified by visual inspection (`make dev` → open wireframe viewer → check each element). TypeScript compliance (`npx tsc --noEmit`) is the automated gate.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (zero errors required)
- **Per wave merge:** `npx vitest run` (no regressions in 270 existing tests)
- **Phase gate:** Visual inspection checklist + `npx tsc --noEmit` green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. Phase 23 has no logic changes that need unit tests; type compliance is the only automated check.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection: `tools/wireframe-builder/components/WireframeSidebar.tsx` — confirmed current class patterns and active state logic
- Direct code inspection: `tools/wireframe-builder/components/WireframeHeader.tsx` — confirmed current structure and missing right-side elements
- Direct code inspection: `src/pages/clients/WireframeViewer.tsx` (lines 742–921) — confirmed inline sidebar implementation is the primary sidebar
- Direct code inspection: `src/pages/SharedWireframeView.tsx` (lines 370–440) — confirmed secondary sidebar implementation
- Direct code inspection: `tools/wireframe-builder/styles/wireframe-tokens.css` — confirmed Phase 22 token values and what needs updating for SIDE-01
- Direct code inspection: `tailwind.config.ts` (lines 64–97) — confirmed all `wf-*` Tailwind aliases present
- Direct code inspection: `tools/wireframe-builder/components/editor/ScreenManager.tsx` — confirmed Tailwind class pattern for nav items (to be updated)
- Direct code inspection: `.planning/REQUIREMENTS.md` — source of truth for SIDE-01..05, HEAD-01..04 specifications

### Secondary (MEDIUM confidence)

- `.planning/STATE.md` accumulated decisions — confirmed "never rename --wf-* tokens, change values only", "no shadcn portal components inside wireframe"
- `.planning/PROJECT.md` key decisions — confirmed "color-mix(in srgb) for semi-transparent fills" pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, no new dependencies
- Architecture: HIGH — direct code inspection of all affected files, no speculation
- Token values: HIGH — wireframe-tokens.css inspected, exact hex values confirmed
- Component patterns: HIGH — actual class/style patterns read from source
- Pitfalls: HIGH — derived from direct inspection of inline style handlers and component split

**Research date:** 2026-03-11
**Valid until:** Stable — 30 days (React, Tailwind, internal tokens don't change)
