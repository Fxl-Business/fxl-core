# Phase 12: Design Foundation - Research

**Researched:** 2026-03-10
**Domain:** CSS custom properties, font loading, Tailwind 3 color system, scrollbar styling
**Confidence:** HIGH

## Summary

Phase 12 establishes the visual foundation for the entire v1.2 redesign by changing three things simultaneously: typography (Inter + JetBrains Mono via @fontsource-variable), color palette (slate + indigo replacing dark gray-blue + gold), and scrollbar styling. The key challenge is doing all three without breaking the wireframe design system, which uses its own `--wf-*` CSS variables scoped via `[data-wf-theme]` selectors with hex/rgba values that are completely independent of the app palette.

The codebase is well-structured for this change. The `globals.css` file contains all CSS variables in HSL channel format (without `hsl()` wrapper), the `tailwind.config.ts` maps them via `hsl(var(--...))`, and the wireframe tokens live in a separate CSS file under `[data-wf-theme]` selectors. The font family declarations in `tailwind.config.ts` already reference `Inter Variable` and `JetBrains Mono`, but no font files are actually loaded -- the fonts rely on system-ui fallback. The existing research from `.planning/research/PITFALLS.md` has thoroughly documented the pitfalls around HSL format, opacity modifiers, and wireframe isolation.

**Primary recommendation:** Install two @fontsource-variable packages and import them in main.tsx. Swap the 13 `:root` color variables and 13 `.dark` variables in globals.css from the current dark gray-blue + gold values to slate + indigo values. Add scrollbar CSS. Verify wireframe renders identically after the change. Do NOT touch any component files -- this phase is purely CSS variables, font imports, and globals.css.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | App loads Inter font family with weights 300-700 via @fontsource-variable | Install `@fontsource-variable/inter`, import in main.tsx; font-family already declared in tailwind.config.ts as 'Inter Variable' |
| FOUND-02 | App loads JetBrains Mono font for code blocks via @fontsource-variable | Install `@fontsource-variable/jetbrains-mono`, import in main.tsx; font-family already declared in tailwind.config.ts as 'JetBrains Mono' |
| FOUND-03 | CSS vars shift to slate + indigo palette (--primary, --accent, --background, etc.) | Replace HSL channel values in globals.css :root and .dark blocks; exact values computed below from Tailwind v3 palette |
| FOUND-04 | Scrollbar uses slim 6px styling matching reference (slate-200 thumb) | Add ::-webkit-scrollbar pseudo-elements and scrollbar-width/color standard properties to globals.css |
| FOUND-05 | Wireframe --wf-* tokens remain isolated after palette change | Wireframe tokens are scoped via [data-wf-theme] with hex values -- fully independent. Verify by opening wireframe after palette change. |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @fontsource-variable/inter | latest | Self-hosted Inter variable font (weights 100-900) | Eliminates Google Fonts CDN dependency, bundles with Vite build, same-origin loading |
| @fontsource-variable/jetbrains-mono | latest | Self-hosted JetBrains Mono variable font for code | Same pattern as Inter, consistent approach |

### Supporting

No additional libraries needed. The color palette and scrollbar changes are pure CSS.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @fontsource-variable | Google Fonts CDN `<link>` | Third-party dependency, GDPR concern, render-blocking, no version lock |
| @fontsource-variable | @fontsource (static) | Static loads individual weight files; variable loads single file supporting all weights. Variable is smaller and more flexible. |
| Custom scrollbar CSS | scrollbar-width: thin (standard CSS) | Standard CSS only supports `thin` keyword, not exact 6px width. Cannot control thumb color precisely. Use webkit pseudo-elements with standard fallback. |

**Installation:**
```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

## Architecture Patterns

### Current CSS Variable Architecture

The project uses the standard shadcn/ui Tailwind 3 pattern:

```
globals.css (:root)         tailwind.config.ts           Component usage
--primary: 220 16% 22%  ->  primary: 'hsl(var(--primary))'  ->  bg-primary, text-primary
--accent: 43 96% 56%    ->  accent: 'hsl(var(--accent))'    ->  bg-accent, text-accent
```

CSS variables contain raw HSL channels (NO `hsl()` wrapper). Tailwind config wraps with `hsl()`. This enables opacity modifiers like `bg-primary/10`.

### Pattern 1: Font Loading via @fontsource-variable

**What:** Import font CSS files in the JavaScript entry point (main.tsx), not in CSS files.
**When to use:** Always with Vite + @fontsource.

```typescript
// Source: https://fontsource.org/fonts/inter/install
// In src/main.tsx, BEFORE the globals.css import:
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/globals.css'
```

The import order matters. Font CSS must load before globals.css so font-family declarations resolve. The `@fontsource-variable/inter` default import loads the `wght` axis (supports 100-900), which covers the required 300-700 range.

The font-family name from the package is `'Inter Variable'` (not `'Inter'`). The current `tailwind.config.ts` already has this correctly configured:
```typescript
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}
```

Note: The mono font-family should be updated to `'JetBrains Mono Variable'` to match the variable font package name. The static font package uses `'JetBrains Mono'` but the variable package uses `'JetBrains Mono Variable'`.

### Pattern 2: HSL Channel CSS Variables (Tailwind 3 Convention)

**What:** CSS variables must contain raw HSL channels without the `hsl()` wrapper for Tailwind opacity modifiers to work.
**When to use:** Always when defining color tokens for shadcn/ui + Tailwind 3.

```css
/* CORRECT -- raw channels, no wrapper */
:root {
  --primary: 243.4 75.4% 58.6%;
}

/* WRONG -- will break bg-primary/10, bg-primary/50, etc. */
:root {
  --primary: hsl(243.4, 75.4%, 58.6%);
}
```

When Tailwind generates `bg-primary/10`, it produces `hsl(var(--primary) / 0.1)`. If the variable itself contains `hsl(...)`, the result is `hsl(hsl(...) / 0.1)` which silently fails (transparent).

### Pattern 3: Scrollbar Styling (Webkit + Standard Fallback)

**What:** Custom scrollbar using ::-webkit-scrollbar pseudo-elements with CSS standard properties as fallback.
**When to use:** For slim scrollbar styling on pages with overflow.

```css
/* Standard CSS (Firefox 64+, Chrome 121+, Safari 26.2+) */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

/* Webkit (Chrome, Safari, Edge -- more precise control) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}
```

Note: The standard `scrollbar-width` only supports `auto`, `thin`, and `none` -- no pixel values. The webkit approach gives exact 6px control. Combining both provides coverage: webkit browsers get the precise styling, Firefox gets `thin` + custom colors.

### Anti-Patterns to Avoid

- **Wrapping HSL values in hsl() in CSS variables:** Breaks ALL opacity modifiers silently. The element becomes transparent with no error.
- **Importing @fontsource in CSS files:** `@import '@fontsource-variable/inter'` in globals.css causes Vite to split the font CSS into a separate chunk, causing FOUT. Always import in main.tsx.
- **Touching wireframe component files during palette change:** Wireframe rendering components use `wf-*` tokens. Editor components use app tokens (which is correct -- they are part of the app chrome). Do not "fix" editor components to use `wf-*`.
- **Using Tailwind v4 color format examples:** Tailwind v4 uses `oklch()` wrapped values. This project is on Tailwind 3. Do not copy examples from Tailwind v4 or shadcn/ui v2 docs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted fonts | Custom @font-face declarations with WOFF2 files | @fontsource-variable packages | Handles subsetting, format selection, CSS generation, and Vite bundling |
| Color palette HSL conversion | Manual hex-to-HSL calculations | Pre-computed values (see Code Examples below) | Error-prone; values already computed from Tailwind v3 source palette |
| Scrollbar normalization across browsers | JavaScript scrollbar libraries | CSS ::-webkit-scrollbar + standard properties | Pure CSS, no runtime cost, no bundle size |

**Key insight:** This phase requires zero new abstractions. It is a surgical CSS-variable swap + two npm package imports + scrollbar CSS. Every change is in globals.css and main.tsx.

## Common Pitfalls

### Pitfall 1: HSL Wrapper in CSS Variables
**What goes wrong:** Adding `hsl()` wrapper inside the CSS variable value breaks every Tailwind opacity modifier (`bg-primary/10`, `bg-background/90`, `bg-muted/50`).
**Why it happens:** Design tools and Tailwind v4 examples produce `hsl(243, 75%, 59%)` format. Developers copy-paste without removing the wrapper.
**How to avoid:** Use the exact values from the Code Examples section below. After changing values, search for `hsl(hsl(` in browser DevTools computed styles. Test at least: `bg-primary/10` (Sidebar active), `bg-background/90` (TopNav backdrop), `bg-muted/50` (table hover).
**Warning signs:** Elements appear fully transparent or fully opaque instead of semi-transparent. Browser DevTools shows `hsl(hsl(...))` in computed styles.

### Pitfall 2: Font-Family Name Mismatch
**What goes wrong:** Using `'Inter'` instead of `'Inter Variable'` in font-family declaration when using the variable font package.
**Why it happens:** The static @fontsource/inter package uses `'Inter'` while @fontsource-variable/inter uses `'Inter Variable'`. Similarly for JetBrains Mono.
**How to avoid:** Verify font-family names match the package type. The tailwind.config.ts already uses `'Inter Variable'` but the mono entry says `'JetBrains Mono'` -- update it to `'JetBrains Mono Variable'`.
**Warning signs:** Text falls through to the next fallback (system-ui for sans, Fira Code for mono). Network tab shows font files loading but not being applied.

### Pitfall 3: Import Order in main.tsx
**What goes wrong:** Importing @fontsource after globals.css causes the font CSS to load after Tailwind's base styles, potentially causing a flash of unstyled text.
**Why it happens:** Vite processes imports in order. If globals.css loads first, the initial paint uses the fallback font before the @fontsource CSS is processed.
**How to avoid:** Import @fontsource packages FIRST in main.tsx, before globals.css. This ensures font CSS is in the critical render path.
**Warning signs:** Text visibly "jumps" between fallback font and Inter on page load.

### Pitfall 4: Wireframe Token Leak
**What goes wrong:** After changing `--primary` from dark charcoal to indigo, wireframe editor chrome (panels, buttons) shows indigo accents. This is EXPECTED and CORRECT -- the editor is part of the app, not the wireframe. The actual wireframe content inside `[data-wf-theme]` containers must remain unchanged (stone gray + gold).
**Why it happens:** Confusion between "wireframe editor" (app chrome, uses app tokens) and "wireframe content" (rendering, uses --wf-* tokens).
**How to avoid:** After palette change, open the wireframe viewer for financeiro-conta-azul. Check that: canvas is stone gray, cards have gold accents, sidebar is dark stone, charts use gold/amber palette. If any of these show indigo, there is a token leak.
**Warning signs:** Wireframe content (not editor chrome) shows indigo colors.

### Pitfall 5: Dark Mode Inconsistency
**What goes wrong:** Changing `:root` variables without updating the corresponding `.dark` block creates a light-mode-only redesign. Dark mode breaks silently.
**Why it happens:** Developer focuses on light mode (the primary reference), forgets to update `.dark` in the same commit.
**How to avoid:** Every `:root` variable change must have a corresponding `.dark` change. Toggle dark mode on at least one page after the change.
**Warning signs:** Dark mode shows wrong colors, white-on-white text, or unreadable contrast.

## Code Examples

Verified values computed from official Tailwind CSS v3 color palette hex values.

### New :root CSS Variables (Slate + Indigo Palette)

```css
/* Source: Tailwind CSS v3 default palette, converted to HSL channels */
/* Reference: https://v3.tailwindcss.com/docs/customizing-colors */

@layer base {
  :root {
    /* Slate backgrounds */
    --background: 210 40% 98%;           /* slate-50 #f8fafc */
    --foreground: 222.2 47.4% 11.2%;     /* slate-900 #0f172a */
    --muted: 210 40% 96.1%;             /* slate-100 #f1f5f9 */
    --muted-foreground: 215.4 16.3% 46.9%; /* slate-500 #64748b */
    --border: 214.3 31.8% 91.4%;        /* slate-200 #e2e8f0 */
    --input: 214.3 31.8% 91.4%;         /* slate-200 */

    /* Indigo primary */
    --primary: 243.4 75.4% 58.6%;       /* indigo-600 #4f46e5 */
    --primary-foreground: 210 40% 98%;   /* slate-50 (white text on indigo) */

    /* Slate secondary */
    --secondary: 210 40% 96.1%;          /* slate-100 */
    --secondary-foreground: 222.2 47.4% 11.2%; /* slate-900 */

    /* Indigo accent */
    --accent: 210 40% 96.1%;            /* slate-100 (subtle accent bg) */
    --accent-foreground: 222.2 47.4% 11.2%; /* slate-900 */

    --ring: 243.4 75.4% 58.6%;          /* indigo-600 (focus rings) */
    --radius: 0.5rem;

    --card: 0 0% 100%;                  /* white */
    --card-foreground: 222.2 47.4% 11.2%; /* slate-900 */
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;       /* unchanged */
    --destructive-foreground: 0 0% 98%;

    /* Sidebar tokens */
    --sidebar: 210 40% 98%;             /* slate-50 */
    --sidebar-foreground: 222.2 47.4% 11.2%; /* slate-900 */
    --sidebar-accent: 243.4 75.4% 58.6%; /* indigo-600 */
    --sidebar-border: 214.3 31.8% 91.4%; /* slate-200 */
    --sidebar-muted: 210 40% 96.1%;     /* slate-100 */
    --sidebar-muted-foreground: 215.4 16.3% 46.9%; /* slate-500 */

    /* Code block tokens -- keep dark */
    --code-bg: 222.2 47.4% 11.2%;       /* slate-900 */
    --code-fg: 210 40% 98%;             /* slate-50 */

    /* Chart tokens -- indigo scale */
    --chart-1: 243.4 75.4% 58.6%;       /* indigo-600 */
    --chart-2: 173 58% 39%;             /* unchanged teal */
    --chart-3: 197 37% 24%;             /* unchanged */
    --chart-4: 43 74% 66%;              /* unchanged gold */
    --chart-5: 27 87% 67%;              /* unchanged */
  }

  .dark {
    --background: 222.2 47.4% 11.2%;    /* slate-900 */
    --foreground: 210 40% 98%;          /* slate-50 */
    --muted: 217.2 32.6% 17.5%;        /* slate-800 */
    --muted-foreground: 215 20.2% 65.1%; /* slate-400 */
    --border: 217.2 32.6% 17.5%;       /* slate-800 */
    --input: 217.2 32.6% 17.5%;

    --primary: 225.9 100% 96.7%;        /* indigo-50 (light text on dark) */
    --primary-foreground: 222.2 47.4% 11.2%; /* slate-900 */

    --secondary: 217.2 32.6% 17.5%;     /* slate-800 */
    --secondary-foreground: 210 40% 98%; /* slate-50 */

    --accent: 217.2 32.6% 17.5%;        /* slate-800 */
    --accent-foreground: 210 40% 98%;

    --ring: 225.9 100% 96.7%;           /* indigo-50 */
    --card: 222.2 47.4% 11.2%;          /* slate-900 */
    --card-foreground: 210 40% 98%;
    --popover: 222.2 47.4% 11.2%;
    --popover-foreground: 210 40% 98%;
    --destructive: 0 62% 50%;
    --destructive-foreground: 0 0% 98%;

    --sidebar: 222.2 47.4% 11.2%;       /* slate-900 */
    --sidebar-foreground: 210 40% 98%;
    --sidebar-accent: 225.9 100% 96.7%; /* indigo-50 */
    --sidebar-border: 217.2 32.6% 17.5%;
    --sidebar-muted: 217.2 32.6% 17.5%;
    --sidebar-muted-foreground: 215 20.2% 65.1%;

    --code-bg: 228.6 84% 4.9%;          /* slate-950 */
    --code-fg: 210 40% 96.1%;           /* slate-100 */

    --chart-1: 234.5 89.5% 73.9%;       /* indigo-400 */
    --chart-2: 173 50% 50%;
    --chart-3: 197 40% 50%;
    --chart-4: 43 74% 60%;
    --chart-5: 27 80% 60%;
  }
}
```

### Font Imports in main.tsx

```typescript
// Source: https://fontsource.org/fonts/inter/install
// Source: https://fontsource.org/fonts/jetbrains-mono/install

import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/globals.css'
```

### Tailwind Config Font Update

```typescript
// In tailwind.config.ts, update mono font-family:
fontFamily: {
  sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'monospace'],
}
```

### Scrollbar CSS

```css
/* In globals.css, inside @layer base */

/* Standard CSS scrollbar (Firefox, modern Chrome/Safari) */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}

/* Webkit scrollbar (precise 6px width) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--muted-foreground));
}
```

Note: Using `hsl(var(--border))` for the scrollbar thumb maps to slate-200 in light mode. This matches the FOUND-04 requirement of "slate-200 thumb". The `--border` token is set to `214.3 31.8% 91.4%` which is Tailwind's slate-200.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Fonts CDN `<link>` | @fontsource self-hosted packages | 2022-2023 | Same-origin, GDPR compliant, version-locked, faster |
| Static font files per weight | Variable fonts (single file, all weights) | 2023-2024 | Smaller bundle, any weight value, no FOIT between weights |
| ::-webkit-scrollbar only | scrollbar-width + scrollbar-color standard | Chrome 121 (Jan 2024) | Cross-browser standard, but limited to thin/auto/none for width |
| shadcn/ui HSL format | shadcn/ui moving to OKLCH (Tailwind v4) | Late 2025 | This project stays on Tailwind 3 + HSL. Do NOT use OKLCH examples. |

**Deprecated/outdated:**
- `@fontsource/inter` (static): Use `@fontsource-variable/inter` instead for variable font support
- Google Fonts CDN for production apps: Self-host via @fontsource for performance and privacy
- Custom @font-face with manually downloaded WOFF2: @fontsource handles this automatically

## Open Questions

1. **Dark mode primary token value**
   - What we know: In light mode, `--primary` should be indigo-600 (the vibrant indigo for buttons/links). In dark mode, the convention is less clear -- using indigo-50 (near-white) makes `text-primary` readable on dark backgrounds but makes `bg-primary` buttons very light.
   - What's unclear: Whether dark mode buttons should use inverted primary or a mid-range indigo like indigo-400.
   - Recommendation: Use indigo-50 for dark mode `--primary` (consistent with shadcn/ui convention where primary is used for text on dark backgrounds). Buttons already swap via `bg-primary text-primary-foreground`, which produces indigo-50 bg with slate-900 text -- readable but unconventional. Since v1.2 focuses on light mode and dark mode is deferred for fine-tuning, this is acceptable.

2. **Accent token semantics shift**
   - What we know: The current `--accent` is gold (43 96% 56%), used for blockquote borders, sidebar accents, etc. The new design uses indigo as accent.
   - What's unclear: Whether `--accent` should become indigo or slate-100 (subtle highlight background, the shadcn/ui convention).
   - Recommendation: Set `--accent` to slate-100 (the shadcn/ui default -- used for hover backgrounds on nav items, etc.). The "indigo accent" is captured by `--primary`. Gold accent only persists in wireframe `--wf-accent` tokens, which are isolated.

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
| FOUND-01 | Inter font loaded via @fontsource-variable import in main.tsx | manual-only | Visual: text renders in Inter (check letter spacing, weight rendering) | N/A |
| FOUND-02 | JetBrains Mono font loaded for code blocks | manual-only | Visual: code blocks render in JetBrains Mono (check ligatures, weight) | N/A |
| FOUND-03 | CSS vars use slate + indigo palette | unit | `npx vitest run` (TypeScript compilation gate: `npx tsc --noEmit`) | N/A -- Wave 0 |
| FOUND-04 | Scrollbar uses slim 6px styling | manual-only | Visual: scroll any long page, verify slim scrollbar with slate-200 color | N/A |
| FOUND-05 | Wireframe --wf-* tokens remain isolated | manual-only | Open /clients/financeiro-conta-azul/wireframe, verify stone gray + gold accent preserved | N/A |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` (TypeScript compilation gate, per project rules)
- **Per wave merge:** `npx vitest run` (full test suite)
- **Phase gate:** Full suite green + visual verification of all 5 success criteria

### Wave 0 Gaps

None -- this phase is pure CSS/configuration changes. No new testable logic is introduced. The existing wireframe-theme.test.ts covers token isolation at the component level. The gate is `tsc --noEmit` (zero TypeScript errors) plus visual verification.

## Sources

### Primary (HIGH confidence)
- [Fontsource Inter Variable](https://fontsource.org/fonts/inter/install) - font-family name 'Inter Variable', import syntax, weight range 100-900
- [Fontsource JetBrains Mono Variable](https://fontsource.org/fonts/jetbrains-mono/install) - font-family name 'JetBrains Mono Variable', import syntax
- [Tailwind CSS v3 Colors](https://v3.tailwindcss.com/docs/customizing-colors) - Official hex values for slate and indigo palettes
- Codebase: `src/styles/globals.css` - Current CSS variable definitions, HSL channel format, prose styles
- Codebase: `tailwind.config.ts` - `hsl(var(--...))` wrapping pattern, fontFamily declarations, wf-* token mapping
- Codebase: `tools/wireframe-builder/styles/wireframe-tokens.css` - `[data-wf-theme]` scoped tokens with hex values
- Codebase: `src/main.tsx` - Current import order, entry point structure
- Codebase: `.planning/research/PITFALLS.md` - Detailed pitfall analysis for HSL format, opacity modifiers, wireframe isolation

### Secondary (MEDIUM confidence)
- [MDN ::-webkit-scrollbar](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar) - Webkit scrollbar pseudo-elements
- [Chrome Scrollbar Styling](https://developer.chrome.com/docs/css-ui/scrollbar-styling) - Standard scrollbar-width supports only auto/thin/none, no px values
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variable convention (confirmed HSL channels without wrapper for Tailwind 3)

### Tertiary (LOW confidence)
- None. All findings are verified against primary sources or codebase analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @fontsource-variable is the standard approach, verified via official docs
- Architecture: HIGH - CSS variable pattern is already established in the codebase, changes are purely value swaps
- Pitfalls: HIGH - Extensively documented in existing PITFALLS.md with codebase-specific analysis
- Color values: HIGH - Computed directly from Tailwind v3 official hex palette via deterministic conversion

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain -- CSS variables and font loading are mature patterns)
