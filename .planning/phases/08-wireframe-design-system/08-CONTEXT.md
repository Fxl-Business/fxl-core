# Phase 8: Wireframe Design System - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Give wireframe components their own visual identity (`--wf-*` CSS variable tokens) fully isolated from the app theme, with an operator-controlled dark/light toggle and client branding layered on top as overrides. No new component types — pure visual infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Wireframe neutral palette
- Warm grays (stone-toned) for the 10-step neutral scale — pairs naturally with gold accent
- Scale: wf-neutral-50 (#fafaf9) through wf-neutral-900 (#1c1917)
- Rich gold accent: --wf-accent #d4a017, --wf-accent-muted at 12% opacity, --wf-accent-fg #78590a
- Cards separated by thin borders (--wf-neutral-200), no box-shadows
- Tinted canvas: wireframe container uses wf-neutral-100, cards sit on wf-neutral-50 (light mode). Dark mode: canvas wf-neutral-900, cards wf-neutral-800
- Gold-anchored chart palette: series 1 uses gold accent, subsequent series use warm-toned complements
- Green/red semantic colors for positive/negative indicators (standard data viz convention): --wf-positive #16a34a, --wf-negative #dc2626
- Text hierarchy from warm gray scale: headings wf-neutral-700, body wf-neutral-600, muted wf-neutral-400
- Wireframe sidebar IS part of wireframe and uses --wf-* tokens (not app tokens)

### Dark/light toggle
- Toggle lives in AdminToolbar (alongside edit mode, save, share)
- Default: light mode
- Preference persists in localStorage per operator
- Shared/client view also has a dark/light toggle available
- Wireframe theme is fully independent from app dark/light mode (can have light app + dark wireframe)
- Theme controlled via data-wf-theme attribute on wireframe container (WireframeThemeProvider)

### Branding override depth
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

</decisions>

<specifics>
## Specific Ideas

- User explicitly wants wireframe sidebar to be part of the wireframe design system (uses --wf-* tokens), not the app sidebar
- User mentioned wanting sidebar widgets in the future (workspace selectors, sub-menus, user icons) — deferred
- Wireframe should feel like a "blueprint" with warm, premium aesthetic (warm grays + rich gold)
- Three-layer isolation is the architecture: app tokens (--primary), wireframe chrome (--wf-*), client branding (--brand-*)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `globals.css`: App-level tokens already defined (:root and .dark). Wireframe tokens will be a separate layer, not modifications to existing tokens
- `BrandingConfig` type (tools/wireframe-builder/types/branding.ts): Already has primaryColor, secondaryColor, accentColor, headingFont, bodyFont, logoUrl
- `branding.ts` (tools/wireframe-builder/lib/branding.ts): Existing branding logic — can be extended for wireframe token override injection
- `AdminToolbar` (tools/wireframe-builder/components/editor/AdminToolbar.tsx): Where the dark/light toggle will live

### Established Patterns
- 46 wireframe components use hardcoded Tailwind classes (bg-white, text-gray-800, border-gray-200) — all need migration to --wf-* tokens
- App theme uses HSL values in CSS variables (e.g., --primary: 220 16% 22%)
- `--brand-*` CSS var prefix established in v1.0 for client branding — no collision with app or wireframe tokens
- `cn()` utility (clsx + tailwind-merge) used throughout for class composition

### Integration Points
- WireframeThemeProvider: New React context provider wrapping wireframe content, sets data-wf-theme attribute
- CSS variable injection: --wf-* tokens defined in a dedicated CSS block (not in globals.css :root)
- WireframeViewer.tsx: Main consumer — wraps content in theme provider
- SharedWireframeView.tsx: Also wraps in theme provider (with toggle available)
- 46 component files need className migrations from hardcoded to token-based

</code_context>

<deferred>
## Deferred Ideas

- Sidebar widgets: workspace selectors, sub-menus with icons, user icon in sidebar — belongs in Phase 9 (Component Library Expansion) or a dedicated sidebar expansion phase
- Sidebar navigation patterns (collapsible groups, active state indicators) — future phase

</deferred>

---

*Phase: 08-wireframe-design-system*
*Context gathered: 2026-03-09*
