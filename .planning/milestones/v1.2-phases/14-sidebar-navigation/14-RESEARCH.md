# Phase 14: Sidebar Navigation - Research

**Researched:** 2026-03-10
**Domain:** CSS sticky sidebar with collapsible navigation, visual hierarchy, and independent scroll -- React + Tailwind CSS 3
**Confidence:** HIGH

## Summary

Phase 14 transforms the sidebar from a basic flex-column navigation list into a polished, sticky-positioned navigation rail with clear visual hierarchy. The current sidebar (Sidebar.tsx, 289 lines) already has the correct data structure (`navigation: NavItem[]`), correct routing (`NavLink` with `useLocation`), and correct collapse/expand logic (`hasActiveChild`, `useState` for open/close). The phase is purely a CSS/class restyling -- zero logic changes to the navigation tree, data model, or routing behavior.

The critical architectural change is making the sidebar sticky with its own independent scroll container. Phase 13 removed `overflow-hidden` from Layout.tsx, which is the prerequisite for CSS `position: sticky` to work. The sidebar must now add `sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto` to stay fixed while the page content scrolls via the viewport. This is the exact pattern from the reference HTML. The user has explicitly stated that sidebar scroll must be INDEPENDENT from page scroll -- the sidebar must not move when the main content scrolls.

The visual changes follow the reference HTML precisely: `bg-slate-50/50` background, `border-r border-slate-200` right border, uppercase bold section headers, `border-l` left-border nav rail with indigo-600 active state, `space-y-8` between sections, and consistent `pl-4` indentation for sub-items. The active state shifts from `bg-primary/10 text-primary` (background tint) to a left-border indicator (`border-l-2 border-indigo-600 text-indigo-600 font-medium`).

**Primary recommendation:** Restyle Sidebar.tsx classes to match reference HTML. Add sticky positioning with independent scroll. Do NOT change the navigation data array, collapse/expand logic, or routing -- only CSS classes change.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Sidebar uses bg-slate-50/50 with border-r and sticky positioning | Sticky positioning pattern (Pattern 1): `sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`, `bg-slate-50/50`, `border-r border-slate-200`. Reference HTML line 67 matches exactly. |
| NAV-02 | Section headers are uppercase, xs, bold, tracking-wider, text-slate-900 | Reference HTML line 76: `text-xs font-bold uppercase tracking-wider text-slate-900`. Current sidebar already has `uppercase tracking-[0.18em]` -- needs `font-bold` and explicit `text-slate-900`. Section spacing changes from `space-y-1` to `space-y-8`. |
| NAV-03 | Nav items have border-l left border with indigo-600 active state | Reference HTML lines 77-78: `border-l border-slate-200 ml-1 pl-4` on item lists. Active item: `text-indigo-600 font-medium` (reference line 83). Active indicator via border-l-2 on active item. |
| NAV-04 | Collapsible sections show chevron icon with expand/collapse | Already implemented in current Sidebar.tsx (lines 204-210, 243-244). Chevron uses `ChevronDown`/`ChevronRight` from lucide-react. Only needs class alignment (keep existing logic). Reference HTML line 85 shows chevron SVG on expandable items. |
| NAV-05 | Sub-items indent with pl-4 under parent with consistent spacing | Reference HTML line 87: `mt-3 space-y-2 pl-4`. Current depth-based indentation (pl-5, pl-8, pl-11, pl-14) needs simplification to consistent pl-4 offsets relative to parent. |
</phase_requirements>

## Standard Stack

### Core

No new packages. Phase 14 is pure CSS class changes on an existing component.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | 18.x | Component framework | Existing stack |
| Tailwind CSS 3 | 3.x | Utility-first styling | Existing stack |
| react-router-dom | 6.x | NavLink for active state detection | Existing stack |
| lucide-react | existing | ChevronDown, ChevronRight, Home icons | Already imported in Sidebar.tsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @/lib/utils (cn) | existing | Conditional class merging | Already used throughout Sidebar.tsx |
| @/components/ui/separator | existing | Visual separator between Home and sections | Already used in Sidebar.tsx |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind `border-l-2` for active indicator | CSS pseudo-element `::before` | Tailwind class is simpler, matches reference HTML pattern. Pseudo-element would allow animation but adds complexity for no visual gain. |
| `sticky top-16` hardcoded | CSS custom property `top-[var(--header-h)]` | Hardcoded is acceptable since header height (h-16/64px) is locked by Phase 13 and documented. Custom property adds indirection for a value that rarely changes. |
| Keeping `bg-sidebar/80 backdrop-blur` | `bg-slate-50/50` without blur | Reference HTML uses `bg-slate-50/50` with no backdrop-blur on sidebar. The blur was a Phase 12-era artifact. Remove it to match reference. |

## Architecture Patterns

### Recommended Structure (files changed)

```
src/
  components/
    layout/
      Sidebar.tsx        # ONLY file changed -- CSS classes only, no logic changes
```

### Pattern 1: Sticky Sidebar with Independent Scroll (NAV-01)

**What:** The sidebar uses `position: sticky` to stay fixed in the viewport while the main content scrolls. The sidebar has its own `overflow-y-auto` for scrolling long navigation lists independently.

**Prerequisite (completed in Phase 13):** Layout.tsx has NO `overflow-hidden` or `overflow-y-auto` on any ancestor of the sidebar. The viewport/document body is the sole scroll context.

**Current sidebar container (Sidebar.tsx line 262):**
```tsx
<aside className="w-full flex-shrink-0 border-b border-sidebar-border bg-sidebar/80 backdrop-blur md:w-64 md:border-b-0 md:border-r">
  <nav className="max-h-72 overflow-y-auto p-4 md:max-h-none md:space-y-1">
```

**Target sidebar container (from reference HTML line 67):**
```tsx
<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-6 md:block">
  <nav className="space-y-8">
```

**Key changes:**
- `sticky top-16`: sticks 64px from top (below header h-16)
- `h-[calc(100vh-4rem)]`: fills remaining viewport height
- `overflow-y-auto`: sidebar has its own scroll for long nav trees
- `hidden md:block`: hidden on mobile (mobile drawer is out of scope for v1.2)
- `shrink-0`: prevents sidebar from shrinking in flex layout
- `bg-slate-50/50`: subtle light background with 50% opacity
- `border-r border-slate-200`: explicit right border
- `p-6`: more generous padding (was `p-4`)
- Removed: `backdrop-blur`, `bg-sidebar/80`, `border-b`, `border-sidebar-border`
- Removed from nav: `max-h-72`, `max-h-none` breakpoint overrides (sticky + h-calc handles this)

**Why this works:** With viewport-level scrolling (Phase 13), the sidebar's nearest scrolling ancestor is the document body. `position: sticky` pins the sidebar at `top: 64px` while the body scrolls. The sidebar's own `overflow-y-auto` creates an internal scroll context for the navigation list only -- completely independent from the page scroll.

### Pattern 2: Section Header Styling (NAV-02)

**What:** Top-level navigation sections (Processo, Padroes, Ferramentas, Clientes) render as uppercase, bold, small-text headers that are visually distinct from clickable nav items.

**Reference HTML (line 76):**
```html
<h5 class="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">PROCESSO</h5>
```

**Current sidebar (depth === 0 parent nodes):**
```tsx
'text-left text-xs font-semibold uppercase tracking-[0.18em] text-foreground'
```

**Target classes for depth === 0:**
```tsx
'mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-sidebar-foreground'
```

**Changes:**
- `font-semibold` -> `font-bold`
- `tracking-[0.18em]` -> `tracking-wider` (standard Tailwind utility, approximately the same)
- `text-foreground` -> `text-slate-900 dark:text-sidebar-foreground` (explicit light mode, token fallback for dark)
- Add `mb-4` for spacing below header before item list
- Section groups use `space-y-8` between them (currently `mb-4`)

### Pattern 3: Left-Border Navigation Rail (NAV-03)

**What:** Nav items are arranged along a left border line. The active item is indicated by an indigo left border and indigo text, not a background tint.

**Reference HTML (lines 77-78, 83):**
```html
<ul class="space-y-3 border-l border-slate-200 ml-1 pl-4 text-sm">
  <li><a class="block text-slate-500 hover:text-indigo-600" href="#">Visao Geral</a></li>
  <!-- active item -->
  <button class="flex w-full items-center justify-between text-indigo-600 font-medium">
```

**Current active state (Sidebar.tsx line 163-165):**
```tsx
isActive
  ? 'bg-primary/10 text-primary font-medium'
  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
```

**Target active state:**
```tsx
isActive
  ? '-ml-px border-l-2 border-indigo-600 text-indigo-600 font-medium dark:border-sidebar-accent dark:text-sidebar-accent'
  : 'text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent'
```

**Item list wrapper (children container at depth > 0):**
```tsx
// Add border-l rail to the list container
'space-y-3 border-l border-slate-200 ml-1 pl-4 dark:border-sidebar-border'
```

**The `-ml-px` trick:** The active item's `border-l-2` needs to visually overlap the parent list's `border-l border-slate-200`. By applying `-ml-px` (negative margin-left 1px), the active item's indigo border sits exactly on top of the slate border, creating the "highlighted segment" effect seen in the reference.

### Pattern 4: Collapsible Sections with Chevron (NAV-04)

**What:** Parent items with children show a chevron icon that toggles expand/collapse. This is already implemented -- only styling needs alignment.

**Current behavior (correct, no changes):**
- `useState` initializes `open` based on `childIsActive`
- `useEffect` auto-opens when a child becomes active
- Depth-0 sections are always open (no chevron)
- Depth > 0 parents show ChevronDown/ChevronRight

**Styling changes for chevron button:**
```tsx
// Current
'px-2 py-1.5 text-muted-foreground hover:text-foreground'

// Target
'px-2 py-1.5 text-slate-400 hover:text-slate-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-foreground'
```

**Chevron size stays:** `h-3 w-3` matches reference HTML SVG size.

### Pattern 5: Sub-Item Indentation (NAV-05)

**What:** Sub-items are indented under their parent with consistent `pl-4` spacing. The reference uses a single `pl-4` level for all children.

**Current depth-based indentation (Sidebar.tsx):**
```tsx
depth === 1 && 'pl-5',
depth === 2 && 'pl-8',
depth === 3 && 'pl-11',
depth >= 4 && 'pl-14',
```

**Target: relative indentation via the list container, not per-item:**

The reference HTML uses `pl-4` on the `<ul>` container, not on individual items. This means each nesting level adds another `pl-4` naturally. The current approach of hardcoding per-depth padding works but is less maintainable.

**Recommended approach:** Move the indentation to the children container `<div>` instead of individual leaf items:
```tsx
// Children container (depth > 0)
<div className={cn(
  'space-y-2 border-l border-slate-200 ml-1 pl-4',
  'dark:border-sidebar-border',
  depth === 0 && 'mt-2 space-y-3'
)}>
```

Then leaf items need NO depth-specific padding -- the container handles it:
```tsx
// Leaf nav item (all depths)
<NavLink className={({ isActive }) =>
  cn(
    'block text-sm transition-colors',
    isActive
      ? '-ml-px border-l-2 border-indigo-600 pl-[15px] text-indigo-600 font-medium'
      : 'text-slate-500 hover:text-indigo-600',
  )
}>
```

Note: when active item has `border-l-2` (2px), the `pl-4` (16px) on the container minus `-ml-px` (1px) leaves 15px. Using `pl-[15px]` on the active item ensures text alignment stays consistent with inactive items that have `pl-0` inside the `pl-4` container.

### Anti-Patterns to Avoid

- **Using `position: fixed` instead of `sticky` for the sidebar:** Fixed removes the sidebar from document flow, requiring manual width management and breaking the flex layout. Sticky keeps it in flow.
- **Adding `overflow-hidden` back to Layout.tsx:** Phase 13 explicitly removed it. Re-adding it kills sticky positioning for both sidebar and TOC.
- **Changing the `navigation` data array:** The data structure is correct. Only CSS classes change. Do not restructure the NavItem tree.
- **Hardcoding colors without dark mode fallbacks:** Use explicit light mode classes with `dark:` variants. The reference HTML is light-mode only -- dark mode needs explicit attention.
- **Using semantic tokens (`text-primary`, `bg-sidebar`) for the border-l active indicator:** The reference uses explicit `text-indigo-600` and `border-indigo-600`. Since this is a decorative accent (not a semantic action), explicit colors are acceptable. Use `dark:text-sidebar-accent` for dark mode.
- **Removing the Home link or Separator:** The Home link with icon and the separator below it are part of the current design and the reference. Keep them, just restyle.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Independent sidebar scroll | JS-based scroll locking/syncing | CSS `overflow-y-auto` on the sticky sidebar container | Pure CSS, zero JS, works natively with sticky positioning |
| Active state detection | Custom pathname matching logic | React Router's `NavLink` `isActive` callback (already used) | Built-in, handles exact vs partial matching, no edge cases |
| Auto-expand on active child | Manual state management across sections | Current `hasActiveChild` + `useEffect` pattern (already implemented) | Already working correctly, handles deep nesting |
| Left-border active indicator | Custom absolute-positioned element | Tailwind `border-l-2` with `-ml-px` overlap technique | One class, no extra DOM elements, reference HTML uses this pattern |

## Common Pitfalls

### Pitfall 1: Sidebar Scrolls With Page Content

**What goes wrong:** The sidebar moves up when the user scrolls the main content, defeating the purpose of having it fixed.
**Why it happens:** Missing `sticky top-16` or an `overflow-hidden` ancestor between the sidebar and the viewport.
**How to avoid:** Verify Layout.tsx has NO `overflow-hidden` on any ancestor of the sidebar (Phase 13 already removed it). Add `sticky top-16` to the aside element. Test by scrolling a long doc page -- the sidebar must stay fixed.
**Warning signs:** Sidebar disappears when scrolling down on long pages.

### Pitfall 2: Sidebar Height Exceeds Viewport Without Internal Scroll

**What goes wrong:** The sidebar content (many nav items) extends below the viewport, and the overflow is clipped or hidden.
**Why it happens:** Missing `h-[calc(100vh-4rem)]` or `overflow-y-auto` on the sidebar container.
**How to avoid:** Both properties must be set together: `h-[calc(100vh-4rem)]` caps the sidebar height to the viewport minus the header, and `overflow-y-auto` enables internal scrolling when content exceeds that height.
**Warning signs:** Bottom nav items (Clientes section) are cut off and unreachable.

### Pitfall 3: Active Border Misaligned with Rail Border

**What goes wrong:** The active item's indigo left border appears next to (not on top of) the section's slate border, creating a double-border appearance.
**Why it happens:** The active border-l-2 and the container's border-l are at different horizontal positions.
**How to avoid:** Use `-ml-px` on the active item to shift its left border 1px to the left, overlapping the container's border-l. Adjust padding to compensate: active items use `pl-[15px]` (16px container padding - 1px overlap).
**Warning signs:** Two parallel left borders visible on the active item -- one slate, one indigo.

### Pitfall 4: Dark Mode Text Becomes Invisible

**What goes wrong:** Using explicit `text-slate-500` and `text-slate-900` without dark mode counterparts causes text to be invisible or low-contrast in dark mode.
**Why it happens:** The reference HTML has no dark mode. Developers copy classes verbatim without adding `dark:` variants.
**How to avoid:** For every explicit color class, add a `dark:` variant using the sidebar token system (`dark:text-sidebar-foreground`, `dark:text-sidebar-muted-foreground`, `dark:border-sidebar-border`). The sidebar tokens are already defined in globals.css.
**Warning signs:** Nav items disappear or become unreadable when dark mode is toggled.

### Pitfall 5: Mobile Layout Breaks After Adding `hidden md:block`

**What goes wrong:** On mobile viewports, the sidebar disappears entirely and there is no way to navigate.
**Why it happens:** Adding `hidden md:block` hides the sidebar on small screens. The current design had a full-width top bar on mobile (`w-full md:w-64`).
**How to avoid:** This is expected and acceptable for v1.2. Mobile sidebar drawer is explicitly out of scope (see REQUIREMENTS.md "Out of Scope"). The header search (Cmd+K) provides navigation on mobile. Document this as a known limitation.
**Warning signs:** This is intentional, not a bug. Mobile users use search to navigate.

## Code Examples

### Sidebar.tsx Container (Target)

```tsx
// Source: Reference HTML line 67 + Phase 13 architecture (sticky positioning stack)
<aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50/50 p-6 md:block dark:border-sidebar-border dark:bg-sidebar">
  <nav className="space-y-8">
    {/* Home link */}
    {/* Separator */}
    {/* Navigation sections */}
  </nav>
</aside>
```

### Home Link (Target)

```tsx
// Source: Reference HTML line 70-73
<NavLink
  to="/"
  className={({ isActive }) =>
    cn(
      'flex items-center gap-2 text-sm font-medium transition-colors',
      isActive
        ? 'text-indigo-600 dark:text-sidebar-accent'
        : 'text-slate-600 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
    )
  }
>
  <Home className="h-4 w-4" />
  Home
</NavLink>
```

### Section Header (depth === 0, Target)

```tsx
// Source: Reference HTML line 76, 101
<h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-sidebar-foreground">
  {item.label}
</h5>
```

Note: The reference uses an `<h5>` element. In the React component, this can remain a `<div>` or `<button>` with the same classes. The semantic element is not important here since nav structure is conveyed by `<nav>` and `<ul>`/`<li>` hierarchy.

### Nav Item List Container (depth > 0, Target)

```tsx
// Source: Reference HTML line 77
<ul className="space-y-3 border-l border-slate-200 ml-1 pl-4 text-sm dark:border-sidebar-border">
  {item.children.map((child) => (
    <NavSection key={child.label} item={child} depth={depth + 1} />
  ))}
</ul>
```

### Leaf Nav Item (Target)

```tsx
// Source: Reference HTML lines 78-79, 93
<NavLink
  to={item.href}
  className={({ isActive }) =>
    cn(
      'block text-sm transition-colors',
      isActive
        ? '-ml-px border-l-2 border-indigo-600 pl-[15px] font-medium text-indigo-600 dark:border-sidebar-accent dark:text-sidebar-accent'
        : 'text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
    )
  }
>
  {item.label}
</NavLink>
```

### Expandable Parent Item (depth > 0, with href, Target)

```tsx
// Source: Reference HTML lines 83-86
<div className="flex items-center justify-between">
  <NavLink
    to={item.href}
    className={({ isActive }) =>
      cn(
        'flex-1 truncate text-sm transition-colors',
        isActive
          ? 'font-medium text-indigo-600 dark:text-sidebar-accent'
          : 'text-slate-500 hover:text-indigo-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-accent',
        childIsActive && !isActive && 'text-slate-700 dark:text-sidebar-foreground',
      )
    }
  >
    {item.label}
  </NavLink>
  <button
    type="button"
    onClick={() => setOpen((c) => !c)}
    className="p-1 text-slate-400 hover:text-slate-600 dark:text-sidebar-muted-foreground dark:hover:text-sidebar-foreground"
  >
    {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
  </button>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `bg-primary/10` background tint for active nav | `border-l-2` left border indicator | Standard in modern doc sites (Stripe, Tailwind, shadcn, Nextra) | Cleaner visual hierarchy, less visual noise |
| Depth-specific padding (`pl-5`, `pl-8`, `pl-11`) | Container-level `pl-4` with nested `border-l` | Modern sidebar pattern uses recursive indentation via container | Simpler code, automatic nesting via CSS |
| Sidebar in flex flow (scrolls with page) | `position: sticky` with independent scroll | Standard since CSS sticky became reliable (2020+) | Sidebar always visible, content scrolls independently |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (existing) |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

Phase 14 changes are purely visual/CSS (class restyling of an existing component). The requirements map to visual verification, not automated unit tests.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | Sidebar sticky with bg-slate-50/50 and independent scroll | manual-only | Visual: scroll long page, sidebar stays fixed; scroll sidebar independently | N/A |
| NAV-02 | Section headers uppercase, xs, bold, tracking-wider | manual-only | Visual: inspect section headers (PROCESSO, PADROES, etc.) for correct typography | N/A |
| NAV-03 | Active nav item shows indigo left border and text | manual-only | Visual: navigate to a doc page, verify active item has indigo border-l | N/A |
| NAV-04 | Collapsible sections with chevron toggle | manual-only | Visual: click chevron on Fases or Tech Radar, verify expand/collapse | N/A |
| NAV-05 | Sub-items indented with pl-4 under parent | manual-only | Visual: inspect nesting levels for consistent indentation | N/A |

**Justification for manual-only:** All changes are CSS class modifications on an existing component. Unit tests cannot verify sticky positioning, visual hierarchy, or independent scroll behavior. These require browser rendering. The TypeScript compilation gate (`npx tsc --noEmit`) ensures no type errors are introduced.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (TypeScript compilation gate)
- **Per wave merge:** `npx vitest run` (existing tests must not regress)
- **Phase gate:** Full suite green + visual verification of all 4 success criteria

### Wave 0 Gaps
None -- no new test files needed. The phase gate is TypeScript compilation (`npx tsc --noEmit` must pass) plus visual verification of the 4 success criteria. Existing tests must continue passing.

## Open Questions

1. **Home link icon sizing**
   - What we know: Current Home link uses `h-3.5 w-3.5`. Reference HTML uses `h-4 w-4`.
   - What's unclear: Whether to match reference exactly or keep current size.
   - Recommendation: Use `h-4 w-4` to match reference. Minor visual difference.

2. **Separator between Home and sections**
   - What we know: Current sidebar has a `<Separator />` between Home link and section groups. Reference HTML has no explicit separator -- the `space-y-8` between sections provides visual separation.
   - What's unclear: Whether to keep the separator or remove it.
   - Recommendation: Keep the separator. It provides a clear visual boundary between the Home link and the navigation tree. The reference may omit it because it uses a different spacing approach, but the separator adds clarity.

3. **Text size: text-xs vs text-sm for nav items**
   - What we know: Current items use `text-xs`. Reference HTML uses `text-sm` for items and `text-xs` for section headers.
   - What's unclear: Whether to upgrade all items to `text-sm`.
   - Recommendation: Use `text-sm` for nav items (matching reference). Keep `text-xs` for section headers only. This creates the visual hierarchy difference that NAV-02 requires.

## Sources

### Primary (HIGH confidence)
- **Reference HTML:** `.planning/research/visual-redesign-reference.html` -- lines 66-118, exact sidebar structure with classes
- **Codebase analysis:** `src/components/layout/Sidebar.tsx` -- current implementation (289 lines), navigation data structure, collapse/expand logic
- **Codebase analysis:** `src/components/layout/Layout.tsx` -- current flex layout (Phase 13 state, no overflow-hidden)
- **Codebase analysis:** `src/components/layout/TopNav.tsx` -- header height h-16 (64px) confirmed
- **Codebase analysis:** `src/styles/globals.css` -- sidebar CSS tokens (--sidebar, --sidebar-foreground, --sidebar-accent, --sidebar-border, --sidebar-muted, --sidebar-muted-foreground)
- **Phase 13 Summary:** `.planning/phases/13-layout-shell/13-01-SUMMARY.md` -- confirmed viewport-level scrolling, no overflow-hidden ancestors
- **Architecture Research:** `.planning/research/ARCHITECTURE.md` -- Pattern 2 (sticky positioning stack), Integration 4 (sidebar navigation data structure)

### Secondary (MEDIUM confidence)
- **MDN position: sticky:** Overflow ancestor requirement verified in Phase 13 research
- **Pitfalls Research:** `.planning/research/PITFALLS.md` -- Pitfall 2 (sticky scroll conflict), verified as resolved by Phase 13

### Tertiary (LOW confidence)
- None -- all findings verified against codebase and reference HTML

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, pure CSS class changes on existing component
- Architecture: HIGH -- sticky positioning prerequisites verified by Phase 13 execution; reference HTML provides exact class targets
- Pitfalls: HIGH -- all pitfalls identified from actual codebase analysis and Phase 13 architectural context; dark mode concern based on explicit reference HTML being light-only

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no version-sensitive dependencies in this phase)
