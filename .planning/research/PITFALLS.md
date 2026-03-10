# Pitfalls Research

**Domain:** Visual redesign of existing React + Tailwind CSS 3 + shadcn/ui documentation platform
**Researched:** 2026-03-10
**Confidence:** HIGH (grounded in codebase analysis of globals.css, tailwind.config.ts, Layout.tsx, TopNav.tsx, DocTableOfContents.tsx, MarkdownRenderer.tsx, wireframe-tokens.css; verified against shadcn/ui theming docs, Tailwind 3 CSS variable behavior, IntersectionObserver MDN specs, font loading benchmarks)

## Critical Pitfalls

### Pitfall 1: Color System Migration Breaks Opacity Modifiers and Existing Components

**What goes wrong:**
The current color system uses HSL channel notation without the `hsl()` wrapper in CSS variables (e.g., `--primary: 220 16% 22%`), with `hsl(var(--primary))` in tailwind.config.ts. This is the standard shadcn/ui Tailwind 3 pattern. Changing from the current dark gray-blue + gold accent palette to slate + indigo means touching every `:root` and `.dark` variable in globals.css. The danger is twofold: (a) if the new values accidentally include the `hsl()` wrapper in the CSS variable definition itself (`--primary: hsl(226 100% 55%)` instead of `--primary: 226 100% 55%`), every Tailwind opacity modifier (`bg-primary/10`, `bg-background/90`, `text-muted-foreground/80`) breaks silently -- the element becomes transparent or fully opaque with no visible error; (b) existing components use hardcoded `bg-primary/10` for active states (Sidebar.tsx lines 164, 270), `bg-background/90` for the backdrop-blur header (TopNav.tsx line 7), and `bg-muted/50` for table row hover (globals.css line 156). If the new palette shifts the semantic meaning of `primary` from dark charcoal to bright indigo, all those `bg-primary/10` tints change from "subtle charcoal wash" to "vivid blue wash" -- a drastic visual shift the developer might not notice component by component.

**Why it happens:**
Tailwind 3's opacity modifier trick requires CSS variables to contain raw HSL channel values, NOT wrapped in `hsl()`. This is a Tailwind-specific convention that is easy to violate when copying color values from design tools (which produce `hsl(226, 100%, 55%)`) or from Tailwind 4 examples (which DO wrap in `hsl()`). The silent failure mode -- Tailwind generates `hsl(hsl(226 100% 55%) / 0.1)` which the browser rejects and falls back to transparent -- makes this extremely hard to debug.

Additionally, shifting semantic meaning (primary was dark gray, now it is indigo) cascades through every component that uses `bg-primary/10`, `text-primary`, `ring-primary`, `border-primary`. The shadcn/ui Badge, Button, and Card components all reference these tokens internally.

**How to avoid:**
1. Map the new palette value-by-value in a comparison table BEFORE writing any CSS. For each variable: current value, new value, what changes visually, which components are affected.
2. Audit every usage of opacity modifiers in the codebase. Search for `/[0-9]+` patterns after color utilities (e.g., `bg-primary/10`). Current known usages:
   - `bg-primary/10` in Sidebar.tsx (active nav items)
   - `bg-background/90` in TopNav.tsx (sticky header backdrop)
   - `bg-muted/50` in globals.css (table hover)
   - `border-border/80` in TopNav.tsx (header border)
3. Test the migration by changing ONLY the `:root` CSS variables first, without touching any component code. If anything looks wrong, the migration is leaking semantic changes. Add new semantic tokens rather than repurposing existing ones (e.g., add `--accent-indigo` rather than changing `--accent` from gold to indigo if gold is still needed in some contexts).
4. Verify opacity modifiers render correctly after the change by checking browser DevTools computed styles for at least: TopNav header background, Sidebar active states, table hover rows.

**Warning signs:**
- Elements that should be semi-transparent appear fully transparent or fully opaque
- Active sidebar items appear too vivid or too washed out compared to the design reference
- The sticky header loses its backdrop blur translucency
- shadcn/ui components (Buttons, Badges) look inconsistent with the new palette
- Browser DevTools shows `hsl(hsl(...))` in computed styles

**Phase to address:**
Phase 1 (Color system + CSS variables) -- this must be the FIRST change. Every subsequent component change depends on the tokens being correct. Do NOT change component markup and tokens in the same commit.

---

### Pitfall 2: Sticky Header + Sidebar + TOC Triple-Scroll-Container Conflict

**What goes wrong:**
The v1.2 redesign has three simultaneously sticky/scrollable elements: (a) the TopNav header (`sticky top-0 z-20`), (b) the left Sidebar (which needs its own scroll for deep navigation trees), and (c) the right-side DocTableOfContents (`sticky top-8`). The current Layout.tsx uses a `flex` layout where `main` has `overflow-y-auto` and the sidebar has `overflow-y-auto` at mobile breakpoint. The TOC has `sticky top-8` with `max-h-[calc(100vh-4rem)]`. These three scroll contexts interact in non-obvious ways:

- The TOC's `sticky top-8` value (32px) does NOT account for the header height (56px / h-14). It should be `sticky top-[72px]` (header height + margin) when the header is sticky. Currently it works by accident because the TOC is inside the `overflow-y-auto` main area, and `sticky` positions relative to the nearest scroll ancestor, not the viewport.
- If the sidebar is changed to `sticky` (pinned to viewport while main scrolls), the entire layout model changes. A `position: sticky` element inside a `flex` container with `overflow: hidden` on ANY ancestor will not stick -- `overflow: hidden` on the parent kills sticky positioning.
- The IntersectionObserver in DocTableOfContents.tsx uses `rootMargin: '-80px 0px -70% 0px'` but does NOT set a `root` option. This means it observes relative to the viewport, not relative to the `main` scroll container. If the scroll container for doc content is `main` (which has `overflow-y-auto`), IntersectionObserver with the default viewport root may not fire correctly because the observed elements scroll within a nested container, not within the viewport.

**Why it happens:**
CSS `position: sticky` has notoriously brittle preconditions. Any ancestor with `overflow: hidden`, `overflow: auto`, or `overflow: scroll` creates a new scroll context that may prevent sticky from working as expected. The current layout uses `overflow-hidden` on the flex parent (`div.flex.flex-1.overflow-hidden`) which IS an ancestor of both sidebar and main. This means sticky positioning within sidebar or main is relative to their own scroll context, NOT the viewport.

IntersectionObserver's default root (viewport) does not match the actual scroll container (the `main` element). This disconnect means the observer might never trigger or trigger incorrectly, because elements scrolling within `main`'s overflow context are not actually crossing the viewport's intersection threshold.

**How to avoid:**
1. Before changing any sticky behavior, map the scroll container hierarchy:
   ```
   div.flex.min-h-screen (no overflow)
     TopNav (sticky top-0 -- sticks to viewport, works because no overflow ancestor)
     div.flex.flex-1.overflow-hidden (THIS creates a scroll context boundary)
       Sidebar (inside overflow-hidden parent)
       main.overflow-y-auto (THIS is the actual scroll container for docs)
         DocTableOfContents (sticky inside main's scroll context)
   ```
2. If the sidebar needs to be viewport-sticky (visible at all times while content scrolls), the sidebar must be OUTSIDE the `overflow-hidden` container, or that container's overflow must change to `visible`. The safest pattern is: sidebar uses `position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto` and is a sibling of main, with NO `overflow-hidden` ancestor between them and the viewport.
3. For the TOC IntersectionObserver: set the `root` option to the actual scroll container (`main` element). Use a `ref` on `main` and pass it to the observer. Alternatively, restructure so that `main` does NOT have `overflow-y-auto` and the body/viewport is the scroll container -- this simplifies both sticky behavior and IntersectionObserver.
4. Add `scroll-margin-top` to heading elements to account for the sticky header height: `h2, h3 { scroll-margin-top: 80px; }`. Without this, clicking TOC links scrolls the heading under the sticky header.
5. Test specifically: scroll long doc page, verify TOC active state updates correctly. Click TOC link, verify heading is visible below header (not hidden under it).

**Warning signs:**
- Sidebar stops being visible when scrolling long documents
- TOC active state never changes, or changes incorrectly (highlighting wrong heading)
- Clicking a TOC link scrolls the heading under the sticky header
- On short pages, the TOC or sidebar behaves differently than on long pages
- Mobile layout breaks because overflow rules differ between breakpoints

**Phase to address:**
Phase 2 (Layout shell redesign -- Header + Sidebar) -- this phase must explicitly test scroll behavior with long content. Create a test page with 20+ headings to verify TOC tracking before shipping.

---

### Pitfall 3: Font Loading Causes Layout Shift and FOUT

**What goes wrong:**
The tailwind.config.ts declares `fontFamily.sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif']` and `fontFamily.mono: ['JetBrains Mono', 'Fira Code', 'monospace']`. But index.html contains NO font loading declarations -- no `<link>` to Google Fonts, no local `@font-face`, no preload hints. This means the fonts are either: (a) loaded from a Google Fonts CDN link that was removed, (b) expected to be installed locally on the developer's machine, or (c) relying entirely on the system-ui fallback. In production (Vercel), users without Inter installed locally see system-ui (SF Pro on macOS, Segoe UI on Windows, Roboto on Android). The visual result varies by OS and looks nothing like the design.

Adding Inter via Google Fonts CDN (`<link>` tag) introduces: render-blocking behavior if not handled correctly, Flash of Unstyled Text (FOUT) with font-display: swap, Cumulative Layout Shift (CLS) as metrics change between system font and Inter (Inter is slightly narrower than system-ui), and a third-party dependency on fonts.googleapis.com.

Adding Inter via @fontsource/inter (self-hosted npm package) bundles the font with the app but creates a different problem with Vite: importing @fontsource in the CSS entry point causes Vite to NOT co-bundle the font CSS with the rest of globals.css, resulting in a flash of unstyled text during initial load while the font CSS loads as a separate chunk.

**Why it happens:**
Font loading is often deprioritized because it "looks fine" on the developer's machine (Inter is installed via Figma or Homebrew). The discrepancy only surfaces in production on a clean browser/OS. CLS from font swapping is a subtle metric that is invisible in dev mode (fonts load instantly from local cache) but measurable in Lighthouse on production.

The full Inter Variable WOFF2 file is ~95KB with all alphabets. For a Portuguese-language app, subsetting to Latin Extended reduces this to ~30-40KB. Without subsetting, the font download blocks meaningful paint or causes a visible swap.

**How to avoid:**
1. Use `@fontsource-variable/inter` (npm package): `npm install @fontsource-variable/inter`. Import in main.tsx (NOT in CSS): `import '@fontsource-variable/inter'`. This bundles the font WOFF2 with the Vite build, eliminating the third-party CDN dependency and keeping the font in the same origin.
2. Add `font-display: swap` override and a `size-adjust` on the fallback to reduce CLS:
   ```css
   @font-face {
     font-family: 'Inter Fallback';
     src: local('system-ui');
     size-adjust: 107%;
     ascent-override: 90%;
     descent-override: 22%;
     line-gap-override: 0%;
   }
   ```
   Then in tailwind.config.ts: `fontFamily.sans: ['Inter Variable', 'Inter Fallback', 'system-ui', 'sans-serif']`.
3. For JetBrains Mono (code blocks only), use `@fontsource/jetbrains-mono` with the same pattern. Since code blocks are not above the fold, the font swap is invisible -- but still import it early to avoid pop-in when scrolling to code.
4. Preload the primary font in index.html: `<link rel="preload" as="font" type="font/woff2" href="/fonts/inter-variable-latin.woff2" crossorigin>`. This tells the browser to start downloading the font before it encounters the CSS that references it.
5. Do NOT use Google Fonts CDN. Self-hosting is faster (same origin, no DNS lookup, no connection setup), GDPR-compliant (no IP leakage to Google), and version-locked.

**Warning signs:**
- Text visually "jumps" on first load (layout shift from font swap)
- The app looks different on macOS vs Windows vs Linux
- Lighthouse CLS score degrades after adding fonts
- The `Network` tab shows a request to fonts.googleapis.com or fonts.gstatic.com (external dependency)
- Code blocks use Courier New instead of JetBrains Mono (font not loading)

**Phase to address:**
Phase 1 (Color system + CSS variables + typography foundation) -- font loading must be established before any component work, because all sizing and spacing decisions depend on the font metrics. Changing fonts mid-redesign invalidates previous spacing decisions.

---

### Pitfall 4: TOC Heading ID Mismatch Between Parser and Renderer

**What goes wrong:**
The Table of Contents system has a dual-extraction problem. Headings are extracted in TWO separate places with TWO separate slugification functions:
1. `docs-parser.ts` `extractHeadings()` (line 128): regex-based extraction from raw markdown, produces `DocHeading[]` with `id` values.
2. `MarkdownRenderer.tsx` `slugify()` function (line 7): applied at render time by custom `h2` and `h3` components to set the actual DOM `id` attribute.

Both functions normalize text identically today (lowercase, NFD normalize, strip diacritics, replace non-alphanumeric with hyphens). But they operate on DIFFERENT inputs:
- `extractHeadings()` operates on raw markdown text: `## Stack Aprovada`
- `MarkdownRenderer` components receive the RENDERED children from react-markdown, which may differ (inline code in headings becomes a React element, bold text is wrapped in `<strong>`, etc.)

The `childrenToString()` function in MarkdownRenderer (line 15) recursively extracts text from React element children. If a heading contains inline code (e.g., `## Using \`BlueprintConfig\``), the raw markdown extraction gets `Using \`BlueprintConfig\`` while the renderer's childrenToString gets `Using BlueprintConfig` (backticks stripped). The slugified IDs will differ: `using-blueprintconfig` vs `using-blueprintconfig` -- these happen to match in this case, but for headings with special characters, links, or HTML entities, the two paths can diverge.

The consequence: clicking a TOC link navigates to `#id-from-parser` but the actual DOM element has `id-from-renderer`. The page does not scroll to the heading. The IntersectionObserver looks for `document.getElementById(h.id)` using parser IDs -- it returns null for mismatched headings, and those headings never get highlighted in the TOC.

**Why it happens:**
The architecture has two separate "truth" paths for heading IDs that must produce identical results from different inputs. This is a classic synchronization bug -- it works for simple headings but breaks on edge cases. The extractHeadings function processes raw markdown (before react-markdown parsing), while the slugify function processes the output of react-markdown parsing.

**How to avoid:**
1. Consolidate heading ID generation to a SINGLE function used by both paths. Export the `slugify` function from a shared utility module. Use it in both `extractHeadings` and the MarkdownRenderer custom heading components.
2. Better approach: do NOT extract headings from raw markdown at all. Instead, have the MarkdownRenderer register headings as they render (using a callback or context). The TOC reads headings from what was ACTUALLY rendered, not from what was parsed from raw text. This eliminates the mismatch entirely.
3. If keeping the dual-path approach: add a test that extracts headings from every doc file and verifies each heading ID matches the slugified text from the rendered React element tree. This is a regression test that catches divergence.
4. Be especially careful with headings containing: inline code (backticks), bold/italic markers, links, HTML entities, accented Portuguese characters (acentuacao, descricao), em-dashes, and emojis. These are the most likely to produce different results between raw and rendered text.

**Warning signs:**
- Clicking a TOC link does nothing (no scroll happens)
- TOC active state is always stuck on the first heading or never activates
- `document.getElementById()` returns null in IntersectionObserver setup (visible in console if you add error logging)
- TOC works for simple headings but breaks on headings with formatting

**Phase to address:**
Phase 3 (Doc rendering redesign + TOC) -- this must be addressed when building the redesigned TOC. It is an existing latent bug that becomes more visible when the TOC gets more prominent visual treatment (right sidebar "NESTA PAGINA").

---

### Pitfall 5: Code Block Styling Conflicts Between Prose, MarkdownRenderer, and New Dark Theme

**What goes wrong:**
Code blocks are currently styled in THREE overlapping places:
1. `globals.css` `.prose pre` (line 136-140): sets `bg-[hsl(var(--code-bg))]`, rounded-lg, p-4
2. `globals.css` `.prose code` (line 132-134): sets `bg-muted`, rounded, text-primary for inline code
3. `MarkdownRenderer.tsx` custom `pre` component (line 34-39): sets `bg-[hsl(var(--code-bg))]`, same as CSS but as inline className
4. `MarkdownRenderer.tsx` custom `code` component (line 41-54): detects inline vs block via `!className`, applies different styles

The redesign wants a dark-theme code block (slate-900 background in both light and dark mode, like docs.github.com). The conflict: the `.prose pre` CSS rule and the MarkdownRenderer `pre` component BOTH apply background colors. If a developer updates the CSS variable `--code-bg` but forgets the MarkdownRenderer component (or vice versa), the styles fight. Worse: the MarkdownRenderer component uses `bg-[hsl(var(--code-bg))]` as a className string, which has the SAME specificity as the `.prose pre` rule. Whichever rule appears last in the CSS cascade wins -- and this depends on Tailwind's generated class order, which is non-deterministic between builds.

Additionally, the inline code style (`code` without className) uses `text-primary`. If `--primary` changes from dark charcoal to bright indigo, inline code suddenly appears in vivid blue -- which may conflict with link colors or look out of place in prose text.

**Why it happens:**
The dual styling (CSS rules + React component classNames) is a common pattern in react-markdown setups, but it creates a maintenance burden where changes must be made in multiple places. The specificity battle between `.prose pre { ... }` and the component's `className="... bg-[...]"` is a Tailwind-specific issue: both generate utility classes with the same specificity, and the cascade depends on generation order.

**How to avoid:**
1. Choose ONE authoritative location for code block styles. Recommendation: remove the `.prose pre` and `.prose code` rules from globals.css entirely. Let the MarkdownRenderer custom components be the sole source of styling. This eliminates the specificity conflict.
2. If keeping both (for non-MarkdownRenderer contexts that render `.prose` content), use the `!important` modifier on the MarkdownRenderer component classes OR use a more specific selector like `.prose :where(pre)` to lower the CSS rule's specificity.
3. For inline code: add a dedicated `--code-inline-bg` and `--code-inline-fg` token pair instead of reusing `bg-muted` and `text-primary`. This decouples inline code appearance from the primary color and muted background, which change meaning in the redesign.
4. When switching to dark code blocks in light mode: ensure the `code` element inside `pre` inherits the dark background's foreground color. A common bug is: `pre` gets dark background, but `code` inside it still has `text-primary` (which is now indigo-on-dark, unreadable). The MarkdownRenderer already handles this for block code (line 51: `text-[hsl(var(--code-fg))]`), but verify the cascade does not override it.
5. Test with a doc page that contains: inline code in paragraphs, fenced code blocks (triple backtick), code blocks with language specifiers (```typescript), and code inside table cells. Each context has different CSS cascade paths.

**Warning signs:**
- Code blocks have different backgrounds depending on whether they render via MarkdownRenderer or raw `.prose` CSS
- Inline code is illegible (too-vivid text color on light background, or too-dark on dark background)
- Code blocks flicker or change style between dev reloads (non-deterministic Tailwind class order)
- `pre` has the correct dark background but `code` inside it shows wrong text color

**Phase to address:**
Phase 3 (Doc rendering redesign) -- consolidate code block styling as part of the prose/typography overhaul. Do this before adding syntax highlighting (if planned), because syntax highlighting adds a THIRD layer of styling complexity.

---

### Pitfall 6: Wireframe --wf-* Token Isolation Broken by App Token Changes

**What goes wrong:**
The wireframe design system uses `--wf-*` CSS variables scoped via `[data-wf-theme="light"]` and `[data-wf-theme="dark"]` selectors in `wireframe-tokens.css`. These are fully independent of the app tokens. However, the wireframe components in `tools/wireframe-builder/components/` use Tailwind utility classes that resolve through `tailwind.config.ts`. The config maps BOTH namespaces:
- `bg-primary` -> `hsl(var(--primary))` (app token)
- `bg-wf-card` -> `var(--wf-card)` (wireframe token)

The critical difference: app tokens use `hsl(var(...))` wrapper (HSL channels), while wireframe tokens use `var(...)` directly (hex/rgba values). If the redesign changes `--primary` from `220 16% 22%` (dark charcoal) to `226 100% 55%` (vivid indigo), any wireframe component that accidentally uses `bg-primary` instead of `bg-wf-heading` will visually break. The wireframe should show warm stone grays regardless of the app theme -- but a stray `text-primary` or `border-primary` in a wireframe component links the wireframe appearance to the app palette.

Furthermore: the wireframe viewer pages (WireframeViewer.tsx, SharedWireframeView.tsx) use inline `style={{}}` objects that reference hex values directly. These are immune to token changes. But the viewer chrome (header bar, sidebar navigation, screen tabs) might use a mix of `--wf-*` tokens and hardcoded values. If the redesign team touches these files to "clean up" the styling, they might inadvertently replace hardcoded hex values with Tailwind utilities that resolve to app tokens.

**Why it happens:**
Two token systems with different format conventions (HSL channels vs hex values) coexist in one Tailwind config. Developers using Tailwind autocomplete see both `bg-primary` and `bg-wf-card` and may pick the wrong one without realizing the namespace distinction. The wireframe viewers use inline styles precisely to avoid this problem, but inline styles are often flagged as "code smell" and refactored to Tailwind classes -- which breaks the isolation.

**How to avoid:**
1. Do NOT refactor wireframe viewer inline styles to Tailwind classes during the redesign. The inline styles are intentional isolation. Add a code comment explaining why: `// Inline styles intentional: wireframe chrome must not reference app tokens`.
2. Before making any app token change, grep for app-token usage in wireframe code:
   ```bash
   grep -rn 'text-primary\|bg-primary\|border-primary\|text-accent\|bg-accent\|text-foreground\|bg-background\|bg-muted\|text-muted' tools/wireframe-builder/
   ```
   Any matches in wireframe component code are potential isolation leaks.
3. Add a lint rule or code review checklist: files in `tools/wireframe-builder/components/` should ONLY use `wf-*` Tailwind classes for colors. Never `bg-primary`, `text-foreground`, `bg-muted` etc.
4. The `globals.css` import order matters: `@import wireframe-tokens.css` is at line 2, before `@tailwind base`. If the import order changes during the redesign, wireframe tokens might be overridden by the `@layer base` rules. Keep the import order stable.
5. Test: after changing app palette, open a wireframe. Every color should be unchanged. If anything shifts, there is a token leak.

**Warning signs:**
- Wireframe header or sidebar changes color after the app redesign (should not)
- Wireframe chart colors shift (should remain gold/amber palette)
- A wireframe component shows indigo accents instead of gold
- Toggling app dark mode affects wireframe appearance (wireframe has its own dark/light toggle)

**Phase to address:**
Phase 1 (Color system + CSS variables) -- verify wireframe isolation IMMEDIATELY after changing app tokens. This is a validation step, not a build step. Add it to the phase completion checklist.

---

### Pitfall 7: Radix UI Dialog/Select Scroll Lock Causes Header Layout Shift

**What goes wrong:**
The app uses Radix UI primitives (Dialog, Select, Popover) via shadcn/ui. When a Dialog opens, Radix's internal `react-remove-scroll` library locks body scrolling by adding `overflow: hidden` and a compensating `padding-right` to the body element (to account for the removed scrollbar). The TopNav header is `sticky top-0` with `bg-background/90 backdrop-blur`. When body scrolling is locked, the scrollbar disappears, the body gets padding-right, but the sticky header does NOT get the same padding-right compensation. The header "jumps" laterally by the scrollbar width (~15px). This is visible as a horizontal layout shift every time a Dialog or Select is opened.

This is a known issue with Radix UI (Discussion #1586, Discussion #1100 on GitHub). It affects every component that uses `react-remove-scroll`: Dialog, AlertDialog, Sheet, Select dropdown, and any custom component using ScrollArea.

**Why it happens:**
`react-remove-scroll` compensates for scrollbar removal by adding `padding-right` to the body, but it cannot automatically compensate for `position: sticky` or `position: fixed` elements because it does not know about them. The library provides a `data-remove-scroll-bar` attribute when scroll is locked, but the developer must explicitly handle the compensation for fixed/sticky elements.

**How to avoid:**
1. Add `scrollbar-gutter: stable` to the `html` element in globals.css:
   ```css
   html {
     scrollbar-gutter: stable;
   }
   ```
   This permanently reserves space for the scrollbar, so removing it causes no layout shift. The tradeoff: a subtle empty gutter appears on short pages where no scrollbar is needed.
2. Additionally, override react-remove-scroll's body padding when it activates:
   ```css
   body[data-scroll-locked] {
     margin-right: 0 !important;
     overflow: visible !important;
   }
   ```
   This is the commonly recommended fix from Radix UI discussions.
3. Alternative (less aggressive): detect when scroll is locked and apply the same padding-right to the header element. This requires JavaScript and is more fragile.
4. Test with: open a Dialog on a page with a scrollbar. Verify the header does not shift horizontally. Test on Windows (always-visible scrollbar) and macOS (overlay scrollbar, less visible but still shifts).

**Warning signs:**
- Header bar "jumps" to the right when a modal/dialog opens
- Content behind the dialog shifts slightly when the dialog appears
- The issue is more visible on Windows than macOS (Windows uses non-overlay scrollbars by default)
- The search command palette (cmdk, which uses Dialog internally) causes header shift

**Phase to address:**
Phase 2 (Layout shell redesign -- Header) -- add `scrollbar-gutter: stable` as part of the header redesign. This is a one-line fix that prevents the problem globally.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Duplicating code block styles in globals.css AND MarkdownRenderer | Both .prose context and component context are styled | Two places to update for every code block change; specificity conflicts | Never -- consolidate to one source before the redesign |
| Using `bg-[hsl(var(--code-bg))]` arbitrary values instead of extending Tailwind config | Quick, no config change needed | Cannot use opacity modifiers, no IntelliSense, harder to search | Acceptable short-term; migrate to proper `code` color in Tailwind config theme extension |
| Not adding scroll-margin-top to headings | Works "fine" if nobody clicks TOC links | Clicking any TOC link scrolls heading under sticky header | Never -- add scroll-margin-top on same PR as any header height change |
| Extracting headings from raw markdown instead of rendered output | Simpler, no React integration needed | Breaks on headings with inline formatting; ID mismatch with rendered DOM | Acceptable for plain text headings only; must fix if headings will contain code or formatting |
| Importing font via `<link>` to Google Fonts CDN | Zero config, fast to add | Third-party dependency, GDPR concern, no version lock, potential render blocking | Only for quick prototyping; self-host before production |
| Using `!className` to detect inline vs block code in MarkdownRenderer | Simple heuristic | Breaks if react-markdown changes its className behavior, or if a syntax highlighter adds className to inline code | Acceptable for now; will need revisiting if adding syntax highlighting |

## Integration Gotchas

Common mistakes when connecting to external services and libraries.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| react-markdown + custom components | Applying styles in BOTH `.prose` CSS and component `className` -- leads to specificity wars | Choose one: either `.prose` CSS rules for ALL markdown elements, OR custom components for ALL styled elements. Do not mix. |
| IntersectionObserver + nested scroll | Using default `root: null` (viewport) when content scrolls in a child container | Set `root` to the actual scroll container element via React ref. Or restructure layout so the viewport IS the scroll container. |
| @fontsource + Vite | Importing in CSS file (`@import '@fontsource-variable/inter'` in globals.css) | Import in JS entry point (`import '@fontsource-variable/inter'` in main.tsx). Vite bundles JS imports better than CSS-imported packages. |
| Clerk + shadcn theme | Clerk components inherit shadcn CSS variables and may look wrong after palette change | Verify Clerk's `appearance: { theme: shadcn }` still looks correct with the new palette. Clerk's sign-in/sign-up pages use shadcn tokens directly. |
| tailwindcss-animate + backdrop-blur | Animated elements inside backdrop-blur containers cause GPU compositing issues | Add `will-change: transform` to the backdrop-blur element. Avoid animating children of backdrop-blur elements if possible. |
| Radix primitives + sticky elements | Scroll lock from Dialog/Select/Popover causes layout shift on sticky/fixed elements | Add `scrollbar-gutter: stable` to html element globally. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| backdrop-filter: blur() on large elements | Janky scrolling, high GPU memory, dropped frames on mobile | Limit blur to small-area elements (header bar). Avoid blur on full-page overlays. Add will-change: transform. | Immediately on low-end mobile; subtle on desktop |
| Loading full Inter Variable font (95KB) without subsetting | Slow first contentful paint, visible font swap | Subset to latin/latin-extended (~30-40KB). Use @fontsource-variable/inter with wght.css import for axes control. | On 3G connections or first-time visitors without cache |
| IntersectionObserver with many heading elements | Observer fires excessively on scroll, causing TOC re-renders | Use `threshold: 0` (already done). Avoid observing elements that are off-screen. Disconnect observer on route change. | At 50+ headings per page (unlikely but possible in long docs) |
| CSS custom properties on every element | Parsing overhead from deep inheritance chains | Keep custom properties on :root and theme containers only. Avoid redefining properties on individual elements. | At 1000+ DOM nodes with property lookups (measurable but rarely problematic) |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Loading fonts from external CDN (fonts.googleapis.com) without SRI | CDN compromise could inject malicious CSS/font files | Self-host fonts. If using CDN, add `integrity` and `crossorigin` attributes to link tags. |
| Removing CSP headers during redesign "to fix styling issues" | Opens the app to XSS and injection attacks | If a style is blocked by CSP, add the specific source to the CSP allowlist. Never remove CSP entirely. |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Changing colors without updating dark mode simultaneously | Dark mode becomes broken or unreadable until "fixed later" | Every color change to `:root` must have a corresponding `.dark` change in the same commit. |
| TOC appears on short pages where it adds no value | Empty or single-item TOC wastes horizontal space | Already handled (condition: `headings.length > 1`). Verify this threshold is still appropriate with the new design. |
| Breadcrumb + badge + title + separator creates too much vertical space before content | User must scroll past header chrome to read content | Keep above-the-fold header to max ~120px. Combine breadcrumb and badge on one line if possible. |
| Sticky header with backdrop-blur appears "glitchy" when content scrolls through it | Blur creates visual noise, especially with colored content | Use a subtle blur (8px max) with a semi-opaque background color. Ensure the header has a bottom border for visual separation even without blur. |
| Search command palette (Cmd+K) styling clashes with new palette | Search appears to be from a different design system | The search uses cmdk + Dialog from shadcn/ui. It inherits tokens automatically. But verify it looks correct with the new palette, especially the input field and result highlights. |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Color migration:** Opacity modifiers work. Check `bg-primary/10`, `bg-background/90`, `bg-muted/50` specifically -- each should produce a visible semi-transparent result, not transparency or solid color.
- [ ] **Dark mode:** Every `:root` variable has a `.dark` counterpart. Toggle dark mode on every page type (doc, home, client, wireframe viewer, login). No white-on-white or dark-on-dark text.
- [ ] **Sticky header:** Open a Radix Dialog (search, any modal). Header does not shift horizontally. Test on a page that has a scrollbar.
- [ ] **TOC scroll tracking:** Scroll a long doc page. Active heading in TOC updates correctly. Click a TOC link -- heading appears BELOW the sticky header, not behind it.
- [ ] **TOC heading IDs:** For every heading in a doc page, the DOM element ID matches the TOC link href. Verify with DevTools on a page with headings containing Portuguese accents or inline code.
- [ ] **Font loading:** Open the app in an incognito window. Text should not visibly "jump" as fonts load. Network tab should show no requests to external font CDNs.
- [ ] **Code blocks:** Light mode: code block has dark background, readable text. Dark mode: code block is visually distinct from surrounding dark background. Inline code is readable against both light and dark backgrounds.
- [ ] **Wireframe isolation:** After the redesign, open a wireframe viewer. All wireframe colors should be the same as before the redesign (warm stone grays + gold accent). No indigo leakage.
- [ ] **Clerk auth pages:** Sign-in and sign-up pages look correct with the new palette. Clerk uses shadcn theme tokens, so palette changes cascade automatically -- verify they cascade correctly.
- [ ] **Search palette (Cmd+K):** Open the search command palette. Input, results, and highlights should use the new design system consistently.
- [ ] **Mobile layout:** Sidebar collapses correctly on mobile. No horizontal scroll. Sticky header works on iOS Safari (notorious for sticky bugs).

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Opacity modifiers broken (hsl wrapping error) | LOW | Fix the CSS variable format (remove hsl wrapper from variable definition). Single-file change in globals.css. |
| Sticky layout broken (overflow ancestor blocks sticky) | MEDIUM | Restructure Layout.tsx flex/overflow hierarchy. May require changing how sidebar and main relate. Test all pages after. |
| Font loading CLS in production | LOW | Add @fontsource-variable/inter package and import. Add preload hint. Single session of work. |
| TOC heading ID mismatch | MEDIUM | Consolidate to single slugify function. Add regression test for all doc headings. Requires touching parser and renderer. |
| Code block style conflicts | LOW | Remove duplicate .prose pre/code rules from globals.css. Single-file change. |
| Wireframe token leak from app redesign | MEDIUM | Grep for app token usage in wireframe code. Replace with --wf-* equivalents. May require touching 10+ wireframe component files. |
| Dialog scroll-lock header shift | LOW | Add scrollbar-gutter: stable to html. One-line CSS fix. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Color system opacity breakage (Pitfall 1) | Phase 1 -- Color system | Toggle dark mode. Check DevTools for `hsl(hsl(...))` patterns. Verify `bg-primary/10` renders semi-transparent. |
| Sticky triple-scroll conflict (Pitfall 2) | Phase 2 -- Layout shell | Scroll long doc page. TOC tracks. Sidebar sticks. Click TOC link -- heading visible below header. |
| Font loading CLS/FOUT (Pitfall 3) | Phase 1 -- Typography foundation | Incognito window load. No text jump. No external font requests in Network tab. |
| TOC heading ID mismatch (Pitfall 4) | Phase 3 -- Doc rendering + TOC | Click every TOC link on a complex doc page. Each scrolls to correct heading. |
| Code block style conflicts (Pitfall 5) | Phase 3 -- Doc rendering | Page with code blocks in light + dark mode. No style flickering. Consistent backgrounds. |
| Wireframe token isolation (Pitfall 6) | Phase 1 -- Color system (validation) | After app palette change: open wireframe. Colors unchanged. Toggle app dark mode: wireframe unaffected. |
| Dialog scroll-lock shift (Pitfall 7) | Phase 2 -- Header redesign | Open Cmd+K search, any dialog. Header stays in place. Test on Windows (non-overlay scrollbar). |

## Sources

- FXL Core codebase: `src/styles/globals.css` -- current CSS variable definitions (HSL channel format), prose styles, code block tokens
- FXL Core codebase: `tailwind.config.ts` -- color mapping with `hsl(var(...))` wrapper, font family declarations, wf-* token mapping
- FXL Core codebase: `src/components/layout/Layout.tsx` -- flex layout with overflow-hidden parent, overflow-y-auto main
- FXL Core codebase: `src/components/layout/TopNav.tsx` -- sticky header with backdrop-blur, bg-background/90 opacity modifier
- FXL Core codebase: `src/components/layout/Sidebar.tsx` -- nav items using bg-primary/10 for active state
- FXL Core codebase: `src/components/docs/DocTableOfContents.tsx` -- IntersectionObserver without explicit root, sticky top-8 positioning
- FXL Core codebase: `src/components/docs/MarkdownRenderer.tsx` -- dual slugify, custom pre/code components with inline bg-[hsl(var(...))]
- FXL Core codebase: `src/lib/docs-parser.ts` -- extractHeadings from raw markdown, separate slugification
- FXL Core codebase: `tools/wireframe-builder/styles/wireframe-tokens.css` -- [data-wf-theme] scoped tokens with hex values
- FXL Core codebase: `tools/wireframe-builder/lib/wireframe-theme.tsx` -- WireframeThemeProvider with data-wf-theme attribute
- FXL Core codebase: `index.html` -- no font loading declarations
- [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming) -- CSS variable convention, HSL channel format requirement
- [Tailwind CSS v4 shadcn migration](https://github.com/tailwindlabs/tailwindcss/discussions/17645) -- prose conflict with Tailwind preflight
- [Radix UI scroll lock discussion #1586](https://github.com/radix-ui/primitives/discussions/1586) -- react-remove-scroll header shift
- [Radix UI layout shift discussion #1100](https://github.com/radix-ui/primitives/discussions/1100) -- scrollbar-gutter: stable fix
- [shadcn/ui backdrop-filter performance #327](https://github.com/shadcn-ui/ui/issues/327) -- GPU compositing concerns
- [Smashing Magazine: sticky headers + full-height elements](https://www.smashingmagazine.com/2024/09/sticky-headers-full-height-elements-tricky-combination/) -- overflow ancestor kills sticky
- [MDN IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) -- root option behavior with nested scroll containers
- [Fontsource Inter Variable](https://fontsource.org/fonts/inter/install) -- npm self-hosting setup
- [DebugBear font performance guide](https://www.debugbear.com/blog/website-font-performance) -- WOFF2 subsetting, font-display, size-adjust
- [Pimp my Type: Inter font hosting](https://pimpmytype.com/google-fonts-hosting/) -- self-hosting vs Google Fonts comparison

---
*Pitfalls research for: Visual redesign of FXL Core -- color migration, sticky layouts, font loading, TOC extraction, code blocks, wireframe isolation*
*Researched: 2026-03-10*
