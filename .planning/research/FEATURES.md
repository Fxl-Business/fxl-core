# Feature Landscape: v1.2 Visual Redesign

**Domain:** Documentation platform visual redesign -- Layout, Typography, Navigation, Code Rendering, Content Hierarchy
**Researched:** 2026-03-10
**Milestone:** v1.2 Visual Redesign
**Confidence:** HIGH (grounded in HTML reference design + analysis of Stripe/Tailwind/shadcn/Vercel docs patterns + existing codebase audit)

## Reference Design Analysis

The HTML reference file (`visual-redesign-reference.html`) defines the target. Key patterns extracted:

| Element | Reference Pattern | Current State | Delta |
|---------|-------------------|---------------|-------|
| Header | `sticky top-0 z-50`, `bg-white/80 backdrop-blur-md`, h-16, brand + subtitle + search + theme toggle | `sticky top-0 z-20`, `bg-background/90 backdrop-blur`, h-14, same elements but smaller | Height increase, stronger blur, higher z-index |
| Sidebar | `bg-slate-50/50`, uppercase section headers, `border-l` nav items, indigo active color, collapsible groups | `bg-sidebar/80 backdrop-blur`, no border-l, primary active color, flat list | Complete restyle: bg, nav indicator, colors |
| Page Header | Breadcrumbs above, indigo badge pill, `text-4xl/5xl font-extrabold`, description `text-lg`, "Exibir Markdown" button | `text-2xl font-bold`, badge as shadcn Badge, description `text-sm`, "Exibir Markdown" button | Major typography scale-up, badge restyle |
| Code Blocks | `rounded-xl bg-slate-900 shadow-2xl`, traffic light dots, syntax-highlighted text, `text-sm leading-6` | `rounded-lg bg-[hsl(var(--code-bg))]`, no decoration, no syntax highlighting, `text-xs` | Visual upgrade + potential syntax highlighting |
| Table of Contents | Right sidebar `w-64`, `sticky top-16`, uppercase "NESTA PAGINA" header, border-l on nested items, indigo active | Right aside `w-52`, `sticky top-8`, lowercase label, no border-l, primary active | Width increase, sticky offset fix, visual upgrade |
| Breadcrumbs | `text-sm text-slate-500`, chevron separators, section link + current page bold | `text-xs text-muted-foreground`, slash separator, section link + current page | Size increase, separator change |
| Content Typography | `text-slate-600 leading-relaxed`, links with `underline-offset-4 decoration-indigo-200` | `text-muted-foreground leading-relaxed`, basic underline on hover | Richer link styling, consistent text colors |
| Layout | Three columns (sidebar 64 + content + TOC 64), `max-w-4xl` content, `px-8 py-10 lg:px-12` | Two columns + optional TOC, `max-w-4xl`, `px-5 py-8 md:px-8 md:py-10` | Proper three-column, more horizontal padding |

## Table Stakes

Features users expect from a polished documentation platform. These are patterns found across Stripe, Tailwind, shadcn/ui, and Vercel docs. Missing any of these makes the platform feel unfinished.

### TS-1: Frosted Glass Sticky Header

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, Vercel, and shadcn/ui all use `backdrop-blur` + semi-transparent background on sticky headers. It is the standard for 2025+ documentation sites. Content scrolling beneath the header without a frosted effect feels dated. |
| **Complexity** | LOW |
| **Current Gap** | Current header has `bg-background/90 backdrop-blur` and h-14. Reference uses `bg-white/80 backdrop-blur-md` and h-16. Gap is small -- CSS-only change. |
| **Existing Component** | `TopNav.tsx` -- modify in place |
| **Implementation** | Change to `h-16`, `bg-white/80 backdrop-blur-md` (light) / `bg-slate-900/80 backdrop-blur-md` (dark). Increase `z-50`. Add `border-b border-slate-200`. |
| **Notes** | Must update sidebar sticky offset from `top-0` to `top-16` to match new header height. |

### TS-2: Brand Identity in Header (Dual-line Logo)

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Vercel uses "Vercel" + product name. Stripe uses logo + "Docs". A brand mark with product subtitle establishes identity instantly. Reference shows "Nucleo FXL" + "FXL-CORE" subtitle. |
| **Complexity** | LOW |
| **Current Gap** | Current header already has this pattern (brand name + `fxl-core` subtitle). Needs minor visual refinement: bolder tracking, `text-[10px] font-medium uppercase tracking-widest`. |
| **Existing Component** | `TopNav.tsx` -- adjust classes |
| **Implementation** | Match reference: `text-sm font-bold tracking-tight` for name, `text-[10px] font-medium uppercase tracking-widest text-slate-400` for subtitle. |
| **Notes** | Current FXL logo square can be kept or removed. Reference omits it -- evaluate during implementation. |

### TS-3: Inline Search Bar with Keyboard Shortcut Badge

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, Tailwind, shadcn, and Vercel all show a visible search input in the header (not just a button). The input displays a `Cmd+K` keyboard shortcut badge. Clicking opens the full search dialog. |
| **Complexity** | LOW |
| **Current Gap** | Current `SearchCommand.tsx` renders a button-like element with text and kbd. Reference shows a proper `<input>` with search icon, placeholder, and kbd badge. Visual-only change -- the cmdk dialog stays as-is. |
| **Existing Component** | `SearchCommand.tsx` -- restyle the trigger element |
| **Implementation** | Restyle trigger to look like an input field: `rounded-md border-slate-200 bg-slate-50 py-1.5 pl-10 pr-12 text-sm`. Add search icon on left, kbd badge on right. Keep cmdk dialog unchanged. |
| **Notes** | The trigger is not a real input -- it is a button that opens the CommandDialog. Visual only. |

### TS-4: Sidebar with Left Border Navigation and Section Headers

| Aspect | Detail |
|--------|--------|
| **Why Expected** | shadcn/ui docs, Tailwind docs, and the reference all use `border-l` on sidebar nav lists to create a visual hierarchy rail. Active items get a colored left border (indigo in reference). Section headers are uppercase, bold, small text. This is the dominant sidebar pattern for doc sites. |
| **Complexity** | MEDIUM |
| **Current Gap** | Current sidebar uses `bg-primary/10` highlight for active items and indented padding for depth. No border-l rail. Section headers exist but lack the uppercase/tracking styling of the reference. |
| **Existing Component** | `Sidebar.tsx` -- significant restyle of `NavSection` and wrapper |
| **Implementation** | (1) Sidebar wrapper: `bg-slate-50/50` (light) / `bg-slate-900/50` (dark), remove backdrop-blur. (2) Section headers: `text-xs font-bold uppercase tracking-wider text-slate-900`. (3) Nav lists: add `border-l border-slate-200 ml-1 pl-4`. (4) Active item: `text-indigo-600 font-medium` (replacing `bg-primary/10 text-primary`). (5) Hover: `hover:text-indigo-600`. (6) Collapsible groups: chevron icon for expand/collapse (already exists). |
| **Dependencies** | Requires new `--indigo-*` accent tokens or direct Tailwind slate/indigo classes (reference uses direct Tailwind colors, not CSS vars). Decision: use direct Tailwind classes for sidebar since it is app chrome, not doc content. |
| **Notes** | This is the highest-impact visual change. The border-l rail immediately signals "premium documentation platform" to users. |

### TS-5: Breadcrumbs with Chevron Separators

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, Vercel, and shadcn/ui docs all use chevron `>` or `/` separators in breadcrumbs. The reference uses chevron SVG separators with `text-sm` sizing. Every documentation site has breadcrumbs. |
| **Complexity** | LOW |
| **Current Gap** | Current `DocBreadcrumb.tsx` uses slash `/` separator and `text-xs`. Reference uses chevron SVG and `text-sm`. |
| **Existing Component** | `DocBreadcrumb.tsx` -- modify in place |
| **Implementation** | (1) Increase to `text-sm text-slate-500`. (2) Replace `/` with ChevronRight icon (lucide). (3) Current page: `text-slate-800 font-medium`. (4) Parent link: `hover:text-slate-800`. |
| **Notes** | Simple swap. No structural changes. |

### TS-6: Page Header with Large Typography and Badge Pill

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe uses `text-4xl font-bold` for page titles. Tailwind uses `text-3xl`. shadcn/ui uses `text-4xl font-bold`. Vercel uses large, bold headings. Small page titles (current `text-2xl`) make content feel like a secondary page, not a primary doc entry. |
| **Complexity** | LOW |
| **Current Gap** | Current `DocPageHeader.tsx` uses `text-2xl font-bold`. Reference uses `text-4xl font-extrabold tracking-tight sm:text-5xl`. Badge is a generic shadcn Badge vs reference's indigo pill with ring. |
| **Existing Component** | `DocPageHeader.tsx` -- modify in place |
| **Implementation** | (1) Title: `text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl`. (2) Badge: `inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-indigo-600 ring-1 ring-inset ring-indigo-600/20`. (3) Description: `mt-4 text-lg text-slate-600`. (4) "Exibir Markdown" button below description with top margin. |
| **Notes** | The `PageHeader.tsx` (non-doc version) also needs alignment but is used on Home and client pages. Handle separately in the consistency pass. |

### TS-7: Content Typography Hierarchy (Prose Upgrade)

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, Tailwind, and Vercel docs all have clear typographic hierarchy: generous heading sizes, relaxed line heights, visible distinction between H2 and H3. Reference shows `text-2xl font-bold` for H2, `text-xl font-semibold` for H3, `text-slate-600 leading-relaxed` for body. |
| **Complexity** | LOW |
| **Current Gap** | Current prose styles in `globals.css` use `text-2xl` H1, `text-xl` H2, `text-base` H3, `text-sm` body. Reference elevates everything one step. Body text at `text-sm` feels cramped compared to `text-base` reference body. |
| **Existing Component** | `globals.css` prose rules -- modify in place |
| **Implementation** | (1) `.prose h2`: `text-2xl font-bold tracking-tight text-slate-900 mb-6` (remove border-b -- reference has no underline on H2). (2) `.prose h3`: `text-xl font-semibold text-slate-800 mt-8 mb-4`. (3) `.prose p`: `text-slate-600 mb-4 leading-relaxed` (upgrade from `text-sm` to base size). (4) `.prose a`: `font-semibold text-indigo-600 underline underline-offset-4 decoration-indigo-200`. (5) Add `mb-16` between major sections. |
| **Dependencies** | Larger body text increases page height. Table of Contents becomes more important with more content below the fold. |
| **Notes** | This change affects all rendered docs. Must test with multiple doc pages to ensure nothing breaks (tables, lists, code blocks). |

### TS-8: Dark-Themed Code Blocks with Visual Chrome

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, Tailwind, Vercel, and shadcn/ui all use dark-themed code blocks with rounded corners and shadow. The reference adds traffic light dots (red/amber/green circles) as a header decoration. Every premium doc site has visually distinct code blocks that feel like a terminal window. |
| **Complexity** | MEDIUM |
| **Current Gap** | Current code blocks use `rounded-lg bg-[hsl(var(--code-bg))] p-4`. Reference uses `rounded-xl bg-slate-900 p-6 shadow-2xl` with traffic light dots and `text-sm leading-6`. No syntax highlighting in either current or reference. |
| **Existing Component** | `MarkdownRenderer.tsx` (pre/code components) + `globals.css` (.prose pre) |
| **Implementation** | (1) Code block wrapper: `rounded-xl bg-slate-900 p-6 shadow-2xl overflow-hidden`. (2) Add traffic light dots div above code content: three small circles (red-500/50, amber-500/50, emerald-500/50). (3) Code text: `text-sm leading-6 text-slate-300`. (4) Syntax highlighting: Add language label top-right (optional). (5) Inline code stays as-is (rounded bg-muted pill). |
| **Dependencies** | Traffic light dots require wrapping `<pre>` in a container div in the MarkdownRenderer custom components. This is a structural change to the component override. |
| **Notes** | Syntax highlighting via shiki/rehype-pretty-code is a separate differentiator (see below). The code block chrome (dots, shadow, rounded corners) is the table stakes visual. |

### TS-9: Right-Side Table of Contents ("NESTA PAGINA")

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe, shadcn/ui, and Vercel all have a right-side TOC on documentation pages. Tailwind uses it on all pages. It is the standard three-column layout for documentation: left nav, center content, right TOC. |
| **Complexity** | LOW |
| **Current Gap** | Current `DocTableOfContents.tsx` exists and works. Visual differences: w-52 vs w-64, `top-8` vs `top-16`, lowercase label vs uppercase, no border-l on nested items, primary color vs indigo. |
| **Existing Component** | `DocTableOfContents.tsx` -- modify in place |
| **Implementation** | (1) Width: `w-64`. (2) Sticky: `sticky top-16` (match header height). (3) Header: `text-xs font-bold uppercase tracking-wider text-slate-900` + "NESTA PAGINA". (4) Links: `text-sm` (up from `text-xs`). (5) Nested items: `ml-4 border-l border-slate-200 pl-4 text-slate-400`. (6) Active link: `font-medium text-indigo-600`. (7) Hover: `hover:text-slate-900`. |
| **Dependencies** | Three-column layout requires Layout.tsx to accommodate the TOC as a peer element, not nested inside the content max-width container. See TS-10. |
| **Notes** | Scroll-spy via IntersectionObserver already works. Only visual changes needed. |

### TS-10: Three-Column Layout Shell

| Aspect | Detail |
|--------|--------|
| **Why Expected** | The "holy grail" documentation layout (left sidebar + center content + right TOC) is standard across Stripe, Tailwind, shadcn/ui, and Vercel. Reference uses `<div class="flex">` with sidebar (w-64), main (flex-1), and TOC aside (w-64). |
| **Complexity** | MEDIUM |
| **Current Gap** | Current `Layout.tsx` wraps content in `max-w-4xl px-5 py-8` inside `<main>`. The TOC is rendered inside `DocRenderer.tsx` as a flex sibling of content. This means the TOC is constrained by the max-w-4xl container. Reference has the TOC OUTSIDE the main content padding, as a direct sibling of `<main>`. |
| **Existing Component** | `Layout.tsx` + `DocRenderer.tsx` |
| **Implementation** | (1) `Layout.tsx`: Remove the `max-w-4xl` wrapper from main. Let the Outlet render its own width constraints. (2) `DocRenderer.tsx`: Render as `flex` with content area (`flex-1 px-8 py-10 lg:px-12 max-w-4xl mx-auto`) and TOC aside (`sticky top-16 w-64 hidden xl:block`). (3) Other pages (Home, client pages) add their own padding/max-width. |
| **Dependencies** | Every page rendered via Layout.tsx must handle its own max-width. This affects: `Home.tsx`, `DocRenderer.tsx`, client pages, `ComponentGallery.tsx`. Each needs a wrapper. |
| **Notes** | This is a structural change. Must verify all pages still render correctly. The main content area padding moves from Layout to individual page components. |

### TS-11: Horizontal Dividers Between Sections

| Aspect | Detail |
|--------|--------|
| **Why Expected** | Stripe and the reference use full-width `<hr>` dividers between the page header and content body. It visually separates the "hero" area from the scrollable content. shadcn/ui and Vercel do this subtly with spacing alone. |
| **Complexity** | LOW |
| **Current Gap** | Current uses shadcn `Separator` component between header and content. Reference uses `h-px w-full bg-slate-200 my-10`. Functionally equivalent but reference has more vertical spacing. |
| **Existing Component** | `DocRenderer.tsx` -- adjust Separator styling |
| **Implementation** | Replace `<Separator className="my-6" />` with `<div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-10" />` or adjust Separator margin. Increase spacing between header and content body. |
| **Notes** | Minor visual tweak. |

## Differentiators

Features that elevate FXL Core above a typical documentation site. Not expected, but create a noticeable quality impression.

### D-1: Syntax Highlighting in Code Blocks (via shiki or rehype-highlight)

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Stripe, Tailwind, and shadcn/ui all have syntax-highlighted code. Without it, code blocks are monochrome text on dark background. Highlighting makes code scannable and professional. Docusaurus, MkDocs Material, and every modern doc framework include this. |
| **Complexity** | MEDIUM |
| **Current Gap** | No syntax highlighting. `MarkdownRenderer.tsx` renders `<code>` with a static className. react-markdown supports rehype plugins for highlighting. |
| **Implementation Options** | (A) `rehype-highlight` (highlight.js-based) -- lighter, well-supported, 2KB core. (B) `rehype-pretty-code` (shiki-based) -- more themes, VS Code grammar precision, but heavier. (C) `react-shiki` -- client-side component approach. Recommendation: **rehype-highlight** because it integrates directly with react-markdown's rehype plugin chain, is lightweight, and FXL docs use mostly TypeScript/bash/JSON -- no exotic languages needed. |
| **Dependencies** | Requires `rehype-highlight` + `highlight.js` CSS theme. Code block chrome (TS-8) should land first so highlighting layers on top of the visual container. |
| **Notes** | This adds a new dependency. Must document in CLAUDE.md stack section per project rules. |

### D-2: Code Block Copy Button

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Stripe, Tailwind, shadcn/ui, and Docusaurus all have copy buttons on code blocks. The reference does not explicitly show one, but it is universally expected on doc sites with code. FXL already has copy on PromptBlocks -- extending to code blocks creates consistency. |
| **Complexity** | MEDIUM |
| **Current Gap** | `PromptBlock.tsx` has copy functionality. Regular code blocks in `MarkdownRenderer.tsx` do not. |
| **Implementation** | Add a copy button (absolute positioned top-right) to the code block wrapper in MarkdownRenderer. Extract the text content from children and use `navigator.clipboard.writeText()`. Show copied/check feedback (same pattern as PromptBlock). |
| **Dependencies** | Code block chrome (TS-8) -- the copy button sits inside the code block container. |
| **Notes** | Must extract text from React children recursively (utility already exists in `childrenToString` in MarkdownRenderer). |

### D-3: Code Block Language Label

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Stripe and Docusaurus show the language name (typescript, bash, json) in a label on code blocks. Helps users quickly identify what they are looking at, especially when a page has multiple code blocks in different languages. |
| **Complexity** | LOW |
| **Current Gap** | Language info is available in the className of `<code>` elements (e.g., `language-typescript`). Currently not displayed. |
| **Implementation** | Extract language from className in the custom `pre` component. Render as a small label (text-xs, top-right or top-left of code block). |
| **Dependencies** | Code block chrome (TS-8). |
| **Notes** | Simple extraction from existing data. No new deps needed. |

### D-4: Collapsible Sidebar Groups with Smooth Transitions

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | shadcn/ui docs and Vercel docs have smooth expand/collapse animations on sidebar groups. Current sidebar toggles instantly. Smooth animation adds polish. |
| **Complexity** | LOW |
| **Current Gap** | Current sidebar toggles visibility with conditional rendering (open && children). No animation. |
| **Implementation** | Use CSS transitions with `grid-template-rows: 0fr` -> `1fr` pattern, or use shadcn Collapsible component (already in ui library). |
| **Dependencies** | Sidebar restyle (TS-4) should land first. |
| **Notes** | Pure enhancement. If time-constrained, skip this. Instant toggle is acceptable. |

### D-5: Callout Components with Icon and Color Theming

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Stripe uses info/warning/error callouts with icons. Tailwind uses note/warning callouts. shadcn/ui docs have colored callouts. Current Callout component uses hardcoded light-mode colors (`border-blue-200 bg-blue-50`). Upgrading to themed callouts with icons matches premium doc sites. |
| **Complexity** | LOW |
| **Current Gap** | Current `Callout.tsx` has `info` and `warning` types with hardcoded light-mode colors. No icons. No dark mode support. |
| **Implementation** | (1) Add lucide icons (Info, AlertTriangle). (2) Use semantic tokens or slate/indigo classes that work in both light and dark mode. (3) Optional: add `success` and `error` variants. |
| **Dependencies** | None (standalone component). |
| **Notes** | Small change with disproportionate visual impact. |

### D-6: Scroll-to-Top on Navigation

| Aspect | Detail |
|--------|--------|
| **Value Proposition** | Stripe, Vercel, and shadcn/ui docs scroll to top when navigating between pages. If users click a sidebar link while scrolled halfway down a page, the new page starts at the top. |
| **Complexity** | LOW |
| **Current Gap** | Unknown. React Router v6 does not scroll to top by default. May already be an issue. |
| **Implementation** | Add a `ScrollToTop` component that uses `useEffect` + `window.scrollTo(0, 0)` on location changes. Place in Layout.tsx. |
| **Dependencies** | None. |
| **Notes** | One-time setup. Universal benefit. |

## Anti-Features

Features to explicitly NOT build in v1.2.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Full syntax highlighting with multiple themes | Developers love choosing themes (Dracula, One Dark, etc.) | Adds configuration complexity, increases bundle size, distracts from content. One good theme is enough. | Single dark theme matching `bg-slate-900` code blocks. No theme picker. |
| Mobile hamburger sidebar redesign | Mobile users need navigation | v1.2 scope is desktop visual polish. The existing mobile sidebar (collapsible top bar) works. Mobile redesign is a separate effort. | Keep current mobile behavior. Focus desktop three-column layout. |
| Search results page / full-text search | Searching within doc content, not just titles | Current cmdk search by title/description is sufficient. Full-text search requires indexing infrastructure. | Keep cmdk with title/description search. Improve later. |
| Animated page transitions | Framer Motion-style page transitions look polished | Adds dependency, complexity, and can feel sluggish. React Router transitions are notoriously tricky. | Instant page loads with scroll-to-top. Fast is better than animated. |
| Custom scrollbar styling | Reference HTML has custom `::-webkit-scrollbar` styles | Scrollbar styling is Webkit-only. Firefox ignores it. Creates inconsistency across browsers. | Use default browser scrollbars. If needed, `scrollbar-thin scrollbar-thumb-slate-300` via Tailwind plugin later. |
| Dark mode redesign (new color palette) | Reference is light-only, might need dark rethinking | v1.2 reference targets light mode. Dark mode should work (using semantic tokens), but a full dark mode visual pass is scope creep. | Ensure dark mode does not break with new styles. Do not redesign the dark palette. |
| Version selector in header | Large doc sites (Stripe, Tailwind) show version selectors | FXL Core has one version. No historical versions to switch between. Adding a selector adds visual noise for zero utility. | Omit. Add if FXL Core ever ships external documentation. |

## Feature Dependencies

```
LAYOUT SHELL (must be first -- everything else builds on this):
  TS-10: Three-column layout
    -> TS-1: Frosted glass header (sets sticky height for sidebar/TOC offsets)
    -> TS-4: Sidebar restyle (border-l, indigo, uppercase headers)
    -> TS-9: TOC restyle (width, sticky offset, visual upgrade)
    -> TS-11: Section dividers (spacing depends on layout padding)

PAGE HEADER + BREADCRUMBS (independent of layout, but renders inside it):
  TS-5: Breadcrumbs with chevrons
    -> TS-6: Page header with large typography and badge pill
      -> TS-11: Divider between header and content

CONTENT TYPOGRAPHY (independent, but affects content height):
  TS-7: Prose upgrade (H2, H3, body, links, tables)
    -> Increases page height, makes TS-9 TOC more important

CODE BLOCKS (independent track):
  TS-8: Code block chrome (dark bg, rounded-xl, traffic light dots)
    -> D-1: Syntax highlighting (layers on top of chrome)
    -> D-2: Copy button (sits inside chrome container)
    -> D-3: Language label (sits inside chrome container)

POLISH (after core features):
  D-4: Sidebar collapse animation
  D-5: Callout theming upgrade
  D-6: Scroll-to-top on navigation

BRAND IDENTITY (minimal effort, land with header):
  TS-2: Brand identity in header
  TS-3: Search bar restyle
```

### Dependency Notes

- **TS-10 (Layout) is the foundation:** The three-column layout change affects how every page renders. It must land first and be verified before other visual changes layer on top.
- **TS-1 (Header) sets the geometric anchor:** The header height (h-16) determines `sticky top-16` for both sidebar and TOC. Must be finalized before sidebar/TOC styling.
- **TS-8 (Code blocks) is independent:** Code block chrome can be developed in parallel with layout changes since it only affects the MarkdownRenderer component.
- **D-1 (Syntax highlighting) requires TS-8:** The highlighting applies inside the code block container. Without the chrome, there is no visual container to hold the highlighted code.
- **TS-7 (Typography) affects all docs:** This is a global change. Must be tested across multiple doc pages. Should land after layout is stable.

## MVP Recommendation

### Phase 1: Layout Shell + Header (structural)

Critical path. Everything else builds on this.

- [ ] **TS-10: Three-column layout** -- Restructure Layout.tsx and DocRenderer.tsx
- [ ] **TS-1: Frosted glass header** -- Height, blur, z-index, border
- [ ] **TS-2: Brand identity** -- Minor header text adjustments
- [ ] **TS-3: Search bar restyle** -- Visual-only change to trigger
- [ ] **D-6: Scroll-to-top** -- Quick global fix, prevents bugs during testing

### Phase 2: Sidebar + Navigation (visual identity)

Highest visual impact. The sidebar is the most visible element on every page.

- [ ] **TS-4: Sidebar with border-l and indigo accent** -- The signature visual change
- [ ] **TS-5: Breadcrumbs with chevrons** -- Quick win
- [ ] **D-4: Sidebar collapse animation** -- Polish (optional)

### Phase 3: Content Area (typography + page header)

Content rendering quality.

- [ ] **TS-6: Page header scale-up** -- Large title, badge pill, description
- [ ] **TS-7: Prose typography upgrade** -- Global prose rules
- [ ] **TS-9: TOC restyle** -- Width, offset, visual upgrade
- [ ] **TS-11: Section dividers** -- Spacing refinement

### Phase 4: Code Blocks (technical quality)

Code rendering polish.

- [ ] **TS-8: Code block chrome** -- Dark bg, dots, shadow
- [ ] **D-2: Copy button on code blocks** -- Functional addition
- [ ] **D-3: Language label** -- Quick extraction
- [ ] **D-1: Syntax highlighting** -- New dependency, test carefully

### Phase 5: Consistency Pass (global polish)

Apply the new visual language to non-doc pages.

- [ ] **D-5: Callout theming** -- Icons, dark mode colors
- [ ] **Home.tsx** -- Align cards, typography, and spacing with new system
- [ ] **Client pages** -- BriefingForm, BlueprintTextView, WireframeViewer alignment
- [ ] **Login/Profile** -- Clerk pages visual alignment

### Defer to v1.3+

- **D-1 Syntax highlighting**: If time-constrained, this can ship later. Monochrome code blocks with chrome are acceptable for v1.2.
- **Mobile sidebar redesign**: Not in scope. Current mobile behavior is functional.
- **Dark mode visual pass**: Ensure nothing breaks, but do not redesign dark palette.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Phase |
|---------|------------|---------------------|----------|-------|
| TS-10: Three-column layout | HIGH | MEDIUM | P1 | 1 |
| TS-4: Sidebar border-l + indigo | HIGH | MEDIUM | P1 | 2 |
| TS-6: Page header scale-up | HIGH | LOW | P1 | 3 |
| TS-7: Prose typography upgrade | HIGH | LOW | P1 | 3 |
| TS-8: Code block chrome | HIGH | MEDIUM | P1 | 4 |
| TS-1: Frosted glass header | MEDIUM | LOW | P1 | 1 |
| TS-9: TOC restyle | MEDIUM | LOW | P1 | 3 |
| TS-5: Breadcrumbs with chevrons | MEDIUM | LOW | P1 | 2 |
| TS-3: Search bar restyle | MEDIUM | LOW | P2 | 1 |
| TS-2: Brand identity | LOW | LOW | P2 | 1 |
| TS-11: Section dividers | LOW | LOW | P2 | 3 |
| D-2: Code block copy button | MEDIUM | MEDIUM | P2 | 4 |
| D-1: Syntax highlighting | MEDIUM | MEDIUM | P2 | 4 |
| D-3: Language label | LOW | LOW | P2 | 4 |
| D-5: Callout theming | LOW | LOW | P3 | 5 |
| D-4: Sidebar animation | LOW | LOW | P3 | 2 |
| D-6: Scroll-to-top | MEDIUM | LOW | P1 | 1 |

**Priority key:**
- P1: Must have for v1.2 launch -- defines the visual identity
- P2: Should have -- adds polish, include if time allows
- P3: Nice to have -- defer if behind schedule

## Competitor Feature Analysis

| Feature | Stripe Docs | Tailwind Docs | shadcn/ui Docs | Vercel Docs | FXL Reference Target |
|---------|-------------|---------------|----------------|-------------|---------------------|
| Sticky frosted header | Yes (bg/blur) | Yes (bg/blur) | Yes (bg/blur) | Yes (bg/blur) | Yes (bg-white/80 backdrop-blur-md) |
| Left sidebar w/ border-l | No (uses bg highlight) | Yes (border-l indicator) | Yes (border-l indicator) | No (uses bg highlight) | Yes (border-l border-slate-200) |
| Right TOC | Yes (on API pages) | Yes (all pages) | Yes (all pages) | Yes (all pages) | Yes (w-64, "NESTA PAGINA") |
| Breadcrumbs | Yes (chevron) | No | Yes (chevron) | Yes (slash) | Yes (chevron SVG) |
| Large page title | text-4xl bold | text-3xl bold | text-4xl bold | text-3xl bold | text-4xl/5xl extrabold |
| Syntax highlighting | Yes (Prism) | Yes (built-in) | Yes (shiki) | Yes (shiki) | No (monochrome) |
| Code copy button | Yes | Yes | Yes | Yes | No (only on PromptBlocks) |
| Code block chrome | Dark bg, minimal | Dark bg, filename tab | Dark bg, copy icon | Dark bg, filename tab | Dark bg, traffic light dots |
| Badge on page header | No | No | Yes (label) | No | Yes (indigo pill) |
| Dark mode | Yes | Yes | Yes | Yes | Light-only in reference |

## Color Palette Decision

The reference HTML uses a **slate + indigo** palette, which is a significant shift from the current **dark gray-blue + gold** palette.

| Token | Current Value | Reference Value | Decision |
|-------|---------------|-----------------|----------|
| Primary (accent) | `220 16% 22%` (dark gray-blue) | indigo-600 (`#4f46e5`) | **Shift to indigo for app chrome** (sidebar, links, badges) |
| Accent | `43 96% 56%` (gold) | No gold in reference | **Keep gold for wireframe accent only** (`--wf-accent`). Remove gold from app chrome. |
| Background | `210 20% 98%` | white (`#ffffff`) | **Shift to pure white** (matches reference `bg-white`) |
| Sidebar bg | `220 16% 98%` | `slate-50/50` | **Shift to slate-50/50** |
| Code bg | `220 13% 10%` | `slate-900` | **Align to slate-900** |
| Text primary | `222 47% 11%` | `slate-900` | **Keep** (very similar) |
| Text secondary | `215 16% 47%` | `slate-600` | **Align to slate-600** |

This palette shift means updating the CSS custom properties in `globals.css`. The semantic token system stays, but the values change to match the slate + indigo reference.

## Sources

**Documentation site design patterns:**
- [Stripe Documentation](https://docs.stripe.com/) -- Three-column layout, API reference patterns, code blocks
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) -- Typography plugin, border-l sidebar, dark mode prose
- [shadcn/ui Documentation](https://ui.shadcn.com/) -- Sidebar component, breadcrumbs, layout blocks
- [Vercel Geist Design System](https://vercel.com/geist/introduction) -- Typography scale, font system, component guidelines
- [Vercel Geist Typography](https://vercel.com/geist/typography) -- Tailwind class consumption, font-size/line-height/letter-spacing combinations

**Implementation references:**
- [Rehype Pretty Code](https://rehype-pretty.pages.dev/) -- Shiki-based syntax highlighting for react-markdown
- [rehype-highlight on GitHub](https://github.com/rehypejs/rehype-highlight) -- highlight.js-based alternative, lighter
- [react-shiki on GitHub](https://github.com/AVGVSTVS96/react-shiki) -- Client-side Shiki component for React
- [Docusaurus Code Blocks](https://docusaurus.io/docs/markdown-features/code-blocks) -- Code block features (tabs, highlighting, copy)
- [Material for MkDocs Code Blocks](https://squidfunk.github.io/mkdocs-material/reference/code-blocks/) -- Copy button, line highlighting patterns

**Layout and header patterns:**
- [Josh W. Comeau - Frosted Glass](https://www.joshwcomeau.com/css/backdrop-filter/) -- backdrop-filter implementation details
- [Build a Glassmorphic Navbar with TailwindCSS](https://www.braydoncoyer.dev/blog/build-a-glassmorphic-navbar-with-tailwindcss-backdrop-filter-and-backdrop-blur) -- Tailwind-specific implementation
- [CSS-Tricks - Sticky TOC](https://css-tricks.com/sticky-table-of-contents-with-scrolling-active-states/) -- IntersectionObserver scroll-spy pattern
- [Holy Grail Layout](https://matthewjamestaylor.com/holy-grail-layout) -- Three-column responsive layout with CSS Grid/Flexbox

**FXL internal reference:**
- `.planning/research/visual-redesign-reference.html` -- The HTML target design (authoritative)
- `src/components/layout/Layout.tsx` -- Current layout shell
- `src/components/layout/Sidebar.tsx` -- Current sidebar implementation
- `src/components/docs/MarkdownRenderer.tsx` -- Current markdown rendering with custom components
- `src/styles/globals.css` -- Current design tokens and prose styles

---
*Feature landscape for: v1.2 Visual Redesign*
*Researched: 2026-03-10*
