# Phase 17: Schema Foundation & Layout Restructure - Research

**Researched:** 2026-03-10
**Domain:** TypeScript types, Zod schemas, wireframe layout CSS, CSS custom property tokens
**Confidence:** HIGH (all findings verified from direct codebase inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-01 | Wireframe component palette usa grays mais suaves (preto menos bruto) | CSS token audit reveals `--wf-border` is undefined; newer section renderers fall back to browser default (black). Core components already use `--wf-*` tokens correctly. Fix: add `--wf-border` alias for `--wf-card-border` in wireframe-tokens.css |
| LAYOUT-01 | Header renderiza acima da sidebar (full-width, highest z-order) | WireframeViewer.tsx currently places `<aside>` (fixed, `top:0`) and `<main>` (with header inside) side by side. Restructure: make outer container `flex-col`, move `<WireframeHeader>` above the `<aside>/<main>` row |
| LAYOUT-02 | "Gerenciar" move da sidebar para header como action button | The "Gerenciar" button is hardcoded in the sidebar footer (WireframeViewer.tsx ~line 738-764). Must be removed from sidebar and rendered in WireframeHeader as an action prop |
| SIDE-01 | SidebarConfig adicionado ao BlueprintConfig schema (dashboard-level) | `BlueprintConfig` in `types/blueprint.ts` only has `slug`, `label`, `schemaVersion`, `screens`. Add optional `sidebar?: SidebarConfig`. Mirror in `BlueprintConfigSchema` in `lib/blueprint-schema.ts` |
| HEAD-01 | HeaderConfig adicionado ao BlueprintConfig schema (dashboard-level) | Same as SIDE-01: add optional `header?: HeaderConfig` to `BlueprintConfig` + Zod schema |
| FILT-01 | FilterOption type extendido com filterType discriminator | `FilterOption` in `WireframeFilterBar.tsx` is `{ key, label, options? }`. Must add `filterType?: 'select' \| 'date-range' \| 'multi-select' \| 'search' \| 'toggle'` defaulting to `'select'` for backward compat. Mirror in `FilterOptionSchema` in `blueprint-schema.ts` |
</phase_requirements>

---

## Summary

Phase 17 is a foundation phase — it makes schema, type system, and layout hierarchy correct so Phases 18–21 can build on solid ground. All changes are in three areas: (1) CSS token fixes, (2) TypeScript/Zod schema additions, and (3) layout restructure in WireframeViewer.

The codebase already has an excellent `--wf-*` token system defined in `wireframe-tokens.css`. The "harsh blacks" problem is caused by a naming mismatch: six newer section renderers (added in v1.1) use `var(--wf-border)` which is never defined in the token file — the correct token is `var(--wf-card-border)`. The fix is one alias line in the CSS file, plus confirming the Tailwind wf token map.

The layout hierarchy issue is structural: `WireframeViewer.tsx` wraps everything in a `flex-row` div where the sidebar is `position:fixed` and the header lives inside `<main>`. The correct structure is a `flex-col` outer wrapper where the header spans full width at the top, and a `flex-row` inner wrapper contains sidebar + content area.

Schema changes are additive and backward-compatible. `SidebarConfig` and `HeaderConfig` are optional fields on `BlueprintConfig`. `FilterOption.filterType` defaults to `'select'`. Existing blueprints in Supabase require no migration.

**Primary recommendation:** Work in three independent tasks — (1) fix CSS token, (2) restructure layout in WireframeViewer.tsx + move Gerenciar, (3) extend TypeScript types + Zod schemas. Each task is safe to execute in sequence within one plan.

---

## Standard Stack

### Core (already installed, no new packages)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 5.x strict | Type definitions for SidebarConfig, HeaderConfig | Project-wide constraint |
| Zod | 3.x | Runtime validation of schema additions | Already used in blueprint-schema.ts |
| Tailwind CSS | 3.x | Utility classes for layout restructure | Project stack |
| CSS custom properties | N/A | `--wf-*` token system, wireframe-tokens.css | Established pattern |

**Installation:** No new packages needed. Zero new npm dependencies confirmed (STATE.md decision).

---

## Architecture Patterns

### Recommended Project Structure (no changes)

The existing structure is correct. Changes are edits to existing files only:

```
tools/wireframe-builder/
├── types/blueprint.ts          ← Add SidebarConfig, HeaderConfig, extend FilterOption
├── lib/blueprint-schema.ts     ← Mirror type additions in Zod schemas
├── styles/wireframe-tokens.css ← Add --wf-border alias
└── components/
    └── WireframeHeader.tsx     ← Add optional onGerenciar prop + render button

src/pages/clients/
└── WireframeViewer.tsx         ← Restructure layout (flex-col outer, move header above row)
```

### Pattern 1: Token Alias (VIS-01)

**What:** Add `--wf-border` as an alias for `--wf-card-border` in both light and dark mode blocks.
**When to use:** Whenever a new CSS variable name is used in components but not yet defined in the token file.
**Example:**

```css
/* In [data-wf-theme="light"] and [data-wf-theme="dark"] blocks */
--wf-border: var(--wf-card-border);
```

Components currently broken by missing `--wf-border`:
- `StatCardRenderer.tsx` — card border
- `SettingsPageRenderer.tsx` — card border + row dividers
- `FormSectionRenderer.tsx` — card border + input borders
- `ProgressBarRenderer.tsx` — card border + track background
- `FilterConfigRenderer.tsx` — row borders + input borders
- `DividerRenderer.tsx` — divider line color

Also add `wf.border` to the Tailwind `wf` color map in `tailwind.config.ts`:
```ts
wf: {
  // ... existing tokens ...
  border: 'var(--wf-border)',
}
```

### Pattern 2: Full-Width Header Layout (LAYOUT-01, LAYOUT-02)

**What:** Restructure WireframeViewer outer container from `flex-row` to `flex-col`, move `<WireframeHeader>` above the sidebar+content row.
**When to use:** Any time a header must span the full width including the sidebar area.

**Current layout (wrong):**
```
[sidebar (fixed)] [main: AdminToolbar / WireframeHeader / content]
```

**Target layout (correct):**
```
[WireframeHeader full-width (fixed, z>sidebar)]
[sidebar (fixed below header) | content area (margin-left, margin-top)]
```

The key constraint: the sidebar is currently `position: fixed; top: 0`. After restructure it must be `position: fixed; top: 56px` (header height). The content `<main>` must have `marginTop: 56px` in addition to `marginLeft: 240px`.

WireframeHeader height is `56px` — already defined in the component (`height: 56`). Use this as a shared constant.

**Example outer structure:**
```tsx
<WireframeThemeProvider>
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
    {/* Header — full-width, fixed, z above sidebar */}
    <WireframeHeader
      title={activeScreen.title}
      periodType={activeScreen.periodType}
      onGerenciar={handleOpenManager}   // new prop
    />
    {/* Body row: sidebar + content */}
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <aside style={{
        width: 240, minWidth: 240,
        position: 'fixed', left: 0, top: 56,  // 56 = header height
        height: 'calc(100vh - 56px)',
        /* ... */
      }}>
        {/* sidebar content WITHOUT Gerenciar button */}
      </aside>
      <main style={{
        flex: 1,
        marginLeft: 240,
        overflowY: 'auto',
        padding: '12px 32px 32px',
      }}>
        <BlueprintRenderer ... />
      </main>
    </div>
  </div>
</WireframeThemeProvider>
```

The `AdminToolbar` (edit mode toolbar) currently lives at the top of `<main>`. After restructure, it should remain in the content flow but below the header. It does not need to be full-width.

### Pattern 3: Additive Schema Extension (SIDE-01, HEAD-01, FILT-01)

**What:** Add optional fields to existing TypeScript types + mirror in Zod schemas. Never remove or rename existing fields.
**When to use:** Every schema extension in this codebase.

**FilterOption extension (backward compatible):**
```typescript
// types/blueprint.ts - used by WireframeFilterBar.tsx
export type FilterOption = {
  key: string
  label: string
  options?: string[]
  filterType?: 'select' | 'date-range' | 'multi-select' | 'search' | 'toggle'
}
```

```typescript
// lib/blueprint-schema.ts
const FilterOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
  filterType: z.enum(['select', 'date-range', 'multi-select', 'search', 'toggle']).optional(),
})
```

**SidebarConfig (new type, Phase 18 will use it):**
```typescript
// types/blueprint.ts
export type SidebarConfig = {
  footer?: string  // version/environment text
  // Phase 18 adds groups, icons, etc.
}

export type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number
  sidebar?: SidebarConfig    // NEW — optional
  header?: HeaderConfig      // NEW — optional
  screens: BlueprintScreen[]
}
```

**HeaderConfig (new type):**
```typescript
export type HeaderConfig = {
  // Phase 18 fills in: logo, period selector, user indicator, actions
  // Phase 17 just establishes the slot on BlueprintConfig
}
```

Define minimal types now — Phase 18 evolves them. The key constraint from STATE.md: these configs live at dashboard level (on `BlueprintConfig`), NOT on individual `BlueprintScreen`.

### Anti-Patterns to Avoid

- **Adding `--wf-border` to component inline styles instead of the token file:** Wrong direction — always fix the token file, never work around missing tokens in component code.
- **Moving header inside sidebar:** The header must be outside the `<aside>` element entirely.
- **Adding `filterType` as required field:** This breaks all existing `FilterOption` usages in blueprints stored in Supabase. Must be optional.
- **Defining `SidebarConfig` with full Phase 18 fields:** Phase 17 establishes the slot. Phase 18 populates it. Keep Phase 17 minimal.
- **Removing the `AdminToolbar` from WireframeViewer:** It stays in the layout — only "Gerenciar" moves from sidebar footer to WireframeHeader.
- **Using `schemaVersion` bump for these changes:** All changes are additive (optional fields). No migration needed. Do NOT bump schemaVersion.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS token cascade | Custom JS token resolution | CSS custom property inheritance | `[data-wf-theme]` scoping already handles light/dark |
| Backward compat for FilterOption | Runtime migration code | Optional field with `?` in TypeScript + Zod | Zero stored data changes needed |
| Header z-index management | Custom JS stacking logic | CSS `z-index` on the header element | Header is `position: sticky` or `fixed` with higher z than sidebar |

---

## Common Pitfalls

### Pitfall 1: `--wf-border` vs `--wf-card-border` confusion
**What goes wrong:** Newer section renderers (v1.1) use `var(--wf-border)` but the token file defines `var(--wf-card-border)`. Browser falls back to `transparent` or initial (no border), making sections look borderless.
**Why it happens:** The v1.1 section renderers were written with a simplified token name; the CSS file was not updated.
**How to avoid:** Add `--wf-border: var(--wf-card-border)` alias in both light and dark blocks.
**Warning signs:** Card/section borders are invisible in the wireframe viewer.

### Pitfall 2: Sidebar position after header restructure
**What goes wrong:** Sidebar remains `top: 0` after header goes full-width, causing sidebar to overlap or go behind the header.
**Why it happens:** The sidebar is `position: fixed` — it needs `top: 56px` (header height) once header is above it.
**How to avoid:** Update sidebar `top` from `0` to `56` (matching header height constant). Also update sidebar `height` to `calc(100vh - 56px)`.
**Warning signs:** Sidebar items are obscured by header on scroll or at page load.

### Pitfall 3: AdminToolbar position regression
**What goes wrong:** AdminToolbar (edit mode bar) disappears or overlaps header after layout restructure.
**Why it happens:** AdminToolbar currently lives inside `<main>` at the top. After restructure, `<main>` has no top offset — AdminToolbar renders correctly under the fixed header only if `<main>` has `marginTop` or the header is not fixed.
**How to avoid:** The header in the target design can be `position: sticky; top: 0` on the outer flex container, which naturally pushes content below it. If using `position: fixed`, add `marginTop: 56` to the content row. AdminToolbar stays inside `<main>` flow.
**Warning signs:** Edit toolbar overlaps the header or disappears.

### Pitfall 4: FilterOption type used in two places
**What goes wrong:** `FilterOption` type is defined in `WireframeFilterBar.tsx` AND re-exported through `types/blueprint.ts`. Changing only one causes type mismatch.
**Why it happens:** The source type lives in the component file; blueprint.ts re-exports it via import.
**How to avoid:** Change `FilterOption` in `WireframeFilterBar.tsx` (the source). The re-export in `types/blueprint.ts` picks it up automatically since it uses `export type { FilterOption }` via import.
**Warning signs:** TypeScript errors on `FilterOption` usage after change.

### Pitfall 5: Zod `FilterOptionSchema` not updated
**What goes wrong:** TypeScript type accepts `filterType` but Zod schema strips it on parse, causing stored blueprints to lose the field on load.
**Why it happens:** `blueprint-schema.ts` has its own `FilterOptionSchema` independent of the TypeScript type.
**How to avoid:** Always update both the TypeScript type AND the corresponding Zod schema in the same commit.
**Warning signs:** `filterType` present in config object before save, missing after load from Supabase.

### Pitfall 6: Zod `ValidatedBlueprintConfig` type drift
**What goes wrong:** `ValidatedBlueprintConfig` (inferred from Zod) diverges from the hand-written `BlueprintConfig` TypeScript type.
**Why it happens:** Adding fields to Zod schema updates `ValidatedBlueprintConfig` automatically, but `BlueprintConfig` in `types/blueprint.ts` requires a manual update.
**How to avoid:** Update both in sync. The TypeScript type in `blueprint.ts` is the source of truth for components; Zod is for runtime validation. They must stay equivalent.

---

## Code Examples

Verified from codebase inspection:

### Current `FilterOption` type (WireframeFilterBar.tsx line 4-8)
```typescript
export type FilterOption = {
  key: string
  label: string
  options?: string[]
}
```

### Current `FilterOptionSchema` (blueprint-schema.ts lines 50-54)
```typescript
const FilterOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  options: z.array(z.string()).optional(),
})
```

### Current `BlueprintConfig` type (types/blueprint.ts lines 292-297)
```typescript
export type BlueprintConfig = {
  slug: string
  label: string
  schemaVersion?: number
  screens: BlueprintScreen[]
}
```

### Current `BlueprintConfigSchema` (blueprint-schema.ts lines 394-399)
```typescript
export const BlueprintConfigSchema = z.object({
  slug: z.string(),
  label: z.string(),
  schemaVersion: z.number().default(1),
  screens: z.array(BlueprintScreenSchema),
})
```

### Current wireframe-tokens.css (missing --wf-border)
```css
[data-wf-theme="light"] {
  /* ... all tokens defined ... */
  --wf-card-border: var(--wf-neutral-200);  /* ← defined */
  /* --wf-border is NOT defined → browser default (transparent/none) */
}
```

### Sidebar in WireframeViewer.tsx (lines 683-765)
The sidebar is `position: fixed; left: 0; top: 0; height: 100vh`. The "Gerenciar" button is at lines 738-764 inside the sidebar footer div.

### WireframeHeader current signature (WireframeHeader.tsx)
```typescript
type Props = {
  title: string
  periodType?: PeriodType
}
```
Add `onGerenciar?: () => void` prop to move the button there.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-client blueprint.config.ts | DB-only storage with Zod validation | v1.1 | Schema changes no longer need file edits per client |
| Switch statements for section types | Section registry single source of truth | v1.1 | Adding new section types = 1-file change |
| App-level CSS variables | `--wf-*` tokens scoped to `[data-wf-theme]` | v1.1 | Wireframe styles fully isolated from app theme |
| Sidebar beside header (current) | Header full-width above sidebar (target) | Phase 17 | Matches standard SaaS dashboard chrome |

**Token naming inconsistency:** Some components added in v1.1 use `--wf-border` (shorthand) while the token file defines `--wf-card-border`. Phase 17 resolves this by adding the alias. Future token additions should go in `wireframe-tokens.css` first.

---

## Open Questions

1. **Header: sticky vs fixed positioning**
   - What we know: current sidebar is `position: fixed`. Current header is `position: sticky; top: 0` within main.
   - What's unclear: should the new full-width header be `sticky` on the outer flex container or `fixed`?
   - Recommendation: Use `position: sticky; top: 0` on the outer `flex-col` container's first child. This avoids needing `marginTop` offsets and plays well with the flex layout. If sticky causes issues in the `flex-col` container, fall back to fixed with `height: 56px` spacer div.

2. **`SidebarConfig` minimal shape for Phase 17**
   - What we know: Phase 18 will fill in `groups`, `icons`, `footer`. Phase 17 just needs to establish the slot.
   - What's unclear: should Phase 17 define an empty type or include `footer?: string`?
   - Recommendation: Define `SidebarConfig = { footer?: string }` and `HeaderConfig = Record<string, never>` (empty object for now). This is enough for Phase 18 to extend without breaking changes.

3. **AdminToolbar position after restructure**
   - What we know: AdminToolbar currently renders at the top of `<main>` (inside the content area, before WireframeHeader).
   - What's unclear: After header goes full-width and is outside `<main>`, where does AdminToolbar render?
   - Recommendation: AdminToolbar stays inside `<main>` (content area), renders at the top of the scrollable area. It does not need to go in the header. It is a developer/operator tool, not part of the wireframe chrome that clients see.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` |
| Full suite command | `npx vitest run` |

Current status: 237 tests passing across 12 test files. All in `tools/**/*.test.ts`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIDE-01 | `BlueprintConfigSchema` accepts optional `sidebar` field | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ (extend existing) |
| HEAD-01 | `BlueprintConfigSchema` accepts optional `header` field | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ (extend existing) |
| FILT-01 | `FilterOptionSchema` accepts optional `filterType` field | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ (extend existing) |
| FILT-01 | Existing FilterOption without `filterType` still parses (backward compat) | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts` | ✅ (extend existing) |
| VIS-01 | `--wf-border` resolves to same value as `--wf-card-border` | manual-only | N/A — visual verification in browser | N/A |
| LAYOUT-01 | Header renders above sidebar in DOM order | manual-only | N/A — layout is visual | N/A |
| LAYOUT-02 | "Gerenciar" button absent from sidebar, present in header | manual-only | N/A — UI interaction | N/A |

**Existing test file to extend:** `tools/wireframe-builder/lib/blueprint-schema.test.ts`

Add test cases:
1. `BlueprintConfigSchema` accepts config with optional `sidebar: {}` and `header: {}`
2. `BlueprintConfigSchema` accepts config without `sidebar` and `header` (backward compat)
3. `FilterOptionSchema` accepts `filterType: 'select'`, `filterType: 'date-range'`, `filterType: undefined`
4. Existing `validConfig` fixture still passes (regression guard)

### Sampling Rate
- **Per task commit:** `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + `npx tsc --noEmit` before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all automated requirements. No new test files needed; extend `blueprint-schema.test.ts` with new test cases as part of the schema task.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `tools/wireframe-builder/types/blueprint.ts` — full type definitions
- Direct inspection of `tools/wireframe-builder/lib/blueprint-schema.ts` — Zod schemas
- Direct inspection of `tools/wireframe-builder/styles/wireframe-tokens.css` — CSS token definitions
- Direct inspection of `src/pages/clients/WireframeViewer.tsx` — layout structure, sidebar, header usage
- Direct inspection of `tools/wireframe-builder/components/WireframeHeader.tsx` — header component API
- Direct inspection of all 6 section renderers using `--wf-border` — confirmed bug
- vitest run: 237 tests passing (confirmed baseline)

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — v1.3 architectural decisions (SidebarConfig dashboard-level, zero new packages)
- `.planning/ROADMAP.md` — phase dependencies (18/19/20 depend on 17)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages, all existing
- Architecture: HIGH — verified by reading every relevant file
- Pitfalls: HIGH — `--wf-border` bug is directly observable; layout issue is directly observable in WireframeViewer.tsx structure
- Schema patterns: HIGH — Zod + TypeScript patterns verified from existing test suite

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable codebase, no fast-moving dependencies)
