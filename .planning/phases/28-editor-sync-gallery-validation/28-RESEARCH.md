# Phase 28: Editor Sync & Gallery Validation - Research

**Researched:** 2026-03-11
**Domain:** React component styling sync, visual gallery validation, TypeScript audit
**Confidence:** HIGH

## Summary

Phase 28 is a closing phase for milestone v1.4. Its work divides into three distinct tracks:

**Track 1 — EDIT-01 (ScreenManager sync):** The `ScreenManager` component (`tools/wireframe-builder/components/editor/ScreenManager.tsx`) already uses the correct wf-sidebar token classes (`bg-wf-accent-muted text-wf-accent`, `text-wf-sidebar-muted hover:bg-slate-800 hover:text-white`) for its nav items. However, the outer container wrapping ScreenManager in the generic `WireframeViewer` (`src/pages/clients/WireframeViewer.tsx`) is rendered via an inline `<aside>` with raw `style={{...}}` properties scoped to wf-sidebar tokens. The `FinanceiroContaAzul/WireframeViewer.tsx` also has a bespoke sidebar wrapper. Visually these already behave correctly because the wf-sidebar tokens resolve to dark slate — but the requirement verifies the visual match, so the plan must document what to confirm and what (if anything) to fix. The main gap is: ScreenManager's `SortableScreenItem` uses `rounded-md` and `text-sm` class sizes while `WireframeSidebar` uses `rounded-md` and `text-xs`. This typography size discrepancy is the primary sync target.

**Track 2 — GAL-01/GAL-02 (Gallery validation):** `ComponentGallery.tsx` already wraps all previews in `<WireframeThemeProvider>`. The gallery currently has 27 component entries across 6 sections. The gallery does not have a built-in dark mode toggle — all previews inherit the app-level dark mode, not the wireframe dark mode toggle. For the gallery to show branding overrides, a `WireframeThemeProvider` with `wfOverrides={brandingToWfOverrides(financeiroBranding)}` must be applied in at least one preview. The checklist validation (GAL-02) is a manual smoke-test: dark mode toggle, branding-applied check, all 6 sections rendered.

**Track 3 — TypeScript verification:** `npx tsc --noEmit` must report zero errors across all files modified in phases 22-28. This is a pure audit task.

**Primary recommendation:** Plan two tasks — (1) ScreenManager typography sync + sidebar wrapper review, (2) Gallery branding preview + dark mode toggle + TypeScript audit. No new component APIs are needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-01 | ScreenManager sidebar styling matches the new wireframe sidebar visual | ScreenManager already uses wf-sidebar tokens; gap is text-sm vs text-xs nav item size and potential padding differences with WireframeSidebar reference |
| GAL-01 | All gallery component previews reflect the new visual design | ComponentGallery wraps in WireframeThemeProvider; visual redesign flows via token updates from phases 22-27; gap is confirming all 27 entries render correctly |
| GAL-02 | Gallery validation checklist: dark mode toggle pass, branding-applied check, all 6 sections verified | Gallery needs a dark mode toggle control and at least one branding-override preview (financeiro-conta-azul #1B6B93) to complete the checklist |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.x | Utility classes for ScreenManager sync | Already used throughout; wf-sidebar tokens resolve via data-wf-theme attribute |
| WireframeThemeProvider | internal | Scopes wf-* CSS tokens per preview | Gallery already uses this; provides `wfOverrides` prop for branding injection |
| brandingToWfOverrides() | internal | Converts BrandingConfig to CSS var overrides | Phase 22 decision: generates `--wf-primary` override injected via style prop on data-wf-theme div |
| npx tsc --noEmit | TypeScript 5 strict | Zero-error requirement | Project convention — mandatory before closing any phase |

### No New Dependencies
Phase 28 introduces no new libraries. Everything needed exists in the codebase.

## Architecture Patterns

### Relevant File Map
```
tools/wireframe-builder/
├── components/
│   ├── WireframeSidebar.tsx         ← reference visual (w-48, text-xs, rounded-md px-2 py-1.5)
│   └── editor/
│       └── ScreenManager.tsx        ← target to sync (text-sm, px-3 py-2, rounded-md)
src/pages/
├── clients/
│   ├── WireframeViewer.tsx          ← hosts ScreenManager inside inline <aside> with wf-sidebar tokens
│   └── FinanceiroContaAzul/
│       └── WireframeViewer.tsx      ← hosts ScreenManager inside bespoke <aside>
└── tools/
    ├── ComponentGallery.tsx         ← gallery page with 27 components, 6 sections
    └── galleryMockData.ts           ← mock data for gallery previews
```

### Pattern 1: ScreenManager Typography Sync
**What:** WireframeSidebar uses `text-xs` (12px) for nav item labels; ScreenManager uses `text-sm` (14px). The active/hover classes are already aligned — both use `bg-wf-accent-muted text-wf-accent` for active and `text-wf-sidebar-muted hover:bg-slate-800 hover:text-white` for inactive. Padding also differs: WireframeSidebar uses `px-2 py-1.5`, ScreenManager uses `px-3 py-2`.
**When to use:** Apply to `SortableScreenItem` and the read-only `<button>` block in ScreenManager's non-edit expanded view.
**Example:**
```typescript
// ScreenManager.tsx — both places that render a nav item
className={cn(
  'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors', // text-sm→text-xs, px-3→px-2, py-2→py-1.5
  isActive
    ? 'bg-wf-accent-muted text-wf-accent font-medium'
    : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white'
)}
```

### Pattern 2: Gallery Dark Mode Toggle
**What:** Gallery has no wireframe dark/light toggle — previews inherit the app theme. To satisfy GAL-02, the gallery needs a local theme state that switches the `WireframeThemeProvider` theme between light and dark.
**When to use:** Add a toggle button in the gallery header row (next to the category filter pills).
**Example:**
```typescript
// ComponentGallery.tsx — add local state
const [wfTheme, setWfTheme] = useState<'light' | 'dark'>('light')

// Pass to WireframeThemeProvider in ComponentCard
<WireframeThemeProvider theme={wfTheme}>
  {entry.render()}
</WireframeThemeProvider>
```
Check if `WireframeThemeProvider` accepts a `theme` prop or if it uses internal state only.

### Pattern 3: Gallery Branding Override Preview
**What:** GAL-02 requires a branding-applied check. The gallery should demonstrate that `brandingToWfOverrides()` with financeiro-conta-azul's `#1B6B93` primaryColor works correctly on previews.
**Implementation approach:** Add a "Branding" toggle to the gallery toolbar that wraps previews in `WireframeThemeProvider` with `wfOverrides={brandingToWfOverrides({ primaryColor: '#1B6B93', ... })}`.
**Key constraint from Phase 22 decisions:** `brandingToWfOverrides()` emits `--wf-primary` override injected via style prop on the data-wf-theme div. This is fully compatible with gallery usage.

### Anti-Patterns to Avoid
- **Renaming wf-* tokens:** 240 usages across 31 files — decision from Phase 22. Never rename, only change values.
- **Using shadcn portals inside wireframe components:** Phase 22 decision — Dialog/Select with portal-based rendering breaks inside data-wf-theme scope. ScreenManager's `AddScreenDialog` uses shadcn Dialog but it renders outside wireframe theme (it's an editor tool, not a wireframe component).
- **Using dark: Tailwind variant inside wf-theme context:** Phase 25 decision — use token-aware classes (e.g., `hover:bg-wf-table-header`) not `dark:hover:bg-slate-800` to avoid mis-resolution inside data-wf-theme.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode detection | Custom media query listener | `useWireframeTheme()` hook from wireframe-theme lib | Already provides theme state + toggle |
| Branding CSS var injection | Manual style object construction | `brandingToWfOverrides()` from lib/branding | Phase 22 defined the canonical pipeline |
| TypeScript error discovery | Manual file-by-file review | `npx tsc --noEmit` | Compiler catches all type errors in one pass |

## Common Pitfalls

### Pitfall 1: WireframeThemeProvider theme prop may not exist
**What goes wrong:** Trying to pass `theme="dark"` to WireframeThemeProvider when it only manages internal state.
**Why it happens:** The provider was built to self-manage theme from localStorage, not to be driven externally.
**How to avoid:** Check the `WireframeThemeProvider` signature before writing the plan. If it doesn't accept a `theme` prop, the gallery toggle must call the `toggle()` function from `useWireframeTheme()` inside a wrapper component that lives inside the provider.
**Warning signs:** TypeScript error "Property 'theme' does not exist on type..."

### Pitfall 2: ScreenManager renders in two contexts
**What goes wrong:** Syncing only the SortableScreenItem path and missing the read-only button path (non-edit expanded view lines 380-415 in ScreenManager.tsx).
**Why it happens:** ScreenManager has three rendering branches: edit mode (SortableScreenItem), collapsed icon-only (handled in WireframeViewer directly), and expanded read-only (ScreenManager's own button rendering).
**How to avoid:** Edit both the `SortableScreenItem` className AND the `<button>` in the non-edit branch of ScreenManager.

### Pitfall 3: Gallery component count discrepancy
**What goes wrong:** Phase goal says "86 wireframe components" but ComponentGallery.tsx shows 27 entries across 6 sections.
**Why it happens:** "86 components" likely refers to the total number of component files in `tools/wireframe-builder/components/` (41 files including editor/, sections/, etc.), not gallery entries.
**How to avoid:** The plan should validate the 27 gallery entries, not the 41-file count. The goal is confirming all gallery entries render correctly in light/dark mode.

### Pitfall 4: TypeScript errors from prior phase edits
**What goes wrong:** `npx tsc --noEmit` finds errors introduced in phases 22-27 that weren't caught during execution.
**Why it happens:** YOLO mode may skip strict TypeScript checks during fast iteration.
**How to avoid:** Run `npx tsc --noEmit` as the first action in the TypeScript task and fix each error individually. Never use `any` as a workaround (project rule).

### Pitfall 5: FinanceiroContaAzul WireframeViewer sidebar inconsistency
**What goes wrong:** Generic WireframeViewer gets updated ScreenManager but FinanceiroContaAzul/WireframeViewer.tsx uses its own sidebar <aside> with different padding values.
**Why it happens:** The FinanceiroContaAzul viewer was built before the generic viewer and has `padding: '12px 0'` on the `<nav>` vs the generic viewer's `padding: '8px'`.
**How to avoid:** Check if ScreenManager changes affect both viewers or just the generic one. The FinanceiroContaAzul viewer's sidebar padding is set on the `<nav>` that wraps `ScreenManager`, not inside it.

## Code Examples

### Checking WireframeThemeProvider for external theme prop
```typescript
// tools/wireframe-builder/lib/wireframe-theme.tsx
// Look for: does WireframeThemeProvider accept a 'theme' prop?
// If not, the gallery toggle approach must be:
function GalleryThemeToggle() {
  const { theme, toggle } = useWireframeTheme()
  return (
    <button onClick={toggle}>
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  )
}
// Wrapped inside: <WireframeThemeProvider>...<GalleryThemeToggle />...</WireframeThemeProvider>
```

### WireframeSidebar reference dimensions (the target to match)
```typescript
// WireframeSidebar.tsx — the canonical nav item style
className={cn(
  'flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs transition-colors',
  screen.active
    ? 'bg-wf-accent-muted font-medium text-wf-accent'
    : 'text-wf-sidebar-muted hover:bg-slate-800 hover:text-white',
)}
```

### brandingToWfOverrides usage in gallery
```typescript
// In ComponentGallery.tsx — branding preview wrapper
import { brandingToWfOverrides } from '@tools/wireframe-builder/lib/branding'

const FINANCEIRO_BRANDING = {
  primaryColor: '#1B6B93',
  // ... other fields
}

// Wrap component in branded WireframeThemeProvider
<WireframeThemeProvider wfOverrides={brandingToWfOverrides(FINANCEIRO_BRANDING)}>
  {entry.render()}
</WireframeThemeProvider>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| text-sm (14px) nav items in ScreenManager | text-xs (12px) matching WireframeSidebar | Phase 28 — this is the fix | Typography size alignment |
| No dark mode toggle in gallery | Gallery-level theme toggle | Phase 28 — this is the addition | GAL-02 validation |
| No branding demo in gallery | Branding override preview toggle | Phase 28 — this is the addition | GAL-02 branding check |

## Open Questions

1. **Does WireframeThemeProvider accept a controlled `theme` prop?**
   - What we know: Provider was built with internal localStorage state + toggle function
   - What's unclear: Whether it supports external control (`theme` prop)
   - Recommendation: Read `tools/wireframe-builder/lib/wireframe-theme.tsx` before planning Task 2. If it only manages internal state, the gallery toggle must mount a `GalleryThemeToggle` child inside the provider.

2. **Is "86 wireframe components" a real count or approximate?**
   - What we know: ComponentGallery has 27 entries; tools/wireframe-builder/components/ has 41 files (including editor/ subdirectory and non-gallery components)
   - What's unclear: What the phase goal counts as "86"
   - Recommendation: Treat the success criterion as "all 27 gallery entries render without errors in light and dark mode." The 86 number may be stale from a previous phase planning session.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (tsc) |
| Config file | tsconfig.json (strict: true) |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx tsc --noEmit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | ScreenManager nav items match WireframeSidebar typography (text-xs, px-2 py-1.5) | manual-visual | n/a — visual inspection | ✅ (existing component) |
| GAL-01 | All 27 gallery entries render without console errors | manual-visual | n/a — browser inspection | ✅ (existing page) |
| GAL-02 | Gallery dark toggle + branding toggle work; all 6 sections visible | manual-visual | n/a — interactive checklist | ✅ (existing page) |
| (all) | Zero TypeScript errors across entire codebase | type-check | `npx tsc --noEmit` | ✅ |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit`
- **Phase gate:** Full tsc green + manual visual pass before `/gsd:verify-work`

### Wave 0 Gaps
None — this phase requires no new test infrastructure. All validation is visual + tsc.

## Sources

### Primary (HIGH confidence)
- Direct code reading of `tools/wireframe-builder/components/editor/ScreenManager.tsx` — ScreenManager current state and rendering branches
- Direct code reading of `tools/wireframe-builder/components/WireframeSidebar.tsx` — canonical sidebar nav item styles
- Direct code reading of `src/pages/tools/ComponentGallery.tsx` — gallery structure, component count, WireframeThemeProvider usage
- Direct code reading of `tools/wireframe-builder/styles/wireframe-tokens.css` — token system reference
- Direct code reading of `src/pages/clients/WireframeViewer.tsx` — how ScreenManager is hosted in generic viewer

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` accumulated decisions — verified project-specific constraints from prior phases
- `.planning/REQUIREMENTS.md` — EDIT-01, GAL-01, GAL-02 definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files read directly, no external research needed
- Architecture: HIGH — ScreenManager and WireframeSidebar source code fully read; exact gap identified
- Pitfalls: HIGH — based on direct code inspection of all three rendering branches in ScreenManager

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable codebase, no external deps)
