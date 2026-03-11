---
phase: quick-9
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - tools/wireframe-builder/components/editor/AdminToolbar.tsx
  - tools/wireframe-builder/components/editor/BrandingPopover.tsx
autonomous: true
requirements: [BRANDING-ACCESS]

must_haves:
  truths:
    - "User sees a branding/palette button in the AdminToolbar when in edit mode"
    - "Clicking the branding button opens a popover panel with color pickers for primary, secondary, and accent colors"
    - "Color changes in the popover update the wireframe in real-time via BrandingContext"
    - "Popover closes when clicking outside or clicking the button again"
  artifacts:
    - path: "tools/wireframe-builder/components/editor/BrandingPopover.tsx"
      provides: "Popover wrapper around BrandingEditorRenderer for toolbar use"
    - path: "tools/wireframe-builder/components/editor/AdminToolbar.tsx"
      provides: "Branding button in toolbar (edit mode only)"
  key_links:
    - from: "AdminToolbar.tsx"
      to: "BrandingPopover.tsx"
      via: "conditional render when editMode + brandingOpen state"
    - from: "BrandingPopover.tsx"
      to: "branding-context.tsx"
      via: "useWireframeBranding() hook for live color updates"
---

<objective>
Add a branding/palette button to the AdminToolbar that opens a popover with color pickers, giving users quick access to brand color customization from any wireframe screen while in edit mode.

Purpose: The BrandingEditorRenderer component and BrandingContext already exist and work, but there is no UI access point to reach them. Users need a toolbar button for quick branding access without navigating to a specific Configuracoes screen.

Output: A Palette button in the AdminToolbar (edit mode only) that toggles a dropdown popover containing the existing BrandingEditorRenderer color pickers.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@tools/wireframe-builder/components/editor/AdminToolbar.tsx
@tools/wireframe-builder/components/sections/BrandingEditorRenderer.tsx
@tools/wireframe-builder/lib/branding-context.tsx
@tools/wireframe-builder/types/branding.ts

<interfaces>
<!-- Key types and contracts the executor needs -->

From tools/wireframe-builder/lib/branding-context.tsx:
```typescript
type BrandingContextValue = {
  branding: BrandingConfig
  updateBranding: (partial: Partial<BrandingConfig>) => void
}
export function useWireframeBranding(): BrandingContextValue | null
```

From tools/wireframe-builder/types/branding.ts:
```typescript
export type BrandingConfig = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  logoUrl: string
  faviconUrl?: string
}
```

From AdminToolbar.tsx Props:
```typescript
type Props = {
  screenTitle: string
  editMode: boolean
  dirty: boolean
  saving: boolean
  collapsed: boolean
  onToggleCollapse: () => void
  onToggleEdit: () => void
  onSave: () => void
  onOpenComments: () => void
  onOpenShare: () => void
  userDisplayName?: string
  userRole?: string
}
```

AdminToolbar already uses `useWireframeTheme()` from wireframe-theme. It renders inside `<BrandingProvider>` in both WireframeViewer files, so `useWireframeBranding()` will work from within the toolbar.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create BrandingPopover component</name>
  <files>tools/wireframe-builder/components/editor/BrandingPopover.tsx</files>
  <action>
Create a new BrandingPopover component that wraps the existing BrandingEditorRenderer in a dropdown-style absolutely-positioned panel. This component will be rendered inside AdminToolbar.

Implementation details:
- Import `useWireframeBranding` from `../../lib/branding-context`
- The component receives `open: boolean` and `onClose: () => void` props
- When `open` is false, render nothing (return null)
- When `open` is true, render an absolutely-positioned div that:
  - Appears below the toolbar button (top: 100%, right: 0)
  - Has a fixed width of ~320px
  - Uses wireframe tokens for styling: `background: var(--wf-card)`, `border: 1px solid var(--wf-border)`, `borderRadius: 12`, `boxShadow` for elevation
  - Contains the same ColorField pattern as BrandingEditorRenderer (reuse inline, do NOT import the renderer directly since it has section Props typing)
  - Reads branding state via `useWireframeBranding()` hook
  - Each color picker updates in real-time via `updateBranding()`
  - Shows a header "Identidade Visual" with subtitle "Personalize as cores do dashboard"
  - Shows the 3-color preview strip at the bottom (same as BrandingEditorRenderer)
- Add a click-outside listener (useEffect with mousedown on document, check if click target is outside popover ref) that calls onClose
- Do NOT use shadcn portal-based components (per project decision: no Select, Dialog, Popover from shadcn inside wireframe components -- use absolutely-positioned divs)
- Style entirely with inline styles using --wf-* CSS tokens (consistent with other wireframe editor components)
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>BrandingPopover.tsx exists, renders color pickers when open=true, TypeScript compiles clean</done>
</task>

<task type="auto">
  <name>Task 2: Add branding button to AdminToolbar</name>
  <files>tools/wireframe-builder/components/editor/AdminToolbar.tsx</files>
  <action>
Add a Palette button to AdminToolbar that toggles the BrandingPopover, visible only when `editMode` is true.

Implementation details:
- Import `Palette` from lucide-react (already in section-registry, safe to use)
- Import BrandingPopover from `./BrandingPopover`
- Add local state: `const [brandingOpen, setBrandingOpen] = useState(false)`
- Place the button in the right-side button group (`ml-auto flex items-center gap-2`), BEFORE the Share button but AFTER the user chip
- Button style: same pattern as the Share/Comments buttons (inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors, with same hover handlers using var(--wf-heading) and var(--wf-accent-muted))
- Button text: icon `<Palette className="h-3.5 w-3.5" />` + "Cores"
- Only render this button when `editMode` prop is true
- Wrap the button in a `div` with `position: relative` so the BrandingPopover can be absolutely positioned relative to it
- Render `<BrandingPopover open={brandingOpen} onClose={() => setBrandingOpen(false)} />` inside that relative wrapper
- When editMode turns false (user exits edit mode), reset brandingOpen to false. Use a check: if `!editMode` early in the render, ensure brandingOpen is not shown (the conditional render `{editMode && ...}` handles this naturally)
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>Palette/Cores button visible in AdminToolbar only during edit mode; clicking toggles BrandingPopover with color pickers; color changes update wireframe in real-time</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. In the wireframe viewer, enter edit mode -- "Cores" button appears in toolbar
3. Click "Cores" -- popover opens with 3 color pickers (primary, secondary, accent)
4. Change a color -- wireframe updates in real-time
5. Click outside popover -- it closes
6. Exit edit mode -- "Cores" button disappears
</verification>

<success_criteria>
- Branding color pickers accessible via AdminToolbar button in edit mode
- Color changes propagate to wireframe in real-time through BrandingContext
- Popover follows wireframe design tokens (--wf-* vars)
- No shadcn portal components used (per project decision)
- TypeScript compiles with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/9-branding-editor-ui-color-picker-access-i/9-SUMMARY.md`
</output>
