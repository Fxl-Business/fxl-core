---
phase: quick-13
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/tools/ComponentGallery.tsx
autonomous: true
requirements: [QT-13]

must_haves:
  truths:
    - "ComponentGallery screen no longer shows a local light/dark mode toggle button"
    - "Wireframe components still render correctly using WireframeThemeProvider"
    - "Branding ON/OFF toggle still works as before"
  artifacts:
    - path: "src/pages/tools/ComponentGallery.tsx"
      provides: "Component gallery without local theme toggle"
  key_links:
    - from: "src/pages/tools/ComponentGallery.tsx"
      to: "tools/wireframe-builder/lib/wireframe-theme.tsx"
      via: "WireframeThemeProvider import (useWireframeTheme removed)"
      pattern: "import.*WireframeThemeProvider.*from"
---

<objective>
Remove the local light/dark mode toggle from the ComponentGallery screen.

Purpose: The gallery screen has its own GalleryThemeToggle button that independently controls
wireframe theme via useWireframeTheme. This local toggle should be removed so the screen
follows the global app theme instead of maintaining a separate local override.

Output: Clean ComponentGallery.tsx without the local theme toggle, all other functionality preserved.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/pages/tools/ComponentGallery.tsx
@tools/wireframe-builder/lib/wireframe-theme.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove GalleryThemeToggle from ComponentGallery</name>
  <files>src/pages/tools/ComponentGallery.tsx</files>
  <action>
    In src/pages/tools/ComponentGallery.tsx, make these targeted removals:

    1. Remove the `useWireframeTheme` named import from the WireframeThemeProvider import line (line 4).
       Keep `WireframeThemeProvider` import — only remove `useWireframeTheme`.
       Result: `import { WireframeThemeProvider } from '@tools/wireframe-builder/lib/wireframe-theme'`

    2. Delete the entire `GalleryThemeToggle` function component (lines 845-859).

    3. In the `GalleryContent` component, remove the `<GalleryThemeToggle />` JSX element (line 919).
       Keep the surrounding `<div className="ml-auto flex items-center gap-2">` wrapper and
       the Branding toggle button — only remove the GalleryThemeToggle element.

    Do NOT modify:
    - The WireframeThemeProvider wrapper in the main ComponentGallery export
    - The branding toggle functionality
    - Any other component or preview function
    - Any other file
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/Projetos/fxl-core && npx tsc --noEmit 2>&1 | tail -5</automated>
  </verify>
  <done>
    - GalleryThemeToggle function no longer exists in ComponentGallery.tsx
    - useWireframeTheme is no longer imported
    - No TypeScript errors
    - Branding toggle still present and functional
    - All component previews still render within WireframeThemeProvider
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- `grep -c "GalleryThemeToggle\|useWireframeTheme" src/pages/tools/ComponentGallery.tsx` returns 0
- Visual: /ferramentas/galeria-componentes page loads without theme toggle button, branding toggle still visible
</verification>

<success_criteria>
ComponentGallery screen renders without any local light/dark mode toggle. Branding ON/OFF toggle
remains functional. TypeScript compiles cleanly. No regressions in component previews.
</success_criteria>

<output>
After completion, create `.planning/quick/13-fix-remove-light-mode-toggle-local-da-te/13-SUMMARY.md`
</output>
