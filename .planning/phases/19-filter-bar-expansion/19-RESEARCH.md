# Phase 19: Filter Bar Expansion - Research

**Researched:** 2026-03-11
**Domain:** React component rendering, wireframe filter patterns, mock-data UI widgets
**Confidence:** HIGH (all findings from direct codebase inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FILT-02 | Date range picker filter type | `filterType: 'date-range'` already in `FilterOptionSchema` and `FilterOption` TS type (Phase 17). `WireframeFilterBar` currently renders every filter as a `<select>` regardless of `filterType`. Need a new branch in the render loop that checks `filter.filterType === 'date-range'` and renders a calendar-style date range widget inline. No external date-picker library — self-contained mock-data widget using CSS tokens. |
| FILT-03 | Multi-select dropdown filter type | `filterType: 'multi-select'` already in schema. Need a new render branch for `'multi-select'` that shows a badge-style multi-token display (selected values as chips) with a dropdown using `filter.options`. Self-contained, disabled/static (wireframe is mock data, no real selection). |
| FILT-04 | Search/text filter type | `filterType: 'search'` already in schema. Need a new render branch for `'search'` that shows an inline search input with magnifying glass icon. The existing `showSearch` prop on WireframeFilterBar renders a global search — the per-filter `'search'` type is narrower: it replaces the `<select>` with an `<input type="text">` styled consistently with the filter bar. |
| FILT-05 | Period quick-select presets for date-range filter | When `filterType === 'date-range'`, the calendar widget must include preset buttons (Last 7 days, Last 30 days, Last month, YTD, Last year). Presets are purely visual — no real date computation needed since wireframe uses mock data. Rendered as small pill buttons below the date inputs. |
| FILT-06 | Boolean toggle filter type | `filterType: 'toggle'` already in schema. Need a render branch for `'toggle'` that shows a small labeled switch (same toggle component pattern already used by the "Comparar" switch inside WireframeFilterBar). The filter label is the toggle label. |
</phase_requirements>

---

## Summary

Phase 19 is a pure render expansion of `WireframeFilterBar.tsx`. The schema foundation (Phase 17) and all TypeScript/Zod types are already complete — `FilterOption.filterType` accepts all five values (`'select'`, `'date-range'`, `'multi-select'`, `'search'`, `'toggle'`) and `FilterOptionSchema` validates them. No schema changes are needed.

The current filter bar renders every `FilterOption` as a plain `<select>` regardless of `filterType`. Phase 19 adds a render dispatch inside the existing `filters.map()` loop that switches on `filterType` and renders the correct widget. All widgets are self-contained, static (mock data), and use `var(--wf-*)` tokens exclusively — no new npm packages, no real state management beyond local `useState`.

The design challenge is fitting calendar pickers and multi-select chips gracefully inside the horizontal filter bar layout. The filter bar uses `flexWrap: 'wrap'` so wider widgets naturally wrap to a second line. Date range pickers with preset buttons will be wider and should be allowed to wrap. Multi-select chips can overflow horizontally with `overflow: hidden` and a `+N more` counter badge.

**Primary recommendation:** Implement all five filter type branches in a single focused task on `WireframeFilterBar.tsx`. Each branch is a small, self-contained conditional render. Add Vitest tests for the schema (already covered by Phase 17 tests) and manual visual tests in the viewer.

---

## Standard Stack

### Core (already installed, no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component rendering, `useState` for local toggle/date state | Project-wide |
| TypeScript | 5.x strict | `filterType` discriminator already typed | Project-wide |
| lucide-react | latest | Icons: `Search`, `ChevronDown`, `Calendar`, `X` | Already used in filter bar |
| CSS custom properties | N/A | `--wf-*` token system for all colors/borders | Established pattern |
| Vitest | 4.x | Unit tests for schema (already covering filterType enum) | Established test infrastructure |

**Installation:** No new packages needed. `commit_docs: true` in config.json.

---

## Architecture Patterns

### Relevant File Structure (only changed files)

```
tools/wireframe-builder/
└── components/
    └── WireframeFilterBar.tsx   ← All changes here, single file
```

No new files needed. No schema changes. No type changes. The entire phase is a render expansion of one component.

### Pattern 1: filterType Dispatch in Render Loop

**What:** Replace the current flat `<select>` render with a switch/conditional inside `filters.map()`.
**When to use:** Any time a list renders polymorphic items based on a discriminator field.

Current code (lines 102-123 of WireframeFilterBar.tsx):
```tsx
{filters.map((filter) => (
  <div key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
      {filter.label}:
    </span>
    <select disabled style={{ ... }}>
      <option>{filter.options?.[0] ?? 'Todos'}</option>
    </select>
  </div>
))}
```

Target pattern:
```tsx
{filters.map((filter) => (
  <FilterControl key={filter.key} filter={filter} />
))}
```

Where `FilterControl` is a local function component (not exported) that dispatches on `filter.filterType`:
```tsx
function FilterControl({ filter }: { filter: FilterOption }) {
  const ft = filter.filterType ?? 'select'
  if (ft === 'date-range')   return <DateRangeFilter filter={filter} />
  if (ft === 'multi-select') return <MultiSelectFilter filter={filter} />
  if (ft === 'search')       return <SearchFilter filter={filter} />
  if (ft === 'toggle')       return <ToggleFilter filter={filter} />
  // default: 'select'
  return <SelectFilter filter={filter} />
}
```

Each sub-component is defined in the same file (not exported separately), keeping the file self-contained. This matches the existing pattern where the toggle switch is inlined.

### Pattern 2: Date Range Filter Widget (FILT-02, FILT-05)

**What:** A date range display with start/end date inputs and quick-preset pills below.
**Design intent:** Wireframe fidelity — looks like a real date range picker but is static.

```tsx
function DateRangeFilter({ filter }: { filter: FilterOption }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {filter.label}:
      </span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'var(--wf-body)', fontWeight: 500,
          border: '1px solid var(--wf-card-border)', borderRadius: 6,
          background: 'var(--wf-card)', padding: '2px 8px',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        <Calendar size={12} color="var(--wf-muted)" />
        01/01/2026 — 28/02/2026
        <ChevronDown size={12} color="var(--wf-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
          background: 'var(--wf-card)', border: '1px solid var(--wf-card-border)',
          borderRadius: 8, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          minWidth: 280,
        }}>
          {/* Quick presets (FILT-05) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {['Últimos 7 dias', 'Últimos 30 dias', 'Mês anterior', 'YTD', 'Último ano'].map(p => (
              <button key={p} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                border: '1px solid var(--wf-card-border)',
                background: 'transparent', color: 'var(--wf-body)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                {p}
              </button>
            ))}
          </div>
          {/* Date inputs (static mock) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" disabled defaultValue="2026-01-01"
              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--wf-card-border)',
                borderRadius: 4, color: 'var(--wf-body)', background: 'var(--wf-card)',
                fontFamily: 'Inter, sans-serif' }} />
            <span style={{ color: 'var(--wf-muted)', fontSize: 12 }}>—</span>
            <input type="date" disabled defaultValue="2026-02-28"
              style={{ fontSize: 12, padding: '4px 6px', border: '1px solid var(--wf-card-border)',
                borderRadius: 4, color: 'var(--wf-body)', background: 'var(--wf-card)',
                fontFamily: 'Inter, sans-serif' }} />
          </div>
        </div>
      )}
    </div>
  )
}
```

**Key detail:** The open/close state controls the calendar panel visibility. The panel uses `position: absolute` so it overlays content below the filter bar without pushing layout. The `zIndex: 20` matches the filter bar's `zIndex: 9` (panel is on top).

### Pattern 3: Multi-Select Filter (FILT-03)

**What:** A chip-based display showing selected values with a dropdown to show all options.
**Design intent:** Show 1-2 selected chips, `+N more` if overflow, chevron to open full list.

```tsx
function MultiSelectFilter({ filter }: { filter: FilterOption }) {
  const [open, setOpen] = useState(false)
  const selected = filter.options?.slice(0, 2) ?? ['Todos']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
      <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {filter.label}:
      </span>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, border: '1px solid var(--wf-card-border)', borderRadius: 6,
          background: 'var(--wf-card)', padding: '2px 8px', cursor: 'pointer',
        }}
      >
        {selected.map(s => (
          <span key={s} style={{
            fontSize: 11, background: 'var(--wf-accent-muted)', color: 'var(--wf-accent-fg)',
            borderRadius: 4, padding: '1px 6px', fontWeight: 500,
          }}>{s}</span>
        ))}
        {(filter.options?.length ?? 0) > 2 && (
          <span style={{ fontSize: 11, color: 'var(--wf-muted)' }}>
            +{(filter.options?.length ?? 0) - 2}
          </span>
        )}
        <ChevronDown size={12} color="var(--wf-muted)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 20, marginTop: 4,
          background: 'var(--wf-card)', border: '1px solid var(--wf-card-border)',
          borderRadius: 8, padding: 8, minWidth: 160,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {(filter.options ?? ['Todos']).map(opt => (
            <div key={opt} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px', fontSize: 12, color: 'var(--wf-body)',
              cursor: 'default',
            }}>
              <span style={{
                width: 14, height: 14, border: '1px solid var(--wf-card-border)',
                borderRadius: 3, background: 'var(--wf-accent-muted)', display: 'inline-block',
              }} />
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pattern 4: Search Filter (FILT-04)

**What:** Per-filter text search input, narrower than the global `showSearch` bar.
**Difference from `showSearch` prop:** `showSearch` renders a full-width global search. The `'search'` filterType replaces the `<select>` with a small inline text input scoped to the filter's label context.

```tsx
function SearchFilter({ filter }: { filter: FilterOption }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {filter.label}:
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        border: '1px solid var(--wf-card-border)', borderRadius: 6,
        background: 'var(--wf-card)', padding: '2px 8px',
      }}>
        <Search size={12} color="var(--wf-muted)" />
        <input
          disabled
          placeholder="Buscar..."
          style={{
            border: 'none', outline: 'none', fontSize: 12, color: 'var(--wf-muted)',
            background: 'transparent', width: 120, fontFamily: 'Inter, sans-serif',
          }}
        />
      </div>
    </div>
  )
}
```

### Pattern 5: Toggle Filter (FILT-06)

**What:** A labeled on/off switch, identical to the "Comparar" toggle already in the filter bar.
**Reuse:** The existing toggle button code (lines 162-191 of WireframeFilterBar.tsx) can be extracted and reused verbatim. The only difference is the `filter.label` is the switch label.

```tsx
function ToggleFilter({ filter }: { filter: FilterOption }) {
  const [on, setOn] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {filter.label}
      </span>
      <button
        onClick={() => setOn(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center',
          width: 36, height: 20, borderRadius: 10,
          background: on ? 'var(--wf-accent)' : 'var(--wf-card-border)',
          border: 'none', cursor: 'pointer', transition: 'background 0.2s',
          padding: 0, flexShrink: 0,
        }}
      >
        <span style={{
          display: 'block', width: 16, height: 16, borderRadius: '50%',
          background: 'var(--wf-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: on ? 'translateX(18px)' : 'translateX(2px)',
          transition: 'transform 0.2s',
        }} />
      </button>
    </div>
  )
}
```

### Pattern 6: SelectFilter (default backward-compat branch)

**What:** Extracts the existing `<select>` render into its own function for clarity.
**Why:** Makes the dispatch function clean; no behavior change for existing blueprints.

```tsx
function SelectFilter({ filter }: { filter: FilterOption }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        {filter.label}:
      </span>
      <select disabled style={{
        fontSize: 12, color: 'var(--wf-body)', border: 'none',
        background: 'transparent', cursor: 'default',
        fontFamily: 'Inter, sans-serif', fontWeight: 500, padding: '2px 4px',
      }}>
        <option>{filter.options?.[0] ?? 'Todos'}</option>
      </select>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Adding real date state management:** Wireframe uses mock data. Date range values are static display. Only `open/close` toggle state is needed.
- **Using `disabled` on the date-range panel toggle button:** The trigger button for expanding the calendar should NOT be `disabled` — the panel must open/close on click. Only the date `<input>` fields themselves are `disabled`.
- **Mixing multi-select real state with schema:** The selected options displayed in chips are taken from `filter.options` (first N). There is no "selected" state in `FilterOption` — it's a wireframe, not a functional filter.
- **Creating a new file for sub-components:** Keep all filter sub-components inside `WireframeFilterBar.tsx`. They are not reused elsewhere and keeping them co-located avoids unnecessary file sprawl.
- **Using `z-index` below the filter bar's `zIndex: 9`:** The date-range and multi-select dropdown panels need `zIndex: 20` to appear above content sections below the filter bar.
- **Changing the `showSearch` prop behavior:** The existing `showSearch` global search is independent of the new `filterType: 'search'` per-filter type. Do not conflate them.
- **Adding lucide icons not already imported:** Only `Search` is currently imported. Will need to add `Calendar`, `ChevronDown` from lucide-react (already installed).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picker library | react-datepicker, @nextui/date-picker | Two `<input type="date" disabled>` fields + preset buttons | Wireframe is mock-data only — no real date selection needed |
| Multi-select state machine | Custom reducer for selection | Static chip display from `filter.options` | No real interaction — just visual fidelity |
| Popover/portal system | Custom Portal component | `position: absolute` on a wrapper `div` | Simple dropdown, no complex positioning needed |
| Toggle component library | @radix-ui/switch, @headlessui | Inline `<button>` with CSS transition | Already done this way for "Comparar" toggle |

**Key insight:** This is a wireframe viewer, not a functional dashboard. Every filter widget is a high-fidelity visual mock. The only real interactivity needed is open/close state for dropdowns and on/off for toggles.

---

## Common Pitfalls

### Pitfall 1: Calendar dropdown panel clipped by filter bar `overflow`

**What goes wrong:** The date range picker panel (`position: absolute`) gets clipped if the filter bar wrapper has `overflow: hidden` or if the panel extends beyond the viewport.
**Why it happens:** The filter bar uses `flexWrap: 'wrap'` which doesn't set `overflow` explicitly, but parent containers in `BlueprintRenderer` or `WireframeViewer` might clip children.
**How to avoid:** Verify the filter bar's parent chain has no `overflow: hidden` or `overflow: auto` above it that would clip `position: absolute` children. If clipping is detected, use `position: fixed` for the dropdown panel as a fallback (adjust coordinates via `getBoundingClientRect`).
**Warning signs:** Calendar panel appears cut off or invisible when opened.

### Pitfall 2: `filterType` undefined for existing blueprint filters

**What goes wrong:** Existing blueprints in Supabase have `FilterOption` entries without a `filterType` field. If the dispatch uses `filter.filterType === 'select'` as the default check, filters with `undefined` `filterType` fall through to no render.
**Why it happens:** `filterType` is optional and defaults to `undefined` (not `'select'`) in stored data.
**How to avoid:** Always normalize with `const ft = filter.filterType ?? 'select'` before dispatching. The `FilterControl` dispatch function already shows this pattern above.
**Warning signs:** Existing blueprint filter bar renders empty (no filters visible) after the refactor.

### Pitfall 3: Z-index collision between calendar panel and sidebar/header

**What goes wrong:** The date range calendar panel (z-index 20) renders behind the sidebar (which uses `position: fixed` at high z-index) if a filter bar appears near the left edge of the screen.
**Why it happens:** Fixed-position sidebar elements in WireframeViewer create a new stacking context. The filter bar is inside `<main>` which has lower stacking context.
**How to avoid:** The filter bar is rendered inside `<main>` (content area), far from the sidebar's z-stacking context. The 20 z-index is sufficient. Only an issue if filter bar is rendered in a header-level position — not the case here.
**Warning signs:** Calendar panel hidden behind sidebar when filter bar is near left edge.

### Pitfall 4: lucide-react imports not updated

**What goes wrong:** `Calendar` and `ChevronDown` icons used in date-range and multi-select widgets but not imported in `WireframeFilterBar.tsx`.
**Why it happens:** Current imports only bring in `Search`. New widgets need additional icons.
**How to avoid:** Update the import at line 2 of WireframeFilterBar.tsx:
```tsx
import { Search, Calendar, ChevronDown } from 'lucide-react'
```
**Warning signs:** TypeScript compile error: `Cannot find name 'Calendar'`.

### Pitfall 5: TypeScript strict check on `filterType` optional

**What goes wrong:** Using `filter.filterType === 'date-range'` in a condition causes no TypeScript error but a stray `else` branch may be typed as `never` unnecessarily.
**Why it happens:** `filterType` is `'select' | 'date-range' | 'multi-select' | 'search' | 'toggle' | undefined`. TypeScript narrows correctly but some patterns require explicit `?? 'select'` coercion first.
**How to avoid:** Always normalize `const ft = filter.filterType ?? 'select'` at the top of `FilterControl`. After that, `ft` is the full enum string, and TypeScript exhaustive checking works cleanly.
**Warning signs:** `npx tsc --noEmit` errors on unused/unreachable branches.

---

## Code Examples

Verified from codebase inspection:

### Current imports in WireframeFilterBar.tsx (line 1-2)
```tsx
import { useState } from 'react'
import { Search } from 'lucide-react'
```
Add `Calendar, ChevronDown` to the lucide-react import.

### Current filter render loop (lines 102-123)
```tsx
{filters.map((filter) => (
  <div key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontSize: 11, color: 'var(--wf-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
      {filter.label}:
    </span>
    <select
      disabled
      style={{
        fontSize: 12, color: 'var(--wf-body)', border: 'none',
        background: 'transparent', cursor: 'default',
        fontFamily: 'Inter, sans-serif', fontWeight: 500, padding: '2px 4px',
      }}
    >
      <option>{filter.options?.[0] ?? 'Todos'}</option>
    </select>
  </div>
))}
```
This entire block gets replaced by `{filters.map((filter) => (<FilterControl key={filter.key} filter={filter} />))}`.

### Existing toggle pattern (lines 162-191) — reuse in ToggleFilter
The "Comparar" toggle button (lines 162-191) uses the exact CSS pattern needed for `ToggleFilter`. Extract it to a local function rather than duplicating code.

### Token reference for dropdowns
```
Background: var(--wf-card)
Border: var(--wf-card-border)          ← use this, NOT var(--wf-border) for consistency
Chip background: var(--wf-accent-muted)
Chip text: var(--wf-accent-fg)
Muted text: var(--wf-muted)
Body text: var(--wf-body)
```
Note: both `--wf-border` and `--wf-card-border` now resolve to the same value (Phase 17 alias). Prefer `--wf-card-border` for explicit consistency with the filter bar's existing `border: '1px solid var(--wf-card-border)'` line.

### FilterOption schema (already complete from Phase 17)
```typescript
// lib/blueprint-schema.ts line 50-55 — no changes needed
export const FilterOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  filterType: z.enum(['select', 'date-range', 'multi-select', 'search', 'toggle']).optional(),
})
```

### FilterOption TypeScript type (already complete from Phase 17)
```typescript
// components/WireframeFilterBar.tsx line 4-9 — no changes needed
export type FilterOption = {
  key: string
  label: string
  options?: string[]
  filterType?: 'select' | 'date-range' | 'multi-select' | 'search' | 'toggle'
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| All filters render as `<select>` | filterType dispatch to dedicated widgets | Phase 19 | Blueprint authors can configure rich filter patterns without custom code |
| Single global `showSearch` prop | Per-filter `filterType: 'search'` in addition to global | Phase 19 | More granular search scoping in filter bar |
| Toggle only for "Comparar" | Toggle available as a general-purpose filter type | Phase 19 | Boolean filter patterns (active/inactive, yes/no) now expressible |

**No deprecated patterns.** Phase 19 is purely additive — all existing `FilterOption` entries without `filterType` continue to render as `<select>` via the `?? 'select'` fallback.

---

## Open Questions

1. **Date range preset labels: Portuguese vs English?**
   - What we know: All other wireframe UI uses Portuguese ("Comparar", "Fev/2026", etc.)
   - What's unclear: Should presets be "Últimos 7 dias" or "Last 7 days"?
   - Recommendation: Portuguese, consistent with the rest of the wireframe chrome.

2. **Multi-select: how many chips visible before `+N more`?**
   - What we know: Filter bar is `flexWrap: 'wrap'` so width varies
   - What's unclear: 2 chips? 3?
   - Recommendation: Show first 2 chips, then `+N more`. Keeps the filter bar compact on typical screens.

3. **Should the date range dropdown close when clicking outside?**
   - What we know: Wireframe interactivity is deliberately minimal (all inputs are `disabled`)
   - What's unclear: Is an `onClickOutside` handler worth implementing?
   - Recommendation: Add a simple click-outside close using a `useEffect` that listens to `document.mousedown`. This is a ~5-line pattern and prevents visual confusion when the panel stays open while scrolling.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` |
| Full suite command | `npx vitest run` |

Current baseline: 251 tests passing across 12 test files.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FILT-02 | `FilterOptionSchema` accepts `filterType: 'date-range'` | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Already passing (Phase 17 test) |
| FILT-03 | `FilterOptionSchema` accepts `filterType: 'multi-select'` | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Already passing (Phase 17 test) |
| FILT-04 | `FilterOptionSchema` accepts `filterType: 'search'` | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Already passing (Phase 17 test) |
| FILT-05 | Presets render for date-range filter | manual-only | N/A — visual verification in browser | N/A |
| FILT-06 | `FilterOptionSchema` accepts `filterType: 'toggle'` | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | Already passing (Phase 17 test) |
| FILT-02–06 | Existing filters without filterType still render (backward compat) | manual-only | N/A — visual check that `<select>` renders for filterType-less options | N/A |

**Schema tests are already complete** from Phase 17. No new unit tests needed for Phase 19. The render dispatch is UI-only and is verified manually in the wireframe viewer.

New schema tests to add (Phase 19 describe block):
```typescript
describe('Phase 19 — FilterOption all filterType values covered', () => {
  const allTypes = ['select', 'date-range', 'multi-select', 'search', 'toggle'] as const
  for (const filterType of allTypes) {
    it(`accepts filterType: "${filterType}"`, () => {
      const result = FilterOptionSchema.safeParse({ key: 'f', label: 'F', filterType })
      expect(result.success).toBe(true)
    })
  }

  it('backward compat: accepts FilterOption with no filterType (undefined)', () => {
    const result = FilterOptionSchema.safeParse({ key: 'f', label: 'F' })
    expect(result.success).toBe(true)
  })
})
```

### Sampling Rate
- **Per task commit:** `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + `npx tsc --noEmit` before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all automated requirements. The only new test code is the `describe('Phase 19...')` block added to `blueprint-schema.test.ts`, which can be written as part of the implementation task.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `tools/wireframe-builder/components/WireframeFilterBar.tsx` — current render loop, existing toggle pattern, import list
- Direct inspection of `tools/wireframe-builder/types/blueprint.ts` — `FilterOption` type (already has `filterType` from Phase 17)
- Direct inspection of `tools/wireframe-builder/lib/blueprint-schema.ts` — `FilterOptionSchema` (already has `filterType` enum from Phase 17)
- Direct inspection of `tools/wireframe-builder/styles/wireframe-tokens.css` — `--wf-*` token catalog for dropdown styling
- Direct inspection of `tools/wireframe-builder/components/BlueprintRenderer.tsx` — how `WireframeFilterBar` is consumed (props passed, render context)
- Direct inspection of `tools/wireframe-builder/lib/blueprint-schema.test.ts` — existing Phase 17 filterType tests confirmed passing
- vitest run: 251 tests passing (confirmed baseline)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — "Zero new npm packages" architectural decision (confirmed: no date picker library)
- `.planning/REQUIREMENTS.md` — FILT-02 through FILT-06 descriptions (requirements are the implementation spec)
- Phase 17 RESEARCH.md — confirms `FilterOption` type source is in `WireframeFilterBar.tsx`, re-exported from `types/blueprint.ts`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, all findings from direct file inspection
- Architecture: HIGH — single-file change, patterns verified from existing codebase
- Pitfalls: HIGH — backward compat risk verified (filterType is optional, needs `?? 'select'` normalization), z-index and overflow risks verified from layout structure
- Code examples: HIGH — all code derived from existing patterns in WireframeFilterBar.tsx and wireframe-tokens.css

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable stack, no fast-moving dependencies)
