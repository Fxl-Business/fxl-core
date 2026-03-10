# Phase 15: Doc Rendering and TOC - Research

**Researched:** 2026-03-10
**Domain:** react-markdown custom components, rehype-highlight syntax highlighting, IntersectionObserver scroll spy, Tailwind typography
**Confidence:** HIGH

## Summary

Phase 15 transforms doc pages from basic markdown rendering into production-quality documentation with polished page headers (breadcrumbs, badge pill, large title, description), dark-themed code blocks with syntax highlighting, typography hierarchy, and a right-side table of contents with scroll-tracked active headings.

The codebase already has the core infrastructure in place. DocRenderer.tsx uses DocBreadcrumb, DocPageHeader, DocTableOfContents, and MarkdownRenderer components -- all functional but styled with basic/placeholder classes. The three-column layout from Phase 13 already allocates space for the TOC sidebar. The IntersectionObserver-based scroll spy in DocTableOfContents works correctly with `rootMargin: '-80px 0px -70% 0px'`. The `scroll-margin-top: 5rem` in globals.css already accounts for the 64px sticky header. CSS tokens `--code-bg` (slate-900) and `--code-fg` (slate-50) are already defined. The only new dependency is `rehype-highlight` for syntax highlighting -- everything else is CSS/component restyling with zero new libraries.

**Primary recommendation:** Install `rehype-highlight`, import a highlight.js dark CSS theme in main.tsx, then restyle the five existing doc components (DocBreadcrumb, DocPageHeader, MarkdownRenderer, DocTableOfContents, prose styles in globals.css) with the target typography and color classes. No new components needed. No architecture changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOC-01 | Doc pages show breadcrumbs (section > page name) | DocBreadcrumb.tsx exists, needs class update to match design (text-sm, slate-500, chevron separator) |
| DOC-02 | Badge pill shows frontmatter badge value (indigo-50 bg, indigo-600 text, ring) | DocPageHeader.tsx has badge rendering via shadcn Badge, needs restyle to indigo pill with ring |
| DOC-03 | Page title uses text-4xl/5xl font-extrabold tracking-tight | DocPageHeader.tsx h1 currently text-2xl font-bold, needs size increase to 4xl/5xl + tracking-tight |
| DOC-04 | Description paragraph below title in text-lg text-slate-600 | DocPageHeader.tsx p currently text-sm text-muted-foreground, needs text-lg + explicit slate-600 |
| DOC-05 | Code blocks use dark theme (rounded-xl, bg-slate-900, terminal dots) | MarkdownRenderer.tsx pre component + globals.css .prose pre need dark styling with decorative dots |
| DOC-06 | Syntax highlighting via rehype-highlight for code fences | Install rehype-highlight, pass to ReactMarkdown rehypePlugins, import highlight.js CSS theme |
| DOC-07 | Consistent typography hierarchy (h2 2xl bold, h3 xl semibold, p relaxed) | globals.css .prose styles need scale update (h2 from xl to 2xl, h3 from base to xl, p stays relaxed) |
| TOC-01 | Right sidebar shows "NESTA PAGINA" heading with page headings | DocTableOfContents.tsx exists with correct heading text, needs visual polish |
| TOC-02 | Active heading highlighted via IntersectionObserver scroll tracking | Already implemented in DocTableOfContents.tsx with IntersectionObserver, rootMargin accounts for header |
| TOC-03 | Nested heading levels with border-l and indentation | DocTableOfContents.tsx has h3 pl-3 indentation, needs border-l visual treatment |
| TOC-04 | TOC hidden on screens < xl breakpoint | Already implemented: `hidden xl:block` on aside wrapper |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| rehype-highlight | 7.x | Syntax highlighting for markdown code blocks via lowlight/highlight.js | Integrates directly with react-markdown via rehypePlugins prop; lighter than react-syntax-highlighter or shiki |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| highlight.js | 11.x (transitive via lowlight) | Provides CSS themes and language grammars | Import CSS theme file in main.tsx for token coloring |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| rehype-highlight | react-syntax-highlighter | Separate component model (not plugin), larger bundle, requires wrapping code in custom component override |
| rehype-highlight | shiki | Build-time highlighting, much larger bundle, more complex integration -- out of scope per REQUIREMENTS.md |
| highlight.js theme CSS | Custom token CSS | Reinventing 25+ token classes; highlight.js themes are battle-tested and maintained |

**Installation:**
```bash
npm install rehype-highlight
```

Note: `highlight.js` is installed as a transitive dependency via `lowlight` (which `rehype-highlight` depends on). The CSS theme files are in `node_modules/highlight.js/styles/`. No separate `npm install highlight.js` is needed.

## Architecture Patterns

### Current Component Architecture (No Changes Needed)

```
src/pages/DocRenderer.tsx          -- Orchestrates doc rendering
  -> DocBreadcrumb.tsx             -- Breadcrumb navigation (DOC-01)
  -> DocPageHeader.tsx             -- Badge, title, description (DOC-02, DOC-03, DOC-04)
  -> MarkdownRenderer.tsx          -- Markdown body rendering (DOC-05, DOC-06, DOC-07)
  -> DocTableOfContents.tsx        -- Right sidebar TOC (TOC-01, TOC-02, TOC-03, TOC-04)

src/styles/globals.css             -- .prose typography styles (DOC-07)
src/main.tsx                       -- highlight.js CSS theme import (DOC-06)
```

### Pattern 1: rehype-highlight Integration with react-markdown

**What:** Pass rehype-highlight as a rehype plugin to ReactMarkdown. The plugin processes code blocks in the HAST (HTML AST) and adds `hljs-*` class names to tokens.
**When to use:** Always for code syntax highlighting with react-markdown.

```typescript
// Source: https://github.com/rehypejs/rehype-highlight (README)
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={components}
>
  {content}
</ReactMarkdown>
```

The plugin automatically detects language from `language-*` class on code elements (set by markdown fences like ` ```typescript `). It bundles 37 common languages by default (including javascript, typescript, css, html, json, bash, yaml, python, sql).

### Pattern 2: highlight.js CSS Theme Import

**What:** Import a highlight.js CSS theme file in main.tsx to provide colors for `hljs-*` classes.
**When to use:** After installing rehype-highlight.

```typescript
// In src/main.tsx, AFTER font imports but BEFORE globals.css:
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import 'highlight.js/styles/github-dark-dimmed.css'   // <-- highlight.js theme
import './styles/globals.css'
```

**Theme choice: `github-dark-dimmed`**. This theme uses `background: #22272e` and `color: #adbac7` as base. However, we will override the `.hljs` background via the existing `--code-bg` CSS variable (slate-900, which is `#0f172a`) to match the design system. The theme provides token colors: keywords red-coral (#f47067), strings light-blue (#96d0ff), comments muted-gray (#768390), functions purple (#dcbdfb), built-ins orange (#f69d50), tags green (#8ddb8c). These colors are visually distinct on a slate-900 background.

### Pattern 3: Code Block Wrapper with Terminal Dots

**What:** Custom `pre` component override in MarkdownRenderer that adds decorative terminal dots (red/yellow/green circles) above the code content.
**When to use:** For DOC-05 visual treatment.

```tsx
// In MarkdownRenderer.tsx components override:
pre({ children }) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl bg-slate-900 dark:bg-[hsl(var(--code-bg))]">
      {/* Terminal dots */}
      <div className="flex items-center gap-1.5 border-b border-slate-700/50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      {/* Code content */}
      <pre className="overflow-x-auto p-4 text-sm leading-[1.7]">
        {children}
      </pre>
    </div>
  )
}
```

Key points:
- The outer `div` provides rounded corners and background (the `pre` inside must NOT have its own background)
- Terminal dots sit in a border-separated header row
- The `pre` element has `overflow-x-auto` for horizontal scrolling of long lines
- The `bg-slate-900` matches the `--code-bg` CSS variable value

### Pattern 4: IntersectionObserver Scroll Spy with Header Offset

**What:** Use IntersectionObserver with negative rootMargin to account for the sticky header when tracking which heading is "in view".
**When to use:** For TOC active heading tracking (TOC-02).

The current implementation in DocTableOfContents.tsx is already correct:

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id)
        break
      }
    }
  },
  { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
)
```

The `-80px` top margin accounts for the 64px sticky header + 16px buffer. The `-70%` bottom margin means only the top 30% of the viewport triggers intersection. This is a standard scroll spy pattern.

The corresponding CSS in globals.css is also correct:
```css
h2[id], h3[id] {
  scroll-margin-top: 5rem;  /* 80px = header height + buffer */
}
```

### Pattern 5: TOC with Border-L Rail and Nested Indentation

**What:** TOC sidebar with a left border rail where active items get highlighted via the same `-ml-px border-l-2` overlap trick used in the sidebar navigation (Phase 14 pattern).
**When to use:** For TOC-03 nested heading display.

```tsx
<nav className="space-y-1 border-l border-slate-200 dark:border-slate-700">
  {headings.map((h) => (
    <a
      key={h.id}
      href={`#${h.id}`}
      className={cn(
        'block py-1 text-xs transition-colors',
        h.level === 3 ? 'pl-6' : 'pl-4',
        activeId === h.id
          ? '-ml-px border-l-2 border-indigo-600 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
      )}
    >
      {h.text}
    </a>
  ))}
</nav>
```

### Anti-Patterns to Avoid

- **Importing highlight.js CSS AFTER globals.css:** The theme styles would get lower specificity and custom prose pre styles would override token colors. Import the theme CSS BEFORE globals.css in main.tsx.
- **Setting background on both the wrapper div AND pre element:** Creates double-background issues. The wrapper div owns the background; the pre must be `bg-transparent`.
- **Using react-syntax-highlighter alongside rehype-highlight:** They are competing approaches. rehype-highlight is a unified plugin (processes AST); react-syntax-highlighter is a React component (wraps output). Mixing them causes double-processing.
- **Custom `.hljs-*` token overrides in globals.css:** Let the highlight.js theme handle token colors. Only override `.hljs` base styles (background/font). Adding custom `.hljs-keyword { color: ... }` creates maintenance burden when switching themes.
- **Removing the `components` prop from ReactMarkdown after adding rehypePlugins:** Both are needed. rehype-highlight adds classes; the `components` prop controls rendering structure (the `pre` wrapper with terminal dots, inline `code` styling).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Syntax highlighting | Regex-based token coloring | rehype-highlight (lowlight/highlight.js) | 190 languages, battle-tested grammars, maintained by unified ecosystem |
| Highlight theme colors | Manual `.hljs-keyword`, `.hljs-string` CSS | highlight.js theme CSS file (github-dark-dimmed.css) | 25+ token classes, consistent color design, dark/light variants available |
| Scroll spy | Manual scroll event listener with getBoundingClientRect | IntersectionObserver (already implemented) | Better performance (off main thread), handles scroll direction automatically |
| Heading ID generation | Custom slugify for TOC links | Reuse existing `slugify()` from MarkdownRenderer.tsx | Same function used to generate heading IDs must be used in TOC link hrefs |

**Key insight:** This phase is 90% CSS restyling of existing components plus one new npm dependency. The architecture, data flow, and component boundaries are already correct. The risk is purely visual (wrong sizes, wrong colors, broken dark mode) -- not structural.

## Common Pitfalls

### Pitfall 1: highlight.js Theme Background Conflicts

**What goes wrong:** The highlight.js theme CSS sets `background: #22272e` on `.hljs`, which overrides the project's `--code-bg` token (slate-900 = `#0f172a`).
**Why it happens:** highlight.js themes are self-contained -- they set their own background to ensure readability. The project has its own code background token.
**How to avoid:** Add a `.hljs` override in globals.css AFTER the theme import to reset background to transparent or use the project token:
```css
.hljs {
  background: transparent;
}
```
The wrapper `div` or `pre` provides the actual background via `bg-slate-900`. The `.hljs` override ensures the theme only contributes token colors, not layout.
**Warning signs:** Code blocks appear with a slightly different background shade than other dark elements.

### Pitfall 2: rehype-highlight + Custom Code Component Interaction

**What goes wrong:** rehype-highlight adds `hljs` class and `hljs-*` spans to `code` elements inside `pre`. If the custom `code` component in the `components` prop does not preserve the `className` passed to it, the highlight classes are lost.
**Why it happens:** The MarkdownRenderer currently has a `code` component override that checks `!className` to distinguish inline vs block code. After rehype-highlight runs, block code elements get `className="hljs language-typescript"` (etc.). The existing logic for `isInline = !className` still works correctly because highlighted block code WILL have a className.
**How to avoid:** Ensure the custom `code` component passes through `className` to the rendered element. The current implementation already does this correctly (`<code className={cn(className, ...)}>`) -- verify it remains intact after adding rehype-highlight.
**Warning signs:** Code blocks render as plain text without colors despite rehype-highlight being configured.

### Pitfall 3: Terminal Dots Breaking Pre Scrolling

**What goes wrong:** Wrapping `pre` in a `div` (for terminal dots) while keeping `overflow-x-auto` on the outer `div` makes the entire wrapper scroll (including dots). Or putting `overflow-hidden` on the outer div crops the pre content.
**Why it happens:** The outer wrapper needs `overflow-hidden` for rounded corners, but `pre` needs `overflow-x-auto` for long code lines.
**How to avoid:** Use `overflow-hidden` on the outer div (for `rounded-xl` to clip), and `overflow-x-auto` on the inner `pre`. The terminal dots sit between the outer div and the pre, so they are NOT part of the scrollable area.
**Warning signs:** Terminal dots scroll horizontally with code, or long code lines are cropped instead of scrolling.

### Pitfall 4: TOC Sticky Top Position Mismatch

**What goes wrong:** The TOC sidebar's `sticky top-X` value does not match the header height + any spacing, causing the TOC to either overlap the header or have an unexpected gap.
**Why it happens:** The header is `h-16` (64px = 4rem). The sidebar from Phase 14 uses `sticky top-16`. The TOC needs the same offset.
**How to avoid:** Use `sticky top-20` (5rem = 80px = header 4rem + 1rem buffer) or `sticky top-24` if more space is desired. Cross-reference with the existing `scroll-margin-top: 5rem` for headings.
**Warning signs:** TOC starts too high (under header) or too low (large gap between header and TOC start).

### Pitfall 5: Prose Styles Conflicting with rehype-highlight Output

**What goes wrong:** The `.prose pre` styles in globals.css set `background-color: hsl(var(--code-bg))` and `color: hsl(var(--code-fg))`. After rehype-highlight runs, the `code` element inside `pre` gets `.hljs` class which also sets background and color. Specificity conflicts can make token colors invisible.
**Why it happens:** Both globals.css `.prose code` and the highlight.js theme target the same elements.
**How to avoid:** After adding the theme import, the `.prose pre code` and `.prose code` styles may need adjustment. Specifically, `.prose code` inline styling (bg-muted, text-primary) should only apply to inline code (code NOT inside pre). Use `.prose :not(pre) > code` or rely on the existing `isInline` check in the component override.
**Warning signs:** All code text is the same color despite rehype-highlight being active. Or inline code picks up hljs styles.

## Code Examples

### rehype-highlight Integration in MarkdownRenderer.tsx

```typescript
// Source: rehype-highlight README + codebase MarkdownRenderer.tsx
import rehypeHighlight from 'rehype-highlight'

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

### highlight.js Theme Import in main.tsx

```typescript
// In src/main.tsx (import order matters):
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import 'highlight.js/styles/github-dark-dimmed.css'  // syntax token colors
import './styles/globals.css'                          // project styles (override .hljs bg)
```

### DocPageHeader Restyling (DOC-02, DOC-03, DOC-04)

```tsx
// Target styling for DocPageHeader.tsx:
<div className="mb-0">
  {badge && (
    <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
      {badge}
    </span>
  )}
  <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground sm:text-5xl">
    {title}
  </h1>
  {description && (
    <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
      {description}
    </p>
  )}
</div>
```

### DocBreadcrumb Restyling (DOC-01)

```tsx
// Target styling for DocBreadcrumb.tsx:
<nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
  {section && (
    <>
      {sectionHref ? (
        <Link to={sectionHref} className="transition-colors hover:text-slate-900 dark:hover:text-slate-200">
          {section}
        </Link>
      ) : (
        <span>{section}</span>
      )}
      {!isSameName && (
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
      )}
    </>
  )}
  {!isSameName && <span className="font-medium text-slate-900 dark:text-foreground">{title}</span>}
</nav>
```

### Prose Typography Update (DOC-07)

```css
/* Target typography hierarchy in globals.css */
.prose h2 {
  @apply mb-3 mt-8 border-b border-border pb-2 text-2xl font-bold text-foreground;
}

.prose h3 {
  @apply mb-2 mt-6 text-xl font-semibold text-foreground;
}

.prose p {
  @apply mb-4 text-base leading-relaxed text-slate-600 dark:text-slate-400;
}
```

### Pre Component Override with Terminal Dots (DOC-05)

```tsx
// In MarkdownRenderer.tsx components:
pre({ children }) {
  return (
    <div className="group relative my-6 overflow-hidden rounded-xl bg-slate-900 shadow-lg dark:bg-[hsl(var(--code-bg))]">
      <div className="flex items-center gap-1.5 border-b border-slate-700/50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <div className="h-3 w-3 rounded-full bg-green-500/80" />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  )
},
```

### TOC with Border-L Rail (TOC-01, TOC-03)

```tsx
// In DocTableOfContents.tsx:
<aside className="hidden w-56 flex-shrink-0 xl:block">
  <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-900 dark:text-foreground">
      Nesta pagina
    </p>
    <nav className="space-y-1 border-l border-slate-200 dark:border-slate-700">
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={cn(
            'block py-1 text-xs transition-colors',
            h.level === 3 ? 'pl-6' : 'pl-4',
            activeId === h.id
              ? '-ml-px border-l-2 border-indigo-600 font-medium text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  </div>
</aside>
```

### .hljs Background Override in globals.css

```css
/* Place after highlight.js theme import takes effect */
/* Override theme background -- wrapper div provides bg */
.hljs {
  background: transparent;
}

/* Ensure inline code is NOT affected by highlight.js theme */
.prose :not(pre) > code {
  @apply rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em] font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-400;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-syntax-highlighter (component-based) | rehype-highlight (plugin-based) | 2023-2024 | Smaller bundle, integrates into unified pipeline, no component wrapping needed |
| highlight.js direct import | lowlight via rehype-highlight | 2022-2023 | Same engine but tree-shakeable, integrates with rehype AST |
| Scroll event + getBoundingClientRect | IntersectionObserver | 2020+ | Off main thread, better performance, native API |
| Manual terminal dot SVGs | CSS div circles (h-3 w-3 rounded-full) | N/A | Simpler, no SVG files, Tailwind-native |

**Deprecated/outdated:**
- `react-syntax-highlighter`: Still works but adds ~200KB+ to bundle. rehype-highlight is lighter.
- `shiki` for client-side apps: Better for build-time (SSR/SSG); runtime version is heavy for a SPA.
- `@tailwindcss/typography` plugin: The project uses custom `.prose` styles in globals.css. Adding the plugin would conflict.

## Open Questions

1. **highlight.js Theme vs Custom Token Colors**
   - What we know: `github-dark-dimmed` provides good token contrast on dark backgrounds. Its base background (#22272e) is slightly different from the project's slate-900 (#0f172a), but we override `.hljs { background: transparent }`.
   - What's unclear: Whether the token colors (red keywords, blue strings, purple functions) match the project's indigo-focused palette perfectly.
   - Recommendation: Use `github-dark-dimmed` as-is. The token colors are designed for readability on dark backgrounds and do not need to match the indigo palette -- code blocks are intentionally a different visual context. If specific adjustments are needed, they can be done in Phase 16 consistency pass.

2. **DocPageHeader Separator and Raw Button**
   - What we know: The current DocPageHeader has a Separator and a "Exibir Markdown" button. The requirements (DOC-02, DOC-03, DOC-04) do not mention either. DocRenderer.tsx also has its own Separator after DocPageHeader.
   - What's unclear: Whether to keep or remove the raw markdown button and separators.
   - Recommendation: Keep the "Exibir Markdown" button (it is useful for operators) but move/restyle it to be less prominent. Remove the double separator (DocPageHeader has one + DocRenderer has one). A single visual break between header and content suffices.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest 4.x |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOC-01 | Breadcrumbs show section > page | manual-only | Visual: navigate to any doc page, verify breadcrumb shows e.g. "Processo > Visao Geral" | N/A |
| DOC-02 | Badge pill with indigo-50 bg, indigo-600 text, ring | manual-only | Visual: check badge pill on pages with frontmatter badge (e.g. /processo/visao-geral) | N/A |
| DOC-03 | Title text-4xl/5xl font-extrabold tracking-tight | manual-only | Visual: title is visibly larger than previous 2xl, inspect element for text-4xl class | N/A |
| DOC-04 | Description text-lg text-slate-600 | manual-only | Visual: description below title is larger than body text, slate-600 color | N/A |
| DOC-05 | Dark code blocks with terminal dots | manual-only | Visual: navigate to page with code blocks (e.g. /ferramentas/techs/index), verify dark bg + colored dots | N/A |
| DOC-06 | Syntax highlighting via rehype-highlight | manual-only | Visual: code blocks show colored tokens (keywords, strings, comments in distinct colors) | N/A |
| DOC-07 | Typography hierarchy h2 2xl, h3 xl, p relaxed | manual-only | Visual: h2 visibly larger than h3, h3 larger than body text, consistent spacing | N/A |
| TOC-01 | "NESTA PAGINA" heading with clickable headings | manual-only | Visual: right sidebar shows heading with anchor links | N/A |
| TOC-02 | Active heading via IntersectionObserver | manual-only | Visual: scroll through long doc page, TOC active item updates | N/A |
| TOC-03 | Nested headings with border-l and indentation | manual-only | Visual: h3 items indented under h2 with left border rail | N/A |
| TOC-04 | TOC hidden on screens < xl | manual-only | Visual: resize browser below xl breakpoint (~1280px), TOC disappears | N/A |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` (TypeScript compilation gate)
- **Per wave merge:** `npx vitest run` (full test suite -- no regressions)
- **Phase gate:** Full suite green + visual verification of all 11 requirements

### Wave 0 Gaps

None -- this phase is visual restyling of existing components plus one rehype plugin addition. No new testable logic is introduced. The gate is `tsc --noEmit` (zero TypeScript errors) plus visual verification.

## Sources

### Primary (HIGH confidence)
- Codebase: `src/pages/DocRenderer.tsx` -- current doc rendering orchestration
- Codebase: `src/components/docs/MarkdownRenderer.tsx` -- current markdown rendering with ReactMarkdown + remarkGfm + custom components
- Codebase: `src/components/docs/DocTableOfContents.tsx` -- current TOC with IntersectionObserver scroll spy
- Codebase: `src/components/docs/DocBreadcrumb.tsx` -- current breadcrumb component
- Codebase: `src/components/docs/DocPageHeader.tsx` -- current page header with badge, title, description
- Codebase: `src/styles/globals.css` -- current .prose styles, scroll-margin-top, --code-bg/--code-fg tokens
- Codebase: `src/main.tsx` -- current import order (font imports before globals.css)
- [rehype-highlight GitHub](https://github.com/rehypejs/rehype-highlight) -- v7.0.2, lowlight ^3.0.0 dependency, API options
- [highlight.js styles directory](https://github.com/highlightjs/highlight.js/tree/main/src/styles) -- available CSS themes including github-dark-dimmed

### Secondary (MEDIUM confidence)
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) -- rehypePlugins prop API
- [highlight.js github-dark-dimmed.css](https://github.com/highlightjs/highlight.js/blob/main/src/styles/github-dark-dimmed.css) -- token class colors verified (#f47067 keywords, #96d0ff strings, #768390 comments, #dcbdfb functions)
- [Scrollspy demystified (Maxime Heckel)](https://blog.maximeheckel.com/posts/scrollspy-demystified/) -- IntersectionObserver rootMargin pattern for header offset
- [highlight.js demo](https://highlightjs.org/demo) -- theme preview and language list

### Tertiary (LOW confidence)
- None. All findings verified against codebase analysis and official documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- rehype-highlight is the only new dependency, explicitly specified in REQUIREMENTS.md (DOC-06)
- Architecture: HIGH -- all components exist, this is purely CSS restyling + one plugin addition
- Pitfalls: HIGH -- verified against codebase (import order, CSS specificity, IntersectionObserver config all analyzed)
- Code examples: HIGH -- derived from existing codebase patterns + verified rehype-highlight API

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain -- CSS restyling and rehype-highlight are mature)
