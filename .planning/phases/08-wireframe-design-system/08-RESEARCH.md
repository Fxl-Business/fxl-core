# Phase 8: Wireframe Design System - Research

**Researched:** 2026-03-09
**Domain:** CSS custom properties theming, Tailwind CSS 3 design system isolation, React context-based theme provider
**Confidence:** HIGH

## Summary

Phase 8 introduces a three-layer visual isolation model for wireframe rendering: app tokens (`--primary`, `--accent`), wireframe chrome (`--wf-*`), and client branding (`--brand-*`). The core work is (1) defining a new CSS custom properties layer for wireframe tokens scoped to a `[data-wf-theme]` container, (2) migrating 28 component files (232 hardcoded color references) from Tailwind gray classes and inline hex values to `--wf-*` tokens, (3) creating a `WireframeThemeProvider` React context that manages theme state and the `data-wf-theme` attribute, and (4) integrating branding overrides that replace accent and sidebar tokens without affecting the neutral scale.

The project uses Tailwind CSS 3 with HSL-based CSS custom properties (the shadcn/ui pattern). The wireframe tokens will follow the same CSS custom properties approach but use hex values (not HSL) since the wireframe palette is explicitly defined in CONTEXT.md as hex values and charts need hex strings for SVG fill/stroke. A critical finding: SVG `fill` and `stroke` attributes **do** support `var()` for CSS custom properties, contradicting the existing comment in `branding.ts`. This means charts CAN consume `--wf-*` tokens via `var()` instead of requiring resolved hex props.

**Primary recommendation:** Define wireframe tokens as CSS custom properties under `[data-wf-theme="light"]` and `[data-wf-theme="dark"]` selectors in a dedicated CSS file. Add Tailwind utilities via the config extending colors with `var()` references. Create a React context provider that manages the theme attribute. Migrate components file-by-file from hardcoded values to token references.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Warm grays (stone-toned) for the 10-step neutral scale -- pairs naturally with gold accent
- Scale: wf-neutral-50 (#fafaf9) through wf-neutral-900 (#1c1917)
- Rich gold accent: --wf-accent #d4a017, --wf-accent-muted at 12% opacity, --wf-accent-fg #78590a
- Cards separated by thin borders (--wf-neutral-200), no box-shadows
- Tinted canvas: wireframe container uses wf-neutral-100, cards sit on wf-neutral-50 (light mode). Dark mode: canvas wf-neutral-900, cards wf-neutral-800
- Gold-anchored chart palette: series 1 uses gold accent, subsequent series use warm-toned complements
- Green/red semantic colors for positive/negative indicators: --wf-positive #16a34a, --wf-negative #dc2626
- Text hierarchy from warm gray scale: headings wf-neutral-700, body wf-neutral-600, muted wf-neutral-400
- Wireframe sidebar IS part of wireframe and uses --wf-* tokens (not app tokens)
- Toggle lives in AdminToolbar (alongside edit mode, save, share)
- Default: light mode
- Preference persists in localStorage per operator
- Shared/client view also has a dark/light toggle available
- Wireframe theme is fully independent from app dark/light mode
- Theme controlled via data-wf-theme attribute on wireframe container (WireframeThemeProvider)
- Branding overrides accent + sidebar only: brand primaryColor replaces --wf-accent, tints sidebar bg
- Fonts and logo from BrandingConfig applied to wireframe
- Content blocks (KPIs, tables) keep neutral warm gray palette regardless of branding
- Sidebar fg computed for contrast against brand primaryColor

### Claude's Discretion
- Chart series colors when branding is active (use brand colors or keep gold-anchored)
- Exact border radius and spacing tokens
- Wireframe chrome vs content boundary (which elements are "chrome" and which are "content")
- Dark mode warm gray values fine-tuning
- Toggle icon/button design
- How branding override is injected (inline style, CSS custom properties layer, or data attribute)

### Deferred Ideas (OUT OF SCOPE)
- Sidebar widgets: workspace selectors, sub-menus with icons, user icon in sidebar -- belongs in Phase 9 or dedicated sidebar expansion phase
- Sidebar navigation patterns (collapsible groups, active state indicators) -- future phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | Wireframe renderizado com tokens semanticos --wf-* (paleta neutra 10 tons + dourado accent) | CSS custom properties layer with [data-wf-theme] scoping; Tailwind config extension for wf-* utilities; 28 files / 232 references need migration |
| DSGN-02 | WireframeThemeProvider gerencia tema do wireframe via data-wf-theme attribute | React context provider pattern with data attribute on container div; localStorage persistence; independent from app theme |
| DSGN-03 | Operador pode alternar dark/light mode no wireframe viewer | Toggle button in AdminToolbar; theme state in context; CSS custom properties swap on data-wf-theme change |
| DSGN-04 | Branding do cliente aplicado como override sobre tokens wireframe sem colisao com tema do app | Inline style injection overriding --wf-accent/sidebar vars; existing branding.ts helpers extended; contrast computation for sidebar fg |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | CSS3 | Token system for wireframe variables | Native browser feature, zero runtime cost, cascading inheritance enables scoped overrides |
| Tailwind CSS | 3.x (existing) | Utility classes mapped to --wf-* tokens | Already in stack; extend theme.colors in config for wf-* prefix |
| React Context | 18.x (existing) | WireframeThemeProvider state management | Lightweight, no new dependency; manages theme string + toggle function |
| lucide-react | (existing) | Toggle icon (Sun/Moon) for dark/light toggle | Already in stack |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cn() utility | (existing) | Composing Tailwind classes conditionally | Used in every component for dark/light conditional styling |
| branding.ts | (existing) | Color math helpers (HSL conversion, lighten, darken) | Extended for branding -> wireframe token override computation |
| localStorage | Web API | Theme preference persistence | Operator toggles dark/light, persisted per device |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Custom Properties | CSS-in-JS (styled-components) | CSS vars are zero-runtime, no new dependency; CSS-in-JS adds bundle size and complexity |
| Tailwind extend | Standalone CSS file only | Tailwind utilities enable Tailwind class syntax (bg-wf-card) which is consistent with existing patterns |
| React Context | Zustand store | Context is sufficient for a single boolean + setter; Zustand adds a dependency for negligible benefit |

**Installation:**
```bash
# No new packages needed -- all existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  styles/
    wireframe-tokens.css     # NEW: --wf-* custom properties under [data-wf-theme]
  lib/
    branding.ts              # MODIFIED: add brandingToWfOverrides() for --wf-accent override
    wireframe-theme.tsx      # NEW: WireframeThemeProvider context + useWireframeTheme hook
  components/
    [28 component files]     # MODIFIED: migrate hardcoded colors to --wf-* tokens
    editor/
      AdminToolbar.tsx       # MODIFIED: add dark/light toggle button
```

### Pattern 1: CSS Custom Properties Scoping via Data Attribute

**What:** Define --wf-* tokens under `[data-wf-theme="light"]` and `[data-wf-theme="dark"]` selectors in a dedicated CSS file. The tokens only apply within elements that have the data attribute, creating natural isolation from app tokens.

**When to use:** Always -- this is the foundation of the entire phase.

**Example:**
```css
/* tools/wireframe-builder/styles/wireframe-tokens.css */

/* Light mode wireframe tokens */
[data-wf-theme="light"] {
  /* Neutral scale (warm stone grays) */
  --wf-neutral-50: #fafaf9;
  --wf-neutral-100: #f5f5f4;
  --wf-neutral-200: #e7e5e4;
  --wf-neutral-300: #d6d3d1;
  --wf-neutral-400: #a8a29e;
  --wf-neutral-500: #78716c;
  --wf-neutral-600: #57534e;
  --wf-neutral-700: #44403c;
  --wf-neutral-800: #292524;
  --wf-neutral-900: #1c1917;

  /* Semantic mapping */
  --wf-canvas: var(--wf-neutral-100);
  --wf-card: var(--wf-neutral-50);
  --wf-card-border: var(--wf-neutral-200);
  --wf-heading: var(--wf-neutral-700);
  --wf-body: var(--wf-neutral-600);
  --wf-muted: var(--wf-neutral-400);

  /* Gold accent */
  --wf-accent: #d4a017;
  --wf-accent-muted: rgba(212, 160, 23, 0.12);
  --wf-accent-fg: #78590a;

  /* Semantic colors */
  --wf-positive: #16a34a;
  --wf-negative: #dc2626;

  /* Sidebar (part of wireframe chrome) */
  --wf-sidebar-bg: var(--wf-neutral-800);
  --wf-sidebar-fg: var(--wf-neutral-50);
  --wf-sidebar-active: var(--wf-accent);
  --wf-sidebar-muted: var(--wf-neutral-400);
  --wf-sidebar-border: var(--wf-neutral-700);

  /* Header chrome */
  --wf-header-bg: var(--wf-card);
  --wf-header-border: var(--wf-card-border);

  /* Table */
  --wf-table-header-bg: var(--wf-neutral-800);
  --wf-table-header-fg: var(--wf-neutral-50);
  --wf-table-row-alt: var(--wf-neutral-100);
  --wf-table-border: var(--wf-neutral-200);

  /* Chart palette */
  --wf-chart-1: #d4a017;  /* gold accent */
  --wf-chart-2: #b45309;  /* warm amber */
  --wf-chart-3: #92400e;  /* deep amber */
  --wf-chart-4: #78716c;  /* neutral-500 */
  --wf-chart-5: #57534e;  /* neutral-600 */
}

/* Dark mode wireframe tokens */
[data-wf-theme="dark"] {
  --wf-neutral-50: #fafaf9;
  --wf-neutral-100: #f5f5f4;
  --wf-neutral-200: #e7e5e4;
  --wf-neutral-300: #d6d3d1;
  --wf-neutral-400: #a8a29e;
  --wf-neutral-500: #78716c;
  --wf-neutral-600: #57534e;
  --wf-neutral-700: #44403c;
  --wf-neutral-800: #292524;
  --wf-neutral-900: #1c1917;

  /* Dark mode semantic mapping (inverted) */
  --wf-canvas: var(--wf-neutral-900);
  --wf-card: var(--wf-neutral-800);
  --wf-card-border: var(--wf-neutral-700);
  --wf-heading: var(--wf-neutral-200);
  --wf-body: var(--wf-neutral-300);
  --wf-muted: var(--wf-neutral-500);

  /* Gold accent (slightly warmer for dark bg) */
  --wf-accent: #e5b028;
  --wf-accent-muted: rgba(229, 176, 40, 0.15);
  --wf-accent-fg: #fef3c7;

  --wf-positive: #22c55e;
  --wf-negative: #f87171;

  --wf-sidebar-bg: #0f0e0d;
  --wf-sidebar-fg: var(--wf-neutral-200);
  --wf-sidebar-active: var(--wf-accent);
  --wf-sidebar-muted: var(--wf-neutral-500);
  --wf-sidebar-border: var(--wf-neutral-800);

  --wf-header-bg: var(--wf-card);
  --wf-header-border: var(--wf-card-border);

  --wf-table-header-bg: var(--wf-neutral-900);
  --wf-table-header-fg: var(--wf-neutral-200);
  --wf-table-row-alt: var(--wf-neutral-800);
  --wf-table-border: var(--wf-neutral-700);

  --wf-chart-1: #e5b028;
  --wf-chart-2: #d97706;
  --wf-chart-3: #b45309;
  --wf-chart-4: #a8a29e;
  --wf-chart-5: #78716c;
}
```

### Pattern 2: WireframeThemeProvider Context

**What:** React context provider that manages wireframe theme state, sets `data-wf-theme` on container, and optionally injects branding overrides. Consumed by WireframeViewer and SharedWireframeView.

**When to use:** Wraps all wireframe content areas.

**Example:**
```typescript
// tools/wireframe-builder/lib/wireframe-theme.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type WireframeTheme = 'light' | 'dark'

type WireframeThemeContextValue = {
  theme: WireframeTheme
  toggle: () => void
  setTheme: (theme: WireframeTheme) => void
}

const WireframeThemeContext = createContext<WireframeThemeContextValue | null>(null)

const STORAGE_KEY = 'fxl_wf_theme'

export function WireframeThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: ReactNode
  defaultTheme?: WireframeTheme
}) {
  const [theme, setTheme] = useState<WireframeTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored === 'light' || stored === 'dark') ? stored : defaultTheme
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <WireframeThemeContext.Provider value={{ theme, toggle, setTheme }}>
      <div data-wf-theme={theme}>
        {children}
      </div>
    </WireframeThemeContext.Provider>
  )
}

export function useWireframeTheme(): WireframeThemeContextValue {
  const ctx = useContext(WireframeThemeContext)
  if (!ctx) throw new Error('useWireframeTheme must be used within WireframeThemeProvider')
  return ctx
}
```

### Pattern 3: Component Token Migration (Hardcoded to Token-Based)

**What:** Each wireframe component replaces hardcoded Tailwind classes and hex values with --wf-* token references.

**When to use:** Applied to all 28 wireframe component files during migration.

**Before (hardcoded):**
```tsx
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <p className="text-sm font-semibold text-gray-700">{title}</p>
```

**After (token-based):**
```tsx
<div className="rounded-lg border p-4"
     style={{
       borderColor: 'var(--wf-card-border)',
       backgroundColor: 'var(--wf-card)',
     }}>
  <p className="text-sm font-semibold" style={{ color: 'var(--wf-heading)' }}>{title}</p>
```

**Alternative (with Tailwind config extension):**
If Tailwind is extended with wf-* colors in the config, components can use Tailwind utility classes:
```tsx
<div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
  <p className="text-sm font-semibold text-wf-heading">{title}</p>
```

**Recommendation:** Use the Tailwind config extension approach where possible (bg-wf-card, text-wf-heading, border-wf-card-border) since it keeps the codebase consistent with existing Tailwind patterns. For inline style elements (WireframeHeader, WireframeFilterBar), use `var()` directly.

### Pattern 4: Branding Override Injection

**What:** Client branding replaces --wf-accent and --wf-sidebar-bg with brand colors via inline style on the wireframe container.

**When to use:** When a client has BrandingConfig defined.

**Example:**
```typescript
// In branding.ts, add:
export function brandingToWfOverrides(branding: BrandingConfig): React.CSSProperties {
  const sidebarBg = darken(branding.primaryColor, 20)
  const sidebarFg = computeContrastFg(sidebarBg) // white or dark text

  return {
    '--wf-accent': branding.primaryColor,
    '--wf-accent-fg': computeContrastFg(branding.primaryColor),
    '--wf-sidebar-bg': sidebarBg,
    '--wf-sidebar-fg': sidebarFg,
    '--wf-sidebar-active': branding.primaryColor,
    '--wf-sidebar-border': branding.primaryColor,
  } as React.CSSProperties
}
```

### Pattern 5: Chart Colors with CSS Variables

**What:** SVG `fill` and `stroke` attributes DO support `var()` syntax. Recharts props like `fill="var(--wf-chart-1)"` work correctly.

**When to use:** Chart components can reference --wf-* tokens directly instead of requiring resolved hex props.

**Critical finding:** The existing `branding.ts` includes a comment: "Recharts SVG fill/stroke attributes do NOT support CSS var()". This is incorrect. MDN confirms SVG presentation attributes accept `var()`, and the Reshaped library documents this pattern explicitly with Recharts. The existing `getChartPalette()` approach (resolving hex strings to pass as props) works but is not strictly necessary.

**Recommendation for this phase:** Use `var()` for chart colors where charts are consumed inside the `[data-wf-theme]` container. For the branding override case, continue resolving hex values since branding may dynamically change the accent, and the resolved approach gives more control.

### Anti-Patterns to Avoid
- **Mixing app tokens in wireframe components:** Never use `bg-background`, `text-foreground`, `bg-primary`, or any shadcn/ui semantic token inside wireframe components. These belong to the app shell.
- **Hardcoded hex values in component files:** The entire point of this phase is to remove these. Every color must come from a `--wf-*` token.
- **Inline `shadow-sm`:** User locked decision says "no box-shadows" for wireframe cards. Remove all `shadow-sm` from wireframe components.
- **Modifying globals.css :root:** Wireframe tokens live in their own CSS file under `[data-wf-theme]` selectors, never in the app-level `:root`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color contrast computation | Manual luminance formula | `hexToHsl()` already in branding.ts + simple L threshold | Existing helper already handles HSL conversion; L > 50 = dark text, L <= 50 = white text |
| Theme persistence | Custom cookie/session logic | localStorage with `STORAGE_KEY` pattern | Already used for client name storage in SharedWireframeView; consistent pattern |
| CSS variable injection for branding | New CSS-in-JS solution | Inline `style` prop with `--wf-*` overrides | Already used for `--brand-*` injection in branding.ts; same pattern extended |
| Dark mode toggle UI | Custom toggle from scratch | lucide-react Sun/Moon icons + existing Button component from shadcn/ui | Consistent with existing AdminToolbar button pattern |

**Key insight:** This phase requires no new libraries. Every tool needed (CSS custom properties, React context, Tailwind config extension, existing branding helpers) is already in the stack. The complexity is in the systematic migration of 28 component files.

## Common Pitfalls

### Pitfall 1: Tailwind Purge Missing Dynamic var() Classes
**What goes wrong:** Tailwind purges unused utility classes. If you use `bg-wf-card` but the class name is only constructed via string interpolation, Tailwind may not detect it and will purge it.
**Why it happens:** Tailwind's JIT compiler scans source files for class names statically. Dynamic class construction like `bg-wf-${name}` will not be found.
**How to avoid:** Always use full class names in source code. If extending Tailwind config, write the full `bg-wf-card`, `text-wf-heading`, etc. Never construct class names dynamically.
**Warning signs:** Colors work in dev but disappear in production build.

### Pitfall 2: CSS Variable Inheritance Leaking Into Nested App Components
**What goes wrong:** If any app-shell component (like a modal or toast) renders inside the wireframe container, it inherits --wf-* tokens and may display incorrectly.
**Why it happens:** CSS custom properties cascade. Any child of `[data-wf-theme]` inherits its variables.
**How to avoid:** Ensure modals, toasts (`sonner`), and other app-level overlays render outside the `[data-wf-theme]` container via portals. The existing `CommentOverlay` and `CommentManager` may need attention since they render inside the wireframe viewer.
**Warning signs:** Toast notifications or modals showing wireframe colors instead of app colors.

### Pitfall 3: Inline Style Elements Not Responding to Theme Toggle
**What goes wrong:** Components like `WireframeHeader` and `WireframeFilterBar` use inline `style={{}}` objects with hardcoded hex values (`#FFFFFF`, `#212121`). These won't respond to theme changes.
**Why it happens:** The current implementation uses React inline styles with literal hex values rather than CSS custom properties.
**How to avoid:** Replace inline hex values with `var(--wf-*)` references. For example: `background: 'var(--wf-header-bg)'` instead of `background: '#FFFFFF'`.
**Warning signs:** Header and filter bar stay white/light even when dark mode is active.

### Pitfall 4: Recharts Tooltip/Legend Colors Not Theming
**What goes wrong:** Recharts tooltips render with their own hardcoded background/text colors. Custom tooltip components inside wireframe charts may not pick up theme tokens.
**Why it happens:** Custom tooltip components (like `CustomTooltip` in WaterfallChart.tsx) use hardcoded classes like `bg-white text-gray-700`.
**How to avoid:** Update all custom tooltip and legend components to use --wf-* tokens.
**Warning signs:** Tooltips appear as white boxes on dark mode wireframes.

### Pitfall 5: Branding Override Clobbering Dark Mode Tokens
**What goes wrong:** Branding injects `--wf-accent: ${brandColor}` which may not have a corresponding dark-mode-adjusted variant, resulting in poor contrast.
**Why it happens:** Branding colors are client-defined hex values that work for light mode but may need adjustment for dark mode.
**How to avoid:** When computing branding overrides, also compute a dark-mode variant of the accent (slightly lighter/more saturated). Apply different override values based on the current wireframe theme.
**Warning signs:** Brand accent color is unreadable on dark wireframe backgrounds.

### Pitfall 6: Shadow Removal Breaking Visual Hierarchy
**What goes wrong:** Removing `shadow-sm` from all cards (per user decision) may make the UI look flat and cards indistinguishable from background.
**Why it happens:** The current design uses shadows as the primary card separator. Switching to borders-only changes the visual language.
**How to avoid:** Ensure `--wf-card-border` contrast is sufficient. The tinted canvas (wf-neutral-100) vs card (wf-neutral-50) difference helps. Test visually after migration.
**Warning signs:** Cards blend into background with no clear boundaries.

## Code Examples

### Tailwind Config Extension for wf-* Tokens

```typescript
// Source: Tailwind CSS 3 docs -- custom colors via CSS variables
// In tailwind.config.ts, add to theme.extend.colors:
wf: {
  canvas: 'var(--wf-canvas)',
  card: 'var(--wf-card)',
  'card-border': 'var(--wf-card-border)',
  heading: 'var(--wf-heading)',
  body: 'var(--wf-body)',
  muted: 'var(--wf-muted)',
  accent: 'var(--wf-accent)',
  'accent-muted': 'var(--wf-accent-muted)',
  'accent-fg': 'var(--wf-accent-fg)',
  positive: 'var(--wf-positive)',
  negative: 'var(--wf-negative)',
  sidebar: {
    DEFAULT: 'var(--wf-sidebar-bg)',
    fg: 'var(--wf-sidebar-fg)',
    active: 'var(--wf-sidebar-active)',
    muted: 'var(--wf-sidebar-muted)',
    border: 'var(--wf-sidebar-border)',
  },
  'table-header': {
    DEFAULT: 'var(--wf-table-header-bg)',
    fg: 'var(--wf-table-header-fg)',
  },
  'table-row-alt': 'var(--wf-table-row-alt)',
  'table-border': 'var(--wf-table-border)',
},
```

### KpiCard Migration Example (Before/After)

```tsx
// BEFORE (hardcoded):
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
  <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>

// AFTER (token-based):
<div className="rounded-lg border border-wf-card-border bg-wf-card p-4">
  <p className="text-xs font-medium uppercase tracking-wide text-wf-muted">{label}</p>
  <p className="mt-1 text-2xl font-bold text-wf-heading">{value}</p>
```

### Branding Override Injection

```tsx
// WireframeViewer wrapping container:
<WireframeThemeProvider>
  <div style={brandingToWfOverrides(branding)}>
    {/* All wireframe content -- branding overrides cascade into --wf-accent etc */}
  </div>
</WireframeThemeProvider>
```

### Chart with CSS Variable Colors

```tsx
// BEFORE (resolved hex prop):
<Bar dataKey="bar" fill={chartColors?.[0] ?? '#d1d5db'} />

// AFTER (CSS variable):
<Bar dataKey="bar" fill="var(--wf-chart-1)" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded Tailwind gray-* classes | CSS custom properties via [data-*] scoping | Phase 8 (this work) | Enables dark mode, branding, visual isolation |
| `getChartPalette()` returning hex array | `var(--wf-chart-N)` in SVG fill/stroke | Phase 8 (this work) | Charts auto-respond to theme toggle without prop drilling |
| `brandingToCssVars()` for --brand-* | `brandingToWfOverrides()` for --wf-* | Phase 8 (this work) | Branding overrides wireframe tokens, not separate brand layer |
| `shadow-sm` on all cards | border-only card separation | Phase 8 (this work) | Matches user's "no box-shadows" decision |

**Deprecated/outdated:**
- `getChartPalette()` in branding.ts: Still functional but the comment "Recharts SVG fill/stroke attributes do NOT support CSS var()" is factually incorrect. Charts CAN use `var()`. The helper remains useful for branding resolution but the rationale is wrong.
- WireframeSidebar component: Currently uses Tailwind gray classes. After Phase 8, the wireframe sidebar is rendered directly in WireframeViewer using --wf-sidebar-* tokens (not the WireframeSidebar component which was designed for a simpler use case).

## Open Questions

1. **Tailwind Extension vs Inline var() for Migration Strategy**
   - What we know: Both approaches work. Tailwind extension adds `bg-wf-card` utilities. Inline `var()` in style props works everywhere.
   - What's unclear: Whether to use pure Tailwind utilities, pure inline var(), or a mix. Components using inline styles already (WireframeHeader, WireframeFilterBar) will naturally use var() in style props. Components using Tailwind classes (KpiCard, DataTable) could go either way.
   - Recommendation: Use Tailwind config extension. This keeps the migration consistent with existing Tailwind patterns. The exception: components that already use inline `style={{}}` objects (WireframeHeader, WireframeFilterBar, WireframeViewer sidebar) should use `var()` in their style props.

2. **Comment Components (CommentOverlay, CommentManager) Portal Rendering**
   - What we know: These components currently render inside the wireframe viewer. They use app-level tokens (bg-white, text-gray-*).
   - What's unclear: Whether they should adopt wireframe tokens or remain app-styled via portal.
   - Recommendation: Keep comment components using app tokens and render them in a portal outside `[data-wf-theme]`. Comments are operator tools, not wireframe content.

3. **Chart Series Colors Under Branding**
   - What we know: User deferred this to Claude's discretion.
   - What's unclear: When a client brand color replaces --wf-accent, should chart series 1 also change to the brand color?
   - Recommendation: YES -- chart series 1 should use --wf-accent (which is overridden by branding). This means charts auto-brand without extra logic. Series 2-5 stay warm-toned complements.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.0.18 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run && npx tsc --noEmit` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | All wireframe components use --wf-* tokens (no hardcoded hex/gray classes) | static analysis | `grep -rn "bg-white\|bg-gray\|text-gray\|border-gray\|shadow-sm" tools/wireframe-builder/components/ \| grep -v test \| wc -l` (expect 0) | n/a (grep command) |
| DSGN-01 | Wireframe tokens CSS file defines all required variables | unit | `npx vitest run tools/wireframe-builder/lib/wireframe-theme.test.ts -x` | Wave 0 |
| DSGN-02 | WireframeThemeProvider sets data-wf-theme attribute | unit | `npx vitest run tools/wireframe-builder/lib/wireframe-theme.test.ts -x` | Wave 0 |
| DSGN-03 | Theme toggle changes data-wf-theme value | unit | `npx vitest run tools/wireframe-builder/lib/wireframe-theme.test.ts -x` | Wave 0 |
| DSGN-03 | Theme preference persists in localStorage | unit | `npx vitest run tools/wireframe-builder/lib/wireframe-theme.test.ts -x` | Wave 0 |
| DSGN-04 | brandingToWfOverrides produces correct --wf-accent override | unit | `npx vitest run tools/wireframe-builder/lib/branding.test.ts -x` | Wave 0 |
| DSGN-04 | Sidebar fg contrast computed correctly | unit | `npx vitest run tools/wireframe-builder/lib/branding.test.ts -x` | Wave 0 |
| ALL | TypeScript compiles with zero errors | type check | `npx tsc --noEmit` | n/a (compiler) |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (mandatory per CLAUDE.md)
- **Per wave merge:** `npx vitest run && npx tsc --noEmit`
- **Phase gate:** Full suite green + grep hardcoded colors = 0 before verify-work

### Wave 0 Gaps
- [ ] `tools/wireframe-builder/lib/wireframe-theme.test.ts` -- covers DSGN-02, DSGN-03
- [ ] `tools/wireframe-builder/lib/branding.test.ts` -- covers DSGN-04 (branding override helpers)
- [ ] vitest environment may need `jsdom` for React context tests (currently `node` only)
- [ ] grep-based validation script for DSGN-01 (no hardcoded colors remaining)

## Sources

### Primary (HIGH confidence)
- MDN Web Docs -- SVG fill attribute supports CSS var(): https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fill
- Tailwind CSS v3 docs -- Adding Custom Styles: https://v3.tailwindcss.com/docs/adding-custom-styles
- Reshaped Recharts integration -- confirms var() in Recharts fill/stroke props: https://www.reshaped.so/docs/getting-started/guidelines/recharts

### Secondary (MEDIUM confidence)
- CSS-Tricks -- CSS Custom Properties Guide: https://css-tricks.com/a-complete-guide-to-custom-properties/
- MDN -- Using CSS custom properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- Smashing Magazine -- CSS Custom Properties in the Cascade: https://www.smashingmagazine.com/2019/07/css-custom-properties-cascade/

### Tertiary (LOW confidence)
- Medium articles on data-attribute theming isolation (pattern validation, not API reference)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all existing stack patterns
- Architecture: HIGH -- CSS custom properties scoping is well-documented, data-attribute theming is a proven pattern, existing codebase structure is clear
- Pitfalls: HIGH -- pitfalls identified from direct code inspection of 28 component files and their 232 hardcoded color references
- Recharts + var(): HIGH -- verified via MDN (SVG fill spec) and Reshaped integration docs

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable domain -- CSS custom properties and Tailwind 3 are mature)
