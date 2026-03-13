# Phase 48 Research: Header Render Wiring

**Phase:** 48-header-render-wiring
**Researched:** 2026-03-13
**Confidence:** HIGH (all findings from direct codebase analysis)

---

## Current State

### HeaderConfig Type (tools/wireframe-builder/types/blueprint.ts, lines 407-416)

```typescript
export type HeaderConfig = {
  showLogo?: boolean              // defaults true — shows branding.logoUrl in header left
  showPeriodSelector?: boolean    // defaults true — shows period navigation in center
  showUserIndicator?: boolean     // defaults true — shows user name/role chip on right
  actions?: {
    manage?: boolean   // defaults true — shows Gerenciar button
    share?: boolean    // defaults true — shows Share button
    export?: boolean   // defaults false — shows Export button
  }
}
```

### HeaderConfigSchema (tools/wireframe-builder/lib/blueprint-schema.ts, lines 67-76)

```typescript
const HeaderConfigSchema = z.object({
  showLogo: z.boolean().optional(),
  showPeriodSelector: z.boolean().optional(),
  showUserIndicator: z.boolean().optional(),
  actions: z.object({
    manage: z.boolean().optional(),
    share: z.boolean().optional(),
    export: z.boolean().optional(),
  }).optional(),
}).passthrough()
```

### WireframeHeader Component (tools/wireframe-builder/components/WireframeHeader.tsx)

**Current Props:**
```typescript
type Props = {
  title: string
  logoUrl?: string
  brandLabel?: string
  showLogo?: boolean        // ONLY field from HeaderConfig that is wired today
}
```

**Current JSX structure (124 lines):**
- **Left column** (flex 0 0 auto, minWidth 160): Logo/brand/title rendering. Conditional on `showLogo !== false`.
- **Center column** (flex 1): Decorative search input with magnifying glass icon. NOT the period selector.
- **Right column** (flex-shrink 0): Bell icon (decorative), dark mode toggle (functional via `useWireframeTheme`), divider, user chip (static "Operador FXL" / "Analista" / "OF").

**Key observation:** The period selector was REMOVED from WireframeHeader in Phase 23 (v1.4). The center area now shows a decorative search input. The `showPeriodSelector` field in HeaderConfig has NEVER been wired to any render logic in the current WireframeHeader implementation.

### WireframeHeader Call Sites

1. **src/pages/clients/WireframeViewer.tsx** (line 957-961) -- PRIMARY
   ```tsx
   <WireframeHeader
     title={activeScreen.title}
     logoUrl={branding.logoUrl}
     showLogo={activeConfig?.header?.showLogo}
   />
   ```
   Has access to `activeConfig` which contains `activeConfig?.header` (full HeaderConfig).

2. **src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx** (line 776-779) -- LEGACY
   ```tsx
   <WireframeHeader
     title={activeScreen.title}
     logoUrl={branding.logoUrl}
   />
   ```
   Does NOT pass `showLogo` or any other header config fields. Has `activeConfig` available.

3. **src/pages/SharedWireframeView.tsx** (line 467-469)
   ```tsx
   <WireframeHeader
     title={activeScreen.title}
   />
   ```
   Minimal props -- shared view. Has `config` available (not `activeConfig`).

4. **src/pages/tools/ComponentGallery.tsx** (line 313-321) -- GALLERY PREVIEW
   ```tsx
   <WireframeHeader
     title={wireframeHeaderMock.title}
     brandLabel={wireframeHeaderMock.brandLabel}
   />
   ```
   Gallery preview wrapper. Not connected to any config.

---

## Gap Analysis

### Fields NOT wired (schema exists, render ignores them)

| Field | Schema Type | Default | What should render | Current status |
|-------|------------|---------|-------------------|----------------|
| `showPeriodSelector` | `boolean?` | true | A decorative period selector element | Not rendered at all -- period selector was removed in Phase 23 and replaced with search bar |
| `showUserIndicator` | `boolean?` | true | User name/role chip ("Operador FXL" / "Analista" / "OF") | Always visible (hardcoded in right column) |
| `actions.manage` | `boolean?` | true | "Gerenciar" action button | Not rendered at all |
| `actions.share` | `boolean?` | true | "Compartilhar" action button | Not rendered at all |
| `actions.export` | `boolean?` | false | "Exportar" action button | Not rendered at all |

### Field already wired

| Field | Status |
|-------|--------|
| `showLogo` | Wired -- conditionally renders logo/brand/title |

---

## Design Decisions for Phase 48

### D1: Period Selector Implementation

The period selector was removed from WireframeHeader in Phase 23 (replaced by search bar in center). The `showPeriodSelector` field should NOT re-add the interactive period navigator. Instead, it should render a **decorative period selector pill** somewhere in the header when `showPeriodSelector !== false`.

**Where to place it:** The center column currently has a search input. The period selector should be a small decorative pill placed between the search input and the right actions section (or as a compact element in the right actions area before the bell icon).

**Recommended approach:** Add a small period selector badge/pill in the right actions area (before the bell icon) showing "Jan / 26" or similar mock text. This is a decorative wireframe element. It does NOT need the full interactive period navigator (that was intentionally removed).

**Alternative:** Insert before the search in center. But the center column is flex:1 with search centered, and adding a period selector would disrupt the balanced layout.

**Best placement:** In the right column, as the first element before the bell icon. It reads as a header action/control, which matches where period selectors appear in real financial dashboards.

### D2: Action Buttons Implementation

The `actions.manage`, `actions.share`, and `actions.export` fields should render as compact icon+label buttons in the right column of the header, before the bell icon and user chip. They are decorative wireframe elements.

**Recommended icons (from lucide-react, already in project):**
- `manage` -> Settings icon, label "Gerenciar"
- `share` -> Share2 icon, label "Compartilhar"
- `export` -> Download icon, label "Exportar"

### D3: User Indicator Wiring

The user chip (lines 109-120 of WireframeHeader.tsx) should be conditionally rendered based on `showUserIndicator !== false`. When `showUserIndicator` is false, the user chip and its preceding divider are hidden.

### D4: Backward Compatibility

All new props default to showing their respective elements (i.e., `!== false` checks). When HeaderConfig is undefined or fields are undefined, all elements render as they do today. This ensures existing blueprints are visually unchanged.

### D5: Props Surface

New props to add to WireframeHeader:
```typescript
type Props = {
  title: string
  logoUrl?: string
  brandLabel?: string
  showLogo?: boolean
  showPeriodSelector?: boolean     // NEW -- defaults true
  showUserIndicator?: boolean      // NEW -- defaults true
  actions?: {                      // NEW -- defaults all true except export
    manage?: boolean
    share?: boolean
    export?: boolean
  }
}
```

---

## Files to Modify

| File | Change | Risk |
|------|--------|------|
| `tools/wireframe-builder/components/WireframeHeader.tsx` | Add props, add conditional renders for period selector, user indicator, and action buttons | LOW -- additive JSX changes |
| `src/pages/clients/WireframeViewer.tsx` | Pass additional header config props to WireframeHeader | LOW -- 3 new prop passes |
| `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` | Pass header config props (currently passes nothing) | LOW |
| `src/pages/SharedWireframeView.tsx` | Optionally pass config.header props | LOW |
| `src/pages/tools/ComponentGallery.tsx` | Update gallery mock and props list | LOW |
| `src/pages/tools/galleryMockData.ts` | Add showPeriodSelector to mock | LOW |
| `docs/ferramentas/blocos/wireframe-header.md` | Update spec with new props | LOW |

---

## Sources

- `tools/wireframe-builder/components/WireframeHeader.tsx` -- current implementation (124 lines)
- `tools/wireframe-builder/types/blueprint.ts` -- HeaderConfig type (lines 407-416)
- `tools/wireframe-builder/lib/blueprint-schema.ts` -- HeaderConfigSchema (lines 67-76)
- `src/pages/clients/WireframeViewer.tsx` -- WireframeHeader invocation (lines 957-961)
- `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` -- legacy viewer (line 776-779)
- `src/pages/SharedWireframeView.tsx` -- shared viewer (line 467-469)
- `src/pages/tools/ComponentGallery.tsx` -- gallery preview (line 313-321)
- `.planning/research/FEATURES.md` -- feature research confirming the gap
- `.planning/research/ARCHITECTURE.md` -- architecture research confirming the gap
- `.planning/milestones/v1.4-phases/23-sidebar-header-chrome/23-02-PLAN.md` -- Phase 23 plan that rebuilt WireframeHeader

---

*Research for Phase 48: Header Render Wiring*
*Researched: 2026-03-13*
