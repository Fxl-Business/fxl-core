---
phase: quick-8
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/tools/ComponentGallery.tsx
autonomous: true
must_haves:
  truths:
    - "Gallery components render identically to wireframe viewer components"
    - "No undefined CSS variables in gallery — all wf-* tokens resolve correctly"
    - "No pure black (#000) colors visible in any gallery component"
  artifacts:
    - path: "src/pages/tools/ComponentGallery.tsx"
      provides: "Gallery page wrapped in WireframeThemeProvider"
  key_links:
    - from: "src/pages/tools/ComponentGallery.tsx"
      to: "tools/wireframe-builder/lib/wireframe-theme.tsx"
      via: "WireframeThemeProvider wrapping all component previews"
      pattern: "WireframeThemeProvider"
---

<objective>
Fix gallery components rendering differently from wireframe viewer by wrapping gallery in WireframeThemeProvider.

Purpose: All 33 wireframe components use `wf-*` Tailwind tokens (e.g. `text-wf-heading`, `border-wf-card-border`, `bg-wf-card`) which map to `--wf-*` CSS variables. These variables are ONLY defined inside `[data-wf-theme]` containers (set by `WireframeThemeProvider`). The wireframe viewer wraps everything in `<WireframeThemeProvider>`, but the gallery does NOT — so all CSS variables resolve to undefined, causing missing colors, invisible borders, and browser-default black text. This is the sole root cause of visual differences between gallery and wireframe.

Output: Gallery components render with proper wireframe design tokens, visually identical to wireframe viewer.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@tools/wireframe-builder/styles/wireframe-tokens.css
@tools/wireframe-builder/lib/wireframe-theme.tsx
@src/pages/tools/ComponentGallery.tsx
@src/pages/clients/WireframeViewer.tsx

<interfaces>
From tools/wireframe-builder/lib/wireframe-theme.tsx:
```typescript
export type WireframeTheme = 'light' | 'dark'
export function WireframeThemeProvider({ children, defaultTheme }: { children: ReactNode; defaultTheme?: WireframeTheme }): JSX.Element
// Renders: <div data-wf-theme={theme}>{children}</div>
// This activates all --wf-* CSS variables from wireframe-tokens.css
```

From tools/wireframe-builder/styles/wireframe-tokens.css:
- All tokens scoped under `[data-wf-theme="light"]` and `[data-wf-theme="dark"]`
- Without this attribute, ALL --wf-* variables are undefined (root cause of gallery issues)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wrap gallery component previews in WireframeThemeProvider</name>
  <files>src/pages/tools/ComponentGallery.tsx</files>
  <action>
    The gallery page renders wireframe components WITHOUT WireframeThemeProvider, so all `--wf-*` CSS variables are undefined. This is why gallery components look different from wireframe components — they are literally the SAME components, but without the CSS variable scope.

    1. Import `WireframeThemeProvider` from `@tools/wireframe-builder/lib/wireframe-theme`

    2. In the `ComponentCard` component, wrap the component preview area in `<WireframeThemeProvider>`. The WireframeThemeProvider should wrap the content area where components render — specifically around the render output inside the expanded section. Wrap the ENTIRE expanded content div (the one with `border-t border-border px-5 py-4 space-y-3`) in `<WireframeThemeProvider>`. This ensures:
       - Components with toolbars: the toolbar (PropsToolbar) stays in app theme, but the component preview inside uses wf tokens
       - Components without toolbars: the dashed-border preview container uses wf tokens
       - The Props listing and "Ver spec" link remain in app theme (they use Tailwind defaults, not wf-*)

    IMPORTANT: The WireframeThemeProvider renders a `<div data-wf-theme="light">`. This is a block-level wrapper. Be careful not to break the existing layout. The wrapper should go AROUND the render output specifically, not around the Props or specHref sections. More precisely:

    In `ComponentCard`, find the area where `entry.render()` is called (two code paths: hasToolbar and !hasToolbar). Wrap each render output in `<WireframeThemeProvider>`:
    - For hasToolbar path: wrap `entry.render()` in WireframeThemeProvider. Since toolbar preview components (KpiCardPreview, BarLineChartPreview, etc.) include both PropsToolbar and the component, the WireframeThemeProvider should wrap the ENTIRE output of `entry.render()`. The PropsToolbar uses app theme classes (bg-muted, border-border) which will still work because those are defined globally — only wf-* tokens need the provider scope.
    - For !hasToolbar path: wrap `entry.render()` in WireframeThemeProvider inside the dashed-border container.

    3. Also set `background: var(--wf-canvas)` on the preview container divs (the ones with `bg-muted/50`). In the wireframe viewer, components sit on `--wf-canvas` (#f5f5f4 warm gray), not the app's `bg-muted/50`. Change `bg-muted/50` to a class or inline style that uses the wf-canvas token inside the provider. Since we're inside WireframeThemeProvider now, we can use `bg-wf-canvas` class instead of `bg-muted/50` for the preview container background. This ensures the preview background matches what components see in the wireframe viewer.

    4. Verify no import or TypeScript issues. The gallery does NOT need to change any component props, mock data, or rendering logic — it already imports and uses the exact same components as the wireframe viewer.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit</automated>
  </verify>
  <done>Gallery renders all wireframe components inside WireframeThemeProvider scope, making --wf-* CSS variables resolve correctly. No black/undefined colors. Components look identical to wireframe viewer.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Gallery components now render inside WireframeThemeProvider, ensuring identical visual output to wireframe viewer. All wf-* CSS tokens (borders, text colors, backgrounds, chart colors) now resolve properly.</what-built>
  <how-to-verify>
    1. Run `make dev` and open http://localhost:5173/ferramentas/galeria
    2. Verify KpiCard shows warm stone gray text (not black) with proper card border
    3. Verify BarLineChart shows gold-accent bars (not invisible/black)
    4. Verify DataTable header has light warm gray background (#f5f5f4), not transparent
    5. Verify all components have warm beige/stone borders (not missing/black)
    6. Compare with wireframe viewer (open any client wireframe) — components should look identical
    7. Toggle component toolbars (KpiCard variationPositive, BarLineChart type) — confirm they still work
  </how-to-verify>
  <resume-signal>Type "approved" or describe visual issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Gallery page loads without console errors
- All 33 wireframe components in gallery render with proper wf-* token colors
- No pure black (#000) text or borders visible in gallery components
</verification>

<success_criteria>
Gallery components are visually identical to wireframe viewer components. The "color difference" mystery is resolved — it was never a color prop issue, it was missing CSS variable scope.
</success_criteria>

<output>
After completion, create `.planning/quick/8-unify-gallery-and-wireframe-components-f/8-SUMMARY.md`
</output>
