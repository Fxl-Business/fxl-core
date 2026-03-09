# Phase 4: Branding Process - Research

**Researched:** 2026-03-09
**Domain:** Client branding schema, CSS custom properties injection, wireframe theming
**Confidence:** HIGH

## Summary

Phase 4 implements structured branding collection and automatic application to wireframes. The codebase already follows a declarative config-driven pattern (BlueprintConfig -> BlueprintRenderer) that naturally extends to branding. The key technical pattern is CSS custom properties injection at the wireframe container level, allowing all child components to consume brand colors through `var()` with fallbacks to current hardcoded values.

The main complexity lies in the number of integration points: 4 chart components (BarLineChart, DonutChart, WaterfallChart, ParetoChart), KpiCardFull, DataTable/DrillDownTable/ClickableTable headers, WireframeHeader, and the wireframe sidebar in both WireframeViewer and SharedWireframeView. All currently use hardcoded gray-scale colors (`#212121`, `#d1d5db`, `#374151`, etc.) for charts and `bg-gray-100` for table headers. The migration is mechanical but touches many files.

**Primary recommendation:** Create a `BrandingConfig` TypeScript type alongside `BlueprintConfig`, inject CSS custom properties (`--brand-primary`, `--brand-secondary`, etc.) at the wireframe container `<div>`, and migrate all hardcoded color references in wireframe components to `var(--brand-X, fallback)` patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use TypeScript schema (`BrandingConfig` type) for type-safe branding data
- Store as `branding.config.ts` in `clients/[slug]/wireframe/` alongside `blueprint.config.ts`
- Fields: primary color, secondary color, accent color, font family (heading + body), logo URL, favicon URL
- Keep `branding.md` as the human-readable version for client-facing documentation
- `branding.config.ts` is the machine-readable source of truth consumed by components
- Template questionnaire in `docs/ferramentas/` documenting the step-by-step branding collection
- Operator fills in branding.md during client session, then generates branding.config.ts
- Minimum viable branding: primary color + logo URL (everything else has sensible defaults)
- Include a default/fallback BrandingConfig for clients without branding yet
- Primary, secondary, accent colors override wireframe chrome (sidebar, header, toolbar)
- Charts use client color palette (bars, lines, donut slices, waterfall positive/negative)
- KPI cards use primary color for value highlights
- Table headers use primary color background
- Font family applied to all wireframe text (heading font for titles, body font for content)
- Logo renders in wireframe sidebar header replacing "FXL" text
- Neutral tones (backgrounds, borders, muted text) stay as-is -- branding affects accent/emphasis, not structure
- BrandingConfig passed as prop through BlueprintRenderer -> SectionRenderer -> components
- CSS custom properties injected at wireframe container level for cascading brand colors
- Components read brand colors from CSS vars with fallback to current hardcoded values
- No changes to FXL Core app theme (Phase 02.3) -- branding only affects wireframe rendering
- SharedWireframeView also applies branding (client sees their brand)

### Claude's Discretion
- Exact CSS variable naming convention for brand tokens
- Default fallback palette when no branding configured
- Chart color palette generation algorithm (derive N colors from primary/secondary/accent)
- Template questionnaire structure and wording
- Whether to also store branding in Supabase (alongside blueprint) or keep as .ts file only

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRND-01 | Formato padrao parseavel para branding do cliente (cores, tipografia, logo) | BrandingConfig TypeScript type with strict schema, stored as branding.config.ts per client -- follows exact same pattern as BlueprintConfig |
| BRND-02 | Processo documentado de coleta de branding com template estruturado | Template questionnaire in docs/ferramentas/, branding.md human-readable doc with compatible sections |
| BRND-03 | Branding aplicado automaticamente no wireframe (cores, fontes) | CSS custom properties injection at container level, component migration from hardcoded to var() with fallbacks |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.6 | BrandingConfig type definition | Already in project, strict: true enforced |
| CSS Custom Properties | native | Brand token injection at container level | Zero dependency, cascades naturally, supports fallbacks |
| React props | native | BrandingConfig prop drilling | Follows existing BlueprintConfig pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| recharts | 2.13 | Chart color theming | Already used -- colors passed via fill/stroke props |
| Google Fonts (CDN) | N/A | Dynamic font loading for client brands | Only when client specifies non-Inter font |

### No New Dependencies Needed
This phase requires zero new npm packages. All patterns are achievable with:
- TypeScript types (already in project)
- CSS custom properties (browser native)
- Existing React prop patterns
- Optional Google Fonts `<link>` injection for custom fonts

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  types/
    blueprint.ts          # Existing
    branding.ts           # NEW -- BrandingConfig type + defaults
  lib/
    branding.ts           # NEW -- CSS var injection helper, palette derivation
  components/
    BlueprintRenderer.tsx # MODIFY -- accept branding prop, pass to sections
    WireframeHeader.tsx   # MODIFY -- brand colors via CSS vars
    WireframeSidebar.tsx  # MODIFY -- (not currently used by WireframeViewer inline sidebar)
    sections/
      SectionRenderer.tsx # MODIFY -- pass branding context
      ChartRenderer.tsx   # MODIFY -- brand palette for charts
      KpiGridRenderer.tsx # MODIFY -- brand color for value emphasis
      TableRenderer.tsx   # MODIFY -- brand color for headers
    BarLineChart.tsx      # MODIFY -- read colors from CSS vars
    DonutChart.tsx        # MODIFY -- brand palette for slices
    ParetoChart.tsx       # MODIFY -- brand colors
    WaterfallChart.tsx    # MODIFY -- brand positive/negative/subtotal colors
    KpiCardFull.tsx       # MODIFY -- brand primary for value text
    DataTable.tsx         # MODIFY -- brand primary for header bg
    DrillDownTable.tsx    # MODIFY -- brand primary for header bg
    ClickableTable.tsx    # MODIFY -- brand primary for header bg

clients/[slug]/wireframe/
  blueprint.config.ts    # Existing
  branding.config.ts     # NEW -- per-client branding

clients/[slug]/docs/
  branding.md            # UPDATE -- structured sections matching BrandingConfig

docs/ferramentas/
  branding-collection.md # NEW -- template questionnaire for operators

src/pages/
  clients/FinanceiroContaAzul/WireframeViewer.tsx  # MODIFY -- load + inject branding
  SharedWireframeView.tsx                           # MODIFY -- load + inject branding
```

### Pattern 1: BrandingConfig Type Definition
**What:** TypeScript type that mirrors BlueprintConfig pattern -- strict, documented, with defaults.
**When to use:** Every client gets one. Minimum viable: primary color + logo URL.
**Example:**
```typescript
// tools/wireframe-builder/types/branding.ts

export type BrandingConfig = {
  /** Primary brand color (hex). Used for: sidebar, header accents, table headers, KPI value highlights */
  primaryColor: string
  /** Secondary brand color (hex). Used for: chart secondary series, hover states */
  secondaryColor: string
  /** Accent brand color (hex). Used for: chart accent series, highlights */
  accentColor: string
  /** Heading font family (Google Fonts name or system font). Applied to titles. */
  headingFont: string
  /** Body font family (Google Fonts name or system font). Applied to all non-title text. */
  bodyFont: string
  /** Logo URL (absolute or relative). Renders in sidebar header. */
  logoUrl: string
  /** Favicon URL. Applied to wireframe view tab. */
  faviconUrl?: string
}

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#374151',    // gray-700 -- neutral default
  secondaryColor: '#6B7280',  // gray-500
  accentColor: '#3B82F6',     // blue-500
  headingFont: 'Inter',
  bodyFont: 'Inter',
  logoUrl: '',                // empty = show "FXL" text fallback
}
```

### Pattern 2: CSS Custom Properties Injection
**What:** Inject brand tokens as CSS custom properties on the wireframe container div.
**When to use:** At the top-level wireframe container in WireframeViewer and SharedWireframeView.
**Why:** CSS vars cascade to all child components. Each component reads `var(--brand-X, fallback)`.
**Example:**
```typescript
// tools/wireframe-builder/lib/branding.ts

import type { BrandingConfig } from '../types/branding'
import { DEFAULT_BRANDING } from '../types/branding'

/** Merge partial branding with defaults */
export function resolveBranding(config?: Partial<BrandingConfig>): BrandingConfig {
  return { ...DEFAULT_BRANDING, ...config }
}

/** Generate CSS custom property style object for container injection */
export function brandingToCssVars(branding: BrandingConfig): React.CSSProperties {
  const palette = derivePalette(branding)
  return {
    '--brand-primary': branding.primaryColor,
    '--brand-secondary': branding.secondaryColor,
    '--brand-accent': branding.accentColor,
    '--brand-primary-light': palette.primaryLight,
    '--brand-primary-dark': palette.primaryDark,
    '--brand-chart-1': branding.primaryColor,
    '--brand-chart-2': branding.secondaryColor,
    '--brand-chart-3': branding.accentColor,
    '--brand-chart-4': palette.chart4,
    '--brand-chart-5': palette.chart5,
    '--brand-heading-font': branding.headingFont,
    '--brand-body-font': branding.bodyFont,
  } as React.CSSProperties
}

/** Derive N chart colors from 3 base brand colors */
export function derivePalette(branding: BrandingConfig) {
  // Algorithm: lighten/darken primary, mix secondary+accent
  // Implementation detail -- see Code Examples section
}
```

### Pattern 3: Component Color Migration (var with fallback)
**What:** Replace hardcoded colors in wireframe components with CSS var() that fall back to current values.
**When to use:** Every wireframe component that uses a color that should be brand-overridable.
**Example:**
```tsx
// Before (BarLineChart.tsx):
<Bar dataKey="bar" fill="#d1d5db" radius={[3, 3, 0, 0]} />

// After:
<Bar dataKey="bar" fill="var(--brand-chart-1, #d1d5db)" radius={[3, 3, 0, 0]} />
```

```tsx
// Before (DataTable.tsx):
<tr className="bg-gray-100">

// After -- use inline style for CSS var:
<tr style={{ backgroundColor: 'var(--brand-primary, #f3f4f6)' }}
    className="text-white">
```

### Pattern 4: Font Loading Strategy
**What:** Dynamically load Google Fonts when client uses non-default font.
**When to use:** Only when branding specifies a font different from Inter.
**Example:**
```typescript
// tools/wireframe-builder/lib/branding.ts

export function getFontLinks(branding: BrandingConfig): string[] {
  const fonts = new Set<string>()
  if (branding.headingFont !== 'Inter') fonts.add(branding.headingFont)
  if (branding.bodyFont !== 'Inter') fonts.add(branding.bodyFont)

  return Array.from(fonts).map(font => {
    const encoded = encodeURIComponent(font)
    return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700&display=swap`
  })
}

// Usage in WireframeViewer: inject <link> tags via useEffect
```

### Anti-Patterns to Avoid
- **Prop drilling branding through every component:** Use CSS custom properties instead. Components read `var()` from the cascade. Only pass branding as prop to BlueprintRenderer for initial injection -- not to every leaf component.
- **Modifying FXL Core app theme (globals.css):** Branding is scoped to wireframe rendering only. The `--primary`, `--accent`, etc. in globals.css are the FXL Core app theme (Phase 02.3) and must NOT be changed.
- **Using Tailwind utility classes for brand colors:** CSS vars in inline `style` attributes are the correct approach since Tailwind classes are static. `var(--brand-X)` in `style={}` is the pattern.
- **Creating separate themed component variants:** DO NOT create `BrandedBarLineChart` alongside `BarLineChart`. Modify existing components to read from CSS vars with fallbacks -- zero visual change when no branding is set.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color manipulation (lighten/darken) | Custom HSL parser | Simple hex-to-HSL conversion + offset | Only needed for deriving chart palette (5 colors from 3). A 20-line utility suffices -- no library needed |
| Font loading | Custom font loader | Google Fonts `<link>` tag injection | Browser-native, CDN-cached, handles weights automatically |
| Theme context/provider | React Context for branding | CSS custom properties cascade | CSS cascade does the job. Context would add unnecessary complexity for a single-level wireframe render |
| Branding form editor | Custom form UI | Manual branding.config.ts editing | Out of phase scope. Operator edits config file directly. UI editor is a future enhancement |

**Key insight:** CSS custom properties handle the entire theming cascade. No React context, no styled-components, no theme provider needed. Set vars at the container, all children inherit.

## Common Pitfalls

### Pitfall 1: Recharts doesn't read CSS custom properties in fill/stroke
**What goes wrong:** `<Bar fill="var(--brand-chart-1, #ccc)" />` does NOT work in recharts SVG elements. Recharts passes fill/stroke directly to SVG attributes, and SVG `fill` attribute does not support CSS `var()` syntax in all browsers.
**Why it happens:** SVG attributes vs CSS properties distinction. CSS `var()` works in `style` but not always in SVG attributes.
**How to avoid:** Two approaches: (1) Read the CSS variable value via `getComputedStyle()` at render time and pass the resolved hex, or (2) Pass brand colors as explicit props to chart components instead of relying on CSS var cascade for recharts specifically. Approach (2) is simpler and recommended.
**Warning signs:** Charts rendering with fallback colors while sidebar/header correctly show brand colors.

### Pitfall 2: Font not loading before first paint
**What goes wrong:** Client wireframe renders with Inter, then flashes to brand font when Google Fonts finishes loading.
**Why it happens:** Google Fonts CSS loads asynchronously.
**How to avoid:** Use `font-display: swap` (Google Fonts includes this by default). Accept the brief FOIT/FOUT as an acceptable tradeoff for v1. No need to block rendering.
**Warning signs:** Flash of unstyled text (FOUT) on first load.

### Pitfall 3: Hardcoded colors scattered across inline styles and Tailwind classes
**What goes wrong:** Migration misses some hardcoded colors, resulting in inconsistent branding.
**Why it happens:** Wireframe components use a mix of inline `style={{}}` objects and Tailwind classes for colors.
**How to avoid:** Systematic audit of every wireframe component. The complete list of components and their hardcoded colors is documented in the "Code Examples: Hardcoded Color Inventory" section below.
**Warning signs:** Some components showing brand colors, others stuck on gray/default.

### Pitfall 4: Branding leaking into FXL Core app
**What goes wrong:** Brand CSS vars accidentally affect the main app UI (sidebar, header, docs).
**Why it happens:** CSS vars set too high in the DOM, or using the same variable names as globals.css.
**How to avoid:** Use `--brand-*` prefix for all branding vars (never `--primary`, `--accent`, etc. which are the app theme). Inject vars ONLY on the wireframe container div, not on `<body>` or `#root`.
**Warning signs:** FXL Core app sidebar/header showing client colors when navigating from wireframe back to app.

### Pitfall 5: TypeScript type mismatch with existing BlueprintConfig pattern
**What goes wrong:** BrandingConfig stored in Supabase as JSONB loses type safety.
**Why it happens:** If branding is added to Supabase, the `config` column returns `unknown`.
**How to avoid:** For v1, keep branding as `.ts` file only (same as blueprint seed files). Supabase storage is a Claude's Discretion item -- recommended to defer to Phase 5 when Config Resolver merges Blueprint + TechnicalConfig + Branding.
**Warning signs:** TypeScript `any` assertions appearing in branding load code.

## Code Examples

### Hardcoded Color Inventory (What Must Change)

Every hardcoded color in wireframe components that needs to become brand-aware:

**WireframeViewer.tsx (inline sidebar):**
```
- background: '#212121'     -> var(--brand-sidebar-bg, #212121) -- or derive from primaryColor darkened
- borderBottom: '#424242'   -> var(--brand-sidebar-border, #424242)
- "FXL" text               -> logo image from branding.logoUrl (or keep "FXL" if empty)
- active screen bg '#424242' -> var(--brand-sidebar-active, #424242)
- inactive text '#BDBDBD'   -> stays (neutral tone, per decision)
```

**SharedWireframeView.tsx (inline sidebar):**
```
Same as WireframeViewer -- duplicated sidebar markup.
```

**WireframeHeader.tsx:**
```
- background: '#FFFFFF'     -> stays (neutral)
- color: '#212121'          -> stays (neutral text)
- borderBottom: '#E0E0E0'   -> stays (neutral border)
```

**BarLineChart.tsx:**
```
- Bar fill="#d1d5db"        -> brand chart palette color 1
- Line stroke="#9ca3af"     -> brand chart palette color 2
- Bar fill="#d1d5db" (composed) -> brand chart palette color 1
- Line stroke="#6b7280" (composed) -> brand chart palette color 2
```

**DonutChart.tsx:**
```
- COLORS = ['#212121', '#757575', '#BDBDBD', '#424242', '#9E9E9E']
  -> brand chart palette (5 colors derived from primary/secondary/accent)
```

**WaterfallChart.tsx:**
```
- FILL.positive = '#22c55e' -> brand accent or derived green
- FILL.negative = '#ef4444' -> keep semantic red (negative is always red)
- FILL.subtotal = '#3b82f6' -> brand primary
- FILL_COMPARE variants    -> lighter versions of above
```

**ParetoChart.tsx:**
```
- Bar fill="#374151"        -> brand primary
- Line stroke="#DC2626"     -> brand accent
- Line dot fill="#DC2626"   -> brand accent
```

**KpiCardFull.tsx:**
```
- text-gray-800 on value   -> brand primary color for emphasis
- Sparkline stroke="#9CA3AF" -> brand secondary (subtle)
- Semaforo colors (green/yellow/red) -> KEEP as-is (semantic status, not brand)
- Variation bg-green-50/bg-red-50 -> KEEP as-is (semantic status, not brand)
```

**DataTable.tsx:**
```
- <tr className="bg-gray-100"> header -> brand primary bg with white text
```

**DrillDownTable.tsx:**
```
- Header bg-gray-100       -> brand primary bg with white text
```

**ClickableTable.tsx:**
```
- Header bg-gray-100       -> brand primary bg with white text
```

### BrandingConfig File Example (Per Client)
```typescript
// clients/financeiro-conta-azul/wireframe/branding.config.ts
import type { BrandingConfig } from '@tools/wireframe-builder/types/branding'

const branding: BrandingConfig = {
  primaryColor: '#1B6B93',
  secondaryColor: '#4FC0D0',
  accentColor: '#A2FF86',
  headingFont: 'Poppins',
  bodyFont: 'Inter',
  logoUrl: '/clients/financeiro-conta-azul/assets/logo.png',
}

export default branding
```

### CSS Custom Properties Injection in WireframeViewer
```tsx
// In WireframeViewer.tsx render:
import { brandingToCssVars, resolveBranding } from '@tools/wireframe-builder/lib/branding'
import brandingConfig from '@clients/financeiro-conta-azul/wireframe/branding.config'

// Resolve with defaults
const branding = resolveBranding(brandingConfig)
const brandVars = brandingToCssVars(branding)

return (
  <div
    style={{
      display: 'flex',
      height: '100vh',
      fontFamily: `${branding.bodyFont}, Inter, sans-serif`,
      background: '#F5F5F5',
      ...brandVars,  // Inject all --brand-* CSS vars
    }}
  >
    {/* sidebar, header, content -- all children inherit vars */}
  </div>
)
```

### Chart Palette Derivation (5 Colors from 3)
```typescript
// Simple approach: use the 3 brand colors + 2 derived variants
export function derivePalette(branding: BrandingConfig) {
  return {
    primaryLight: lighten(branding.primaryColor, 30),
    primaryDark: darken(branding.primaryColor, 20),
    chart4: mixColors(branding.primaryColor, branding.secondaryColor, 0.5),
    chart5: mixColors(branding.secondaryColor, branding.accentColor, 0.5),
  }
}

// Hex manipulation utilities (~20 lines total)
function hexToHsl(hex: string): [number, number, number] { /* ... */ }
function hslToHex(h: number, s: number, l: number): string { /* ... */ }
function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.min(100, l + amount))
}
function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex)
  return hslToHex(h, s, Math.max(0, l - amount))
}
function mixColors(hex1: string, hex2: string, ratio: number): string {
  // Linear interpolation in HSL space
}
```

### Sidebar Logo Rendering
```tsx
// In WireframeViewer sidebar header:
<div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', /* ... */ }}>
  {branding.logoUrl ? (
    <img
      src={branding.logoUrl}
      alt={config.label}
      style={{ maxHeight: 32, maxWidth: 120, objectFit: 'contain' }}
    />
  ) : (
    <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>FXL</span>
  )}
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded gray palette in all components | CSS vars with brand overrides | This phase | Components become brand-aware with zero visual change for unbranded clients |
| No branding file format | BrandingConfig TypeScript type | This phase | Type-safe, autocompletable, validatable branding data |
| Manual color tweaking per client | Automatic palette derivation from 3 base colors | This phase | 3 inputs -> full 5-color chart palette + sidebar/header theming |

**Note on font loading:** No font preloading strategy exists. Google Fonts `<link>` injection via `useEffect` is sufficient. Self-hosting fonts (via fontsource) would be a v2 optimization.

## Open Questions

1. **Supabase storage for branding**
   - What we know: BlueprintConfig is stored in Supabase `blueprint_configs` table. Branding could follow the same pattern with a `branding_configs` table.
   - What's unclear: Phase 5 (TechnicalConfig) will need a Config Resolver that merges Blueprint + TechnicalConfig + Branding into a GenerationManifest. If branding is in Supabase now, the resolver can fetch all from DB.
   - Recommendation: **Keep as .ts file only for v1.** The current blueprint pattern loads from Supabase with file-based seed fallback. For branding, the .ts file IS the source of truth -- it only needs Supabase when it becomes editable via UI (future). This avoids a migration + table creation in this phase.

2. **Sidebar background color derivation**
   - What we know: Current sidebar uses `#212121` (near-black). User decided branding overrides wireframe chrome including sidebar.
   - What's unclear: Should sidebar bg be the brand primary color itself, or a darkened variant? Client with a light primary (e.g., pastel blue) would get an unreadable light sidebar.
   - Recommendation: **Derive sidebar bg as a very dark variant of primary color** (L=10-15 in HSL). This ensures readability regardless of the primary color's lightness. If primary is already dark (L<25), use it directly.

3. **Favicon injection**
   - What we know: BrandingConfig includes optional `faviconUrl`.
   - What's unclear: Dynamic favicon injection requires modifying `<link rel="icon">` in `<head>`, which is outside the React component tree (in index.html).
   - Recommendation: Use `document.querySelector('link[rel="icon"]').href = url` in a `useEffect`. Simple, no library needed. Acceptable for wireframe view which is a standalone full-screen page.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | `npx tsc --noEmit` (type checking only) |
| Full suite command | `npx tsc --noEmit` (type checking only) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRND-01 | BrandingConfig type is valid, DEFAULT_BRANDING has all fields | unit (type-check) | `npx tsc --noEmit` | n/a -- Wave 0 |
| BRND-01 | branding.config.ts for existing client is parseable | unit (type-check) | `npx tsc --noEmit` | n/a -- Wave 0 |
| BRND-02 | branding-collection.md template exists with required sections | manual-only | Visual inspection of docs/ferramentas/branding-collection.md | n/a |
| BRND-03 | Wireframe renders with brand colors when config is set | manual-only | Visual inspection in browser (`npm run dev`) | n/a |
| BRND-03 | Wireframe renders with default colors when no config | manual-only | Visual inspection -- remove branding import | n/a |
| BRND-03 | SharedWireframeView applies branding | manual-only | Visual inspection via shared link | n/a |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit` + visual inspection of wireframe
- **Phase gate:** `npx tsc --noEmit` green + wireframe renders with brand colors visible

### Wave 0 Gaps
None -- no test framework exists in this project. All validation is via TypeScript type checking (`npx tsc --noEmit`) which is already the project's required acceptance criterion (see CLAUDE.md). Visual validation of branding is inherently manual.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** -- Direct reading of all 20+ wireframe component files, WireframeViewer.tsx, SharedWireframeView.tsx, blueprint types, blueprint-store, globals.css, tailwind.config.ts
- **CONTEXT.md** -- User decisions from /gsd:discuss-phase with locked implementation approach
- **CLAUDE.md** -- Project conventions, stack, commit rules, quality checklist

### Secondary (MEDIUM confidence)
- **CSS Custom Properties specification** -- `var()` with fallback syntax is well-supported in all modern browsers. Confirmed by MDN.
- **Recharts SVG fill behavior** -- Based on training data and codebase patterns. Recharts passes fill/stroke directly to SVG elements. CSS var() in SVG attributes has inconsistent browser support.

### Tertiary (LOW confidence)
- **Google Fonts dynamic loading** -- `<link>` tag injection via JS works but exact font-display behavior may vary. LOW risk since font fallback to Inter is acceptable.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns verified in codebase
- Architecture: HIGH -- CSS custom properties + prop drilling follows existing BlueprintConfig pattern exactly
- Pitfalls: HIGH -- all identified through direct codebase reading (hardcoded colors catalogued, recharts SVG limitation verified)
- Color inventory: HIGH -- every wireframe component file was read and hardcoded colors documented

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable -- no fast-moving dependencies)
