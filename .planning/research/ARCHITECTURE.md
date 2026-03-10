# Architecture Research: Visual Redesign Integration

**Domain:** Documentation platform visual redesign (FXL Core v1.2)
**Researched:** 2026-03-10
**Confidence:** HIGH (based on full codebase analysis of existing components + HTML reference target)

## System Overview: Current vs Target

### Current Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  App.tsx (BrowserRouter)                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Layout.tsx (flex column)                              │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  TopNav.tsx (sticky top-0 z-20, h-14)            │  │  │
│  │  │  bg-background/90 backdrop-blur                  │  │  │
│  │  │  [FXL logo+subtitle] [SearchBtn] [ThemeToggle]   │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌────────┬─────────────────────────────────────────┐  │  │
│  │  │Sidebar │  <main> overflow-y-auto                 │  │  │
│  │  │ w-64   │  ┌───────────────────────────────────┐  │  │  │
│  │  │ not    │  │  max-w-4xl (HARDCODED in Layout)  │  │  │  │
│  │  │ sticky │  │  <Outlet />                       │  │  │  │
│  │  │ bg-    │  │   ├─ Home.tsx                     │  │  │  │
│  │  │sidebar │  │   ├─ DocRenderer.tsx               │  │  │  │
│  │  │/80     │  │   │   ├─ content (min-w-0 flex-1) │  │  │  │
│  │  │bg-pri/ │  │   │   └─ TOC (w-52, sticky top-8) │  │  │  │
│  │  │10 actv │  │   └─ Client pages                  │  │  │  │
│  │  └────────┴──└───────────────────────────────────┘──┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│  Full-screen routes outside Layout: Login, Profile, Wireframe│
└──────────────────────────────────────────────────────────────┘
```

### Target Architecture (from HTML reference)

```
┌──────────────────────────────────────────────────────────────┐
│  App.tsx (BrowserRouter) -- routing unchanged                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Layout.tsx (flex column)                              │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  TopNav.tsx (sticky top-0 z-50, h-16)            │  │  │
│  │  │  bg-white/80 backdrop-blur-md, border-slate-200  │  │  │
│  │  │  [Logo+subtitle] [...SearchInput...] [ThemeBtn]  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌────────┬────────────────────────────┬───────────┐  │  │
│  │  │Sidebar │  <main> (NO max-w in Lay.) │ TOC aside │  │  │
│  │  │ sticky │  ┌──────────────────────┐  │ sticky    │  │  │
│  │  │ top-16 │  │ max-w-4xl (per-page) │  │ top-16    │  │  │
│  │  │ h-calc │  │ Breadcrumbs (chevron)│  │ w-64      │  │  │
│  │  │ bg-    │  │ Badge (indigo ring)  │  │ "NESTA    │  │  │
│  │  │ slate- │  │ Title (4xl/5xl)      │  │  PAGINA"  │  │  │
│  │  │ 50/50  │  │ Description (lg)     │  │ border-l  │  │  │
│  │  │ border │  │ [Exibir MD]          │  │ indigo    │  │  │
│  │  │ -l nav │  │ ── separator ──      │  │ active    │  │  │
│  │  │ indigo │  │ Content sections     │  │           │  │  │
│  │  │ accent │  │ (dark code blocks)   │  │           │  │  │
│  │  └────────┴──└──────────────────────┘──┴───────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Key Structural Differences

1. **Header height:** h-14 (56px) -> h-16 (64px). Cascades to all sticky offsets.
2. **Sidebar positioning:** Implicitly static in flex -> explicitly `sticky top-16 h-[calc(100vh-4rem)]`.
3. **Width constraint:** `max-w-4xl` lives in Layout -> moves to individual page components.
4. **Scroll context:** `<main>` scrolls independently (overflow-y-auto) -> document body scrolls (needed for sticky to work).
5. **Search trigger:** Small button that opens modal -> visible input field that opens modal on click.
6. **Color palette:** Dark gray primary + gold accent -> slate + indigo primary.

## Component Audit: Modify vs Create

### Components to MODIFY (9 files)

| # | File | Current State | Target Changes | Scope |
|---|------|---------------|----------------|-------|
| 1 | `src/styles/globals.css` | HSL tokens: dark gray primary (220 16% 22%), gold accent (43 96% 56%), .prose styles with text-2xl headings | Slate + indigo palette, .prose typography scale upgrade (4xl headings, lg descriptions), dark code block vars | LARGE |
| 2 | `src/components/layout/Layout.tsx` | `flex-1 flex-col overflow-hidden md:flex-row`, `max-w-4xl` wrapper on Outlet | Remove overflow-hidden, remove max-w-4xl (move to pages), adjust padding to px-8 py-10 lg:px-12 | SMALL |
| 3 | `src/components/layout/TopNav.tsx` | h-14, bg-background/90 backdrop-blur, z-20, FXL logo block + SearchCommand button + ThemeToggle | h-16, bg-white/80 backdrop-blur-md, z-50, brand subtitle styling, wider search integration area | MEDIUM |
| 4 | `src/components/layout/SearchCommand.tsx` | Small 48-char button trigger: `[icon] Pesquisar docs... [Cmd+K]` opens CommandDialog | Visible input-styled trigger: `bg-slate-50 border-slate-200 rounded-md py-1.5 pl-10 pr-12 max-w-sm` with search icon + kbd. Click opens same CommandDialog | MEDIUM |
| 5 | `src/components/layout/Sidebar.tsx` | bg-sidebar/80 backdrop-blur, bg-primary/10 active, text-xs items, no border-l indicator, separator between Home and sections | bg-slate-50/50, border-l border-slate-200 nav line, uppercase bold section headers (PROCESSO, PADROES...), text-slate-500 items, text-indigo-600 font-medium active, space-y-8 between sections, sticky top-16 | LARGE |
| 6 | `src/components/docs/DocBreadcrumb.tsx` | text-xs text-muted-foreground, "/" separator, simple spans | text-sm text-slate-500, chevron SVG separator, hover:text-slate-800, font-medium on current page | SMALL |
| 7 | `src/components/docs/DocPageHeader.tsx` | text-2xl font-bold, Badge variant="secondary", text-sm description, Separator + button below | text-4xl font-extrabold tracking-tight sm:text-5xl, indigo ring badge (bg-indigo-50 ring-1 ring-inset ring-indigo-600/20), text-lg text-slate-600 description, mt-8 on button | MEDIUM |
| 8 | `src/components/docs/DocTableOfContents.tsx` | w-52, sticky top-8, text-[10px] "Nesta pagina", simple link list, text-primary active | w-64, sticky top-16, text-xs font-bold uppercase "NESTA PAGINA", nested border-l border-slate-200 for h3 sub-items, text-indigo-600 font-medium active | MEDIUM |
| 9 | `src/components/docs/MarkdownRenderer.tsx` | prose class, bg-[hsl(var(--code-bg))] code blocks, text-primary inline code, basic pre | Dark code blocks: bg-slate-900 rounded-xl shadow-2xl + traffic light dots decoration, colored spans (indigo filenames, emerald annotations, slate-500 comments), indigo link styling | MEDIUM |

### Components to CREATE (0 new structural components)

The HTML reference introduces zero new structural components. Every visual element in the target design maps to an existing component. The changes are purely styling.

**Optional extraction (recommended but not required):**

| Potential File | Purpose | Decision |
|----------------|---------|----------|
| `src/components/docs/CodeBlock.tsx` | Dark code block with traffic light dots, optional filename label | EXTRACT from MarkdownRenderer's `pre` component override. Cleaner if reused in PromptBlock too. |

### Components needing NO structural changes (token propagation handles it)

| Component | Why Unchanged |
|-----------|---------------|
| `src/App.tsx` | Routing structure identical |
| `src/lib/docs-parser.ts` | Parse logic and heading extraction unchanged |
| `src/components/docs/Operational.tsx` | Adopts new tokens via bg-muted, border-border, text-muted-foreground |
| `src/components/docs/PhaseCard.tsx` | Adopts new tokens via bg-card, border-border, text-primary |
| `src/components/layout/ThemeToggle.tsx` | Just an icon button, tokens propagate automatically |
| `src/pages/Login.tsx` | Full-screen outside Layout, bg-background token propagation |
| `src/pages/Profile.tsx` | Full-screen outside Layout, bg-background token propagation |

### Pages needing consistency pass (style-only, no structural changes)

| Page | What Changes |
|------|-------------|
| `src/pages/Home.tsx` | Typography: text-2xl -> text-4xl headings, card hover indigo accent, section header sizing |
| `src/pages/clients/FinanceiroContaAzul/Index.tsx` | Badge, table, heading typography alignment |
| `src/components/docs/Callout.tsx` | Replace hardcoded `border-blue-200 bg-blue-50` with token-aware classes |
| `src/components/docs/PromptBlock.tsx` | Align code block styling with new dark theme pattern |
| `src/pages/clients/BriefingForm.tsx` | Token alignment verification |
| `src/pages/clients/BlueprintTextView.tsx` | Token alignment verification |

## Data Flow

### Heading Data Flow (UNCHANGED -- already working)

```
docs-parser.ts
  extractHeadings(body) -> DocHeading[] { id, text, level: 2|3 }
    |
    v
DocRenderer.tsx
  getDoc(pathname) -> { headings, sections, frontmatter, rawBody }
    |
    +------> DocTableOfContents (headings prop)
    |          IntersectionObserver -> activeId state
    |          rootMargin: "-80px 0px -70% 0px"
    |
    +------> MarkdownRenderer (content prop)
               h2/h3 components generate matching id attributes via slugify()
```

No data flow changes needed. Heading IDs, scroll-spy, and active tracking are fully implemented.

### Search Data Flow (visual change only)

```
Current:
  TopNav -> SearchCommand (button trigger) -> CommandDialog (modal)

Target:
  TopNav -> SearchCommand (input-styled trigger) -> CommandDialog (modal)

  The trigger changes from:
    <button className="...">Pesquisar docs... [Cmd+K]</button>
  To:
    <div className="relative w-full max-w-sm">
      <input placeholder="Pesquisar docs..." onClick={openDialog} readOnly />
      <kbd>Cmd+K</kbd>
    </div>

  CommandDialog logic, search index, grouped results: ALL UNCHANGED.
```

## Architectural Patterns

### Pattern 1: Token-Driven Redesign (change once, propagate everywhere)

**What:** Modify CSS custom properties in `globals.css` and let Tailwind semantic classes (`text-primary`, `bg-muted`, `border-border`) propagate changes automatically to all components.

**When to use:** For the color palette shift. Most components already use semantic tokens, not hardcoded Tailwind colors.

**Token migration map:**

```css
/* ---- CURRENT :root ---- */
--primary: 220 16% 22%;           /* dark gray-blue */
--accent: 43 96% 56%;             /* gold */
--sidebar-accent: 43 96% 56%;    /* gold */

/* ---- TARGET :root ---- */
--primary: 234 89% 63%;           /* indigo-500 */
--accent: 234 89% 63%;            /* indigo (align with primary) */
--sidebar-accent: 234 89% 63%;   /* indigo */
```

**Components that bypass tokens (need manual fixes):**
- `Callout.tsx`: hardcoded `border-blue-200 bg-blue-50 text-blue-900` (info) and `border-amber-200 bg-amber-50 text-amber-900` (warning)
- `FinanceiroIndex.tsx`: hardcoded `bg-green-50 text-green-700` status badges
- `Home.tsx`: no hardcoded colors (all semantic tokens)

**Trade-offs:**
- Pro: One-file change propagates to 30+ component files automatically
- Pro: Dark mode tokens updated in the same file
- Con: Components with hardcoded Tailwind colors (Callout) need manual attention
- Con: Must verify both light AND dark mode after token changes

### Pattern 2: Sticky Positioning Stack

**What:** Three sticky elements coordinated by z-index and top offsets.

```
z-50  TopNav     sticky top-0     h-16 (64px)
---   Sidebar    sticky top-16    h-[calc(100vh-4rem)]  overflow-y-auto
---   TOC        sticky top-16    h-[calc(100vh-4rem)]  overflow-y-auto
```

**Critical requirement:** For `sticky` to work on Sidebar and TOC, the nearest scrolling ancestor must be the viewport (document body), NOT a parent with `overflow: hidden/auto`.

**Current problem:** Layout.tsx has:
```tsx
<div className="flex flex-1 flex-col overflow-hidden md:flex-row">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
```

The `overflow-hidden` on the flex parent and `overflow-y-auto` on main create an isolated scroll context. Sidebar "sticks" because it is in a non-scrolling flex column -- but it is not truly `position: sticky`. TOC uses `sticky top-8` inside DocRenderer which works because the DocRenderer content is inside the scrolling main.

**Target change:**
```tsx
<div className="flex flex-1">                            {/* removed overflow-hidden */}
  <Sidebar />                                             {/* sticky top-16 */}
  <main className="flex-1 px-8 py-10 lg:px-12">          {/* removed overflow-y-auto */}
    <Outlet />
  </main>
</div>
```

Now the document body scrolls. Both Sidebar and TOC sticky relative to viewport. The header stays fixed at top. Sidebar and TOC both offset by header height.

**Trade-offs:**
- Pro: Matches reference HTML behavior exactly
- Pro: Simpler mental model (one scroll context)
- Con: Loss of independent main scroll means the entire page scrolls (header always visible via its own sticky)
- Con: Must test that no other component depends on the current isolated scroll context

### Pattern 3: Width Constraint Delegation

**What:** Remove `max-w-4xl` from Layout and let each page component define its own width constraint.

**Why:** DocRenderer needs content at `max-w-4xl` (prose readability) PLUS a `w-64` TOC sidebar. That requires `max-w-4xl + gap + 256px = ~1200px` of available width. The Layout's `max-w-4xl` (896px) is too narrow. Home page might want `max-w-5xl`. Client pages might want `max-w-4xl`.

**Implementation:**

```tsx
// Layout.tsx -- BEFORE
<main className="flex-1 overflow-y-auto">
  <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
    <Outlet />
  </div>
</main>

// Layout.tsx -- AFTER
<main className="flex-1 px-8 py-10 lg:px-12">
  <Outlet />     {/* each page owns its max-width */}
</main>

// DocRenderer.tsx -- adds its own constraint
<div className="flex gap-10">
  <div className="mx-auto min-w-0 max-w-4xl flex-1">
    {/* content */}
  </div>
  <DocTableOfContents headings={headings} />
</div>

// Home.tsx -- adds its own constraint
<div className="mx-auto max-w-5xl">
  {/* content */}
</div>
```

**Trade-offs:**
- Pro: Each page controls its own layout width
- Pro: DocRenderer can accommodate TOC without Layout interference
- Con: Every existing page must add `mx-auto max-w-4xl` wrapper (small effort, many files)

### Pattern 4: Decorative Search Trigger (fake input, real modal)

**What:** The search bar in the header looks like a text input but is actually a button/div that opens the existing CommandDialog.

**Why not a real inline search:** The cmdk CommandDialog already provides grouped results, keyboard navigation, fuzzy matching, and badge categorization. Rebuilding this as an inline dropdown is significant effort for zero UX gain.

**Implementation:**

```tsx
// SearchCommand.tsx -- trigger change only
<button
  onClick={() => setOpen(true)}
  className="relative flex w-full max-w-sm items-center rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-12 text-sm text-slate-400"
>
  <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
  Pesquisar docs...
  <kbd className="absolute right-2 hidden rounded border border-slate-300 bg-white px-1.5 text-[10px] font-medium text-slate-400 sm:inline-block">
    Cmd+K
  </kbd>
</button>
{/* CommandDialog unchanged */}
```

## Detailed Integration Points

### Integration 1: Header Height Change (h-14 -> h-16)

**Impact radius:**

| File | Current | Target | Change |
|------|---------|--------|--------|
| `TopNav.tsx` | `h-14` (56px) | `h-16` (64px) | Direct |
| `Sidebar.tsx` | No sticky offset | `sticky top-16 h-[calc(100vh-4rem)]` | New |
| `DocTableOfContents.tsx` | `sticky top-8` | `sticky top-16` | Update |
| `DocTableOfContents.tsx` | IntersectionObserver rootMargin `-80px` | Adjust to `-96px` (64px header + 32px buffer) | Update |

**Recommendation:** Define a CSS custom property `--header-h: 4rem` in globals.css and reference `top-[var(--header-h)]` / `h-[calc(100vh-var(--header-h))]`. This protects against future header height changes. However, Tailwind arbitrary values with CSS vars work fine: `top-[var(--header-h)]`.

### Integration 2: Scroll Context Change (overflow-hidden removal)

**Current Layout.tsx line 9:**
```tsx
<div className="flex flex-1 flex-col overflow-hidden md:flex-row">
```

**The `overflow-hidden` exists because:** Without it, the sidebar on mobile (full-width) would create layout overflow. But the reference design hides sidebar on mobile entirely (uses `lg:block`).

**Migration plan:**
1. Remove `overflow-hidden` from the flex container
2. Add `hidden lg:block` to Sidebar (hidden on mobile)
3. Add a mobile menu trigger (hamburger button in TopNav, opens sidebar as a drawer/sheet)
4. Or: keep sidebar visible on mobile as a horizontal scroll area (simpler but less polished)

**Recommendation:** For v1.2, use `hidden md:block` on Sidebar (matching current `md:w-64 md:border-r` breakpoint). Add mobile sidebar support as a follow-up if needed. The current mobile experience (sidebar as full-width bar at top) is functional. Removing `overflow-hidden` and hiding sidebar on mobile is sufficient.

### Integration 3: Color Palette Migration

**Critical decision: What happens to the gold accent?**

The current design uses gold (`43 96% 56%`) as `--accent`, `--sidebar-accent`, and in blockquote borders. The reference HTML uses indigo exclusively.

**Recommendation:** Shift `--primary` to indigo. Map `--accent` to indigo as well. The gold is not a core brand element of FXL -- it was an aesthetic choice for the dark gray-blue palette. With the slate + indigo palette, indigo serves as both primary interactive color and accent.

**Token mapping:**

| Token | Current (light) | Target (light) | Notes |
|-------|-----------------|----------------|-------|
| `--primary` | `220 16% 22%` | `234 89% 63%` | Interactive: links, active nav, badges |
| `--primary-foreground` | `210 40% 98%` | `0 0% 100%` | White text on indigo |
| `--accent` | `43 96% 56%` (gold) | `234 89% 63%` (indigo) | Align with primary |
| `--accent-foreground` | `43 50% 10%` | `0 0% 100%` | White on indigo |
| `--background` | `210 20% 98%` | `0 0% 100%` (white) | Reference uses pure white |
| `--foreground` | `222 47% 11%` | `215 28% 9%` (slate-900) | Near-black |
| `--muted` | `210 40% 96%` | `210 40% 96%` (slate-100) | Nearly same |
| `--muted-foreground` | `215 16% 47%` | `215 16% 47%` (slate-500) | Nearly same |
| `--border` | `214 32% 91%` | `214 32% 91%` (slate-200) | Nearly same |
| `--sidebar` | `220 16% 98%` | `210 40% 98%` | slate-50 equivalent |
| `--sidebar-accent` | `43 96% 56%` (gold) | `234 89% 63%` (indigo) | Active nav color |
| `--ring` | `220 16% 22%` | `234 89% 63%` | Focus ring -> indigo |
| `--code-bg` | `220 13% 10%` | `217 33% 12%` | slate-900 for code blocks |

**Wireframe isolation:** The `--wf-*` tokens in `wireframe-tokens.css` are completely separate. They will NOT be affected by this palette change. This is verified: wireframe tokens use their own CSS file imported in globals.css and scoped to `[data-wf-theme]` containers.

### Integration 4: Sidebar Navigation Data Structure

**No changes to data.** The `navigation: NavItem[]` array in Sidebar.tsx stays identical. The navigation tree structure, href mapping, and collapse/expand logic are all correct. Only the **rendering classes** change:

| Element | Current Class | Target Class |
|---------|---------------|--------------|
| Section header (depth 0) | `text-xs font-semibold uppercase tracking-[0.18em] text-foreground` | `text-xs font-bold uppercase tracking-wider text-slate-900` |
| Item list | `mt-0.5 space-y-0.5` | `space-y-3 border-l border-slate-200 ml-1 pl-4` |
| Leaf item | `text-xs text-muted-foreground` | `text-sm text-slate-500 hover:text-indigo-600` |
| Active item | `bg-primary/10 text-primary font-medium` | `text-indigo-600 font-medium` (no background) |
| Sidebar container | `bg-sidebar/80 backdrop-blur md:w-64 md:border-r` | `bg-slate-50/50 w-64 border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6` |
| Section spacing | `space-y-1` | `space-y-8` |

## Recommended Build Order

Build order follows dependency chains: each phase requires stable outputs from prior phases.

```
Phase 1: globals.css tokens        Phase 2: Layout + TopNav       Phase 3: Sidebar
   |                                    |                              |
   | (tokens ready)                     | (header height locked)       | (sidebar positioned)
   v                                    v                              v
Phase 4: Search integration        Phase 5: Doc rendering         Phase 6: Consistency pass
   (depends on TopNav)                (depends on all prior)          (depends on all prior)
```

### Phase 1: Design Tokens (globals.css + tailwind.config.ts)

**Files:** `src/styles/globals.css`, `tailwind.config.ts` (font-family verification only)

**Changes:**
1. Replace `:root` and `.dark` HSL values with slate + indigo palette (see Integration 3 table)
2. Update `.prose` styles: `h1` to `text-3xl font-extrabold tracking-tight`, `h2` to `text-2xl font-bold tracking-tight`, `p` to `text-base leading-relaxed text-slate-600`
3. Add `--header-h: 4rem` CSS property for sticky offset coordination
4. Verify `font-family: 'Inter'` is already configured (it is, in tailwind.config.ts)

**Why first:** Every subsequent phase depends on the correct palette. Changing tokens first lets you immediately see which components need manual attention (those that bypass tokens with hardcoded colors). Components like PhaseCard, Operational, Home cards will look 70-80% correct from token changes alone.

**Risk:** LOW. Isolated to one CSS file. Wireframe tokens (`--wf-*`) are in a separate file.

**Dependencies:** None.

### Phase 2: Layout Shell (Layout.tsx + TopNav.tsx)

**Files:** `src/components/layout/Layout.tsx`, `src/components/layout/TopNav.tsx`

**Changes:**
1. **Layout.tsx:**
   - Remove `overflow-hidden` from flex container
   - Remove `max-w-4xl` wrapper around `<Outlet />`
   - Change main padding: `px-5 py-8 md:px-8 md:py-10` -> `px-8 py-10 lg:px-12`
   - Remove `overflow-y-auto` from main (document body scrolls now)
2. **TopNav.tsx:**
   - Height: `h-14` -> `h-16`
   - Background: `bg-background/90 backdrop-blur` -> `bg-white/80 backdrop-blur-md dark:bg-slate-900/80`
   - z-index: `z-20` -> `z-50`
   - Border: `border-border/80` -> `border-slate-200`
   - Wider area for search integration

**Why second:** The header height (64px) determines the `top-16` offset for sidebar (Phase 3) and TOC (Phase 5). Layout width constraint removal is needed before pages can control their own width.

**Dependencies:** Phase 1 (tokens for border and background colors).

### Phase 3: Sidebar Redesign

**Files:** `src/components/layout/Sidebar.tsx`

**Changes:**
1. Container: add `sticky top-[var(--header-h)] h-[calc(100vh-var(--header-h))] overflow-y-auto`
2. Background: `bg-sidebar/80 backdrop-blur` -> `bg-slate-50/50`
3. Border: existing `border-r` -> `border-r border-slate-200`
4. Section headers: ensure `text-xs font-bold uppercase tracking-wider text-slate-900`
5. Navigation items: add `border-l border-slate-200 ml-1 pl-4` to item lists
6. Active state: `bg-primary/10 text-primary` -> `text-indigo-600 font-medium` (no background highlight)
7. Hover state: add `hover:text-indigo-600`
8. Section spacing: `space-y-1` -> `space-y-8`
9. Home link icon: keep existing Lucide Home icon, adjust to `text-slate-600 hover:text-indigo-600`
10. Mobile: add `hidden md:block` for now; mobile sidebar can be addressed in a follow-up

**Why third:** Largest visual change. Depends on tokens (Phase 1) and header height (Phase 2). The `navigation` data array is unchanged; only CSS classes change.

**Dependencies:** Phase 1 (tokens), Phase 2 (header height for sticky offset).

### Phase 4: Search Integration

**Files:** `src/components/layout/SearchCommand.tsx`, `src/components/layout/TopNav.tsx` (search area)

**Changes:**
1. Replace button trigger with input-styled `<div>` or `<button>` matching reference: `relative w-full max-w-sm`, `bg-slate-50 border-slate-200 rounded-md`, search icon left, kbd badge right
2. Keep `onClick={() => setOpen(true)}` behavior
3. CommandDialog, search index, grouped results: UNCHANGED
4. Position search centrally in TopNav's flex layout

**Why fourth:** Depends on TopNav being finalized (Phase 2). Pure visual trigger change, zero logic changes.

**Dependencies:** Phase 2 (TopNav layout complete).

### Phase 5: Doc Rendering Redesign

**Files:** `DocBreadcrumb.tsx`, `DocPageHeader.tsx`, `DocTableOfContents.tsx`, `MarkdownRenderer.tsx`, `DocRenderer.tsx`

**Changes:**
1. **DocBreadcrumb:** Chevron SVG separator (replace "/"), `text-sm text-slate-500`, `hover:text-slate-800` on section link, `font-medium text-slate-800` on current page
2. **DocPageHeader:** `text-4xl font-extrabold tracking-tight sm:text-5xl`, badge with `bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-600/20 text-xs font-bold uppercase tracking-wide`, description `text-lg text-slate-600`, button `mt-8` spacing
3. **DocTableOfContents:** `w-64`, `sticky top-[var(--header-h)]`, "NESTA PAGINA" header `text-xs font-bold uppercase tracking-wider text-slate-900`, h3 items nested with `ml-4 border-l border-slate-200 pl-4`, active `font-medium text-indigo-600`
4. **MarkdownRenderer:** Code blocks with `bg-slate-900 rounded-xl shadow-2xl p-6` + traffic light dots (3 colored circles as decoration before code), link styling `text-indigo-600 underline underline-offset-4 decoration-indigo-200`
5. **DocRenderer:** Add `mx-auto max-w-4xl` to the content column. Adjust flex gap for wider TOC (gap-10 -> gap-12 if needed)

**Why fifth:** Largest single phase. Depends on all prior phases being stable to evaluate the full page composition.

**Dependencies:** Phase 1 (tokens), Phase 2 (Layout width delegation), Phase 3 (sidebar context), Phase 4 (search visual).

### Phase 6: Consistency Pass

**Files:** `Home.tsx`, `FinanceiroIndex.tsx`, `Callout.tsx`, `PromptBlock.tsx`, `BriefingForm.tsx`, `BlueprintTextView.tsx`

**Changes:**
1. **Home.tsx:** Add `mx-auto max-w-5xl` wrapper, upgrade heading typography, card hover accent to indigo
2. **FinanceiroIndex.tsx:** Align badge/table/heading styles, add page width wrapper
3. **Callout.tsx:** Replace hardcoded `border-blue-200 bg-blue-50` with token-aware alternatives or keep as-is (blue callouts are semantically correct)
4. **PromptBlock.tsx:** Align code block background with new dark theme pattern (`bg-slate-900` instead of `bg-muted`)
5. **Client form pages:** Verify token alignment, add width wrappers

**Why last:** These benefit from automatic token propagation (Phase 1). Remaining work is aligning a few hardcoded colors and adding width wrappers. Low risk, no structural changes.

**Dependencies:** Phases 1-5 (full visual context established).

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoded Color Values Instead of Tokens

**What people do:** Write `text-indigo-600` or `bg-slate-50` directly in component files, matching the reference HTML literally.
**Why it's wrong:** Breaks dark mode. The reference HTML has no dark mode. Every `text-slate-X` value would need a `dark:text-slate-Y` counterpart. Multiplies maintenance surface.
**Do this instead:** Map indigo and slate to CSS custom properties. Use `text-primary`, `bg-sidebar`, `border-border`. Exception: the badge ring `ring-indigo-600/20` is acceptable as an explicit class since it is a decorative detail, not a semantic token.

### Anti-Pattern 2: Moving TOC Into Layout

**What people do:** Create a three-column Layout (sidebar / content / TOC) to match the reference HTML's visual structure.
**Why it's wrong:** Only doc pages have a TOC. Home, client pages, briefing forms, etc. do not. Adding TOC awareness to Layout couples it to doc rendering and requires conditionals (`showToc` prop or route-based detection).
**Do this instead:** Keep TOC inside DocRenderer (it already is). Remove Layout's width constraint so DocRenderer has room for content + TOC side by side.

### Anti-Pattern 3: Rebuilding Search Infrastructure

**What people do:** Replace CommandDialog with an inline search dropdown to match the reference's visible search bar aesthetic.
**Why it's wrong:** The existing cmdk-based CommandDialog provides grouped results by badge, keyboard navigation, fuzzy matching. Rebuilding costs days for a visual change.
**Do this instead:** Make the trigger look like a search input (styled div/button) but keep CommandDialog as the actual search UI. Visual match achieved, logic untouched.

### Anti-Pattern 4: Removing the Gold Accent Without Checking Wireframe Impact

**What people do:** Replace all gold references with indigo, including the wireframe tokens file.
**Why it's wrong:** The wireframe design system (`wireframe-tokens.css`) uses gold (`--wf-accent`) independently. The wireframe viewer is a separate context with its own theme. Changing `--accent` in globals.css does NOT change `--wf-accent`.
**Do this instead:** Change only `globals.css` tokens. Leave `wireframe-tokens.css` untouched. Verify separation by checking that wireframe viewer still renders gold accent after the app palette shift.

### Anti-Pattern 5: Forgetting to Update IntersectionObserver rootMargin

**What people do:** Change header height from h-14 to h-16 but forget to adjust the IntersectionObserver rootMargin in DocTableOfContents.tsx.
**Why it's wrong:** The current rootMargin is `-80px 0px -70% 0px`. The -80px accounts for the 56px header + 24px buffer. With a 64px header, this should be `-96px` (64px + 32px). If not updated, the "active" heading in the TOC will be offset by ~8px -- the wrong heading will highlight.
**Do this instead:** When changing header height, grep for rootMargin and update all IntersectionObserver configurations. Better yet, use the `--header-h` CSS property value read from `getComputedStyle()` to compute rootMargin dynamically.

## Sources

- Full codebase analysis (HIGH confidence): Layout.tsx, TopNav.tsx, Sidebar.tsx, DocRenderer.tsx, DocBreadcrumb.tsx, DocPageHeader.tsx, DocTableOfContents.tsx, MarkdownRenderer.tsx, globals.css, tailwind.config.ts, App.tsx, Home.tsx, SearchCommand.tsx, ThemeToggle.tsx, Callout.tsx, PromptBlock.tsx, Operational.tsx, PhaseCard.tsx, docs-parser.ts, Login.tsx, Profile.tsx, FinanceiroIndex.tsx
- HTML reference file (HIGH confidence): `.planning/research/visual-redesign-reference.html`
- CSS sticky positioning behavior: MDN and Tailwind docs (verified pattern, HIGH confidence)
- IntersectionObserver API rootMargin behavior: MDN documentation (HIGH confidence)

---
*Architecture research for: FXL Core v1.2 Visual Redesign -- integration with existing system*
*Researched: 2026-03-10*
