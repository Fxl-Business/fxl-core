# Phase 16: Consistency Pass - Research

**Researched:** 2026-03-10
**Domain:** Tailwind CSS class consistency, Clerk appearance theming, React component restyling
**Confidence:** HIGH

## Summary

Phase 16 is a purely visual consistency pass. Every prior phase in v1.2 has established the "new visual language": slate + indigo palette (Phase 12), frosted glass header with viewport scrolling (Phase 13), border-l rail sidebar with indigo active states (Phase 14), and production-quality doc rendering with dark code blocks and TOC (Phase 15). Phase 16 ensures every remaining page and component matches this established language -- no new libraries, no architecture changes, no new CSS variables.

The scope is precisely defined by four requirements (CONSIST-01 through CONSIST-04), each targeting a specific set of files. The work is CSS-class-only: replacing old semantic tokens and hardcoded colors with the new slate + indigo explicit classes already used throughout the redesigned components. The Clerk components (Login, Profile, SignUp) already use the `shadcn` theme from `@clerk/ui/themes` and import `@clerk/ui/themes/shadcn.css`, which reads the app's CSS custom properties. Since Phase 12 already updated all CSS variables to the slate + indigo palette, Clerk components should already be rendering correctly -- the main concern for CONSIST-03 is the wrapper/container styling around those components, not the Clerk UI itself.

**Primary recommendation:** Restyle 6-8 files using Tailwind class changes only. Apply the same explicit color classes (text-slate-900, text-slate-500, border-slate-200, bg-indigo-50, text-indigo-600, etc.) and typography scale (text-4xl font-extrabold tracking-tight for titles, text-lg text-slate-600 for descriptions) already established in DocPageHeader, DocBreadcrumb, and DocTableOfContents. Zero new dependencies. Zero architecture changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONSIST-01 | Home page uses new typography and color system | Home.tsx uses semantic tokens (text-foreground, bg-card, text-muted-foreground, border-border) throughout. Needs: title scale increase to match doc pages (text-4xl font-extrabold), card styling with explicit slate/indigo classes, icon containers with indigo accent |
| CONSIST-02 | Client pages (Index, DocViewer) use new visual language | FinanceiroIndex.tsx and DocViewer.tsx use old header pattern (text-2xl font-bold, text-primary for section label). Needs: DocBreadcrumb + DocPageHeader pattern adoption, consistent section typography matching doc pages |
| CONSIST-03 | Login/Profile pages use slate + indigo palette | Login.tsx and Profile.tsx are minimal wrappers around Clerk components. Clerk already reads CSS vars via shadcn theme. Wrapper pages need bg-background class verification and optional brand/decorative elements to feel cohesive |
| CONSIST-04 | PromptBlock and Callout components updated to new palette | Callout.tsx uses hardcoded blue-200/blue-50/amber-200/amber-50 colors. PromptBlock (both docs/ and ui/ versions) uses bg-primary/5 which resolves to indigo already, but pre block uses bg-muted. Need: Callout info type to use indigo palette, PromptBlock pre block to use slate-900 dark theme matching code blocks |
</phase_requirements>

## Standard Stack

### Core

No new libraries needed. Phase 16 is purely CSS class changes on existing components.

| Library | Version | Purpose | Already Installed |
|---------|---------|---------|-------------------|
| tailwindcss | 3.x | Utility classes for all styling | Yes |
| @clerk/react | 6.0.1 | Auth components (SignIn, UserProfile) | Yes |
| @clerk/ui | 1.0.1 | shadcn theme for Clerk components | Yes |

### Supporting

None. All color tokens, font families, and CSS variables are already in place from Phase 12.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Explicit slate/indigo classes | Semantic tokens only (text-foreground, etc.) | Semantic tokens resolve to slate/indigo via CSS vars, but explicit classes (text-slate-900, bg-indigo-50) are what Phase 14-15 established for the visual hierarchy. Mix both where appropriate -- semantic for neutral, explicit for accent/hierarchy. |
| Class-level changes | Clerk `variables` prop for Login/Profile | Clerk already uses shadcn theme that reads app CSS vars. Extra variables prop would be redundant. Only use if specific overrides are needed. |

## Architecture Patterns

### Visual Language Reference (established in Phases 12-15)

The "new visual language" is defined by these concrete patterns already in use:

```
Typography Scale:
- Page title:     text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl
- Description:    text-lg text-slate-600
- Section header: text-xs font-bold uppercase tracking-wider text-slate-900
- Body text:      text-base leading-relaxed text-slate-600
- Small label:    text-xs text-slate-500

Color Palette:
- Backgrounds:    bg-slate-50/50 (sidebar), bg-white/80 (header), bg-background (page)
- Borders:        border-slate-200 (explicit)
- Active/accent:  text-indigo-600, border-indigo-600, bg-indigo-50
- Badge pill:     bg-indigo-50 text-indigo-600 ring-1 ring-indigo-600/20
- Muted text:     text-slate-500 (nav), text-slate-600 (prose body)
- Headings:       text-slate-900

Card Styling:
- rounded-xl border border-slate-200 bg-white (or bg-card)
- hover:border-indigo-200 hover:shadow-sm (interactive)

Code/Prompt Blocks:
- bg-slate-900 rounded-xl (dark theme, terminal dots)
- Inline code: bg-slate-100 text-indigo-600 rounded
```

### Files Requiring Changes

**CONSIST-01 (Home page):**
- `src/pages/Home.tsx` -- title, section headers, cards, icon containers

**CONSIST-02 (Client pages):**
- `src/pages/clients/FinanceiroContaAzul/Index.tsx` -- page header, table styling
- `src/pages/clients/FinanceiroContaAzul/DocViewer.tsx` -- page header pattern
- `src/pages/clients/BlueprintTextView.tsx` -- page header (uses text-2xl)
- `src/pages/clients/BriefingForm.tsx` -- page header (uses text-2xl)
- `src/pages/docs/ProcessDocsViewer.tsx` -- page header (uses text-2xl, old section label style)

**CONSIST-03 (Login/Profile):**
- `src/pages/Login.tsx` -- container styling
- `src/pages/Profile.tsx` -- container styling
- `src/App.tsx` -- SignUp inline route styling

**CONSIST-04 (PromptBlock + Callout):**
- `src/components/docs/Callout.tsx` -- hardcoded blue/amber colors
- `src/components/docs/PromptBlock.tsx` -- prompt block styling
- `src/components/ui/PromptBlock.tsx` -- duplicate prompt block
- `src/components/docs/InfoBlock.tsx` -- hardcoded blue/amber/green colors

### Pattern: Page Header Consistency

Every page inside the Layout should use the same header pattern. DocRenderer already shows the target:

```typescript
// Source: src/pages/DocRenderer.tsx (Phase 15 implementation)
<DocBreadcrumb section={frontmatter.badge} title={frontmatter.title} />
<DocPageHeader
  badge={frontmatter.badge}
  title={frontmatter.title}
  description={frontmatter.description}
/>
```

For non-doc pages (Home, Client Index), the pattern translates to inline classes:
```typescript
// Title: match DocPageHeader scale
<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
  Nucleo FXL
</h1>
// Description: match DocPageHeader description
<p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
  Processo, knowledge e ferramentas...
</p>
```

### Anti-Patterns to Avoid
- **Mixing old and new scales:** Do not leave `text-2xl font-bold` on page titles while doc pages use `text-4xl font-extrabold tracking-tight`. Inconsistency is what this phase eliminates.
- **Over-using DocPageHeader component in non-doc pages:** Home page and client pages have different content structure. Use the CLASSES, not the component, for non-doc contexts.
- **Changing Clerk component internals:** The Clerk `<SignIn>` and `<UserProfile>` components are pre-built. Only style the wrapper/container, not the Clerk UI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clerk theming | Custom CSS targeting .cl-* classes | `appearance={{ theme: shadcn }}` + CSS vars | Clerk shadcn theme already reads --primary, --background, etc. from globals.css |
| Color consistency | A shared constants file for colors | Tailwind explicit classes directly | Tailwind classes ARE the standard; no abstraction layer needed |

## Common Pitfalls

### Pitfall 1: Two PromptBlock Components
**What goes wrong:** Changes applied to one PromptBlock but not the other.
**Why it happens:** There are TWO PromptBlock components: `src/components/docs/PromptBlock.tsx` (used by DocRenderer) and `src/components/ui/PromptBlock.tsx` (used by ProcessDocsViewer and FinanceiroIndex). They have slightly different APIs.
**How to avoid:** Update both. They should converge to the same visual styling. The docs/ version uses shadcn Button, the ui/ version uses plain HTML button. Both need the same visual output.
**Warning signs:** PromptBlock looks different on doc pages vs client pages.

### Pitfall 2: Hardcoded Color Values in Callout and InfoBlock
**What goes wrong:** Callout info type uses `border-blue-200 bg-blue-50 text-blue-900` -- blue is not in the new palette. InfoBlock also uses blue/amber/green hardcoded colors.
**Why it happens:** These components were written before the v1.2 redesign.
**How to avoid:** Update info type to use indigo (bg-indigo-50 border-indigo-200 text-indigo-900). Warning type can keep amber (it's a semantic color, not a palette issue). Consider if InfoBlock should also be updated -- it's used less frequently.
**Warning signs:** Blue-colored callouts on pages that are otherwise entirely slate + indigo.

### Pitfall 3: Dark Mode Regression
**What goes wrong:** Replacing semantic tokens (text-foreground, bg-card) with explicit colors (text-slate-900, bg-white) breaks dark mode.
**Why it happens:** Explicit Tailwind colors like text-slate-900 don't change in dark mode. Semantic tokens like text-foreground do.
**How to avoid:** For EVERY explicit class, add a `dark:` variant. Pattern from Phase 15:
- `text-slate-900 dark:text-foreground`
- `text-slate-600 dark:text-slate-400`
- `text-slate-500 dark:text-slate-400`
- `border-slate-200 dark:border-slate-700`
- `bg-indigo-50 dark:bg-indigo-950/50`
**Warning signs:** Toggle dark mode and check every updated page.

### Pitfall 4: ProcessDocsViewer is Legacy
**What goes wrong:** ProcessDocsViewer.tsx uses old-style doc rendering (importing raw .md files, custom section splitting, old page header). It may appear inconsistent.
**Why it happens:** It was the original doc viewer before the docs-parser system was built. The routes that use it (`/docs/:slug`) may still be accessible.
**How to avoid:** Check if any routes actually point to ProcessDocsViewer. If not, its styling is lower priority. If routes do point to it, update its header pattern.
**Warning signs:** Routes in App.tsx that render ProcessDocsViewer.

### Pitfall 5: Clerk Container Pages Have No Layout Context
**What goes wrong:** Login and Profile pages render OUTSIDE the Layout component (no sidebar, no header). They use `min-h-screen` as their own container.
**Why it happens:** Auth pages are full-screen by design.
**How to avoid:** Don't try to add Layout chrome. Instead, add subtle branding (e.g., background gradient, brand logo above form) and ensure the background color uses bg-slate-50 (--background) consistently.
**Warning signs:** Login page looking completely unrelated to the rest of the app.

## Code Examples

### Home Page Title Update (CONSIST-01)
```typescript
// BEFORE (Home.tsx)
<h1 className="text-2xl font-bold text-foreground">Nucleo FXL</h1>
<p className="mt-1 text-sm text-muted-foreground">
  Processo, knowledge e ferramentas...
</p>

// AFTER (matching DocPageHeader visual scale)
<h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
  Nucleo FXL
</h1>
<p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
  Processo, knowledge e ferramentas...
</p>
```

### Callout Palette Update (CONSIST-04)
```typescript
// BEFORE (Callout.tsx)
const styles = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

// AFTER (indigo for info, amber stays for warning)
const styles = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
}
```

### Card Hover Update (CONSIST-01)
```typescript
// BEFORE (Home.tsx quick action cards)
<div className="... border border-border bg-card ... hover:border-primary hover:shadow-md">

// AFTER (explicit slate/indigo, softer hover)
<div className="... border border-slate-200 bg-white dark:border-slate-700 dark:bg-card ... hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-800">
```

### Client Page Header (CONSIST-02)
```typescript
// BEFORE (FinanceiroIndex.tsx, DocViewer.tsx)
<span className="text-xs font-semibold uppercase tracking-widest text-primary">
  financeiro-conta-azul
</span>
<h1 className="mt-1 text-2xl font-bold text-foreground">Financeiro Conta Azul</h1>

// AFTER (matching doc page hierarchy)
<nav className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
  <span>Clientes</span>
  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
  <span className="font-medium text-slate-900 dark:text-foreground">Financeiro Conta Azul</span>
</nav>
<span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
  Clientes
</span>
<h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground">
  Financeiro Conta Azul
</h1>
```

### PromptBlock Dark Theme (CONSIST-04)
```typescript
// BEFORE (PromptBlock pre block)
<pre className="overflow-x-auto whitespace-pre-wrap bg-muted p-4 font-mono text-xs leading-relaxed text-muted-foreground">

// AFTER (dark theme matching code blocks, indigo accent header)
<div className="flex items-center justify-between border-b border-slate-700/50 bg-indigo-50 px-4 py-2.5 dark:bg-indigo-950/30 dark:border-indigo-800/50">
  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{label}</span>
  ...
</div>
<pre className="overflow-x-auto whitespace-pre-wrap rounded-b-lg bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-300 dark:bg-[hsl(var(--code-bg))] dark:text-[hsl(var(--code-fg))]">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Semantic tokens only (text-foreground, bg-card) | Explicit + semantic mix (text-slate-900 dark:text-foreground) | Phase 14-15 | More visual precision, dark mode requires explicit dark: variants |
| text-2xl font-bold for page titles | text-4xl font-extrabold tracking-tight | Phase 15 | Larger, more impactful titles matching reference design |
| blue accent for callouts | indigo accent for info, amber for warning | Phase 16 (this) | Palette consistency throughout |
| bg-muted for prompt content | bg-slate-900 dark theme | Phase 15 (code blocks) | Prompts match code block visual treatment |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 2.x |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONSIST-01 | Home page uses new typography and color system | manual-only | Visual inspection | N/A |
| CONSIST-02 | Client pages use new visual language | manual-only | Visual inspection | N/A |
| CONSIST-03 | Login/Profile pages use slate + indigo palette | manual-only | Visual inspection | N/A |
| CONSIST-04 | PromptBlock and Callout use new palette | manual-only | Visual inspection | N/A |

**Justification for manual-only:** All four requirements are purely visual CSS class changes with zero logic modifications. There are no new functions, no state changes, no API calls, and no conditional behavior to test. The validation is "does it look right" -- which is inherently visual. TypeScript compilation (`npx tsc --noEmit`) is the automated gate.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (type checking is the only automated validation meaningful for CSS-only changes)
- **Per wave merge:** `npx vitest run` (full existing test suite stays green)
- **Phase gate:** `npx tsc --noEmit` + visual inspection of all updated pages in both light and dark mode

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. No new test files needed for visual-only CSS class changes.

## Open Questions

1. **Should InfoBlock be updated too?**
   - What we know: InfoBlock uses blue/amber/green hardcoded colors, similar to Callout. It's not listed in CONSIST-04 requirements but creates the same visual inconsistency.
   - What's unclear: How frequently InfoBlock is used across pages
   - Recommendation: Update it alongside Callout for completeness. It's a small change (3 color maps) and prevents visual inconsistency.

2. **Should ProcessDocsViewer page headers be updated?**
   - What we know: ProcessDocsViewer.tsx has old-style headers (text-2xl, text-primary section label). It imports from `@/components/ui/PromptBlock` (not the docs/ version).
   - What's unclear: Whether any active routes render ProcessDocsViewer. All main doc routes go through DocRenderer now.
   - Recommendation: Update it for consistency since it's imported and potentially reachable.

3. **Should the PromptBlock duplicate be consolidated?**
   - What we know: `src/components/docs/PromptBlock.tsx` and `src/components/ui/PromptBlock.tsx` serve the same purpose with slightly different APIs.
   - What's unclear: Whether consolidation is within scope of a "consistency pass"
   - Recommendation: Update both to match visually but defer consolidation to avoid refactoring scope creep.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: All source files read directly (Home.tsx, Login.tsx, Profile.tsx, Callout.tsx, PromptBlock.tsx, DocPageHeader.tsx, DocBreadcrumb.tsx, DocTableOfContents.tsx, MarkdownRenderer.tsx, Layout.tsx, Sidebar.tsx, TopNav.tsx, globals.css, tailwind.config.ts, main.tsx, App.tsx, all client pages)
- Phase 12 RESEARCH.md: Design foundation decisions (slate + indigo palette, CSS variable architecture)
- Phase 15 RESEARCH.md: Doc rendering patterns (typography scale, dark code blocks, prose styles)
- [Clerk shadcn theme documentation](https://clerk.com/changelog/2025-07-23-shadcn-theme)
- [Clerk variables prop documentation](https://clerk.com/docs/react/guides/customizing-clerk/appearance-prop/variables)
- [Clerk custom UI skill](.agents/skills/clerk-custom-ui/SKILL.md)

### Secondary (MEDIUM confidence)
- Clerk shadcn theme behavior: Verified that `@clerk/ui/themes/shadcn` reads app CSS custom properties. The `@import '@clerk/ui/themes/shadcn.css'` in globals.css + `appearance={{ theme: shadcn }}` in main.tsx means Clerk components inherit the app's color tokens automatically.

### Tertiary (LOW confidence)
None -- all findings verified through direct codebase analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries, pure CSS class changes on existing components
- Architecture: HIGH - patterns established in Phase 14-15, just applying them to remaining pages
- Pitfalls: HIGH - all pitfalls identified through direct code reading, especially the dual PromptBlock issue and Callout hardcoded colors

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no library updates needed, purely internal class changes)
