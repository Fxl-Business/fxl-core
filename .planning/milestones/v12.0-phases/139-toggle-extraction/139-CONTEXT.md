# Phase 139: Toggle Extraction - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract module toggle logic from ModulesPanel.tsx into a standalone TenantModulesSection component, wire it into TenantDetailPage so admins manage modules per-tenant there, and strip all toggle/tenant-selector UI from ModulesPanel leaving it as an empty scaffold for future overview features.

</domain>

<decisions>
## Implementation Decisions

### TenantModulesSection layout
- Compact list layout (not 2-column card grid) since TenantDetailPage already has many sections (members, metadata, connectors)
- Each row: module icon (from MODULE_REGISTRY), module label, status badge (Active/Beta/Coming Soon), and Switch toggle aligned right
- Rows inside a single rounded-xl bordered container with border-t dividers between rows (same pattern as members list in TenantDetailPage)
- Section header "Modulos" with active count badge (e.g., "5 de 6 ativos") matching existing section header style
- Loading state: 3 skeleton rows with animate-pulse
- Error state: red bordered box with message + "Tentar novamente" button

### TenantModulesSection component contract
- Props: `{ orgId: string }` — single prop, no optional callbacks
- Manages all Supabase state internally (useState, useEffect, useCallback)
- Fetches from `tenant_modules` table on mount and when orgId changes
- Optimistic toggle updates with upsert to `tenant_modules` (same pattern as current ModulesPanel)
- Toast notifications on toggle success/failure using sonner (same pattern as current ModulesPanel)
- File location: `src/platform/pages/admin/TenantModulesSection.tsx` (sibling to TenantDetailPage)

### ModulesPanel after toggle removal
- Remove tenant selector dropdown (Select component + orgs state)
- Remove ModuleCard component and all toggle-related logic
- Remove useActiveOrg import and Switch import
- Keep page header but update subtitle to "Visao geral dos modulos da plataforma"
- Show a centered placeholder: dashed border box with Blocks icon + "Visao geral dos modulos sera adicionada em breve"
- Keep STATUS_LABELS and STATUS_CLASSES constants (will be reused by Phase 141 ModuleOverviewCard)

### TenantDetailPage integration
- Replace the entire "Modulos" section (lines 577-596: heading + "Gerenciar modulos" link + placeholder card) with `<TenantModulesSection orgId={orgId!} />`
- Remove the ExternalLink and Blocks icon imports if they become unused after link removal
- No other changes to TenantDetailPage — members, metadata, connectors, archive sections remain untouched

### Claude's Discretion
- Exact Tailwind classes for row spacing and alignment
- Whether to show module description in the compact row or just label + badge + toggle
- Icon sizing within rows

</decisions>

<specifics>
## Specific Ideas

- Follow the exact member list visual pattern from TenantDetailPage (rounded-xl container, border-t dividers, group hover) for module rows
- Reuse the STATUS_LABELS / STATUS_CLASSES constants from ModulesPanel for badge rendering in TenantModulesSection
- The opt-out model (modules default to enabled=true when not in tenant_modules table) must be preserved exactly as-is

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements are fully captured in ROADMAP.md success criteria and decisions above.

### Roadmap
- `.planning/ROADMAP.md` -- Phase 139 success criteria (lines 46-55)
- `.planning/REQUIREMENTS.md` -- TOGL-01, TOGL-02, TOGL-03 definitions

### Existing code
- `src/platform/pages/admin/ModulesPanel.tsx` -- Source of toggle logic to extract
- `src/platform/pages/admin/TenantDetailPage.tsx` -- Target page for TenantModulesSection (lines 577-596 = current Modulos section to replace)
- `src/platform/module-loader/registry.ts` -- MODULE_REGISTRY, ModuleDefinition interface
- `src/platform/module-loader/module-ids.ts` -- MODULE_IDS, ModuleId type

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- ModulesPanel.tsx lines 20-38: STATUS_LABELS and STATUS_CLASSES constants for badge rendering — reuse directly
- ModulesPanel.tsx lines 147-190: fetchModuleStates() pattern with Supabase query + opt-out default logic — extract into TenantModulesSection
- ModulesPanel.tsx lines 199-236: handleToggle() with optimistic update + upsert + toast — extract into TenantModulesSection
- MODULE_REGISTRY from registry.ts — source of module metadata (icon, label, status, description)
- MODULE_IDS / ModuleId type from module-ids.ts — for iterating all known modules

### Established Patterns
- TenantDetailPage uses `const { orgId } = useParams<{ orgId: string }>()` — TenantModulesSection receives this as prop
- TenantDetailPage members list: rounded-xl container, border-t dividers, group class for hover reveal — same pattern for module rows
- Admin pages use sonner toast for success/error feedback
- Supabase direct access via `import { supabase } from '@platform/supabase'`

### Integration Points
- TenantDetailPage.tsx line 577-596: Replace "Modulos" section with `<TenantModulesSection orgId={orgId!} />`
- ModulesPanel.tsx: Strip to scaffold — remove lines 1-17 imports related to toggle, lines 40-131 (ModuleCard), lines 137-309 (component body) and replace with minimal scaffold
- No router changes needed — both pages already exist at their current routes

</code_context>

<deferred>
## Deferred Ideas

- Decide where STATUS_LABELS / STATUS_CLASSES constants live long-term (shared file vs inline per component) — noted in STATE.md pending todos for Phase 141
- Whether to show module description in the toggle row — can be revisited when card grid is built in Phase 141

</deferred>

---

*Phase: 139-toggle-extraction*
*Context gathered: 2026-03-21*
