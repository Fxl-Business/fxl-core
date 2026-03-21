# Phase 141: Module Overview Cards - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Build read-only ModuleOverviewCard grid and transform ModulesPanel scaffold into a pure overview page. Cards display module name, description, status badge, main features list, extensions, and slot injections. No toggle controls exist on this page (removed by Phase 139). Requirements: CARD-01, CARD-02, CARD-03, CARD-04.

</domain>

<decisions>
## Implementation Decisions

### Card content and data source
- **D-01:** ModuleOverviewCard is built from scratch with its own props interface — never derived from ModuleCard. The props interface must have zero toggle-related fields to structurally prevent toggle survival.
- **D-02:** All card data derives from MODULE_REGISTRY via useMemo. No Supabase calls on this page. No loading states needed — immediate render.
- **D-03:** A new `features` field (string array) must be added to ModuleDefinition interface and populated in each manifest. This supplies CARD-02 data. Keep it to 3-5 bullet points per module describing main capabilities.
- **D-04:** STATUS_LABELS and STATUS_CLASSES constants are shared between TenantModulesSection (Phase 139) and ModuleOverviewCard. Extract them to a shared file at `src/platform/pages/admin/module-status-constants.ts` to avoid duplication (see STATE.md pending todo).

### Card layout and visual design
- **D-05:** Each card shows: icon (from registry, resolved at render time), module label, status badge (Active/Beta/Coming Soon), description, features list (bullet points), extensions section with slot injection info.
- **D-06:** Status badges use the existing STATUS_CLASSES color scheme: emerald for active, amber for beta, slate for coming-soon. Same visual language as the current ModuleCard.
- **D-07:** Features list rendered as a compact bullet list with small text. No icons per feature — plain text bullets to keep density manageable.
- **D-08:** Extensions section shows each extension ID, its description, and the slot IDs it injects into (using monospace font for slot IDs, matching the current ModuleCard pattern).

### Grid layout (CARD-04)
- **D-09:** Responsive grid: 1 column on mobile, 2 columns on tablet (md), 3 columns on desktop (lg). Use Tailwind's `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with gap-4.
- **D-10:** Page max-width increases from current max-w-4xl to max-w-6xl to accommodate the 3-column layout.

### ModulesPanel transformation
- **D-11:** After Phase 139 removes toggles/tenant selector, ModulesPanel becomes the overview scaffold. This phase replaces the ModuleCard component with ModuleOverviewCard and removes all toggle-related state (moduleStates, handleToggle, selectedOrgId, etc.).
- **D-12:** Page header subtitle changes from "Gerencie os modulos ativos por tenant." to "Visao geral dos modulos da plataforma." since it is now read-only.
- **D-13:** The active count badge ("X de Y ativos") is removed — no tenant context means no per-tenant active count.

### Card scroll target for Phase 142
- **D-14:** Each card wrapper div gets a `data-module-id={mod.id}` attribute and a React ref-compatible id (`module-card-{mod.id}`). This enables Phase 142's click-to-scroll from diagram without requiring any changes to Phase 141 code later.

### Claude's Discretion
- Card border radius, shadow depth, and spacing between sections
- Whether modules without extensions show "Nenhuma extensao" or hide the section entirely
- Exact typography sizes for features list vs extensions section
- Card hover state (subtle shadow lift or none)

</decisions>

<specifics>
## Specific Ideas

- Cards should be information-dense but scannable — admin glances at the grid and understands what each module does, its maturity status, and its integration points
- The features list is the main new value: current ModuleCard only shows name/description/extensions, but not WHAT the module actually does
- Extensions section should visually distinguish the extension ID (bold) from the slot it injects into (monospace, muted color) — same pattern the current code uses

</specifics>

<canonical_refs>
## Canonical References

### Module system
- `src/platform/module-loader/registry.ts` -- ModuleDefinition interface, MODULE_REGISTRY array, ModuleExtension type
- `src/platform/module-loader/module-ids.ts` -- MODULE_IDS enum, SLOT_IDS enum
- `src/modules/*/manifest.tsx` -- All 6 module manifests that will need `features` field added

### Current implementation to transform
- `src/platform/pages/admin/ModulesPanel.tsx` -- Current page with ModuleCard + toggle logic (Phase 139 removes toggles, Phase 141 replaces cards)

### Requirements
- `.planning/REQUIREMENTS.md` -- CARD-01 through CARD-04 definitions
- `.planning/ROADMAP.md` -- Phase 141 success criteria

### Prior decisions
- `.planning/STATE.md` -- Accumulated decisions: build from scratch, MODULE_REGISTRY sole source, shared constants location

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `STATUS_LABELS` / `STATUS_CLASSES` in ModulesPanel.tsx: Already exist with correct badge styling. Extract to shared file before creating new card component.
- Extension rendering pattern in current ModuleCard (lines 89-128): Shows extension ID, description, and slot IDs. Same pattern reused in ModuleOverviewCard with features section added above it.
- `MODULE_REGISTRY` array: Already typed as ModuleDefinition[], already imported in ModulesPanel. No new data fetching needed.

### Established Patterns
- Module manifests follow a consistent shape: id, label, description, icon, status, extensions. Adding `features: string[]` is a natural extension of this pattern.
- Admin pages use `mx-auto max-w-Xxl px-4 py-8` layout pattern with `space-y-6` for sections.
- Card components use `rounded-xl border bg-white p-5 dark:bg-card dark:border-slate-700` styling.

### Integration Points
- `data-module-id` attribute on cards will be consumed by Phase 142 (diagram click-to-scroll).
- Shared status constants will be consumed by TenantModulesSection (Phase 139) and ModuleOverviewCard (this phase).
- ModuleDefinition interface change (adding `features`) affects all 6 manifests — must update all in this phase.

</code_context>

<deferred>
## Deferred Ideas

- Usage statistics per module (STAT-01/STAT-02) -- future milestone
- Global module configuration (CONF-01/CONF-02) -- future milestone
- Click-to-scroll from diagram to card -- Phase 142

</deferred>

---

*Phase: 141-module-overview-cards*
*Context gathered: 2026-03-21*
