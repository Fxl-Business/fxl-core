# Pitfalls Research

**Domain:** Visual redesign of an existing wireframe component library (86 files, CSS token architecture, Recharts, Tailwind + inline styles, client branding overrides)
**Researched:** 2026-03-11
**Confidence:** HIGH (grounded in direct codebase analysis: `wireframe-tokens.css`, `tailwind.config.ts`, `globals.css`, 31 component files with 240 `--wf-*` usages, `wireframe-theme.tsx`, `branding.ts`, `ComponentGallery.tsx`, and `clients/financeiro-conta-azul/wireframe/branding.config.ts`)

---

## Critical Pitfalls

### Pitfall 1: Renaming or Removing Existing --wf-* Tokens Breaks 240 Usages Across 31 Files

**What goes wrong:**
The v1.4 redesign introduces new tokens (`--wf-primary`, `--wf-bg-light`, `--wf-bg-dark`, new sidebar/header semantics). If any existing token name is changed or dropped -- even a "cleanup" like renaming `--wf-card-border` to `--wf-border-card` -- every component that references the old name silently falls back to the browser's `initial` value (usually `transparent` or `inherit`). There is no compile-time error. The breakage appears visually at runtime: borders disappear, backgrounds go transparent, text becomes invisible.

The current system has 240 `--wf-*` usages across 31 component files, split between Tailwind utility classes (e.g. `border-wf-card-border`, `bg-wf-card`) and inline `style` props (e.g. `border: '1px solid var(--wf-card-border)'`). There is also a `--wf-border` alias that points to `--wf-card-border`. Breaking this alias silently breaks the alias consumers without touching the definition.

**Why it happens:**
CSS custom property consumers have no awareness of provider changes. TypeScript does not check CSS variable names. The tailwind config maps token names to utilities (line 68: `'card-border': 'var(--wf-card-border)'`), but changing either the CSS var name in `wireframe-tokens.css` or the Tailwind alias key name creates a silent mismatch -- Tailwind generates valid CSS with a dead `var()` reference.

**How to avoid:**
1. **Never remove or rename existing tokens during redesign.** Add new tokens alongside old ones. Once all consumers are migrated to the new name, remove the old name in a separate cleanup pass.
2. **Add backward-compatible aliases.** If `--wf-card` must become `--wf-surface`, add `--wf-card: var(--wf-surface)` as a transitional alias so existing consumers keep working during the migration.
3. **Run a grep audit before removing any token:** `grep -r 'wf-[token-name]' tools/wireframe-builder/components/ src/` and verify zero results before removing it from `wireframe-tokens.css` and `tailwind.config.ts`.
4. **Update `tailwind.config.ts` in lockstep with `wireframe-tokens.css`.** Any token added to the CSS file needs a Tailwind alias if it will be used in className strings. Any token removed from the CSS file must have its Tailwind alias removed too -- otherwise Tailwind generates utility classes that resolve to a dead CSS var.

**Warning signs:**
- Borders on any card or table disappear after a token rename
- Chart grid lines (`stroke="var(--wf-card-border)"`) become invisible (default SVG stroke color)
- Sidebar nav items lose hover backgrounds
- `grep 'var(--wf-old-name)'` still returns results after "renaming" the token

**Phase to address:**
Phase 1 (Token architecture) -- audit all token usages before writing a single new token. Produce a usage map showing which components use which tokens. This map drives the migration plan.

---

### Pitfall 2: Recharts Ignores CSS Variable Strings When Used as fill/stroke Props

**What goes wrong:**
Recharts renders to SVG. SVG `fill` and `stroke` attributes do NOT resolve CSS custom properties set on ancestor HTML elements the same way HTML elements do. Specifically:

- `fill="var(--wf-chart-1)"` works in browsers that support CSS custom properties in SVG presentation attributes (Chrome 85+, Firefox 94+). However, Recharts's tooltip, legend, and certain internal SVG elements (e.g. the `LegendItem` color swatch, the `CartesianGrid` stroke) may render the literal string `"var(--wf-chart-1)"` instead of the resolved color in some contexts.
- When `chartColors` is `undefined` and the fallback is `'var(--wf-chart-1)'` (current pattern in `BarLineChart`, `StackedBarChartComponent`, `DonutChart`, etc.), updating `--wf-chart-1` in `wireframe-tokens.css` DOES change the visual -- but only in the SVG fill, not in the Recharts `<Legend>` color swatches or `<Tooltip>` dot colors, which are rendered as HTML spans with inline background-color that receives the literal CSS var string unevaluated.
- When `chartColors` IS provided (branding override), the resolved hex string is passed directly. This path works correctly and is unaffected by token changes.

The net result: after redesigning `--wf-chart-1` from gold `#d4a017` to primary blue `#1152d4`, the bars turn blue but the legend swatches and tooltip dots remain showing the old gold color (because the Legend component renders an HTML `<span style="background-color: var(--wf-chart-1)">` which does resolve the token), OR the legend appears broken because Recharts's internal color resolution doesn't pick up the parent's CSS context.

**Why it happens:**
Recharts uses `fill` and `stroke` as SVG presentation attributes, not CSS properties. In SVG, presentation attributes have lower specificity than CSS and resolve against a different cascade. CSS custom properties DO propagate through the DOM tree and are available in SVG, but only if the SVG element is in the same document context (inline SVG, not `<img>`). `ResponsiveContainer` wraps an SVG -- this works. But Recharts's generated legend and tooltip HTML elements may receive the token as a static prop value, not re-evaluated when the DOM context changes.

**How to avoid:**
1. **For the default palette, resolve CSS tokens to hex at the JavaScript level** rather than passing `'var(--wf-chart-N)'` strings to Recharts. Create a `useWireframeChartPalette()` hook that reads the resolved values at runtime:
   ```typescript
   function useWireframeChartPalette(): string[] {
     const { theme } = useWireframeTheme()
     const ref = useRef<HTMLDivElement>(null)
     const [palette, setPalette] = useState<string[]>([])
     useEffect(() => {
       if (!ref.current) return
       const style = getComputedStyle(ref.current)
       setPalette([
         style.getPropertyValue('--wf-chart-1').trim(),
         style.getPropertyValue('--wf-chart-2').trim(),
         // ...
       ])
     }, [theme]) // re-resolve when theme switches
     return palette
   }
   ```
   This hook subscribes to theme changes and returns resolved hex strings, making legend/tooltip colors consistent with SVG fills.
2. **Alternatively, keep the `var()` pattern but verify Legend/Tooltip colors match.** Open each chart type in the gallery under both themes after token changes and confirm legend swatches and tooltip dots match the chart fills visually.
3. **Never use `var(--wf-chart-N)` inside Recharts `<Cell fill={...}>` for the `DonutChart` legend spans.** The `<Cell>` SVG fill is fine; the legend color swatch is an HTML element that gets the color from the `fill` prop as a prop string -- verify this resolves correctly.

**Warning signs:**
- Legend swatches show a different color than the chart fills after a token palette change
- Tooltip color dots appear in the old color after updating tokens
- `getComputedStyle(element).fill` returns `'var(--wf-chart-1)'` literally instead of a hex string in test environments

**Phase to address:**
Phase 1 (Token + chart palette) -- establish the correct palette resolution pattern before redesigning chart colors. All chart components should migrate to the consistent pattern.

---

### Pitfall 3: Dark Mode Broken Because Light-Mode Token Values Are Hardcoded in Inline Styles

**What goes wrong:**
The redesign will update light-mode token values (e.g. `--wf-canvas` changes from `#f5f5f4` to `#f6f6f8`, `--wf-accent` changes from gold `#d4a017` to blue `#1152d4`). The dark-mode block in `wireframe-tokens.css` has its own independent set of values for these same semantic tokens. If the redesign updates light-mode values but the developer forgets to update dark-mode counterparts, dark mode retains the old visual -- or worse, retains a gold accent against a new blue-primary design, making it look inconsistent.

Additionally, several components use inline styles with `rgba(0,0,0,0.08)` or `rgba(0,0,0,0.25)` for shadows (e.g. `WireframeFilterBar` dropdown shadow, `WireframeModal` box-shadow, `ScreenManager` dropdown). These hardcoded dark-channel shadows are invisible in light mode but look flat in dark mode where a darker shadow needs a lighter channel or a different approach. After redesign, the dark sidebar (`slate-900/950` per the v1.4 goal) will need shadow values that work on very dark backgrounds -- `rgba(0,0,0,0.08)` is imperceptible.

**Why it happens:**
The token file has two independent blocks: `[data-wf-theme="light"]` and `[data-wf-theme="dark"]`. They share token names but have independent values. It is easy to update one block and forget the other. Inline `rgba()` shadows are invisible to the token system -- they never change when the theme toggles.

**How to avoid:**
1. **Update light and dark token blocks in the same commit, in the same file edit.** Never touch one block without reviewing the other. A checklist comment in `wireframe-tokens.css` above each semantic group helps: "-- When changing light mode value, also update dark mode counterpart on line N."
2. **Replace `rgba(0,0,0,N)` shadow values with token-based shadows.** Add `--wf-shadow-sm` and `--wf-shadow-md` tokens to both theme blocks:
   ```css
   [data-wf-theme="light"] {
     --wf-shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
     --wf-shadow-md: 0 4px 12px rgba(0,0,0,0.10);
   }
   [data-wf-theme="dark"] {
     --wf-shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
     --wf-shadow-md: 0 4px 12px rgba(0,0,0,0.5);
   }
   ```
   All components that currently hardcode `rgba()` shadows switch to `var(--wf-shadow-sm)` / `var(--wf-shadow-md)`.
3. **After any token file change, toggle the theme in the browser and do a visual pass** over every gallery component. This is the fastest way to catch dark-mode regressions.

**Warning signs:**
- Dark mode sidebar or header appears with the old gold accent instead of new blue primary
- Dropdown shadows in `WireframeFilterBar` are invisible in dark mode (shadow lost against dark background)
- `WireframeModal` appears flat with no depth in dark mode after the redesign
- Light-mode components look correct but dark-mode screenshots still show the old palette

**Phase to address:**
Phase 1 (Token redesign) -- update both blocks together. Phase N (visual verification) -- automated screenshot tests or explicit dark-mode gallery review after each component phase.

---

### Pitfall 4: Inline Style Props Are Invisible to the Token Update -- 46 Instances in WireframeFilterBar Alone

**What goes wrong:**
`WireframeFilterBar.tsx` has 46 `--wf-*` token references via inline `style` objects, plus additional `rgba()` values and hardcoded font-family strings. This is the highest concentration of inline styles in the system. Inline styles that reference `var(--wf-*)` DO respond to token changes (CSS custom properties work in inline `style` props in React). However, any value that is NOT a token reference -- hardcoded pixel values, `rgba()` colors, hardcoded `fontFamily: 'Inter, sans-serif'` strings -- will not be affected by token changes.

For the v1.4 redesign, the target aesthetic includes `backdrop-blur` on the filter bar. `backdrop-blur` requires CSS `backdrop-filter` property. Inline style objects in React cannot use Tailwind's `backdrop-blur` utilities. If `backdrop-blur` is applied inline (`style={{ backdropFilter: 'blur(8px)' }}`), it works in supported browsers but creates an inconsistency: the filter bar renders without `backdrop-blur` in any context where React's `style` prop processes the value before the blur effect is applied (e.g. some testing environments).

Additionally, font-family strings hardcoded as `fontFamily: 'Inter, sans-serif'` in inline styles will not update if the wireframe design system adopts a different body font token. The correct approach is `fontFamily: 'var(--wf-font-body, Inter, sans-serif)'` with a `--wf-font-body` token.

**Why it happens:**
`WireframeFilterBar` was built using inline styles throughout because its sub-components are module-private functions (not exported) and the developer chose inline styles for co-location with logic. This is valid but creates a maintenance challenge: inline styles cannot use Tailwind utilities, so features like `backdrop-blur`, `transition-all`, and responsive variants must be approximated with JavaScript values.

**How to avoid:**
1. **Add font-family and backdrop-filter as CSS tokens.** Add `--wf-font-body` and `--wf-font-heading` to the token file. Add `--wf-backdrop-blur: blur(8px)` as a token. Inline styles reference these tokens.
2. **For backdrop-blur specifically, use a Tailwind class on the container, not an inline style.** Convert the WireframeFilterBar container from an inline-style-only div to a component that uses `className="backdrop-blur-sm ..."` for blur effects, while keeping `style={{ background: 'var(--wf-card)', ... }}` for token-based colors.
3. **Audit all hardcoded font-family strings before redesign.** Run: `grep -r "Inter, sans-serif\|fontFamily" tools/wireframe-builder/components/`. Each instance should reference a token or Tailwind class.

**Warning signs:**
- Changing the body font token has no visible effect (components still render in hardcoded 'Inter, sans-serif')
- `backdrop-blur` is present in the design spec but the filter bar doesn't show blur effect
- The filter bar renders with slightly different styling than other token-based components after a token update

**Phase to address:**
Phase 2 (WireframeFilterBar redesign) -- add font tokens to `wireframe-tokens.css` before redesigning the filter bar component. The filter bar has the highest inline style density and most risk of hardcoded value proliferation.

---

### Pitfall 5: Client Branding Overrides Reference Old Token Names and Break Silently

**What goes wrong:**
The branding system (`tools/wireframe-builder/lib/branding.ts`) injects `--brand-*` CSS variables as inline styles on the wireframe container. These brand variables are then referenced in components via `chartColors` prop (resolved hex strings from `branding.ts`). The current system was designed to coexist with `--wf-*` tokens without collision (decision documented in `PROJECT.md`: `--brand-* prefix avoids collision with app theme --primary, --accent`).

However, the branding injection in `branding.ts` also sets `--brand-chart-1` through `--brand-chart-5` as resolved hex values derived from `branding.primaryColor`. When a component falls back from `chartColors` to `'var(--wf-chart-1)'`, it uses the wireframe palette. When `chartColors` is provided (branding-applied mode), it uses the brand palette. After the v1.4 redesign changes `--wf-chart-1` from gold to primary blue, any wireframe viewed WITHOUT branding overrides will show the new blue palette. Any wireframe viewed WITH branding will show the client's brand colors. This is correct behavior.

The risk is if the redesign adds NEW token names that the branding injection layer needs to know about (e.g. a new `--wf-primary` token for interactive elements) but the branding layer does not map `--brand-primary` to override it. The new `--wf-primary` will always show the design system's blue, even when the client has a different primary color.

Additionally, `financeiro-conta-azul`'s `branding.config.ts` has `primaryColor: '#1B6B93'`. The `generateBrandCssVars()` function in `branding.ts` maps this to `--brand-primary`. If the redesigned components use `--wf-primary` as an accent color (from the token system) instead of reading from `--brand-primary`, the client's teal brand color will be ignored for those elements.

**Why it happens:**
The token system and branding system evolved in parallel. `--wf-accent` is the wireframe's gold accent (design system). `--brand-primary` is the client's override. Components that use `var(--wf-accent)` for interactive elements (toggle buttons, active states) only change when the wireframe token changes -- they do not automatically pick up the client's brand color. This is intentional isolation: wireframe = design system, brand = client overlay. But the redesign may introduce new design system colors (a primary blue `#1152d4`) that should be overridable by client branding but currently aren't.

**How to avoid:**
1. **Before the redesign, document which token categories should be brand-overridable.** Semantic tokens like `--wf-accent` (interactive accent) SHOULD be overridable by `--brand-primary`. Structural tokens like `--wf-canvas`, `--wf-card`, `--wf-sidebar-bg` should NOT be overridable (they define the wireframe aesthetic, not the client's brand).
2. **Update `generateBrandCssVars()` to also set any new wireframe tokens that should respond to brand color.** If the new design introduces `--wf-primary: #1152d4` as the interactive primary color, add to `generateBrandCssVars()`: `'--wf-primary': branding.primaryColor` so client branding overrides it.
3. **Test the pilot client (`financeiro-conta-azul`) after every token redesign phase.** Open the wireframe viewer in client branding mode and verify the client's teal color (`#1B6B93`) appears where expected (chart bars, active sidebar items, toggle buttons).

**Warning signs:**
- Active sidebar items show the new design system blue (`#1152d4`) in the `financeiro-conta-azul` wireframe instead of the client's teal (`#1B6B93`)
- Toggle buttons and interactive elements ignore client branding
- Chart bars in client-branded wireframes show the design system palette instead of `--brand-chart-1`

**Phase to address:**
Phase 1 (Token architecture) -- define which tokens are brand-overridable before any redesign. Phase (last, verification) -- test with `financeiro-conta-azul` branding applied.

---

### Pitfall 6: Gallery Previews Do Not Automatically Reflect Redesigned Components

**What goes wrong:**
`ComponentGallery.tsx` wraps every preview in `WireframeThemeProvider`, which applies `[data-wf-theme="light"]` to a container div. This means gallery previews DO respond to token changes in `wireframe-tokens.css`. When `--wf-chart-1` changes from gold to blue, chart previews in the gallery will show blue bars.

The problems are:

1. **Stateful preview wrappers in the gallery file use mock data that was designed for the old visual.** The `BarLineChart` preview uses `barLineChartMock` from `galleryMockData.ts`. If the mock data includes hardcoded colors (e.g. `chartColors: ['#d4a017', '#b45309']` in the mock), the gallery preview will show the old gold colors even after updating the tokens -- because `chartColors` bypasses the token system entirely by passing resolved hex strings.
2. **Gallery section headers and UI chrome use app theme tokens** (`bg-primary`, `text-muted-foreground`, `border-border`), not wireframe tokens. These are correct -- but if a developer tries to match gallery UI chrome to the wireframe visual, they might accidentally add `--wf-*` references to gallery chrome, which then render outside the `WireframeThemeProvider` boundary.
3. **The gallery's `PropToggle` buttons use `bg-primary text-primary-foreground`** (app theme tokens). This is intentional. But if the app theme's `--primary` changes in `globals.css` as part of the v1.4 redesign (changing app `--primary` from indigo to the new blue `#1152d4`), ALL gallery chrome will change color simultaneously with the wireframe components -- making it hard to visually verify what changed.

**Why it happens:**
The gallery is an internal tool that mixes app-theme-styled chrome (the category headers, search, toggle buttons) with wireframe-theme-wrapped previews. These two layers are intentionally separate but visually adjacent, so a change to either layer affects the gallery's overall look.

**How to avoid:**
1. **Audit `galleryMockData.ts` for any hardcoded hex color strings before redesign.** Run: `grep -n '#[0-9a-fA-F]\{6\}' src/pages/tools/galleryMockData.ts`. Any hardcoded color in mock data that is meant to test the "default palette" case should be removed (let the token system provide the color) or explicitly labeled as a branding override test.
2. **Keep app theme changes and wireframe token changes in separate commits.** Do not change `--primary` in `globals.css` in the same commit that updates `--wf-chart-1` in `wireframe-tokens.css`. This makes it easier to identify what caused a visual change in the gallery.
3. **After each component redesign phase, do a gallery review pass.** Open the gallery page, verify each section matches the target design, and screenshot for comparison.
4. **The gallery's `WireframeThemeProvider` must be present.** If a new component is added to the gallery without wrapping it in `WireframeThemeProvider`, `useWireframeTheme()` will throw and the page will crash. All wireframe component previews must render inside the provider that wraps the gallery.

**Warning signs:**
- Gallery chart previews show old gold bars after updating `--wf-chart-1` to blue (likely cause: `chartColors` in mock data has hardcoded old values)
- A gallery preview renders with `transparent` backgrounds and no borders (likely cause: the preview is outside the `WireframeThemeProvider` boundary)
- Gallery chrome buttons (PropToggle, category tabs) change color at the same time as wireframe components (likely cause: app theme and wireframe token changes in same commit)

**Phase to address:**
Phase 1 (Token audit) -- audit and fix mock data before redesign. Phase (last, per-component) -- gallery review after each component phase.

---

### Pitfall 7: WireframeThemeProvider Scope -- Components Rendered Outside the Provider Boundary Get No Tokens

**What goes wrong:**
`WireframeThemeProvider` renders a `<div data-wf-theme={theme}>` container. ALL `--wf-*` tokens in `wireframe-tokens.css` are scoped to `[data-wf-theme]` selectors. Any wireframe component rendered outside this container gets zero wireframe tokens -- all `var(--wf-*)` expressions resolve to empty string (CSS custom property fallback behavior), which typically results in `transparent` backgrounds and `inherit`ed text colors.

The gallery wraps the entire preview area in `WireframeThemeProvider`. The `WireframeViewer.tsx` wraps the entire viewer. The `SharedWireframeView.tsx` also wraps at the top level. This is correct.

The danger during redesign: when adding a NEW feature (e.g. a redesigned header with new sub-components, or a new redesigned sidebar), a developer may create an intermediate component that renders some elements ABOVE the provider (in the outer layout, outside the `data-wf-theme` div) and some elements INSIDE. The outer elements will have no wireframe tokens.

Similarly, Radix UI portals (used by shadcn/ui `Dialog`, `Tooltip`, `Select`, `DropdownMenu`) render their content into `document.body`, outside the `data-wf-theme` container. Any wireframe component that uses a Radix portal (e.g. a select dropdown in the filter bar) will render the portal content WITHOUT `--wf-*` tokens. This is a known limitation -- existing components work around it by using non-portal elements for dropdowns (the current `MultiSelectFilter` and `DateRangeFilter` use absolutely-positioned divs, not Radix portals, specifically to stay inside the provider boundary).

**Why it happens:**
CSS custom property scoping via attribute selectors is powerful but fragile at DOM boundaries. Portals break out of the DOM tree where the tokens are defined. During redesign, any new shadcn/ui component integration (e.g. using `<Select>` from shadcn for the filter bar dropdowns) will default to portal-based rendering.

**How to avoid:**
1. **Never introduce shadcn/ui portal-based components inside wireframe components** without either: (a) using the non-portal alternative (e.g. custom dropdown div as currently implemented), or (b) injecting tokens into the portal's container via `document.body.style.setProperty('--wf-canvas', ...)` when the wireframe theme mounts.
2. **When restructuring WireframeViewer layout (header, sidebar), verify that the `data-wf-theme` div wraps ALL wireframe chrome**, including the redesigned header and sidebar. The provider renders `<div data-wf-theme={theme}>{children}</div>` -- the children must be the complete wireframe layout, not just the content area.
3. **Test for provider boundary issues by temporarily setting `--wf-card: red`** in the CSS. Any element that should be using `--wf-card` but appears in the browser's default color (usually white or transparent) is outside the provider.

**Warning signs:**
- New redesigned header or sidebar renders with `transparent` background despite having `background: 'var(--wf-header-bg)'`
- Dropdown in filter bar renders with white background in dark wireframe theme
- A new shadcn `Select` component in the filter bar shows browser-default select styling instead of wireframe styling

**Phase to address:**
Phase (header redesign) and Phase (sidebar redesign) -- verify `data-wf-theme` scope before considering a component complete. Phase (filter bar redesign) -- maintain the non-portal dropdown approach.

---

### Pitfall 8: GaugeChartComponent Has a Hardcoded Non-Token Color (#f59e0b)

**What goes wrong:**
`GaugeChartComponent.tsx` line 45 hardcodes `'#f59e0b'` (amber-400) as the middle zone color of the gauge arc. This value is not a token reference, not a `--wf-chart-*` variable, and not part of the `chartColors` prop. It will not change when the palette redesign updates `wireframe-tokens.css`.

After the v1.4 redesign, if the chart palette moves from `gold + amber + neutral` to `primary blue + slate + indigo`, the gauge chart will still display amber for its middle zone. This creates a visible inconsistency: all other charts adapt to the new palette, but the gauge still shows the old amber.

The same file accepts `chartColors?: string[]` as a prop but ignores it (the prop is destructured as `_chartColors`), which means there is no branding override path for gauge zone colors either.

**Why it happens:**
The gauge's zone colors (red = bad, amber = caution, green = good) have semantic meaning that is independent of brand palette. The developer intentionally used `var(--wf-negative)`, `#f59e0b` (warning amber), and `var(--wf-positive)` rather than chart palette slots 1-5. However, `#f59e0b` should be a semantic token (`--wf-warning`) rather than a hardcoded hex.

**How to avoid:**
1. **Add `--wf-warning: #f59e0b` (light) and `--wf-warning: #fbbf24` (dark) to `wireframe-tokens.css`** as a semantic warning color token alongside `--wf-positive` and `--wf-negative`.
2. **Update `GaugeChartComponent` to use `var(--wf-warning)`** instead of the hardcoded hex.
3. **Run `grep -r '#f59e0b\|#[Ff][Aa-Ff][0-9][0-9][0-9]' tools/wireframe-builder/components/`** before the redesign to find all hardcoded amber/warning color usages.

**Warning signs:**
- After updating the chart palette to blue, all charts show blue bars but the gauge still shows amber zones
- Client-branded wireframes show amber in the gauge regardless of brand colors

**Phase to address:**
Phase 1 (Token architecture) -- add `--wf-warning` token. Phase (gauge component redesign) -- replace hardcoded hex.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Passing `'var(--wf-chart-N)'` strings directly to Recharts `fill` prop | Works in most browsers, no hook needed | Legend/Tooltip color swatches may render literal string; inconsistency after token update | Acceptable if verified visually in all contexts; replace with resolved-hex hook for reliability |
| Hardcoding `rgba(0,0,0,0.08)` shadows in inline styles | Simple, works immediately | Invisible in dark mode; doesn't respond to theme switching | Never -- replace with `--wf-shadow-*` tokens |
| Hardcoding `fontFamily: 'Inter, sans-serif'` in inline styles | Explicit, reliable | Won't update if font token changes; inconsistent with Tailwind `font-sans` | Never in wireframe components -- use `fontFamily: 'var(--wf-font-body, Inter, sans-serif)'` or Tailwind class |
| Using CSS fallback values in token references (`var(--wf-positive, #16a34a)`) | Defensive, prevents broken UI if token missing | Fallback hex may be the old color from a previous design system version | Acceptable during migration; remove hardcoded fallbacks once tokens are stable |
| Changing `--wf-accent` from gold to blue without checking all `--wf-accent-muted` consumers | Fast single-line update | `--wf-accent-muted` is `rgba(212, 160, 23, 0.12)` hardcoded in light mode (not derived from `--wf-accent`), so it stays gold even after accent changes | Never -- `--wf-accent-muted` must be updated simultaneously |

---

## Integration Gotchas

Common mistakes when connecting the two token systems (app theme and wireframe theme).

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| App theme (`globals.css`) vs wireframe theme (`wireframe-tokens.css`) | Using `bg-card` (app token) inside a wireframe component, thinking it maps to `--wf-card` | `bg-card` resolves to `hsl(var(--card))` from the app theme. Inside `[data-wf-theme]`, there is no `--card` → `--wf-card` bridge. Use `bg-wf-card` for wireframe surfaces. |
| Tailwind `wf-*` color utilities vs inline `var(--wf-*)` | Using `text-wf-muted` in Tailwind class but `var(--wf-muted-foreground)` in an inline style (token name doesn't exist) | Wireframe tokens do not follow the `*-foreground` convention. `var(--wf-muted)` is the text color. Verify token names against `wireframe-tokens.css` before writing inline styles. |
| App dark mode (`.dark` class on `<html>`) vs wireframe dark mode (`data-wf-theme="dark"` attribute) | Assuming app dark mode toggle affects wireframe components | They are completely independent. App dark mode toggles the Tailwind `dark:` variant. Wireframe dark mode switches `data-wf-theme`. A wireframe can be in light mode while the app UI is dark. |
| `--wf-accent-muted` in `wireframe-tokens.css` | `--wf-accent-muted: rgba(212, 160, 23, 0.12)` is hardcoded (not `color-mix(in srgb, var(--wf-accent) 12%, transparent)`). Changing `--wf-accent` does not automatically update `--wf-accent-muted`. | Replace `rgba()` literals with `color-mix(in srgb, var(--wf-accent) 12%, transparent)` so `--wf-accent-muted` derives automatically from `--wf-accent`. |
| Branding `--brand-chart-N` vs wireframe `--wf-chart-N` | Components that fall back to `var(--wf-chart-N)` when `chartColors` is undefined will use the wireframe palette. When branding is applied, `chartColors` is set to resolved hex strings. If a component is added that uses `var(--wf-chart-N)` directly (without `chartColors` prop) in branding-applied context, it ignores the brand palette. | All chart components must accept `chartColors?: string[]` and use `chartColors?.[N] ?? 'var(--wf-chart-N)'` pattern. Never reference `var(--wf-chart-N)` statically in a chart component body without the prop fallback path. |

---

## Performance Traps

Patterns that work at small scale but fail during development iteration.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `color-mix(in srgb, ...)` in inline styles on every render | Acceptable in browsers; potentially slow in JSDOM test environments | For test environments, verify `color-mix` either works in vitest's happy-dom or provide a polyfill/mock | In vitest with happy-dom if it doesn't support `color-mix` |
| Re-evaluating `getComputedStyle` for chart palette resolution on every render | 270 tests slow down; repeated DOM reads in tight render loops | Memoize palette resolution in `useEffect` with `theme` dependency; cache result in ref | When multiple chart components each independently call `getComputedStyle` |
| Gallery eager-loading all 86 wireframe component files | Gallery page load 3+ seconds | Already documented in v1.3 PITFALLS.md -- use lazy loading. More critical after v1.4 adds redesigned components | Currently marginal; critical if redesigned components add new dependencies |

---

## "Looks Done But Isn't" Checklist

Things that appear complete after redesign but may be missing critical pieces.

- [ ] **Token renamed or added:** Updated in BOTH `[data-wf-theme="light"]` AND `[data-wf-theme="dark"]` blocks. Added to `tailwind.config.ts` `wf:` extension if it needs Tailwind utility class access. Zero remaining references to old token name across 31 component files.
- [ ] **Chart palette redesigned:** Verified in all 9 chart types (BarLineChart, DonutChart, WaterfallChart, ParetoChart, StackedBar, StackedArea, HorizontalBar, Bubble, Composed, Scatter, Radar, Treemap, Funnel, Area, Gauge). Legend swatches and tooltip dots match chart fill colors. Branding override (`chartColors` prop) still works.
- [ ] **Component redesigned visually:** Tested in light mode AND dark mode. Shadows visible in both modes. Font rendering uses token or Tailwind class, not hardcoded `fontFamily` string.
- [ ] **Gallery preview updated:** Gallery preview shows new design. Mock data in `galleryMockData.ts` has no hardcoded hex colors for the default-palette case. Preview renders inside `WireframeThemeProvider`.
- [ ] **Client branding still works:** `financeiro-conta-azul` wireframe opened with branding applied shows teal `#1B6B93` in interactive elements (chart bars, active sidebar items, toggle accents). New `--wf-primary` token (if added) is overridden by `--brand-primary` in `generateBrandCssVars()`.
- [ ] **Dark mode visual pass completed:** Every redesigned component reviewed in dark mode. No element uses `rgba(0,0,0,N)` shadow without a dark-mode alternative. No light-mode-only color assumptions.
- [ ] **TypeScript gate passed:** `npx tsc --noEmit` returns zero errors. No `any` types introduced during redesign. New token names are strings, not typed (CSS vars have no TypeScript type enforcement -- document new tokens in a comment block in `wireframe-tokens.css`).

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Token renamed, 31 files broken (Pitfall 1) | MEDIUM | Add backward-compatible alias (`--wf-old-name: var(--wf-new-name)`) immediately. Then migrate consumers gradually. Remove alias in cleanup. |
| Recharts legend/tooltip colors wrong after palette change (Pitfall 2) | LOW | Implement `useWireframeChartPalette()` hook. Migrate chart components to pass resolved hex strings. One-afternoon effort. |
| Dark mode broken after light-mode token update (Pitfall 3) | LOW | Update `[data-wf-theme="dark"]` block to match new semantics. Usually a 10-minute fix if identified quickly. |
| Inline hardcoded colors not updating (Pitfalls 4, 8) | LOW | Find with grep, replace with token reference. Each file is independent, changes are contained. |
| Client branding ignores new token (Pitfall 5) | LOW | Add the new token to `generateBrandCssVars()` in `branding.ts`. One-line fix per token. |
| Gallery preview shows old colors (Pitfall 6) | LOW | Remove hardcoded hex from `galleryMockData.ts`. Token cascade handles the rest. |
| Component outside WireframeThemeProvider (Pitfall 7) | LOW | Move the component inside the provider boundary, or extend the provider wrapping. Identified immediately in browser (transparent backgrounds). |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Token naming collision / breakage (Pitfall 1) | Phase 1 — Token audit and new token architecture | `grep -r 'wf-[old-token-name]'` returns zero results in components/ after each removal |
| Recharts CSS var resolution (Pitfall 2) | Phase 1 — Establish chart palette pattern | Legend and tooltip colors match SVG fills in screenshot comparison |
| Dark mode regressions (Pitfall 3) | Every component phase — dual-block update discipline | Gallery dark-mode review after each phase |
| Inline style hardcoded values (Pitfall 4) | Phase — WireframeFilterBar redesign | `grep -r "Inter, sans-serif\|rgba(0,0,0" tools/wireframe-builder/` returns zero in component bodies |
| Client branding break (Pitfall 5) | Phase — last verification | `financeiro-conta-azul` wireframe with branding shows teal `#1B6B93` in interactive elements |
| Gallery not reflecting redesign (Pitfall 6) | Each component phase — gallery review step | Gallery screenshots compared to target design reference |
| Provider boundary break (Pitfall 7) | Each new component phase | New component with `background: transparent` test; `--wf-card: red` trick |
| Hardcoded gauge color (Pitfall 8) | Phase 1 — Token architecture | `--wf-warning` token exists; `GaugeChartComponent` references it |

---

## Sources

- FXL Core codebase: `tools/wireframe-builder/styles/wireframe-tokens.css` -- 124 lines, two `[data-wf-theme]` blocks, 45 `--wf-*` variable definitions including `--wf-accent-muted` as hardcoded `rgba()`
- FXL Core codebase: `tailwind.config.ts` -- `wf:` color extension mapping 18 wireframe tokens to Tailwind utilities; app theme tokens (--primary, --card, --border, --muted) as separate `hsl(var())` mappings
- FXL Core codebase: `src/styles/globals.css` -- app theme with `:root` and `.dark` blocks; `@import '../../tools/wireframe-builder/styles/wireframe-tokens.css'` at top (confirms wireframe tokens are global)
- FXL Core codebase: `tools/wireframe-builder/lib/wireframe-theme.tsx` -- `WireframeThemeProvider` renders `<div data-wf-theme={theme}>` as the CSS scope boundary; localStorage persistence
- FXL Core codebase: `tools/wireframe-builder/components/GaugeChartComponent.tsx` -- hardcoded `'#f59e0b'` on line 45; `_chartColors` ignored
- FXL Core codebase: `tools/wireframe-builder/components/WireframeFilterBar.tsx` -- 46 `--wf-*` token usages; `rgba(0,0,0,0.08)` and `rgba(0,0,0,0.2)` shadows; `fontFamily: 'Inter, sans-serif'` hardcoded in 5 sub-components
- FXL Core codebase: `tools/wireframe-builder/lib/branding.ts` -- `generateBrandCssVars()` produces `--brand-chart-1` through `--brand-chart-5`; does NOT override `--wf-chart-*` or any new `--wf-primary`
- FXL Core codebase: `clients/financeiro-conta-azul/wireframe/branding.config.ts` -- `primaryColor: '#1B6B93'` (teal); the active pilot client that must continue working
- FXL Core codebase: `src/pages/tools/ComponentGallery.tsx` -- imports `WireframeThemeProvider`; `galleryMockData.ts` as separate mock file that may have hardcoded hex colors
- MDN CSS Custom Properties spec: CSS custom properties work in SVG inline styles but SVG presentation attributes have separate cascade from CSS -- relevant to Recharts fill/stroke resolution
- Recharts GitHub issue #2239: CSS variables in `fill` prop work in inline SVG but Legend color swatches (rendered as HTML) may need explicit resolution
- Recharts source: `<Legend>` renders color via `payload.color` prop passed as a string -- if the string is `'var(--wf-chart-1)'`, it renders as `background-color: var(--wf-chart-1)` on an HTML span, which DOES resolve in modern browsers but inconsistently in older engines

---
*Pitfalls research for: v1.4 Wireframe Visual Redesign -- adding new design system to existing 86-file component library with CSS token architecture, Recharts, Tailwind + inline styles, and client branding overrides*
*Researched: 2026-03-11*
