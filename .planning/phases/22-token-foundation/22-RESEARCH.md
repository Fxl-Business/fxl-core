# Phase 22: Token Foundation — Research

**Researched:** 2026-03-11
**Domain:** CSS custom properties, wireframe design token system, client branding overrides
**Confidence:** HIGH

---

## Summary

Phase 22 replaces the wireframe design token system in `tools/wireframe-builder/styles/wireframe-tokens.css` from a warm stone-gray + gold palette to a slate + primary-blue palette matching the v1.4 financial dashboard reference. The token file uses two `[data-wf-theme]` attribute blocks (light and dark) that must both be updated atomically in a single edit pass. Both themes are governed by the same file; the `WireframeThemeProvider` injects the `data-wf-theme` attribute onto its root `<div>`.

The token system is single-file, single-source. Approximately 55 wireframe components consume `--wf-*` tokens via `var()` references — none hardcode token values directly except `GaugeChartComponent.tsx` which uses `#f59e0b` (amber-400, the Tailwind equivalent of the old gold accent) as a literal fill. That one hardcoded instance must be replaced with a new token reference. All other chart components already use `var(--wf-chart-*)` CSS variables and will auto-update when the token file changes.

The branding override path (`brandingToWfOverrides()` in `branding.ts`) currently returns an empty object — it was intentionally left as a stub because the wireframe identity (gold) was not meant to be overridden by client branding. In v1.4 the accent becomes `--wf-accent` (aliased to `--wf-primary`), and client branding needs to override `--wf-primary` so that `financeiro-conta-azul`'s `#1B6B93` propagates correctly. This requires updating `brandingToWfOverrides()` to emit `--wf-primary` from `branding.primaryColor` and the corresponding test.

**Primary recommendation:** Edit `wireframe-tokens.css` first (both theme blocks simultaneously), then fix the GaugeChart hardcode, then update `brandingToWfOverrides()`. All downstream component changes in Phases 23–27 will build on these new base values automatically.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOK-01 | Wireframe palette uses slate color scale (replacing warm stone grays) with primary blue #1152d4 (replacing gold #d4a017) | Token file audit complete — `--wf-neutral-*` values are warm stone, must replace with Tailwind slate scale. `--wf-accent` is the primary accent slot and must become #1152d4 |
| TOK-02 | Both light and dark theme blocks in wireframe-tokens.css update simultaneously with new values | Token file has two separate `[data-wf-theme]` blocks; both must be edited in same pass. Dark mode uses slightly warmer gold (#e5b028) — needs blue equivalent |
| TOK-03 | --wf-accent-muted uses color-mix() derived from --wf-accent (replacing hardcoded rgba) | Current: `rgba(212, 160, 23, 0.12)` and `rgba(229, 176, 40, 0.15)` — both hardcoded rgba. CSS `color-mix(in srgb, var(--wf-accent) 12%, transparent)` is the correct pattern (already used in WaterfallChart) |
| TOK-04 | Three new tokens added: --wf-header-search-bg, --wf-table-footer-bg, --wf-table-footer-fg | These tokens do not exist yet; must be added to both theme blocks. Used by Phase 23 (Header search input) and Phase 25 (Table dark footer row) |
| TOK-05 | Background tokens update to #f6f6f8 (light) and #101622 (dark) | Current `--wf-canvas` maps to `--wf-neutral-100` (#f5f5f4 light) and `--wf-neutral-900` (#1c1917 dark). Both must update to the exact target values |
| TOK-06 | All hardcoded colors in components (e.g., GaugeChart #f59e0b) replaced with token references | Only one hardcoded instance found: `GaugeChartComponent.tsx` lines 45 and 51 use `#f59e0b`. Must be replaced with a new `--wf-chart-warn` token or `--wf-chart-2` |
| TOK-07 | Client branding generateBrandCssVars() updated for any new overridable tokens | `brandingToWfOverrides()` in `branding.ts` currently returns `{}`. Must be updated to emit `--wf-primary: branding.primaryColor` so that financeiro-conta-azul (#1B6B93) overrides the default #1152d4 |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS custom properties (`--wf-*`) | CSS spec (no library) | Wireframe semantic token system | Already established; 240 usages across 31 files |
| `color-mix()` | CSS Color Level 5 (Baseline 2024) | Derive semi-transparent fills from opaque token values | Already used in WaterfallChart; avoids hardcoded rgba |
| Tailwind CSS 3 | 3.x (pinned in project) | Utility classes referencing `--wf-*` via `bg-wf-*/text-wf-*` | Project stack; `wf-` tokens registered in tailwind.config.ts |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 1.x (project) | Unit tests for `branding.ts` mutation | Run after updating `brandingToWfOverrides()` |
| TypeScript strict | 5.x | Type gate for branding function signatures | `npx tsc --noEmit` is the acceptance criterion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Editing `wireframe-tokens.css` only | CSS-in-JS or Tailwind CSS vars | Token file is the single source of truth; changing the approach would require touching 240 usages |
| `color-mix()` for muted | Pre-computed hex value | color-mix() stays dynamic when `--wf-accent` is overridden by client branding; static hex breaks on override |

**Installation:** No new dependencies required for this phase.

---

## Architecture Patterns

### Recommended File Structure (no changes)
```
tools/wireframe-builder/
├── styles/
│   └── wireframe-tokens.css        <- PRIMARY EDIT: both [data-wf-theme] blocks
├── components/
│   └── GaugeChartComponent.tsx     <- SECONDARY EDIT: remove #f59e0b hardcode
└── lib/
    ├── branding.ts                 <- TERTIARY EDIT: brandingToWfOverrides()
    └── branding.test.ts            <- UPDATE: test expects --wf-primary override
```

### Pattern 1: Token-First, Components Auto-Update
**What:** Change token values, not component code. Because all chart components use `var(--wf-chart-1)` etc., updating the token file propagates to ~55 components with zero component code changes.
**When to use:** All palette changes in this phase.
**Example:**
```css
/* Before (wireframe-tokens.css, light block) */
--wf-accent: #d4a017;
--wf-accent-muted: rgba(212, 160, 23, 0.12);
--wf-chart-1: #d4a017;

/* After */
--wf-accent: var(--wf-primary);         /* alias keeps backward compat */
--wf-primary: #1152d4;                  /* NEW canonical primary token */
--wf-accent-muted: color-mix(in srgb, var(--wf-accent) 12%, transparent);
--wf-chart-1: #1152d4;
--wf-chart-2: #4f46e5;                  /* indigo-600 */
--wf-chart-3: #60a5fa;                  /* blue-400 */
```

### Pattern 2: Simultaneous Dual-Block Edit
**What:** `wireframe-tokens.css` has a `[data-wf-theme="light"]` block and a `[data-wf-theme="dark"]` block. Both must be updated in the same edit. Dark mode should use a slightly brighter variant of #1152d4 (e.g., #3b72e8 or #5b8af0) for legibility on dark backgrounds.
**When to use:** Any token change in this phase — TOK-02 is a requirement.

### Pattern 3: brandingToWfOverrides() Override Mechanism
**What:** `brandingToWfOverrides()` is called at the wireframe container level to inject client-specific CSS vars. It currently returns `{}`. After this phase it must return `{ '--wf-primary': branding.primaryColor }`.
**Where it's applied:** Neither `WireframeViewer.tsx` nor `SharedWireframeView.tsx` currently calls `brandingToWfOverrides()` — they only call `brandingToCssVars()` (for `--brand-*` vars) and `getChartPalette()` (for Recharts). The `--wf-primary` override must be injected at the `[data-wf-theme]` container level. The `WireframeThemeProvider` renders a `<div data-wf-theme={theme}>` — this div is the correct injection point.

**Critical finding:** The actual injection of `brandingToWfOverrides()` result onto the theme container does not exist yet. The planner must ensure the result of `brandingToWfOverrides()` is applied as `style={}` on `WireframeThemeProvider`'s inner div, OR that a wrapper div above it receives the override vars. The theme div currently has no `style` prop.

**Example pattern (to be applied in branding.ts):**
```typescript
// Source: existing branding.ts pattern
export function brandingToWfOverrides(branding: BrandingConfig): React.CSSProperties {
  return {
    '--wf-primary': branding.primaryColor,
  } as React.CSSProperties
}
```

**And in WireframeThemeProvider (wireframe-theme.tsx):**
```tsx
// WireframeThemeProvider must accept and pass through wfOverrides
export function WireframeThemeProvider({
  children,
  defaultTheme = 'light',
  wfOverrides,
}: {
  children: ReactNode
  defaultTheme?: WireframeTheme
  wfOverrides?: React.CSSProperties
}) {
  // ...
  return (
    <WireframeThemeContext.Provider value={{ theme, toggle, setTheme }}>
      <div data-wf-theme={theme} style={wfOverrides}>
        {children}
      </div>
    </WireframeThemeContext.Provider>
  )
}
```

### Pattern 4: useWireframeChartPalette() Hook
**What:** STATE.md documents: "useWireframeChartPalette() hook: implement in Phase 22 (small code, prevents Recharts Legend CSS var mis-resolution)". Recharts resolves `fill` and `stroke` as SVG attributes, which CAN accept `var()`. However, Recharts `<Legend>` renders a `<li>` with inline `background-color`, which CANNOT resolve CSS vars. The hook reads the CSS var value at runtime and returns resolved hex strings.
**Where:** New file `tools/wireframe-builder/lib/useWireframeChartPalette.ts`
**Example:**
```typescript
// Source: STATE.md decision + CSS var resolution pattern
import { useEffect, useState } from 'react'

export function useWireframeChartPalette(containerRef: React.RefObject<HTMLElement>): string[] {
  const [palette, setPalette] = useState<string[]>([])
  useEffect(() => {
    if (!containerRef.current) return
    const style = getComputedStyle(containerRef.current)
    setPalette([
      style.getPropertyValue('--wf-chart-1').trim(),
      style.getPropertyValue('--wf-chart-2').trim(),
      style.getPropertyValue('--wf-chart-3').trim(),
      style.getPropertyValue('--wf-chart-4').trim(),
      style.getPropertyValue('--wf-chart-5').trim(),
    ])
  }, [containerRef])
  return palette
}
```

### Anti-Patterns to Avoid
- **Renaming existing `--wf-*` tokens:** 240 usages across 31 files, no TypeScript enforcement. Rename = manual find-replace across 31 files. Only change values, never names. Exception: add NEW tokens only.
- **Hardcoded rgba() in tokens:** Breaks client branding color override. Use `color-mix(in srgb, var(--wf-accent) 12%, transparent)` instead.
- **Single-block edit (light only):** If dark block is not updated simultaneously, dark mode renders with old gold palette. TOK-02 is explicit about this.
- **Injecting overrides on a div above `[data-wf-theme]`:** CSS custom properties cascade down through the DOM. Overrides MUST be on the same element as `[data-wf-theme]` or a descendant to override the `[data-wf-theme]` attribute-scoped vars correctly. The attribute selector has specificity; a div above it won't override without `!important`. Use the theme div itself.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Semi-transparent accent fills | Custom rgba() calculator | `color-mix(in srgb, var(--wf-accent) 12%, transparent)` | Already established in WaterfallChart; handles branding override dynamically |
| CSS var resolution for Recharts Legend | getComputedStyle polling loop | `useWireframeChartPalette()` hook (see Pattern 4) | One-time effect on mount; clean and minimal |
| Gauge chart amber zone color | Hardcoded hex literal | New `--wf-chart-warn` token in wireframe-tokens.css | Allows theme control; removes the only hardcoded component color |

**Key insight:** The token file is the single point of control. Phase 22's entire scope is that one CSS file plus two function bodies. Downstream component complexity is deliberately deferred to Phases 23–27.

---

## Common Pitfalls

### Pitfall 1: Dark mode accent brightness
**What goes wrong:** Using the same #1152d4 in both light and dark modes. On a dark background (#101622), the primary blue needs to be lighter for sufficient contrast.
**Why it happens:** Direct copy-paste of light token values to dark block.
**How to avoid:** Use a lighter blue variant for dark mode. Candidate: `#4d7ce8` or `#5b8af0` (lightened from #1152d4 by ~25 lightness units in HSL). The existing `lighten()` utility in `branding.ts` can compute this, but for a hardcoded token it just needs a specific hex.
**Warning signs:** Dark mode screenshot shows near-invisible primary elements.

### Pitfall 2: `color-mix()` browser support assumption
**What goes wrong:** Assuming `color-mix()` requires a polyfill in the project stack.
**Why it happens:** It's a CSS Color Level 5 feature.
**How to avoid:** `color-mix()` is Baseline 2024 (supported in all modern browsers). The project already uses it in `WaterfallChart.tsx` line 40: `color-mix(in srgb, var(--wf-chart-1) 40%, transparent)`. No action needed — it works.
**Warning signs:** N/A — already confirmed working in the project.

### Pitfall 3: --wf-primary override not reaching [data-wf-theme] context
**What goes wrong:** `brandingToWfOverrides()` is updated but the result is not applied to the correct DOM element. If applied to a parent div, the attribute-scoped `[data-wf-theme]` block re-declares `--wf-primary` with higher specificity, ignoring the parent override.
**Why it happens:** CSS attribute selectors have higher specificity than inline styles on ancestor elements.
**How to avoid:** Inject the override `style={}` directly on the `<div data-wf-theme={theme}>` element inside `WireframeThemeProvider`. This requires adding a `wfOverrides?: React.CSSProperties` prop to `WireframeThemeProvider`.
**Warning signs:** `--wf-primary` in computed styles shows #1152d4 even for financeiro-conta-azul viewer.

### Pitfall 4: branding.test.ts expects empty object
**What goes wrong:** After updating `brandingToWfOverrides()` to return `{ '--wf-primary': ... }`, the existing test `expect(Object.keys(overrides)).toHaveLength(0)` fails.
**Why it happens:** Test was written when the function intentionally returned `{}`.
**How to avoid:** Update the test to assert `overrides['--wf-primary'] === DEFAULT_BRANDING.primaryColor` and that `Object.keys(overrides)` contains exactly `'--wf-primary'`.
**Warning signs:** `vitest run` reports 1 failing test in `branding.test.ts`.

### Pitfall 5: --wf-accent-fg needs update for blue primary
**What goes wrong:** `--wf-accent-fg` stays as `#78590a` (warm amber foreground for gold accent). With blue primary, this produces poor contrast on blue backgrounds.
**Why it happens:** Accent foreground is a semantic token that pairs with the accent background.
**How to avoid:** Update `--wf-accent-fg` to white (`#ffffff`) in light mode and `#e0eaff` or `#c7d9ff` in dark mode. Blue accent with white text is the standard pattern.
**Warning signs:** Text on accent-colored buttons (AdminToolbar, WireframeFilterBar) is dark brown on blue.

### Pitfall 6: Slate neutral scale must not keep warm stone values
**What goes wrong:** Only updating semantic tokens (`--wf-canvas`, `--wf-card`, etc.) without updating the `--wf-neutral-*` scale underneath.
**Why it happens:** Semantic tokens alias the neutral scale — but some components may directly use `--wf-neutral-*` tokens.
**How to avoid:** Replace the `--wf-neutral-*` scale (both blocks) from Tailwind stone values to Tailwind slate values. Slate-50 = `#f8fafc`, Slate-100 = `#f1f5f9`, Slate-200 = `#e2e8f0`, Slate-300 = `#cbd5e1`, Slate-400 = `#94a3b8`, Slate-500 = `#64748b`, Slate-600 = `#475569`, Slate-700 = `#334155`, Slate-800 = `#1e293b`, Slate-900 = `#0f172a`.
**Warning signs:** Visual shows warm beige tones instead of cool gray slate tones.

---

## Code Examples

Verified patterns from existing codebase:

### Existing color-mix() usage (confirmed working)
```typescript
// Source: tools/wireframe-builder/components/WaterfallChart.tsx line 40
subtotal: 'color-mix(in srgb, var(--wf-chart-1) 40%, transparent)',
```

### Current token structure to transform
```css
/* Source: tools/wireframe-builder/styles/wireframe-tokens.css (current) */
[data-wf-theme="light"] {
  --wf-neutral-50: #fafaf9;   /* stone-50 -- replace with slate-50 #f8fafc */
  --wf-accent: #d4a017;       /* gold -- replace with --wf-primary alias */
  --wf-accent-muted: rgba(212, 160, 23, 0.12);  /* replace with color-mix() */
  --wf-canvas: var(--wf-neutral-100);  /* becomes #f6f6f8 per TOK-05 */
}
```

### Target token structure (Phase 22 output)
```css
[data-wf-theme="light"] {
  /* Slate neutral scale */
  --wf-neutral-50: #f8fafc;
  --wf-neutral-100: #f1f5f9;
  --wf-neutral-200: #e2e8f0;
  --wf-neutral-300: #cbd5e1;
  --wf-neutral-400: #94a3b8;
  --wf-neutral-500: #64748b;
  --wf-neutral-600: #475569;
  --wf-neutral-700: #334155;
  --wf-neutral-800: #1e293b;
  --wf-neutral-900: #0f172a;

  /* Primary blue */
  --wf-primary: #1152d4;
  --wf-accent: var(--wf-primary);       /* backward compat alias */
  --wf-accent-muted: color-mix(in srgb, var(--wf-accent) 12%, transparent);
  --wf-accent-fg: #ffffff;

  /* Canvas overrides per TOK-05 */
  --wf-canvas: #f6f6f8;                 /* NOT var(--wf-neutral-100) */
  --wf-card: #ffffff;

  /* New tokens per TOK-04 */
  --wf-header-search-bg: #f1f5f9;       /* slate-100 */
  --wf-table-footer-bg: #0f172a;        /* slate-900 */
  --wf-table-footer-fg: #ffffff;

  /* Chart palette: primary blue + indigo + blue-400 + slate scale */
  --wf-chart-1: #1152d4;
  --wf-chart-2: #4f46e5;               /* indigo-600 */
  --wf-chart-3: #60a5fa;               /* blue-400 */
  --wf-chart-4: #94a3b8;               /* slate-400 */
  --wf-chart-5: #475569;               /* slate-600 */

  /* Warn zone for gauge chart (replaces #f59e0b hardcode) */
  --wf-chart-warn: #f59e0b;            /* keep amber-400 for warning semantic */
}

[data-wf-theme="dark"] {
  /* ... same neutral scale ... */
  --wf-primary: #4d7ce8;               /* lighter for dark bg contrast */
  --wf-accent: var(--wf-primary);
  --wf-accent-muted: color-mix(in srgb, var(--wf-accent) 15%, transparent);
  --wf-accent-fg: #e0eaff;

  --wf-canvas: #101622;                /* TOK-05 exact value */
  --wf-card: #1a2235;

  --wf-header-search-bg: #1e293b;      /* slate-800 */
  --wf-table-footer-bg: #0f172a;       /* slate-900 */
  --wf-table-footer-fg: #f8fafc;       /* slate-50 */

  /* Chart palette (brighter for dark) */
  --wf-chart-1: #4d7ce8;
  --wf-chart-2: #818cf8;               /* indigo-400 */
  --wf-chart-3: #93c5fd;               /* blue-300 */
  --wf-chart-4: #94a3b8;               /* slate-400 */
  --wf-chart-5: #64748b;               /* slate-500 */

  --wf-chart-warn: #fbbf24;            /* amber-400 brighter for dark bg */
}
```

### GaugeChart hardcode fix (TOK-06)
```tsx
// Source: tools/wireframe-builder/components/GaugeChartComponent.tsx lines 43-52
// Before:
z.color ?? (i === 0 ? 'var(--wf-negative)' : i === 1 ? '#f59e0b' : 'var(--wf-positive)')
// After:
z.color ?? (i === 0 ? 'var(--wf-negative)' : i === 1 ? 'var(--wf-chart-warn)' : 'var(--wf-positive)')
```

### brandingToWfOverrides() update (TOK-07)
```typescript
// Source: tools/wireframe-builder/lib/branding.ts — function to update
export function brandingToWfOverrides(branding: BrandingConfig): React.CSSProperties {
  return {
    '--wf-primary': branding.primaryColor,
  } as React.CSSProperties
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Warm stone grays + gold accent | Slate grays + primary blue | Phase 22 (this phase) | All 55 wireframe components update automatically via CSS cascade |
| Hardcoded rgba() for muted fills | `color-mix()` derived | Phase 22 | Muted fills stay correct when client overrides `--wf-primary` |
| `brandingToWfOverrides()` returns `{}` | Returns `{ '--wf-primary': ... }` | Phase 22 | Client branding (financeiro-conta-azul #1B6B93) correctly overrides the default blue |

**Deprecated/outdated:**
- Gold accent `#d4a017` / `#e5b028`: replaced by `--wf-primary: #1152d4`. The `--wf-accent` token name is preserved as an alias.
- Stone neutral scale (`#fafaf9` to `#1c1917`): replaced by Tailwind slate scale.
- Hardcoded `rgba()` in token file: replaced by `color-mix()`.

---

## Open Questions

1. **Canvas token vs fixed values for TOK-05**
   - What we know: TOK-05 specifies exact values `#f6f6f8` (light) and `#101622` (dark) — these are NOT Tailwind slate values. `#f6f6f8` is between slate-50 (#f8fafc) and slate-100 (#f1f5f9). `#101622` is not in the standard slate scale.
   - What's unclear: Should `--wf-canvas` remain a semantic alias to `--wf-neutral-100`, or be a hard override to the exact values?
   - Recommendation: Set `--wf-canvas` to the exact hardcoded hex values (`#f6f6f8`, `#101622`) directly in the token file for the canvas, not via alias. This is an intentional departure from the neutral scale for the background token.

2. **WireframeThemeProvider prop addition scope**
   - What we know: The `wfOverrides` prop needs to be added to `WireframeThemeProvider` for TOK-07 to work. Both `WireframeViewer.tsx` and `SharedWireframeView.tsx` instantiate `WireframeThemeProvider`.
   - What's unclear: Both callers need to pass the resolved `brandingToWfOverrides(branding)` result through. This is a small code change in both files.
   - Recommendation: Make `wfOverrides` optional with `style={wfOverrides ?? {}}` so existing usages without branding continue to work without modification.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts) |
| Config file | `/Users/cauetpinciara/Documents/fxl/fxl-core/vitest.config.ts` |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/branding.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOK-01 | Slate palette tokens in light mode | manual | Visual inspection in browser | N/A |
| TOK-02 | Both theme blocks updated | manual | Visual inspection in dark mode | N/A |
| TOK-03 | --wf-accent-muted uses color-mix() | manual | grep in CSS file + visual check | N/A |
| TOK-04 | Three new tokens exist | manual | grep for `--wf-header-search-bg` in CSS | N/A |
| TOK-05 | Canvas exact values | manual | Browser DevTools computed styles | N/A |
| TOK-06 | No #f59e0b hardcodes remain | unit (grep) | `grep -r "#f59e0b" tools/wireframe-builder/` | N/A |
| TOK-07 | brandingToWfOverrides returns --wf-primary | unit | `npx vitest run tools/wireframe-builder/lib/branding.test.ts` | ✅ exists (test needs update) |

### TypeScript Gate (mandatory)
```bash
npx tsc --noEmit
```
Zero errors is the acceptance criterion for all changes.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit && npx vitest run tools/wireframe-builder/lib/branding.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers the unit-testable requirement (TOK-07 via branding.test.ts). The test file needs content update, not creation.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `tools/wireframe-builder/styles/wireframe-tokens.css` — complete token inventory
- Direct codebase inspection — `tools/wireframe-builder/lib/branding.ts` — `brandingToWfOverrides()` function body
- Direct codebase inspection — `tools/wireframe-builder/lib/wireframe-theme.tsx` — `WireframeThemeProvider` structure
- Direct codebase inspection — `tools/wireframe-builder/components/GaugeChartComponent.tsx` — only hardcoded color instance
- Direct codebase inspection — `src/pages/clients/WireframeViewer.tsx` + `src/pages/SharedWireframeView.tsx` — branding injection points
- `.planning/STATE.md` — v1.4 architectural decisions (token-first, useWireframeChartPalette, brandingToWfOverrides decision)
- `.planning/REQUIREMENTS.md` — exact token values specified (TOK-01 through TOK-07)

### Secondary (MEDIUM confidence)
- MDN Web Docs — `color-mix()` (Baseline 2024, confirmed by WaterfallChart.tsx usage already in project)
- Tailwind CSS slate scale values (standard, well-known)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — CSS custom properties, existing project patterns, no new libraries
- Architecture: HIGH — all files identified, all usages mapped via codebase grep
- Pitfalls: HIGH — all pitfalls derived from direct code inspection, not speculation

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable CSS/token system, not fast-moving)
