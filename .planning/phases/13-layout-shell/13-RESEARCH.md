# Phase 13: Layout Shell - Research

**Researched:** 2026-03-10
**Domain:** CSS layout architecture -- sticky positioning, scroll context, viewport-level scrolling, frosted glass header
**Confidence:** HIGH

## Summary

Phase 13 transforms the app's geometric shell: the header, scroll context, and column layout. This is the structural prerequisite for Phases 14-16 -- sidebar sticky positioning, TOC positioning, and all downstream component placement depend on the decisions made here.

The current Layout.tsx uses `overflow-hidden` on the flex parent and `overflow-y-auto` on `<main>`, creating a nested scroll container. This architecture prevents CSS `position: sticky` from working on the sidebar and TOC relative to the viewport. The phase must remove both overflow properties, making the document body the single scroll context. The header changes from h-14 (56px) to h-16 (64px), which cascades to every `top-*` offset used by sticky elements in subsequent phases.

The scope is deliberately narrow: 3 component files modified (Layout.tsx, TopNav.tsx, SearchCommand.tsx), plus a small CSS addition (scrollbar-gutter, scroll-margin-top) in globals.css. No new components are created. The search bar changes from a small button trigger to a wider input-styled trigger, but the CommandDialog logic is completely untouched. A scroll-to-top effect on route navigation is added via a small ScrollToTop component in Layout.

**Primary recommendation:** Remove `overflow-hidden` and `overflow-y-auto` from Layout.tsx simultaneously, set viewport as the sole scroll context, add `scrollbar-gutter: stable` to `html` to prevent dialog-induced header shift, and add a ScrollToTop component that resets `window.scrollTo(0,0)` on pathname change.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYOUT-01 | Header uses sticky top-0 with backdrop-blur-md and bg-white/80 | Sticky positioning stack pattern (Pattern 2), header height change from h-14 to h-16, z-50, frosted glass classes from reference HTML |
| LAYOUT-02 | Header shows brand "Nucleo FXL" with "FXL-CORE" subtitle | Current TopNav already has this; styling refinement to match reference (text-sm font-bold tracking-tight for brand, text-[10px] tracking-widest for subtitle) |
| LAYOUT-03 | Search bar integrated in header with Cmd+K shortcut badge | Decorative search trigger pattern (Pattern 4) -- styled div/button that looks like an input but opens existing CommandDialog |
| LAYOUT-04 | Three-column layout enabled (sidebar + content + TOC) | Width constraint delegation pattern (Pattern 3) -- remove max-w-4xl from Layout, let pages own their width; scrollbar-gutter: stable on html to prevent dialog shift |
| LAYOUT-05 | Scroll context uses document body (remove nested overflow-y-auto) | Scroll context change (Pattern 1) -- remove overflow-hidden and overflow-y-auto, add ScrollToTop component for navigation reset |
</phase_requirements>

## Standard Stack

### Core

No new packages. Phase 13 is pure layout CSS and minor component refactoring.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | 18.x | Component framework | Existing stack |
| Tailwind CSS 3 | 3.x | Utility-first styling | Existing stack |
| react-router-dom | 6.x | Navigation, useLocation for scroll reset | Existing stack |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | existing | Search icon for search trigger | Already used in SearchCommand |
| cmdk + @radix-ui/react-dialog | existing | CommandDialog for search | NOT CHANGED -- only the trigger button changes |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `scrollbar-gutter: stable` | JS-based scrollbar compensation | `scrollbar-gutter` is CSS-only, zero JS, broad browser support (Chrome 94+, Firefox 97+, Safari 17.4+). JS alternative is fragile and more code. |
| ScrollToTop component | react-router ScrollRestoration | ScrollRestoration is for browser back/forward only. We need explicit reset-to-top on every navigation. Custom component is 8 lines and precise. |
| Removing overflow-hidden | Keeping overflow-hidden + using position:fixed sidebar | Fixed positioning removes elements from flow, requires manual width/spacing. Sticky is simpler and matches the reference HTML. |

## Architecture Patterns

### Recommended Structure (files changed)

```
src/
  components/
    layout/
      Layout.tsx          # Remove overflow-hidden, overflow-y-auto, max-w-4xl wrapper
      TopNav.tsx           # h-16, bg-white/80, backdrop-blur-md, z-50
      SearchCommand.tsx    # Input-styled trigger (visual only)
      ScrollToTop.tsx      # NEW: 8-line component, scrollTo(0,0) on pathname change
  styles/
    globals.css            # Add scrollbar-gutter: stable, scroll-margin-top for headings
```

### Pattern 1: Viewport Scroll Context (LAYOUT-05)

**What:** Remove nested scroll containers so the document body is the single scroll context. This is the prerequisite for CSS `position: sticky` to work correctly on sidebar and TOC in later phases.

**Current state (broken for sticky):**
```
div.flex.min-h-screen (no overflow)
  TopNav (sticky top-0 -- works, no overflow ancestor)
  div.flex.flex-1.overflow-hidden  <-- KILLS sticky for children
    Sidebar (not sticky, just in flex flow)
    main.overflow-y-auto  <-- NESTED SCROLL, content scrolls here
      max-w-4xl wrapper
        <Outlet />
```

**Target state (sticky-ready):**
```
div.flex.min-h-screen (no overflow)
  TopNav (sticky top-0 z-50 -- works)
  div.flex.flex-1  <-- NO overflow-hidden
    Sidebar (will be sticky top-16 in Phase 14)
    main.flex-1.min-w-0  <-- NO overflow-y-auto, NO max-w
      <Outlet />  <-- pages own their own max-width
```

**Implementation:**
```tsx
// Layout.tsx -- BEFORE
<div className="flex min-h-screen flex-col bg-background">
  <TopNav />
  <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
        <Outlet />
      </div>
    </main>
  </div>
</div>

// Layout.tsx -- AFTER
<div className="flex min-h-screen flex-col bg-background">
  <TopNav />
  <div className="flex flex-1">
    <Sidebar />
    <main className="min-w-0 flex-1 px-8 py-10 lg:px-12">
      <Outlet />
    </main>
  </div>
  <ScrollToTop />
</div>
```

**Why `min-w-0` on main:** In flexbox, the default `min-width: auto` can cause flex children to overflow when content (like code blocks or long tables) is wider than available space. `min-w-0` allows the flex item to shrink below its content size, preventing horizontal overflow.

### Pattern 2: Sticky Positioning Stack (LAYOUT-01)

**What:** The header is `sticky top-0 z-50`. In Phase 14, sidebar will be `sticky top-16`. In Phase 15, TOC will be `sticky top-16`. All three coordinate via the header height.

**Header implementation (TopNav.tsx):**
```tsx
// TopNav.tsx -- BEFORE
<header className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center justify-between
  border-b border-border/80 bg-background/90 px-4 backdrop-blur md:px-6">

// TopNav.tsx -- AFTER
<header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between
  border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-border dark:bg-background/80">
```

Key changes:
- `h-14` -> `h-16` (56px -> 64px): matches reference HTML
- `z-20` -> `z-50`: ensures header stays above all content and modals overlay
- `border-border/80` -> `border-slate-200`: explicit light mode border per reference
- `bg-background/90` -> `bg-white/80`: pure white frosted glass effect in light mode
- `backdrop-blur` -> `backdrop-blur-md`: stronger blur (12px vs 8px)
- `dark:bg-background/80`: maintains dark mode with semantic token

### Pattern 3: Width Constraint Delegation (LAYOUT-04)

**What:** Remove the `max-w-4xl` wrapper from Layout.tsx. Each page component decides its own width.

**Why:** DocRenderer needs `max-w-4xl` content PLUS a `w-64` TOC alongside it. The Layout's `max-w-4xl` (896px) cannot contain both. Home might want `max-w-5xl`. Client pages might want `max-w-4xl`. Delegating width to each page is the correct architecture.

**Impact:** Every page rendered inside `<Outlet />` currently inherits `max-w-4xl` from Layout. After removing it, each page must add its own width constraint or it will be full-width.

Pages needing `mx-auto max-w-4xl` wrapper:
- `DocRenderer.tsx` -- already has its own flex container with `min-w-0 flex-1`, just needs max-w on the content column
- `Home.tsx` -- wrap in `mx-auto max-w-5xl` (wider for cards grid)
- `FinanceiroIndex.tsx` -- wrap in `mx-auto max-w-4xl`
- `FinanceiroDocViewer.tsx` -- wrap in `mx-auto max-w-4xl`
- `BriefingForm.tsx` -- verify existing width
- `BlueprintTextView.tsx` -- verify existing width
- `ComponentGallery.tsx` -- verify existing width
- `ProcessDocsViewer.tsx` -- verify existing width

### Pattern 4: Decorative Search Trigger (LAYOUT-03)

**What:** The search bar in the header looks like a text input but is a button that opens the existing CommandDialog.

**Current:** Small button `[icon] Pesquisar docs... [Cmd+K]` width: 192px (w-48)
**Target:** Wider input-styled element matching reference HTML

```tsx
// SearchCommand.tsx -- trigger only, CommandDialog UNCHANGED
<button
  onClick={() => setOpen(true)}
  className="relative flex w-full max-w-sm items-center rounded-md border border-slate-200
    bg-slate-50 py-1.5 pl-10 pr-12 text-sm text-slate-400 transition-colors
    hover:bg-slate-100 dark:border-border dark:bg-muted/50 dark:text-muted-foreground"
>
  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400
    dark:text-muted-foreground" />
  <span>Pesquisar docs...</span>
  <kbd className="absolute right-2 hidden rounded border border-slate-300 bg-white px-1.5
    font-sans text-[10px] font-medium text-slate-400 sm:inline-block
    dark:border-border dark:bg-muted dark:text-muted-foreground">
    Cmd+K
  </kbd>
</button>
```

### Pattern 5: ScrollToTop on Navigation (LAYOUT-05)

**What:** A small component that calls `window.scrollTo(0, 0)` whenever the route pathname changes.

**Why needed:** With viewport-level scrolling (after removing `overflow-y-auto` from main), scroll position persists between page navigations. Without explicit reset, navigating from a long doc page to another page starts the new page mid-scroll.

```tsx
// src/components/layout/ScrollToTop.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```

**Placement:** Inside Layout.tsx, as a sibling of the flex container. It renders nothing -- pure side effect.

### Anti-Patterns to Avoid

- **Moving TOC into Layout:** Only doc pages have TOC. Adding TOC awareness to Layout couples it to doc rendering. Keep TOC inside DocRenderer (it already is).
- **Using position:fixed instead of sticky for header:** Fixed removes element from flow, requiring manual padding-top on the flex container. Sticky keeps it in flow and handles everything automatically.
- **Rebuilding search infrastructure:** The visual change is a trigger restyle. Do NOT replace CommandDialog with inline search.
- **Adding `overflow-hidden` back "to fix mobile":** This kills sticky positioning. If mobile sidebar overflows, hide it with `hidden md:block` instead.
- **Hardcoding `top-16` instead of using the header height:** While `top-16` (4rem = 64px = h-16) is correct now, consider that future header changes would require grep-and-replace. Acceptable for this phase since the header height is locked.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-to-top on navigation | Manual scroll tracking with refs | `useEffect` + `window.scrollTo` on pathname change | 8 lines, zero edge cases, works with viewport scrolling |
| Scrollbar compensation for dialogs | JS-based padding-right calculation | `scrollbar-gutter: stable` CSS property | One line of CSS, handles all scrollbar cases, no JS needed |
| Input-styled search trigger | Real inline search with dropdown | Styled button that opens existing CommandDialog | CommandDialog already has grouped results, keyboard nav, fuzzy matching |
| Responsive sidebar hiding | Complex media query + drawer system | `hidden md:block` on sidebar | Current mobile sidebar (full-width at top) replaced with simple hide; mobile drawer is out of scope for v1.2 |

## Common Pitfalls

### Pitfall 1: Removing overflow-hidden Without Removing overflow-y-auto

**What goes wrong:** Removing `overflow-hidden` from the flex parent but leaving `overflow-y-auto` on `<main>` creates a state where the body scrolls AND main scrolls independently. Content ends up scrollable in two contexts, causing confusing double-scrollbar behavior.
**Why it happens:** Developer removes one overflow property thinking that alone enables sticky, then stops because "it works now."
**How to avoid:** Remove BOTH `overflow-hidden` (from flex parent) AND `overflow-y-auto` (from main) in the same commit. Verify with a long page that only one scrollbar appears (the document body scrollbar).
**Warning signs:** Two scrollbars visible, one on the browser window and one on the main area.

### Pitfall 2: Forgetting to Add Width Wrappers to Existing Pages

**What goes wrong:** After removing `max-w-4xl` from Layout.tsx, all page content stretches to full viewport width. Doc pages, client pages, and Home all look broken because content fills the entire available space.
**Why it happens:** The change to Layout.tsx is small (removing a wrapper), but every page previously relied on that wrapper for width constraint.
**How to avoid:** Before removing the wrapper from Layout, audit all pages rendered via `<Outlet />`. Add `mx-auto max-w-*` to each page component. Test every page after the Layout change.
**Warning signs:** Content stretches edge-to-edge; tables, text, and cards are uncomfortably wide.

### Pitfall 3: Dialog Scroll Lock Causes Header Shift (Radix)

**What goes wrong:** Opening the Cmd+K search dialog (or any Radix Dialog/Sheet) triggers `react-remove-scroll`, which adds `overflow: hidden` and `padding-right` to the body. The sticky header does not receive the same padding-right, so it shifts left by the scrollbar width (~15px).
**Why it happens:** `react-remove-scroll` cannot automatically compensate for `position: sticky` or `position: fixed` elements.
**How to avoid:** Add `scrollbar-gutter: stable` to the `html` element in globals.css. This permanently reserves space for the scrollbar, so removing it causes no layout shift.
**Warning signs:** Header "jumps" horizontally when opening Cmd+K search or any modal. More visible on Windows (non-overlay scrollbar).

### Pitfall 4: Scroll Position Not Resetting on Navigation

**What goes wrong:** After switching to viewport-level scrolling, navigating between pages preserves the scroll position. If a user scrolls to the bottom of a long doc page and clicks a sidebar link, the new page starts mid-scroll instead of at the top.
**Why it happens:** With the previous `overflow-y-auto` on main, React Router's re-render effectively reset the scroll because the main element was re-rendered or had its own scroll context. With viewport scrolling, the browser scroll position persists.
**How to avoid:** Add a ScrollToTop component that calls `window.scrollTo(0, 0)` on pathname change.
**Warning signs:** Navigating to a new page shows content from the middle of the page instead of the top.

### Pitfall 5: Header Height Change Breaks Downstream Sticky Offsets

**What goes wrong:** Changing from h-14 (56px) to h-16 (64px) breaks the TOC's `sticky top-8` and IntersectionObserver `rootMargin: '-80px ...'` values. The TOC sticks at the wrong position and highlights the wrong heading.
**Why it happens:** The TOC in DocTableOfContents.tsx uses hardcoded sticky/rootMargin values that implicitly depend on the header height.
**How to avoid:** This phase changes the header height. Phase 14 and 15 will set sidebar and TOC sticky offsets. Document the header height (64px / 4rem / top-16) clearly in the research so downstream phases use the correct values.
**Warning signs:** After Phase 13, TOC may appear slightly misaligned until Phase 15 fixes its sticky offset. This is expected and acceptable -- the TOC will be redesigned in Phase 15.

## Code Examples

### Layout.tsx Complete Target

```tsx
// Source: Codebase analysis + reference HTML architecture
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 px-8 py-10 lg:px-12">
          <Outlet />
        </main>
      </div>
      <ScrollToTop />
    </div>
  )
}
```

### TopNav.tsx Header Changes

```tsx
// Source: Reference HTML header structure
<header className="sticky top-0 z-50 flex h-16 flex-shrink-0 items-center justify-between
  border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md
  dark:border-border dark:bg-background/80">
  <Link to="/" className="flex items-center gap-4">
    <div className="flex flex-col">
      <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-foreground">
        Nucleo FXL
      </span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
        FXL-CORE
      </span>
    </div>
  </Link>
  <div className="flex flex-1 items-center justify-end gap-4 px-8">
    <SearchCommand />
    <ThemeToggle />
  </div>
</header>
```

Note: The reference HTML does not include the FXL logo block (rounded-lg bg-primary square with "FXL" text). The current TopNav has it. The decision of whether to keep or remove the logo block is at the implementor's discretion -- both work. The reference focuses on text-only brand identity.

### globals.css Additions

```css
/* Source: MDN scrollbar-gutter, Radix UI discussions */
html {
  scrollbar-gutter: stable;
}

/* Heading scroll offset for sticky header (64px + 16px buffer) */
h2[id], h3[id] {
  scroll-margin-top: 5rem; /* 80px */
}
```

### ScrollToTop.tsx (new file)

```tsx
// Source: Standard React Router pattern
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `overflow-y-auto` on main for isolated scrolling | Viewport-level scrolling for sticky support | Standard since CSS sticky became reliable (2020+) | Enables proper sticky sidebar + TOC |
| `scrollbar-width` + custom scrollbar JS | `scrollbar-gutter: stable` | CSS spec stabilized 2022-2023 | One-line CSS replaces JS scrollbar compensation |
| JS-based scroll position reset | `useEffect` on `useLocation().pathname` | React Router v6 standard | Clean, declarative, no refs |
| Nested scroll containers with overflow | Single viewport scroll + sticky elements | Modern doc sites (Tailwind, shadcn, Stripe) | Simpler mental model, better UX |

**Browser support for scrollbar-gutter:**
- Chrome 94+ (Sept 2021)
- Firefox 97+ (Feb 2022)
- Safari 17.4+ (Mar 2024)
- All evergreen browsers supported. No polyfill needed for FXL Core (internal tool).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (existing) |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

Phase 13 changes are primarily visual/layout (CSS classes, scroll behavior). The requirements map to visual verification more than automated unit tests.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYOUT-01 | Header sticky with backdrop-blur | manual-only | Visual inspection: scroll long page, header stays visible | N/A |
| LAYOUT-02 | Brand name + subtitle in header | manual-only | Visual inspection: verify text content | N/A |
| LAYOUT-03 | Search bar with Cmd+K badge | manual-only | Visual inspection + keyboard test: Cmd+K opens dialog | N/A |
| LAYOUT-04 | Three-column layout without nested scroll | manual-only | Visual inspection: verify single scrollbar, no inner scroll | N/A |
| LAYOUT-05 | Viewport scroll + position reset on nav | manual-only | Visual inspection: navigate between pages, verify scroll resets | N/A |

**Justification for manual-only:** Layout changes affect CSS positioning and visual rendering. Unit tests cannot verify sticky positioning, backdrop-blur visibility, or scroll behavior. These require browser rendering. The existing vitest setup uses `environment: 'node'` (not jsdom/happy-dom), which cannot test DOM layout behavior.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (TypeScript compilation gate)
- **Per wave merge:** `npx vitest run` (existing 237 tests must not regress)
- **Phase gate:** Full suite green + visual verification of all 5 success criteria

### Wave 0 Gaps
None -- no new test files needed. The phase gate is TypeScript compilation (`npx tsc --noEmit` must pass) plus visual verification of the 5 success criteria. Existing tests must continue passing.

## Open Questions

1. **FXL logo block in header**
   - What we know: Current TopNav has a rounded-lg bg-primary square with "FXL" text before the brand name. Reference HTML does NOT have this logo block.
   - What's unclear: Whether to keep the logo block or remove it to match the reference.
   - Recommendation: Keep the logo block. It provides brand recognition and the reference HTML is a guide, not a strict spec. If the user wants to remove it, that is a simple deletion.

2. **Mobile sidebar behavior after overflow-hidden removal**
   - What we know: Current sidebar uses `w-full md:w-64` with `border-b md:border-r` (full-width bar on mobile, side column on desktop). Removing `overflow-hidden` may cause mobile sidebar content to overflow.
   - What's unclear: Whether to hide sidebar on mobile entirely (`hidden md:block`) or keep the current mobile bar behavior.
   - Recommendation: Keep `hidden md:block` for now. Mobile sidebar drawer is explicitly out of scope for v1.2 (see REQUIREMENTS.md "Out of Scope"). The current mobile bar is not ideal but functional.

3. **Dark mode header background**
   - What we know: Reference HTML is light-mode only. The `bg-white/80` frosted glass effect needs a dark mode counterpart.
   - What's unclear: Exact dark mode background for the header.
   - Recommendation: Use `dark:bg-background/80` (maps to slate-900/80%). This maintains the frosted glass effect in dark mode using the existing dark background token.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: Layout.tsx, TopNav.tsx, SearchCommand.tsx, globals.css, App.tsx, DocTableOfContents.tsx
- Reference HTML: `.planning/research/visual-redesign-reference.html` -- exact header structure, classes, and layout
- Phase 12 summary: `.planning/phases/12-design-foundation/12-01-SUMMARY.md` -- confirmed CSS tokens are now slate + indigo
- Existing research: `.planning/research/ARCHITECTURE.md` -- Pattern 2 (sticky stack), Pattern 3 (width delegation), Pattern 4 (decorative search)
- Existing research: `.planning/research/PITFALLS.md` -- Pitfall 2 (sticky scroll conflict), Pitfall 7 (Radix scroll-lock shift)

### Secondary (MEDIUM confidence)
- [MDN position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky) -- overflow ancestor requirement verified
- [MDN scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter) -- browser support, stable value behavior
- [Radix UI discussions #1586](https://github.com/radix-ui/primitives/discussions/1586) -- react-remove-scroll header shift documented

### Tertiary (LOW confidence)
- None -- all findings verified against codebase and official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, pure CSS/component changes on existing stack
- Architecture: HIGH -- patterns verified against reference HTML and MDN specifications, full codebase audit completed
- Pitfalls: HIGH -- all pitfalls identified from actual codebase code paths, not theoretical; Pitfall 2 (sticky/overflow) and Pitfall 7 (dialog shift) documented in prior research with specific file/line references

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no version-sensitive dependencies in this phase)
