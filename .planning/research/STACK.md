# Stack Research: v1.2 Visual Redesign

**Domain:** Visual redesign of internal documentation platform (React + Tailwind + Vite)
**Researched:** 2026-03-10
**Confidence:** HIGH (all recommendations verified against npm registry and existing codebase)

## Scope

This research covers ONLY additions/changes needed for the v1.2 visual redesign. The existing stack (React 18, TypeScript strict, Tailwind CSS 3.4, Vite 5, shadcn/ui, react-markdown 9 + remark-gfm 4, lucide-react) is validated and unchanged.

Four target areas:
1. Font loading (Inter variable font for body, JetBrains Mono for code)
2. Color system refinement (slate + indigo palette via CSS variables)
3. Code block syntax highlighting (dark themed, language-aware)
4. Layout changes (backdrop-blur header, sticky sidebar, right-side TOC) -- pure CSS/Tailwind, no new dependencies

**Critical constraint from PROJECT.md:** "React 18 + TypeScript strict + Tailwind + Vite + Vercel -- nao muda." Also: Tailwind v4 and React 19 are explicitly out of scope.

---

## Recommended Stack Additions

### 1. Font Loading: Self-Hosted Variable Fonts

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @fontsource-variable/inter | 5.2.8 | Self-hosted Inter variable font (100-900 weight range) | Eliminates external Google Fonts dependency. Single file covers all weights via variable font axes. ~150KB woff2. No FOUT/FOUC from network-loaded fonts. Vite bundles it with the app. Already referenced in tailwind.config.ts as fontFamily.sans but currently NOT loaded -- this fixes it. |
| @fontsource-variable/jetbrains-mono | 5.2.8 | Self-hosted JetBrains Mono variable font for code blocks | Already referenced in tailwind.config.ts as fontFamily.mono but currently NOT loaded. Used in .prose code/pre styles. Variable font = one file covers all weights. ~100KB woff2. |

**Current state (problem):** The `tailwind.config.ts` already declares `fontFamily.sans: ['Inter Variable', 'Inter', ...]` and `fontFamily.mono: ['JetBrains Mono', ...]` but neither font is actually loaded anywhere. There is no `@import` in CSS, no `<link>` in index.html, no fontsource package installed. The fonts fall back to system-ui silently.

**Why self-hosted (fontsource), NOT Google Fonts CDN:**
- The reference HTML uses `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700` -- this loads static weight files (one per weight = 5 HTTP requests + FOUT)
- `@fontsource-variable/inter` loads ONE variable font file that covers the entire 100-900 weight range
- No external network dependency, no GDPR/privacy concerns, no flash of unstyled text on slow connections
- Vite includes it in the build output, served from same CDN as the app (Vercel)
- This is the standard approach for Vite + React apps in 2026

**Integration (two lines of CSS):**
```css
/* In src/styles/globals.css, at the very top before @tailwind directives */
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
```

No changes needed in `tailwind.config.ts` -- the fontFamily declarations already match. No changes in `index.html`.

### 2. Code Block Syntax Highlighting

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| rehype-highlight | 7.0.2 | Syntax highlighting for code blocks in react-markdown | Plugs directly into react-markdown as rehypePlugin. Uses lowlight (highlight.js) under the hood. 37 common languages bundled by default (JS, TS, Python, SQL, bash, JSON, CSS, HTML -- covers all doc content). Adds CSS classes to tokens for theming. Compatible with react-markdown 9.x (both use @types/hast ^3.0.0 and vfile ^6.0.0). |

**Why rehype-highlight, NOT shiki/rehype-pretty-code:**
- rehype-highlight is a rehype plugin designed for the react-markdown pipeline the project already uses
- It adds semantic CSS classes (`hljs-keyword`, `hljs-string`, etc.) that can be styled with the existing CSS variable system
- shiki uses inline styles (harder to theme dynamically with light/dark mode toggle)
- rehype-pretty-code is designed for build-time MDX processing, not runtime react-markdown rendering
- react-shiki is a standalone component, not a rehype plugin -- would require replacing the MarkdownRenderer architecture
- rehype-highlight is ~15KB + lowlight bundles only 37 languages by default (not the full 5.4MB highlight.js)

**Why NOT react-syntax-highlighter:**
- Legacy library (based on Prism/highlight.js but with heavier wrappers)
- Requires replacing the `<pre>` and `<code>` components in the MarkdownRenderer with custom rendering logic
- rehype-highlight works at the AST level before rendering -- cleaner integration

**Integration:**
```typescript
// In MarkdownRenderer.tsx
import rehypeHighlight from 'rehype-highlight'

// Add to ReactMarkdown
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}  // <-- add this
  components={components}
>
```

**Theming approach:** Create a custom highlight.js theme using the existing `--code-bg` and `--code-fg` CSS variables plus new token-specific variables. This keeps light/dark mode working automatically via the existing `.dark` class toggle.

```css
/* Custom highlight.js theme using CSS variables (add to globals.css) */
:root {
  --code-keyword: 199 89% 48%;    /* cyan-ish */
  --code-string: 142 71% 45%;     /* green */
  --code-comment: 215 14% 50%;    /* muted gray */
  --code-number: 27 96% 61%;      /* orange */
  --code-function: 226 70% 65%;   /* indigo-blue */
  --code-type: 45 93% 47%;        /* amber */
}

.hljs { background: hsl(var(--code-bg)); color: hsl(var(--code-fg)); }
.hljs-keyword { color: hsl(var(--code-keyword)); }
.hljs-string { color: hsl(var(--code-string)); }
.hljs-comment { color: hsl(var(--code-comment)); font-style: italic; }
.hljs-number { color: hsl(var(--code-number)); }
.hljs-function .hljs-title { color: hsl(var(--code-function)); }
.hljs-type, .hljs-built_in { color: hsl(var(--code-type)); }
```

---

## Tailwind Config Changes (No New Packages)

### Color System: Slate + Indigo via CSS Variables

**No Tailwind config changes needed for slate/indigo.** Both `slate-*` and `indigo-*` are built-in Tailwind CSS 3 color palettes, available as utility classes (`bg-slate-50`, `text-indigo-600`, `border-slate-200`, etc.) without any configuration.

**The change is in CSS variables (globals.css), not tailwind.config.ts.** The current color system uses HSL variables (`--primary`, `--accent`, etc.) mapped to a blue-gray + gold palette. The redesign shifts these variables to align with slate (neutral grays) and indigo (accent):

```css
/* BEFORE (current): blue-gray + gold */
--primary: 220 16% 22%;           /* dark blue-gray */
--accent: 43 96% 56%;             /* gold */
--sidebar: 220 16% 98%;           /* blue-tinted white */

/* AFTER (redesign): slate + indigo */
--primary: 226 70% 55%;           /* indigo-600 equivalent */
--accent: 226 70% 55%;            /* indigo-600 (replaces gold) */
--sidebar: 210 40% 98%;           /* slate-50/50 equivalent */
```

**Why CSS variables, NOT direct Tailwind colors?** The existing architecture (shadcn/ui) maps component colors to CSS variables (`hsl(var(--primary))`). Changing the variable values changes every shadcn component automatically. Using `bg-indigo-600` directly would bypass this system and create inconsistency.

**The reference HTML mixes direct Tailwind colors (`text-indigo-600`, `bg-slate-50/50`) with the CSS variable system.** The implementation should map the reference design's indigo/slate values INTO the existing CSS variable system, not replace it. This preserves shadcn/ui compatibility.

### Prose Typography Scale

The reference HTML uses `text-4xl font-extrabold tracking-tight sm:text-5xl` for page titles. The current `.prose h1` uses `text-2xl font-bold`. This is a CSS change in globals.css, not a Tailwind config change:

```css
/* Adjust prose scale to match reference design */
.prose h1 { @apply text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl; }
.prose h2 { @apply text-2xl font-bold tracking-tight text-foreground; }
.prose h3 { @apply text-xl font-semibold text-foreground; }
.prose p  { @apply text-base leading-relaxed text-muted-foreground; }  /* was text-sm */
```

### Backdrop-Blur, Sticky Positioning, Scrollbar Styling

All are built-in Tailwind CSS 3 utilities. No config changes:
- `backdrop-blur-md` -- already used in TopNav (`bg-background/90 backdrop-blur`)
- `sticky top-0` / `sticky top-16` -- native CSS, already used in TopNav
- `h-[calc(100vh-64px)]` -- arbitrary value for sidebar height below header
- Scrollbar styling uses `::-webkit-scrollbar` pseudo-elements (pure CSS, add to globals.css)

---

## What Stays Unchanged

| Technology | Current Version | Why No Change |
|------------|----------------|---------------|
| react | ^18.3.1 | Visual redesign is CSS/component-level. No React API changes needed. |
| typescript | ^5.6.3 | Strict mode unchanged. Type changes are minimal (TOC heading types already exist). |
| tailwindcss | ^3.4.15 | All needed utilities (backdrop-blur, sticky, slate/indigo colors) are built-in. |
| vite | ^5.4.10 | No build config changes. Fontsource imports just work with Vite's CSS pipeline. |
| react-markdown | ^9.0.1 | rehype-highlight plugs in via rehypePlugins prop. No version change. |
| remark-gfm | ^4.0.0 | GFM parsing unchanged. |
| shadcn/ui components | all current | Badge, Button, Separator, ScrollArea already installed. May need minor style overrides. |
| lucide-react | ^0.460.0 | Icons unchanged. Home, ChevronDown, ChevronRight already used in sidebar. |
| tailwindcss-animate | ^1.0.7 | Animation plugin unchanged. |
| cmdk | ^1.1.1 | Search command unchanged (already in header). |

---

## What NOT to Add

### @tailwindcss/typography Plugin: NOT NEEDED

The `@tailwindcss/typography` plugin provides a `prose` class with opinionated styles. This project already has a custom `.prose` class in `globals.css` with styles tuned for the design system. Adding the plugin would:
- Conflict with existing `.prose` styles
- Add ~7KB of CSS for styles that would be overridden anyway
- Create confusion about which prose styles are active

The existing hand-rolled `.prose` class is correct. Just update the font sizes and spacing to match the reference design.

### Tailwind v4 / CSS-First Config: EXPLICITLY OUT OF SCOPE

Per PROJECT.md: "Tailwind v4 -- estabilidade da stack, upgrade futuro". Tailwind v4 changes the configuration model entirely (CSS-based config instead of JS/TS). Mixing this with the visual redesign would be two migrations in one. The visual redesign works perfectly with Tailwind 3.4.

### Custom Scrollbar Libraries (simplebar, overlay-scrollbar): NOT NEEDED

The reference HTML uses `::-webkit-scrollbar` pseudo-elements for thin scrollbar styling. This is 8 lines of CSS. No library needed. Works in all Chromium browsers and Safari. Firefox uses `scrollbar-width: thin` and `scrollbar-color` properties as fallback.

### MDX / mdx-js: NOT NEEDED

The docs are .md files parsed by a custom parser with tag extensions (`{% callout %}`, `{% operational %}`, etc.). There is no need for JSX-in-markdown. The parser + react-markdown + custom components handle everything. MDX would require replacing the entire docs pipeline.

### Headless UI / Floating UI: NOT NEEDED

The sidebar, TOC, and header are standard positioned elements (sticky, fixed). No floating/anchored UI needed. Radix primitives (already installed for shadcn/ui) cover popover/tooltip needs.

### CSS Modules / CSS-in-JS: NOT NEEDED

The project uses Tailwind utilities + CSS variables + globals.css. This is the correct architecture for shadcn/ui. Adding a different styling paradigm would fragment the approach.

### react-scroll / react-scrollspy: NOT NEEDED

The DocTableOfContents component already implements scroll-spy using IntersectionObserver (see `src/components/docs/DocTableOfContents.tsx`). The existing implementation:
- Observes heading elements by ID
- Updates `activeId` state on intersection
- Highlights the active heading in the TOC

This works. The redesign just needs visual style updates (indigo accent, border-l indicator, nested h3 indentation), not a library replacement.

### highlight.js Full Package: NOT NEEDED

`rehype-highlight` uses `lowlight` which bundles 37 common languages by default. The docs contain JavaScript, TypeScript, bash, JSON, YAML, CSS, HTML, and SQL code blocks -- all covered by the default bundle. Importing highlight.js directly or registering additional languages is unnecessary.

---

## Installation Plan

```bash
# Font packages (runtime dependencies -- Vite bundles the font files)
npm install @fontsource-variable/inter@^5.2.8 @fontsource-variable/jetbrains-mono@^5.2.8

# Syntax highlighting (runtime dependency -- rehype plugin for react-markdown)
npm install rehype-highlight@^7.0.2
```

**Total: 3 npm packages.** No dev dependencies. No shadcn/ui components to add. No Tailwind plugins.

**Bundle size impact:**
- @fontsource-variable/inter: ~150KB woff2 (variable font, all weights)
- @fontsource-variable/jetbrains-mono: ~100KB woff2 (variable font, all weights)
- rehype-highlight: ~15KB JS + lowlight with 37 default languages

These are acceptable for a documentation platform where font quality and code readability directly affect user experience.

---

## Integration Details

### A. Font Loading Integration

**Step 1:** Install packages (see Installation Plan above).

**Step 2:** Add imports to globals.css (before @tailwind directives):

```css
/* src/styles/globals.css -- add at very top */
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
@import '@clerk/ui/themes/shadcn.css';
@import '../../tools/wireframe-builder/styles/wireframe-tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3:** No changes to tailwind.config.ts. The fontFamily is already correct:
```typescript
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

**Step 4:** No changes to index.html. No `<link>` tags needed.

**Step 5:** Add `antialiased` to body if not already present (the reference HTML uses it):
```css
body {
  @apply bg-background text-foreground antialiased;
  font-feature-settings: "rlig" 1, "calt" 1;
}
```

### B. Color System Migration

**The CSS variables in globals.css need to shift from blue-gray + gold to slate + indigo.** This is the core visual change. Here is the mapping from the reference HTML to CSS variables:

| Reference HTML Class | Current CSS Variable | New Value (HSL) | Tailwind Equivalent |
|---------------------|---------------------|-----------------|-------------------|
| `text-slate-900` | `--foreground` | `222 47% 11%` | slate-900 (keep) |
| `bg-white` | `--background` | `0 0% 100%` | white |
| `bg-slate-50/50` | `--sidebar` | `210 40% 98.5%` | ~slate-50 at 50% opacity |
| `text-indigo-600` | `--primary` | `239 84% 67%` | indigo-600 |
| `bg-indigo-50` | `--accent` | `226 100% 97%` | indigo-50 (light accent bg) |
| `text-slate-400` | `--muted-foreground` | `215 16% 47%` | ~slate-400 (keep) |
| `border-slate-200` | `--border` | `214 32% 91%` | ~slate-200 (keep) |
| `bg-slate-900` (code) | `--code-bg` | `222 47% 11%` | ~slate-900 |

**Key insight:** Most current values already align with slate. The main change is `--primary` and `--accent` shifting from dark blue-gray / gold to indigo. The sidebar background adds the semi-transparent effect (bg-slate-50/50 in the reference).

### C. Syntax Highlighting Integration

**Step 1:** Add rehype-highlight to MarkdownRenderer:

```typescript
// src/components/docs/MarkdownRenderer.tsx
import rehypeHighlight from 'rehype-highlight'

// In the ReactMarkdown component
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={components}
>
```

**Step 2:** Remove the manual code/pre component overrides from the `components` object (rehype-highlight handles code block class assignment). Keep the inline code styling.

**Step 3:** Add highlight.js theme CSS variables to globals.css (see color system section above). The theme uses HSL CSS variables so it automatically adapts to light/dark mode via the `.dark` class.

### D. Layout Restructuring (Pure CSS)

The Layout.tsx changes are structural, not dependency-related:

**Current layout:**
```
[TopNav (sticky)]
[Sidebar | Main]
```

**Target layout (from reference):**
```
[Header (sticky top-0, backdrop-blur-md, bg-white/80)]
[Sidebar (sticky top-16, h-[calc(100vh-64px)]) | Main (max-w-4xl) | TOC (sticky top-16, hidden xl:block)]
```

The `DocTableOfContents` component already exists with IntersectionObserver scroll-spy. It needs:
1. Move from inside main content area to a sibling of main (in Layout or doc page)
2. Style updates: `sticky top-16`, `h-[calc(100vh-64px)]`, `w-64`, indigo active link color
3. Nested h3 items with `border-l border-slate-200 pl-4` for visual hierarchy

All achievable with existing Tailwind utilities. No new components or libraries.

### E. Scrollbar Styling (Pure CSS)

Add to globals.css:

```css
/* Thin scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }

/* Firefox fallback */
* { scrollbar-width: thin; scrollbar-color: hsl(var(--border)) transparent; }
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| @fontsource-variable/inter (self-hosted) | Google Fonts CDN link in index.html | External dependency, FOUT on slow connections, GDPR concerns, loads 5 static weight files instead of 1 variable font |
| @fontsource-variable (variable) | @fontsource/inter (static weights) | Variable font = 1 file for all weights (~150KB). Static = 1 file per weight (5 x ~25KB = ~125KB but 5 HTTP requests). Variable also enables arbitrary font-weight values. |
| rehype-highlight (CSS class-based) | shiki / rehype-pretty-code (inline styles) | Shiki generates inline styles that cannot be themed with CSS variables. rehype-highlight adds CSS classes that work with the existing light/dark mode toggle. |
| rehype-highlight (CSS class-based) | react-syntax-highlighter | Legacy wrapper library with heavier bundle. Does not integrate as rehype plugin -- requires replacing MarkdownRenderer component structure. |
| CSS variable palette shift | Direct Tailwind color classes (bg-indigo-600) | Would bypass the shadcn/ui CSS variable system. Components like Badge, Button use hsl(var(--primary)). Changing the variable value changes everything consistently. |
| Custom .prose styles (keep) | @tailwindcss/typography plugin | Would conflict with existing .prose rules. Plugin provides opinionated styles we would override anyway. |
| IntersectionObserver scroll-spy (keep) | react-scroll / react-scrollspy library | Already implemented and working in DocTableOfContents. No reason to add a dependency for existing functionality. |
| ::-webkit-scrollbar CSS | simplebar / perfect-scrollbar library | 8 lines of CSS vs a JavaScript library. Thin scrollbars are a visual polish detail, not a complex interaction. |

---

## Version Compatibility Matrix

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @fontsource-variable/inter@5.2.8 | Vite 5.x, any CSS bundler | Pure CSS + woff2 files. No JS runtime. Imported via CSS @import. |
| @fontsource-variable/jetbrains-mono@5.2.8 | Vite 5.x, any CSS bundler | Same as above. |
| rehype-highlight@7.0.2 | react-markdown@^9.0.1 | Both use @types/hast ^3.0.0, vfile ^6.0.0. Direct compatibility confirmed via npm dependency trees. |
| rehype-highlight@7.0.2 (via lowlight@3.3.0) | highlight.js ~11.11.0 | lowlight pins highlight.js. 37 common languages bundled. |
| Tailwind CSS 3.4.19 | All new features | backdrop-blur-md, slate-*, indigo-*, arbitrary values [calc(100vh-64px)] all built-in. |

---

## Summary of Changes

**3 npm packages to install:**
- `@fontsource-variable/inter` -- self-hosted Inter variable font (body text)
- `@fontsource-variable/jetbrains-mono` -- self-hosted JetBrains Mono variable font (code blocks)
- `rehype-highlight` -- syntax highlighting for react-markdown code blocks

**0 npm packages changed.** Everything else stays at current versions.

**0 Tailwind config changes.** fontFamily already declares Inter and JetBrains Mono. Colors use CSS variables, not Tailwind config.

**0 new shadcn/ui components.** Badge, Button, Separator, ScrollArea already installed. Style overrides only.

**Files to modify (CSS/components, not dependencies):**
- `src/styles/globals.css` -- font imports, CSS variable palette shift, prose scale, code theme, scrollbar styling
- `src/components/docs/MarkdownRenderer.tsx` -- add rehypeHighlight plugin
- `src/components/layout/Layout.tsx` -- three-column layout structure
- `src/components/layout/TopNav.tsx` -- backdrop-blur + brand styling
- `src/components/layout/Sidebar.tsx` -- visual style (bg-slate-50/50, border-l nav, indigo accent)
- `src/components/docs/DocTableOfContents.tsx` -- visual style + position to right column
- `src/components/docs/DocPageHeader.tsx` -- larger title (4xl/5xl), indigo badge
- `src/components/docs/DocBreadcrumb.tsx` -- minor style updates

---

## Sources

- [npm: @fontsource-variable/inter](https://www.npmjs.com/package/@fontsource-variable/inter) -- v5.2.8, 221K weekly downloads, verified via `npm view`
- [npm: @fontsource-variable/jetbrains-mono](https://www.npmjs.com/package/@fontsource-variable/jetbrains-mono) -- v5.2.8, verified via `npm view`
- [Fontsource variable fonts docs](https://fontsource.org/docs/getting-started/variable) -- import method, axis support
- [npm: rehype-highlight](https://www.npmjs.com/package/rehype-highlight) -- v7.0.2, verified compatible with react-markdown 9.x via shared hast/vfile versions
- [rehype-highlight GitHub](https://github.com/rehypejs/rehype-highlight) -- usage, language detection, CSS class output
- [Tailwind CSS v3 colors](https://v3.tailwindcss.com/docs/customizing-colors) -- slate and indigo palettes built-in
- [shadcn/ui colors](https://ui.shadcn.com/colors) -- CSS variable approach for theming
- Existing codebase: `tailwind.config.ts`, `globals.css`, `MarkdownRenderer.tsx`, `DocTableOfContents.tsx`, `Layout.tsx`, `TopNav.tsx`, `Sidebar.tsx` -- analyzed for current state and integration points
- `.planning/research/visual-redesign-reference.html` -- target design reference

---
*Stack research for: FXL Core v1.2 Visual Redesign*
*Researched: 2026-03-10*
