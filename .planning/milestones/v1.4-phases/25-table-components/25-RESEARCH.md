# Phase 25: Table Components — Research

**Researched:** 2026-03-11
**Domain:** Wireframe table visual restyle — header typography, row hover, total/highlight rows, dark footer, trend indicators
**Confidence:** HIGH

---

## Summary

Phase 25 is a **pure visual restyle** of four existing table components: `DataTable.tsx`, `ClickableTable.tsx`, `DrillDownTable.tsx`, and `ConfigTable.tsx`. No new component types are introduced. The token foundation from Phase 22 already provides `--wf-table-header-bg`, `--wf-table-header-fg`, `--wf-table-footer-bg`, `--wf-table-footer-fg`, and `--wf-accent` — all necessary CSS variables are confirmed present in `wireframe-tokens.css` and mapped in `tailwind.config.ts`.

The five requirements map cleanly to targeted class/markup changes: (1) header `<th>` typography upgrade — `text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg` replacing the current `text-[11px] font-medium uppercase tracking-wide`; (2) row hover states on interactive tables; (3) `total`/`highlight` row variants using primary-colored text with `font-extrabold uppercase`; (4) a new dark `<tfoot>` row for `DataTable` and `DrillDownTable` when footer data is provided; (5) a new trend indicator cell pattern using Lucide icons with `scale-110` hover.

The structural difference from Phase 24 (KPI cards) is that the **footer row (TBL-04) requires a TypeScript type addition** — neither `DataTableSection` nor `DrillDownTableSection` currently have a `footer` field. A `footer?: Record<string, string>` (keyed by column key) must be added to both types. The `TableRenderer.tsx` orchestrator also needs to pass `footer` through. All other changes are class-level edits.

The `ConfigTable.tsx` has its own independent header that also needs the `text-[10px] font-black uppercase tracking-widest` treatment, but it has no footer (it is a settings/config table, not an analytical table) and no trend indicators.

**Primary recommendation:** Update each of the four table components in sequence — header classes first (all four), then row hover states (ClickableTable + DrillDownTable), then total/highlight row variants (ClickableTable), then footer row (DataTable + DrillDownTable + type additions), then trend indicator cell pattern (any table via a shared inline pattern).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TBL-01 | Table headers use text-[10px] font-black uppercase tracking-widest slate-500 on slate-50/800 background | Current: `text-[11px] font-medium uppercase tracking-wide text-wf-table-header-fg`. Change to `text-[10px] font-black uppercase tracking-widest`. Background already uses `bg-wf-table-header` (= slate-100 light / slate-800 dark). ConfigTable uses `bg-wf-canvas` — must also change to `bg-wf-table-header`. |
| TBL-02 | Table rows have hover:bg-slate-100 dark:hover:bg-slate-800 transitions with cursor-pointer | ClickableTable already has `hover:bg-wf-accent-muted` — must change to `hover:bg-slate-100 dark:hover:bg-slate-800`. DrillDownTable `hover:bg-wf-canvas` — same change for expandable rows. DataTable has no hover — add `hover:bg-slate-100 dark:hover:bg-slate-800` to `<tr>`. ConfigTable has `hover:bg-wf-canvas/50` — upgrade. cursor-pointer only on interactive (clickable/drillable) rows. |
| TBL-03 | Highlight/total rows use primary-colored text with font-extrabold uppercase styling | ClickableTable `variant='total'` currently: `font-semibold text-wf-heading`. Must change to `text-wf-accent font-extrabold uppercase`. `variant='highlight'` currently: `bg-red-50/60`. Must change to primary text with `font-extrabold uppercase`. DrillDownTable `isTotal` row: same upgrade from `font-semibold` to `text-wf-accent font-extrabold uppercase`. |
| TBL-04 | Dark footer row (bg-slate-900 text-white) with font-black totals for analytical tables | No footer currently exists in DataTable or DrillDownTable. Must: (1) add `footer?: Record<string, string>` to `DataTableSection` and `DrillDownTableSection` in blueprint.ts, (2) add `<tfoot>` with `bg-wf-table-footer text-wf-table-footer-fg font-black` when footer prop is provided, (3) pass footer from TableRenderer to both components. Tokens `--wf-table-footer-bg` (#0f172a both themes) and `--wf-table-footer-fg` (#ffffff light / #f8fafc dark) confirmed present. |
| TBL-05 | Trend indicators in table cells use color-coded icons with scale-110 hover | No dedicated TrendCell component exists. Table cells today render `React.ReactNode` (ClickRow.data, DrilRow.data). A simple inline or small helper pattern using `TrendingUp`/`TrendingDown` from lucide-react with `transition-transform hover:scale-110` is the recommended approach. The `ReactNode` cell type means no schema change is needed — callers compose the trend icon as JSX in the row data. |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS 3 | 3.x (pinned) | Utility classes — `text-[10px] font-black tracking-widest`, hover variants, scale transforms | Project standard; all `wf-*` tokens registered in tailwind.config.ts |
| lucide-react | current | `TrendingUp`, `TrendingDown` icons for trend cells | Project standard; tree-shaken; already used in `StatCardRenderer.tsx` for trend icons |
| CSS custom properties (`--wf-*`) | CSS spec | Color tokens — `--wf-table-footer-bg`, `--wf-table-footer-fg`, `--wf-accent` | Phase 22 token foundation; all required tokens confirmed present |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cn` from `@/lib/utils` | internal | Conditional class merging for variant rows and interactive hover | All four table components already import `cn` |
| `React.ReactNode` | React 18 | Cell content type — allows JSX trend icons inline in row data | ClickRow and DrilRow already use `Record<string, React.ReactNode>` for cell data |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `hover:bg-slate-100 dark:hover:bg-slate-800` | `hover:bg-wf-accent-muted` (current) | Spec requires explicit slate-100/800 values which match the token values (`--wf-neutral-100` / `--wf-neutral-800`). Using `hover:bg-wf-table-header` would also work since it resolves to the same colors. Tailwind slate classes are more explicit and readable. |
| Inline `ReactNode` for trend icons | Dedicated `TrendCell` component | A dedicated component would add complexity without benefit — the existing `ReactNode` cell type already supports JSX. StatCardRenderer pattern (TrendingUp/TrendingDown inline) is the right model. |
| `font-extrabold uppercase` on total rows | Token-driven variant class | Spec explicitly states these classes; hardcoding is correct since it's a permanent visual treatment, not a theme-variable concern. |

**Installation:** No new npm packages required. All dependencies already in project.

---

## Architecture Patterns

### Files to Touch

```
tools/wireframe-builder/
├── components/
│   ├── DataTable.tsx              <- TBL-01 (header), TBL-02 (row hover), TBL-04 (footer + tfoot)
│   ├── ClickableTable.tsx         <- TBL-01 (header), TBL-02 (row hover + cursor-pointer), TBL-03 (total/highlight)
│   ├── DrillDownTable.tsx         <- TBL-01 (header), TBL-02 (row hover), TBL-03 (isTotal), TBL-04 (footer)
│   ├── ConfigTable.tsx            <- TBL-01 (header only — no hover/footer/trends on config table)
│   └── sections/
│       └── TableRenderer.tsx      <- pass footer prop through for DataTable + DrillDownTable
└── types/
    └── blueprint.ts               <- ADD: footer?: Record<string, string> to DataTableSection + DrillDownTableSection
```

**Why ConfigTable gets header only:** ConfigTable is a settings/management table, not an analytical data table. TBL-02 hover is for interactive tables. TBL-03 total/highlight rows are analytical. TBL-04 footer is analytical. TBL-05 trend indicators don't apply. Only TBL-01 (consistent header treatment) applies to all four tables.

**Why ConfigTable header background changes:** Current ConfigTable uses `bg-wf-canvas` for `<thead>`. All four tables must use `bg-wf-table-header` for consistency (TBL-01 says "on slate-50/800 background" — same as `--wf-table-header-bg`).

### Pattern 1: Header Typography Upgrade (TBL-01)

**What:** Change `<th>` classes from `text-[11px] font-medium uppercase tracking-wide` to `text-[10px] font-black uppercase tracking-widest`.
**When to use:** All four table `<thead>` `<th>` elements.

```tsx
// Before (DataTable, ClickableTable, DrillDownTable):
'px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-wf-table-header-fg'

// After (all four):
'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg'

// ConfigTable before — also uses different background:
// <tr className="bg-wf-canvas">
// <th className="px-4 py-2.5 text-left font-medium text-wf-muted whitespace-nowrap">

// ConfigTable after:
// <tr className="bg-wf-table-header">
// <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg whitespace-nowrap">
```

### Pattern 2: Row Hover States (TBL-02)

**What:** Replace current per-component hover patterns with unified `hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`.
**Cursor-pointer:** Only on rows that are interactive (have `onClick` handler or always clickable in ClickableTable/DrillDownTable with children).

```tsx
// ClickableTable — all rows (interactive):
// Before: 'hover:bg-wf-accent-muted' (when onRowClick present)
// After: 'hover:bg-slate-100 dark:hover:bg-slate-800'
// cursor-pointer regardless of onRowClick (ClickableTable always interactive)

// DrillDownTable Row — only when hasKids:
// Before: hasKids && 'cursor-pointer hover:bg-wf-canvas'
// After: hasKids && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'

// DataTable — static table, add subtle hover without cursor-pointer:
// Before: no hover
// After: 'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
```

### Pattern 3: Total/Highlight Row Variants (TBL-03)

**What:** Upgrade `total` and `highlight` row variants in `ClickableTable` and `isTotal` in `DrillDownTable` to use primary-colored text with `font-extrabold uppercase`.

```tsx
// ClickableTable row className:
// Before:
row.variant === 'total' && 'bg-wf-canvas font-semibold',
row.variant === 'highlight' && 'bg-red-50/60',

// After:
row.variant === 'total' && 'bg-wf-canvas',
row.variant === 'highlight' && 'bg-wf-accent-muted',

// ClickableTable td className:
// Before:
row.variant === 'total' && 'font-semibold text-wf-heading',

// After:
(row.variant === 'total' || row.variant === 'highlight') && 'text-wf-accent font-extrabold uppercase',

// DrillDownTable Row td className:
// Before:
row.isTotal ? 'font-semibold text-wf-heading' : 'text-wf-body',

// After:
row.isTotal ? 'text-wf-accent font-extrabold uppercase' : 'text-wf-body',
```

### Pattern 4: Dark Footer Row (TBL-04)

**What:** Add optional `<tfoot>` to `DataTable` and `DrillDownTable`. Requires type additions.

**Type additions in `blueprint.ts`:**
```typescript
export type DataTableSection = {
  type: 'data-table'
  title: string
  columns: ColumnConfig[]
  rowCount?: number
  footer?: Record<string, string>  // NEW — keyed by column.key, shows totals row
}

export type DrillDownTableSection = {
  type: 'drill-down-table'
  title: string
  subtitle?: string
  columns: ColumnConfig[]
  rows: DrilRow[]
  footer?: Record<string, string>  // NEW — keyed by column.key, shows totals row
  viewSwitcher?: {
    options: string[]
    default: string
    rowsByView: Record<string, DrilRow[]>
  }
}
```

**Footer markup in DataTable and DrillDownTable:**
```tsx
// Add footer prop to component Props type
type Props = {
  // ...existing...
  footer?: Record<string, string>
}

// Add <tfoot> after <tbody>:
{footer && (
  <tfoot>
    <tr className="bg-wf-table-footer">
      {columns.map((col) => (
        <td
          key={col.key}
          className={cn(
            'px-4 py-2.5 text-xs font-black text-wf-table-footer-fg',
            col.align === 'right' && 'text-right tabular-nums',
            col.align === 'center' && 'text-center',
          )}
        >
          {footer[col.key] ?? ''}
        </td>
      ))}
    </tr>
  </tfoot>
)}
```

**TableRenderer.tsx — pass footer through:**
```tsx
// DataTableRenderer: pass footer
function DataTableRenderer({ section, compareMode }: ...) {
  const columns = filterColumns(section.columns, compareMode)
  return <DataTable title={section.title} columns={columns} rowCount={section.rowCount} footer={section.footer} />
}

// DrillDownTableRenderer: pass footer
<DrillDownTable
  title={section.title}
  subtitle={section.subtitle}
  columns={columns}
  rows={rows}
  footer={section.footer}
/>
```

### Pattern 5: Trend Indicator Cells (TBL-05)

**What:** No new component needed. Trend icons are `React.ReactNode` values in row data. The pattern is: wrap a Lucide `TrendingUp`/`TrendingDown` icon in a span with `transition-transform hover:scale-110` and color styling.

**Why no new component:** `ClickRow.data` and `DrilRow.data` are both `Record<string, React.ReactNode>`. Callers already compose arbitrary JSX as cell content. The trend icon becomes a JSX value in the row data object.

```tsx
// Example usage in a blueprint (client wireframe data):
{
  id: 'row-1',
  data: {
    produto: 'Produto A',
    receita: 'R$ 120.000',
    variacao: (
      <span className="inline-flex items-center gap-1 text-emerald-600 transition-transform hover:scale-110">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>+8%</span>
      </span>
    ),
  }
}
```

**Note on TBL-05 scope:** The requirement says trend indicator CELLS use color-coded icons with `scale-110` hover. This is a rendering pattern, not a structural component change. The table components themselves don't need modification for TBL-05 — they already support `ReactNode` cells. The documentation and research should clarify this pattern for callers.

### Anti-Patterns to Avoid

- **Using `hover:bg-wf-accent-muted` instead of `hover:bg-slate-100`:** The spec explicitly calls for `hover:bg-slate-100 dark:hover:bg-slate-800`. These resolve to `--wf-neutral-100`/`--wf-neutral-800` which are the same as `--wf-table-header-bg` in light/dark — but Tailwind `slate-100` and `slate-800` are the explicit correct classes per requirements.
- **Adding `cursor-pointer` to DataTable rows:** DataTable is a static preview table (rows are placeholder dashes). Only ClickableTable (always) and DrillDownTable (when `hasKids`) get `cursor-pointer`.
- **Putting `uppercase` on all cell text in total rows:** `uppercase` applies to `<td>` cell text for total/highlight rows. It should NOT apply to `<th>` header text through a shared class — headers already have their own `uppercase` from TBL-01.
- **Forgetting to update ConfigTable's `<thead>` background:** ConfigTable currently uses `bg-wf-canvas` for its header row. It must change to `bg-wf-table-header` for visual consistency (TBL-01 applies to all four tables).
- **`footer` as array vs Record:** Using `footer?: string[]` indexed by column position is fragile if columns are reordered. Using `Record<string, string>` keyed by `col.key` is robust and consistent with the existing `row.data` pattern in ClickRow/DrilRow.
- **Nested `<tfoot>` inside `<tbody>`:** `<tfoot>` is a sibling of `<tbody>`, not nested inside it. Standard HTML table structure: `<thead>` → `<tbody>` → `<tfoot>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Trend icon hover animation | `onMouseEnter`/`onMouseLeave` state | Tailwind `transition-transform hover:scale-110` on the cell's span | CSS-only, zero JS, simpler, no re-renders |
| Footer background color | Inline `style={{ backgroundColor: '#0f172a' }}` | `bg-wf-table-footer` Tailwind class | Token-mapped in tailwind.config.ts; theme-aware (dark mode uses #0f172a for both themes — same token value, correct behavior) |
| Total row primary color | Hardcoded `style={{ color: '#1152d4' }}` | `text-wf-accent` Tailwind class | Theme-aware — uses `--wf-accent` which is `#1152d4` light / `#4d7ce8` dark |
| Row hover color | Hardcoded `style={{ backgroundColor: '#f1f5f9' }}` | `hover:bg-slate-100 dark:hover:bg-slate-800` | Standard Tailwind pattern; WireframeThemeProvider uses `data-wf-theme` not Tailwind `dark:` — see pitfall below |

**Key insight:** All CSS infrastructure for this phase is already in place from Phase 22. The tokens `--wf-table-footer-bg`, `--wf-table-footer-fg`, `--wf-table-header-bg`, `--wf-table-header-fg`, `--wf-accent` are all confirmed present in `wireframe-tokens.css` and registered in `tailwind.config.ts`. Phase 25 scope is purely class/markup changes plus two minor type field additions.

---

## Common Pitfalls

### Pitfall 1: Tailwind `dark:` variant vs `data-wf-theme` theme switching
**What goes wrong:** Using `dark:hover:bg-slate-800` assumes Tailwind's `dark:` variant works via the `dark` class on `<html>`. The wireframe uses `data-wf-theme="dark"` attribute, not the standard Tailwind dark mode class.
**Why it happens:** WireframeThemeProvider sets `data-wf-theme="light|dark"` on the container div. Tailwind's `dark:` variant requires either class strategy (`dark` on `<html>`) or media query strategy.
**How to avoid:** Check `tailwind.config.ts` `darkMode` setting. If it is `'class'`, the `dark:` variant activates when `class="dark"` is on an ancestor — which may not be set for wireframe sections. **Use `bg-wf-table-header` (already token-aware) instead of explicit `bg-slate-100 dark:bg-slate-800` for hover** if `dark:` doesn't work in the wireframe context. Alternatively, use inline style with the token: `style={{ '--hover-bg': 'var(--wf-table-header-bg)' }}` is complex — easier to just use `hover:bg-wf-table-header`.
**Verification:** Inspect the existing `hover:bg-wf-canvas` pattern already in the tables — if that works, `hover:bg-wf-table-header` will also work. Prefer token-based classes over Tailwind `dark:` in wireframe components.

**Revised recommendation:** For TBL-02, use `hover:bg-wf-table-header` (resolves to `--wf-neutral-100` light / `--wf-neutral-800` dark) instead of `hover:bg-slate-100 dark:hover:bg-slate-800`. This is token-aware and avoids the `dark:` variant problem. The spec says "slate-100/800" which is exactly what `--wf-table-header-bg` maps to.

### Pitfall 2: `font-black uppercase` on total row conflicts with `tabular-nums`
**What goes wrong:** Total row `<td>` cells that have `col.align === 'right'` also get `tabular-nums` (for number alignment). When combined with `uppercase`, numeric values like "R$ 1.200" look odd in uppercase.
**Why it happens:** The `uppercase` transform is applied to all cells in the total row regardless of content type.
**How to avoid:** Apply `uppercase` only to text columns (first column / label column), not to numeric/right-aligned cells. OR accept that uppercase on numbers is harmless (numbers don't have case). In practice, `uppercase` on numbers is invisible — the transformation is a non-issue.

### Pitfall 3: DataTable footer with placeholder data
**What goes wrong:** `DataTable` renders placeholder dashes (`—`) for all cells (it's a preview component with no real data). The footer receives `footer?: Record<string, string>` but if a client passes no footer, nothing renders. If they pass `footer={{ receita: 'R$ 0,00' }}` but column key is `receita_total`, nothing shows.
**Why it happens:** Footer is keyed by `col.key` — must match exactly. The DataTable is often used as a pure skeleton preview with no real data.
**How to avoid:** Footer is optional — `{footer && ...}`. No footer = no `<tfoot>`. Planner should note that `DataTable` footer is meaningful only when configured with real column keys.

### Pitfall 4: DrillDownTable footer conflicts with expanded rows
**What goes wrong:** `<tfoot>` renders below `<tbody>`. In DrillDownTable, expanding rows increases tbody height. The footer stays at the table bottom, which is correct. But if `isTotal` rows also exist at the bottom of `<tbody>`, there are two visual "total" rows.
**Why it happens:** `isTotal` rows in the body and `<tfoot>` serve the same semantic purpose. If both exist, there's duplication.
**How to avoid:** Client blueprints should use EITHER `isTotal: true` rows in tbody OR the `footer` prop, not both. Document this as a usage convention, not a code-level constraint.

### Pitfall 5: `ConfigTable` header alignment
**What goes wrong:** After changing ConfigTable's `<th>` to `text-[10px] font-black uppercase tracking-widest`, the `text-left` alignment that was explicit before may be lost.
**Why it happens:** Current ConfigTable `<th>` uses `text-left` as default alignment. The new class list must preserve alignment per column.
**How to avoid:** Keep `text-left` (or use alignment per `col.align` if ConfigTable gains that feature — it doesn't currently). For now, all ConfigTable headers are `text-left` — preserve that explicitly.

---

## Code Examples

Verified patterns from codebase inspection:

### DataTable.tsx — full restyle (TBL-01 + TBL-02 + TBL-04)

```tsx
// tools/wireframe-builder/components/DataTable.tsx
import { cn } from '@/lib/utils'

type Column = { key: string; label: string; align?: 'left' | 'right' | 'center' }

type Props = {
  title?: string
  columns: Column[]
  rowCount?: number
  footer?: Record<string, string>  // NEW for TBL-04
}

export default function DataTable({ title, columns, rowCount = 5, footer }: Props) {
  const rows = Array.from({ length: rowCount }, (_, i) => i)
  return (
    <div className="rounded-lg border border-wf-card-border bg-wf-card overflow-hidden">
      {title && (
        <div className="border-b border-wf-card-border px-4 py-3">
          <p className="text-sm font-semibold text-wf-heading">{title}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-wf-table-header">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    // TBL-01: text-[10px] font-black uppercase tracking-widest
                    'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    (!col.align || col.align === 'left') && 'text-left',
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row}
                // TBL-02: hover — use token class (avoids dark: variant issue)
                className="border-t border-wf-table-border hover:bg-wf-table-header transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-wf-body',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    —
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* TBL-04: dark footer row */}
          {footer && (
            <tfoot>
              <tr className="bg-wf-table-footer">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-2.5 text-xs font-black text-wf-table-footer-fg',
                      col.align === 'right' && 'text-right tabular-nums',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {footer[col.key] ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
```

### ClickableTable.tsx — TBL-01 + TBL-02 + TBL-03

```tsx
// Key changes only — not full file:

// Header <th> (TBL-01):
'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg whitespace-nowrap'

// Row <tr> className (TBL-02 + TBL-03):
cn(
  'border-t border-wf-card-border transition-colors cursor-pointer',
  // TBL-02: token-based hover
  'hover:bg-wf-table-header',
  // TBL-03: total row background
  row.variant === 'total' && 'bg-wf-canvas',
  // TBL-03: highlight row background
  row.variant === 'highlight' && 'bg-wf-accent-muted',
)

// Row <td> className (TBL-03: primary text for total/highlight):
cn(
  'px-4 py-2.5 text-xs text-wf-body',
  col.align === 'right' && 'text-right tabular-nums',
  col.align === 'center' && 'text-center',
  // TBL-03: primary text + extrabold + uppercase for total and highlight rows
  (row.variant === 'total' || row.variant === 'highlight') && 'text-wf-accent font-extrabold uppercase',
)
```

### DrillDownTable.tsx Row component — TBL-02 + TBL-03

```tsx
// Row <tr> className:
cn(
  'border-t border-wf-card-border transition-colors',
  // TBL-02: only expandable rows get cursor-pointer
  hasKids && 'cursor-pointer hover:bg-wf-table-header',
  // TBL-03: isTotal row
  row.isTotal && 'bg-wf-canvas',
  row.className,
)

// Row <td> className:
cn(
  'px-4 py-2.5 text-xs',
  // TBL-03: primary text for total rows
  row.isTotal ? 'text-wf-accent font-extrabold uppercase' : 'text-wf-body',
  col.align === 'right' && 'text-right',
  col.align === 'center' && 'text-center',
)
```

### ConfigTable.tsx — TBL-01 only (header upgrade)

```tsx
// <thead> <tr> — change background:
<tr className="bg-wf-table-header">

// <th> — upgrade typography:
<th
  key={col.key}
  className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-wf-table-header-fg whitespace-nowrap"
  style={col.width ? { width: col.width } : undefined}
>
```

### blueprint.ts — type additions for TBL-04

```typescript
export type DataTableSection = {
  type: 'data-table'
  title: string
  columns: ColumnConfig[]
  rowCount?: number
  footer?: Record<string, string>  // NEW — keyed by column.key; renders dark totals row
}

export type DrillDownTableSection = {
  type: 'drill-down-table'
  title: string
  subtitle?: string
  columns: ColumnConfig[]
  rows: DrilRow[]
  footer?: Record<string, string>  // NEW — keyed by column.key; renders dark totals row
  viewSwitcher?: {
    options: string[]
    default: string
    rowsByView: Record<string, DrilRow[]>
  }
}
```

### Trend Indicator Cell pattern (TBL-05)

```tsx
// Used inline in blueprint data (ClickRow.data or DrilRow.data value):
// No component file change required — ReactNode cells already supported.

import { TrendingUp, TrendingDown } from 'lucide-react'

// Positive trend cell value:
variacao: (
  <span className="inline-flex items-center gap-1 transition-transform hover:scale-110"
        style={{ color: 'var(--wf-positive)' }}>
    <TrendingUp className="h-3.5 w-3.5" />
    <span>+8%</span>
  </span>
),

// Negative trend cell value:
variacao: (
  <span className="inline-flex items-center gap-1 transition-transform hover:scale-110"
        style={{ color: 'var(--wf-negative)' }}>
    <TrendingDown className="h-3.5 w-3.5" />
    <span>-3%</span>
  </span>
),
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `text-[11px] font-medium tracking-wide` headers | `text-[10px] font-black tracking-widest` headers | Phase 25 | Tighter, bolder financial data table aesthetic matching modern SaaS |
| `hover:bg-wf-accent-muted` (blue tint on hover) | `hover:bg-wf-table-header` (neutral slate hover) | Phase 25 | Cleaner hover — blue hover was too attention-grabbing for data rows |
| `font-semibold text-wf-heading` total rows | `text-wf-accent font-extrabold uppercase` total rows | Phase 25 | Primary blue highlights totals — strong financial dashboard signal |
| No footer row | Dark `<tfoot>` with `bg-wf-table-footer` | Phase 25 | Premium analytical table treatment; aggregate totals visually distinct |
| No trend cell pattern | `ReactNode` inline with `hover:scale-110` icon | Phase 25 | Lightweight pattern without new component overhead |

**Deprecated/outdated:**
- `hover:bg-wf-accent-muted` on table rows: replaced with `hover:bg-wf-table-header` — accent-muted was designed for selected/active states, not row hover.
- `bg-red-50/60` for highlight rows: replaced with `bg-wf-accent-muted` — accent muted provides token-aware highlight background consistent with the primary color system.
- `bg-wf-canvas` as header background in ConfigTable: replaced with `bg-wf-table-header` for visual consistency across all four tables.

---

## Open Questions

1. **`dark:` Tailwind variant in wireframe context**
   - What we know: The spec says `dark:hover:bg-slate-800`. Wireframe uses `data-wf-theme` attribute, not `class="dark"`. Tailwind's `dark:` variant requires explicit dark mode configuration.
   - What's unclear: Whether `tailwind.config.ts` has `darkMode: 'class'` and whether the `dark` class is applied to any ancestor of the wireframe container.
   - Recommendation: Inspect `tailwind.config.ts darkMode` setting before implementing. If `dark:` variants don't apply, use `hover:bg-wf-table-header` (token-aware, resolves to the correct value in both themes). This is documented in Pattern 2 above.

2. **Trend cell ownership — table component vs caller**
   - What we know: TBL-05 says "trend indicator cells show color-coded icons that scale to scale-110 on hover." The existing `ReactNode` cell type supports this inline.
   - What's unclear: The planner may want to create a small `TrendCell` helper component for DRY usage across client blueprints.
   - Recommendation: Keep it inline/pattern-based for now. A helper component could be added later in the gallery/component library phase (Phase 28). For Phase 25, document the pattern.

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
| TBL-01 | Header `<th>` has `text-[10px] font-black uppercase tracking-widest` | manual-only | n/a — visual CSS class change | n/a |
| TBL-02 | Rows have hover state and cursor-pointer on interactive tables | manual-only | n/a — interactive CSS hover | n/a |
| TBL-03 | Total/highlight rows use `text-wf-accent font-extrabold uppercase` | manual-only | n/a — visual class change | n/a |
| TBL-04 | Dark `<tfoot>` renders when `footer` prop provided | manual-only | n/a — conditional render, visual | n/a |
| TBL-05 | Trend cell icons scale to `scale-110` on hover | manual-only | n/a — CSS hover transform | n/a |
| (TypeScript) | `footer?: Record<string, string>` added cleanly to both section types | automated | `npx tsc --noEmit` | ✅ (existing tsconfig) |

**Note:** Phase 25 is a pure visual restyle. All requirements are verified by visual inspection (`make dev` → open wireframe viewer → inspect table sections in light/dark modes). TypeScript compliance (`npx tsc --noEmit`) is the only automated gate — critical because `blueprint.ts` type changes must not break existing client wireframe blueprints.

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit` (zero errors required)
- **Per wave merge:** `npx vitest run` (no regressions in existing tests)
- **Phase gate:** Visual inspection of all four table types in wireframe viewer (light + dark mode) + `npx tsc --noEmit` green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure is sufficient. Phase 25 has no logic changes requiring unit tests. TypeScript compliance is the automated gate.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `tools/wireframe-builder/components/DataTable.tsx` — current header classes, tbody structure, no footer
- Direct code inspection: `tools/wireframe-builder/components/ClickableTable.tsx` — current hover pattern (`hover:bg-wf-accent-muted`), variant row classes, `onRowClick` handler
- Direct code inspection: `tools/wireframe-builder/components/DrillDownTable.tsx` — `isTotal` pattern, `hasKids` hover, expand/collapse mechanics
- Direct code inspection: `tools/wireframe-builder/components/ConfigTable.tsx` — `bg-wf-canvas` header (needs change), no hover upgrade needed
- Direct code inspection: `tools/wireframe-builder/components/sections/TableRenderer.tsx` — prop passthrough chain, all three table renderer functions
- Direct code inspection: `tools/wireframe-builder/components/sections/StatCardRenderer.tsx` — `TrendingUp`/`TrendingDown` icon pattern with color tokens (model for TBL-05)
- Direct code inspection: `tools/wireframe-builder/types/blueprint.ts` — `DataTableSection`, `DrillDownTableSection`, `ClickRow`, `DrilRow` types (full)
- Direct code inspection: `tools/wireframe-builder/styles/wireframe-tokens.css` — confirmed `--wf-table-footer-bg: #0f172a`, `--wf-table-footer-fg: #ffffff/#f8fafc`, `--wf-table-header-bg: --wf-neutral-100/800`, all present in both light and dark theme blocks
- Direct code inspection: `tailwind.config.ts` — confirmed `wf.table-footer.DEFAULT`, `wf.table-footer.fg`, `wf.table-header.DEFAULT`, `wf.table-header.fg` all registered as Tailwind color aliases
- `.planning/REQUIREMENTS.md` — source of truth for TBL-01 through TBL-05
- `.planning/STATE.md` — v1.4 architectural decisions: token-first approach, no dark mode fine-tuning beyond token parity

### Secondary (MEDIUM confidence)
- Phase 22 RESEARCH.md — confirmed `color-mix()` and token reference patterns across wireframe components
- Phase 24 RESEARCH.md — reference implementation pattern for similar pure-visual-restyle phase structure

### Tertiary (LOW confidence)
- None — all findings derived from direct code inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries and tokens already in project, confirmed by direct inspection
- Architecture: HIGH — exact file targets identified, all type changes specified, all prop chains traced
- Token values: HIGH — wireframe-tokens.css inspected, all required tokens confirmed present in both themes
- Component patterns: HIGH — actual class and style patterns read from source, change deltas computed
- Pitfalls: HIGH — derived from codebase patterns (dark: variant issue documented from WireframeThemeProvider pattern)

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable Tailwind/component system, no fast-moving dependencies)
