# Phase 24: KPI Cards — Research

**Researched:** 2026-03-11
**Domain:** Wireframe KPI card visual restyle — hover group effects, trend badges, typography hierarchy
**Confidence:** HIGH

---

## Summary

Phase 24 is a **pure visual restyle** of the existing `KpiCardFull.tsx` component and its renderer `KpiGridRenderer.tsx`. No schema changes, no new TypeScript types, no new logic. The token foundation (Phase 22) already provides all CSS variables needed. The task is to upgrade the card markup to match the v1.4 financial dashboard aesthetic: rounded-xl with shadow-sm, group-hover icon container transition, rounded-full trend badge pills, Inter extrabold value typography, and micro comparison text.

The current `KpiCardFull.tsx` uses `rounded-lg border border-wf-card-border bg-wf-card p-4` — close but not quite. The v1.4 target upgrades to `rounded-xl`, adds `shadow-sm`, and introduces a **new icon slot** that does not exist in the current component. CARD-02 requires an icon container that transitions from `primary/10 bg + primary text` to `solid primary bg + white text` on `group-hover`. This is the most structurally significant change: the `KpiConfig` type must gain an optional `icon` field, and the card must wrap in `group` and wire the `group-hover:` variants.

The trend badge today uses `rounded` (not `rounded-full`), inline styles for `color-mix()` coloring, and is conditioned on `compareMode`. CARD-03 requires `rounded-full` pill shape and the badge should always render when `variation` is provided — not just in compareMode. The badge already uses `color-mix(in srgb, var(--wf-positive/negative) 10%, transparent)` which is the correct pattern; only the shape and gating change.

Typography: value is already `text-2xl font-bold` — requires upgrade to `font-extrabold` per CARD-04. Label is `text-[10px] font-medium uppercase tracking-wider` — CARD-04 requires `text-sm font-medium` (no uppercase, no tracking). This is a regression in size but the spec is explicit.

CARD-05 adds a `comparison` text below the value at `text-[10px] text-slate-400`. This maps to the existing `sub` field OR a new dedicated field. Audit shows `sub` already appears below the value — renaming its styling to match the spec is sufficient without a schema change.

The secondary `KpiCard.tsx` (simpler variant) is used in some gallery contexts but not in `KpiGridRenderer`. Phase 24 should also restyle it for consistency.

**Primary recommendation:** Update `KpiCardFull.tsx` in place — add `group` wrapper, add icon slot with `group-hover:` variants, update badge shape to `rounded-full`, change `font-bold` to `font-extrabold`, update label to `text-sm font-medium` (drop uppercase/tracking), update shadow/radius. Add optional `icon` to `KpiConfig` type. Restyle `KpiCard.tsx` as secondary pass for gallery consistency.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CARD-01 | KPI cards use white/slate-900 background with rounded-xl border and shadow-sm | Current: `rounded-lg` no shadow. Change to `rounded-xl shadow-sm`. `bg-wf-card` (white/#1a2235) and `border border-wf-card-border` are already correct. |
| CARD-02 | KPI cards have group-hover effect: icon container transitions from primary/10 to solid primary | Current: no icon slot. Must add optional `icon?: LucideIcon` to `KpiConfig`, add icon container with `group-hover:` Tailwind variants: `group-hover:bg-wf-accent group-hover:text-wf-accent-fg`. Card root needs `group` class. |
| CARD-03 | Trend badges use rounded-full pill with color-coded background (emerald for positive, rose for negative) | Current: `rounded` shape, conditioned on `compareMode`. Change to `rounded-full`, always show when `variation` is present. Colors: emerald-100/emerald-700 (positive), rose-100/rose-700 (negative) OR use existing `color-mix()` pattern with `--wf-positive/--wf-negative`. |
| CARD-04 | Card values use text-2xl font-extrabold, labels use text-sm font-medium slate-500 | Current value: `text-2xl font-bold` → change to `font-extrabold`. Current label: `text-[10px] font-medium uppercase tracking-wider text-wf-muted` → change to `text-sm font-medium text-slate-500` (or `text-wf-muted`). Drop uppercase and tracking. |
| CARD-05 | Comparison text uses text-[10px] text-slate-400 below value | Current `sub` field already renders below value with `text-xs text-wf-muted`. Change styling to `text-[10px] text-slate-400` (= `--wf-neutral-400`). No schema change needed — reuse `sub` field. |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS 3 | 3.x (pinned) | Utility classes — group-hover variants, rounded-full, shadow-sm | Project standard; all `wf-*` colors registered in tailwind.config.ts |
| lucide-react | current | Icon components for optional KPI icon slot | Project standard; tree-shaken; already imported throughout wireframe |
| CSS custom properties (`--wf-*`) | CSS spec | Color tokens — `--wf-accent`, `--wf-accent-muted`, `--wf-positive`, `--wf-negative` | Phase 22 token foundation; all tokens confirmed present |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cn` from `@/lib/utils` | internal | Conditional class merging for hover states | Card root `group` class + icon container `group-hover:` |
| `color-mix()` | CSS Color Level 5 | Semi-transparent badge backgrounds | Already used in current badge pattern — continue same approach |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind `group-hover:` variants | JavaScript `onMouseEnter` state | Tailwind group-hover is CSS-only, zero JS, correct for static wireframe components |
| `color-mix()` for badge bg | Tailwind `bg-emerald-100` / `bg-rose-100` | Tailwind color classes work here since badge colors are hardcoded emerald/rose, not token-dependent. Either approach is valid. Using Tailwind classes is simpler and more readable. |
| Reuse `sub` for CARD-05 | New `comparison` field in `KpiConfig` | No schema change needed; `sub` already exists and renders below value. Only the styling changes. Keeps type surface small. |

**Installation:** No new npm packages required. `@tailwindcss/container-queries@0.1.1` is already in devDeps per STATE.md decision.

---

## Architecture Patterns

### Files to Touch

```
tools/wireframe-builder/
├── components/
│   ├── KpiCardFull.tsx          <- PRIMARY: full restyle (CARD-01 through CARD-05)
│   └── KpiCard.tsx              <- SECONDARY: restyle for gallery consistency
├── types/
│   └── blueprint.ts             <- ADD: icon?: ComponentType to KpiConfig
└── (no renderer change needed for KpiGridRenderer.tsx — passes props through)
```

**Why KpiGridRenderer.tsx does NOT need changes:** It passes `item.label`, `item.value`, `item.sub`, `item.variation`, etc. directly to `KpiCardFull`. Adding `icon` to `KpiConfig` and consuming it inside `KpiCardFull` is self-contained — the renderer just needs to pass `icon={item.icon}` when the field exists.

**Correction:** `KpiGridRenderer.tsx` DOES need a one-line change to pass `icon={item.icon}` to `KpiCardFull`. This is a minor addition.

### Pattern 1: Tailwind group-hover for Icon Transition (CARD-02)

**What:** Wrap card root in `group`. Icon container uses `bg-wf-accent-muted text-wf-accent` at rest, transitions to `group-hover:bg-wf-accent group-hover:text-wf-accent-fg` on parent hover.

**Why Tailwind `group-hover:` works here:** The wireframe is already a Tailwind-first component. `group-hover:` is a standard Tailwind v3 variant. No JavaScript hover state needed.

**Key consideration:** `--wf-accent-muted` uses `color-mix()` which is hex-incompatible with Tailwind opacity modifiers. The Tailwind class `bg-wf-accent-muted` directly maps `var(--wf-accent-muted)` as the full background value — this works correctly because tailwind.config.ts maps `wf.accent-muted` to `var(--wf-accent-muted)`.

```tsx
// Card root
<div className="group rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
  {/* Icon container — transitions on group-hover */}
  {icon && (
    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg
                    bg-wf-accent-muted text-wf-accent
                    transition-colors duration-200
                    group-hover:bg-wf-accent group-hover:text-wf-accent-fg">
      <Icon className="h-5 w-5" />
    </div>
  )}
  {/* ...rest of card content */}
</div>
```

**Note on `transition-colors`:** Must be on the icon container div, not the card root, to animate only the icon colors.

### Pattern 2: LucideIcon type in KpiConfig

**What:** `icon` field accepts any Lucide icon component. The correct TypeScript type for a Lucide icon is `React.ComponentType<React.SVGProps<SVGSVGElement>>` or the simpler `LucideIcon` type exported from `lucide-react`.

```typescript
// In blueprint.ts
import type { LucideIcon } from 'lucide-react'

export type KpiConfig = {
  label: string
  value: string
  sub?: string
  variation?: string
  variationPositive?: boolean
  sparkline?: number[]
  semaforo?: 'verde' | 'amarelo' | 'vermelho'
  semaforoLabel?: string
  wide?: boolean
  icon?: LucideIcon  // NEW — optional Lucide icon for visual accent
}
```

**Type safety note:** `LucideIcon` is defined as `React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>`. Importing it from `lucide-react` is the canonical approach. Using `React.ComponentType` is also acceptable but `LucideIcon` is more precise.

### Pattern 3: Trend Badge as rounded-full Pill (CARD-03)

**What:** Remove `compareMode` gate on badge. Change `rounded` to `rounded-full`. Use `bg-emerald-100 text-emerald-700` / `bg-rose-100 text-rose-700` Tailwind classes (simpler and more readable than `color-mix()` inline styles, which are still valid).

**Current badge:**
```tsx
{compareMode && variation && (
  <span
    className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium"
    style={{
      backgroundColor: variationPositive
        ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
        : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
      color: variationPositive ? 'var(--wf-positive)' : 'var(--wf-negative)',
    }}
  >
    {variation}
  </span>
)}
```

**Target badge:**
```tsx
{variation && (
  <span
    className={cn(
      'mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
      variationPositive
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-rose-100 text-rose-700'
    )}
  >
    {variation}
  </span>
)}
```

**Dark mode note:** `bg-emerald-100` and `bg-rose-100` are light-mode Tailwind classes. In dark mode these may appear washed out. The `color-mix()` approach with `--wf-positive`/`--wf-negative` tokens is theme-aware. Since v1.4 per STATE.md does NOT require dark mode fine-tuning beyond token parity, using Tailwind emerald/rose is acceptable. However, the `color-mix()` approach is more robust for both themes. **Recommendation:** Use `color-mix()` inline styles to stay token-aware across both light and dark modes, matching the existing pattern.

### Pattern 4: Typography Updates (CARD-04)

**Label:** `text-sm font-medium text-wf-muted` (or `text-slate-500` which resolves to same `--wf-neutral-500` = `#64748b`). Drop `uppercase` and `tracking-wider`. Use `text-wf-muted` to stay theme-aware.

**Value:** Change `font-bold` to `font-extrabold`. Keep `text-2xl text-wf-heading`.

**Comparison/sub (CARD-05):** Change from `text-xs text-wf-muted` to `text-[10px] text-slate-400`. `text-slate-400` = `#94a3b8` = `--wf-neutral-400` = `var(--wf-muted)` in light mode. Using `text-wf-muted` is equivalent and more theme-aware.

### Pattern 5: KpiCard.tsx Secondary Restyle

**What:** `KpiCard.tsx` is the simpler component used in other gallery sections (not `KpiGridRenderer`). Apply the same visual upgrades: `rounded-xl shadow-sm`, `font-extrabold` value, `text-sm font-medium` label (drop uppercase/tracking), `rounded-full` badge.

**No icon slot needed** in `KpiCard.tsx` — it is the simpler variant without icon support.

### Anti-Patterns to Avoid

- **Forgetting to pass `icon` from KpiGridRenderer:** The renderer passes individual props to `KpiCardFull`. After adding `icon` to `KpiConfig`, `KpiGridRenderer.tsx` must forward `icon={item.icon}`.
- **Putting `transition-colors` on card root instead of icon container:** This would animate ALL color changes on hover (borders, text), causing unwanted flashing. Only the icon container should transition.
- **Using `group-hover:bg-wf-sidebar-active` (wrong token):** The hover target is `--wf-accent` (full primary blue), not `--wf-sidebar-active`. Use `group-hover:bg-wf-accent`.
- **Using `rounded-full` on card root:** `rounded-xl` for the card, `rounded-full` only for badge pills, `rounded-lg` for icon container.
- **Removing `compareMode` badge check from `KpiCardFull` without confirming `KpiCard`:** Both files have the badge; both need the `compareMode` gate removed.
- **Using any in icon type:** TypeScript strict mode is enforced. `icon?: LucideIcon` from lucide-react is the correct type. Never use `icon?: any`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hover color transition on icon | JavaScript useState hover | Tailwind `group` + `group-hover:` variants | CSS-only, zero JS, simpler, no re-renders |
| Semi-transparent badge backgrounds | Custom opacity utility | `color-mix(in srgb, var(--wf-positive) 10%, transparent)` | Already established pattern in project; stays theme-aware with CSS var tokens |
| Icon size normalization | Custom wrapper | `h-5 w-5` Tailwind on the icon, `h-10 w-10` container | Standard Tailwind sizing pattern |
| Dark mode badge contrast | Per-theme if branches | `--wf-positive`/`--wf-negative` tokens + `color-mix()` | Tokens already define the correct color for each theme |

**Key insight:** All CSS infrastructure for this phase is already in place from Phase 22. The token `--wf-accent`, `--wf-accent-muted`, `--wf-accent-fg` are defined and mapped in `tailwind.config.ts`. Phase 24's scope is purely visual HTML/class restructuring of two component files plus a one-line type addition.

---

## Common Pitfalls

### Pitfall 1: `group-hover:` variants require `group` on ancestor
**What goes wrong:** Adding `group-hover:bg-wf-accent` to the icon container but forgetting `group` on the card root div.
**Why it happens:** Tailwind group-hover requires an explicit `group` class on a parent element. Without it, the variants compile but never activate.
**How to avoid:** Card root must have `className="group rounded-xl ..."`. The icon container then uses `group-hover:bg-wf-accent group-hover:text-wf-accent-fg`.
**Warning signs:** Icon color never changes on hover despite correct classes on the container.

### Pitfall 2: `text-wf-accent-muted` does not exist — `bg-wf-accent-muted` does
**What goes wrong:** Trying to use `text-wf-accent-muted` for icon text color at rest.
**Why it happens:** In tailwind.config.ts, `wf.accent-muted` is registered only in the color palette (as a background color). The `text-wf-accent` class is what provides the primary blue text color.
**How to avoid:** At rest: `bg-wf-accent-muted text-wf-accent`. On hover: `group-hover:bg-wf-accent group-hover:text-wf-accent-fg`.

### Pitfall 3: LucideIcon import path
**What goes wrong:** Importing `LucideIcon` from `lucide-react/dist/...` or a wrong path.
**Why it happens:** Lucide-react changed its export structure between major versions.
**How to avoid:** Use `import type { LucideIcon } from 'lucide-react'` — this is the canonical top-level export in the project's installed version.
**Warning signs:** TypeScript error: `Module 'lucide-react' has no exported member 'LucideIcon'`. If this occurs, fallback to `React.ComponentType<{ className?: string; style?: React.CSSProperties }>`.

### Pitfall 4: `compareMode` badge gate removal breaks existing client wireframes
**What goes wrong:** Current client wireframes (financeiro-conta-azul) pass `variation` AND depend on `compareMode` being the gate for badge visibility. Removing the gate means badges now always show — including in non-compare-mode views where they may not be desired.
**Why it happens:** The existing `KpiConfig` items that have `variation` were authored assuming the `compareMode` guard.
**How to avoid:** Verify financeiro-conta-azul blueprint data. If `variation` values exist in non-compareMode KPI items and their display is unwanted, the gate should remain. CARD-03 requirement says "trend badges display as rounded-full pills" — it implies they should display when variation data is present. The safest change is to keep `compareMode || variation` gating but change the shape when shown.
**Recommendation:** Remove only the `compareMode` AND gate — show badge whenever `variation` is provided, regardless of mode. This matches the v1.4 target where KPI cards are standalone premium components, not compare-mode-only.

### Pitfall 5: `shadow-sm` and dark mode
**What goes wrong:** `shadow-sm` in Tailwind is hardcoded as a light-colored box shadow (`rgba(0,0,0,0.05)`). In dark mode, it may be nearly invisible against the dark card background.
**Why it happens:** Tailwind shadows don't adapt to dark mode by default.
**How to avoid:** This is acceptable for v1.4. Per STATE.md: "Dark mode fine-tuning beyond token parity is v2." `shadow-sm` provides the intended light-mode premium feel; dark mode shadow behavior is out of scope.

---

## Code Examples

Verified patterns from existing codebase and project conventions:

### KpiCardFull.tsx — full restyle target

```tsx
// tools/wireframe-builder/components/KpiCardFull.tsx
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ... SemaforoStatus and SEMAFORO map unchanged ...

type Props = {
  label: string
  value: string
  sub?: string
  variation?: string
  variationPositive?: boolean
  semaforo?: SemaforoStatus
  semaforoLabel?: string
  sparkline?: number[]
  wide?: boolean
  compareMode?: boolean
  icon?: LucideIcon  // NEW for CARD-02
}

export default function KpiCardFull({
  label, value, sub, variation, variationPositive = true,
  semaforo, semaforoLabel, sparkline, wide = false, compareMode = false,
  icon: Icon,
}: Props) {
  return (
    // CARD-01: rounded-xl + shadow-sm | CARD-02: group
    <div className={cn('group rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm', wide && 'col-span-2')}>

      {/* CARD-02: icon container with group-hover transition */}
      {Icon && (
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg
                        bg-wf-accent-muted text-wf-accent
                        transition-colors duration-200
                        group-hover:bg-wf-accent group-hover:text-wf-accent-fg">
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* CARD-04: label — text-sm font-medium, drop uppercase/tracking */}
      <p className="text-sm font-medium text-wf-muted">{label}</p>

      {/* CARD-04: value — text-2xl font-extrabold */}
      <p className="mt-1 text-2xl font-extrabold text-wf-heading">{value}</p>

      {/* CARD-05: comparison/sub — text-[10px] text-slate-400 */}
      {sub && <p className="mt-0.5 text-[10px] text-wf-muted">{sub}</p>}

      {compareMode && semaforo && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full flex-shrink-0', SEMAFORO[semaforo].dot)} />
          <span className={cn('text-xs font-medium', SEMAFORO[semaforo].text)}>
            {semaforoLabel ?? { verde: 'Verde', amarelo: 'Amarelo', vermelho: 'Vermelho' }[semaforo]}
          </span>
        </div>
      )}

      {/* CARD-03: badge — rounded-full pill, no compareMode gate */}
      {variation && (
        <span
          className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: variationPositive
              ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
              : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
            color: variationPositive ? 'var(--wf-positive)' : 'var(--wf-negative)',
          }}
        >
          {variation}
        </span>
      )}

      {sparkline && <Sparkline points={sparkline} />}
    </div>
  )
}
```

### KpiGridRenderer.tsx — add icon passthrough

```tsx
// Only change: add icon={item.icon} to KpiCardFull props
<KpiCardFull
  key={i}
  label={item.label}
  value={item.value}
  sub={item.sub}
  variation={item.variation}
  variationPositive={item.variationPositive}
  sparkline={item.sparkline}
  semaforo={item.semaforo}
  semaforoLabel={item.semaforoLabel}
  wide={item.wide}
  compareMode={compareMode}
  icon={item.icon}   // NEW
/>
```

### blueprint.ts — KpiConfig type addition

```typescript
import type { LucideIcon } from 'lucide-react'

export type KpiConfig = {
  label: string
  value: string
  sub?: string
  variation?: string
  variationPositive?: boolean
  sparkline?: number[]
  semaforo?: 'verde' | 'amarelo' | 'vermelho'
  semaforoLabel?: string
  wide?: boolean
  icon?: LucideIcon  // NEW — optional Lucide icon component reference
}
```

### KpiCard.tsx — simplified restyle (CARD-01, CARD-03, CARD-04)

```tsx
// tools/wireframe-builder/components/KpiCard.tsx — secondary restyle
export default function KpiCard({ label, value, variation, description, variationPositive = true }: Props) {
  return (
    <div className="rounded-xl border border-wf-card-border bg-wf-card p-4 shadow-sm">
      <p className="text-sm font-medium text-wf-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-wf-heading">{value}</p>
      {variation && (
        <span
          className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: variationPositive
              ? 'color-mix(in srgb, var(--wf-positive) 10%, transparent)'
              : 'color-mix(in srgb, var(--wf-negative) 10%, transparent)',
            color: variationPositive ? 'var(--wf-positive)' : 'var(--wf-negative)',
          }}
        >
          {variation}
        </span>
      )}
      {description && (
        <p className="mt-1.5 text-[10px] text-wf-muted">{description}</p>
      )}
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `rounded-lg` card, no shadow | `rounded-xl shadow-sm` | Phase 24 | Premium card aesthetic with subtle depth |
| No icon slot | Optional icon with group-hover transition | Phase 24 | Signature hover effect for financial dashboard first impression |
| `rounded` badge pill (square corners) | `rounded-full` badge pill | Phase 24 | Modern tag/badge pattern, standard in financial SaaS |
| Badge only in `compareMode` | Badge whenever `variation` present | Phase 24 | Trend badges are always relevant, not compare-mode only |
| `font-bold` value | `font-extrabold` value | Phase 24 | Inter Extrabold for financial key metrics — stronger visual hierarchy |
| `text-[10px] uppercase tracking-wider` label | `text-sm font-medium` label | Phase 24 | Larger, more readable label; no-shout uppercase treatment |

**Deprecated/outdated:**
- `compareMode` gate on trend badge: removed — badges show whenever `variation` data is present.
- `uppercase tracking-wider` on KPI labels: removed in favor of `text-sm font-medium` per v1.4 spec.

---

## Open Questions

1. **`LucideIcon` type availability**
   - What we know: `lucide-react` is in the project stack. `LucideIcon` is a named export.
   - What's unclear: The exact installed version determines if `LucideIcon` is exported at top level.
   - Recommendation: Use `import type { LucideIcon } from 'lucide-react'`. If TypeScript reports missing export, fallback to `React.ComponentType<{ className?: string }>`.

2. **Gallery previews with icon slot**
   - What we know: The component gallery (`ComponentGallery.tsx` or similar) renders `KpiCardFull` with mock data. Adding `icon` means gallery previews should include an icon to showcase the CARD-02 effect.
   - What's unclear: The gallery is addressed in Phase 28 (GAL-01/02), not Phase 24.
   - Recommendation: Phase 24 adds the icon slot but does not update gallery preview data. Phase 28 will update gallery mock data to include icon examples.

3. **`compareMode` removal scope**
   - What we know: `compareMode` on the badge currently shows/hides the trend indicator. CARD-03 implies badges always show.
   - What's unclear: Are there client wireframes (financeiro-conta-azul) where `variation` data exists but badge should NOT be shown outside compare mode?
   - Recommendation: Remove the `compareMode` gate from the badge. The `compareMode` prop itself stays on the component for the semaforo block. Only the badge's `compareMode` gating is removed. If any client wireframe has unexpected badge visibility, it means their `variation` data was correctly descriptive and the badge is appropriate.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts at project root) |
| Config file | `/Users/cauetpinciara/Documents/fxl/fxl-core/vitest.config.ts` |
| Quick run command | `npx tsc --noEmit` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CARD-01 | Card has `rounded-xl` and `shadow-sm` | manual-only | n/a — visual CSS class change | n/a |
| CARD-02 | Icon container transitions on group-hover | manual-only | n/a — interactive CSS hover | n/a |
| CARD-03 | Badge is `rounded-full` pill, no compareMode gate | manual-only | n/a — visual CSS + conditional render | n/a |
| CARD-04 | Value `font-extrabold`, label `text-sm font-medium` | manual-only | n/a — visual typography | n/a |
| CARD-05 | Comparison text `text-[10px] text-wf-muted` | manual-only | n/a — visual typography | n/a |

**Note:** Phase 24 is a pure visual restyle of React components. All requirements are verified by visual inspection (`make dev` → open wireframe viewer → check KPI grid section). TypeScript compliance (`npx tsc --noEmit`) is the only automated gate.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (zero errors required)
- **Per wave merge:** `npx vitest run` (no regressions in existing tests)
- **Phase gate:** Visual inspection of KPI grid in wireframe viewer + `npx tsc --noEmit` green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure is sufficient. Phase 24 has no logic changes that require unit tests. TypeScript compliance is the automated gate.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `tools/wireframe-builder/components/KpiCardFull.tsx` — full component markup, prop types, current badge and typography patterns
- Direct code inspection: `tools/wireframe-builder/components/KpiCard.tsx` — simpler variant, also needs restyle
- Direct code inspection: `tools/wireframe-builder/components/sections/KpiGridRenderer.tsx` — prop passthrough from blueprint to card
- Direct code inspection: `tools/wireframe-builder/types/blueprint.ts` (lines 24–34) — `KpiConfig` type surface
- Direct code inspection: `tools/wireframe-builder/styles/wireframe-tokens.css` — confirmed `--wf-accent`, `--wf-accent-muted`, `--wf-accent-fg`, `--wf-positive`, `--wf-negative` all present in both themes
- Direct code inspection: `tailwind.config.ts` (lines 64–97) — confirmed `wf.accent`, `wf.accent-muted`, `wf.accent-fg`, `wf.positive`, `wf.negative` all registered as Tailwind color aliases
- `.planning/REQUIREMENTS.md` — source of truth for CARD-01 through CARD-05
- `.planning/STATE.md` — v1.4 decisions confirming token-first approach, color-mix pattern, no dark mode fine-tuning in v1.4

### Secondary (MEDIUM confidence)
- Phase 22 RESEARCH.md — confirmed `color-mix()` pattern as project-wide standard for semi-transparent fills
- Phase 23 RESEARCH.md — confirmed pattern of inline style vs Tailwind class decision logic for wf-* tokens
- Tailwind CSS v3 docs — `group` and `group-hover:` are stable, standard features

### Tertiary (LOW confidence)
- None — all findings derived from direct code inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries and tokens already in project
- Architecture: HIGH — exact file targets identified, all prop chains traced
- Token values: HIGH — wireframe-tokens.css inspected, all required tokens confirmed present
- Component patterns: HIGH — actual class and style patterns read from source
- Pitfalls: HIGH — derived from direct inspection of existing hover implementations and type patterns

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable Tailwind/component system, no fast-moving dependencies)
