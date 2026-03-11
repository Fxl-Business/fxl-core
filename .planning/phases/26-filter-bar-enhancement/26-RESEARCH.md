# Phase 26: Filter Bar Enhancement — Research

**Researched:** 2026-03-11
**Domain:** Wireframe filter bar visual restyle — sticky blur chrome, transparent select controls, stacked label+control layout, action button hierarchy, compare toggle upgrade
**Confidence:** HIGH

---

## Summary

Phase 26 is a **pure visual restyle** of the existing `WireframeFilterBar.tsx` component. No new schema types are needed, no new blueprint fields, no external dependencies. The token foundation from Phase 22 already provides `--wf-accent`, `--wf-canvas`, `--wf-card`, `--wf-card-border`, and `--wf-muted` — all CSS variables required for this phase are confirmed present.

The current `WireframeFilterBar.tsx` uses inline styles exclusively (`style={{}}`), with no Tailwind classes. The v1.4 redesign target requires the bar container to gain `backdrop-blur-sm` and semi-transparent background (FILT-01), filter controls to adopt a vertical stacked layout with a 10px uppercase bold slate-500 label above a transparent-background select (FILT-02, FILT-03), action buttons (date picker, share, export) to render with explicit hierarchy using `rounded-lg` shape and outline vs filled treatment (FILT-04), and the compare toggle to use an 11px bold label with primary-colored switch track (FILT-05).

The most architectural change is FILT-01: the current bar uses `background: 'var(--wf-card)'` with an opaque solid fill, and the container is a plain div. To get `backdrop-blur-sm` to show through to scrolled content, the background must change to a semi-transparent value (`color-mix(in srgb, var(--wf-card) 80%, transparent)` or equivalent) so the blur has visible content behind it. This is purely a CSS/style change — no React logic changes required.

The second structural change is FILT-02 + FILT-03: the current `SelectFilter` sub-component renders label and select on the same horizontal row (`display: 'flex', alignItems: 'center', gap: 4`). The target layout stacks label above control (`flex-col gap-1`) matching the premium dashboard aesthetic already established in `GlobalFilters.tsx` and consistent with the KPI card / table typography patterns from phases 24 and 25.

**Primary recommendation:** Restyle `WireframeFilterBar.tsx` in place — change container to semi-transparent + backdrop-filter blur, switch all sub-components from horizontal inline to vertical stacked label+control, apply 10px uppercase bold slate-500 label style, make select transparent with bold primary text and no border, update action buttons to rounded-lg with outline/filled hierarchy, and upgrade the compare toggle label to 11px bold.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FILT-01 | Filter bar is sticky with backdrop-blur and semi-transparent background | Current: `background: 'var(--wf-card)'` (opaque), `position: 'sticky', top: 0, zIndex: 9`. Change: background to semi-transparent (e.g. `color-mix(in srgb, var(--wf-canvas) 85%, transparent)` or `rgba` fallback), add `backdropFilter: 'blur(8px)'` and `WebkitBackdropFilter: 'blur(8px)'`. Existing `position: 'sticky'` and `zIndex: 9` are correct and stay unchanged. |
| FILT-02 | Filter selects use transparent background with bold primary text and no border | Current `SelectFilter`: select has `border: 'none', background: 'transparent'` already — but `color: 'var(--wf-body)'` and `fontWeight: 500`. Change: `color: 'var(--wf-accent)'` (primary blue), `fontWeight: 700` (bold). The `border: 'none'` is already present. Also affects `DateRangeFilter` trigger button and `MultiSelectFilter` button which still have `border: '1px solid var(--wf-card-border)'` — these action buttons are covered by FILT-04. |
| FILT-03 | Filter labels use 10px uppercase bold slate-500 style | Current: labels rendered inline beside control with `fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500`. Target: each filter control becomes a vertical flex-col stack with label at top `{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--wf-neutral-500)' }`. The `--wf-neutral-500` CSS var is `#64748b` (slate-500) — confirmed in wireframe-tokens.css. Need to reference it as `var(--wf-muted)` which resolves to `--wf-neutral-400` (slightly lighter) — use `--wf-neutral-500` directly via inline style OR add a Tailwind class `text-slate-500` which is hardcoded. |
| FILT-04 | Action buttons (date picker, share, export) use rounded-lg with specific button hierarchy (outline vs filled) | Current: `DateRangeFilter` trigger has `borderRadius: 6, border: '1px solid var(--wf-card-border)'` and `background: 'var(--wf-card)'`. Target: `borderRadius: 8` (rounded-lg = 8px), secondary/outline buttons get `border: '1px solid var(--wf-card-border)', background: 'transparent'`, primary/filled (export) gets `background: 'var(--wf-accent)', color: 'var(--wf-accent-fg)', border: 'none'`. Note: the current component has no explicit "share" or "export" buttons — the filter bar action area only has the DateRangeFilter and compare switch. The "share" and "export" buttons mentioned in spec must be added as static decorative buttons in the filter bar right-action area to represent the button hierarchy visually. |
| FILT-05 | Compare toggle uses primary-colored switch with 11px bold label | Current: toggle track background is `isCompareOn ? 'var(--wf-accent)' : 'var(--wf-card-border)'` — the ON state is already primary-colored. Label is `fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500`. Change: label to `fontWeight: 700` (bold), keep `fontSize: 11`. The toggle switch dimensions and transition logic are unchanged. |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS custom properties (`--wf-*`) | CSS spec | Color tokens — `--wf-accent`, `--wf-canvas`, `--wf-card`, `--wf-card-border`, `--wf-muted`, `--wf-neutral-500` | Phase 22 token foundation; all tokens confirmed present in wireframe-tokens.css |
| `backdropFilter` / `WebkitBackdropFilter` | CSS spec | Blur effect behind semi-transparent filter bar | Browser standard; used via inline style since WireframeFilterBar uses inline styles throughout |
| `color-mix()` | CSS Color Level 5 | Semi-transparent background derived from existing token | Already used in `--wf-accent-muted` — same pattern applies here |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | current | `Calendar`, `ChevronDown`, `Share2`, `Download` icons for action buttons | Already imported in WireframeFilterBar (`Search`, `Calendar`, `ChevronDown`) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline `backdropFilter` style | Tailwind `backdrop-blur-sm` class | WireframeFilterBar uses 100% inline styles (no Tailwind classes at all in the component). Adding Tailwind classes would create inconsistency. Inline style is consistent with existing pattern. |
| `color-mix()` for semi-transparent bg | Hardcoded `rgba(255,255,255,0.85)` | `color-mix()` derives from the token and works for both light and dark themes. `rgba` hardcode would break dark mode. Use `color-mix()`. |
| Direct `var(--wf-neutral-500)` | `var(--wf-muted)` for label color | `--wf-muted` resolves to `--wf-neutral-400` (lighter). Spec requires slate-500 = `--wf-neutral-500`. Use the neutral scale token directly for precision. |

**Installation:** No new npm packages required. All dependencies already in project.

---

## Architecture Patterns

### Recommended Project Structure

No structural changes. `WireframeFilterBar.tsx` is the sole target file. `BlueprintRenderer.tsx` consumes it via `<WireframeFilterBar>` with no prop changes needed.

### Pattern 1: Vertical Stacked Filter Control (FILT-02 + FILT-03)

**What:** Each filter sub-component wraps its label and control in a vertical flex column — label at top (10px uppercase bold slate-500), control below (transparent select with bold primary text).
**When to use:** All filter types: `SelectFilter`, `DateRangeFilter`, `MultiSelectFilter`, `SearchFilter`, `ToggleFilter`.

**Example:**
```tsx
// Pattern established in GlobalFilters.tsx (already in project)
function SelectFilter({ filter }: { filter: FilterOption }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--wf-neutral-500)',
        whiteSpace: 'nowrap',
      }}>
        {filter.label}
      </span>
      <select disabled style={{
        fontSize: 12,
        color: 'var(--wf-accent)',
        border: 'none',
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        padding: '2px 4px',
        cursor: 'default',
        outline: 'none',
      }}>
        <option>{filter.options?.[0] ?? 'Todos'}</option>
      </select>
    </div>
  )
}
```

### Pattern 2: Semi-Transparent Sticky Container (FILT-01)

**What:** The filter bar container gains `backdropFilter` blur and semi-transparent background so scrolled content is visible behind it.
**When to use:** WireframeFilterBar root div only.

```tsx
// Container style update
<div
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 9,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'color-mix(in srgb, var(--wf-canvas) 85%, transparent)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--wf-card-border)',
    borderRadius: 12,
    padding: '8px 16px',
    flexWrap: 'wrap',
  }}
>
```

### Pattern 3: Action Button Hierarchy (FILT-04)

**What:** Right-side action area shows three static buttons: date picker (outline, secondary), share (outline, secondary), export (filled, primary). All use `borderRadius: 8` (rounded-lg).
**When to use:** The right-side action area of WireframeFilterBar, before the compare switch divider.

```tsx
// Outline secondary button (date picker, share)
<button style={{
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 12, fontWeight: 500,
  color: 'var(--wf-body)',
  border: '1px solid var(--wf-card-border)',
  borderRadius: 8,
  background: 'transparent',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}}>
  <Calendar size={12} color="var(--wf-muted)" />
  Jan — Mar 2026
</button>

// Filled primary button (export)
<button style={{
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 12, fontWeight: 600,
  color: 'var(--wf-accent-fg)',
  border: 'none',
  borderRadius: 8,
  background: 'var(--wf-accent)',
  padding: '4px 10px',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}}>
  <Download size={12} />
  Exportar
</button>
```

### Anti-Patterns to Avoid

- **Using `var(--wf-muted)` for the 10px label color:** This resolves to `--wf-neutral-400` (#94a3b8), which is too light. The spec says "slate-500" = `--wf-neutral-500` (#64748b). Use `var(--wf-neutral-500)` directly.
- **Using shadcn `Select` portal component inside WireframeFilterBar:** The project decision states "Do not introduce shadcn portal-based components (Select, Dialog) inside wireframe components — use absolutely-positioned divs." The existing `FilterConfigRenderer.tsx` uses shadcn `Select`, but `WireframeFilterBar.tsx` correctly uses native `<select>` elements. Maintain this pattern.
- **Forgetting `WebkitBackdropFilter`:** Safari requires the `-webkit-` prefix for backdrop-filter. Always set both properties when using blur.
- **Forgetting dark-theme compatibility:** The semi-transparent background must use `color-mix()` derived from a CSS token (not hardcoded rgba) so it works in both `[data-wf-theme="light"]` and `[data-wf-theme="dark"]` contexts.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Semi-transparent token-aware bg | Custom rgba calculations | `color-mix(in srgb, var(--wf-canvas) 85%, transparent)` | Already established pattern in `--wf-accent-muted`; handles both themes via CSS cascade |
| Sticky + blur container | New wrapper component | CSS `position: sticky` + `backdropFilter` on existing div | No structural change needed; purely style properties |

---

## Common Pitfalls

### Pitfall 1: Backdrop Blur Requires Transparent Background
**What goes wrong:** Setting `backdropFilter: 'blur(8px)'` with an opaque background (e.g., `background: 'var(--wf-card)'`) makes the blur invisible — the blur is behind the element but covered by the opaque fill.
**Why it happens:** Backdrop-filter blurs what's behind the element. If the element's background is fully opaque, the blurred layer is hidden.
**How to avoid:** Use semi-transparent background: `color-mix(in srgb, var(--wf-canvas) 85%, transparent)`.
**Warning signs:** Blur appears to have no effect — test by scrolling content behind the bar.

### Pitfall 2: `color-mix()` vs RGBA for Dark Mode
**What goes wrong:** Using `rgba(255,255,255,0.85)` for light mode fails in dark mode where the filter bar background should be derived from `--wf-canvas: #101622`.
**Why it happens:** Hardcoded rgba bakes in the light-mode white.
**How to avoid:** Use `color-mix(in srgb, var(--wf-canvas) 85%, transparent)` — CSS resolves the token per theme at paint time.
**Warning signs:** Filter bar looks correct in light mode but is white/wrong color in dark mode.

### Pitfall 3: `items-end` vs `items-center` When Mixing Label+Control Layout
**What goes wrong:** Some filter controls will now be taller (two-row stacked) while others (toggle) may remain single-row. Using `alignItems: 'center'` on the parent row results in misaligned baselines.
**Why it happens:** Mixed heights in a horizontal flex row.
**How to avoid:** Keep parent container `alignItems: 'center'` (visual center is correct for mixed-height row in a filter bar). Alternatively use `alignItems: 'end'` to align control bottoms if the design requires bottom-alignment. The existing behavior is center-aligned — preserve it.
**Warning signs:** Controls appear vertically misaligned when filters are a mix of stacked (taller) and single-row types.

### Pitfall 4: The `share` and `export` Buttons Are New (Not Currently in Component)
**What goes wrong:** Treating FILT-04 as a pure restyling of existing buttons. The current component has no "share" or "export" buttons — only the `DateRangeFilter` trigger and the compare switch.
**Why it happens:** The spec lists "date picker, share, export" as action buttons. Looking at the current code, only the date range trigger exists in that area.
**How to avoid:** FILT-04 requires adding two new static/decorative action buttons (`Share2` → outline, `Download` → filled primary) to the filter bar right-side area. These are wireframe mock buttons — they do not need onClick handlers beyond decorative appearance.
**Warning signs:** Only restyling the date picker trigger and missing the share/export buttons entirely.

---

## Code Examples

Verified patterns from existing codebase:

### Compare Toggle (FILT-05 — minimal change)
```tsx
// Only the label fontWeight changes from 500 → 700
// Current:
<span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
  Comparar
</span>

// Target (FILT-05):
<span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
  Comparar
</span>
// Toggle track and thumb are already correct (wf-accent for ON state)
```

### Neutral-500 Reference for Labels (FILT-03)
```tsx
// --wf-neutral-500 is defined in both [data-wf-theme] blocks in wireframe-tokens.css
// as #64748b (slate-500). The token exists and can be used directly:
color: 'var(--wf-neutral-500)'  // slate-500 — spec-correct

// NOT var(--wf-muted) which resolves to --wf-neutral-400 (#94a3b8)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat horizontal label+select row | Vertical stacked label above control | Phase 26 (this phase) | More scannable; matches GlobalFilters.tsx pattern already in project |
| Opaque card background | Semi-transparent + backdrop-blur | Phase 26 (this phase) | Depth cue — content visible scrolling behind the bar |
| fontWeight 500 on compare label | fontWeight 700 (bold) | Phase 26 (this phase) | Visual hierarchy — label reads as a control label, not a caption |

**No deprecated items in this phase.**

---

## Open Questions

1. **Where exactly should share/export buttons be positioned relative to the date picker?**
   - What we know: FILT-04 says "date picker, share, export" — implies that order
   - What's unclear: Whether they replace the current `DateRangeFilter` position or are appended after filters but before the compare divider
   - Recommendation: Place them in the right-action area before the compare divider: `[date-picker (outline)] [share (outline)] [export (filled)] | [compare toggle]`. The existing spacer `<div style={{ flex: 1 }} />` already pushes the compare group to the right — action buttons go just before the divider.

2. **Should `GlobalFilters.tsx` also be updated?**
   - What we know: It's a simpler filter component (used in some gallery contexts). It already has vertical stacked layout but uses `rounded border border-wf-card-border bg-wf-card` for its selects — not transparent+primary.
   - What's unclear: Whether it's in scope for Phase 26.
   - Recommendation: The FILT-01 through FILT-05 requirements all specifically map to the wireframe filter bar behavior (sticky, with compare toggle, with action buttons). `GlobalFilters.tsx` is the simpler utility variant. Update `WireframeFilterBar.tsx` only; `GlobalFilters.tsx` can receive a consistency pass in Phase 28 (gallery).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (tsc --noEmit) — project's primary validation gate |
| Config file | tsconfig.json at project root |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx tsc --noEmit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILT-01 | Sticky + backdrop-blur container | manual (visual) | `npx tsc --noEmit` | N/A — CSS behavior, no TS types |
| FILT-02 | Transparent selects with bold primary text | manual (visual) | `npx tsc --noEmit` | N/A — style change only |
| FILT-03 | 10px uppercase bold slate-500 labels | manual (visual) | `npx tsc --noEmit` | N/A — style change only |
| FILT-04 | Rounded-lg buttons with outline/filled hierarchy | manual (visual) | `npx tsc --noEmit` | N/A — new static buttons, no TS types added |
| FILT-05 | 11px bold compare label + primary toggle | manual (visual) | `npx tsc --noEmit` | N/A — style change only |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npx tsc --noEmit`
- **Phase gate:** Zero TypeScript errors before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure (tsc) covers all phase requirements. No new types or files require pre-work.

---

## Sources

### Primary (HIGH confidence)
- Direct source read: `tools/wireframe-builder/components/WireframeFilterBar.tsx` — current implementation, all inline styles audited
- Direct source read: `tools/wireframe-builder/styles/wireframe-tokens.css` — confirmed `--wf-neutral-500`, `--wf-canvas`, `--wf-accent`, `--wf-card-border` present in both themes
- Direct source read: `tools/wireframe-builder/components/GlobalFilters.tsx` — vertical stacked pattern already in project
- Direct source read: `tools/wireframe-builder/types/blueprint.ts` — confirmed `FilterOption` type, no new fields needed
- Direct source read: `.planning/STATE.md` — confirmed architectural decisions (no shadcn portals in wireframe, color-mix pattern)
- Direct source read: `tailwind.config.ts` — confirmed all `wf-*` token registrations

### Secondary (MEDIUM confidence)
- Phase 24 RESEARCH.md (KPI cards) and Phase 25 RESEARCH.md (tables) — established restyle-only pattern, no new packages

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are already in project, no new dependencies
- Architecture: HIGH — current component fully audited, all changes are style-level except adding two decorative buttons
- Pitfalls: HIGH — identified from direct code audit (backdrop-filter requires transparency, color-mix for dark mode, FILT-04 requires new buttons not just restyling)

**Research date:** 2026-03-11
**Valid until:** 2026-04-10 (stable Tailwind 3 + CSS spec; no fast-moving dependencies)
