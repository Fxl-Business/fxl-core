# Project Research Summary

**Project:** FXL Core v1.2 Visual Redesign
**Domain:** Visual redesign of internal React + Tailwind CSS documentation platform
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

FXL Core v1.2 is a visual redesign, not an architectural rewrite. The platform already has the right bones: a CSS variable theming system (shadcn/ui convention), IntersectionObserver scroll-spy on the TOC, backdrop-blur on the header, Inter and JetBrains Mono declared in `tailwind.config.ts` (just never actually loaded). The redesign shifts the palette from blue-gray + gold to slate + indigo, loads the fonts that were always intended, adds syntax highlighting to code blocks, and restructures the layout to a proper three-column doc shell. The total dependency footprint is 3 npm packages. Zero new Tailwind plugins. Zero new shadcn/ui components.

The recommended approach is a strict phase sequence driven by dependency chains: CSS variable palette first (propagates everywhere automatically), then layout shell (sets the geometric constraints for all child components), then doc-specific rendering (typography, code blocks, TOC), then a consistency pass on non-doc pages. This ordering exists because every downstream component depends on the design tokens being correct and the layout container being finalized. Attempting to style individual components before the tokens and layout are locked leads to rework.

The primary risks are cascading side effects, not technical complexity. Changing `--primary` from dark charcoal to bright indigo affects every `bg-primary/10` opacity modifier, every `text-primary` link, and every shadcn/ui Button and Badge. The HSL channel format required by Tailwind 3 opacity modifiers is fragile -- accidentally wrapping values in `hsl()` produces silent rendering failures. The other genuine risk is the sticky positioning stack: removing `overflow-hidden` from `Layout.tsx` to enable viewport-relative sticky sidebar changes the entire scroll context, which can break the TOC's IntersectionObserver. Both risks are fully mitigatable with the phased approach and explicit verification checklists identified in the research.

## Key Findings

### Recommended Stack

The existing stack is unchanged. Three packages are added, all runtime dependencies bundled by Vite.

**Additions only:**
- `@fontsource-variable/inter@5.2.8`: Self-hosted Inter variable font (~150KB woff2) -- fixes fonts declared in tailwind.config.ts but never loaded; eliminates Google Fonts CDN dependency
- `@fontsource-variable/jetbrains-mono@5.2.8`: Self-hosted JetBrains Mono variable font (~100KB woff2) -- same situation; code blocks currently fall back to system monospace
- `rehype-highlight@7.0.2`: Syntax highlighting for react-markdown code blocks -- plugs into existing rehypePlugins pipeline; uses lowlight with 37 default languages covering all doc content (JS, TS, bash, JSON, YAML, CSS, SQL)

**What NOT to add:** @tailwindcss/typography (conflicts with existing custom .prose rules), shiki/rehype-pretty-code (inline styles incompatible with CSS variable theming), react-syntax-highlighter (legacy wrapper, does not integrate as rehype plugin), MDX (unnecessary -- custom parser handles all doc extensions), custom scrollbar libraries (8 lines of CSS suffice).

**Critical version constraint:** Tailwind v4 and React 19 are explicitly out of scope per PROJECT.md.

### Expected Features

**Must have (table stakes) -- 11 items:**
- TS-10: Three-column layout shell (sidebar | content | TOC) -- the structural foundation
- TS-1: Frosted glass sticky header (backdrop-blur-md, h-16, z-50)
- TS-4: Sidebar with border-l rail navigation and indigo active accent -- highest visual impact single change
- TS-9: Right-side TOC with "NESTA PAGINA" header, border-l nested items, indigo active link
- TS-6: Page header with text-4xl/5xl extrabold title and indigo ring badge
- TS-7: Prose typography upgrade (base body text, 2xl H2, xl H3, relaxed line height, indigo links)
- TS-8: Dark-themed code blocks (slate-900, rounded-xl, shadow-2xl, traffic light dots)
- TS-5: Breadcrumbs with chevron separators
- TS-2: Brand identity dual-line logo in header
- TS-3: Search bar restyled as visible input-like trigger
- TS-11: Horizontal dividers between page header and content

**Should have (differentiators) -- 5 items:**
- D-1: Syntax highlighting via rehype-highlight (new dependency, medium complexity)
- D-2: Copy button on code blocks (extends existing PromptBlock pattern)
- D-3: Language label on code blocks (extract from className, low effort)
- D-5: Callout component with icons and dark mode support
- D-6: Scroll-to-top on navigation (one-time global fix)

**Defer to v1.3+:**
- Mobile sidebar redesign (current mobile behavior is functional)
- Dark mode visual pass (ensure nothing breaks, do not redesign palette)
- Multiple syntax highlighting themes (one good theme is enough)
- Full-text search (cmdk title/description search is sufficient)
- Animated page transitions (fast beats animated)

### Architecture Approach

The redesign is a styling pass over existing components, not a structural rewrite. Nine files are modified. Zero new structural components are created. The key architectural patterns are: (1) token-driven redesign where CSS variable changes in globals.css propagate through shadcn/ui's semantic classes to every component automatically; (2) a sticky positioning stack with three coordinated elements (header at z-50 top-0, sidebar and TOC both at sticky top-16 with calc(100vh-4rem) height); (3) width constraint delegation where Layout.tsx drops its max-w-4xl wrapper and each page component defines its own width; (4) a decorative search trigger that looks like an input but opens the existing cmdk CommandDialog.

**Major components affected:**
1. `globals.css` -- color token migration (slate + indigo), font imports, prose scale, code theme, scrollbar styling
2. `Layout.tsx` -- remove overflow-hidden, remove max-w-4xl, change scroll context to viewport
3. `Sidebar.tsx` -- largest visual change: bg-slate-50/50, border-l rail, uppercase section headers, indigo active, sticky positioning
4. `TopNav.tsx` -- h-16, bg-white/80 backdrop-blur-md, z-50
5. `MarkdownRenderer.tsx` -- rehype-highlight plugin, dark code block container with traffic light dots
6. `DocTableOfContents.tsx` -- w-64, sticky top-16, indigo active, border-l nested h3 items
7. `DocPageHeader.tsx` -- text-4xl/5xl, indigo ring badge, text-lg description
8. `DocBreadcrumb.tsx` -- text-sm, chevron separators
9. `SearchCommand.tsx` -- input-styled trigger

### Critical Pitfalls

1. **Color system opacity breakage** -- Tailwind 3 requires raw HSL channels in CSS variables (e.g., `220 16% 22%`), NOT wrapped in `hsl()`. Accidentally including the wrapper produces `hsl(hsl(...))` which silently renders as transparent. Every `bg-primary/10`, `bg-background/90`, `bg-muted/50` breaks. **Prevention:** Change only variable values, not format. Verify with DevTools computed styles after migration. Never change tokens and component markup in the same commit.

2. **Sticky positioning triple-scroll conflict** -- Current `Layout.tsx` has `overflow-hidden` on the flex parent, which kills CSS sticky positioning. Removing it changes the scroll context from isolated `<main>` to the viewport. The TOC's IntersectionObserver uses default root (viewport) but content scrolls inside `<main>` -- this mismatch can cause incorrect heading tracking. **Prevention:** Remove `overflow-hidden` AND `overflow-y-auto` simultaneously. Make the document body the single scroll context. Update IntersectionObserver rootMargin from -80px to -96px for new header height. Add `scroll-margin-top: 80px` to h2/h3 elements.

3. **Font loading layout shift** -- Fonts are declared in tailwind.config.ts but never loaded. Adding them causes FOUT and CLS as metrics differ between system fonts and Inter. **Prevention:** Use @fontsource-variable self-hosted packages imported in CSS entry point. The ~150KB woff2 bundled by Vite loads from same origin with no external dependency.

4. **TOC heading ID mismatch** -- Heading IDs are extracted in TWO places (docs-parser.ts from raw markdown, MarkdownRenderer.tsx from rendered React children) with separate slugify functions. They produce identical results for plain text but can diverge for headings with inline code, bold, or accented characters. **Prevention:** Consolidate to a single exported slugify function used by both paths. Test with headings containing Portuguese diacritics and inline code.

5. **Wireframe token isolation leak** -- App tokens (`--primary`, `--accent`) and wireframe tokens (`--wf-*`) coexist in one Tailwind config. Wireframe components that accidentally use `bg-primary` instead of `bg-wf-heading` will show indigo instead of stone gray after the palette change. **Prevention:** After changing app tokens, grep for app-token usage in `tools/wireframe-builder/`. Open wireframe viewer and verify zero visual change.

## Implications for Roadmap

Based on combined research, the redesign decomposes into 6 phases with strict dependency ordering. Each phase produces a testable, visually coherent intermediate state.

### Phase 1: Design Foundation (Tokens + Fonts)

**Rationale:** Every subsequent phase depends on the color palette and font metrics being correct. Changing tokens first reveals which components need manual attention (those bypassing tokens with hardcoded colors). Fonts must load before any spacing or typography decisions, since Inter has different metrics than system-ui.

**Delivers:** Slate + indigo palette globally applied, Inter and JetBrains Mono loaded, antialiased rendering, prose typography scale upgraded, code block CSS variables updated.

**Features addressed:** Color palette migration, font loading, prose typography base (TS-7 partial)

**Pitfalls to avoid:** Pitfall 1 (opacity modifier breakage -- verify HSL channel format), Pitfall 3 (font CLS -- use @fontsource self-hosted), Pitfall 6 (wireframe isolation -- verify --wf-* tokens unaffected)

**Files:** `globals.css`, `package.json` (npm install 3 packages)

**Verification:** Toggle dark mode on every page type. Check `bg-primary/10` renders semi-transparent. Open wireframe viewer -- colors unchanged. No external font requests in Network tab.

### Phase 2: Layout Shell (Header + Scroll Context)

**Rationale:** The header height (h-16 = 64px) sets the geometric anchor for sidebar and TOC sticky offsets. The scroll context change (removing overflow-hidden) is a prerequisite for proper sticky positioning. This must be stable before any component inside the layout is restyled.

**Delivers:** h-16 frosted glass header, viewport scroll context, max-w delegation to pages, `scrollbar-gutter: stable` for dialog scroll-lock prevention, scroll-to-top on navigation.

**Features addressed:** TS-1 (header), TS-10 (layout shell partial), TS-2 (brand identity), TS-3 (search bar restyle), D-6 (scroll-to-top)

**Pitfalls to avoid:** Pitfall 2 (sticky scroll conflict -- remove overflow-hidden AND overflow-y-auto together), Pitfall 7 (Radix dialog scroll-lock header shift -- add scrollbar-gutter: stable)

**Files:** `Layout.tsx`, `TopNav.tsx`, `SearchCommand.tsx`

**Verification:** Scroll a long doc page -- header stays visible, content scrolls beneath. Open Cmd+K search -- header does not shift. Every page still renders (Home, docs, client pages all need width wrappers now).

### Phase 3: Sidebar Redesign

**Rationale:** The sidebar is the most visible element on every page and the highest-impact single visual change. It depends on the header height being locked (Phase 2) for its sticky top-16 offset.

**Delivers:** bg-slate-50/50 sidebar with border-l rail navigation, uppercase section headers, indigo active accent, sticky positioning with independent scroll.

**Features addressed:** TS-4 (sidebar border-l + indigo), TS-5 (breadcrumbs with chevrons), D-4 (sidebar collapse animation -- optional)

**Pitfalls to avoid:** None specific. Sidebar data structure is unchanged; only CSS classes change.

**Files:** `Sidebar.tsx`, `DocBreadcrumb.tsx`

**Verification:** Navigate between sections. Active item highlights correctly with indigo. Sidebar scrolls independently for deep navigation trees. Breadcrumbs show chevron separators.

### Phase 4: Doc Page Rendering

**Rationale:** The largest single phase, covering everything inside the content area. Depends on layout being stable (Phase 2) to evaluate the full page composition at the correct column width.

**Delivers:** Large page titles (4xl/5xl), indigo ring badge, right-side TOC with "NESTA PAGINA" header and border-l nesting, dark code blocks with traffic light dots, syntax highlighting, copy button and language label on code blocks, section dividers.

**Features addressed:** TS-6 (page header), TS-7 (prose typography completion), TS-8 (code block chrome), TS-9 (TOC restyle), TS-11 (dividers), D-1 (syntax highlighting), D-2 (copy button), D-3 (language label)

**Pitfalls to avoid:** Pitfall 4 (TOC heading ID mismatch -- consolidate slugify), Pitfall 5 (code block style conflicts -- remove duplicate .prose pre/code rules from globals.css, let MarkdownRenderer be sole authority)

**Files:** `DocPageHeader.tsx`, `DocTableOfContents.tsx`, `MarkdownRenderer.tsx`, `DocRenderer.tsx`, `globals.css` (code theme additions)

**Verification:** Scroll long doc page -- TOC active state updates correctly. Click TOC link -- heading appears below sticky header. Code blocks have dark background, traffic light dots, syntax colors. Toggle dark mode -- code blocks visually distinct from surrounding dark background. Test with doc page containing Portuguese accented headings and inline code in headings.

### Phase 5: Consistency Pass (Non-Doc Pages)

**Rationale:** Non-doc pages (Home, client pages, login/profile) inherit token changes automatically but may need manual width wrappers and typography alignment. This is lower risk and lower priority than doc pages.

**Delivers:** Visual consistency across all pages. Home.tsx with updated cards and typography. Client pages with aligned badges and tables. Callout component with icons and dark mode colors. PromptBlock aligned with new dark code block pattern.

**Features addressed:** D-5 (callout theming), Home.tsx alignment, client page alignment, Clerk auth page verification

**Pitfalls to avoid:** Pitfall 6 (wireframe isolation -- final verification that wireframe viewer is completely unaffected by all cumulative changes)

**Files:** `Home.tsx`, `Callout.tsx`, `PromptBlock.tsx`, `FinanceiroIndex.tsx`, `BriefingForm.tsx`, `BlueprintTextView.tsx`

**Verification:** Every page in the app renders correctly in both light and dark mode. Wireframe viewer shows original stone gray + gold colors. Clerk sign-in/sign-up pages look correct.

### Phase 6: QA and "Looks Done But Isn't" Audit

**Rationale:** Visual redesigns have a long tail of subtle issues that only surface through systematic testing. The PITFALLS.md research identified a specific checklist of items that appear complete but are missing critical pieces.

**Delivers:** Production-ready visual redesign with zero known regressions.

**Audit checklist:**
- Opacity modifiers (bg-primary/10, bg-background/90, bg-muted/50) render correctly
- Dark mode on every page type (doc, home, client, wireframe, login)
- Sticky header does not shift on dialog open (test on page with scrollbar)
- TOC scroll tracking on long doc page with 10+ headings
- TOC heading IDs match DOM on page with accented/formatted headings
- Font loading in incognito window -- no visible text jump
- Code blocks in light AND dark mode -- readable, distinct from background
- Wireframe viewer unaffected by all changes
- Clerk auth pages visually consistent
- Search palette (Cmd+K) uses new design system
- Mobile layout: sidebar hidden, no horizontal scroll, header works on iOS Safari

### Phase Ordering Rationale

- **Phase 1 before Phase 2:** Font metrics and color tokens affect every measurement and visual decision downstream. Layout changes with the wrong fonts mean reworking spacing later.
- **Phase 2 before Phase 3:** Sidebar sticky positioning depends on header height and the scroll context change. Without the layout shell being correct, sidebar cannot be properly positioned.
- **Phase 3 before Phase 4:** Sidebar width affects available content area width, which affects typography line lengths in the prose area.
- **Phase 4 before Phase 5:** Doc pages are the primary content. Get them right first, then propagate the visual language to secondary pages.
- **Phase 5 before Phase 6:** The QA audit is only meaningful once all visual changes have landed.

### Research Flags

**Phases likely needing `/gsd:research-phase` during planning:**
- **Phase 4 (Doc Page Rendering):** The rehype-highlight integration, custom CSS variable theme for syntax tokens, and TOC heading ID consolidation involve multiple interacting changes. The code block styling has three overlapping sources of truth that need consolidation. Recommend phase-level research to map exact file changes.

**Phases with standard, well-documented patterns (skip research):**
- **Phase 1 (Design Foundation):** CSS variable changes and @fontsource imports are well-documented patterns. The STACK.md research provides exact integration code.
- **Phase 2 (Layout Shell):** Sticky positioning + backdrop-blur is standard Tailwind. The ARCHITECTURE.md research provides the exact class changes for Layout.tsx and TopNav.tsx.
- **Phase 3 (Sidebar Redesign):** Pure CSS class changes on existing component. Data structure unchanged. FEATURES.md provides exact target classes.
- **Phase 5 (Consistency Pass):** Token propagation handles most changes automatically. Manual fixes are small and isolated.
- **Phase 6 (QA Audit):** Checklist-driven, no research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All 3 packages verified via npm registry. Version compatibility confirmed (rehype-highlight 7.x + react-markdown 9.x share hast ^3.0.0 and vfile ^6.0.0). Font packages are pure CSS + woff2 with zero runtime risk. |
| Features | HIGH | HTML reference file defines every visual detail pixel by pixel. No ambiguity about target design. Feature prioritization grounded in competitor analysis of Stripe, Tailwind, shadcn/ui, and Vercel docs. |
| Architecture | HIGH | Full codebase audit of all 9 affected components. Current state and target state documented with exact className changes. No speculative patterns -- everything maps to existing Tailwind utilities and proven CSS techniques. |
| Pitfalls | HIGH | All 7 pitfalls identified from codebase analysis (not theoretical). Each pitfall includes the specific file, line number context, and exact code causing the risk. Recovery strategies are documented with cost estimates. |

**Overall confidence:** HIGH

### Gaps to Address

- **Dark mode syntax highlight theme:** The initial CSS variable values for code token colors (--code-keyword, --code-string, etc.) are reasonable defaults but need visual iteration after seeing actual rendered code in both light and dark modes. This is a tuning gap, not a knowledge gap.
- **Scrollbar styling cross-browser:** The `::-webkit-scrollbar` approach covers Chromium and Safari. Firefox uses `scrollbar-width: thin` as fallback. Minor cosmetic inconsistency is acceptable. This is noted as an anti-feature in FEATURES.md.
- **TOC responsive breakpoint:** Reference HTML hides TOC below `xl`. Current implementation already does this. Verify graceful degradation from three-column to two-column at `lg` and single-column at `md` during Phase 2.
- **Clerk auth page theming:** Clerk components use shadcn tokens via `appearance: { theme: shadcn }`. After the palette shift, verify sign-in/sign-up pages render correctly. This is a verification step in Phase 5, not a known problem.
- **IntersectionObserver rootMargin tuning:** After changing header height and scroll context, the TOC rootMargin value needs recalibration. The PITFALLS.md research identifies the specific adjustment (-80px to -96px) but it may need further tuning based on visual testing.

## Sources

### Primary (HIGH confidence -- codebase analysis)
- All 9 component files audited: Layout.tsx, TopNav.tsx, Sidebar.tsx, SearchCommand.tsx, DocBreadcrumb.tsx, DocPageHeader.tsx, DocTableOfContents.tsx, MarkdownRenderer.tsx, DocRenderer.tsx
- Style files: globals.css, tailwind.config.ts, wireframe-tokens.css
- Target design: `.planning/research/visual-redesign-reference.html`

### Primary (HIGH confidence -- verified package registries)
- [npm: @fontsource-variable/inter](https://www.npmjs.com/package/@fontsource-variable/inter) -- v5.2.8, 221K weekly downloads
- [npm: @fontsource-variable/jetbrains-mono](https://www.npmjs.com/package/@fontsource-variable/jetbrains-mono) -- v5.2.8
- [npm: rehype-highlight](https://www.npmjs.com/package/rehype-highlight) -- v7.0.2
- [Fontsource variable fonts docs](https://fontsource.org/docs/getting-started/variable)
- [rehype-highlight GitHub](https://github.com/rehypejs/rehype-highlight)

### Secondary (HIGH confidence -- official documentation)
- [Tailwind CSS v3 colors](https://v3.tailwindcss.com/docs/customizing-colors) -- slate and indigo palettes
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming) -- CSS variable HSL channel format
- [MDN IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) -- root option, rootMargin behavior
- [MDN CSS position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky) -- overflow ancestor requirements

### Secondary (MEDIUM confidence -- community patterns)
- [Stripe Documentation](https://docs.stripe.com/) -- three-column layout, code block patterns
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) -- border-l sidebar, typography
- [shadcn/ui Documentation](https://ui.shadcn.com/) -- sidebar component, breadcrumbs
- [Vercel Geist Design System](https://vercel.com/geist/introduction) -- typography scale
- [Radix UI scroll-lock discussions #1586, #1100](https://github.com/radix-ui/primitives/discussions/1586) -- scrollbar-gutter fix
- [Smashing Magazine: sticky + full-height elements](https://www.smashingmagazine.com/2024/09/sticky-headers-full-height-elements-tricky-combination/)

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
